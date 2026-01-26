# Wyrd: Pattern Detection

Detect patterns from 3+ similar rejections to auto-promote to taste.

## Philosophy

**Three makes a pattern.** One rejection is noise. Two is coincidence. Three is a preference worth encoding.

## Pattern Criteria

A pattern is detected when:

1. **Same effect type** — All rejections for same effect (e.g., Financial)
2. **Same field changed** — All modify the same physics field (e.g., timing)
3. **Same direction** — All changes go the same way (e.g., decreasing timing)
4. **Within 90 days** — Recent enough to be relevant

## Detection Algorithm

```typescript
interface Rejection {
  id: string;
  timestamp: Date;
  effect: Effect;
  field: 'timing' | 'sync' | 'animation' | 'confirmation';
  from: any;
  to: any;
  component: string;
}

interface Pattern {
  id: string;
  effect: Effect;
  field: string;
  direction: 'increase' | 'decrease' | 'change';
  rejections: Rejection[];
  confidence: number;
  suggestedValue: any;
}

function detectPatterns(rejections: Rejection[]): Pattern[] {
  const patterns: Pattern[] = [];

  // Filter to last 90 days
  const recent = rejections.filter(r =>
    daysSince(r.timestamp) <= 90
  );

  // Group by effect + field
  const groups = groupBy(recent, r => `${r.effect}:${r.field}`);

  for (const [key, group] of Object.entries(groups)) {
    if (group.length < 3) continue;

    const [effect, field] = key.split(':');
    const direction = detectDirection(group);

    if (direction) {
      patterns.push({
        id: `pattern-${Date.now()}`,
        effect: effect as Effect,
        field,
        direction,
        rejections: group,
        confidence: calculatePatternConfidence(group),
        suggestedValue: calculateSuggestedValue(group)
      });
    }
  }

  return patterns;
}
```

## Direction Detection

```typescript
function detectDirection(
  rejections: Rejection[]
): 'increase' | 'decrease' | 'change' | null {
  if (rejections[0].field === 'timing') {
    // Check if all timing changes go same direction
    const directions = rejections.map(r => r.to - r.from);
    const allDecrease = directions.every(d => d < 0);
    const allIncrease = directions.every(d => d > 0);

    if (allDecrease) return 'decrease';
    if (allIncrease) return 'increase';
    return null;  // Mixed directions, no pattern
  }

  if (rejections[0].field === 'sync') {
    // Check if all sync changes are the same
    const changes = rejections.map(r => `${r.from}->${r.to}`);
    const allSame = changes.every(c => c === changes[0]);

    return allSame ? 'change' : null;
  }

  if (rejections[0].field === 'animation') {
    // Check for consistent animation preference
    const toSpring = rejections.filter(r => r.to.includes('spring'));
    const toEasing = rejections.filter(r => r.to.includes('ease'));

    if (toSpring.length === rejections.length) return 'change';
    if (toEasing.length === rejections.length) return 'change';
    return null;
  }

  return 'change';  // Default for other fields
}
```

## Confidence Calculation

```typescript
function calculatePatternConfidence(rejections: Rejection[]): number {
  let confidence = 0.7;  // Base for 3 rejections

  // +0.05 per additional rejection (max +0.20)
  const extraRejections = Math.min(rejections.length - 3, 4);
  confidence += extraRejections * 0.05;

  // +0.05 if all rejections from different components
  const uniqueComponents = new Set(rejections.map(r => r.component)).size;
  if (uniqueComponents === rejections.length) {
    confidence += 0.05;
  }

  // -0.05 if oldest rejection > 60 days
  const oldest = Math.max(...rejections.map(r => daysSince(r.timestamp)));
  if (oldest > 60) {
    confidence -= 0.05;
  }

  return Math.min(confidence, 0.95);
}
```

## Suggested Value Calculation

