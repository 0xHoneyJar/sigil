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

# Unlocking Decisions

## Purpose

Unlock a decision early, before its natural unlock date. Requires Taste Owner approval and reason documentation.

## Philosophy

> "Locks protect against endless debates, not against genuine reconsideration."

Early unlock is an escape hatch for when:
- New information fundamentally changes the context
- The decision is causing clear harm
- External requirements mandate a change

## Pre-Flight Checks

1. **Decision Exists**: Verify decision file exists
2. **Currently Locked**: Check that decision is locked
3. **Not Expired**: If unlock date has passed, no unlock needed

## Workflow

### Step 1: Load Decision

```bash
decision_file="sigil-mark/consultation-chamber/decisions/${decision_id}.yaml"
```

### Step 2: Verify Lock Status

The decision must currently be locked:

```yaml
lock:
  locked: true
  locked_at: "2026-01-09T12:00:00Z"
  unlock_date: "2026-04-09T12:00:00Z"
```

If not locked, inform user:

```
ℹ️ Decision is not locked.

Decision {id} is currently unlocked and can be modified freely.
```

### Step 3: Check Natural Unlock

If unlock date has already passed:

```
ℹ️ Decision has naturally unlocked.

Decision {id} unlock date ({unlock_date}) has passed.
The decision can now be reconsidered through normal /consult process.
```

### Step 4: Require Approval

Early unlock requires explicit Taste Owner approval:

```
question: "Who is approving this early unlock?"
header: "Approver"
```

```
question: "Why is early unlock necessary?"
header: "Reason"
options:
  - label: "New information"
    description: "Context has fundamentally changed"
  - label: "Causing harm"
    description: "The decision is causing clear problems"
  - label: "External requirement"
    description: "Regulatory, legal, or partner mandate"
  - label: "Other"
    description: "Provide custom reason"
multiSelect: false
```

### Step 5: Update Decision Record

```yaml
lock:
  locked: false
  locked_at: "{original lock timestamp}"
  unlock_date: "{original unlock date}"
  unlocked_early: true
  unlocked_at: "{current ISO-8601 timestamp}"
  unlocked_by: "{approved_by}"
  unlock_reason: "{reason}"
  message: |
    Decision unlocked early.
    Original lock: {locked_at} to {unlock_date}
    Reason: {reason}
```

### Step 6: Confirm

```
🔓 DECISION UNLOCKED

Decision: {id}
Original Outcome: {outcome}
Unlocked by: {approved_by}
Reason: {reason}

This decision is now open for reconsideration.
To start a new consultation: /consult "{topic}"

Note: A record of the early unlock has been preserved
in the decision file for accountability.
```

## Accountability Trail

Early unlocks are tracked for transparency:

```yaml
unlock_history:
  - action: "locked"
    at: "2026-01-09T12:00:00Z"
    by: "/consult"
  - action: "unlocked_early"
    at: "2026-02-15T10:30:00Z"
    by: "Design Lead"
    reason: "New accessibility requirements"
```

## Error Handling

| Situation | Response |
|-----------|----------|
| Decision not found | "Decision {id} not found." |
| Not locked | "Decision is not currently locked." |
| Already expired | "Decision has naturally unlocked. No early unlock needed." |
| Missing approver | "Early unlock requires Taste Owner approval." |
| Missing reason | "Early unlock requires documented reason." |

## Integration Points

### Called By

- Manual invocation via `/unlock {decision_id}`
- `/consult` when trying to modify locked decision

### Affects

- `/craft` — Will no longer warn about this decision
- Future `/consult` — Can now start new consultation on topic

## Philosophy Notes

Early unlock should be rare. If you're unlocking frequently:
- Lock durations may be set too long
- Decisions may be made without enough information
- Consider using Direction layer instead of Strategic

The goal is to protect against endless debates while allowing genuine reconsideration when warranted.
