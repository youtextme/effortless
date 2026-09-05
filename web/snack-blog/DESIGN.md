# Snack Blog — design spec

Screens, tokens, snack rules, and tone for `web/snack-blog/`.

**Flow map:** [docs/snack-blog-flow.md](../docs/snack-blog-flow.md)  
**Stitch prompts:** [docs/stitch-prompts-snack-blog.md](../docs/stitch-prompts-snack-blog.md)

> **Stitch polish pending Google session.** HTML prototype is source of truth until comps land.

---

## Product locks

| Lock | Value |
|------|--------|
| First snack | **Why rain smells good** (`sample-rain.json`) |
| Alternate | **How a mirror helps you notice yourself** (`sample-mirror.json`) |
| Reader | **Ayaan**, ~10 / 4th grade (3yo OUT) |
| Kid path | Discover → **Start reading** → Read → Done → Next |
| Parent path | Collapsed “Parent: create or generate” (never blocks kid) |
| Forbidden | Login, buy/cart, streak lectures |

---

## Kid snack palette (interim — web prototype)

These tokens apply to **`web/snack-blog/`** only. Android app keeps its existing green theme (`#1B5E20` / `#F1F8E9`) — do not replace.

| Token | Hex | Use |
|-------|-----|-----|
| Cream | `#FFF8F0` | Page + reader background |
| Ink | `#1A1A1A` | Headlines, body |
| Coral | `#FF6B4A` | Primary CTA (Start reading, Forward, Next snack) |
| Mint | `#3DCF9F` | Active progress chip, segment bar, word tips |

Typography: body **~20–22px** (`1.25rem–1.375rem`), rounded cards, **one primary CTA per screen**.

---

## Android palette (unchanged)

| Token | Hex |
|-------|-----|
| Primary green | `#1B5E20` |
| Background | `#F1F8E9` |

---

## Screen inventory

| Floor | Chip | Kid-facing |
|-------|------|------------|
| Home | Discover | Snack cards + **Start reading** (rain default) |
| Reader | Read | Segments progress, Forward only, optional word tips |
| Celebrate | Done | Process praise + Next / Done for now |
| Picker | Next | Rain + mirror sample cards |

---

## Sample snacks

| File | Title | Default? |
|------|-------|----------|
| `content/sample-rain.json` | Why rain smells good | **Yes** — primary Start reading |
| `content/sample-mirror.json` | How a mirror helps you notice yourself | Next picker + Home card |

Both validated in `app.js` (≤80 words/screen). Mirror = light Cognitive Mirror nod — blog snack only, not Haptic Mirror costume.

---

## Snack rules

1. ≤80 words per screen (enforced in `validateSnack()`)
2. One idea per screen
3. 4 screens per bundled sample (v1)
4. Kid-safe English; no commerce UI

---

## Copy tone

Calm, zero-preach, 4th-grade vocabulary. Process praise on Done — no scores or streaks.

---

## Related

- [docs/snack-blog-flow.md](../docs/snack-blog-flow.md)
- [docs/local-llm-blog-snack.md](../docs/local-llm-blog-snack.md)
