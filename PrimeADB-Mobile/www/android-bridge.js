/**
 * PrimeADB Android Bridge
 * ─────────────────────────────────────────────────────────────────────────────
 * This shim replaces window.primeADB (the Electron contextBridge API) with
 * Android-safe stubs. All calls return sensible no-ADB responses instead of
 * throwing runtime errors, preventing white screens and crashes.
 *
 * On Android, ADB commands must run on a CONNECTED DESKTOP — this app runs on
 * the phone itself, so ADB features show informative "connect via desktop"
 * messages rather than crashing.
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function() {
  'use strict';

  // ── Detect environment ───────────────────────────────────────────────────
  const IS_ANDROID = /Android/i.test(navigator.userAgent);
  const IS_ELECTRON = typeof window !== 'undefined' && !!window.primeADB;

  if (IS_ELECTRON) {
    // Running in real Electron — don't override
    console.log('[Bridge] Electron environment detected, using real IPC.');
    return;
  }

  console.log('[Bridge] Android WebView detected, installing safe shims.');

  // ── localStorage-backed settings (replaces Electron IPC settings) ────────
  const SETTINGS_KEY = 'primeadb_settings';

  const defaultSettings = {
    adbPath: 'adb',
    fastbootPath: 'fastboot',
    deviceRefreshInterval: 5000,
    logLevel: 'info',
    autoReconnectWireless: true,
    theme: 'dark',
  };

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? { ...defaultSettings, ...JSON.parse(raw) } : { ...defaultSettings };
    } catch { return { ...defaultSettings }; }
  }

  function saveSettings(obj) {
    try {
      const current = loadSettings();
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...obj }));
    } catch(e) { console.warn('[Bridge] Could not save settings:', e); }
  }

  // ── Standard "no ADB on Android" response ─────────────────────────────────
  const NO_ADB = {
    success: false,
    error: 'ADB is a desktop tool. To use PrimeADB, run the desktop app on your PC/Mac and connect your device via USB or Wi-Fi.',
    devices: [],
  };

  // ── window.primeADB shim ──────────────────────────────────────────────────
  window.primeADB = {

    // ── ADB API stubs ──────────────────────────────────────────────────────
    adb: {
      getDevices:       async () => ({ ...NO_ADB }),
      getDeviceInfo:    async () => ({ ...NO_ADB }),
      shell:            async () => ({ ...NO_ADB, output: '' }),
      screenshot:       async () => ({ ...NO_ADB }),
      screenRecord:     async () => ({ ...NO_ADB }),
      reboot:           async () => ({ ...NO_ADB }),
      installApk:       async () => ({ ...NO_ADB }),
      uninstallApk:     async () => ({ ...NO_ADB }),
      getPackages:      async () => ({ ...NO_ADB, packages: [] }),
      runCommand:       async () => ({ ...NO_ADB, output: '' }),
      push:             async () => ({ ...NO_ADB }),
      pull:             async () => ({ ...NO_ADB }),
    },

    // ── Fastboot API stubs ─────────────────────────────────────────────────
    fastboot: {
      getDevices:       async () => ({ ...NO_ADB }),
      runCommand:       async () => ({ ...NO_ADB, output: '' }),
      flash:            async () => ({ ...NO_ADB }),
      getVar:           async () => ({ ...NO_ADB, value: '' }),
      oem:              async () => ({ ...NO_ADB }),
    },

    // ── File API stubs ─────────────────────────────────────────────────────
    files: {
      list:             async () => ({ ...NO_ADB, files: [] }),
      pull:             async () => ({ ...NO_ADB }),
      push:             async () => ({ ...NO_ADB }),
      delete:           async () => ({ ...NO_ADB }),
      mkdir:            async () => ({ ...NO_ADB }),
    },

    // ── Logcat API stubs ──────────────────────────────────────────────────
    logcat: {
      start:            async () => ({ ...NO_ADB }),
      stop:             async () => ({ success: true }),
      clear:            async () => ({ ...NO_ADB }),
      onLog:            () => {},
      offLog:           () => {},
    },

    // ── Wireless API stubs ────────────────────────────────────────────────
    wireless: {
      enableTcpip:      async () => ({ ...NO_ADB }),
      connect:          async () => ({ ...NO_ADB }),
      disconnect:       async () => ({ ...NO_ADB }),
      getSaved:         async () => {
        try {
          const raw = localStorage.getItem('primeadb_saved_devices');
          const devices = raw ? JSON.parse(raw) : [];
          return { success: true, devices };
        } catch { return { success: true, devices: [] }; }
      },
      saveDevice:       async (device) => {
        try {
          const raw = localStorage.getItem('primeadb_saved_devices');
          const devices = raw ? JSON.parse(raw) : [];
          const idx = devices.findIndex(d => d.host === device.host);
          if (idx >= 0) devices[idx] = { ...devices[idx], ...device, lastConnected: Date.now() };
          else devices.push({ ...device, lastConnected: Date.now() });
          localStorage.setItem('primeadb_saved_devices', JSON.stringify(devices));
          return { success: true };
        } catch { return { success: false }; }
      },
      removeSaved:      async (host) => {
        try {
          const raw = localStorage.getItem('primeadb_saved_devices');
          const devices = (raw ? JSON.parse(raw) : []).filter(d => d.host !== host);
          localStorage.setItem('primeadb_saved_devices', JSON.stringify(devices));
          return { success: true };
        } catch { return { success: false }; }
      },
    },

    // ── Settings API (localStorage-backed) ───────────────────────────────
    settings: {
      get:    async ()       => loadSettings(),
      set:    async (obj)    => { saveSettings(obj); return { success: true }; },
      reset:  async ()       => { localStorage.removeItem(SETTINGS_KEY); return { success: true }; },
      export: async ()       => ({ success: false, error: 'Export not supported on Android.' }),
      pickPath: async ()     => ({ success: false, path: '' }),
    },

    // ── System API stubs (window controls don't exist on Android) ─────────
    system: {
      minimizeWindow: () => {},
      maximizeWindow: () => {},
      closeWindow:    () => {},
      getVersion:     async () => ({ version: '1.0.0', platform: 'android' }),
      openExternal:   (url) => { try { window.open(url, '_blank'); } catch(e) {} },
    },
  };

  // ── Expose IS_ANDROID flag globally ──────────────────────────────────────
  window.IS_ANDROID = IS_ANDROID;

  console.log('[Bridge] Shim installed. ADB features will show Android-aware messages.');
})();
