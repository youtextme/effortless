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
