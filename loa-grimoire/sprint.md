# Sprint Plan: Sigil v1.2.4

**Version:** 1.2.4
**Created:** 2026-01-05
**Team:** Solo (1 engineer)
**Sprint Duration:** 2 weeks
**Build Strategy:** Refactor v1.0 to v1.2.4

---

## Overview

This plan refactors Sigil from v1.0 to v1.2.4, transitioning from a "validation framework" to an "apprenticeship learning system" built on the "Diff + Feel" philosophy.

### Key Changes from v1.0

| v1.0 | v1.2.4 |
|------|--------|
| 8 commands | 6 commands |
| YAML configs define physics | TSX recipes ARE the physics |
| vibes.yaml dictionary | Claude's training IS the vibe map |
| Taste Key authority | Trust the team |
| Complex Memory/Era system | In-repo history (markdown) |
| 4-panel Workbench | 3-pane Workbench with A/B toggle |

### Sprint Sequence

| Phase | Sprints | Focus |
|-------|---------|-------|
| Migration Foundation | 1 | Archive v1.0, create v1.2.4 structure |
| Recipe System | 2-3 | TSX recipes, 3 recipe sets, variant system |
| Zone System | 4 | New zone config format, resolution algorithm |
| Core Commands | 5-6 | /craft, /sandbox, /codify |
| Auxiliary Commands | 7 | /inherit, /validate, /garden |
| Workbench | 8 | tmux + A/B toggle + Chrome MCP |
| Enforcement | 9 | ESLint plugin, CI integration |
| Polish | 10 | History system, documentation, testing |

---

## Sprint 1: Migration Foundation (Weeks 1-2)

**Goal:** Archive v1.0 structure, create clean v1.2.4 foundation

### Tasks

- [x] **S1-T1: Archive v1.0 state zone structure**
  - Move `sigil-mark/core/`, `sigil-mark/resonance/`, `sigil-mark/memory/`, `sigil-mark/taste-key/` to `sigil-mark/.archive-v1.0/`
  - Keep `sigil-mark/` directory but clear for v1.2.4 structure
  - **Acceptance:** v1.0 files preserved in archive, root is clean

- [x] **S1-T2: Create v1.2.4 directory structure**
  - Create `sigil-mark/recipes/` with `decisive/`, `machinery/`, `glass/` subdirectories
  - Create `sigil-mark/hooks/` for shared hooks
  - Create `sigil-mark/history/` for refinement history
  - Create `sigil-mark/reports/` for garden reports
  - **Acceptance:** Directory matches SDD §10.1

- [x] **S1-T3: Refactor .sigilrc.yaml format**
  - Update root `.sigilrc.yaml` to v1.2.4 schema
  - Add `sigil: "1.2.4"` version field
  - Add `recipes:` field (default: machinery)
  - Add optional `sync:`, `tick:`, `constraints:`, `sandbox:` fields
  - **Acceptance:** Config matches SDD §4.1 schema

- [x] **S1-T4: Update .sigil-version.json**
  - Update version to "1.2.4"
  - Add recipes count tracking
  - Add variants count tracking
  - Add last_garden timestamp
  - **Acceptance:** Version tracking matches SDD §10.2

- [x] **S1-T5: Create CLAUDE.md for v1.2.4**
  - Write Sigil v1.2.4 prompt based on SDD §6.2
  - Include `<sigil_philosophy>`, `<sigil_commands>`, `<sigil_zones>`, `<sigil_behavior>` sections
  - Emphasize "Diff + Feel" philosophy
  - Remove lecture-based explanations
  - **Acceptance:** CLAUDE.md matches v1.2.4 philosophy

### Deliverables
- Archived v1.0 structure
- Clean v1.2.4 directory layout
- Updated config files
- New CLAUDE.md

---

## Sprint 2: Recipe System - Decisive Set (Weeks 3-4)

**Goal:** Implement decisive recipe set (checkout, transactions)

### Tasks

- [x] **S2-T1: Create useServerTick hook**
  - Create `sigil-mark/hooks/useServerTick.ts`
  - Implement async action wrapper with pending state
  - Prevent optimistic UI updates
  - Export from `sigil-mark/hooks/index.ts`
  - **Acceptance:** Hook prevents action during pending state

