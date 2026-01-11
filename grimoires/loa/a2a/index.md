# Sigil Audit Trail Index

This document tracks all sprint artifacts and their approval status.

---

## Sprint Status Summary

### Sigil v4.1 (Living Guardrails — Enforcement Layer)

| Sprint | Theme | Status | Reviewer | Auditor |
|--------|-------|--------|----------|---------|
| 1 | Version Coherence & Provider | COMPLETED | ✅ Approved | ✅ Approved |
| 2 | useSigilMutation Hook | COMPLETED | ✅ Approved | ✅ Approved |
| 3 | ESLint Plugin | COMPLETED | ✅ Approved | ✅ Approved |
| 4 | Vocabulary & Physics Timing | COMPLETED | ✅ Approved | ✅ Approved |
| 5 | Remote Soul & /observe Skill | COMPLETED | ✅ Approved | ✅ Approved |
| 6 | Polish & Migration | COMPLETED | ✅ Approved | ✅ Approved |

---

### Sigil v4.0 (Sharp Tools — 7 Discrete Tools)

| Sprint | Theme | Status | Reviewer | Auditor |
|--------|-------|--------|----------|---------|
| 1 | Schema Foundation | COMPLETED | ✅ Approved | ✅ Approved |
| 2 | /envision & /codify Evolution | COMPLETED | ✅ Approved | ✅ Approved |
| 3 | /craft Enhancement | COMPLETED | ✅ Approved | ✅ Approved |
| 4 | /observe Communication | COMPLETED | ✅ Approved | ✅ Approved |
| 5 | /refine Updates | COMPLETED | ✅ Approved | ✅ Approved |
| 6 | /consult Consolidation | COMPLETED | ✅ Approved | ✅ Approved |
| 7 | /garden Health | COMPLETED | ✅ Approved | ✅ Approved |
| 8 | Build-Time Export | COMPLETED | ✅ Approved | ✅ Approved |
| 9 | Migration & Deprecation | COMPLETED | ✅ Approved | ✅ Approved |
| 10 | Integration & Polish | COMPLETED | ✅ Approved | ✅ Approved |

---

### Sigil v3.0 (Living Engine — Agent-Time/Runtime Split)

| Sprint | Theme | Status | Reviewer | Auditor |
|--------|-------|--------|----------|---------|
| 1 | Critical Fixes (P0) | COMPLETED | Approved | Approved |
| 2 | Foundation (P1) | COMPLETED | Approved | Approved |
| 3 | User Fluidity (P2) | COMPLETED | Approved | Approved |
| 4 | Living Market (P3) | COMPLETED | Approved | Approved |

---

### Sigil v2.6 (Craftsman's Flow — Process + Core)

| Sprint | Theme | Status | Reviewer | Auditor |
|--------|-------|--------|----------|---------|
| 1 | Constitution System | COMPLETED | Approved | Approved |
| 2 | Consultation Chamber | COMPLETED | Approved | Approved |
| 3 | Lens Array Foundation | COMPLETED | Approved | Approved |
| 4 | Zone-Persona Integration | COMPLETED | Approved | Approved |
| 5 | Vibe Checks | COMPLETED | Approved | Approved |
| 6 | Claude Commands | COMPLETED | Approved | Approved |
| 7 | Documentation & Migration | COMPLETED | Approved | Approved |

**Security Audit:** APPROVED - LET'S FUCKING GO (2026-01-06)

---

### Sigil v2.0 (Reality Engine — Truth vs Experience)

| Sprint | Theme | Status | Reviewer | Auditor |
|--------|-------|--------|----------|---------|
| 1 | Core Layer Foundation | COMPLETED | Approved | Approved |
| 2 | Core Layer Completion | COMPLETED | Approved | Approved |
| 3 | Layout Layer - CriticalZone | COMPLETED | Approved | Approved |
| 4 | Layout Layer Completion | COMPLETED | Approved | Approved |
| 5 | Lens Layer Foundation | COMPLETED | Approved | Approved |
| 6 | Built-in Lenses | COMPLETED | Approved | Approved |
| 7 | Integration & Migration | COMPLETED | Approved | Approved |
| 8 | Testing & Documentation | COMPLETED | Approved | Approved |

