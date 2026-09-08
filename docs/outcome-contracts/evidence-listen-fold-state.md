# Evidence — Listen fold + word-tap handoff

**Contract:** `docs/outcome-contracts/listen-fold-state.md`  
**Slug:** listen-fold-state  
**Evaluator:** independent (not the Builder)  
**Date:** 2026-09-08  
**Status:** proven

Graded against the contract and listed artifacts only. No product code was edited.

## Outcome Frame (from contract)

- **Job:** While Listen is talking, tapping an advanced word always takes that flow; tapping Listen again starts at the paragraph on screen, not the top of the passage.
- **North Star:** Word tap during Listen → passage audio cuts, sheet auto-speaks. Next Listen → first visible block in the fold, then the rest.
- **Kill experiment:** `shouldStopForSurfaceChange(passage, wordSheet)` is false, so unhiding the sheet cannot cancel `speakWordSheet` after `ensureVoicesReady`.

## What was inspected

| Artifact | How |
|---|---|
| `docs/outcome-contracts/listen-fold-state.md` | full read |
| `wordspark/platform/speech/session.js` | full read |
| `wordspark/platform/speech/fold.js` | full read |
| `wordspark/platform/speech/lifecycle.js` (`shouldStopForSurfaceChange`, `isWordSheetSurface`) | full read |
| `wordspark/platform/speech/listen-control.js` | full read |
| `wordspark/platform/speech/engine.js` (`speakLiveRoot` `fromFold`, `speakActiveSurface`, `speakWordSheet`) | those functions + `beginSession` / `planSpeakSession` |
| `wordspark/platform/components/word-sheet.js` | full read |
| `wordspark/platform/shell.js` (`startQuiz`, `loadPassage`, `openPanel`, home) | those functions + `btn-home` |
| `wordspark/platform/speech/{fold,session,lifecycle}.test.js` | full read + re-run |
| `wordspark/platform/components/word-sheet.test.js` | handoff order assertion |
| `wordspark/platform/speech/speech.test.js` | fold/quiz/word-tap stories |
| `wordspark/platform/components/speech.js` | lifecycle attach; `ctx.tts.stopSpeaking` alias |
| `wordspark/platform/speech/visible-text.js` `findActiveSurface` | covering sort |
| `wordspark/index.html` `#word-sheet` | surface + panel markup |
| `wordspark/sw.js` | `CACHE_NAME` + `fold.js` / `session.js` assets |
| `platform/cx/stories.json` `word-tap-takes-listen` / `listen-from-fold` | read |
| Slice commit `5e6f914` | `--stat` vs parent `546930e` |

No live Web Speech / browser TTS session. Layout claims for the fold use injected rects in Node, not a real viewport.

## Command evidence (Evaluator)

```
$ cd /workspace && node --test --import platform/test/polyfill-storage.mjs \
    wordspark/platform/speech/fold.test.js \
    wordspark/platform/speech/session.test.js \
    wordspark/platform/speech/lifecycle.test.js \
    wordspark/platform/components/word-sheet.test.js \
    wordspark/platform/speech/speech.test.js
exit:0
# tests 41
# pass 41
# fail 0
```

Slice stories in that run (all pass):

- `story:word-tap-takes-listen opening the word sheet does not surface-stop the coming sheet speech`
- `story:word-tap-takes-listen handoff matrix covers listen, word tap, close, and leave`
- `story:word-sheet-daily-use sheet fills meaning and three example lines then speaks the panel` (order `['stop', 'speak']`)
- `story:listen-from-fold first visible block is the start, later blocks stay in the queue`
- `story:listen-from-fold scrolled past the title starts at the on-screen paragraph`
- `story:listen-from-fold Listen slices blocks from the visible fold`
- `story:speech-stops-on-surface-change quiz covering the passage stops speech`
- `story:speech-stops-on-surface-change shell startQuiz stops speech before overlay`

```
$ cd /workspace && npm run ci
exit:0
# tests 73
# pass 73
# fail 0
# all files line 99.53 / branch 89.07 / funcs 98.78
# fold.js lines 100 / session.js lines 100 / lifecycle.js lines 100
# CI OK
# Platform validation OK — 9 components, kernel 1.0.0
# Agent-guard OK — 10 test files
# CX analyzer OK — 19 stories, 9 NFRs, 3 journeys
```

```
$ node --input-type=module  # /tmp independent kill audit (imports product modules)
exit:0
INDEPENDENT_KILL_AUDIT ok
```

