# Outcome Contract — Kid-think quiz, Home tabs, resume + PWA

**Status:** active  
**Slug:** home-quiz-resume  
**Date:** 2026-09-08

## Outcome Frame

- **Job:** A kid can think through the day's lesson, find words/passages/settings in one Home, and pick up the same page after they leave — including after installing the app.
- **North Star:** Every quiz has 5 takeaway items (the top idea plus 4 more, spread) that a kid can answer from daily life, plus word items that teach meaning by example. Home has exactly 3 tabs. Reopening the app restores the last surface.
- **Key Results:**
  1. Quiz: 5 takeaway + 2 word questions, interleaved `T W T T W T T`; takeaway index span ≥ 4; no adult lab/police “correct” lines; first hint never pastes the answer; retry ≤ 50 words.
  2. Home: Words | Passages | Settings (name, speech speed, voice, install, certificates).
  3. Resume + PWA: last passage, scroll, Home tab, and quiz index restore; Install is always visible (not gated on `beforeinstallprompt`).
- **Workback:** contract → quiz bank/engine → Home component + Settings/PWA → resume in storage/shell → tests/CX/cache → Evaluator.
- **Agents:** Builder, Evaluator (fresh, not Builder).
- **Kill experiment:** Generate Day 1 questions; if a word item’s correct choice is still an adult dataset line (`Scientists analyze…` / `Police investigate…`), or takeaways are clumped in the first four slots, kill the slice.
- **Contract:** `docs/outcome-contracts/home-quiz-resume.md`

## Assumptions (challenged)

- “At least 4 more questions” means **five takeaway items total**, spread through the set — not four extra quizzes.
- “Every question can st…” treated as **stand alone**: each prompt is a complete think-and-answer item (no “see previous question”).
- Cross-device memory without an account is **not possible**. Laptop / tablet / phone each keep on-device memory. Install (PWA) reuses that same origin storage on that device.
- Current quiz fails because word items use dataset `example` as the key (`Scientists analyze data` vs `Police investigate crimes`). Kids cannot think those through.

## Kill criteria

- Word correct answers still use adult dataset examples
- Fewer than 5 takeaway items, or they are not spread (span < 4)
- Home is still a single Passages panel
- Install button remains `hidden` until `beforeinstallprompt` (iOS never fires)
- Boot always jumps to the first incomplete passage and forgets scroll / quiz / Home tab

## Boundary

Do not regress Listen fold, word-tap handoff, parent pace, or coaching-without-pass-wall (`PASS_THRESHOLD = 0`). No cloud accounts. Web Speech only.

Queued next (out of this slice): treat passages as one of many reusable capabilities (math, diagrams). Home catalogs and resume are built so those lists can plug in later — this slice does not add math/diagrams.

## Bar-raiser baseline

| Approach | Kid can think? | Come back later? | Install |
|---|---|---|---|
| Do nothing | No — match adult sentences / generic skill Qs | First incomplete passage, scroll lost | Hidden until Chromium prompt |
| Exact takeaway as the only correct choice × 5 | Memorise the sentence, not the idea | Same resume gap | Same |
| Scenario takeaways + kid word examples, Home tabs, local resume | Yes — dinner / homework / playground | Same device + installed PWA | Always offered, with Add to Home Screen copy |

## Definition of Done

- [ ] 5 takeaway questions reinforce the day's idea; 2 word questions use kid meaning/examples; spread + friend hints
- [ ] Home has Words, Passages, Settings
- [ ] Resume restores reading/home/quiz; Install always on Settings
- [ ] CX stories + NFRs + CI
- [ ] Command evidence from Evaluator (not Builder)

## Command evidence

_(filled after Evaluator)_