---

### Sigil v1.2.4 (Design Physics Framework - Diff + Feel)

| Sprint | Theme | Status | Reviewer | Auditor |
|--------|-------|--------|----------|---------|
| 1 | Migration Foundation | COMPLETED | Approved | Approved |
| 2 | Recipe System - Decisive Set | COMPLETED | Approved | Approved |
| 3 | Recipe System - Machinery & Glass | COMPLETED | Approved | Approved |
| 4 | Zone System | COMPLETED | Approved | Approved |
| 5 | Core Commands - /craft | COMPLETED | Approved | Approved |
| 6 | Core Commands - /sandbox & /codify | COMPLETED | Approved | Approved |
| 7 | Auxiliary Commands | COMPLETED | Approved | Approved |
| 8 | Workbench | COMPLETED | Approved | Approved |
| 9 | Enforcement Layer | COMPLETED | Approved | Approved |
| 10 | History System & Polish | COMPLETED | Approved | Approved

---

## v2.0 Sprint 1: Core Layer Foundation

**Duration:** 1 sprint
**Theme:** Types and useCriticalAction hook with time authority

### Artifacts
- [reviewer.md](./sprint-1/reviewer.md) - Implementation report
- [engineer-feedback.md](./sprint-1/engineer-feedback.md) - Tech lead review (Pending)

### Key Deliverables
- `sigil-mark/types/index.ts` — Shared type definitions
- `sigil-mark/core/types.ts` — CriticalActionState, CriticalActionOptions
- `sigil-mark/core/useCriticalAction.ts` — Main physics hook
- `sigil-mark/core/index.ts` — Updated barrel export

### Tasks Completed
- [x] S1-T1: Create shared types
- [x] S1-T2: Create CriticalActionState interface
- [x] S1-T3: Create CriticalActionOptions interface
- [x] S1-T4: Implement useCriticalAction hook - server-tick
- [x] S1-T5: Implement useCriticalAction hook - optimistic
- [x] S1-T6: Implement useCriticalAction hook - hybrid
- [x] S1-T7: Create core barrel export

---

## v2.0 Sprint 2: Core Layer Completion

**Duration:** 1 sprint
**Theme:** Proprioception and local cache

### Artifacts
- [reviewer.md](./sprint-2/reviewer.md) - Implementation report
- [engineer-feedback.md](./sprint-2/engineer-feedback.md) - Tech lead review (Pending)

### Key Deliverables
- `sigil-mark/core/proprioception.ts` — Proprioception manager with decay
- `sigil-mark/core/useLocalCache.ts` — Cache hook and factory
- `sigil-mark/__tests__/useCriticalAction.test.ts` — Full test suite

### Tasks Completed
- [x] S2-T1: Create proprioception module
- [x] S2-T2: Implement position prediction with ghost rendering
- [x] S2-T3: Implement reconciliation strategies
- [x] S2-T4: Create useLocalCache hook
- [x] S2-T5: Integrate proprioception with useCriticalAction
- [x] S2-T6: Create useCriticalAction tests

---

## v2.0 Sprint 3: Layout Layer - CriticalZone

**Duration:** 1 sprint
**Theme:** Zone context system and CriticalZone layout

### Artifacts
- [reviewer.md](./sprint-3/reviewer.md) - Implementation report
- [engineer-feedback.md](./sprint-3/engineer-feedback.md) - Tech lead review (Pending)

### Key Deliverables
- `sigil-mark/layouts/context.ts` — Zone context system
- `sigil-mark/layouts/CriticalZone.tsx` — CriticalZone layout primitive
- `sigil-mark/layouts/index.ts` — Layouts barrel export
- `sigil-mark/__tests__/CriticalZone.test.tsx` — Full test suite

### Tasks Completed
- [x] S3-T1: Create zone context
- [x] S3-T2: Implement CriticalZone component
- [x] S3-T3: Implement CriticalZone.Content subcomponent
- [x] S3-T4: Implement CriticalZone.Actions subcomponent
- [x] S3-T5: Implement critical button auto-sorting
- [x] S3-T6: Create CriticalZone tests

---

