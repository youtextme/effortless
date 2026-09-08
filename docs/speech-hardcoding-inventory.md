# Speech hardcoding inventory

Honest remainder after mechanizing read-aloud.

## Mechanized (not hardcoded product behavior)

- **Spoken text** comes from the live visible DOM (`data-speech-surface` + computed visibility). No parallel passage strings.
- **Voice** is scored from `speechSynthesis.getVoices()` on the current device; sticky `voiceURI` in localStorage.
- **Rate** is one session value from voice quality band (neural / network / local / compact).
- **Chunk size** shrinks when an utterance errors (engine capability), not a Chrome UA fork.
- **Keep-alive** calls `resume()` only when `speechSynthesis.paused`.
- **Listen control** is one dock; the active surface is the highest covering visible `[data-speech-surface]`.
- **Skip rules** live in `platform/speech/policy.js` (selectors, class tokens, score signals).

## Still configured (policy / platform limits — not scattered in UI)

These are **policy defaults**, not per-screen if/else:

| Item | Where | Why it remains |
|---|---|---|
| Rate bands (0.88 / 0.82 / 0.80 / 0.76) | `policy.js` | Web Speech has no “parent pace” API |
| Voice name *signals* (`female`, `samantha`, `neural`, `espeak`…) | `policy.js` | Browsers do not expose gender; names are the only signal |
| Pack `initialMaxChars: 220` | `policy.js` | Engines do not publish max utterance length |
| Word-sheet lead repeats = 2 | `policy.js` | Product rule (pronounce the word twice) |
| `--speech-line: 0.36` | CSS + engine fallback | Teleprompter line; CSS is source of truth |
| `blockSelector` list | `policy.js` | Which elements count as reading turns |
| Storage key `wordspark_speech_voice_uri` | `policy.js` | localStorage has no discovery protocol |

## Still hardcoded elsewhere (out of this speech slice)

- Passage templates and topic titles in `passage-generator.js` / `topics.js`
- Vocabulary lists in `words.js`
- Quiz copy in `questions.js`
- Parent reset password in storage
- Theme colors in `app.css`
- Service worker cache name (`wordspark-v16`)

## Intentionally not built

- **Paid neural TTS** (ElevenLabs / Google Cloud) — needs a secret (outcome gate)
- **Piper/Kokoro WASM** — 20–80MB models; worse PWA install
- **Speech Recognition microphone** — would record a child; Listen is output-only
