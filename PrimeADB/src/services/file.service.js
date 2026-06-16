/**
 * PrimeADB File Service (Main Process)
 * Wraps file operations via ADB shell commands.
 */

const adbService = require('./adb.service');
const logger = require('./logger.service');

/**
 * List files in a directory on the device.
 * @param {string} serial
 * @param {string} dirPath
 * @returns {Promise<{success, files}>}
 */
async function listFiles(serial, dirPath = '/sdcard') {
  // Use ls -la with stat-like output for richer info
  const result = await adbService.execShell(serial, `ls -la "${dirPath}" 2>/dev/null`);
  if (!result.success) return { success: false, files: [], error: result.error };

  const lines = result.output.split('\n').filter(l => l.trim());
  const files = [];

  for (const line of lines) {
    if (line.startsWith('total') || !line.trim()) continue;
    // Parse ls -la output: permissions links owner group size month day time/year name
    const match = line.match(/^([dlrwx\-]{10})\s+(\d+)\s+(\S+)\s+(\S+)\s+(\d+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.*)/);
    if (match) {
      const [, perms, , owner, group, size, , , , name] = match;
      if (name === '.' || name === '..') continue;
      files.push({
        name,
        isDirectory: perms.startsWith('d'),
        isSymlink: perms.startsWith('l'),
        permissions: perms,
        owner,
        group,
        size: parseInt(size),
        path: `${dirPath}/${name}`.replace('//', '/'),
      });
    }
  }

  return { success: true, files, path: dirPath };
}

/**
 * Pull (download) a file from the device to the local filesystem.
 */
async function pullFile(serial, devicePath, localPath) {
  logger.info(`Pulling: ${devicePath} → ${localPath}`);
  return adbService.pull(serial, devicePath, localPath);
}

/**
 * Push (upload) a local file to the device.
 */
async function pushFile(serial, localPath, devicePath) {
  logger.info(`Pushing: ${localPath} → ${devicePath}`);
  return adbService.push(serial, localPath, devicePath);
}

/**
 * Delete a file or directory on the device.
 */
async function deleteFile(serial, devicePath) {
  logger.info(`Deleting: ${devicePath}`);
  return adbService.execShell(serial, `rm -rf "${devicePath}"`);
}

/**
 * Create a directory on the device.
 */
async function makeDirectory(serial, devicePath) {
  logger.info(`Mkdir: ${devicePath}`);
  return adbService.execShell(serial, `mkdir -p "${devicePath}"`);
}

/**
 * Get file stats.
 */
async function statFile(serial, devicePath) {
  const result = await adbService.execShell(serial, `stat "${devicePath}" 2>/dev/null`);
  return result;
}

module.exports = { listFiles, pullFile, pushFile, deleteFile, makeDirectory, statFile };
