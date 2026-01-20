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

## Signal Schema (YAML Frontmatter)

Each signal is logged with structured YAML frontmatter for machine parsing:

```yaml
---
timestamp: "2026-01-19T14:32:00Z"
signal: MODIFY
source: cli                          # cli | toolbar | product
component:
  name: "ClaimButton"
  effect: "Financial"
  craft_type: "generate"
physics:
  behavioral:
    sync: "pessimistic"
    timing: "800ms"
    confirmation: "required"
  animation:
    easing: "ease-out"
    duration: "800ms"
  material:
    surface: "elevated"
    shadow: "soft"
    radius: "8px"
diagnostic:                          # From diagnostic questions (Step 6b)
  user_type: "mobile"
  goal: "quickly check and claim rewards while commuting"
  expected_feel: "snappy"
  skipped: false
change:
  from: "800ms"
  to: "500ms"
learning:
  inference: "Mobile users prefer faster timing for financial buttons"
  recommendation: "Consider mobile-specific physics (faster timing)"
---
```

## DiagnosticContext Schema

When users provide feedback (MODIFY/REJECT), optional diagnostic questions capture context:

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `user_type` | string | `power-user`, `casual`, `mobile`, `first-time`, custom | Who is the end user |
| `goal` | string | free text | What the user was trying to accomplish |
| `expected_feel` | string | `instant`, `snappy`, `deliberate`, `trustworthy`, custom | Desired interaction feel |
| `skipped` | boolean | `true`, `false` | Whether user skipped diagnostics |

**Source Field**:
| Source | Description |
|--------|-------------|
| `cli` | Signal from Claude Code /craft command |
| `toolbar` | Signal from Sigil Toolbar browser extension |
| `product` | Signal from product-embedded feedback widget |

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

## Example: Enhanced Format

```markdown
---
timestamp: "2026-01-13T14:32:00Z"
signal: ACCEPT
source: cli
component:
  name: "ClaimButton"
  effect: "Financial"
  craft_type: "generate"
physics:
  behavioral:
    sync: "pessimistic"
    timing: "800ms"
    confirmation: "required"
  animation:
    easing: "ease-out"
---

---
timestamp: "2026-01-13T15:45:00Z"
signal: MODIFY
source: cli
component:
  name: "WithdrawButton"
  effect: "Financial"
  craft_type: "generate"
physics:
  behavioral:
    sync: "pessimistic"
    timing: "800ms"
    confirmation: "required"
  animation:
    easing: "ease-out"
diagnostic:
  user_type: "power-user"
  goal: "withdraw quickly during volatile market"
  expected_feel: "snappy"
  skipped: false
change:
  from: "800ms"
  to: "500ms"
learning:
  inference: "Power users prefer faster timing for financial buttons"
  recommendation: "Consider user-type-specific timing"
---

---
timestamp: "2026-01-13T16:20:00Z"
signal: MODIFY
source: cli
component:
  name: "StakeButton"
  effect: "Financial"
  craft_type: "generate"
physics:
  behavioral:
    sync: "pessimistic"
    timing: "800ms"
  animation:
    easing: "ease-out"
diagnostic:
  user_type: "mobile"
  goal: "stake rewards while checking phone quickly"
  expected_feel: "snappy"
  skipped: false
change:
  from: "800ms, ease-out"
  to: "500ms, spring(400, 25)"
learning:
  inference: "Mobile users prefer springs for tactile feedback"
  recommendation: "Consider mobile-first animation physics"
---

---
timestamp: "2026-01-13T17:00:00Z"
signal: REJECT
source: cli
component:
  name: "DeleteAccountButton"
  effect: "Destructive"
  craft_type: "generate"
physics:
  behavioral:
    sync: "pessimistic"
    timing: "600ms"
    confirmation: "required"
diagnostic:
  skipped: true
rejection_reason: "Missing two-step confirmation for account deletion"
---
```

After 3 MODIFY signals showing 500ms preference, /craft would generate financial buttons with 500ms by default and note: "Adjusted timing to 500ms based on taste log."

## Example: Skipped Diagnostics

When user skips diagnostic questions:

```markdown
---
timestamp: "2026-01-13T18:00:00Z"
signal: MODIFY
source: cli
component:
  name: "TransferButton"
  effect: "Financial"
physics:
  behavioral:
    sync: "pessimistic"
    timing: "800ms"
diagnostic:
  skipped: true
change:
  from: "ease-out"
  to: "spring(500, 30)"
learning:
  inference: "User prefers spring animations (no context available)"
---
```
