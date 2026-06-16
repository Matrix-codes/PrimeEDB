/**
 * PrimeADB Constants
 * Centralised constants used throughout the application.
 */

const path = require('path');
const os = require('os');

// ─── Application ─────────────────────────────────────────────────────────────
const APP_NAME = 'PrimeADB';
const APP_VERSION = '1.0.0';
const USER_DATA_PATH = path.join(os.homedir(), '.primeadb');
const SETTINGS_FILE = path.join(USER_DATA_PATH, 'settings.json');
const LOG_FILE = path.join(USER_DATA_PATH, 'app.log');
const SAVED_DEVICES_FILE = path.join(USER_DATA_PATH, 'saved_devices.json');

// ─── ADB Commands ────────────────────────────────────────────────────────────
const ADB_COMMANDS = {
  DEVICES: 'devices -l',
  VERSION: 'version',
  REBOOT: 'reboot',
  REBOOT_RECOVERY: 'reboot recovery',
  REBOOT_BOOTLOADER: 'reboot bootloader',
  LOGCAT_CLEAR: 'logcat -c',
  SHELL: 'shell',
};

// ─── Fastboot Commands ───────────────────────────────────────────────────────
const FASTBOOT_COMMANDS = {
  DEVICES: 'devices',
  GET_VAR_ALL: 'getvar all',
  REBOOT: 'reboot',
  REBOOT_BOOTLOADER: 'reboot-bootloader',
  OEM_UNLOCK: 'flashing unlock',
  FLASH: 'flash',
};

// ─── IPC Channels ────────────────────────────────────────────────────────────
const IPC = {
  // ADB
  ADB_GET_DEVICES: 'adb:getDevices',
  ADB_GET_DEVICE_INFO: 'adb:getDeviceInfo',
  ADB_EXEC: 'adb:exec',
  ADB_SHELL: 'adb:shell',
  ADB_REBOOT: 'adb:reboot',
  ADB_SCREENSHOT: 'adb:screenshot',
  ADB_SCREEN_RECORD_START: 'adb:screenRecordStart',
  ADB_SCREEN_RECORD_STOP: 'adb:screenRecordStop',
  ADB_INSTALL_APK: 'adb:installApk',
  ADB_UNINSTALL_APK: 'adb:uninstallApk',
  ADB_LIST_PACKAGES: 'adb:listPackages',
  ADB_CLEAR_APP_DATA: 'adb:clearAppData',
  ADB_PULL: 'adb:pull',
  ADB_PUSH: 'adb:push',

  // Fastboot
  FASTBOOT_GET_DEVICES: 'fastboot:getDevices',
  FASTBOOT_EXEC: 'fastboot:exec',
  FASTBOOT_FLASH: 'fastboot:flash',
  FASTBOOT_REBOOT: 'fastboot:reboot',
  FASTBOOT_GET_VAR: 'fastboot:getVar',
  FASTBOOT_UNLOCK: 'fastboot:unlock',

  // File Manager
  FILE_LIST: 'file:list',
  FILE_PULL: 'file:pull',
  FILE_PUSH: 'file:push',
  FILE_DELETE: 'file:delete',
  FILE_MKDIR: 'file:mkdir',

  // Logcat
  LOGCAT_START: 'logcat:start',
  LOGCAT_STOP: 'logcat:stop',
  LOGCAT_EXPORT: 'logcat:export',
  LOGCAT_DATA: 'logcat:data',

  // Wireless
  WIRELESS_CONNECT: 'wireless:connect',
  WIRELESS_DISCONNECT: 'wireless:disconnect',
  WIRELESS_PAIR: 'wireless:pair',
  WIRELESS_TCPIP: 'wireless:tcpip',
  WIRELESS_GET_SAVED: 'wireless:getSaved',
  WIRELESS_SAVE_DEVICE: 'wireless:saveDevice',
  WIRELESS_REMOVE_SAVED: 'wireless:removeSaved',

  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  SETTINGS_RESET: 'settings:reset',
  SETTINGS_EXPORT: 'settings:export',
  SETTINGS_PICK_PATH: 'settings:pickPath',

  // System
  OPEN_DIALOG: 'dialog:open',
  SAVE_DIALOG: 'dialog:save',
  SHOW_IN_EXPLORER: 'shell:showInExplorer',
};

// ─── Default Settings ────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  adbPath: 'adb',
  fastbootPath: 'fastboot',
  theme: 'dark',
  deviceRefreshInterval: 3000,
  autoReconnectWireless: true,
  logLevel: 'info',
};

// ─── Log Levels ──────────────────────────────────────────────────────────────
const LOG_LEVELS = {
  V: 'verbose',
  D: 'debug',
  I: 'info',
  W: 'warn',
  E: 'error',
  F: 'fatal',
};

module.exports = {
  APP_NAME,
  APP_VERSION,
  USER_DATA_PATH,
  SETTINGS_FILE,
  LOG_FILE,
  SAVED_DEVICES_FILE,
  ADB_COMMANDS,
  FASTBOOT_COMMANDS,
  IPC,
  DEFAULT_SETTINGS,
  LOG_LEVELS,
};
