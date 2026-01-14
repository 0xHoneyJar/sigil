---
name: "garden"
version: "12.0.0"
description: |
  Health report on pattern authority and component usage.
  Shows which components are canonical (Gold), established (Silver), or experimental (Draft).

arguments: []

context_files:
  - path: "src/components/"
    required: false
    purpose: "Components to analyze"
  - path: ".claude/rules/01-sigil-physics.md"
    required: true
    purpose: "Physics reference"

outputs:
  - path: "stdout"
    type: "report"
    description: "Authority distribution and recommendations"

no_questions:
  - "Should I promote this component?"
  - "Do you want to change the tier?"
---

# /garden

Get a health report on your component authority.

## How It Works

1. **Sigil scans** your components directory
2. **Counts imports** for each component
3. **Checks stability** (days since last change)
4. **Reports tiers** and recommendations

## Invocation

```bash
/garden
```

## Output

```
┌─ Sigil Garden Report ──────────────────────────────────┐
│                                                        │
│  Authority Distribution                                │
│  ───────────────────────                               │
│  Gold:   8 components  (17%)  ████░░░░░░               │
│  Silver: 12 components (26%)  ██████░░░░               │
│  Draft:  27 components (57%)  ██████████               │
│                                                        │
│  ┌─ Gold Tier (Canonical) ──────────────────────────┐  │
│  │  Component      Imports   Stable                 │  │
│  │  Button         34        62 days                │  │
│  │  Card           28        45 days                │  │
│  │  Input          22        38 days                │  │
│  │  ClaimButton    15        21 days                │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─ Approaching Gold ───────────────────────────────┐  │
│  │  DataTable: 9 imports, 12 days (needs 1 more     │  │
│  │             import and 2 more days)              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─ Orphans (Consider Removing) ────────────────────┐  │
│  │  LegacyModal: 0 imports                          │  │
│  │  OldTooltip: 0 imports                           │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Authority Tiers

| Tier | Min Imports | Min Stability | Behavior |
|------|-------------|---------------|----------|
| **Gold** | 10+ | 14+ days | Use as templates in /craft |
| **Silver** | 5+ | 7+ days | Prefer if no Gold exists |
| **Draft** | <5 | any | Don't learn from these |

## How Authority Works

- **Imports** = how many files use this component
- **Stability** = days since last modification
- **Gold** = proven patterns (use as templates)
- **Orphan** = 0 imports (consider removing)

Authority is computed from your codebase, not configured. Components earn Gold by being used and surviving.

## What Sigil Never Asks

- "Should I promote this?" → Promotion is earned, not requested
- "Is this canonical?" → Import count decides, not preferences
