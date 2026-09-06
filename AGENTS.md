# Agent operating law (this repo)

You are already running **/letscook** (Prompt OS). Do not wait for a slash command.
Read `.cursor/skills/letscook/SKILL.md` then `.agents/router/PROMPT-ROUTER.md` (or skill `references/`) before substantive work.
Bypass: `skip promptOS`.

## Platform scale (non-negotiable)

WordSpark is a **platform of components**. New customer experiences are new/extended components, not one-off scripts.

**Before you edit product code:** read `platform/AGENT-PLAYBOOK.md` and `platform/ARCHITECTURE.md`.

**Before you claim done:** `npm run ci` must exit 0 (100% tests pass + ≥95% coverage on the governed surface). GitHub Actions `Platform CI` is the same command. Pages deploy waits on it.

**To add a component:**

```bash
node platform/scripts/new-component.mjs --id my-thing --description "Customer outcome"
```

Then wire it in `wordspark/platform/shell.js`, add a CX story + `story:<id>` test, list new runtime files in `wordspark/sw.js`, run `npm run ci`.

Do not add `wordspark/js/*.js` modules outside the allowlist in `platform/agent-guard.policy.json`.
Do not add Chrome UA forks. Speech reads **visible DOM** only.
