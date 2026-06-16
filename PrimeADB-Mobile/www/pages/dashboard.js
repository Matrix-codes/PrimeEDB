/**
 * PrimeADB Dashboard Page
 * Shows device info cards with real-time data.
 */

class DashboardPage {
  constructor() {
    this.refreshTimer = null;
    this.isRefreshing = false;
  }

  render(container) {
    container.innerHTML = `
      <div class="page-enter">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-5);">
          <div class="page-title" style="margin-bottom:0;">
            <span class="title-icon">📊</span>
            Dashboard
          </div>
          <button class="btn btn-secondary btn-sm" id="dash-global-refresh">🔄 Refresh</button>
        </div>

        <!-- ADB Status Banner (shown if ADB not found) -->
        <div id="dash-adb-warning" class="hidden" style="margin-bottom:var(--space-4);">
          <div class="card" style="border-color:var(--color-warning); background:rgba(245,158,11,0.06); padding:var(--space-4);">
            <div class="flex items-center gap-3">
              <span style="font-size:1.4rem;">⚠️</span>
              <div>
                <div style="font-weight:600; color:var(--color-warning); margin-bottom:2px;">ADB Not Found</div>
                <div class="text-muted text-sm">ADB is not installed or not in your system PATH. Install <b>Android Platform Tools</b> and add it to PATH, or set a custom path in <b>Settings</b>.</div>
              </div>
              <button class="btn btn-warning btn-sm" style="margin-left:auto; flex-shrink:0;" onclick="window.app.navigate('settings')">⚙️ Settings</button>
            </div>
          </div>
        </div>

        <!-- No Device State (shown by default until devices load) -->
        <div id="dash-no-device" class="empty-state" style="padding: var(--space-12);">
          <div class="spinner spinner-lg" style="margin-bottom:var(--space-4);"></div>
          <h3 id="dash-no-device-title">Scanning for devices...</h3>
          <p id="dash-no-device-msg">Please wait while PrimeADB detects connected Android devices.</p>
          <div style="margin-top:24px;" class="btn-group">
            <button class="btn btn-primary" onclick="window.app.navigate('wireless')">📡 Connect Wirelessly</button>
            <button class="btn btn-secondary" id="dash-refresh-btn">🔄 Refresh Devices</button>
          </div>
        </div>

        <!-- Device Content (hidden until device found) -->
        <div id="dash-content" class="hidden">
          <!-- Device Selector Bar -->
          <div class="card" style="margin-bottom: var(--space-5); padding: var(--space-3) var(--space-4);">
            <div class="flex items-center gap-4" style="flex-wrap:wrap;">
              <span class="text-muted text-sm">Active Device:</span>
              <select id="dash-device-select" style="max-width:340px; flex:1;"></select>
              <button class="btn btn-secondary btn-sm" id="dash-refresh-btn2">🔄 Refresh</button>
              <div class="flex items-center gap-2" style="margin-left:auto;">
                <span class="status-dot online animate-pulse"></span>
                <span class="text-sm text-muted" id="dash-device-state">Connected</span>
              </div>
            </div>
          </div>

          <!-- Device Identity Cards -->
          <div class="grid-4 stagger" style="margin-bottom: var(--space-5);">
            ${this._identityCard('📱', 'Device Name', 'dash-name', 'icon-bg-primary')}
            ${this._identityCard('🏷️', 'Model', 'dash-model', 'icon-bg-purple')}
            ${this._identityCard('🤖', 'Android', 'dash-android', 'icon-bg-success')}
            ${this._identityCard('🔑', 'Serial Number', 'dash-serial', 'icon-bg-info')}
          </div>

          <!-- Hardware Cards -->
          <div class="grid-4 stagger" style="margin-bottom: var(--space-5);">
            ${this._hwCard('🧠', 'CPU', 'dash-cpu', 'icon-bg-warning')}
            ${this._hwCard('💾', 'RAM', 'dash-ram', 'icon-bg-accent')}
            ${this._batteryCard()}
            ${this._hwCard('📺', 'Resolution', 'dash-resolution', 'icon-bg-purple')}
          </div>

          <!-- Build Info + Power Info -->
          <div class="grid-2" style="margin-bottom: var(--space-5); gap: var(--space-4);">
            <div class="card">
              <div class="section-header">
                <span class="section-title">🔧 Build Information</span>
                <span class="badge badge-neutral" id="dash-sdk-badge">SDK --</span>
              </div>
              <div id="dash-build-left"></div>
            </div>
            <div class="card">
              <div class="section-header"><span class="section-title">⚡ Power & Display</span></div>
              <div id="dash-build-right"></div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card">
            <div class="section-header"><span class="section-title">⚡ Quick Actions</span></div>
            <div class="btn-group">
              <button class="btn btn-primary" id="qa-screenshot">📸 Screenshot</button>
              <button class="btn btn-secondary" id="qa-reboot">🔄 Reboot</button>
              <button class="btn btn-warning" id="qa-reboot-recovery">🛡️ Recovery</button>
              <button class="btn btn-danger" id="qa-reboot-bootloader">⚡ Bootloader</button>
              <button class="btn btn-secondary" id="qa-logcat">📋 Logcat</button>
              <button class="btn btn-secondary" id="qa-files">📁 File Manager</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this._bindEvents(container);
    // Start loading — errors are caught inside
    this._loadDevices();
  }

  _identityCard(icon, label, id, iconBg) {
    return `
      <div class="card stat-card">
        <div class="card-icon ${iconBg}">${icon}</div>
        <div class="card-title">${label}</div>
        <div class="card-value" id="${id}" style="font-size:0.95rem; font-family:var(--font-mono); margin-top:4px;">--</div>
      </div>`;
  }

  _hwCard(icon, label, id, iconBg) {
    return `
      <div class="card stat-card">
        <div class="card-icon ${iconBg}">${icon}</div>
        <div class="card-title">${label}</div>
        <div class="card-value" id="${id}" style="font-size:1.1rem;">--</div>
      </div>`;
  }

  _batteryCard() {
    return `
      <div class="card stat-card">
        <div class="card-icon icon-bg-success">🔋</div>
        <div class="card-title">Battery</div>
        <div class="card-value" id="dash-battery" style="font-size:1.5rem; margin-top:4px;">--%</div>
        <div class="progress-bar" style="margin-top: 8px;">
          <div class="progress-fill" id="dash-battery-bar" style="width:0%;"></div>
        </div>
        <div class="flex" style="justify-content:space-between; margin-top:6px;">
          <span class="text-xs text-muted" id="dash-battery-health">Health: --</span>
          <span class="text-xs text-muted" id="dash-battery-temp">--°C</span>
        </div>
      </div>`;
  }

  _bindEvents(container) {
    container.querySelector('#dash-global-refresh')?.addEventListener('click', () => this._loadDevices());
    container.querySelector('#dash-refresh-btn')?.addEventListener('click', () => this._loadDevices());
    container.querySelector('#dash-refresh-btn2')?.addEventListener('click', () => this._loadDevices());

    container.querySelector('#dash-device-select')?.addEventListener('change', (e) => {
      if (e.target.value) this._loadDeviceInfo(e.target.value);
    });

    // Quick actions
    container.querySelector('#qa-screenshot')?.addEventListener('click', () => this._quickAction('screenshot'));
    container.querySelector('#qa-reboot')?.addEventListener('click', () => this._quickAction('reboot'));
    container.querySelector('#qa-reboot-recovery')?.addEventListener('click', () => this._quickAction('recovery'));
    container.querySelector('#qa-reboot-bootloader')?.addEventListener('click', () => this._quickAction('bootloader'));
    container.querySelector('#qa-logcat')?.addEventListener('click', () => window.app.navigate('logcat'));
    container.querySelector('#qa-files')?.addEventListener('click', () => window.app.navigate('file-manager'));
  }

  async _loadDevices() {
    // On Android — ADB is not available; show info immediately
    if (window.IS_ANDROID) {
      this._showAndroidInfo();
      return;
    }

    // Desktop path — try ADB normally
    this._showState('scanning');
    try {
      const result = await window.primeADB.adb.getDevices();
      if (!result.success) {
        this._showAdbWarning(true);
        this._showState('no-device', 'ADB Error', result.error || 'Could not run ADB. Check Settings.');
        return;
      }
      this._showAdbWarning(false);
      if (!result.devices || result.devices.length === 0) {
        this._showState('no-device', 'No Device Connected',
          'Connect an Android device via USB with USB debugging enabled, or use Wireless ADB.');
        return;
      }
      this._showState('content');
      const select = document.getElementById('dash-device-select');
      if (select) {
        select.innerHTML = result.devices.map(d =>
          `<option value="${d.serial}">${d.serial}  [${d.state || 'device'}]</option>`
        ).join('');
        const serial = result.devices[0].serial;
        select.value = serial;
        await this._loadDeviceInfo(serial);
      }
    } catch (err) {
      this._showAdbWarning(true);
      this._showState('no-device', 'Connection Error', err.message || 'An unexpected error occurred.');
      console.error('[Dashboard] Error loading devices:', err);
    }
  }

  /** Show Android-specific info state */
  _showAndroidInfo() {
    const noDevice = document.getElementById('dash-no-device');
    const content = document.getElementById('dash-content');
    if (content) content.classList.add('hidden');
    if (noDevice) {
      noDevice.style.display = '';
      const spinner = noDevice.querySelector('.spinner');
      const titleEl = document.getElementById('dash-no-device-title');
      const msgEl = document.getElementById('dash-no-device-msg');
      if (spinner) spinner.style.display = 'none';
      if (titleEl) titleEl.textContent = 'Running on Android';
      if (msgEl) msgEl.textContent =
        'ADB commands require the PrimeADB desktop app on your PC/Mac. Install it from our website and connect your Android device via USB or Wi-Fi to get started.';
    }
  }

  /** Show/hide the ADB not-found warning banner */
  _showAdbWarning(show) {
    const el = document.getElementById('dash-adb-warning');
    if (el) el.classList.toggle('hidden', !show);
  }

  /** Switch between: 'scanning', 'no-device', 'content' */
  _showState(state, title = '', msg = '') {
    const noDevice = document.getElementById('dash-no-device');
    const content = document.getElementById('dash-content');
    if (state === 'content') {
      if (noDevice) noDevice.style.display = 'none';
      if (content) content.classList.remove('hidden');
    } else {
      if (content) content.classList.add('hidden');
      if (noDevice) noDevice.style.display = '';
      const titleEl = document.getElementById('dash-no-device-title');
      const msgEl = document.getElementById('dash-no-device-msg');
      const spinner = noDevice?.querySelector('.spinner');
      if (state === 'scanning') {
        if (spinner) spinner.style.display = '';
        if (titleEl) titleEl.textContent = 'Scanning for devices...';
        if (msgEl) msgEl.textContent = 'Please wait while PrimeADB detects connected Android devices.';
      } else {
        if (spinner) spinner.style.display = 'none';
        if (titleEl) titleEl.textContent = title || 'No Device Connected';
        if (msgEl) msgEl.textContent = msg || 'Connect an Android device via USB or use Wireless ADB.';
      }
    }
  }


  async _loadDeviceInfo(serial) {
    let result;
    try {
      result = await loading.wrap(
        () => window.primeADB.adb.getDeviceInfo(serial),
        'Loading device information...'
      );
    } catch (err) {
      toast.error('Failed to load device info', err.message);
      return;
    }

    if (!result || !result.success) {
      toast.error('Failed to load device info', result?.error || 'Unknown error');
      return;
    }

    const info = result.info;
    window.app.setCurrentDevice({ serial, model: info.model });

    // Identity
    this._setText('dash-name',    info.deviceName || info.brand || 'Unknown');
    this._setText('dash-model',   info.model || 'N/A');
    this._setText('dash-android', info.androidVersion ? `Android ${info.androidVersion}` : 'N/A');
    this._setText('dash-serial',  info.serial || serial);

    // Hardware
    this._setText('dash-cpu',        info.cpu ? `${info.cpu} (${info.cpuAbi || 'N/A'})` : 'N/A');
    this._setText('dash-ram',        info.ramTotal || 'N/A');
    this._setText('dash-resolution', info.resolution || 'N/A');

    // Battery
    const level = parseInt(info.batteryLevel) || 0;
    this._setText('dash-battery',        info.batteryLevel || 'N/A');
    this._setText('dash-battery-health', `Health: ${info.batteryHealth || 'N/A'}`);
    this._setText('dash-battery-temp',   info.batteryTemp || 'N/A');
    const bar = document.getElementById('dash-battery-bar');
    if (bar) {
      bar.style.width = `${level}%`;
      bar.style.background = level > 50 ? 'var(--color-success)' : level > 20 ? 'var(--color-warning)' : 'var(--color-danger)';
    }

    // SDK badge
    this._setText('dash-sdk-badge', `SDK ${info.sdkVersion || '--'}`);

    // Build cards
    const buildLeft = [
      ['Brand',        info.brand],
      ['Manufacturer', info.manufacturer],
      ['Build Number', info.buildNumber],
      ['SDK Version',  info.sdkVersion],
    ];
    const buildRight = [
      ['CPU ABI',      info.cpuAbi],
      ['Screen DPI',   info.screenDensity ? `${info.screenDensity} dpi` : 'N/A'],
      ['Battery Volt', info.batteryVoltage],
      ['Power Source', info.powerSource],
    ];

    const leftEl = document.getElementById('dash-build-left');
    const rightEl = document.getElementById('dash-build-right');
    if (leftEl) leftEl.innerHTML = buildLeft.map(([k, v]) => this._infoRow(k, v)).join('');
    if (rightEl) rightEl.innerHTML = buildRight.map(([k, v]) => this._infoRow(k, v)).join('');
  }

  _infoRow(label, value) {
    return `<div class="info-row">
      <span class="info-label">${label}</span>
      <span class="info-value">${value || 'N/A'}</span>
    </div>`;
  }

  _setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  async _quickAction(action) {
    const serial = document.getElementById('dash-device-select')?.value;
    if (!serial) { toast.warning('No device selected'); return; }

    try {
      if (action === 'screenshot') {
        const result = await loading.wrap(() => window.primeADB.adb.screenshot(serial), 'Capturing screenshot...');
        result.success ? toast.success('Screenshot saved!') : toast.error('Screenshot failed', result.error);
      } else if (action === 'reboot') {
        const ok = await modal.confirm({ title: 'Reboot Device', message: 'Reboot the device normally?', confirmType: 'primary' });
        if (ok) { await window.primeADB.adb.reboot(serial, ''); toast.info('Rebooting...'); }
      } else if (action === 'recovery') {
        const ok = await modal.confirm({ title: 'Reboot to Recovery', message: 'Reboot into recovery mode?', confirmType: 'warning' });
        if (ok) { await window.primeADB.adb.reboot(serial, 'recovery'); toast.info('Rebooting to recovery...'); }
      } else if (action === 'bootloader') {
        const ok = await modal.confirm({ title: 'Reboot to Bootloader', message: 'Reboot into fastboot mode?', confirmType: 'danger', confirmText: 'Reboot' });
        if (ok) { await window.primeADB.adb.reboot(serial, 'bootloader'); toast.info('Rebooting to bootloader...'); }
      }
    } catch (err) {
      toast.error('Action failed', err.message);
    }
  }

  destroy() {
    clearInterval(this.refreshTimer);
  }
}

window.DashboardPage = DashboardPage;
