# Platform

Governance layer for effortless products. Runtime lives in `wordspark/platform/` (deployed with the PWA).

- [Architecture](./ARCHITECTURE.md)
- [ADR 001: Component model](./adr/001-platform-components.md)
- [Component manifest](./COMPONENT-MANIFEST.json)

## Validate

```bash
node platform/scripts/validate-platform.mjs
```

## Kernel capabilities

| Module | Role |
|--------|------|
| `registry` | Component registration + dependency-ordered init |
| `bus` | Decoupled event communication |
| `health` | Self-healing checks + recovery hooks |
| `telemetry` | Self-learning local event ring (200 events) |
| `policy` | Self-governing gates (PII, network, storage keys) |
