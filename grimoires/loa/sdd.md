# Software Design Document: Sigil v9.1 "Migration Debt Zero"

**Version:** 9.1.0
**Codename:** Migration Debt Zero
**Status:** SDD Complete
**Date:** 2026-01-11
**Supersedes:** v9.0.0 "Core Scaffold" SDD
**Based on:** PRD v9.1.0
**Sources:** MIGRATION_AUDIT_REPORT.md, FULL_TECHNICAL_AUDIT.md, migrate-to-grimoire.sh

---

## 1. Executive Summary

This document describes the technical approach for completing the v9.0 migration. The audits reveal:

| Issue | Count | Impact |
|-------|-------|--------|
| Hardcoded `sigil-mark/` references | 81 | Agent loads wrong paths |
| Version numbers in use | 6+ | Version confusion |
| Missing referenced files | 6 | Skills fail to load |
| Phantom skill references | 3 | Skill points to non-existent files |
| Old `sigil-mark/` directory | Exists | Contains orphaned files |

### 1.1 Architecture Philosophy

This is a **path migration**, not a feature build:

```
NO new components.
NO new features.
NO new APIs.

ONLY path updates.
ONLY file moves.
ONLY version consolidation.
```

### 1.2 Scope

| In Scope | Out of Scope |
|----------|--------------|
| Fix 81 path references | Runtime layer creation |
| Move orphaned files | New features |
| Consolidate version numbers | Documentation overhaul |
| Update skill paths | Component creation |
| Delete legacy `sigil-mark/` | Phase 2 features |

---

## 2. System Architecture

