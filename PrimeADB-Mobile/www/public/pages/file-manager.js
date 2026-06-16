/**
 * PrimeADB File Manager Page
 * Browse, download, upload, and delete files on connected Android device.
 */

class FileManagerPage {
  constructor() {
    this.serial = null;
    this.currentPath = '/sdcard';
    this.history = ['/sdcard'];
  }

  render(container) {
    container.innerHTML = `
      <div class="page-enter" style="height:100%; display:flex; flex-direction:column; gap:0;">
        <div class="page-title" style="margin-bottom:var(--space-4);">
          <span class="title-icon">📁</span>File Manager
        </div>

        <!-- Toolbar -->
        <div class="card" style="margin-bottom:var(--space-4); padding: var(--space-3) var(--space-4);">
          <div class="flex items-center gap-3" style="flex-wrap:wrap;">
            <select id="fm-device-select" style="max-width:220px; flex-shrink:0;"></select>
            <button class="btn btn-ghost btn-sm" id="fm-back" title="Back">◀</button>
            <button class="btn btn-ghost btn-sm" id="fm-home" title="Home">🏠</button>
            <input type="text" id="fm-path-bar" style="flex:1;" value="/sdcard" />
            <button class="btn btn-primary btn-sm" id="fm-navigate">Go</button>
            <div class="flex items-center gap-2" style="margin-left:auto;">
              <button class="btn btn-secondary btn-sm" id="fm-upload">📤 Upload</button>
              <button class="btn btn-secondary btn-sm" id="fm-mkdir">📁+ New Folder</button>
              <button class="btn btn-ghost btn-sm" id="fm-refresh">🔄</button>
            </div>
          </div>
        </div>

        <!-- Breadcrumb -->
        <div class="flex items-center gap-1" style="margin-bottom:var(--space-3); flex-wrap:wrap;" id="fm-breadcrumb"></div>

        <!-- File List -->
        <div class="card" style="flex:1; display:flex; flex-direction:column; padding:0; overflow:hidden;">
          <div class="table-container" style="flex:1; overflow-y:auto; border:none; border-radius:0;">
            <table>
              <thead>
                <tr>
                  <th style="width:36px;"></th>
                  <th data-i18n="fm.name">${window.i18n.t('fm.name')}</th>
                  <th data-i18n="fm.size">${window.i18n.t('fm.size')}</th>
                  <th data-i18n="fm.permissions">${window.i18n.t('fm.permissions')}</th>
                  <th data-i18n="fm.owner">${window.i18n.t('fm.owner')}</th>
                  <th style="width:180px;">Actions</th>
                </tr>
              </thead>
              <tbody id="fm-file-list">
                <tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-muted);">${window.i18n.t('fm.select_device')}</td></tr>
              </tbody>
            </table>
          </div>
          <div class="flex items-center gap-3" style="padding: var(--space-3) var(--space-4); border-top: 1px solid var(--color-border); flex-shrink:0;">
            <span class="text-sm text-muted" id="fm-status">Ready</span>
          </div>
        </div>
      </div>
    `;

    this._bindEvents(container);
    this._loadDevices();
  }

