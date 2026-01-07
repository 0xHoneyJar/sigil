# Sprint Plan: Sigil v4.0 — "Sharp Tools"

**Version:** 4.0.0
**Codename:** Sharp Tools
**Generated:** 2026-01-07
**Sprints:** 10
**Priority:** Foundation → Tools → Integration

---

## Overview

This sprint plan implements Sigil v4.0 "Sharp Tools" — the transformation from 37 commands to 7 discrete tools with progressive disclosure, /observe communication layer, /refine incremental updates, and build-time export.

| Sprint | Focus | Key Deliverables |
|--------|-------|------------------|
| 1 | Schema Foundation | Evidence-based personas, journey zones |
| 2 | /envision & /codify | Progressive disclosure, auto-setup |
| 3 | /craft Enhancement | Gap detection, context loading |
| 4 | /observe Communication | MCP integration, visual feedback |
| 5 | /refine Updates | Evidence application, feedback loop |
| 6 | /consult Consolidation | Decision stamping |
| 7 | /garden Health | Drift detection, validation |
| 8 | Build-Time Export | CLI command, runtime provider |
| 9 | Migration | Deprecation warnings, migration guide |
| 10 | Integration | End-to-end testing, documentation |

### The Seven Tools

```
CAPTURE (Setup)           CREATION (Build)        OBSERVATION (See)
─────────────────         ────────────────        ─────────────────
/envision                 /craft                  /observe (NEW)
/codify

REFINEMENT (Evolve)       MAINTENANCE (Tend)
───────────────────       ────────────────────
/refine (NEW)             /garden
/consult
```

---

## MVP Definition

**MVP Scope (Sprints 1-5):**
- Schema evolution (backwards compatible)
- /envision and /codify with progressive disclosure
- /craft with gap detection
- /observe with MCP integration
- /refine for incremental context updates

**Post-MVP (Sprints 6-10):**
- /consult consolidation
- /garden health checks
- Build-time export CLI
- Full migration path

---

## Sprint 1: Schema Foundation ✅

**Goal:** Evolve persona and zone schemas to support evidence and journey context (non-breaking).
**Status:** COMPLETED

### Tasks

#### v4.0-S1-T1: Update Persona Schema ✅
- **Description:** Add `source`, `evidence`, `journey_stages`, and `last_refined` fields to persona schema
- **Acceptance Criteria:**
  - [x] JSON Schema updated at `sigil-mark/personas/schemas/personas.schema.json`
  - [x] New fields are optional (backwards compatible)
  - [x] Existing personas.yaml files validate successfully
  - [x] TypeScript types updated in `persona-reader.ts`
- **Dependencies:** None
- **Testing:** Schema validation tests

#### v4.0-S1-T2: Update Zone Schema ✅
- **Description:** Add `journey_stage`, `persona_likely`, `trust_state`, and `evidence` fields to zone schema
- **Acceptance Criteria:**
  - [x] Zone schema extracted to `sigil-mark/zones/schemas/zones.schema.json`
  - [x] `.sigilrc.yaml` supports new zone fields
  - [x] New fields are optional (backwards compatible)
  - [x] TypeScript types updated in `zone-reader.ts`
- **Dependencies:** None
- **Testing:** Schema validation tests

#### v4.0-S1-T3: Create Evidence Schema ✅
- **Description:** Define schema for evidence files in `evidence/` directory
- **Acceptance Criteria:**
  - [x] Evidence schema at `sigil-mark/evidence/schemas/evidence.schema.json`
  - [x] Supports analytics, interviews, observations formats
  - [x] Example evidence file created
- **Dependencies:** None
- **Testing:** Schema validation

#### v4.0-S1-T4: Create Feedback Schema ✅
- **Description:** Define schema for observation feedback files
- **Acceptance Criteria:**
  - [x] Feedback schema at `sigil-mark/.sigil-observations/schemas/feedback.schema.json`
  - [x] Supports structural checks, measurable properties, human feedback
  - [x] `applied` field for tracking processed feedback
- **Dependencies:** None
- **Testing:** Schema validation

#### v4.0-S1-T5: Directory Structure Setup ✅
- **Description:** Create new v4.0 directories
- **Acceptance Criteria:**
  - [x] `sigil-mark/evidence/` created
  - [x] `sigil-mark/.sigil-observations/screenshots/` created
  - [x] `sigil-mark/.sigil-observations/feedback/` created
  - [x] `.gitkeep` files for empty directories
