/**
 * PrimeADB ADB Service (Main Process)
 * Wraps ADB command execution via child_process.
 * All methods return Promises resolving to { success, output, error }.
 */

const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('./logger.service');
const settingsService = require('./settings.service');
const { parseAdbDevices } = require('../utils/helpers');

/** Get the configured ADB binary path */
function getAdbPath() {
  const settings = settingsService.getSettings();
  return settings.adbPath || 'adb';
}

/**
 * Execute an ADB command and return result.
 * @param {string} args - Arguments string after 'adb'
 * @param {string} [serial] - Device serial (optional)
 * @returns {Promise<{success: boolean, output: string, error: string}>}
 */
function execAdb(args, serial = null) {
  return new Promise((resolve) => {
    const adb = getAdbPath();
    const serialFlag = serial ? `-s ${serial} ` : '';
    const cmd = `"${adb}" ${serialFlag}${args}`;
    logger.debug(`ADB exec: ${cmd}`);

    exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err && !stdout) {
        logger.warn(`ADB error: ${stderr || err.message}`);
        resolve({ success: false, output: '', error: stderr || err.message });
      } else {
        resolve({ success: true, output: stdout.trim(), error: stderr.trim() });
      }
    });
  });
}

/**
 * Spawn an ADB command and stream output via callback.
 * @param {string[]} args
 * @param {string} serial
 * @param {Function} onData
 * @param {Function} onClose
 * @returns {ChildProcess}
 */
