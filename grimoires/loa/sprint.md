# Sprint Plan: Sigil v10.1 "Usage Reality"

**Version:** 10.1.0
**Status:** Sprint Plan Complete
**Date:** 2026-01-11
**PRD Reference:** grimoires/loa/prd.md
**SDD Reference:** grimoires/loa/sdd.md
**Supersedes:** v9.1.0 "Migration Debt Zero" Sprint Plan (completed)

---

## Overview

**Total Sprints:** 3
**Estimated Total Tasks:** 14
**Architecture:** Hooks-Based Skill Enhancement

**Sprint Structure:**
| Sprint | Focus | Tasks | Priority |
|--------|-------|-------|----------|
| Sprint 1 | Hooks Infrastructure | 5 | P0 |
| Sprint 2 | Helpers + Skill Enhancements | 5 | P0 |
| Sprint 3 | Context + Validation | 4 | P1 |

---

## Sprint 1: Hooks Infrastructure

**Goal:** Establish Claude Code hooks system to bridge library → skill gap

**Exit Criteria:**
- SessionStart hook injects physics context on conversation start
- PreToolUse hook validates Edit/Write operations
- Mason reads constitution.yaml before generating

### Task 1.1: Create Hooks Configuration

**ID:** S1-01
**Description:** Create `.claude/settings.local.json` with hooks configuration for SessionStart and PreToolUse events.

**Acceptance Criteria:**
- [x] File exists at `.claude/settings.local.json`
- [x] SessionStart hook configured to run `sigil-init.sh`
- [x] PreToolUse hook configured for Edit and Write tools
- [x] Timeouts set (5000ms for init, 3000ms for validation)

**File:** `.claude/settings.local.json`
```json
{
  "hooks": {
    "SessionStart": [
      {
        "script": ".claude/scripts/sigil-init.sh",
        "timeout": 5000
      }
    ],
    "PreToolUse": {
      "Edit": [".claude/scripts/validate-physics.sh"],
      "Write": [".claude/scripts/validate-physics.sh"]
    }
  }
}
```

**Dependencies:** None
**Testing:** Start new Claude session, verify hooks configuration loads

---

### Task 1.2: Create SessionStart Hook

**ID:** S1-02
**Description:** Create `sigil-init.sh` script that injects physics rules and authority thresholds into Claude's context at session start.

**Acceptance Criteria:**
- [x] Script exists at `.claude/scripts/sigil-init.sh`
- [x] Script is executable (`chmod +x`)
- [x] Outputs constitution.yaml content
- [x] Outputs authority.yaml content
- [x] Outputs accumulated context from `.context/` if exists
- [x] Handles missing files gracefully with warnings

**File:** `.claude/scripts/sigil-init.sh`

**Dependencies:** S1-01
**Testing:** Run manually, verify output includes physics rules

---

### Task 1.3: Create PreToolUse Validation Hook

**ID:** S1-03
**Description:** Create `validate-physics.sh` script that validates generated code matches physics constraints before Edit/Write operations.

**Acceptance Criteria:**
- [x] Script exists at `.claude/scripts/validate-physics.sh`
- [x] Script is executable
- [x] Checks financial mutations have confirmation flow
- [x] Checks mutations don't use snappy timing
- [x] Checks interactive components have motion/transition
- [x] Outputs warnings (not blocks) for violations
- [x] Skips non-component files (.ts, .md, etc.)

**File:** `.claude/scripts/validate-physics.sh`

**Dependencies:** S1-01
**Testing:** Run against sample component code, verify warnings appear

---

### Task 1.4: Update Mason Skill - Required Reading

**ID:** S1-04
**Description:** Add "Required Reading" section to Mason SKILL.md that instructs Claude to read physics configuration before generating components.

**Acceptance Criteria:**
- [x] SKILL.md contains "## Required Reading" section
- [x] Lists constitution.yaml as required reading
- [x] Lists authority.yaml as required reading
- [x] Lists physics.ts (lines 1-100) as required reading
- [x] Reading happens BEFORE any generation

**File:** `.claude/skills/mason/SKILL.md`

**Dependencies:** None
**Testing:** Run `/craft "test button"`, verify Claude reads config files first

