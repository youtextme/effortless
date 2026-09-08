# Evidence — Word-sheet daily speech

**Contract:** `docs/outcome-contracts/word-sheet-daily.md`  
**Slug:** word-sheet-daily  
**Evaluator:** independent (not the Builder)  
**Date:** 2026-09-08  
**Status:** proven

Graded against the contract and listed artifacts only. No product code was edited.

## Outcome Frame (from contract)

- **Job:** When a 10-year-old taps an advanced word, they hear it twice, hear a plain meaning, then hear three sentences they could actually say at school, home, or with friends.
- **North Star:** Tap → word, word, meaning, example, example, example. Every example contains the word. Meaning is one simple spoken sentence.
- **Kill experiment:** A missing `WORD_EXPLANATIONS` entry still returns 3 kid sentences that include the word.

## What was inspected

| Artifact | How |
|---|---|
| `docs/outcome-contracts/word-sheet-daily.md` | full read |
| `wordspark/js/word-usage.js` | full read + imported in audit |
| `wordspark/platform/components/word-sheet.js` | full read |
| `wordspark/platform/speech/engine.js` `speakWordSheet` | full function + slice diff |
| `wordspark/platform/speech/policy.js` `wordSheet` | full object |
| `wordspark/js/data/word-explanations.js` | 5-word spot-check + full-key audit |
| `wordspark/platform/components/word-sheet.test.js` | full read + re-run |
| `wordspark/sw.js` `CACHE_NAME` | read + git parent comparison |
| `wordspark/index.html` word-sheet DOM | selectors |
| `wordspark/platform/shell.js` `openWordSheet` / `closeWordSheet` | intro wiring |
| `wordspark/platform/speech/speech.test.js` engine-order story | read + re-run |
| `wordspark/js/data/words.js` | imported as 1000-entry source |
| Slice commit `730621b` | `--stat` + diffs for engine/policy/sheet/shell |

Not re-run: full `npm run ci` (Builder-claimed `exit:0`, 65 tests, coverage lines 99.47 / branches 88.33 / funcs 98.67). Coverage include list **excludes** `engine.js`, `word-sheet.js`, and `word-usage.js`, so those numbers are not proof of this slice.

No live Web Speech / browser TTS session. Spoken-order claims below are from source + unit tests + an independent Node audit, not from uttered audio.

## Command receipts (Evaluator)

```
$ node --test --import /workspace/platform/test/polyfill-storage.mjs \
    wordspark/platform/components/word-sheet.test.js \
    wordspark/platform/speech/speech.test.js
exit:0
# tests 28
# pass 28
# fail 0
```

Word-sheet stories in that run (all pass):

- `story:word-sheet-daily-use every vocab word has a simple meaning and 3 examples containing the word`
- `story:word-sheet-daily-use missing lookup still returns 3 kid sentences with the word`
- `spoken meaning is one plain sentence a kid can follow`
- `kid examples prefer daily life over adult dataset lines`
- `story:word-sheet-daily-use sheet fills meaning and three example lines then speaks the panel`
- `story:word-sheet-daily-use engine says the word twice then meaning then examples`

```
$ node /tmp/eval-word-sheet-daily.mjs
exit:0
```

Independent audit (imports product modules; does not trust the Builder):

| Check | Result |
|---|---|
| Vocab entries | 1000 |
| Unique words | 732 |
| `WORD_EXPLANATIONS` keys | 732 |
| Unique keys missing from file | 0 |
| Extra keys not in vocab | 0 |
| `getWordExplanation` examples `< 3` | 0 |
| Empty/short `simple` | 0 |
| Example lines omitting the target word | 0 |
| Adult leak (`scientist\|police\|darwin\|…`) in spoken examples | 0 |
| Missing-key fallback (`blorple`) | 3 lines, all contain `blorple`, meaning present |
| Cache | `wordspark-v22`; assets include `word-explanations.js` and `word-usage.js` |

Git: parent of `730621b` had `CACHE_NAME = 'wordspark-v21'`; this slice is `wordspark-v22`.

## Key Results

### KR1 — Speech order is fixed: 2× word → simple meaning → 3 examples — **PASS**

Falsifier: examples spoken with no meaning, or word not repeated, or meaning after examples.

Evidence it holds on the product path:

- `policy.js` `wordSheet.repeats === 2`, `leadSelector: '.sheet-word'`, `meaningSelector: '.sheet-intro'`, `examplesSelector: '.sheet-scenarios'`.
- `index.html`: `#sheet-word.sheet-word`, `#sheet-intro.sheet-intro` (starts `hidden`), `#sheet-scenarios.sheet-scenarios`.
- `shell.js` passes `intro: $('#sheet-intro')` into `open` / `close`.
- `word-sheet.js` `open()` sets `intro.textContent = speech.meaning`, `intro.hidden = false`, then writes **3** `.example-line` nodes, then `sheet.hidden = false`, then `speakWordSheet(panel)`.
- `engine.js` `speakWordSheet` (this slice **added** the meaning turn; previously it was word ×2 then examples only):

  1. speak lead `repeats` times (2)
  2. if meaning has `visiblePlainText`, speak meaning
  3. speak examples container

- `blockSelector` includes `.sheet-intro` and `.example-line` / `p`, so meaning and each example line are speech blocks.
- Component test asserts intro unhidden, intro matches `/mean/i`, three `.example-line` nodes, then `speakWordSheet` called.
- Engine story test asserts `meaningSelector` appears in source **before** `examplesSelector`, and `repeats === 2`.