## v2.0 Sprint 4: Layout Layer Completion

**Duration:** 1 sprint
**Theme:** MachineryLayout and GlassLayout

### Artifacts
- [reviewer.md](./sprint-4/reviewer.md) - Implementation report
- [engineer-feedback.md](./sprint-4/engineer-feedback.md) - Tech lead review (Pending)

### Key Deliverables
- `sigil-mark/layouts/MachineryLayout.tsx` — Keyboard-driven admin UI
- `sigil-mark/layouts/GlassLayout.tsx` — Hover-driven marketing UI
- `sigil-mark/__tests__/MachineryLayout.test.tsx` — MachineryLayout tests
- `sigil-mark/__tests__/GlassLayout.test.tsx` — GlassLayout tests

### Tasks Completed
- [x] S4-T1: Implement MachineryLayout component
- [x] S4-T2: Implement MachineryLayout keyboard navigation
- [x] S4-T3: Implement MachineryLayout subcomponents
- [x] S4-T4: Implement GlassLayout component
- [x] S4-T5: Implement GlassLayout hover physics
- [x] S4-T6: Implement GlassLayout subcomponents
- [x] S4-T7: Create layouts barrel export
- [x] S4-T8: Create MachineryLayout and GlassLayout tests

---

## v1.2.4 Sprint 1: Migration Foundation

**Duration:** 1 sprint (2 weeks)
**Theme:** Archive v1.0, create v1.2.4 directory structure

### Artifacts
- [reviewer.md](./sprint-1/reviewer.md) - Implementation report
- [engineer-feedback.md](./sprint-1/engineer-feedback.md) - Tech lead review (APPROVED)
- [auditor-sprint-feedback.md](./sprint-1/auditor-sprint-feedback.md) - Security audit (APPROVED)
- [COMPLETED](./sprint-1/COMPLETED) - Completion marker

### Key Deliverables
- v1.0 state zone archived to `sigil-mark/.archive-v1.0/`
- v1.2.4 directory structure (`recipes/`, `hooks/`, `history/`, `reports/`)
- `.sigilrc.yaml` refactored to v1.2.4 schema
- `.sigil-version.json` updated to v1.2.4
- `CLAUDE.md` rewritten for Diff + Feel philosophy

### Tasks Completed
- [x] S1-T1: Archive v1.0 state zone structure
- [x] S1-T2: Create v1.2.4 directory structure
- [x] S1-T3: Refactor .sigilrc.yaml format
- [x] S1-T4: Update .sigil-version.json
- [x] S1-T5: Create CLAUDE.md for v1.2.4

---

## Legacy Versions

### Sigil v1.0 (Design Physics Engine - Full Workbench)

| Sprint | Theme | Status |
|--------|-------|--------|
| v1.0-1 | Project Scaffold & State Zone | COMPLETED |
| v1.0-2 | Core Physics Engine | COMPLETED |
| v1.0-3 | Zone Detection System | COMPLETED |
| v1.0-4 | Materials System | COMPLETED |
| v1.0-5 | Essence System | COMPLETED |
| v1.0-6 | Craft Command | COMPLETED |
| v1.0-7 | Approval & Greenlight System | COMPLETED |
| v1.0-8 | Garden Command | COMPLETED |
| v1.0-9 | Memory & Era System | COMPLETED |
| v1.0-10 | Hammer/Chisel Toolkit | COMPLETED |
| v1.0-11 | Workbench Foundation | COMPLETED |
| v1.0-12 | Workbench Integration | COMPLETED |

### Sigil v0.5 (Design Physics Engine)

| Sprint | Theme | Status |
|--------|-------|--------|
| v0.5-1 | Foundation & State Zone | COMPLETED |
| v0.5-2 | Resonance Layer | COMPLETED |
| v0.5-3 | Setup & Envision Commands | COMPLETED |
| v0.5-4 | Core Commands (MVP) | COMPLETED |
| v0.5-5 | Validation & Approval | COMPLETED |
| v0.5-6 | Garden & Mount System | COMPLETED |

### Sigil v0.4 (Soul Engine)

