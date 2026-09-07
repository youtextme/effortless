# Evidence — learn-pace-quiz

**Status:** proven  
**Evaluator:** independent (not Builder)  
**Date:** 2026-09-07  
**Branch:** `cursor/learn-pace-quiz-206f`  
**Contract:** `docs/outcome-contracts/learn-pace-quiz.md`

Graded working tree on disk. Builder receipts were not trusted; commands below were re-run by the Evaluator.

## Outcome Frame (evaluated)

- **Job:** A 10-year-old hears the passage at a steady home-parent pace (title included), never hears hidden copy, and learns takeaways through coaching instead of a pass/fail quiz.
- **North Star:** Hidden headings spoken → 0. Title spoken at the same rate as paragraphs. Wrong answers coach; kids finish by learning, not by a 10/15 cutoff. Stuck 6/15 toast → gone.
- **Kill experiment:** Device with only compact/espeak still returns a voice and does not crash — **held** (`pickBestVoice` returns `espeak-compact`).

## Command evidence

```
$ node --test wordspark/js/*.test.mjs
# tests 14
# pass 14
# fail 0
exit:0
```

```
$ node platform/scripts/validate-platform.mjs
Platform validation OK — 8 components, kernel 1.0.0
exit:0
```

Independent Evaluator probes (not in Builder test suite; same working tree):

```
$ node --input-type=module  # sectionToHtml / kill strings / coach / robot-only picker
sectionToHtml_has_passage-h2 false
sectionToHtml_has_h2_text false
kill_spans_le_10_in_tts false
kill_to_pass_in_shell false
kill_got_quizScore_in_shell false
first_miss_path_adds_correct false
correct_class_only_on_right_answer_branch true
toast_autohide_ms true
finishQuiz_showToast false
kill_exp_robot_only_uri espeak-compact
PASS_THRESHOLD 0
first_miss_includes_correct false
exit:0
```

## Kill criteria table

| Kill criterion | Result | File proof |
|---|---|---|
| Hidden section headings still wrapped/spoken | **pass** (criterion not met) | `sectionToHtml` (`wordspark/js/passage-generator.js` 208–217) emits only `<p>` from `section.body`; never interpolates `section.h2` or `passage-h2`. Probe: HTML sample is `<p>…</p>` only; `h2` text absent. Shell injects that HTML into `#passage-content` (`shell.js` 203–205). TTS also skips `[hidden]` / `aria-hidden` / `display:none` / `.passage-h2` (`tts.js` 70–91). |
| Title still uses word-by-word (`spans.length <= 10`) | **pass** (criterion not met) | Grep of `wordspark/js/tts.js`: `spans.length <= 10` **absent**. `speakInRoot` (361–371) always uses `speakWithTimedHighlight`. Title and body both call `speakInRoot(..., { rate: getSpeechRate() })` (`tts.js` 494–508). HEAD previously branched on `spans.length <= 10`. |
| Fail toast `Got N/total` remains on screen with no timer | **pass** (criterion not met) | Grep of `wordspark/platform/shell.js`: `to pass` **absent**; `Got ${quizScore}` **absent**. `finishQuiz` (417–426) never calls `showToast`; always completes. `showToast` auto-hides at 2800ms (547–560). `PASS_THRESHOLD === 0` (`questions.js` 127). |
| Quiz reveals the correct choice on the first miss | **pass** (criterion not met) | `handleAnswer` miss path (408–414) adds `.wrong` to the clicked button only — does **not** add `.correct`. `.correct` is added only inside `if (correct)` (392–396). `coachMessage(..., 1)` is `thinkAloud`, which tests assert does not include the correct choice text. |

## DoD

| Item | Grade |
|---|---|
| Best-voice library + parent pace control | **pass** — `wordspark/js/best-voice.js` + sticky URI; `speech-settings.js` `home` 0.94 / `quick` 1.10; Parents buttons `data-pace` in `index.html` 96–102; `shell.js` 130–136. |
| Hidden headings removed; TTS skips silent nodes | **pass** — see kill row 1. |
| Coaching quiz without pass wall | **pass** — 6 takeaway/daily-life questions; miss → coach; `finishQuiz` always proceeds with `passed: true`. |
| Toast dismisses; cache bump; Pages-ready | **pass** — 2800ms hide; `sw.js` `CACHE_NAME = 'wordspark-v16'` (was `v15`); `best-voice.js` + `speech-settings.js` in SW `ASSETS`; platform validate exit 0. |

## On-disk corroboration (not Evaluator-driven)

Builder Playwright dumps under `.playwright-mcp/` are **untrusted as live proof**. They are consistent with source: passage article is paragraphs only (no `passage-h2` / “Why This Matters”); first miss shows hint with the correct button still enabled; second miss shows `Keywords: …`; completion PNG `wordspark-complete-no-fail-toast.png` is “Well done!” with no `Got N/total` toast.

## Gaps

**Blocking:** none.

**Non-blocking leftovers:**

- Dead CSS `.passage-h2 { display: none }` remains in `wordspark/css/app.css` 157–159. Not in DOM output path.
- Choice buttons still have `data-correct="true|false"` in markup (`shell.js` 382). Visual `.correct` class is not applied on first miss.
- Product JS/HTML/CSS on this branch was uncommitted at evaluation time; grade is of the working tree, not of `HEAD`.
