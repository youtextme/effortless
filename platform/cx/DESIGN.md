# Design charter — quiet, focused, Apple / Dyson

Customer experience is king. Software is a means. WordSpark (and later catalogs) must feel like a well-made tool: obvious, calm, one job.

## Principles (bound in `principles.json`)

1. **One job on screen.** Reading, Listen, a question, Home. Never two competing calls to action.
2. **Plain type, lots of air.** No decorative illustration, no dark patterns, no scoreboard chrome.
3. **Gestures are obvious.** Tap a chip to fill a blank. Tap a choice. No tutorial overlay.
4. **Copy is data.** Kid-facing strings come from packs/datasets so languages can swap later. Kernels do not concatenate novels.
5. **Device-local.** No account. Progress stays on this device. Install is always offered.
6. **Speech is the page.** Listen reads visible DOM. One voice per session.
7. **Possible and free.** Browser APIs, on-device storage, open source. No paid cloud required for the core loop.
8. **Use it.** A new type that kids never meet is clutter. Compose it into today’s journey.

## Question items (worked example)

| Type | Kid gesture | Why it exists |
|------|-------------|----------------|
| `choice` | Tap one of four quiet rows | Fast check of a takeaway |
| `blank` | Tap a chip; it sits in the blank | Same thinking, different muscle — still one answer |

Both go through the **item registry**. Quiz does not special-case types in the shell.

## When you add a type

Ask: would a 10-year-old finish this without a label explaining the UI? If not, simplify until yes.
