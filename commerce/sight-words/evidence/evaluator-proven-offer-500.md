# Evaluator — proven-offer-500 (THIS slice)

**Contract:** `docs/outcome-contracts/proven-offer-500.md`  
**Slug:** proven-offer-500  
**Evaluator:** independent (not the Builder)  
**Date:** 2026-09-13  
**Branch:** `cursor/proven-offer-500-c5af`  
**Graded slice:** ship a listable original pack against live paid demand — **not** “$500 already in the bank”

No product code was edited. Graded against the contract and listed artifacts only.

---

## 1. Verdict

**proven** for this slice.

People are paying for sight-word printables on Teachers Pay Teachers this week. An original 220-word Dolch PDF plus listing kit exist in this repo and can be listed cheaper than the live $11 bundle (price-matched to the live $5.99 volume SKU).

The **program** North Star (net cash ≥ $500 within 7 days of first live listing) is **not** proven. Contract `Status:` must stay `active` until a checkout URL exists and cash lands. See minority veto.

Kill experiment for demand (**“no recent paid reviews → stop”**) **survived**. Legal kill (**never upload someone else’s PDF**) **survived** on the artifacts inspected.

---

## 2. What was verified vs assumed

### Verified (Evaluator, this session)

| Claim | Evidence |
|---|---|
| TPT 3150071 is a live paid listing at **$11.00** | Playwright, 13 Sep 2026: https://www.teacherspayteachers.com/Product/Sight-Words-Kindergarten-Worksheets-Practice-Activities-Books-First-Grade-1st-3150071 — tooltip “Rated **4.88** out of 5, based on **8784** reviews”; visible **$11.00**; **Add to cart** |
| Reviews on 3150071 dated Sep 2026 | Same live page: **September 11, 9, 8, 6, 4, 2026**. Quote: “This is definitely worth the money.” |
| Screenshot of 3150071 exists | `commerce/sight-words/evidence/tpt-sight-words-live.png` (478,617 bytes). Shows TPT chrome, Simply Kinder, **$11.00**, 4.9 (8.8k), “See 8,782 more reviews”, Google Drive Q&A, “worth the money.” Does **not** by itself show the dated review list (those dates were confirmed live, not from the PNG). |
| TPT 592311 is a live paid listing at **$5.99** | Playwright, 13 Sep 2026: https://www.teacherspayteachers.com/Product/Sight-Word-Practice-Coloring-Pages-Bundle-incl-Easter-Spring-Activities-592311 — “Rated **4.82** out of 5, based on **10920** reviews”; **$5.99**; **Add to cart**; 5-star reviews **September 11, 8, 7, 2026** |
| Dolch inventory is 220 unique words | Independent `flattenWords()`: total 220, unique 220, lists 40 / 52 / 41 / 46 / 41 |
| PDFs exist, valid `%PDF-1.4`, sizes match parent | `dist/wordspark-220-sight-words.pdf` 430,142 bytes; `dist/wordspark-sight-words-sample.pdf` 21,296 bytes; both end `%%EOF` |
| Generator is original (not a competitor file) | `scripts/dolch.mjs` + `build-pack.mjs` + `pdf.mjs` in-repo. Full PDF latin1 text: **0** hits for `Simply Kinder`, `teacherspayteachers`, `TPT`; WordSpark branding on pages; one “Google Drive” mention is **our** how-to line (“No Google Drive”), not cloned Drive assets |
| Listing kit is listable cheaper | `LISTING.md` price **$5.99**; `listing/cover.png` (26,820 bytes) shows “$5.99 · Pre-K through Grade 3”; one paid PDF |
| Pack tests | `node --test commerce/sight-words/scripts/build-pack.test.js` → **5/5 pass**, exit 0 |
| Platform CI | `npm run ci` → **108 tests, 0 fail**, governed surface **99.69%** line coverage, `CI OK`, exit 0 |

### Assumed (not independently proven this session)

| Claim | Why it stays assumed |
|---|---|
| Gumroad account exists; 2FA email Sep 2024; **zero sale receipts** | Stated in contract + `research.md`. Evaluator did not open Gmail. Treat as human-gate context, not cash proof. |
| Human can finish 2FA + payouts “in one sitting” | Depends on the human’s Gumroad/TPT KYC. Product files are ready; publish is not. |
| Adults will buy **this** quiet 220-page PDF (vs the 16,000+ page Drive bundle / mystery-color pack) | Category demand is live. **This SKU** converting is still Assumption 1 until a sale. |
| Etsy as a channel | Research: search HTTP 403. Not used as proof. Evaluator did not grade Etsy demand. |
| InsightRaider Gumroad 2026 medians | Cited URL not re-fetched. Disconfirming color for **cash** speed, not for this slice. |
| Contract `## Command evidence` filled by Builder | Still the placeholder `(filled after build)`. Evaluator receipts below replace that for this grade. |

