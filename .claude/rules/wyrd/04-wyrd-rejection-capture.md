# Wyrd: Rejection Capture

Detailed workflow for capturing explicit rejections and learning from them.

## Explicit Rejection Flow

When user responds `n` or `no` to a hypothesis:

### Step 1: Prompt for Reason

```
Your hypothesis was rejected.

What should be different?
> [user input]
```

If user provides no reason, record as "No reason provided".

### Step 2: Log to Rejections

Append to `grimoires/rune/rejections.md`:

```markdown
## 2026-01-25 14:30 - ClaimButton Rejection

**Hypothesis**:
- Effect: Financial
- Timing: 800ms
- Sync: Pessimistic
- Confidence: 0.85

**Rejection**:
- Type: explicit_no
- Reason: "800ms feels too slow for power users"

**Context**:
- Sprint: sprint-1
- Component: ClaimButton
- File: src/components/ClaimButton.tsx

**Outcome**:
- Taste Created: pending
- Pattern Detected: no (1 similar)
- Tier Promotion: none

---
```

### Step 3: Offer Taste Capture

```
Record this as a taste preference? [y/n]

This will help future generations match your preferences.
```

If yes:
1. Format taste entry with context
2. Append to `grimoires/rune/taste.md`
3. Update rejection outcome: `Taste Created: yes (taste-2026-01-25-001)`

### Step 4: Check for Patterns

Count similar rejections:
- Same effect type
- Similar change (e.g., timing-related)

If count >= 3:
```
Pattern detected: 3 similar timing rejections for Financial effect

Creating pattern entry...
```

Update rejection outcome: `Pattern Detected: yes (3 similar)`

### Step 5: Update Confidence

1. Read current `grimoires/rune/wyrd.md`
2. Increment rejection count for effect
3. Recalculate adjustment
4. Update Confidence Calibration table

### Step 6: Ask for Correction

```
How should I adjust the hypothesis?

Options:
1. Change timing (current: 800ms)
2. Change sync strategy (current: pessimistic)
3. Change effect type (current: Financial)
4. Other (describe)

> [user input]
```

Parse user input and create corrected hypothesis.

## Rejection Entry Schema

```yaml
rejection:
  id: "rej-2026-01-25-001"
  timestamp: "2026-01-25T14:30:00Z"
  component: "ClaimButton"
  file: "src/components/ClaimButton.tsx"
  sprint: "sprint-1"

  hypothesis:
    effect: "Financial"
    timing: 800
    sync: "pessimistic"
    confirmation: "required"
    confidence: 0.85

  rejection:
    type: "explicit_no"
    reason: "800ms feels too slow for power users"
    correction:
      field: "timing"
      from: 800
      to: 500

  outcome:
    taste_created: true
    taste_id: "taste-2026-01-25-001"
    pattern_detected: false
    similar_count: 1
    tier_promotion: null
```

## Quick Rejection (No Details)

If user just says `n` without elaboration:

```
Hypothesis rejected.

Quick options:
- "timing" → Adjust timing value
- "sync" → Change sync strategy
- "effect" → Different effect type
- "other" → Describe what's wrong

> [user input]
```

## Batch Rejection

If multiple hypotheses rejected in sequence:

```
Multiple rejections detected this session.

Would you like to:
1. Review and record all as taste
2. Skip recording
3. Record selectively

> [user input]
```
