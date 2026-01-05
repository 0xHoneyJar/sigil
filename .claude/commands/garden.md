---
name: garden
version: "0.5.0"
description: Manage design entropy through drift detection and mutation review
agent: gardening-entropy
agent_path: .claude/skills/gardening-entropy/SKILL.md
preflight:
  - sigil_setup_complete
---

# /garden

Manage design entropy: detect drift, review mutations, manage era transitions.

## Usage

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

## The Entropy Model

Entropy accumulates:
- **Mutations** pile up in `memory/mutations/active/`
- **Decisions** become stale (cooldowns expire, approvals orphaned)
- **Rulings** need periodic review (>90 days)
- **Essence** drifts from implementation

## What Gets Detected

### Drift Detection

| Type | Description | Action |
|------|-------------|--------|
| SOUL_DRIFT | Implementation drifting from soul statement | REVIEW |
| INVARIANT_DRIFT | Implementation may violate invariant | REVIEW |
| ANTI_PATTERN_CREEP | Anti-pattern detected in codebase | WARN |

### Mutation Status

| Status | Description | Action |
|--------|-------------|--------|
| STALE | Mutation older than 30 days | Promote or archive |
| CONFLICTING | Mutation conflicts with another | Resolve |
| HEALTHY | Recent mutation, no issues | None |

### Decision Status

| Status | Description | Action |
|--------|-------------|--------|
| COOLDOWN_EXPIRED | Rejected concept can be revisited | Reconsider |
| ORPHANED_APPROVAL | Approved 6+ months ago, not implemented | Archive or implement |

### Ruling Status

| Status | Description | Action |
|--------|-------------|--------|
| OLD | Ruling older than 90 days | Review or revoke |
| OBSOLETE | File no longer needs override | Revoke |

## Era Transitions

Era transitions happen when:
1. Soul statement changes significantly
2. Multiple invariants are updated (≥3)
3. Major anti-pattern list revision (≥5)

When 2+ signals detected, era transition is recommended.

## Examples

### Status Check

```
/garden

Drift: 0 soul, 1 invariant, 2 anti-pattern
Mutations: 3 stale, 1 conflicting, 3 healthy
Decisions: 1 cooldown expired, 2 orphaned
Rulings: 2 old, 1 obsolete
Era: STABLE
```

### Promote Mutation

```
/garden promote MUT-2026-001

Promoting: Button hover shadow
This will record as canonical pattern.
```

### Archive Mutation

```
/garden archive MUT-2026-003

Archiving: Modal backdrop blur
Reason: Superseded by MUT-2026-004
```

## Outputs

| Path | Description |
|------|-------------|
| `sigil-mark/memory/eras/*.yaml` | Era snapshots |
| `sigil-mark/memory/graveyard/*.yaml` | Archived items |

## Next Step

After `/garden`:
- `/approve --revoke` for obsolete rulings
- `/craft` to address drift
- `/codify` to update materials
