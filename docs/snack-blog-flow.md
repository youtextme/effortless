# Snack Blog — flow map

Prototype: **`web/snack-blog/`** · live: https://youtextme.github.io/effortless/snack/

---

## Kid path (one thing at a time)

**Read → Comprehension → Video observations → Share**

| Step | Gate | What happens |
|------|------|--------------|
| **Read** | Scroll to end | Single scrolling essay. Text only. Subtle top progress bar |
| **Comprehension** | Answer questions | Radio questions from `comprehension[]` |
| **Video observations** | Write observations | Plain prompt + optional video link + textarea |
| **Share** | — | Web Share or clipboard. Quiet links to another snack |

Default snack: **Why rain smells good** (`?snack=rain`). Alternate: `?snack=mirror`.

Parent tools (Ollama generate) live in collapsed **Parent tools** at the bottom — never blocks the kid path.

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

Design law: [web/snack-blog/DESIGN.md](../web/snack-blog/DESIGN.md)
