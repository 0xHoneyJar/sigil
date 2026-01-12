# Sigil v9.1 "Migration Debt Zero" Sprint Plan

**Version:** 9.1.0
**Codename:** Migration Debt Zero
**Generated:** 2026-01-11
**Sources:** PRD v9.1.0, SDD v9.1.0
**Supersedes:** v9.0.0 "Core Scaffold" Sprint Plan

---

## Sprint Overview

### Team Structure
- **Agent:** Claude (AI implementation)
- **Human:** @zksoju (review, veto holder)

### Sprint Duration
- **Cycle length:** 1 session per sprint
- **Total sprints:** 3 sprints
- **Methodology:** Cycles (Linear Method)

### v9.1 Objective

Complete the incomplete v9.0 migration by fixing:

| Issue | Count | Action |
|-------|-------|--------|
| Hardcoded `sigil-mark/` references | 81 | Update to `grimoires/sigil/` |
| Version numbers in use | 6+ | Consolidate to 9.1.0 |
| Missing referenced files | 6 | Create placeholders |
| Phantom skill references | 3 | Remove references |
| Old `sigil-mark/` directory | Exists | Delete |

### Success Metric

```bash
grep -r "sigil-mark" --include="*.ts" --include="*.yaml" --include="*.md" | wc -l
# Target: 0
```

---

## Sprint 1: Foundation (P0 - Critical Path)

**Goal:** Move orphaned files, create placeholders, fix all 42 process layer path references.

**Status:** REVIEW_APPROVED

### S1-T1: Move protected-capabilities.yaml to Grimoire

**ID:** S1-M1
**Priority:** P0
**Description:** Move the critical protected-capabilities.yaml from legacy location to grimoire.

**Action:**
```bash
mv sigil-mark/constitution/protected-capabilities.yaml \
   grimoires/sigil/constitution/
```

**Acceptance Criteria:**
- [x] File exists at `grimoires/sigil/constitution/protected-capabilities.yaml`
- [x] File is readable and valid YAML
- [x] Original file removed from `sigil-mark/constitution/`

**Effort:** Trivial
**Dependencies:** None

---

### S1-T2: Create Placeholder Files and Directories

**ID:** S1-M2
**Priority:** P0
**Description:** Create all files and directories that are referenced by skills but don't exist.

**Files to Create:**

1. `grimoires/sigil/constitution/personas.yaml`
```yaml
# Sigil Personas
# Version: 9.1.0

personas:
  depositor:
    description: "Active user who deposits funds"
    trust_level: high
    preferences:
      motion: deliberate

  newcomer:
    description: "New user exploring the platform"
    trust_level: building
    preferences:
      motion: reassuring

  power_user:
    description: "Experienced user who wants efficiency"
    trust_level: established
    preferences:
      motion: snappy
```

2. `grimoires/sigil/constitution/philosophy.yaml`
```yaml
# Sigil Philosophy
# Version: 9.1.0

principles:
  - id: flow-state
    name: "Preserve Flow State"
    description: "Never interrupt the designer's creative flow"

  - id: invisible-infrastructure
    name: "Invisible Infrastructure"
    description: "Using it IS the experience"

  - id: survival-over-ceremony
    name: "Survival Over Ceremony"
    description: "Patterns earn status through usage, not approval dialogs"
```

3. `grimoires/sigil/constitution/rules.md`
```markdown
# Sigil Design Rules

## Motion
- Critical zone: server-tick (600ms)
- Important zone: deliberate (800ms)
- Casual zone: snappy (150ms)

## Protected Capabilities
See: protected-capabilities.yaml

## Vocabulary
See: vocabulary.yaml
```

4. `grimoires/sigil/constitution/decisions/README.md`
```markdown
# Sigil Design Decisions

This directory contains locked design decisions.

Currently empty - decisions will be added as they are made.
```

5. `grimoires/sigil/moodboard/evidence/README.md`
```markdown
# Sigil Evidence

This directory contains evidence for design decisions.

Currently empty - evidence will be added as patterns are validated.
```