- [x] **S2-T2: Create decisive/Button.tsx recipe**
  - Create with `@sigil-recipe` JSDoc annotation
  - Physics: `spring(180, 12)`, whileTap scale 0.98
  - Use `useServerTick` for `onAction` prop
  - Include `variant` prop (primary/secondary/danger)
  - Include `size` prop (sm/md/lg)
  - **Acceptance:** Button matches SDD §3.1 anatomy

- [x] **S2-T3: Create decisive/Button.nintendo.tsx variant**
  - Fork Button.tsx with snappier physics
  - Physics: `spring(300, 8)`
  - Document purpose in JSDoc
  - **Acceptance:** Nintendo variant is noticeably snappier

- [x] **S2-T4: Create decisive/Button.relaxed.tsx variant**
  - Fork Button.tsx with softer physics
  - Physics: `spring(140, 16)`
  - Document purpose in JSDoc
  - **Acceptance:** Relaxed variant is noticeably softer

- [x] **S2-T5: Create decisive/ConfirmFlow.tsx recipe**
  - Multi-step confirmation dialog
  - Physics: `spring(150, 14)`, 600ms between steps
  - States: initial → confirming → complete
  - Use AnimatePresence for transitions
  - **Acceptance:** Dialog flows through states with deliberate pacing

- [x] **S2-T6: Create decisive/index.ts barrel export**
  - Export all recipes and variants
  - Use named exports with clear names
  - **Acceptance:** `import { Button, ButtonNintendo } from '@sigil/recipes/decisive'` works

### Deliverables
- `useServerTick` hook
- `decisive/Button.tsx` + 2 variants
- `decisive/ConfirmFlow.tsx`
- `decisive/index.ts` barrel

---

## Sprint 3: Recipe System - Machinery & Glass Sets (Weeks 5-6)

**Goal:** Complete all three recipe sets

### Tasks

- [x] **S3-T1: Create machinery/Table.tsx recipe**
  - No animation / instant state changes
  - `sync: client_authoritative` appropriate
  - Minimal physics overhead
  - **Acceptance:** Table renders without animation delay

- [x] **S3-T2: Create machinery/Toggle.tsx recipe**
  - Instant toggle state change
  - Physics: `spring(400, 30)` or instant
  - Focus on efficiency over delight
  - **Acceptance:** Toggle feels instant, not animated

- [x] **S3-T3: Create machinery/Form.tsx recipe**
  - Form wrapper with instant validation feedback
  - No animated transitions
  - **Acceptance:** Form feels efficient

- [x] **S3-T4: Create machinery/index.ts barrel export**
  - Export all machinery recipes
  - **Acceptance:** Machinery imports work

- [x] **S3-T5: Create glass/HeroCard.tsx recipe**
  - Physics: `spring(200, 20)`, float on hover
  - Enable glow effect with customizable color
  - Entrance animation with delay
  - **Acceptance:** Card floats and glows on hover

- [x] **S3-T6: Create glass/FeatureCard.tsx recipe**
  - Similar to HeroCard but simpler
  - Staggered entrance animation
  - **Acceptance:** Cards animate in sequence

- [x] **S3-T7: Create glass/Tooltip.tsx recipe**
  - Soft entrance animation
  - Delayed appearance
  - **Acceptance:** Tooltip feels polished

- [x] **S3-T8: Create glass/index.ts barrel export**
  - Export all glass recipes
  - **Acceptance:** Glass imports work

### Deliverables
- Complete machinery recipe set (3 recipes)
- Complete glass recipe set (3 recipes)
- All barrel exports

---

## Sprint 4: Zone System (Weeks 7-8)

**Goal:** Implement zone resolution with cascading configs

### Tasks

- [x] **S4-T1: Refactor sigil-detect-zone.sh to v1.2.4**
  - Read new `.sigilrc.yaml` format
  - Walk up directory tree, merge configs
  - Return zone config JSON (not just zone name)
  - **Acceptance:** Script returns full zone config

- [x] **S4-T2: Create zone config templates**
  - Create `src/.sigilrc.yaml` (default: machinery)
  - Create `src/checkout/.sigilrc.yaml` (decisive, server_authoritative)
  - Create `src/admin/.sigilrc.yaml` (machinery)
  - Create `src/marketing/.sigilrc.yaml` (glass)
  - **Acceptance:** Templates match SDD §4.3

- [x] **S4-T3: Implement zone resolution in TypeScript**
  - Create `sigil-mark/core/zone-resolver.ts`
  - Implement `resolveZone(filePath)` function
  - Return typed `ZoneConfig` object
  - **Acceptance:** Resolution matches SDD §4.2 algorithm

