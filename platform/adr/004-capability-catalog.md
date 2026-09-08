# ADR 004 — Capability catalog (passages as reusable packs)

## Status

Accepted — 2026-09-08

## Context

WordSpark's 100 passages look like the product. They are not. The next packs are math, diagrams, and more reading. Forking `renderPassageList` / Home tabs per pack would grow `if (id === 'math')` in the shell and make health/open contracts drift.

## Decision

1. **Kernel registry** (`capabilities.js`): `register` / `listItems` / `getItem` / `open` / `health` / `registerAction` / `dispatch`. Unknown kinds and rows fail closed. `open()` never throws.
2. **Packs** are platform data: `defaultPacks()` today is words (1000) + passages (100). A new exercise is `createExerciseCapability({ homeTab: false, ... })` until it has real kid content.
3. **One catalog renderer** paints any pack. Shell mounts are `data-catalog="<id>"`. Listing never maps `VOCABULARY` in `shell.js`.
4. **Players** handle `open()` actions. Shell registers `read-passage`. Stub actions (`none`, `unknown`, `unsupported`, `open-exercise`) are no-ops until a player component replaces them.
5. **Home tabs** come from packs with `homeTab: true` plus Settings chrome. Math/diagrams stay off Home until they opt in.

## Consequences

- Adding math is a pack + optional player, not a shell list fork.
- Reliability: validate on register, isolate throwing packs, health on 100/1000 counts.
- Kid UI in this slice stays Words | Passages | Settings.

## Alternatives considered

1. **Keep VOCABULARY loops in the shell** — rejected; every new exercise forks listing.
2. **CMS of HTML pages** — rejected; no shared health/open contract.
3. **Ship an empty Math tab** — rejected; no content yet (`homeTab: false` until there is).
