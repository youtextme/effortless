# Evidence — Passages as reusable capabilities

**Contract:** `docs/outcome-contracts/capability-catalog.md`  
**Slug:** capability-catalog  
**Evaluator:** independent (not the Builder)  
**Date:** 2026-09-08  
**Status:** proven

Graded against the contract and listed artifacts only. No product code was edited.

Builder: copy the **Command evidence (Evaluator)** block below into `docs/outcome-contracts/capability-catalog.md` → `## Command evidence`.

## Outcome Frame (from contract)

- **Job:** New kid exercises (math, diagrams, more reading) plug in as the same kind of thing as today's 100 passages — without rewriting Home or the shell catalog.
- **North Star:** Passages are one registered catalog capability (100 items). A second capability can register, list, and open through the same API with zero shell HTML edits.
- **Kill experiment:** Register a stub `math` exercise; `list('math')` works; catalog HTML renderer does not mention math or VOCABULARY. If adding math still requires `if (id === 'math')` in `shell.js` to list items, kill the slice.

## What was inspected

| Artifact | How |
|---|---|
| `docs/outcome-contracts/capability-catalog.md` | full read |
| `wordspark/platform/kernel/capabilities.js` | full read + imported in kill experiment |
| `wordspark/platform/kernel/capabilities.test.js` | full read + CI |
| `wordspark/platform/components/capability.js` | full read |
| `wordspark/platform/components/capability-packs.js` | full read + `defaultPacks` imported in kill |
| `wordspark/platform/components/capability.test.js` | full read + CI |
| `wordspark/platform/components/home.js` | full read (`HOME_TABS`, `tabsFromRegistry`, `catalogPanelHtml`) |
| `wordspark/platform/shell.js` | full read of listing/open path + `restoreSession` / Listen mount |
| `wordspark/index.html` | Home tabs, `data-catalog` mounts, Settings, `#btn-install` |
| `wordspark/sw.js` | `CACHE_NAME` + capability assets |
| `platform/COMPONENT-MANIFEST.json` | `capability` component + kernel `capabilities` module |
| `platform/cx/stories.json` | `passages-are-capabilities`, `extra-capability-registers-without-shell-fork`, regression stories |
| `platform/cx/nfr.json` | `capability-catalog-no-shell-fork`, `home-three-tabs` |
| `platform/cx/journeys.json` | `builder-adds-an-exercise`, `kid-comes-back`, listen/quiz journeys |
| `platform/adr/004-capability-catalog.md` | full read |
| Slice commit `fb66edf` | `--stat` vs parent `a9390ee` (`cursor/home-quiz-resume-206f`) |

No live browser, Web Speech, or installed-PWA session. Listing proof is registry + `renderCatalogHtml` + shell source, not a clicked Home row.

## What was run

1. Instructed kill experiment (register stub math beside production packs; list/open; shell/kernel source oracles).
2. Independent source + dataset audit (VOCABULARY 100/1000, Home tabs, renderer mentions, no `VOCABULARY.map` / math `if` in shell).
3. Full `npm run ci`.

## Command evidence (Evaluator)

```
$ cd /workspace && node --import ./platform/test/polyfill-storage.mjs -e "
import { createCapabilityRegistry, createExerciseCapability, renderCatalogHtml } from './wordspark/platform/kernel/capabilities.js';
import { defaultPacks } from './wordspark/platform/components/capability-packs.js';
import { readFileSync } from 'node:fs';
const reg = createCapabilityRegistry();
for (const pack of defaultPacks(() => ({ completedPassages: [] }))) reg.register(pack);
const math = createExerciseCapability({
  id: 'math',
  label: 'Math',
  list: () => [{ id: 'n1', title: 'Number bonds to 10', done: false }],
  open: (id) => ({ action: 'open-exercise', exerciseId: id }),
});
reg.register(math);
const shell = readFileSync('./wordspark/platform/shell.js', 'utf8');
const kernel = readFileSync('./wordspark/platform/kernel/capabilities.js', 'utf8');
const html = renderCatalogHtml(reg.listItems('math'), math);
console.log(JSON.stringify({
  passages: reg.listItems('passages').length,
  words: reg.listItems('words').length,
  math: reg.listItems('math').length,
  mathAction: reg.open('math', 'n1').action,
  mathHomeTab: reg.catalogs().some(c => c.id === 'math'),
  catalogHtmlHasVocab: html.includes('VOCABULARY'),
  shellVocabMap: /VOCABULARY\\.map\\(\\(d\\) =>/.test(shell),
  shellMathIf: /if \\(id === 'math'\\)/.test(shell),
  shellRenderCatalog: shell.includes('renderCatalog('),
  kernelMentionsVocab: kernel.includes('VOCABULARY'),
}, null, 2));
"
exit:0
```

Kill-experiment stdout:

```
{
  "passages": 100,
  "words": 1000,
  "math": 1,
  "mathAction": "open-exercise",
  "mathHomeTab": false,
  "catalogHtmlHasVocab": false,
  "shellVocabMap": false,
  "shellMathIf": false,
  "shellRenderCatalog": true,
  "kernelMentionsVocab": false
}
```

