# Outcome Contract — Platform Component Architecture

## Job
Transform WordSpark from a monolith into a platform-composed PWA that principal engineers can scale, govern, and evolve autonomously.

## North Star
Every feature ships as a registered platform component with contract, health check, and telemetry — validated in CI before deploy.

## Key Results
1. Kernel provides registry, bus, health, telemetry, policy
2. 8 components in manifest with acyclic dependency graph
3. `shell.js` is sole composition root; `app.js` is bootstrap only
4. `validate-platform.mjs` passes in CI on every Pages deploy
5. Self-healing: health checks on boot + 60s interval with recovery hooks

## Kill Experiment
If ESM static hosting cannot load `platform/` tree without bundler, collapse to `wordspark/js/platform/` only (already done — runtime inside wordspark).

## Boundary
Client-side only. No backend. Governance docs at repo `platform/`; runtime at `wordspark/platform/`.

## Definition of Done
- [x] COMPONENT-MANIFEST.json + JSON schemas
- [x] Kernel modules implemented
- [x] Components wrap existing js modules
- [x] shell.js orchestrates UI
- [x] CI validation gate
- [x] ADR + ARCHITECTURE.md
