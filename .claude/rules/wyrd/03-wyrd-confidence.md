# Wyrd: Confidence Calculation

Detailed confidence calculation logic for hypothesis formation.

## Algorithm

```
function calculateConfidence(effect, component, taste, rejections):
  # Step 1: Base confidence by effect type
  base = BASE_CONFIDENCE[effect]

  # Step 2: Taste adjustment (+0.05 per Tier 2+ match)
  taste_adj = 0
  for entry in taste:
    if entry.matches(effect, component) and entry.tier >= 2:
      taste_adj += 0.05

  # Step 3: Rejection adjustment
  rejection_adj = 0
  for rejection in rejections:
    if rejection.effect == effect:
      weight = getDecayWeight(rejection.date)
      if rejection.component == component:
        rejection_adj -= 0.10 * weight  # Same component penalty
      else:
        rejection_adj -= 0.05 * weight  # Similar effect penalty

  # Step 4: Cap adjustment
  rejection_adj = max(rejection_adj, -0.30)

  # Step 5: Calculate final confidence
  confidence = base + taste_adj + rejection_adj
  confidence = clamp(confidence, 0.0, 1.0)

  return confidence
```

## Base Confidence Values

| Effect | Base | Rationale |
|--------|------|-----------|
| Financial | 0.90 | High stakes, well-defined physics |
| Destructive | 0.90 | Clear patterns, confirmation required |
| Soft Delete | 0.85 | Usually reversible, some variation |
| Standard | 0.85 | Common case, moderate certainty |
| Navigation | 0.90 | Simple, immediate feedback |
| Local | 0.95 | Pure client, highly predictable |

## Decay Weight Function

```
function getDecayWeight(rejectionDate):
  daysAgo = daysSince(rejectionDate)

  if daysAgo <= 7:
    return 1.0    # Full weight
  elif daysAgo <= 30:
    return 0.5    # Half weight
  elif daysAgo <= 90:
    return 0.25   # Quarter weight
  else:
    return 0.0    # Expired
```

## Taste Matching

A taste entry matches when:

1. **Effect Match**: Entry mentions the effect type or related keywords
2. **Component Match**: Entry references similar component patterns
3. **Context Match**: Entry applies to current sprint/project context

Example taste entry that matches Financial + ClaimButton:
```markdown
## 2026-01-20

They prefer 500ms for financial operations, not 800ms.
Power users, not casual. They know what they're doing.
```

## Rejection Similarity

Rejections are considered similar when:

1. **Same Effect**: Both target the same effect type
2. **Same Change Type**: Both involve the same field (timing, sync, animation)
3. **Same Direction**: Both changes go the same direction (e.g., timing reduction)

## Confidence Interpretation

| Range | Label | Behavior |
|-------|-------|----------|
| 0.90-1.00 | High | Proceed without hesitation |
| 0.75-0.89 | Moderate | Proceed, note "moderate confidence" |
| 0.50-0.74 | Low | Ask: "This could be X or Y. Which?" |
| 0.00-0.49 | Uncertain | Require explicit: "Please confirm effect type" |

## Implementation Pseudocode

```typescript
interface ConfidenceResult {
  value: number;
  label: 'high' | 'moderate' | 'low' | 'uncertain';
  factors: {
    base: number;
    tasteAdjustment: number;
    rejectionAdjustment: number;
    tasteMatches: string[];
    rejectionCount: number;
  };
}

function calculateConfidence(
  effect: EffectType,
  component: string,
  taste: TasteEntry[],
  rejections: Rejection[]
): ConfidenceResult {
  const base = BASE_CONFIDENCE[effect];

  // Taste adjustment
  const tasteMatches = taste.filter(t =>
    t.matches(effect, component) && t.tier >= 2
  );
  const tasteAdj = tasteMatches.length * 0.05;

  // Rejection adjustment
  let rejectionAdj = 0;
  let rejectionCount = 0;
  for (const r of rejections) {
    if (r.effect === effect) {
      const weight = getDecayWeight(r.date);
      if (weight > 0) {
        rejectionCount++;
        rejectionAdj -= (r.component === component ? 0.10 : 0.05) * weight;
      }
    }
  }
  rejectionAdj = Math.max(rejectionAdj, -0.30);

  // Final confidence
  const value = Math.max(0, Math.min(1, base + tasteAdj + rejectionAdj));

  return {
    value,
    label: value >= 0.90 ? 'high' :
           value >= 0.75 ? 'moderate' :
           value >= 0.50 ? 'low' : 'uncertain',
    factors: {
      base,
      tasteAdjustment: tasteAdj,
      rejectionAdjustment: rejectionAdj,
      tasteMatches: tasteMatches.map(t => t.id),
      rejectionCount
    }
  };
}
```

## Updating Wyrd State

After confidence calculation, update `grimoires/rune/wyrd.md`:

```markdown
## Confidence Calibration

| Effect | Base | Adjustment | Current | Last Updated |
|--------|------|------------|---------|--------------|
| Financial | 0.90 | -0.10 | 0.80 | 2026-01-25 |
```

The Adjustment column reflects the cumulative rejection adjustment for that effect type.
