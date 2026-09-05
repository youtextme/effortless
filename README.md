# effortless

A self-realization and effortless living platform.

## Android app

Kotlin + Jetpack Compose app with **dev / preprod / prod** flavors, GitHub Actions CI/CD, Fastlane Play Store deploy, and TDD stack.

| Action | Command |
|--------|---------|
| Install on your phone | `./scripts/install-dev.sh` |
| Run local CI | `./scripts/run-local-ci.sh` |
| Full guide | [docs/android-development.md](docs/android-development.md) |

**Branch flow:** `feature/*` → CI artifacts → `preprod` → Play internal → `main` + tag → Play production.

First capability: send a WhatsApp message from your own computer, for free, using the WhatsApp Desktop app already logged in on this machine.

## WordSpark PWA

Client-side vocabulary app — **1000 advanced English words in 100 days**. Kids read daily passages; parents get shareable certificates on WhatsApp.

```bash
cd wordspark && python3 -m http.server 8080
```

See [wordspark/README.md](wordspark/README.md).
