/**
 * PrimeADB Logcat Service (Main Process)
 * Manages a persistent adb logcat process and streams output via IPC.
 */

const adbService = require('./adb.service');
const logger = require('./logger.service');
const { parseLogcatLine } = require('../utils/helpers');

let logcatProcess = null;
let currentSerial = null;

/**
 * Start streaming logcat for a device.
 * @param {string} serial
 * @param {string[]} extraArgs - Extra logcat args (e.g., filter tags)
 * @param {Function} onLine - Callback with parsed log line
 * @param {Function} onClose - Callback when process closes
 */
function start(serial, extraArgs = [], onLine, onClose) {
  // Stop any existing logcat process
  stop();

  currentSerial = serial;
  logger.info(`Starting logcat for device: ${serial}`);

  const args = ['-v', 'threadtime', ...extraArgs];

  logcatProcess = adbService.spawnLogcat(serial, args, (data) => {
    const lines = data.split('\n').filter(l => l.trim());
    lines.forEach(line => {
      const parsed = parseLogcatLine(line);
      onLine && onLine(parsed);
    });
  }, (code) => {
    logger.info(`Logcat process exited with code ${code}`);
    onClose && onClose(code);
    logcatProcess = null;
  });

  return true;
}

/**
 * Stop the current logcat process.
 */
function stop() {
  if (logcatProcess) {
    try {
      logcatProcess.kill('SIGTERM');
    } catch (e) {
      // Process may already be dead
    }
    logcatProcess = null;
    currentSerial = null;
    logger.info('Logcat stopped');
  }
}

/**
 * Check if logcat is currently running.
 * @returns {boolean}
 */
function isRunning() {
  return logcatProcess !== null;
}

module.exports = { start, stop, isRunning };
