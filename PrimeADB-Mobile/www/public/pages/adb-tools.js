/**
 * PrimeADB ADB Tools Page
 * Comprehensive ADB command execution and device management tools.
 */

class AdbToolsPage {
  constructor() {
    this.serial = null;
    this.isRecording = false;
    this.packages = [];
  }

  render(container) {
    container.innerHTML = `
      <div class="page-enter">
        <div class="page-title">
          <span class="title-icon">🔧</span>
          ADB Tools
        </div>

        <!-- Device Selector -->
        <div class="card" style="margin-bottom:var(--space-5); padding:var(--space-3) var(--space-4);">
          <div class="flex items-center gap-4">
            <span class="text-muted text-sm" data-i18n="adb.device">${window.i18n.t('adb.device')}</span>
            <select id="adb-device-select" style="max-width:300px; flex:1;"></select>
            <button class="btn btn-secondary btn-sm" id="adb-refresh-devices">🔄</button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button class="tab-btn active" data-tab="commands">Commands</button>
          <button class="tab-btn" data-tab="reboot">Reboot</button>
          <button class="tab-btn" data-tab="capture">Capture</button>
          <button class="tab-btn" data-tab="apk">APK Manager</button>
          <button class="tab-btn" data-tab="files">File Transfer</button>
        </div>

        <!-- Tab: Commands -->
        <div id="tab-commands" class="tab-content">
          <div class="card" style="margin-bottom:var(--space-4);">
            <div class="section-header"><span class="section-title">💬 Custom ADB Command</span></div>
            <div class="input-group" style="margin-bottom:var(--space-3);">
              <input type="text" id="adb-cmd-input" placeholder="${window.i18n.t('adb.cmd_placeholder')}" data-i18n-placeholder="adb.cmd_placeholder" />
              <button class="btn btn-primary" id="adb-cmd-run">▶ Run</button>
            </div>
            <div class="output-box" id="adb-cmd-output" style="min-height:120px;">${window.i18n.t('adb.cmd_ready')}</div>
          </div>

          <div class="card">
            <div class="section-header"><span class="section-title">⚡ Shell Command</span></div>
            <div class="input-group" style="margin-bottom:var(--space-3);">
              <input type="text" id="adb-shell-input" placeholder="${window.i18n.t('adb.shell_placeholder')}" data-i18n-placeholder="adb.shell_placeholder" />
              <button class="btn btn-primary" id="adb-shell-run">▶ Shell</button>
            </div>
            <div class="output-box" id="adb-shell-output" style="min-height:80px;">${window.i18n.t('adb.shell_ready')}</div>
          </div>
        </div>

        <!-- Tab: Reboot -->
        <div id="tab-reboot" class="tab-content hidden">
          <div class="grid-3">
            <div class="card" style="text-align:center;">
              <div style="font-size:2rem; margin-bottom:var(--space-3);">🔄</div>
              <h3 style="margin-bottom:var(--space-2);">${window.i18n.t('adb.reboot_normal')}</h3>
              <p style="font-size:0.8rem; margin-bottom:var(--space-4);">${window.i18n.t('adb.reboot_normal_desc')}</p>
              <button class="btn btn-primary w-full" id="reboot-normal">Reboot</button>
            </div>
            <div class="card" style="text-align:center;">
              <div style="font-size:2rem; margin-bottom:var(--space-3);">🛡️</div>
              <h3 style="margin-bottom:var(--space-2);">${window.i18n.t('adb.reboot_recovery')}</h3>
              <p style="font-size:0.8rem; margin-bottom:var(--space-4);">${window.i18n.t('adb.reboot_recovery_desc')}</p>
              <button class="btn btn-warning w-full" id="reboot-recovery">Reboot to Recovery</button>
            </div>
            <div class="card" style="text-align:center;">
              <div style="font-size:2rem; margin-bottom:var(--space-3);">⚡</div>
              <h3 style="margin-bottom:var(--space-2);">${window.i18n.t('adb.reboot_bootloader')}</h3>
              <p style="font-size:0.8rem; margin-bottom:var(--space-4);">${window.i18n.t('adb.reboot_bootloader_desc')}</p>
              <button class="btn btn-danger w-full" id="reboot-bootloader">Reboot to ${window.i18n.t('adb.reboot_bootloader')}</button>
            </div>
          </div>
        </div>

        <!-- Tab: Capture -->
        <div id="tab-capture" class="tab-content hidden">
          <div class="grid-2">
            <div class="card">
              <div class="section-header"><span class="section-title">📸 <span data-i18n="adb.screenshot">${window.i18n.t('adb.screenshot')}</span></span></div>
              <p style="font-size:0.85rem; margin-bottom:var(--space-4);">${window.i18n.t('adb.screenshot_desc')}</p>
              <button class="btn btn-primary" id="capture-screenshot">📸 Take Screenshot</button>
            </div>
            <div class="card">
              <div class="section-header">
                <span class="section-title">🎥 <span data-i18n="adb.screen_record">${window.i18n.t('adb.screen_record')}</span></span>
                <span class="badge badge-neutral" id="record-status-badge">Idle</span>
              </div>
              <p style="font-size:0.85rem; margin-bottom:var(--space-4);">${window.i18n.t('adb.record_desc')}</p>
              <div class="btn-group">
                <button class="btn btn-danger" id="capture-record-start">🔴 Start Recording</button>
                <button class="btn btn-secondary" id="capture-record-stop" disabled>⏹ Stop & Save</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: APK Manager -->
        <div id="tab-apk" class="tab-content hidden">
          <div class="card" style="margin-bottom:var(--space-4);">
            <div class="section-header"><span class="section-title">📦 <span data-i18n="adb.install_uninstall">${window.i18n.t('adb.install_uninstall')}</span></span></div>
            <div class="btn-group">
              <button class="btn btn-primary" id="apk-install">📥 Install APK</button>
            </div>
          </div>

          <div class="card">
            <div class="section-header">
              <span class="section-title">📋 Installed Apps</span>
              <div class="flex items-center gap-2">
                <select id="pkg-filter" style="width:130px; font-size:0.8rem;">
                  <option value="">All Apps</option>
                  <option value="user">User Apps</option>
                  <option value="system" data-i18n="adb.system_apps">${window.i18n.t('adb.system_apps')}</option>
                </select>
                <input type="text" id="pkg-search" placeholder="${window.i18n.t('adb.search')}" data-i18n-placeholder="adb.search" style="width:160px;" />
                <button class="btn btn-secondary btn-sm" id="pkg-load">Load</button>
              </div>
            </div>
            <div id="pkg-list" style="max-height:380px; overflow-y:auto;">
              <div class="empty-state"><div class="empty-icon">📦</div><h3>${window.i18n.t('adb.click_load')}</h3></div>
            </div>
          </div>
        </div>

        <!-- Tab: File Transfer -->
        <div id="tab-files" class="tab-content hidden">
          <div class="grid-2">
            <div class="card">
              <div class="section-header"><span class="section-title">📥 Pull File from Device</span></div>
              <div class="form-field">
                <label class="form-label" data-i18n="adb.device_path">${window.i18n.t('adb.device_path')}</label>
                <input type="text" id="pull-path" placeholder="/sdcard/DCIM/photo.jpg" />
              </div>
              <button class="btn btn-primary" id="pull-btn">📥 Pull File</button>
            </div>
            <div class="card">
              <div class="section-header"><span class="section-title">📤 Push File to Device</span></div>
              <div class="form-field">
                <label class="form-label" data-i18n="adb.device_dest">${window.i18n.t('adb.device_dest')}</label>
                <input type="text" id="push-path" placeholder="/sdcard/" />
              </div>
              <button class="btn btn-primary" id="push-btn">📤 Push File</button>
            </div>
          </div>
          <div class="card" style="margin-top:var(--space-4);">
            <div class="section-header"><span class="section-title">📋 Transfer Output</span></div>
            <div class="output-box" id="transfer-output" style="min-height:100px;">${window.i18n.t('adb.transfer_ready')}</div>
          </div>
        </div>
      </div>
    `;

    this._bindEvents(container);
    this._loadDevices();
  }