### 2.1 Current State (Broken)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CURRENT STATE (v9.0)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐         ┌──────────────────┐                  │
│  │   Agent/Skills   │────────▶│  sigil-mark/     │ ❌ WRONG PATH    │
│  │                  │ reads   │  (legacy)        │                  │
│  │ SKILL.md says:   │         │                  │                  │
│  │ "sigil-mark/..." │         └──────────────────┘                  │
│  └──────────────────┘                                               │
│                                                                      │
│  ┌──────────────────┐         ┌──────────────────┐                  │
│  │   Process Layer  │────────▶│  sigil-mark/     │ ❌ WRONG PATH    │
│  │                  │ refs    │  (doesn't exist) │                  │
│  │ DEFAULT_PATH =   │         │                  │                  │
│  │ "sigil-mark/..." │         └──────────────────┘                  │
│  └──────────────────┘                                               │
│                                                                      │
│  ┌──────────────────┐                                               │
│  │ grimoires/sigil/ │ ✅ EXISTS but unused                          │
│  │ └── constitution │                                               │
│  │ └── moodboard    │                                               │
│  │ └── process      │                                               │
│  └──────────────────┘                                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Target State (v9.1)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TARGET STATE (v9.1)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐         ┌──────────────────┐                  │
│  │   Agent/Skills   │────────▶│ grimoires/sigil/ │ ✅ CORRECT       │
│  │                  │ reads   │                  │                  │
│  │ SKILL.md says:   │         │ └── constitution │                  │
│  │ "grimoires/..."  │         │ └── moodboard    │                  │
│  └──────────────────┘         └──────────────────┘                  │
│                                                                      │
│  ┌──────────────────┐         ┌──────────────────┐                  │
│  │   Process Layer  │────────▶│ grimoires/sigil/ │ ✅ CORRECT       │
│  │                  │ refs    │ └── process      │                  │
│  │ DEFAULT_PATH =   │         │ └── state        │                  │
│  │ "grimoires/..."  │         │                  │                  │
│  └──────────────────┘         └──────────────────┘                  │
│                                                                      │
│  ┌──────────────────┐                                               │
│  │ sigil-mark/      │ ❌ DELETED                                    │
│  └──────────────────┘                                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technical Approach

### 3.1 Strategy: Find and Replace

The migration is fundamentally a global find-and-replace with validation:

```bash
# The core operation
sed -i 's|sigil-mark/|grimoires/sigil/|g' <file>
```

With caveats:
1. Some paths need restructuring (e.g., `sigil-mark/vocabulary/` → `grimoires/sigil/constitution/`)
2. Some referenced files don't exist and need creation
3. Some references are to phantom features and need removal

### 3.2 Path Mapping Table

| Old Path | New Path | Action |
|----------|----------|--------|
| `sigil-mark/constitution/` | `grimoires/sigil/constitution/` | Direct map |
| `sigil-mark/moodboard/` | `grimoires/sigil/moodboard/` | Direct map |
| `sigil-mark/process/` | `grimoires/sigil/process/` | Direct map |
| `sigil-mark/vocabulary/` | `grimoires/sigil/constitution/` | Merge into constitution |
| `sigil-mark/personas/` | `grimoires/sigil/constitution/` | Merge into constitution |
| `sigil-mark/kernel/` | `grimoires/sigil/constitution/` | Merge into constitution |
| `sigil-mark/governance/` | `grimoires/sigil/state/` | Move to state |
| `sigil-mark/consultation-chamber/` | `grimoires/sigil/constitution/` | Merge into constitution |
| `sigil-mark/soul-binder/` | N/A | **DELETE** - phantom feature |
| `sigil-mark/lens-array/` | N/A | **DELETE** - phantom feature |
| `sigil-mark/surveys/` | N/A | **DELETE** - phantom feature |

### 3.3 File Categories

#### Category A: Direct Path Update
Files where only the path prefix changes:

```typescript
// Before
export const DEFAULT_MOODBOARD_PATH = 'sigil-mark/moodboard';
// After
export const DEFAULT_MOODBOARD_PATH = 'grimoires/sigil/moodboard';
```

#### Category B: Path Restructure
Files where the path structure changes:

```typescript
// Before
export const DEFAULT_VOCABULARY_PATH = 'sigil-mark/vocabulary/vocabulary.yaml';
// After
export const DEFAULT_VOCABULARY_PATH = 'grimoires/sigil/constitution/vocabulary.yaml';
```

#### Category C: Phantom Reference Removal
References to non-existent features:

```yaml
# Before
checks:
  - path: sigil-mark/soul-binder/immutable-values.yaml
# After
# (line deleted - file doesn't exist)
```

---

## 4. Component Design

### 4.1 Process Layer Updates

**Files requiring update (11 modules):**

| File | Change Type |
|------|-------------|
| `constitution-reader.ts` | Category B (restructure) |
| `moodboard-reader.ts` | Category A (direct) |
| `persona-reader.ts` | Category B (restructure) |
| `vocabulary-reader.ts` | Category B (restructure) |
| `decision-reader.ts` | Category B (restructure) |
| `philosophy-reader.ts` | Category B (restructure) |
| `vibe-check-reader.ts` | Category C (remove) |
| `lens-array-reader.ts` | Category C (remove) |
| `governance-logger.ts` | Category B (restructure) |
| `agent-orchestration.ts` | Category B (restructure) |
| `garden-command.ts` | Category A (direct) |

**Update Pattern:**

```typescript
// grimoires/sigil/process/constitution-reader.ts

// BEFORE
export const DEFAULT_CONSTITUTION_PATH = 'sigil-mark/constitution/protected-capabilities.yaml';

// AFTER
export const DEFAULT_CONSTITUTION_PATH = 'grimoires/sigil/constitution/protected-capabilities.yaml';
```

### 4.2 Skill Updates

**File: `.claude/skills/crafting-guidance/SKILL.md`**

```yaml
# BEFORE (broken)
zones:
  state:
    paths:
      - sigil-mark/rules.md
      - sigil-mark/vocabulary/vocabulary.yaml
      - sigil-mark/constitution/protected-capabilities.yaml
      - sigil-mark/personas/personas.yaml
      - sigil-mark/consultation-chamber/decisions/
      - sigil-mark/evidence/
      - sigil-mark/philosophy/philosophy.yaml

# AFTER (fixed)
zones:
  state:
    paths:
      - grimoires/sigil/constitution/rules.md
      - grimoires/sigil/constitution/vocabulary.yaml
      - grimoires/sigil/constitution/protected-capabilities.yaml
      - grimoires/sigil/constitution/personas.yaml
      - grimoires/sigil/constitution/decisions/
      - grimoires/sigil/moodboard/evidence/
      - grimoires/sigil/constitution/philosophy.yaml
```

**File: `.claude/skills/crafting-guidance/index.yaml`**

```yaml
# BEFORE (phantom references)
checks:
  - path: sigil-mark/soul-binder/immutable-values.yaml
  - path: sigil-mark/soul-binder/canon-of-flaws.yaml
  - path: sigil-mark/lens-array/lenses.yaml

# AFTER (removed)
# (checks section removed or emptied - files don't exist)
```

### 4.3 CLAUDE.md Updates

**Key sections to update:**

```markdown
# BEFORE
| `sigil-mark/process/survival-engine.ts` | Auto-promotion engine |

# AFTER
| `grimoires/sigil/process/survival-engine.ts` | Auto-promotion engine |
```

```markdown
# BEFORE
sigil-mark/
├── core/
├── providers/

# AFTER
grimoires/sigil/
├── constitution/
├── moodboard/
├── process/
├── state/
```

### 4.4 tsconfig.json Updates

```json
// BEFORE (broken)
{
  "compilerOptions": {
    "paths": {
      "@sigil/recipes/*": ["sigil-mark/recipes/*"],
      "@sigil/hooks": ["sigil-mark/hooks/index.ts"],
      "@sigil/hooks/*": ["sigil-mark/hooks/*"],
      "@sigil/core/*": ["sigil-mark/core/*"]
    }
  },
  "include": ["sigil-mark/**/*"]
}

// AFTER (fixed)
{
  "compilerOptions": {
    "paths": {
      "@sigil-context/*": ["grimoires/sigil/*"],
      "@sigil/hooks": ["src/components/gold/hooks/index.ts"],
      "@sigil/hooks/*": ["src/components/gold/hooks/*"],
      "@sigil/utils/*": ["src/components/gold/utils/*"]
    }
  },
  "include": ["grimoires/sigil/**/*", "src/**/*"]
}
```

---

## 5. Data Architecture

### 5.1 Files to Move

| Source | Destination | Notes |
|--------|-------------|-------|
| `sigil-mark/constitution/protected-capabilities.yaml` | `grimoires/sigil/constitution/` | Critical - defines protected capabilities |
| `sigil-mark/kernel/schemas/physics.schema.json` | `grimoires/sigil/schemas/` | Optional - JSON schema |
| `sigil-mark/constitution/schemas/constitution.schema.json` | `grimoires/sigil/schemas/` | Optional - JSON schema |

### 5.2 Files to Create

| Path | Content | Purpose |
|------|---------|---------|
| `grimoires/sigil/constitution/personas.yaml` | Depositor, newcomer, power_user personas | Skills reference this |
| `grimoires/sigil/constitution/philosophy.yaml` | Core principles | Skills reference this |
| `grimoires/sigil/constitution/rules.md` | Motion rules summary | Skills reference this |
| `grimoires/sigil/constitution/decisions/README.md` | Directory placeholder | Skills reference this dir |
| `grimoires/sigil/moodboard/evidence/README.md` | Directory placeholder | Skills reference this dir |

### 5.3 Placeholder Content

**personas.yaml:**
```yaml
# Sigil Personas
version: "9.1.0"

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

**philosophy.yaml:**
```yaml
# Sigil Philosophy
version: "9.1.0"

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

**rules.md:**
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

---

## 6. Version Consolidation

### 6.1 Files Requiring Version Update

| File | Current | Target |
|------|---------|--------|
| `grimoires/sigil/README.md` | 9.0.0 | 9.1.0 |
| `.sigilrc.yaml` | 4.1.0 | 9.1.0 |
| `grimoires/sigil/constitution/constitution.yaml` | 5.0.0 | 9.1.0 |
| `grimoires/sigil/constitution/vocabulary.yaml` | 5.0.0 | 9.1.0 |
| `CLAUDE.md` | v7.6 | v9.1 |
| `grimoires/sigil/process/index.ts` | v4.1 | v9.1 |
| `.claude/skills/crafting-guidance/SKILL.md` | v4.1 | v9.1 |

### 6.2 Update Pattern

```yaml
# YAML files
version: "9.1.0"

# TypeScript headers
/**
 * Sigil v9.1 - [Module Name]
 */

# Markdown
*Sigil v9.1.0 "Migration Debt Zero"*
```

---

## 7. Physics Value Alignment

### 7.1 Current Inconsistencies

| Motion | useMotion.ts | physics.yaml | vocabulary.yaml | .sigilrc.yaml |
|--------|--------------|--------------|-----------------|---------------|
| reassuring | N/A | N/A | 600ms | 1200ms |

### 7.2 Resolution

**Source of Truth:** `grimoires/sigil/constitution/physics.yaml`

All other files must match physics.yaml. If a physics type doesn't exist in physics.yaml, it should be added or removed from other files.

**Fix:**
```yaml
# grimoires/sigil/constitution/physics.yaml
reassuring:
  duration: 600
  easing: "ease-out"
  description: "Reassuring feedback for uncertain actions"
```

Then update `.sigilrc.yaml` to match.

---

## 8. Deletion Strategy

### 8.1 Pre-Deletion Checklist

Before deleting `sigil-mark/`:

```bash
# 1. Verify zero references remain
grep -r "sigil-mark" --include="*.ts" --include="*.yaml" --include="*.md" | wc -l
# Must return 0

# 2. Verify all required files exist in grimoire
[ -f "grimoires/sigil/constitution/protected-capabilities.yaml" ] && echo "OK"
[ -f "grimoires/sigil/constitution/vocabulary.yaml" ] && echo "OK"
[ -f "grimoires/sigil/constitution/physics.yaml" ] && echo "OK"

# 3. Verify skills load
# (manual test of /craft command)
```

### 8.2 Deletion Command

```bash
# After all checks pass
rm -rf sigil-mark/
```

### 8.3 Rollback Plan

If issues discovered after deletion:

```bash
# Restore from git
git checkout HEAD~1 -- sigil-mark/
```

---

## 9. Validation Architecture

### 9.1 Validation Script

```bash
#!/bin/bash
# validate-migration.sh

set -e

echo "=== SIGIL v9.1 MIGRATION VALIDATION ==="

# Check 1: No sigil-mark references
echo ""
echo "1. Checking for sigil-mark references..."
REMAINING=$(grep -r "sigil-mark" \
  --include="*.ts" \
  --include="*.yaml" \
  --include="*.md" \
  --include="*.json" \
  2>/dev/null | wc -l || echo "0")

if [ "$REMAINING" -gt 0 ]; then
  echo "❌ FAIL: $REMAINING references remain"
  grep -r "sigil-mark" \
    --include="*.ts" \
    --include="*.yaml" \
    --include="*.md" \
    --include="*.json" \
    2>/dev/null | head -10
  exit 1
else
  echo "✅ PASS: No sigil-mark references"
fi

# Check 2: Required files exist
echo ""
echo "2. Checking required files..."
REQUIRED=(
  "grimoires/sigil/constitution/constitution.yaml"
  "grimoires/sigil/constitution/physics.yaml"
  "grimoires/sigil/constitution/vocabulary.yaml"
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

# Check 3: Version consistency
echo ""
echo "3. Checking version consistency..."
VERSIONS=$(grep -r "version:" --include="*.yaml" grimoires/sigil/ | grep -v "9.1" | wc -l)
if [ "$VERSIONS" -gt 0 ]; then
  echo "⚠️  WARNING: Some files don't have version 9.1.0"
  grep -r "version:" --include="*.yaml" grimoires/sigil/ | grep -v "9.1"
fi

# Check 4: sigil-mark directory deleted
echo ""
echo "4. Checking legacy cleanup..."
if [ -d "sigil-mark" ]; then
  echo "⚠️  WARNING: sigil-mark/ still exists"
else
  echo "✅ PASS: sigil-mark/ deleted"
fi

echo ""
echo "=== VALIDATION COMPLETE ==="
```

### 9.2 Integration Test

```bash
# Test /craft command works
# 1. Start Claude Code
# 2. Run: /craft "deposit button"
# 3. Verify output uses useMotion('server-tick')
# 4. Verify no errors about missing files
```

---

## 10. Implementation Order

### 10.1 Dependency Graph

```
1. Move protected-capabilities.yaml
   └── No dependencies

2. Create placeholder files (personas, philosophy, rules)
   └── No dependencies

3. Update process layer paths
   └── Depends on: 1, 2 (files must exist)

4. Update skill paths
   └── Depends on: 1, 2 (files must exist)

5. Update CLAUDE.md
   └── Depends on: 3, 4 (paths must be correct)

6. Update tsconfig.json
   └── No dependencies

7. Consolidate version numbers
   └── Depends on: 1-6 (all files must exist)

8. Align physics values
   └── Depends on: 7 (versions consistent)

9. Run validation
   └── Depends on: 1-8

10. Delete sigil-mark/
    └── Depends on: 9 (validation must pass)
```

### 10.2 Sprint Breakdown

**Sprint 1: Foundation (P0)**
- Task 1.1: Move protected-capabilities.yaml
- Task 1.2: Create placeholder files and directories
- Task 1.3: Update all 11 process layer DEFAULT_PATH constants
- Task 1.4: Run `grep sigil-mark process/` to verify

**Sprint 2: Configuration (P0-P1)**
- Task 2.1: Update SKILL.md paths
- Task 2.2: Update index.yaml, remove phantom references
- Task 2.3: Update CLAUDE.md paths
- Task 2.4: Update tsconfig.json aliases
- Task 2.5: Consolidate all version numbers to 9.1.0

**Sprint 3: Cleanup (P1-P2)**
- Task 3.1: Run validation script
- Task 3.2: Fix any remaining references
- Task 3.3: Align physics values across files
- Task 3.4: Delete sigil-mark/ directory
- Task 3.5: Final audit

---

## 11. Risk Mitigation

### 11.1 Known Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Missed reference breaks agent | Medium | High | Run validation after each sprint |
| Placeholder files insufficient | Low | Medium | Placeholder is acceptable for v9.1 |
| Physics value mismatch | Low | Low | physics.yaml is source of truth |
| Rollback needed | Low | Medium | Git history preserved |

### 11.2 Rollback Procedure

```bash
# If migration fails after deletion
git checkout <commit-before-deletion> -- sigil-mark/

# If migration fails before deletion
# Just revert the path changes
git checkout HEAD -- grimoires/sigil/process/
git checkout HEAD -- .claude/skills/
git checkout HEAD -- CLAUDE.md
git checkout HEAD -- tsconfig.json
```

---

## 12. Success Criteria

### 12.1 Quantitative

| Metric | Current | Target |
|--------|---------|--------|
| `sigil-mark/` references | 81 | 0 |
| Version numbers in use | 6+ | 1 (v9.1.0) |
| Missing referenced files | 6+ | 0 |
| Phantom skill references | 3 | 0 |
| `sigil-mark/` directory | Exists | Deleted |

### 12.2 Qualitative

| Test | Expected Result |
|------|-----------------|
| `/craft "deposit button"` | Generates with server-tick physics |
| `/craft "tooltip"` | Generates with snappy physics |
| Skill context load | No file not found errors |
| TypeScript compilation | No path resolution errors |

---

## 13. Performance Considerations

This migration has no runtime performance impact:

- File reads happen at agent-time, not runtime
- Path changes are string substitutions
- No new code execution paths

**Build-time impact:**
- TypeScript compilation may be slightly faster (smaller include set)
- Skill loading unchanged (still reads YAML files)

---

## 14. Documentation Updates

### 14.1 CLAUDE.md Key Changes

1. Update version header to v9.1
2. Replace all `sigil-mark/` paths with `grimoires/sigil/`
3. Update directory structure diagram
4. Remove references to non-existent runtime layer
5. Add note: "Full runtime layer (useSigilMutation, CriticalZone) is Phase 2"

### 14.2 README Updates

- `grimoires/sigil/README.md`: Update to v9.1.0
- No new README files needed (placeholders have READMEs)

---

## 15. The v9.1 Principles

1. **Fix paths, not features** — This is debt cleanup only
2. **Validate before delete** — Never delete without verification
3. **Single source of truth** — physics.yaml defines physics
4. **Version consistency** — All files report 9.1.0
5. **Placeholder over phantom** — Real empty files beat imaginary features

---

*SDD Generated: 2026-01-11*
*Based on: PRD v9.1.0*
*Sources: MIGRATION_AUDIT_REPORT.md, FULL_TECHNICAL_AUDIT.md*
*Key Insight: This is path migration, not feature development*
*Next Step: `/sprint-plan` to create implementation sprints*
