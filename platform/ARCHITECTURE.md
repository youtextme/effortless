# Platform Component Architecture

WordSpark and future effortless products compose from **platform components** — bounded, contract-first modules governed by a shared kernel.

## Principles (principal-engineer bar)

| Principle | How we enforce it |
|-----------|-------------------|
| **Bounded context** | One component = one job. No cross-imports except via kernel bus or declared dependencies. |
| **Contract-first** | `platform/contracts/*.schema.json` define inputs/outputs. CI validates manifest + deps. |
| **Observable** | All components emit structured events on `platform.kernel.bus`. |
| **Self-healing** | `health.js` runs on boot + interval; components expose `health()` and recovery hooks. |
| **Self-learning** | `telemetry.js` persists anonymised event rings to localStorage for evolution review. |
| **Self-governing** | `policy.js` blocks disallowed actions (no undeclared network, no child PII export). |
| **Thin apps** | `wordspark/js/app.js` only boots `platform/shell.js`. Products are composition roots. |

## Layer model

```
┌─────────────────────────────────────────────────────────┐
│  App shell (wordspark/platform/shell.js)                │
│  Wires components, handles routing between screens        │
├─────────────────────────────────────────────────────────┤
│  Components (wordspark/platform/components/*)           │
│  capability · home · reading · quiz · certificate · …   │
├─────────────────────────────────────────────────────────┤
│  Adapters (wrap browser APIs)                           │
│  storage · speech (visible-text TTS) · service-worker    │
├─────────────────────────────────────────────────────────┤
│  Kernel (wordspark/platform/kernel/*)                   │
│  registry · bus · health · telemetry · policy · context │
│  capabilities (catalogs of reusable exercises)          │
├─────────────────────────────────────────────────────────┤
│  Data & generators (wordspark/js/data, scripts/)        │
│  Versioned datasets, build-time codegen                 │
└─────────────────────────────────────────────────────────┘
```

## Component lifecycle

1. **Register** — `registry.register(manifest)` at module load.
2. **Init** — `shell` calls `init(ctx)` in dependency order.
3. **Health** — `health.checkAll()` before first render; repeat every 60s.
4. **Operate** — components communicate via `bus.emit` / `bus.on`, not direct calls across boundaries.
5. **Destroy** — `destroy()` on navigation away or app teardown.

## Repository layout

```
platform/                          # Repo-level governance (this folder)
  ARCHITECTURE.md
  COMPONENT-MANIFEST.json          # Canonical registry (mirrored at runtime)
  adr/
  contracts/
  scripts/validate-platform.mjs

wordspark/platform/                # Runtime platform (deployed with PWA)
  kernel/
  components/
  shell.js

wordspark/js/                      # Legacy paths + data (components import from here)
  data/
  passage-generator.js
  ...
```

## Adding an exercise pack (math, diagrams, more reading)

Passages are a **catalog**, not the platform. To add a pack:

1. Export `createMathCapability(getProgress)` from `wordspark/platform/components/capability-packs.js` using `createExerciseCapability` (`homeTab: false` until there is real kid content).
2. Append it to `defaultPacks()`.
3. Register a player with `ctx.capability.registerAction('open-exercise', …)` (or a new kebab action) — **do not** add `if (id === 'math')` in `shell.js`.
4. When the pack is ready for kids, set `homeTab: true` and mount a `data-catalog` panel (`catalogPanelHtml` on Home).
5. Add a CX story on a journey, list any new `wordspark/platform/**/*.js` in `sw.js`, bump `CACHE_NAME`, run `npm run ci`.

## Adding a component

1. `node platform/scripts/new-component.mjs --id <id> --description "<customer outcome>"`
2. Import and register in `wordspark/platform/shell.js`.
3. Add/adjust `platform/cx/stories.json` **and** a step on a journey in `platform/cx/journeys.json` (and NFRs in `platform/cx/nfr.json` when it is a customer requirement) plus a `story:<id>` test.
4. List every new `wordspark/platform/**/*.js` file in `wordspark/sw.js` and bump `CACHE_NAME`.
5. Run `npm run ci` (must be green). CI also runs in GitHub Actions; Pages deploy needs it.

See `platform/AGENT-PLAYBOOK.md`.

## Evolution path

- **Phase 1 (now):** Kernel + shell; components wrap existing modules.
- **Phase 2:** Move `js/*.js` into `platform/components/*/impl/`; data behind repository ports.
- **Phase 3:** Shared `platform` package consumed by Android (via KMP) and web; single manifest drives both.
