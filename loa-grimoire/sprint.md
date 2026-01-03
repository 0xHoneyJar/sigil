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

**Total Sprints:** 7
**Sprint Duration:** 2.5 days each (Sprint 7: 1 day)
**Estimated Total:** 16 working days

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
| 7 | Review Feedback Fixes | `/unlock`, `/de-canonize`, lens interview, polish | Sprint 6 |

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

- [x] `immutable-values.yaml` schema implemented
- [x] `canon-of-flaws.yaml` schema implemented
- [x] `/envision` updated to capture values through interview
- [x] `/canonize` command and skill implemented
- [x] Value violation detection in `/craft`
- [x] Protected flaw blocking in enforcing/strict modes

### Acceptance Criteria

> From prd.md FR-1: "Block-level violations prevent agent from proceeding"
> From prd.md FR-2: "Agent detects changes affecting protected flaws"

- [x] `/envision` interviews user about core values (shared + project-specific)
- [x] Values saved to `sigil-mark/soul-binder/immutable-values.yaml`
- [x] `/canonize` interviews user about emergent behavior
- [x] Flaw saved to `sigil-mark/soul-binder/canon-of-flaws.yaml` with PROTECTED status
- [x] `/craft` checks values and warns/blocks based on strictness
- [x] Protected flaw violations BLOCK in enforcing/strict modes
- [x] All blocks show escape hatch for human override

### Technical Tasks

- [x] Create `immutable-values.yaml` JSON Schema for validation
- [x] Create `canon-of-flaws.yaml` JSON Schema for validation
- [x] Update `.claude/skills/envisioning-moodboard/SKILL.md` for value capture
- [x] Create `.claude/skills/canonizing-flaws/index.yaml`
- [x] Create `.claude/skills/canonizing-flaws/SKILL.md` (per SDD §4.3)
- [x] Create `.claude/commands/canonize.md`
- [x] Create `.claude/scripts/check-flaw.sh` helper
- [x] Update `.claude/skills/crafting-guidance/SKILL.md` for value/flaw checking
- [x] Implement block message format per SDD §6.2
- [x] Implement warning message format per SDD §6.3
- [x] Create override logging to `sigil-mark/audit/overrides.yaml`

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

- [x] `lenses.yaml` schema implemented
- [x] `/envision` extended to define lenses
- [x] Lens validation logic (most constrained = truth test)
- [x] Immutable properties enforcement across lenses
- [x] `/craft` updated for lens-aware guidance
- [x] `get-lens.sh` helper for lens detection

### Acceptance Criteria

> From prd.md FR-4: "Validation runs in most constrained lens first"
> From prd.md FR-5: "Agent blocks lens variations that modify immutable properties"

- [x] `/envision` creates lens definitions in `sigil-mark/lens-array/lenses.yaml`
- [x] Each lens has: name, description, priority, constraints, validation rules
- [x] Lens with lowest priority number is the truth test
- [x] Validation fails if asset breaks in constrained lens
- [x] Immutable properties (security, core logic) cannot vary between lenses
- [x] `/craft` detects current lens and applies appropriate constraints

### Technical Tasks

- [x] Create `lenses.yaml` JSON Schema for validation
- [x] Update `.claude/skills/envisioning-moodboard/SKILL.md` for lens definition interview
- [x] Create lens definition interview questions (per SDD §3.4)
- [x] Create `.claude/scripts/get-lens.sh` helper
- [x] Implement lens stacking rules (allowed combinations)
- [x] Implement conflict resolution (priority order)
- [x] Create internal skill for lens validation (validating-lenses)
- [x] Update `.claude/skills/crafting-guidance/SKILL.md` for lens awareness
- [x] Add lens context to `/craft` output

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

- [x] `/consult` command and skill implemented
- [x] Decision record schema implemented
- [x] Three-tier layer detection (strategic/direction/execution)
- [x] Decision locking mechanism
- [x] Time-based unlock checking
- [x] Integration with `/craft` for locked decision awareness