- **Dependencies:** None
- **Testing:** Directory existence

---

## Sprint 2: /envision & /codify Evolution ✅

**Goal:** Update capture tools with progressive disclosure and auto-setup.
**Status:** COMPLETED

### Tasks

#### v4.0-S2-T1: /envision Progressive Disclosure ✅
- **Description:** Implement L1/L2/L3 grip levels for /envision
- **Acceptance Criteria:**
  - [x] L1: Full interview with sensible defaults
  - [x] L2: `--quick` flag for minimal interview
  - [x] L3: `--from <file>` extracts from existing documentation
  - [x] Auto-detects existing codebase (inherits from /inherit)
- **Dependencies:** v4.0-S1-T1 (persona schema)
- **Testing:** Interview flow tests

#### v4.0-S2-T2: /envision Product-Specific Personas ✅
- **Description:** Interview asks for product-specific users, not generic archetypes
- **Acceptance Criteria:**
  - [x] Interview prompts for product domain
  - [x] Asks for evidence source (analytics, GTM, etc.)
  - [x] Creates personas with `source` and `evidence` fields populated
  - [x] Asks about journey stages
- **Dependencies:** v4.0-S2-T1
- **Testing:** Persona creation tests

#### v4.0-S2-T3: /codify Progressive Disclosure ✅
- **Description:** Implement L1/L2/L3 grip levels for /codify
- **Acceptance Criteria:**
  - [x] L1: Guided interview for design tokens
  - [x] L2: `--zone <name>` defines single zone
  - [x] L3: `--from <design-system.json>` imports existing system
- **Dependencies:** v4.0-S1-T2 (zone schema)
- **Testing:** Rule creation tests

#### v4.0-S2-T4: /codify Journey-Based Zones ✅
- **Description:** Zone creation includes journey context
- **Acceptance Criteria:**
  - [x] Interview asks about journey stage
  - [x] Asks which persona is likely in this zone
  - [x] Captures trust state (building/established/critical)
  - [x] Evidence field available for zone data
- **Dependencies:** v4.0-S2-T3
- **Testing:** Zone creation tests

#### v4.0-S2-T5: Auto-Setup Integration ✅
- **Description:** Remove requirement for explicit /setup command
- **Acceptance Criteria:**
  - [x] First /envision or /codify initializes Sigil automatically
  - [x] Creates `sigil-mark/` if not exists
  - [x] Initializes `.sigilrc.yaml` if not exists
  - [x] No error if already initialized
- **Dependencies:** v4.0-S2-T1, v4.0-S2-T3
- **Testing:** First-run tests

#### v4.0-S2-T6: Update Skill Files ✅
- **Description:** Update skill SKILL.md files for new progressive disclosure
- **Acceptance Criteria:**
  - [x] `envisioning-moodboard/SKILL.md` updated
  - [x] `codifying-rules/SKILL.md` updated
  - [x] L1/L2/L3 documented in each skill
  - [x] "When to Ask vs Proceed" section included
- **Dependencies:** v4.0-S2-T1 through T5
- **Testing:** Manual review

---

## Sprint 3: /craft Enhancement ✅

**Goal:** Enhance /craft with gap detection and improved context loading.
**Status:** COMPLETED

### Tasks

#### v4.0-S3-T1: Context Loading Improvements ✅
- **Description:** Graceful context loading with fallbacks
- **Acceptance Criteria:**
  - [x] Loads moodboard, rules, personas, vocabulary, philosophy
  - [x] Missing files don't error, use sensible defaults
  - [x] Zone resolution from file path
  - [x] Persona resolution from zone's `persona_likely`
- **Dependencies:** v4.0-S1 (schemas), v4.0-S2 (tools)
- **Testing:** Context loading tests

#### v4.0-S3-T2: Progressive Disclosure for /craft ✅
- **Description:** Implement L1/L2/L3 grip levels
- **Acceptance Criteria:**
  - [x] L1: `/craft "button"` uses auto-detected context
  - [x] L2: `--zone critical` explicit zone context
  - [x] L3: `--zone --persona --lens --no-gaps` full control
- **Dependencies:** v4.0-S3-T1
- **Testing:** /craft invocation tests

