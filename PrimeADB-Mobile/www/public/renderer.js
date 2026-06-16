/**
 * PrimeADB Renderer — App Router & Controller (Android Edition)
 * ─────────────────────────────────────────────────────────────────────────────
 * Android-safe version:
 *  • No Electron window controls
 *  • Bottom navigation instead of sidebar navigation
 *  • ADB device poller shows Android-appropriate status
 *  • Pages are cached after first render (no destroy/recreate)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── State ────────────────────────────────────────────────────────────────────
const appState = {
  currentDevice: null,
  currentPage: null,
};

// ─── Page Cache ───────────────────────────────────────────────────────────────
const pageCache = {};

// ─── Page Registry ────────────────────────────────────────────────────────────
const PAGE_REGISTRY = {
  'dashboard':    () => new DashboardPage(),
  'adb-tools':    () => new AdbToolsPage(),
  'fastboot':     () => new FastbootPage(),
  'file-manager': () => new FileManagerPage(),
  'logcat':       () => new LogcatPage(),
  'terminal':     () => new TerminalPage(),
  'wireless':     () => new WirelessPage(),
  'settings':     () => new SettingsPage(),
  'language':     () => new LanguagePage(),
};

// Global refs so pages can call window.dashboardPage etc.
const PAGE_GLOBAL_REFS = {
  'dashboard':    'dashboardPage',
  'adb-tools':    'adbToolsPage',
  'fastboot':     'fastbootPage',
  'file-manager': 'fileManagerPage',
  'logcat':       'logcatPage',
  'terminal':     'terminalPage',
  'wireless':     'wirelessPage',
  'settings':     'settingsPage',
  'language':     'languagePage',
};

// ─── Shared Device Cache ───────────────────────────────────────────────────────
const deviceCache = { devices: [], lastUpdated: 0 };

// ─── Bottom Nav Pages (shown in bottom nav; others accessible programmatically) ─
const BOTTOM_NAV_PAGES = ['dashboard', 'adb-tools', 'terminal', 'wireless', 'settings'];

// ─── App Controller ────────────────────────────────────────────────────────────
const app = {
  sidebar: null,

  async init() {
    // Initialize i18n
    await window.i18n.init();

    // Initialize sidebar (still used internally for state, but hidden on mobile)
    this.sidebar = new Sidebar('sidebar', (pageId) => this.navigate(pageId));

    // Wire bottom navigation
    this._setupBottomNav();

    // Start device poller
    this._setupDevicePoller();

    // Navigate to dashboard on launch
    this.navigate('dashboard');

    // Listen for language changes to update active page
    window.addEventListener('languagechange', () => {
      this._updateBottomNav(appState.currentPage);
      // Re-render current page
      if (appState.currentPage && pageCache[appState.currentPage]) {
        const page = pageCache[appState.currentPage];
        if (page.instance.onShow) page.instance.onShow();
        else if (page.instance._updateTexts) page.instance._updateTexts();
      }
    });
  },

  navigate(pageId) {
    if (!PAGE_REGISTRY[pageId]) {
      console.warn(`[Router] Unknown page: ${pageId}`);
      return;
    }
    if (appState.currentPage === pageId) return;

    const main = document.getElementById('main-content');

    // Hide current page
    if (appState.currentPage && pageCache[appState.currentPage]) {
      const prev = pageCache[appState.currentPage];
      prev.root.style.display = 'none';
      if (prev.instance.onHide) prev.instance.onHide();
    }

    appState.currentPage = pageId;

    // Restore or create page
    if (pageCache[pageId]) {
      const cached = pageCache[pageId];
      cached.root.style.display = '';
      if (cached.instance.onShow) cached.instance.onShow();
    } else {
      const instance = PAGE_REGISTRY[pageId]();
      if (PAGE_GLOBAL_REFS[pageId]) window[PAGE_GLOBAL_REFS[pageId]] = instance;

      const root = document.createElement('div');
      root.className = 'page-container page-enter';
      root.id = `page-root-${pageId}`;
      main.appendChild(root);

      instance.render(root);
      pageCache[pageId] = { instance, root };
    }

    // Scroll to top on page change
    const main2 = document.getElementById('main-content');
    if (main2) main2.scrollTop = 0;

    // Update bottom nav active state
    this._updateBottomNav(pageId);

    // Update sidebar state too (for any desktop fallback)
    this.sidebar.navigate(pageId);
  },

  setCurrentDevice(device) {
    appState.currentDevice = device;
    this.sidebar.setDevice(device);
  },

  _setupBottomNav() {
    const nav = document.getElementById('bottom-nav');
    if (!nav) return;

    nav.querySelectorAll('.bottom-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const pageId = btn.dataset.page;
        if (pageId) this.navigate(pageId);
      });
    });
  },

  _updateBottomNav(activePageId) {
    document.querySelectorAll('.bottom-nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === activePageId);
    });
  },

  /** Poll for devices every 10s — shows Android-friendly status */
  _setupDevicePoller() {
    const poll = async () => {
      try {
        let result = { success: false, devices: [] };
        if (window.Capacitor) {
          // Android implementation
          result = { success: false, error: 'ADB requires a desktop environment.' };
        } else {
          // Desktop fallback
          // Fallback logic
        }

        const devices = result.success ? (result.devices || []) : [];
        deviceCache.devices = devices;
        deviceCache.lastUpdated = Date.now();

        const el = document.getElementById('tb-device-count');
        const dot = document.getElementById('tb-status-dot');

        if (el) {
          if (window.Capacitor) {
            // On Android, ADB devices are always 0 (no ADB daemon)
            el.textContent = window.i18n.t('common.desktop_mode') || 'Desktop Mode';
            el.style.color = 'var(--color-warning)';
            if (dot) dot.style.background = 'var(--color-warning)';
          } else {
            const n = devices.length;
            el.textContent = n > 0 
              ? (n === 1 ? window.i18n.t('common.device_connected', { count: n }) : window.i18n.t('common.devices_connected', { count: n }))
              : window.i18n.t('common.no_devices') || 'No Devices';
            el.style.color = n > 0 ? 'var(--color-success)' : 'var(--text-muted)';
            if (dot) dot.style.background = n > 0 ? 'var(--color-success)' : 'var(--text-muted)';
          }
        }
      } catch (e) {
        // Silent fail
      }
    };

    poll();
    setInterval(poll, 10000); // Poll every 10s (reduced frequency for mobile battery)
  },
};

// Make app globally accessible
window.app = app;

// ─── Init ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