### Acceptance Criteria

> From prd.md FR-6: "Layer determined by decision scope"
> From prd.md FR-7: "System tracks decision dates"

- [x] `/consult` determines appropriate tier for decision
- [x] Strategic tier outputs poll format for community channels
- [x] Direction tier creates comparison and sentiment gathering template
- [x] Execution tier informs user this is Taste Owner decision
- [x] Decisions saved to `sigil-mark/consultation-chamber/decisions/{id}.yaml`
- [x] Locked decisions show lock status when queried
- [x] Time-based unlock available after configured duration
- [x] `/craft` warns/blocks when touching locked decisions

### Technical Tasks

- [x] Create decision record schema (per SDD §3.5)
- [x] Create `.claude/skills/consulting-decisions/index.yaml`
- [x] Create `.claude/skills/consulting-decisions/SKILL.md`
- [x] Create `.claude/commands/consult.md`
- [x] Implement layer detection algorithm (per SDD §6.7)
- [x] Create internal skill `locking-decisions`
- [x] Create internal skill `unlocking-decisions`
- [x] Create `.claude/scripts/check-decision.sh` helper
- [x] Update consultation-chamber config schema
- [x] Update `/craft` to respect decision locks
- [x] Implement lock message format (per SDD lock specification)

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

- [x] `/prove` command and skill implemented
- [x] `/graduate` command and skill implemented
- [x] Proving status schema implemented
- [x] Monitor framework (domain-configurable)
- [x] Graduation requirements checking
- [x] Integration with Living Canon

### Acceptance Criteria

> From prd.md FR-8: "Monitors run throughout proving period"
> From prd.md FR-9: "Graduation requires sign-off from Taste Owner"

- [x] `/prove <feature>` registers feature in `sigil-mark/proving-grounds/active/`
- [x] Proving record includes: monitors, duration, status, violations
- [x] Monitors configurable by domain (DeFi, Creative, Community, Games)
- [x] `/graduate <feature>` checks: duration complete, monitors green, no P1s
- [x] Graduation requires explicit Taste Owner sign-off
- [x] Graduated features moved to `sigil-mark/canon/graduated/`

### Technical Tasks

- [x] Create proving status schema (per SDD §3.6)
- [x] Create `.claude/skills/proving-features/index.yaml`
- [x] Create `.claude/skills/proving-features/SKILL.md`
- [x] Create `.claude/commands/prove.md`
- [x] Create `.claude/skills/graduating-features/index.yaml`
- [x] Create `.claude/skills/graduating-features/SKILL.md`
- [x] Create `.claude/commands/graduate.md`
- [x] Implement monitor definitions by domain
- [x] Create `.claude/scripts/get-monitors.sh` helper
- [x] Implement graduation eligibility checking
- [x] Create internal skill `monitoring-features`
- [x] Update proving-grounds config schema

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

- [x] Schema validation tests for all YAML files
- [x] Helper script tests
- [x] Integration test recordings for key flows
- [x] Command documentation complete
- [x] Migration guide from v2 → v3
- [x] CHANGELOG update

### Acceptance Criteria

- [x] All JSON Schema validations pass on example files
- [x] All helper scripts have test coverage
- [x] Integration tests cover: `/setup`, `/envision`, `/canonize`, `/craft`, `/consult`, `/prove`
- [x] Each command has complete documentation
- [x] Migration guide covers: backup, setup, envision, zone-to-lens mapping
- [x] Error messages refined for clarity

### Technical Tasks

- [x] Create JSON Schema files for all YAML schemas
- [x] Create test script `test-schemas.sh`
- [x] Create test scripts for each helper (`test-get-*.sh`)
- [x] Create integration test recordings (per SDD §8.5)
- [x] Write command documentation for `/canonize`, `/consult`, `/prove`, `/graduate`
- [x] Write migration guide in `MIGRATION-V3.md`
- [x] Update `CLAUDE.md` with v3 agent instructions
- [x] Update `README.md` for v3
- [x] Update `CHANGELOG.md`
- [x] Final error message review and refinement

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
Sprint 6 ─────────────────────────────────────────────────────────────────────┤
   │                                                                           │
   │  Polish: Tests, docs, migration                                           │
   │                                                                           │
   ▼                                                                           │
