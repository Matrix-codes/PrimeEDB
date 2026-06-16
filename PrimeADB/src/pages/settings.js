/**
 * PrimeADB Settings Page
 * Configure ADB/Fastboot paths, theme, and export settings.
 */

class SettingsPage {
  constructor() {
    this.settings = {};
  }

  render(container) {
    container.innerHTML = `
      <div class="page-enter">
        <div class="page-title"><span class="title-icon">⚙️</span> Settings</div>

        <!-- ADB Paths -->
        <div class="card" style="margin-bottom:var(--space-5);">
          <div class="section-header"><span class="section-title">🔧 ADB & Fastboot Paths</span></div>
          <p class="text-muted text-sm" style="margin-bottom:var(--space-4);">
            By default, PrimeADB uses system PATH. If you have platform-tools installed elsewhere, set the paths below.
          </p>
          <div class="form-field">
            <label class="form-label">ADB Executable Path</label>
            <div class="input-group">
              <input type="text" id="setting-adb-path" placeholder="adb (or full path)" />
              <button class="btn btn-secondary" id="setting-adb-browse">📂 Browse</button>
            </div>
            <div class="form-hint">Example: C:\\platform-tools\\adb.exe</div>
          </div>
          <div class="form-field">
            <label class="form-label">Fastboot Executable Path</label>
            <div class="input-group">
              <input type="text" id="setting-fastboot-path" placeholder="fastboot (or full path)" />
              <button class="btn btn-secondary" id="setting-fastboot-browse">📂 Browse</button>
            </div>
          </div>
        </div>

        <!-- Device Settings -->
        <div class="card" style="margin-bottom:var(--space-5);">
          <div class="section-header"><span class="section-title">📱 Device Settings</span></div>
          <div class="form-field">
            <label class="form-label">Device Refresh Interval (ms)</label>
            <input type="number" id="setting-refresh-interval" min="1000" max="30000" step="500" style="max-width:160px;" />
            <div class="form-hint">How often to check for connected devices (milliseconds)</div>
          </div>
          <div class="form-field">
            <label class="toggle-label">
              <div class="toggle">
                <input type="checkbox" id="setting-auto-reconnect">
                <div class="toggle-track"></div>
                <div class="toggle-thumb"></div>
              </div>
              <div>
                <div style="font-size:0.875rem; font-weight:500; color:var(--text-primary);">Auto-reconnect Wireless</div>
                <div class="form-hint" style="margin-top:0;">Automatically reconnect to saved wireless devices</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Logging -->
        <div class="card" style="margin-bottom:var(--space-5);">
          <div class="section-header"><span class="section-title">📝 Logging</span></div>
          <div class="form-field">
            <label class="form-label">Log Level</label>
            <select id="setting-log-level" style="max-width:160px;">
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div class="form-hint" style="margin-bottom:var(--space-3);">App logs are saved to <code style="background:var(--color-bg-hover); padding:2px 6px; border-radius:4px; font-family:var(--font-mono); font-size:0.8rem;">~/.primeadb/app.log</code></div>
        </div>

        <!-- Actions -->
        <div class="card">
          <div class="section-header"><span class="section-title">🛠️ Actions</span></div>
          <div class="btn-group">
            <button class="btn btn-primary" id="settings-save">💾 Save Settings</button>
            <button class="btn btn-secondary" id="settings-export">📤 Export Settings</button>
            <button class="btn btn-danger" id="settings-reset">🔄 Reset to Defaults</button>
          </div>
        </div>

        <!-- About -->
        <div class="card" style="margin-top:var(--space-5); text-align:center;">
          <div style="font-size:2.5rem; margin-bottom:var(--space-3);">🤖</div>
          <h2 style="background:linear-gradient(135deg, var(--color-primary), var(--color-secondary));
                     -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;">
            PrimeADB v1.0.0
          </h2>
          <p class="text-muted" style="margin-top:var(--space-2);">Professional Android Device Management Tool</p>
          <p class="text-muted text-sm" style="margin-top:var(--space-2);">Built with Electron.js · Node.js · Vanilla JS</p>
        </div>
      </div>
    `;

    this._loadSettings();
    this._bindEvents(container);
  }

  async _loadSettings() {
    this.settings = await window.primeADB.settings.get();
    document.getElementById('setting-adb-path').value = this.settings.adbPath || 'adb';
    document.getElementById('setting-fastboot-path').value = this.settings.fastbootPath || 'fastboot';
    document.getElementById('setting-refresh-interval').value = this.settings.deviceRefreshInterval || 3000;
    document.getElementById('setting-log-level').value = this.settings.logLevel || 'info';
    const autoReconnect = document.getElementById('setting-auto-reconnect');
    if (autoReconnect) autoReconnect.checked = this.settings.autoReconnectWireless !== false;
  }

  _bindEvents(container) {
    container.querySelector('#setting-adb-browse')?.addEventListener('click', async () => {
      const result = await window.primeADB.settings.pickPath('Select ADB Executable');
      if (result.success) document.getElementById('setting-adb-path').value = result.path;
    });

    container.querySelector('#setting-fastboot-browse')?.addEventListener('click', async () => {
      const result = await window.primeADB.settings.pickPath('Select Fastboot Executable');
      if (result.success) document.getElementById('setting-fastboot-path').value = result.path;
    });

    container.querySelector('#settings-save')?.addEventListener('click', () => this._save());
    container.querySelector('#settings-export')?.addEventListener('click', () => this._export());
    container.querySelector('#settings-reset')?.addEventListener('click', () => this._reset());
  }

  async _save() {
    const newSettings = {
      adbPath: document.getElementById('setting-adb-path')?.value.trim() || 'adb',
      fastbootPath: document.getElementById('setting-fastboot-path')?.value.trim() || 'fastboot',
      deviceRefreshInterval: parseInt(document.getElementById('setting-refresh-interval')?.value) || 3000,
      logLevel: document.getElementById('setting-log-level')?.value || 'info',
      autoReconnectWireless: document.getElementById('setting-auto-reconnect')?.checked ?? true,
    };
    await window.primeADB.settings.set(newSettings);
    toast.success('Settings saved!');
  }

  async _export() {
    const result = await window.primeADB.settings.export();
    result.success ? toast.success('Settings exported!', result.filePath) : toast.error('Export failed', result.error);
  }

  async _reset() {
    const ok = await modal.confirm({ title: 'Reset Settings', message: 'Reset all settings to defaults?', confirmType: 'danger', confirmText: 'Reset' });
    if (!ok) return;
    await window.primeADB.settings.reset();
    this._loadSettings();
    toast.success('Settings reset to defaults');
  }

  destroy() {}
}

window.SettingsPage = SettingsPage;
