# Outcome Contract — Word-sheet daily speech

**Status:** active  
**Slug:** word-sheet-daily  
**Date:** 2026-09-08

## Outcome Frame

- **Job:** When a 10-year-old taps an advanced word, they hear it twice, hear a plain meaning, then hear three sentences they could actually say at school, home, or with friends.
- **North Star:** Tap → word, word, meaning, example, example, example. Every example contains the word. Meaning is one simple spoken sentence.
- **Key Results:**
  1. Speech order is fixed: 2× word → simple meaning → 3 examples.
  2. Three on-screen daily-life examples per unique vocab word (732 unique / 1000 entries).
  3. Fallback still yields 3 examples if a lookup misses.
- **Workback:** contract → generate 3 kid examples + simple meaning → speak meaning then examples → tests + cache bump → live Pages.
- **Agents:** Builder, Evaluator (fresh, not Builder).
- **Kill experiment:** A missing WORD_EXPLANATIONS entry still returns 3 kid sentences that include the word.
- **Contract:** `docs/outcome-contracts/word-sheet-daily.md`

## Assumptions (challenged)

- User said “2 examples as you have” then “give 3 examples for every word.” Three is the target; two would fail KR2.
- Dataset `example` lines are often adult (scientists, police, Darwin). They are not the spoken examples unless they already sound like kid daily English.
- Unique keys are 732, not 1000 — duplicate words across days share one explanation.

## Kill criteria

- Sheet still speaks examples without saying the meaning
- Fewer than 3 examples shown or spoken
- Examples omit the target word

## Boundary

Do not change Listen passage highlight, parent pace, or quiz coaching. Web Speech only.

## Bar-raiser baseline

| Approach | What the kid hears today | Kid can copy it tomorrow? |
|---|---|---|
| Do nothing | word ×2, then 2 adult/generic lines, no meaning | No — “Police investigate crimes” |
| Keep dataset example + filler | still Darwin/scientists + “I can use X when I talk about…” | No |
| 3 daily-life sentences + spoken meaning | word, word, “It means…”, three home/school/friend lines | Yes — this slice |

## Definition of Done

- [ ] Word twice, then meaning, then 3 examples
- [ ] Kid-relatable example generator + data file
- [ ] Tests + live cache bump
- [ ] Command evidence in this contract

## Command evidence

(filled after CI)