- [x] **S4-T4: Update sigil-core skill for v1.2.4**
  - Create/update `.claude/skills/sigil-core/`
  - Update `SKILL.md` with v1.2.4 commands
  - Remove v1.0 commands not in v1.2.4
  - **Acceptance:** Skill reflects 6 commands only

- [x] **S4-T5: Configure path aliases**
  - Update `tsconfig.json` with `@sigil/recipes/*` alias
  - Update `vite.config.ts` (if exists) with resolve aliases
  - Document IDE configuration
  - **Acceptance:** `@sigil/recipes/decisive` resolves correctly

### Deliverables
- Updated zone detection script
- Zone config templates
- TypeScript zone resolver
- Updated sigil-core skill
- Path alias configuration

---

## Sprint 5: Core Commands - /craft (Weeks 9-10)

**Goal:** Implement primary generation command

### Tasks

- [x] **S5-T1: Create /craft command for v1.2.4**
  - Update `.claude/commands/craft.md` to v1.2.4 spec
  - Accept component description and optional file path
  - Resolve zone from path
  - Load available recipes for zone
  - **Acceptance:** `/craft "button" src/checkout/` works

- [x] **S5-T2: Implement recipe selection logic**
  - Parse component description for recipe hints
  - Match against available recipes in zone
  - Suggest most appropriate recipe
  - **Acceptance:** Claude selects correct recipe for context

- [x] **S5-T3: Implement physics context output**
  - Show zone resolution result
  - Show recipe being used
  - Show physics values (spring config)
  - Format per SDD §7.1 output format
  - **Acceptance:** Output shows `ZONE:`, `RECIPE:`, `PHYSICS:`

- [x] **S5-T4: Generate recipe-consuming component**
  - Import from `@sigil/recipes/{zone}`
  - Configure recipe with props
  - No raw physics values in generated code
  - **Acceptance:** Generated code imports recipe, not raw spring values

- [x] **S5-T5: Update crafting-components skill**
  - Update `.claude/skills/crafting-components/SKILL.md`
  - Remove Hammer/Chisel (v1.0 concept)
  - Focus on recipe selection and zone context
  - **Acceptance:** Skill generates recipe-based components

### Deliverables
- Updated `/craft` command
- Recipe selection logic
- Physics context output
- Recipe-consuming generation
- Updated skill

---

## Sprint 6: Core Commands - /sandbox & /codify (Weeks 11-12)

**Goal:** Implement exploration and extraction commands

### Tasks

- [x] **S6-T1: Create /sandbox command**
  - Create `.claude/commands/sandbox.md`
  - Accept file path argument
  - Add `// sigil-sandbox` header to file
  - Update zone's sandbox list in `.sigilrc.yaml`
  - **Acceptance:** `/sandbox src/checkout/Experiment.tsx` enables raw physics

- [x] **S6-T2: Update ESLint config for sandbox detection**
  - Check for `// sigil-sandbox` header
  - Skip rule enforcement for sandbox files
  - **Acceptance:** Sandbox files pass ESLint

- [x] **S6-T3: Create /codify command**
  - Create `.claude/commands/codify.md`
  - Parse sandbox file for physics values
  - Extract spring config, timing values
  - **Acceptance:** `/codify` identifies physics in file

- [x] **S6-T4: Implement recipe generation from sandbox**
  - Generate recipe file with proper anatomy
  - Include `@sigil-recipe` JSDoc
  - Place in `sigil-mark/recipes/{zone}/`
  - **Acceptance:** Generated recipe follows SDD §3.1 anatomy

- [x] **S6-T5: Implement sandbox cleanup**
  - Update source file to import new recipe
  - Remove `// sigil-sandbox` header
  - Remove from zone's sandbox list
  - **Acceptance:** File migrated from sandbox to recipe consumer

- [x] **S6-T6: Update codifying-materials skill to v1.2.4**
  - Rename to `codifying-recipes` or update purpose
  - Focus on extracting physics to recipes
  - Remove material interview flow (v1.0 concept)
  - **Acceptance:** Skill extracts recipes from sandbox

### Deliverables
- `/sandbox` command
- `/codify` command
- ESLint sandbox detection
- Recipe generation logic
- Sandbox cleanup flow

---

## Sprint 7: Auxiliary Commands (Weeks 13-14)

