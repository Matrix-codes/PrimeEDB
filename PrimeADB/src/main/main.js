/**
 * PrimeADB Main Entry Point (Main Process)
 * Creates the BrowserWindow and sets up the application lifecycle.
 */

const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { registerHandlers } = require('./ipc-handlers');
const logger = require('../services/logger.service');
const settingsService = require('../services/settings.service');
const { APP_NAME } = require('../utils/constants');

let mainWindow = null;
let tray = null;
const isDev = process.argv.includes('--dev');

/**
 * Create the main application window.
 */
function createWindow() {
  const settings = settingsService.getSettings();

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 650,
    title: APP_NAME,
    backgroundColor: '#0d0f14',
    frame: false,           // Custom title bar
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,             // Allow preload script to require local files
      contextIsolation: true,     // Security: isolate renderer context
      nodeIntegration: false,     // Security: no direct node access in renderer
      enableRemoteModule: false,  // Security: disable remote module
      webSecurity: true,
      spellcheck: false,
    },
    icon: path.join(__dirname, '../assets/icons/icon.png'),
    show: false, // Don't show until ready
  });

  // Load the renderer
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Show window when ready (prevents visual flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    logger.info(`${APP_NAME} window opened`);
  });

  // Open DevTools in dev mode
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Remove default menu bar
  Menu.setApplicationMenu(null);

  // Register all IPC handlers
  registerHandlers(mainWindow);

  // ─── Window Controls ──────────────────────────────────────────────────────
  ipcMain.on('window:minimize', () => mainWindow.minimize());
  ipcMain.on('window:maximize', () => {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  });
  ipcMain.on('window:close', () => mainWindow.close());

  logger.info(`${APP_NAME} started (dev: ${isDev})`);
}

// ─── App Lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  logger.info(`${APP_NAME} shutting down`);
});

// Handle certificate errors in dev mode gracefully
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});