Sprint 7 ─────────────────────────────────────────────────────────────────────┘
   │
   │  Review Fixes: /unlock, /de-canonize, lens interview
   │
   ▼
   🚀 Release v0.3.0
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

---

## Sprint 7: Review Feedback Fixes

**Duration:** 1 day
**Theme:** Address implementation gaps from v0.3 external review
**Review Reference:** `loa-grimoire/context/sigil-v3-implementation-review.md`

### Sprint Goal

Address all high-priority gaps identified in the external review (B+ grade, 91% PRD compliance). Bring implementation to full compliance with PRD and SDD specifications.

### Review Summary

External review identified:
- **Grade:** B+ (91% PRD compliance)
- **High Priority Gaps:** 3 issues (blocking full compliance)
- **Medium Priority Gaps:** 3 issues (quality improvements)

### Deliverables

- [x] `/unlock` command created and routed to `unlocking-decisions` skill
- [x] `/de-canonize` command created OR references removed from `/canonize` output
- [x] Lens capture interview questions added to `/envision` skill
- [x] `--lens` flag added to `/craft` command (medium priority)
- [x] Poll templates added to `consulting-decisions` skill (medium priority)
- [x] Monitors documented as manual check-ins (medium priority)

### Acceptance Criteria

> From external review: "Missing /unlock command referenced in SDD but not implemented"
> From external review: "No lens capture interview questions in /envision"

**High Priority (Must Fix):**
- [x] Running `/unlock <decision-id>` triggers time-based unlock flow
- [x] `/canonize` output either uses `/de-canonize` command OR removes reference
- [x] `/envision` includes interview questions for lens definitions per SDD §3.4
- [x] Lens interview captures: name, description, priority, constraints, validation rules

**Medium Priority (Should Fix):**
- [x] `/craft --lens power_user` forces validation in specific lens
- [x] `/consult` outputs proper poll templates for strategic tier
- [x] `/prove` documents monitors as manual check-ins, not automated

### Technical Tasks

**Task 7.1: Create /unlock Command (HIGH - 1 hour)**
- [x] Create `.claude/commands/unlock.md` with frontmatter
- [x] Route to existing `unlocking-decisions` internal skill
- [x] Verify skill path in `.claude/skills/unlocking-decisions/`
- [x] Test unlock flow for expired decision lock

**Task 7.2: Handle /de-canonize Reference (HIGH - 2 hours)**
- [x] Option A: Create `/de-canonize` command and skill
  - Create `.claude/commands/de-canonize.md`
  - Create `.claude/skills/de-canonizing-flaws/index.yaml`
  - Create `.claude/skills/de-canonizing-flaws/SKILL.md`
- [x] Option B: Remove reference from `/canonize` output
  - Update `.claude/skills/canonizing-flaws/SKILL.md`
  - Remove "Use /de-canonize to reverse" text

**Task 7.3: Add Lens Interview to /envision (HIGH - 4 hours)**
- [x] Update `.claude/skills/envisioning-moodboard/SKILL.md`
- [x] Add lens definition interview section per SDD §3.4
- [x] Interview questions for each lens:
  - "Who is this lens representing?" (name/description)
  - "What priority does this lens have?" (1 = truth test)
  - "What constraints apply to this lens?" (accessibility, performance, etc.)
  - "What validation rules should apply?" (specific checks)
- [x] Ensure lens definitions saved to `sigil-mark/lens-array/lenses.yaml`

**Task 7.4: Add --lens Flag to /craft (MEDIUM - 1 hour)**
- [x] Update `.claude/commands/craft.md` to accept `--lens` argument
- [x] Update `.claude/skills/crafting-guidance/SKILL.md` to parse lens flag
- [x] When `--lens X` provided, force validation in that lens only

