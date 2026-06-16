/**
 * PrimeADB Wireless ADB Service (Main Process)
 * Manages wireless ADB connections and saved devices persistence.
 */

const fs = require('fs');
const adbService = require('./adb.service');
const logger = require('./logger.service');
const { SAVED_DEVICES_FILE, USER_DATA_PATH } = require('../utils/constants');

function ensureDataDir() {
  if (!fs.existsSync(USER_DATA_PATH)) {
    fs.mkdirSync(USER_DATA_PATH, { recursive: true });
  }
}

function loadSavedDevices() {
  ensureDataDir();
  try {
    if (fs.existsSync(SAVED_DEVICES_FILE)) {
      return JSON.parse(fs.readFileSync(SAVED_DEVICES_FILE, 'utf8'));
    }
  } catch (e) {
    logger.warn('Could not load saved wireless devices');
  }
  return [];
}

function saveSavedDevices(devices) {
  ensureDataDir();
  fs.writeFileSync(SAVED_DEVICES_FILE, JSON.stringify(devices, null, 2), 'utf8');
}

/** Enable TCP/IP mode on a USB-connected device */
async function enableTcpip(serial, port = 5555) {
  logger.info(`Enabling TCP/IP on ${serial} port ${port}`);
  return adbService.enableTcpip(serial, port);
}

/** Connect to a device via IP:port */
async function connectDevice(host, port = 5555) {
  const target = port ? `${host}:${port}` : host;
  logger.info(`Connecting to ${target}`);
  return adbService.connectDevice(target);
}

/** Disconnect a wireless device */
async function disconnectDevice(host) {
  logger.info(`Disconnecting from ${host}`);
  return adbService.disconnectDevice(host);
}

/** Get list of saved wireless devices */
function getSavedDevices() {
  return { success: true, devices: loadSavedDevices() };
}

/** Save a wireless device for quick reconnect */
function saveDevice(device) {
  const devices = loadSavedDevices();
  const existing = devices.findIndex(d => d.host === device.host);
  if (existing >= 0) {
    devices[existing] = { ...devices[existing], ...device, lastConnected: new Date().toISOString() };
  } else {
    devices.push({ ...device, lastConnected: new Date().toISOString() });
  }
  saveSavedDevices(devices);
  return { success: true, devices };
}

/** Remove a saved device */
function removeSavedDevice(host) {
  const devices = loadSavedDevices().filter(d => d.host !== host);
  saveSavedDevices(devices);
  return { success: true, devices };
}

module.exports = {
  enableTcpip,
  connectDevice,
  disconnectDevice,
  getSavedDevices,
  saveDevice,
  removeSavedDevice,
};