  _bindEvents(container) {
    // Tabs
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        container.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
        btn.classList.add('active');
        container.querySelector(`#tab-${btn.dataset.tab}`)?.classList.remove('hidden');
      });
    });

    // Device
    container.querySelector('#adb-refresh-devices')?.addEventListener('click', () => this._loadDevices());
    container.querySelector('#adb-device-select')?.addEventListener('change', e => { this.serial = e.target.value; });

    // Commands
    container.querySelector('#adb-cmd-run')?.addEventListener('click', () => this._runCommand());
    container.querySelector('#adb-cmd-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') this._runCommand(); });
    container.querySelector('#adb-shell-run')?.addEventListener('click', () => this._runShell());
    container.querySelector('#adb-shell-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') this._runShell(); });

    // Reboot
    container.querySelector('#reboot-normal')?.addEventListener('click', () => this._reboot(''));
    container.querySelector('#reboot-recovery')?.addEventListener('click', () => this._reboot('recovery'));
    container.querySelector('#reboot-bootloader')?.addEventListener('click', () => this._reboot('bootloader'));

    // Capture
    container.querySelector('#capture-screenshot')?.addEventListener('click', () => this._screenshot());
    container.querySelector('#capture-record-start')?.addEventListener('click', () => this._startRecord());
    container.querySelector('#capture-record-stop')?.addEventListener('click', () => this._stopRecord());

    // APK
    container.querySelector('#apk-install')?.addEventListener('click', () => this._installApk());
    container.querySelector('#pkg-load')?.addEventListener('click', () => this._loadPackages());
    container.querySelector('#pkg-search')?.addEventListener('input', e => this._filterPackages(e.target.value));

    // File Transfer
    container.querySelector('#pull-btn')?.addEventListener('click', () => this._pull());
    container.querySelector('#push-btn')?.addEventListener('click', () => this._push());
  }

  async _loadDevices() {
    const result = await window.api.adb.getDevices();
    const sel = document.getElementById('adb-device-select');
    if (!sel) return;
    if (!result.success || !result.devices.length) {
      sel.innerHTML = '<option value="">No devices found</option>';
      this.serial = null;
      return;
    }
    sel.innerHTML = result.devices.map(d => `<option value="${d.serial}">${d.serial}</option>`).join('');
    this.serial = result.devices[0].serial;
  }

  async _runCommand() {
    const input = document.getElementById('adb-cmd-input');
    const output = document.getElementById('adb-cmd-output');
    if (!input?.value.trim()) return;
    output.textContent = 'Running...';
    const result = await window.api.adb.exec(this.serial, input.value.trim());
    output.innerHTML = `<span class="output-cmd">$ adb ${input.value.trim()}</span>\n${result.success ? result.output || '(no output)' : `<span class="output-error">${result.error}</span>`}`;
  }

  async _runShell() {
    const input = document.getElementById('adb-shell-input');
    const output = document.getElementById('adb-shell-output');
    if (!input?.value.trim()) return;
    output.textContent = 'Running...';
    const result = await window.api.adb.shell(this.serial, input.value.trim());
    output.innerHTML = `<span class="output-cmd">$ adb shell ${input.value.trim()}</span>\n${result.success ? result.output || '(no output)' : `<span class="output-error">${result.error}</span>`}`;
  }

  async _reboot(mode) {
    if (!this.serial) { toast.warning('No device selected'); return; }
    const labels = { '': 'reboot normally', recovery: 'reboot to recovery', bootloader: 'reboot to bootloader' };
    const ok = await modal.confirm({ title: window.i18n.t('adb.confirm_reboot'), message: `Are you sure you want to ${labels[mode]}?`, confirmType: mode === 'bootloader' ? 'danger' : 'primary' });
    if (!ok) return;
    await window.api.adb.reboot(this.serial, mode);
    toast.info('Reboot command sent');
  }

  async _screenshot() {
    if (!this.serial) { toast.warning('No device selected'); return; }
    const result = await loading.wrap(() => window.api.adb.screenshot(this.serial), 'Capturing screenshot...');
    result.success ? toast.success('Screenshot saved!') : toast.error('Screenshot failed', result.error);
  }

  async _startRecord() {
    if (!this.serial) { toast.warning('No device selected'); return; }
    this.isRecording = true;
    document.getElementById('capture-record-start').disabled = true;
    document.getElementById('capture-record-stop').disabled = false;
    document.getElementById('record-status-badge').textContent = '● Recording';
    document.getElementById('record-status-badge').className = 'badge badge-danger';
    const result = await window.api.adb.screenRecordStart(this.serial);
    if (!result.success) {
      this.isRecording = false;
      toast.error(window.i18n.t('adb.failed_start_record'), result.error);
    }
  }

  async _stopRecord() {
    this.isRecording = false;
    document.getElementById('capture-record-start').disabled = false;
    document.getElementById('capture-record-stop').disabled = true;
    document.getElementById('record-status-badge').textContent = 'Idle';
    document.getElementById('record-status-badge').className = 'badge badge-neutral';
    const result = await loading.wrap(() => window.api.adb.screenRecordStop(this.serial), window.i18n.t('adb.saving_record'));
    result.success ? toast.success('Recording saved!') : toast.error(window.i18n.t('adb.failed_save_record'), result.error);
  }

  async _installApk() {
    if (!this.serial) { toast.warning('No device selected'); return; }
    const result = await loading.wrap(() => window.api.adb.installApk(this.serial), window.i18n.t('adb.installing_apk'));
    result.success ? toast.success('APK installed!', result.output) : toast.error(window.i18n.t('adb.install_failed'), result.error);
  }

  async _loadPackages() {
    if (!this.serial) { toast.warning('No device selected'); return; }
    const filter = document.getElementById('pkg-filter')?.value;
    const result = await loading.wrap(() => window.api.adb.listPackages(this.serial, filter), window.i18n.t('adb.loading_packages'));
    if (!result.success) { toast.error(window.i18n.t('adb.failed_list_packages'), result.error); return; }
    this.packages = result.packages;
    this._renderPackages(this.packages);
  }

  _renderPackages(pkgs) {
    const el = document.getElementById('pkg-list');
    if (!el) return;
    if (!pkgs.length) {
      el.innerHTML = '<div class="empty-state"><div class="empty-icon">📦</div><h3>No packages found</h3></div>';
      return;
    }
    el.innerHTML = `<div class="table-container"><table>
      <thead><tr><th data-i18n="adb.package_name">${window.i18n.t('adb.package_name')}</th><th data-i18n="adb.actions">${window.i18n.t('adb.actions')}</th></tr></thead>
      <tbody>${pkgs.map(pkg => `
        <tr>
          <td class="font-mono" style="font-size:0.8rem;">${pkg}</td>
          <td style="width:180px;">
            <div class="btn-group">
              <button class="btn btn-secondary btn-sm" onclick="window.adbToolsPage._clearData('${pkg}')">${window.i18n.t('adb.clear_data')}</button>
              <button class="btn btn-danger btn-sm" onclick="window.adbToolsPage._uninstall('${pkg}')">${window.i18n.t('adb.uninstall')}</button>
            </div>
          </td>
        </tr>`).join('')}
      </tbody>
    </table></div>`;
  }

  _filterPackages(query) {
    const filtered = query ? this.packages.filter(p => p.includes(query.toLowerCase())) : this.packages;
    this._renderPackages(filtered);
  }

  async _clearData(pkg) {
    const ok = await modal.confirm({ title: window.i18n.t('adb.clear_app_data'), message: window.i18n.t('adb.clear_app_data_msg', { pkg }), confirmType: 'danger', confirmText: 'Clear' });
    if (!ok) return;
    const result = await loading.wrap(() => window.api.adb.clearAppData(this.serial, pkg), window.i18n.t('adb.clearing_data'));
    result.success ? toast.success('App data cleared') : toast.error(window.i18n.t('adb.failed_clear_data'), result.error);
  }

  async _uninstall(pkg) {
    const ok = await modal.confirm({ title: window.i18n.t('adb.uninstall_app'), message: window.i18n.t('adb.uninstall_msg', { pkg }), confirmType: 'danger', confirmText: 'Uninstall' });
    if (!ok) return;
    const result = await loading.wrap(() => window.api.adb.uninstallApk(this.serial, pkg), window.i18n.t('adb.uninstalling'));
    if (result.success) {
      toast.success(window.i18n.t('adb.app_uninstalled'));
      this.packages = this.packages.filter(p => p !== pkg);
      this._renderPackages(this.packages);
    } else {
      toast.error(window.i18n.t('adb.uninstall_failed'), result.error);
    }
  }

  async _pull() {
    if (!this.serial) { toast.warning('No device selected'); return; }
    const devicePath = document.getElementById('pull-path')?.value.trim();
    if (!devicePath) { toast.warning(window.i18n.t('adb.enter_device_path')); return; }
    const output = document.getElementById('transfer-output');
    output.textContent = window.i18n.t('adb.pulling');
    const result = await window.api.adb.pull(this.serial, devicePath);
    output.innerHTML = result.success ? `<span class="output-success">✓ ${result.output}</span>` : `<span class="output-error">✗ ${result.error}</span>`;
    result.success ? toast.success('File pulled!') : toast.error(window.i18n.t('adb.pull_failed'), result.error);
  }

  async _push() {
    if (!this.serial) { toast.warning('No device selected'); return; }
    const devicePath = document.getElementById('push-path')?.value.trim() || '/sdcard/';
    const output = document.getElementById('transfer-output');
    output.textContent = window.i18n.t('adb.pushing');
    const result = await window.api.adb.push(this.serial, devicePath);
    output.innerHTML = result.success ? `<span class="output-success">✓ ${result.output}</span>` : `<span class="output-error">✗ ${result.error}</span>`;
    result.success ? toast.success('File pushed!') : toast.error(window.i18n.t('adb.push_failed'), result.error);
  }

  _updateTexts() {
    document.querySelectorAll('#main-content [data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = window.i18n.t(key);
    });
  }

  destroy() {}
}

window.AdbToolsPage = AdbToolsPage;
