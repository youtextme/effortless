# Stitch prompts — Snack Blog prototype

**HTML is source of truth.** Stitch is polish only — pending Google Stitch session.

Ship gate: clickable prototype at `web/snack-blog/index.html` on branch `cursor/snack-blog-ux-7e6b` (PR #4).

Canvas: **390×844**, English, kid-safe, no login/cart.

---

## Brand (interim kid snack)

| Token | Hex |
|-------|-----|
| Cream | `#FFF8F0` |
| Ink | `#1A1A1A` |
| Coral CTA | `#FF6B4A` |
| Mint accent | `#3DCF9F` |

Body ~20–22px. Rounded cards. One primary CTA per screen. Reader: Ayaan, ~10 / 4th grade.

---

## Home (Discover)

```
Mobile kid reading app — cream #FFF8F0 background, ink #1A1A1A text.
Header small caps "EFFORTLESS · COGNITIVE MIRROR".
Progress chips: Discover (mint #3DCF9F fill), Read, Done, Next (idle tan).
Badge mint outline: "For Ayaan · 4th grade · English".
Hero: "Pick a snack" large serif.
Featured card with mint border: title "Why rain smells good", mint "~3 min" pill, hook about earthy rain smell, coral #FF6B4A pill "Start reading".
Second card: mirror snack title, ~3 min, coral outline "Start reading".
Collapsed footer link "Parent: create or generate a topic" — muted, not primary.
No login, cart, streak counter, or homework form above the fold.
```

---

## Read

```
Mobile reader, cream background, Read chip active (mint).
Thin horizontal segment progress bar (4 segments, 2 filled mint) — NOT percentage ring.
Label "WHY RAIN SMELLS GOOD" small caps.
Serif heading + 20-22px body paragraph, one mint-underlined tappable word "petrichor".
Optional bottom sheet: definition + "In life" example.
Single coral full-width button "Forward" — no back button.
Calm, zero preach.
```

---

## Done

```
Mobile done screen, Done chip mint active, cream background.
Soft sparkle — no loot box.
Headline "You finished this snack!"
Process praise: "You read the whole thing — nice focus, Ayaan." No score/streak lecture.
Coral "Next snack" + ink outline "Done for now".
```

---

## Export notes

- Diff Stitch output against `web/snack-blog/` — never replace kid Start-reading-first flow with create-first layouts.
- Design tokens also documented in [web/snack-blog/DESIGN.md](../web/snack-blog/DESIGN.md).
