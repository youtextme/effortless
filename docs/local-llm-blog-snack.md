# Local LLM path — Blog snack generation (Ollama)

Generate **Blog snack** JSON from a topic prompt using [Ollama](https://ollama.com) on your machine. No paid API required.

---

## Prerequisites

1. Install Ollama: https://ollama.com/download  
2. Pull a model (default in scripts: `llama3.2`):

   ```bash
   ollama pull llama3.2
   ```

3. Ensure the server is running (usually automatic):

   ```bash
   ollama serve
   ```

   Default endpoint: `http://127.0.0.1:11434`

---

## CLI — generate JSON file

From repo root:

```bash
node scripts/generate-blog-snack.mjs "Why do stars twinkle?" --out web/snack-blog/content/my-snack.json
```

| Flag | Purpose |
|------|---------|
| `--topic "..."` | Snack subject |
| `--out path` | Write JSON (omit for stdout) |
| `--model name` | Override model (or `OLLAMA_MODEL`) |
| `--host url` | Override Ollama URL (or `OLLAMA_HOST`) |
| `--help` | Usage |

**Output shape** matches `web/snack-blog/content/sample-rain.json`:

```json
{
  "title": "...",
  "topic": "...",
  "screens": [
    { "heading": "...", "body": "..." }
  ]
}
```

Validation enforces **6–8 screens**, **≤80 words/screen**, required fields.

---

## Prototype — in-browser generate

The web prototype (`web/snack-blog/`) calls the same Ollama HTTP API when you tap **Generate new topic** on Discover:

- `POST http://127.0.0.1:11434/api/generate`
- `format: "json"`, `stream: false`
- Model: `llama3.2`

If Ollama is not reachable (CORS/network/offline), the UI falls back to built-in placeholder screens and shows a hint.

> **Note:** Browsers may block cross-origin requests to Ollama. For reliable in-browser generation, run the prototype and Ollama on the same machine and use a local static server; if the fetch fails, use the CLI above and load the JSON via **Try sample** workflow or replace `sample-curiosity.json`.

---

## Recommended workflow (parent)

1. Parent runs CLI with kid’s topic → JSON file  
2. Optional: copy into `web/snack-blog/content/`  
3. Open prototype → Discover → **Read this snack** (default: *Why rain smells good*)
4. Kid reads screen-by-screen with progress chips  

For v1, the bundled rain snack demonstrates the read experience; CLI demonstrates the LLM path.

---

## Prompt contract

The system prompt (in `scripts/generate-blog-snack.mjs` and `web/snack-blog/app.js`) requires:

- Kid ~10 audience, calm tone  
- One idea per screen  
- Growth/curiosity framing  
- No commerce, tracking, or scary themes  

See snack rules: [web/snack-blog/DESIGN.md](../web/snack-blog/DESIGN.md)

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `ECONNREFUSED 11434` | Start `ollama serve` |
| `model not found` | `ollama pull llama3.2` |
| Word limit validation error | Re-run; model occasionally overwrites — try a smaller model or edit JSON |
| Browser generate fails | Use CLI; keep Ollama on loopback only (never expose publicly) |

---

## Security

- Ollama stays on **127.0.0.1** — do not tunnel publicly  
- Review generated JSON before kid reads  
- Aligns with Effortless kid-safe constraints (no dark patterns)
