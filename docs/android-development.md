# Android development guide

Ship Android features through **dev → preprod → production** using Gradle product flavors, GitHub Actions, and Fastlane.

## Quick start (install on your phone)

### One-time setup

1. Install [Android Studio](https://developer.android.com/studio) (includes SDK + emulator).
2. Enable **Developer options** and **USB debugging** on your phone.
3. Connect USB; accept the RSA fingerprint when prompted.
4. Verify: `adb devices` shows your device as `device`.

### Install dev build (≤5 minutes after clone)

```bash
chmod +x scripts/*.sh
./scripts/install-dev.sh
```

This builds `devDebug` and installs **`com.youtextme.effortless.dev`** on your phone.

### Run local CI before a PR

```bash
./scripts/run-local-ci.sh
```

## Environments & flavors

| Flavor | App ID | API base | Play track | Branch trigger |
|--------|--------|----------|------------|----------------|
| **dev** | `com.youtextme.effortless.dev` | `https://api-dev.effortless.app/` | — (local / CI artifact) | `feature/*`, `cursor/*` |
| **preprod** | `com.youtextme.effortless.preprod` | `https://api-preprod.effortless.app/` | Internal testing | `preprod` branch |
| **prod** | `com.youtextme.effortless` | `https://api.effortless.app/` | Production | tag `v*.*.*` on `main` |

All three flavors can be installed side-by-side on one phone (different application IDs).

Build variants:

```bash
cd android
./gradlew :app:assembleDevDebug          # daily dev
./gradlew :app:assemblePreprodRelease    # preprod AAB
./gradlew :app:bundleProdRelease         # production AAB
```

## Branch workflow (20+ parallel features)

```
feature/my-feature ──PR──► develop (optional integration)
        │
        └── PR ──► preprod ──► Play internal testers
                      │
                      └── merge ──► main ──► tag v0.2.0 ──► Play production
```

1. **Feature branch** — `cursor/my-feature-49d6` or `feature/my-feature`
   - CI runs lint, unit tests, builds dev/preprod/prod debug APKs
   - Download APK artifacts from the GitHub Actions run for QA
2. **Preprod branch** — merge validated features; auto-deploys preprod AAB to Play **internal** track
3. **Main + tag** — merge preprod when ready; tag `v1.2.3` to deploy **production**

Create the preprod branch once:

```bash
git checkout main && git pull
git checkout -b preprod && git push -u origin preprod
```

## Test-driven development

| Layer | Tool | Location | Run |
|-------|------|----------|-----|
| Unit | JUnit 5 + MockK | `app/src/test/` | `./gradlew :app:testDevDebugUnitTest` |
| UI | Compose UI Test | `app/src/androidTest/` | `./gradlew :app:connectedDevDebugAndroidTest` (device/emulator) |
| Lint | Android Lint | CI | `./gradlew :app:lintDevDebug` |

**TDD loop for a new feature:**

1. Write a failing unit test in `app/src/test/...`
2. Implement until `./gradlew :app:testDevDebugUnitTest` passes
3. Add Compose UI test if user-facing
4. Open PR — CI must be green

## CI/CD pipelines

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `android-ci.yml` | PR + feature pushes | Lint, unit tests, build debug APKs (artifacts) |
| `android-instrumented.yml` | PR/push to `main`/`preprod` | Emulator + instrumented tests |
| `android-preprod.yml` | Push to `preprod` | Build preprod AAB + Fastlane → Play internal |
| `android-prod.yml` | Tag `v*.*.*` or manual | Build prod AAB + Fastlane → Play production |

## Play Store & signing setup

See [android-secrets-setup.md](./android-secrets-setup.md) for GitHub secrets and Play Console configuration.

## Project layout

```
android/                  # Gradle root
  app/                    # Application module
  fastlane/               # Play Store automation
  gradle/libs.versions.toml
scripts/
  install-dev.sh          # Build + adb install dev APK
  run-local-ci.sh         # Mirror PR checks
  build-all-flavors.sh
docs/
  android-development.md  # This file
  android-secrets-setup.md
```

## Giving objectives to the agent

After this setup, you can say things like:

> "Add a settings screen with dark mode toggle — TDD, dev flavor only first."

The agent will: write tests → implement → run `./scripts/run-local-ci.sh` → open a PR. You install with `./scripts/install-dev.sh` to verify on your phone.
