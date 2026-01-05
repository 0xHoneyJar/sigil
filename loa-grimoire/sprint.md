# Sprint Plan: Sigil v1.0

**Version:** 1.0
**Created:** 2026-01-04
**Team:** Solo (Claude only)
**Priority:** Core first, Workbench last

---

## Overview

This plan implements Sigil v1.0 Design Physics Engine in 12 sprints. The architecture follows the SDD's four-layer model (Core → Resonance → Memory → Taste Key) with the Workbench as the final integration layer.

### Sprint Sequence

| Phase | Sprints | Focus |
|-------|---------|-------|
| Foundation | 1-2 | Project scaffold, state zone, core YAML schemas |
| Core Engine | 3-5 | Physics validation, zone detection, materials |
| Commands | 6-9 | 8 commands (/envision, /codify, /map, /craft, etc.) |
| Toolkit | 10 | Hammer/Chisel diagnostic system |
| Workbench | 11-12 | 4-panel tmux environment, scripts |

---

## Sprint 1: Project Scaffold & State Zone ✅ COMPLETE

**Goal:** Create directory structure and core YAML templates

### Tasks

- [x] **S1-T1: Create sigil-mark directory structure** ✅
  - Create `sigil-mark/core/`, `sigil-mark/resonance/`, `sigil-mark/memory/`, `sigil-mark/taste-key/`
  - Create subdirectories: `memory/eras/`, `memory/decisions/`, `memory/mutations/active/`, `memory/graveyard/`, `taste-key/rulings/`
  - **Acceptance:** All directories exist per SDD §5.1

- [x] **S1-T2: Create core YAML templates** ✅
  - Create `sigil-mark/core/sync.yaml` with Temporal Governor schema
  - Create `sigil-mark/core/budgets.yaml` with cognitive/visual/complexity limits
  - Create `sigil-mark/core/fidelity.yaml` with Mod Ghost Rule ceiling
  - Create `sigil-mark/core/lens.yaml` with HD/SD rendering layers
  - **Acceptance:** All core YAML files valid, match SDD §4.1-4.4

- [x] **S1-T3: Create resonance YAML templates** ✅
  - Create `sigil-mark/resonance/essence.yaml` template (populated by /envision)
  - Create `sigil-mark/resonance/materials.yaml` with clay/machinery/glass defaults
  - Create `sigil-mark/resonance/zones.yaml` with 5 zone definitions
  - Create `sigil-mark/resonance/tensions.yaml` with default sliders
  - **Acceptance:** All resonance YAML files valid, match PRD §4.3

- [x] **S1-T4: Create .claude directory structure** ✅
  - Create `.claude/commands/` directory
  - Create `.claude/skills/` directory
  - Create `.claude/scripts/` directory
  - **Acceptance:** Claude Code skill structure ready

- [x] **S1-T5: Create mount-sigil.sh script** ✅
  - Implement directory creation
  - Implement symlink setup for skills/commands/scripts
  - Create `.sigil-setup-complete` marker
  - Display next steps message
  - **Acceptance:** Script runs in <30s, creates all required structure

### Deliverables
- Complete `sigil-mark/` directory structure
- All YAML template files
- `mount-sigil.sh` script
- `.claude/` directory structure

---

## Sprint 2: Core Physics Engine

**Goal:** Implement physics validation logic (IMPOSSIBLE/BLOCK/WARN hierarchy)

### Tasks

- [x] **S2-T1: Create validating-fidelity skill structure** ✅
  - Create `.claude/skills/validating-fidelity/index.yaml`
  - Create `.claude/skills/validating-fidelity/SKILL.md`
  - **Acceptance:** Skill loads in Claude Code

- [x] **S2-T2: Implement Temporal Governor validation** ✅
  - Detect server_authoritative zones
  - Block optimistic UI patterns in server_authoritative
  - Return IMPOSSIBLE for physics violations
  - **Acceptance:** Optimistic UI in critical zone returns IMPOSSIBLE

- [x] **S2-T3: Implement Budget validation** ✅
  - Count interactive elements in component
  - Compare against zone budget limits
  - Return BLOCK for budget violations
  - **Acceptance:** 8 elements in critical zone (max 5) returns BLOCK

- [x] **S2-T4: Implement Fidelity validation** ✅
  - Check gradient stops, shadow layers, animation duration
  - Compare against fidelity ceiling
  - Return BLOCK for fidelity violations
  - **Acceptance:** 4 gradient stops (max 2) returns BLOCK

