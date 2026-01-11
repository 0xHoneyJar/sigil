# Skill: Gardening Entropy

> "Design systems decay without maintenance."

## Purpose

Detect drift, stale decisions, and mutation outcomes.

## Scans

### 🌿 Healthy

Components that:
- Match zone physics
- Within all budgets
- Aligned with material

### 🍂 Stale

Decisions not matched in 6+ months:
- Era-versioned decisions with no recent hits
- May need review, confirmation, or archival

### 🌪️ Drift

Components that have drifted:
- Material physics mismatch
- Tension values outside range
- Styles not matching material

### 🧪 Mutations

Active experiments:
- Status (dogfooding, testing, expired)
- Metrics vs success criteria
- Ready for decision (promote/reject/extend)

## Workflow

### Full Scan

```
/garden

🌿 HEALTHY: 12 components
🍂 STALE: 2 decisions
🌪️ DRIFT: 3 components
🧪 MUTATIONS: 1 active

[Details]
```

### Stale Review

```
/garden --stale

STALE DECISIONS (not matched in 6mo):

1. loading-states.yaml
   Last match: 2025-07-15
   Action: [Review] [Archive]

2. icon-style.yaml
   Last match: 2025-06-01
   Action: [Review] [Archive]
```

### Drift Detection

```
/garden --drift

DRIFT DETECTED:

1. ClaimButton.tsx
   Zone: critical (expects clay)
   Found: spring(200, 8) — too light for clay
   Expected: spring(120, 14)
   [Fix automatically] [Ignore]
```

### Mutation Status

```
/garden --mutations

ACTIVE MUTATIONS:

1. bouncy-claim-button
   Status: Dogfooding (expires in 3 days)
   Metrics:
     - Completion: 94% → 95% ✓
     - Trust score: 4.2 → 4.1 (slight dip)
   
   [Promote] [Reject] [Extend]
```

## Graveyard

Failed experiments are moved to graveyard:
- Preserved as training data
- Lesson documented
- Never repeated without era change
