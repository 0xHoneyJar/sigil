# Product Requirements Document: Sigil v9.1 Migration Completion

**Version:** 9.1.0
**Codename:** Migration Debt Zero
**Status:** PRD Complete
**Date:** 2026-01-11
**Supersedes:** v9.0.0 "Core Scaffold" (partial migration)
**Sources:** MIGRATION_AUDIT_REPORT.md, FULL_TECHNICAL_AUDIT.md, migrate-to-grimoire.sh

---

## 1. Executive Summary

The v9.0 "Core Scaffold" migration is **incomplete**. Three independent audits reveal:

- **81 hardcoded `sigil-mark/` references** throughout the codebase
- **Version schizophrenia** (v2.6, v4.1, v5.0, v6.0, v6.1, v7.6, v9.0 across files)
- **Missing runtime layer** (providers, hooks, layouts don't exist)
- **Orphaned files** (protected-capabilities.yaml not migrated)
- **Phantom features** (skills reference non-existent lens-array, soul-binder, vibe-checks)

**The Problem:**
> "This is not a v9.0 release. It's a partially renamed v4.1-v7.6 codebase."
> — Staff Engineer (Adversarial Review)

**Risk Level:** HIGH — Agent will fail to load context, reference wrong paths, and generate incorrect imports.

**The Solution:** Complete the migration by:
1. Fixing all 81 path references
2. Consolidating version numbers to 9.1.0
3. Moving orphaned files to grimoire
4. Removing references to phantom features
5. Deleting legacy `sigil-mark/` directory

---

## 2. Problem Statement

### 2.1 The 81 Hardcoded References

**Evidence from MIGRATION_AUDIT_REPORT.md:**

| Location | Count | Impact |
|----------|-------|--------|
| `grimoires/sigil/process/*.ts` | 42 | Process layer points to old paths |
| `.claude/skills/crafting-guidance/SKILL.md` | 15 | Skills load from wrong locations |
| `CLAUDE.md` | 12 | Documentation misleads agent |
| `tsconfig.json` | 6 | TypeScript aliases broken |
| Other | 6 | Various |

**Example violations:**

```typescript
// grimoires/sigil/process/constitution-reader.ts
export const DEFAULT_CONSTITUTION_PATH = 'sigil-mark/constitution/protected-capabilities.yaml';
// SHOULD BE: 'grimoires/sigil/constitution/protected-capabilities.yaml'

// grimoires/sigil/process/moodboard-reader.ts
export const DEFAULT_MOODBOARD_PATH = 'sigil-mark/moodboard';
// SHOULD BE: 'grimoires/sigil/moodboard'
```

### 2.2 Version Schizophrenia

**Evidence from FULL_TECHNICAL_AUDIT.md:**

| File | Claims Version |
|------|----------------|
| `grimoires/sigil/README.md` | 9.0.0 |
| `.sigilrc.yaml` | 4.1.0 |
| `constitution.yaml` | 5.0.0 |
| `vocabulary.yaml` | 5.0.0 |
| `CLAUDE.md` | v7.6, v6.0, v6.1 (multiple refs) |
| `process/constitution-reader.ts` | v2.6 (header) |
| `process/index.ts` | v4.1 |

**Impact:** Agent doesn't know what version it's operating on.

### 2.3 Missing Runtime Layer

The skill tells agents to generate:

```tsx
import { useCriticalAction, CriticalZone, useLens } from 'sigil-mark';
import { useSigilMutation } from 'sigil-mark';
import { CriticalZone, GlassLayout, MachineryLayout } from 'sigil-mark';
```

**None of these exist.** The runtime layer was either never created, deleted during migration, or lives in a different repository.

### 2.4 Orphaned Files

Files referenced but not in grimoire:

| Expected Path | Status |
|---------------|--------|
| `constitution/protected-capabilities.yaml` | Still in `sigil-mark/` |
| `constitution/personas.yaml` | Referenced but doesn't exist |
| `constitution/philosophy.yaml` | Referenced but doesn't exist |
| `constitution/decisions/` | Referenced but doesn't exist |
| `constitution/rules.md` | Referenced but doesn't exist |
| `moodboard/evidence/` | Referenced but doesn't exist |

### 2.5 Phantom Features

Skills reference non-existent files:

```yaml
# .claude/skills/crafting-guidance/index.yaml
checks:
  - path: sigil-mark/soul-binder/immutable-values.yaml  # DOESN'T EXIST
  - path: sigil-mark/soul-binder/canon-of-flaws.yaml    # DOESN'T EXIST
  - path: sigil-mark/lens-array/lenses.yaml             # DOESN'T EXIST
```

---

## 3. Goals

### 3.1 Primary Goal

**Zero `sigil-mark/` references remaining.**

```bash
grep -r "sigil-mark" --include="*.ts" --include="*.yaml" --include="*.md" | wc -l
# Target: 0
```

### 3.2 Secondary Goals

1. **Single version number** — All files report v9.1.0
2. **Complete file migration** — All referenced files exist in grimoire
3. **Clean skill paths** — Skills load from `grimoires/sigil/`
4. **Working `/craft` flow** — Agent can generate code without errors
5. **Deleted legacy directory** — No `sigil-mark/` in repo

### 3.3 Non-Goals

1. **Runtime layer creation** — That's a v10.0 feature, not migration debt
2. **New features** — This is purely technical debt cleanup
3. **Documentation overhaul** — Just path updates, not content changes

---

## 4. Requirements

### 4.1 P0: Fix All Process Layer Paths

**Files to update (42 references):**

| File | Current Default | Should Be |
|------|-----------------|-----------|
| `constitution-reader.ts` | `sigil-mark/constitution/...` | `grimoires/sigil/constitution/...` |
| `moodboard-reader.ts` | `sigil-mark/moodboard` | `grimoires/sigil/moodboard` |
| `persona-reader.ts` | `sigil-mark/personas/...` | `grimoires/sigil/constitution/...` |
| `vocabulary-reader.ts` | `sigil-mark/vocabulary/...` | `grimoires/sigil/constitution/...` |
| `decision-reader.ts` | `sigil-mark/consultation-chamber/...` | `grimoires/sigil/constitution/...` |
| `philosophy-reader.ts` | `sigil-mark/soul-binder/...` | `grimoires/sigil/constitution/...` |
| `vibe-check-reader.ts` | `sigil-mark/surveys/...` | `grimoires/sigil/...` |
| `lens-array-reader.ts` | `sigil-mark/lens-array/...` | `grimoires/sigil/...` |
| `governance-logger.ts` | `sigil-mark/governance` | `grimoires/sigil/state/...` |
| `agent-orchestration.ts` | `sigil-mark/vocabulary/...` | `grimoires/sigil/constitution/...` |
| `garden-command.ts` | `sigil-mark/` in SCAN_PATHS | `grimoires/sigil/` |

**Acceptance Criteria:**
- [ ] All 42 process layer references updated
- [ ] `grep -r "sigil-mark" grimoires/sigil/process/` returns 0 results

---

### 4.2 P0: Move Orphaned Files

**Move `protected-capabilities.yaml`:**

```bash
mv sigil-mark/constitution/protected-capabilities.yaml \
   grimoires/sigil/constitution/
```

**Create missing placeholder files:**

```bash
mkdir -p grimoires/sigil/constitution/decisions
mkdir -p grimoires/sigil/moodboard/evidence

touch grimoires/sigil/constitution/personas.yaml
touch grimoires/sigil/constitution/philosophy.yaml
touch grimoires/sigil/constitution/rules.md
```

**Acceptance Criteria:**
- [ ] `protected-capabilities.yaml` in grimoire
- [ ] All referenced directories exist
- [ ] All referenced files exist (can be placeholders)

---

### 4.3 P0: Fix Skill Paths

**Update `.claude/skills/crafting-guidance/SKILL.md`:**

Current (broken):
```yaml
zones:
  state:
    paths:
      - sigil-mark/rules.md
      - sigil-mark/vocabulary/vocabulary.yaml
      - sigil-mark/constitution/protected-capabilities.yaml
      - sigil-mark/personas/personas.yaml
```

Fixed:
```yaml
zones:
  state:
    paths:
      - grimoires/sigil/constitution/rules.md
      - grimoires/sigil/constitution/vocabulary.yaml
      - grimoires/sigil/constitution/protected-capabilities.yaml
      - grimoires/sigil/constitution/personas.yaml
```

**Update `.claude/skills/crafting-guidance/index.yaml`:**

Remove phantom file references:
```yaml
# DELETE these lines - files don't exist
checks:
  - path: sigil-mark/soul-binder/immutable-values.yaml
  - path: sigil-mark/soul-binder/canon-of-flaws.yaml
  - path: sigil-mark/lens-array/lenses.yaml
```

**Acceptance Criteria:**
- [ ] All skill paths point to `grimoires/sigil/`
- [ ] No references to non-existent files
- [ ] Skill loads successfully

---

### 4.4 P0: Fix CLAUDE.md References

**Update references to use grimoire paths:**

From:
```markdown
| `sigil-mark/process/survival-engine.ts` | Auto-promotion engine |
```

To:
```markdown
| `grimoires/sigil/process/survival-engine.ts` | Auto-promotion engine |
```

**Update import examples:**

From:
```typescript
import { useSigilMutation } from 'sigil-mark';
```

To:
```typescript
import { useMotion } from '@sigil/hooks';
// Note: Full runtime layer (useSigilMutation, CriticalZone) is Phase 2
```

**Acceptance Criteria:**
- [ ] All CLAUDE.md paths point to grimoire
- [ ] No references to non-existent runtime imports
- [ ] Clear note about what exists vs Phase 2

---

### 4.5 P1: Consolidate Version Numbers

**Update all files to v9.1.0:**

| File | Current | Target |
|------|---------|--------|
| `grimoires/sigil/README.md` | 9.0.0 | 9.1.0 |
| `.sigilrc.yaml` | 4.1.0 | 9.1.0 |
| `constitution.yaml` | 5.0.0 | 9.1.0 |
| `vocabulary.yaml` | 5.0.0 | 9.1.0 |
| `CLAUDE.md` header | v7.6 | v9.1 |
| `process/index.ts` header | v4.1 | v9.1 |
| `skills/crafting-guidance/SKILL.md` | v4.1 | v9.1 |

**Acceptance Criteria:**
- [ ] All version references are 9.1.0
- [ ] No mixed version numbers in codebase

---

### 4.6 P1: Update tsconfig.json

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

**Fixed:**
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
- [ ] tsconfig paths point to correct locations
- [ ] TypeScript compilation works
- [ ] Imports resolve correctly

---

### 4.7 P1: Align Physics Values

**Current inconsistencies:**

| Motion | useMotion.ts | physics.yaml | vocabulary.yaml | .sigilrc.yaml |
|--------|--------------|--------------|-----------------|---------------|
| reassuring | N/A | N/A | 600ms | 1200ms ⚠️ |

**Fix:** Use `physics.yaml` as source of truth, update all others.

**Acceptance Criteria:**
- [ ] All physics values consistent across files
- [ ] Single source of truth established

---

### 4.8 P2: Delete Legacy Structure

**After all fixes verified:**

```bash
rm -rf sigil-mark/
```

**Safety check before deletion:**
```bash
# Verify no sigil-mark references remain
grep -r "sigil-mark" --include="*.ts" --include="*.yaml" --include="*.md" | wc -l
# Must be 0
```

**Acceptance Criteria:**
- [ ] All references updated first
- [ ] Validation script passes
- [ ] `sigil-mark/` directory deleted
- [ ] Git commit with deletion

---

## 5. File Changes Summary

### Files to Update

| File | Changes |
|------|---------|
| `grimoires/sigil/process/*.ts` (11 files) | Update DEFAULT_*_PATH constants |
| `.claude/skills/crafting-guidance/SKILL.md` | Update all paths |
| `.claude/skills/crafting-guidance/index.yaml` | Remove phantom references |
| `CLAUDE.md` | Update paths, clarify runtime layer |
| `tsconfig.json` | Fix path aliases |
| `.sigilrc.yaml` | Update version |
| `grimoires/sigil/constitution/*.yaml` | Update versions |
| `grimoires/sigil/README.md` | Update version |

### Files to Move

| From | To |
|------|-----|
| `sigil-mark/constitution/protected-capabilities.yaml` | `grimoires/sigil/constitution/` |
| `sigil-mark/kernel/schemas/*.json` | `grimoires/sigil/schemas/` |

### Files to Create

| Path | Content |
|------|---------|
| `grimoires/sigil/constitution/personas.yaml` | Placeholder with depositor, newcomer, power_user |
| `grimoires/sigil/constitution/philosophy.yaml` | Placeholder with core principles |
| `grimoires/sigil/constitution/rules.md` | Placeholder with motion rules |
| `grimoires/sigil/constitution/decisions/README.md` | Directory placeholder |
| `grimoires/sigil/moodboard/evidence/README.md` | Directory placeholder |

### Files to Delete

| Path | Reason |
|------|--------|
| `sigil-mark/` (entire directory) | Migration complete |

---

## 6. Implementation Sprints

### Sprint 1: Process Layer Fixes (P0)

1. Update all 11 process layer files with correct paths
2. Move `protected-capabilities.yaml` to grimoire
3. Create missing placeholder files and directories
4. Verify `grep sigil-mark process/` returns 0

**Exit Criteria:** Process layer compiles, no sigil-mark references

### Sprint 2: Skills + Configuration (P0-P1)

5. Update skill SKILL.md paths
6. Update skill index.yaml, remove phantom references
7. Fix CLAUDE.md references
8. Update tsconfig.json aliases
9. Consolidate version numbers to 9.1.0

**Exit Criteria:** Skills load, TypeScript compiles, consistent versions

### Sprint 3: Validation + Cleanup (P1-P2)

10. Run validation script
11. Fix any remaining references
12. Align physics values
13. Delete `sigil-mark/` directory
14. Final audit

**Exit Criteria:** Zero sigil-mark references, clean repo

---

## 7. Validation Script

```bash
#!/bin/bash
# Run after each sprint to verify progress

echo "=== SIGIL v9.1 MIGRATION VALIDATION ==="

echo ""
echo "1. Checking for remaining sigil-mark references..."
REMAINING=$(grep -r "sigil-mark" --include="*.ts" --include="*.yaml" --include="*.md" --include="*.json" 2>/dev/null | grep -v ".bak" | wc -l)

if [ "$REMAINING" -gt 0 ]; then
  echo "❌ FAIL: $REMAINING references remain"
  grep -r "sigil-mark" --include="*.ts" --include="*.yaml" --include="*.md" --include="*.json" 2>/dev/null | head -10
else
  echo "✅ PASS: No sigil-mark references found"
fi

echo ""
echo "2. Checking for required grimoire files..."
REQUIRED_FILES=(
  "grimoires/sigil/constitution/constitution.yaml"
  "grimoires/sigil/constitution/physics.yaml"
  "grimoires/sigil/constitution/vocabulary.yaml"
  "grimoires/sigil/constitution/protected-capabilities.yaml"
  "grimoires/sigil/constitution/personas.yaml"
  "grimoires/sigil/constitution/philosophy.yaml"
  "grimoires/sigil/constitution/rules.md"
  "grimoires/sigil/moodboard/README.md"
)

for f in "${REQUIRED_FILES[@]}"; do
  if [ -f "$f" ]; then
    echo "  ✓ $f"
  else
    echo "  ❌ MISSING: $f"
  fi
done

echo ""
echo "3. Checking version consistency..."
grep -r "version:" --include="*.yaml" grimoires/sigil/ | head -10

echo ""
echo "4. Checking process layer defaults..."
grep -r "DEFAULT_.*_PATH" grimoires/sigil/process/*.ts 2>/dev/null | head -10

echo ""
echo "=== VALIDATION COMPLETE ==="
```

---

## 8. Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| `sigil-mark/` references | 81 | 0 |
| Version numbers in use | 6+ | 1 (v9.1.0) |
| Missing referenced files | 6+ | 0 |
| Phantom skill references | 3 | 0 |
| `sigil-mark/` directory | Exists | Deleted |

---

## 9. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missed reference breaks agent | Agent fails to load context | Run validation after each sprint |
| Placeholder files lack content | Skills work but incomplete | Placeholder is acceptable for v9.1 |
| Breaking change for downstream | Imports fail | This repo is source of truth |
| Runtime layer still missing | Imports fail | Document clearly as Phase 2 |

---

## 10. Out of Scope

- **Runtime layer creation** (useSigilMutation, CriticalZone, etc.) — Phase 2
- **New features or capabilities** — This is debt cleanup only
- **Component creation** — Gold registry is empty, that's acceptable
- **Documentation overhaul** — Just path updates

---

## 11. The Promise

After v9.1:

```
grep -r "sigil-mark" | wc -l
0

ls sigil-mark/
ls: sigil-mark/: No such file or directory

cat grimoires/sigil/constitution/physics.yaml | head -1
# Sigil v9.1.0 - Physics Configuration
```

**The migration will be complete.**

---

*PRD Generated: 2026-01-11*
*Sources: MIGRATION_AUDIT_REPORT.md, FULL_TECHNICAL_AUDIT.md, migrate-to-grimoire.sh*
*Key Insight: v9.0 was a partial rename. v9.1 completes the migration.*
*Estimated Effort: 3 sprints, ~2-4 hours total*
