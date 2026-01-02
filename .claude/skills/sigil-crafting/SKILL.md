---
zones:
  state:
    paths:
      - sigil-mark/moodboard.md
      - sigil-mark/rules.md
      - .sigilrc.yaml
    permission: read
  config:
    paths:
      - .sigil-setup-complete
    permission: read
---

# Sigil Crafting Skill

## Purpose

Provide design guidance during implementation. Loads moodboard and rules context, determines zone from file path, and answers questions about design patterns.

## Pre-Flight Checks

1. **Sigil Setup**: Verify `.sigil-setup-complete` exists
2. **Design Context**: Check for moodboard.md and rules.md (warn if missing)

## Context Loading

### Required Files

Load and internalize these files at the start:

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
├── Components
└── Approvals

.sigilrc.yaml
├── zones (paths, motion, patterns)
└── rejections
```

### Zone Detection

If a file path is provided:

```bash
zone=$(.claude/scripts/get-zone.sh "src/features/checkout/Cart.tsx")
# Returns: critical, marketing, admin, or default
```

Use zone to apply specific guidance:
- `critical` → Deliberate motion, skeleton loading, confirmation flows
- `marketing` → Playful motion, attention-grabbing, stagger reveals
- `admin` → Snappy motion, instant feedback, minimal animation

## Guidance Modes

### Mode 1: General Guidance

When invoked without arguments:

```
/craft
```

Response format:

```
I've loaded your design context.

**Product Feel**
[Summarize moodboard - references, feel descriptors]

**Key Rules**
[Summarize rules - motion by zone, key patterns]

**Zones Configured**
- critical: [paths summary]
- marketing: [paths summary]
- admin: [paths summary]

What would you like guidance on?
```

### Mode 2: Zone-Specific Guidance

When invoked with a file path:

```
/craft src/features/checkout/CartSummary.tsx
```

Response format:

```
This file is in the **[zone]** zone.

**Zone Context**
- Motion: [zone motion style]
- Timing: [zone timing]
- Preferred patterns: [list]
- Patterns to avoid: [list]

**Relevant Rules**
[Extract applicable rules from rules.md]

**Recommendations**
[Specific suggestions for this context]

What specifically are you implementing?
```

### Mode 3: Question Answering

When invoked with a question:

```
/craft "How should loading states work?"
```

Response format:

```
Based on your design context:

**General Approach**
[Answer based on moodboard and rules]

**By Zone**
- Critical: [zone-specific answer]
- Marketing: [zone-specific answer]
- Admin: [zone-specific answer]

**Relevant Rules**
[Quote applicable rules]

**Example Implementation**
[Suggest pattern or recipe]
```

## Warning About Rejected Patterns

When user mentions a rejected pattern:

1. **Acknowledge** the request
2. **Explain** why it's in the rejection list
3. **Offer alternatives** that match the design system
4. **Allow override** - never refuse

Example:

```
User: "Add a spinner to the checkout"

Agent: Spinners are listed in your rejections because they can
create anxiety in critical zones.

**Why it's rejected**:
[Quote reason from .sigilrc.yaml]

**Alternatives**:
1. Skeleton loading with deliberate reveal
2. Progress indicator with reassuring copy
3. Optimistic UI with confirmation animation

If you still want a spinner, I can help implement it - just note
this deviates from your established patterns. Would you like to:
- Use an alternative
- Proceed with spinner anyway
- Discuss further
```

## Recipe Suggestions

When suggesting motion, reference available recipes:

| Recipe | Zone | When to Use |
|--------|------|-------------|
| `useDeliberateEntrance` | critical | High-stakes content appearance |
| `usePlayfulBounce` | marketing | Attention-grabbing elements |
| `useSnappyTransition` | admin | Quick state changes |

## Response Guidelines

1. **Be specific**: Reference actual moodboard and rules content
2. **Be helpful**: Suggest concrete implementations
3. **Be honest**: Warn about anti-patterns clearly
4. **Be flexible**: Never refuse, always offer alternatives
5. **Be concise**: Don't overwhelm with information

## Error Handling

| Situation | Response |
|-----------|----------|
| No moodboard.md | "No moodboard found. Run `/envision` to capture product feel." |
| No rules.md | "No rules found. Run `/codify` to define design rules." |
| Unknown zone | "This path doesn't match any configured zone. Using default guidance." |
| Empty context | Provide general guidance mode |

## Philosophy

> "Make the right path easy. Make the wrong path visible. Don't make the wrong path impossible."

Craft enables good decisions, it doesn't enforce them. The human is always accountable.
