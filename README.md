# effortless

A self-realization and effortless living platform (Cognitive Mirror).

## Blog snack prototype (web)

Kid-friendly **blog snack** for curious readers — default **Why rain smells good**.  
Flow: **Read → Comprehension → Video observations → Share** (minimal book page, no candy UI).

| Action | Command |
|--------|---------|
| Open prototype | `npx --yes serve web/snack-blog -p 5173` → http://localhost:5173 |
| Live (GitHub Pages) | https://youtextme.github.io/effortless/snack/ |
| Prior UI (v1 stitch-cream) | https://youtextme.github.io/effortless/snack/versions/v1-stitch-cream/ |
| Flow map | [docs/snack-blog-flow.md](docs/snack-blog-flow.md) |
| Design law | [web/snack-blog/DESIGN.md](web/snack-blog/DESIGN.md) |
| Generate via Ollama | [docs/local-llm-blog-snack.md](docs/local-llm-blog-snack.md) |

## Android app

Kotlin + Jetpack Compose app with **dev / preprod / prod** flavors, GitHub Actions CI/CD, Fastlane Play Store deploy, and TDD stack.

| Action | Command |
|--------|---------|
| Install on your phone | `./scripts/install-dev.sh` |
| Run local CI | `./scripts/run-local-ci.sh` |
| Full guide | [docs/android-development.md](docs/android-development.md) |

**Branch flow:** `feature/*` → CI artifacts → `preprod` → Play internal → `main` + tag → Play production.

First capability: send a WhatsApp message from your own computer, for free, using the WhatsApp Desktop app already logged in on this machine.
