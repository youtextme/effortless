# Snack Blog — flow map

One-page floor map. Prototype: **`web/snack-blog/`** · branch `cursor/snack-blog-ux-7e6b` · PR #4.

**Handoff:** All UX under `web/snack-blog/`. Docs in `docs/`. No parallel workspace-only tree.

---

## Kid happy path (zero-preach)

**Discover → Start reading → Read → Done → Next**

| Chip | Floor | What happens |
|------|-------|--------------|
| **Discover** | Home | Snack cards. **Start reading** on rain (default) jumps straight to Read — no Create step. |
| **Read** | Reader | ≤80 words/screen, segment progress, Forward only. |
| **Done** | Celebrate | Process praise. **Next snack** or **Done for now**. |
| **Next** | Picker | Rain + mirror sample cards. |

Parent builder (Ollama generate) lives in collapsed `<details>` — never blocks kid.

---

## Sample snacks

| File | Title |
|------|--------|
| `content/sample-rain.json` | Why rain smells good (**default**) |
| `content/sample-mirror.json` | How a mirror helps you notice yourself |

---

## Open prototype

```bash
npx --yes serve web/snack-blog -p 5173
```

Design: [web/snack-blog/DESIGN.md](../web/snack-blog/DESIGN.md) · Stitch: [stitch-prompts-snack-blog.md](./stitch-prompts-snack-blog.md)