**Acceptance Criteria:**
- [x] `grimoires/sigil/constitution/personas.yaml` exists
- [x] `grimoires/sigil/constitution/philosophy.yaml` exists
- [x] `grimoires/sigil/constitution/rules.md` exists
- [x] `grimoires/sigil/constitution/decisions/README.md` exists
- [x] `grimoires/sigil/moodboard/evidence/README.md` exists

**Effort:** Small
**Dependencies:** None

---

### S1-T3: Update Process Layer Path Constants

**ID:** S1-M3
**Priority:** P0
**Description:** Update all 11 process layer modules with DEFAULT_PATH constants pointing to wrong locations.

**Files to Update:**

| File | Current Constant | New Value |
|------|------------------|-----------|
| `constitution-reader.ts` | `sigil-mark/constitution/...` | `grimoires/sigil/constitution/...` |
| `moodboard-reader.ts` | `sigil-mark/moodboard` | `grimoires/sigil/moodboard` |
| `persona-reader.ts` | `sigil-mark/personas/...` | `grimoires/sigil/constitution/personas.yaml` |
| `vocabulary-reader.ts` | `sigil-mark/vocabulary/...` | `grimoires/sigil/constitution/vocabulary.yaml` |
| `decision-reader.ts` | `sigil-mark/consultation-chamber/...` | `grimoires/sigil/constitution/decisions/` |
| `philosophy-reader.ts` | `sigil-mark/soul-binder/...` | `grimoires/sigil/constitution/philosophy.yaml` |
| `vibe-check-reader.ts` | `sigil-mark/surveys/...` | Comment out (phantom feature) |
| `lens-array-reader.ts` | `sigil-mark/lens-array/...` | Comment out (phantom feature) |
| `governance-logger.ts` | `sigil-mark/governance` | `grimoires/sigil/state/` |
| `agent-orchestration.ts` | `sigil-mark/vocabulary/...` | `grimoires/sigil/constitution/vocabulary.yaml` |
| `garden-command.ts` | `sigil-mark/` in SCAN_PATHS | `grimoires/sigil/` |

**Acceptance Criteria:**
- [x] All 12 files updated with correct paths (11 + amend-command.ts)
- [x] `grep -r "sigil-mark" grimoires/sigil/process/` returns 0 functional results
- [x] TypeScript compiles without errors

**Effort:** Medium
**Dependencies:** S1-T1, S1-T2

---

### S1-T4: Verify Process Layer Compilation

**ID:** S1-M4
**Priority:** P0
**Description:** Run TypeScript compilation to verify no broken imports.

**Command:**
```bash
npx tsc --noEmit
```

**Acceptance Criteria:**
- [x] TypeScript compiles without path-related errors
- [x] No "Cannot find module" errors for sigil-mark paths

**Effort:** Trivial
**Dependencies:** S1-T3

---

### Sprint 1 Exit Criteria

- [x] `protected-capabilities.yaml` in grimoire
- [x] All 5 placeholder files/directories created
- [x] All 12 process layer path references updated (11 + amend-command.ts)
- [x] `grep sigil-mark grimoires/sigil/process/` returns 0 functional results
- [x] TypeScript compiles without errors

---

## Sprint 2: Configuration (P0-P1)

**Goal:** Update skill paths, CLAUDE.md, tsconfig.json, and consolidate version numbers.

**Status:** READY_FOR_REVIEW

### S2-T1: Update SKILL.md Paths

**ID:** S2-M1
**Priority:** P0
**Description:** Update `.claude/skills/crafting-guidance/SKILL.md` to use grimoire paths.

**Changes:**
```yaml
# Find all sigil-mark/ references and update to grimoires/sigil/
# Example:
#   sigil-mark/vocabulary/vocabulary.yaml
#   → grimoires/sigil/constitution/vocabulary.yaml
```

**Acceptance Criteria:**
- [x] All `sigil-mark/` paths updated to `grimoires/sigil/`
- [x] All referenced files exist at new paths
- [x] No broken path references

**Effort:** Small
**Dependencies:** Sprint 1 complete

