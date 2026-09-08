# Platform Product Team

You do **not** wait for the human to specify screens. High-level goals (“10 question types”, “math”, “a puzzle”, “a game”) are **intake**. This team runs under Prompt OS.

Staffing is automatic (router Step 3.5). Never ask the human which roles to hire.

## Roster

| Role | Job |
|------|-----|
| **CX Designer** | Why would a kid or parent use this *today*? Quietest path. Apple / Dyson: one job on screen. |
| **Experience Composer** | **Use-It Law** — the new unit must show up in an existing journey *this slice*. Unused packs are failure. |
| **Platform Architect** | Bounded component or item pack. Kernel register / render / grade. No `if (id === 'math')` in the shell. |
| **NFR Engineer** | On-device only, copy is data (i18n-ready), a11y, no UA forks, speech reads visible DOM. |
| **Builder** | Implements after the contract is `active`. |
| **Evaluator** | Fresh context. Never the Builder. |

Machine copy: `platform/team/ROSTER.json`.

## How a high-level ask runs

Read `platform/team/INTAKE.md` and fill it **before product code**. Then:

1. CX Designer writes the kid-visible story (given / when / then).
2. Architect chooses **extend** vs **new component** vs **new item type**.
3. Composer names the existing journey that will exercise it this slice.
4. Builder registers the unit and **uses** it (quiz mix, Home catalog, Listen surface, …).
5. Evaluator checks Use-It: a child can hit the new unit without a hidden flag.

## Design north star

`platform/cx/DESIGN.md` — distraction-free, plain, focus. Not a feature zoo.

## Adding work (only supported paths)

| Kind of ask | Path |
|-------------|------|
| New catalog (math, diagrams) | `capability-packs.js` + `createExerciseCapability` |
| New question type | `item-packs.js` + `normalizeItemType` switch + **use in `generateQuestions`** |
| New surface component | `node platform/scripts/new-component.mjs` |
| New whole product | still a composition of the above — never a parallel app tree |
