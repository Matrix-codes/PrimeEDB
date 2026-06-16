/**
 * PrimeADB Terminal Page
 * Built-in terminal with command history and real-time output streaming.
 */

class TerminalPage {
  constructor() {
    this.serial = null;
    this.history = [];
    this.historyIndex = -1;
    this.isRunning = false;
  }

  render(container) {
    container.innerHTML = `
      <div class="page-enter" style="height:100%; display:flex; flex-direction:column; gap:0; overflow:hidden;">
        <div class="flex items-center gap-4" style="margin-bottom:var(--space-4); flex-wrap:wrap;">
          <div class="page-title" style="margin-bottom:0;"><span class="title-icon">💻</span> Terminal</div>
          <div class="flex items-center gap-3" style="margin-left:auto;">
            <select id="term-device" style="max-width:220px;"></select>
            <button class="btn btn-ghost btn-sm" id="term-clear-btn">🗑 Clear</button>
          </div>
        </div>

        <!-- Terminal Window -->
        <div class="card" style="flex:1; padding:0; overflow:hidden; display:flex; flex-direction:column;
             background:var(--color-bg-deepest); border-color:var(--color-border-light);">
          <!-- Terminal header bar -->
          <div style="padding:var(--space-2) var(--space-4); border-bottom:1px solid var(--color-border);
                      display:flex; align-items:center; gap:var(--space-2); flex-shrink:0;">
            <span style="width:10px; height:10px; border-radius:50%; background:var(--color-danger);"></span>
            <span style="width:10px; height:10px; border-radius:50%; background:var(--color-warning);"></span>
            <span style="width:10px; height:10px; border-radius:50%; background:var(--color-success);"></span>
            <span class="text-muted text-xs" style="margin-left:var(--space-2);">PrimeADB Terminal — ADB Shell</span>
            <span class="badge badge-neutral text-xs" id="term-device-badge" style="margin-left:auto;">No device</span>
          </div>

          <!-- Output Area -->
          <div id="term-output"
               style="flex:1; overflow-y:auto; font-family:var(--font-mono); font-size:0.8rem;
                      line-height:1.6; padding:var(--space-4); color:#a8c4a2;
                      white-space:pre-wrap; word-break:break-all;">
<span style="color:var(--color-primary);">Welcome to PrimeADB Terminal</span>
<span style="color:var(--text-muted);">Commands run via: adb -s &lt;device&gt; shell &lt;command&gt;</span>
<span style="color:var(--text-muted);">Type a command below and press Enter to execute.</span>

          </div>

          <!-- Input Area -->
          <div style="border-top:1px solid var(--color-border); padding:var(--space-2) var(--space-4);
                      display:flex; align-items:center; gap:var(--space-2); flex-shrink:0;">
            <span style="color:var(--color-primary); font-family:var(--font-mono); font-size:0.85rem; flex-shrink:0;">
              $ <span id="term-prompt-device" style="color:var(--color-accent);">shell</span>&nbsp;›
            </span>
            <input type="text" id="term-input"
                   style="flex:1; background:transparent; border:none; outline:none;
                          font-family:var(--font-mono); font-size:0.85rem; color:var(--text-primary);
                          caret-color:var(--color-primary);"
                   placeholder="Enter ADB shell command..." autocomplete="off" spellcheck="false" />
            <button class="btn btn-primary btn-sm" id="term-run-btn" style="flex-shrink:0;">Enter</button>
          </div>
        </div>

        <!-- History Panel -->
        <div class="card" style="margin-top:var(--space-4); padding:var(--space-3) var(--space-4);">
          <div class="flex items-center gap-3">
            <span class="section-title text-sm">📜 History</span>
            <div id="term-history-chips" class="flex items-center gap-2" style="flex:1; overflow-x:auto; flex-wrap:nowrap;"></div>
            <button class="btn btn-ghost btn-sm" id="term-clear-history">Clear</button>
          </div>
        </div>
      </div>
    `;

    this._bindEvents(container);
    this._loadDevices();
  }

