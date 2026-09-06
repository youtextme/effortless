# Outcome Contract — WordSpark Kindle Restore

## Job
Restore WordSpark at site root to pre–600-word snack-era reading CX: ~400-word blog passages, 4 target words × ≥5 occurrences, teleprompter read-aloud, minimal flow — without breaking `/snack/`.

## North Star
A kid opens https://youtextme.github.io/effortless/, enters name, reads passage 1 (~400 words, 4 highlighted words), taps Listen, hears teleprompter read-aloud, completes quiz — no login.

## Disk receipts (fail-closed)

Regenerate: `node wordspark/scripts/generate-restore-proof.mjs`

| # | Proof | Absolute path |
|---|-------|-----------------|
| 1 | **Last-good CX baseline SHAs** | `/workspace/docs/proof/wordspark-restore/baseline.json` |
| 2 | **Passage DB + 400w / 4×≥5 stats** | `/workspace/docs/proof/wordspark-restore/passage-stats.json` |
| 3 | **/snack/ protect law** | `/workspace/docs/proof/wordspark-restore/snack-protect.json` |
| 4 | **TDD/CI green receipt** | `/workspace/docs/proof/wordspark-restore/ci-receipt.txt` |
| 5 | **Receipt index** | `/workspace/docs/proof/wordspark-restore/README.md` |

## Baseline commits (summary — full detail in `baseline.json`)

| Role | SHA | Notes |
|------|-----|-------|
| **Last good teleprompter TTS** | `146fc745` | Chrome read-aloud, teleprompter highlight |
| **Last good word-repetition pedagogy** | `e71afb0` | Templates restored as 4×5 @ ~400w |
| **Bad 600-word regression** | `537663f` → deployed `ab98024` | 10 words × 1, ~710w |
| **Snack protect law** | `364e395` | rsync `protect snack/` |

Branch source for speech/shell: `origin/cursor/harden-speech-listen-206f`

## TDD / CI

| Gate | Path |
|------|------|
| Platform CI workflow | `.github/workflows/platform-ci.yml` |
| Pages deploy (needs CI) | `.github/workflows/github-pages.yml` |
| Passage quality tests | `wordspark/platform/passage/passage-quality.test.js` |
| CI runner | `platform/scripts/run-ci.mjs` |
| Proof generator | `wordspark/scripts/generate-restore-proof.mjs` |

## Definition of Done

- [x] `node platform/scripts/run-ci.mjs` exit 0 — see `ci-receipt.txt`
- [x] All 100 passages pass `validatePassage()` — see `passage-stats.json`
- [x] Disk receipts on branch; test asserts they exist
- [ ] PR merged; gh-pages deploy preserves `/snack/` — verify post-merge