**Goal:** Implement /inherit, /validate, /garden

### Tasks

- [x] **S7-T1: Create /inherit command for v1.2.4**
  - Update `.claude/commands/inherit.md`
  - Scan for existing physics values in codebase
  - Cluster patterns by similarity
  - Report findings (do NOT auto-generate recipes)
  - **Acceptance:** `/inherit` reports patterns without creating files

- [x] **S7-T2: Implement physics value extraction**
  - Find `stiffness`, `damping`, `transition` in TSX files
  - Extract values and file locations
  - **Acceptance:** All physics values found in codebase

- [x] **S7-T3: Create /validate command for v1.2.4**
  - Update `.claude/commands/validate.md`
  - Check all components for recipe imports
  - Flag raw physics outside sandbox
  - Check zone constraint violations
  - **Acceptance:** `/validate` reports compliance percentage

- [x] **S7-T4: Create /garden command for v1.2.4**
  - Update `.claude/commands/garden.md`
  - Report recipe coverage by zone
  - List active sandboxes with age
  - List recipe variants
  - Generate recommendations
  - **Acceptance:** `/garden` produces health report

- [x] **S7-T5: Update gardening-entropy skill**
  - Focus on recipe coverage, not drift detection
  - Track sandbox age
  - Recommend `/codify` for stale sandboxes
  - **Acceptance:** Skill matches v1.2.4 garden purpose

### Deliverables
- `/inherit` command (analysis only)
- `/validate` command
- `/garden` command
- Updated skill

---

## Sprint 8: Workbench (Weeks 15-16)

**Goal:** Implement tmux-based learning environment with A/B toggle

### Tasks

- [x] **S8-T1: Refactor sigil-workbench.sh for v1.2.4**
  - 3 panes instead of 4 (diff + browser + claude)
  - Remove v1.0 tensions panel
  - Add status bar with A/B toggle hint
  - **Acceptance:** Workbench matches SDD §5.1 layout

- [x] **S8-T2: Create diff panel script**
  - Watch component files for changes
  - Show git diff with physics value highlights
  - Format: `- stiffness: 180` / `+ stiffness: 300`
  - **Acceptance:** Diff shows physics changes prominently

- [x] **S8-T3: Implement A/B toggle - hot-swap mode**
  - Create `sigil-mark/workbench/ab-toggle.ts`
  - Use CSS variables for physics values
  - Dispatch custom event on toggle
  - **Acceptance:** Pressing Space swaps physics instantly

- [x] **S8-T4: Implement A/B toggle - iframe mode**
  - Create iframe-based comparison for flow testing
  - Load two versions of preview URL
  - Toggle visibility on Space
  - **Acceptance:** Full flows can be compared

- [x] **S8-T5: Document Chrome MCP integration**
  - Document how browser pane works with Chrome MCP
  - Provide setup instructions
  - Document keyboard shortcuts
  - **Acceptance:** Documentation covers workbench usage

