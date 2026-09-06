# Evidence — Harden Speech (visible = spoken)

**Contract:** `docs/outcome-contracts/harden-speech.md`  
**Slug:** harden-speech  
**Evaluator:** independent (not the Builder)  
**Date:** 2026-09-06  
**Status:** proven

Graded against the contract, inventory, and ADR only. No product code was edited.

## Outcome Frame (from contract)

- **Job:** A child hears a steady, warm mother-like voice reading only the words on the current screen, and can tap Listen on every page.
- **North Star:** Hidden/off-screen text spoken → 0; listen control present on every listed surface → 100%; rate stays constant for a session.
- **Kill experiment:** If no female English voice exists, Listen still uses the highest-scored available voice (no crash / silent fail without health).

## What was run

```
$ cd /workspace/wordspark && node --test platform/speech/speech.test.js
exit:0
# tests 14
# pass 14
# fail 0
```

```
$ node /workspace/platform/scripts/validate-platform.mjs
exit:0
Platform validation OK — 9 components, kernel 1.0.0
```

Repo greps (Evaluator, not claimed as CI):

- `isChrome` / `navigator.userAgent` / `userAgentData` / `Chrome/` in `wordspark` `*.{js,mjs,html,css}` → **no matches**
- `isChrome` / `userAgent` under `/workspace` `*.{js,mjs,ts,json}` → **no matches**
- `data-speech-surface` in `wordspark/index.html` → 8 surfaces (listed under KR3)
- `id="btn-listen"` present; `id="btn-read-aloud"` absent

No live Web Speech / browser session was required by this eval brief. Spoken-string claims below are from source + unit tests, not from an uttered audio capture.

## Key Results

### KR1 — Spoken text is visible DOM only (hidden `.passage-h2` skipped) — **HOLD**

Falsifier: hidden `.passage-h2` text appears in the spoken string.

Evidence it does not:

- `js/passage-generator.js` emits `<h2 class="passage-h2" aria-hidden="true">…</h2>`.
- `css/app.css` `.passage-h2 { display: none; }`.
- `platform/speech/policy.js` `skipClassTokens` includes `passage-h2`.
- `platform/speech/visible-text.js` `isSilentFromFlags` returns true for `display:none`, `[hidden]`, `aria-hidden="true"`, `data-speech-skip`, `visibility:hidden`, `opacity:0`, skip tags, and skip class tokens. `collectVisibleTextNodes` rejects ancestors that are silent.
- Test `hidden passage-h2 flags are silent — not spoken` **pass** (test 11/14).

Chrome (`data-speech-skip` on header, listen dock, FAB, parent footer, scroll fade/sentinel) is skipped by the same flags.

### KR2 — One sticky warm-female voice, no persona rotation, no Chrome UA forks — **HOLD**

Falsifier: rotating personas, per-utterance voice swap, or Chrome UA branch.

Evidence:

- `pickWarmMother` returns sticky `voiceURI` when present; otherwise highest `scoreVoice` (female/warm/neural signals in policy, not a named vendor requirement).
- Test `sticky URI wins so the voice does not rotate` **pass**; female preference tests **pass**.
- `sessionProfile` sets one `rate` from quality band; `applyProfile` copies that rate onto every utterance.
- `getParentReader()` in the legacy facade returns `null`. `getCurrentReader()` uses a static `label: 'Mom'` — not a rotating persona table.
- No `isChrome` / UA string forks in the speech engine or app JS.

### KR3 — Global Listen dock on every listed surface — **HOLD**

Falsifier (also a kill criterion): Listen missing on quiz / certificate / panels.

Evidence:

- Single `#btn-listen.listen-dock` in `index.html`, `data-speech-skip`, `aria-label="Listen to this page"`.
- `shell.js` `ctx.speech?.mountListenControl($('#btn-listen'))`.
- `data-speech-surface` on: `reading-scroll`, `screen-quiz`, `screen-complete`, `name-modal`, `word-sheet`, `panel-passages`, `panel-words`, `panel-certificates`.
- Stacking: `.listen-dock` `z-index: 260` sits above quiz/complete overlays (150), sub-panels (120), word-sheet (200), and modals (250), so the dock remains tappable on those surfaces.
- Test `index.html has a global listen dock and speech surfaces on every page` **pass**.

