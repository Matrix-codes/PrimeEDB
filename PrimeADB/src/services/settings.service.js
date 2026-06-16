/**
 * PrimeADB Settings Service (Main Process)
 * Manages persistent application settings stored in ~/.primeadb/settings.json
 */

const fs = require('fs');
const path = require('path');
const { SETTINGS_FILE, USER_DATA_PATH, DEFAULT_SETTINGS } = require('../utils/constants');
const logger = require('./logger.service');

// Ensure the data directory exists
function ensureDataDir() {
  if (!fs.existsSync(USER_DATA_PATH)) {
    fs.mkdirSync(USER_DATA_PATH, { recursive: true });
  }
}

/**
 * Load settings from disk, merging with defaults.
 * @returns {object}
 */
function getSettings() {
  ensureDataDir();
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    logger.warn('Failed to read settings file, using defaults', err.message);
  }
  return { ...DEFAULT_SETTINGS };
}

/**
 * Save (merge) new values into the settings file.
 * @param {object} newValues
 * @returns {object} Updated full settings
 */
function saveSettings(newValues) {
  ensureDataDir();
  const current = getSettings();
  const updated = { ...current, ...newValues };
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf8');
    logger.info('Settings saved');
  } catch (err) {
    logger.error('Failed to save settings', err.message);
  }
  return updated;
}

/**
 * Reset settings to defaults.
 * @returns {object}
 */
function resetSettings() {
  saveSettings(DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS };
}

/**
 * Export settings JSON string.
 * @returns {string}
 */
function exportSettings() {
  return JSON.stringify(getSettings(), null, 2);
}

module.exports = { getSettings, saveSettings, resetSettings, exportSettings };
