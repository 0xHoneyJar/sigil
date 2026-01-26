# Sprint Plan: Sigil Simplification & UNIX Decomposition

**Version**: 1.0
**Date**: 2026-01-25
**PRD**: `grimoires/loa/prd-sigil-simplification.md`
**SDD**: `grimoires/loa/sdd-sigil-simplification.md`

---

## Overview

**Goal**: Decompose Sigil from 6,231-line monolith to ~1,630 lines across 3 focused constructs.

**Team**: Solo developer (ruthlessly optimized for one person)
**Sprint Duration**: 1 day per sprint (aggressive, UNIX philosophy)

| Metric | Before | After | Reduction |
|--------|--------|-------|-----------|
| Rule lines | 6,231 | ~1,310 | 79% |
| Skills | 29 | 6 | 79% |
| Commands | 46 | 3 | 93% |

---

## Sprint 1: Delete Dead Code & Archive

**Goal**: Remove obvious bloat with zero functionality loss.

### Tasks

#### 1.1 Delete Dead Skills
**Description**: Remove skills with 0 references in codebase.
**Files**:
```bash
rm -rf .claude/skills/changelog-generation
rm -rf .claude/skills/mounting-framework
rm -rf .claude/skills/synthesizing-taste
rm -rf .claude/skills/updating-framework
rm -rf .claude/skills/updating-sigil
```
**Acceptance**: `ls .claude/skills/ | wc -l` decreases by 5
**Effort**: 5 min

#### 1.2 Delete Theoretical Rules
**Description**: Remove rules for CLIs/features that don't exist.
**Files**:
```bash
rm -f .claude/rules/18-sigil-complexity.md    # 1,013 lines, never triggered
rm -f .claude/rules/22-sigil-anchor-lens.md   # CLI doesn't exist
rm -f .claude/rules/23-sigil-hud.md           # Package not used
rm -f .claude/rules/24-sigil-agentation.md    # Cut until actually used
```
**Acceptance**: ~2,000 lines removed, `wc -l .claude/rules/*.md` decreases
**Effort**: 5 min

#### 1.3 Archive Unused Commands
**Description**: Move 43 unused commands to archive (keep sigil, glyph, rigor placeholders).
**Files**:
```bash
mkdir -p grimoires/archive/commands
# Move all except craft.md, observe.md (will become sigil.md, glyph.md)
```
**Acceptance**: `.claude/commands/` has ≤5 files
**Effort**: 10 min

#### 1.4 Archive UI Copy for Future Voice
**Description**: Preserve UI copy rules as seed for future Voice construct.
**Files**:
```bash
mkdir -p grimoires/archive/future-voice
mv .claude/rules/21-sigil-ui-copy.md grimoires/archive/future-voice/
```
**Acceptance**: File moved, not deleted
**Effort**: 2 min

### Sprint 1 Verification
- [ ] Dead skills deleted (5 directories gone)
- [ ] Theoretical rules deleted (~2,000 lines removed)
- [ ] Unused commands archived
- [ ] UI copy preserved for Voice
- [ ] Git commit: "chore: delete dead code and archive unused"

---

## Sprint 2: Create Directory Structure & Fresh State

**Goal**: Set up the new 3-construct architecture.

### Tasks

#### 2.1 Create Construct Directories
**Description**: Create new directory structure per SDD.
**Files**:
```bash
mkdir -p .claude/rules/sigil
mkdir -p .claude/rules/glyph
mkdir -p .claude/rules/rigor
```
**Acceptance**: Three directories exist under `.claude/rules/`
**Effort**: 2 min

#### 2.2 Create Fresh taste.md
**Description**: Archive legacy taste.md, create fresh free-form version.
**Files**:
```bash
mv grimoires/sigil/taste.md grimoires/archive/taste-legacy.md
# Create new taste.md with header only
```
**Content**:
```markdown
# Taste Log

Append-only insights from user conversations, observations, and inspiration.
No schema. No weights. Just human insights that Claude reads and applies.

---

```
**Acceptance**: Fresh taste.md exists, legacy archived
**Effort**: 5 min