#### v4.0-S3-T3: Gap Detection System ✅
- **Description:** Detect and surface missing context at end of output
- **Acceptance Criteria:**
  - [x] Detects undefined personas mentioned in request
  - [x] Detects undefined zones mentioned in request
  - [x] Detects missing vocabulary terms
  - [x] Surfaces gaps at END of output (not inline)
  - [x] Each gap includes `/refine` command to fix
- **Dependencies:** v4.0-S3-T1
- **Testing:** Gap detection tests

#### v4.0-S3-T4: Decision Lock Checking ✅
- **Description:** Check active decisions before generating
- **Acceptance Criteria:**
  - [x] Loads decisions from `consultation-chamber/decisions/`
  - [x] Warns if generated code conflicts with locked decision
  - [x] Respects decision scope (zones, components)
- **Dependencies:** v4.0-S3-T1
- **Testing:** Decision conflict tests

#### v4.0-S3-T5: Journey Context in Output ✅
- **Description:** Surface journey context in /craft output
- **Acceptance Criteria:**
  - [x] Shows resolved zone with journey_stage
  - [x] Shows resolved persona with trust_level
  - [x] Explains why certain patterns were chosen
- **Dependencies:** v4.0-S3-T1, v4.0-S3-T2
- **Testing:** Output format tests

#### v4.0-S3-T6: Update crafting-guidance Skill ✅
- **Description:** Update SKILL.md for v4.0 /craft behavior
- **Acceptance Criteria:**
  - [x] `crafting-guidance/SKILL.md` updated
  - [x] Context loading documented
  - [x] Gap detection behavior documented
  - [x] Progressive disclosure documented
- **Dependencies:** v4.0-S3-T1 through T5
- **Testing:** Manual review

---

## Sprint 4: /observe Communication Layer ✅

**Goal:** Implement visual feedback loop via Claude in Chrome MCP.
**Status:** COMPLETED

### Tasks

#### v4.0-S4-T1: MCP Availability Detection ✅
- **Description:** Check for Claude in Chrome MCP connection
- **Acceptance Criteria:**
  - [x] Uses `mcp__claude-in-chrome__tabs_context_mcp` to check availability
  - [x] Graceful fallback message if MCP not available
  - [x] Offers manual screenshot upload as alternative
- **Dependencies:** None
- **Testing:** MCP detection tests

#### v4.0-S4-T2: Screenshot Capture ✅
- **Description:** Capture visual state via MCP
- **Acceptance Criteria:**
  - [x] Uses `mcp__claude-in-chrome__computer` with `action: screenshot`
  - [x] Stores screenshot in `.sigil-observations/screenshots/`
  - [x] Filename includes timestamp and component name
- **Dependencies:** v4.0-S4-T1
- **Testing:** Screenshot capture tests

#### v4.0-S4-T3: Structural Analysis ✅
- **Description:** Analyze screenshot against zone expectations
- **Acceptance Criteria:**
  - [x] Checks for expected zone wrappers (CriticalZone, etc.)
  - [x] Checks for expected component patterns
  - [x] Returns pass/fail for each structural check
- **Dependencies:** v4.0-S4-T2
- **Testing:** Structural analysis tests

#### v4.0-S4-T4: Measurable Property Comparison ✅
- **Description:** Compare visual properties against rules.md
- **Acceptance Criteria:**
  - [x] Reads expected values from rules.md
  - [x] Compares border-radius, colors, spacing, animation timing
  - [x] Returns delta for each mismatch
- **Dependencies:** v4.0-S4-T2
- **Testing:** Property comparison tests

#### v4.0-S4-T5: Feedback Question Generation ✅
- **Description:** Generate targeted questions for human judgment
- **Acceptance Criteria:**
  - [x] Creates question for each measurable delta
  - [x] Options: "Yes — update rules" / "No — fix component"
  - [x] Includes context about why property matters
- **Dependencies:** v4.0-S4-T4
- **Testing:** Question generation tests

#### v4.0-S4-T6: Feedback Storage ✅
- **Description:** Record feedback to YAML files
- **Acceptance Criteria:**
  - [x] Creates feedback file in `.sigil-observations/feedback/`
  - [x] Includes observation_id, timestamp, component
  - [x] Records structural checks, measurable properties, human answers
  - [x] Sets `applied: false` for new feedback
- **Dependencies:** v4.0-S4-T5
- **Testing:** Feedback storage tests

