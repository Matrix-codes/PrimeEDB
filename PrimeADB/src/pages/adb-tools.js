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
            <span class="text-muted text-sm">Device:</span>
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
              <input type="text" id="adb-cmd-input" placeholder="e.g. shell pm list packages" />
              <button class="btn btn-primary" id="adb-cmd-run">▶ Run</button>
            </div>
            <div class="output-box" id="adb-cmd-output" style="min-height:120px;">Ready. Enter a command and press Run.</div>
          </div>

          <div class="card">
            <div class="section-header"><span class="section-title">⚡ Shell Command</span></div>
            <div class="input-group" style="margin-bottom:var(--space-3);">
              <input type="text" id="adb-shell-input" placeholder="e.g. getprop ro.product.model" />
              <button class="btn btn-primary" id="adb-shell-run">▶ Shell</button>
            </div>
            <div class="output-box" id="adb-shell-output" style="min-height:80px;">Shell output will appear here.</div>
          </div>
        </div>

        <!-- Tab: Reboot -->
        <div id="tab-reboot" class="tab-content hidden">
          <div class="grid-3">
            <div class="card" style="text-align:center;">
              <div style="font-size:2rem; margin-bottom:var(--space-3);">🔄</div>
              <h3 style="margin-bottom:var(--space-2);">Normal Reboot</h3>
              <p style="font-size:0.8rem; margin-bottom:var(--space-4);">Restart the device normally</p>
              <button class="btn btn-primary w-full" id="reboot-normal">Reboot</button>
            </div>
            <div class="card" style="text-align:center;">
              <div style="font-size:2rem; margin-bottom:var(--space-3);">🛡️</div>
              <h3 style="margin-bottom:var(--space-2);">Recovery Mode</h3>
              <p style="font-size:0.8rem; margin-bottom:var(--space-4);">Boot into recovery partition</p>
              <button class="btn btn-warning w-full" id="reboot-recovery">Reboot to Recovery</button>
            </div>
            <div class="card" style="text-align:center;">
              <div style="font-size:2rem; margin-bottom:var(--space-3);">⚡</div>
              <h3 style="margin-bottom:var(--space-2);">Bootloader</h3>
              <p style="font-size:0.8rem; margin-bottom:var(--space-4);">Boot into fastboot / EDL mode</p>
              <button class="btn btn-danger w-full" id="reboot-bootloader">Reboot to Bootloader</button>
            </div>
          </div>
        </div>

        <!-- Tab: Capture -->
        <div id="tab-capture" class="tab-content hidden">
          <div class="grid-2">
            <div class="card">
              <div class="section-header"><span class="section-title">📸 Screenshot</span></div>
              <p style="font-size:0.85rem; margin-bottom:var(--space-4);">Capture the current screen of the connected device.</p>
              <button class="btn btn-primary" id="capture-screenshot">📸 Take Screenshot</button>
            </div>
            <div class="card">
              <div class="section-header">
                <span class="section-title">🎥 Screen Record</span>
                <span class="badge badge-neutral" id="record-status-badge">Idle</span>
              </div>
              <p style="font-size:0.85rem; margin-bottom:var(--space-4);">Record the device screen to MP4.</p>
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
            <div class="section-header"><span class="section-title">📦 Install / Uninstall APK</span></div>
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
                  <option value="system">System Apps</option>
                </select>
                <input type="text" id="pkg-search" placeholder="Search..." style="width:160px;" />
                <button class="btn btn-secondary btn-sm" id="pkg-load">Load</button>
              </div>
            </div>
            <div id="pkg-list" style="max-height:380px; overflow-y:auto;">
              <div class="empty-state"><div class="empty-icon">📦</div><h3>Click "Load" to list packages</h3></div>
            </div>
          </div>
        </div>

        <!-- Tab: File Transfer -->
        <div id="tab-files" class="tab-content hidden">
          <div class="grid-2">
            <div class="card">
              <div class="section-header"><span class="section-title">📥 Pull File from Device</span></div>
              <div class="form-field">
                <label class="form-label">Device Path</label>
                <input type="text" id="pull-path" placeholder="/sdcard/DCIM/photo.jpg" />
              </div>
              <button class="btn btn-primary" id="pull-btn">📥 Pull File</button>
            </div>
            <div class="card">
              <div class="section-header"><span class="section-title">📤 Push File to Device</span></div>
              <div class="form-field">
                <label class="form-label">Device Destination</label>
                <input type="text" id="push-path" placeholder="/sdcard/" />
              </div>
              <button class="btn btn-primary" id="push-btn">📤 Push File</button>
            </div>
          </div>
          <div class="card" style="margin-top:var(--space-4);">
            <div class="section-header"><span class="section-title">📋 Transfer Output</span></div>
            <div class="output-box" id="transfer-output" style="min-height:100px;">Transfer output will appear here.</div>
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
    const result = await window.primeADB.adb.getDevices();
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
    const result = await window.primeADB.adb.exec(this.serial, input.value.trim());
    output.innerHTML = `<span class="output-cmd">$ adb ${input.value.trim()}</span>\n${result.success ? result.output || '(no output)' : `<span class="output-error">${result.error}</span>`}`;
  }

  async _runShell() {
    const input = document.getElementById('adb-shell-input');
    const output = document.getElementById('adb-shell-output');
    if (!input?.value.trim()) return;
    output.textContent = 'Running...';
    const result = await window.primeADB.adb.shell(this.serial, input.value.trim());
    output.innerHTML = `<span class="output-cmd">$ adb shell ${input.value.trim()}</span>\n${result.success ? result.output || '(no output)' : `<span class="output-error">${result.error}</span>`}`;
  }

  async _reboot(mode) {
    if (!this.serial) { toast.warning('No device selected'); return; }
    const labels = { '': 'reboot normally', recovery: 'reboot to recovery', bootloader: 'reboot to bootloader' };
    const ok = await modal.confirm({ title: 'Confirm Reboot', message: `Are you sure you want to ${labels[mode]}?`, confirmType: mode === 'bootloader' ? 'danger' : 'primary' });
    if (!ok) return;
    await window.primeADB.adb.reboot(this.serial, mode);
    toast.info('Reboot command sent');
  }

  async _screenshot() {
    if (!this.serial) { toast.warning('No device selected'); return; }
    const result = await loading.wrap(() => window.primeADB.adb.screenshot(this.serial), 'Capturing screenshot...');
    result.success ? toast.success('Screenshot saved!') : toast.error('Screenshot failed', result.error);
  }

  async _startRecord() {
    if (!this.serial) { toast.warning('No device selected'); return; }
    this.isRecording = true;
    document.getElementById('capture-record-start').disabled = true;
    document.getElementById('capture-record-stop').disabled = false;
    document.getElementById('record-status-badge').textContent = '● Recording';
    document.getElementById('record-status-badge').className = 'badge badge-danger';
    const result = await window.primeADB.adb.screenRecordStart(this.serial);
    if (!result.success) {
      this.isRecording = false;
      toast.error('Failed to start recording', result.error);
    }
  }

  async _stopRecord() {
    this.isRecording = false;
    document.getElementById('capture-record-start').disabled = false;
    document.getElementById('capture-record-stop').disabled = true;
    document.getElementById('record-status-badge').textContent = 'Idle';
    document.getElementById('record-status-badge').className = 'badge badge-neutral';
    const result = await loading.wrap(() => window.primeADB.adb.screenRecordStop(this.serial), 'Saving recording...');
    result.success ? toast.success('Recording saved!') : toast.error('Failed to save recording', result.error);
  }

  async _installApk() {
    if (!this.serial) { toast.warning('No device selected'); return; }
    const result = await loading.wrap(() => window.primeADB.adb.installApk(this.serial), 'Installing APK...');
    result.success ? toast.success('APK installed!', result.output) : toast.error('Install failed', result.error);
  }

  async _loadPackages() {
    if (!this.serial) { toast.warning('No device selected'); return; }
    const filter = document.getElementById('pkg-filter')?.value;
    const result = await loading.wrap(() => window.primeADB.adb.listPackages(this.serial, filter), 'Loading packages...');
    if (!result.success) { toast.error('Failed to list packages', result.error); return; }
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
      <thead><tr><th>Package Name</th><th>Actions</th></tr></thead>
      <tbody>${pkgs.map(pkg => `
        <tr>
          <td class="font-mono" style="font-size:0.8rem;">${pkg}</td>
          <td style="width:180px;">
            <div class="btn-group">
              <button class="btn btn-secondary btn-sm" onclick="window.adbToolsPage._clearData('${pkg}')">Clear Data</button>
              <button class="btn btn-danger btn-sm" onclick="window.adbToolsPage._uninstall('${pkg}')">Uninstall</button>
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
    const ok = await modal.confirm({ title: 'Clear App Data', message: `Clear all data for <b>${pkg}</b>? This cannot be undone.`, confirmType: 'danger', confirmText: 'Clear' });
    if (!ok) return;
    const result = await loading.wrap(() => window.primeADB.adb.clearAppData(this.serial, pkg), 'Clearing data...');
    result.success ? toast.success('App data cleared') : toast.error('Failed to clear data', result.error);
  }

  async _uninstall(pkg) {
    const ok = await modal.confirm({ title: 'Uninstall App', message: `Uninstall <b>${pkg}</b>?`, confirmType: 'danger', confirmText: 'Uninstall' });
    if (!ok) return;
    const result = await loading.wrap(() => window.primeADB.adb.uninstallApk(this.serial, pkg), 'Uninstalling...');
    if (result.success) {
      toast.success('App uninstalled');
      this.packages = this.packages.filter(p => p !== pkg);
      this._renderPackages(this.packages);
    } else {
      toast.error('Uninstall failed', result.error);
    }
  }

  async _pull() {
    if (!this.serial) { toast.warning('No device selected'); return; }
    const devicePath = document.getElementById('pull-path')?.value.trim();
    if (!devicePath) { toast.warning('Enter a device path'); return; }
    const output = document.getElementById('transfer-output');
    output.textContent = 'Pulling...';
    const result = await window.primeADB.adb.pull(this.serial, devicePath);
    output.innerHTML = result.success ? `<span class="output-success">✓ ${result.output}</span>` : `<span class="output-error">✗ ${result.error}</span>`;
    result.success ? toast.success('File pulled!') : toast.error('Pull failed', result.error);
  }

  async _push() {
    if (!this.serial) { toast.warning('No device selected'); return; }
    const devicePath = document.getElementById('push-path')?.value.trim() || '/sdcard/';
    const output = document.getElementById('transfer-output');
    output.textContent = 'Pushing...';
    const result = await window.primeADB.adb.push(this.serial, devicePath);
    output.innerHTML = result.success ? `<span class="output-success">✓ ${result.output}</span>` : `<span class="output-error">✗ ${result.error}</span>`;
    result.success ? toast.success('File pushed!') : toast.error('Push failed', result.error);
  }

  destroy() {}
}

window.AdbToolsPage = AdbToolsPage;
