/**
 * PrimeADB Fastboot Page
 * Fastboot device detection, flashing, and variable inspection.
 */

class FastbootPage {
  constructor() {
    this.serial = null;
    this.variables = '';
  }

  render(container) {
    container.innerHTML = `
      <div class="page-enter">
        <div class="page-title"><span class="title-icon">⚡</span> Fastboot Tools</div>

        <!-- Warning Banner -->
        <div class="card" style="margin-bottom:var(--space-5); border-color:var(--color-warning); background:rgba(245,158,11,0.05);">
          <div class="flex items-center gap-3">
            <span style="font-size:1.4rem;">⚠️</span>
            <div>
              <div style="font-weight:600; color:var(--color-warning);">Fastboot Mode Required</div>
              <div class="text-muted text-sm">Device must be booted into fastboot/bootloader mode for these operations. Incorrect flashing can brick your device.</div>
            </div>
          </div>
        </div>

        <!-- Device Detection -->
        <div class="card" style="margin-bottom:var(--space-5);">
          <div class="section-header">
            <span class="section-title">📡 Fastboot Devices</span>
            <button class="btn btn-secondary btn-sm" id="fb-refresh">🔄 Refresh</button>
          </div>
          <div id="fb-device-list">
            <div class="empty-state" style="padding: var(--space-6);">
              <div class="empty-icon">📵</div>
              <h3>No Fastboot Devices</h3>
              <p>Boot your device into fastboot mode first</p>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button class="tab-btn active" data-tab="flash">Flash Partitions</button>
          <button class="tab-btn" data-tab="vars">Device Variables</button>
          <button class="tab-btn" data-tab="reboot">Reboot Options</button>
          <button class="tab-btn" data-tab="custom">Custom Command</button>
        </div>

        <!-- Flash Tab -->
        <div id="ftab-flash" class="tab-content">
          <div class="grid-2">
            <div class="card" style="border-color: var(--color-danger); background:rgba(239,68,68,0.03);">
              <div class="section-header"><span class="section-title">🔴 Flash Partition</span></div>
              <div class="form-field">
                <label class="form-label">Partition</label>
                <select id="fb-partition-select" style="margin-bottom:0;">
                  <option value="boot">boot</option>
                  <option value="recovery">recovery</option>
                  <option value="system">system</option>
                  <option value="vendor">vendor</option>
                  <option value="dtbo">dtbo</option>
                  <option value="vbmeta">vbmeta</option>
                  <option value="userdata">userdata</option>
                  <option value="cache">cache</option>
                </select>
              </div>
              <button class="btn btn-danger w-full" id="fb-flash-btn" style="margin-top:var(--space-3);">⚡ Flash Partition</button>
            </div>
            <div class="card">
              <div class="section-header"><span class="section-title">🔓 Bootloader Unlock</span></div>
              <p class="text-muted" style="font-size:0.85rem; margin-bottom:var(--space-4);">
                Unlocking will WIPE all user data. Make sure you have a backup. Some devices require OEM unlock to be enabled in Developer Options first.
              </p>
              <button class="btn btn-danger w-full" id="fb-unlock-btn">🔓 Unlock Bootloader</button>
              <button class="btn btn-secondary w-full" id="fb-lock-btn" style="margin-top:var(--space-2);">🔒 Lock Bootloader</button>
            </div>
          </div>
          <div class="card" style="margin-top:var(--space-4);">
            <div class="section-header"><span class="section-title">📋 Flash Output</span></div>
            <div class="output-box" id="fb-flash-output" style="min-height:100px;">Flash output will appear here.</div>
          </div>
        </div>

        <!-- Variables Tab -->
        <div id="ftab-vars" class="tab-content hidden">
          <div class="card">
            <div class="section-header">
              <span class="section-title">📋 Device Variables</span>
              <button class="btn btn-primary btn-sm" id="fb-get-vars">Load Variables</button>
            </div>
            <div class="output-box" id="fb-vars-output" style="min-height:200px;">Click "Load Variables" to fetch device info.</div>
          </div>
        </div>

        <!-- Reboot Tab -->
        <div id="ftab-reboot" class="tab-content hidden">
          <div class="grid-3">
            <div class="card" style="text-align:center;">
              <div style="font-size:2.5rem; margin-bottom:var(--space-3);">📱</div>
              <h3 style="margin-bottom:var(--space-2);">Reboot to OS</h3>
              <p class="text-muted text-sm" style="margin-bottom:var(--space-4);">Boot normally into Android</p>
              <button class="btn btn-success w-full" id="fb-reboot-system">Reboot to System</button>
            </div>
            <div class="card" style="text-align:center;">
              <div style="font-size:2.5rem; margin-bottom:var(--space-3);">🔃</div>
              <h3 style="margin-bottom:var(--space-2);">Stay in Bootloader</h3>
              <p class="text-muted text-sm" style="margin-bottom:var(--space-4);">Reboot back into fastboot</p>
              <button class="btn btn-primary w-full" id="fb-reboot-fastboot">Reboot Bootloader</button>
            </div>
            <div class="card" style="text-align:center;">
              <div style="font-size:2.5rem; margin-bottom:var(--space-3);">🛡️</div>
              <h3 style="margin-bottom:var(--space-2);">Recovery Mode</h3>
              <p class="text-muted text-sm" style="margin-bottom:var(--space-4);">Boot into recovery partition</p>
              <button class="btn btn-warning w-full" id="fb-reboot-recovery">Reboot to Recovery</button>
            </div>
          </div>
        </div>

        <!-- Custom Command Tab -->
        <div id="ftab-custom" class="tab-content hidden">
          <div class="card">
            <div class="section-header"><span class="section-title">💬 Custom Fastboot Command</span></div>
            <div class="input-group" style="margin-bottom:var(--space-4);">
              <input type="text" id="fb-custom-cmd" placeholder="e.g. oem device-info" />
              <button class="btn btn-primary" id="fb-custom-run">▶ Run</button>
            </div>
            <div class="output-box" id="fb-custom-output" style="min-height:150px;">Output will appear here.</div>
          </div>
        </div>
      </div>
    `;

    this._bindEvents(container);
    this._refreshDevices();
  }

