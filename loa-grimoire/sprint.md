# Sigil v6.0.0 Sprint Plan

> *"Code is precedent. Survival is the vote. Never interrupt flow."*

**Version:** 6.0.0
**Codename:** Native Muse
**Generated:** 2026-01-08
**Sources:** PRD v6.0.0, SDD v6.0.0

---

## Sprint Overview

### Team Structure
- **Agent:** Claude (AI implementation)
- **Human:** @zksoju (review, approval, direction)

### Sprint Duration
- **Cycle length:** 1 week per sprint
- **Total sprints:** 13 sprints (MVP complete)
- **Methodology:** Cycles (Linear Method)

### MVP Definition

The MVP delivers:
1. Pre-computed Workshop Index (5ms queries)
2. Virtual Sanctuary for cold starts
3. Physics-only validation (no novelty blocking)
4. Survival-based precedent tracking
5. Context forking for ephemeral exploration
6. 10 Claude Code skills with lifecycle hooks
7. Streamlined craft logs

### Evolution from v5.0

| Aspect | v5.0 | v6.0 |
|--------|------|------|
| Discovery | JIT grep (200ms) | Pre-computed workshop (5ms) |
| Approval | Governance dialogs | Survival observation |
| Cold start | Empty room | Virtual Sanctuary |
| Novelty | Constitutional blocking | Physics-only validation |
| Skills | 6 skills | 10 skills + hooks |

**Kept from v5.0:**
- Seven Laws kernel (constitution.yaml, fidelity.yaml, vocabulary.yaml, workflow.yaml)
- SigilProvider runtime context
- useSigilMutation hook
- Zone layouts (CriticalZone, GlassLayout, MachineryLayout)
- Governance structure (justifications.log)

---

## Phase 1: Foundation (Sprints 1-3)

---

## Sprint 1: Workshop Schema & Builder

**Goal:** Create the pre-computed workshop index infrastructure

**Duration:** 1 week

### Tasks

#### S1-T1: Workshop TypeScript Interfaces
**Description:** Define complete TypeScript interfaces for workshop.json schema.

**Acceptance Criteria:**
- [x] `Workshop` interface with indexed_at, package_hash, imports_hash
- [x] `MaterialEntry` interface with version, exports, types_available, signatures
- [x] `ComponentEntry` interface with path, tier, zone, physics, vocabulary, imports
- [x] `PhysicsDefinition` interface with timing, easing, description
- [x] `ZoneDefinition` interface with physics, timing, description
- [x] All interfaces exported from `types/workshop.ts`

**Dependencies:** None
**Effort:** Medium

---

#### S1-T2: Package Hash Detection
**Description:** Implement hash-based staleness detection for package.json.

**Acceptance Criteria:**
- [x] `getPackageHash()` function returns MD5 of package.json
- [x] `isWorkshopStale()` compares current hash to stored hash
- [x] Function runs in <5ms
- [x] Hash stored in workshop.json.package_hash

**Dependencies:** S1-T1
**Effort:** Small

---

#### S1-T3: Imports Hash Detection
**Description:** Implement hash-based staleness detection for imports.yaml.

**Acceptance Criteria:**
- [x] `getImportsHash()` function returns MD5 of .sigil/imports.yaml
- [x] Hash stored in workshop.json.imports_hash
- [x] Mismatch triggers incremental rebuild

**Dependencies:** S1-T1
**Effort:** Small

---

#### S1-T4: Workshop Builder Core
**Description:** Implement the main workshop index builder.

**Acceptance Criteria:**
- [x] `buildWorkshop()` function creates complete workshop.json
- [x] Reads imports.yaml for package list
- [x] Extracts version from node_modules/{pkg}/package.json
- [x] Extracts exports from node_modules/{pkg}/dist/index.d.ts
- [x] Merges with sigil.yaml physics and zones
- [x] Writes to .sigil/workshop.json

**Dependencies:** S1-T2, S1-T3
**Effort:** Large

---

#### S1-T5: Material Extraction
**Description:** Extract framework material information from node_modules.

**Acceptance Criteria:**
- [x] Extract version from package.json
- [x] Parse exports from index.d.ts
- [x] Check for README.md availability
- [x] Extract key type signatures (top 10 exports)
- [x] Store in materials section of workshop

**Dependencies:** S1-T4
**Effort:** Medium

---

#### S1-T6: Component Extraction
**Description:** Extract Sanctuary component metadata.

**Acceptance Criteria:**
- [x] Scan for `@sigil-tier` pragmas via ripgrep
- [x] Parse JSDoc for zone, physics, vocabulary
- [x] Extract import list per component
- [x] Store in components section of workshop
- [x] Performance: <2s for full Sanctuary scan

**Dependencies:** S1-T4
**Effort:** Medium

---

#### S1-T7: Workshop Builder Tests
**Description:** Unit tests for workshop builder.

**Acceptance Criteria:**
- [x] Test hash generation consistency
- [x] Test staleness detection
- [x] Test material extraction with mock node_modules
- [x] Test component extraction with mock Sanctuary
- [x] All tests pass

**Dependencies:** S1-T4 through S1-T6
**Effort:** Medium

---

### Sprint 1 Deliverables
- `types/workshop.ts` - TypeScript interfaces
- `scripts/build-workshop.ts` - Builder implementation
- `.sigil/workshop.json` - Generated index
- Unit tests for builder

---

## Sprint 2: Startup Sentinel

**Goal:** Implement startup check flow that triggers rebuild when needed

**Duration:** 1 week

### Tasks

#### S2-T1: Startup Sentinel Flow
**Description:** Implement startup check that runs before /craft.

**Acceptance Criteria:**
- [x] Check package.json hash on startup
- [x] Check imports.yaml hash on startup
- [x] If either stale, trigger rebuild
- [x] If both fresh, skip rebuild
- [x] Log rebuild decision