#### 2.3 Create Skill Directories
**Description**: Create skill directories per Anthropic best practices.
**Files**:
```bash
# Archive existing (except agent-browser)
mkdir -p grimoires/archive/skills
# Move existing skills to archive

# Create new structure
mkdir -p .claude/skills/observing
mkdir -p .claude/skills/crafting
mkdir -p .claude/skills/enforcing
mkdir -p .claude/skills/physics-reference
mkdir -p .claude/skills/patterns-reference
```
**Acceptance**: 6 skill directories (5 new + agent-browser)
**Effort**: 10 min

### Sprint 2 Verification
- [ ] `.claude/rules/sigil/`, `glyph/`, `rigor/` exist
- [ ] Fresh `taste.md` created
- [ ] Legacy taste archived
- [ ] Skill directories created
- [ ] Git commit: "chore: create construct directory structure"

---

## Sprint 3: Write Sigil Construct (Taste)

**Goal**: Create the Sigil construct (~150 lines total).

### Tasks

#### 3.1 Write 00-sigil-core.md
**Description**: Core philosophy for taste capture.
**Location**: `.claude/rules/sigil/00-sigil-core.md`
**Content**: ~50 lines covering:
- When to use Sigil
- Philosophy (free-form insights, not automated signals)
- Command reference
**Acceptance**: File exists, under 60 lines
**Effort**: 15 min

#### 3.2 Write 01-sigil-taste.md
**Description**: How Glyph reads and applies taste.
**Location**: `.claude/rules/sigil/01-sigil-taste.md`
**Content**: ~100 lines covering:
- taste.md location and format
- How to apply taste when crafting
- Examples
**Acceptance**: File exists, under 120 lines
**Effort**: 20 min

#### 3.3 Write observing/SKILL.md
**Description**: Task skill for /sigil command.
**Location**: `.claude/skills/observing/SKILL.md`
**Content**: ~30 lines with frontmatter:
```yaml
---
name: observing
description: Capture taste insights from user conversations
user-invocable: true
disable-model-invocation: true
allowed-tools: Read, Write
---
```
**Acceptance**: File exists, has correct frontmatter, under 50 lines
**Effort**: 10 min

#### 3.4 Write sigil.md Command
**Description**: Thin command invoking observing skill.
**Location**: `.claude/commands/sigil.md`
**Content**: ~15 lines
**Acceptance**: File exists, invokes `observing` skill
**Effort**: 5 min

### Sprint 3 Verification
- [ ] `sigil/00-sigil-core.md` exists (~50 lines)
- [ ] `sigil/01-sigil-taste.md` exists (~100 lines)
- [ ] `observing/SKILL.md` exists with correct frontmatter
- [ ] `sigil.md` command exists
- [ ] `/sigil "test insight"` appends to taste.md
- [ ] Git commit: "feat(sigil): implement taste construct"

---

## Sprint 4: Write Glyph Construct (Craft) - Core Rules

**Goal**: Create core Glyph rules (~500 lines).

### Tasks

#### 4.1 Write 00-glyph-core.md
**Description**: Instruction priority, permissions, action default.
**Location**: `.claude/rules/glyph/00-glyph-core.md`
**Content**: ~100 lines from existing 00-sigil-core.md, simplified
**Acceptance**: Under 120 lines
**Effort**: 20 min

#### 4.2 Write 01-glyph-physics.md
**Description**: THE physics table - the gem.
**Location**: `.claude/rules/glyph/01-glyph-physics.md`
**Content**: ~70 lines - 6-row table + sync strategies + timing rationale
**Source**: Extract from 01-sigil-physics.md
**Acceptance**: Contains physics table, under 80 lines
**Effort**: 15 min

