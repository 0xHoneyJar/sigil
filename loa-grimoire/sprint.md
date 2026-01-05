# Sprint Plan: Sigil v4 — Design Physics Engine

**Version:** 1.0
**Date:** 2026-01-04
**Author:** Sprint Planner Agent
**PRD Reference:** loa-grimoire/prd.md (v4)
**SDD Reference:** loa-grimoire/sdd.md (v4)

---

## Executive Summary

Sigil v4 is a Design Physics Engine that gives AI agents physics constraints for consistent design decisions. This replaces the v3 Constitutional Framework with a simpler, more focused architecture: 8 skills, 8 commands, physics enforcement.

**Philosophy:** "Physics, not opinions. Constraints, not debates."

**Key Concepts:**
- Temporal Governor (discrete 600ms vs continuous 0ms)
- Budgets (cognitive, visual, complexity)
- Fidelity Ceiling (Mod Ghost Rule)
- Hammer/Chisel toolkit (diagnose then execute)
- Loa handoff (structural issues → Loa)

**Total Sprints:** 6
**Sprint Duration:** ~1 day each (solo developer with AI)
**MVP:** Sprints 1-4

---

## Sprint Overview

| Sprint | Theme | Key Deliverables | Dependencies |
|--------|-------|------------------|--------------|
| 1 | Foundation | sigil-mark/ structure, core/ schemas | None |
| 2 | Resonance | Materials, zones, tensions, templates | Sprint 1 |
| 3 | Setup Flow | /sigil-setup, /envision commands | Sprint 2 |
| 4 | Core Commands | /codify, /map, /craft with Hammer/Chisel | Sprint 3 |
| 5 | Validation | /validate, /approve, /greenlight | Sprint 4 |
| 6 | Maintenance | /garden, mount system, integration test | Sprint 5 |

---

## Sprint 1: Foundation & State Zone ✅ COMPLETED

**Goal:** Create sigil-mark/ directory structure and core YAML schemas

### Tasks

#### S1-T1: Create State Zone Structure ✅
**Description:** Create sigil-mark/ directory with all subdirectories

**Acceptance Criteria:**
- [x] `sigil-mark/core/` exists
- [x] `sigil-mark/resonance/` exists
- [x] `sigil-mark/memory/eras/` exists
- [x] `sigil-mark/memory/decisions/` exists
- [x] `sigil-mark/memory/mutations/active/` exists
- [x] `sigil-mark/memory/graveyard/` exists
- [x] `sigil-mark/taste-key/rulings/` exists

**Effort:** Small

---

#### S1-T2: Implement Temporal Governor Schema ✅
**Description:** Create sync.yaml with tick modes and authority

**Acceptance Criteria:**
- [x] Discrete tick mode: 600ms, heavy, rhythmic
- [x] Continuous tick mode: 0ms, instant, fluid
- [x] Server-authoritative: NO optimistic updates
- [x] Client-authoritative: optimistic expected
- [x] Collaborative: CRDT with conflict resolution
- [x] Zone mapping for temporal_governor
- [x] Physics violations defined as IMPOSSIBLE

**Effort:** Medium

---

#### S1-T3: Implement Budget Schema ✅
**Description:** Create budgets.yaml with cognitive, visual, complexity limits

**Acceptance Criteria:**
- [x] Cognitive: interactive_elements (5→30), decisions (2→10), text_density
- [x] Visual: color_count (5), animation_count (1→5), depth_layers (4)
- [x] Complexity: props (10), variants (12), dependencies (8)
- [x] Enforcement rules: BLOCK with Taste Key override

**Effort:** Small

---

#### S1-T4: Implement Fidelity Ceiling Schema ✅
**Description:** Create fidelity.yaml with Mod Ghost Rule

**Acceptance Criteria:**
- [x] Gradients: 2 stops max
- [x] Shadows: 3 layers max
- [x] Animation: 800ms max
- [x] Blur: 16px max
- [x] Border-radius: 24px max
- [x] Agent rules: "Generate at ceiling, not above"

**Effort:** Small

---

#### S1-T5: Implement Lens Registry Schema ✅
**Description:** Create lens.yaml with rendering layers

**Acceptance Criteria:**
- [x] Vanilla: default, core fidelity
- [x] High-fidelity: opt-in, cannot change geometry
- [x] Utility: opt-in, additive only
- [x] Accessibility: highest priority, reduced motion
- [x] CSS variable mapping

**Effort:** Small

---

### Sprint 1 Deliverables
- Complete sigil-mark/ structure
- All core/ YAML files: sync.yaml, budgets.yaml, fidelity.yaml, lens.yaml

---

## Sprint 2: Resonance Layer ✅ COMPLETED

**Goal:** Implement product tuning layer with materials, zones, tensions

### Tasks

#### S2-T1: Implement Materials Schema ✅
**Description:** Create materials.yaml with clay, machinery, glass