- [x] **S2-T5: Create /validate command** ✅
  - Create `.claude/commands/validate.md`
  - Route to validating-fidelity skill
  - **Acceptance:** `/validate path/to/file.tsx` works

### Deliverables
- `validating-fidelity` skill
- `/validate` command
- Physics validation logic (IMPOSSIBLE/BLOCK/WARN)

---

## Sprint 3: Zone Detection System

**Goal:** Implement file path to zone resolution

### Tasks

- [x] **S3-T1: Create sigil-detect-zone.sh script** ✅
  - Read zones from `sigil-mark/resonance/zones.yaml`
  - Match file path against glob patterns
  - Return zone name (or "default")
  - **Acceptance:** `sigil-detect-zone.sh src/features/checkout/Button.tsx` returns "critical"

- [x] **S3-T2: Create mapping-zones skill structure** ✅
  - Create `.claude/skills/mapping-zones/index.yaml`
  - Create `.claude/skills/mapping-zones/SKILL.md`
  - **Acceptance:** Skill loads in Claude Code

- [x] **S3-T3: Implement /map command** ✅
  - Create `.claude/commands/map.md`
  - Interview for zone path patterns
  - Update `sigil-mark/resonance/zones.yaml`
  - **Acceptance:** `/map` captures zone definitions interactively

- [x] **S3-T4: Integrate zone detection into validation** ✅
  - Load zone physics from zones.yaml
  - Apply zone-specific budgets
  - Apply zone-specific material
  - **Acceptance:** Validation uses zone context

### Deliverables
- `sigil-detect-zone.sh` script
- `mapping-zones` skill
- `/map` command
- Zone-aware validation

---

## Sprint 4: Materials System

**Goal:** Implement material physics (clay, machinery, glass)

### Tasks

- [x] **S4-T1: Create codifying-materials skill structure** ✅
  - Create `.claude/skills/codifying-materials/index.yaml`
  - Create `.claude/skills/codifying-materials/SKILL.md`
  - **Acceptance:** Skill loads in Claude Code

- [x] **S4-T2: Implement material physics definitions** ✅
  - Define clay: heavy, spring motion, depress feedback
  - Define machinery: no weight, instant motion, highlight feedback
  - Define glass: weightless, ease motion, glow feedback
  - **Acceptance:** materials.yaml matches PRD §4.3

- [x] **S4-T3: Implement /codify command** ✅
  - Create `.claude/commands/codify.md`
  - Interview for material customization
  - Update `sigil-mark/resonance/materials.yaml`
  - **Acceptance:** `/codify` allows material tuning

- [x] **S4-T4: Integrate materials into craft output** ✅
  - Include material physics in generation context
  - Apply spring config for clay
  - Apply timing for glass
  - Apply instant for machinery
  - **Acceptance:** Generated code includes material-appropriate motion

### Deliverables
- `codifying-materials` skill
- `/codify` command
- Material-aware generation

---

## Sprint 5: Essence System

**Goal:** Implement product soul capture

### Tasks

- [x] **S5-T1: Create envisioning-soul skill structure** ✅
  - Create `.claude/skills/envisioning-soul/index.yaml`
  - Create `.claude/skills/envisioning-soul/SKILL.md`
  - **Acceptance:** Skill loads in Claude Code

- [x] **S5-T2: Implement essence interview flow** ✅
  - Ask about reference products (what to feel like)
  - Ask about anti-patterns (what to never do)
  - Ask about key moments (claim, success, error)
  - **Acceptance:** Interview captures product soul

- [x] **S5-T3: Implement /envision command** ✅
  - Create `.claude/commands/envision.md`
  - Route to envisioning-soul skill
  - Generate `sigil-mark/resonance/essence.yaml`
  - **Acceptance:** `/envision` produces essence.yaml

- [x] **S5-T4: Integrate essence into craft context** ✅
  - Load essence during /craft
  - Include references in output
  - Warn on anti-pattern matches
  - **Acceptance:** /craft respects essence

### Deliverables
- `envisioning-soul` skill
- `/envision` command
- Essence-aware generation

---

## Sprint 6: Craft Command

**Goal:** Implement main generation command with physics context

### Tasks

- [x] **S6-T1: Create crafting-components skill structure** ✅
  - Create `.claude/skills/crafting-components/index.yaml`
  - Create `.claude/skills/crafting-components/SKILL.md`
  - **Acceptance:** Skill loads in Claude Code

