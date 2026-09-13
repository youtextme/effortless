# Evidence — Five-day IBKR $1000 coach

**Contract:** `docs/outcome-contracts/five-day-ibkr.md`  
**Slug:** five-day-ibkr  
**Evaluator:** independent (not the Builder)  
**Date:** 2026-09-13  
**Verdict:** **proven**

Graded against the contract and the listed artifacts only. No product JS/CSS/HTML was edited.

This slice **does not make the human $100**. It coaches one bounded Interactive Brokers ticket (SPY 18 Sep 730/720 put credit, max loss $1000) and a Park-in-SGOV lane. The $100 is a target credit, not a result.

## Outcome Frame (from contract)

- **Job:** Girish can open WordSpark today and see one Interactive Brokers ticket for the next five sessions, with local alerts, without being told a lie that $1000 must become $1100.
- **North Star:** A parent can copy today’s IBKR ticket from Settings in one gesture; the surface refuses a guaranteed 10% claim.
- **Kill experiment:** If the live surface claims a guaranteed 10% in 5 days, or Home grows a fourth kid tab, or shell forks on `week-plan`, kill.

## What was inspected

| Artifact | How |
|---|---|
| `docs/outcome-contracts/five-day-ibkr.md` | full read |
| `wordspark/platform/components/week-plan-playbook.js` | full read + imported in kill scan |
| `wordspark/platform/components/week-plan.js` | full read + `createWeekPlanCapability` imported |
| `wordspark/platform/components/week-plan.test.js` | full read + CI |
| `wordspark/index.html` | Home tabs + Settings entry + `#screen-week-plan` overlay |
| `wordspark/platform/shell.js` | import/register of `WeekPlanComponent`; no `if (id === 'week-plan')` |
| `platform/cx/journeys.json` | `parent-five-day-plan` + `kid-comes-back` Use-It step |
| `platform/cx/stories.json` | five `week-plan-*` stories |

No live browser click. Settings → overlay proof is HTML ids + capability `open-week-plan` + the Settings-use test, not a tapped phone.

## What was run

1. Independent kill scan of playbook copy, tickets, Home tabs, shell fork, and capability action.
2. Full `npm run ci`.

## Command evidence (Evaluator)

```
$ cd /workspace && node --import ./platform/test/polyfill-storage.mjs --input-type=module -e "<kill scan: PLAYBOOK copy + tickets + index.html tabs + shell if>"
exit:0
```

Kill-scan stdout (abridged, exact keys):

```
{
  "guaranteeFlag": false,
  "annual": 120.9526753045486,
  "annualOver100": true,
  "capAction": "open-week-plan",
  "capHomeTab": false,
  "tabs": ["words", "passages", "settings"],
  "tabCount": 3,
  "settingsBtn": true,
  "overlay": true,
  "speechSurface": true,
  "shellWeekPlanIf": false,
  "shellUserAgent": false,
  "hits": { "guaranteed": false, "riskFree": false, "certain": false, "willMake100": false },
  "forbiddenAsRec": { "ticketHas0dte": false, "ticketNaked": false, "ticket3x": false, "copyForbidsThem": true },
  "spreadHead": "SELL 1 SPY 2026-09-18 730/720 PUT VERTICAL",
  "parkHead": "BUY 10 SGOV",
  "defaultTicketHead": "SELL 1 SPY 2026-09-18 730/720 PUT VERTICAL"
}
```

```
$ cd /workspace && npm run ci
exit:0
# tests 108
# pass 108
# fail 0
# all files line 99.69 / branch 89.74 / funcs 98.46
# CI OK
# Platform validation OK — 13 components, kernel 1.0.0
# Agent-guard OK — 19 test files
# CX analyzer OK — 33 stories, 20 NFRs, 6 journeys
```

Slice stories in that CI run (all pass):

- `story:week-plan-health component:week-plan health refuses a guarantee`
- `story:week-plan-honest-math component:week-plan 10 percent in 5 days is extreme`
- `story:week-plan-today-ticket component:week-plan Sunday and Monday IBKR tickets`
- `story:week-plan-local-alerts component:week-plan checkpoints fire on this device`
- `story:week-plan-settings-use component:week-plan Settings opens the pack without a shell fork`

Boundary stories still green in the same run: `story:home-three-tabs`, `story:resume-where-left-off`, `story:install-pwa-visible`, listen/quiz stories.

## Key Results

### KR1 — Honest math on screen; the app never says the $100 is guaranteed — **PASS**

Falsifier: customer-visible copy claims guaranteed / certain / risk-free $100 or 10%.

Evidence it does not:

- `PLAYBOOK.guarantee === false`; rendered HTML has `data-guarantee="no"`.
- Overlay copy: “This screen will not promise $100.” Math: “+10% in 5 sessions annualizes to more than 10,000%.”
- Independent scan of all `PLAYBOOK.copy`, day bodies, checkpoints, rendered HTML, and both tickets: no `guaranteed`, `risk-free`, or `\bcertain\b`.
- `annualizedFromHolding(0.10, 5) === 120.95…` (> 100 → 12,000% class). Health requires `PLAYBOOK.guarantee === false` and that annualization.

### KR2 — One bounded IBKR ticket for 13–18 Sep 2026 plus Park-in-SGOV — **PASS**