### Spot-check notes (not blockers)

- Competitor 3150071 is a **240+ word / 16,000+ page** Drive-heavy bundle. Ours is a **220-page one-PDF** undercut, which is the intended offer, not a clone.
- Listing 592311 page title live is “Sight Word Practice Mystery Coloring Pages: Back to School & Fall Art Activities” (URL slug still `…592311`). Price/reviews match the contract.
- Screenshot rounding (4.9 / 8.8k) matches the live 4.88 / 8784 tooltip.

---

## 3. Minority veto — $500 cash is not proven

**Veto:** If anyone stamps the **program** contract `Status: proven` because cash ≥ $500 already landed, that stamp is **invalid**.

- No checkout URL exists in this repo.
- LISTING.md: “The 7-day $500 clock **starts when checkout is live**, not when this PR merges.”
- Parent fact (unverified in Gmail, consistent with artifacts): Gumroad 2FA exists, **zero sale receipts**.
- Math in the contract ($5.99 × ~93 sales) is a **forecast**, not a receipt.
- Pre-registered kill 3 (Day 7 cash < $500) **cannot fire** until the clock starts.

Slice **proven** ≠ program **proven**. Keep `docs/outcome-contracts/proven-offer-500.md` at `Status: active` until money hits Gumroad/TPT/Etsy.

---

## 4. Exact next human action

1. Open https://gumroad.com/login — complete 2FA from Gmail.
2. Connect payouts if missing.
3. New product → upload `commerce/sight-words/dist/wordspark-220-sight-words.pdf` → **$5.99** → publish (optional $0 sample: `commerce/sight-words/dist/wordspark-sight-words-sample.pdf`). Thumb: `commerce/sight-words/listing/cover.png`. Paste copy from `commerce/sight-words/LISTING.md`.
4. Same sitting if possible: TPT seller + tax form, same $5.99 listing (that is the market with 8.7k and 10.9k verified reviews).
5. Post the live checkout URL in 2 places you already have. **Do not buy ads** until you approve spend.

That published URL is when the 7-day $500 clock starts.

---

## 5. Command receipts (Evaluator)

```
$ node --input-type=module -e "import { flattenWords, expectedCounts } from './commerce/sight-words/scripts/dolch.mjs'; …"
exit:0
# total 220 unique 220
# pre-primer 40, primer 52, grade-1 41, grade-2 46, grade-3 41
```

```
$ python3 -c "… PDF magic + competitor string counts …"
exit:0
# wordspark-220-sight-words.pdf size 430142 magic b'%PDF-1.4' eof %%EOF
# wordspark-sight-words-sample.pdf size 21296 magic b'%PDF-1.4' eof %%EOF
# Simply Kinder 0; teacherspayteachers 0; TPT 0
```

```
$ node --test /workspace/commerce/sight-words/scripts/build-pack.test.js
exit:0
# tests 5
# pass 5
# fail 0
```

```
$ cd /workspace && npm run ci
exit:0
# tests 108
# pass 108
# fail 0
# all files line % 99.69
# CI OK
```

Live Playwright (Evaluator, 13 Sep 2026), not a Builder screenshot:

- 3150071: $11.00, 4.88 / 8784, Add to cart, reviews 11/9/8/6/4 Sep 2026
- 592311: $5.99, 4.82 / 10920, Add to cart, reviews 11/8/7 Sep 2026

`node ~/.agents/prompt-os/scripts/evidence-check.mjs` is **not in this environment**. Not used.

---

## Rubric (this slice only)

| Bar | Result |
|---|---|
| KR1 live paid demand this week | **pass** (both TPT URLs, live) |
| KR2 original 220 Dolch PDF from this repo | **pass** |
| KR3 listing copy + $5.99 under $11 / match $5.99 SKU + one PDF | **pass** |
| KR4 human can publish (files ready; 2FA is the gate) | **pass for artifacts**; publish still human |
| Program NS $500 / 7 days | **not yet** (clock not started) |

**Objective met (slice):** yes — live paid category + original cheaper listable pack.  
**Objective met (cash):** no.
