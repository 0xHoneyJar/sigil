# Sigil: Taste Accumulation

Learn user preferences from usage. No forms, no ratings - usage IS feedback.

## The Log

All signals go to `grimoires/sigil/taste.md`. Append-only. Human-readable.

## Signal Types

| Signal | Weight | Trigger |
|--------|--------|---------|
| ACCEPT | +1 | User uses generated code without changes |
| MODIFY | +5 | User edits generated code (diff reveals preference) |
| REJECT | -3 | User says no, deletes, or rewrites |

Modifications weight 5x because corrections teach more than silent acceptance.

## Reading Taste

At /craft time, read `grimoires/sigil/taste.md` and look for patterns:

- **Timing patterns**: "User changed 800ms → 600ms three times" → use 600ms
- **Animation patterns**: "User replaces ease-out with springs" → use springs
- **Structure patterns**: "User always adds loading states" → include them

If a pattern appears 3+ times, apply it automatically. Mention the adjustment in the physics analysis.

## Writing Taste

After generation, detect the signal:

1. **ACCEPT**: User confirms "yes" and moves on without editing
2. **MODIFY**: User uses Edit tool on the generated file
3. **REJECT**: User says "no", "wrong", "redo", or explicitly rejects

Append to `grimoires/sigil/taste.md`:

```markdown
## [YYYY-MM-DD HH:MM] | [SIGNAL]
Component: [name]
Effect: [type]
Physics: [what was generated]
[If MODIFY: Changed: what user changed, Learning: inferred preference]
[If REJECT: Reason: user feedback if given]
---
```

## Cold Start

If `grimoires/sigil/taste.md` has no signals yet, use physics defaults from the rules.

## Example

```markdown
## 2026-01-13 14:32 | ACCEPT
Component: ClaimButton
Effect: Financial
Physics: 800ms pessimistic, ease-out
---

## 2026-01-13 15:45 | MODIFY
Component: WithdrawButton
Effect: Financial
Physics: 800ms pessimistic, ease-out
Changed: 800ms → 500ms
Learning: User prefers faster timing for financial buttons
---

## 2026-01-13 16:20 | MODIFY
Component: StakeButton
Effect: Financial
Physics: 800ms pessimistic, ease-out
Changed: 800ms → 500ms, ease-out → spring(400, 25)
Learning: User prefers 500ms + spring for financial buttons
---
```

After 3 MODIFY signals showing 500ms preference, /craft would generate financial buttons with 500ms by default and note: "Adjusted timing to 500ms based on taste log."
