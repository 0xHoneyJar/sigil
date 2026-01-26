# Glyph: Progressive Disclosure

Reveal complexity gradually. Don't dump all physics upfront.

## Disclosure Levels

| Level | Trigger | Content | Token Budget |
|-------|---------|---------|--------------|
| L0 | User types `/glyph` | Nothing yet | ~10 |
| L1 | Description provided | Hypothesis box | ~100 |
| L2 | Ambiguous/low confidence | Clarifying question | ~50 |
| L3 | Confirmed | Generated code | Variable |
| L4 | "Why?" asked | Full physics explanation | ~500 |

## L0: Command Only

User has typed `/glyph` but no description yet.

**Response**: None. Wait for description.

## L1: Hypothesis Box

User provides description: `/glyph "claim button"`

**Token Budget**: ~100 tokens

**Format**:
```markdown
## Hypothesis

**Effect**: Financial (detected: "claim" keyword)
**Physics**: Pessimistic, 800ms, confirmation required
**Confidence**: 0.85

[y/n/adjust]
```

**Rules**:
- Maximum 5 lines
- No code yet
- No detailed explanations
- Show only: Effect, Physics, Confidence
- Single question mark prompt

## L2: Clarifying Question

Triggered when confidence < 0.75 OR effect is ambiguous.

**Token Budget**: ~50 tokens

**Format**:
```markdown
This could be:
1. **Standard** (save operation, optimistic)
2. **Destructive** (permanent delete, confirmation)

Which matches your intent? [1/2]
```

**Rules**:
- Maximum 2-3 options
- Brief descriptions
- No physics tables
- Single question

## L3: Generated Code

User confirms with `y` or provides adjustments.

**Token Budget**: Variable (depends on component complexity)

**Format**:
```markdown
## Self-Validation
✓ Physics: [checks]
✓ Protected: [checks]

## Generated Component

[code block]

Written to: src/components/ClaimButton.tsx
```

**Rules**:
- Show validation summary first (brief)
- Complete working code
- File path for reference
- No lengthy explanations

## L4: Deep Explanation

User asks "why?" or requests explanation.

**Token Budget**: ~500 tokens

**Trigger Keywords**:
- "why"
- "explain"
- "reasoning"
- "rationale"
- "tell me more"

**Format**:
```markdown
## Physics Rationale: Financial Effect

### Why Pessimistic Sync?
Financial operations cannot be undone. If we show optimistic
updates and the transaction fails, users see false confirmations
of money movement. This causes:
- Confusion about account state
- Double-spending attempts
- Support tickets

### Why 800ms Timing?
Research shows users need minimum cognitive processing time
before committing to irreversible financial actions:
- < 500ms: Users report "accidental" clicks
- 500-800ms: Sweet spot for deliberate action
- > 1000ms: Feels sluggish

### Why Confirmation Required?
Two-phase commit ensures:
1. User sees the amount they're claiming
2. User has escape route (Cancel always visible)
3. Accidental taps don't trigger claims

[Full physics table available via /physics-reference]
```

**Rules**:
- Load `physics-reference` skill
- Explain the "why" not just the "what"
- Reference research/rationale
- Offer deeper reference if needed

## Rule Loading by Level

```
L0: No rules loaded

L1: Load minimal
  - 00-glyph-core.md
  - 01-glyph-physics.md (table only)
  - 02-glyph-detection.md

L2: Same as L1

L3: Load for generation
  + 03-glyph-protected.md
  + 04-glyph-patterns.md (relevant pattern)
  + rules/rigor/* (if web3 detected)

L4: Load full reference
  + physics-reference skill
  + patterns-reference skill
```

## Token Budget Enforcement

```typescript
function enforceTokenBudget(level: Level, content: string): string {
  const budgets = {
    L0: 10,
    L1: 100,
    L2: 50,
    L3: Infinity,  // Code can be any length
    L4: 500
  };

  const budget = budgets[level];
  if (estimateTokens(content) > budget) {
    return truncateToTokens(content, budget);
  }
  return content;
}
```

## Escalation Path

```
L1 → L2: Confidence < 0.75
L1 → L3: User confirms (y)
L1 → L4: User asks "why?"
L2 → L1: User clarifies
L3 → L4: User asks "why?" after code
L4 → (end): Information delivered
```

## Anti-Patterns

**DON'T at L1**:
- Dump full physics table
- Explain every rule
- Show code preview
- Load all reference skills

**DON'T at L2**:
- Offer more than 3 options
- Explain each option in detail
- Show physics for each option

**DON'T at L3**:
- Add lengthy comments in code
- Explain every line
- Show alternative implementations

## Example Session

```
User: /glyph "claim button"

[L1 - 87 tokens]
## Hypothesis

**Effect**: Financial (detected: "claim" keyword)
**Physics**: Pessimistic, 800ms, confirmation required
**Confidence**: 0.85

[y/n/adjust]

User: y

[L3 - 234 tokens]
## Self-Validation
✓ Physics: Pessimistic sync implemented
✓ Protected: Cancel visible

## Generated Component
[code]

Written to: src/components/ClaimButton.tsx

User: why 800ms?

[L4 - 412 tokens]
## Physics Rationale: Timing

The 800ms timing for Financial effects serves as a cognitive
checkpoint...
[detailed explanation]
```
