# Snack Blog — flow map

Prototype: **`web/snack-blog/`** · live: https://youtextme.github.io/effortless/snack/

**Product law:** [web/snack-blog/DESIGN.md](../web/snack-blog/DESIGN.md) (book-plain, locked)

---

## Kid path (only these floors)

**Read → Comprehension → Video observations → Share**

| Step | Gate | What happens |
|------|------|--------------|
| **Read** | Scroll to end | Title + body. Text only. Scroll is the interaction |
| **Comprehension** | Answer questions | Plain questions + choices |
| **Video observations** | Write observations | Link or embed + observation prompts |
| **Share** | — | One quiet share control |

Default snack: **Why rain smells good** (`?snack=rain`). Alternate: `?snack=mirror`.

Parent tools + version museum live in collapsed **Parent tools** — not on the kid read path.

---

## Version museum

| Version | URL |
|---------|-----|
| v2 · latest | `/snack/` |
| v1 · stitch-cream | `/snack/versions/v1-stitch-cream/` |

Manifest: `web/snack-blog/versions/manifest.json`

---

## Open locally

```bash
npx --yes serve web/snack-blog -p 5173
```
