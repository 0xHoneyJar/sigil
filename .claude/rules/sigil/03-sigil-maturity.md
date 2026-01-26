# Sigil: Maturity Tiers

Taste entries mature through tiers based on validation.

## Tier Overview

| Tier | Name | Source | Application | Confidence Boost |
|------|------|--------|-------------|------------------|
| 1 | Observation | Single instance | Applied with note | +0.00 |
| 2 | Pattern | 3+ similar | Applied with confidence | +0.05 |
| 3 | Rule | User promoted | Applied always | +0.10 |

## Tier 1: Observation

**Definition**: A single data point. Could be noise, could be preference.

**Creation**:
- Explicit rejection recorded as taste
- Implicit edit recorded as taste
- Manual `/sigil "insight"`

**Application**:
When generating components:
- Read observation
- Note it influenced generation
- Don't strongly adjust physics

**Example**:
```markdown
## 2026-01-25 14:30

For Financial effects: 500ms feels more responsive.

Tier: 1 (Observation)
```

**In Hypothesis**:
```
**Taste Applied**: 500ms (observation, not yet pattern)
```

## Tier 2: Pattern

**Definition**: Validated preference across multiple instances.

**Promotion Criteria**:
- 3+ similar observations/rejections
- Same effect type
- Same field
- Same direction
- Within 90 days

**Creation**:
- Auto-promoted from observations when pattern detected
- See `wyrd/07-wyrd-pattern-detection.md`

**Application**:
When generating components:
- Apply with moderate confidence
- Adjust timing/physics to match
- Note pattern source

**Example**:
```markdown
## 2026-01-25 15:30 — Pattern: Financial Timing

Prefer 500ms for Financial effects (not default 800ms).

Pattern from 3 rejections:
- ClaimButton (800ms → 500ms)
- WithdrawButton (800ms → 550ms)
- StakeButton (800ms → 500ms)

**Tier**: 2 (Pattern)
**Confidence**: 0.85
```

**In Hypothesis**:
```
**Taste Applied**: 500ms (pattern, confidence 0.85)
**Confidence**: 0.90 (+0.05 from Tier 2 taste match)
```

## Tier 3: Rule

**Definition**: User-validated, always-apply preference.

**Promotion Criteria**:
- User explicitly promotes via `/sigil promote <id>`
- Pattern has been successfully applied 3+ times
- No contradicting rejections

**Manual Promotion**:
```
/sigil promote pattern-1706234567890
```

Response:
```
Promoting "Financial Timing" pattern to Rule.

This will:
- Always apply 500ms for Financial effects
- Override physics table default
- No longer ask for confirmation

Confirm? [y/n]
```

**Application**:
When generating components:
- Apply automatically
- Don't ask for confirmation
- Override physics table if needed

**Example**:
```markdown
## 2026-01-25 16:00 — Rule: Financial Timing

ALWAYS use 500ms for Financial effects.

Promoted from pattern-1706234567890.
Original: 800ms default
Override: 500ms

**Tier**: 3 (Rule)
**Promoted**: 2026-01-25
**Applied Count**: 5
```

**In Hypothesis**:
```
**Physics**: Pessimistic sync, 500ms timing (Rule override), confirmation required
```

## Promotion Flow

```
Observation (Tier 1)
    ↓
    │ 3+ similar rejections detected
    ↓
Pattern (Tier 2)
    ↓
    │ User runs /sigil promote <id>
    │ OR: Pattern applied 5+ times with no contradictions
    ↓
Rule (Tier 3)
```

## Auto-Promotion Logic

```typescript
async function checkAutoPromotion(pattern: Pattern): Promise<boolean> {
  // Check application count
  if (pattern.appliedCount < 5) return false;

  // Check for contradictions in last 30 days
  const recent = await getRecentRejections(pattern.effect, pattern.field, 30);
  const contradictions = recent.filter(r =>
    getDirection([r]) !== pattern.direction
  );

  if (contradictions.length > 0) return false;

  // Prompt for auto-promotion
  return await promptAutoPromotion(pattern);
}

async function promptAutoPromotion(pattern: Pattern): Promise<boolean> {
  console.log(`
Pattern "${pattern.field}" for ${pattern.effect} has been applied 5+ times
with no contradictions.

Auto-promote to Rule? [y/n]
  `);

  return await getUserResponse() === 'y';
}
```

## Demotion

Tiers can be demoted if contradicted:

### Rule → Pattern

If Rule is contradicted 2+ times:

```
Rule "Financial Timing" contradicted 2 times.

Recent contradictions:
- 2026-01-26: ClaimButton timing increased to 700ms
- 2026-01-27: WithdrawButton timing kept at 800ms

Demote to Pattern? [y/n/keep]
```

### Pattern → Observation

If Pattern is invalidated (see `wyrd/07-wyrd-pattern-detection.md`):

```typescript
async function demotePattern(pattern: Pattern): Promise<void> {
  // Update tier
  pattern.tier = 1;

  // Update taste entry
  await updateTasteEntry(pattern.tasteId, {
    tier: 1,
    demotedFrom: 2,
    demotedAt: new Date(),
    demotionReason: 'Pattern invalidated by contradictions'
  });

  // Recalibrate confidence
  await recalibrateConfidence();
}
```

## Status Command

```
/sigil status
```

Output:
```
## Taste Maturity Distribution

**Tier 3 (Rules)**: 2
- Financial timing: 500ms
- Animation style: springs

**Tier 2 (Patterns)**: 3
- Destructive timing: 400ms (confidence: 0.80)
- Confirmation style: inline (confidence: 0.75)
- Touch targets: 48px (confidence: 0.85)

**Tier 1 (Observations)**: 7
- Various timing, animation, style preferences

**Total Entries**: 12
**Avg Maturity**: 1.4
```

## Confidence Impact by Tier

```typescript
function getTierConfidenceBoost(tier: number): number {
  switch (tier) {
    case 1: return 0.00;  // Observation - no boost
    case 2: return 0.05;  // Pattern - moderate boost
    case 3: return 0.10;  // Rule - strong boost
    default: return 0.00;
  }
}
```

When calculating hypothesis confidence:

```typescript
function calculateConfidence(effect: Effect, tasteMatches: TasteEntry[]): number {
  let confidence = BASE_CONFIDENCE[effect];

  for (const taste of tasteMatches) {
    confidence += getTierConfidenceBoost(taste.tier);
  }

  return Math.min(confidence, 0.99);
}
```