  _bindEvents(container) {
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        container.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
        btn.classList.add('active');
        container.querySelector(`#ftab-${btn.dataset.tab}`)?.classList.remove('hidden');
      });
    });

    container.querySelector('#fb-refresh')?.addEventListener('click', () => this._refreshDevices());
    container.querySelector('#fb-flash-btn')?.addEventListener('click', () => this._flash());
    container.querySelector('#fb-unlock-btn')?.addEventListener('click', () => this._unlock());
    container.querySelector('#fb-lock-btn')?.addEventListener('click', () => this._lock());
    container.querySelector('#fb-get-vars')?.addEventListener('click', () => this._getVars());
    container.querySelector('#fb-reboot-system')?.addEventListener('click', () => this._reboot(''));
    container.querySelector('#fb-reboot-fastboot')?.addEventListener('click', () => this._reboot('bootloader'));
    container.querySelector('#fb-reboot-recovery')?.addEventListener('click', () => this._reboot('recovery'));
    container.querySelector('#fb-custom-run')?.addEventListener('click', () => this._customCmd());
    container.querySelector('#fb-custom-cmd')?.addEventListener('keydown', e => { if (e.key === 'Enter') this._customCmd(); });
  }

  async _refreshDevices() {
    const result = await window.primeADB.fastboot.getDevices();
    const el = document.getElementById('fb-device-list');
    if (!el) return;

    if (!result.success || !result.devices.length) {
      el.innerHTML = `<div class="empty-state" style="padding: var(--space-6);">
        <div class="empty-icon">📵</div><h3>No Fastboot Devices</h3>
        <p>Boot your device into fastboot mode first (adb reboot bootloader)</p>
      </div>`;
      this.serial = null;
      return;
    }

    this.serial = result.devices[0].serial;
    el.innerHTML = `<div class="table-container"><table>
      <thead><tr><th>Serial</th><th>State</th><th>Select</th></tr></thead>
      <tbody>${result.devices.map(d => `
        <tr>
          <td class="font-mono">${d.serial}</td>
          <td><span class="badge badge-success">fastboot</span></td>
          <td><button class="btn btn-primary btn-sm" onclick="window.fastbootPage.serial='${d.serial}'; toast.success('Selected: ${d.serial}');">Select</button></td>
        </tr>`).join('')}
      </tbody>
    </table></div>`;
    toast.success('Fastboot device found!', `Serial: ${this.serial}`);
  }

  async _flash() {
    const partition = document.getElementById('fb-partition-select')?.value;
    const ok = await modal.confirm({
      title: '⚠️ Flash Partition',
      message: `You are about to flash the <b>${partition}</b> partition. This is DANGEROUS. Make sure you have the correct image file. Continue?`,
      confirmType: 'danger', confirmText: 'Flash'
    });
    if (!ok) return;
    const output = document.getElementById('fb-flash-output');
    output.textContent = 'Flashing...';
    const result = await loading.wrap(() => window.primeADB.fastboot.flash(this.serial, partition), `Flashing ${partition}...`);
    output.innerHTML = result.success
      ? `<span class="output-success">✓ Flash complete!\n${result.output}</span>`
      : `<span class="output-error">✗ Flash failed:\n${result.error}</span>`;
    result.success ? toast.success(`${partition} flashed!`) : toast.error('Flash failed', result.error);
  }

  async _unlock() {
    const ok = await modal.confirm({
      title: '⚠️ Unlock Bootloader',
      message: 'Unlocking will <b>WIPE ALL DATA</b> on the device. This action is irreversible. Are you absolutely sure?',
      confirmType: 'danger', confirmText: 'Unlock'
    });
    if (!ok) return;
    const result = await loading.wrap(() => window.primeADB.fastboot.unlock(this.serial), 'Unlocking bootloader...');
    result.success ? toast.success('Unlock command sent', result.output) : toast.error('Unlock failed', result.error);
  }

  async _lock() {
    const ok = await modal.confirm({ title: 'Lock Bootloader', message: 'Lock the bootloader?', confirmType: 'warning' });
    if (!ok) return;
    const result = await loading.wrap(() => window.primeADB.fastboot.exec(`flashing lock`), 'Locking...');
    result.success ? toast.success('Bootloader locked') : toast.error('Lock failed', result.error);
  }

  async _getVars() {
    const output = document.getElementById('fb-vars-output');
    output.textContent = 'Fetching variables...';
    const result = await loading.wrap(() => window.primeADB.fastboot.getVar(this.serial), 'Loading variables...');
    output.textContent = result.success ? result.output : result.error;
  }

  async _reboot(mode) {
    const result = await window.primeADB.fastboot.reboot(this.serial, mode);
    result.success ? toast.info('Reboot command sent') : toast.error('Reboot failed', result.error);
  }

  async _customCmd() {
    const cmd = document.getElementById('fb-custom-cmd')?.value.trim();
    if (!cmd) return;
    const output = document.getElementById('fb-custom-output');
    output.textContent = 'Running...';
    const result = await window.primeADB.fastboot.exec(cmd);
    output.innerHTML = `<span class="output-cmd">$ fastboot ${cmd}</span>\n${result.success ? result.output : `<span class="output-error">${result.error}</span>`}`;
  }

  destroy() {}
}

window.FastbootPage = FastbootPage;