**Task 7.5: Add Poll Templates to /consult (MEDIUM - 1 hour)**
- [x] Update `.claude/skills/consulting-decisions/SKILL.md`
- [x] Add Discord poll template for strategic tier
- [x] Add Slack poll template for strategic tier
- [x] Add Twitter poll template for strategic tier

**Task 7.6: Document Monitor Expectations (MEDIUM - 30 min)**
- [x] Update `.claude/skills/proving-features/SKILL.md`
- [x] Clarify monitors are manual check-in prompts, not automated
- [x] Add example of manual monitoring workflow

### Dependencies

- Sprint 1-6: All previous sprints completed
- Existing `unlocking-decisions` skill must exist (verify)

### Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| `unlocking-decisions` skill missing | Low | Medium | Check if exists; create if needed |
| Lens interview too long | Medium | Low | Keep questions focused; allow skip |
| `/de-canonize` scope unclear | Medium | Low | Start with remove; add later if needed |

### Success Metrics

- All high-priority gaps closed (100%)
- External review grade improves to A (95%+ compliance)
- `/unlock` command functional
- Lens interview generates valid `lenses.yaml`

### Effort Estimates

| Task | Priority | Effort | Status |
|------|----------|--------|--------|
| 7.1: /unlock command | HIGH | 1 hour | Pending |
| 7.2: /de-canonize handling | HIGH | 2 hours | Pending |
| 7.3: Lens interview | HIGH | 4 hours | Pending |
| 7.4: --lens flag | MEDIUM | 1 hour | Pending |
| 7.5: Poll templates | MEDIUM | 1 hour | Pending |
| 7.6: Monitor docs | MEDIUM | 30 min | Pending |
| **Total** | | **9.5 hours** | |

---

*Generated by Sprint Planner Agent*
*Sigil v0.3: Culture is the Reality. Code is Just the Medium.*

---
---

# Sprint Plan: Sigil v0.4 — Soul Engine

**Version:** 1.0
**Date:** 2026-01-02
**Author:** Sprint Planner Agent
**PRD Reference:** loa-grimoire/prd.md (v2.0)
**SDD Reference:** loa-grimoire/sdd.md (v1.0)
**Branch:** feature/soul-engine-v04

---

## Executive Summary

Sigil v0.4 Soul Engine introduces a **runtime layer** that didn't exist in v0.3. This is a fundamental shift from pure configuration/skills to an npm package (`@sigil/soul-engine`) with React hooks, CSS variables, and a Vite Workbench.

**User Decisions:**
- **Team:** Solo (1 dev)
- **Sprint Duration:** 1 week
- **MVP Scope:** Full MVP (all P0 items)

**Key Deliverables:**
- `@sigil/soul-engine` npm package with subpath exports
- Material Core (Glass, Clay, Machinery)
- Tension System (4 axes → CSS variables)
- Interaction Router (CRDT, LWW, Server-Tick)
- Vite Workbench (per-repo SPA)
- Claude integration (CLAUDE.md + corrections)

**Total Sprints:** 5
**Sprint Duration:** 1 week each
**Estimated Total:** 5 weeks

---

## v0.4 Sprint Overview

| Sprint | Theme | Key Deliverables | Dependencies |
|--------|-------|------------------|--------------|
| 8 | Package Scaffold & CLI | npm package structure, CLI commands, SQLite setup | v0.3 complete |
| 9 | Material Core | Glass/Clay/Machinery physics, MaterialProvider, useMaterial | Sprint 8 |
| 10 | Tension System | TensionProvider, useTensions, CSS variables, presets | Sprint 8 |
| 11 | Interaction Router & Sync Hooks | Router, useServerTick, useLocalFirst, declarations | Sprint 9 |
| 12 | Workbench & Soul Binder | Vite SPA, tension controls, CLAUDE.md generation | Sprint 10-11 |

---

## Sprint 8: Package Scaffold & CLI

**Duration:** 1 week
**Theme:** Create npm package foundation and CLI tooling

