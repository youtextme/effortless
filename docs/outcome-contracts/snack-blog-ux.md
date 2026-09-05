# Outcome contract: Snack Blog UX prototype

**Status:** proven  
**Branch:** `cursor/snack-blog-ux-7e6b`  
**Created:** 2026-09-05

## Job

A parent and kid can follow every step of creating and reading a **Blog snack** — short, readable chunks — without confusion about where they are or what happens next.

## North Star

≥90% of first-time testers (parent + kid pair) can name all flow floors in order after one pass → measured by walkthrough checklist in PR notes.

## Key Results

| KR | Target | Evidence |
|----|--------|----------|
| KR1 Flow map | Documented Discover → Pick → Create → Read → Done | `docs/snack-blog-flow.md` |
| KR2 Prototype | Mobile-first HTML, ≥4 labeled steps, progress chips | `web/snack-blog/index.html` opens locally |
| KR3 Design rules | Screen/word limits, tone, tokens | `web/snack-blog/DESIGN.md` |
| KR4 Local LLM path | Ollama script + doc from topic → JSON snack | `scripts/generate-blog-snack.mjs` + `docs/local-llm-blog-snack.md` |
| KR5 Ship | Draft PR with screenshots | GitHub PR vs `main` |

## Kill experiment

If a static HTML stepper cannot show ≥4 distinct floors with progress chips in one file without a build step, pivot to a single-page doc-only deliverable and kill the interactive prototype slice.

**Result:** Kill experiment passed — vanilla HTML/CSS/JS stepper is sufficient.

## Baseline (how people solve this today)

| Approach | Metric | Gap |
|----------|--------|-----|
| Long-form blog / Medium | Avg article 1,500+ words | Wall of text for ~10yo readers |
| ChatGPT paste | No kid-safe flow, no progress | Parent does everything; kid passive |
| Do nothing | 0 structured snacks | No Cognitive Mirror habit loop |

## Boundaries

- No WhatsApp plumbing in this slice
- No paid SaaS, tracking pixels, or commerce UI
- English UI only for prototype

## Verification plan

1. Open `web/snack-blog/index.html` — complete flow end-to-end
2. Confirm sample blog loads (growth/curiosity theme)
3. Run `node scripts/generate-blog-snack.mjs --help`
4. PR screenshots of each floor

## Command evidence

```bash
# Prototype files
test -f web/snack-blog/index.html && echo "prototype:ok"   # exit 0 → prototype:ok
test -f web/snack-blog/content/sample-curiosity.json && echo "sample:ok"   # exit 0 → sample:ok

# Generator CLI
node scripts/generate-blog-snack.mjs --help   # exit 0

# Local server smoke (optional)
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/   # → 200 when served
```

Screenshots: `docs/screenshots/snack-blog/*.png` (Discover, Pick, Create, Read, Done).
