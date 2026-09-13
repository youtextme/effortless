# Outcome contract — $500 from a proven paid offer

Status: active
Owner: Prompt OS (Girish / youtextme)
Window: 7 days from first live listing — clock started **13 Sep 2026** (https://textme.gumroad.com/l/sight-words-220)
Branch: `cursor/proven-offer-500-c5af`

## Outcome Frame
- **Job:** Collect ≥$500 from people who already pay for this category, by listing a cheaper original pack they can buy in one click.
- **North Star:** Net cash received (Gumroad + TPT + Etsy) ≥ **$500 USD** within **7 days of first live listing**.
- **Key Results:**
  - KR1: Live competitor pages show **verified purchases this week** (not a blog guess).
  - KR2: An original 220-word Dolch printable PDF exists, generated from this repo, not copied from a seller.
  - KR3: Listing copy + price undercuts the live $11 TPT bundle and matches the live $5.99 volume SKU, with one-file PDF (no Google Drive maze).
  - KR4: Live Gumroad checkout: https://textme.gumroad.com/l/sight-words-220 ($5.99). Clock started **13 Sep 2026**.
- **Workback:** evidence matrix → original pack → listing kit → **Gumroad live** → traffic in the market that already pays.
- **Agents:** Researcher, Builder, Evaluator ≠ Builder.
- **Kill experiment:** If live marketplaces show no recent paid reviews in this category, stop. **Survived:** TPT listing 3150071 has 8,784 verified reviews and 5-star reviews on 11 Sep 2026; listing 592311 has 10,920 reviews at $5.99, also 11 Sep 2026.
- **Contract:** `docs/outcome-contracts/proven-offer-500.md`

## High-level intake
- **Customer job:** A parent or teacher needs a no-prep page so a child can trace, write, and read one sight word today.
- **Why this, now:** School is in session (reviews dated 4–11 Sep 2026). Homework and centers still buy printables after the back-to-school spike.
- **Distraction-free path:** Print one page. Child traces the gray word, writes it, finds it, reads one sentence.
- **Open / free / possible:** Dolch lists are public-domain word lists. Original sentences and layout. No paid API.
- **Languages / borders:** English sight words (the paid market we verified). Copy lives in `commerce/sight-words/scripts/dolch.mjs`.
- **Extend vs new:** New commercial SKU. Not a WordSpark shell fork. Paying customer is the adult buyer, not the PWA reader.
- **Registry:** `commerce/sight-words` (downloadable pack).
- **Use-It (this slice):** The pack is the product a buyer opens. Generator tests lock 220 words + PDF bytes. Listing kit is the path into TPT/Gumroad, where this category already converts.
- **Kill:** If we ship a “maybe people want this” prompt pack with zero live purchase evidence.

## Challenge the $500 / 7-day number
The number is **possible only after listing + traffic**, not from the ZIP sitting in git.

Disconfirming (sourced):
- Gumroad 2026 crawl: median creator **$72/month**; **44% of products earn $0**; 99.5% of revenue to the top 1% ([InsightRaider State of Gumroad 2026](https://insightraider.com/en/state-of-gumroad-2026)).
- This Gmail has Gumroad **2FA (Sep 2024)** and **zero sale receipts**. GitHub user `youtextme` has **0 followers**.
- Email is ~42% of Gumroad sales; there is no list.

Confirming (live pages, 13 Sep 2026):
- [TPT 3150071](https://www.teacherspayteachers.com/Product/Sight-Words-Kindergarten-Worksheets-Practice-Activities-Books-First-Grade-1st-3150071): **$11.00**, **4.88 / 8,784 reviews**, 5-star reviews **11, 9, 8, 6, 4 Sep 2026**. Quote on page: “This is definitely worth the money.”
- [TPT 592311](https://www.teacherspayteachers.com/Product/Sight-Word-Practice-Coloring-Pages-Bundle-incl-Easter-Spring-Activities-592311): **$5.99**, **4.82 / 10,920 reviews**, 5-star review **11 Sep 2026**.

Math (honest):
- $5.99 × 93 sales ≈ $557 before fees. Gumroad ~10% → ~84–93 sales. TPT new-seller cut ~30% → ~120 sales.
- A **new shop with 0 reviews** will not do that from gumroad.com/discover alone. TPT search is where these buyers already are.

## Assumptions
1. Adults will buy a quieter, complete 220-word PDF if it is cheaper than the $11 bundle and simpler than Google Drive.
2. Dolch word lists may be used; **layout, sentences, and hunt rows are original**.
3. Gumroad 2FA + Korea payouts are connected. TPT still needs seller tax. **Cash still needs traffic.**
4. We will not clone Simply Kinder’s books/slides/Drive files.

## Baseline (do nothing + 3 live ways)
| Way | Price | Proof people pay | Friction |
|-----|-------|------------------|----------|
| Do nothing | $0 | $0 | No cash |
| TPT Simply Kinder bundle | $11 | 8,784 verified reviews; reviews this week | Google Drive access tickets on the listing |
| TPT mystery color bundle | $5.99 | 10,920 reviews; review 11 Sep 2026 | Seasonal pictures, not a full 220-word set |
| Gumroad cold listing (any niche) | varies | Platform median $72/mo | No audience, most listings $0 |

## A/B
- **A (ship):** $5.99, all 220 Dolch, one PDF, trace/write/find/read. List TPT + Gumroad.
- **B (killed for v1):** $29 “classroom license” only — higher AOV, unproven for a 0-review shop.
Winner for week 1: **A** (price already converting at $5.99 on TPT).

## Kill criteria (pre-registered)
1. Cannot publish a checkout URL within 24h of this PR (2FA/KYC) → clock does not start; product still ready.
2. 72h after live TPT **or** Gumroad listing: **0 sales** → post in 2 teacher/parent places + optional ads (spend gate, human must approve).
3. Day 7 cash < $500 → experiment **killed** as a 7-day cash job; keep the SKU for January (second seasonal peak).
4. Legal: never upload someone else’s PDF, never fake reviews.

## Verification
- `node --test commerce/sight-words/scripts/build-pack.test.js` exit 0
- `node commerce/sight-words/scripts/build-pack.mjs` writes `dist/*.pdf` with `%PDF` and 220 unique words
- Live competitor URLs still show paid reviews
- Evaluator ≠ Builder grades `commerce/sight-words/evidence/`

## Command evidence
- `node --test commerce/sight-words/scripts/build-pack.test.js` — exit:0, 5/5
- `npm run ci` — exit:0, 108/108, governed line coverage 99.69%
- Evaluator (≠ Builder): `commerce/sight-words/evidence/evaluator-proven-offer-500.md` — **slice proven**, program cash **not yet** until sales land
- Live checkout (Playwright 13 Sep 2026): https://textme.gumroad.com/l/sight-words-220 — `$5.99` + **I want this!** + `/checkout` **Pay** US$5.99. Evidence: `commerce/sight-words/evidence/gumroad-live-checkout.png`, `gumroad-checkout.png`
- Free sample: https://textme.gumroad.com/l/sight-words-sample
- PR: https://github.com/youtextme/effortless/pull/35

## Remaining gates (not product files)
- **Cash $500:** listing is live; traffic is still required. Ads = spend gate.
- **TPT:** seller tax ID still a marketplace gate.
- Payouts: Korea Woori KRW connected on Gumroad (details not in git).
