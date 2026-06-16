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

  /** Initialize by loading settings (from Electron IPC or localStorage) */
  async init() {
    try {
      const settings = await window.primeADB.settings.get();
      this._cache = settings || {};
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
    try {
      await window.primeADB.settings.set({ [key]: value });
    } catch(e) {
      console.warn('[Store] Could not persist setting:', key, e);
    }
  }

  /** Set multiple values at once */
  async setMany(obj) {
    Object.assign(this._cache, obj);
    try {
      await window.primeADB.settings.set(obj);
    } catch(e) {
      console.warn('[Store] Could not persist settings batch:', e);
    }
  }

  /** Delete a key */
  async delete(key) {
    delete this._cache[key];
    try {
      await window.primeADB.settings.set(this._cache);
    } catch(e) {}
  }

  /** Get all stored data */
  getAll() {
    return { ...this._cache };
  }
}

// Export singleton
const store = new Store();
window.store = store;