| Sprint | Theme | Status |
|--------|-------|--------|
| 8 | Package Scaffold & CLI | COMPLETED |
| 9 | Material Core | COMPLETED |
| 10 | Tension System | COMPLETED |
| 11 | Interaction Router & Sync Hooks | COMPLETED |
| 12 | Workbench & Soul Binder | COMPLETED |

### Sigil v0.3 (Constitutional Design Framework)

| Sprint | Theme | Status |
|--------|-------|--------|
| 1 | Foundation & Setup | COMPLETED |
| 2 | Soul Binder Core | COMPLETED |
| 3 | Lens Array | COMPLETED |
| 4 | Consultation Chamber | COMPLETED |
| 5 | Proving Grounds | COMPLETED |
| 6 | Polish & Documentation | COMPLETED |
| 7 | Review Feedback Fixes | COMPLETED |

---

## Version History

| Version | Date | Sprints | Codename | Status |
|---------|------|---------|----------|--------|
| v0.3.0 | 2026-01-02 | 1-6 | Constitutional Design Framework | Released |
| v0.3.1 | 2026-01-02 | 7 | Review Feedback Fixes | Released |
| v0.4.0 | 2026-01-03 | 8-12 | Soul Engine | Released |
| v0.5.0 | 2026-01-04 | v0.5-1 to v0.5-6 | Design Physics Engine | Released |
| v1.0.0 | 2026-01-05 | v1.0-1 to v1.0-12 | Full Workbench | Released |
| v1.2.4 | 2026-01-05 | 1-10 | Diff + Feel | Released |
| v2.0.0 | 2026-01-05 | 1-8 | Reality Engine | Released |
| v2.6.0 | 2026-01-06 | 1-7 | Craftsman's Flow | Released |
| v3.0.0 | 2026-01-06 | 1-4 | Living Engine | Released |
| v4.0.0 | 2026-01-07 | 1-10 | Sharp Tools | Released |
| v4.1.0 | 2026-01-07 | 1-6 | Living Guardrails | Released |

---

## v2.6 Sprint 1: Constitution System

**Duration:** 1 sprint
**Theme:** Protected capabilities that ALWAYS work

### Artifacts
- [reviewer.md](./sprint-1/reviewer.md) - Implementation report
- [engineer-feedback.md](./sprint-1/engineer-feedback.md) - Tech lead review (Pending)

### Key Deliverables
- `sigil-mark/constitution/protected-capabilities.yaml` — 8 protected capabilities
- `sigil-mark/constitution/schemas/constitution.schema.json` — JSON Schema
- `sigil-mark/process/constitution-reader.ts` — YAML reader with graceful degradation
- `sigil-mark/__tests__/process/constitution-reader.test.ts` — 23 tests

### Tasks Completed
- [x] S1-T1: Create constitution directory structure
- [x] S1-T2: Create Constitution YAML schema
- [x] S1-T3: Create default protected-capabilities.yaml
- [x] S1-T4: Implement ConstitutionReader
- [x] S1-T5: Implement graceful degradation
- [x] S1-T6: Create ConstitutionReader tests

---

---

## v3.0 Sprint 1: Critical Fixes (P0)

**Duration:** 1 sprint
**Theme:** Fix fatal bugs that block any v3.0 use
**Status:** COMPLETED

### Artifacts
- [reviewer.md](./v3.0-sprint-1/reviewer.md) - Implementation report
- [engineer-feedback.md](./v3.0-sprint-1/engineer-feedback.md) - Tech lead review (APPROVED)
- [auditor-sprint-feedback.md](./v3.0-sprint-1/auditor-sprint-feedback.md) - Security audit (APPROVED)
- [COMPLETED](./v3.0-sprint-1/COMPLETED) - Completion marker

### Key Deliverables
- Remove ProcessContextProvider from exports (fs-in-browser fix)
- Update Process layer documentation (agent-only)
- Rewrite skills for philosophy alignment

### Tasks
- [x] S1-T1: Remove ProcessContextProvider from exports
- [x] S1-T2: Update Process layer documentation
- [x] S1-T3: Rewrite consulting-decisions skill
- [x] S1-T4: Rewrite crafting-guidance skill
- [x] S1-T5: Audit all skills for philosophy alignment

