# Sprint Plan: Improved Hammer Detection

```
    +===============================================+
    |  EXP-002 → PRD → SDD → SPRINT                |
    |  Improved Hammer Detection                    |
    |                                               |
    |  Sprint 1 of 1                               |
    +===============================================+
```

**Created**: 2026-01-19
**Status**: Implementation Complete
**PRD**: [prd-hammer-detection.md](./prd-hammer-detection.md)
**SDD**: [sdd-hammer-detection.md](./sdd-hammer-detection.md)
**Experiment**: [EXP-002](../sigil/experiments/EXP-002-hammer-detection.md)

---

## Sprint Overview

| Attribute | Value |
|-----------|-------|
| Sprint Duration | 1 session |
| Total Tasks | 6 |
| P0 Tasks | 5 |
| P1 Tasks | 1 |
| Target File | `.claude/commands/craft.md` |
| Scope | Single file modification |

### Sprint Goal

Implement improved Hammer detection for framework changes by:
1. Adding a PRD existence check (Step 0.4)
2. Enhancing Hammer signals with framework/grimoire/multi-file patterns
3. Validating backward compatibility

---

## Task Breakdown

### Task 1: Add Step 0.4 — PRD Existence Check

**ID**: HAMMER-001
**Priority**: P0
**Effort**: Medium
**Dependencies**: None

**Description**:
Insert a new Step 0.4 before the existing Step 0.5 (Mode Detection) that checks for recent PRD files and prompts the user to continue the Loa flow.

**Location**: After `</step_0>` (line ~332), before `<step_0_5>` (line ~334)

**Implementation**:
```markdown
<step_0_4>
### Step 0.4: PRD Existence Check

Before mode detection, check if a recent PRD exists that should continue through the Loa flow.

**Check for recent PRD:**
```
Glob: grimoires/loa/prd*.md
For each file found:
  - Parse first H1 heading as title
  - Check file modification time (recent = < 24h)
```

**If recent PRD found:**
```
┌─ PRD Detected ────────────────────────────────────────────┐
│                                                           │
│  Found: {filename} ({age})                                │
│  Topic: {title from first H1}                             │
│                                                           │
│  Options:                                                 │
│  1. Continue to /architect → Design (SDD)                 │
│  2. Implement directly (skip architecture)                │
│  3. Start fresh (ignore existing PRD)                     │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**Routing:**
- Option 1: Invoke `Skill tool` with `skill: "architect"`
- Option 2: Skip to Step 1 (context discovery, Chisel path)
- Option 3: Continue to Step 0.5 (mode detection)

**If no recent PRD:**
- Continue to Step 0.5 (mode detection)
</step_0_4>
```

**Acceptance Criteria**:
- [ ] Step 0.4 section added to craft.md
- [ ] Globs `grimoires/loa/prd*.md` for PRD files
- [ ] Checks modification time (24h threshold)
- [ ] Shows prompt with 3 options when PRD found
- [ ] Option 1 correctly invokes /architect skill
- [ ] Option 2 skips to Chisel path
- [ ] Option 3 continues to mode detection
- [ ] No prompt shown when no recent PRD exists

---

### Task 2: Add Framework Refs to Hammer Signals

**ID**: HAMMER-002
**Priority**: P0
**Effort**: Low
**Dependencies**: None (can run parallel with HAMMER-003, HAMMER-004)

**Description**:
Add a new row to the Hammer signals table in Step 0.5 for framework-related keywords.

**Location**: Step 0.5, Hammer signals table (line ~382-389)

**Implementation**:
Add this row to the table:
```markdown
| Framework refs | `/\b(command|skill|workflow|integration|protocol|rule)\b/i` |
```

**Acceptance Criteria**:
- [ ] Framework refs row added to Hammer signals table
- [ ] Pattern matches: command, skill, workflow, integration, protocol, rule
- [ ] Case-insensitive regex
- [ ] Each match adds +1 to Hammer score

---

### Task 3: Add Grimoire Refs to Hammer Signals

**ID**: HAMMER-003
**Priority**: P0
**Effort**: Low
**Dependencies**: None (can run parallel with HAMMER-002, HAMMER-004)

**Description**:
Add a new row to the Hammer signals table for grimoire-related keywords.

**Location**: Step 0.5, Hammer signals table (line ~382-389)

**Implementation**:
Add this row to the table:
```markdown
| Grimoire refs | `/\b(grimoire|experiments|observations|taste|moodboard)\b/i` |
```

**Acceptance Criteria**:
- [ ] Grimoire refs row added to Hammer signals table
- [ ] Pattern matches: grimoire, experiments, observations, taste, moodboard
- [ ] Case-insensitive regex
- [ ] Each match adds +1 to Hammer score

---

### Task 4: Add Multi-file Hints to Hammer Signals

**ID**: HAMMER-004
**Priority**: P0
**Effort**: Low
**Dependencies**: None (can run parallel with HAMMER-002, HAMMER-003)

**Description**:
Add a new row to the Hammer signals table for multi-file/system-wide change hints.

**Location**: Step 0.5, Hammer signals table (line ~382-389)

**Implementation**:
Add this row to the table:
```markdown
| Multi-file hints | "structure", "across", "throughout", "system-wide" |
```

**Acceptance Criteria**:
- [ ] Multi-file hints row added to Hammer signals table
- [ ] Pattern matches: structure, across, throughout, system-wide
- [ ] Each match adds +1 to Hammer score

---

### Task 5: Add Experiment PRD Check (P1)

**ID**: HAMMER-005
**Priority**: P1
**Effort**: Low
**Dependencies**: HAMMER-001 (conceptually, but can implement independently)

**Description**:
Enhance Step 1a-exp to check if an experiment has a linked PRD and whether a corresponding SDD exists.

**Location**: Step 1a-exp (approximately line ~1154-1172)

**Implementation**:
Update existing experiment context check:
```markdown
**1a-exp. Check for experiment context** (if `--experiment` flag provided):
Read grimoires/sigil/experiments/{experiment-id}.md
Extract:
- Hypothesis, Observations, Success criteria, What we're changing
- **PRD reference** (if exists in References section)

