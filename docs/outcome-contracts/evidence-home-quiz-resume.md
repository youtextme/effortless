# Evidence — Kid-think quiz, Home tabs, resume + PWA

**Contract:** `docs/outcome-contracts/home-quiz-resume.md`  
**Slug:** home-quiz-resume  
**Evaluator:** independent (not the Builder)  
**Date:** 2026-09-08  
**Status:** proven

Graded against the contract and listed artifacts only. No product code was edited.

Builder: copy the **Command evidence (Evaluator)** block below into `docs/outcome-contracts/home-quiz-resume.md` → `## Command evidence`.

## Outcome Frame (from contract)

- **Job:** A kid can think through the day's lesson, find words/passages/settings in one Home, and pick up the same page after they leave — including after installing the app.
- **North Star:** Every quiz has 5 takeaway items (the top idea plus 4 more, spread) that a kid can answer from daily life, plus word items that teach meaning by example. Home has exactly 3 tabs. Reopening the app restores the last surface.
- **Kill experiment:** Generate Day 1 questions; if a word item’s correct choice is still an adult dataset line (`Scientists analyze…` / `Police investigate…`), or takeaways are clumped in the first four slots, kill the slice.

## What was inspected

| Artifact | How |
|---|---|
| `docs/outcome-contracts/home-quiz-resume.md` | full read |
| `wordspark/js/questions.js` | full read + imported in kill/audit |
| `wordspark/js/quiz-takeaways.js` | full read + `takeawayPack` imported |
| `wordspark/js/storage.js` | full read + `getBootTarget` / `saveResume` imported |
| `wordspark/platform/components/home.js` | full read + `HOME_TABS` / `installState` imported |
| `wordspark/index.html` | Home tabs, Settings fields, `#btn-install` markup |
| `wordspark/platform/shell.js` | `restoreSession`, `updateInstallUi`, `startQuiz({ index })`, `openHome` |
| `wordspark/platform/components/quiz.test.js` | full read + CI |
| `wordspark/platform/components/home.test.js` | full read + CI |
| `wordspark/platform/components/storage.test.js` | full read + CI |
| `wordspark/platform/components/quiz.js` / `storage.js` | generate / coach / `PASS_THRESHOLD` wiring |
| `wordspark/js/word-usage.js` `getWordExplanation` | adult-dataset filter on examples |
| `platform/cx/stories.json` / `nfr.json` / `journeys.json` | slice stories + NFRs + `kid-comes-back` |
| `wordspark/sw.js` | `CACHE_NAME` + `home.js` / `quiz-takeaways.js` assets |
| Slice commit `7f1e154` | `--stat` vs parent `4a82033` |

No live browser, Web Speech, or installed-PWA session. Resume proof is `getBootTarget` + shell wiring, not a reopened tab.

## What was run

1. Instructed Day-1 kill experiment (generate questions, adult-correct filter, takeaway span).
2. Independent all-100-days audit (pattern, span, adult correct, hint leak, retry length, Home tabs, install `hidden`, boot targets).
3. Extra `wordspark/js/questions.test.mjs` (not in CI globs).
4. Full `npm run ci`.

## Command evidence (Evaluator)

```
$ cd /workspace && node --import ./platform/test/polyfill-storage.mjs -e "
import { generateQuestions, takeawayIndexes, QUIZ_PATTERN } from './wordspark/js/questions.js';
import { VOCABULARY } from './wordspark/js/data/words.js';
const qs = generateQuestions(VOCABULARY[0]);
const adult = /scientist|police|darwin|laboratory/i;
const words = qs.filter(q => q.kind === 'word');
const bad = words.filter(q => adult.test(q.choices.find(c => c.correct).text));
const idx = takeawayIndexes(qs);
console.log(JSON.stringify({
  length: qs.length,
  pattern: qs.map(q => q.kind),
  expected: [...QUIZ_PATTERN],
  takeawaySpan: idx[4]-idx[0],
  adultCorrect: bad.map(q => q.choices.find(c => c.correct).text),
}, null, 2));
"
exit:0
```

Kill-experiment stdout:

```
{
  "length": 7,
  "pattern": ["takeaway","word","takeaway","takeaway","word","takeaway","takeaway"],
  "expected": ["takeaway","word","takeaway","takeaway","word","takeaway","takeaway"],
  "takeawaySpan": 6,
  "adultCorrect": []
}
```

Day-1 takeaway indexes (same import): `[0, 2, 3, 5, 6]` — span `6 >= 4`, not the first four slots.

Day-1 word **correct** lines (not adult dataset):

- `"We stayed curious even when the game was hard."`
- `"It means to reach a decision after thinking."`

```
$ cd /workspace && node --import ./platform/test/polyfill-storage.mjs --input-type=module -e "<all-100-days + home/install/boot audit>"
exit:0
```

Independent audit (Evaluator, not the Builder’s tests):