---

## v3.0 Sprint 2: Foundation (P1)

**Duration:** 1 sprint
**Theme:** Core architectural changes for v3.0

### Key Deliverables
- Vocabulary layer (vocabulary.yaml + reader)
- Persona rename (lens-array → personas)
- Layout-only zone documentation

### Tasks
- [x] S2-T1: Create vocabulary.yaml schema and initial terms
- [x] S2-T2: Implement vocabulary-reader.ts
- [x] S2-T3: Rename lens-array to personas
- [x] S2-T4: Update CLAUDE.md with vocabulary protocol
- [x] S2-T5: Remove path-based zone detection claims
- [x] S2-T6: Add vocabulary-reader tests (41 tests)

---

## v3.0 Sprint 3: User Fluidity (P2)

**Duration:** 1 sprint
**Theme:** Persona context and zone overrides for adaptive UX
**Status:** COMPLETED

### Artifacts
- [reviewer.md](./v3.0-sprint-3/reviewer.md) - Implementation report
- [engineer-feedback.md](./v3.0-sprint-3/engineer-feedback.md) - Tech lead review (APPROVED)
- [auditor-sprint-feedback.md](./v3.0-sprint-3/auditor-sprint-feedback.md) - Security audit (APPROVED)
- [COMPLETED](./v3.0-sprint-3/COMPLETED) - Completion marker

### Key Deliverables
- Philosophy layer (philosophy.yaml + reader)
- PersonaProvider runtime context
- Zone-persona integration
- 39 philosophy-reader tests

### Tasks
- [x] S3-T1: Create philosophy.yaml schema and content (7 principles, 6 rules)
- [x] S3-T2: Implement philosophy-reader.ts (resolveConflict with context)
- [x] S3-T3: Create PersonaProvider runtime context (auto-detection)
- [x] S3-T4: Add persona_overrides to .sigilrc.yaml
- [x] S3-T5: Update zone context with persona integration
- [x] S3-T6: Add philosophy-reader tests (39 tests)

---

## v3.0 Sprint 4: Living Market (P3)

**Duration:** 1 sprint
**Theme:** Prepare for runtime configuration and behavioral observation
**Status:** COMPLETED

### Artifacts
- [reviewer.md](./v3.0-sprint-4/reviewer.md) - Implementation report
- [engineer-feedback.md](./v3.0-sprint-4/engineer-feedback.md) - Tech lead review (APPROVED)
- [auditor-sprint-feedback.md](./v3.0-sprint-4/auditor-sprint-feedback.md) - Security audit (APPROVED)
- [COMPLETED](./v3.0-sprint-4/COMPLETED) - Completion marker

### Key Deliverables
- Remote config schema (marketing/engineering separation)
- Behavioral signals (8 passive UX observation patterns)
- Final documentation (README, MIGRATION, CHANGELOG)
- v3.0 Release preparation (.sigil-version.json, CHANGELOG.md)

### Tasks
- [x] S4-T1: Create remote-config.yaml schema
- [x] S4-T2: Add behavioral signals to vibe-checks.yaml
- [x] S4-T3: Update vibe-check-reader for behavioral signals
- [x] S4-T4: Document remote config architecture
- [x] S4-T5: Final documentation update
- [x] S4-T6: v3.0 Release preparation

---

---

## v4.0 Sprint 1: Schema Foundation

**Duration:** 1 sprint
**Theme:** Evidence-based personas & journey zones (non-breaking)
**Status:** COMPLETED

### Artifacts
- [reviewer.md](./v4.0-sprint-1/reviewer.md) - Implementation report
- [engineer-feedback.md](./v4.0-sprint-1/engineer-feedback.md) - Tech lead review (✅ APPROVED)
- [auditor-sprint-feedback.md](./v4.0-sprint-1/auditor-sprint-feedback.md) - Security audit (✅ APPROVED)
- [COMPLETED](./v4.0-sprint-1/COMPLETED) - Completion marker

### Key Deliverables
- Persona schema v4.0 (source, evidence, trust_level, journey_stages, last_refined)
- Zone schema v4.0 (paths, journey_stage, persona_likely, trust_state, evidence)
- Evidence schema (analytics, interviews, gtm, observation)
- Feedback schema (for /observe tool)
- Zone reader (resolveZoneFromPath for agent-time detection)

