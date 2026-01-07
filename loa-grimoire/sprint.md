# Sprint Plan: Sigil v2.6

**Version:** 2.6.0
**Created:** 2026-01-06
**Team:** Solo (1 engineer)
**Sprint Duration:** Focus-based (not time-boxed)
**Codename:** Craftsman's Flow
**Build Strategy:** Add Process Layer on top of completed v2.0 Core

---

## Overview

Sigil v2.6 adds the **Sigil Process** layer on top of the existing **Sigil Core** (v2.0 "Reality Engine"). The key insight is: humans capture "what" and "why" in Process, while Core provides the "how".

### Two-Tier Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SIGIL PROCESS (Human Layer) - NEW                      │
│                         YAML / Markdown                                     │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐      │
│  │ Constitution │  │  Lens Array  │  │ Consultation │  │  Surveys  │      │
│  │  (Protected) │  │  (Personas)  │  │   Chamber    │  │  (Vibe)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘  └───────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
                              ↓
                    Process informs Core behavior
                              ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SIGIL CORE (Implementation Layer) - EXISTING           │
│                         React / TypeScript (v2.0)                           │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
│  │  Core Hooks  │  │   Layouts    │  │    Lenses    │                      │
│  │ useCritical  │  │ CriticalZone │  │  DefaultLens │                      │
│  │   Action     │  │ Machinery    │  │  StrictLens  │                      │
│  │ useLocalCache│  │ GlassLayout  │  │   A11yLens   │                      │
│  └──────────────┘  └──────────────┘  └──────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Sprint Sequence

| Sprint | Focus |
|--------|-------|
| 1 | Constitution System (protected capabilities) |
| 2 | Consultation Chamber (locked decisions) |
| 3 | Lens Array Foundation (user personas) |
| 4 | Zone-Persona Integration |
| 5 | Vibe Checks (micro-surveys) |
| 6 | Claude Commands (/craft, /consult) |
| 7 | Documentation & Migration |

---

## Sprint 1: Constitution System

**Goal:** Implement protected capabilities that ALWAYS work

### Tasks

- [x] **S1-T1: Create constitution directory structure**
  - Create `sigil-mark/constitution/`
  - Create `sigil-mark/constitution/schemas/`
  - Create placeholder `protected-capabilities.yaml`
  - **Acceptance:** Directory structure exists ✅

- [x] **S1-T2: Create Constitution YAML schema**
  - Create `sigil-mark/constitution/schemas/constitution.schema.json`
  - Define `protected` array schema with id, name, description, enforcement, rationale
  - Define `override_audit` object schema
  - **Acceptance:** JSON Schema validates sample YAML ✅

- [x] **S1-T3: Create default protected-capabilities.yaml**
  - Create `sigil-mark/constitution/protected-capabilities.yaml`
  - Add 8 default capabilities: withdraw, deposit, risk_alert, slippage_warning, fee_disclosure, balance_visible, error_messages, help_access
  - Set appropriate enforcement levels (block/warn/log)
  - **Acceptance:** YAML parses correctly, contains all capabilities ✅

- [x] **S1-T4: Implement ConstitutionReader**
  - Create `sigil-mark/process/constitution-reader.ts`
  - Implement `readConstitution()` with manual validation
  - Implement `isCapabilityProtected()` helper
  - Implement `getCapabilityEnforcement()` helper
  - **Acceptance:** Reader parses YAML, validates against schema ✅

- [x] **S1-T5: Implement graceful degradation**
  - Handle missing constitution file (return empty protected array)
  - Handle invalid YAML (log error, return defaults)
  - Handle validation errors (log warning, skip invalid entries)
  - **Acceptance:** Reader never throws, always returns valid Constitution ✅

- [x] **S1-T6: Create ConstitutionReader tests**
  - Test parsing valid constitution
  - Test isCapabilityProtected for existing/missing capabilities
  - Test graceful handling of missing file
  - Test graceful handling of invalid YAML
  - **Acceptance:** All 23 tests pass ✅

### Deliverables
- `sigil-mark/constitution/protected-capabilities.yaml`
- `sigil-mark/constitution/schemas/constitution.schema.json`
- `sigil-mark/process/constitution-reader.ts`
- `sigil-mark/__tests__/process/constitution-reader.test.ts`

---

## Sprint 2: Consultation Chamber

**Goal:** Implement locked decisions with time-based expiry

### Tasks

- [x] **S2-T1: Create consultation-chamber directory structure**
  - Create `sigil-mark/consultation-chamber/`
  - Create `sigil-mark/consultation-chamber/decisions/`
  - Create `sigil-mark/consultation-chamber/schemas/`
  - Create `config.yaml` with lock periods
  - **Acceptance:** Directory structure exists ✅