Independent audit (Evaluator, not the Builder’s tests):

| Check | Result |
|---|---|
| `shouldStopForSurfaceChange(passage, wordSheet)` | `false` (kill experiment holds) |
| `shouldStopForSurfaceChange(passage, quiz)` | `true` |
| `shouldStopForSurfaceChange(wordSheet, passage)` | `true` (close still stops) |
| `planSpeakSession({ intendedRoot: panel, liveRoot: wordSheet })` | `{ action: 'speak', root: panel }` |
| `planSpeechHandoff(wordOpen)` | `stop-then-speak-word-sheet` |
| `planSpeechHandoff(leaveSurface)` | `stop` |
| Fold after title left the viewport | slice starts at `p1`, not `title` |
| `startQuiz` / `loadPassage` / `openPanel` / `#btn-home` call `ctx.tts.stopSpeaking()` | all four |
| Listen dock | `speakActiveSurface({ fromFold: true })` |
| Cache | `wordspark-v24`; ASSETS include `fold.js` and `session.js` |

Git: parent `546930e` had `CACHE_NAME = 'wordspark-v23'`; this slice is `wordspark-v24`.

Coverage note: `engine.js` and `listen-control.js` remain on `coverageExclude`. Line coverage on those files is **not** proof of this slice. `fold.js` / `session.js` / `lifecycle.js` are on the include list and reported 100% lines in this CI run.

## Key Results

### KR1 — Opening the word sheet never aborts its own auto-speak (handoff beats surface-stop) — **PASS**

Falsifier: unhiding `#word-sheet` causes `shouldStopForSurfaceChange` to fire `stopSpeaking`, bumping `generation` during `ensureVoicesReady`, so `speakWordSheet` aborts and the sheet is silent.

Evidence it does not on the wired path:

- `isWordSheetSurface` is true for `id === 'word-sheet'` or class `word-sheet`.
- `shouldStopForSurfaceChange` returns **false** when `activeRoot` is the word sheet, even if `speakingRoot` is the passage. Kill-experiment unit + independent audit: `shouldStopForSurfaceChange(passage, wordSheet) === false`.
- `word-sheet.js` `open()` plans `word-open` → `stop-then-speak-word-sheet`, calls `ctx.speech.stopSpeaking()`, unhides the sheet, then `speakWordSheet(panel)`. Component test asserts order `['stop', 'speak']`.
- After unhide, `findActiveSurface` prefers `#word-sheet` (`position:fixed`, z-index 200, `data-speech-surface`). `speakWordSheet` then `planSpeakSession({ intendedRoot: panel, liveRoot: #word-sheet })`. Independent audit: action is `speak`, root is the panel — not `abort` / `surface-changed`.
- `speakLiveRoot` re-checks `shouldStopForSurfaceChange(root, findActiveSurface())` per block; with live root `#word-sheet` that check stays false for a panel/overlay pair.

Gap (does not flip KR): there is no integration test that runs `beginSession` concurrently with `MutationObserver`. Proof is the decision function + call order, not a mocked async race.

### KR2 — Listen / word-open / word-close / leave-surface have one planned action each — **PASS**

Falsifier: those four events map to more than one action, or the matrix is missing.

Evidence:

| Event | Action | Mode | Wired from |
|---|---|---|---|
| `listen` + speaking | `stop` | idle | `listen-control.js` |
| `listen` + sheet open | `speak-word-sheet` | word-sheet | `listen-control.js` (`wordSheetPanel`) |
| `listen` otherwise | `speak-surface-from-fold` | surface | `listen-control.js` |
| `word-open` | `stop-then-speak-word-sheet` | word-sheet | `word-sheet.js` `open` |
| `word-close` | `stop` | idle | `word-sheet.js` `close` |
| `leave-surface` | `stop` | idle | planner only (see gaps) |

`session.test.js` matrix covers all four events plus unknown → `stop`. `session.js` is 100% lines in CI.

Gap (does not flip KR): `SPEECH_EVENTS.leaveSurface` is **never dispatched** from `shell.js`. Quiz / Home / panels / `loadPassage` execute the same action (`ctx.tts.stopSpeaking()`, which is engine `stopSpeaking`) without going through the planner. That is a cohesion remainder, not a second planned action.

### KR3 — Listen on the reading surface starts at the top-most block in the viewport — **PASS**

Falsifier: after the title has left the fold, Listen still queues from block 0 (title).

