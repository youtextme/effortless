# WordSpark Kindle restore — disk receipts (PR #22)

Fail-closed proof artifacts. Regenerate:

```bash
node wordspark/scripts/generate-restore-proof.mjs
```

| Receipt | Absolute path | Proves |
|---------|---------------|--------|
| Baseline SHAs | `/workspace/docs/proof/wordspark-restore/baseline.json` | Last-good CX commits + bad deploy SHA |
| Passage stats | `/workspace/docs/proof/wordspark-restore/passage-stats.json` | 100 DB, ~400w, 4 targets ×≥5 |
| Snack protect | `/workspace/docs/proof/wordspark-restore/snack-protect.json` | /snack/ rsync protect in deploy law |
| CI receipt | `/workspace/docs/proof/wordspark-restore/ci-receipt.txt` | Platform CI + passage-quality tests green |

CI gate: `.github/workflows/platform-ci.yml` (PR + cursor/**) and `github-pages.yml` needs ci job.
