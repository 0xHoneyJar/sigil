# Sigil v2 Sprint Plan

**Project**: Sigil v2 Design Context Framework
**Date**: 2026-01-01
**Team**: Solo developer + Claude Code
**Sprint Duration**: ~1 session each

---

## Sprint Overview

| Sprint | Focus | Commands Delivered |
|--------|-------|-------------------|
| Sprint 1 | Foundation | /setup, /update, mount-sigil.sh |
| Sprint 2 | Capture | /envision, /inherit |
| Sprint 3 | Rules | /codify, zones in .sigilrc.yaml |
| Sprint 4 | Guidance | /craft, /approve |

---

## Sprint 1: Foundation

**Goal**: Get Sigil installable and mounted on any repo.

### SIGIL-1: Create mount-sigil.sh

**Description**: One-liner install script that clones Sigil and creates symlinks.

**Acceptance Criteria**:
- [x] Clones repo to ~/.sigil/sigil (or updates if exists)
- [x] Creates .claude/commands/ directory
- [x] Creates .claude/skills/ directory
- [x] Symlinks all sigil-* skills
- [x] Symlinks all commands (setup, envision, codify, craft, approve, inherit, update)
- [x] Creates .sigil-version.json with version and timestamps
- [x] Works with `curl -fsSL ... | bash`

**Files**:
- `.claude/scripts/mount-sigil.sh`

---

### SIGIL-2: Implement /setup command

**Description**: Initialize Sigil on a repository.

**Acceptance Criteria**:
- [x] Creates sigil-mark/ directory
- [x] Creates sigil-mark/moodboard.md (empty template)
- [x] Creates sigil-mark/rules.md (empty template)
- [x] Creates sigil-mark/inventory.md (empty)
- [x] Detects component directories (components/, app/components/, src/components/)
- [x] Creates .sigilrc.yaml with detected component_paths
- [x] Creates .sigil-setup-complete marker
- [x] Idempotent (safe to run multiple times)

**Files**:
- `.claude/commands/setup.md`
- `.claude/skills/sigil-setup/index.yaml`
- `.claude/skills/sigil-setup/SKILL.md`
- `.claude/skills/sigil-setup/scripts/detect-components.sh`
- `.claude/templates/moodboard.md`
- `.claude/templates/rules.md`
- `.claude/templates/sigilrc.yaml`

---

### SIGIL-3: Implement /update command

**Description**: Pull latest Sigil framework and refresh symlinks.

**Acceptance Criteria**:
- [x] Checks for .sigil-version.json (validates Sigil is mounted)
- [x] Fetches latest from remote
- [x] Compares versions (local vs remote)
- [x] Pulls updates if available
- [x] Refreshes all symlinks (skills and commands)
- [x] Updates .sigil-version.json with new timestamp
- [x] --check flag shows updates without applying
- [x] --force flag refreshes even if current

**Files**:
- `.claude/commands/update.md`
- `.claude/skills/sigil-updating/index.yaml`
- `.claude/skills/sigil-updating/SKILL.md`
- `.claude/skills/sigil-updating/scripts/update.sh`

---

### SIGIL-4: Create framework structure

**Description**: Set up the Sigil repository structure with VERSION, README, CLAUDE.md.

**Acceptance Criteria**:
- [x] VERSION file with "2.0.0"
- [x] README.md with installation and usage
- [x] CLAUDE.md with agent context
- [x] Clean directory structure matching SDD

**Files**:
- `VERSION`
- `README.md`
- `CLAUDE.md`

---

### Sprint 1 Success Criteria

- [x] `curl ... | bash` installs Sigil
- [x] `/setup` creates sigil-mark/ and .sigilrc.yaml
- [x] `/update` refreshes framework
- [x] Framework structure matches SDD

---

## Sprint 2: Capture

**Goal**: Enable moodboard capture and codebase inheritance.

### SIGIL-5: Implement /envision command

**Description**: Interview-based moodboard capture.

