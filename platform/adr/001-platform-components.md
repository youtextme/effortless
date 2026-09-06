# ADR 001: Platform Component Model for WordSpark

## Status
Accepted — 2026-09-06

## Context
WordSpark grew as a monolithic `app.js` with tangled UI, storage, TTS, quiz, and certificate logic. We need a architecture that principal engineers will trust for scale, reliability, and autonomous evolution (Prompt OS alignment).

## Decision
Adopt a **platform component** model:

- **Kernel** provides registry, event bus, health, telemetry, and policy.
- **Components** are small modules with `id`, `version`, `dependencies`, `init`, `health`, `destroy`.
- **Shell** is the only composition root; apps do not import component internals cross-tree.
- **Contracts** at repo root are validated in CI.

## Consequences

### Positive
- Clear boundaries and test surfaces per component.
- Self-healing via centralized health orchestration.
- Self-learning via structured telemetry ring buffer.
- Self-governing via policy gate on bus events and side effects.
- Future apps (Android, new PWAs) can share manifest and patterns.

### Negative
- Initial indirection; more files for a small PWA.
- Static deploy requires platform folder inside `wordspark/`.

### Mitigation
- Phase 1 wraps existing modules without moving them; zero behaviour change.
- Validation script is fast and runs in Pages deploy workflow.

## Alternatives considered

1. **Full monorepo (npm workspaces)** — rejected for now; WordSpark is static ESM, Android is Gradle; premature.
2. **Micro-frontends** — rejected; single PWA, no federation need.
3. **Keep monolith** — rejected; does not meet self-governing/healing goals.
