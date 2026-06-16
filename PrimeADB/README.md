# PrimeADB

A professional Android device management desktop application built with Electron.js.

## Features

- 📊 **Dashboard** — Device info, battery, RAM, CPU, resolution
- 🔧 **ADB Tools** — Commands, reboot, screenshot, screen record, APK manager, file transfer
- ⚡ **Fastboot** — Flash partitions, unlock bootloader, device variables
- 📁 **File Manager** — Browse, upload, download, delete files on device
- 📋 **Logcat** — Live log streaming with filtering and export
- 💻 **Terminal** — Built-in ADB shell terminal with history
- 📡 **Wireless ADB** — Connect via IP, save devices for quick reconnect
- ⚙️ **Settings** — Configure ADB/Fastboot paths, preferences

## Requirements

- Node.js 18+
- ADB (Android Platform Tools) installed and accessible via PATH
  - Download: https://developer.android.com/tools/releases/platform-tools

## Getting Started

```bash
# Install dependencies
npm install

# Run in development mode
npm start

# Build for production
npm run build
```

## Folder Structure

```
src/
├── main/           # Electron main process
│   ├── main.js     # App entry point
│   ├── preload.js  # contextBridge API exposure
│   └── ipc-handlers.js
├── renderer/       # HTML shell + router
├── services/       # Backend services (ADB, Fastboot, etc.)
├── pages/          # Page modules (Dashboard, ADB Tools, etc.)
├── components/     # Reusable UI components (Toast, Modal, etc.)
├── styles/         # CSS stylesheets (dark theme)
└── utils/          # Helpers, constants, store
```

## Security

- `contextIsolation: true` — Renderer is isolated from Node.js
- `nodeIntegration: false` — No direct Node access in renderer
- All Node.js operations go through secure IPC channels via `contextBridge`

## License

MIT
