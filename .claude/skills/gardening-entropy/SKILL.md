# Sigil v1.0 Agent: Gardening Entropy

> "Entropy accumulates. Gardens must be tended."

## Role

**Entropy Gardener** — Detects drift from essence, reviews active mutations, promotes to canon or graveyard, flags stale decisions, and manages era transitions.

## Command

```
/garden                    # Show entropy status
/garden drift              # Detect drift from essence
/garden mutations          # Review active mutations
/garden decisions          # Review stale decisions
/garden rulings            # Review active rulings
/garden era                # Check for era transition
/garden promote [id]       # Promote mutation to canon
/garden archive [id]       # Move to graveyard
```

## Outputs

| Path | Description |
|------|-------------|
| `sigil-mark/memory/eras/*.yaml` | Era transition records |
| `sigil-mark/memory/graveyard/*.yaml` | Archived mutations/decisions |

## Prerequisites

- Run `mount-sigil.sh` first (creates sigil-mark/)
- Run `/envision` first (for essence context)

## The Entropy Model

Entropy accumulates in design systems:
- Mutations pile up in active/
- Decisions become stale
- Rulings need periodic review
- Essence drifts from implementation

Without gardening, the system becomes:
- Inconsistent (mutations conflict)
- Stale (decisions never revisited)
- Cluttered (graveyard overflows)
- Misaligned (essence drift)

## Workflow

### Phase 1: Load Context

Read the following files:
- `sigil-mark/resonance/essence.yaml` — Product soul
- `sigil-mark/memory/mutations/active/*.yaml` — Active mutations
- `sigil-mark/memory/decisions/*.yaml` — Concept decisions
- `sigil-mark/taste-key/rulings/*.yaml` — Active rulings

### Phase 2: Detect Drift

```python
def detect_drift(essence, implementation):
    drift_items = []

    # Check soul alignment
    soul = essence.soul.statement
    if not implementation_aligns(implementation, soul):
        drift_items.append({
            "type": "SOUL_DRIFT",
            "message": "Implementation drifting from soul statement",
            "action": "REVIEW"
        })

    # Check invariant violations
    for invariant in essence.soul.invariants:
        if not check_invariant(implementation, invariant):
            drift_items.append({
                "type": "INVARIANT_DRIFT",
                "invariant": invariant,
                "message": f"Implementation may violate: {invariant}",
                "action": "REVIEW"
            })

    # Check anti-pattern creep
    for anti_pattern in essence.anti_patterns:
        if pattern_present(implementation, anti_pattern):
            drift_items.append({
                "type": "ANTI_PATTERN_CREEP",
                "pattern": anti_pattern.pattern,
                "message": f"Anti-pattern detected: {anti_pattern.pattern}",
                "action": "WARN"
            })

    return drift_items
```

### Phase 3: Review Mutations

```python
def review_mutations(mutations):
    review_items = []
    now = current_date()

    for mutation in mutations:
        age_days = (now - mutation.created_at).days

        # Check for stale mutations
        if age_days > 30:
            review_items.append({
                "id": mutation.id,
                "type": "STALE_MUTATION",
                "age_days": age_days,
                "message": "Mutation older than 30 days",
                "action": "PROMOTE_OR_ARCHIVE",
                "suggestion": "Decide: promote to canon or archive"
            })

        # Check for conflicting mutations
        conflicts = find_conflicts(mutation, mutations)
        if conflicts:
            review_items.append({
                "id": mutation.id,
                "type": "CONFLICT",
                "conflicts_with": [c.id for c in conflicts],
                "message": "Mutation conflicts with others",
                "action": "RESOLVE"
            })

    return review_items
```

### Phase 4: Review Decisions

