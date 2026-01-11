# SDD: Sigil/Loa Command Consolidation

**Version:** 1.0
**Date:** 2026-01-09
**Status:** DRAFT
**PRD Reference:** `loa-grimoire/prd-consolidation.md`

---

## 1. Executive Summary

This document specifies the technical design for consolidating Sigil/Loa from 88 entry points (39 commands + 49 skills) to approximately 40 entry points (20 commands + 20 skills). The consolidation involves file deletion, metadata updates, and documentation alignment—no new code is required.

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Namespace approach | Keep as-is | Document ownership in file headers |
| Skill exposure | All internal | Commands are user interface |
| Deprecation strategy | Mark → Remove | Two-phase for safety |
| Version references | Standardize to v6.1 | Single source of truth |

---

## 2. System Architecture

### Current State

```
.claude/
├── commands/          # 39 files (user entry points)
│   ├── craft.md       # Sigil v6.1
│   ├── implement.md   # Loa
│   ├── sandbox.md     # Deprecated (v1.2.4)
│   └── ...
├── skills/            # 49 directories (implementation)
│   ├── crafting-guidance/
│   ├── implementing-tasks/
│   ├── forging-patterns/  # Deprecated
│   └── ...
└── hooks/             # Claude Code hooks
    └── ...
```

### Target State

```
.claude/
├── commands/          # 20 files (10 Sigil + 10 Loa)
│   ├── craft.md       # Sigil - Design guidance
│   ├── garden.md      # Sigil - Pattern gardening
│   ├── audit.md       # Sigil - Visual consistency
│   ├── approve.md     # Sigil - Canonical promotion
│   ├── reset-seed.md  # Sigil - Virtual Sanctuary
│   ├── new-era.md     # Sigil - Era transition
│   ├── envision.md    # Sigil - Moodboard creation
│   ├── codify.md      # Sigil - Rule extraction
│   ├── consult.md     # Sigil - Decision management
│   ├── sigil-setup.md # Sigil - Initialization
│   ├── setup.md       # Loa - Initialization
│   ├── plan-and-analyze.md  # Loa - PRD
│   ├── architect.md   # Loa - SDD
│   ├── sprint-plan.md # Loa - Sprint planning
│   ├── implement.md   # Loa - Task execution
│   ├── review-sprint.md     # Loa - Code review
│   ├── audit-sprint.md      # Loa - Security audit
│   ├── ride.md        # Loa - Codebase analysis
│   ├── mount.md       # Loa - Framework mounting
│   └── feedback.md    # Loa - Issue submission
├── skills/            # ~20 directories
│   ├── crafting-guidance/   # Internal - /craft
│   ├── gardening-entropy/   # Internal - /garden
│   ├── auditing-cohesion/   # Internal - /audit
│   ├── approving-patterns/  # Internal - /approve
│   ├── seeding-sanctuary/   # Internal - /reset-seed
│   ├── managing-eras/       # Internal - /new-era
│   ├── envisioning-moodboard/  # Internal - /envision
│   ├── codifying-rules/     # Internal - /codify
│   ├── consulting-decisions/   # Internal - /consult
│   ├── validating-physics/  # Hook - PreToolUse
│   ├── observing-survival/  # Hook - PostToolUse
│   ├── chronicling-rationale/  # Hook - Stop
│   ├── graphing-imports/    # Hook - Startup
│   ├── scanning-sanctuary/  # Internal - component discovery
│   ├── querying-workshop/   # Internal - index queries
│   ├── discovering-requirements/  # Loa - /plan-and-analyze
│   ├── designing-architecture/    # Loa - /architect
│   ├── planning-sprints/    # Loa - /sprint-plan
│   ├── implementing-tasks/  # Loa - /implement
│   ├── reviewing-code/      # Loa - /review-sprint
│   ├── auditing-security/   # Loa - /audit-sprint
│   └── riding-codebase/     # Loa - /ride
└── hooks/             # Unchanged
```

---

## 3. Component Design

### 3.1 Commands to Delete (7)