- [x] **S6-T2: Implement /craft command** ✅
  - Create `.claude/commands/craft.md`
  - Accept component description and target path
  - Resolve zone from path
  - Load physics context
  - **Acceptance:** `/craft "button" src/features/checkout/` works

- [x] **S6-T3: Implement physics context header** ✅
  - Display zone, material, temporal, sync, tensions
  - Display budget usage
  - Use SDD §8.1 format
  - **Acceptance:** Output includes physics context

- [x] **S6-T4: Implement constraint application** ✅
  - Apply sync constraints (no optimistic in server_authoritative)
  - Apply material physics (spring for clay)
  - Stay within budgets
  - **Acceptance:** Generated code respects all constraints

### Deliverables
- `crafting-components` skill
- `/craft` command
- Physics-aware generation

---

## Sprint 7: Approval & Greenlight System

**Goal:** Implement Taste Key authority commands

### Tasks

- [x] **S7-T1: Create approving-patterns skill structure** ✅
  - Create `.claude/skills/approving-patterns/index.yaml`
  - Create `.claude/skills/approving-patterns/SKILL.md`
  - **Acceptance:** Skill loads in Claude Code

- [x] **S7-T2: Implement /approve command** ✅
  - Create `.claude/commands/approve.md`
  - Record Taste Key rulings
  - Store in `sigil-mark/taste-key/rulings/`
  - **Acceptance:** `/approve` creates ruling record

- [x] **S7-T3: Create greenlighting-concepts skill structure** ✅
  - Create `.claude/skills/greenlighting-concepts/index.yaml`
  - Create `.claude/skills/greenlighting-concepts/SKILL.md`
  - **Acceptance:** Skill loads in Claude Code

- [x] **S7-T4: Implement /greenlight command** ✅
  - Create `.claude/commands/greenlight.md`
  - Record concept approvals
  - Store in `sigil-mark/memory/decisions/`
  - **Acceptance:** `/greenlight` creates decision record

- [x] **S7-T5: Implement holder.yaml** ✅
  - Create `sigil-mark/taste-key/holder.yaml`
  - Define who holds Taste Key authority
  - **Acceptance:** Holder can be queried

### Deliverables
- `approving-patterns` skill
- `greenlighting-concepts` skill
- `/approve` and `/greenlight` commands
- Taste Key ruling system

---

## Sprint 8: Garden Command (Drift Detection)

**Goal:** Implement entropy detection and drift reporting

### Tasks

- [x] **S8-T1: Create gardening-entropy skill structure** ✅
  - Create `.claude/skills/gardening-entropy/index.yaml`
  - Create `.claude/skills/gardening-entropy/SKILL.md`
  - **Acceptance:** Skill loads in Claude Code

- [x] **S8-T2: Implement inflation tracking** ✅
  - Count components per zone
  - Track growth over time
  - Store in `sigil-mark/memory/`
  - **Acceptance:** Inflation metrics recorded

- [x] **S8-T3: Implement /garden command** ✅
  - Create `.claude/commands/garden.md`
  - Report inflation trends
  - Alert on threshold violations
  - Recommend review cadence
  - **Acceptance:** `/garden` produces drift report

- [x] **S8-T4: Implement stale decision detection** ✅
  - Check age of decisions in `sigil-mark/memory/decisions/`
  - Flag decisions older than era boundary
  - **Acceptance:** Old decisions flagged

### Deliverables
- `gardening-entropy` skill
- `/garden` command
- Drift detection system

---

## Sprint 9: Memory & Era System

**Goal:** Implement era-versioned decision tracking

### Tasks

- [ ] **S9-T1: Implement era management**
  - Create era schema in `sigil-mark/memory/eras/`
  - Define era boundaries
  - Support era transitions
  - **Acceptance:** Eras can be created and queried

- [ ] **S9-T2: Implement mutations sandbox**
  - Create active mutation tracking
  - Support experiment tagging
  - **Acceptance:** Mutations can be tracked

- [ ] **S9-T3: Implement graveyard archive**
  - Move failed experiments to graveyard
  - Record failure reasons
  - **Acceptance:** Failed experiments archived with context

- [ ] **S9-T4: Integrate memory into craft context**
  - Load relevant decisions during /craft
  - Reference era context
  - **Acceptance:** /craft respects historical decisions

### Deliverables
- Era management system
- Mutations sandbox
- Graveyard archive
- Memory-aware generation

---

## Sprint 10: Hammer/Chisel Toolkit

