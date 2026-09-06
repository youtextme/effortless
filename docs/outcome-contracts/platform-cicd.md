# Outcome Contract — Platform CI/CD & agent-proof scale

**Status:** active  
**Slug:** platform-cicd  
**Date:** 2026-09-06

## Outcome Frame

- **Job:** Agents and humans add customer experiences as platform components; CI is the only merge law so broken speech/quiz/reading cannot ship.
- **North Star:** `npm run ci` exit 0 requires **100% of tests passing** and **≥95% line coverage** on the governed platform surface (`kernel` + pure speech + guards).
- **Key Results:**
  1. GitHub Actions `Platform CI` runs on every PR/push; Pages deploy **needs** that job.
  2. `agent-guard` fails: missing component files/tests, missing CX stories, Chrome UA forks, unlisted `wordspark/js` modules.
  3. CX stories live in `platform/cx/stories.json`; every `id` appears as `story:<id>` in a test.
  4. `node platform/scripts/new-component.mjs` scaffolds manifest + runtime + test + story.
- **Workback:** contract → scripts → tests → workflows → playbook
- **Kill experiment:** Node 22 `--test-coverage-lines=95` cannot see ESM files → add `c8`. Native flags exist on v22.14.
- **Contract:** `docs/outcome-contracts/platform-cicd.md`

## Baseline

| Approach | Agent-proof? | Scale | Cost |
|---|---|---|---|
| Do nothing (Pages validate-only) | No — deploy without tests | Breaks silently | Free |
| Jest + 12 npm plugins | Partial | Lock-in, slow CI | Dep hell |
| **Node test runner + coverage thresholds + guard scripts** | Yes — fail closed, zero extra runtime deps | Same as Android CI pattern | Free |

## Kill criteria

- CI can go green with a component that has no test
- Pages can deploy when tests fail
- `isChrome()` / `navigator.userAgent` in `wordspark/platform/`
- Coverage gate below 95% lines on the governed include list

## Boundary

No paid coverage SaaS. No Jest. No recording children. Android CI stays as-is.

## Definition of Done

- [x] `npm run ci` documented at repo root and used by GitHub Actions
- [x] Coverage lines ≥ 95% on include list (measured **100%** lines)
- [x] Pages workflow `needs` platform CI
- [x] AGENT-PLAYBOOK tells agents how to add a component
- [x] CX stories bound to tests
- [x] CX analyzer is a CI step
- [x] SW precache of `wordspark/platform/**/*.js`

## Command evidence

```
$ node platform/scripts/run-ci.mjs
exit:0
Platform validation OK — 9 components
Agent-guard OK — 7 test files
CX analyzer OK — 15 stories, 3 NFRs
tests 52 pass / 0 fail
coverage lines 100.00% (threshold 95)
coverage branches 90.28% (threshold 80)
coverage functions 98.48% (threshold 90)
```

## Evaluator

| Claim | Evidence | Grade |
|---|---|---|
| Tests cannot ship missing | `agent-guard.mjs` requires `component:<id>` | PASS |
| Pages gated | `wordspark-pages.yml` `needs: ci` | PASS |
| 95% lines | Node `--test-coverage-lines=95` on include list | PASS |
| No Chrome forks | guard scans `isChrome` / `userAgent` | PASS |
