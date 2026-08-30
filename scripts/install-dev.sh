#!/usr/bin/env bash
# Install the dev debug APK on a USB-connected Android phone via adb.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$ROOT_DIR/android"
APK_PATH="$ANDROID_DIR/app/build/outputs/apk/dev/debug/app-dev-debug.apk"

if ! command -v adb >/dev/null 2>&1; then
  echo "adb not found. Install Android SDK Platform Tools or Android Studio."
  echo "  macOS: brew install --cask android-platform-tools"
  echo "  Linux: sudo apt install android-sdk-platform-tools"
  exit 1
fi

DEVICE_COUNT="$(adb devices | awk 'NR>1 && $2=="device"{print $1}' | wc -l | tr -d ' ')"
if [ "$DEVICE_COUNT" -eq 0 ]; then
  echo "No authorized device found."
  echo "1. Enable Developer options + USB debugging on your phone"
  echo "2. Connect USB and accept the RSA fingerprint prompt"
  echo "3. Run: adb devices"
  exit 1
fi

echo "Building dev debug APK..."
(cd "$ANDROID_DIR" && ./gradlew :app:assembleDevDebug --stacktrace)

echo "Installing on device..."
adb install -r "$APK_PATH"

echo "Launching com.youtextme.effortless.dev ..."
adb shell monkey -p com.youtextme.effortless.dev -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1 || true

echo "Done. App ID: com.youtextme.effortless.dev"
