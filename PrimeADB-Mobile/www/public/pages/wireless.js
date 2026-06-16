/**
 * PrimeADB Wireless ADB Page
 * Connect devices via IP, manage saved devices, auto-reconnect.
 */

class WirelessPage {
  constructor() {}

  render(container) {
    container.innerHTML = `
      <div class="page-enter">
        <div class="page-title"><span class="title-icon">📡</span> <span data-i18n="wireless.title">${window.i18n.t('wireless.title')}</span></div>

        ${window.IS_ANDROID ? `
        <!-- Android info banner -->
        <div class="android-info-banner" style="margin-bottom:var(--space-5);">
          <span class="android-info-banner-icon">🖥️</span>
          <div class="android-info-banner-body">
            <h4 data-i18n="wireless.desktop_req">${window.i18n.t('wireless.desktop_req')}</h4>
            <p>To use wireless ADB, run the <strong>PrimeADB desktop app</strong> on your PC/Mac and connect to this device via its IP address. You can still save device IPs below for quick access.</p>
          </div>
        </div>` : `
        <!-- Enable TCP/IP Section -->
        <div class="card" style="margin-bottom:var(--space-5);">
          <div class="section-header">
            <span class="section-title">🔌 Step 1: Enable TCP/IP on USB Device</span>
          </div>
          <p class="text-muted" style="font-size:0.85rem; margin-bottom:var(--space-4);">
            ${window.i18n.t('wireless.step1_desc')}
          </p>
          <div class="flex items-center gap-4" style="flex-wrap:wrap;">
            <select id="wireless-usb-device" style="max-width:280px; flex:1;"></select>
            <div class="flex items-center gap-2">
              <span class="text-muted text-sm">Port:</span>
              <input type="number" id="wireless-port" value="5555" style="width:80px;" min="1024" max="65535" />
            </div>
            <button class="btn btn-primary" id="wireless-enable-tcpip">⚡ Enable TCP/IP</button>
            <button class="btn btn-ghost btn-sm" id="wireless-refresh-usb">🔄</button>
          </div>
          <div class="output-box" id="wireless-tcpip-output" style="margin-top:var(--space-3); min-height:50px; display:none;"></div>
        </div>`}

        <!-- Connect Section -->
        <div class="card" style="margin-bottom:var(--space-5);">
          <div class="section-header">
            <span class="section-title">🌐 ${window.IS_ANDROID ? 'Save Device IP' : 'Step 2: Connect via IP'}</span>
          </div>
          <div class="grid-2" style="gap:var(--space-4);">
            <div>
              <div class="form-field">
                <label class="form-label" data-i18n="wireless.ip_address">${window.i18n.t('wireless.ip_address')}</label>
                <input type="text" id="wireless-ip" placeholder="192.168.1.100" inputmode="decimal" />
              </div>
              <div class="form-field">
                <label class="form-label">Port</label>
                <input type="number" id="wireless-connect-port" value="5555" style="width:100px;" />
              </div>
              <div class="flex items-center gap-2" style="margin-bottom:var(--space-3);">
                <label class="toggle-label">
                  <div class="toggle"><input type="checkbox" id="wireless-save-device" checked><div class="toggle-track"></div><div class="toggle-thumb"></div></div>
                  <span class="text-sm">Save this device</span>
                </label>
              </div>
              <div class="btn-group">
                ${window.IS_ANDROID ? '' : '<button class="btn btn-primary" id="wireless-connect-btn">🔗 Connect</button>'}
                <button class="btn btn-${window.IS_ANDROID ? 'primary' : 'secondary'}" id="wireless-save-btn">💾 ${window.IS_ANDROID ? 'Save IP' : 'Save Only'}</button>
              </div>
            </div>
            <div class="output-box" id="wireless-connect-output" style="min-height:80px; align-self:start;">
              ${window.IS_ANDROID ? '${window.i18n.t('wireless.connect_output_android')}' : '${window.i18n.t('wireless.connect_output_desktop')}'}
            </div>
          </div>
        </div>

        <!-- Saved Devices -->
        <div class="card">
          <div class="section-header">
            <span class="section-title">⭐ Saved Devices</span>
            <button class="btn btn-ghost btn-sm" id="wireless-refresh-saved">🔄 Refresh</button>
          </div>
          <div id="wireless-saved-list">
            <div class="empty-state" style="padding:var(--space-8);">
              <div class="empty-icon">📡</div>
              <h3 data-i18n="wireless.no_saved">${window.i18n.t('wireless.no_saved')}</h3>
              <p data-i18n="wireless.no_saved_desc">${window.i18n.t('wireless.no_saved_desc')}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    this._bindEvents(container);
    if (!window.IS_ANDROID) this._loadUsbDevices();
    this._loadSavedDevices();
  }

  _bindEvents(container) {
    container.querySelector('#wireless-refresh-usb')?.addEventListener('click', () => this._loadUsbDevices());
    container.querySelector('#wireless-enable-tcpip')?.addEventListener('click', () => this._enableTcpip());
    container.querySelector('#wireless-connect-btn')?.addEventListener('click', () => this._connect());
    container.querySelector('#wireless-save-btn')?.addEventListener('click', () => this._saveOnly());
    container.querySelector('#wireless-refresh-saved')?.addEventListener('click', () => this._loadSavedDevices());
  }

  async _saveOnly() {
    const host = document.getElementById('wireless-ip')?.value.trim();
    const port = document.getElementById('wireless-connect-port')?.value || '5555';
    if (!host) { toast.warning(window.i18n.t('wireless.enter_ip')); return; }
    await window.api.wireless.saveDevice({ host, port, label: host });
    this._loadSavedDevices();
    toast.success('Device saved!', `${host}:${port}`);
  }

  async _loadUsbDevices() {
    try {
      const result = await window.api.adb.getDevices();
      const sel = document.getElementById('wireless-usb-device');
      if (!sel) return;
      if (!result.success || !result.devices.length) {
        sel.innerHTML = '<option value="">No USB devices found</option>';
        return;
      }
      sel.innerHTML = result.devices.map(d => `<option value="${d.serial}">${d.serial}</option>`).join('');
    } catch(e) {
      const sel = document.getElementById('wireless-usb-device');
      if (sel) sel.innerHTML = '<option value="">ADB error</option>';
    }
  }


  async _enableTcpip() {
    const serial = document.getElementById('wireless-usb-device')?.value;
    const port = document.getElementById('wireless-port')?.value || '5555';
    if (!serial) { toast.warning(window.i18n.t('wireless.select_usb')); return; }

    const output = document.getElementById('wireless-tcpip-output');
    output.style.display = '';
    output.textContent = window.i18n.t('wireless.enabling_tcpip');

    const result = await window.api.wireless.enableTcpip(serial, parseInt(port));
    output.innerHTML = result.success
      ? `<span class="output-success">✓ TCP/IP enabled on port ${port}\nNow connect via: device IP address:${port}</span>`
      : `<span class="output-error">✗ ${result.error}</span>`;

    if (result.success) toast.success('TCP/IP enabled!', `Connect via IP:${port}`);
    else toast.error(window.i18n.t('wireless.failed_tcpip'), result.error);
  }

  async _connect() {
    const host = document.getElementById('wireless-ip')?.value.trim();
    const port = document.getElementById('wireless-connect-port')?.value || '5555';
    const save = document.getElementById('wireless-save-device')?.checked;

    if (!host) { toast.warning(window.i18n.t('wireless.enter_ip')); return; }

    const output = document.getElementById('wireless-connect-output');
    output.textContent = `Connecting to ${host}:${port}...`;

    const result = await window.api.wireless.connect(host, parseInt(port));
    output.innerHTML = result.success
      ? `<span class="output-success">✓ ${result.output || 'Connected'}</span>`
      : `<span class="output-error">✗ ${result.error}</span>`;

    if (result.success) {
      toast.success('Connected!', `${host}:${port}`);
      if (save) {
        await window.api.wireless.saveDevice({ host, port, label: host });
        this._loadSavedDevices();
      }
    } else {
      toast.error(window.i18n.t('wireless.connection_failed'), result.error);
    }
  }

  async _disconnect() {
    const host = document.getElementById('wireless-ip')?.value.trim();
    if (!host) { toast.warning('Enter an IP address to disconnect'); return; }
    const result = await window.api.wireless.disconnect(host);
    result.success ? toast.success('Disconnected') : toast.error(window.i18n.t('wireless.disconnect_failed'), result.error);
  }

  async _loadSavedDevices() {
    const result = await window.api.wireless.getSaved();
    const el = document.getElementById('wireless-saved-list');
    if (!el) return;

    if (!result.success || !result.devices.length) {
      el.innerHTML = `<div class="empty-state" style="padding:var(--space-8);">
        <div class="empty-icon">📡</div><h3 data-i18n="wireless.no_saved">${window.i18n.t('wireless.no_saved')}</h3>
        <p>Connect to a device and check "Save this device" to add it here</p>
      </div>`;
      return;
    }

    el.innerHTML = `<div class="table-container"><table>
      <thead><tr><th data-i18n="wireless.label_host">${window.i18n.t('wireless.label_host')}</th><th>Port</th><th data-i18n="wireless.last_connected">${window.i18n.t('wireless.last_connected')}</th><th data-i18n="wireless.actions">${window.i18n.t('wireless.actions')}</th></tr></thead>
      <tbody>${result.devices.map(d => `
        <tr>
          <td><span class="font-mono">${d.host}</span></td>
          <td><span class="badge badge-neutral">${d.port || 5555}</span></td>
          <td class="text-muted text-sm">${d.lastConnected ? new Date(d.lastConnected).toLocaleString() : '--'}</td>
          <td>
            <div class="btn-group">
              <button class="btn btn-primary btn-sm" onclick="window.wirelessPage._quickConnect('${d.host}', '${d.port || 5555}')">🔗 Connect</button>
              <button class="btn btn-danger btn-sm" onclick="window.wirelessPage._removeSaved('${d.host}')">🗑</button>
            </div>
          </td>
        </tr>`).join('')}
      </tbody>
    </table></div>`;
  }

  async _quickConnect(host, port) {
    const result = await loading.wrap(() => window.api.wireless.connect(host, parseInt(port)), `Connecting to ${host}...`);
    if (result.success) {
      toast.success('Connected!', `${host}:${port}`);
      await window.api.wireless.saveDevice({ host, port });
    } else {
      toast.error(window.i18n.t('wireless.connection_failed'), result.error);
    }
  }

  async _removeSaved(host) {
    const ok = await modal.confirm({ title: window.i18n.t('wireless.remove_device'), message: window.i18n.t('wireless.remove_msg', { host }), confirmType: 'danger' });
    if (!ok) return;
    await window.api.wireless.removeSaved(host);
    this._loadSavedDevices();
  }

  _updateTexts() {
    document.querySelectorAll('#main-content [data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = window.i18n.t(key);
    });
  }

  destroy() {}
}

window.WirelessPage = WirelessPage;