| Command | File Path | Reason |
|---------|-----------|--------|
| `/forge` | `.claude/commands/forge.md` | Replaced by optimistic divergence in v6.1 |
| `/zone` | `.claude/commands/zone.md` | Deprecated in v0.5, redirects to /map |
| `/sandbox` | `.claude/commands/sandbox.md` | v1.2.4 experimentation mode |
| `/material` | `.claude/commands/material.md` | v4.0 concept, vocabulary-based now |
| `/validate` | `.claude/commands/validate.md` | v2.0, hook handles this |
| `/greenlight` | `.claude/commands/greenlight.md` | v1.2.4 approval workflow |
| `/sync` | `.claude/commands/sync.md` | Undocumented, orphaned |

### 3.2 Commands to Consolidate (8 → 3)

| Original | Target | Action |
|----------|--------|--------|
| `/envision` | `/envision` | KEEP - moodboard creation |
| `/codify` | `/codify` | KEEP - absorbs rule extraction |
| `/map` | DELETE | Zone detection is automatic |
| `/consult` | `/consult` | KEEP - decision management |
| `/unlock` | DELETE | Merge into /consult |
| `/translate` | `/translate` | KEEP - executive communication |
| `/translate-ride` | DELETE | Merge into /translate |
| `/prove`, `/graduate` | REVIEW | May keep both or merge |

### 3.3 Skills to Delete (7)

| Skill | Directory | Reason |
|-------|-----------|--------|
| forging-patterns | `.claude/skills/forging-patterns/` | /forge deprecated |
| codifying-recipes | `.claude/skills/codifying-recipes/` | v1.2.4 concept |
| codifying-materials | `.claude/skills/codifying-materials/` | v4.0 concept |
| validating-fidelity | `.claude/skills/validating-fidelity/` | Merged into validating-physics |
| validating-lenses | `.claude/skills/validating-lenses/` | v2.0 concept |
| mapping-zones | `.claude/skills/mapping-zones/` | Path detection deprecated |
| greenlighting-concepts | `.claude/skills/greenlighting-concepts/` | Old workflow |

### 3.4 Uncertain Commands (8)

These require stakeholder review before action:

| Command | Current Status | Recommendation |
|---------|----------------|----------------|
| `/canonize` | Canon of Flaws | KEEP if flaws are tracked |
| `/inherit` | Design inheritance | DELETE if unused |
| `/contribute` | PR workflow | MOVE to Loa |
| `/mcp-config` | MCP setup | KEEP (one-time use is fine) |
| `/sigil-setup` | Sigil init | KEEP (separate from Loa /setup) |
| `/deploy-production` | Deployment | MOVE to Loa |
| `/audit-deployment` | Deployment audit | MOVE to Loa |
| `/update` | Framework update | MOVE to Loa |

---

## 4. Data Architecture

### 4.1 Command File Format

All commands use this structure:

```markdown
# Command Name

**Owner:** Sigil | Loa
**Version:** 6.1
**Skill:** skill-name (if applicable)
**Status:** Active | Deprecated

## Purpose
Brief description

## Usage
/command [args]

## Workflow
1. Step one
2. Step two

## Arguments
| Arg | Description | Required |
|-----|-------------|----------|

## Outputs
| Path | Description |
|------|-------------|

## Error Handling
| Error | Cause | Resolution |
|-------|-------|------------|
```

### 4.2 Skill Directory Format

Each skill follows this structure:

```
.claude/skills/{skill-name}/
├── SKILL.md           # Skill documentation
├── index.ts           # Main implementation (if TS)
└── templates/         # Output templates (if any)
```

### 4.3 File Ownership Header

Add to top of each command file:

```markdown
---
owner: sigil          # or "loa"
version: "6.1"
skill: crafting-guidance
status: active        # or "deprecated"
deprecated_by: null   # command that replaces this
---
```

---

## 5. Implementation Approach

### 5.1 Phase 1: Deprecation (Non-Breaking)

**Goal:** Mark deprecated commands without breaking existing usage.

**Tasks:**

1. **Add frontmatter to deprecated commands**
   ```yaml
   ---
   status: deprecated
   deprecated_by: /craft  # or null
   version: "6.1"
   ---
   ```