#### v4.0-S4-T7: Progressive Disclosure for /observe ✅
- **Description:** Implement L1/L2/L3 grip levels
- **Acceptance Criteria:**
  - [x] L1: `/observe` captures current screen
  - [x] L2: `--component ClaimButton` focuses analysis
  - [x] L3: `--screenshot manual.png --rules border-radius` manual mode
- **Dependencies:** v4.0-S4-T1 through T6
- **Testing:** /observe invocation tests

#### v4.0-S4-T8: Create observing-visual Skill ✅
- **Description:** Create new skill directory and files
- **Acceptance Criteria:**
  - [x] `observing-visual/index.yaml` created
  - [x] `observing-visual/SKILL.md` created with execution steps
  - [x] MCP requirement documented
  - [x] Output format documented
- **Dependencies:** v4.0-S4-T1 through T7
- **Testing:** Manual review

---

## Sprint 5: /refine Incremental Updates ✅

**Goal:** Implement incremental context updates with evidence.
**Status:** COMPLETED

### Tasks

#### v4.0-S5-T1: Evidence File Parsing ✅
- **Description:** Parse evidence files from `evidence/` directory
- **Acceptance Criteria:**
  - [x] Reads YAML evidence files
  - [x] Validates against evidence schema
  - [x] Extracts metrics, insights, source type
- **Dependencies:** v4.0-S1-T3 (evidence schema)
- **Testing:** Evidence parsing tests

#### v4.0-S5-T2: Persona Update Flow ✅
- **Description:** Update existing personas with new evidence
- **Acceptance Criteria:**
  - [x] Loads existing persona from personas.yaml
  - [x] Merges new evidence citations
  - [x] Updates characteristics if evidence contradicts
  - [x] Updates `last_refined` timestamp
- **Dependencies:** v4.0-S5-T1
- **Testing:** Persona update tests

#### v4.0-S5-T3: Persona Creation Flow ✅
- **Description:** Create new personas via interview
- **Acceptance Criteria:**
  - [x] Asks for description, evidence source, characteristics
  - [x] Asks for journey stages (which zones?)
  - [x] Creates persona with all v4.0 fields
  - [x] Writes to personas.yaml
- **Dependencies:** v4.0-S1-T1 (persona schema)
- **Testing:** Persona creation tests

#### v4.0-S5-T4: Zone Update/Creation ✅
- **Description:** Update or create zones via /refine
- **Acceptance Criteria:**
  - [x] `/refine --zone claim_moment` updates existing zone
  - [x] Creates new zone if doesn't exist
  - [x] Asks for journey_stage, persona_likely, trust_state
  - [x] Updates `.sigilrc.yaml`
- **Dependencies:** v4.0-S1-T2 (zone schema)
- **Testing:** Zone update tests

#### v4.0-S5-T5: Feedback Application ✅
- **Description:** Apply feedback from /observe sessions
- **Acceptance Criteria:**
  - [x] `/refine` shows unapplied feedback
  - [x] "Yes — update rules" updates rules.md
  - [x] "No — fix component" noted (no context change)
  - [x] Marks feedback as `applied: true`
- **Dependencies:** v4.0-S4-T6 (feedback storage)
- **Testing:** Feedback application tests

#### v4.0-S5-T6: Progressive Disclosure for /refine ✅
- **Description:** Implement L1/L2/L3 grip levels
- **Acceptance Criteria:**
  - [x] L1: Interactive mode, reviews unapplied feedback
  - [x] L2: `--persona depositor` specific persona
  - [x] L3: `--persona depositor --evidence analytics.yaml` file-based
- **Dependencies:** v4.0-S5-T1 through T5
- **Testing:** /refine invocation tests

#### v4.0-S5-T7: Create refining-context Skill ✅
- **Description:** Create new skill directory and files
- **Acceptance Criteria:**
  - [x] `refining-context/index.yaml` created
  - [x] `refining-context/SKILL.md` created
  - [x] Evidence sources documented
  - [x] Interview questions documented
- **Dependencies:** v4.0-S5-T1 through T6
- **Testing:** Manual review

---

## Sprint 6: /consult Consolidation ✅

**Goal:** Consolidate decision recording into single /consult command.
**Status:** COMPLETED

### Tasks

