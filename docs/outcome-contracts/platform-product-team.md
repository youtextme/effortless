# Outcome contract — Platform Product Team

**Status:** proven
**Branch:** `cursor/platform-product-team-206f`
**Job:** High-level customer goals become reusable, used platform units — not one-off screens.

## North Star

A standing Prompt OS team turns a one-line kid/parent goal into (1) a bounded component or item pack, (2) CX stories, (3) composition into an existing journey — with `npm run ci` exit 0.

## Key Results

1. Roster + intake + design charter exist; POS Step 3.5 staffs this team on high-level goals.
2. Question **item types** are a kernel registry (`choice`, `blank`); unknown types fail closed.
3. The live quiz **uses** both types this slice (Use-It Law).
4. Shell does not `if (itemType === 'blank')` for listing/rendering — it asks the registry.

## Kill

If the quiz still paints four buttons only from `q.choices` in `shell.js` and the “team” is markdown with no runtime registry, kill.

## Assumptions

- The human will keep giving high-level goals (question types, math, puzzles, games).
- They will not specify every interaction; the CX Designer must invent the simplest Apple/Dyson path.
- Progress stays on-device; no accounts; open source; copy is data (i18n-ready).

## Bar-raiser

| Alternative | Why not |
|-------------|---------|
| Wait for pixel-perfect specs | The human will not write them; that is the job. |
| New screen per feature | N:N; shell forks; CX drifts. |
| Docs-only “team” | Next ask still needs a human to design the wiring. |
| Item kernel + Use-It (this) | New types are packs; quiz already consumes them. |
