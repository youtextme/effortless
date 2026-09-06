# ADR 003 — Native Node CI + agent-guard (fail closed)

## Status

Accepted

## Context

WordSpark Pages deployed after a file-existence check only. Agents can add hardcoded Chrome forks, skip tests, and ship broken customer experiences. Android already uses GitHub Actions as law; the PWA did not.

## Decision

1. **One command:** `npm run ci` → validate + agent-guard + CX analyzer + `node --test` with `--test-coverage-lines=95`.
2. **No Jest/Vitest.** Node 22 native runner is the platform test runtime (zero lock-in, matches static ESM PWA).
3. **Governed coverage surface** is kernel + pure speech + guards — not generated vocab data, not browser-only `engine.js` (that is covered by CX stories + word-clock). Thresholds live in `platform/agent-guard.policy.json`.
4. **Fail closed:** missing test, missing CX story, unbound NFR, UA sniff, unlisted `wordspark/js` module, or platform file missing from `sw.js` ASSETS fails CI.
5. **Pages deploy `needs` Platform CI.**

## Consequences

- Agents follow `platform/AGENT-PLAYBOOK.md` + `new-component.mjs`.
- Branch protection (required check named `Platform CI`) is a human GitHub setting; the workflow still runs without it.
