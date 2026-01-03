# Sprint Plan: Sigil v3 — Constitutional Design Framework

**Version:** 1.0
**Date:** 2026-01-02
**Author:** Sprint Planner Agent
**PRD Reference:** loa-grimoire/prd.md
**SDD Reference:** loa-grimoire/sdd.md
**Branch:** feature/constitutional-design-framework

---

## Executive Summary

Sigil v3 is a Constitutional Design Framework with four pillars: Soul Binder, Lens Array, Consultation Chamber, and Proving Grounds. This sprint plan breaks down the implementation into 6 sprints of 2.5 days each, building incrementally from foundation to polish.

**Core MVP Requirements (P0):**
- FR-1: Immutable Values with enforcement
- FR-2: Canon of Flaws with protection blocking
- FR-4/5: Lens Array with constrained validation
- FR-10: Progressive Strictness (4 levels)
- FR-11: Interview-Generated Configuration
- FR-12: Human Accountability (override escape hatches)

> From prd.md: "Progressive strictness allows greenfield projects to grow without friction"

**Total Sprints:** 6
**Sprint Duration:** 2.5 days each
**Estimated Total:** 15 working days

---

## Sprint Overview

| Sprint | Theme | Key Deliverables | Dependencies |
|--------|-------|------------------|--------------|
| 1 | Foundation & Setup | v3 directory structure, updated `/setup`, `.sigilrc.yaml` schema | None |
| 2 | Soul Binder Core | Immutable Values, `/envision` update, `/canonize` command | Sprint 1 |
| 3 | Lens Array | Lens definitions, constrained validation, `/craft` integration | Sprint 2 |
| 4 | Consultation Chamber | `/consult`, decision locking, three-tier authority | Sprint 3 |
| 5 | Proving Grounds | `/prove`, `/graduate`, monitoring framework | Sprint 4 |
| 6 | Polish & Documentation | Tests, migration guide, documentation | Sprint 5 |

---

## Sprint 1: Foundation & Setup

**Duration:** 2.5 days
**Theme:** Establish v3 framework structure and configuration

### Sprint Goal

Create the foundational directory structure, configuration schemas, and update `/setup` to initialize Sigil v3 projects with the four-pillar architecture.

### Deliverables

- [x] v3 directory structure created (`sigil-mark/soul-binder/`, `lens-array/`, etc.)
- [x] `.sigilrc.yaml` schema updated for v3 (strictness, taste_owners, domains)
- [x] `/setup` command updated to create v3 structure
- [x] Progressive strictness foundation implemented
- [x] Helper script `get-strictness.sh` created

### Acceptance Criteria

> From prd.md FR-10: "Strictness level configurable" and "Agent behavior adjusts to level"

- [x] Running `/setup` creates complete v3 directory tree
- [x] `.sigilrc.yaml` supports `strictness: discovery|guiding|enforcing|strict`
- [x] `.sigilrc.yaml` supports `taste_owners` with scope paths
- [x] `.sigilrc.yaml` supports `domains` array (e.g., `["defi"]`)
- [x] `get-strictness.sh` returns current strictness level from config
- [x] Setup creates all four pillar subdirectories in `sigil-mark/`

### Technical Tasks

- [x] Update `.claude/skills/initializing-sigil/SKILL.md` for v3 structure
- [x] Update `.claude/commands/setup.md` frontmatter for v3 outputs
- [x] Create `sigil-mark/soul-binder/` directory template
- [x] Create `sigil-mark/lens-array/` directory template
- [x] Create `sigil-mark/consultation-chamber/` directory template with `decisions/`
- [x] Create `sigil-mark/proving-grounds/` directory template with `active/`
- [x] Create `sigil-mark/canon/graduated/` directory template
- [x] Create `sigil-mark/audit/` directory for override logging
- [x] Implement `.sigilrc.yaml` v3 schema with validation
- [x] Create `.claude/scripts/get-strictness.sh` helper
- [x] Update `.sigil-version.json` schema for v3

### Dependencies

- None (first sprint)

### Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| v2 → v3 migration conflicts | Medium | Medium | Create clear migration path; backup v2 state |
| Complex directory structure | Low | Low | Follow existing v2 patterns; keep flat where possible |

### Success Metrics

- `/setup` completes successfully with all directories created
- `get-strictness.sh` returns valid strictness level
- All v3 config options parseable with yq or bash fallback

