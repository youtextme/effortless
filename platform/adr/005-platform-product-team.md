# ADR 005 — Platform Product Team + question item types

## Status

Accepted — 2026-09-08

## Context

The human will keep giving **high-level customer goals** (question types, math, puzzles, games) without pixel specs. Features that stay N:N to one screen will not scale. Docs-only “hire a team” will not scale either.

## Decision

1. **Standing team** (`platform/team/`) staffed automatically by Prompt OS Step 3.5 on high-level goals.
2. **Use-It Law:** a new unit must appear in an existing journey the same slice.
3. **Question items** are a kernel registry (`items.js`), same idea as capability catalogs. Types `choice` and `blank` ship first. Unknown types fail closed.
4. **Quiz** asks the registry to render/grade. Shell does not switch on item type.
5. **Design charter** (`platform/cx/DESIGN.md`) is the CX bar: quiet, local, copy-is-data, possible and free.

## Consequences

- “10 question types” means ten packs **and** a production mix that uses them.
- Math/puzzles later are catalogs + item types, not a new app.

## Alternatives considered

1. Wait for detailed specs — rejected; that is the gap this team exists to fill.
2. Per-type screens — rejected; distraction and shell forks.
3. Registry without Use-It — rejected; unused shelves.