**Acceptance Criteria:**
- [x] Clay: diffuse, heavy, spring(120/14), depress
- [x] Machinery: flat, none, instant, highlight
- [x] Glass: refract, weightless, ease(200/20), glow
- [x] CSS implications for each material
- [x] Zone affinity mappings
- [x] Selection guide by action type

**Effort:** Medium

---

#### S2-T2: Implement Zones Schema ✅
**Description:** Create zones.yaml with path-based physics

**Acceptance Criteria:**
- [x] Critical: server_authoritative, discrete, clay, 5 elements
- [x] Transactional: client_authoritative, continuous, machinery, 12 elements
- [x] Exploratory: client_authoritative, continuous, glass, 20 elements
- [x] Marketing: client_authoritative, continuous, glass, 15 elements
- [x] Default zone fallback
- [x] Glob path patterns
- [x] Tension overrides per zone

**Effort:** Medium

---

#### S2-T3: Implement Tensions Schema ✅
**Description:** Create tensions.yaml with tuning sliders

**Acceptance Criteria:**
- [x] Playfulness: 0-100 (serious ↔ fun)
- [x] Weight: 0-100 (light ↔ heavy)
- [x] Density: 0-100 (spacious ↔ dense)
- [x] Speed: 0-100 (slow ↔ fast)
- [x] Zone presets
- [x] CSS mapping
- [x] Conflict resolution rules

**Effort:** Small

---

#### S2-T4: Implement Essence Template ✅
**Description:** Create essence.yaml template (populated by /envision)

**Acceptance Criteria:**
- [x] Product identity: name, tagline
- [x] Soul statement with invariants
- [x] Reference products: games, apps, physical
- [x] Feel descriptors by context
- [x] Anti-patterns section
- [x] Key moments

**Effort:** Small

---

#### S2-T5: Implement Era-1 Template ✅
**Description:** Create memory/eras/era-1.yaml

**Acceptance Criteria:**
- [x] Era id, name, dates
- [x] Context sections
- [x] Truths with evidence
- [x] Deprecated list
- [x] Transition triggers

**Effort:** Small

---

#### S2-T6: Implement Taste Key Template ✅
**Description:** Create taste-key/holder.yaml

**Acceptance Criteria:**
- [x] Holder fields
- [x] Authority (absolute vs cannot_override)
- [x] Process (greenlight, execution, integrity)
- [x] Philosophy
- [x] Succession rules

**Effort:** Small

---

### Sprint 2 Deliverables
- Complete resonance/ YAML files
- Era-1 and Taste Key templates
- Ready for command implementation

---

## Sprint 3: Setup & Envision Commands ✅ REVIEW_APPROVED

**Goal:** Implement /sigil-setup and /envision commands

### Tasks

#### S3-T1: Create initializing-sigil Skill ✅
**Description:** Skill for /sigil-setup command

**Acceptance Criteria:**
- [x] index.yaml with metadata
- [x] SKILL.md with setup workflow
- [x] Pre-flight checks
- [x] Creates sigil-mark/ structure
- [x] Copies core/ templates
- [x] Creates .sigil-setup-complete marker

**Effort:** Medium

---

#### S3-T2: Create sigil-setup Command ✅
**Description:** Command file for /sigil-setup

**Acceptance Criteria:**
- [x] .claude/commands/sigil-setup.md exists
- [x] References initializing-sigil skill
- [x] Documents workflow

**Effort:** Small

---

#### S3-T3: Create envisioning-soul Skill ✅
**Description:** Skill for /envision command (product soul interview)

**Acceptance Criteria:**
- [x] index.yaml with metadata
- [x] SKILL.md with interview phases
- [x] Questions for each essence section
- [x] Writes to resonance/essence.yaml
- [x] Uses AskUserQuestion

**Effort:** Large

---

#### S3-T4: Create envision Command ✅
**Description:** Command file for /envision

**Acceptance Criteria:**
- [x] .claude/commands/envision.md exists
- [x] References envisioning-soul skill

**Effort:** Small

---

### Sprint 3 Deliverables
- /sigil-setup command working
- /envision command working

---

## Sprint 4: Codify, Map, and Craft Commands (MVP)

**Goal:** Implement core design commands

### Tasks

#### S4-T1: Create codifying-materials Skill
**Description:** Skill for /codify command

**Acceptance Criteria:**
- [ ] index.yaml
- [ ] SKILL.md with material workflow
- [ ] Updates resonance/materials.yaml
- [ ] Validates against core physics

**Effort:** Medium

---

#### S4-T2: Create codify Command
**Effort:** Small

---

#### S4-T3: Create mapping-zones Skill
**Description:** Skill for /map command

**Acceptance Criteria:**
- [ ] index.yaml
- [ ] SKILL.md with zone workflow
- [ ] Updates resonance/zones.yaml
- [ ] Validates path patterns

**Effort:** Medium

---

