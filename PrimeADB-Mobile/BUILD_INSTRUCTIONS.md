# PrimeADB — Android APK Build Instructions

## Prerequisites

### Required Software
| Tool | Version | Download |
|---|---|---|
| **Android Studio** | Ladybug (2024.2.1) or newer | https://developer.android.com/studio |
| **JDK** | 17 (bundled inside Android Studio) | Bundled with Android Studio |
| **Android SDK** | API 36 (compile), API 29+ (min) | Via Android Studio SDK Manager |
| **Gradle** | 8.x (wrapper included) | Auto-downloaded by Gradle wrapper |

> **Note**: Java/JDK is **not required** as a separate install — Android Studio ships its own JBR (JetBrains Runtime). Gradle is invoked via the included `gradlew.bat` wrapper.

---

## Method 1: Android Studio (Recommended)

### Step 1 — Open the Project
1. Launch **Android Studio**
2. Click **Open** (or **File → Open**)
3. Navigate to: `PrimeADB-Mobile\android\`
4. Click **OK** and wait for Gradle sync to complete

### Step 2 — Build Debug APK
1. Click **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Wait for the build to finish
3. Click **locate** in the notification or find the APK at:
   ```
   android\app\build\outputs\apk\debug\app-debug.apk
   ```

### Step 3 — Build Release APK
1. Click **Build → Generate Signed Bundle / APK...**
2. Select **APK** → Next
3. Create or select a keystore file
4. Fill in keystore credentials
5. Select **release** build variant → Finish
6. APK will be at:
   ```
   android\app\build\outputs\apk\release\app-release.apk
   ```

---

## Method 2: Command Line (with JAVA_HOME set)

### Windows (PowerShell)

```powershell
# Set JAVA_HOME to Android Studio's bundled JDK
# Replace the path below with your actual Android Studio installation
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Navigate to android directory
cd "PrimeADB-Mobile\android"

# Build debug APK
.\gradlew.bat assembleDebug

# APK output location:
# app\build\outputs\apk\debug\app-debug.apk
```

### macOS/Linux

```bash
# Set JAVA_HOME (adjust path for your OS)
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

cd PrimeADB-Mobile/android
./gradlew assembleDebug

# APK: app/build/outputs/apk/debug/app-debug.apk
```

---

## Method 3: Using Capacitor CLI (Recommended Workflow)

```bash
cd PrimeADB-Mobile

# Sync web assets to Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

> Run `npx cap sync` whenever you update web files (HTML/CSS/JS) in `www/public/`.

---

## Signing for Release (Production APK)

### Generate a Keystore (one-time)
```bash
keytool -genkey -v -keystore primeadb.keystore \
  -alias primeadb \
  -keyalg RSA -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD \
  -dname "CN=PrimeADB, OU=Mobile, O=PrimeADB Technologies, L=City, S=State, C=US"
```

### Add Signing Config to `app/build.gradle`
```groovy
android {
    signingConfigs {
        release {
            storeFile file("../../primeadb.keystore")
            storePassword "YOUR_STORE_PASSWORD"
            keyAlias "primeadb"
            keyPassword "YOUR_KEY_PASSWORD"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
        }
    }
}
```

### Build Signed Release APK
```bash
.\gradlew.bat assembleRelease
# APK: app\build\outputs\apk\release\app-release.apk
```

---

## Installing the APK on a Device

### Enable Unknown Sources
1. On your Android device, go to **Settings → Security** (or **Privacy**)
2. Enable **Install unknown apps** for your file manager or browser
3. Transfer the APK to your device and tap to install

### Via ADB (Developer Mode)
```bash
adb install app\build\outputs\apk\debug\app-debug.apk
```

---

## Project Structure

```
PrimeADB-Mobile/
├── android/                    ← Android Studio project root (open this)
│   ├── app/
│   │   ├── build.gradle        ← App-level Gradle config (minSdk=29, targetSdk=36)
│   │   └── src/main/
│   │       ├── AndroidManifest.xml  ← Permissions, portrait lock
│   │       ├── assets/public/  ← Web assets served to WebView
│   │       ├── java/com/primeadb/app/MainActivity.java
│   │       └── res/            ← Icons, splash, strings, colors, styles
│   ├── build.gradle            ← Root Gradle config
│   ├── variables.gradle        ← SDK versions (minSdk=29)
│   └── gradlew.bat             ← Gradle wrapper (Windows)
├── www/
│   └── public/                 ← Source web app (synced to assets/public/)
│       ├── index.html          ← Main entry point
│       ├── android-bridge.js   ← Electron → Android API shim
│       ├── renderer.js         ← SPA router (mobile-adapted)
│       ├── components/         ← toast, modal, loading, sidebar
│       ├── pages/              ← dashboard, settings, terminal, wireless, ...
│       ├── styles/             ← main.css, components.css, mobile.css, ...
│       └── utils/              ← store.js (localStorage-backed)
└── capacitor.config.ts         ← Capacitor config (appId, appName, webDir)
```

---

## App Configuration Summary

| Setting | Value |
|---|---|
| App Name | PrimeADB |
| Package ID | com.primeadb.app |
| Min SDK | 29 (Android 10) |
| Target SDK | 36 (Android 16) |
| Orientation | Portrait locked |
| WebView | Capacitor (Android System WebView) |
| Navigation | Bottom navigation bar (5 tabs) |

---

## Troubleshooting

### "JAVA_HOME is not set"
- Open project in **Android Studio** — it handles Java automatically
- Or set `JAVA_HOME` to Android Studio's bundled JBR

### "SDK not found" / "License not accepted"
```bash
cd android
.\gradlew.bat --info
# Accept Android SDK licenses:
# $ANDROID_HOME\tools\bin\sdkmanager --licenses
```

### White screen on launch
- Ensure `www/public/index.html` exists
- Run `npx cap sync android` to re-sync web assets
- Check that `capacitor.config.json` in `assets/` has `"webDir": "www/public"`

### Gradle sync fails with "Unsupported class file major version"
- Use JDK 17 (set via Android Studio → File → Project Structure → SDK Location → JDK Location)

---

## Updating Web Content

When you modify any file in `www/public/` (HTML, CSS, JS):

```bash
# Option 1: Manual copy (PowerShell)
Copy-Item -Path ".\www\public\*" -Destination ".\android\app\src\main\assets\public\" -Recurse -Force

# Option 2: Capacitor CLI
npx cap sync android

# Then rebuild the APK in Android Studio
```
