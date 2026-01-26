# Glyph: Progressive Disclosure L4

Full physics explanation when user asks "why?".

## Trigger

L4 is activated when user asks explanation questions:

```typescript
const L4_TRIGGERS = [
  'why',
  'explain',
  'reasoning',
  'rationale',
  'tell me more',
  'how come',
  'what makes',
  'why is'
];

function isL4Trigger(input: string): boolean {
  const lower = input.toLowerCase();
  return L4_TRIGGERS.some(t => lower.includes(t));
}
```

## Token Budget

**Target**: ~500 tokens

L4 can use more tokens than L1-L3 because user explicitly requested explanation.

## Content Structure

### For Timing Questions

```markdown
## Physics Rationale: Timing

### Why 800ms for Financial Effects?

**Research Basis**:
Financial operations require minimum cognitive processing time before commitment.

| Timing | User Experience |
|--------|-----------------|
| < 500ms | Users report "accidental" clicks |
| 500-800ms | Sweet spot for deliberate action |
| > 1000ms | Feels sluggish, abandonment increases |

**Psychology**:
- **Commitment checkpoint**: 800ms gives users time to see amount, mentally commit
- **Error prevention**: Slower = fewer accidental confirmations
- **Trust building**: Deliberate pace signals "this matters"

**Exceptions**:
Power user contexts (trading platforms) may use 500ms if:
- Users are professionals with high frequency
- Amounts are smaller/routine
- Undo mechanisms exist

Your taste.md shows power user preference. Applied 500ms override.
```

### For Sync Strategy Questions

```markdown
## Physics Rationale: Sync Strategy

### Why Pessimistic for Financial?

**Core Principle**:
Financial operations cannot be undone. If we show optimistic updates and the transaction fails, users see false confirmations of money movement.

**Consequences of Optimistic Financial**:
1. **False balance**: User sees $1000, actual is $500
2. **Double-spending**: User tries second action based on false state
3. **Support burden**: Confused users file tickets
4. **Trust erosion**: Platform feels unreliable

**When Optimistic is OK**:
- Reversible actions (likes, follows)
- Non-financial state changes
- Actions with robust undo

**Technical Implementation**:
```tsx
// Pessimistic: No onMutate, no optimistic update
const { mutate } = useMutation({
  mutationFn: claimRewards,
  onSuccess: () => invalidateQueries(['balance']),
  // NO onMutate - wait for server
})

// Optimistic: Update before server confirms
const { mutate } = useMutation({
  mutationFn: toggleLike,
  onMutate: () => updateCache(optimisticValue),
  onError: () => rollbackCache(),
})
```
```

### For Confirmation Questions

```markdown
## Physics Rationale: Confirmation

### Why Require Confirmation for Financial?

**Two-Phase Commit Pattern**:
1. **Intent Phase**: User clicks "Claim"
2. **Confirm Phase**: User sees amount, clicks "Confirm"

**Benefits**:
- User verifies amount before commitment
- Escape route always available (Cancel)
- Reduces accidental transactions by 90%+

**Pattern**:
```tsx
// Phase 1: Show intent
<button onClick={() => setShowConfirm(true)}>
  Claim {formatAmount(amount)}
</button>

// Phase 2: Confirm with details
{showConfirm && (
  <div>
    <p>Claim {formatAmount(amount)}?</p>
    <button onClick={() => setShowConfirm(false)}>Cancel</button>
    <button onClick={() => mutate()}>Confirm</button>
  </div>
)}
```

**Why Not Modal?**
Your taste.md indicates preference for inline confirmation over modals.
Inline keeps context, reduces cognitive load.
```

### For Protected Capability Questions

```markdown
## Physics Rationale: Protected Capabilities

### Why "Cancel Always Visible"?

**Core Principle**:
Users must never be trapped in an operation.

**Scenarios Without Escape**:
1. User clicks wrong button
2. Network is slow, user wants to abort
3. User realizes amount is wrong
4. User gets interrupted

**Anti-Pattern**:
```tsx
// WRONG: Cancel disappears during loading
{!isPending && <button onClick={onCancel}>Cancel</button>}
```

**Correct Pattern**:
```tsx
// RIGHT: Cancel always visible, just disabled or styled differently
<button
  onClick={onCancel}
  disabled={isPending}
  className={isPending ? 'opacity-50' : ''}
>
  Cancel
</button>
```

**Touch Target (44px)**:
- Apple HIG accessibility requirement
- Prevents mis-taps on small buttons
- Critical for financial operations
```

## Loading Reference Skills

At L4, load the full reference skills:

```typescript
async function loadL4Content(question: string): Promise<string> {
  // Load physics reference for rationale
  const physicsRef = await loadSkill('physics-reference');

  // Load patterns reference for examples
  const patternsRef = await loadSkill('patterns-reference');

  // Generate explanation using references
  return generateExplanation(question, physicsRef, patternsRef);
}
```

## Escalation from L3

After code generation (L3), user might ask "why?":

```
User: /glyph "claim button"

[L1 - Hypothesis shown]
...

User: y

[L3 - Code generated]
...

User: why 800ms?

[L4 - Full explanation]
## Physics Rationale: Timing

The 800ms timing for Financial effects serves as a cognitive checkpoint...
```

## Linking to Reference

End L4 explanations with reference link:

```markdown
---

Full physics tables available via `/physics-reference`.
Implementation patterns available via `/patterns-reference`.
```

## Verbosity Control

L4 should be comprehensive but not overwhelming:

```typescript
function formatL4Response(
  explanation: Explanation,
  tokenBudget: number = 500
): string {
  let content = '';

  // Always include: core rationale
  content += explanation.coreRationale;

  // If budget allows: examples
  if (estimateTokens(content) + estimateTokens(explanation.examples) < tokenBudget) {
    content += explanation.examples;
  }

  // If budget allows: exceptions
  if (estimateTokens(content) + estimateTokens(explanation.exceptions) < tokenBudget) {
    content += explanation.exceptions;
  }

  // Always include: link to reference
  content += '\n\n---\nFull details via `/physics-reference`.';

  return content;
}
```