#### S4-T4: Create map Command
**Effort:** Small

---

#### S4-T5: Create crafting-components Skill with Hammer/Chisel
**Description:** Skill for /craft command with sub-tools

**Acceptance Criteria:**
- [ ] index.yaml
- [ ] SKILL.md with tool selection algorithm
- [ ] tools/hammer.md: diagnosis workflow
- [ ] tools/chisel.md: execution workflow
- [ ] Physics context loading
- [ ] Violation checking
- [ ] Loa handoff generation
- [ ] **The Linear Test passes:**
  - "The claim button feels slow" → Hammer diagnoses, not immediate bandaid
  - Checks zone physics before suggesting optimistic UI
  - Routes structural issues to Loa

**Effort:** Large

---

#### S4-T6: Create craft Command
**Effort:** Small

---

### Sprint 4 Deliverables
- /codify, /map, /craft commands working
- Hammer/Chisel toolkit functional
- **MVP COMPLETE**

---

## Sprint 5: Validation & Approval Commands

**Goal:** Implement validation pipeline

### Tasks

#### S5-T1: Create validating-fidelity Skill
**Description:** Skill for /validate command

**Acceptance Criteria:**
- [ ] Checks physics violations (IMPOSSIBLE)
- [ ] Checks budget violations (BLOCK with override)
- [ ] Checks fidelity violations (BLOCK with override)
- [ ] Checks drift (WARN)
- [ ] Generates violation report

**Effort:** Medium

---

#### S5-T2: Create validate Command
**Effort:** Small

---

#### S5-T3: Create approving-patterns Skill
**Description:** Skill for /approve command (Taste Key rulings)

**Acceptance Criteria:**
- [ ] Checks Taste Key holder
- [ ] Creates rulings in taste-key/rulings/
- [ ] Can override budget/fidelity
- [ ] Cannot override physics

**Effort:** Medium

---

#### S5-T4: Create approve Command
**Effort:** Small

---

#### S5-T5: Create greenlighting-concepts Skill
**Description:** Skill for /greenlight command

**Acceptance Criteria:**
- [ ] Distinguishes concept from execution approval
- [ ] Records greenlighted concepts

**Effort:** Small

---

#### S5-T6: Create greenlight Command
**Effort:** Small

---

### Sprint 5 Deliverables
- /validate, /approve, /greenlight commands working

---

## Sprint 6: Garden & Mount System

**Goal:** Implement maintenance and distribution

### Tasks

#### S6-T1: Create gardening-entropy Skill
**Description:** Skill for /garden command

**Acceptance Criteria:**
- [ ] Detects drift from essence
- [ ] Reviews active mutations
- [ ] Promotes to canon or graveyard
- [ ] Flags stale decisions
- [ ] Era transition detection

**Effort:** Medium

---

#### S6-T2: Create garden Command
**Effort:** Small

---

#### S6-T3: Update Mount Script for v4
**Description:** Update mount-sigil.sh

**Acceptance Criteria:**
- [ ] SIGIL_SKILLS array: 8 skills
- [ ] SIGIL_COMMANDS array: 8 commands
- [ ] Creates sigil-mark/ on mount
- [ ] Copies core/ templates
- [ ] Creates .sigil-version.json with 4.0.0

**Effort:** Medium

---

#### S6-T4: Update CLAUDE.md for v4
**Description:** Update agent instructions

**Acceptance Criteria:**
- [ ] Documents 8 commands
- [ ] Documents physics concepts
- [ ] Documents Hammer/Chisel
- [ ] Documents Loa handoff

**Effort:** Medium

---

#### S6-T5: Integration Testing
**Description:** Test full workflow

**Acceptance Criteria:**
- [ ] Mount works
- [ ] /sigil-setup creates structure
- [ ] /envision captures essence
- [ ] /codify defines materials
- [ ] /map defines zones
- [ ] /craft generates with physics
- [ ] /validate catches violations
- [ ] /approve records rulings
- [ ] /greenlight records concepts
- [ ] /garden detects drift

**Effort:** Large

---

### Sprint 6 Deliverables
- /garden command working
- Mount system updated
- **v4.0.0 RELEASE READY**

---

## Summary

### The 8 Skills
1. `initializing-sigil` → /sigil-setup
2. `envisioning-soul` → /envision
3. `codifying-materials` → /codify
4. `mapping-zones` → /map
5. `crafting-components` → /craft
6. `validating-fidelity` → /validate
7. `approving-patterns` → /approve
8. `greenlighting-concepts` → /greenlight
9. `gardening-entropy` → /garden

### MVP (Sprints 1-4)
- State zone structure
- Core physics schemas
- Resonance layer
- /sigil-setup, /envision, /codify, /map, /craft

### Post-MVP (Sprints 5-6)
- /validate, /approve, /greenlight
- /garden
- Mount system

---

## Next Step

```
/implement sprint-1
```
