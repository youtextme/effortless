# Snack Blog — design spec

Design tokens, screen inventory, copy tone, and snack rules for the Effortless Blog snack prototype (`web/snack-blog/`).

---

## Design tokens

Aligned with the Android Effortless theme (calm green, soft background).

| Token | Value | Use |
|-------|-------|-----|
| `--color-primary` | `#1B5E20` | Buttons, active chips, headings accent |
| `--color-primary-soft` | `#33691E` | Secondary actions, borders |
| `--color-bg` | `#F1F8E9` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, reader pane |
| `--color-text` | `#1A2E1A` | Body copy |
| `--color-text-muted` | `#4A5D4A` | Hints, subtitles |
| `--color-chip-inactive` | `#C8E6C9` | Progress chip idle |
| `--font-family` | `"Segoe UI", system-ui, sans-serif` | All UI |
| `--text-hero` | `clamp(1.75rem, 5vw, 2.25rem)` | Floor titles |
| `--text-body` | `clamp(1.125rem, 3.5vw, 1.375rem)` | Reader body (large for kids) |
| `--text-label` | `0.8125rem` | Chips, screen counter |
| `--space-page` | `1.25rem` | Mobile padding |
| `--radius-card` | `1rem` | Cards |
| `--radius-button` | `999px` | Pill buttons |
| `--max-width` | `28rem` | Phone-first column |

**Signature:** Soft green wash + pill progress chips + one emoji anchor per floor (no stock-photo clutter).

---

## Screen inventory

| ID | Floor | Route step | Primary copy (hero) |
|----|-------|------------|---------------------|
| S1 | Discover | `discover` | “Tiny reading snacks for curious minds” |
| S2 | Pick | `pick` | “Pick a snack type” |
| S3 | Create | `create` | “Create your blog snack” |
| S4 | Read | `read` | Dynamic: screen heading from JSON |
| S5 | Done | `done` | “You finished this snack!” |

Progress chip bar visible on all floors except full-screen read (compact bar retained).

---

## Copy tone

| Do | Don’t |
|----|--------|
| Short sentences, warm and calm | ALL CAPS hype, slang that ages badly |
| “You” and “we” | Shame (“You should know this”) |
| Growth language: yet, try, notice | Fixed mindset: “smart vs dumb” |
| One emoji max per floor | Emoji spam |
| Plain English floor names | Internal jargon (“CMS”, “pipeline”) |

**Audience:** ~10-year-old reader with parent co-navigating. Parent-facing hints in smaller muted text where needed.

---

## Snack rules (Blog type)

These rules apply to **generated** and **sample** content.

1. **≤80 words per screen** — enforced in generator prompt and validated in `app.js` before display.
2. **One idea per screen** — no bullet lists longer than 3 items; prefer prose.
3. **6–8 screens** per snack — enough arc, not a novel.
4. **Title** ≤ 8 words — kid can say it aloud.
5. **Kid-safe** — no purchases, ads, scary content, or personal data collection UI.
6. **No wall of text** — if a draft exceeds word limit, split into another screen.

---

## Interaction patterns

| Pattern | Behavior |
|---------|----------|
| Primary button | Full-width pill at bottom safe area |
| Progress chips | 5 labels; current step filled primary |
| Reader | Previous / Next; swipe optional via touch handlers |
| Create | Topic field + “Try sample” + “Generate” (calls Ollama when available) |
| Done | “Another snack” resets to Pick; “Start over” → Discover |

---

## Accessibility

- Minimum touch target 44×44px
- Focus rings on interactive elements
- `aria-current="step"` on active chip
- Reader: `aria-live="polite"` on screen change

---

## AI-slop checklist (pre-ship)

- [ ] No generic purple-gradient “AI app” palette — uses Effortless green
- [ ] No lorem ipsum — sample snack is real curiosity copy
- [ ] Floor labels match flow map doc exactly
- [ ] Progress always visible during multi-step flow

---

## Related docs

- Flow map: [docs/snack-blog-flow.md](../../docs/snack-blog-flow.md)
- Local LLM: [docs/local-llm-blog-snack.md](../../docs/local-llm-blog-snack.md)