**Acceptance Criteria**:
- [x] Checks for .sigil-setup-complete (preflight)
- [x] Uses AskUserQuestion for interview
- [x] Captures reference products/games
- [x] Captures feel descriptors by context
- [x] Captures anti-patterns with reasons
- [x] Captures key moments (high-stakes, celebrations, recovery)
- [x] Writes sigil-mark/moodboard.md with all captured context
- [x] Follow-up questions for specifics on each answer

**Interview Questions**:
1. Reference products: "What apps/games inspire this product's feel?"
2. Feel by context: "How should users feel during [transactions/success/loading/errors]?"
3. Anti-patterns: "What patterns should we explicitly avoid?"
4. Key moments: "Describe your ideal [high-stakes/celebration/recovery] moment"

**Files**:
- `.claude/commands/envision.md`
- `.claude/skills/sigil-envisioning/index.yaml`
- `.claude/skills/sigil-envisioning/SKILL.md`

---

### SIGIL-6: Implement /inherit command

**Description**: Bootstrap design system from existing codebase.

**Acceptance Criteria**:
- [x] Checks for .sigil-setup-complete (preflight)
- [x] Runs detect-components.sh to find all components
- [x] Generates sigil-mark/inventory.md with component list
- [x] Infers patterns from existing code (colors, spacing, motion)
- [x] Uses AskUserQuestion to gather tacit knowledge
- [x] Generates draft sigil-mark/moodboard.md
- [x] Generates draft sigil-mark/rules.md
- [x] Marks drafts clearly as needing human review

**Interview Questions**:
1. "What's the overall feel you're going for?"
2. "Are there any rejected patterns I should know about?"
3. "Which components are most representative of your design?"

**Files**:
- `.claude/commands/inherit.md`
- `.claude/skills/sigil-inheriting/index.yaml`
- `.claude/skills/sigil-inheriting/SKILL.md`
- `.claude/skills/sigil-inheriting/scripts/infer-patterns.sh`

---

### Sprint 2 Success Criteria

- [x] `/envision` captures moodboard through interview
- [x] `/inherit` scans codebase and creates drafts
- [x] Both produce valid moodboard.md files
- [x] Interview flow is natural and captures tacit knowledge

---

## Sprint 3: Rules

**Goal**: Enable design rule definition with zone support.

### SIGIL-7: Implement /codify command

**Description**: Define design rules by category through interview.

**Acceptance Criteria**:
- [x] Checks for .sigil-setup-complete (preflight)
- [x] Reads moodboard.md for context
- [x] Uses AskUserQuestion for each category
- [x] Captures color tokens (light/dark)
- [x] Captures typography rules
- [x] Captures spacing conventions
- [x] Captures motion rules by zone
- [x] Captures component-specific rules
- [x] Writes sigil-mark/rules.md organized by category
- [x] Updates .sigilrc.yaml with zone definitions

**Interview Categories**:
1. Colors: "What are your key color tokens?"
2. Typography: "What typography patterns do you use?"
3. Spacing: "What are your spacing conventions?"
4. Motion: "How should motion differ by zone?"
5. Components: "Any component-specific rules?"

**Files**:
- `.claude/commands/codify.md`
- `.claude/skills/sigil-codifying/index.yaml`
- `.claude/skills/sigil-codifying/SKILL.md`

---

### SIGIL-8: Implement zone system

**Description**: Path-based zone resolution for design context.

**Acceptance Criteria**:
- [x] .sigilrc.yaml supports zones section
- [x] Each zone has paths (glob patterns)
- [x] Each zone has motion preference
- [x] Each zone has preferred/warned patterns
- [x] get-zone.sh resolves file path to zone
- [x] Fallback to "default" zone if no match

**Files**:
- `.claude/scripts/get-zone.sh`
- `.claude/scripts/parse-rules.sh`
- Updated `.claude/templates/sigilrc.yaml`

---

### Sprint 3 Success Criteria

- [x] `/codify` captures rules through interview
- [x] rules.md is organized by category
- [x] .sigilrc.yaml has zone definitions
- [x] get-zone.sh correctly resolves file paths

---

## Sprint 4: Guidance

**Goal**: Enable design guidance during implementation.

### SIGIL-9: Implement /craft command

**Description**: Provide design guidance during implementation.