**If experiment has PRD reference:**
Check if corresponding SDD exists (e.g., sdd-{name}.md)
If no SDD:
  Suggest: "This experiment has a PRD but no SDD. Run /architect first?"
```

**Acceptance Criteria**:
- [ ] Experiment parsing includes PRD reference check
- [ ] SDD existence check when PRD reference found
- [ ] Suggestion displayed when PRD exists but SDD missing
- [ ] User can override and proceed without SDD

---

### Task 6: Validate All Test Scenarios

**ID**: HAMMER-006
**Priority**: P0
**Effort**: Medium
**Dependencies**: HAMMER-001, HAMMER-002, HAMMER-003, HAMMER-004

**Description**:
Manually validate all test cases from the SDD to ensure correct behavior.

**Test Cases — PRD Detection**:

| Test | Setup | Input | Expected |
|------|-------|-------|----------|
| Recent PRD exists | prd-foo.md (1h old) | `/craft "anything"` | Show PRD prompt |
| Old PRD exists | prd-foo.md (3 days old) | `/craft "anything"` | Skip to mode detection |
| No PRD exists | No prd*.md files | `/craft "anything"` | Skip to mode detection |
| User selects option 1 | PRD prompt shown | "1" | Invoke /architect |
| User selects option 2 | PRD prompt shown | "2" | Skip to Chisel |
| User selects option 3 | PRD prompt shown | "3" | Continue to mode detection |

**Test Cases — Hammer Detection**:

| Test | Input | Expected Score | Expected Mode |
|------|-------|----------------|---------------|
| Framework single | "add skill" | 1 | CHISEL |
| Framework double | "add skill integration" | 2 | HAMMER |
| Grimoire ref | "update experiments" | 1 | CHISEL |
| Grimoire + structure | "create experiments structure" | 3 | HAMMER |
| Mixed framework + chisel | "improve skill button" | -1 | CHISEL |
| Web3 unchanged | "build rewards feature" | 2 | HAMMER |
| UI unchanged | "polish hover states" | -2 | CHISEL |

**Test Cases — Backward Compatibility**:

| Test | Input | Current | New | Pass? |
|------|-------|---------|-----|-------|
| Web3 Hammer | "build rewards feature" | HAMMER | HAMMER | ✓ |
| UI Chisel | "improve button animation" | CHISEL | CHISEL | ✓ |
| Debug mode | "fix the broken build" | DEBUG | DEBUG | ✓ |
| Explore mode | "how does auth work?" | EXPLORE | EXPLORE | ✓ |
| Override flag | `/craft --chisel "add skill"` | CHISEL | CHISEL | ✓ |

**Acceptance Criteria**:
- [ ] All PRD detection tests pass
- [ ] All Hammer detection tests pass
- [ ] All backward compatibility tests pass
- [ ] No regressions in existing behavior

---

## Implementation Order

```
HAMMER-002 ─┬─→ HAMMER-006 (validation)
HAMMER-003 ─┤
HAMMER-004 ─┘

HAMMER-001 ─────→ HAMMER-006 (validation)

HAMMER-005 (P1, can defer)
```

**Recommended sequence**:
1. Start with HAMMER-002, HAMMER-003, HAMMER-004 in parallel (low effort, immediate value)
2. Implement HAMMER-001 (medium effort, core feature)
3. Run HAMMER-006 validation
4. Implement HAMMER-005 if time permits (P1)

---

## Definition of Done

- [x] All P0 tasks completed
- [x] All test cases in HAMMER-006 pass
- [x] No regressions in existing /craft behavior
- [ ] Changes committed to develop branch
- [x] EXP-002 status updated to reflect implementation complete

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| False positives (over-triggering Hammer) | Medium | Low | User can override with `--chisel` |
| PRD check adds latency | Low | Low | File existence check is O(1) |
| Old PRD triggers unwanted prompt | Low | Low | 24h threshold filters old PRDs |

---

## Post-Sprint

After implementation:
1. Update EXP-002 status to implementation complete
2. Monitor for false positives over 2-week evaluation period
3. Gather feedback on PRD detection prompt
4. Conclude experiment with marry/kiss/kill decision

---

*Sprint plan ready for implementation. Next: `/implement` or directly apply changes.*