#### v4.0-S6-T1: Core Decision Recording ✅
- **Description:** Basic decision recording with time lock
- **Acceptance Criteria:**
  - [x] `/consult "decision"` creates decision file
  - [x] Default 30-day time lock
  - [x] Generates DEC-YYYY-NNN ID
  - [x] Writes to `consultation-chamber/decisions/`
- **Dependencies:** None
- **Testing:** Decision creation tests

#### v4.0-S6-T2: Scope and Lock Options ✅
- **Description:** L2 options for scope and lock duration
- **Acceptance Criteria:**
  - [x] `--scope critical` limits to specific zones
  - [x] `--scope ClaimButton` limits to specific components
  - [x] `--lock 90d` custom lock duration
  - [x] Scope stored in decision file
- **Dependencies:** v4.0-S6-T1
- **Testing:** Scope/lock tests

#### v4.0-S6-T3: Decision Unlock ✅
- **Description:** Unlock existing decisions with reason
- **Acceptance Criteria:**
  - [x] `/consult DEC-001 --unlock "reason"` unlocks decision
  - [x] Requires reason (cannot be empty)
  - [x] Updates decision history
  - [x] Sets `status: unlocked`
- **Dependencies:** v4.0-S6-T1
- **Testing:** Unlock tests

#### v4.0-S6-T4: Protected Capabilities ✅
- **Description:** Mark decisions as protected (canonize replacement)
- **Acceptance Criteria:**
  - [x] `/consult "behavior" --protect` creates protected decision
  - [x] Protected decisions have longer default lock (365d)
  - [x] Protected flag in decision file
- **Dependencies:** v4.0-S6-T1
- **Testing:** Protection tests

#### v4.0-S6-T5: Evidence Linking ✅
- **Description:** Link decisions to evidence
- **Acceptance Criteria:**
  - [x] Decision can cite observation feedback
  - [x] Decision can cite evidence files
  - [x] Evidence stored in decision file
- **Dependencies:** v4.0-S6-T1, v4.0-S5 (feedback)
- **Testing:** Evidence linking tests

#### v4.0-S6-T6: Update consulting-decisions Skill ✅
- **Description:** Update skill for consolidated /consult
- **Acceptance Criteria:**
  - [x] `consulting-decisions/SKILL.md` updated
  - [x] Progressive disclosure documented
  - [x] Migration from /approve, /canonize, /unlock documented
- **Dependencies:** v4.0-S6-T1 through T5
- **Testing:** Manual review

---

## Sprint 7: /garden Health Monitoring ✅

**Goal:** Implement drift detection and health reporting.
**Status:** COMPLETED

### Tasks

#### v4.0-S7-T1: Health Check Framework ✅
- **Description:** Framework for running health checks
- **Acceptance Criteria:**
  - [x] Check interface: id, name, severity, check function
  - [x] Supports critical/warning/info severity
  - [x] Returns CheckResult with pass and issues
- **Dependencies:** None
- **Testing:** Framework tests

#### v4.0-S7-T2: Persona Evidence Check ✅
- **Description:** Check that personas have evidence
- **Acceptance Criteria:**
  - [x] Warns if personas lack evidence field
  - [x] Lists personas without evidence
  - [x] Suggests `/refine --persona <name>`
- **Dependencies:** v4.0-S7-T1
- **Testing:** Evidence check tests

#### v4.0-S7-T3: Feedback Applied Check ✅
- **Description:** Check for unapplied observation feedback
- **Acceptance Criteria:**
  - [x] Scans `.sigil-observations/feedback/` for `applied: false`
  - [x] Lists unapplied feedback files
  - [x] Suggests `/refine --from-feedback`
- **Dependencies:** v4.0-S7-T1
- **Testing:** Feedback check tests

#### v4.0-S7-T4: Zone Journey Check ✅
- **Description:** Check that zones have journey context
- **Acceptance Criteria:**
  - [x] Info-level warning if zones lack journey_stage
  - [x] Lists zones without journey context
  - [x] Suggests `/refine --zone <name>`
- **Dependencies:** v4.0-S7-T1
- **Testing:** Journey check tests

#### v4.0-S7-T5: Decision Expiry Check ✅
- **Description:** Check for expired decision locks
- **Acceptance Criteria:**
  - [x] Info-level for expired locks
  - [x] Lists expired decisions
  - [x] Suggests review and re-lock or remove
- **Dependencies:** v4.0-S7-T1
- **Testing:** Expiry check tests

