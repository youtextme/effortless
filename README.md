# effortless

A self-realization and effortless living platform (Cognitive Mirror).

## Blog snack prototype (web)

Kid-friendly flow for **Ayaan (~10 / 4th grade)** — default snack **Why rain smells good**.  
Macro flow: **Discover → Read → Done → Next** (cream + ink, no login/buy).

| Action | Command |
|--------|---------|
| Open prototype | Open [`web/snack-blog/index.html`](web/snack-blog/index.html), or `npx --yes serve web/snack-blog -p 5173` → http://localhost:5173 |
| Flow map (canonical) | [web/snack-blog/FLOW-MAP.md](web/snack-blog/FLOW-MAP.md) |
| Design + Stitch prompts | [web/snack-blog/DESIGN.md](web/snack-blog/DESIGN.md) |
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
