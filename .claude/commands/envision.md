---
name: "envision"
version: "2.0.0"
description: |
  Interview-based moodboard capture for Sigil design context.
  Captures product feel, references, anti-patterns, and key moments.

command_type: "interview"

arguments: []

pre_flight:
  - check: "file_exists"
    path: ".sigil-setup-complete"
    error: "Sigil not set up. Run /setup first."

outputs:
  - path: "sigil-mark/moodboard.md"
    type: "file"
    description: "Product moodboard with captured design context"

mode:
  default: "foreground"
  allow_background: false
---

# Envision

## Purpose

Capture product feel and design context through an interview-based workflow. Creates a moodboard that guides AI agents in making consistent design decisions.

## Invocation

```
/envision
```

## Prerequisites

- Sigil must be set up (`.sigil-setup-complete` exists)

## Workflow

### Phase 1: Reference Products

Ask about inspirational products:

```
What apps or games inspire this product's feel?

Think about:
- Products that nail the emotional experience you want
- Games with satisfying interactions
- Apps with motion/animation you admire
```

**Follow-up**: For each reference, ask "What specifically about [product] do you want to capture?"

### Phase 2: Feel by Context

For each context, ask how users should feel:

**Contexts to cover**:
1. **Transactions**: "How should users feel during important actions (purchases, claims, submissions)?"
2. **Success states**: "How should wins and completions feel?"
3. **Loading states**: "How should waiting moments feel?"
4. **Error states**: "How should errors and failures feel?"

### Phase 3: Anti-Patterns

Ask about patterns to avoid:

```
What design patterns should we explicitly avoid?

Examples:
- Spinners that create anxiety
- Instant transitions that feel jarring
- Overly playful motion in serious contexts
```

**Follow-up**: For each anti-pattern, ask "Why should we avoid this?"

### Phase 4: Key Moments

Capture the ideal experience for critical moments:

1. **High-stakes actions**: "Describe your ideal high-stakes moment (like confirming a big transaction)"
2. **Celebrations**: "Describe your ideal celebration moment (like completing a milestone)"
3. **Recovery**: "Describe your ideal error recovery moment"

### Phase 5: Generate Moodboard

Write all captured context to `sigil-mark/moodboard.md`:

```markdown
# Product Moodboard

**Product**: [Name from interview]
**Created**: [Date]
**Updated**: [Date]

---

## Reference Products

### Games
- [Game 1]: [What to capture]
- [Game 2]: [What to capture]

### Apps
- [App 1]: [What to capture]
- [App 2]: [What to capture]

---

## Feel Descriptors

| Context | Feel | Reference |
|---------|------|-----------|
| Transactions | [Feel] | [Reference product] |
| Success states | [Feel] | [Reference product] |
| Loading | [Feel] | [Reference product] |
| Errors | [Feel] | [Reference product] |

---

## Anti-Patterns

| Pattern | Reason |
|---------|--------|
| [Pattern 1] | [Why to avoid] |
| [Pattern 2] | [Why to avoid] |

---

## Key Moments

### High-Stakes Actions
[Description from interview]

### Celebrations
[Description from interview]

### Recovery
[Description from interview]
```

## Arguments

| Argument | Description | Required |
|----------|-------------|----------|
| None | | |

## Outputs

| Path | Description |
|------|-------------|
| `sigil-mark/moodboard.md` | Product moodboard with all captured context |

## Interview Tips

- Use AskUserQuestion for structured choices
- Follow up on every answer for specifics
- Reference the user's previous answers
- Don't rush - capture tacit knowledge

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "Sigil not set up" | Missing `.sigil-setup-complete` | Run `/setup` first |
| "Moodboard already exists" | Previous `/envision` or `/inherit` | Offer to update or start fresh |

## Next Step

After envision: `/codify` to define design rules based on the moodboard