#### 4.3 Write 02-glyph-detection.md
**Description**: Effect detection + merged keywords from lexicon.
**Location**: `.claude/rules/glyph/02-glyph-detection.md`
**Content**: ~150 lines - detection priority, keyword lists, ambiguity resolution
**Source**: Merge 02-sigil-detection.md + 08-sigil-lexicon.md
**Acceptance**: Keywords merged in, lexicon deleted, under 170 lines
**Effort**: 25 min

#### 4.4 Write 03-glyph-protected.md
**Description**: Non-negotiable capabilities.
**Location**: `.claude/rules/glyph/03-glyph-protected.md`
**Content**: ~80 lines - capabilities table, verification checklist, forbidden patterns
**Source**: From 04-sigil-protected.md
**Acceptance**: All protected capabilities present, under 100 lines
**Effort**: 15 min

### Sprint 4 Verification
- [ ] Core Glyph rules created (4 files)
- [ ] Total ~400 lines for core
- [ ] Keywords merged from lexicon
- [ ] Delete 08-sigil-lexicon.md (merged into detection)
- [ ] Git commit: "feat(glyph): implement core rules"

---

## Sprint 5: Write Glyph Construct - Patterns & Best Practices

**Goal**: Complete Glyph rules (~360 lines more).

### Tasks

#### 5.1 Write 04-glyph-patterns.md
**Description**: Three golden patterns (Financial, Standard, Local).
**Location**: `.claude/rules/glyph/04-glyph-patterns.md`
**Content**: ~100 lines - 3 reference implementations
**Source**: Trim 03-sigil-patterns.md to essentials
**Acceptance**: 3 patterns, under 120 lines
**Effort**: 20 min

#### 5.2 Write 05-glyph-animation.md
**Description**: Animation essentials.
**Location**: `.claude/rules/glyph/05-glyph-animation.md`
**Content**: ~80 lines - easing blueprint, spring presets, timing by effect
**Source**: Trim 05-sigil-animation.md
**Acceptance**: Core animation guidance, under 100 lines
**Effort**: 15 min

#### 5.3 Write 06-glyph-material.md
**Description**: Material essentials.
**Location**: `.claude/rules/glyph/06-glyph-material.md`
**Content**: ~80 lines - fidelity by effect, constraints, touch targets
**Source**: Trim 07-sigil-material.md
**Acceptance**: Core material guidance, under 100 lines
**Effort**: 15 min

#### 5.4 Write 07-glyph-practices.md
**Description**: Consolidated best practices (WCAG, React, performance).
**Location**: `.claude/rules/glyph/07-glyph-practices.md`
**Content**: ~200 lines - essentials from React rules 10-16
**Source**: Distill 7 React rule files into essentials
**Acceptance**: Under 250 lines, covers accessibility/async/bundle/performance
**Effort**: 45 min

### Sprint 5 Verification
- [ ] Glyph rules complete (8 files total)
- [ ] React rules consolidated into practices
- [ ] Delete original React rules (10-16)
- [ ] Total Glyph: ~860 lines
- [ ] Git commit: "feat(glyph): implement patterns and best practices"

---

## Sprint 6: Write Glyph Skills & Command

**Goal**: Create Glyph skills and command.

### Tasks

#### 6.1 Write crafting/SKILL.md
**Description**: Task skill for /glyph command.
**Location**: `.claude/skills/crafting/SKILL.md`
**Content**: ~50 lines with frontmatter:
```yaml
---
name: crafting
description: Generate or validate UI with design physics
user-invocable: true
disable-model-invocation: true
allowed-tools: Read, Write, Glob
---
```
**Acceptance**: Correct frontmatter, under 60 lines
**Effort**: 15 min

#### 6.2 Write physics-reference/SKILL.md
**Description**: Reference skill for physics tables.
**Location**: `.claude/skills/physics-reference/SKILL.md`
**Content**: ~80 lines with frontmatter:
```yaml
---
name: physics-reference
description: Design physics tables and timing rationale
user-invocable: false
---
```
**Acceptance**: `user-invocable: false`, under 100 lines
**Effort**: 20 min