```python
def review_decisions(decisions):
    review_items = []
    now = current_date()

    for decision in decisions:
        # Check cooldown status for rejections
        if decision.status == "REJECTED":
            if decision.cooldown.ends < now:
                review_items.append({
                    "id": decision.id,
                    "type": "COOLDOWN_EXPIRED",
                    "concept": decision.concept.name,
                    "message": "Cooldown expired, can revisit",
                    "action": "RECONSIDER"
                })

        # Check for orphaned approvals
        if decision.status == "APPROVED":
            age_days = (now - decision.approval.date).days
            if age_days > 180 and not decision.implemented:
                review_items.append({
                    "id": decision.id,
                    "type": "ORPHANED_APPROVAL",
                    "concept": decision.concept.name,
                    "message": "Approved 6+ months ago, not implemented",
                    "action": "ARCHIVE_OR_IMPLEMENT"
                })

    return review_items
```

### Phase 5: Review Rulings

```python
def review_rulings(rulings):
    review_items = []
    now = current_date()

    for ruling in rulings:
        age_days = (now - ruling.date).days

        # Check for old rulings
        if age_days > 90:
            review_items.append({
                "id": ruling.id,
                "type": "OLD_RULING",
                "age_days": age_days,
                "constraint": ruling.constraint,
                "message": "Ruling older than 90 days",
                "action": "REVIEW_OR_REVOKE"
            })

        # Check if ruling still needed
        if ruling.type == "fidelity_override":
            if not file_still_needs_override(ruling.scope.files):
                review_items.append({
                    "id": ruling.id,
                    "type": "OBSOLETE_RULING",
                    "message": "File no longer needs this override",
                    "action": "REVOKE"
                })

    return review_items
```

### Phase 6: Era Transition Detection

```python
def detect_era_transition(essence, history):
    # Era transitions happen when:
    # 1. Soul statement changes significantly
    # 2. Multiple invariants are updated
    # 3. Major anti-pattern list revision

    signals = []

    if essence.soul.statement != history.last_soul_statement:
        signals.append("soul_statement_changed")

    invariant_changes = count_invariant_changes(essence, history)
    if invariant_changes >= 3:
        signals.append("major_invariant_revision")

    anti_pattern_changes = count_anti_pattern_changes(essence, history)
    if anti_pattern_changes >= 5:
        signals.append("major_anti_pattern_revision")

    if len(signals) >= 2:
        return {
            "era_transition": True,
            "signals": signals,
            "message": "Era transition detected. Archive current state?",
            "action": "CREATE_ERA_SNAPSHOT"
        }

    return {"era_transition": False}
```

## Output Formats

### Status Report

```
/garden

ENTROPY STATUS
==============

Drift Detection:
  SOUL_DRIFT: 0 items
  INVARIANT_DRIFT: 1 item
  ANTI_PATTERN_CREEP: 2 items

Active Mutations: 7
  STALE (>30 days): 3
  CONFLICTING: 1
  HEALTHY: 3

Decisions:
  COOLDOWN_EXPIRED: 1 (can revisit)
  ORPHANED_APPROVAL: 2

Rulings:
  OLD (>90 days): 2
  OBSOLETE: 1

Era Status: STABLE (no transition signals)

Recommendations:
1. Review 3 stale mutations
2. Archive or implement 2 orphaned approvals
3. Revoke 1 obsolete ruling
```

### Drift Report

```
/garden drift

DRIFT DETECTION
===============

Checking against essence...

INVARIANT DRIFT:
⚠ "Meaningful rewards, not manipulation"
  Found: Achievement badge system in settings/
  This may conflict with invariant
  Action: REVIEW

ANTI-PATTERN CREEP:
⚠ "gamified productivity" detected
  Found: XP bar in user profile
  Source: src/features/profile/XPBar.tsx
  Action: WARN

⚠ "infinite scroll" detected
  Found: Virtualized list without end
  Source: src/features/feed/InfiniteList.tsx
  Action: WARN

Summary: 1 invariant drift, 2 anti-pattern warnings
```

### Mutation Review