---

### Task 1.5: Update Mason Skill - Physics Decision Tree

**ID:** S1-05
**Description:** Add "Physics Decision Tree" section to Mason SKILL.md with clear branching logic for determining physics based on effect type.

**Acceptance Criteria:**
- [x] SKILL.md contains "## Physics Decision Tree" section
- [x] Covers mutation vs query vs local_state branching
- [x] Covers financial vs non-financial mutation branching
- [x] Shows correct physics for each path:
  - Financial mutation → server-tick (1200ms), confirmation
  - Non-financial mutation → deliberate (800ms)
  - Query → snappy (150ms)
  - Local state → smooth/instant (0ms)
- [x] Lists financial keywords: claim, deposit, withdraw, transfer, swap, burn

**File:** `.claude/skills/mason/SKILL.md`

**Dependencies:** S1-04
**Testing:** Run `/craft "claim button"`, verify 800ms pessimistic physics in output

---

## Sprint 2: Helpers + Skill Enhancements

**Goal:** Create bash helper scripts and enhance Gardener/Diagnostician skills

**Exit Criteria:**
- Helper scripts compute import counts and stability days
- `/garden` shows accurate authority tiers
- Diagnostician matches patterns without asking questions

### Task 2.1: Create count-imports.sh Helper

**ID:** S2-01
**Description:** Create bash script that counts how many files import a given component.

**Acceptance Criteria:**
- [x] Script exists at `.claude/scripts/count-imports.sh`
- [x] Script is executable
- [x] Takes component name as argument
- [x] Searches src/ for import statements
- [x] Handles .tsx, .ts, .jsx, .js files
- [x] Returns numeric count

**Usage:** `.claude/scripts/count-imports.sh Button`
**Output:** `15`

**Dependencies:** None
**Testing:** Run on known component, verify count matches manual grep

---

### Task 2.2: Create check-stability.sh Helper

**ID:** S2-02
**Description:** Create bash script that calculates days since last modification of a file.

**Acceptance Criteria:**
- [x] Script exists at `.claude/scripts/check-stability.sh`
- [x] Script is executable
- [x] Takes file path as argument
- [x] Uses git log to get last commit timestamp
- [x] Falls back to file stat if not in git
- [x] Returns numeric days

**Usage:** `.claude/scripts/check-stability.sh src/hooks/useMotion.ts`
**Output:** `14`

**Dependencies:** None
**Testing:** Modify a file, verify script returns 0 days

---

### Task 2.3: Create infer-authority.sh Helper

**ID:** S2-03
**Description:** Create bash script that combines import count and stability to infer authority tier.

**Acceptance Criteria:**
- [x] Script exists at `.claude/scripts/infer-authority.sh`
- [x] Script is executable
- [x] Takes file path as argument
- [x] Calls count-imports.sh and check-stability.sh
- [x] Applies thresholds from authority.yaml:
  - Gold: 10+ imports AND 14+ days stable
  - Silver: 5+ imports
  - Draft: everything else
- [x] Returns JSON with component, file, imports, stability_days, tier

**Usage:** `.claude/scripts/infer-authority.sh src/hooks/useMotion.ts`
**Output:**
```json
{
  "component": "useMotion",
  "file": "src/hooks/useMotion.ts",
  "imports": 12,
  "stability_days": 21,
  "tier": "gold"
}
```

**Dependencies:** S2-01, S2-02
**Testing:** Run on various components, verify tier assignments

---

### Task 2.4: Update Gardener Skill

**ID:** S2-04
**Description:** Add "Authority Computation" section to Gardener SKILL.md with instructions to use bash helper scripts.

**Acceptance Criteria:**
- [x] SKILL.md contains "## Authority Computation with Bash Helpers" section
- [x] Documents count-imports.sh usage
- [x] Documents check-stability.sh usage
- [x] Documents infer-authority.sh usage
- [x] Shows tier threshold table
- [x] Emphasizes: no file moves required

**File:** `.claude/skills/gardener/SKILL.md`

**Dependencies:** S2-01, S2-02, S2-03
**Testing:** Run `/garden`, verify accurate authority report

---

### Task 2.5: Update Diagnostician Skill

