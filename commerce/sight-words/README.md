# Sight-word pack

Original **220 Dolch sight-word** printable PDF. Built because teachers are **paying this week** on Teachers Pay Teachers — not because “printables might sell.”

## Evidence (live, 13 Sep 2026)

- $11 bundle, **8,784** verified reviews: https://www.teacherspayteachers.com/Product/Sight-Words-Kindergarten-Worksheets-Practice-Activities-Books-First-Grade-1st-3150071
- $5.99 color pack, **10,920** verified reviews: https://www.teacherspayteachers.com/Product/Sight-Word-Practice-Coloring-Pages-Bundle-incl-Easter-Spring-Activities-592311

Reviews on both pages include **11 September 2026**.

## Build

```bash
node commerce/sight-words/scripts/build-pack.mjs
node --test commerce/sight-words/scripts/build-pack.test.js
```

Outputs:

- [dist/wordspark-220-sight-words.pdf](dist/wordspark-220-sight-words.pdf)
- [dist/wordspark-sight-words-sample.pdf](dist/wordspark-sight-words-sample.pdf)

## List it

Follow [LISTING.md](LISTING.md). Human publishes (Gumroad 2FA + payouts). Agent cannot collect money without that.

## Why this, not a prompt pack

Gumroad’s own 2026 crawl says most listings earn $0 and the median creator makes $72/month. The TPT sight-word pages are the opposite: thousands of **verified purchases** and fresh 5-star reviews. Dolch lists are public-domain word lists; sentences and layout here are original.