---

### S2-T2: Update index.yaml and Remove Phantom References

**ID:** S2-M2
**Priority:** P0
**Description:** Update `.claude/skills/crafting-guidance/index.yaml` and remove references to non-existent files.

**Remove these phantom references:**
```yaml
# These files don't exist - remove from checks:
checks:
  - path: sigil-mark/soul-binder/immutable-values.yaml  # DELETE
  - path: sigil-mark/soul-binder/canon-of-flaws.yaml    # DELETE
  - path: sigil-mark/lens-array/lenses.yaml             # DELETE
```

**Acceptance Criteria:**
- [x] Phantom file references removed
- [x] Skill loads without "file not found" errors
- [x] All remaining paths point to grimoire

**Effort:** Small
**Dependencies:** S2-T1

---

### S2-T3: Update CLAUDE.md Paths

**ID:** S2-M3
**Priority:** P0
**Description:** Update all `sigil-mark/` references in CLAUDE.md to `grimoires/sigil/`.

**Key sections to update:**
- Directory structure diagram
- Key files table
- v7.6 Executable Principles table
- Any import examples

**Also update:**
- Remove references to non-existent runtime layer (useSigilMutation, CriticalZone)
- Add note: "Full runtime layer is Phase 2"
- Update version references to v9.1

**Acceptance Criteria:**
- [x] All `sigil-mark/` paths replaced with `grimoires/sigil/`
- [x] Directory structure diagram updated
- [x] Version references updated to v9.1
- [x] No references to phantom runtime layer imports

**Effort:** Medium
**Dependencies:** Sprint 1 complete

---

### S2-T4: Update tsconfig.json Path Aliases

**ID:** S2-M4
**Priority:** P1
**Description:** Update tsconfig.json to remove broken sigil-mark aliases and add correct grimoire paths.

**Current (broken):**
```json
{
  "paths": {
    "@sigil/recipes/*": ["sigil-mark/recipes/*"],
    "@sigil/hooks": ["sigil-mark/hooks/index.ts"],
    "@sigil/hooks/*": ["sigil-mark/hooks/*"],
    "@sigil/core/*": ["sigil-mark/core/*"]
  },
  "include": ["sigil-mark/**/*"]
}
```

**New (fixed):**
```json
{
  "paths": {
    "@sigil-context/*": ["grimoires/sigil/*"],
    "@sigil/hooks": ["src/components/gold/hooks/index.ts"],
    "@sigil/hooks/*": ["src/components/gold/hooks/*"],
    "@sigil/utils/*": ["src/components/gold/utils/*"]
  },
  "include": ["grimoires/sigil/**/*", "src/**/*"]
}
```

**Acceptance Criteria:**
- [x] All sigil-mark paths removed from tsconfig
- [x] Correct grimoire and src paths added
- [x] TypeScript resolves all imports correctly

**Effort:** Small
**Dependencies:** None

---

### S2-T5: Consolidate Version Numbers to 9.1.0

**ID:** S2-M5
**Priority:** P1
**Description:** Update all version references across the codebase to 9.1.0.

**Files to update:**

| File | Current | New |
|------|---------|-----|
| `grimoires/sigil/README.md` | 9.0.0 | 9.1.0 |
| `.sigilrc.yaml` | 4.1.0 | 9.1.0 |
| `grimoires/sigil/constitution/constitution.yaml` | 5.0.0 | 9.1.0 |
| `grimoires/sigil/constitution/vocabulary.yaml` | 5.0.0 | 9.1.0 |
| `CLAUDE.md` footer | v7.6.0 | v9.1.0 |
| `grimoires/sigil/process/index.ts` header | v4.1 | v9.1 |
| `.claude/skills/crafting-guidance/SKILL.md` header | v4.1 | v9.1 |

**Acceptance Criteria:**
- [x] All listed files updated to 9.1.0
- [x] `grep -r "version:" grimoires/sigil/ | grep -v "9.1"` returns 0
- [x] Consistent version across entire codebase

**Effort:** Small
**Dependencies:** S2-T1 through S2-T4

