# Outcome Contract — Customer experience analyzer

**Status:** active  
**Slug:** cx-analyzer  
**Date:** 2026-09-06

## Outcome Frame

- **Job:** Every customer-visible change is specified as a CX story first; CI fails when the experience is unbound or speech keeps talking after the customer leaves.
- **North Star:** `npm run ci` fails if any story lacks `story:<id>`, any NFR is orphaned, highlight clock lag > 1 word, or Listen survives a surface change during voice wait.
- **Key Results:**
  1. `platform/cx/analyzer.mjs` is a CI step (stories + NFRs).
  2. Quiz covering the passage aborts in-flight Listen (including during `ensureVoicesReady`).
  3. Word clock advances highlight when `onboundary` is missing; lag ≤ 1 word in the model.
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
- [x] Stories for highlight tracking and voices-ready
- [x] Session abort if generation changes while waiting for voices
- [x] Word clock catch-up when onboundary is missing

## Evaluator

| Claim | Evidence | Grade |
|---|---|---|
| Unbound stories fail CI | analyzer.test.js missing-marker case | PASS |
| Quiz overlap aborts Listen | `shouldAbortAfterAsyncWait` + `pickSpeakRoot` | PASS |
| Highlight cannot stall on word 0 | word-clock 2s catch-up test | PASS |