**Goal:** Implement diagnostic toolkit for /craft

### Tasks

- [ ] **S10-T1: Create Hammer tool**
  - Create `.claude/skills/crafting-components/tools/hammer.md`
  - Implement clarifying question flow
  - Route to correct destination (Chisel, Loa, /approve)
  - **Acceptance:** Hammer investigates before solving

- [ ] **S10-T2: Create Chisel tool**
  - Create `.claude/skills/crafting-components/tools/chisel.md`
  - Implement quick aesthetic execution
  - Apply physics constraints automatically
  - **Acceptance:** Chisel executes measurable changes

- [ ] **S10-T3: Implement tool selection algorithm**
  - Detect chisel patterns (px, ms, specific properties)
  - Detect hammer patterns (feels, seems, looks)
  - Default to Hammer for ambiguous input
  - **Acceptance:** Tool selection matches SDD §6.1

- [ ] **S10-T4: Implement Loa handoff protocol**
  - Generate handoff document when structural issue detected
  - Write to `loa-grimoire/context/sigil-handoff.md`
  - Include diagnosis, constraints, requirements
  - **Acceptance:** Structural issues route to Loa

### Deliverables
- Hammer diagnostic tool
- Chisel execution tool
- Tool selection logic
- Loa handoff protocol

---

## Sprint 11: Workbench Foundation ✅ COMPLETE

**Goal:** Implement core Workbench scripts

### Tasks

- [x] **S11-T1: Create sigil-tensions.sh script** ✅
  - Read tensions from zones.yaml
  - Display as ASCII progress bars
  - Auto-refresh every 2 seconds
  - **Acceptance:** Tensions display in terminal

- [x] **S11-T2: Create sigil-validate.sh script** ✅
  - Watch for file changes (fswatch)
  - Run validation on change
  - Display Pass/Fail status
  - **Acceptance:** Real-time validation in terminal

- [x] **S11-T3: Handle fallbacks** ✅
  - Graceful degradation if fswatch missing
  - Manual mode if Chrome MCP unavailable
  - **Acceptance:** Works without optional deps

### Deliverables
- `sigil-tensions.sh` script
- `sigil-validate.sh` script
- Fallback handling

---

## Sprint 12: Workbench Integration ✅ COMPLETE

**Goal:** Complete 4-panel Workbench environment

### Tasks

- [x] **S12-T1: Create sigil-workbench.sh script** ✅
  - Check prerequisites (tmux, claude, fswatch)
  - Create tmux session with 4 panes
  - Launch Claude in pane 0
  - Launch tensions in pane 2
  - Launch validation in pane 3
  - **Acceptance:** Workbench launches with all panels

- [x] **S12-T2: Integrate Chrome MCP panel** ✅
  - Display placeholder in pane 1
  - Document Chrome MCP usage
  - **Acceptance:** Chrome preview documented

- [x] **S12-T3: Update mount-sigil.sh** ✅
  - Symlink all scripts
  - Verify all commands work
  - **Acceptance:** Full installation works

- [x] **S12-T4: Create README and documentation** ✅
  - Quick start guide (<5 min)
  - Command reference
  - Workbench usage
  - **Acceptance:** New user can start in <5 min

- [x] **S12-T5: Final validation** ✅
  - Run all commands end-to-end
  - Verify clean removal (`rm -rf sigil-mark/`)
  - Verify no daemon, no database, no hooks
  - **Acceptance:** All PRD §9 criteria pass

### Deliverables
- `sigil-workbench.sh` script
- Complete Workbench environment
- Updated `mount-sigil.sh`
- Documentation
- Final validation

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| fswatch unavailable | Fallback to manual `/validate` |
| Chrome MCP unavailable | Fallback to manual browser refresh |
| tmux complexity | Document individual command mode |
| Hot reload issues | Support manual refresh |

---

## Success Criteria

From PRD §9:

- [ ] `mount-sigil.sh` works on macOS and Linux
- [ ] All 8 commands implemented and documented
- [ ] Hammer investigates (never jumps to solution)
- [ ] Physics violations are IMPOSSIBLE (cannot generate)
- [ ] Workbench launches with 4 panels
- [ ] Live preview updates in <1s
- [ ] Component scoring visible (Pass/Fail)
- [ ] Clean removal via `rm -rf sigil-mark/`
- [ ] README has <5 min quickstart
- [ ] No daemon, no database, no hooks

---

## Next Step

```
/implement sprint-1
```