---

### Sprint 2 Exit Criteria

- [x] SKILL.md uses grimoire paths
- [x] index.yaml has no phantom references
- [x] CLAUDE.md updated with grimoire paths
- [x] tsconfig.json has correct aliases
- [x] All versions consolidated to 9.1.0
- [x] Skills load without errors

---

## Sprint 3: Cleanup (P1-P2)

**Goal:** Validate migration, align physics values, delete legacy directories, run final audit.

**Status:** PENDING

### S3-T1: Run Migration Validation Script

**ID:** S3-M1
**Priority:** P1
**Description:** Create and run validation script to verify migration completeness.

**Script:**
```bash
#!/bin/bash
echo "=== SIGIL v9.1 MIGRATION VALIDATION ==="

# Check 1: No sigil-mark references
echo "1. Checking for sigil-mark references..."
REMAINING=$(grep -r "sigil-mark" \
  --include="*.ts" --include="*.yaml" \
  --include="*.md" --include="*.json" \
  2>/dev/null | wc -l)

if [ "$REMAINING" -gt 0 ]; then
  echo "❌ FAIL: $REMAINING references remain"
  exit 1
else
  echo "✅ PASS: No sigil-mark references"
fi

# Check 2: Required files exist
echo "2. Checking required files..."
REQUIRED=(
  "grimoires/sigil/constitution/protected-capabilities.yaml"
  "grimoires/sigil/constitution/personas.yaml"
  "grimoires/sigil/constitution/philosophy.yaml"
  "grimoires/sigil/constitution/rules.md"
)

for f in "${REQUIRED[@]}"; do
  if [ -f "$f" ]; then
    echo "  ✓ $f"
  else
    echo "  ❌ MISSING: $f"
    exit 1
  fi
done

echo "=== VALIDATION COMPLETE ==="
```

**Acceptance Criteria:**
- [ ] Validation script runs without errors
- [ ] 0 sigil-mark references found
- [ ] All required files exist

**Effort:** Small
**Dependencies:** Sprint 2 complete

---

### S3-T2: Fix Any Remaining References

**ID:** S3-M2
**Priority:** P1
**Description:** Address any references found by validation script.

**Process:**
1. Run validation script
2. For each reference found:
   - If valid path: update to grimoire path
   - If phantom feature: remove or comment out
3. Re-run validation until 0 references

**Acceptance Criteria:**
- [ ] Validation script passes with 0 references
- [ ] No broken functionality from fixes

**Effort:** Variable (depends on findings)
**Dependencies:** S3-T1

---

### S3-T3: Align Physics Values Across Files

**ID:** S3-M3
**Priority:** P1
**Description:** Ensure physics timing values are consistent across all files.

**Source of truth:** `grimoires/sigil/constitution/physics.yaml`

**Known inconsistency:**
| Motion | physics.yaml | .sigilrc.yaml |
|--------|--------------|---------------|
| reassuring | 600ms | 1200ms |

**Fix:** Update `.sigilrc.yaml` to match `physics.yaml`

**Acceptance Criteria:**
- [ ] All physics values in .sigilrc.yaml match physics.yaml
- [ ] useMotion.ts values match physics.yaml
- [ ] No conflicting timing values

**Effort:** Small
**Dependencies:** None

---

### S3-T4: Delete Legacy sigil-mark/ Directory

**ID:** S3-M4
**Priority:** P2
**Description:** Remove the legacy sigil-mark/ directory after verification.

**Pre-deletion checklist:**
```bash
# Verify zero references remain
grep -r "sigil-mark" --include="*.ts" --include="*.yaml" --include="*.md" | wc -l
# Must be 0

# Verify critical files are in grimoire
[ -f "grimoires/sigil/constitution/protected-capabilities.yaml" ] && echo "OK"
```

**Command:**
```bash
rm -rf sigil-mark/
```

**Acceptance Criteria:**
- [ ] Pre-deletion checklist passes
- [ ] `sigil-mark/` directory deleted
- [ ] No "file not found" errors after deletion

