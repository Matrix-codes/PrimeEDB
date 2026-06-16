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
            <span data-i18n="dashboard.title">${window.i18n.t('dashboard.title')}</span>
          </div>
          <button class="btn btn-secondary btn-sm" id="dash-global-refresh">🔄 <span data-i18n="dashboard.refresh">${window.i18n.t('dashboard.refresh')}</span></button>
        </div>

        <!-- ADB Status Banner (shown if ADB not found) -->
        <div id="dash-adb-warning" class="hidden" style="margin-bottom:var(--space-4);">
          <div class="card" style="border-color:var(--color-warning); background:rgba(245,158,11,0.06); padding:var(--space-4);">
            <div class="flex items-center gap-3">
              <span style="font-size:1.4rem;">⚠️</span>
              <div>
                <div style="font-weight:600; color:var(--color-warning); margin-bottom:2px;" data-i18n="dashboard.adb_not_found">${window.i18n.t('dashboard.adb_not_found')}</div>
                <div class="text-muted text-sm" data-i18n="dashboard.adb_warning_desc">${window.i18n.t('dashboard.adb_warning_desc')}</div>
              </div>
              <button class="btn btn-warning btn-sm" style="margin-left:auto; flex-shrink:0;" onclick="window.app.navigate('settings')">⚙️ <span data-i18n="nav.settings">${window.i18n.t('nav.settings')}</span></button>
            </div>
          </div>
        </div>

        <!-- No Device State (shown by default until devices load) -->
        <div id="dash-no-device" class="empty-state" style="padding: var(--space-12);">
          <div class="spinner spinner-lg" style="margin-bottom:var(--space-4);"></div>
          <h3 id="dash-no-device-title" data-i18n="dashboard.scanning">${window.i18n.t('dashboard.scanning')}</h3>
          <p id="dash-no-device-msg" data-i18n="dashboard.scanning_msg">${window.i18n.t('dashboard.scanning_msg')}</p>
          <div style="margin-top:24px;" class="btn-group">
            <button class="btn btn-primary" onclick="window.app.navigate('wireless')">📡 <span data-i18n="dashboard.connect_wireless">${window.i18n.t('dashboard.connect_wireless')}</span></button>
            <button class="btn btn-secondary" id="dash-refresh-btn">🔄 <span data-i18n="dashboard.refresh_devices">${window.i18n.t('dashboard.refresh_devices')}</span></button>
          </div>
        </div>

        <!-- Device Content (hidden until device found) -->
        <div id="dash-content" class="hidden">
          <!-- Device Selector Bar -->
          <div class="card" style="margin-bottom: var(--space-5); padding: var(--space-3) var(--space-4);">
            <div class="flex items-center gap-4" style="flex-wrap:wrap;">
              <span class="text-muted text-sm" data-i18n="dashboard.active_device">${window.i18n.t('dashboard.active_device')}</span>
              <select id="dash-device-select" style="max-width:340px; flex:1;"></select>
              <button class="btn btn-secondary btn-sm" id="dash-refresh-btn2">🔄 <span data-i18n="dashboard.refresh">${window.i18n.t('dashboard.refresh')}</span></button>
              <div class="flex items-center gap-2" style="margin-left:auto;">
                <span class="status-dot online animate-pulse"></span>
                <span class="text-sm text-muted" id="dash-device-state" data-i18n="dashboard.connected">${window.i18n.t('dashboard.connected')}</span>
              </div>
            </div>
          </div>

          <!-- Device Identity Cards -->
          <div class="grid-4 stagger" style="margin-bottom: var(--space-5);">
            ${this._identityCard('📱', window.i18n.t('dashboard.device_name'), 'dash-name', 'icon-bg-primary', 'dashboard.device_name')}
            ${this._identityCard('🏷️', window.i18n.t('dashboard.model'), 'dash-model', 'icon-bg-purple', 'dashboard.model')}
            ${this._identityCard('🤖', window.i18n.t('dashboard.android'), 'dash-android', 'icon-bg-success', 'dashboard.android')}
            ${this._identityCard('🔑', window.i18n.t('dashboard.serial_number'), 'dash-serial', 'icon-bg-info', 'dashboard.serial_number')}
          </div>

          <!-- Hardware Cards -->
          <div class="grid-4 stagger" style="margin-bottom: var(--space-5);">
            ${this._hwCard('🧠', window.i18n.t('dashboard.cpu'), 'dash-cpu', 'icon-bg-warning', 'dashboard.cpu')}
            ${this._hwCard('💾', window.i18n.t('dashboard.ram'), 'dash-ram', 'icon-bg-accent', 'dashboard.ram')}
            ${this._batteryCard()}
            ${this._hwCard('📺', window.i18n.t('dashboard.resolution'), 'dash-resolution', 'icon-bg-purple', 'dashboard.resolution')}
          </div>

          <!-- Build Info + Power Info -->
          <div class="grid-2" style="margin-bottom: var(--space-5); gap: var(--space-4);">
            <div class="card">
              <div class="section-header">
                <span class="section-title">🔧 <span data-i18n="dashboard.build_info">${window.i18n.t('dashboard.build_info')}</span></span>
                <span class="badge badge-neutral" id="dash-sdk-badge">SDK --</span>
              </div>
              <div id="dash-build-left"></div>
            </div>
            <div class="card">
              <div class="section-header"><span class="section-title">⚡ <span data-i18n="dashboard.power_display">${window.i18n.t('dashboard.power_display')}</span></span></div>
              <div id="dash-build-right"></div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card">
            <div class="section-header"><span class="section-title">⚡ <span data-i18n="dashboard.quick_actions">${window.i18n.t('dashboard.quick_actions')}</span></span></div>
            <div class="btn-group">
              <button class="btn btn-primary" id="qa-screenshot">📸 <span data-i18n="dashboard.screenshot">${window.i18n.t('dashboard.screenshot')}</span></button>
              <button class="btn btn-secondary" id="qa-reboot">🔄 <span data-i18n="dashboard.reboot">${window.i18n.t('dashboard.reboot')}</span></button>
              <button class="btn btn-warning" id="qa-reboot-recovery">🛡️ <span data-i18n="dashboard.recovery">${window.i18n.t('dashboard.recovery')}</span></button>
              <button class="btn btn-danger" id="qa-reboot-bootloader">⚡ <span data-i18n="dashboard.bootloader">${window.i18n.t('dashboard.bootloader')}</span></button>
              <button class="btn btn-secondary" id="qa-logcat">📋 <span data-i18n="dashboard.logcat">${window.i18n.t('dashboard.logcat')}</span></button>
              <button class="btn btn-secondary" id="qa-files">📁 <span data-i18n="dashboard.file_manager">${window.i18n.t('dashboard.file_manager')}</span></button>
            </div>
          </div>
        </div>
      </div>
    `;

    this._bindEvents(container);
    // Start loading — errors are caught inside
    this._loadDevices();
  }

  _identityCard(icon, label, id, iconBg, i18nKey) {
    return `
      <div class="card stat-card">
        <div class="card-icon ${iconBg}">${icon}</div>
        <div class="card-title" data-i18n="${i18nKey}">${label}</div>
        <div class="card-value" id="${id}" style="font-size:0.95rem; font-family:var(--font-mono); margin-top:4px;">--</div>
      </div>`;
  }

  _hwCard(icon, label, id, iconBg, i18nKey) {
    return `
      <div class="card stat-card">
        <div class="card-icon ${iconBg}">${icon}</div>
        <div class="card-title" data-i18n="${i18nKey}">${label}</div>
        <div class="card-value" id="${id}" style="font-size:1.1rem;">--</div>
      </div>`;
  }

  _batteryCard() {
    return `
      <div class="card stat-card">
        <div class="card-icon icon-bg-success">🔋</div>
        <div class="card-title" data-i18n="dashboard.battery">${window.i18n.t('dashboard.battery')}</div>
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
      const result = await window.api.adb.getDevices();
      if (!result.success) {
        this._showAdbWarning(true);
        this._showState('no-device', window.i18n.t('dashboard.adb_error'), result.error || window.i18n.t('dashboard.adb_warning_desc'));
        return;
      }
      this._showAdbWarning(false);
      if (!result.devices || result.devices.length === 0) {
        this._showState('no-device', window.i18n.t('dashboard.no_device'), window.i18n.t('dashboard.connect_msg'));
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
      this._showState('no-device', window.i18n.t('dashboard.conn_error'), err.message || window.i18n.t('term.unknown_error'));
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
      if (titleEl) titleEl.textContent = window.i18n.t('dashboard.running_on_android');
      if (msgEl) msgEl.textContent = window.i18n.t('dashboard.android_desc');
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
        if (titleEl) titleEl.textContent = window.i18n.t('dashboard.scanning');
        if (msgEl) msgEl.textContent = window.i18n.t('dashboard.scanning_msg');
      } else {
        if (spinner) spinner.style.display = 'none';
        if (titleEl) titleEl.textContent = title || window.i18n.t('dashboard.no_device');
        if (msgEl) msgEl.textContent = msg || window.i18n.t('dashboard.connect_msg');
      }
    }
  }


  async _loadDeviceInfo(serial) {
    let result;
    try {
      result = await loading.wrap(
        () => window.api.adb.getDeviceInfo(serial),
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
    this._setText('dash-name',    info.deviceName || info.brand || window.i18n.t('dashboard.unknown'));
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
    this._setText('dash-battery-health', `${window.i18n.t('dashboard.health')}: ${info.batteryHealth || 'N/A'}`);
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
      [window.i18n.t('dashboard.brand'),        info.brand],
      [window.i18n.t('dashboard.manufacturer'), info.manufacturer],
      [window.i18n.t('dashboard.build_number'), info.buildNumber],
      [window.i18n.t('dashboard.sdk_version'),  info.sdkVersion],
    ];
    const buildRight = [
      [window.i18n.t('dashboard.cpu_abi'),      info.cpuAbi],
      [window.i18n.t('dashboard.screen_dpi'),   info.screenDensity ? `${info.screenDensity} dpi` : 'N/A'],
      [window.i18n.t('dashboard.battery_volt'), info.batteryVoltage],
      [window.i18n.t('dashboard.power_source'), info.powerSource],
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
    if (!serial) { toast.warning(window.i18n.t('dashboard.no_device_selected')); return; }

    try {
      if (action === 'screenshot') {
        const result = await loading.wrap(() => window.api.adb.screenshot(serial), window.i18n.t('dashboard.capturing_screenshot'));
        result.success ? toast.success(window.i18n.t('dashboard.screenshot_saved')) : toast.error(window.i18n.t('dashboard.screenshot_failed'), result.error);
      } else if (action === 'reboot') {
        const ok = await modal.confirm({ title: window.i18n.t('dashboard.reboot'), message: window.i18n.t('dashboard.reboot_normal'), confirmType: 'primary' });
        if (ok) { await window.api.adb.reboot(serial, ''); toast.info(window.i18n.t('dashboard.rebooting')); }
      } else if (action === 'recovery') {
        const ok = await modal.confirm({ title: window.i18n.t('dashboard.recovery'), message: window.i18n.t('dashboard.reboot_recovery_msg'), confirmType: 'warning' });
        if (ok) { await window.api.adb.reboot(serial, 'recovery'); toast.info(window.i18n.t('dashboard.rebooting_recovery')); }
      } else if (action === 'bootloader') {
        const ok = await modal.confirm({ title: window.i18n.t('dashboard.bootloader'), message: window.i18n.t('dashboard.reboot_bootloader_msg'), confirmType: 'danger', confirmText: window.i18n.t('dashboard.reboot') });
        if (ok) { await window.api.adb.reboot(serial, 'bootloader'); toast.info(window.i18n.t('dashboard.rebooting_bootloader')); }
      }
    } catch (err) {
      toast.error(window.i18n.t('dashboard.action_failed'), err.message);
    }
  }

  _updateTexts() {
    document.querySelectorAll('#main-content [data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = window.i18n.t(key);
    });
    // Triggers reload of dynamic text
    if (appState.currentDevice) {
      this._loadDeviceInfo(appState.currentDevice.serial);
    }
  }

  destroy() {
    clearInterval(this.refreshTimer);
  }
}

window.DashboardPage = DashboardPage;