**Acceptance Criteria**:
- [x] Checks for .sigil-setup-complete (preflight)
- [x] Loads moodboard.md into context
- [x] Loads rules.md into context
- [x] Determines zone from file path (if provided)
- [x] Answers questions about design patterns
- [x] Suggests recipes based on zone
- [x] Warns about rejected patterns (doesn't refuse)
- [x] Purely conversational (no file output)

**Usage Examples**:
- `/craft` - General design guidance
- `/craft components/Button.tsx` - Zone-specific guidance
- `/craft "How should loading states work?"` - Answer question

**Files**:
- `.claude/commands/craft.md`
- `.claude/skills/sigil-crafting/index.yaml`
- `.claude/skills/sigil-crafting/SKILL.md`

---

### SIGIL-10: Implement /approve command

**Description**: Human review and sign-off on patterns.

**Acceptance Criteria**:
- [x] Checks for .sigil-setup-complete (preflight)
- [x] Takes component or pattern name as argument
- [x] Reads applicable rules from rules.md
- [x] Presents for human review via AskUserQuestion
- [x] Records approval in rules.md Approvals section
- [x] Includes date and approver
- [x] Simple approve/reject (no automated validation)

**Usage**:
- `/approve Button` - Approve Button component
- `/approve "motion in checkout"` - Approve motion pattern

**Files**:
- `.claude/commands/approve.md`
- `.claude/skills/sigil-approving/index.yaml`
- `.claude/skills/sigil-approving/SKILL.md`

---

### SIGIL-11: Recipe templates

**Description**: Provide example motion recipes for user adaptation.

**Acceptance Criteria**:
- [x] useDeliberateEntrance.ts template
- [x] usePlayfulBounce.ts template
- [x] useSnappyTransition.ts template
- [x] Each with JSDoc explaining zone and feel
- [x] Works with react-spring (can adapt to framer-motion)

**Files**:
- `templates/recipes/useDeliberateEntrance.ts`
- `templates/recipes/usePlayfulBounce.ts`
- `templates/recipes/useSnappyTransition.ts`
- `templates/recipes/README.md`

---

### Sprint 4 Success Criteria

- [x] `/craft` provides contextual design guidance
- [x] `/approve` records human sign-off
- [x] Recipe templates are usable
- [x] Full workflow functional: setup → envision → codify → craft → approve

---

## Task Summary

| Sprint | Task ID | Task | Priority |
|--------|---------|------|----------|
| 1 | SIGIL-1 | mount-sigil.sh | High |
| 1 | SIGIL-2 | /setup command | High |
| 1 | SIGIL-3 | /update command | Medium |
| 1 | SIGIL-4 | Framework structure | High |
| 2 | SIGIL-5 | /envision command | High |
| 2 | SIGIL-6 | /inherit command | High |
| 3 | SIGIL-7 | /codify command | High |
| 3 | SIGIL-8 | Zone system | High |
| 4 | SIGIL-9 | /craft command | High |
| 4 | SIGIL-10 | /approve command | Medium |
| 4 | SIGIL-11 | Recipe templates | Low |

---

## Dependencies

```
SIGIL-1 (mount)
    ↓
SIGIL-2 (setup) ← SIGIL-4 (structure)
    ↓
SIGIL-3 (update)
    ↓
SIGIL-5 (envision) ←→ SIGIL-6 (inherit)
    ↓
SIGIL-7 (codify) ← SIGIL-8 (zones)
    ↓
SIGIL-9 (craft) ←→ SIGIL-10 (approve)
    ↓
SIGIL-11 (recipes)
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Interview flow awkward | Test with S&F as first target |
| Zone matching too complex | Start with simple patterns |
| Rules format unclear | Follow SDD examples exactly |
| yq not available | Fallback to grep/sed in all scripts |

---

## Definition of Done

Each sprint is complete when:
1. All acceptance criteria met
2. Commands work in Claude Code
3. Scripts have set -e and error handling
4. Files match SDD structure
5. Tested on target repo (S&F for final sprint)

---

## Next Steps

After sprint plan approval:
```
/implement sprint-1
```

Target: Mount Sigil on S&F repo after Sprint 4 completion.
