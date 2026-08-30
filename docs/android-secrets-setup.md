# Android secrets & Play Console setup

Configure these once in **GitHub → Settings → Secrets and variables → Actions** for the `youtextme/effortless` repository.

## Required secrets (production deploy)

| Secret | Description |
|--------|-------------|
| `PLAY_STORE_JSON_KEY` | Full JSON contents of Google Play service account key |
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded release keystore (`base64 -w0 release.jks`) |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias inside keystore |
| `ANDROID_KEY_PASSWORD` | Key password |

Without `PLAY_STORE_JSON_KEY`, CI still builds and uploads AAB artifacts — Play upload is skipped with a log message.

## Play Console setup

1. Create app entries (or one app with preprod as separate package via suffix):
   - **Production:** `com.youtextme.effortless`
   - **Preprod:** `com.youtextme.effortless.preprod` (internal testing)
2. **Setup → API access** — link a Google Cloud project; create a service account with Play Console permissions.
3. Download JSON key → paste into `PLAY_STORE_JSON_KEY` secret.
4. Create an **internal testing** track for preprod; production track for prod releases.

## Local release signing (optional)

For local release builds only — do not commit keystore files:

```bash
export ANDROID_KEYSTORE_PATH="$HOME/effortless-release.jks"
export ANDROID_KEYSTORE_PASSWORD="..."
export ANDROID_KEY_ALIAS="effortless"
export ANDROID_KEY_PASSWORD="..."
cd android && ./gradlew :app:bundleProdRelease
```

## Generate a release keystore

```bash
keytool -genkeypair -v \
  -keystore effortless-release.jks \
  -alias effortless \
  -keyalg RSA -keysize 2048 -validity 10000
```

Encode for GitHub:

```bash
base64 -w0 effortless-release.jks   # Linux
base64 effortless-release.jks       # macOS
```

## Fastlane locally

```bash
cd android
bundle install
export SUPPLY_JSON_KEY_FILE="/path/to/play-store-key.json"
bundle exec fastlane android ci
```
