# Agent playbook — how to change WordSpark without breaking it

This repo is **platform-first**. Customer experiences (reading, listen, quiz, certificate) are assembled from **platform components**. Agents do not invent new trees.

## The law (CI is not optional)

```bash
npm run ci
```

That is the only merge command. It:

1. Validates `platform/COMPONENT-MANIFEST.json` (files, acyclic deps, contracts)
2. Runs **agent-guard** (component files/tests, no UA forks, no stray `wordspark/js` modules, SW precache of every `wordspark/platform/**/*.js`)
3. Runs the **CX analyzer** (`platform/cx/stories.json` + `platform/cx/nfr.json` — every story has `story:<id>`, every NFR is bound)
4. Runs `node --test` with **≥95% line coverage** on the governed surface

GitHub Actions workflow **Platform CI** runs the same command on every PR. Pages deploy **cannot run** unless that job is green.

`95%` is **coverage**, not “mostly passing tests”. **Every test must pass** (exit 0). Flaky tests are failures.

## Add a feature (only supported path)

```bash
node platform/scripts/new-component.mjs --id my-thing --description "What the customer gets"
```

Then:

1. Import `MyThingComponent` in `wordspark/platform/shell.js` and add it to `COMPONENTS`
2. Implement `init(ctx)` — talk through `ctx.emit` / declared dependencies, not cross-imports
3. Put customer logic in `wordspark/platform/components/` or `wordspark/platform/<domain>/`
4. Add a CX story in `platform/cx/stories.json` if the scaffold is not enough (bind NFRs from `platform/cx/nfr.json` when the story is a customer-visible requirement)
5. Bind the story with a test title containing `story:<id>` and `component:<id>`
6. If you added a file under `wordspark/platform/`, add it to `wordspark/sw.js` ASSETS and bump `CACHE_NAME`
7. Run `npm run ci` until it is green

Do **not**:

- Add new files under `wordspark/js/` except data generators (guard allowlist)
- Sniff `navigator.userAgent` / `isChrome()` in `wordspark/platform/`
- Hardcode spoken strings that are not on screen — speech reads visible DOM
- Deploy or “fix CI” by lowering coverage in `platform/agent-guard.policy.json` without an ADR

## Layout

| Path | Role |
|---|---|
| `platform/` | Governance: manifest, contracts, CX stories, CI scripts, ADRs |
| `wordspark/platform/kernel/` | Registry, bus, health, telemetry, policy |
| `wordspark/platform/components/` | One file per component `id` |
| `wordspark/platform/speech/` | Speech subsystem (visible-text engine) |
| `wordspark/js/data/` | Versioned datasets only |
| `.github/workflows/platform-ci.yml` | The gate |

## CX stories

Customer experience is specified as data in `platform/cx/stories.json` (`given` / `when` / `then`, optional `nfr`). `platform/cx/analyzer.mjs` fails CI if a story has no `story:<id>` test, a component has no story, or an NFR is unbound. When you change Listen, quiz, or navigation, **add/adjust a story first**, then the test, then the code.

## Coverage surface (mechanized)

Listed in `platform/agent-guard.policy.json` → `coverageInclude`. Browser-only `engine.js` is excluded from the 95% line gate; it is constrained by CX stories (stop on surface change, abort during voice wait, highlight clock). Add Playwright later as another job, not a different truth.
