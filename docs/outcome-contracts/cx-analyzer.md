# Outcome Contract — Customer experience analyzer

**Status:** active  
**Slug:** cx-analyzer  
**Date:** 2026-09-06

## Outcome Frame

- **Job:** Every customer-visible change is specified as a CX story first; CI fails when the experience is unbound or speech keeps talking after the customer leaves.
- **North Star:** `npm run ci` fails if a journey step is unbound, a story lacks `story:<id>`, an NFR lacks source evidence, highlight clock lags when the engine ignores rate, or Listen survives a surface change during voice wait.
- **Key Results:**
  1. `platform/cx/analyzer.mjs` is a CI step (journeys + stories + NFRs with source evidence).
  2. Quiz covering the passage aborts in-flight Listen (including during `ensureVoicesReady`).
  3. Word clock uses a natural-pace floor and observes real utterance speed so highlight cannot stall or lag when Chrome ignores `rate`.
- **Workback:** contract → analyzer → clock + session gate → stories/tests → CI
- **Kill experiment:** Highlight stays on word 0 after 2s of predicted speech → fail. Session continues after generation bump during voice wait → fail.
- **Contract:** `docs/outcome-contracts/cx-analyzer.md`

## Kill criteria

- Analyzer can pass with a story that has no test marker
- Listen continues after quiz overlay is the active surface
- Highlight model stays on the first word while the clock is already several words ahead

## Boundary

No paid CX SaaS. No recording children. Browser TTS voices may be absent in CI — clock and session-gate are tested as pures; engine wiring is source-bound.

## Definition of Done

- [x] Analyzer in `npm run ci`
- [x] Journeys bind every story
- [x] NFR source evidence is checked in the code
- [x] Stories for highlight tracking and voices-ready
- [x] Session abort if generation changes while waiting for voices
- [x] Word clock catch-up when onboundary is missing or rate is ignored

## Evaluator

| Claim | Evidence | Grade |
|---|---|---|
| Unbound stories fail CI | analyzer.test.js missing-marker case | PASS |
| Orphan stories fail CI | every story must appear on a journey | PASS |
| Quiz overlap aborts Listen | `planSpeakSession` + overlay covering score | PASS |
| Highlight cannot stall or lag rate-ignore | word-clock honorRate=false + observe cps | PASS |