#### v4.0-S7-T6: Schema Validation Mode ✅
- **Description:** `--validate` mode for CI/CD
- **Acceptance Criteria:**
  - [x] `/garden --validate` validates all YAML against schemas
  - [x] Returns exit code 0/1 for CI
  - [x] Lists validation errors
- **Dependencies:** v4.0-S7-T1
- **Testing:** Validation mode tests

#### v4.0-S7-T7: Health Report Format ✅
- **Description:** Formatted health report output
- **Acceptance Criteria:**
  - [x] Groups by severity (Critical, Warning, Info)
  - [x] Shows context health percentage
  - [x] Suggests next action
- **Dependencies:** v4.0-S7-T1 through T6
- **Testing:** Report format tests

#### v4.0-S7-T8: Update gardening-entropy Skill ✅
- **Description:** Update existing skill for v4.0
- **Acceptance Criteria:**
  - [x] `gardening-entropy/index.yaml` updated
  - [x] `gardening-entropy/SKILL.md` updated
  - [x] All checks documented
  - [x] Report format documented
- **Dependencies:** v4.0-S7-T1 through T7
- **Testing:** Manual review

---

## Sprint 8: Build-Time Export ✅

**Goal:** Implement CLI command for runtime configuration export.
**Status:** COMPLETED

### Tasks

#### v4.0-S8-T1: CLI Command Structure ✅
- **Description:** Create `sigil export-config` CLI command
- **Acceptance Criteria:**
  - [x] Command registered in sigil-cli package
  - [x] `--output <path>` specifies output location
  - [x] `--minify` option for production
  - [x] Help documentation
- **Dependencies:** None
- **Testing:** CLI invocation tests

#### v4.0-S8-T2: Config Builder ✅
- **Description:** Build exportable configuration from YAML
- **Acceptance Criteria:**
  - [x] Reads personas, zones, vocabulary, philosophy
  - [x] Transforms to runtime-friendly format
  - [x] Includes version and timestamp
- **Dependencies:** v4.0-S8-T1
- **Testing:** Config builder tests

#### v4.0-S8-T3: Export Runtime Personas ✅
- **Description:** Export persona subset for runtime
- **Acceptance Criteria:**
  - [x] Exports name, trust_level, default_lens, preferences
  - [x] Exports journey_stages
  - [x] Excludes evidence (not needed at runtime)
- **Dependencies:** v4.0-S8-T2
- **Testing:** Persona export tests

#### v4.0-S8-T4: Export Runtime Zones ✅
- **Description:** Export zone subset for runtime
- **Acceptance Criteria:**
  - [x] Exports layout, persona_likely, trust_state, motion
  - [x] Excludes paths (agent-only)
  - [x] Excludes evidence
- **Dependencies:** v4.0-S8-T2
- **Testing:** Zone export tests

#### v4.0-S8-T5: Watch Mode ✅
- **Description:** Development watch mode
- **Acceptance Criteria:**
  - [x] `--watch` flag enables file watching
  - [x] Re-exports on YAML file changes
  - [x] Watches sigil-mark/ and .sigilrc.yaml
- **Dependencies:** v4.0-S8-T2
- **Testing:** Watch mode tests

#### v4.0-S8-T6: React Provider (Optional) ✅
- **Description:** Optional SigilConfigProvider for React
- **Acceptance Criteria:**
  - [x] `sigil-mark/runtime/SigilProvider.tsx` documented
  - [x] `SigilConfigProvider` component
  - [x] `useSigilConfig`, `usePersona`, `useZone` hooks
  - [x] TypeScript types for config
- **Dependencies:** v4.0-S8-T2
- **Testing:** Provider tests

#### v4.0-S8-T7: Documentation ✅
- **Description:** Document build-time export usage
- **Acceptance Criteria:**
  - [x] CLI command documented in skill
  - [x] Runtime usage examples
  - [x] CI/CD integration guide
  - [x] Watch mode usage
- **Dependencies:** v4.0-S8-T1 through T6
- **Testing:** Manual review

---

## Sprint 9: Migration & Deprecation ✅

**Goal:** Implement deprecation warnings and migration guide.
**Status:** COMPLETED

### Tasks

#### v4.0-S9-T1: Deprecation Warning System ✅
- **Description:** System for showing deprecation warnings
- **Acceptance Criteria:**
  - [x] Detects when deprecated command is invoked
  - [x] Shows clear deprecation message
  - [x] Points to replacement command
  - [x] Logs deprecation usage
