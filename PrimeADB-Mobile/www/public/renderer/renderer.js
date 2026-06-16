/**
 * PrimeADB Renderer — App Router & Controller
 * Initializes the SPA, manages page navigation, and device state.
 *
 * Performance: Pages are cached after first render. Switching tabs only
 * toggles visibility (display:none/block) — no destroy/recreate cycle,
 * no repeated ADB calls just to open a tab.
 */

// ─── State ────────────────────────────────────────────────────────────────────
const appState = {
  currentDevice: null,
  currentPage: null,
};

// ─── Page Cache ───────────────────────────────────────────────────────────────
// Stores { instance, root } for each page that has been visited.
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
};

// Ref-name map used for inline onclick handlers in page templates
const PAGE_GLOBAL_REFS = {
  'dashboard':    'dashboardPage',
  'adb-tools':    'adbToolsPage',
  'fastboot':     'fastbootPage',
  'file-manager': 'fileManagerPage',
  'logcat':       'logcatPage',
  'terminal':     'terminalPage',
  'wireless':     'wirelessPage',
  'settings':     'settingsPage',
};

// ─── Shared Device Cache ───────────────────────────────────────────────────────
// Updated by the poller so pages can read it without re-running `adb devices`.
const deviceCache = {
  devices: [],
  lastUpdated: 0,
};

// ─── App Controller ────────────────────────────────────────────────────────────
const app = {
  sidebar: null,

  init() {
    this.sidebar = new Sidebar('sidebar', (pageId) => this.navigate(pageId));
    this._setupTitleBar();
    this._setupDevicePoller();
    this._setupBottomNav();
    this.navigate('dashboard');
  },

  _setupBottomNav() {
    const navItems = document.querySelectorAll('.bottom-nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const pageId = item.dataset.page;
        if (pageId) {
          this.navigate(pageId);
        }
      });
    });
  },

  navigate(pageId) {
    if (!PAGE_REGISTRY[pageId]) {
      console.warn(`Unknown page: ${pageId}`);
      return;
    }

    if (appState.currentPage === pageId) return; // Already on this page

    const main = document.getElementById('main-content');

    // ── Hide current page (if any) ──
    if (appState.currentPage && pageCache[appState.currentPage]) {
      const prev = pageCache[appState.currentPage];
      prev.root.style.display = 'none';
      // Notify page it's being hidden (optional lifecycle hook)
      if (prev.instance.onHide) prev.instance.onHide();
    }

    appState.currentPage = pageId;

    // ── Restore or create page ──
    if (pageCache[pageId]) {
      // Cache hit: just show the existing DOM, no ADB calls needed
      const cached = pageCache[pageId];
      cached.root.style.display = '';
      if (cached.instance.onShow) cached.instance.onShow();
    } else {
      // Cache miss: first visit — create and render the page
      const instance = PAGE_REGISTRY[pageId]();
      if (PAGE_GLOBAL_REFS[pageId]) window[PAGE_GLOBAL_REFS[pageId]] = instance;

      const root = document.createElement('div');
      root.className = 'page-container';
      root.id = `page-root-${pageId}`;
      main.appendChild(root);

      instance.render(root);
      pageCache[pageId] = { instance, root };
    }

    // Update sidebar active state
    this.sidebar.navigate(pageId);

    // Update bottom nav active state
    document.querySelectorAll('.bottom-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === pageId);
    });
  },

  setCurrentDevice(device) {
    appState.currentDevice = device;
    this.sidebar.setDevice(device);
  },

  _setupTitleBar() {
    document.getElementById('tb-minimize')?.addEventListener('click', () => {
      if (!window.Capacitor) {
        // Desktop fallback
        // Minimize window logic
      }
    });

    document.getElementById('tb-maximize')?.addEventListener('click', () => {
      if (!window.Capacitor) {
        // Desktop fallback
      }
    });

    document.getElementById('tb-close')?.addEventListener('click', () => {
      if (!window.Capacitor) {
        // Desktop fallback
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'F4') {
        if (!window.Capacitor) window.close?.();
      }
    });
  },

  /** Poll for connected devices every 5 s and update status bar + shared cache */
  _setupDevicePoller() {
    const poll = async () => {
      try {
        let result = { success: false, devices: [] };
        if (window.Capacitor) {
          result = { success: false, error: 'ADB is not supported on Android.' };
        } else {
          // Desktop fallback
        }
        const devices = result.success ? result.devices : [];
        // Update shared cache so pages don't need their own adb devices call
        deviceCache.devices = devices;
        deviceCache.lastUpdated = Date.now();

        const el = document.getElementById('tb-device-count');
        if (el) {
          if (window.Capacitor) {
            el.textContent = 'Desktop Mode';
            el.style.color = 'var(--color-warning)';
          } else {
            const n = devices.length;
            el.textContent = n > 0 ? `${n} Device${n > 1 ? 's' : ''} Connected` : 'No Devices';
            el.style.color = n > 0 ? 'var(--color-success)' : 'var(--text-muted)';
          }
        }
      } catch (e) {
        // ADB might not be installed — silent fail
      }
    };

    poll();
    setInterval(poll, 5000);
  },
};

// Make app globally accessible
window.app = app;

// ─── Init on DOM Ready ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize i18n and wait for translations to load
  await window.i18n.init();

  // Translate static HTML elements (like bottom nav)
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.innerHTML = window.i18n.t(el.getAttribute('data-i18n'));
  });

  app.init();
});