  _bindEvents(container) {
    container.querySelector('#fm-device-select')?.addEventListener('change', e => {
      this.serial = e.target.value;
      this._navigate('/sdcard');
    });

    container.querySelector('#fm-refresh')?.addEventListener('click', () => this._refresh());
    container.querySelector('#fm-home')?.addEventListener('click', () => this._navigate('/sdcard'));
    container.querySelector('#fm-back')?.addEventListener('click', () => {
      if (this.history.length > 1) {
        this.history.pop();
        this._navigate(this.history[this.history.length - 1], false);
      }
    });
    container.querySelector('#fm-navigate')?.addEventListener('click', () => {
      this._navigate(document.getElementById('fm-path-bar')?.value.trim());
    });
    container.querySelector('#fm-path-bar')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') this._navigate(e.target.value.trim());
    });
    container.querySelector('#fm-upload')?.addEventListener('click', () => this._upload());
    container.querySelector('#fm-mkdir')?.addEventListener('click', () => this._mkdir());
  }

  async _loadDevices() {
    const result = await window.api.adb.getDevices();
    const sel = document.getElementById('fm-device-select');
    if (!sel) return;
    if (!result.success || !result.devices.length) {
      sel.innerHTML = '<option value="">No devices</option>';
      return;
    }
    sel.innerHTML = result.devices.map(d => `<option value="${d.serial}">${d.serial}</option>`).join('');
    this.serial = result.devices[0].serial;
    this._navigate('/sdcard');
  }

  async _navigate(path, pushHistory = true) {
    if (!this.serial) return;
    this.currentPath = path;
    if (pushHistory && this.history[this.history.length - 1] !== path) {
      this.history.push(path);
    }

    const pathBar = document.getElementById('fm-path-bar');
    if (pathBar) pathBar.value = path;
    this._renderBreadcrumb(path);

    const status = document.getElementById('fm-status');
    if (status) status.textContent = window.i18n.t('fm.loading');

    const result = await window.api.files.list(this.serial, path);
    if (!result.success) {
      toast.error(window.i18n.t('fm.cannot_open'), result.error);
      if (status) status.textContent = 'Error loading directory';
      return;
    }

    this._renderFiles(result.files);
    if (status) status.textContent = `${result.files.length} items in ${path}`;
  }

  _renderBreadcrumb(path) {
    const el = document.getElementById('fm-breadcrumb');
    if (!el) return;
    const parts = path.split('/').filter(Boolean);
    el.innerHTML = parts.map((part, i) => {
      const partPath = '/' + parts.slice(0, i + 1).join('/');
      return `<span class="badge badge-neutral" style="cursor:pointer;" onclick="window.fileManagerPage._navigate('${partPath}')">${part}</span>
              ${i < parts.length - 1 ? '<span class="text-muted text-sm">/</span>' : ''}`;
    }).join('') || '<span class="badge badge-neutral">/</span>';
  }

  _renderFiles(files) {
    const tbody = document.getElementById('fm-file-list');
    if (!tbody) return;

    if (!files.length) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📂</div><h3>Empty Directory</h3></div></td></tr>`;
      return;
    }

    // Sort: directories first, then files
    const sorted = [...files].sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    tbody.innerHTML = sorted.map(file => {
      const icon = file.isDirectory ? '📁' : this._getFileIcon(file.name);
      const size = file.isDirectory ? '--' : this._formatSize(file.size);
      return `<tr style="cursor: ${file.isDirectory ? 'pointer' : 'default'};"
                  ${file.isDirectory ? `onclick="window.fileManagerPage._navigate('${file.path}')"` : ''}>
        <td style="text-align:center; font-size:1.1rem;">${icon}</td>
        <td>
          <span style="font-size:0.875rem;">${file.name}</span>
          ${file.isSymlink ? '<span class="badge badge-neutral" style="margin-left:4px; font-size:0.6rem;">LINK</span>' : ''}
        </td>
        <td class="font-mono text-sm text-muted">${size}</td>
        <td class="font-mono text-xs text-muted">${file.permissions || '--'}</td>
        <td class="text-muted text-sm">${file.owner || '--'}</td>
        <td>
          <div class="btn-group">
            ${!file.isDirectory ? `<button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); window.fileManagerPage._download('${file.path}', '${file.name}')">📥</button>` : ''}
            <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); window.fileManagerPage._delete('${file.path}', '${file.name}')">🗑️</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  async _download(devicePath, name) {
    const result = await loading.wrap(() => window.api.files.pull(this.serial, devicePath), `Downloading ${name}...`);
    result.success ? toast.success('Download complete', name) : toast.error(window.i18n.t('fm.download_failed'), result.error);
  }

  async _delete(devicePath, name) {
    const ok = await modal.confirm({ title: window.i18n.t('fm.delete_file'), message: window.i18n.t('fm.delete_msg', { name }), confirmType: 'danger', confirmText: 'Delete' });
    if (!ok) return;
    const result = await loading.wrap(() => window.api.files.delete(this.serial, devicePath), 'Deleting...');
    if (result.success) {
      toast.success('Deleted', name);
      this._refresh();
    } else {
      toast.error(window.i18n.t('fm.delete_failed'), result.error);
    }
  }

  async _upload() {
    if (!this.serial) { toast.warning('No device selected'); return; }
    const result = await loading.wrap(() => window.api.files.push(this.serial, this.currentPath), 'Uploading...');
    if (result.success) {
      toast.success(window.i18n.t('fm.upload_complete'));
      this._refresh();
    } else if (result.error !== 'Cancelled') {
      toast.error(window.i18n.t('fm.upload_failed'), result.error);
    }
  }

  async _mkdir() {
    const name = await modal.prompt({ title: window.i18n.t('fm.new_folder_title'), placeholder: window.i18n.t('fm.folder_name') });
    if (!name) return;
    const newPath = `${this.currentPath}/${name}`.replace('//', '/');
    const result = await window.api.files.mkdir(this.serial, newPath);
    result.success ? (toast.success('Folder created'), this._refresh()) : toast.error(window.i18n.t('fm.folder_failed'), result.error);
  }

  _refresh() { this._navigate(this.currentPath, false); }

  _getFileIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
    const icons = { jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', mp4: '🎬', mkv: '🎬', mp3: '🎵', apk: '📦', zip: '🗜️', txt: '📝', pdf: '📕', xml: '📄' };
    return icons[ext] || '📄';
  }

  _formatSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }

  _updateTexts() {
    document.querySelectorAll('#main-content [data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = window.i18n.t(key);
    });
  }

  destroy() {}
}

window.FileManagerPage = FileManagerPage;
