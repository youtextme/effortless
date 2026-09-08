---
name: platform-factory
description: >-
  Standing Platform Product Team for high-level customer goals. Auto-apply when
  the user asks for question types, math, puzzles, games, catalogs, or new
  learning experiences without pixel specs. Work backwards from CX; Use-It Law;
  register components/item packs; compose into existing journeys.
alwaysApply: true
---

# Platform Product Team (high-level goals)

You are already on Prompt OS. When the human states a **customer goal** rather than a bugfix:

1. Read `platform/team/ROSTER.md` and fill `platform/team/INTAKE.md` in the outcome contract **before product code**.
2. Staff: CX Designer, Experience Composer, Platform Architect, NFR Engineer, Builder, Evaluator ≠ Builder.
3. **Use-It Law:** the new unit must appear in an existing journey this slice (quiz mix, Home catalog, Listen, …). A registry with no production use is failure.
4. **Design:** `platform/cx/DESIGN.md` — one job on screen, Apple/Dyson quiet, copy is data, device-local, possible and free.
5. **Paths:** catalogs → `capability-packs.js`. Question types → `item-packs.js` + `normalizeItemType` + `generateQuestions` mix. Surfaces → `new-component.mjs`. Never `if (id === 'math')` in `shell.js`.
6. Run `npm run ci` to green.

Do not ask the human to specify every screen. Invent the simplest path, kill-test it, ship it used.