### Sprint Goal

Establish the `@sigil/soul-engine` package structure with subpath exports, CLI commands (`sigil init`, `sigil mount`, `sigil workbench`), and SQLite persistence layer.

### Deliverables

- [ ] npm package structure with subpath exports
- [ ] `sigil init` CLI command
- [ ] `sigil mount` CLI command
- [ ] `sigil sync` CLI command
- [ ] SQLite schema and sql.js integration
- [ ] `.sigilrc.yaml` v0.4 schema
- [ ] TypeScript configuration

### Acceptance Criteria

> From PRD: "Claude integration and mounting procedure onto existing codebase"
> From SDD: "@sigil/soul-engine with subpath exports"

- [ ] `npm install @sigil/soul-engine` installs package successfully
- [ ] `npx sigil init` creates `.sigilrc.yaml`, `.sigil/sigil.db`, `sigil-workbench/`
- [ ] `npx sigil mount` detects existing components and generates zone config
- [ ] SQLite database has all tables: tensions, sync_declarations, corrections, paper_cuts
- [ ] Package exports work: `@sigil/soul-engine`, `/material`, `/sync`, `/hooks`, `/workbench`

### Technical Tasks

**Task 8.1: Package Structure (4 hours)**
- [ ] Create package.json with exports field
- [ ] Configure TypeScript (tsconfig.json)
- [ ] Configure build pipeline (tsup or rollup)
- [ ] Create dist/ output structure
- [ ] Add peerDependencies (react, react-dom)

**Task 8.2: CLI Foundation (6 hours)**
- [ ] Create CLI entry point (`bin/sigil.js`)
- [ ] Implement `sigil init` command
- [ ] Implement `sigil mount` command
- [ ] Implement `sigil sync` command
- [ ] Implement `sigil workbench` command (placeholder)

**Task 8.3: SQLite Integration (4 hours)**
- [ ] Add sql.js dependency
- [ ] Create database schema (per SDD)
- [ ] Create `lib/db.ts` with lazy loading
- [ ] Create migration strategy
- [ ] Ensure WASM loads correctly

**Task 8.4: Configuration Schema (3 hours)**
- [ ] Create `.sigilrc.yaml` v0.4 schema
- [ ] Create zone configuration structure
- [ ] Create tension preset structure
- [ ] Create YAML parser/writer utilities

**Task 8.5: Setup Marker (1 hour)**
- [ ] Create `.sigil-setup-complete` on init
- [ ] Detect existing setup in CLI commands

### Dependencies

- v0.3 Sprint 7 complete
- Node.js 18+ environment

### Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| sql.js WASM loading issues | Medium | High | Test in multiple environments |
| Subpath exports browser compat | Low | Medium | Add fallback exports |

### Success Metrics

- `sigil init` creates all required files
- Package imports work in fresh project
- SQLite database accessible via sql.js

---

## Sprint 9: Material Core

**Duration:** 1 week
**Theme:** Implement material physics system

### Sprint Goal

Implement the Material Core system with Glass, Clay, and Machinery materials as physics models, React context, and pre-built components.

### Deliverables

- [ ] MaterialCore.ts with physics definitions
- [ ] MaterialProvider React context
- [ ] useMaterial hook
- [ ] MaterialButton, MaterialCard components
- [ ] Zone-to-material detection
- [ ] Material forbidden pattern warnings

### Acceptance Criteria

> From SDD: "Materials define physics, not just styles"
> From PRD: "Glass refracts, Clay has weight, Machinery clicks"

- [ ] `<MaterialProvider defaultMaterial="clay">` wraps app
- [ ] `useMaterial()` returns current material physics
- [ ] `physics.getSurfaceCSS()` returns valid CSS
- [ ] `physics.getEntranceAnimation()` returns keyframe config
- [ ] Zone detection maps file path to appropriate material
- [ ] Forbidden pattern used → warning in console

### Technical Tasks

