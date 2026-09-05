# Snack Blog — design spec & Stitch prompts

Design tokens, screen inventory, copy tone, snack rules, and **Google Stitch** prompts for the Effortless Blog snack prototype.

**Flow map (tree of truth):** [FLOW-MAP.md](./FLOW-MAP.md)

---

## Product locks

| Lock | Value |
|------|--------|
| First snack | **Why rain smells good** |
| Reader | **Ayaan**, ~10 / 4th grade |
| Not for | 3yo |
| Language | English |
| Palette | **Cream + ink** |
| Macro flow | Discover → Read → Done → Next |
| Forbidden | Login, buy/cart, tracking |

---

## Design tokens (cream + ink)

| Token | Value | Use |
|-------|-------|-----|
| `--color-cream` | `#FAF7F0` | Page background |
| `--color-cream-deep` | `#F3EDE3` | Badges, subtle fills |
| `--color-ink` | `#1A1814` | Headlines, primary buttons |
| `--color-ink-muted` | `#5C564E` | Body secondary, hints |
| `--color-ink-soft` | `#8A8278` | Labels |
| `--color-surface` | `#FFFDF8` | Cards |
| `--color-border` | `#DDD5C8` | Card borders |
| `--font-family` | Georgia, Palatino, serif | Reader headings & body |
| `--font-ui` | Segoe UI, system-ui | Buttons, chips, labels |
| `--text-hero` | `clamp(1.875rem, 5.5vw, 2.375rem)` | Floor titles |
| `--text-body` | `clamp(1.1875rem, 3.8vw, 1.4375rem)` | Reader (large for kids) |
| `--max-width` | `28rem` | Mobile column |

**Signature:** Warm cream paper, ink typography, uppercase progress chips, no purple AI gradients.

---

## Screen inventory

| ID | Chip | Hero copy |
|----|------|-----------|
| S1 | Discover | “Hi Ayaan — ready for a snack?” |
| S2 | Read | Dynamic heading from JSON |
| S3 | Done | “You finished this snack!” |
| S4 | Next | “Pick your next bite” |

Pick Blog + topic live on **Discover** (no separate chips).

---

## Copy tone

| Do | Don’t |
|----|--------|
| Calm, curious, 4th-grade vocabulary | Toddler baby-talk (3yo OUT) |
| “You” speaking to Ayaan | Shame or hype |
| Short sentences | Walls of text |
| Plain floor names | Jargon |

---

## Snack rules

1. **≤80 words per screen**
2. **One idea per screen**
3. **6 screens** default arc (4–8 acceptable)
4. **Kid-safe** — no commerce, ads, creepy tracking
5. **English only** in v1

---

## Stitch prompts

Use these verbatim (or with Stitch “Redesign”) for visual comps. Style: **mobile 390×844, cream #FAF7F0 background, ink #1A1814 text, serif reader, no login, no cart.**

### S1 — Discover

```
Mobile app screen, cream paper background #FAF7F0, ink typography.
Header: small caps "EFFORTLESS · COGNITIVE MIRROR".
Progress pills: Discover (filled black), Read, Done, Next (outlined tan).
Badge: "For Ayaan · 4th grade · English".
Hero: "Hi Ayaan — ready for a snack?" in large serif.
Subtext: blog snack = tiny story bites, one idea per screen.
Card with black pill label "BLOG" and subtitle "Short readable chunks".
Text field prefilled "Why rain smells good".
Primary black pill button "Read this snack".
Secondary outlined button "Generate new topic".
Calm, kid-safe, no shopping icons, no login.
```

### S2 — Read (example screen)

```
Mobile reader screen, cream background, progress pills with Read active.
Small label "WHY RAIN SMELLS GOOD".
Serif heading "Tiny helpers in soil" in ink.
Body paragraph large readable serif, max 5 lines, warm educational tone.
Footer "Screen 4 of 6".
Bottom: Previous (outline) and Next screen (filled black) buttons.
No ads, no nav bar clutter.
```

### S3 — Done

```
Mobile celebration screen, cream background, Done pill active.
Sparkle emoji subtle, serif headline "You finished this snack!"
Subtext "Nice work, Ayaan. You read Why rain smells good."
Italic reflection prompt.
Single primary button "Next snack".
No gamified chest or coins.
```

### S4 — Next

```
Mobile screen, Next pill active, cream background.
Headline "Pick your next bite" in serif.
Three rounded topic chips: "Why rain smells good", "How birds learn to fly", "What makes lightning".
Buttons: "Start fresh in Discover" (primary), "Read rain snack again" (secondary).
Minimal, calm, kid-safe.
```

---

## Interaction patterns

| Pattern | Behavior |
|---------|----------|
| Progress chips | 4 macro steps; `aria-current="step"` on active |
| Discover | Blog fixed; topic field; Read / Generate |
| Reader | Swipe + Previous/Next; ≤80 words enforced |
| Done → Next | No streak pressure |
| Next | Topic chips loop to Discover or Read |

---

## Accessibility

- 44×44px touch targets
- Focus rings on ink
- `aria-live="polite"` on reader pane

---

## AI-slop checklist

- [x] Cream + ink (not generic purple gradient)
- [x] Real sample: Why rain smells good
- [x] Floor labels match FLOW-MAP.md
- [x] Progress visible entire flow
- [x] No login / buy UI

---

## Related

- [FLOW-MAP.md](./FLOW-MAP.md)
- [docs/local-llm-blog-snack.md](../../docs/local-llm-blog-snack.md)
