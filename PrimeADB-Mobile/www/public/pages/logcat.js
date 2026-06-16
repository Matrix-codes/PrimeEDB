/**
 * PrimeADB Logcat Page
 * Live Android log viewer with filtering, search, and export.
 */

const LOG_LEVEL_COLORS = {
  V: 'var(--text-muted)',
  D: 'var(--color-info)',
  I: 'var(--color-success)',
  W: 'var(--color-warning)',
  E: 'var(--color-danger)',
  F: '#ff00ff',
};

class LogcatPage {
  constructor() {
    this.serial = null;
    this.isRunning = false;
    this.logs = [];
    this.filteredLogs = [];
    this.pendingLogs = [];
    this.maxLogs = 5000;
    this.autoScroll = true;
    this.filterLevel = 'ALL';
    this.filterTag = '';
    this.searchQuery = '';
    this._renderScheduled = false;
    this.isVisible = true;
  }

  render(container) {
    container.innerHTML = `
      <div class="page-enter" style="height:100%; display:flex; flex-direction:column; gap:0; overflow:hidden;">
        <div class="flex items-center gap-4" style="margin-bottom:var(--space-4); flex-wrap:wrap;">
          <div class="page-title" style="margin-bottom:0;">
            <span class="title-icon">📋</span>Logcat
          </div>
          <div class="flex items-center gap-2" style="margin-left:auto;">
            <span class="badge ${this.isRunning ? 'badge-danger' : 'badge-neutral'}" id="logcat-status">
              ${this.isRunning ? '● Live' : 'Stopped'}
            </span>
          </div>
        </div>

        <!-- Controls -->
        <div class="card" style="margin-bottom:var(--space-4); padding: var(--space-3) var(--space-4);">
          <div class="flex items-center gap-3" style="flex-wrap:wrap;">
            <select id="logcat-device" style="max-width:220px;"></select>
            <button class="btn btn-success btn-sm" id="logcat-start">▶ Start</button>
            <button class="btn btn-danger btn-sm" id="logcat-stop" disabled>⏹ Stop</button>
            <div style="width:1px; height:24px; background:var(--color-border); flex-shrink:0;"></div>
            <select id="logcat-level" style="width:100px;">
              <option value="ALL">All</option>
              <option value="V" data-i18n="logcat.level_v">${window.i18n.t('logcat.level_v')}</option>
              <option value="D" data-i18n="logcat.level_d">${window.i18n.t('logcat.level_d')}</option>
              <option value="I" data-i18n="logcat.level_i">${window.i18n.t('logcat.level_i')}</option>
              <option value="W" data-i18n="logcat.level_w">${window.i18n.t('logcat.level_w')}</option>
              <option value="E" data-i18n="logcat.level_e">${window.i18n.t('logcat.level_e')}</option>
              <option value="F" data-i18n="logcat.level_f">${window.i18n.t('logcat.level_f')}</option>
            </select>
            <input type="text" id="logcat-tag" placeholder="${window.i18n.t('logcat.filter_tag')}" data-i18n-placeholder="logcat.filter_tag" style="width:160px;" />
            <input type="text" id="logcat-search" placeholder="${window.i18n.t('logcat.search_logs')}" data-i18n-placeholder="logcat.search_logs" style="width:200px; flex:1;" />
            <div style="margin-left:auto; display:flex; gap:var(--space-2);">
              <button class="btn btn-secondary btn-sm" id="logcat-clear">🗑 Clear</button>
              <button class="btn btn-secondary btn-sm" id="logcat-export">💾 <span data-i18n="logcat.export">${window.i18n.t('logcat.export')}</span></button>
              <label class="toggle-label" style="font-size:0.8rem; color:var(--text-secondary);">
                <span data-i18n="logcat.autoscroll">${window.i18n.t('logcat.autoscroll')}</span>
                <div class="toggle">
                  <input type="checkbox" id="logcat-autoscroll" checked>
                  <div class="toggle-track"></div>
                  <div class="toggle-thumb"></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Log Output -->
        <div class="card" style="flex:1; padding:0; overflow:hidden; display:flex; flex-direction:column;">
          <div id="logcat-output"
               style="flex:1; overflow-y:auto; font-family:var(--font-mono); font-size:0.75rem; line-height:1.5;
                      padding:var(--space-3) var(--space-4); background:var(--color-bg-deepest);
                      border-radius:var(--radius-lg);">
            <div style="color:var(--text-muted); text-align:center; padding:32px;">
              Select a device and click Start to begin streaming logcat
            </div>
          </div>
          <div class="flex items-center justify-between" style="padding:var(--space-2) var(--space-4); border-top:1px solid var(--color-border); flex-shrink:0;">
            <span class="text-xs text-muted" id="logcat-count">0 lines</span>
            <span class="text-xs text-muted" id="logcat-filtered-count"></span>
          </div>
        </div>
      </div>
    `;

    this._bindEvents(container);
    this._loadDevices();

    // Listen for logcat data from main process
    window.api.logcat.onData((line) => {
      this._addLog(line);
    });
  }