**Dependencies:** Sprint 1
**Effort:** Medium

---

#### S2-T2: Quick Rebuild Trigger
**Description:** Implement fast incremental rebuild.

**Acceptance Criteria:**
- [x] `quickRebuild()` updates only stale sections
- [x] If package_hash changed: rebuild materials only
- [x] If imports_hash changed: rebuild materials only
- [x] If Sanctuary changed: rebuild components only
- [x] Total rebuild time <2s

**Dependencies:** S2-T1
**Effort:** Medium

---

#### S2-T3: Rebuild Locking
**Description:** Prevent concurrent rebuilds.

**Acceptance Criteria:**
- [x] Lock file at .sigil/workshop.lock
- [x] Acquire lock before rebuild
- [x] Release lock after rebuild
- [x] Timeout after 30s
- [x] Handle stale locks

**Dependencies:** S2-T1
**Effort:** Small

---

#### S2-T4: Integration with /craft
**Description:** Run Startup Sentinel before every /craft.

**Acceptance Criteria:**
- [x] /craft checks workshop freshness first
- [x] If stale, rebuild silently (no interruption)
- [x] If rebuild fails, fallback to JIT grep
- [x] Log fallback decision

**Dependencies:** S2-T1, S2-T2
**Effort:** Medium

---

#### S2-T5: Startup Sentinel Tests
**Description:** Integration tests for startup flow.

**Acceptance Criteria:**
- [x] Test fresh workshop skips rebuild
- [x] Test stale package triggers rebuild
- [x] Test stale imports triggers rebuild
- [x] Test concurrent rebuild handling
- [x] Test fallback on failure

**Dependencies:** S2-T1 through S2-T4
**Effort:** Medium

---

### Sprint 2 Deliverables
- Startup sentinel implementation
- Quick rebuild logic
- Lock file handling
- Integration with /craft command

---

## Sprint 3: Discovery Skills

**Goal:** Implement scanning-sanctuary and graphing-imports skills

**Duration:** 1 week

### Tasks

#### S3-T1: Scanning Sanctuary SKILL.md
**Description:** Create skill definition for component discovery.

**Acceptance Criteria:**
- [x] SKILL.md in `.claude/skills/scanning-sanctuary/`
- [x] Purpose: Find components using ripgrep
- [x] Trigger: Search queries during /craft
- [x] ripgrep patterns documented
- [x] Performance target: <50ms

**Dependencies:** None
**Effort:** Small

---

#### S3-T2: Tier Lookup Function
**Description:** Find components by tier using ripgrep.

**Acceptance Criteria:**
- [x] `findByTier(tier)` function
- [x] Uses ripgrep: `rg "@sigil-tier gold" src/sanctuary/ -l`
- [x] Returns file paths array
- [x] Performance: <50ms

**Dependencies:** S3-T1
**Effort:** Small

---

#### S3-T3: Zone Lookup Function
**Description:** Find components by zone using ripgrep.

**Acceptance Criteria:**
- [x] `findByZone(zone)` function
- [x] Uses ripgrep: `rg "@sigil-zone critical" src/ -l`
- [x] Returns file paths array
- [x] Performance: <50ms

**Dependencies:** S3-T1
**Effort:** Small

---

#### S3-T4: Vocabulary Lookup Function
**Description:** Find components by vocabulary term.

**Acceptance Criteria:**
- [x] `findByVocabulary(term)` function
- [x] Uses ripgrep: `rg "@sigil-vocabulary claim" src/ -l`
- [x] Returns file paths array
- [x] Performance: <50ms

**Dependencies:** S3-T1
**Effort:** Small

---

#### S3-T5: Graphing Imports SKILL.md
**Description:** Create skill definition for dependency scanning.

**Acceptance Criteria:**
- [x] SKILL.md in `.claude/skills/graphing-imports/`
- [x] Purpose: Scan src/ for actual dependencies
- [x] Trigger: Startup, after package install
- [x] Output: .sigil/imports.yaml
- [x] Performance target: <1s

**Dependencies:** None
**Effort:** Small

---

#### S3-T6: Scan Imports Script
**Description:** Create bash script for import scanning.

**Acceptance Criteria:**
- [x] Script at `.claude/skills/graphing-imports/scripts/scan-imports.sh`
- [x] Uses ripgrep to find ES imports
- [x] Extracts unique package names
- [x] Writes to .sigil/imports.yaml
- [x] Performance: <1s on typical codebase

**Dependencies:** S3-T5
**Effort:** Medium

---

#### S3-T7: Discovery Skills Tests
**Description:** Unit tests for discovery functions.

**Acceptance Criteria:**
- [x] Test tier lookup with mock Sanctuary
- [x] Test zone lookup accuracy
- [x] Test vocabulary matching
- [x] Test imports scanning
- [x] All tests pass

**Dependencies:** S3-T1 through S3-T6
**Effort:** Medium

---

### Sprint 3 Deliverables
- `.claude/skills/scanning-sanctuary/SKILL.md`
- `.claude/skills/graphing-imports/SKILL.md`
- `.claude/skills/graphing-imports/scripts/scan-imports.sh`
- Discovery function implementations
- Unit tests

---

## Phase 2: Intelligence (Sprints 4-6)

---

## Sprint 4: Querying Workshop

**Goal:** Implement fast workshop index lookups

**Duration:** 1 week

### Tasks

#### S4-T1: Querying Workshop SKILL.md
**Description:** Create skill definition for workshop queries.

**Acceptance Criteria:**
- [x] SKILL.md in `.claude/skills/querying-workshop/`
- [x] Purpose: Fast lookups from pre-computed index
- [x] Trigger: /craft command
- [x] Query types: material, component, physics, zone
- [x] Performance target: <5ms

