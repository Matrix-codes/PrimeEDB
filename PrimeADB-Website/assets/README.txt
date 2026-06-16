Please place your actual Android APK file in this directory and rename it to `app.apk`.

The `index.html` file has a Download button that is hardcoded to look for `assets/app.apk`.

If your APK has a different name, you will need to open `index.html` and update the `href` attribute on the download buttons to match your actual file name (e.g., `href="assets/primeadb-v1.apk"`).
