# Outcome contract — Five-day IBKR $1000 coach

**Status:** active
**Slug:** five-day-ibkr
**Branch:** `cursor/five-day-ibkr-plan-9d5f`
**Date:** 2026-09-13

## Outcome Frame

- **Job:** Girish can open WordSpark today and see one Interactive Brokers ticket for the next five sessions, with local alerts, without being told a lie that $1000 must become $1100.
- **North Star:** A parent can copy today’s IBKR ticket from Settings in one gesture; the surface refuses a guaranteed 10% claim.
- **Key Results:**
  1. Honest math is on screen: +10% in 5 trading days annualizes to more than 10,000%; the app never says the $100 is guaranteed.
  2. One bounded IBKR ticket for 13–18 Sep 2026 (SPY 730/720 put credit, max loss $1000, target credit $100) plus a Park-in-SGOV lane if the credit is not offered.
  3. Use-It: Settings opens the plan through `open-week-plan` (no `if (id === 'week-plan')` in `shell.js`); device-local checkpoint alerts fire when the PWA is opened.
- **Workback:** contract → playbook dataset → capability pack + component → Settings overlay → CX/CI → Evaluator.
- **Agents:** CX Designer, Experience Composer, Platform Architect, NFR Engineer, Builder, Evaluator ≠ Builder.
- **Kill experiment:** If the live surface claims a guaranteed 10% in 5 days, or Home grows a fourth kid tab, or shell forks on `week-plan`, kill.
- **Contract:** `docs/outcome-contracts/five-day-ibkr.md`

## High-level intake

- **Customer job:** An adult with $30k at IBKR wants a 5-day, $1000 checklist they can act on today — not a forever trading product.
- **Why this, now:** Sun 13 Sep 2026, cash session closed; FOMC is Wed 16 Sep 2026 2:00 p.m. ET. Waiting for “a better week” misses the window they named.
- **Distraction-free path:** Settings → This week’s $1000 → copy the ticket → send it in IBKR (or Park).
- **Open / free / possible:** Baked playbook, localStorage, Notification API. No broker API, no paid data, no account in WordSpark.
- **Languages / borders:** All visible strings live in `PLAYBOOK.copy`. Kernel does not concatenate novels.
- **Extend vs new:** New component `week-plan` + exercise capability `week-plan` with `homeTab: false` (do not break Words | Passages | Settings).
- **Registry:** capability id `week-plan`; action `open-week-plan`.
- **Use-It (this slice):** Settings on the existing Home journey; parent journey `parent-five-day-plan`.
- **Kill:** If a parent still only sees name/speech/install in Settings and has no ticket, we failed.

## Assumptions (challenged)

1. **User number is wrong as a guarantee.** +10% in 5 trading days is `(1.10)^(252/5)-1 ≈ 12,090%` annualized. S&P weekly returns ≥10% are ~0.1% of weeks (NeoCadence historical density). Typical 5-session range is about −1.9% to +1.7%.
2. **“Don’t lose money” and “make 10% this week” conflict.** The only bounded way to *target* ~$100 on $1000 this week is to sell a $10-wide put credit (max loss = the $1000). That can still lose the whole stake if SPY dumps through 720 into FOMC.
3. **If the 730/720 bid is under $0.80, 10% is not on offer** without taking a tighter, riskier spread. Then the honest move is Park in SGOV (~$0.50 in 5 days), not 3x ETFs or 0DTE.
4. **Sunday cannot fill US equity options.** Today = build the ticket; send after 9:45 ET Monday.
5. **This agent cannot babysit IBKR for five days after the session ends.** The PWA is the monitor: checkpoints fire locally when the app is open/installed.
6. **Not personalized investment advice.** Educational checklist. Human sends every ticket.

## Kill criteria (pre-registered)

- Any customer-visible string claims the $100 is guaranteed / certain / risk-free
- `shell.js` contains `if (id === 'week-plan')` or a Chrome UA fork
- Home kid tabs ≠ Words, Passages, Settings
- `week-plan` pack exists but Settings has no entry (Use-It fail)
- Network to a broker or paid market-data host
- 0DTE, naked options, or 3x ETF as the recommended ticket

## Boundary

- IBKR only, $1000 sleeve, 13–18 Sep 2026 window
- No IBKR API keys, no live option chain scrape (policy: undeclared network blocked)
- Do not regress Listen, quiz, resume, Home 3-tab, PWA install
- Speech reads visible DOM on the plan overlay

## Bar-raiser baseline

| Approach | 5-day $100 | Don’t-lose | Reliability |
|---|---|---|---|
| Do nothing | 0 | Yes | Misses the week they named |
| Buy $1000 SPY and hope +10% | Needs SPY $840.72 from $764.29 — historically ~1 week in 1,000 | No | Hope is not a ticket |
| 0DTE / 3x ETF | Can print 10% | Often −20% in the same week | Forbidden by the brief |
| T-bill / SGOV park | ~$0.50 | Closest to “don’t lose” | Honest; fails the $100 target |
| Defined-risk SPY 730/720 put credit (this) | Targets ~$100 credit if bid ≥ 1.00; max loss $1000 | Not guaranteed; FOMC tails | Bounded, copyable IBKR combo |

**A/B commitment:** Spread lane vs Park lane ship together. If Monday credit < 0.80, Park wins. No taste pick.

## Design tokens (UI)

Reuse WordSpark quiet palette: `--text #1a1a1a`, `--text-secondary #5f6368`, `--blue #1a73e8`, `--green #1e8e3e`, `--red #d93025`, `--border #e8e8e8`, `--surface #ffffff`, `--bg #f8f9fa`, `--radius 12px`, type 0.85rem labels / 1.15rem body. One job on the overlay: today’s ticket. No charts, no scoreboard.

## PoC (riskiest assumption)

Riskiest assumption: “10% in 5 days without extreme risk.” Disproved by `annualizedFromHolding(0.10, 5) > 100` (12,000% class) plus FOMC on 16 Sep 2026. Product reframes to honest ticket + Park fallback.

## Definition of Done

- [ ] Playbook dataset with sourced as-of prices and FOMC time
- [ ] `week-plan` capability registered, `homeTab: false`, opened from Settings
- [ ] Overlay shows today action, IBKR ticket, Park lane, local alerts
- [ ] CX stories + parent journey + NFRs
- [ ] `npm run ci` exit 0
- [ ] Evaluator evidence file; no self-grade

## Command evidence

Filled after CI.
