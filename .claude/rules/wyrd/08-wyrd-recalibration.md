# Wyrd: Confidence Recalibration

Protocol for updating confidence calibration based on rejections and patterns.

## When to Recalibrate

1. **After rejection logged** — Immediate update
2. **After pattern detected** — Batch update
3. **Manual trigger** — `/wyrd calibrate`
4. **Session start** — If stale (>24 hours since last calibration)

## Recalibration Algorithm

```typescript
interface CalibrationState {
  effect: Effect;
  baseConfidence: number;
  tasteAdjustment: number;
  rejectionAdjustment: number;
  finalConfidence: number;
  lastCalibrated: Date;
}

async function recalibrate(): Promise<CalibrationState[]> {
  const states: CalibrationState[] = [];

  for (const effect of EFFECTS) {
    // Get base confidence
    const base = BASE_CONFIDENCE[effect];

    // Calculate taste adjustment
    const tasteAdj = await calculateTasteAdjustment(effect);

    // Calculate rejection adjustment
    const rejectionAdj = await calculateRejectionAdjustment(effect);

    // Combine
    const final = Math.max(
      0.50,  // Floor
      Math.min(
        0.99,  // Ceiling
        base + tasteAdj + rejectionAdj
      )
    );

    states.push({
      effect,
      baseConfidence: base,
      tasteAdjustment: tasteAdj,
      rejectionAdjustment: rejectionAdj,
      finalConfidence: final,
      lastCalibrated: new Date()
    });
  }

  // Write to wyrd.md
  await writeCalibrationState(states);

  return states;
}
```

## Taste Adjustment Calculation

```typescript
async function calculateTasteAdjustment(effect: Effect): Promise<number> {
  const tasteEntries = await readTasteEntries();
  const matching = tasteEntries.filter(t => t.effect === effect);

  let adjustment = 0;

  for (const entry of matching) {
    // Only Tier 2+ contributes to adjustment
    if (entry.tier >= 2) {
      adjustment += 0.05;
    }
  }

  // Cap at +0.15
  return Math.min(adjustment, 0.15);
}
```

## Rejection Adjustment Calculation

```typescript
async function calculateRejectionAdjustment(effect: Effect): Promise<number> {
  const rejections = await readRejections();
  const matching = rejections.filter(r => r.hypothesis.effect === effect);

  let adjustment = 0;

  for (const rejection of matching) {
    const age = daysSince(rejection.timestamp);

    // Apply decay
    let weight: number;
    if (age <= 7) {
      weight = 1.0;      // Full weight: 0-7 days
    } else if (age <= 30) {
      weight = 0.5;      // Half weight: 8-30 days
    } else if (age <= 90) {
      weight = 0.25;     // Quarter weight: 31-90 days
    } else {
      weight = 0;        // No weight: >90 days
    }

    // -0.05 per weighted rejection
    adjustment -= 0.05 * weight;
  }

  // Cap at -0.30
  return Math.max(adjustment, -0.30);
}
```

## Decay Policy

| Age | Weight | Rationale |
|-----|--------|-----------|
| 0-7 days | 100% | Fresh feedback, highly relevant |
| 8-30 days | 50% | Recent, still relevant |
| 31-90 days | 25% | Getting stale, reduced impact |
| >90 days | 0% | Too old, ignore |

## Calibration State File

Update `grimoires/rune/wyrd.md`:

```markdown
# Wyrd State

## Confidence Calibration

| Effect | Base | Taste Adj | Rejection Adj | Final | Last Updated |
|--------|------|-----------|---------------|-------|--------------|
| Financial | 0.90 | +0.05 | -0.10 | 0.85 | 2026-01-25 |
| Destructive | 0.90 | +0.00 | -0.05 | 0.85 | 2026-01-25 |
| Standard | 0.85 | +0.10 | -0.00 | 0.95 | 2026-01-25 |
| Local | 0.95 | +0.00 | -0.00 | 0.95 | 2026-01-25 |

## Metrics

- **Total Hypotheses**: 15
- **Accepted**: 12 (80%)
- **Rejected**: 3 (20%)
- **Patterns Detected**: 2
- **Taste Entries**: 5

## Recent Activity

### 2026-01-25
- Rejection: ClaimButton (Financial, timing)
- Pattern: Financial timing detected (3 rejections)
- Calibration: Financial confidence 0.90 → 0.85

### 2026-01-24
- Acceptance: WithdrawModal (Financial)
- Acceptance: DeleteButton (Destructive)
```

## Manual Calibration

```
/wyrd calibrate
```

Output:
```
## Confidence Recalibration

Scanning rejections and taste entries...

### Changes

| Effect | Previous | New | Delta |
|--------|----------|-----|-------|
| Financial | 0.90 | 0.85 | -0.05 |
| Destructive | 0.90 | 0.85 | -0.05 |
| Standard | 0.85 | 0.95 | +0.10 |
| Local | 0.95 | 0.95 | +0.00 |

### Reasoning

**Financial (-0.05)**:
- 2 rejections in last 7 days (weight: 2.0)
- 1 Tier 2 taste match (+0.05)
- Net: -0.05

**Standard (+0.10)**:
- 0 rejections
- 2 Tier 2 taste matches (+0.10)
- Net: +0.10

Calibration complete. State saved to grimoires/rune/wyrd.md
```

## Stale Detection

```typescript
async function isCalibrationStale(): Promise<boolean> {
  const state = await readWyrdState();

  if (!state.lastCalibrated) return true;

  const hoursSinceCalibration =
    (Date.now() - state.lastCalibrated.getTime()) / (1000 * 60 * 60);

  return hoursSinceCalibration > 24;
}

// On session start
async function ensureFreshCalibration(): Promise<void> {
  if (await isCalibrationStale()) {
    console.log('Calibration stale. Running recalibration...');
    await recalibrate();
  }
}
```

## Integration Points

### With Hypothesis Generation

```typescript
async function generateHypothesis(description: string): Promise<Hypothesis> {
  // Ensure fresh calibration
  await ensureFreshCalibration();

  // Detect effect
  const effect = detectEffect(description);

  // Get calibrated confidence
  const calibration = await getCalibrationFor(effect);

  return {
    effect,
    physics: PHYSICS_TABLE[effect],
    confidence: calibration.finalConfidence,
    calibrationAge: daysSince(calibration.lastCalibrated)
  };
}
```

### With Rejection Logging

```typescript
async function logRejection(rejection: Rejection): Promise<void> {
  // Log to rejections.md
  await appendRejection(rejection);

  // Trigger immediate recalibration for affected effect
  await recalibrateEffect(rejection.hypothesis.effect);

  // Check for pattern
  await checkPatternDetection(rejection.hypothesis.effect);
}
```

### With Pattern Detection

```typescript
async function onPatternDetected(pattern: Pattern): Promise<void> {
  // Full recalibration after pattern
  await recalibrate();

  // Log to NOTES.md
  await logToNotes({
    type: 'pattern_detected',
    pattern,
    newCalibration: await getCalibrationFor(pattern.effect)
  });
}
```
