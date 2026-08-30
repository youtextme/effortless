#!/usr/bin/env bash
# Run the same checks as CI locally before opening a PR.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR/android"

./gradlew \
  :app:lintDevDebug \
  :app:testDevDebugUnitTest \
  :app:assembleDevDebug \
  --stacktrace

echo "Local CI checks passed."
