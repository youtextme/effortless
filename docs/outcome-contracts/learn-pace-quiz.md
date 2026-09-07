# Outcome Contract — Parent pace, best voice, coaching quiz

**Status:** proven  
**Slug:** learn-pace-quiz  
**Date:** 2026-09-07  
**Evaluator evidence:** `docs/outcome-contracts/evidence-learn-pace-quiz.md`

## Outcome Frame

- **Job:** A 10-year-old hears the passage at a steady home-parent pace (title included), never hears hidden copy, and learns takeaways through coaching instead of a pass/fail quiz.
- **North Star:** Hidden headings spoken → 0. Title spoken at the same rate as paragraphs. Wrong answers coach; kids finish by learning, not by a 10/15 cutoff. Stuck 6/15 toast → gone.
- **Key Results:**
  1. One client-side `best-voice` picker (no robot/espeak/compact); sticky best voice; parent pace control in Parents.
  2. Title is not word-by-word; same `getSpeechRate()` as body.
  3. `passage-h2` is not in the DOM; TTS skips `[hidden]` / `aria-hidden` / `display:none`.
  4. Quiz coaches on miss; no pass threshold; toast auto-hides.
- **Kill experiment:** If the device only has a compact/espeak voice, picker still returns the highest non-blocked score and does not crash.
- **Contract:** `docs/outcome-contracts/learn-pace-quiz.md`

## Kill criteria

- Hidden section headings still wrapped/spoken
- Title still uses word-by-word (`spans.length <= 10`)
- Fail toast `Got N/total` remains on screen with no timer
- Quiz reveals the correct choice on the first miss

## Boundary

No paid cloud TTS. Web Speech API only. No recording children.

## Definition of Done

- [x] Best-voice library + parent pace control
- [x] Hidden headings removed; TTS skips silent nodes
- [x] Coaching quiz without pass wall
- [x] Toast dismisses; cache bump; Pages-ready

## Command evidence (Evaluator re-run 2026-09-07)

```
node --test wordspark/js/*.test.mjs
# tests 14, pass 14, fail 0, exit 0

node platform/scripts/validate-platform.mjs
# Platform validation OK — 8 components, kernel 1.0.0, exit 0
```

Kill greps (Evaluator): `spans.length <= 10` absent from `tts.js`; `to pass` / `Got ${quizScore}` absent from `shell.js`; `sectionToHtml` does not emit `passage-h2`; first-miss path does not add `.correct`.

Full grade: `docs/outcome-contracts/evidence-learn-pace-quiz.md`
