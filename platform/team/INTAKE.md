# High-level intake (fill before product code)

Paste this into the outcome contract. Do not skip. The human will not give you the missing rows — **you invent them**, then kill-test them.

```markdown
## High-level intake
- **Customer job:** <kid/parent outcome in one sentence>
- **Why this, now:** <why they would use it in this decade, vs doing nothing>
- **Distraction-free path:** <the one gesture that finishes the job>
- **Open / free / possible:** <no paid API, no account, works offline after install>
- **Languages / borders:** <copy lives in data; layout does not assume English width forever>
- **Extend vs new:** <existing component | new component | new item type | new catalog>
- **Registry:** <capability id / item type id / action kebab>
- **Use-It (this slice):** <which current journey + screen will show it without a feature flag>
- **Kill:** <if kids still only see the old interaction, we failed>
```

## Use-It Law

A unit that only exists in a registry is **not shipped**. Same slice must:

1. Register it.
2. Put it on a **real** journey (not only `scaffolded`).
3. Let `generate` / Home / Listen **select** it in production mix.

Example: “10 question types” → ten packs in `item-packs.js` **and** `generateQuestions` actually emits them so the quiz is not 7× multiple choice.

## Anti-patterns

- Asking the human for wireframes when the job is clear.
- New overlay per type.
- Shell switches on `math` / `blank` / `puzzle`.
- English-only string concatenation inside the kernel.
- Chrome, badges, streaks, or gamification that does not serve the job.