```
/garden mutations

ACTIVE MUTATIONS
================

STALE MUTATIONS (>30 days):
  MUT-2026-001 (45 days)
    File: src/components/Button.tsx
    Change: Added hover shadow
    Suggestion: Promote to pattern or archive

  MUT-2026-002 (38 days)
    File: src/features/checkout/ClaimButton.tsx
    Change: Extended animation to 1200ms
    Suggestion: Already has ruling, promote to canon

  MUT-2026-003 (32 days)
    File: src/components/Modal.tsx
    Change: Updated backdrop blur
    Suggestion: Conflicts with MUT-2026-004

CONFLICTING:
  MUT-2026-003 ↔ MUT-2026-004
    Both modify Modal.tsx blur values
    Resolve with /garden promote or /garden archive

HEALTHY: 3 mutations (created within 30 days)
```

### Era Transition

```
/garden era

ERA STATUS
==========

Current Era: "Foundation" (started 2026-01-01)
Duration: 4 days

Era Transition Signals:
  ✗ Soul statement unchanged
  ✗ Invariants unchanged
  ✗ Anti-patterns unchanged

Status: STABLE

No era transition detected.

To manually trigger era transition:
/garden era --new "Era Name"
```

## Promotion and Archival

### Promote to Canon

```
/garden promote MUT-2026-001

PROMOTE TO CANON
================

Mutation: MUT-2026-001
File: src/components/Button.tsx
Change: Added hover shadow

This will:
1. Record mutation as canonical pattern
2. Update validation rules to expect this
3. Remove from active mutations

Confirm promotion? [y/n]
```

### Archive to Graveyard

```
/garden archive MUT-2026-003

ARCHIVE TO GRAVEYARD
====================

Mutation: MUT-2026-003
File: src/components/Modal.tsx
Change: Updated backdrop blur

This will:
1. Move mutation to graveyard
2. Record reason for archival
3. Keep for historical reference

Reason for archival:
> Superseded by MUT-2026-004

Confirm archival? [y/n]
```

## Era Record Format

```yaml
# sigil-mark/memory/eras/2026-01-foundation.yaml

era:
  name: "Foundation"
  started: "2026-01-01"
  ended: "2026-03-15"

  transition_reason: |
    Major product pivot from B2B to B2C.
    Soul statement updated to reflect consumer focus.

  snapshot:
    soul_statement: "Tools for professionals, not toys."
    invariants:
      - "Power over polish"
      - "Keyboard-first navigation"
    anti_patterns:
      - "Gamified productivity"
      - "Social features for vanity"

  statistics:
    mutations_promoted: 12
    mutations_archived: 5
    decisions_made: 8
    rulings_issued: 3
```

## Graveyard Record Format

```yaml
# sigil-mark/memory/graveyard/MUT-2026-003.yaml

archived:
  id: "MUT-2026-003"
  type: "mutation"
  archived_at: "2026-01-04"

  original:
    file: "src/components/Modal.tsx"
    change: "Updated backdrop blur to 24px"
    created_at: "2026-01-02"

  reason: "Superseded by MUT-2026-004 which uses 16px"

  archived_by: "Entropy Gardener"
```

## Success Criteria

- [ ] Drift from essence detected
- [ ] Active mutations reviewed
- [ ] Stale mutations flagged (>30 days)
- [ ] Conflicting mutations identified
- [ ] Cooldown-expired decisions flagged
- [ ] Orphaned approvals identified
- [ ] Old rulings flagged (>90 days)
- [ ] Obsolete rulings identified
- [ ] Era transition signals detected
- [ ] Promotion to canon works
- [ ] Archival to graveyard works

## Error Handling

| Situation | Response |
|-----------|----------|
| No essence.yaml | Prompt to run /envision |
| No active mutations | Report "no entropy" |
| Invalid mutation ID | List valid IDs |
| Era already exists | Append date to name |

## Next Step

After `/garden`:
- Promote good mutations to canon
- Archive obsolete mutations
- Revoke obsolete rulings via /approve --revoke
- Address drift via /craft or /codify
