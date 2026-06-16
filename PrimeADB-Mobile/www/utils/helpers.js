/**
 * PrimeADB Helpers
 * Common utility functions used across the application.
 */

/**
 * Format bytes into a human-readable string.
 * @param {number} bytes
 * @param {number} decimals
 * @returns {string}
 */
function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Format a duration in seconds to HH:MM:SS.
 * @param {number} seconds
 * @returns {string}
 */
function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

/**
 * Escape shell argument to prevent injection.
 * @param {string} arg
 * @returns {string}
 */
function escapeShellArg(arg) {
  if (!arg) return '""';
  // On Windows wrap with double-quotes and escape inner double-quotes
  return `"${String(arg).replace(/"/g, '\\"')}"`;
}

/**
 * Parse ADB devices list output.
 * @param {string} output
 * @returns {Array<{serial: string, state: string, info: string}>}
 */
function parseAdbDevices(output) {
  const lines = output.split('\n').filter(l => l.trim() && !l.startsWith('List of'));
  return lines.map(line => {
    const parts = line.trim().split(/\s+/);
    const serial = parts[0];
    const state = parts[1];
    const info = parts.slice(2).join(' ');
    return { serial, state, info };
  }).filter(d => d.serial && d.state);
}

/**
 * Parse a logcat line into structured parts.
 * Example: "06-14 10:30:01.123  1234  5678 I ActivityManager: ..."
 * @param {string} line
 * @returns {{date, time, pid, tid, level, tag, message} | null}
 */
function parseLogcatLine(line) {
  const match = line.match(
    /^(\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2}\.\d+)\s+(\d+)\s+(\d+)\s+([VDIWEF])\s+(.+?):\s*(.*)/
  );
  if (!match) return { raw: line, level: 'V', tag: '', message: line };
  const [, date, time, pid, tid, level, tag, message] = match;
  return { date, time, pid, tid, level, tag: tag.trim(), message };
}

/**
 * Sanitise text for display (strip ANSI codes, trim).
 * @param {string} text
 * @returns {string}
 */
function sanitizeOutput(text) {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1B\[[0-9;]*[mGKHF]/g, '').trim();
}

/**
 * Generate a unique ID.
 * @returns {string}
 */
function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Debounce a function.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle a function.
 * @param {Function} fn
 * @param {number} limit
 * @returns {Function}
 */
function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

/**
 * Check if a string is a valid IP address (IPv4).
 * @param {string} ip
 * @returns {boolean}
 */
function isValidIP(ip) {
  const regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!regex.test(ip)) return false;
  return ip.split('.').every(n => parseInt(n) <= 255);
}

/**
 * Deep clone an object.
 * @param {*} obj
 * @returns {*}
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

module.exports = {
  formatBytes,
  formatDuration,
  escapeShellArg,
  parseAdbDevices,
  parseLogcatLine,
  sanitizeOutput,
  uid,
  debounce,
  throttle,
  isValidIP,
  deepClone,
};
