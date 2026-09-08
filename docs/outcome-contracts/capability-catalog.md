# Outcome Contract — Passages as reusable capabilities

**Status:** proven  
**Slug:** capability-catalog  
**Date:** 2026-09-08

## Outcome Frame

- **Job:** New kid exercises (math, diagrams, more reading) plug in as the same kind of thing as today's 100 passages — without rewriting Home or the shell catalog.
- **North Star:** Passages are one registered catalog capability (100 items). A second capability can register, list, and open through the same API with zero shell HTML edits.
- **Key Results:**
  1. Kernel capability registry: register / list / get / open / health; unknown kinds fail closed.
  2. Production packs: `passages` (100) and `words` (1000); Home catalogs render from the registry, not a VOCABULARY loop in the shell.
  3. Kill experiment: register a stub `math` exercise; `list('math')` works; catalog HTML renderer does not mention math or VOCABULARY.
- **Workback:** contract → kernel registry + packs → Home/shell consume registry → CX/CI → Evaluator.
- **Agents:** Builder, Evaluator (fresh).
- **Kill experiment:** If adding math still requires a new `if (id === 'math')` in `shell.js` to list items, kill the slice.
- **Contract:** `docs/outcome-contracts/capability-catalog.md`

## Assumptions (challenged)

- “100 passages” is the first **catalog**, not the platform. Math/diagrams are the same noun with a different pack.
- Do not ship an empty Math tab to kids in this slice. Register math only in tests (`homeTab: false`) until there is real content.
- Home stays Words | Passages | Settings until another pack opts into `homeTab: true`.
- Reliability = validate on register, health on 100/1000 counts, open() never throws on unknown ids.

## Kill criteria

- Home passage list still maps `VOCABULARY` inside `shell.js`
- Registry cannot hold a second catalog without editing shell
- Passages count ≠ 100 or words catalog ≠ 1000
- Listen, quiz coaching, resume, or Home 3-tab Settings regress

## Boundary

No math/diagram content UI. No cloud. Do not regress Listen fold, word-sheet, kid-think quiz, resume, or PWA install.

## Bar-raiser baseline

| Approach | Add math later | Reliability |
|---|---|---|
| Do nothing | Fork `renderPassageList` / new Home tab by hand | Lists drift; shell grows `if`s |
| CMS of HTML pages | Duplicate players per exercise | No shared health/open contract |
| Capability registry + generic catalog renderer | `register(pack)` + optional `homeTab` | Health, fail-closed kinds, one list renderer |

## Definition of Done

- [x] Kernel `capabilities.js` + `CapabilityComponent`
- [x] Passages + words registered; shell lists via registry
- [x] Stub math registers in tests without shell fork
- [x] CX + NFR + CI
- [x] Evaluator command evidence

## Command evidence

Copied from Evaluator (`docs/outcome-contracts/evidence-capability-catalog.md`).

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

```
$ cd /workspace && npm run ci
exit:0
# tests 88
# pass 88
# fail 0
# CI OK
```

Evaluator: `docs/outcome-contracts/evidence-capability-catalog.md` — Status **proven**.