### Tasks
- [x] v4.0-S1-T1: Update Persona Schema with v4.0 fields
- [x] v4.0-S1-T2: Update Zone Schema with journey context
- [x] v4.0-S1-T3: Create Evidence Schema for analytics/interviews
- [x] v4.0-S1-T4: Create Feedback Schema for observations
- [x] v4.0-S1-T5: Directory Structure Setup

---

---

## Sigil v5.0 (The Lucid Flow — Infrastructure + Knowledge)

| Sprint | Theme | Status | Reviewer | Auditor |
|--------|-------|--------|----------|---------|
| 1 | Foundation & Kernel Setup | COMPLETED | ✅ Approved | ✅ Approved |
| 2 | Runtime Provider & Context | COMPLETED | ✅ Approved | ✅ Approved |
| 3 | useSigilMutation Core | COMPLETED | ✅ Approved | ✅ Approved |
| 4 | Live Grep Discovery | COMPLETED | ✅ Approved | ✅ Approved |
| 5 | Analyzing Data Risk Skill | COMPLETED | ✅ Approved | ✅ Approved |
| 6 | JIT Polish Workflow | COMPLETED | ✅ Approved | ✅ Approved |
| 7 | Status Propagation & Negotiation | COMPLETED | ✅ Approved | ✅ Approved |
| 8 | Remaining Skills & Integration | COMPLETED | ✅ Approved | ✅ Approved |

---

## v5.0 Sprint 1: Foundation & Kernel Setup

**Duration:** 1 sprint
**Theme:** Directory structure and kernel YAML files
**Status:** COMPLETED

### Artifacts
- [reviewer.md](./sprint-1/reviewer.md) - Implementation report
- [engineer-feedback.md](./sprint-1/engineer-feedback.md) - Tech lead review (✅ Approved)
- [auditor-sprint-feedback.md](./sprint-1/auditor-sprint-feedback.md) - Security audit (✅ Approved)
- [COMPLETED](./sprint-1/COMPLETED) - Completion marker

### Key Deliverables
- v5 directory structure (kernel/, skills/, components/, codebase/, knowledge/, governance/)
- `sigil-mark/kernel/constitution.yaml` — Data type → physics binding
- `sigil-mark/kernel/fidelity.yaml` — Visual + ergonomic constraints
- `sigil-mark/kernel/vocabulary.yaml` — Term → physics mapping
- `sigil-mark/kernel/workflow.yaml` — Team methodology rules
- All 6 skill YAMLs (scanning, analyzing, auditing, negotiating, simulating, polishing)

### Tasks
- [x] S1-T1: Create directory structure
- [x] S1-T2: Create constitution.yaml
- [x] S1-T3: Create fidelity.yaml
- [x] S1-T4: Create vocabulary.yaml
- [x] S1-T5: Create workflow.yaml

---

## v5.0 Sprint 2: Runtime Provider & Context

**Duration:** 1 sprint
**Theme:** SigilProvider and zone context system
**Status:** COMPLETED

### Artifacts
- [reviewer.md](./sprint-2/reviewer.md) - Implementation report
- [engineer-feedback.md](./sprint-2/engineer-feedback.md) - Tech lead review (✅ Approved)
- [auditor-sprint-feedback.md](./sprint-2/auditor-sprint-feedback.md) - Security audit (✅ Approved)
- [COMPLETED](./sprint-2/COMPLETED) - Completion marker

### Key Deliverables
- Updated `sigil-mark/types/index.ts` with v5 types
- Updated `sigil-mark/providers/sigil-provider.tsx` with v5 exports
- Updated `sigil-mark/layouts/critical-zone.tsx` with v5 pragmas
- Updated `sigil-mark/layouts/glass-layout.tsx` with 'glass' zone
- Updated `sigil-mark/layouts/machinery-layout.tsx` with 'machinery' zone

### Tasks
- [x] S2-T1: SigilProvider Implementation
- [x] S2-T2: Zone Context Hooks
- [x] S2-T3: CriticalZone Layout
- [x] S2-T4: GlassLayout Component
- [x] S2-T5: MachineryLayout Component
- [x] S2-T6: Provider Tests