`#refresh-modal` has no `data-speech-surface`. It is **not** in KR3’s surface list (parent reset; inventory marks parent password out of this slice). Not a KR fail.

### KR4 — Engine uses capability signals, not UA sniffing — **HOLD**

Falsifier: `isChrome` or other UA forks; resume/chunk logic keyed on browser name.

Evidence:

- `engine.js`: `voiceschanged` on `speechSynthesis`; `resume()` only when `speechSynthesis.paused`; utterance `onerror` shrinks pack size via `nextMaxChars`.
- Keep-alive interval calls `resumeIfPaused` only if `synth().speaking` **and** paused.
- Zero UA / `isChrome` matches in the repo greps above.

### KR5 (eval brief) — Tests pass; platform validation passes — **HOLD**

See command receipts. 14/14 speech tests; platform validation OK (9 components, kernel 1.0.0).

## Kill criteria

| Criterion | Result |
|---|---|
| Listen missing on quiz/certificate/panels | **not hit** — global dock + surfaces + z-index |
| Hidden `.passage-h2` still in spoken string | **not hit** — CSS + `aria-hidden` + skip token + silent flags |
| Word-by-word utterances for passage reading | **not hit** — `packByChars` (initial 220); `speakWord()` stub returns false |
| Rate changes mid-passage (multi-rate path or resume-while-speaking) | **not hit** — one session rate; `resume()` gated on `paused` |

Kill experiment (no female voice): `pickWarmMother` still returns `ranked[0]`; `health()` reports TTS availability / fallback. Not exercised on a real device in this eval; code path does not require a female name.

## Definition of Done (contract checklist)

| Item | Evaluator |
|---|---|
| Visible-text extractor unit tests include hidden-heading fixture | **met** (flag fixture for `.passage-h2` + `display:none` + `aria-hidden`) |
| Voice picker unit tests prefer female/warm without exact vendor names | **met** |
| `validate-platform.mjs` passes | **met** (`exit:0`) |
| Listen dock in `index.html`, wired from shell on all listed surfaces | **met** |
| Hardcoding inventory written | **met** (`docs/speech-hardcoding-inventory.md`) |

ADR 002 decisions 1–5 match the implementation (`wordspark/platform/speech/`, visible DOM, sticky voice, capability engine, global dock).

## Minority-veto

**No veto.** No judge-valid flag on kill, security, or a falsified KR.

Non-blocking remainder (does not flip Status):

1. Hidden-heading coverage is `isSilentFromFlags`, not `collectSpeechUnits` / `visiblePlainText` on a live DOM tree. A TreeWalker regression would not fail today’s tests. Triple skip (CSS, aria, class token) still makes KR1 hold.
2. `policy.js` `skipSelectors` is unused; skip behavior is implemented via flags/tags/classes (inventory-honest, not a KR miss).
3. `window.addEventListener('voiceschanged')` is extra; readiness already listens on `speechSynthesis`. Not a UA fork.
4. No uttered-audio proof that a hidden heading is absent from `SpeechSynthesisUtterance.text`. Out of the instructed command set.

## Sources read

- `docs/outcome-contracts/harden-speech.md`
- `docs/speech-hardcoding-inventory.md`
- `platform/adr/002-speech-visible-text.md`
- `wordspark/platform/speech/{visible-text,engine,voice-picker,policy,listen-control,sentences,speech.test}.js`
- `wordspark/platform/components/{speech,tts,word-sheet}.js`
- `wordspark/platform/shell.js`
- `wordspark/js/tts.js`
- `wordspark/js/passage-generator.js` (`sectionToHtml`)
- `wordspark/index.html`
- `wordspark/css/app.css` (`.passage-h2`, `.listen-dock`, overlay/panel z-index)
- `platform/scripts/validate-platform.mjs`
- `platform/COMPONENT-MANIFEST.json`
