/**
 * PrimeADB Sidebar Component
 * Renders the navigation sidebar and handles routing.
 */

const NAV_ITEMS = [
  {
    section: 'Main',
    items: [
      { id: 'dashboard',  label: 'Dashboard',     icon: '📊' },
      { id: 'adb-tools',  label: 'ADB Tools',     icon: '🔧' },
      { id: 'fastboot',   label: 'Fastboot',      icon: '⚡' },
      { id: 'file-manager', label: 'File Manager', icon: '📁' },
    ],
  },
  {
    section: 'Tools',
    items: [
      { id: 'logcat',   label: 'Logcat',      icon: '📋' },
      { id: 'terminal', label: 'Terminal',    icon: '💻' },
      { id: 'wireless', label: 'Wireless ADB',icon: '📡' },
    ],
  },
  {
    section: 'Config',
    items: [
      { id: 'settings', label: 'Settings',    icon: '⚙️' },
    ],
  },
];

class Sidebar {
  constructor(containerId, onNavigate) {
    this.container = document.getElementById(containerId);
    this.onNavigate = onNavigate;
    this.activeId = 'dashboard';
    this.currentDevice = null;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="sidebar-brand">
        <div class="sidebar-brand-icon">🤖</div>
        <div class="sidebar-brand-text">
          <h1>PrimeADB</h1>
          <p>Android Manager</p>
        </div>
      </div>
      <nav class="sidebar-nav" id="sidebar-nav-items"></nav>
      <div class="sidebar-footer" id="sidebar-footer"></div>
    `;

    this._renderNav();
    this._renderFooter();
  }

  _renderNav() {
    const nav = this.container.querySelector('#sidebar-nav-items');
    nav.innerHTML = NAV_ITEMS.map(section => `
      <div class="nav-section">
        <div class="nav-section-label">${section.section}</div>
        ${section.items.map(item => `
          <div class="nav-item ${item.id === this.activeId ? 'active' : ''}"
               data-page="${item.id}" id="nav-${item.id}">
            <span class="nav-item-icon">${item.icon}</span>
            <span class="nav-item-label">${item.label}</span>
          </div>
        `).join('')}
      </div>
    `).join('');

    nav.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', () => {
        this.navigate(el.dataset.page);
      });
    });
  }

  _renderFooter() {
    const footer = this.container.querySelector('#sidebar-footer');
    if (this.currentDevice) {
      footer.innerHTML = `
        <div class="sidebar-device-pill" title="${this.currentDevice.serial}">
          <span class="status-dot online"></span>
          <div class="sidebar-device-info">
            <div class="sidebar-device-name">${this.currentDevice.model || this.currentDevice.serial}</div>
            <div class="sidebar-device-serial">${this.currentDevice.serial}</div>
          </div>
          <span style="color: var(--text-muted); font-size:0.8rem;">▾</span>
        </div>
      `;
    } else {
      footer.innerHTML = `
        <div class="sidebar-no-device">
          <span>📵</span>
          <span>No device selected</span>
        </div>
      `;
    }
  }

  navigate(pageId) {
    this.activeId = pageId;
    // Update active nav item
    this.container.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === pageId);
    });
    this.onNavigate(pageId);
  }

  setDevice(device) {
    this.currentDevice = device;
    this._renderFooter();
  }
}

window.Sidebar = Sidebar;