Gap (does not flip KR): the engine story is a source-index check, not a mocked `speechSynthesis` sequence. No uttered-audio proof in this environment.

### KR2 — Three on-screen daily-life examples per unique vocab word (732 unique / 1000 entries) — **PASS**

Falsifier: unique count wrong, or any unique word shows fewer than 3 examples, or examples omit the word.

Evidence:

- Independent audit: 1000 entries, 732 unique, 732 explanation keys, 0 missing, 0 extras.
- For every vocab entry, `getWordExplanation` returns `examples.length === 3` and each line contains the word (audit `omitWord: 0`; matching unit test).
- Sheet render: `speech.examples.map` → three `<p class="example-line">`.
- Adult dataset lines (`Police investigate…`, Darwin/scientists) are rejected by `datasetUsable` / `ADULT_EXAMPLE`; police fixture test passes.

Spot-check (5 words from `word-explanations.js`):

| Word | Meaning spoken | 3 examples contain word? | Daily-life setting? |
|---|---|---|---|
| analyze | `It means you examine in detail to understand.` | yes | match / message / dinner |
| hypothesis | `Hypothesis is an educated guess to be tested.` | yes | today / friend / homework |
| investigate | `It means to look into something carefully.` | yes | jumper / what happened / homework |
| observe | `It means to watch carefully and notice details.` | yes | garden birds (dataset, kid voice) + two templates |
| negotiate | `It means to discuss to reach agreement.` | yes | charger / jumper / shout — **word present, usage weak** |

Remainder (not a KR fail, not a kill): POS templates are school/home/friend *settings* but some verbs are jammed into the same slots (`negotiate where I left my charger`). See risks.

### KR3 — Fallback still yields 3 examples if a lookup misses — **PASS**

Falsifier: missing `WORD_EXPLANATIONS` key returns fewer than 3 lines or lines without the word.

Evidence:

- `getWordExplanation` uses curated row only when `found.simple` and `found.examples.length >= 3`; else `spokenMeaning` + `buildKidExamples`.
- Kill-experiment fixture `blorple` (audit + unit test): 3 lines, all match `/blorple/i`, meaning non-empty.
- `pickThree` always pulls 3 distinct pool lines (pools have 6–9 templates).
- `explanationToSpeech` slices to 3.

Coverage note: today every unique vocab word **has** a file row (0 missing keys), so fallback is proven by the synthetic miss, not by a production hole.

## Kill criteria

| Criterion | Result |
|---|---|
| Sheet still speaks examples without saying the meaning | **not hit** on the wired path: intro is filled and unhidden before `speakWordSheet`; engine speaks meaning before examples. Residual: if `.sheet-intro` is missing/empty/`hidden`, engine **skips** meaning and still speaks examples. Shell always passes intro. |
| Fewer than 3 examples shown or spoken | **not hit** — 3 lines in data, render, fallback, and 1000-entry audit |
| Examples omit the target word | **not hit** — `omitWord: 0` across 1000 entries; fallback includes the word |

Kill experiment (missing lookup): **holds** (`blorple`).

## Definition of Done (contract checklist)

| Item | Evaluator |
|---|---|
| Word twice, then meaning, then 3 examples | **met** in code + tests (not live TTS) |
| Kid-relatable example generator + data file | **met** (732/732 keys; quality remainder on some verb templates) |
| Tests + live cache bump | **tests met**; cache **bumped v21 → v22** in `sw.js`. Live GitHub Pages fetch **not verified** here |
| Command evidence in this contract | **not filled** in `word-sheet-daily.md` (still `(filled after CI)`). Receipts are in **this** evidence file |

Boundary (Listen highlight, parent pace, quiz coaching): slice diffs touch word-sheet copy/speech order, explanations, tests, cache, CX story/NFR. `engine.js` change is the meaning turn inside `speakWordSheet` only. No quiz/pace/highlight files in the slice `--stat`.

## Minority-veto

**No veto** on kill criteria or a falsified KR.

Non-blocking remainder (does not flip Status):

1. No live Web Speech capture. Do not treat this file as uttered-audio proof.
2. Engine order test is source-index; `engine.js` is coverage-excluded. A runtime skip of empty meaning would still speak examples.
3. Some generated examples contain the word but are not sentences a kid would actually *mean* (`negotiate` / `observe this homework`). That is a product-quality risk, not a listed kill.
4. Contract file still `Status: active` with empty command-evidence block.

## Sources read

- `docs/outcome-contracts/word-sheet-daily.md`
- `wordspark/js/word-usage.js`
- `wordspark/js/data/word-explanations.js` (spot-check + key count)
- `wordspark/platform/components/word-sheet.js`
- `wordspark/platform/components/word-sheet.test.js`
- `wordspark/platform/speech/engine.js` (`speakWordSheet`)
- `wordspark/platform/speech/policy.js` (`wordSheet`)
- `wordspark/platform/speech/speech.test.js` (engine-order story)
- `wordspark/platform/speech/visible-text.js` (`visiblePlainText` / `[hidden]`)
- `wordspark/platform/shell.js`
- `wordspark/index.html` (word-sheet markup)
- `wordspark/sw.js`
- `platform/cx/stories.json` / `nfr.json` (`word-sheet-daily-use`)
- git `730621b` vs parent for `CACHE_NAME`
