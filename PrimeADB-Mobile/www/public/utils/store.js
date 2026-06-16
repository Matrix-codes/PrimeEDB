/**
 * PrimeADB Store
 * ─────────────────────────────────────────────────────────────────────────────
 * Isomorphic settings store:
 *  • On Electron: persists via IPC to the main process file system.
 *  • On Android/Web: persists via localStorage (handled by android-bridge.js).
 * ─────────────────────────────────────────────────────────────────────────────
 */

class Store {
  constructor() {
    this._cache = {};
    this._initialized = false;
  }

  /** Initialize by loading settings */
  async init() {
    try {
      if (window.Capacitor) {
        // Android implementation
        const raw = localStorage.getItem('primeadb_settings');
        this._cache = raw ? JSON.parse(raw) : {};
      } else {
        // Desktop fallback
        const raw = localStorage.getItem('primeadb_settings');
        this._cache = raw ? JSON.parse(raw) : {};
      }
      this._initialized = true;
    } catch (err) {
      console.warn('[Store] Failed to initialize, using empty defaults:', err);
      this._cache = {};
      this._initialized = true;
    }
  }

  /** Get a value by key with optional default */
  get(key, defaultValue = null) {
    return key in this._cache ? this._cache[key] : defaultValue;
  }

  /** Set a value and persist (non-blocking) */
  async set(key, value) {
    this._cache[key] = value;
    this._persist();
  }

  /** Set multiple values at once */
  async setMany(obj) {
    Object.assign(this._cache, obj);
    this._persist();
  }

  /** Delete a key */
  async delete(key) {
    delete this._cache[key];
    this._persist();
  }

  _persist() {
    try {
      if (window.Capacitor) {
        // Android implementation
        localStorage.setItem('primeadb_settings', JSON.stringify(this._cache));
      } else {
        // Desktop fallback
        localStorage.setItem('primeadb_settings', JSON.stringify(this._cache));
      }
    } catch(e) {
      console.warn('[Store] Could not persist settings:', e);
    }
  }

  /** Get all stored data */
  getAll() {
    return { ...this._cache };
  }
}

// Export singleton
const store = new Store();
window.store = store;