#### 6.3 Write patterns-reference/SKILL.md
**Description**: Reference skill for golden patterns.
**Location**: `.claude/skills/patterns-reference/SKILL.md`
**Content**: ~80 lines with frontmatter:
```yaml
---
name: patterns-reference
description: Golden implementation patterns for each effect type
user-invocable: false
---
```
**Acceptance**: `user-invocable: false`, under 100 lines
**Effort**: 20 min

#### 6.4 Write glyph.md Command
**Description**: Thin command invoking crafting skill.
**Location**: `.claude/commands/glyph.md`
**Content**: ~15 lines
**Acceptance**: File exists, invokes `crafting` skill
**Effort**: 5 min

### Sprint 6 Verification
- [ ] `crafting/SKILL.md` exists with correct frontmatter
- [ ] `physics-reference/SKILL.md` exists (user-invocable: false)
- [ ] `patterns-reference/SKILL.md` exists (user-invocable: false)
- [ ] `glyph.md` command exists
- [ ] `/glyph "claim button"` shows analysis and generates code
- [ ] `/glyph validate file.tsx` validates component
- [ ] Git commit: "feat(glyph): implement skills and command"

---

## Sprint 7: Write Rigor Construct (Correctness)

**Goal**: Create the Rigor construct (~300 lines total).

### Tasks

#### 7.1 Write 00-rigor-core.md
**Description**: Philosophy - correctness over feel.
**Location**: `.claude/rules/rigor/00-rigor-core.md`
**Content**: ~50 lines
**Acceptance**: Clear distinction from Glyph, under 60 lines
**Effort**: 15 min

#### 7.2 Write 01-rigor-data.md
**Description**: Indexed vs on-chain decisions.
**Location**: `.claude/rules/rigor/01-rigor-data.md`
**Content**: ~100 lines - decision table, anti-patterns
**Source**: From 19-sigil-data-physics.md
**Acceptance**: Data source guidance, under 120 lines
**Effort**: 20 min

#### 7.3 Write 02-rigor-web3.md
**Description**: BigInt, receipts, stale closures.
**Location**: `.claude/rules/rigor/02-rigor-web3.md`
**Content**: ~150 lines - patterns that prevent $100k bugs
**Source**: From 20-sigil-web3-flows.md
**Acceptance**: All critical patterns, under 170 lines
**Effort**: 25 min

#### 7.4 Write enforcing/SKILL.md
**Description**: Task skill for /rigor command.
**Location**: `.claude/skills/enforcing/SKILL.md`
**Content**: ~50 lines with correct frontmatter
**Acceptance**: Correct frontmatter, under 60 lines
**Effort**: 15 min

#### 7.5 Write rigor.md Command
**Description**: Thin command invoking enforcing skill.
**Location**: `.claude/commands/rigor.md`
**Content**: ~15 lines
**Acceptance**: File exists, invokes `enforcing` skill
**Effort**: 5 min

### Sprint 7 Verification
- [ ] Rigor rules complete (3 files, ~300 lines)
- [ ] `enforcing/SKILL.md` exists
- [ ] `rigor.md` command exists
- [ ] `/rigor file.tsx` checks data correctness
- [ ] Delete original 19-*, 20-* rules
- [ ] Git commit: "feat(rigor): implement correctness construct"

---

## Sprint 8: Cleanup & Final Verification

**Goal**: Remove remaining legacy files, verify everything works.

### Tasks

