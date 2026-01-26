# Wyrd: Change Analysis

Analyze file changes to detect physics-relevant modifications.

## Physics-Relevant Fields

| Field | Detection Pattern | Example Change |
|-------|-------------------|----------------|
| Timing | `\d+ms`, `duration:`, `timeout:` | 800ms → 500ms |
| Sync | `onMutate`, `optimistic`, `pessimistic` | Added onMutate |
| Animation | `ease-`, `spring(`, `duration` | ease-out → spring |
| Confirmation | `confirm`, `modal`, `dialog`, `two-phase` | Removed modal |

## Detection Patterns

### Timing Changes

```typescript
function detectTimingChanges(diff: Diff): TimingChange[] {
  const changes: TimingChange[] = [];

  // Pattern: numeric ms values
  const timingPattern = /[-+].*?(\d+)ms/g;

  for (const hunk of diff.hunks) {
    const removed = hunk.lines.filter(l => l.startsWith('-'));
    const added = hunk.lines.filter(l => l.startsWith('+'));

    // Extract timing values
    const oldTiming = extractTiming(removed.join('\n'));
    const newTiming = extractTiming(added.join('\n'));

    if (oldTiming !== newTiming && oldTiming !== null && newTiming !== null) {
      changes.push({
        field: 'timing',
        from: oldTiming,
        to: newTiming,
        line: hunk.newStart
      });
    }
  }

  return changes;
}

function extractTiming(code: string): number | null {
  const match = code.match(/(\d+)ms|duration:\s*(\d+)|timeout:\s*(\d+)/);
  if (match) {
    return parseInt(match[1] || match[2] || match[3]);
  }
  return null;
}
```

### Sync Strategy Changes

```typescript
function detectSyncChanges(diff: Diff): SyncChange[] {
  const changes: SyncChange[] = [];

  for (const hunk of diff.hunks) {
    const removed = hunk.lines.filter(l => l.startsWith('-')).join('\n');
    const added = hunk.lines.filter(l => l.startsWith('+')).join('\n');

    // Check for onMutate addition (pessimistic → optimistic)
    if (!removed.includes('onMutate') && added.includes('onMutate')) {
      changes.push({
        field: 'sync',
        from: 'pessimistic',
        to: 'optimistic',
        line: hunk.newStart,
        detail: 'Added onMutate'
      });
    }

    // Check for onMutate removal (optimistic → pessimistic)
    if (removed.includes('onMutate') && !added.includes('onMutate')) {
      changes.push({
        field: 'sync',
        from: 'optimistic',
        to: 'pessimistic',
        line: hunk.newStart,
        detail: 'Removed onMutate'
      });
    }
  }

  return changes;
}
```

### Animation Changes

```typescript
function detectAnimationChanges(diff: Diff): AnimationChange[] {
  const changes: AnimationChange[] = [];

  const easingPattern = /ease-(in|out|in-out)|linear/;
  const springPattern = /spring\((\d+),\s*(\d+)\)/;

  for (const hunk of diff.hunks) {
    const removed = hunk.lines.filter(l => l.startsWith('-')).join('\n');
    const added = hunk.lines.filter(l => l.startsWith('+')).join('\n');

    const oldEasing = removed.match(easingPattern)?.[0];
    const newEasing = added.match(easingPattern)?.[0];
    const oldSpring = removed.match(springPattern)?.[0];
    const newSpring = added.match(springPattern)?.[0];

    // Easing to spring
    if (oldEasing && newSpring) {
      changes.push({
        field: 'animation',
        from: oldEasing,
        to: newSpring,
        line: hunk.newStart
      });
    }

    // Spring to easing
    if (oldSpring && newEasing) {
      changes.push({
        field: 'animation',
        from: oldSpring,
        to: newEasing,
        line: hunk.newStart
      });
    }

    // Spring parameter change
    if (oldSpring && newSpring && oldSpring !== newSpring) {
      changes.push({
        field: 'animation',
        from: oldSpring,
        to: newSpring,
        line: hunk.newStart
      });
    }
  }

  return changes;
}
```

### Confirmation Changes