---

## Sprint 2: Soul Binder Core

**Duration:** 2.5 days
**Theme:** Implement Immutable Values and Canon of Flaws

### Sprint Goal

Implement the Soul Binder pillar with interview-generated immutable values, the Canon of Flaws registry, and protection blocking based on strictness level.

### Deliverables

- [ ] `immutable-values.yaml` schema implemented
- [ ] `canon-of-flaws.yaml` schema implemented
- [ ] `/envision` updated to capture values through interview
- [ ] `/canonize` command and skill implemented
- [ ] Value violation detection in `/craft`
- [ ] Protected flaw blocking in enforcing/strict modes

### Acceptance Criteria

> From prd.md FR-1: "Block-level violations prevent agent from proceeding"
> From prd.md FR-2: "Agent detects changes affecting protected flaws"

- [ ] `/envision` interviews user about core values (shared + project-specific)
- [ ] Values saved to `sigil-mark/soul-binder/immutable-values.yaml`
- [ ] `/canonize` interviews user about emergent behavior
- [ ] Flaw saved to `sigil-mark/soul-binder/canon-of-flaws.yaml` with PROTECTED status
- [ ] `/craft` checks values and warns/blocks based on strictness
- [ ] Protected flaw violations BLOCK in enforcing/strict modes
- [ ] All blocks show escape hatch for human override

### Technical Tasks

- [ ] Create `immutable-values.yaml` JSON Schema for validation
- [ ] Create `canon-of-flaws.yaml` JSON Schema for validation
- [ ] Update `.claude/skills/envisioning-moodboard/SKILL.md` for value capture
- [ ] Create `.claude/skills/canonizing-flaws/index.yaml`
- [ ] Create `.claude/skills/canonizing-flaws/SKILL.md` (per SDD §4.3)
- [ ] Create `.claude/commands/canonize.md`
- [ ] Create `.claude/scripts/check-flaw.sh` helper
- [ ] Update `.claude/skills/crafting-guidance/SKILL.md` for value/flaw checking
- [ ] Implement block message format per SDD §6.2
- [ ] Implement warning message format per SDD §6.3
- [ ] Create override logging to `sigil-mark/audit/overrides.yaml`

### Dependencies

- Sprint 1: v3 directory structure must exist
- Sprint 1: `get-strictness.sh` for strictness-aware behavior

### Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Interview fatigue | Medium | Medium | Keep questions focused; allow skipping optional sections |
| False positive flaw detection | Low | High | Pattern matching should be conservative; human review always |

### Success Metrics

- `/envision` captures at least 2 immutable values
- `/canonize` creates valid flaw entry with PROTECTED status
- `/craft` correctly warns on value violation in guiding mode
- `/craft` correctly blocks on flaw violation in enforcing mode

---

## Sprint 3: Lens Array

**Duration:** 2.5 days
**Theme:** Implement multi-lens validation system

### Sprint Goal

Implement the Lens Array pillar with user persona definitions, constrained lens validation, and integration with `/craft` for lens-aware guidance.

### Deliverables

- [ ] `lenses.yaml` schema implemented
- [ ] `/envision` extended to define lenses
- [ ] Lens validation logic (most constrained = truth test)
- [ ] Immutable properties enforcement across lenses
- [ ] `/craft` updated for lens-aware guidance
- [ ] `get-lens.sh` helper for lens detection

### Acceptance Criteria

> From prd.md FR-4: "Validation runs in most constrained lens first"
> From prd.md FR-5: "Agent blocks lens variations that modify immutable properties"

- [ ] `/envision` creates lens definitions in `sigil-mark/lens-array/lenses.yaml`
- [ ] Each lens has: name, description, priority, constraints, validation rules
- [ ] Lens with lowest priority number is the truth test
- [ ] Validation fails if asset breaks in constrained lens
- [ ] Immutable properties (security, core logic) cannot vary between lenses
- [ ] `/craft` detects current lens and applies appropriate constraints

### Technical Tasks

