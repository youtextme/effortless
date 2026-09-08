# Outcome Contract — Harden Speech (visible = spoken)

**Status:** active  
**Slug:** harden-speech  
**Date:** 2026-09-06

## Outcome Frame

- **Job:** A child hears a steady, warm mother-like voice reading only the words on the current screen, and can tap Listen on every page.
- **North Star:** Hidden/off-screen text spoken → **0**; listen control present on every surface → **100%**; rate stays constant for a session (no word-by-word / resume glitches).
- **Key Results:**
  1. Speech text is extracted from **visible DOM** (skip `display:none`, `[hidden]`, `aria-hidden`, chrome).
  2. One sticky warm-female voice + one rate for the whole session; no persona rotation.
  3. Global Listen control on reading, word sheet, quiz, certificate, topic/words/certs panels.
  4. Engine uses capability signals (paused, voiceschanged, utterance errors) — not Chrome UA forks.
- **Workback:** contract → speech core → global listen → tests → ship
- **Agents:** Builder, then Evaluator (separate)
- **Kill experiment:** If Web Speech API cannot produce a female English voice on a device, Listen still works with the highest-scored available voice (never crash / silent fail without health).
- **Contract:** `docs/outcome-contracts/harden-speech.md`

## Baseline (bar-raiser)

| Approach | Hidden text | Rate stability | Cross-platform | Cost |
|---|---|---|---|---|
| Do nothing (current TTS) | Speaks `display:none` h2s | Word-by-word + timed guess + resume() | UA-sniff Chrome | Free |
| Cloud neural TTS (ElevenLabs / Google Cloud) | Can be wired to DOM | Stable | Needs key + network | Paid (gate) |
| WASM Piper/Kokoro | Can be wired to DOM | Stable | 20–80MB model | Free, heavy PWA |
| **This slice: mechanized Web Speech + visible-text** | DOM visibility filter | One rate, packed utterances | OS voices (PC/Mac/Android/iOS) | Free |

PoC (cheapest kill): extract visible text from a fixture with a hidden h2 — if hidden heading appears in speech units, architecture is wrong.

## Kill criteria

- Listen missing on quiz/certificate/panels
- Hidden `.passage-h2` still in spoken string
- Word-by-word utterances for passage reading
- Rate changes mid-passage (multiple rate constants or resume-while-speaking)

## Boundary

Client-side only. No paid TTS keys. No recording of children. “Mic” = always-available **Listen** (speech output). Speech Recognition is not in this slice (would need explicit kid-recording consent).

## Definition of Done

- [x] Visible-text extractor unit tests include hidden-heading fixture
- [x] Voice picker unit tests prefer female/warm signals without requiring exact vendor names
- [x] `validate-platform.mjs` passes
- [x] Listen dock in `index.html`, wired from shell on all surfaces
- [x] Hardcoding inventory written (honest remainder)

## Command evidence

```
$ node --test platform/speech/speech.test.js
exit:0  (14 pass)

$ node platform/scripts/validate-platform.mjs
exit:0  Platform validation OK — 9 components, kernel 1.0.0
```