**Task 9.1: Material Physics Definitions (4 hours)**
- [ ] Create GlassMaterial class
- [ ] Create ClayMaterial class
- [ ] Create MachineryMaterial class
- [ ] Implement all interface methods (getSurfaceCSS, getShadowCSS, etc.)
- [ ] Define forbidden patterns for each material

**Task 9.2: Material Provider (4 hours)**
- [ ] Create MaterialContext
- [ ] Create MaterialProvider component
- [ ] Implement zone detection logic
- [ ] Add material override capability
- [ ] Handle nested providers

**Task 9.3: useMaterial Hook (2 hours)**
- [ ] Create useMaterial hook
- [ ] Return material type, physics, setMaterial
- [ ] Handle context not found error
- [ ] Add zone awareness

**Task 9.4: Material Components (4 hours)**
- [ ] Create MaterialButton component
- [ ] Create MaterialCard component
- [ ] Create MaterialInput component
- [ ] Apply physics automatically
- [ ] Support materialOverride prop

**Task 9.5: Zone Detection (3 hours)**
- [ ] Read zones from .sigilrc.yaml
- [ ] Match current file path to zone
- [ ] Return appropriate material
- [ ] Cache zone mappings

### Dependencies

- Sprint 8: Package structure must exist
- Sprint 8: .sigilrc.yaml schema with zones

### Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| CSS-in-JS conflicts | Medium | Medium | Use CSS variables as intermediary |
| Zone detection in bundlers | Medium | Low | Provide manual zone override |

### Success Metrics

- Material components render with correct physics
- Zone detection returns correct material for path
- Forbidden pattern warning appears in console

---

## Sprint 10: Tension System

**Duration:** 1 week
**Theme:** Implement real-time tension controls

### Sprint Goal

Implement the Tension System with 4 axes (Playfulness, Weight, Density, Speed), CSS variable output, presets, and SQLite persistence.

### Deliverables

- [ ] TensionProvider React context
- [ ] useTensions hook
- [ ] tensionsToCSSVariables function
- [ ] Tension presets (Linear, Airbnb, Nintendo, OSRS)
- [ ] SQLite persistence for tensions
- [ ] 60fps tension update throttling

### Acceptance Criteria

> From SDD: "60fps tension updates via RAF throttle"
> From PRD: "Tune product feel in real-time"

- [ ] `<TensionProvider initialTensions={{ playfulness: 50 }}>` works
- [ ] `useTensions()` returns tensions, setTension, cssVariables
- [ ] CSS variables update in real-time (60fps)
- [ ] `applyPreset('linear')` applies preset values
- [ ] Tensions persist to SQLite on save
- [ ] Tensions load from SQLite on mount

### Technical Tasks

**Task 10.1: Tension State Management (4 hours)**
- [ ] Define TensionState interface
- [ ] Create TensionContext
- [ ] Create TensionProvider component
- [ ] Implement setTension with RAF throttle
- [ ] Implement setTensions for batch updates

**Task 10.2: CSS Variable Mapping (3 hours)**
- [ ] Create tensionsToCSSVariables function
- [ ] Map playfulness → border-radius, saturation, bounce
- [ ] Map weight → shadow, font-weight, padding
- [ ] Map density → spacing, font-size, gap
- [ ] Map speed → transition, animation duration

**Task 10.3: Presets (2 hours)**
- [ ] Define TENSION_PRESETS constant
- [ ] Add Linear preset
- [ ] Add Airbnb preset
- [ ] Add Nintendo preset
- [ ] Add OSRS preset

**Task 10.4: SQLite Persistence (4 hours)**
- [ ] Create tensions table access
- [ ] Load tensions on provider mount
- [ ] Save tensions on explicit save
- [ ] Handle database not ready state

**Task 10.5: useTensions Hook (2 hours)**
- [ ] Create useTensions hook
- [ ] Return all context values
- [ ] Handle context not found error
- [ ] Add computed CSS variables

### Dependencies

- Sprint 8: SQLite integration
- Sprint 8: Package exports for /hooks

### Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| CSS variable performance | Low | High | RAF throttle already planned |
| SQLite async loading | Medium | Medium | Show loading state |

### Success Metrics

- Tensions update at 60fps visually
- Preset application instant
- Tensions persist across page refresh

---

## Sprint 11: Interaction Router & Sync Hooks

**Duration:** 1 week
**Theme:** Implement sync strategy routing

### Sprint Goal

Implement the Interaction Router with keyword classification, explicit declarations, and sync hooks (useServerTick, useLocalFirst, useCRDTText).

### Deliverables

- [ ] InteractionRouter class
- [ ] Keyword classification for sync strategies
- [ ] Explicit declaration system
- [ ] useServerTick hook (never optimistic)
- [ ] useLocalFirst hook (optimistic)
- [ ] useCRDTText hook (collaborative)
- [ ] SQLite persistence for declarations

### Acceptance Criteria

> From SDD: "Unknown sync patterns require explicit declaration"
> From PRD: "Server-tick data MUST show pending state"

- [ ] Router classifies "withdraw balance" as server_tick
- [ ] Router classifies "edit document" as crdt
- [ ] Router classifies "toggle theme" as lww
- [ ] Unknown patterns return `{ requiresDeclaration: true }`
- [ ] `useServerTick` returns isPending, never optimistic
- [ ] `useLocalFirst` returns optimistic value immediately
- [ ] Declarations persist to SQLite

### Technical Tasks

**Task 11.1: InteractionRouter Class (4 hours)**
- [ ] Create InteractionRouter class
- [ ] Implement keyword classification
- [ ] Implement explicit declaration lookup
- [ ] Implement route() method
- [ ] Create singleton instance

**Task 11.2: Keyword Classification (3 hours)**
- [ ] Define server_tick signals
- [ ] Define crdt signals
- [ ] Define lww signals
- [ ] Define none signals
- [ ] Implement classifyByKeywords method

**Task 11.3: useServerTick Hook (4 hours)**
- [ ] Create useServerTick hook
- [ ] Return value, update, isPending, error
- [ ] NEVER return optimistic state
- [ ] Handle tick rate option
- [ ] Show prominent pending indicator

**Task 11.4: useLocalFirst Hook (3 hours)**
- [ ] Create useLocalFirst hook
- [ ] Return value, update, isSyncing
- [ ] Apply optimistic updates
- [ ] Handle debounce option

**Task 11.5: Declaration Persistence (3 hours)**
- [ ] Create sync_declarations table access
- [ ] Save declarations on declare()
- [ ] Load declarations on router init
- [ ] Create declareSyncStrategy helper

### Dependencies

- Sprint 8: SQLite integration
- Sprint 10: Hook patterns established

### Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Keyword false positives | Medium | Medium | Conservative matching |
| Server-tick without backend | Medium | Low | Mock mode for development |

### Success Metrics

- Keyword classification 90%+ accurate on test cases
- Server-tick never shows optimistic state
- Declarations persist across sessions

---

## Sprint 12: Workbench & Soul Binder

**Duration:** 1 week
**Theme:** Vite SPA and Claude integration

### Sprint Goal

Implement the Vite Workbench SPA with tension controls, artifact preview, sandbox mode, and the Soul Binder CLAUDE.md generation.

### Deliverables

- [ ] Vite Workbench SPA scaffold
- [ ] TensionControls component
- [ ] ArtifactPreview component
- [ ] SandboxToggle component
- [ ] ComponentBrowser component
- [ ] CLAUDE.md generation
- [ ] Corrections file support

### Acceptance Criteria

> From SDD: "Vite-powered SPA bootstrapped per repo"
> From PRD: "CLAUDE.md + corrections file"

- [ ] `sigil workbench` starts Vite dev server
- [ ] Tension sliders update preview in real-time
- [ ] Sandbox mode prevents persistence
- [ ] Component browser shows project components
- [ ] `sigil sync` generates valid CLAUDE.md
- [ ] Corrections file affects CLAUDE.md output