- [x] **S2-T2: Create Decision YAML schema**
  - Create `sigil-mark/consultation-chamber/schemas/decision.schema.json`
  - Define decision schema with id, topic, decision, scope, locked_at, expires_at, context, rationale, status
  - Define unlock_history array schema
  - **Acceptance:** JSON Schema validates sample decision ✅

- [x] **S2-T3: Implement DecisionReader - read operations**
  - Create `sigil-mark/process/decision-reader.ts`
  - Implement `readAllDecisions()` with directory reading
  - Implement `getDecisionsForZone()` filter
  - Implement `isDecisionExpired()` check
  - **Acceptance:** Reader finds and parses all decision files ✅

- [x] **S2-T4: Implement DecisionReader - write operations**
  - Implement `lockDecision()` with ID generation
  - Implement correct expiry calculation based on scope (180/90/30 days)
  - Write decision YAML to decisions/ directory
  - **Acceptance:** lockDecision creates valid YAML file ✅

- [x] **S2-T5: Implement DecisionReader - unlock operations**
  - Implement `unlockDecision()` with justification
  - Add entry to unlock_history
  - Update status to 'unlocked'
  - **Acceptance:** unlockDecision updates decision file correctly ✅

- [x] **S2-T6: Implement LOCK_PERIODS constant**
  - Define `LOCK_PERIODS = { strategic: 180, direction: 90, execution: 30 }`
  - Export from decision-reader
  - **Acceptance:** Lock periods match PRD ✅

- [x] **S2-T7: Create DecisionReader tests**
  - Test reading all decisions
  - Test filtering by zone
  - Test expiry detection
  - Test locking with correct expiry
  - Test unlocking with history
  - **Acceptance:** All 22 tests pass ✅

### Deliverables
- `sigil-mark/consultation-chamber/config.yaml`
- `sigil-mark/consultation-chamber/schemas/decision.schema.json`
- `sigil-mark/process/decision-reader.ts`
- `sigil-mark/__tests__/process/decision-reader.test.ts`

---

## Sprint 3: Lens Array Foundation

**Goal:** Implement user personas with physics and constraints

### Tasks

- [x] **S3-T1: Create lens-array directory structure**
  - Create `sigil-mark/lens-array/`
  - Create `sigil-mark/lens-array/schemas/`
  - **Acceptance:** Directory structure exists ✅

- [x] **S3-T2: Create LensArray YAML schema**
  - Create `sigil-mark/lens-array/schemas/lens-array.schema.json`
  - Define lenses record schema with name, alias, physics, constraints
  - Define immutable_properties schema
  - Define stacking schema with allowed_combinations, conflict_resolution
  - **Acceptance:** JSON Schema validates sample YAML ✅

- [x] **S3-T3: Create default lenses.yaml**
  - Create `sigil-mark/lens-array/lenses.yaml`
  - Add 4 default personas: power_user (Chef), newcomer (Henlocker), mobile (Thumbzone), accessibility (A11y)
  - Define physics for each (tap_targets, input_method, shortcuts)
  - Define constraints for each
  - **Acceptance:** YAML contains all 4 personas with complete definitions ✅

- [x] **S3-T4: Implement LensArrayReader - read operations**
  - Create `sigil-mark/process/lens-array-reader.ts`
  - Implement `readLensArray()` with manual validation
  - Implement `getPersona()` helper
  - **Acceptance:** Reader parses YAML correctly ✅

- [x] **S3-T5: Implement LensArrayReader - stacking validation**
  - Implement `validateLensStack()` against allowed_combinations
  - Return `{ valid: boolean, error?: string }`
  - **Acceptance:** Invalid stacks rejected with clear error ✅

- [x] **S3-T6: Implement LensArrayReader - conflict resolution**
  - Implement `resolveStackConflict()` using priority_order
  - Return winning lens from conflicting stack
  - **Acceptance:** Conflicts resolved per priority order ✅

- [x] **S3-T7: Create LensArrayReader tests**
  - Test reading all personas
  - Test getting specific persona
  - Test valid/invalid stacking
  - Test conflict resolution
  - **Acceptance:** All 35 tests pass ✅

### Deliverables
- `sigil-mark/lens-array/lenses.yaml`
- `sigil-mark/lens-array/schemas/lens-array.schema.json`
- `sigil-mark/process/lens-array-reader.ts`
- `sigil-mark/__tests__/process/lens-array-reader.test.ts`

---

## Sprint 4: Zone-Persona Integration

**Goal:** Connect zones to personas for contextual guidance

### Tasks

- [x] **S4-T1: Enhance zone resolver for personas**
  - Update `sigil-mark/core/zone-resolver.ts`
  - Add `getPersonaForZone()` function
  - Map zones to default personas (critical → power_user, marketing → newcomer)
  - **Acceptance:** Zone resolver returns persona context ✅