Falsifier: recommended ticket is 0DTE, naked, or a 3× ETF; or the window/FOMC/as-of prices are missing.

Evidence it does not:

- Window `2026-09-13` … `2026-09-18`. As-of Friday session 2026-09-11: SPY 764.29, QQQ 714.88, SGOV 100.52. FOMC `2026-09-16T14:00:00-04:00`.
- Recommended spread: `SELL 1 SPY 2026-09-18 730/720 PUT VERTICAL`, LMT credit 1.00 DAY, max loss $1000, skip if mid < 0.80 then Park.
- Park: `BUY 10 SGOV` LMT 100.60; copy says “Expected about $0.50 in five days — not $100.”
- Tickets contain no 0DTE / naked / 3×. Copy forbids them: “Do not use 0DTE, naked puts, or 3× ETFs this week.”
- Overlay paints today action, ticket `<pre>`, spread + Park CTAs, and local-alert control.

### KR3 — Use-It: Settings opens the plan through `open-week-plan`; no shell fork; local alerts — **PASS**

Falsifier: Settings has no entry; `shell.js` has `if (id === 'week-plan')`; Home grows a fourth kid tab; pack exists unused.

Evidence it does not:

- **Use-It Law holds.** Settings `#btn-week-plan` (“Open this week’s plan”) calls `ctx.capability.dispatch(ctx.capability.open('week-plan', PLAYBOOK.id))`. Pack `open()` returns `{ action: 'open-week-plan' }`. Component registers `registerAction('open-week-plan', () => open())`.
- `homeTab: false`. Home `data-home-tab` is exactly `words`, `passages`, `settings` (three tabs). Overlay is `#screen-week-plan` with `data-speech-surface`, not a fourth tab.
- `shell.js` has no `if (id === 'week-plan')` and no `userAgent`. It only imports `WeekPlanComponent` into `COMPONENTS`.
- Existing Home journey `kid-comes-back` includes step `week-plan-settings`. Parent journey `parent-five-day-plan` covers honest math, ticket, alerts, health.
- Alerts: `fireDueNotifications` uses the Notification API when `state.notify` is on; no broker/network host in this component. Checkpoints fire when due **and** the plan is opened/pulsed on-device.

## Kill criteria

| Criterion | Result |
|---|---|
| Any customer-visible string claims the $100 is guaranteed / certain / risk-free | **not hit** — scan `hits.*` all false; honest copy refuses the promise |
| `shell.js` contains `if (id === 'week-plan')` or a Chrome UA fork | **not hit** — `shellWeekPlanIf: false`, `shellUserAgent: false` |
| Home kid tabs ≠ Words, Passages, Settings | **not hit** — three tabs only |
| `week-plan` pack exists but Settings has no entry (Use-It fail) | **not hit** — `#btn-week-plan` + `open-week-plan` |
| Network to a broker or paid market-data host | **not hit** in inspected files — localStorage + Notification only |
| 0DTE, naked options, or 3× ETF as the recommended ticket | **not hit** — defined-risk 730/720 put vertical or SGOV park |

Kill experiment: **holds**. Do not kill.

## Definition of Done (contract checklist)

| Item | Evaluator |
|---|---|
| Playbook dataset with sourced as-of prices and FOMC time | **met** |
| `week-plan` capability registered, `homeTab: false`, opened from Settings | **met** |
| Overlay shows today action, IBKR ticket, Park lane, local alerts | **met** |
| CX stories + parent journey + NFRs | **met** — five stories; journeys `parent-five-day-plan` and `kid-comes-back`; story NFRs cited (evaluator did not open `nfr.json`) |
| `npm run ci` exit 0 | **met** — 108/108 |
| Evaluator evidence file; no self-grade | **met** — this file |

## Honest assessment

The product is a **device-local coach**, not a broker and not a return. Selling a $10-wide put credit can still lose the whole $1000 if SPY finishes at or below 720 into FOMC. If Monday credit is under $0.80, the honest path is Park (~$0.50), which will not print $100. Sunday cannot send US equity options. Alerts do not babysit IBKR in the cloud; they fire on this device when the app is open and alerts are on.

## Minority-veto

**No veto** on kill criteria or a falsified KR.

Non-blocking remainder (does not flip Verdict):

1. No live Settings tap in a browser. Wiring is source + CI, not a device capture.
2. `parent-five-day-plan` does not include the Settings-use story; that step lives on existing journey `kid-comes-back`. Use-It still holds.
3. Governed coverage is kernel + speech (99.69% lines). `week-plan.js` / playbook are proven by story tests + this import scan, not by the coverage table.
4. Default overlay lane is the spread until the parent taps Park — correct for the recommended ticket, not a second product.

## Sources read

- `docs/outcome-contracts/five-day-ibkr.md`
- `wordspark/platform/components/week-plan-playbook.js`
- `wordspark/platform/components/week-plan.js`
- `wordspark/platform/components/week-plan.test.js`
- `wordspark/index.html` (Home tabs, Settings `#btn-week-plan`, `#screen-week-plan`)
- `wordspark/platform/shell.js` (composition root; no week-plan id fork)
- `platform/cx/journeys.json`
- `platform/cx/stories.json`