```typescript
function calculateSuggestedValue(rejections: Rejection[]): any {
  const field = rejections[0].field;

  if (field === 'timing') {
    // Use median of 'to' values
    const toValues = rejections.map(r => r.to).sort((a, b) => a - b);
    const mid = Math.floor(toValues.length / 2);
    return toValues.length % 2 === 0
      ? (toValues[mid - 1] + toValues[mid]) / 2
      : toValues[mid];
  }

  if (field === 'animation') {
    // Use most common 'to' value
    const counts = new Map<string, number>();
    for (const r of rejections) {
      counts.set(r.to, (counts.get(r.to) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }

  // For others, use the most recent 'to' value
  return rejections.sort((a, b) =>
    b.timestamp.getTime() - a.timestamp.getTime()
  )[0].to;
}
```

## Pattern Storage

Patterns are stored in `grimoires/rune/patterns.md`:

```markdown
# Detected Patterns

## Pattern: Financial Timing Preference

**ID**: pattern-1706234567890
**Effect**: Financial
**Field**: timing
**Direction**: decrease
**Confidence**: 0.85
**Suggested Value**: 500ms

### Source Rejections
1. 2026-01-25 - ClaimButton (800ms → 500ms)
2. 2026-01-24 - WithdrawButton (800ms → 550ms)
3. 2026-01-23 - StakeButton (800ms → 500ms)

### Status
- **Tier**: 2 (Pattern)
- **Created**: 2026-01-25
- **Applied Count**: 0

---

## Pattern: Spring Animation Preference

**ID**: pattern-1706234567891
**Effect**: Standard
**Field**: animation
**Direction**: change (easing → spring)
**Confidence**: 0.80
**Suggested Value**: spring(500, 30)

### Source Rejections
1. 2026-01-25 - LikeButton (ease-out → spring(500, 30))
2. 2026-01-24 - SaveButton (ease-in-out → spring(500, 30))
3. 2026-01-23 - FollowButton (ease-out → spring(400, 25))

### Status
- **Tier**: 2 (Pattern)
- **Created**: 2026-01-25
- **Applied Count**: 2

---
```

## Pattern Notification

When pattern detected:

```
🔮 Pattern Detected

3 similar rejections for Financial timing found.

Pattern: Users prefer 500ms for Financial effects (currently 800ms)
Confidence: 0.85

Options:
1. Create taste entry (auto-apply to future generations)
2. Review rejections first
3. Dismiss (won't ask again for this pattern)

[1/2/3]
```

## Auto-Promotion to Taste

On "1" (Create taste entry):

```typescript
async function promotePatternToTaste(pattern: Pattern): Promise<void> {
  // Create taste entry
  const tasteEntry = formatTasteEntry(pattern);
  await appendToFile('grimoires/rune/taste.md', tasteEntry);

  // Update pattern status
  pattern.tier = 2;
  await updatePattern(pattern);

  // Update source rejections
  for (const rejection of pattern.rejections) {
    rejection.outcome.patternDetected = true;
    rejection.outcome.tierPromotion = 2;
    await updateRejection(rejection);
  }

  // Recalibrate confidence
  await recalibrateConfidence();
}
```

## Taste Entry Format

```markdown
## 2026-01-25 15:30 — Pattern: Financial Timing

Prefer 500ms for Financial operations, not default 800ms.
Power users find 800ms sluggish. Consistent across ClaimButton,
WithdrawButton, and StakeButton.

**Source**: Pattern detection (3 rejections)
**Effect**: Financial
**Field**: timing
**Value**: 500ms
**Tier**: 2 (Pattern)
**Confidence**: 0.85

---
```

## Pattern Invalidation

Patterns can be invalidated if:

1. User explicitly dismisses
2. New rejection contradicts (increases timing)
3. Pattern older than 180 days with no applications

```typescript
function checkPatternValidity(pattern: Pattern): boolean {
  // Check for contradicting rejections
  const recentRejections = getRejectionsFor(pattern.effect, pattern.field);
  const contradictions = recentRejections.filter(r =>
    getDirection([r]) !== pattern.direction
  );

  if (contradictions.length >= 2) {
    return false;  // Pattern invalidated
  }

  // Check age
  if (daysSince(pattern.created) > 180 && pattern.appliedCount === 0) {
    return false;  // Stale pattern
  }

  return true;
}
```
