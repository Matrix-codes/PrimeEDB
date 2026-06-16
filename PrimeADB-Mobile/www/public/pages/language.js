/**
 * PrimeADB Language Selection Page
 */

class LanguagePage {
  constructor() {
    this.searchQuery = '';
  }

  render(container) {
    container.innerHTML = `
      <div class="page-enter">
        <div class="flex items-center gap-4" style="margin-bottom:var(--space-4);">
          <button class="btn btn-ghost" id="lang-back" style="padding: 0 8px;">
            <span style="font-size: 1.2rem;">◀</span>
          </button>
          <div class="page-title" style="margin-bottom:0;">
            <span class="title-icon">🌍</span><span data-i18n="lang.title">Language Selection</span>
          </div>
        </div>

        <div class="card" style="margin-bottom:var(--space-4); padding: var(--space-3) var(--space-4);">
          <input type="text" id="lang-search" style="width:100%;" placeholder="Search languages..." data-i18n-placeholder="lang.search" />
        </div>

        <div id="lang-list" class="grid-2" style="gap:var(--space-3);"></div>
      </div>
    `;

    this._bindEvents(container);
    this._renderList();
    this._updateTexts();
  }

  _bindEvents(container) {
    container.querySelector('#lang-back')?.addEventListener('click', () => {
      window.app.navigate('settings');
    });

    container.querySelector('#lang-search')?.addEventListener('input', e => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this._renderList();
    });
  }

  _renderList() {
    const listEl = document.getElementById('lang-list');
    if (!listEl) return;

    const currentLocale = window.i18n.getLocale();
    const locales = window.i18n.getSupportedLocales();
    
    const filtered = locales.filter(l => 
      l.name.toLowerCase().includes(this.searchQuery) || 
      l.nativeName.toLowerCase().includes(this.searchQuery)
    );

    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1; padding: var(--space-6);">
        <div class="empty-icon">🌍</div>
        <h3 data-i18n="common.no_results">No results found</h3>
      </div>`;
      return;
    }

    listEl.innerHTML = filtered.map(l => `
      <div class="card stat-card ${l.code === currentLocale ? 'active-lang' : ''}" 
           style="cursor:pointer; flex-direction:row; align-items:center; text-align:start; justify-content:space-between; padding:var(--space-3) var(--space-4); border: 2px solid ${l.code === currentLocale ? 'var(--color-primary)' : 'transparent'};"
           onclick="window.languagePage._selectLanguage('${l.code}')">
        <div>
          <div style="font-weight:600; font-size:1.1rem; margin-bottom:4px;">${l.nativeName}</div>
          <div class="text-muted text-sm">${l.name}</div>
        </div>
        ${l.code === currentLocale ? '<div style="color:var(--color-primary); font-size:1.5rem;">✓</div>' : ''}
      </div>
    `).join('');
  }

  async _selectLanguage(code) {
    await window.i18n.setLocale(code);
    this._renderList();
    toast.success(window.i18n.t('settings.saved'));
  }

  _updateTexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = window.i18n.t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = window.i18n.t(key);
    });
  }

  onShow() {
    this._renderList();
    this._updateTexts();
  }

  destroy() {}
}

window.LanguagePage = LanguagePage;