- [ ] Create `lenses.yaml` JSON Schema for validation
- [ ] Update `.claude/skills/envisioning-moodboard/SKILL.md` for lens definition interview
- [ ] Create lens definition interview questions (per SDD §3.4)
- [ ] Create `.claude/scripts/get-lens.sh` helper
- [ ] Implement lens stacking rules (allowed combinations)
- [ ] Implement conflict resolution (priority order)
- [ ] Create internal skill for lens validation (validating-lenses)
- [ ] Update `.claude/skills/crafting-guidance/SKILL.md` for lens awareness
- [ ] Add lens context to `/craft` output

### Dependencies

- Sprint 2: `/envision` skill must support extension
- Sprint 2: Soul Binder values (some may be immutable across lenses)

### Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Lens complexity overwhelming | Medium | Medium | Default to single lens; add complexity gradually |
| Stacking conflicts confusing | Low | Low | Clear documentation; sensible defaults |

### Success Metrics

- `/envision` creates at least 2 lens definitions
- `get-lens.sh` correctly identifies lens from config
- Validation correctly fails when constrained lens fails
- Immutable property violation detected and blocked

---

## Sprint 4: Consultation Chamber

**Duration:** 2.5 days
**Theme:** Implement layered decision authority

### Sprint Goal

Implement the Consultation Chamber pillar with three-tier decision authority (strategic/direction/execution), decision locking, and time-based unlock.

### Deliverables

- [ ] `/consult` command and skill implemented
- [ ] Decision record schema implemented
- [ ] Three-tier layer detection (strategic/direction/execution)
- [ ] Decision locking mechanism
- [ ] Time-based unlock checking
- [ ] Integration with `/craft` for locked decision awareness

### Acceptance Criteria

> From prd.md FR-6: "Layer determined by decision scope"
> From prd.md FR-7: "System tracks decision dates"

- [ ] `/consult` determines appropriate tier for decision
- [ ] Strategic tier outputs poll format for community channels
- [ ] Direction tier creates comparison and sentiment gathering template
- [ ] Execution tier informs user this is Taste Owner decision
- [ ] Decisions saved to `sigil-mark/consultation-chamber/decisions/{id}.yaml`
- [ ] Locked decisions show lock status when queried
- [ ] Time-based unlock available after configured duration
- [ ] `/craft` warns/blocks when touching locked decisions

### Technical Tasks

- [ ] Create decision record schema (per SDD §3.5)
- [ ] Create `.claude/skills/consulting-decisions/index.yaml`
- [ ] Create `.claude/skills/consulting-decisions/SKILL.md`
- [ ] Create `.claude/commands/consult.md`
- [ ] Implement layer detection algorithm (per SDD §6.7)
- [ ] Create internal skill `locking-decisions`
- [ ] Create internal skill `unlocking-decisions`
- [ ] Create `.claude/scripts/check-decision.sh` helper
- [ ] Update consultation-chamber config schema
- [ ] Update `/craft` to respect decision locks
- [ ] Implement lock message format (per SDD lock specification)

### Dependencies

- Sprint 3: Lens definitions (some decisions may be lens-specific)
- Sprint 2: Taste Owner configuration in `.sigilrc.yaml`

### Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Tier detection inaccurate | Medium | Medium | Default to asking user; improve with usage data |
| Lock duration too restrictive | Low | Medium | Make duration configurable per decision |

### Success Metrics

- `/consult` correctly identifies tier for 3 different decision types
- Decision lock persists across sessions
- Time-based unlock works after duration expires
- `/craft` correctly warns on locked decision modification

---

## Sprint 5: Proving Grounds

**Duration:** 2.5 days
**Theme:** Implement scale validation and graduation

### Sprint Goal

Implement the Proving Grounds pillar with feature registration, domain-specific monitors, proving status tracking, and graduation with sign-off.

### Deliverables

- [ ] `/prove` command and skill implemented
- [ ] `/graduate` command and skill implemented
- [ ] Proving status schema implemented
- [ ] Monitor framework (domain-configurable)
- [ ] Graduation requirements checking
- [ ] Integration with Living Canon

### Acceptance Criteria

> From prd.md FR-8: "Monitors run throughout proving period"
> From prd.md FR-9: "Graduation requires sign-off from Taste Owner"

- [ ] `/prove <feature>` registers feature in `sigil-mark/proving-grounds/active/`
- [ ] Proving record includes: monitors, duration, status, violations
- [ ] Monitors configurable by domain (DeFi, Creative, Community, Games)
- [ ] `/graduate <feature>` checks: duration complete, monitors green, no P1s
- [ ] Graduation requires explicit Taste Owner sign-off
- [ ] Graduated features moved to `sigil-mark/canon/graduated/`

