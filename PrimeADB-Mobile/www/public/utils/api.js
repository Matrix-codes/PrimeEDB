/**
 * PrimeADB Unified API Bridge
 * Replaces Electron IPC calls with environment-aware runtime checks.
 */

class ApiBridge {
  constructor() {
    this._NO_ADB = {
      success: false,
      error: 'This feature requires a desktop environment. Connect via PrimeADB Desktop.',
      devices: [],
    };
  }

  // --- ADB ---
  adb = {
    getDevices: async () => {
      if (window.Capacitor) {
        return { ...this._NO_ADB };
      } else {
        return { success: true, devices: [] };
      }
    },
    getDeviceInfo: async () => {
      if (window.Capacitor) return { ...this._NO_ADB };
      return { success: true, info: {} };
    },
    shell: async (serial, cmd) => {
      if (window.Capacitor) return { ...this._NO_ADB, output: '' };
      return { success: false, error: 'Not implemented on desktop fallback.' };
    },
    runCommand: async (cmd) => {
      if (window.Capacitor) return { ...this._NO_ADB, output: '' };
      return { success: false, error: 'Not implemented.' };
    },
    screenshot: async () => window.Capacitor ? { ...this._NO_ADB } : { success: false },
    screenRecord: async () => window.Capacitor ? { ...this._NO_ADB } : { success: false },
    reboot: async () => window.Capacitor ? { ...this._NO_ADB } : { success: false },
    installApk: async () => window.Capacitor ? { ...this._NO_ADB } : { success: false },
    uninstallApk: async () => window.Capacitor ? { ...this._NO_ADB } : { success: false },
    getPackages: async () => window.Capacitor ? { ...this._NO_ADB, packages: [] } : { success: true, packages: [] },
    push: async () => window.Capacitor ? { ...this._NO_ADB } : { success: false },
    pull: async () => window.Capacitor ? { ...this._NO_ADB } : { success: false },
  };

  // --- Fastboot ---
  fastboot = {
    getDevices: async () => {
      if (window.Capacitor) return { ...this._NO_ADB };
      return { success: true, devices: [] };
    },
    flash: async () => window.Capacitor ? { ...this._NO_ADB } : { success: false },
    unlock: async () => window.Capacitor ? { ...this._NO_ADB } : { success: false },
    exec: async () => window.Capacitor ? { ...this._NO_ADB, output: '' } : { success: false },
    getVar: async () => window.Capacitor ? { ...this._NO_ADB, value: '' } : { success: false },
    reboot: async () => window.Capacitor ? { ...this._NO_ADB } : { success: false },
  };

  // --- Logcat ---
  logcat = {
    start: async () => window.Capacitor ? { ...this._NO_ADB } : { success: false },
    stop: async () => window.Capacitor ? { success: true } : { success: true },
    clear: async () => window.Capacitor ? { ...this._NO_ADB } : { success: false },
    export: async () => window.Capacitor ? { ...this._NO_ADB } : { success: false },
    onData: () => {},
    offData: () => {},
  };

  // --- Files ---
  files = {
    list: async () => window.Capacitor ? { ...this._NO_ADB, files: [] } : { success: false, files: [] },
    delete: async () => window.Capacitor ? { ...this._NO_ADB } : { success: false },
    mkdir: async () => window.Capacitor ? { ...this._NO_ADB } : { success: false },
    push: async () => window.Capacitor ? { ...this._NO_ADB } : { success: false },
    pull: async () => window.Capacitor ? { ...this._NO_ADB } : { success: false },
  };

  // --- Wireless ---
  wireless = {
    enableTcpip: async () => window.Capacitor ? { ...this._NO_ADB } : { success: false },
    connect: async () => window.Capacitor ? { ...this._NO_ADB } : { success: false },
    disconnect: async () => window.Capacitor ? { ...this._NO_ADB } : { success: false },
    getSaved: async () => {
      if (window.Capacitor) {
        try {
          const raw = localStorage.getItem('primeadb_saved_devices');
          return { success: true, devices: raw ? JSON.parse(raw) : [] };
        } catch { return { success: true, devices: [] }; }
      } else {
        return { success: true, devices: [] };
      }
    },
    saveDevice: async (device) => {
      if (window.Capacitor) {
        try {
          const raw = localStorage.getItem('primeadb_saved_devices');
          const devices = raw ? JSON.parse(raw) : [];
          devices.push({ ...device, lastConnected: Date.now() });
          localStorage.setItem('primeadb_saved_devices', JSON.stringify(devices));
          return { success: true };
        } catch { return { success: false }; }
      } else {
        return { success: true };
      }
    },
    removeSaved: async (host) => {
      if (window.Capacitor) {
        try {
          const raw = localStorage.getItem('primeadb_saved_devices');
          const devices = (raw ? JSON.parse(raw) : []).filter(d => d.host !== host);
          localStorage.setItem('primeadb_saved_devices', JSON.stringify(devices));
          return { success: true };
        } catch { return { success: false }; }
      } else {
        return { success: true };
      }
    },
  };

  // --- Settings ---
  settings = {
    pickPath: async () => {
      if (window.Capacitor) return { success: false, path: '' };
      return { success: false, path: '' };
    }
  };
}

window.api = new ApiBridge();