Same process, extra print (Evaluator, not the Builder): math catalog HTML is one generic title row (`data-capability="math" data-item="n1"`, title `Number bonds to 10`). Registry health `{ ok: true, count: 3 }` with `words: "1000 words"`, `passages: "100 passages"`, `math: "ready"`. Home catalogs from `reg.catalogs()`: `words,passages` — math is not a Home tab.

Independent dataset + source audit (Evaluator):

```
$ cd /workspace && node --import ./platform/test/polyfill-storage.mjs --input-type=module -e "<VOCABULARY counts + shell/kernel/html audit>"
exit:0
```

| Check | Result |
|---|---|
| `VOCABULARY.length` | 100 |
| words across days | 1000 |
| `shell.includes('VOCABULARY.map((d) =>')` | **false** |
| `shell.includes("if (id === 'math')")` | **false** |
| `function renderPassageList` / `renderWordsList` in shell | **absent** |
| `renderCatalogHtml` source mentions `VOCABULARY` or `\bmath\b` | **false** |
| kernel file mentions `VOCABULARY` | **false** |
| `index.html` `data-home-tab` | `words`, `passages`, `settings` (exactly 3) |
| `data-home-tab="math"` in `index.html` | **false** |
| `defaultPacks` ids | `words`, `passages` only |
| `HOME_TABS` | `words`, `passages`, `settings` |

```
$ cd /workspace && npm run ci
exit:0
# tests 88
# pass 88
# fail 0
# all files line 99.66 / branch 89.89 / funcs 98.31
# capabilities.js line 100.00 / branch 91.67 / funcs 97.22
# CI OK
# Platform validation OK — 11 components, kernel 1.0.0
# Agent-guard OK — 15 test files
# CX analyzer OK — 25 stories, 14 NFRs, 5 journeys
```

Slice stories in that CI run (all pass):

- `story:passages-are-capabilities component:capability 100 passages and 1000 words register as catalogs`
- `story:extra-capability-registers-without-shell-fork component:capability math stubs list without shell ifs`

Boundary / regression stories still green in the same run:

- `story:home-three-tabs component:home Words Passages Settings`
- `story:resume-where-left-off` (storage + shell)
- `story:quiz-takeaway-spread` (twice) and `story:quiz-requires-comprehension-pass` (`PASS_THRESHOLD = 0`)
- `story:listen-from-fold` (fold tests + speech Listen slice)
- `story:word-tap-takes-listen`, `story:one-rate-per-session` / parent pace
- `story:install-pwa-visible`

Git: parent `a9390ee` (`cursor/home-quiz-resume-206f`) had `CACHE_NAME = 'wordspark-v27'`. This slice (`fb66edf`, plus contract `29a6c16`) is `wordspark-v28`. ASSETS add `./platform/kernel/capabilities.js`, `./platform/components/capability.js`, `./platform/components/capability-packs.js`. `--stat` vs parent: 22 files, +1028 / −58. No edits to Listen fold, quiz takeaways, or resume storage modules.

Coverage note: agent-guard `coverageInclude` is still kernel + selected speech files. Line coverage **does not** prove `capability-packs.js`, `capability.js`, `home.js`, or `shell.js`. Proof for those is the tests + independent imports / source matches above. Kernel `capabilities.js` is in the coverage set (100% lines).

## Key Results

### KR1 — Kernel registry: register / list / get / open / health; unknown kinds fail closed — **PASS**

Falsifier: unknown kinds accepted; `open()` throws; registry cannot add a second pack.

Evidence it does not:

- `normalizeKind` / `normalizeRow` throw on `game` / `card`. `validateCapability` requires kebab-case id plus `list` / `get` / `open`.
- `createCapabilityRegistry().open` wraps pack failures and unknown ids as `{ action: 'unknown' }` — never throws.
- Kill experiment: after `defaultPacks` + stub math, `listItems('math').length === 1` and `open('math', 'n1').action === 'open-exercise'`.
- Kernel tests (CI): throwing packs return `[]` / `null` / `{ action: 'unknown' }`; health `ok: false` when a pack health throws.

### KR2 — Production packs passages (100) and words (1000); Home catalogs render from the registry, not a VOCABULARY loop in the shell — **PASS**

Falsifier: Home passage/word lists still map `VOCABULARY` inside `shell.js`; counts ≠ 100 / 1000.

Evidence it does not:

- Kill experiment: `passages: 100`, `words: 1000`. Independent `VOCABULARY` import matches. Pack `health()` requires those exact counts.
- `defaultPacks()` is `createWordsCapability` + `createPassagesCapability` only. `VOCABULARY.map` lives in `capability-packs.js`, not the shell.
- Shell listing: `renderHomeTab` calls `renderCatalog(id)` except Settings chrome. `renderCatalog` does `ctx.capability.renderCatalogHtml(ctx.capability.listItems(id), cap)` into `[data-catalog="${id}"]`.
- Parent `renderPassageList` / `renderWordsList` and `VOCABULARY.map((d) =>` are gone from `shell.js` (`--stat` vs `a9390ee`). Remaining `VOCABULARY.find` is reading-day lookup, not catalog listing.
- `index.html` mounts `data-catalog="words"` and `data-catalog="passages"`. Home tabs stay Words | Passages | Settings.