### Technical Tasks

- [ ] Create proving status schema (per SDD §3.6)
- [ ] Create `.claude/skills/proving-features/index.yaml`
- [ ] Create `.claude/skills/proving-features/SKILL.md`
- [ ] Create `.claude/commands/prove.md`
- [ ] Create `.claude/skills/graduating-features/index.yaml`
- [ ] Create `.claude/skills/graduating-features/SKILL.md`
- [ ] Create `.claude/commands/graduate.md`
- [ ] Implement monitor definitions by domain
- [ ] Create `.claude/scripts/get-monitors.sh` helper
- [ ] Implement graduation eligibility checking
- [ ] Create internal skill `monitoring-features`
- [ ] Update proving-grounds config schema

### Dependencies

- Sprint 4: Decision locking (graduation is a decision)
- Sprint 2: Taste Owner sign-off mechanism

### Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Monitor integration complexity | Medium | High | Start with basic monitors; expand with usage |
| No real testnet for proving | Medium | Medium | Allow "mock" proving for non-deployed features |

### Success Metrics

- `/prove` creates valid proving record
- Status correctly tracks days elapsed/remaining
- Graduation blocked when monitors not green
- Graduated features appear in Living Canon

---

## Sprint 6: Polish & Documentation

**Duration:** 2.5 days
**Theme:** Testing, documentation, and migration support

### Sprint Goal

Complete comprehensive testing, documentation for all commands, migration guide from v2, and quality assurance before release.

### Deliverables

- [ ] Schema validation tests for all YAML files
- [ ] Helper script tests
- [ ] Integration test recordings for key flows
- [ ] Command documentation complete
- [ ] Migration guide from v2 → v3
- [ ] CHANGELOG update

### Acceptance Criteria

- [ ] All JSON Schema validations pass on example files
- [ ] All helper scripts have test coverage
- [ ] Integration tests cover: `/setup`, `/envision`, `/canonize`, `/craft`, `/consult`, `/prove`
- [ ] Each command has complete documentation
- [ ] Migration guide covers: backup, setup, envision, zone-to-lens mapping
- [ ] Error messages refined for clarity

### Technical Tasks

- [ ] Create JSON Schema files for all YAML schemas
- [ ] Create test script `test-schemas.sh`
- [ ] Create test scripts for each helper (`test-get-*.sh`)
- [ ] Create integration test recordings (per SDD §8.5)
- [ ] Write command documentation for `/canonize`, `/consult`, `/prove`, `/graduate`
- [ ] Write migration guide in `MIGRATION-V3.md`
- [ ] Update `CLAUDE.md` with v3 agent instructions
- [ ] Update `README.md` for v3
- [ ] Update `CHANGELOG.md`
- [ ] Final error message review and refinement

### Dependencies

- Sprints 1-5: All features must be implemented

### Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Test coverage gaps | Medium | Medium | Focus on critical paths; expand post-release |
| Documentation incomplete | Low | Medium | Use templates; systematic coverage check |

### Success Metrics

- All schema tests pass
- All script tests pass
- Integration tests cover all commands
- Migration guide tested on sample v2 project

---

## Risk Register

| ID | Risk | Sprint | Probability | Impact | Mitigation | Owner |
|----|------|--------|-------------|--------|------------|-------|
| R1 | v2 → v3 migration issues | 1, 6 | Medium | Medium | Clear backup/migration path | Engineering |
| R2 | Interview fatigue | 2-4 | Medium | Medium | Keep interviews focused | Design |
| R3 | False positive flaw detection | 2 | Low | High | Conservative patterns; human review | Engineering |
| R4 | Lens complexity | 3 | Medium | Medium | Default single lens | Design |
| R5 | Tier detection accuracy | 4 | Medium | Medium | Default to user choice | Engineering |
| R6 | Monitor integration | 5 | Medium | High | Basic monitors first | Engineering |
| R7 | Test coverage gaps | 6 | Medium | Medium | Focus critical paths | QA |

---

## Success Metrics Summary

