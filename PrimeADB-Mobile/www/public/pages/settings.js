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
        <div class="page-title"><span class="title-icon">⚙️</span> <span data-i18n="settings.title">${window.i18n.t('settings.title')}</span></div>

        ${isAndroid ? `
        <!-- Android Mode Info Banner -->
        <div class="android-info-banner" style="margin-bottom:var(--space-5);">
          <span class="android-info-banner-icon">📱</span>
          <div class="android-info-banner-body">
            <h4 data-i18n="settings.android_mode">${window.i18n.t('settings.android_mode')}</h4>
            <p data-i18n="settings.android_desc">${window.i18n.t('settings.android_desc')}</p>
          </div>
        </div>` : ''}

        <!-- Device Polling Settings -->
        <div class="card" style="margin-bottom:var(--space-5);">
          <div class="section-header"><span class="section-title">📱 <span data-i18n="settings.device_settings">${window.i18n.t('settings.device_settings')}</span></span></div>
          <div class="form-field">
            <label class="form-label" data-i18n="settings.refresh_interval">${window.i18n.t('settings.refresh_interval')}</label>
            <input type="number" id="setting-refresh-interval" min="3000" max="60000" step="1000" style="max-width:160px;" />
            <div class="form-hint" data-i18n="settings.refresh_hint">${window.i18n.t('settings.refresh_hint')}</div>
          </div>
          <div class="form-field">
            <label class="toggle-label">
              <div class="toggle">
                <input type="checkbox" id="setting-auto-reconnect">
                <div class="toggle-track"></div>
                <div class="toggle-thumb"></div>
              </div>
              <div>
                <div style="font-size:0.875rem; font-weight:500; color:var(--text-primary);" data-i18n="settings.auto_reconnect">${window.i18n.t('settings.auto_reconnect')}</div>
                <div class="form-hint" style="margin-top:0;" data-i18n="settings.auto_reconnect_hint">${window.i18n.t('settings.auto_reconnect_hint')}</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Language Settings -->
        <div class="card" style="margin-bottom:var(--space-5); cursor:pointer;" onclick="window.app.navigate('language')">
          <div class="flex items-center gap-3">
            <div style="font-size:1.8rem;">🌍</div>
            <div>
              <div style="font-size:1.1rem; font-weight:500;" data-i18n="settings.language">${window.i18n.t('settings.language')}</div>
              <div class="text-muted text-sm" data-i18n="settings.language_desc">${window.i18n.t('settings.language_desc')}</div>
            </div>
            <div class="text-muted" style="margin-left:auto; font-size:1.2rem;">▶</div>
          </div>
        </div>

        <!-- Appearance -->
        <div class="card" style="margin-bottom:var(--space-5);">
          <div class="section-header"><span class="section-title">🎨 <span data-i18n="settings.appearance">${window.i18n.t('settings.appearance')}</span></span></div>
          <div class="form-field">
            <label class="form-label" data-i18n="settings.log_level">${window.i18n.t('settings.log_level')}</label>
            <select id="setting-log-level" style="max-width:160px;">
              <option value="debug" data-i18n="settings.log_debug">${window.i18n.t('settings.log_debug')}</option>
              <option value="info" data-i18n="settings.log_info">${window.i18n.t('settings.log_info')}</option>
              <option value="warn" data-i18n="settings.log_warn">${window.i18n.t('settings.log_warn')}</option>
              <option value="error" data-i18n="settings.log_error">${window.i18n.t('settings.log_error')}</option>
            </select>
          </div>
        </div>

        ${!isAndroid ? `
        <!-- ADB Paths (Desktop only) -->
        <div class="card" style="margin-bottom:var(--space-5);">
          <div class="section-header"><span class="section-title">🔧 <span data-i18n="settings.adb_paths">${window.i18n.t('settings.adb_paths')}</span></span></div>
          <p class="text-muted text-sm" style="margin-bottom:var(--space-4);" data-i18n="settings.adb_paths_desc">
            ${window.i18n.t('settings.adb_paths_desc')}
          </p>
          <div class="form-field">
            <label class="form-label" data-i18n="settings.adb_path">${window.i18n.t('settings.adb_path')}</label>
            <div class="input-group">
              <input type="text" id="setting-adb-path" placeholder="adb (or full path)" />
              <button class="btn btn-secondary" id="setting-adb-browse">📂 <span data-i18n="settings.browse">${window.i18n.t('settings.browse')}</span></button>
            </div>
            <div class="form-hint" data-i18n="settings.adb_hint">${window.i18n.t('settings.adb_hint')}</div>
          </div>
          <div class="form-field">
            <label class="form-label" data-i18n="settings.fastboot_path">${window.i18n.t('settings.fastboot_path')}</label>
            <div class="input-group">
              <input type="text" id="setting-fastboot-path" placeholder="fastboot (or full path)" />
              <button class="btn btn-secondary" id="setting-fastboot-browse">📂 <span data-i18n="settings.browse">${window.i18n.t('settings.browse')}</span></button>
            </div>
          </div>
        </div>` : ''}

        <!-- Actions -->
        <div class="card" style="margin-bottom:var(--space-5);">
          <div class="section-header"><span class="section-title">🛠️ <span data-i18n="settings.actions">${window.i18n.t('settings.actions')}</span></span></div>
          <div class="btn-group">
            <button class="btn btn-primary" id="settings-save">💾 <span data-i18n="settings.save">${window.i18n.t('settings.save')}</span></button>
            <button class="btn btn-danger" id="settings-reset">🔄 <span data-i18n="settings.reset">${window.i18n.t('settings.reset')}</span></button>
          </div>
        </div>

        <!-- About -->
        <div class="card" style="text-align:center;">
          <div style="font-size:2.5rem; margin-bottom:var(--space-3);">🤖</div>
          <h2 style="background:linear-gradient(135deg, var(--color-primary), var(--color-secondary));
                     -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;">
            PrimeADB v1.0.0
          </h2>
          <p class="text-muted" style="margin-top:var(--space-2);" data-i18n="settings.subtitle">${window.i18n.t('settings.subtitle')}</p>
          <p class="text-muted text-sm" style="margin-top:var(--space-2);" data-i18n="settings.built_with">
            ${window.i18n.t('settings.built_with')}
          </p>
          <p class="text-muted text-sm" style="margin-top:var(--space-1);" data-i18n="settings.android_req">
            ${window.i18n.t('settings.android_req', { isAndroid: isAndroid ? '✓' : '—' })}
          </p>
        </div>
      </div>
    `;

    this._loadSettings();
    this._bindEvents(container);
  }

  async _loadSettings() {
    try {
      this.settings = await window.api.settings.get();
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
      const result = await window.api.settings.pickPath(window.i18n.t('settings.select_adb'));
      if (result.success) document.getElementById('setting-adb-path').value = result.path;
    });
    container.querySelector('#setting-fastboot-browse')?.addEventListener('click', async () => {
      const result = await window.api.settings.pickPath(window.i18n.t('settings.select_fastboot'));
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
      await window.api.settings.set(newSettings);
      toast.success(window.i18n.t('settings.saved'));
    } catch(e) {
      toast.error(window.i18n.t('settings.save_failed'), e.message);
    }
  }

  async _reset() {
    const ok = await modal.confirm({
      title: window.i18n.t('settings.reset_title'),
      message: window.i18n.t('settings.reset_msg'),
      confirmType: 'danger',
      confirmText: window.i18n.t('settings.reset'),
    });
    if (!ok) return;
    try {
      await window.api.settings.reset();
      await this._loadSettings();
      toast.success(window.i18n.t('settings.reset_success'));
    } catch(e) {
      toast.error(window.i18n.t('settings.reset_failed'), e.message);
    }
  }

  _updateTexts() {
    document.querySelectorAll('#main-content [data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key === 'settings.android_req') {
        el.textContent = window.i18n.t('settings.android_req', { isAndroid: window.IS_ANDROID ? '✓' : '—' });
      } else {
        el.textContent = window.i18n.t(key);
      }
    });
  }

  destroy() {}
}

window.SettingsPage = SettingsPage;