  _bindEvents(container) {
    container.querySelector('#logcat-device')?.addEventListener('change', e => { this.serial = e.target.value; });
    container.querySelector('#logcat-start')?.addEventListener('click', () => this._start());
    container.querySelector('#logcat-stop')?.addEventListener('click', () => this._stop());
    container.querySelector('#logcat-clear')?.addEventListener('click', () => this._clear());
    container.querySelector('#logcat-export')?.addEventListener('click', () => this._export());

    container.querySelector('#logcat-level')?.addEventListener('change', e => {
      this.filterLevel = e.target.value;
      this._applyFilter();
    });

    container.querySelector('#logcat-tag')?.addEventListener('input', e => {
      this.filterTag = e.target.value.trim();
      this._applyFilter();
    });

    container.querySelector('#logcat-search')?.addEventListener('input', e => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this._applyFilter();
    });

    container.querySelector('#logcat-autoscroll')?.addEventListener('change', e => {
      this.autoScroll = e.target.checked;
    });
  }

  async _loadDevices() {
    const result = await window.api.adb.getDevices();
    const sel = document.getElementById('logcat-device');
    if (!sel) return;
    if (!result.success || !result.devices.length) {
      sel.innerHTML = '<option value="">No devices</option>';
      return;
    }
    sel.innerHTML = result.devices.map(d => `<option value="${d.serial}">${d.serial}</option>`).join('');
    this.serial = result.devices[0].serial;
  }

  async _start() {
    if (!this.serial) { toast.warning(window.i18n.t('logcat.select_device')); return; }
    if (this.isRunning) return;

    this.isRunning = true;
    this._updateUI();

    const result = await window.api.logcat.start(this.serial, []);
    if (!result.success) {
      this.isRunning = false;
      this._updateUI();
      toast.error(window.i18n.t('logcat.failed_start'), result.error);
    }
  }

  async _stop() {
    await window.api.logcat.stop();
    this.isRunning = false;
    this._updateUI();
    toast.info(window.i18n.t('logcat.logcat_stopped'));
  }

  _updateUI() {
    const status = document.getElementById('logcat-status');
    const startBtn = document.getElementById('logcat-start');
    const stopBtn = document.getElementById('logcat-stop');
    if (status) {
      status.textContent = this.isRunning ? '● Live' : 'Stopped';
      status.className = `badge ${this.isRunning ? 'badge-danger' : 'badge-neutral'}`;
    }
    if (startBtn) startBtn.disabled = this.isRunning;
    if (stopBtn) stopBtn.disabled = !this.isRunning;
  }

  _addLog(line) {
    this.logs.push(line);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (!this.isVisible) return;

    this.pendingLogs.push(line);

    // Batch rendering to prevent jank
    if (!this._renderScheduled) {
      this._renderScheduled = true;
      setTimeout(() => {
        this._renderScheduled = false;
        this._flushPendingLogs();
      }, 100);
    }
  }

  _flushPendingLogs() {
    const output = document.getElementById('logcat-output');
    if (!output) {
      this.pendingLogs = [];
      return;
    }

    const newLogs = this.pendingLogs;
    this.pendingLogs = [];

    // Filter new logs
    let filtered = newLogs;

    if (this.filterLevel !== 'ALL') {
      const levels = ['V', 'D', 'I', 'W', 'E', 'F'];
      const minIdx = levels.indexOf(this.filterLevel);
      const allowedLevels = levels.slice(minIdx);
      filtered = filtered.filter(l => allowedLevels.includes(l.level));
    }

    if (this.filterTag) {
      filtered = filtered.filter(l => l.tag && l.tag.toLowerCase().includes(this.filterTag.toLowerCase()));
    }

    if (this.searchQuery) {
      filtered = filtered.filter(l => (l.message || l.raw || '').toLowerCase().includes(this.searchQuery));
    }

    if (filtered.length === 0) return;

    // Check if we need to clear placeholder
    const placeholder = output.querySelector('[style*="text-align:center"]');
    if (placeholder) {
      output.innerHTML = '';
    }

    // Generate HTML for new logs and insert
    const html = filtered.map(line => {
      const color = LOG_LEVEL_COLORS[line.level] || 'var(--text-primary)';
      const msg = line.message || line.raw || '';
      const highlighted = this.searchQuery
        ? msg.replace(new RegExp(this.searchQuery, 'gi'), m => `<mark style="background:rgba(79,142,247,0.3); color:var(--text-primary);">${m}</mark>`)
        : msg;
      return `<div style="color:${color}; padding: 1px 0; border-bottom: 1px solid rgba(255,255,255,0.03);">
        <span style="opacity:0.5; margin-right:8px;">${line.time || ''}</span>
        <span style="font-weight:700; margin-right:8px;">${line.level || ''}</span>
        ${line.tag ? `<span style="color:var(--color-primary); margin-right:8px;">${line.tag}:</span>` : ''}
        <span>${highlighted}</span>
      </div>`;
    }).join('');

    // Append to DOM
    output.insertAdjacentHTML('beforeend', html);

    // Enforce max display limit in DOM (e.g. 1000 lines) to keep rendering fast
    const maxDomLines = 1000;
    while (output.childElementCount > maxDomLines) {
      output.removeChild(output.firstChild);
    }

    // Update counters
    const count = document.getElementById('logcat-count');
    if (count) count.textContent = `${this.logs.length} total`;

    if (this.autoScroll) output.scrollTop = output.scrollHeight;
  }

  _applyFilter() {
    let filtered = this.logs;

    if (this.filterLevel !== 'ALL') {
      const levels = ['V', 'D', 'I', 'W', 'E', 'F'];
      const minIdx = levels.indexOf(this.filterLevel);
      const allowedLevels = levels.slice(minIdx);
      filtered = filtered.filter(l => allowedLevels.includes(l.level));
    }

    if (this.filterTag) {
      filtered = filtered.filter(l => l.tag && l.tag.toLowerCase().includes(this.filterTag.toLowerCase()));
    }

    if (this.searchQuery) {
      filtered = filtered.filter(l => (l.message || l.raw || '').toLowerCase().includes(this.searchQuery));
    }

    this.filteredLogs = filtered;
    this._renderLogs();

    const count = document.getElementById('logcat-count');
    const fcount = document.getElementById('logcat-filtered-count');
    if (count) count.textContent = `${this.logs.length} total`;
    if (fcount) fcount.textContent = filtered.length !== this.logs.length ? `${filtered.length} shown` : '';
  }

  _renderLogs() {
    const output = document.getElementById('logcat-output');
    if (!output) return;

    const last1000 = this.filteredLogs.slice(-1000);
    output.innerHTML = last1000.map(line => {
      const color = LOG_LEVEL_COLORS[line.level] || 'var(--text-primary)';
      const msg = line.message || line.raw || '';
      const highlighted = this.searchQuery
        ? msg.replace(new RegExp(this.searchQuery, 'gi'), m => `<mark style="background:rgba(79,142,247,0.3); color:var(--text-primary);">${m}</mark>`)
        : msg;
      return `<div style="color:${color}; padding: 1px 0; border-bottom: 1px solid rgba(255,255,255,0.03);">
        <span style="opacity:0.5; margin-right:8px;">${line.time || ''}</span>
        <span style="font-weight:700; margin-right:8px;">${line.level || ''}</span>
        ${line.tag ? `<span style="color:var(--color-primary); margin-right:8px;">${line.tag}:</span>` : ''}
        <span>${highlighted}</span>
      </div>`;
    }).join('');

    if (this.autoScroll) output.scrollTop = output.scrollHeight;
  }

  _clear() {
    this.logs = [];
    this.filteredLogs = [];
    this.pendingLogs = [];
    const output = document.getElementById('logcat-output');
    if (output) output.innerHTML = '<div style="color:var(--text-muted); padding:8px;">Logs cleared.</div>';
    const count = document.getElementById('logcat-count');
    if (count) count.textContent = '0 lines';
  }

  async _export() {
    const content = this.filteredLogs.map(l => `${l.date || ''} ${l.time || ''} ${l.level || ''} ${l.tag || ''}: ${l.message || l.raw || ''}`).join('\n');
    const result = await window.api.logcat.export(content);
    result.success ? toast.success('Logcat exported!', result.filePath) : toast.error(window.i18n.t('logcat.export_failed'), result.error);
  }

  onHide() {
    this.isVisible = false;
  }

  onShow() {
    this.isVisible = true;
    this.pendingLogs = [];
    this._applyFilter();
  }

  destroy() {
    window.api.logcat.stop();
    window.api.logcat.offData();
    this.isRunning = false;
    this.logs = [];
  }
}

window.LogcatPage = LogcatPage;