Evidence:

- `fold.js` `firstBlockInFoldIndex` returns the first block whose rect intersects `(fold.top + slop, fold.bottom)`; `sliceBlocksFromFold` slices from that index. Header bottom is the fold top unless `#reading-header` is hidden / `is-hidden`.
- Unit test `scrolled past the title starts at the on-screen paragraph`: title `{ top: -300, bottom: -20 }`, fold `{ top: 56, bottom: 700 }` → `['p1', 'p2']`.
- `engine.js` `speakLiveRoot` applies `sliceBlocksFromFold` when `options.fromFold`. `speakActiveSurface` defaults `fromFold: options.fromFold !== false`. Listen dock passes `{ fromFold: true }`.
- Policy: `fold.topSlopPx === 8`, `headerSelector: '#reading-header'`.
- Engine/listen story test is a source match (`sliceBlocksFromFold`, `fromFold: true`); the **behavior** proof is `fold.test.js`, which is on the coverage include list (100% lines).

`fold.js` branch coverage in this CI run is 86.21% (invalid-rect `continue`, some header-hidden paths). Not a KR fail: the scrolled-past-title path is asserted.

## Kill criteria

| Criterion | Result |
|---|---|
| Tapping a word while Listen is on leaves the sheet silent (handoff race) | **not hit** — surface-stop is disabled toward the word sheet; open path is stop then `speakWordSheet`; `planSpeakSession` still speaks the panel when live root is `#word-sheet` |
| Listen after scroll always restarts at the title | **not hit** — fold slice starts at `p1` when the title is fully above the fold |
| Quiz/Home still fail to stop speech | **not hit** — `startQuiz`, `#btn-home`, `openPanel`, and `loadPassage` all call `ctx.tts.stopSpeaking()`; lifecycle still stops when quiz covers the passage (`shouldStopForSurfaceChange(passage, quiz) === true`) |

Kill experiment (`shouldStopForSurfaceChange(passage, wordSheet) === false`): **holds** (unit + independent import).

## Definition of Done (contract checklist)

| Item | Evaluator |
|---|---|
| Word tap stops Listen and auto-speaks the sheet | **met** in code + tests (not live TTS) |
| Listen starts from the in-fold paragraph | **met** in `fold.js` tests + engine/listen wiring |
| Handoff matrix tests + CI | **met** — matrix test pass; Evaluator `npm run ci` `exit:0`, 73/73 |
| Command evidence | **met** in **this** file (contract file still `Status: active` with empty checklist) |

Boundary (quiz coaching, parent pace, word-example copy): slice `--stat` does not touch quiz coach copy, pace, or `word-usage.js`. Engine change is fold slice + session mode, not example text. Web Speech only.

## Minority-veto

**No veto** on kill criteria or a falsified KR.

Non-blocking remainder (does not flip Status):

1. No uttered-audio / Playwright fold layout. Do not treat this file as live TTS proof.
2. `leave-surface` is planned but unused; Home/Quiz rely on duplicated `stopSpeaking` plus lifecycle covering-score.
3. Engine `fromFold` test is source-index; `engine.js` is coverage-excluded. A future `speakRoot(..., { fromFold: false })` on the reading surface would skip the slice.
4. Title still **peeking** into the fold (bottom > fold.top + 8px) correctly starts at the title. That is KR3-true and not the kill (“always”). It is the main UX miss if kids tap Listen after a small scroll.
5. Contract file itself remains `Status: active`.

## Sources read

- `docs/outcome-contracts/listen-fold-state.md`
- `wordspark/platform/speech/session.js`
- `wordspark/platform/speech/fold.js`
- `wordspark/platform/speech/lifecycle.js`
- `wordspark/platform/speech/listen-control.js`
- `wordspark/platform/speech/engine.js`
- `wordspark/platform/speech/visible-text.js` (`findActiveSurface`)
- `wordspark/platform/speech/policy.js` (`fold`)
- `wordspark/platform/components/word-sheet.js`
- `wordspark/platform/components/speech.js`
- `wordspark/platform/shell.js`
- `wordspark/platform/speech/{fold,session,lifecycle,speech}.test.js`
- `wordspark/platform/components/word-sheet.test.js`
- `wordspark/index.html` (word-sheet surface)
- `wordspark/sw.js`
- `platform/cx/stories.json` / `nfr.json`
- git `5e6f914` vs parent for `CACHE_NAME`