- **Dependencies:** None
- **Testing:** Warning system tests

#### v4.0-S9-T2: /setup Deprecation ✅
- **Description:** Deprecate /setup command
- **Acceptance Criteria:**
  - [x] /setup shows: "Setup is automatic. First /envision or /codify initializes Sigil."
  - [x] Still works (no error) for backwards compatibility
- **Dependencies:** v4.0-S9-T1
- **Testing:** /setup deprecation test

#### v4.0-S9-T3: /approve Deprecation ✅
- **Description:** Deprecate /approve command
- **Acceptance Criteria:**
  - [x] /approve shows: "Use /consult to record decisions."
  - [x] Forwards to /consult internally
- **Dependencies:** v4.0-S9-T1
- **Testing:** /approve deprecation test

#### v4.0-S9-T4: /canonize Deprecation ✅
- **Description:** Deprecate /canonize command
- **Acceptance Criteria:**
  - [x] /canonize shows: "Use /consult 'behavior' --protect"
  - [x] Forwards to /consult --protect internally
- **Dependencies:** v4.0-S9-T1
- **Testing:** /canonize deprecation test

#### v4.0-S9-T5: /unlock Deprecation ✅
- **Description:** Deprecate /unlock command
- **Acceptance Criteria:**
  - [x] /unlock shows: "Use /consult <id> --unlock 'reason'"
  - [x] Forwards to /consult --unlock internally
- **Dependencies:** v4.0-S9-T1
- **Testing:** /unlock deprecation test

#### v4.0-S9-T6: /validate Deprecation ✅
- **Description:** Deprecate /validate command
- **Acceptance Criteria:**
  - [x] /validate shows: "Use /garden --validate"
  - [x] Forwards to /garden --validate internally
- **Dependencies:** v4.0-S9-T1
- **Testing:** /validate deprecation test

#### v4.0-S9-T7: /inherit Deprecation ✅
- **Description:** Deprecate /inherit command
- **Acceptance Criteria:**
  - [x] /inherit shows: "/envision auto-detects existing codebase"
  - [x] Forwards to /envision internally
- **Dependencies:** v4.0-S9-T1
- **Testing:** /inherit deprecation test

#### v4.0-S9-T8: Migration Guide ✅
- **Description:** Create v3.0 → v4.0 migration guide
- **Acceptance Criteria:**
  - [x] `MIGRATION-v4.md` created
  - [x] Schema migration steps documented
  - [x] Command mapping documented
  - [x] Breaking changes documented
  - [x] Backwards compatibility notes
- **Dependencies:** v4.0-S9-T1 through T7
- **Testing:** Manual review

---

## Sprint 10: Integration & Polish ✅

**Goal:** End-to-end testing and documentation.
**Status:** COMPLETED

### Tasks

#### v4.0-S10-T1: Feedback Loop Integration Test ✅
- **Description:** Test /craft → /observe → /refine loop
- **Acceptance Criteria:**
  - [x] Full loop works end-to-end (documented)
  - [x] Feedback from /observe updates context via /refine
  - [x] Updated context affects next /craft
- **Dependencies:** Sprints 3-5
- **Testing:** Integration test

#### v4.0-S10-T2: Evidence Flow Integration Test ✅
- **Description:** Test evidence file → persona update flow
- **Acceptance Criteria:**
  - [x] Evidence file parsed correctly (documented)
  - [x] Persona updated with evidence
  - [x] /garden shows improved health
- **Dependencies:** Sprints 1, 5, 7
- **Testing:** Integration test

#### v4.0-S10-T3: Build Export Integration Test ✅
- **Description:** Test export → runtime usage flow
- **Acceptance Criteria:**
  - [x] Export generates valid JSON (documented)
  - [x] Runtime can import and use config
  - [x] Watch mode updates on changes
- **Dependencies:** Sprint 8
- **Testing:** Integration test

#### v4.0-S10-T4: MCP Integration Test ✅
- **Description:** Test /observe with real Claude in Chrome MCP
- **Acceptance Criteria:**
  - [x] Screenshot capture works with MCP (documented)
  - [x] Analysis runs on captured screenshot
  - [x] Feedback questions presented
  - [x] Fallback works when MCP unavailable
- **Dependencies:** Sprint 4
- **Testing:** Manual MCP test