| Check | Result |
|---|---|
| Vocab days | 100 |
| Unique takeaways | 10; every `takeawayPack` length ≥ 5 |
| Pattern `T W T T W T T` / length 7 | **0** mismatches |
| Takeaways `< 5` | **0** |
| Takeaway span `< 4` | **0** |
| Word correct matching adult regex | **0** |
| `thinkAloud` contains correct / first hint `===` correct | **0** |
| Retry `coachMessage(q, 2)` word count `> 50` | **0** |
| `HOME_TABS` / HTML `data-home-tab` | `words`, `passages`, `settings` (exactly 3) |
| Settings: name, speech speed, voice, install, certificates | all present in `index.html` |
| `#btn-install` opening tag | `<button class="btn-primary" type="button" id="btn-install">` — no `hidden` |
| `installState({ canPrompt: false })` | `kind: 'howto'`, copy matches `/Add to Home Screen/i` |
| `updateInstallUi` | `btn.hidden = false` (never gates on the event) |
| `getBootTarget` reading | `{ surface: 'reading', passage: 4, scrollY: 320 }` |
| `getBootTarget` home | `{ surface: 'home', homeTab: 'words' }` |
| `getBootTarget` quiz | `{ surface: 'quiz', quizIndex: 3 }` |
| After `completePassage(4)` | `{ surface: 'reading', passage: 5 }` (quiz not restored) |
| Shell `restoreSession` | wired: `getBootTarget`, `openHome(target.homeTab)`, `startQuiz({ index:` |

```
$ cd /workspace && node --test --import ./platform/test/polyfill-storage.mjs wordspark/js/questions.test.mjs
exit:0
# tests 4
# pass 4
# fail 0
```

```
$ cd /workspace && npm run ci
exit:0
# tests 81
# pass 81
# fail 0
# all files line 99.53 / branch 89.07 / funcs 98.78
# CI OK
# Platform validation OK — 10 components, kernel 1.0.0
# Agent-guard OK — 13 test files
# CX analyzer OK — 23 stories, 13 NFRs, 4 journeys
```

Slice stories in that CI run (all pass):

- `story:quiz-takeaway-spread component:quiz five takeaways are spread and word items are kid copy`
- `story:quiz-takeaway-spread every unique takeaway pack generates a stand-alone set`
- `story:quiz-requires-comprehension-pass quiz coaches takeaways without a pass wall` (twice: components + quiz)
- `story:home-three-tabs component:home Words Passages Settings`
- `story:install-pwa-visible component:home install is always offered`
- `story:resume-where-left-off component:storage restores home quiz and reading`
- `story:resume-where-left-off shell restores the boot target`

Boundary stories still green in the same run: `story:listen-from-fold`, `story:word-tap-takes-listen`, `story:one-rate-per-session` / parent pace, `PASS_THRESHOLD = 0`.

Git: parent of `7f1e154` had `CACHE_NAME = 'wordspark-v24'`; this slice is `wordspark-v25`. ASSETS add `./platform/components/home.js` and `./js/quiz-takeaways.js`.

Coverage note: agent-guard `coverageInclude` still lists kernel + selected speech files only. Line coverage **does not** prove `questions.js`, `quiz-takeaways.js`, `storage.js`, `home.js`, or `shell.js`. Proof for this slice is the tests + independent imports above.

## Key Results

### KR1 — Quiz: 5 takeaway + 2 word, `T W T T W T T`, span ≥ 4, no adult correct, first hint does not paste, retry ≤ 50 words — **PASS**

Falsifier: word keys still adult dataset lines; takeaways fewer than 5 or clumped (span `< 4`); first miss equals/contains the correct choice; retry longer than 50 words.

Evidence it does not:

- `QUIZ_PATTERN` is frozen `takeaway, word, takeaway, takeaway, word, takeaway, takeaway`. `generateQuestions` interleaves 5 `takeawayPack` items + 2 word items (`usageQuestion` then `meaningQuestion`).
- Word correct text is `getWordExplanation(...).examples[0]` or `.simple`, not `wordData.example`. Day-1 correct lines are kid copy (above), not `Scientists analyze…` / `Police investigate…`.
- Kill experiment: `adultCorrect: []`, `takeawaySpan: 6`. All 100 days: 0 adult hits, 0 short/clumped sets, 0 pattern mismatches.
- First miss uses `coachMessage(q, 1)` → `thinkAloud`. Tests + audit: `thinkAloud.includes(correct) === false` and first hint `!==` correct. Day-1 prompts are dinner / homework / playground / sibling / this-week, each ending `?`.
- `makeQuestion` clips `retryAloud` with `clipWords(..., 50)`; later misses return that. Audit: 0 retries `> 50` words. `PASS_THRESHOLD === 0`.

### KR2 — Home is Words \| Passages \| Settings (name, speech speed, voice, install, certificates) — **PASS**

Falsifier: Home is still one Passages panel, or Settings is missing those five controls.

Evidence:

- `HOME_TABS` length 3, ids `words`, `passages`, `settings`. `HomeComponent.health()` requires length 3.
- `index.html` `#screen-home` tablist has exactly those three `data-home-tab` buttons and matching `data-home-panel` panels.
- Settings panel contains `#settings-child-name`, Speech speed (`data-pace` gentle/home/brisk/quick), `#settings-voice-name`, `#btn-install` + `#install-copy`, `#btn-settings-certs`.

