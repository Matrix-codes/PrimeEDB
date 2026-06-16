/**
 * PrimeADB Logger Service (Main Process)
 * Lightweight file logger that writes to ~/.primeadb/app.log
 */

const fs = require('fs');
const path = require('path');
const { LOG_FILE, USER_DATA_PATH } = require('../utils/constants');

// Ensure data directory exists
if (!fs.existsSync(USER_DATA_PATH)) {
  fs.mkdirSync(USER_DATA_PATH, { recursive: true });
}

const levels = { debug: 0, info: 1, warn: 2, error: 3 };
let currentLevel = 'info';

/**
 * Write a log entry to file and console.
 * @param {string} level
 * @param {string} message
 * @param {*} [data]
 */
function log(level, message, data) {
  if (levels[level] < levels[currentLevel]) return;

  const timestamp = new Date().toISOString();
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  const entry = `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}\n`;

  // Write to file
  try {
    fs.appendFileSync(LOG_FILE, entry, 'utf8');
  } catch (e) {
    // Silent fail on log write
  }

  // Also log to console (Electron main process window)
  const consoleFn = level === 'error' ? console.error :
                    level === 'warn' ? console.warn : console.log;
  consoleFn(`[PrimeADB] ${entry.trim()}`);
}

const logger = {
  setLevel(level) { currentLevel = level; },
  debug: (msg, data) => log('debug', msg, data),
  info: (msg, data) => log('info', msg, data),
  warn: (msg, data) => log('warn', msg, data),
  error: (msg, data) => log('error', msg, data),
  getLogPath: () => LOG_FILE,
};

module.exports = logger;
