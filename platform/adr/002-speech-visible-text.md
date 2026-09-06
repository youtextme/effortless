# ADR 002 — Speech reads visible DOM only

## Status

Accepted

## Context

Read-aloud was a pile of special cases: rotating personas, Chrome UA forks, word-by-word vs sentence TTS, timed highlight guessing, and `speechSynthesis.resume()` on every queue. It spoke `display:none` section headings and was missing from quiz/certificate/panels.

## Decision

1. **Speech subsystem** lives at `wordspark/platform/speech/` (policy, voice picker, visible-text, engine, listen control). The `tts` component is a thin adapter.
2. **Spoken text = visible text.** Surfaces opt in with `data-speech-surface`. Chrome opts out with `data-speech-skip`. Computed style / `[hidden]` / `aria-hidden` are skipped.
3. **One voice, one rate** per session. Voice is scored from whatever the OS/browser exposes (Web Speech API — best free option on PC, Mac, Android, iOS). Sticky `voiceURI` in localStorage.
4. **Engine capabilities, not UA strings.** Resume only when `speechSynthesis.paused`. Shrink chunks when an utterance errors. No Chrome-only speak path.
5. **Global Listen dock** is the only read-aloud control (every page). Title-row speaker removed.

## Consequences

- Cloud neural TTS / Piper WASM remain future adapters behind the same engine port.
- Scoring keywords live in `policy.js` (config, not scattered in UI code).
- Highlight follows the current packed utterance; word-level sync depends on `onboundary` when the engine fires it.
