/**
 * PrimeADB Preload Script
 * Safely exposes a limited API to the renderer via contextBridge.
 * Node.js APIs are NOT directly accessible in the renderer for security.
 */

const { contextBridge, ipcRenderer } = require('electron');
const { IPC } = require('../utils/constants');

// ─── Build the API surface ────────────────────────────────────────────────────
contextBridge.exposeInMainWorld('primeADB', {

  // ─── ADB ─────────────────────────────────────────────────────────────────
  adb: {
    getDevices: ()              => ipcRenderer.invoke(IPC.ADB_GET_DEVICES),
    getDeviceInfo: (serial)     => ipcRenderer.invoke(IPC.ADB_GET_DEVICE_INFO, serial),
    exec: (serial, command)     => ipcRenderer.invoke(IPC.ADB_EXEC, { serial, command }),
    shell: (serial, command)    => ipcRenderer.invoke(IPC.ADB_SHELL, { serial, command }),
    reboot: (serial, mode)      => ipcRenderer.invoke(IPC.ADB_REBOOT, { serial, mode }),
    screenshot: (serial)        => ipcRenderer.invoke(IPC.ADB_SCREENSHOT, { serial }),
    screenRecordStart: (serial) => ipcRenderer.invoke(IPC.ADB_SCREEN_RECORD_START, { serial }),
    screenRecordStop: (serial)  => ipcRenderer.invoke(IPC.ADB_SCREEN_RECORD_STOP, { serial }),
    installApk: (serial)        => ipcRenderer.invoke(IPC.ADB_INSTALL_APK, { serial }),
    uninstallApk: (serial, pkg) => ipcRenderer.invoke(IPC.ADB_UNINSTALL_APK, { serial, packageName: pkg }),
    listPackages: (serial, f)   => ipcRenderer.invoke(IPC.ADB_LIST_PACKAGES, { serial, filter: f }),
    clearAppData: (serial, pkg) => ipcRenderer.invoke(IPC.ADB_CLEAR_APP_DATA, { serial, packageName: pkg }),
    pull: (serial, devicePath)  => ipcRenderer.invoke(IPC.ADB_PULL, { serial, devicePath }),
    push: (serial, devicePath)  => ipcRenderer.invoke(IPC.ADB_PUSH, { serial, devicePath }),
  },

  // ─── Fastboot ─────────────────────────────────────────────────────────────
  fastboot: {
    getDevices: ()                        => ipcRenderer.invoke(IPC.FASTBOOT_GET_DEVICES),
    exec: (command)                       => ipcRenderer.invoke(IPC.FASTBOOT_EXEC, { command }),
    flash: (serial, partition)            => ipcRenderer.invoke(IPC.FASTBOOT_FLASH, { serial, partition }),
    reboot: (serial, mode)               => ipcRenderer.invoke(IPC.FASTBOOT_REBOOT, { serial, mode }),
    getVar: (serial)                      => ipcRenderer.invoke(IPC.FASTBOOT_GET_VAR, { serial }),
    unlock: (serial)                      => ipcRenderer.invoke(IPC.FASTBOOT_UNLOCK, { serial }),
  },

  // ─── File Manager ─────────────────────────────────────────────────────────
  files: {
    list: (serial, path)        => ipcRenderer.invoke(IPC.FILE_LIST, { serial, path }),
    pull: (serial, devicePath)  => ipcRenderer.invoke(IPC.FILE_PULL, { serial, devicePath }),
    push: (serial, devicePath)  => ipcRenderer.invoke(IPC.FILE_PUSH, { serial, devicePath }),
    delete: (serial, devicePath)=> ipcRenderer.invoke(IPC.FILE_DELETE, { serial, devicePath }),
    mkdir: (serial, devicePath) => ipcRenderer.invoke(IPC.FILE_MKDIR, { serial, devicePath }),
  },

  // ─── Logcat ───────────────────────────────────────────────────────────────
  logcat: {
    start: (serial, args)    => ipcRenderer.invoke(IPC.LOGCAT_START, { serial, args }),
    stop: ()                 => ipcRenderer.invoke(IPC.LOGCAT_STOP),
    export: (content)        => ipcRenderer.invoke(IPC.LOGCAT_EXPORT, { content }),
    onData: (callback)       => ipcRenderer.on(IPC.LOGCAT_DATA, (_, line) => callback(line)),
    offData: ()              => ipcRenderer.removeAllListeners(IPC.LOGCAT_DATA),
    onStopped: (callback)    => ipcRenderer.on('logcat:stopped', callback),
  },

  // ─── Wireless ─────────────────────────────────────────────────────────────
  wireless: {
    enableTcpip: (serial, port) => ipcRenderer.invoke(IPC.WIRELESS_TCPIP, { serial, port }),
    connect: (host, port)       => ipcRenderer.invoke(IPC.WIRELESS_CONNECT, { host, port }),
    disconnect: (host)          => ipcRenderer.invoke(IPC.WIRELESS_DISCONNECT, { host }),
    getSaved: ()                => ipcRenderer.invoke(IPC.WIRELESS_GET_SAVED),
    saveDevice: (device)        => ipcRenderer.invoke(IPC.WIRELESS_SAVE_DEVICE, device),
    removeSaved: (host)         => ipcRenderer.invoke(IPC.WIRELESS_REMOVE_SAVED, { host }),
  },

  // ─── Settings ─────────────────────────────────────────────────────────────
  settings: {
    get: ()            => ipcRenderer.invoke(IPC.SETTINGS_GET),
    set: (values)      => ipcRenderer.invoke(IPC.SETTINGS_SET, values),
    reset: ()          => ipcRenderer.invoke(IPC.SETTINGS_RESET),
    export: ()         => ipcRenderer.invoke(IPC.SETTINGS_EXPORT),
    pickPath: (title)  => ipcRenderer.invoke(IPC.SETTINGS_PICK_PATH, { title }),
  },

  // ─── System ───────────────────────────────────────────────────────────────
  system: {
    openDialog: (options)        => ipcRenderer.invoke(IPC.OPEN_DIALOG, options),
    saveDialog: (options)        => ipcRenderer.invoke(IPC.SAVE_DIALOG, options),
    showInExplorer: (filePath)   => ipcRenderer.invoke(IPC.SHOW_IN_EXPLORER, filePath),
    onScreenRecordData: (cb)     => ipcRenderer.on('screenRecord:data', (_, d) => cb(d)),
    minimizeWindow: ()           => ipcRenderer.send('window:minimize'),
    maximizeWindow: ()           => ipcRenderer.send('window:maximize'),
    closeWindow: ()              => ipcRenderer.send('window:close'),
  },
});