- [x] **S4-T2: Create ProcessContext provider**
  - Create `sigil-mark/process/process-context.tsx`
  - Provide Constitution, LensArray, Decisions in context
  - Load all Process data on mount
  - **Acceptance:** ProcessContext provides all Process data ✅

- [x] **S4-T3: Create useProcessContext hook**
  - Create `sigil-mark/process/process-context.tsx` (combined with provider)
  - Return Constitution, LensArray, active decisions
  - Return loading/error states
  - **Acceptance:** Hook provides Process data to components ✅

- [x] **S4-T4: Update /craft command behavior**
  - Infrastructure ready: ProcessContext provides all data
  - Skill file updates deferred to Sprint 6
  - **Acceptance:** /craft infrastructure ready ✅

- [x] **S4-T5: Create persona physics surfacing**
  - Implemented `getPhysicsForPersona()` helper in lens-array-reader
  - Return tap_targets, input_method, shortcuts
  - **Acceptance:** Physics accessible from persona ✅

- [x] **S4-T6: Create ProcessContext tests**
  - Test context provides Constitution
  - Test context provides LensArray
  - Test context provides decisions
  - Test loading states
  - **Acceptance:** All 33 tests pass ✅

### Deliverables
- Updated `sigil-mark/core/zone-resolver.ts`
- `sigil-mark/process/process-context.tsx`
- `sigil-mark/__tests__/zone-persona.test.ts`
- `sigil-mark/__tests__/process/process-context.test.tsx`

---

## Sprint 5: Vibe Checks

**Goal:** Implement micro-surveys for qualitative feedback

### Tasks

- [x] **S5-T1: Create surveys directory structure**
  - Create `sigil-mark/surveys/`
  - Create `sigil-mark/surveys/schemas/`
  - **Acceptance:** Directory structure exists ✅

- [x] **S5-T2: Create VibeChecks YAML schema**
  - Create `sigil-mark/surveys/schemas/vibe-checks.schema.json`
  - Define triggers array schema with id, trigger, question, options, cooldown_days
  - Define feedback schema with destination, patterns
  - Define display schema
  - **Acceptance:** JSON Schema validates sample YAML ✅

- [x] **S5-T3: Create default vibe-checks.yaml**
  - Create `sigil-mark/surveys/vibe-checks.yaml`
  - Add 6 default triggers: strategy_change, first_deposit, first_withdraw, transaction_failed, card_expanded, onboarding_completed
  - Set appropriate cooldown periods
  - **Acceptance:** YAML contains all triggers ✅

- [x] **S5-T4: Implement VibeCheckReader**
  - Create `sigil-mark/process/vibe-check-reader.ts`
  - Implement `readVibeChecks()` with manual validation
  - Implement `getTriggerById()` helper
  - **Acceptance:** Reader parses YAML correctly ✅

- [x] **S5-T5: Implement cooldown management**
  - Implement `shouldTriggerSurvey()` with cooldown check
  - Session-based state management
  - Implement max surveys per session/day
  - **Acceptance:** Surveys respect cooldown periods ✅

- [x] **S5-T6: Implement response recording**
  - Implement `recordSurveyResponse()` function
  - Store response with timestamp and context
  - Support configurable destination (console/file/endpoint/custom)
  - **Acceptance:** Responses recorded correctly ✅

- [x] **S5-T7: Create VibeCheck tests**
  - Test reading triggers
  - Test cooldown enforcement
  - Test response recording
  - **Acceptance:** All 36 tests pass ✅

### Deliverables
- `sigil-mark/surveys/vibe-checks.yaml`
- `sigil-mark/surveys/schemas/vibe-checks.schema.json`
- `sigil-mark/process/vibe-check-reader.ts`
- `sigil-mark/__tests__/process/vibe-check-reader.test.ts`

---

## Sprint 6: Claude Commands

**Goal:** Implement /craft and /consult commands

### Tasks

- [x] **S6-T1: Update /craft command for v2.6**
  - Update `.claude/commands/craft.md`
  - Add Constitution reading on invocation
  - Add decision surfacing for current zone
  - Add persona context restoration
  - **Acceptance:** /craft restores full Process context ✅

- [x] **S6-T2: Update crafting-guidance skill for v2.6**
  - Update `.claude/skills/crafting-guidance/SKILL.md`
  - Add Process layer awareness
  - Add locked decision surfacing
  - Add persona physics guidance
  - **Acceptance:** Skill uses Process context ✅

- [x] **S6-T3: Implement /consult command**
  - Create `.claude/commands/consult.md`
  - Define interview flow for locking decisions
  - Support --unlock flag
  - **Acceptance:** Command locks/unlocks decisions ✅

- [x] **S6-T4: Implement consulting-decisions skill**
  - Create `.claude/skills/consulting-decisions/SKILL.md`
  - Implement decision capture flow
  - Implement scope determination
  - Implement YAML generation
  - **Acceptance:** Skill creates valid decision files ✅