---

## v5.0 Sprint 3: useSigilMutation Core

**Duration:** 1 sprint
**Theme:** Type-driven physics hook with simulation flow
**Status:** COMPLETED

### Artifacts
- [reviewer.md](./sprint-3/reviewer.md) - Implementation report
- [engineer-feedback.md](./sprint-3/engineer-feedback.md) - Tech lead review (✅ Approved)
- [auditor-sprint-feedback.md](./sprint-3/auditor-sprint-feedback.md) - Security audit (✅ Approved)
- [COMPLETED](./sprint-3/COMPLETED) - Completion marker

### Key Deliverables
- `sigil-mark/types/index.ts` — SimulationPreview, UseSigilMutationOptions, UseSigilMutationResult
- `sigil-mark/hooks/physics-resolver.ts` — resolvePhysicsV5, zone-to-physics mapping
- `sigil-mark/hooks/use-sigil-mutation.ts` — Full simulation flow hook

### Tasks
- [x] S3-T1: Physics Types & Interfaces
- [x] S3-T2: Physics Resolution Function
- [x] S3-T3: State Machine Implementation
- [x] S3-T4: Simulate Function
- [x] S3-T5: Confirm Function
- [x] S3-T6: Execute Function
- [x] S3-T7: Computed UI State
- [x] S3-T8: Hook Assembly & Export

---

## v5.0 Sprint 4: Live Grep Discovery

**Duration:** 1 sprint
**Theme:** Scanning Sanctuary with ripgrep
**Status:** COMPLETED

### Artifacts
- [reviewer.md](./sprint-4/reviewer.md) - Implementation report
- [engineer-feedback.md](./sprint-4/engineer-feedback.md) - Tech lead review (✅ Approved)
- [auditor-sprint-feedback.md](./sprint-4/auditor-sprint-feedback.md) - Security audit (✅ Approved)
- [COMPLETED](./sprint-4/COMPLETED) - Completion marker

### Key Deliverables
- `sigil-mark/skills/scanning-sanctuary.yaml` — Full pragma spec, ripgrep patterns
- `sigil-mark/process/component-scanner.ts` — Live grep component discovery
- `CLAUDE.md` v5.0 scanning documentation

### Tasks
- [x] S4-T1: JSDoc Pragma Specification
- [x] S4-T2: Scanning Sanctuary Skill Definition
- [x] S4-T3: Component Lookup Utility
- [x] S4-T4: Remove sigil.map Cache
- [x] S4-T5: Agent Integration Documentation

---

---

## Sigil v6.0.0 (Native Muse — Survival-Based Design Context)

| Sprint | Theme | Status | Reviewer | Auditor |
|--------|-------|--------|----------|---------|
| 1 | Workshop Schema & Builder | COMPLETED | ✅ Approved | ✅ Approved |
| 2 | Startup Sentinel | COMPLETED | ✅ Approved | ✅ Approved |
| 3 | Discovery Skills | COMPLETED | ✅ Approved | ✅ Approved |
| 4 | Querying Workshop | COMPLETED | ✅ Approved | ✅ Approved |
| 5 | Validating Physics | COMPLETED | ✅ Approved | ✅ Approved |
| 6 | Virtual Sanctuary | COMPLETED | ✅ Approved | ✅ Approved |
| 7 | Ephemeral Inspiration | COMPLETED | ✅ Approved | ✅ Approved |
| 8 | Forge Mode | COMPLETED | ✅ Approved | ✅ Approved |
| 9 | Era Management | COMPLETED | ✅ Approved | ✅ Approved |
| 10 | Survival Observation | COMPLETED | ✅ Approved | ✅ Approved |
| 11 | Chronicling & Auditing | COMPLETED | ✅ Approved | ✅ Approved |
| 12 | Agent Integration | COMPLETED | ✅ Approved | ✅ Approved |
| 13 | Polish & Documentation | COMPLETED | ✅ Approved | ✅ Approved |

---

## Sigil v6.1.0 (Agile Muse — Implementation Fixes)