**Effort:** Small
**Dependencies:** S3-T1, S3-T2

---

### S3-T5: Final Security Audit

**ID:** S3-M5
**Priority:** P2
**Description:** Run final security audit to verify migration introduced no vulnerabilities.

**Focus areas:**
- Path traversal (all paths use path.join with project root)
- No hardcoded secrets exposed
- No new dependencies added

**Acceptance Criteria:**
- [ ] Security audit passes
- [ ] No new vulnerabilities introduced
- [ ] SECURITY-AUDIT-REPORT.md updated if needed

**Effort:** Medium
**Dependencies:** S3-T4

---

### Sprint 3 Exit Criteria

- [ ] Validation script passes with 0 references
- [ ] Physics values aligned across all files
- [ ] `sigil-mark/` directory deleted
- [ ] Final audit passes
- [ ] Git commit with "Sigil v9.1.0 Migration Debt Zero"

---

## Sprint Summary

| Sprint | Focus | Tasks | Key Deliverables |
|--------|-------|-------|------------------|
| 1 | Foundation | 4 | Orphaned files moved, placeholders created, process layer fixed |
| 2 | Configuration | 5 | Skills updated, CLAUDE.md fixed, versions consolidated |
| 3 | Cleanup | 5 | Validation, physics alignment, legacy deletion, audit |

**Total Tasks:** 14

---

## Success Metrics

| Metric | Before | After |
|--------|--------|-------|
| `sigil-mark/` references | 81 | 0 |
| Version numbers in use | 6+ | 1 (v9.1.0) |
| Missing referenced files | 6 | 0 |
| Phantom skill references | 3 | 0 |
| `sigil-mark/` directory | Exists | Deleted |

---

## Dependencies Graph

```
Sprint 1:
  S1-T1 (move protected-capabilities) ─┐
  S1-T2 (create placeholders) ─────────┼─► S1-T3 (process paths)
                                       │
                                       └─► S1-T4 (verify compilation)

Sprint 2:
  S1 complete ─► S2-T1 (SKILL.md) ─► S2-T2 (index.yaml)
               └─► S2-T3 (CLAUDE.md)

  S2-T4 (tsconfig) ─ independent

  S2-T1-4 complete ─► S2-T5 (version consolidation)

Sprint 3:
  S2 complete ─► S3-T1 (validation) ─► S3-T2 (fix remaining)
                                      └─► S3-T3 (physics alignment)

  S3-T1-3 complete ─► S3-T4 (delete sigil-mark/)
  S3-T4 complete ─► S3-T5 (final audit)
```

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Missed reference breaks agent | Medium | High | Run validation after each sprint |
| Placeholder files insufficient | Low | Low | Placeholder is acceptable for v9.1 |
| Physics value mismatch | Low | Low | physics.yaml is source of truth |
| Rollback needed | Low | Medium | Git history preserved |

---

## Rollback Procedure

If migration fails after deletion:
```bash
git checkout <commit-before-deletion> -- sigil-mark/
```

If migration fails before deletion:
```bash
git checkout HEAD -- grimoires/sigil/process/
git checkout HEAD -- .claude/skills/
git checkout HEAD -- CLAUDE.md
git checkout HEAD -- tsconfig.json
```

---

## What's NOT in This Sprint (Phase 2+)

| Feature | Why Deferred |
|---------|--------------|
| Runtime layer creation | Separate feature, not migration debt |
| New components | Focus is debt cleanup only |
| Survival Engine activation | Needs usage patterns |
| Linter Gate activation | Tied to survival engine |
| Context Accumulation | Manual defaults work initially |

---

## Next Steps After Completion

1. **Verify `/craft` works** with all physics types
2. **Confirm agent loads** grimoire context correctly
3. **Plan Phase 2** for runtime layer if needed

---

*Sprint Plan Generated: 2026-01-11*
*Based on: PRD v9.1.0, SDD v9.1.0*
*Key Insight: Fix 81 paths, consolidate 6 versions, delete 1 directory*
*Next Step: `/implement sprint-1`*