#### 8.1 Delete Remaining Legacy Rules
**Description**: Remove all old rule files that have been migrated.
**Files to delete**:
```bash
rm -f .claude/rules/00-sigil-core.md
rm -f .claude/rules/01-sigil-physics.md
rm -f .claude/rules/02-sigil-detection.md
rm -f .claude/rules/03-sigil-patterns.md
rm -f .claude/rules/04-sigil-protected.md
rm -f .claude/rules/05-sigil-animation.md
rm -f .claude/rules/06-sigil-taste.md
rm -f .claude/rules/07-sigil-material.md
rm -f .claude/rules/08-sigil-lexicon.md
rm -f .claude/rules/10-react-core.md
rm -f .claude/rules/11-react-async.md
rm -f .claude/rules/12-react-bundle.md
rm -f .claude/rules/13-react-rendering.md
rm -f .claude/rules/14-react-rerender.md
rm -f .claude/rules/15-react-server.md
rm -f .claude/rules/16-react-js.md
rm -f .claude/rules/17-semantic-search.md
rm -f .claude/rules/19-sigil-data-physics.md
rm -f .claude/rules/20-sigil-web3-flows.md
rm -f .claude/rules/rlm-core-summary.md
rm -f .claude/rules/index.yaml
```
**Acceptance**: Only `sigil/`, `glyph/`, `rigor/` directories remain in rules
**Effort**: 10 min

#### 8.2 Delete Remaining Legacy Skills
**Description**: Remove archived skills from main directory.
**Acceptance**: Only 6 skill directories remain
**Effort**: 5 min

#### 8.3 Verify Line Counts
**Description**: Confirm reduction targets met.
**Commands**:
```bash
wc -l .claude/rules/sigil/*.md    # Target: ~150
wc -l .claude/rules/glyph/*.md    # Target: ~860
wc -l .claude/rules/rigor/*.md    # Target: ~300
wc -l .claude/skills/*/SKILL.md   # Target: ~290
```
**Acceptance**: Total under 1,700 lines
**Effort**: 5 min

#### 8.4 End-to-End Test
**Description**: Test all three commands work.
**Tests**:
1. `/sigil "test insight"` → Appends to taste.md
2. `/glyph "claim button"` → Shows analysis, generates code
3. `/glyph validate` → Validates current file
4. `/rigor` → Checks data correctness
**Acceptance**: All commands functional
**Effort**: 15 min

#### 8.5 Update CLAUDE.md
**Description**: Update main CLAUDE.md to reflect new structure.
**Content**: Keep under 500 lines per Anthropic guidance
**Acceptance**: CLAUDE.md reflects new constructs
**Effort**: 20 min

### Sprint 8 Verification
- [ ] All legacy rules deleted
- [ ] All legacy skills archived
- [ ] Line count targets met
- [ ] All commands functional
- [ ] CLAUDE.md updated
- [ ] Git commit: "chore: cleanup legacy and verify migration"

---

## Summary

| Sprint | Goal | Tasks | Effort |
|--------|------|-------|--------|
| 1 | Delete dead code | 4 | ~25 min |
| 2 | Create structure | 3 | ~20 min |
| 3 | Sigil construct | 4 | ~50 min |
| 4 | Glyph core rules | 4 | ~75 min |
| 5 | Glyph patterns/practices | 4 | ~95 min |
| 6 | Glyph skills/command | 4 | ~60 min |
| 7 | Rigor construct | 5 | ~80 min |
| 8 | Cleanup & verify | 5 | ~55 min |

**Total**: 33 tasks, ~8 hours

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Lost functionality | Git history preserves everything; archive don't delete |
| /glyph doesn't work | Test after Sprint 6 before continuing |
| Over-simplified | Start minimal, add back based on friction |

---

## Success Criteria

- [ ] 74% reduction in total lines (6,231 → ~1,630)
- [ ] 3 commands only (`/sigil`, `/glyph`, `/rigor`)
- [ ] 6 skills (3 task + 2 reference + 1 utility)
- [ ] All skills follow Anthropic best practices (frontmatter, <500 lines)
- [ ] `/glyph "claim button"` produces correct Financial physics
- [ ] Fresh taste.md with free-form format
