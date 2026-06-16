/**
 * PrimeADB Store
 * Simple JSON-based persistent key-value store for the renderer process.
 * Communicates with main process via IPC for disk operations.
 */

class Store {
  constructor() {
    this._cache = {};
    this._initialized = false;
  }

  /** Initialize by loading settings from main process */
  async init() {
    try {
      const settings = await window.primeADB.settings.get();
      this._cache = settings || {};
      this._initialized = true;
    } catch (err) {
      console.error('[Store] Failed to initialize:', err);
      this._cache = {};
    }
  }

  /** Get a value by key with optional default */
  get(key, defaultValue = null) {
    return key in this._cache ? this._cache[key] : defaultValue;
  }

  /** Set a value and persist */
  async set(key, value) {
    this._cache[key] = value;
    await window.primeADB.settings.set({ [key]: value });
  }

  /** Set multiple values at once */
  async setMany(obj) {
    Object.assign(this._cache, obj);
    await window.primeADB.settings.set(obj);
  }

  /** Delete a key */
  async delete(key) {
    delete this._cache[key];
    await window.primeADB.settings.set(this._cache);
  }

  /** Get all stored data */
  getAll() {
    return { ...this._cache };
  }
}

// Export singleton
const store = new Store();
window.store = store;
