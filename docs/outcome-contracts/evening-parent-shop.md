# Outcome contract — evening-parent shop (LTV slice)

Status: active
Owner: Prompt OS (Girish / youtextme)
Window: same 7-day cash clock (started 13 Sep 2026)
Branch: `cursor/proven-offer-500-c5af`
Parent contract: `docs/outcome-contracts/proven-offer-500.md`

## Outcome Frame
- **Job:** A tired parent or kindergarten teacher who already pays for printables prints tonight, then buys the rest of the week’s quiet work from one shop, and can email youtextme for a custom pack.
- **North Star:** Same cash North Star — net ≥ **$500** within 7 days of first listing — now via **catalog AOV**, not one $5.99 SKU.
- **Key Results:**
  - KR1: Gumroad Korea payout form saved with a bank code Gumroad **accepts** (Woori SWIFT `HVBKKRSEXXX`; local `020` is **invalid** on this form). Stripe KYC confirmed. No “connect a payout method” banner. Residual: first KRW payout still needs $100 weekly threshold.
  - KR2: **8 live SKUs** for this persona, including a **$19.97 after-dinner bundle** (the $20 land).
  - KR3: One landing page: persona matcher + catalog + steal comparison vs live TPT + `youtextme@gmail.com` custom CTA.
  - KR4: Unique outreach log of people **already asking** for this (not 500 identical DMs).
- **Workback:** verify payout rails → generate 8 original packs → Gumroad catalog + landing → rewrite listings → unique community replies with the free sample first.
- **Agents:** CX Designer, Experience Composer, Platform Architect, NFR Engineer, Builder, Evaluator ≠ Builder.
- **Kill experiment:** If we cannot show live TPT paid demand this week, stop. **Already survived** on 13 Sep 2026. New kill: 500 cold DMs / Instagram spam → **killed** (ToS + ban = shop death). Fake reviews → **killed**.
- **Spend lock (human, 13 Sep 2026):** Do **not** buy ads, boosts, Discover placement, test checkouts, reviews, or any paid tool. Listings and organic replies only. Money may come in; none goes out.
- **Contract:** `docs/outcome-contracts/evening-parent-shop.md`

## High-level intake
- **Customer job:** Print one calm page tonight so a child traces, writes, and reads — then keep next week’s pages in the same shop.
- **Why this, now:** School is in session. TPT buyers paid this week for sight-word packets ($11 and $5.99 live).
- **Distraction-free path:** Open shop → persona answers 3 taps → print the recommended PDF. Catalog stays visible so they can add the $19.97 week bundle.
- **Open / free / possible:** Original generators in `commerce/shop`. No paid ads this slice (spend gate).
- **Languages / borders:** English copy in catalog data. Quiet layout.
- **Extend vs new:** Extend the commerce SKU family. Not a WordSpark shell fork. Shop landing is the adult-buyer journey.
- **Registry:** `commerce/shop/catalog.mjs` (8 SKUs). Persona: `commerce/shop/persona.mjs`.
- **Use-It (this slice):** Every SKU is a downloadable PDF in `commerce/shop/dist` **and** listed on Gumroad / the shop landing this slice. A registry with no live card is failure.
- **Kill:** A 25-SKU junk drawer, cloned TPT files, or 500 copy-paste DMs.

## Challenge the user’s numbers (they are wrong as stated)

| Ask | Why it fails if taken literally | What we do instead |
|-----|----------------------------------|--------------------|
| **500 unique DMs today** | Reddit/Instagram mass DM is spam, gets the shop banned, and is not “unique.” Instagram MCP is unauthenticated. | Identify people **already posting** “sight words / kindergarten printable.” Unique public replies + free sample. Log every contact. Do **not** blast 500 DMs. |
| **25 more offerings** | 25 thin PDFs in one afternoon are not “extremely well crafted.” Buyers bounce. | **8 excellent SKUs** + one **$19.97 bundle** that is the $20 land. Landing also shows comparison, sample, custom 48h pack CTA. |
| **5% conversion from broadcast** | Cold 0-review shops convert far under 5%. Gumroad median creator ~$72/mo. | Pre-register 5% as a **stretch KR**, not a claim. Free sample + steal copy + bundle is the conversion system. |
| **Woori “without fail”** | No agent can guarantee a bank rail. Gumroad KRW is local-bank, not a USD SWIFT wire. **Experiment:** `020` → “The bank code is invalid.” | Keep **Woori SWIFT `HVBKKRSEXXX`** + 13-digit account `******6668`, KRW, weekly, $100 min. Stripe verification confirmed 13 Sep 2026. Residual rail risk remains until the first real payout. |
| **Reviews on demand** | Fake reviews are a legal kill. | Free sample + review ask after a real download. Never invent stars. |

## Persona (one person)

**Maya, 34.** Kindergarten teacher by day, parent at 6:30pm. Already paid on TPT this month. Hates Google Drive folders. Will print **one page tonight**. Will spend **~$20** if the next four evenings are sitting in the same cart. Trusts: sample first, refund, comparison to the $11 bundle, a human email (`youtextme@gmail.com`) if her class needs a custom list.

Not: a Discover browser hunting “digital products.”

## Catalog (8, Use-It)

| id | Price | Job |
|----|-------|-----|
| `sample` | $0 | Taste the page. Review path. |
| `sight-words-220` | $5.99 | All 220 Dolch. Live already. |
| `alphabet-trace` | $3.99 | A–Z trace / write / find / read. |
| `numbers-0-20` | $3.99 | 0–20, ten-frame, write. |
| `cvc-short` | $4.99 | Short-vowel CVC families. |
| `first-sentences` | $4.99 | One quiet sentence a night. |
| `week-tracker` | $2.99 | Four-week check-off for home. |
| `after-dinner` | $19.97 | Bundle: sight words + alphabet + numbers + CVC + sentences. The $20 land. |

Custom CTA (not a 9th junk PDF): email **youtextme@gmail.com** — 48h custom list.

## A/B
- **A (ship):** 8 quiet original packs + $19.97 bundle + sample-first outreach.
- **B (killed):** 25 AI worksheet clones; 500 Instagram DMs; fake reviews.

## Kill criteria
1. Payout banner still blocks publish after a honest Woori save → stop paid SKUs, keep files.
2. Any SKU is a copy of a TPT file → delete it.
3. Outreach is identical copy-paste to 500 strangers → stop and rewrite unique.
5. Spend lock broken (ads, Discover boost, test purchase, bought reviews) → stop and revert the spend.

## Verification
- `node --test commerce/shop/shop.test.js commerce/sight-words/scripts/build-pack.test.js`
- `node commerce/shop/scripts/build-shop.mjs` writes 8 `%PDF` files
- Persona matcher unit tests: teacher/5min/prek → sample or alphabet; parent/15min/k → sight-words; wants-week → after-dinner
- Playwright: Gumroad payout banner absent; shop landing shows ≥8 cards; paid listing comparison block live
- Evaluator ≠ Builder grades `commerce/shop/evidence/`

## Command evidence
- 13 Sep 2026: `020` bank code → Gumroad “The bank code is invalid.” SWIFT `HVBKKRSEXXX` saved; Stripe KYC Confirm; payout banner gone.
- 13 Sep 2026: 6 new listings published (alphabet, numbers, CVC, sentences, tracker, after-dinner bundle). Discover left **off**.
- Storefront https://textme.gumroad.com shows 8 SKUs.
- `node --test commerce/shop/shop.test.js` (run this slice)
- Spend lock: no ads, no checkout Pay, no Discover.
