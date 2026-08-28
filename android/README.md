# Enterprises Dashboard — Android APK

This is a minimal Android **WebView wrapper** around the existing
Enterprises Dashboard web app. The web assets live in
`app/src/main/assets/www/` and are bundled into the APK, so the app
works fully offline.

## Build the APK

You need **JDK 17** and the **Android SDK** (Platform 34 + Build-tools 34.0.0)
on your machine.

```bash
cd android

# Point Gradle at your Android SDK (optional if ANDROID_HOME is set)
echo "sdk.dir=$HOME/Android/Sdk" > local.properties

# Build
./gradlew assembleDebug     # -> app/build/outputs/apk/debug/app-debug.apk
./gradlew assembleRelease   # -> app/build/outputs/apk/release/app-release.apk
```

> The **debug** APK is signed with the auto-generated debug key and can be
> installed directly: `adb install app/build/outputs/apk/debug/app-debug.apk`.
> The **release** APK in this setup is signed with the debug key too (so it can
> be installed without a keystore). For Play Store distribution, configure a
> proper release keystore in `app/build.gradle`.

### Automated build (GitHub Actions)

Push the `android/` folder (or this workflow) to the repo and the workflow at
`.github/workflows/build-apk.yml` builds both APKs and uploads them as workflow
artifacts. You can also run it manually from the **Actions** tab
(*Build Android APK* → *Run workflow*).

## Refreshing bundled web assets

After editing the web app, re-copy the files into the Android assets:

```bash
cp index.html android/app/src/main/assets/www/index.html
cp app.js     android/app/src/main/assets/www/app.js
cp styles.css android/app/src/main/assets/www/styles.css
```

The app stores accounts in WebView `localStorage`, so logged-in state is
persisted between launches.