```typescript
function detectConfirmationChanges(diff: Diff): ConfirmationChange[] {
  const changes: ConfirmationChange[] = [];

  const confirmPatterns = [
    /showConfirm|isConfirming|confirmStep/,
    /Modal|Dialog/,
    /confirm\(/
  ];

  for (const hunk of diff.hunks) {
    const removed = hunk.lines.filter(l => l.startsWith('-')).join('\n');
    const added = hunk.lines.filter(l => l.startsWith('+')).join('\n');

    const hadConfirm = confirmPatterns.some(p => p.test(removed));
    const hasConfirm = confirmPatterns.some(p => p.test(added));

    if (hadConfirm && !hasConfirm) {
      changes.push({
        field: 'confirmation',
        from: 'present',
        to: 'removed',
        line: hunk.newStart,
        severity: 'HIGH'  // Removing confirmation is significant
      });
    }

    if (!hadConfirm && hasConfirm) {
      changes.push({
        field: 'confirmation',
        from: 'none',
        to: 'added',
        line: hunk.newStart
      });
    }
  }

  return changes;
}
```

## Aggregated Analysis

```typescript
interface ChangeAnalysis {
  file: string;
  effect: Effect;
  changes: PhysicsChange[];
  significance: 'low' | 'medium' | 'high';
  suggestedTaste: TasteEntry | null;
}

function analyzeChanges(
  diff: Diff,
  originalPhysics: Physics
): ChangeAnalysis {
  const changes: PhysicsChange[] = [
    ...detectTimingChanges(diff),
    ...detectSyncChanges(diff),
    ...detectAnimationChanges(diff),
    ...detectConfirmationChanges(diff)
  ];

  // Determine significance
  const significance = calculateSignificance(changes, originalPhysics);

  // Generate suggested taste entry if significant
  const suggestedTaste = significance !== 'low'
    ? generateTasteSuggestion(changes, originalPhysics)
    : null;

  return {
    file: diff.file,
    effect: originalPhysics.effect,
    changes,
    significance,
    suggestedTaste
  };
}
```

## Significance Calculation

```typescript
function calculateSignificance(
  changes: PhysicsChange[],
  original: Physics
): 'low' | 'medium' | 'high' {
  // High: Confirmation removed from Financial/Destructive
  if (changes.some(c =>
    c.field === 'confirmation' &&
    c.to === 'removed' &&
    ['Financial', 'Destructive'].includes(original.effect)
  )) {
    return 'high';
  }

  // High: Sync strategy changed
  if (changes.some(c => c.field === 'sync')) {
    return 'high';
  }

  // Medium: Timing changed by >200ms
  const timingChange = changes.find(c => c.field === 'timing');
  if (timingChange) {
    const delta = Math.abs(timingChange.from - timingChange.to);
    if (delta > 200) return 'medium';
  }

  // Medium: Animation type changed (easing ↔ spring)
  if (changes.some(c =>
    c.field === 'animation' &&
    (c.from.includes('ease') !== c.to.includes('ease'))
  )) {
    return 'medium';
  }

  // Low: Minor timing/animation tweaks
  return changes.length > 0 ? 'low' : 'low';
}
```

## Taste Suggestion Generation

```typescript
function generateTasteSuggestion(
  changes: PhysicsChange[],
  original: Physics
): TasteEntry {
  const descriptions: string[] = [];

  for (const change of changes) {
    switch (change.field) {
      case 'timing':
        descriptions.push(
          `Prefers ${change.to}ms over ${change.from}ms for ${original.effect} effects.`
        );
        break;
      case 'animation':
        descriptions.push(
          `Prefers ${change.to} animation over ${change.from}.`
        );
        break;
      case 'sync':
        descriptions.push(
          `Changed sync from ${change.from} to ${change.to}.`
        );
        break;
      case 'confirmation':
        descriptions.push(
          `${change.to === 'removed' ? 'Removed' : 'Added'} confirmation step.`
        );
        break;
    }
  }

  return {
    timestamp: new Date(),
    description: descriptions.join(' '),
    effect: original.effect,
    tier: 1,  // Observation
    changes
  };
}
```

## Non-Physics Changes (Ignored)

| Change Type | Examples | Why Ignored |
|-------------|----------|-------------|
| Styling | Colors, spacing, fonts | Aesthetic, not physics |
| Logic | Conditionals, calculations | Business rules |
| Structure | Component splits, hooks | Architecture |
| Comments | JSDoc, inline comments | Documentation |
| Imports | Added/removed imports | Dependencies |

These changes don't affect design physics and shouldn't trigger taste capture.
