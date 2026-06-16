/**
 * PrimeADB IPC Handlers (Main Process)
 * Registers all IPC channels between renderer and main process services.
 */

const { ipcMain, dialog, shell, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const adbService      = require('../services/adb.service');
const fastbootService = require('../services/fastboot.service');
const logcatService   = require('../services/logcat.service');
const fileService     = require('../services/file.service');
const wirelessService = require('../services/wireless.service');
const settingsService = require('../services/settings.service');
const logger          = require('../services/logger.service');
const { IPC }         = require('../utils/constants');

// Track active screen record processes
const screenRecordProcesses = {};

/**
 * Register all IPC handlers.
 * @param {BrowserWindow} mainWindow
 */
function registerHandlers(mainWindow) {
  // ─── ADB Handlers ──────────────────────────────────────────────────────────

  ipcMain.handle(IPC.ADB_GET_DEVICES, async () => {
    return adbService.getDevices();
  });

  ipcMain.handle(IPC.ADB_GET_DEVICE_INFO, async (_, serial) => {
    return adbService.getDeviceInfo(serial);
  });

  ipcMain.handle(IPC.ADB_EXEC, async (_, { serial, command }) => {
    return adbService.execCommand(serial, command);
  });

  ipcMain.handle(IPC.ADB_SHELL, async (_, { serial, command }) => {
    return adbService.execShell(serial, command);
  });

  ipcMain.handle(IPC.ADB_REBOOT, async (_, { serial, mode }) => {
    return adbService.reboot(serial, mode);
  });

  ipcMain.handle(IPC.ADB_SCREENSHOT, async (_, { serial }) => {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Screenshot',
      defaultPath: `screenshot_${Date.now()}.png`,
      filters: [{ name: 'PNG Images', extensions: ['png'] }],
    });
    if (!filePath) return { success: false, error: 'Cancelled' };
    return adbService.screenshot(serial, filePath);
  });

  ipcMain.handle(IPC.ADB_SCREEN_RECORD_START, async (_, { serial }) => {
    const devicePath = `/sdcard/primeadb_record_${Date.now()}.mp4`;
    screenRecordProcesses[serial] = {
      devicePath,
      process: adbService.startScreenRecord(serial, devicePath,
        (data) => mainWindow.webContents.send('screenRecord:data', data),
        () => delete screenRecordProcesses[serial]
      ),
    };
    return { success: true, devicePath };
  });

  ipcMain.handle(IPC.ADB_SCREEN_RECORD_STOP, async (_, { serial }) => {
    const rec = screenRecordProcesses[serial];
    if (!rec) return { success: false, error: 'No recording in progress' };
    try { rec.process.kill('SIGINT'); } catch (e) { /* ignore */ }

    // Wait a moment then pull the file
    await new Promise(r => setTimeout(r, 1500));
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Screen Recording',
      defaultPath: `recording_${Date.now()}.mp4`,
      filters: [{ name: 'MP4 Video', extensions: ['mp4'] }],
    });
    if (!filePath) return { success: false, error: 'Cancelled' };
    return adbService.pull(serial, rec.devicePath, filePath);
  });

  ipcMain.handle(IPC.ADB_INSTALL_APK, async (_, { serial }) => {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Select APK File',
      filters: [{ name: 'APK Files', extensions: ['apk'] }],
      properties: ['openFile'],
    });
    if (!filePaths || filePaths.length === 0) return { success: false, error: 'Cancelled' };
    return adbService.installApk(serial, filePaths[0]);
  });

  ipcMain.handle(IPC.ADB_UNINSTALL_APK, async (_, { serial, packageName }) => {
    return adbService.uninstallApk(serial, packageName);
  });

  ipcMain.handle(IPC.ADB_LIST_PACKAGES, async (_, { serial, filter }) => {
    return adbService.listPackages(serial, filter);
  });

  ipcMain.handle(IPC.ADB_CLEAR_APP_DATA, async (_, { serial, packageName }) => {
    return adbService.clearAppData(serial, packageName);
  });

  ipcMain.handle(IPC.ADB_PULL, async (_, { serial, devicePath }) => {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save File',
      defaultPath: path.basename(devicePath),
    });
    if (!filePath) return { success: false, error: 'Cancelled' };
    return adbService.pull(serial, devicePath, filePath);
  });

  ipcMain.handle(IPC.ADB_PUSH, async (_, { serial, devicePath }) => {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Select File to Push',
      properties: ['openFile'],
    });
    if (!filePaths || filePaths.length === 0) return { success: false, error: 'Cancelled' };
    return adbService.push(serial, filePaths[0], devicePath);
  });

  // ─── Fastboot Handlers ─────────────────────────────────────────────────────

  ipcMain.handle(IPC.FASTBOOT_GET_DEVICES, async () => {
    return fastbootService.getDevices();
  });

  ipcMain.handle(IPC.FASTBOOT_EXEC, async (_, { command }) => {
    return fastbootService.execCommand(null, command);
  });

  ipcMain.handle(IPC.FASTBOOT_FLASH, async (_, { serial, partition }) => {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: `Select image for ${partition}`,
      filters: [{ name: 'Image Files', extensions: ['img', 'bin', 'zip'] }],
      properties: ['openFile'],
    });
    if (!filePaths || filePaths.length === 0) return { success: false, error: 'Cancelled' };
    return fastbootService.flash(serial, partition, filePaths[0]);
  });

  ipcMain.handle(IPC.FASTBOOT_REBOOT, async (_, { serial, mode }) => {
    return fastbootService.reboot(serial, mode);
  });

  ipcMain.handle(IPC.FASTBOOT_GET_VAR, async (_, { serial }) => {
    return fastbootService.getVarAll(serial);
  });

  ipcMain.handle(IPC.FASTBOOT_UNLOCK, async (_, { serial }) => {
    return fastbootService.unlockBootloader(serial);
  });

  // ─── File Manager Handlers ─────────────────────────────────────────────────

  ipcMain.handle(IPC.FILE_LIST, async (_, { serial, path: dirPath }) => {
    return fileService.listFiles(serial, dirPath);
  });

  ipcMain.handle(IPC.FILE_PULL, async (_, { serial, devicePath }) => {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Download File',
      defaultPath: path.basename(devicePath),
    });
    if (!filePath) return { success: false, error: 'Cancelled' };
    const result = await fileService.pullFile(serial, devicePath, filePath);
    if (result.success) shell.showItemInFolder(filePath);
    return result;
  });

  ipcMain.handle(IPC.FILE_PUSH, async (_, { serial, devicePath }) => {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Select File to Upload',
      properties: ['openFile'],
    });
    if (!filePaths || filePaths.length === 0) return { success: false, error: 'Cancelled' };
    return fileService.pushFile(serial, filePaths[0], devicePath);
  });

  ipcMain.handle(IPC.FILE_DELETE, async (_, { serial, devicePath }) => {
    return fileService.deleteFile(serial, devicePath);
  });

  ipcMain.handle(IPC.FILE_MKDIR, async (_, { serial, devicePath }) => {
    return fileService.makeDirectory(serial, devicePath);
  });

  // ─── Logcat Handlers ───────────────────────────────────────────────────────

  ipcMain.handle(IPC.LOGCAT_START, async (_, { serial, args }) => {
    logcatService.start(serial, args || [],
      (line) => mainWindow.webContents.send(IPC.LOGCAT_DATA, line),
      () => mainWindow.webContents.send('logcat:stopped')
    );
    return { success: true };
  });

  ipcMain.handle(IPC.LOGCAT_STOP, async () => {
    logcatService.stop();
    return { success: true };
  });

  ipcMain.handle(IPC.LOGCAT_EXPORT, async (_, { content }) => {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Logcat',
      defaultPath: `logcat_${Date.now()}.txt`,
      filters: [{ name: 'Text Files', extensions: ['txt', 'log'] }],
    });
    if (!filePath) return { success: false, error: 'Cancelled' };
    fs.writeFileSync(filePath, content, 'utf8');
    shell.showItemInFolder(filePath);
    return { success: true, filePath };
  });

  // ─── Wireless Handlers ─────────────────────────────────────────────────────

  ipcMain.handle(IPC.WIRELESS_TCPIP, async (_, { serial, port }) => {
    return wirelessService.enableTcpip(serial, port);
  });

  ipcMain.handle(IPC.WIRELESS_CONNECT, async (_, { host, port }) => {
    return wirelessService.connectDevice(host, port);
  });

  ipcMain.handle(IPC.WIRELESS_DISCONNECT, async (_, { host }) => {
    return wirelessService.disconnectDevice(host);
  });

  ipcMain.handle(IPC.WIRELESS_GET_SAVED, async () => {
    return wirelessService.getSavedDevices();
  });

  ipcMain.handle(IPC.WIRELESS_SAVE_DEVICE, async (_, device) => {
    return wirelessService.saveDevice(device);
  });

  ipcMain.handle(IPC.WIRELESS_REMOVE_SAVED, async (_, { host }) => {
    return wirelessService.removeSavedDevice(host);
  });

  // ─── Settings Handlers ─────────────────────────────────────────────────────

  ipcMain.handle(IPC.SETTINGS_GET, async () => {
    return settingsService.getSettings();
  });

  ipcMain.handle(IPC.SETTINGS_SET, async (_, values) => {
    return settingsService.saveSettings(values);
  });

  ipcMain.handle(IPC.SETTINGS_RESET, async () => {
    return settingsService.resetSettings();
  });

  ipcMain.handle(IPC.SETTINGS_EXPORT, async () => {
    const content = settingsService.exportSettings();
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Settings',
      defaultPath: 'primeadb_settings.json',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    });
    if (!filePath) return { success: false, error: 'Cancelled' };
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true, filePath };
  });

  ipcMain.handle(IPC.SETTINGS_PICK_PATH, async (_, { title }) => {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: title || 'Select Executable',
      properties: ['openFile'],
      filters: [{ name: 'Executables', extensions: ['exe', '*'] }],
    });
    if (!filePaths || filePaths.length === 0) return { success: false, error: 'Cancelled' };
    return { success: true, path: filePaths[0] };
  });

  // ─── System Handlers ───────────────────────────────────────────────────────

  ipcMain.handle(IPC.OPEN_DIALOG, async (_, options) => {
    return dialog.showOpenDialog(mainWindow, options);
  });

  ipcMain.handle(IPC.SAVE_DIALOG, async (_, options) => {
    return dialog.showSaveDialog(mainWindow, options);
  });

  ipcMain.handle(IPC.SHOW_IN_EXPLORER, async (_, filePath) => {
    shell.showItemInFolder(filePath);
    return { success: true };
  });

  logger.info('All IPC handlers registered');
}

module.exports = { registerHandlers };
