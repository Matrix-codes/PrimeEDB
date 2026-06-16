<div align="center">
  <h1>🚀 PrimeADB Suite (PrimeEDB)</h1>
  <p><strong>A Next-Generation, Professional Android Device Management Platform</strong></p>
  <p>Built for speed, simplicity, and scalability to empower users to store, manage, and access Android devices seamlessly across Desktop, Mobile, and Web.</p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Electron](https://img.shields.io/badge/Electron-28.0.0-47848f?logo=electron)](https://www.electronjs.org/)
  [![Expo](https://img.shields.io/badge/Expo-56.0-black?logo=expo)](https://expo.dev/)
</div>

<hr>

## 🌟 Overview

PrimeADB is an all-in-one suite designed to make Android Debug Bridge (ADB) and Fastboot operations intuitive and accessible. Instead of relying on command-line interfaces, PrimeADB provides a beautiful, modern graphical interface for managing Android devices, transferring files, debugging, and executing fastboot commands.

This repository contains the complete ecosystem:
1. **🖥️ PrimeADB Desktop:** A powerful Electron application for Windows, macOS, and Linux.
2. **📱 PrimeADB Mobile:** A mobile companion app built with React Native (Expo).
3. **🌐 PrimeADB Website:** A sleek landing page for the project.

---

## ✨ Features

- **Device Management:** Connect via USB or Wireless ADB, view device stats, battery, and hardware info.
- **File Manager:** Seamlessly browse, upload, and download files between your PC and Android device.
- **Fastboot Tools:** Unlock bootloaders, flash custom partitions (boot, recovery, system), and manage fastboot states securely.
- **Logcat Viewer:** Real-time logging with advanced filtering for app debugging.
- **Terminal Integration:** Built-in command-line interface for custom ADB/Fastboot scripts.

---

## 📂 Project Structure

| Directory | Description | Technology Stack |
| --- | --- | --- |
| `PrimeADB/` | Desktop application for PC/Mac/Linux | Electron, JavaScript, HTML, CSS |
| `PrimeADB-Mobile/`| Mobile client application | Expo, React Native, Capacitor |
| `PrimeADB-Website/`| Landing page and promotional website | HTML, CSS, Vanilla JS |

---

## 🚀 Getting Started

To get started with development, clone the repository and follow the instructions for the specific application you want to build.

### 🖥️ PrimeADB Desktop

```bash
cd PrimeADB
npm install
npm run dev     # Start development server
npm run build   # Build production binaries
```

### 📱 PrimeADB Mobile

```bash
cd PrimeADB-Mobile
npm install
npm run android # Start Android emulator
npm run ios     # Start iOS simulator
```

### 🌐 PrimeADB Website

Simply navigate to the `PrimeADB-Website` directory and open `index.html` in your favorite browser or start a live server.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page. 

## 📝 License

This project is licensed under the MIT License.

<div align="center">
  <sub>Built with ❤️ for the Android Development Community</sub>
</div>
