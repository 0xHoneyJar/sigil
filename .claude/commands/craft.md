---
name: "craft"
version: "2.0.0"
description: |
  Provide design guidance during implementation.
  Loads moodboard and rules context, determines zone, suggests patterns.

command_type: "conversational"

arguments:
  - name: "context"
    type: "string"
    required: false
    description: "File path for zone detection or question about design"

pre_flight:
  - check: "file_exists"
    path: ".sigil-setup-complete"
    error: "Sigil not set up. Run /setup first."

outputs: []

mode:
  default: "foreground"
  allow_background: false
---

# Craft

## Purpose

Provide design guidance during implementation. Loads moodboard and rules context, determines zone from file path, and answers questions about design patterns. Warns about rejected patterns but never refuses.

## Invocation

```
/craft
/craft components/Button.tsx
/craft "How should loading states work?"
```

## Prerequisites

- Sigil must be set up (`.sigil-setup-complete` exists)
- Recommended: Run `/envision` and `/codify` first for full context

## Workflow

### Phase 1: Load Design Context

Read and internalize:
- `sigil-mark/moodboard.md` - Product feel, references, anti-patterns
- `sigil-mark/rules.md` - Colors, typography, spacing, motion rules
- `.sigilrc.yaml` - Zone definitions and rejections

### Phase 2: Determine Zone (if file path provided)

If argument looks like a file path:
1. Run `get-zone.sh <path>` to determine zone
2. Load zone-specific patterns from `.sigilrc.yaml`
3. Apply zone context to guidance

### Phase 3: Provide Guidance

Based on context and question:
- Reference moodboard feel descriptors
- Apply rules from rules.md
- Suggest zone-appropriate recipes
- Warn about (don't refuse) rejected patterns

### Guidance Principles

1. **Right path easy**: Suggest patterns that match the zone
2. **Wrong path visible**: Warn about anti-patterns, explain why
3. **Never refuse**: User can always override, just explain concerns
4. **Be specific**: Reference actual rules and moodboard context

## Arguments

| Argument | Description | Required |
|----------|-------------|----------|
| `context` | File path or design question | No |

## Outputs

None - purely conversational.

## Examples

### General Guidance

```
User: /craft

Agent: I've loaded your design context.

**Product Feel**: [from moodboard]
**Key Rules**: [from rules.md]

What would you like guidance on?
- Motion and animation
- Component patterns
- Color usage
- Typography
```

### Zone-Specific Guidance

```
User: /craft src/features/checkout/CartSummary.tsx

Agent: This file is in the **critical** zone.

**Zone Context**:
- Motion: Deliberate (800ms+)
- Preferred: deliberate-entrance, confirmation-flow
- Avoid: instant-transition, playful-bounce

**Recommendations**:
- Use skeleton loading during data fetch
- Animate price changes with deliberate timing
- Confirmation actions should feel weighty

What specifically are you implementing?
```

### Pattern Warning

```
User: "I want to add a spinner while the cart loads"

Agent: Spinners are noted as an anti-pattern in your design system
because they can create anxiety in critical zones like checkout.

**Alternatives**:
1. Skeleton loading with deliberate reveal
2. Progress indicator with reassuring copy
3. Optimistic UI with confirmation

If you still need a spinner, I can help - just note this
deviates from your established patterns.
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "Sigil not set up" | Missing `.sigil-setup-complete` | Run `/setup` first |
| "No moodboard found" | Missing moodboard.md | Run `/envision` first |
| "No rules found" | Missing rules.md | Run `/codify` first |

## Next Step

After crafting: `/approve` to record human sign-off on patterns
