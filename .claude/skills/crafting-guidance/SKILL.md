---
zones:
  state:
    paths:
      - sigil-mark/moodboard.md
      - sigil-mark/rules.md
      - sigil-mark/core/physics.ts
      - .sigilrc.yaml
    permission: read
  config:
    paths:
      - .sigil-setup-complete
    permission: read
---

# Sigil Crafting Skill (v1.2.4)

## Purpose

Provide design guidance during implementation with awareness of:
1. **Moodboard** — Product feel and anti-patterns
2. **Rules** — Design rules by category
3. **Physics Tokens** — Material-specific physics values
4. **Zones** — File path to material mapping

## Philosophy

> "Engineers learn by seeing diffs and feeling the physics."
> "Make the right path easy. Make the wrong path visible."

Do NOT lecture. Do NOT explain unless asked. Make the change. The diff + feel is the lesson.

## Pre-Flight Checks

1. **Sigil Setup**: Verify `.sigil-setup-complete` exists
2. **Design Context**: Check for moodboard.md and rules.md (warn if missing)
3. **Zone Config**: Load zones from `.sigilrc.yaml`
4. **Physics**: Load from `sigil-mark/core/physics.ts`

## Context Loading

### Required Files

```
sigil-mark/moodboard.md
├── Reference Products
├── Feel Descriptors (by context)
├── Anti-Patterns
└── Key Moments

sigil-mark/rules.md
├── Colors
├── Typography
├── Spacing
├── Motion (by zone)
└── Components

sigil-mark/core/physics.ts
├── PHYSICS.decisive (spring: 180/12, tap: 0.98)
├── PHYSICS.machinery (spring: 400/30, tap: 0.96)
└── PHYSICS.glass (spring: 200/20, tap: 0.97)

.sigilrc.yaml
├── zones (paths → material mapping)
└── rejections (patterns to warn about)
```

### Zone Detection

If a file path is provided, determine zone from `.sigilrc.yaml`:

- `critical` → decisive physics (heavy, deliberate)
- `admin` → machinery physics (instant, efficient)
- `marketing` → glass physics (smooth, delightful)
- `default` → glass physics

## Response Format

### When Asked About Physics

Show the actual values:

```
decisive: spring(180, 12), tap 0.98, minPending 600ms
machinery: spring(400, 30), tap 0.96, minPending 0ms
glass: spring(200, 20), tap 0.97, minPending 200ms
```

### When Given a File Path

```
/craft src/features/checkout/Button.tsx
```

Response:

```
Zone: critical
Material: decisive
Physics: spring(180, 12)

Use <SigilZone material="decisive" serverAuthoritative>
Component will auto-inherit physics from context.
```

### When Implementing

Don't explain, just write the code:

```tsx
import { SigilZone } from 'sigil-mark/core';
import { Button } from 'sigil-mark/components';

<SigilZone material="decisive" serverAuthoritative>
  <Button onAction={confirmPurchase}>
    Confirm Purchase
  </Button>
</SigilZone>
```

## Warning About Rejected Patterns

When user mentions a rejected pattern:

1. Note the rejection reason (from .sigilrc.yaml)
2. Offer alternatives
3. Allow override - never refuse

Example:

```
User: "Add a spinner to checkout"

Spinners are noted in rejections for critical zones.

Alternatives:
1. Skeleton loading
2. Progress with copy
3. Confirmation animation

If you still want a spinner, I can add it.
```

## Recipe Suggestions

Recipes are gone. Use physics tokens + SigilZone:

| Zone | Material | Physics | Feel |
|------|----------|---------|------|
| critical | decisive | 180/12 | Heavy, deliberate |
| admin | machinery | 400/30 | Instant, efficient |
| marketing | glass | 200/20 | Smooth, delightful |

## Error Handling

| Situation | Response |
|-----------|----------|
| No moodboard.md | "Run `/envision` to capture product feel." |
| No rules.md | "Run `/codify` to define design rules." |
| Unknown zone | "Using default (glass) physics." |

## Key Principles

1. **Show, don't tell**: Write code, show diffs
2. **Context-aware**: Components inherit from SigilZone
3. **Physics tokens**: Single source of truth
4. **Never refuse**: Warn, offer alternatives, allow override