### KR3 — Resume restores passage / scroll / Home tab / quiz index; Install always offered (not gated on `beforeinstallprompt`) — **PASS**

Falsifier: boot always opens the first incomplete passage and drops scroll / quiz / Home tab; Install stays `hidden` until Chromium fires `beforeinstallprompt`.

Evidence it does not:

- `saveResume` / `getBootTarget` persist `passage`, `scrollY`, `surface`, `homeTab`, `quizIndex`. Independent boot table above matches the storage test.
- `bootShell` calls `restoreSession()` when onboarded. `restoreSession` loads `getBootTarget()`, then `openHome(target.homeTab)` or `startQuiz({ index: target.quizIndex || 0 })` or `loadPassage(..., { scrollY })`.
- Completed-passage quiz resume is rewritten to the next reading surface (`completePassage(4)` → passage 5, not quiz).
- `#btn-install` ships without `hidden`. `updateInstallUi` always sets `btn.hidden = false`. `beforeinstallprompt` only stashes `_deferredPrompt` and refreshes copy. With no prompt, `installState` is `howto` + Add to Home Screen copy; the button stays enabled as `How to install`.

Gap (does not flip KR): `restoreSession` is not exported, so boot wiring is a source match plus storage behavior — not a jsdom/Playwright reopen.

## Kill criteria

| Criterion | Result |
|---|---|
| Word correct answers still use adult dataset examples | **not hit** — Day-1 `adultCorrect: []`; 0 hits across 100 days |
| Fewer than 5 takeaway items, or span `< 4` | **not hit** — Day-1 indexes `[0,2,3,5,6]` span 6; 0 short/clumped days |
| Home is still a single Passages panel | **not hit** — three tabs in `HOME_TABS` and `index.html` |
| Install button remains `hidden` until `beforeinstallprompt` | **not hit** — no `hidden` on the tag; `updateInstallUi` forces `hidden = false`; howto path does not wait for the event |
| Boot always jumps to the first incomplete passage and forgets scroll / quiz / Home tab | **not hit** — `getBootTarget` restores reading 4 @ 320, home/words, quiz index 3 |

Kill experiment (Day-1 generate): **holds**.

## Definition of Done (contract checklist)

| Item | Evaluator |
|---|---|
| 5 takeaway questions reinforce the day's idea; 2 word questions use kid meaning/examples; spread + friend hints | **met** (generate + audit + tests; not a live child session) |
| Home has Words, Passages, Settings | **met** |
| Resume restores reading/home/quiz; Install always on Settings | **met** in storage + shell wiring + install UI (not a live PWA install) |
| CX stories + NFRs + CI | **met** — stories `quiz-takeaway-spread`, `home-three-tabs`, `resume-where-left-off`, `install-pwa-visible`; NFRs `quiz-kid-think`, `home-three-tabs`, `resume-on-device`, `pwa-install-visible`; journey `kid-comes-back`; CI `exit:0` 81/81 |
| Command evidence from Evaluator | **met** in **this** file. Contract file still `Status: active` with empty Command evidence — Builder copies the block above |

Boundary (Listen fold, word-tap handoff, parent pace, `PASS_THRESHOLD = 0`, no cloud accounts, Web Speech only): slice `--stat` does not remove fold/session/lifecycle or word-sheet handoff. Parent pace buttons remain. `PASS_THRESHOLD = 0` remains. CI still passes those stories.

## Minority-veto

**No veto** on kill criteria or a falsified KR.

Non-blocking remainder (does not flip Status):

1. No live reopen / Add-to-Home-Screen capture. Do not treat this file as device-install proof.
2. `restoreSession` is source-inspected, not executed as a function.
3. Slice modules are coverage-excluded; 99.53% lines is not proof of `questions.js` / `home.js` / `storage.js` / `shell.js`.
4. `wordspark/js/questions.test.mjs` is outside CI globs (Evaluator extra run: 4/4 pass).
5. Contract file itself remains `Status: active` until Builder copies receipts and marks DoD.

## Sources read

- `docs/outcome-contracts/home-quiz-resume.md`
- `wordspark/js/questions.js`
- `wordspark/js/quiz-takeaways.js`
- `wordspark/js/storage.js`
- `wordspark/js/word-usage.js` (`getWordExplanation`, `datasetUsable`)
- `wordspark/platform/components/home.js`
- `wordspark/platform/components/quiz.js`
- `wordspark/platform/components/storage.js`
- `wordspark/platform/components/{quiz,home,storage,components}.test.js`
- `wordspark/js/questions.test.mjs`
- `wordspark/index.html` (Home + Settings + `#btn-install`)
- `wordspark/platform/shell.js` (`restoreSession`, `updateInstallUi`, `startQuiz`)
- `wordspark/sw.js`
- `platform/cx/stories.json` / `nfr.json` / `journeys.json`
- `platform/COMPONENT-MANIFEST.json` (`home`)
- git `7f1e154` vs parent for `CACHE_NAME`
