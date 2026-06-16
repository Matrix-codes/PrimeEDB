/**
 * PrimeADB Settings Page (Android Edition)
 * Removed: file picker (Electron-only), export to file, ADB path browser.
 * Added: localStorage-backed save, About section updated for Android.
 */

class SettingsPage {
  constructor() {
    this.settings = {};
  }

  render(container) {
    const isAndroid = !!window.IS_ANDROID;

    container.innerHTML = `
      <div class="page-enter">
        <div class="page-title"><span class="title-icon">⚙️</span> Settings</div>

        ${isAndroid ? `
        <!-- Android Mode Info Banner -->
        <div class="android-info-banner" style="margin-bottom:var(--space-5);">
          <span class="android-info-banner-icon">📱</span>
          <div class="android-info-banner-body">
            <h4>Android Mode Active</h4>
            <p>PrimeADB is running on your Android device. ADB commands require the <strong>desktop app</strong> — download it free at <a href="#" onclick="window.open('https://github.com/primeadb','_blank'); return false;">github.com/primeadb</a>.</p>
          </div>
        </div>` : ''}

        <!-- Device Polling Settings -->
        <div class="card" style="margin-bottom:var(--space-5);">
          <div class="section-header"><span class="section-title">📱 Device Settings</span></div>
          <div class="form-field">
            <label class="form-label">Device Refresh Interval (ms)</label>
            <input type="number" id="setting-refresh-interval" min="3000" max="60000" step="1000" style="max-width:160px;" />
            <div class="form-hint">How often to check for connected devices (milliseconds). Min: 3000ms.</div>
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

        <!-- Appearance -->
        <div class="card" style="margin-bottom:var(--space-5);">
          <div class="section-header"><span class="section-title">🎨 Appearance</span></div>
          <div class="form-field">
            <label class="form-label">Log Level</label>
            <select id="setting-log-level" style="max-width:160px;">
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        ${!isAndroid ? `
        <!-- ADB Paths (Desktop only) -->
        <div class="card" style="margin-bottom:var(--space-5);">
          <div class="section-header"><span class="section-title">🔧 ADB & Fastboot Paths</span></div>
          <p class="text-muted text-sm" style="margin-bottom:var(--space-4);">
            By default, PrimeADB uses system PATH. Set custom paths if platform-tools are elsewhere.
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
        </div>` : ''}

        <!-- Actions -->
        <div class="card" style="margin-bottom:var(--space-5);">
          <div class="section-header"><span class="section-title">🛠️ Actions</span></div>
          <div class="btn-group">
            <button class="btn btn-primary" id="settings-save">💾 Save Settings</button>
            <button class="btn btn-danger" id="settings-reset">🔄 Reset to Defaults</button>
          </div>
        </div>

        <!-- About -->
        <div class="card" style="text-align:center;">
          <div style="font-size:2.5rem; margin-bottom:var(--space-3);">🤖</div>
          <h2 style="background:linear-gradient(135deg, var(--color-primary), var(--color-secondary));
                     -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;">
            PrimeADB v1.0.0
          </h2>
          <p class="text-muted" style="margin-top:var(--space-2);">Professional Android Device Management Tool</p>
          <p class="text-muted text-sm" style="margin-top:var(--space-2);">
            Built with Capacitor · Android WebView · Vanilla JS
          </p>
          <p class="text-muted text-sm" style="margin-top:var(--space-1);">
            Android ${isAndroid ? '✓' : '—'} · Min SDK 29 (Android 10+)
          </p>
        </div>
      </div>
    `;

    this._loadSettings();
    this._bindEvents(container);
  }

  async _loadSettings() {
    try {
      this.settings = await window.primeADB.settings.get();
    } catch(e) {
      this.settings = {};
    }
    const s = this.settings;
    const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
    const setChk = (id, val) => { const el = document.getElementById(id); if(el) el.checked = val; };

    setVal('setting-refresh-interval', s.deviceRefreshInterval || 5000);
    setVal('setting-log-level', s.logLevel || 'info');
    setChk('setting-auto-reconnect', s.autoReconnectWireless !== false);

    // Desktop-only fields
    setVal('setting-adb-path', s.adbPath || 'adb');
    setVal('setting-fastboot-path', s.fastbootPath || 'fastboot');
  }

  _bindEvents(container) {
    // Desktop-only browse buttons
    container.querySelector('#setting-adb-browse')?.addEventListener('click', async () => {
      const result = await window.primeADB.settings.pickPath('Select ADB Executable');
      if (result.success) document.getElementById('setting-adb-path').value = result.path;
    });
    container.querySelector('#setting-fastboot-browse')?.addEventListener('click', async () => {
      const result = await window.primeADB.settings.pickPath('Select Fastboot Executable');
      if (result.success) document.getElementById('setting-fastboot-path').value = result.path;
    });

    container.querySelector('#settings-save')?.addEventListener('click', () => this._save());
    container.querySelector('#settings-reset')?.addEventListener('click', () => this._reset());
  }

  async _save() {
    const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : null; };
    const getChk = (id) => { const el = document.getElementById(id); return el ? el.checked : true; };

    const newSettings = {
      adbPath: getVal('setting-adb-path') || 'adb',
      fastbootPath: getVal('setting-fastboot-path') || 'fastboot',
      deviceRefreshInterval: parseInt(getVal('setting-refresh-interval')) || 5000,
      logLevel: getVal('setting-log-level') || 'info',
      autoReconnectWireless: getChk('setting-auto-reconnect'),
    };
    try {
      await window.primeADB.settings.set(newSettings);
      toast.success('Settings saved!');
    } catch(e) {
      toast.error('Save failed', e.message);
    }
  }

  async _reset() {
    const ok = await modal.confirm({
      title: 'Reset Settings',
      message: 'Reset all settings to defaults?',
      confirmType: 'danger',
      confirmText: 'Reset',
    });
    if (!ok) return;
    try {
      await window.primeADB.settings.reset();
      await this._loadSettings();
      toast.success('Settings reset to defaults');
    } catch(e) {
      toast.error('Reset failed', e.message);
    }
  }

  destroy() {}
}

window.SettingsPage = SettingsPage;