  _bindEvents(container) {
    const input = container.querySelector('#term-input');
    const runBtn = container.querySelector('#term-run-btn');

    container.querySelector('#term-device')?.addEventListener('change', e => {
      this.serial = e.target.value;
      const badge = document.getElementById('term-device-badge');
      const prompt = document.getElementById('term-prompt-device');
      if (badge) badge.textContent = e.target.value || 'No device';
      if (prompt) prompt.textContent = e.target.value || 'shell';
    });

    container.querySelector('#term-clear-btn')?.addEventListener('click', () => {
      const output = document.getElementById('term-output');
      if (output) output.innerHTML = '<span style="color:var(--text-muted);">Screen cleared.</span>\n\n';
    });

    container.querySelector('#term-clear-history')?.addEventListener('click', () => {
      this.history = [];
      this._renderHistory();
    });

    runBtn?.addEventListener('click', () => this._run());

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this._run();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          input.value = this.history[this.history.length - 1 - this.historyIndex] || '';
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.historyIndex > 0) {
          this.historyIndex--;
          input.value = this.history[this.history.length - 1 - this.historyIndex] || '';
        } else {
          this.historyIndex = -1;
          input.value = '';
        }
      }
    });
  }

  async _loadDevices() {
    const sel = document.getElementById('term-device');
    if (!sel) return;

    if (window.IS_ANDROID) {
      sel.innerHTML = '<option value="">ADB not available on Android</option>';
      this._appendOutput('\nPrimeADB Terminal\n', 'info');
      this._appendOutput('ADB commands require the desktop app.\n', 'info');
      this._appendOutput('Connect your PC to this device and run the desktop PrimeADB app.\n\n', 'info');
      return;
    }

    try {
      const result = await window.primeADB.adb.getDevices();
      if (!result.success || !result.devices.length) {
        sel.innerHTML = '<option value="">No devices</option>';
        return;
      }
      sel.innerHTML = result.devices.map(d => `<option value="${d.serial}">${d.serial}</option>`).join('');
      this.serial = result.devices[0].serial;
      const badge = document.getElementById('term-device-badge');
      const prompt = document.getElementById('term-prompt-device');
      if (badge) badge.textContent = this.serial;
      if (prompt) prompt.textContent = this.serial;
    } catch(e) {
      sel.innerHTML = '<option value="">ADB error</option>';
    }
  }

  async _run() {
    const input = document.getElementById('term-input');
    const cmd = input?.value.trim();
    if (!cmd) return;

    if (window.IS_ANDROID) {
      this._appendOutput(`\n$ ${cmd}\n`, 'cmd');
      this._appendOutput('ADB not available on Android. Use the desktop app.\n', 'error');
      return;
    }

    if (!this.serial) {
      this._appendOutput('\n[Error] No device selected\n', 'error');
      return;
    }

    input.value = '';
    this.historyIndex = -1;

    if (this.history[this.history.length - 1] !== cmd) {
      this.history.push(cmd);
      if (this.history.length > 50) this.history.shift();
      this._renderHistory();
    }

    this._appendOutput(`\n$ ${cmd}\n`, 'cmd');
    this.isRunning = true;
    try {
      const result = await window.primeADB.adb.shell(this.serial, cmd);
      this.isRunning = false;
      if (result.success) {
        this._appendOutput(result.output + '\n', 'output');
      } else {
        this._appendOutput((result.error || 'Unknown error') + '\n', 'error');
      }
    } catch(e) {
      this.isRunning = false;
      this._appendOutput((e.message || 'Command failed') + '\n', 'error');
    }
  }

  _appendOutput(text, type = 'output') {
    const output = document.getElementById('term-output');
    if (!output) return;

    const colorMap = {
      cmd: 'var(--color-primary)',
      error: 'var(--color-danger)',
      output: '#a8c4a2',
      info: 'var(--text-muted)',
    };

    const span = document.createElement('span');
    span.style.color = colorMap[type] || colorMap.output;
    span.textContent = text;
    output.appendChild(span);
    output.scrollTop = output.scrollHeight;
  }

  _renderHistory() {
    const chips = document.getElementById('term-history-chips');
    if (!chips) return;
    const recent = this.history.slice(-10).reverse();
    chips.innerHTML = recent.map(cmd => `
      <span class="badge badge-neutral" style="cursor:pointer; white-space:nowrap; font-family:var(--font-mono); font-size:0.7rem;"
            onclick="document.getElementById('term-input').value='${cmd.replace(/'/g, "\\'")}'; document.getElementById('term-input').focus();">
        ${cmd.length > 30 ? cmd.slice(0, 30) + '...' : cmd}
      </span>
    `).join('');
  }

  destroy() {}
}

window.TerminalPage = TerminalPage;