2. **Update SKILL.md files**
   - Add deprecation notice at top
   - Reference replacement if applicable

3. **Update CLAUDE.md**
   - Add "Deprecated Commands" section
   - Document migration path

4. **Create deprecation guide**
   - `loa-grimoire/deprecation-guide.md`
   - Map old → new commands

**Files Modified:**
- `.claude/commands/forge.md` (add deprecated frontmatter)
- `.claude/commands/zone.md`
- `.claude/commands/sandbox.md`
- `.claude/commands/material.md`
- `.claude/commands/validate.md`
- `.claude/commands/greenlight.md`
- `.claude/commands/sync.md`
- `CLAUDE.md` (add deprecation section)
- `loa-grimoire/deprecation-guide.md` (create)

### 5.2 Phase 2: Removal (Breaking)

**Goal:** Delete deprecated files, update registrations.

**Tasks:**

1. **Delete deprecated command files**
   ```bash
   rm .claude/commands/forge.md
   rm .claude/commands/zone.md
   rm .claude/commands/sandbox.md
   rm .claude/commands/material.md
   rm .claude/commands/validate.md
   rm .claude/commands/greenlight.md
   rm .claude/commands/sync.md
   ```

2. **Delete deprecated skill directories**
   ```bash
   rm -rf .claude/skills/forging-patterns/
   rm -rf .claude/skills/codifying-recipes/
   rm -rf .claude/skills/codifying-materials/
   rm -rf .claude/skills/validating-fidelity/
   rm -rf .claude/skills/validating-lenses/
   rm -rf .claude/skills/mapping-zones/
   rm -rf .claude/skills/greenlighting-concepts/
   ```

3. **Update CLAUDE.md**
   - Remove deprecated commands from reference
   - Update command count

4. **Update .claude/settings.json** (if exists)
   - Remove deprecated skill references

**Files Deleted:**
- 7 command files
- 7 skill directories

**Files Modified:**
- `CLAUDE.md`
- `.claude/settings.json` (if applicable)

### 5.3 Phase 3: Documentation Alignment

**Goal:** Ensure all remaining files reference v6.1.

**Tasks:**

1. **Update command files**
   - Add ownership frontmatter
   - Standardize version to "6.1"
   - Ensure consistent format

2. **Update SKILL.md files**
   - Add ownership header
   - Reference parent command

3. **Create command reference**
   - `docs/commands.md` or in README
   - Table of all commands with descriptions

4. **Update README.md**
   - Accurate command count
   - Quick reference table

**Files Modified:**
- 20 command files (add frontmatter)
- ~20 SKILL.md files (add headers)
- `README.md`
- `CLAUDE.md`

---

## 6. API Design

No API changes required. This is a file-system-level consolidation.

---

## 7. Security Architecture

### 7.1 Risk: Accidental Deletion

**Mitigation:** Git history preserves all deleted files. Tag release before deletion:
```bash
git tag v6.0-pre-consolidation
```

### 7.2 Risk: Broken References

**Mitigation:** Search for references before deletion:
```bash
rg "forge" .claude/ --type md
rg "forging-patterns" .claude/
```

### 7.3 Risk: Hook Failures

**Mitigation:** Hook-triggered skills (4) are in KEEP list:
- validating-physics
- observing-survival
- chronicling-rationale
- graphing-imports

---

## 8. Testing Strategy

### 8.1 Pre-Deletion Verification

Before Phase 2, verify:

```bash
# Check no active references to deprecated commands
rg "/forge" . --type md
rg "/sandbox" . --type md
rg "/material" . --type md

# Check no imports of deprecated skills
rg "forging-patterns" .
rg "codifying-recipes" .
rg "codifying-materials" .
```

### 8.2 Post-Deletion Verification

After Phase 2:

```bash
# Verify command count
ls .claude/commands/*.md | wc -l  # Should be ~20

# Verify skill count
ls -d .claude/skills/*/ | wc -l  # Should be ~20

# Test remaining commands work
# (manual verification in Claude Code)
```

### 8.3 Documentation Verification

After Phase 3:

- [ ] CLAUDE.md lists all 20 commands
- [ ] README.md has accurate counts
- [ ] All command files have frontmatter
- [ ] No version references other than v6.1

---

## 9. Deployment Architecture

N/A - This is a framework maintenance task, not a deployment.

---

## 10. Development Workflow

### Git Strategy

```bash
# Create feature branch
git checkout -b consolidate/command-cleanup

# Phase 1 commits
git commit -m "chore: mark deprecated commands"

# Phase 2 commits
git commit -m "chore: remove deprecated commands"
git commit -m "chore: remove deprecated skills"

# Phase 3 commits
git commit -m "docs: standardize command documentation"

# Merge
git checkout main
git merge consolidate/command-cleanup
git tag v6.1.1-consolidated
```

---

## 11. Technical Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| User relies on deprecated command | Medium | Medium | Deprecation phase warns first |
| Skill deletion breaks hook | High | Low | Only delete non-hook skills |
| Documentation drift | Low | Medium | Update docs in same sprint |
| Missing useful functionality | Medium | Low | Audit thoroughly in Phase 1 |

---

## 12. Future Considerations

### 12.1 Potential Further Consolidation

If 20 commands is still too many:
- Merge `/envision` + `/codify` → `/design`
- Merge `/audit` + `/garden` → `/check`

### 12.2 Namespace Separation

If Loa/Sigil need separation:
- Option A: Prefix commands (`/sigil-craft`, `/loa-implement`)
- Option B: Separate directories (`.claude/sigil/`, `.claude/loa/`)

Not recommended now—ownership header is sufficient.

### 12.3 Skill Consolidation

Future sprint could:
- Merge similar skills
- Reduce internal duplication

---

## 13. Appendix

### A. Complete Delete List

**Commands (7):**
1. `.claude/commands/forge.md`
2. `.claude/commands/zone.md`
3. `.claude/commands/sandbox.md`
4. `.claude/commands/material.md`
5. `.claude/commands/validate.md`
6. `.claude/commands/greenlight.md`
7. `.claude/commands/sync.md`

**Skills (7):**
1. `.claude/skills/forging-patterns/`
2. `.claude/skills/codifying-recipes/`
3. `.claude/skills/codifying-materials/`
4. `.claude/skills/validating-fidelity/`
5. `.claude/skills/validating-lenses/`
6. `.claude/skills/mapping-zones/`
7. `.claude/skills/greenlighting-concepts/`

### B. Final Command Reference

**Sigil Commands (10):**
| Command | Purpose |
|---------|---------|
| `/craft` | Zone-aware design guidance |
| `/garden` | Pattern gardening and health |
| `/audit` | Visual consistency check |
| `/approve` | Canonical pattern promotion |
| `/reset-seed` | Virtual Sanctuary restore |
| `/new-era` | Era transition |
| `/envision` | Moodboard creation |
| `/codify` | Rule extraction from code |
| `/consult` | Decision management |
| `/sigil-setup` | Initialize Sigil |

**Loa Commands (10):**
| Command | Purpose |
|---------|---------|
| `/setup` | Initialize Loa |
| `/plan-and-analyze` | PRD discovery |
| `/architect` | SDD creation |
| `/sprint-plan` | Sprint planning |
| `/implement` | Task execution |
| `/review-sprint` | Code review |
| `/audit-sprint` | Security audit |
| `/ride` | Codebase analysis |
| `/mount` | Framework mounting |
| `/feedback` | Issue submission |

### C. Final Skill Reference

**Hook-Triggered (4):**
- validating-physics (PreToolUse)
- observing-survival (PostToolUse)
- chronicling-rationale (Stop)
- graphing-imports (Startup)

**Internal - Sigil (8):**
- crafting-guidance
- gardening-entropy
- auditing-cohesion
- approving-patterns
- seeding-sanctuary
- managing-eras
- envisioning-moodboard
- codifying-rules

**Internal - Loa (7):**
- discovering-requirements
- designing-architecture
- planning-sprints
- implementing-tasks
- reviewing-code
- auditing-security
- riding-codebase

---

*SDD generated from /architect on 2026-01-09*
