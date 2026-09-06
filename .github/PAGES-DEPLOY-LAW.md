# GitHub Pages deploy law (effortless)

**Authoritative workflow:** `.github/workflows/github-pages.yml` on `main`.

## Rules

1. **Never `force_orphan`** on `gh-pages`. Orphan deploys wipe sibling apps (e.g. WordSpark root deploy removed `/snack/` on 2026-09-06).
2. **Always clone existing `gh-pages`**, rsync the app, commit, push — same pattern as `github-pages.yml`.
3. **Preserve `/snack/`** when deploying WordSpark to site root (`rsync --filter 'protect snack/'`).
4. **Preserve site root** when deploying snack (`rsync` only into `snack/`).
5. **Mirror WordSpark at `/wordspark/`** — rsync the same app into `wordspark/` after root deploy; protect both `snack/` and `wordspark/` during root rsync.
6. **Shared concurrency group:** `github-pages-deploy` — one deploy at a time.

## Branch workflows

If a feature branch ships its own Pages workflow (e.g. `wordspark-pages.yml`), it **must** follow rules 1–5. Do not use `peaceiris/actions-gh-pages` with `force_orphan: true`.

## Live URLs

| Path | App |
|------|-----|
| `/` | WordSpark (when present on deployed branch) |
| `/wordspark/` | WordSpark mirror (same CX as root) |
| `/snack/` | Blog snack (book-plain) |
| `/snack/versions/v1-stitch-cream/` | Version museum archive |

## Redeploy snack

Push to `main` (paths below) or run **Deploy GitHub Pages** → `workflow_dispatch` on GitHub Actions.

Trigger paths include `web/snack-blog/.pages-redeploy`.
