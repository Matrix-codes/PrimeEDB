/**
 * PrimeADB Loading Component
 * Full-screen overlay with spinner for async operations.
 */

class Loading {
  constructor() {
    this._overlay = null;
    this._stack = 0;
  }

  show(message = 'Loading...') {
    this._stack++;
    if (this._overlay) {
      const msg = this._overlay.querySelector('.loading-message');
      if (msg) msg.textContent = message;
      return;
    }

    this._overlay = document.createElement('div');
    this._overlay.id = 'loading-overlay';
    this._overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 5000;
      background: rgba(8, 9, 13, 0.85);
      backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      flex-direction: column; gap: 16px;
      animation: fadeIn 0.2s ease;
    `;
    this._overlay.innerHTML = `
      <div class="spinner spinner-lg"></div>
      <span class="loading-message" style="color: var(--text-secondary); font-size: 0.9rem;">${message}</span>
    `;
    document.body.appendChild(this._overlay);
  }

  hide() {
    this._stack = Math.max(0, this._stack - 1);
    if (this._stack === 0 && this._overlay) {
      this._overlay.remove();
      this._overlay = null;
    }
  }

  /** Wrap an async function with loading state */
  async wrap(fn, message) {
    this.show(message);
    try {
      return await fn();
    } finally {
      this.hide();
    }
  }
}

window.loading = new Loading();