| Metric | Target | Measurement Method | Sprint |
|--------|--------|-------------------|--------|
| v3 setup success rate | 100% | Test `/setup` creates all directories | 1 |
| Value capture in interview | ≥2 values | Count values in `immutable-values.yaml` | 2 |
| Flaw protection working | Blocks in enforcing mode | Test `/craft` with flaw-affecting change | 2 |
| Lens validation accuracy | 100% constrained lens fails block | Test asset validation | 3 |
| Tier detection accuracy | ≥80% correct tier | Test `/consult` with known decisions | 4 |
| Decision lock persistence | Locks survive sessions | Test lock after reload | 4 |
| Graduation eligibility | Correct for all states | Test `/graduate` states | 5 |
| Test coverage | All commands covered | Count integration tests | 6 |

---

## Dependencies Map

```
Sprint 1 ─────────────────────────────────────────────────────────────────────┐
   │                                                                           │
   │  Foundation: Directory structure, .sigilrc.yaml, strictness              │
   │                                                                           │
   ▼                                                                           │
Sprint 2 ─────────────────────────────────────────────────────────────────────┤
   │                                                                           │
   │  Soul Binder: Values, Flaws, /envision, /canonize                        │
   │                                                                           │
   ▼                                                                           │
Sprint 3 ─────────────────────────────────────────────────────────────────────┤
   │                                                                           │
   │  Lens Array: Lenses, validation, /craft integration                      │
   │                                                                           │
   ▼                                                                           │
Sprint 4 ─────────────────────────────────────────────────────────────────────┤
   │                                                                           │
   │  Consultation: /consult, decisions, locking                              │
   │                                                                           │
   ▼                                                                           │
Sprint 5 ─────────────────────────────────────────────────────────────────────┤
   │                                                                           │
   │  Proving: /prove, /graduate, monitors                                    │
   │                                                                           │
   ▼                                                                           │
Sprint 6 ─────────────────────────────────────────────────────────────────────┘
   │
   │  Polish: Tests, docs, migration
   │
   ▼
   🚀 Release v3.0.0
```

---

## Appendix

### A. PRD Feature Mapping

| PRD Feature | Priority | Sprint | Status |
|-------------|----------|--------|--------|
| FR-1: Immutable Values | P0 | 2 | Planned |
| FR-2: Canon of Flaws | P0 | 2 | Planned |
| FR-3: Visual Soul (Grit) | P1 | Future | Deferred |
| FR-4: Lens Array | P0 | 3 | Planned |
| FR-5: Immutable Properties | P0 | 3 | Planned |
| FR-6: Layered Authority | P1 | 4 | Planned |
| FR-7: Time-Based Unlock | P2 | 4 | Planned |
| FR-8: Scale Validation | P1 | 5 | Planned |
| FR-9: Graduation | P1 | 5 | Planned |
| FR-10: Progressive Strictness | P0 | 1 | Planned |
| FR-11: Interview Config | P0 | 2-4 | Planned |
| FR-12: Human Accountability | P0 | 2 | Planned |

### B. SDD Component Mapping

| SDD Component | Reference | Sprint | Status |
|---------------|-----------|--------|--------|
| Directory Structure | §1.3 | 1 | Planned |
| .sigilrc.yaml Schema | §3.7 | 1 | Planned |
| immutable-values.yaml | §3.2 | 2 | Planned |
| canon-of-flaws.yaml | §3.3 | 2 | Planned |
| lenses.yaml | §3.4 | 3 | Planned |
| decisions/*.yaml | §3.5 | 4 | Planned |
| proving-grounds/*.yaml | §3.6 | 5 | Planned |
| canonizing-flaws skill | §4.3 | 2 | Planned |
| Block Message Format | §6.2 | 2 | Planned |
| Warning Message Format | §6.3 | 2 | Planned |
| Layer Detection | §6.7 | 4 | Planned |

### C. Deferred Items (Future Sprints)

| Item | PRD Reference | Reason for Deferral |
|------|---------------|---------------------|
| Visual Soul (Grit) | FR-3 | P1; requires visual comparison tooling |
| Motion Recipes | Future Scope | V2 feature per PRD |
| Sound Guidance | Future Scope | V2 feature per PRD |
| CI/CD Integration | Future Scope | V2 feature per PRD |
| Multi-Repo Governance | Future Scope | V2 feature per PRD |

---

*Generated by Sprint Planner Agent*
*Sigil v3: Culture is the Reality. Code is Just the Medium.*