**ID:** S2-05
**Description:** Add "Required Reading" and enhanced "Pattern Matching" sections to Diagnostician SKILL.md.

**Acceptance Criteria:**
- [x] SKILL.md contains "## Required Reading" section
  - Lists `src/lib/sigil/diagnostician.ts` as required
- [x] Contains enhanced "## Pattern Categories with Keywords" table
- [x] Contains "## Never Ask" section (explicit list with alternatives)
- [x] Documents matching process:
  1. Extract keywords from error description
  2. Match against 9 pattern categories
  3. Return solutions ranked by confidence

**File:** `.claude/skills/diagnostician/SKILL.md`

**Dependencies:** None
**Testing:** Report "dialog jumping" error, verify pattern match without questions

---

## Sprint 3: Context + Validation

**Goal:** Enable invisible context accumulation and end-to-end validation

**Exit Criteria:**
- Context accumulates in `.context/` directory
- Full pipeline works: /craft → /garden → diagnostician
- Physics violations generate warnings

### Task 3.1: Initialize Context Directory

**ID:** S3-01
**Description:** Create the `.context/` directory structure with initial schema files.

**Acceptance Criteria:**
- [x] Directory exists at `grimoires/sigil/.context/`
- [x] Added to `.gitignore` (build artifact, machine-specific)
- [x] Contains empty `taste.json` with schema
- [x] Contains empty `persona.json` with schema
- [x] Contains empty `project.json` with schema
- [x] Contains empty `recent.json` (last 10 generations)

**Schema for taste.json:**
```json
{
  "version": "10.1",
  "preferences": {},
  "reinforcement": {
    "accepted": 0,
    "modified": 0,
    "rejected": 0
  }
}
```

**Dependencies:** None
**Testing:** Verify directory structure exists

---

### Task 3.2: Enhance sigil-init.sh for Context

**ID:** S3-02
**Description:** Update SessionStart hook to also inject accumulated context from `.context/` directory.

**Acceptance Criteria:**
- [x] sigil-init.sh reads and outputs taste.json if exists
- [x] sigil-init.sh reads and outputs recent.json if exists
- [x] Context section clearly labeled in output
- [x] Handles empty/missing context gracefully

**Dependencies:** S1-02, S3-01
**Testing:** Run with populated context, verify output

---

### Task 3.3: Create Validation Test Script

**ID:** S3-03
**Description:** Create a validation script that tests the full v10.1 pipeline.

**Acceptance Criteria:**
- [x] Script exists at `.claude/scripts/validate-v10.1.sh`
- [x] Checks all 6 library modules exist
- [x] Checks all 3 skill files exist
- [x] Checks constitution.yaml has effect_physics
- [x] Checks authority.yaml has tier thresholds
- [x] Checks useMotion.ts exists
- [x] Checks all helper scripts are executable
- [x] Outputs clear pass/fail for each check

**Dependencies:** All prior tasks
**Testing:** Run script, verify all checks pass

---

### Task 3.4: End-to-End Integration Test

**ID:** S3-04
**Description:** Manually test the complete workflow to verify all components work together.

**Acceptance Criteria:**
- [x] Test 1: `/craft "claim button"` generates with 800ms pessimistic physics
- [x] Test 2: `/craft "balance display"` generates with 150ms optimistic physics
- [x] Test 3: `/garden src/hooks/useMotion.ts` shows authority tier
- [x] Test 4: Report "dialog flickering" triggers Diagnostician pattern match
- [x] All tests pass without Claude asking configuration questions

**Dependencies:** All prior tasks
**Testing:** Manual execution of all 4 test cases

---

## Task Summary