### Technical Tasks

**Task 12.1: Workbench Scaffold (4 hours)**
- [ ] Create Vite project structure
- [ ] Configure Vite for sql.js WASM
- [ ] Set up Tailwind CSS
- [ ] Set up shadcn/ui
- [ ] Create main App layout

**Task 12.2: Tension Controls (4 hours)**
- [ ] Create TensionSlider component
- [ ] Create TensionControlsPanel component
- [ ] Wire to TensionProvider
- [ ] Add preset buttons
- [ ] Add reset button

**Task 12.3: Artifact Preview (3 hours)**
- [ ] Create ArtifactPreview component
- [ ] Load component from path
- [ ] Apply current tensions
- [ ] Apply current material

**Task 12.4: Sandbox Mode (2 hours)**
- [ ] Create SandboxState class
- [ ] Create SandboxToggle component
- [ ] Prevent SQLite writes in sandbox
- [ ] Show sandbox indicator

**Task 12.5: CLAUDE.md Generation (4 hours)**
- [ ] Create generateClaudeContext function
- [ ] Include material physics
- [ ] Include current tensions
- [ ] Include zone configuration
- [ ] Include corrections
- [ ] Write to CLAUDE.md on sync

**Task 12.6: Corrections Support (2 hours)**
- [ ] Create `.sigil/corrections.yaml` schema
- [ ] Load corrections in generation
- [ ] Add corrections to CLAUDE.md output

### Dependencies

- Sprint 9: Material Core
- Sprint 10: Tension System
- Sprint 11: Sync hooks

### Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Vite/React version mismatch | Medium | Medium | Pin versions in package.json |
| Component import failures | Medium | Low | Graceful error handling |

### Success Metrics

- Workbench loads and shows tension controls
- Tension changes reflect in preview
- CLAUDE.md contains all context sections

---

## v0.4 Risk Register

| ID | Risk | Sprint | Probability | Impact | Mitigation |
|----|------|--------|-------------|--------|------------|
| R8 | sql.js WASM loading | 8 | Medium | High | Test multiple environments |
| R9 | CSS-in-JS conflicts | 9 | Medium | Medium | Use CSS variables |
| R10 | Tension performance | 10 | Low | High | RAF throttle |
| R11 | Keyword misclassification | 11 | Medium | Medium | Conservative matching |
| R12 | Component loading | 12 | Medium | Low | Error boundaries |

---

## v0.4 Success Metrics Summary

| Metric | Target | Sprint |
|--------|--------|--------|
| Package install success | 100% | 8 |
| CLI commands functional | All 4 | 8 |
| Material physics correct | 3 materials | 9 |
| Tension update rate | 60fps | 10 |
| Sync classification accuracy | 90%+ | 11 |
| Workbench loads | < 3s | 12 |
| CLAUDE.md valid | All sections | 12 |

---

## v0.4 Dependencies Map

```
Sprint 8 ─────────────────────────────────────────────────────────────────────┐
   │                                                                           │
   │  Package Scaffold: npm structure, CLI, SQLite, .sigilrc.yaml             │
   │                                                                           │
   ├───────────────┬───────────────────────────────────────────────────────────┤
   ▼               ▼                                                           │
Sprint 9       Sprint 10                                                       │
   │               │                                                           │
   │  Material     │  Tension System: CSS vars, presets, persistence          │
   │  Core         │                                                           │
   │               │                                                           │
   ▼               ▼                                                           │
Sprint 11 ────────────────────────────────────────────────────────────────────┤
   │                                                                           │
   │  Interaction Router: Sync hooks, declarations                            │
   │                                                                           │
   ▼                                                                           │
Sprint 12 ────────────────────────────────────────────────────────────────────┘
   │
   │  Workbench & Soul Binder: Vite SPA, CLAUDE.md
   │
   ▼
   🚀 Release v0.4.0
```

---

*Generated by Sprint Planner Agent*
*Sigil v0.4: A Studio, not a Factory. Craft, not just consistency.*