- [x] **S6-T5: Update /garden command for v2.6**
  - Update `.claude/commands/garden.md`
  - Add Process layer health checks
  - Report Constitution violations
  - Report expired decisions
  - **Acceptance:** /garden reports Process health ✅

- [x] **S6-T6: Create command integration tests**
  - Test /craft context restoration
  - Test /consult decision creation
  - Test /garden health reporting
  - **Acceptance:** Commands work end-to-end ✅

### Deliverables
- Updated `.claude/commands/craft.md`
- Updated `.claude/skills/crafting-guidance/SKILL.md`
- `.claude/commands/consult.md`
- `.claude/skills/consulting-decisions/SKILL.md`
- Updated `.claude/commands/garden.md`

---

## Sprint 7: Documentation & Migration

**Goal:** Complete documentation and migration from v2.0

### Tasks

- [x] **S7-T1: Create Process layer barrel export**
  - Create `sigil-mark/process/index.ts`
  - Export all readers: ConstitutionReader, DecisionReader, LensArrayReader, VibeCheckReader
  - Export ProcessContext and useProcessContext
  - **Acceptance:** Single import for Process layer ✅

- [x] **S7-T2: Update main index.ts for v2.6**
  - Update `sigil-mark/index.ts`
  - Add Process layer exports
  - Update version to 2.6.0
  - Update codename to "Craftsman's Flow"
  - **Acceptance:** All v2.6 features accessible ✅

- [x] **S7-T3: Update CLAUDE.md for v2.6**
  - Document two-tier architecture (Process + Core)
  - Document Constitution reading
  - Document decision locking
  - Document persona system
  - Add agent protocol for Process layer
  - **Acceptance:** CLAUDE.md describes v2.6 ✅

- [x] **S7-T4: Update README.md for v2.6**
  - Add Process layer documentation
  - Add command reference (/craft, /consult)
  - Add Constitution setup guide
  - Add decision locking guide
  - **Acceptance:** README covers v2.6 features ✅

- [x] **S7-T5: Create migration guide**
  - Document v2.0 → v2.6 changes
  - Explain Process layer additions
  - Explain directory structure changes
  - Provide example workflows
  - **Acceptance:** Clear migration path ✅

- [x] **S7-T6: Final validation**
  - Verify all Process readers work
  - Verify all commands work
  - Verify Constitution enforcement
  - Verify decision locking/unlocking
  - Run full test suite
  - **Acceptance:** All 156 Process layer tests pass ✅

### Deliverables
- `sigil-mark/process/index.ts`
- Updated `sigil-mark/index.ts`
- Updated `CLAUDE.md`
- Updated `README.md`
- `MIGRATION.md` (v2.0 → v2.6)

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| YAML parsing breaks workflow | Graceful degradation, return defaults |
| Lock periods too restrictive | Configurable per-decision scope |
| AI misinterprets Constitution | Explicit CLAUDE.md instructions |
| Persona explosion | Limit to 4-6 core personas |
| Decision bikeshedding on scope | Clear guidelines in /consult |

---

## Success Criteria

From PRD §8:

- [ ] Context restoration time < 30 seconds (/craft)
- [ ] Decision re-argument rate = 0 (locked decisions respected)
- [ ] Constitution violations = 0 in production
- [ ] Vibe check response rate > 30%
- [ ] All Process readers parse YAML correctly
- [ ] All commands work end-to-end
- [ ] CLAUDE.md accurately describes v2.6 architecture

---

## Dependencies

| Sprint | Depends On |
|--------|------------|
| Sprint 1 | None (foundation) |
| Sprint 2 | Sprint 1 (uses process/ directory) |
| Sprint 3 | Sprint 1 (uses process/ directory) |
| Sprint 4 | Sprint 1, 2, 3 (integrates all readers) |
| Sprint 5 | Sprint 1 (uses process/ directory) |
| Sprint 6 | Sprint 1, 2, 3, 4 (uses all Process components) |
| Sprint 7 | All previous sprints |

---

## Version History

| Sprint | Status | Completed |
|--------|--------|-----------|
| Sprint 1 | COMPLETED | 2026-01-06 |
| Sprint 2 | COMPLETED | 2026-01-06 |
| Sprint 3 | COMPLETED | 2026-01-06 |
| Sprint 4 | COMPLETED | 2026-01-06 |
| Sprint 5 | COMPLETED | 2026-01-06 |
| Sprint 6 | PENDING | - |
| Sprint 7 | PENDING | - |

---

## Previous Version

Sigil v2.0 "Reality Engine" (completed 2026-01-05):
- Sprint 1-8: Core Layer, Layout Layer, Lens Layer, Integration
- All sprints COMPLETED
- See `loa-grimoire/archive/sprint-v2.0.md` for details

---

## Next Step

```
/implement sprint-1
```