| ID | Task | Sprint | Priority | Dependencies |
|----|------|--------|----------|--------------|
| S1-01 | Create Hooks Configuration | 1 | P0 | None |
| S1-02 | Create SessionStart Hook | 1 | P0 | S1-01 |
| S1-03 | Create PreToolUse Validation Hook | 1 | P0 | S1-01 |
| S1-04 | Update Mason - Required Reading | 1 | P0 | None |
| S1-05 | Update Mason - Physics Decision Tree | 1 | P0 | S1-04 |
| S2-01 | Create count-imports.sh | 2 | P0 | None |
| S2-02 | Create check-stability.sh | 2 | P0 | None |
| S2-03 | Create infer-authority.sh | 2 | P0 | S2-01, S2-02 |
| S2-04 | Update Gardener Skill | 2 | P0 | S2-01, S2-02, S2-03 |
| S2-05 | Update Diagnostician Skill | 2 | P0 | None |
| S3-01 | Initialize Context Directory | 3 | P1 | None |
| S3-02 | Enhance sigil-init.sh for Context | 3 | P1 | S1-02, S3-01 |
| S3-03 | Create Validation Test Script | 3 | P1 | All prior |
| S3-04 | End-to-End Integration Test | 3 | P1 | All prior |

---

## Dependency Graph

```
Sprint 1:
  S1-01 (hooks config) ─┬─► S1-02 (sigil-init.sh)
                        └─► S1-03 (validate-physics.sh)

  S1-04 (Mason Required Reading) ─► S1-05 (Mason Physics Tree)

Sprint 2:
  S2-01 (count-imports) ─┐
                         ├─► S2-03 (infer-authority)
  S2-02 (check-stability)┘              │
                                        └─► S2-04 (Gardener skill)

  S2-05 (Diagnostician) ─ independent

Sprint 3:
  S3-01 (context dir) ─┐
                       └─► S3-02 (enhance sigil-init)
  S1-02 ──────────────────┘

  All prior ─► S3-03 (validation script) ─► S3-04 (E2E test)
```

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Hooks don't run as expected | High | Medium | Test hooks in isolation before integration |
| Bash scripts fail on different environments | Medium | Low | Use /opt/homebrew/bin/bash, add fallbacks |
| Physics validation too strict | Medium | Medium | Start with warnings only, no blocking |
| Context files grow unbounded | Low | Medium | Limit recent.json to last 10 entries |
| Skills don't read required files | Medium | Low | Explicit "MUST read" in SKILL.md |

---

## Success Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Mason asks config questions | Yes | No | Manual test |
| /craft uses correct physics | Partial | 100% | Test all effect types |
| /garden shows authority | No | Yes | Run on 5 components |
| Diagnostician matches patterns | Partial | 100% | Test all 9 categories |
| Physics warnings appear | No | Yes | Trigger intentional violation |

---

## Files Created

| File | Purpose | Sprint |
|------|---------|--------|
| `.claude/settings.local.json` | Hooks configuration | 1 |
| `.claude/scripts/sigil-init.sh` | SessionStart hook | 1 |
| `.claude/scripts/validate-physics.sh` | PreToolUse hook | 1 |
| `.claude/scripts/count-imports.sh` | Import counter | 2 |
| `.claude/scripts/check-stability.sh` | Stability checker | 2 |
| `.claude/scripts/infer-authority.sh` | Authority inferer | 2 |
| `.claude/scripts/validate-v10.1.sh` | Validation script | 3 |
| `grimoires/sigil/.context/taste.json` | Taste preferences | 3 |
| `grimoires/sigil/.context/persona.json` | Audience context | 3 |
| `grimoires/sigil/.context/project.json` | Project conventions | 3 |
| `grimoires/sigil/.context/recent.json` | Recent generations | 3 |

## Files Updated

| File | Changes | Sprint |
|------|---------|--------|
| `.claude/skills/mason/SKILL.md` | Required Reading, Physics Decision Tree | 1 |
| `.claude/skills/gardener/SKILL.md` | Authority Computation with Bash Helpers | 2 |
| `.claude/skills/diagnostician/SKILL.md` | Required Reading, Pattern Categories, Never Ask | 2 |
| `.gitignore` | Add grimoires/sigil/.context/ | 3 |

---

## Next Steps

After sprint plan approval:
```
/implement sprint-1
```

The implement command will:
1. Pick up tasks from this sprint plan
2. Execute them in dependency order
3. Mark tasks complete as they finish
4. Verify acceptance criteria

---

*Sprint Plan Generated: 2026-01-11*
*Total Tasks: 14*
*Architecture: Hooks-Based Skill Enhancement*
*Key Insight: Skills read, hooks inject, bash computes*
