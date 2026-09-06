# WordSpark OR-3 — live verification (Chief of Staff)

Run after `github-pages.yml` deploy completes on `gh-pages`.

## URLs (HTTP 200)

```bash
BASE=https://youtextme.github.io/effortless
curl -sI "$BASE/" | head -1
curl -sI "$BASE/wordspark/" | head -1
curl -sI "$BASE/snack/" | head -1
curl -sI "$BASE/js/data/words.js" | head -1
curl -sI "$BASE/wordspark/js/data/words.js" | head -1
```

Expected: all `HTTP/2 200` (or `HTTP/1.1 200`).

## Passage database shape (must NOT be card-only)

```bash
curl -s "$BASE/js/data/words.js" | node -e "
const fs=require('fs'); const s=fs.readFileSync(0,'utf8');
const hasBody=s.includes('\"body\":');
const hasBodyWc=s.includes('\"body_wc\":');
const cardOnly=!hasBody && s.includes('\"words\":');
console.log(JSON.stringify({ hasBody, hasBodyWc, cardOnly, reject: cardOnly || !hasBody }));
process.exit(cardOnly || !hasBody ? 1 : 0);
"
```

## Counts

```bash
curl -s "$BASE/js/data/words.js" | node --input-type=module -e "
import { readFileSync } from 'node:fs';
const src = readFileSync(0, 'utf8');
const m = src.match(/export const VOCABULARY = (\[[\\s\\S]*?\]);\\nexport const TOTAL_DAYS/);
if (!m) { console.error('parse fail'); process.exit(1); }
const VOCABULARY = eval(m[1]);
const withBody = VOCABULARY.filter(d => d.body && d.body_wc > 0);
const wcOk = withBody.filter(d => d.body_wc >= 350 && d.body_wc <= 450);
console.log(JSON.stringify({
  passages: VOCABULARY.length,
  withBody: withBody.length,
  wcInRange: wcOk.length,
  body_wc_min: Math.min(...withBody.map(d => d.body_wc)),
  body_wc_max: Math.max(...withBody.map(d => d.body_wc)),
}, null, 2));
"
```

Expected: `passages: 100`, `withBody: 100`, `wcInRange: 100`, `body_wc_min` ≥ 350, `body_wc_max` ≤ 450.

## Speech surface (HTML)

```bash
curl -s "$BASE/" | rg -q 'id=\"btn-listen\"' && echo 'btn-listen OK'
curl -s "$BASE/" | rg -q 'data-speech-surface' && echo 'speech-surface OK'
curl -s "$BASE/wordspark/" | rg -q 'id=\"btn-listen\"' && echo 'wordspark btn-listen OK'
```

## Snack regression

```bash
curl -sI "$BASE/snack/" | head -1
curl -s "$BASE/snack/" | rg -q 'snack|blog' && echo 'snack content OK'
```
