---
zones:
  state:
    paths:
      - sigil-mark/consultation-chamber/decisions/
      - sigil-mark/consultation-chamber/config.yaml
    permission: read-write
  config:
    paths:
      - .sigilrc.yaml
    permission: read
---

# Locking Decisions

## Purpose

Lock a decision after an outcome has been recorded. Locked decisions cannot be easily changed and serve as a barrier against endless debates.

## Philosophy

> "Direction was consulted. Decision was made."

Locking prevents:
- Endless re-litigation of decided issues
- Design-by-committee paralysis
- Scope creep through perpetual "improvements"

## Pre-Flight Checks

1. **Decision Exists**: Verify decision file exists
2. **Outcome Recorded**: Verify outcome has been set
3. **Not Already Locked**: Check lock status

## Workflow

### Step 1: Load Decision

```bash
decision_file="sigil-mark/consultation-chamber/decisions/${decision_id}.yaml"
```

### Step 2: Verify Outcome

The decision must have an outcome before locking:

```yaml
outcome:
  decision: "green"  # Must not be null
  decided_by: "Design Lead"
  decided_at: "2026-01-09T12:00:00Z"
```

If outcome is null, refuse to lock:

```
⚠️ Cannot lock decision without outcome.

Record the outcome first:
/consult {decision_id} --record-outcome
```

### Step 3: Calculate Lock Duration

Load duration from config based on decision scope:

```yaml
# sigil-mark/consultation-chamber/config.yaml
lock_durations:
  strategic: 180  # 6 months
  direction: 90   # 3 months
  execution: 30   # 1 month
```

Or use provided `lock_duration_days` if specified.

### Step 4: Update Decision Record

```yaml
lock:
  locked: true
  locked_at: "{current ISO-8601 timestamp}"
  unlock_date: "{calculated unlock date}"
  message: |
    Direction was consulted. Decision was made.
    {Layer-specific message}
```

### Step 5: Confirm

```
🔒 DECISION LOCKED

Decision: {id}
Outcome: {outcome}
Locked at: {locked_at}
Unlock date: {unlock_date}

This decision is now protected. Any attempt to modify related
code will trigger warnings/blocks based on strictness level.

To unlock early (requires Taste Owner approval):
/unlock {decision_id}
```

## Lock Messages by Layer

### Strategic Lock

```
Community was polled. The majority decided.
This decision reflects collective input and is protected
for {duration} days to ensure stability.
```

### Direction Lock

```
Direction was consulted. Sentiment was gathered.
The Taste Owner made the final call.
Execution details are now Taste Owner decisions.
```

### Execution Lock

```
Taste Owner decision made.
No community consultation was needed for this detail.
The decision stands for {duration} days.
```

## Error Handling

| Situation | Response |
|-----------|----------|
| Decision not found | "Decision {id} not found." |
| No outcome | "Cannot lock without outcome. Record outcome first." |
| Already locked | "Decision is already locked. Unlock first to modify." |
| Invalid duration | Use default duration for scope |

## Integration Points

### Called By

- `/consult` — After recording outcome
- Automatic — When Taste Owner confirms execution decision

### Affects

- `/craft` — Will warn/block when touching locked decisions
- `check-decision.sh` — Returns lock status
