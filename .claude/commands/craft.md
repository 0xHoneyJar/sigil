---
name: "craft"
version: "12.0.0"
description: |
  Generate UI components with design physics.
  Shows physics analysis before generating, like RAMS shows accessibility issues.

arguments:
  - name: "description"
    type: "string"
    required: true
    description: "What to build"
    examples:
      - "claim button"
      - "like button for posts"
      - "delete with undo"
      - "dark mode toggle"

context_files:
  - path: ".claude/rules/01-sigil-physics.md"
    required: true
    purpose: "Physics table"
  - path: ".claude/rules/02-sigil-detection.md"
    required: true
    purpose: "Effect detection rules"
  - path: ".claude/rules/03-sigil-patterns.md"
    required: true
    purpose: "Golden pattern examples"
  - path: ".claude/rules/04-sigil-protected.md"
    required: true
    purpose: "Protected capabilities"

outputs:
  - path: "src/components/$COMPONENT_NAME.tsx"
    type: "file"
    description: "Generated component with correct physics"

no_questions:
  - "What sync strategy do you want?"
  - "What timing should I use?"
  - "Do you want optimistic or pessimistic?"
  - "Should I add confirmation?"
  - "What animation library?"
  - "What data fetching library?"

workflow_next: "garden"
---

# /craft

Generate UI components with correct design physics.

## How It Works

1. **You describe** what you want in natural language
2. **Sigil analyzes** and shows physics reasoning
3. **You confirm** or correct the analysis
4. **Sigil generates** the component

## Invocation

```bash
/craft "claim button for rewards pool"
/craft "like button"
/craft "delete with undo"
/craft "dark mode toggle"
```

## Physics Analysis Output

Before generating, you'll see:

```
┌─ Physics Analysis ─────────────────────────────────────┐
│                                                        │
│  Component:    RewardsClaimButton                      │
│  Effect:       Financial mutation                      │
│  Detected by:  "claim" keyword                         │
│                                                        │
│  ┌─ Applied Physics ────────────────────────────────┐  │
│  │  Sync:         Pessimistic (server confirms)     │  │
│  │  Timing:       800ms deliberate                  │  │
│  │  Confirmation: Required (two-phase)              │  │
│  │  Animation:    Deliberate ease-out               │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  Template:     ClaimButton from 03-sigil-patterns.md   │
│                                                        │
│  Protected capabilities verified:                      │
│  ✓ Cancel button present                              │
│  ✓ Balance display available                          │
│  ✓ Error recovery path exists                         │
│                                                        │
└────────────────────────────────────────────────────────┘

Proceed with these physics? (yes / or describe what's different)
```

## Correction Flow

If the analysis is wrong:

```
You: "actually this is just a local UI state toggle, not financial"

┌─ Physics Analysis (Corrected) ─────────────────────────┐
│                                                        │
│  Component:    RewardsToggle                           │
│  Effect:       Local state (corrected from financial)  │
│  Reason:       User override                           │
│                                                        │
│  ┌─ Applied Physics ────────────────────────────────┐  │
│  │  Sync:         Immediate (no server)             │  │
│  │  Timing:       100ms instant                     │  │
│  │  Confirmation: None                              │  │
│  │  Animation:    Snappy spring                     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Detection Rules

| Keywords | Effect | Sync | Timing |
|----------|--------|------|--------|
| claim, deposit, withdraw, transfer, swap | Financial | Pessimistic | 800ms |
| delete, remove, destroy, revoke | Destructive | Pessimistic | 600ms |
| archive, trash, soft-delete | Soft Delete | Optimistic | 200ms |
| save, update, like, follow, create | Standard | Optimistic | 200ms |
| toggle, switch, expand, collapse | Local State | Immediate | 100ms |

**Type Override**: If props include `Currency`, `Money`, `Balance`, `Wei` → always Financial physics.

## Error Messages

If detection fails:

```
┌─ Physics Analysis ─────────────────────────────────────┐
│                                                        │
│  ⚠ Could not detect effect from "fancy button"        │
│                                                        │
│  Help me understand:                                   │
│  • What happens when clicked?                          │
│  • Does it call a server?                              │
│  • Can it be undone?                                   │
│  • Does it involve money/tokens?                       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## What Sigil Never Asks

- "What sync strategy?" → Inferred from effect
- "What timing?" → Determined by physics table
- "What animation library?" → Detected from codebase
- "What confirmation style?" → Determined by effect type

## Next Step

After generating, consider running:

```bash
/garden
```

This checks if your new component is becoming canonical (Gold tier = 10+ imports, 14+ days stable).

<user-request>
$ARGUMENTS
</user-request>
