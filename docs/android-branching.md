# Branching for Android features

## Branches

| Branch | Purpose | Deploy target |
|--------|---------|---------------|
| `main` | Production-ready code | Play **production** (via version tag) |
| `preprod` | Staging / QA | Play **internal** testing (`com.youtextme.effortless.preprod`) |
| `develop` | Optional integration branch | CI only |
| `feature/*`, `cursor/*` | Individual features (up to 20+ in parallel) | CI artifacts (dev APK) |

## Typical feature lifecycle

1. `git checkout -b cursor/settings-screen-49d6` from `main`
2. TDD: tests → code → `./scripts/run-local-ci.sh`
3. `./scripts/install-dev.sh` — verify on phone
4. Open PR → `main` or `preprod` depending on readiness
5. Merge to `preprod` → internal testers get new build automatically
6. When validated: merge `preprod` → `main`, tag `v0.2.0` → production release

## Version tags (production)

```bash
git tag v0.1.0
git push origin v0.1.0
```

Triggers `android-prod.yml` → builds prod AAB → uploads to Play production track.

## Parallel features

Each feature branch is independent. Conflicts are resolved at merge time into `preprod` or `main`. CI runs per-branch without blocking other feature work.