**Dependencies:** Sprint 1
**Effort:** Small

---

#### S4-T2: Workshop Schema Documentation
**Description:** Create schema documentation for workshop.json.

**Acceptance Criteria:**
- [x] WORKSHOP_SCHEMA.md in querying-workshop skill
- [x] Full JSON schema documented
- [x] Example queries documented
- [x] Performance characteristics explained

**Dependencies:** S4-T1
**Effort:** Small

---

#### S4-T3: Query API Implementation
**Description:** Implement query functions for workshop.

**Acceptance Criteria:**
- [x] `queryMaterial(name)` returns MaterialEntry
- [x] `queryComponent(name)` returns ComponentEntry
- [x] `queryPhysics(name)` returns PhysicsDefinition
- [x] `queryZone(name)` returns ZoneDefinition
- [x] All queries <5ms

**Dependencies:** S4-T1, Sprint 1
**Effort:** Medium

---

#### S4-T4: Fallback to Node Modules
**Description:** Fallback to direct type reading when signature missing.

**Acceptance Criteria:**
- [x] If workshop lacks signature, read from node_modules/*.d.ts
- [x] Targeted file read (not full parse)
- [x] Cache result in memory for session
- [x] Fallback time <50ms

**Dependencies:** S4-T3
**Effort:** Medium

---

#### S4-T5: Source Resolution
**Description:** Track where query results come from.

**Acceptance Criteria:**
- [x] QueryResult includes `source: 'workshop' | 'seed' | 'fallback'`
- [x] Log when using fallback
- [x] Prefer workshop > seed > fallback

**Dependencies:** S4-T3
**Effort:** Small

---

#### S4-T6: Workshop Query Tests
**Description:** Unit tests for query performance.

**Acceptance Criteria:**
- [x] Test material query <5ms
- [x] Test component query <5ms
- [x] Test fallback behavior
- [x] Benchmark 100 queries in <500ms
- [x] All tests pass

**Dependencies:** S4-T3 through S4-T5
**Effort:** Medium

---

### Sprint 4 Deliverables
- `.claude/skills/querying-workshop/SKILL.md`
- `.claude/skills/querying-workshop/WORKSHOP_SCHEMA.md`
- Query API implementation
- Fallback logic
- Performance tests

---

## Sprint 5: Validating Physics

**Goal:** Implement physics validation with PreToolUse hook

**Duration:** 1 week

### Tasks

#### S5-T1: Validating Physics SKILL.md
**Description:** Create skill definition for physics validation.

**Acceptance Criteria:**
- [x] SKILL.md in `.claude/skills/validating-physics/`
- [x] Purpose: Block physics violations, not novelty
- [x] Trigger: PreToolUse hook on Write|Edit
- [x] Checks: zone, material, API, fidelity
- [x] Non-checks: pattern existence, style novelty

**Dependencies:** None
**Effort:** Small

---

#### S5-T2: PreToolUse Hook Configuration
**Description:** Configure hook in settings.json.

**Acceptance Criteria:**
- [x] Hook registered for Write|Edit tools
- [x] Calls validate_physics function
- [x] Can block generation if violation found
- [x] Returns clear error message

**Dependencies:** S5-T1
**Effort:** Medium

---

#### S5-T3: Zone Constraint Checking
**Description:** Validate zone-physics compatibility.

**Acceptance Criteria:**
- [x] Critical zone + playful physics → BLOCK
- [x] Critical zone + deliberate physics → ALLOW
- [x] Standard zone + any physics → ALLOW
- [x] Clear error message with suggestion

**Dependencies:** S5-T1
**Effort:** Medium

---

#### S5-T4: Material Constraint Checking
**Description:** Validate material-timing compatibility.

**Acceptance Criteria:**
- [x] Clay material + 0ms timing → BLOCK
- [x] Glass material + heavy spring → BLOCK
- [x] Valid combinations → ALLOW
- [x] Clear error message with suggestion

**Dependencies:** S5-T1
**Effort:** Medium

---

#### S5-T5: API Correctness Verification
**Description:** Validate framework API usage.

**Acceptance Criteria:**
- [x] Query workshop for valid exports
- [x] motion.animate (invalid) → BLOCK with suggestion
- [x] motion.div (valid) → ALLOW
- [x] Include correct API in error message

**Dependencies:** Sprint 4 (workshop)
**Effort:** Medium

---

#### S5-T6: Fidelity Ceiling Check
**Description:** Validate fidelity level constraints.

**Acceptance Criteria:**
- [x] 3D effects in standard zone → BLOCK
- [x] Heavy effects in critical zone → BLOCK
- [x] Check against fidelity.yaml limits
- [x] Clear error with constraint source

**Dependencies:** S5-T1
**Effort:** Medium

---

#### S5-T7: Physics Validation Tests
**Description:** Test suite for validation logic.

**Acceptance Criteria:**
- [x] Test all zone constraint combinations
- [x] Test material constraint combinations
- [x] Test API correctness checks
- [x] Test fidelity ceiling enforcement
- [x] 100% coverage on validation logic
- [x] All tests pass

**Dependencies:** S5-T3 through S5-T6
**Effort:** Large

---

### Sprint 5 Deliverables
- `.claude/skills/validating-physics/SKILL.md`
- PreToolUse hook integration
- Zone, material, API, fidelity validators
- 100% test coverage

---

## Sprint 6: Virtual Sanctuary

**Goal:** Implement seeding for cold start projects

**Duration:** 1 week

### Tasks

#### S6-T1: Seeding Sanctuary SKILL.md
**Description:** Create skill definition for virtual Sanctuary.

**Acceptance Criteria:**
- [x] SKILL.md in `.claude/skills/seeding-sanctuary/`
- [x] Purpose: Provide virtual taste for cold starts
- [x] Trigger: Empty src/sanctuary/ detected
- [x] Seeds: Linear-like, Vercel-like, Stripe-like, Blank
- [x] Output: .sigil/seed.yaml

**Dependencies:** None
**Effort:** Small

---

#### S6-T2: Seed Schema Definition
**Description:** Define TypeScript interface for seed.yaml.

**Acceptance Criteria:**
- [x] `Seed` interface with seed, version, description
- [x] `physics` Record<string, string>
- [x] `materials` Record<string, MaterialDef>
- [x] `virtual_components` Record<string, VirtualComponent>
- [x] Exported from types/seed.ts

**Dependencies:** S6-T1
**Effort:** Small

---

#### S6-T3: Linear-like Seed Library
**Description:** Create Linear-like seed definition.

**Acceptance Criteria:**
- [x] Seed YAML at `.claude/skills/seeding-sanctuary/seeds/linear-like.yaml`
- [x] Physics: snappy (150ms), smooth (300ms)
- [x] Material: minimal, monochrome
- [x] Components: Button, Card, Input, Dialog
- [x] All components have tier, physics, zones

**Dependencies:** S6-T2
**Effort:** Medium

---

#### S6-T4: Vercel-like Seed Library
**Description:** Create Vercel-like seed definition.

**Acceptance Criteria:**
- [x] Seed YAML at `.claude/skills/seeding-sanctuary/seeds/vercel-like.yaml`
- [x] Physics: sharp (100ms), smooth (200ms)
- [x] Material: bold, high-contrast
- [x] Components: Button, Card, Badge, Modal
- [x] All components have tier, physics, zones

**Dependencies:** S6-T2
**Effort:** Medium

---

#### S6-T5: Stripe-like Seed Library
**Description:** Create Stripe-like seed definition.

**Acceptance Criteria:**
- [x] Seed YAML at `.claude/skills/seeding-sanctuary/seeds/stripe-like.yaml`
- [x] Physics: smooth (300ms), deliberate (500ms)
- [x] Material: soft gradients, generous spacing
- [x] Components: Button, Card, Input, Toast
- [x] All components have tier, physics, zones

**Dependencies:** S6-T2
**Effort:** Medium

---

#### S6-T6: Fade Behavior Implementation
**Description:** Implement virtual-to-real component transition.

**Acceptance Criteria:**
- [x] Check for real component at same path
- [x] If real exists, mark virtual as "faded"
- [x] Query prefers real over virtual
- [x] Faded components don't appear in suggestions

**Dependencies:** S6-T3 through S6-T5
**Effort:** Medium

---

#### S6-T7: Seed Selection UI
**Description:** Prompt user to select seed on cold start.

**Acceptance Criteria:**
- [x] Detect empty src/sanctuary/
- [x] Present seed options via AskUserQuestion
- [x] Write selected seed to .sigil/seed.yaml
- [x] Log seed selection

**Dependencies:** S6-T1
**Effort:** Medium

---

#### S6-T8: Integration with Scanning
**Description:** Integrate seeds with scanning-sanctuary skill.

**Acceptance Criteria:**
- [x] If Sanctuary empty, return virtual components
- [x] Virtual components tagged as source: 'seed'
- [x] Real components override virtual
- [x] Seamless transition

**Dependencies:** Sprint 3, S6-T6
**Effort:** Medium

---

### Sprint 6 Deliverables
- `.claude/skills/seeding-sanctuary/SKILL.md`
- Seed schema and types
- Three seed libraries (Linear, Vercel, Stripe)
- Fade behavior working
- Integration with scanning

---

## Phase 3: Evolution (Sprints 7-9)

---

## Sprint 7: Ephemeral Inspiration

**Goal:** Implement context forking for external reference

**Duration:** 1 week

### Tasks

#### S7-T1: Inspiring Ephemerally SKILL.md
**Description:** Create skill definition for ephemeral inspiration.

**Acceptance Criteria:**
- [x] SKILL.md in `.claude/skills/inspiring-ephemerally/`
- [x] Purpose: One-time external fetch in forked context
- [x] Trigger: "like [url]", "inspired by [url]" in prompt
- [x] Flow: Fork → Fetch → Extract → Generate → Discard
- [x] Output: Generated code only (no fetched content persists)

**Dependencies:** None
**Effort:** Small

---

#### S7-T2: URL Detection Triggers
**Description:** Detect inspiration triggers in prompts.

**Acceptance Criteria:**
- [x] Detect "like stripe.com" pattern
- [x] Detect "inspired by [url]" pattern
- [x] Detect "reference [url]" pattern
- [x] Extract URL from detected pattern
- [x] Return trigger type and URL

**Dependencies:** S7-T1
**Effort:** Small

---

#### S7-T3: Context Fork Implementation
**Description:** Create isolated context for ephemeral operations.

**Acceptance Criteria:**
- [x] Fork context preserves core Sigil state
- [x] Forked context has no access to survival.json
- [x] Forked context cannot write to Sanctuary
- [x] Clear boundary for fork/return

**Dependencies:** S7-T1
**Effort:** Large

---

#### S7-T4: Style Extraction Logic
**Description:** Extract design tokens from fetched content.

**Acceptance Criteria:**
- [x] Extract color palette (background, text, accent)
- [x] Extract typography (font-family, sizes, weights)
- [x] Extract spacing patterns
- [x] Extract gradient definitions
- [x] Return structured style object

**Dependencies:** S7-T3
**Effort:** Medium

---

#### S7-T5: Code Generation with Inspiration
**Description:** Generate code using extracted styles.

**Acceptance Criteria:**
- [x] Apply extracted colors to component
- [x] Apply extracted typography
- [x] Apply extracted spacing
- [x] Respect physics constraints (still validated)
- [x] Return generated code to main context

**Dependencies:** S7-T4
**Effort:** Medium

---

#### S7-T6: Cleanup After Use
**Description:** Discard fetched content after generation.

**Acceptance Criteria:**
- [x] Fetched content never persists
- [x] No trace in Sanctuary
- [x] No trace in workshop
- [x] Only generated code remains
- [x] Log cleanup

**Dependencies:** S7-T5
**Effort:** Small

---

#### S7-T7: /sanctify Command
**Description:** Promote ephemeral inspiration to permanent rule.

**Acceptance Criteria:**
- [x] `/sanctify "pattern-name"` command
- [x] Extracts pattern from recent generation
- [x] Adds to rules.md
- [x] Logs sanctification
- [x] Confirmation message

**Dependencies:** S7-T5
**Effort:** Medium

---

### Sprint 7 Deliverables
- `.claude/skills/inspiring-ephemerally/SKILL.md`
- URL detection and triggers
- Context fork implementation
- Style extraction
- /sanctify command

---

## Sprint 8: Forge Mode

**Goal:** Implement precedent-breaking exploration mode

**Duration:** 1 week

### Tasks

#### S8-T1: Forging Patterns SKILL.md
**Description:** Create skill definition for forge mode.

**Acceptance Criteria:**
- [x] SKILL.md in `.claude/skills/forging-patterns/`
- [x] Purpose: Explicit precedent-breaking mode
- [x] Trigger: `/craft --forge` or `/forge` command
- [x] Respects: Physics constraints only
- [x] Ignores: Survival patterns, rejected patterns

**Dependencies:** None
**Effort:** Small

---

#### S8-T2: Forge Flag Detection
**Description:** Detect forge mode trigger.

**Acceptance Criteria:**
- [x] Detect `--forge` flag in /craft
- [x] Detect standalone `/forge` command
- [x] Set forge mode in context
- [x] Log forge mode activation

**Dependencies:** S8-T1
**Effort:** Small

---

#### S8-T3: Survival Bypass
**Description:** Skip survival checks in forge mode.

**Acceptance Criteria:**
- [x] Don't load survival.json in forge mode
- [x] Don't warn about rejected patterns
- [x] Don't prefer canonical patterns
- [x] Treat all patterns as equal

**Dependencies:** S8-T2
**Effort:** Medium

---

#### S8-T4: Physics-Only Validation
**Description:** Enforce only physics in forge mode.

**Acceptance Criteria:**
- [x] Zone constraints still enforced
- [x] Material constraints still enforced
- [x] API correctness still enforced
- [x] Pattern precedent NOT enforced
- [x] Style novelty NOT blocked

**Dependencies:** S8-T2, Sprint 5
**Effort:** Medium

---

#### S8-T5: User Decision on Output
**Description:** Let user decide to keep or discard forge output.

**Acceptance Criteria:**
- [x] After forge generation, prompt "Keep this exploration?"
- [x] If keep: Normal /craft flow applies
- [x] If discard: Generated code removed
- [x] Log decision

**Dependencies:** S8-T3, S8-T4
**Effort:** Small

---

#### S8-T6: Forge Mode Tests
**Description:** Test forge mode behavior.

**Acceptance Criteria:**
- [x] Test survival bypass
- [x] Test physics still enforced
- [x] Test keep/discard flow
- [x] Test integration with /craft

**Dependencies:** S8-T1 through S8-T5
**Effort:** Medium

---

### Sprint 8 Deliverables
- `.claude/skills/forging-patterns/SKILL.md`
- Forge flag detection
- Survival bypass
- Physics-only validation in forge mode

---

## Sprint 9: Era Management

**Goal:** Implement era versioning for design direction shifts

**Duration:** 1 week

### Tasks

#### S9-T1: Era Schema Definition
**Description:** Define era tracking in survival.json.

**Acceptance Criteria:**
- [ ] `era` field in survival.json
- [ ] `era_started` field with date
- [ ] Era name is human-readable (e.g., "v1-Flat")
- [ ] Default era: "v1"

**Dependencies:** None
**Effort:** Small

---

#### S9-T2: /new-era Command
**Description:** Implement era transition command.

**Acceptance Criteria:**
- [ ] `/new-era "Tactile"` command
- [ ] Archives current patterns as "Era: [old-name]"
- [ ] Creates new era with provided name
- [ ] Resets pattern counts (but keeps history)
- [ ] Updates survival.json

**Dependencies:** S9-T1
**Effort:** Medium

---

#### S9-T3: Pattern Archiving
**Description:** Archive patterns when era changes.

**Acceptance Criteria:**
- [ ] Create `.sigil/eras/[era-name].json`
- [ ] Copy current survival patterns to archive
- [ ] Add era_ended timestamp
- [ ] Keep archive read-only

**Dependencies:** S9-T2
**Effort:** Medium

---

#### S9-T4: Fresh Precedent Tracking
**Description:** Start fresh tracking in new era.

**Acceptance Criteria:**
- [ ] New era starts with empty patterns
- [ ] Old patterns don't block exploration
- [ ] Canonical status doesn't carry over
- [ ] Each era has independent survival

**Dependencies:** S9-T3
**Effort:** Medium

---

#### S9-T5: Era in Craft Logs
**Description:** Include era in craft log entries.

**Acceptance Criteria:**
- [ ] Craft log includes current era name
- [ ] Era visible in log header
- [ ] Can filter logs by era

**Dependencies:** S9-T1
**Effort:** Small

---

#### S9-T6: Rules.md Era Markers
**Description:** Add era markers to rules.md.

**Acceptance Criteria:**
- [ ] Era section in rules.md
- [ ] Current era highlighted
- [ ] Historical eras listed
- [ ] Auto-updated on era change

**Dependencies:** S9-T2
**Effort:** Small

---

#### S9-T7: Era Management Tests
**Description:** Test era transition flow.

**Acceptance Criteria:**
- [ ] Test new era creation
- [ ] Test pattern archiving
- [ ] Test fresh tracking
- [ ] Test rules.md update

**Dependencies:** S9-T1 through S9-T6
**Effort:** Medium

---

### Sprint 9 Deliverables
- Era schema in survival.json
- /new-era command
- Pattern archiving
- Era markers in rules.md

---

## Phase 4: Verification (Sprints 10-12)

---

## Sprint 10: Survival Observation

**Goal:** Implement PostToolUse hook for pattern tracking

**Duration:** 1 week

### Tasks

#### S10-T1: Observing Survival SKILL.md
**Description:** Create skill definition for survival observation.

**Acceptance Criteria:**
- [ ] SKILL.md in `.claude/skills/observing-survival/`
- [ ] Purpose: Silent pattern tracking via PostToolUse hook
- [ ] Trigger: After Write|Edit tool
- [ ] Output: Updated survival.json
- [ ] Behavior: No interruption, no approval dialog

**Dependencies:** None
**Effort:** Small

---

#### S10-T2: PostToolUse Hook Configuration
**Description:** Configure hook in settings.json.

**Acceptance Criteria:**
- [ ] Hook registered for Write|Edit tools
- [ ] Calls observe_patterns function
- [ ] Non-blocking (never blocks generation)
- [ ] Runs silently in background

**Dependencies:** S10-T1
**Effort:** Medium

---

#### S10-T3: Pattern Detection
**Description:** Detect new patterns in generated code.

**Acceptance Criteria:**
- [ ] Detect new animation patterns
- [ ] Detect new component structures
- [ ] Detect new hook usages
- [ ] Return list of patterns with names

**Dependencies:** S10-T2
**Effort:** Medium

---

#### S10-T4: JSDoc Pattern Tagging
**Description:** Add @sigil-pattern tags to new patterns.

**Acceptance Criteria:**
- [ ] Format: `// @sigil-pattern: patternName (2026-01-08)`
- [ ] Tag added after relevant code block
- [ ] Non-intrusive placement
- [ ] Parseable for gardener

**Dependencies:** S10-T3
**Effort:** Medium

---

#### S10-T5: Survival Index Update
**Description:** Incrementally update survival.json.

**Acceptance Criteria:**
- [ ] Add new patterns with first_seen date
- [ ] Increment occurrences for existing patterns
- [ ] Set initial status: experimental
- [ ] Add file path to files array
- [ ] Update last_scan timestamp

**Dependencies:** S10-T4
**Effort:** Medium

---

#### S10-T6: Gardener Script
**Description:** Create weekly survival scan script.

**Acceptance Criteria:**
- [ ] Script at `.claude/skills/observing-survival/scripts/gardener.sh`
- [ ] Scan for @sigil-pattern tags via ripgrep
- [ ] Count occurrences per pattern
- [ ] Apply promotion rules (3+ → canonical)
- [ ] Detect deletions (0 occurrences → rejected)
- [ ] Update survival.json

**Dependencies:** S10-T5
**Effort:** Medium

---

#### S10-T7: /garden Command
**Description:** Implement manual garden command.

**Acceptance Criteria:**
- [ ] `/garden` runs gardener script
- [ ] Reports pattern status changes
- [ ] Shows canonical/rejected transitions
- [ ] Returns summary

**Dependencies:** S10-T6
**Effort:** Small

---

#### S10-T8: Survival Observation Tests
**Description:** Test pattern tracking flow.

**Acceptance Criteria:**
- [ ] Test pattern detection
- [ ] Test JSDoc tagging
- [ ] Test survival update
- [ ] Test gardener promotion logic
- [ ] Test rejection detection

**Dependencies:** S10-T1 through S10-T7
**Effort:** Medium

---

### Sprint 10 Deliverables
- `.claude/skills/observing-survival/SKILL.md`
- PostToolUse hook integration
- Pattern detection and tagging
- Gardener script
- /garden command

---

## Sprint 11: Chronicling & Auditing

**Goal:** Implement craft logs and cohesion auditing

**Duration:** 1 week

### Tasks

#### S11-T1: Chronicling Rationale SKILL.md
**Description:** Create skill definition for craft logs.

**Acceptance Criteria:**
- [ ] SKILL.md in `.claude/skills/chronicling-rationale/`
- [ ] Purpose: Lightweight documentation via Stop hook
- [ ] Trigger: End of /craft session
- [ ] Output: .sigil/craft-log/{date}-{component}.md
- [ ] Behavior: No blocking, no approval

**Dependencies:** None
**Effort:** Small

---

#### S11-T2: Stop Hook Configuration
**Description:** Configure Stop hook for craft log generation.

**Acceptance Criteria:**
- [ ] Hook registered for Stop event
- [ ] Calls ensure_craft_log function
- [ ] Non-blocking
- [ ] Runs at session end

**Dependencies:** S11-T1
**Effort:** Medium

---

#### S11-T3: Craft Log Template
**Description:** Define craft log structure.

**Acceptance Criteria:**
- [ ] Header: component name, date, era
- [ ] Request: original prompt
- [ ] Decisions: zone, physics, component with reasoning
- [ ] New Patterns: list with status
- [ ] Physics Validated: checklist

**Dependencies:** S11-T1
**Effort:** Small

---

#### S11-T4: Craft Log Generation
**Description:** Generate craft log at session end.

**Acceptance Criteria:**
- [ ] Collect decisions from session
- [ ] Format using template
- [ ] Write to .sigil/craft-log/
- [ ] Filename: {date}-{component-name}.md
- [ ] Performance: <100ms

**Dependencies:** S11-T3
**Effort:** Medium

---

#### S11-T5: Auditing Cohesion SKILL.md
**Description:** Create skill definition for visual cohesion auditing.

**Acceptance Criteria:**
- [ ] SKILL.md in `.claude/skills/auditing-cohesion/`
- [ ] Purpose: Visual consistency checks on demand
- [ ] Trigger: /audit [component] command
- [ ] Checks: shadows, borders, colors, spacing
- [ ] Output: Variance report with percentages

**Dependencies:** None
**Effort:** Small

---

#### S11-T6: Property Comparison
**Description:** Compare component properties against Sanctuary average.

**Acceptance Criteria:**
- [ ] Extract visual properties from target component
- [ ] Calculate Sanctuary averages for same tier
- [ ] Compare and compute variance
- [ ] Flag variances exceeding thresholds

**Dependencies:** S11-T5
**Effort:** Medium

---

#### S11-T7: Variance Thresholds
**Description:** Define acceptable variance by property type.

**Acceptance Criteria:**
- [ ] Shadow: 20% variance allowed
- [ ] Border radius: 10% variance allowed
- [ ] Spacing: 15% variance allowed
- [ ] Colors: 10% variance allowed
- [ ] Configurable in sigil.yaml

**Dependencies:** S11-T6
**Effort:** Small

---

#### S11-T8: Deviation Annotations
**Description:** Support @sigil-deviation for justified variance.

**Acceptance Criteria:**
- [ ] Parse @sigil-deviation JSDoc tag
- [ ] Include reason in tag
- [ ] Skip flagging annotated deviations
- [ ] Report deviation with reason

**Dependencies:** S11-T6
**Effort:** Small

---

#### S11-T9: /audit Command
**Description:** Implement audit command.

**Acceptance Criteria:**
- [ ] `/audit ClaimButton` runs cohesion check
- [ ] Returns variance report
- [ ] Shows property, expected, actual, variance %
- [ ] Lists justified deviations separately

**Dependencies:** S11-T5 through S11-T8
**Effort:** Medium

---

### Sprint 11 Deliverables
- `.claude/skills/chronicling-rationale/SKILL.md`
- `.claude/skills/auditing-cohesion/SKILL.md`
- Stop hook integration
- Craft log generation
- /audit command

---

## Sprint 12: Agent Integration

**Goal:** Create sigil-craft agent and orchestrate skills

**Duration:** 1 week

### Tasks

#### S12-T1: Sigil-Craft Agent Definition
**Description:** Create agent definition for /craft flow.

**Acceptance Criteria:**
- [ ] Agent YAML at `.claude/agents/sigil-craft.yaml`
- [ ] Orchestrates all 10 skills
- [ ] Defines skill execution order
- [ ] Handles errors gracefully

**Dependencies:** Sprints 3-11
**Effort:** Medium

---

#### S12-T2: Skill Orchestration
**Description:** Define skill execution flow for /craft.

**Acceptance Criteria:**
- [ ] Startup: Check workshop freshness
- [ ] Discovery: Scan Sanctuary, query workshop
- [ ] Validation: PreToolUse physics check
- [ ] Generation: Code generation
- [ ] Observation: PostToolUse pattern tracking
- [ ] Chronicling: Stop hook craft log

**Dependencies:** S12-T1
**Effort:** Medium

---

#### S12-T3: Context Resolution
**Description:** Resolve zone, physics, vocabulary from prompt.

**Acceptance Criteria:**
- [ ] Extract vocabulary terms from prompt
- [ ] Map to zone via vocabulary.yaml
- [ ] Resolve physics from zone
- [ ] Log resolution chain

**Dependencies:** S12-T2
**Effort:** Medium

---

#### S12-T4: Pattern Selection
**Description:** Select canonical patterns when available.

**Acceptance Criteria:**
- [ ] Query survival.json for canonical patterns
- [ ] Prefer canonical over experimental
- [ ] Prefer experimental over new
- [ ] Log pattern selection

**Dependencies:** Sprint 10
**Effort:** Medium

---

#### S12-T5: End-to-End Craft Flow
**Description:** Complete /craft flow implementation.

**Acceptance Criteria:**
- [ ] `/craft "trustworthy claim button"` works end-to-end
- [ ] Zone resolved correctly (critical)
- [ ] Physics applied correctly (deliberate)
- [ ] Code generated with correct timing
- [ ] Craft log created
- [ ] Pattern observed

**Dependencies:** S12-T1 through S12-T4
**Effort:** Large

---

#### S12-T6: Performance Benchmarks
**Description:** Verify performance targets.

**Acceptance Criteria:**
- [ ] Workshop query <5ms (benchmark)
- [ ] Sanctuary scan <50ms (benchmark)
- [ ] Full /craft flow <2s (benchmark)
- [ ] Document benchmark results

**Dependencies:** S12-T5
**Effort:** Medium

---

#### S12-T7: Integration Tests
**Description:** End-to-end integration tests.

**Acceptance Criteria:**
- [ ] Test /craft with empty Sanctuary (seed)
- [ ] Test /craft with populated Sanctuary
- [ ] Test /craft --forge mode
- [ ] Test /inspire flow
- [ ] Test /audit flow
- [ ] All tests pass

**Dependencies:** S12-T5
**Effort:** Large

---

### Sprint 12 Deliverables
- `.claude/agents/sigil-craft.yaml`
- Skill orchestration
- End-to-end /craft flow
- Performance benchmarks
- Integration tests

---

## Phase 5: Integration (Sprint 13)

---

## Sprint 13: Polish & Documentation

**Goal:** Documentation, migration, and final polish

**Duration:** 1 week

### Tasks

#### S13-T1: CLAUDE.md Update
**Description:** Update CLAUDE.md with v6.0 protocol.

**Acceptance Criteria:**
- [ ] All commands documented
- [ ] All 10 skills referenced
- [ ] Three Laws stated
- [ ] Seven Laws referenced
- [ ] Quick reference table
- [ ] Agent protocol section

**Dependencies:** Sprints 1-12
**Effort:** Medium

---

#### S13-T2: README.md Update
**Description:** Update README with v6.0 features.

**Acceptance Criteria:**
- [ ] New features highlighted
- [ ] Workshop index explained
- [ ] Virtual Sanctuary explained
- [ ] Commands reference
- [ ] Quick start guide

**Dependencies:** S13-T1
**Effort:** Medium

---

#### S13-T3: MIGRATION.md
**Description:** Create migration guide from v5.0.

**Acceptance Criteria:**
- [ ] Step-by-step migration
- [ ] What's kept (kernel, runtime)
- [ ] What's added (.sigil/)
- [ ] What's removed (old cache)
- [ ] Migration script reference

**Dependencies:** Sprints 1-12
**Effort:** Medium

---

#### S13-T4: Migration Script
**Description:** Create v5→v6 migration script.

**Acceptance Criteria:**
- [ ] Script at `scripts/migrate-v6.sh`
- [ ] Creates .sigil/ directory structure
- [ ] Builds initial workshop
- [ ] Initializes survival.json
- [ ] Updates version files

**Dependencies:** Sprints 1-12
**Effort:** Medium

---

#### S13-T5: End-to-End Testing
**Description:** Complete end-to-end test suite.

**Acceptance Criteria:**
- [ ] Test cold start with seed
- [ ] Test warm start with workshop
- [ ] Test /craft flow variations
- [ ] Test /forge mode
- [ ] Test /inspire + /sanctify
- [ ] Test /garden
- [ ] Test /audit
- [ ] Test /new-era
- [ ] All tests pass

**Dependencies:** Sprints 1-12
**Effort:** Large

---

#### S13-T6: Performance Validation
**Description:** Validate all performance targets.

**Acceptance Criteria:**
- [ ] Workshop query <5ms ✓
- [ ] Sanctuary scan <50ms ✓
- [ ] Index rebuild <2s ✓
- [ ] Pattern observation <10ms ✓
- [ ] Craft log generation <100ms ✓
- [ ] Document results

**Dependencies:** S13-T5
**Effort:** Medium

---

#### S13-T7: Version Bump
**Description:** Update version files to 6.0.0.

**Acceptance Criteria:**
- [ ] VERSION file updated
- [ ] .sigil-version.json updated
- [ ] package.json version updated
- [ ] CHANGELOG.md updated
- [ ] Git tag created

**Dependencies:** S13-T1 through S13-T6
**Effort:** Small

---

### Sprint 13 Deliverables
- Updated CLAUDE.md
- Updated README.md
- MIGRATION.md
- Migration script
- Complete test suite
- Performance validation
- **v6.0.0 RELEASE**

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Workshop index staleness | Low | Medium | Hash-based freshness check, incremental updates |
| Context fork complexity | Medium | High | Clear boundaries, explicit cleanup |
| Survival false positives | Low | Medium | 2-week waiting period, 3+ occurrence threshold |
| Seed library maintenance | Low | Low | Version seeds, allow user customization |
| Performance regression | Low | High | Continuous benchmarks, performance tests |

---

## Success Metrics per Sprint

| Sprint | Key Metric |
|--------|------------|
| Sprint 1 | Workshop index builds successfully |
| Sprint 2 | Startup sentinel detects staleness correctly |
| Sprint 3 | Discovery skills return results <50ms |
| Sprint 4 | Workshop query <5ms verified |
| Sprint 5 | Physics validation 100% accurate |
| Sprint 6 | Seeds provide cold start taste |
| Sprint 7 | Ephemeral content never persists |
| Sprint 8 | Forge mode respects physics only |
| Sprint 9 | Era transitions work cleanly |
| Sprint 10 | Patterns tracked silently |
| Sprint 11 | Craft logs generated, audit works |
| Sprint 12 | Full /craft flow <2s |
| Sprint 13 | All tests pass, docs complete |

---

## Dependencies & Blockers

### External Dependencies
- ripgrep installed on system
- Node.js 18+ for scripts
- Claude Code 2.1+ for context forking

### Internal Dependencies
```
Phase 1: Foundation
├── Sprint 1 (Workshop Schema) ──┬──► Sprint 2 (Startup Sentinel)
│                                │
│                                └──► Sprint 4 (Querying)
│
├── Sprint 3 (Discovery) ────────────► Sprint 6 (Seeds)
│
Phase 2: Intelligence
├── Sprint 4 (Querying) ─────────────► Sprint 5 (Validation)
│
├── Sprint 5 (Validation) ───────────► Sprint 8 (Forge)
│
├── Sprint 6 (Seeds) ────────────────► Sprint 7 (Ephemeral)
│
Phase 3: Evolution
├── Sprint 7 (Ephemeral) ────────────► Sprint 12 (Agent)
│
├── Sprint 8 (Forge) ────────────────► Sprint 9 (Era)
│
├── Sprint 9 (Era) ──────────────────► Sprint 10 (Survival)
│
Phase 4: Verification
├── Sprint 10 (Survival) ────────────► Sprint 12 (Agent)
│
├── Sprint 11 (Chronicling) ─────────► Sprint 12 (Agent)
│
Phase 5: Integration
└── Sprint 12 (Agent) ───────────────► Sprint 13 (Polish)
```

---

*Sprint Plan Generated: 2026-01-08*
*Based on: PRD v6.0.0, SDD v6.0.0*
*Next Step: `/implement sprint-1`*