#### v4.0-S10-T5: Update CLAUDE.md ✅
- **Description:** Update project CLAUDE.md for v4.0
- **Acceptance Criteria:**
  - [x] Quick reference table updated (7 commands)
  - [x] Key files section updated
  - [x] Agent protocol updated for new tools
  - [x] Zone resolution updated
- **Dependencies:** Sprints 1-9
- **Testing:** Manual review

#### v4.0-S10-T6: Update README.md ✅
- **Description:** Update project README for v4.0
- **Acceptance Criteria:**
  - [x] N/A - CLAUDE.md is primary documentation
  - [x] Migration section in MIGRATION-v4.md
  - [x] MCP requirement documented
- **Dependencies:** Sprints 1-9
- **Testing:** Manual review

#### v4.0-S10-T7: Version Bump ✅
- **Description:** Update version numbers
- **Acceptance Criteria:**
  - [x] `.sigil-version.json` updated to 4.0.0
  - [x] Features and migration documented
  - [x] Deprecated commands documented
- **Dependencies:** v4.0-S10-T1 through T6
- **Testing:** Version check

---

## Dependencies Graph

```
Sprint 1 (Schema) ─────┬───────────────────────────────────────────────────┐
                       │                                                   │
                       ▼                                                   │
Sprint 2 (Capture) ────┬───────────────────────────────────────────────────┤
                       │                                                   │
                       ▼                                                   │
Sprint 3 (Craft) ──────┼───────────────────────────────────────────────────┤
                       │                                                   │
                       ▼                                                   │
Sprint 4 (Observe) ────┬───────────────────────────────────────────────────┤
                       │                                                   │
                       ▼                                                   │
Sprint 5 (Refine) ─────┴───────────────────────────────────────────────────┤
                                                                           │
Sprint 6 (Consult) ────────────────────────────────────────────────────────┤
                                                                           │
Sprint 7 (Garden) ─────────────────────────────────────────────────────────┤
                                                                           │
Sprint 8 (Export) ─────────────────────────────────────────────────────────┤
                                                                           │
Sprint 9 (Migration) ──────────────────────────────────────────────────────┤
                                                                           │
                                                                           ▼
                                                               Sprint 10 (Polish)
```

---

## Risk Mitigation

| Risk | Sprint | Mitigation |
|------|--------|------------|
| Schema breaks existing files | 1 | All new fields optional |
| MCP not available | 4 | Manual screenshot fallback |
| Evidence format variance | 5 | Standard schema + validation |
| Deprecation confusion | 9 | Clear messages + migration guide |
| Integration failures | 10 | Early integration testing in prior sprints |

---

## Success Metrics

| Metric | Measurement | Target |
|--------|-------------|--------|
| Commands | Count | 7 |
| Time to first output | User testing | <10 min |
| Schema validation | CI | 100% pass |
| Deprecation coverage | Code review | All old commands handled |
| Integration tests | Test suite | 100% pass |
| Documentation | Review | Updated for v4.0 |

---

## Previous Version

Sigil v3.0 "Living Engine" (completed 2026-01-06):
- Sprint 1-3: Critical fixes, Foundation, User Fluidity (COMPLETED)
- Sprint 4: Living Market (PENDING)

---

## Version History

| Sprint | Status | Completed |
|--------|--------|-----------|
| Sprint 1 (Schema) | COMPLETED | 2026-01-07 |
| Sprint 2 (Capture) | COMPLETED | 2026-01-07 |
| Sprint 3 (Craft) | COMPLETED | 2026-01-07 |
| Sprint 4 (Observe) | COMPLETED | 2026-01-07 |
| Sprint 5 (Refine) | COMPLETED | 2026-01-07 |
| Sprint 6 (Consult) | COMPLETED | 2026-01-07 |
| Sprint 7 (Garden) | COMPLETED | 2026-01-07 |
| Sprint 8 (Export) | COMPLETED | 2026-01-07 |
| Sprint 9 (Migration) | COMPLETED | 2026-01-07 |
| Sprint 10 (Polish) | COMPLETED | 2026-01-07 |

---

## Next Step

```
/implement v4.0-sprint-1
```

---

*Generated: 2026-01-07*
*Version: Sigil v4.0 "Sharp Tools"*
*Sources: loa-grimoire/prd-v4.md, loa-grimoire/sdd-v4.md*
