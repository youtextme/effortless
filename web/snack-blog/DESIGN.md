# Snack Blog — design law

Minimal book-like reading for `web/snack-blog/`. **This file is the guardrail** — future PRs must not reintroduce candy UI without an explicit version bump and Girish sign-off.

**Flow map:** [docs/snack-blog-flow.md](../docs/snack-blog-flow.md)  
**Version museum:** [versions/manifest.json](./versions/manifest.json) · live at https://youtextme.github.io/effortless/snack/

---

## Product law (non-negotiable)

| Law | Rule |
|-----|------|
| **Reading surface** | Text only — no hero images, illustrations, emoji walls, colored cards, coral/cream brand theater, glassmorphism, gradients, or big CTAs beside the text |
| **Typography** | High-contrast near-black on off-white; ~65ch measure; serif or calm editorial body; generous leading; quiet margins |
| **One thing at a time** | Read → Comprehension → Video observations → Share. Gate each step before the next |
| **Read gate** | Scroll to end before Continue. Optional 2px progress bar — must not steal focus |
| **Chrome** | No decorative nav chips, streak counters, confetti, or Stitch screenshot frames in the reading path |
| **Share** | Plain text share / clipboard — no carnival |

---

## Flow

| Step | What happens |
|------|----------------|
| **Read** | Single scrolling essay. Sections from `screens[]`. Hard words use `<dfn>` — no colored tip buttons |
| **Comprehension** | `comprehension[]` radio questions. Plain form |
| **Video observations** | `video.prompt` + optional `video.url` link. Textarea only — no embedded player chrome in the reading step |
| **Share** | Web Share API or clipboard. Quiet “another snack” text links |

Parent tools live in collapsed `<details>` at the bottom — never block the kid path.

---

## Tokens (v2 — minimal)

| Token | Value | Use |
|-------|-------|-----|
| Paper | `#FAF9F7` | Page background |
| Ink | `#111111` | Body, headings |
| Ink muted | `#4A4A4A` | Labels, hints |
| Rule | `#D8D4CC` | Dividers, borders |
| Measure | `65ch` | Article width |
| Body | `1.125rem` / `1.7` leading | Reading comfort |

**Forbidden in v2:** coral `#FF6B4A`, mint `#3DCF9F`, cream cards, rounded CTA pills, progress chips.

---

## Content schema

```json
{
  "title": "...",
  "screens": [{ "heading": "...", "body": "...", "tips": { "word": { "meaning": "...", "example": "..." } } }],
  "comprehension": [{ "question": "...", "choices": ["...", "..."], "answer": 0 }],
  "video": { "prompt": "...", "url": "optional", "minChars": 12 }
}
```

- ≤80 words per `screens[].body` (enforced in `validateSnack()`)
- At least one comprehension question required

---

## Version museum

| Version | Path | Era |
|---------|------|-----|
| **v2 · latest** | `/snack/` | Minimal book flow (this spec) |
| **v1 · stitch-cream** | `/snack/versions/v1-stitch-cream/` | Cream/coral Stitch polish — archived |

Before replacing latest, snapshot the current UI under `versions/vN-<slug>/` and add to `versions/manifest.json`.

Stitch comps in `docs/screenshots/snack-blog/stitch/` are **historical reference only** — not source of truth.

---

## Samples

| File | Title |
|------|-------|
| `content/sample-rain.json` | Why rain smells good (**default**) |
| `content/sample-mirror.json` | How a mirror helps you notice yourself |

---

## Android palette (unchanged)

Android app keeps green theme (`#1B5E20` / `#F1F8E9`) — web minimalism does not replace app tokens.

---

## Related

- [docs/snack-blog-flow.md](../docs/snack-blog-flow.md)
- [docs/stitch-prompts-snack-blog.md](../docs/stitch-prompts-snack-blog.md) — archived prompts; do not apply to v2