| Sprint | Theme | Status | Reviewer | Auditor |
|--------|-------|--------|----------|---------|
| 1 | Make It Work (P0) | COMPLETED | ✅ Approved | ✅ Approved |
| 2 | Make It Safe (P1) | COMPLETED | ✅ Approved | ✅ Approved |
| 3 | Make It Fast (P2) | COMPLETED | ✅ Approved | ✅ Approved |

---

## v6.1 Sprint 1: Make It Work (P0)

**Duration:** 1 sprint
**Theme:** Fix critical blockers for core lifecycle
**Status:** COMPLETED

### Artifacts
- [reviewer.md](./v6.1-sprint-1/reviewer.md) - Implementation report
- [engineer-feedback.md](./v6.1-sprint-1/engineer-feedback.md) - Tech lead review (✅ Approved)
- [auditor-sprint-feedback.md](./v6.1-sprint-1/auditor-sprint-feedback.md) - Security audit (✅ Approved)
- [COMPLETED](./v6.1-sprint-1/COMPLETED) - Completion marker

### Key Deliverables
- `.claude/skills/validating-physics/scripts/validate.sh` — PreToolUse hook bridge
- `.claude/skills/observing-survival/scripts/observe.sh` — PostToolUse hook bridge
- `.claude/skills/chronicling-rationale/scripts/ensure-log.sh` — Stop hook bridge
- Hook TypeScript exports (validatePhysicsForHook, observeForHook, ensureSessionLog)
- Fixed queryMaterial parameter order
- queryComponentVerified() with verify-on-read
- ComponentEntry hash and indexed_at fields
- SentinelResult rebuildMetrics

### Tasks Completed
- [x] S1-T1: Create validate.sh hook script
- [x] S1-T2: Create observe.sh hook script
- [x] S1-T3: Create ensure-log.sh hook script
- [x] S1-T4: Add hook TypeScript exports
- [x] S1-T5: Fix queryMaterial parameter order
- [x] S1-T6: Add verify-on-read to workshop queries
- [x] S1-T7: Add hash and indexed_at to ComponentEntry
- [x] S1-T8: Implement workshop rebuild in startup sentinel

### v6.1 Focus Areas

**Sprint 1 (P0):** Hook scripts, queryMaterial fix, verify-on-read, sentinel rebuild
**Sprint 2 (P1):** Vocabulary integration, taste-key curation, hard eviction, E2E tests
**Sprint 3 (P2):** Optimistic divergence, merge-driven gardening, version standardization, docs

---

## v6.1 Sprint 2: Make It Safe (P1)

**Duration:** 1 sprint
**Theme:** Quality gates to prevent bad patterns and ghost components
**Status:** COMPLETED

### Artifacts
- [reviewer.md](./v6.1-sprint-2/reviewer.md) - Implementation report
- [engineer-feedback.md](./v6.1-sprint-2/engineer-feedback.md) - Tech lead review (✅ Approved)
- [auditor-sprint-feedback.md](./v6.1-sprint-2/auditor-sprint-feedback.md) - Security audit (✅ Approved)
- [COMPLETED](./v6.1-sprint-2/COMPLETED) - Completion marker

### Key Deliverables
- Vocabulary integration (vocabulary.yaml instead of hardcoded terms)
- Taste-key curation system (canonical-candidate status, approval workflow)
- Hard eviction for Virtual Sanctuary (eliminate ghost components)
- E2E test suite for v6.1 features

### Tasks Completed
- [x] S2-T1: Integrate vocabulary-reader into agent-orchestration.ts
- [x] S2-T2: Add canonical-candidate status to survival-observer.ts
- [x] S2-T3: Create .sigil/taste-key.yaml configuration
- [x] S2-T4: Implement addPendingPromotion() function
- [x] S2-T5: Implement isPatternApproved() function
- [x] S2-T6: Create /approve command
- [x] S2-T7: Implement hard eviction for Virtual Sanctuary
- [x] S2-T8: Create /reset-seed command
- [x] S2-T9: Create E2E test suite

---

*Last Updated: 2026-01-08*
*Current Version: Sigil v6.1.0 "Agile Muse" — IN PROGRESS*
