# Skill: Approving Patterns

> "The Taste Key holder creates, not approves."

## Purpose

Record Taste Key rulings on patterns and budget overrides.

## Philosophy

```
"Quality doesn't come from committees...
 it comes from individuals with taste."
 — Karri Saarinen (Linear)
```

The Taste Key holder makes decisions alone.
There is no vote. There is no consensus-building.

## Workflow

### Submit for Ruling

```
/approve ClaimButton

SUBMITTING FOR TASTE KEY RULING

Component: ClaimButton.tsx
Zone: critical
Material: clay

Current implementation:
- Spring: 120/14
- Pending state: visible
- XP drop: on success

Awaiting @username ruling...
```

### Record Ruling

```yaml
ruling:
  id: "2026-01-05-claim-button"
  date: "2026-01-05"
  taste_key: "@username"
  
  subject:
    component: "ClaimButton"
    zone: "critical"
    
  decision: "approved"
  
  reasoning: |
    Correctly implements clay material physics.
    Heavy spring (120/14), deliberate timing.
    Server-confirmed state changes.
    XP drop on success creates earned feel.
```

### Budget Override

```
/approve ClaimButton --override

BUDGET OVERRIDE REQUEST

Component: ClaimButton.tsx
Violation: cognitive_elements
Current: 8
Budget: 5

To override, Taste Key must provide justification:

> The checkout flow requires showing all shipping options.
> User research shows this doesn't cause confusion because
> options are logically grouped.

OVERRIDE RECORDED
```

### Search Memory

```
/approve --memory "loading"

PAST DECISIONS MATCHING "loading":

1. loading-states (Era 2)
   Ruling: "Text pending, not skeleton, in critical zone"
   
2. skeleton-experiment (Graveyard)
   Failed: Users confused skeleton with content loading
   
3. optimistic-balance (Era 2)
   Ruling: "Optimistic OK in transactional, never critical"
   
[View full] [Apply to current]
```

## Outputs

Rulings saved to `sigil-mark/taste-key/rulings/`
