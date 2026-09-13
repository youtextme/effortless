# Evaluator (≠ Builder) — evening-parent shop

Date: 13 Sep 2026  
Contract: `docs/outcome-contracts/evening-parent-shop.md`  
Grade: **listings proven · cash not proven · spend lock held**

## Evidence used
- Public storefront https://textme.gumroad.com — 8 named SKUs including `$19.97` bundle and `$0+` sample (Playwright innerText, `gumroad-storefront.png`)
- Bundle https://textme.gumroad.com/l/after-dinner — `$23.95 $19.97`, five included products, no Pay click
- Payments: holder MAHADEVAN GIRISH, bank code `HVBKKRSEXXX`, account `******6668`, KRW weekly $100 min. Local code `020` rejected (“The bank code is invalid.”). Stripe KYC Confirm cleared the pending-verification banner. No “connect a payout method” on product editor.
- Unit tests: `commerce/shop/shop.test.js`
- Outreach log: 3 identified, **0 posted** (spend/push lock)

## KRs
| KR | Result |
|----|--------|
| KR1 payout form Gumroad accepts | **Met with residual.** SWIFT accepted. `020` is not a valid Gumroad Korea bank code. First KRW send still needs $100. “Without fail” is **not** proven. |
| KR2 8 live SKUs + $19.97 bundle | **Met.** |
| KR3 landing + steal + youtextme | **Met** on Gumroad storefront + `wordspark/print-shop.html`. GitHub Pages shop URL is not live until merge. |
| KR4 unique outreach log | **Met as log, not as 500 posts.** 500 DMs remain killed. |

## Spend lock (human, this slice)
No ads. No Gumroad Discover enable. No test purchase. No review buy. Evaluator did not see a Pay click or a paid placement.

## North Star ($500 / 7 days)
**Not proven.** Shop has 0 paid sales on the catalog at grade time (sample has 1 free download).

## Kill checks
- Cloned TPT files: not found in generated PDFs (unit test).
- Fake reviews: none invented.
- 500 DMs: not executed.

## Minority veto
Do not tell the human the shop “will convert 5%.” Cold 0-review Gumroad does not. Do not claim Woori payouts cannot fail; rails are untested with a real balance.