function spawnAdb(args, serial, onData, onClose) {
  const adb = getAdbPath();
  const serialArgs = serial ? ['-s', serial] : [];
  const child = spawn(adb, [...serialArgs, ...args]);

  child.stdout.on('data', (data) => onData(data.toString()));
  child.stderr.on('data', (data) => onData(data.toString()));
  child.on('close', (code) => onClose && onClose(code));
  child.on('error', (err) => {
    logger.error('ADB spawn error', err.message);
    onData(`Error: ${err.message}`);
  });

  return child;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** List connected devices */
async function getDevices() {
  const result = await execAdb('devices -l');
  if (!result.success) return { success: false, devices: [], error: result.error };
  const devices = parseAdbDevices(result.output);
  return { success: true, devices };
}

/** Get detailed device information */
async function getDeviceInfo(serial) {
  const props = [
    ['deviceName',    'shell getprop ro.product.name'],
    ['model',         'shell getprop ro.product.model'],
    ['brand',         'shell getprop ro.product.brand'],
    ['manufacturer',  'shell getprop ro.product.manufacturer'],
    ['androidVersion','shell getprop ro.build.version.release'],
    ['sdkVersion',    'shell getprop ro.build.version.sdk'],
    ['buildNumber',   'shell getprop ro.build.display.id'],
    ['serial',        'shell getprop ro.serialno'],
    ['cpu',           'shell getprop ro.hardware'],
    ['cpuAbi',        'shell getprop ro.product.cpu.abi'],
    ['screenDensity', 'shell getprop ro.sf.lcd_density'],
  ];

  const info = { serial };

  await Promise.all(props.map(async ([key, cmd]) => {
    const r = await execAdb(cmd, serial);
    info[key] = r.success ? r.output : 'N/A';
  }));

  // Get RAM info
  const memRes = await execAdb('shell cat /proc/meminfo', serial);
  if (memRes.success) {
    const totalMatch = memRes.output.match(/MemTotal:\s+(\d+)/);
    const availMatch = memRes.output.match(/MemAvailable:\s+(\d+)/);
    if (totalMatch) info.ramTotal = `${Math.round(parseInt(totalMatch[1]) / 1024)} MB`;
    if (availMatch) info.ramAvailable = `${Math.round(parseInt(availMatch[1]) / 1024)} MB`;
  }

  // Get battery info
  const batRes = await execAdb('shell dumpsys battery', serial);
  if (batRes.success) {
    const levelMatch = batRes.output.match(/level:\s*(\d+)/);
    const healthMatch = batRes.output.match(/health:\s*(\d+)/);
    const tempMatch = batRes.output.match(/temperature:\s*(\d+)/);
    const voltMatch = batRes.output.match(/voltage:\s*(\d+)/);
    const statusMatch = batRes.output.match(/status:\s*(\d+)/);
    const pluggedMatch = batRes.output.match(/plugged:\s*(\d+)/);

    const healthMap = { 1: 'Unknown', 2: 'Good', 3: 'Overheat', 4: 'Dead', 5: 'Over Voltage', 6: 'Failure', 7: 'Cold' };
    const statusMap = { 1: 'Unknown', 2: 'Charging', 3: 'Discharging', 4: 'Not Charging', 5: 'Full' };
    const pluggedMap = { 0: 'Battery', 1: 'AC', 2: 'USB', 4: 'Wireless' };

    info.batteryLevel = levelMatch ? `${levelMatch[1]}%` : 'N/A';
    info.batteryHealth = healthMatch ? (healthMap[healthMatch[1]] || healthMatch[1]) : 'N/A';
    info.batteryTemp = tempMatch ? `${(parseInt(tempMatch[1]) / 10).toFixed(1)}°C` : 'N/A';
    info.batteryVoltage = voltMatch ? `${(parseInt(voltMatch[1]) / 1000).toFixed(2)}V` : 'N/A';
    info.batteryStatus = statusMatch ? (statusMap[statusMatch[1]] || statusMatch[1]) : 'N/A';
    info.powerSource = pluggedMatch ? (pluggedMap[pluggedMatch[1]] || 'Battery') : 'N/A';
  }

  // Screen resolution
  const resRes = await execAdb('shell wm size', serial);
  if (resRes.success) {
    const match = resRes.output.match(/Physical size:\s*(\d+x\d+)/);
    info.resolution = match ? match[1] : 'N/A';
  }

  return { success: true, info };
}

/** Execute a custom ADB shell command */
async function execShell(serial, command) {
  return execAdb(`shell ${command}`, serial);
}

/** Execute any raw ADB command */
async function execCommand(serial, command) {
  return execAdb(command, serial);
}

/** Reboot the device */
async function reboot(serial, mode = '') {
  const modeArg = mode ? ` ${mode}` : '';
  return execAdb(`reboot${modeArg}`, serial);
}

/** Capture a screenshot and save to a local path */
async function screenshot(serial, savePath) {
  const tempPath = '/sdcard/primeadb_screenshot.png';
  const capture = await execAdb(`shell screencap -p ${tempPath}`, serial);
  if (!capture.success) return capture;
  return execAdb(`pull ${tempPath} "${savePath}"`, serial);
}

/** Start screen recording */
function startScreenRecord(serial, devicePath, onData, onClose) {
  return spawnAdb(['shell', 'screenrecord', devicePath], serial, onData, onClose);
}

/** Install an APK */
async function installApk(serial, apkPath) {
  return execAdb(`install -r "${apkPath}"`, serial);
}

/** Uninstall an app */
async function uninstallApk(serial, packageName) {
  return execAdb(`uninstall ${packageName}`, serial);
}

/** List installed packages */
async function listPackages(serial, filter = '') {
  const flagMap = { user: '-3', system: '-s', all: '' };
  const flag = flagMap[filter] || '';
  const result = await execAdb(`shell pm list packages ${flag}`, serial);
  if (!result.success) return result;
  const packages = result.output
    .split('\n')
    .map(l => l.replace('package:', '').trim())
    .filter(Boolean);
  return { success: true, packages };
}

/** Clear app data */
async function clearAppData(serial, packageName) {
  return execAdb(`shell pm clear ${packageName}`, serial);
}

/** Pull a file from the device */
async function pull(serial, devicePath, localPath) {
  return execAdb(`pull "${devicePath}" "${localPath}"`, serial);
}

/** Push a file to the device */
async function push(serial, localPath, devicePath) {
  return execAdb(`push "${localPath}" "${devicePath}"`, serial);
}

/** Stream logcat output */
function spawnLogcat(serial, args, onData, onClose) {
  return spawnAdb(['logcat', ...args], serial, onData, onClose);
}

/** Enable ADB over TCP/IP */
async function enableTcpip(serial, port = 5555) {
  return execAdb(`tcpip ${port}`, serial);
}

/** Connect to a device over TCP/IP */
async function connectDevice(host) {
  return execAdb(`connect ${host}`);
}

/** Disconnect a TCP/IP device */
async function disconnectDevice(host) {
  return execAdb(`disconnect ${host}`);
}

module.exports = {
  getDevices,
  getDeviceInfo,
  execShell,
  execCommand,
  reboot,
  screenshot,
  startScreenRecord,
  installApk,
  uninstallApk,
  listPackages,
  clearAppData,
  pull,
  push,
  spawnLogcat,
  enableTcpip,
  connectDevice,
  disconnectDevice,
  spawnAdb,
};