### KR3 — Stub math registers in tests; list works; catalog HTML renderer does not mention math or VOCABULARY — **PASS**

Falsifier: listing math requires `if (id === 'math')` in `shell.js`; renderer hardcodes `VOCABULARY` or a math branch.

Evidence it does not:

- Kill experiment: `math: 1`, `mathAction: "open-exercise"`, `mathHomeTab: false`, `catalogHtmlHasVocab: false`, `shellMathIf: false`, `shellRenderCatalog: true`, `kernelMentionsVocab: false`.
- `renderCatalogHtml` switches on row kind `title` | `word` only. Independent slice of that function: no `VOCABULARY`, no `\bmath\b`.
- Generated math HTML is a generic `.passage-item` with `data-capability="math"` (the pack id), not a math-specific template. File-header comments mention math as a future pack; the renderer does not.
- `createExerciseCapability` defaults `homeTab: false`. Stub math is not in `defaultPacks` and does not appear in `reg.catalogs()` or kid HTML.

## Kill criteria

| Criterion | Result |
|---|---|
| Home passage list still maps `VOCABULARY` inside `shell.js` | **not hit** — `shellVocabMap: false`; no `VOCABULARY.map((d) =>`; no `renderPassageList` / `renderWordsList` |
| Registry cannot hold a second catalog without editing shell | **not hit** — stub math registered and listed/opened with zero shell edits; `shellMathIf: false` |
| Passages count ≠ 100 or words catalog ≠ 1000 | **not hit** — kill JSON `100` / `1000`; dataset audit matches; pack health OK |
| Listen, quiz coaching, resume, or Home 3-tab Settings regress | **not hit** — CI 88/88 includes listen-fold, quiz-takeaway-spread, resume-where-left-off, home-three-tabs; those modules are absent from the slice `--stat` |

Kill experiment (register stub math): **holds**.

## Definition of Done (contract checklist)

| Item | Evaluator |
|---|---|
| Kernel `capabilities.js` + `CapabilityComponent` | **met** |
| Passages + words registered; shell lists via registry | **met** |
| Stub math registers in tests without shell fork | **met** |
| CX + NFR + CI | **met** — stories `passages-are-capabilities`, `extra-capability-registers-without-shell-fork`; NFR `capability-catalog-no-shell-fork`; journey `builder-adds-an-exercise`; CI `exit:0` 88/88 |
| Command evidence from Evaluator | **met** in **this** file. Contract file still `Status: active` with empty Command evidence — Builder copies the block above |

Boundary (no math/diagram content UI, no cloud, do not regress Listen fold, word-sheet, kid-think quiz, resume, or PWA install): `index.html` has no Math tab. `defaultPacks` does not register math. `mathHomeTab: false`. Slice `--stat` does not strip fold/session/lifecycle, word-sheet, quiz takeaways, or resume helpers. `#btn-install` remains. CI still passes those stories.

## Minority-veto

**No veto** on kill criteria or a falsified KR.

Non-blocking remainder (does not flip Status):

1. No live Home click / catalog paint in a browser. Do not treat this file as a device UI capture.
2. `catalogPanelHtml` can emit a `data-catalog` mount for a future `homeTab: true` pack, but `shell.js` does not inject it. On-screen listing still needs a `[data-catalog]` node (today: static words/passages mounts). API list/open does not. This slice forbids shipping a Math tab, so that gap is out of scope.
3. Shell still imports `VOCABULARY` for `getPassageData` (reading), not listing.
4. `capability-packs.js` / `shell.js` / `home.js` / `capability.js` are coverage-excluded; 99.66% lines is not proof of those files.
5. Contract file itself remains `Status: active` until Builder copies receipts and marks DoD.

## Sources read

- `docs/outcome-contracts/capability-catalog.md`
- `wordspark/platform/kernel/capabilities.js`
- `wordspark/platform/kernel/capabilities.test.js`
- `wordspark/platform/components/capability.js`
- `wordspark/platform/components/capability-packs.js`
- `wordspark/platform/components/capability.test.js`
- `wordspark/platform/components/home.js`
- `wordspark/platform/components/home.test.js`
- `wordspark/platform/components/components.test.js`
- `wordspark/platform/shell.js` (`renderCatalog`, `handleCatalogOpen`, `restoreSession`)
- `wordspark/index.html` (Home tabs + `data-catalog`)
- `wordspark/sw.js`
- `platform/COMPONENT-MANIFEST.json` (`capability`)
- `platform/cx/stories.json` / `nfr.json` / `journeys.json`
- `platform/adr/004-capability-catalog.md`
- git `fb66edf` vs parent `a9390ee` for listing rewrite + `CACHE_NAME`