- [x] **S8-T6: Update workbench branding**
  - Apply Adhesion typeface styling (if applicable)
  - Monochrome colors (#000/#FFF)
  - Box-drawing characters in terminal
  - **Acceptance:** Workbench feels like precision instrument

### Deliverables
- Refactored workbench script
- Diff panel with physics highlighting
- A/B toggle (hot-swap + iframe)
- Chrome MCP documentation
- Updated branding

---

## Sprint 9: Enforcement Layer (Weeks 17-18)

**Goal:** Implement ESLint plugin and CI validation

### Tasks

- [x] **S9-T1: Create eslint-plugin-sigil package structure**
  - Create `sigil-mark/eslint-plugin/` or separate package
  - Set up package.json with eslint peer dependency
  - **Acceptance:** Package structure ready

- [x] **S9-T2: Implement sigil/no-raw-physics rule**
  - Detect `stiffness`, `damping`, `transition` properties
  - Skip sandbox files (check for header)
  - Error with helpful message
  - **Acceptance:** Rule catches raw physics, ignores sandbox

- [x] **S9-T3: Implement sigil/require-recipe rule**
  - Check for `@sigil/recipes` imports
  - Skip sandbox files
  - Error if component has animation without recipe
  - **Acceptance:** Rule requires recipe imports

- [x] **S9-T4: Implement sigil/no-optimistic-in-decisive rule**
  - Detect optimistic UI patterns in decisive zone
  - Check for immediate state updates before async completion
  - **Acceptance:** Rule catches optimistic UI violations

- [x] **S9-T5: Implement sigil/sandbox-stale rule**
  - Warn if sandbox file older than 7 days
  - Calculate age from file modification time
  - **Acceptance:** Rule warns on stale sandboxes

- [x] **S9-T6: Create CI workflow**
  - Create `.github/workflows/sigil.yml`
  - Run ESLint with sigil rules
  - Run `sigil validate` command
  - Fail on IMPOSSIBLE violations
  - **Acceptance:** CI blocks physics violations

### Deliverables
- `eslint-plugin-sigil` with 4 rules
- CI workflow for GitHub Actions
- Documentation for rule configuration

---

## Sprint 10: History System & Polish (Weeks 19-20)

**Goal:** Complete refinement history, documentation, testing

### Tasks

- [x] **S10-T1: Implement refinement history storage**
  - Create `sigil-mark/history/YYYY-MM-DD.md` format
  - Log feedback, before/after physics, variant created
  - **Acceptance:** History entries follow SDD §9.1 format

- [x] **S10-T2: Implement history parsing for Claude**
  - Parse last 30 days of history
  - Extract feedback patterns
  - Calculate average physics for similar feedback
  - **Acceptance:** Claude can reference history for calibration

- [x] **S10-T3: Update README.md for v1.2.4**
  - Quick start guide
  - Command reference (6 commands)
  - Philosophy section ("Diff + Feel")
  - Migration guide from v1.0
  - **Acceptance:** README matches v1.2.4 architecture

- [x] **S10-T4: Create unit tests for recipes**
  - Test decisive/Button renders correctly
  - Test useServerTick hook behavior
  - Test zone resolution algorithm
  - **Acceptance:** Core recipes have test coverage

- [x] **S10-T5: Create integration tests**
  - Test /craft generates recipe-consuming code
  - Test /sandbox enables raw physics
  - Test /codify extracts to recipe
  - **Acceptance:** Command flows tested

- [x] **S10-T6: Final validation**
  - Run all commands end-to-end
  - Verify `rm -rf sigil-mark/` cleans up
  - Verify no daemon, no database, no hooks
  - Test brownfield migration flow
  - **Acceptance:** All PRD §10 success criteria pass

### Deliverables
- Refinement history system
- History parsing for Claude
- Complete documentation
- Test coverage
- Final validation

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| v1.0 code breaks during refactor | Archive v1.0 completely before changes |
| Recipe import paths don't resolve | Test path aliases early (Sprint 4) |
| A/B toggle hot-swap technically hard | Fall back to iframe mode |
| ESLint plugin complexity | Start with 2 critical rules, add others |
| History parsing fragile | Use structured format within markdown |

---

## Success Criteria

From PRD §10:

- [ ] /craft generates component using correct zone recipe
- [ ] /sandbox enables raw physics without ESLint errors
- [ ] /codify extracts sandbox to recipe
- [ ] Workbench A/B toggle works (hot-swap or iframe)
- [ ] Diff shown prominently after every adjustment
- [ ] Zone resolution from file path works
- [ ] Three recipe sets exist (decisive/machinery/glass)
- [ ] `rm -rf sigil-mark/` removes everything
- [ ] ESLint catches physics violations
- [ ] CI blocks IMPOSSIBLE violations

### The Learning Test

```
DAY 1: Engineer doesn't know what stiffness means
DAY 7: Engineer has adjusted 20+ components
DAY 14: Engineer predicts "Nintendo Switch = ~stiffness 300"
DAY 30: Engineer teaches teammate about spring physics
```

---

## Version History

| Sprint | Status | Completed |
|--------|--------|-----------|
| Sprint 1 | COMPLETED | 2026-01-05 |
| Sprint 2 | COMPLETED | 2026-01-05 |
| Sprint 3 | COMPLETED | 2026-01-05 |
| Sprint 4 | COMPLETED | 2026-01-05 |
| Sprint 5 | COMPLETED | 2026-01-05 |
| Sprint 6 | COMPLETED | 2026-01-05 |
| Sprint 7 | COMPLETED | 2026-01-05 |
| Sprint 8 | COMPLETED | 2026-01-05 |
| Sprint 9 | COMPLETED | 2026-01-05 |
| Sprint 10 | COMPLETED | 2026-01-05 |

---

## Next Step

```
/implement sprint-2
```
