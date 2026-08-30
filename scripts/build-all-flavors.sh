#!/usr/bin/env bash
# Build all flavor debug APKs locally (mirrors CI matrix subset).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR/android"

./gradlew \
  :app:assembleDevDebug \
  :app:assemblePreprodDebug \
  :app:assembleProdDebug \
  --stacktrace

echo "APKs:"
find app/build/outputs/apk -name "*.apk" -print
