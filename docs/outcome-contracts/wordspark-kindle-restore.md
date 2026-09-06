# Outcome Contract — WordSpark Kindle Restore

## Job
Restore WordSpark at site root to pre–600-word snack-era reading CX: ~400-word blog passages, 4 target words × ≥5 occurrences, teleprompter read-aloud, minimal flow — without breaking `/snack/`.

## North Star
A kid opens https://youtextme.github.io/effortless/, enters name, reads passage 1 (~400 words, 4 highlighted words), taps Listen, hears teleprompter read-aloud, completes quiz — no login.

## Key Results
1. `VOCABULARY` static DB: 100 passages (`wordspark/js/data/words.js`)
2. Passage generator: 350–450 words, 4 targets, each ≥5 in context
3. Read-aloud: `#btn-listen` + `data-speech-surface` (platform speech from `origin/cursor/harden-speech-listen-206f`)
4. Pages deploy: rsync WordSpark root, `protect snack/` (`.github/PAGES-DEPLOY-LAW.md`)
5. CI: `passage-quality.test.js` + platform CI green

## Baseline commits (gh-pages / wordspark history)
| Role | SHA | Notes |
|------|-----|-------|
| Last good teleprompter TTS | `146fc745` | Chrome read-aloud fix, slower pace |
| Pre-600-word pedagogy | `e71afb0` | Word repetition templates (~10×10) |
| Bad 600-word deploy | `ab98024` | gh-pages orphan deploy; 10 words × 1 |
| Snack protect law | `364e395` | rsync `protect snack/` |

## Kill
- Breaking `/effortless/snack/`
- Claiming done without tests + live checklist

## Definition of Done
- [ ] `node platform/scripts/run-ci.mjs` exit 0
- [ ] All 100 passages pass `validatePassage()`
- [ ] Static server smoke: favicon 200, first read without login
- [ ] PR merged; gh-pages deploy preserves `/snack/`
