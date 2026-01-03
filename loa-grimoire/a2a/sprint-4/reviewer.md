# Sprint 4 Implementation Report: Consultation Chamber

## Summary

Implemented the Consultation Chamber pillar with three-tier decision authority (strategic/direction/execution) and decision locking system.

## Deliverables

### 1. `/consult` Command and Skill

**Files Created:**
- `.claude/commands/consult.md` - Command frontmatter with pre-flight checks
- `.claude/skills/consulting-decisions/index.yaml` - Skill metadata
- `.claude/skills/consulting-decisions/SKILL.md` - Full workflow documentation

**Features:**
- Three-tier decision layers:
  - **Strategic**: Community poll with binding vote
  - **Direction**: Sentiment gathering, Taste Owner decides
  - **Execution**: No consultation, Taste Owner dictates
- Decision ID generation: `DEC-{YYYY}-{NNN}`
- Decision record creation in `sigil-mark/consultation-chamber/decisions/`
- Output formats for each layer (poll, comparison, execution notice)
- Record outcome workflow with `--record-outcome` flag

### 2. Decision Lock System

**Files Created:**
- `.claude/skills/locking-decisions/index.yaml` - Internal skill metadata
- `.claude/skills/locking-decisions/SKILL.md` - Lock workflow

**Features:**
- Locks decisions after outcome is recorded
- Configurable lock durations by scope:
  - Strategic: 180 days
  - Direction: 90 days
  - Execution: 30 days
- Lock message with scope-specific messaging
- Prevents modification until unlock date

### 3. Decision Unlock System

**Files Created:**
- `.claude/skills/unlocking-decisions/index.yaml` - Internal skill metadata
- `.claude/skills/unlocking-decisions/SKILL.md` - Unlock workflow

**Features:**
- Early unlock with Taste Owner approval
- Requires documented reason:
  - New information
  - Causing harm
  - External requirement
- Accountability trail with unlock history
- Natural unlock detection (when date passes)

### 4. `check-decision.sh` Helper

**File Created:**
- `.claude/scripts/check-decision.sh`

**Features:**
- Returns JSON with lock status and decision details
- Handles decision ID or full path input
- Detects natural unlock (when date has passed)
- Uses yq with grep fallback
- Returns status: locked/unlocked/pending/decided/unlockable/not_found

### 5. `/craft` Update (v3.2.0)

**Files Modified:**
- `.claude/commands/craft.md` - Updated to v3.2.0
- `.claude/skills/crafting-guidance/SKILL.md` - Updated to v3.2

**Changes:**
- Added locked decisions to context loading
- Added decision lock detection workflow
- Added "Locked Decision" to response matrix:
  - discovery: FYI
  - guiding: WARN
  - enforcing: WARN
  - strict: BLOCK
- Added locked decision message format
- Added locked decisions to general guidance output
- Added decision checking to zone-specific guidance

## Acceptance Criteria Verification

| Criterion | Status | Evidence |
|-----------|--------|----------|
| `/consult` routes to appropriate tier | PASS | SKILL.md Step 2 has layer detection with clarifying questions |
| Strategic creates poll format | PASS | SKILL.md Step 3 Strategic Layer section |
| Direction creates comparison format | PASS | SKILL.md Step 3 Direction Layer section |
| Execution informs Taste Owner decision | PASS | SKILL.md Step 3 Execution Layer section |
| Decisions lock after outcome | PASS | locking-decisions SKILL.md workflow |
| Lock duration configurable by scope | PASS | Lock durations in config.yaml, SKILL.md Step 3 |
| Early unlock requires approval | PASS | unlocking-decisions SKILL.md Step 4 |
| `/craft` respects locked decisions | PASS | crafting-guidance SKILL.md updated with decision checks |

## Files Changed

```
.claude/commands/consult.md                    [NEW]
.claude/skills/consulting-decisions/index.yaml [NEW]
.claude/skills/consulting-decisions/SKILL.md   [NEW]
.claude/scripts/check-decision.sh              [NEW]
.claude/skills/locking-decisions/index.yaml    [NEW]
.claude/skills/locking-decisions/SKILL.md      [NEW]
.claude/skills/unlocking-decisions/index.yaml  [NEW]
.claude/skills/unlocking-decisions/SKILL.md    [NEW]
.claude/commands/craft.md                      [MODIFIED]
.claude/skills/crafting-guidance/SKILL.md      [MODIFIED]
```

## Architecture Notes

The Consultation Chamber follows the constitutional design philosophy:

1. **Three-Tier Authority**: Not every decision needs community input
2. **Lock Protection**: Prevents endless debates and scope creep
3. **Escape Hatches**: Early unlock available with documentation
4. **Integration**: `/craft` respects locks without blocking

## Next Steps

Sprint 5 (Proving Grounds) will implement:
- Recipe validation
- Pattern migration detection
- Continuous validation hooks
