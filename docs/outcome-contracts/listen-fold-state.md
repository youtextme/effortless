# Outcome Contract — Listen fold + word-tap handoff

**Status:** proven  
**Slug:** listen-fold-state  
**Date:** 2026-09-08

## Outcome Frame

- **Job:** While Listen is talking, tapping an advanced word (or another covering control) always takes that flow; tapping Listen again starts at the paragraph currently on screen, not the top of the passage.
- **North Star:** Word tap during Listen → passage audio cuts, sheet auto-speaks (word ×2, meaning, 3 examples). Next Listen → first visible block in the fold, then the rest.
- **Key Results:**
  1. Opening the word sheet never aborts its own auto-speak (handoff beats surface-stop).
  2. Listen / word-open / word-close / leave-surface have one planned action each.
  3. Listen on the reading surface starts at the top-most block in the viewport.
- **Workback:** contract → handoff + fold helpers → wire engine/listen/sheet → tests → cache bump.
- **Agents:** Builder, Evaluator (fresh).
- **Kill experiment:** `shouldStopForSurfaceChange(passage, wordSheet)` is false, so unhiding the sheet cannot cancel `speakWordSheet` after `ensureVoicesReady`.
- **Contract:** `docs/outcome-contracts/listen-fold-state.md`

## Assumptions (challenged)

- “Resume” is the visible fold, not a stored character index. Stored indexes go stale the moment the kid scrolls.
- Listen on an open word sheet should re-speak the sheet, not the passage underneath.
- Do not auto-resume the passage after the sheet closes — the next Listen click is the resume.

## Kill criteria

- Tapping a word while Listen is on leaves the sheet silent
- Listen after scroll always restarts at the title
- Quiz/Home still fail to stop speech

## Boundary

Do not change quiz coaching, parent pace, or word-example copy. Web Speech only.

## Bar-raiser baseline

| Approach | Interrupt word tap | Second Listen |
|---|---|---|
| Do nothing | Surface-stop races `beginSession` → sheet often silent | Always from block 0 |
| Store last word index | Fragile after scroll | Can restart mid-sentence in a paragraph that left the fold |
| Handoff + fold slice | Sheet owns the next session | Starts at the paragraph on screen |

## Definition of Done

- [x] Word tap stops Listen and auto-speaks the sheet
- [x] Listen starts from the in-fold paragraph
- [x] Handoff matrix tests + CI
- [x] Command evidence

## Command evidence

Evaluator (not Builder): `docs/outcome-contracts/evidence-listen-fold-state.md` — Status proven.

```
$ npm run ci
exit:0
# tests 73
# pass 73
```
