# Sigil v4.0 PRD — "Sharp Tools"

**Version:** 4.0.0
**Codename:** Sharp Tools
**Status:** RFC
**Date:** 2026-01-07

> *"Each tool does one thing. Does it extremely well. No apologies."*

---

## Executive Summary

Sigil v4.0 transforms from a design context framework into a **Reality Refinement Layer** with a simplified, tool-centric interface. The core insight: each command should behave like an artist's tool—predictable, bounded, and confident in its purpose.

### Key Changes from v3.x

| Area | v3.x | v4.0 |
|------|------|------|
| Commands | 37 (overwhelming) | 7 tools (focused) |
| Interaction | One-shot, no questions | Progressive disclosure, ask only for ambiguity |
| Personas | Generic archetypes | Product-specific with evidence |
| Context evolution | Re-run /envision | Incremental /refine |
| Visual feedback | None | /observe via Claude in Chrome MCP |
| Runtime access | Broken ProcessContext | Build-time export to JSON |

---

## 1. Problem Statement

### 1.1 What v3.0 Achieved

- Fixed fatal runtime bug (fs in browser)
- Separated agent-time from runtime
- Added Vocabulary layer for term → feel mapping
- Added Philosophy layer for conflict resolution
- Renamed Lens → Persona (terminology clarity)

### 1.2 What's Still Broken

**1. Command Overload**
37 commands overwhelm new users. Most are never used. No clear path through the system.

**2. No Interaction Model**
/craft is one-shot. No AskUserQuestion integration. No gap detection. No refinement loop.

**3. Generic Personas**
"power_user" and "newcomer" don't reflect actual users. No mechanism to capture product-specific personas with evidence.

**4. Static Context**
/envision captures once. No incremental refinement. Context goes stale.

**5. No Visual Feedback Loop**
Agent generates code but can't verify output matches intent. No bridge between visual reality and structured analysis.

**6. No Runtime Interface**
Process layer is agent-only (correct), but no mechanism for runtime to access context. Build-time export missing.

### 1.3 Success Criteria

| Metric | v3.x Baseline | v4.0 Target |
|--------|---------------|-------------|
| Commands to learn | 37 | 7 |
| Time to first useful output | ~30 min | ~10 min |
| Questions per /craft | 0 | 0-2 (only when ambiguous) |
| Persona evidence coverage | 0% | 80%+ |
| Context staleness (90 days) | Common | Rare (via /refine) |
| Visual feedback loop | None | /observe integrated |

---

## 2. Vision & Mission

### 2.1 The Tool Philosophy

Each command is a **tool** with distinct physics:

```
┌─────────────────────────────────────────────────────────────────┐
│                     TOOL PROPERTIES                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   MATERIAL    — What it works with                              │
│   ACTION      — What it does (one thing, extremely well)        │
│   OUTPUT      — What you get (predictable, consistent)          │
│   GRIP        — How you hold it (progressive disclosure)        │
│                                                                 │
│   A crayon doesn't try to be a marker.                          │
│   A marker doesn't apologize for being bold.                    │
│   Each tool is confident in what it is.                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Design Principles

1. **Discrete Commands** — Each tool does ONE thing. No entangled flows.
2. **Proceed by Default** — If intent is clear, proceed. Ask only when ambiguous.
3. **Evidence Over Assumption** — Personas cite evidence. Zones cite journey stages.
4. **Artifacts Are Truth** — Commands read/write files. Files are source of truth.
5. **Graceful Degradation** — Missing context triggers suggestions, not errors.

### 2.3 The Craftsman's Expectation

| Expectation | Meaning |
|-------------|---------|
| **Predictable** | Same input → same behavior |
| **Honest** | Does what it says, nothing hidden |
| **Bounded** | Clear limits, no scope creep |
| **Respectful** | Doesn't second-guess the craftsman |

---

## 3. The Seven Tools

### 3.1 Tool Overview

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

### 3.2 Tool Identity Matrix

| Tool | Material | Action | Output |
|------|----------|--------|--------|
| `/envision` | Conversation | Extract soul | moodboard, personas, philosophy |
| `/codify` | Design decisions | Carve rules | rules.md, zones |
| `/craft` | Intent + context | Shape code | Implementation |
| `/observe` | Visual + structured | Compare & bridge | Feedback request |
| `/refine` | Evidence | Sharpen context | Updated personas/zones |
| `/consult` | Decision | Stamp record | Decision file |
| `/garden` | All context | Detect drift | Health report |

### 3.3 Consolidated Commands

| Old Command | Disposition |
|-------------|-------------|
| `/setup` | Merged into first run of any command |
| `/approve` | Simplified to `/consult` |
| `/inherit` | Merged into `/envision` (detects existing code) |
| `/canonize` | Merged into `/consult --protect` |
| `/unlock` | Merged into `/consult --unlock` |
| `/update` | Handled by package manager |
| `/validate` | Merged into `/garden --validate` |

---

## 4. Functional Requirements

### FR-1: Progressive Disclosure (P0)

**Problem:** Commands are either too simple (no customization) or too complex (overwhelming flags).

**Solution:** Every tool has three grip levels:

```
L1 (Just Works)       L2 (Guided Control)      L3 (Full Control)
────────────────      ───────────────────      ─────────────────
Zero configuration    Key parameters exposed   All flags available
Sensible defaults     Common customizations    Expert options
Minimal output        Helpful feedback         Verbose output

/craft "button"       /craft "button"          /craft "button"
                      --zone critical          --zone critical
                                               --persona depositor
                                               --lens strict
                                               --no-gaps
```

**Acceptance Criteria:**
- [ ] Each of 7 tools has L1/L2/L3 documented
- [ ] L1 works with zero arguments
- [ ] L2 options discoverable via suggestions
- [ ] L3 flags documented in --help

---

### FR-2: The /observe Communication Layer (P0)

**Problem:** Agent generates code but can't verify visual output matches intent. No bridge between agent perception and human judgment.

**Solution:** /observe uses Claude in Chrome MCP to capture visual state, analyze against structured context, and request human feedback.

**Flow:**
```
1. CAPTURE     — Screenshot current screen via MCP
2. ANALYZE     — Compare visual to moodboard, rules, personas
3. REPORT      — Structural checks (agent can verify)
               — Measurable deltas (agent can compare)
               — Subjective questions (human must judge)
4. FEEDBACK    — Human answers taste questions
               — Feedback recorded to context
               — Future /craft uses this feedback
```

**Output Format:**
```
═══════════════════════════════════════════════════════════════
                     OBSERVATION: ClaimButton
═══════════════════════════════════════════════════════════════

VISUAL CAPTURE
[Screenshot via Claude in Chrome MCP]

STRUCTURAL ANALYSIS (Agent can verify)
───────────────────────────────────────────────────────────────
✓ CriticalZone wrapper present
✓ StrictLens components used
✓ 2-step confirmation flow

MEASURABLE PROPERTIES (Agent can compare)
───────────────────────────────────────────────────────────────
Property          Actual    Expected    Status
─────────────────────────────────────────────────
Border radius     8px       4px         ⚠ DELTA
Animation         400ms     800ms       ⚠ DELTA

FEEDBACK REQUESTED (Human must judge)
───────────────────────────────────────────────────────────────
1. Border radius is 8px (rules say 4px). Intentional?
   [ ] Yes — update rules to allow 8px
   [ ] No — fix the component

2. Animation is 400ms (rules say 800ms). Intentional?
   [ ] Yes — this action should feel faster
   [ ] No — fix the component
```

**Requirements:**
- Claude in Chrome MCP extension installed
- Browser with target UI visible

**Acceptance Criteria:**
- [ ] /observe captures screenshot via MCP
- [ ] Structural analysis compares to zone expectations
- [ ] Measurable properties compared to rules.md
- [ ] Subjective questions presented to human
- [ ] Feedback captured to `.sigil-observations/`
- [ ] Feedback applied to context on next /refine

---

### FR-3: The /refine Tool (P1)

**Problem:** Context is static. /envision captures once, then goes stale. No incremental updates.

**Solution:** /refine updates personas and zones with evidence.

**Arguments:**
```bash
/refine                        # Interactive mode
/refine --persona depositor    # Update specific persona
/refine --persona new_persona  # Create new persona
/refine --zone claim_moment    # Update specific zone
/refine --evidence analytics.yaml  # Add evidence from file
```

**New Persona Interview:**
```
Creating persona: depositor

1. Description (one sentence):
   > "Existing Henlo depositors familiar with PoL mechanics"

2. Evidence sources:
   □ Analytics ("2,993 depositors, 3.2 tx/month avg")
   □ GTM positioning
   □ User interviews
   □ Behavioral observation

3. Characteristics:
   Trust level:    [high] — already deposited funds
   Input method:   [mixed] — 60% desktop, 40% mobile
   Reading level:  [intermediate] — knows crypto, knows THJ

4. Journey stages (which zones?):
   □ active_depositor
   □ claim_moment
```

**Acceptance Criteria:**
- [ ] /refine --persona creates new persona with evidence
- [ ] /refine --zone creates new zone with journey stage
- [ ] Evidence field populated with citations
- [ ] Existing personas/zones updated incrementally
- [ ] last_refined timestamp updated

---

### FR-4: Product-Specific Personas with Evidence (P1)

**Problem:** Generic personas (power_user, newcomer) don't reflect actual users.

**Solution:** Personas have `source` and `evidence` fields.

**Schema:**
```yaml
personas:
  henlocker:
    name: "Henlocker"
    description: "Existing depositor with high trust"

    # v4.0: Evidence-based
    source: gtm  # generic | analytics | gtm | interview | observation
    evidence:
      - "2,993 depositors in Henlo product"
      - "Average 3.2 transactions/month"
      - "60% desktop, 40% mobile"

    # Characteristics
    trust_level: high
    input_method: mixed
    reading_level: intermediate

    # Journey context
    journey_stages:
      - active_depositor
      - claim_moment

    # Metadata
    last_refined: 2026-01-07
```

**Acceptance Criteria:**
- [ ] Persona schema includes source, evidence, journey_stages
- [ ] /envision asks for product-specific users, not archetypes
- [ ] /garden warns when personas lack evidence
- [ ] 80% of personas have evidence after 30 days

---

### FR-5: Journey-Based Zones (P1)

**Problem:** Zones are code location (file paths), not user journey stages.

**Solution:** Zones include journey_stage, persona_likely, trust_state.

**Schema:**
```yaml
zones:
  claim_moment:
    # Paths (for agent file detection)
    paths:
      - "src/features/claim/**"

    # Layout & Physics
    layout: CriticalZone
    time_authority: server-tick
    motion: deliberate

    # v4.0: Journey context
    journey_stage: "claiming_rewards"
    persona_likely: henlocker
    trust_state: critical  # building | established | critical

    # v4.0: Evidence
    evidence:
      - "73% complete claims in <30s"
      - "40% of claims from mobile"
```

**Acceptance Criteria:**
- [ ] Zone schema includes journey_stage, persona_likely, trust_state
- [ ] /craft surfaces journey context in output
- [ ] /refine --zone creates zone with journey context

---

### FR-6: Build-Time Export for Runtime (P2)

**Problem:** Process layer is agent-only (correct), but runtime has no access to context.

**Solution:** CLI command exports YAML to JSON for runtime import.

**Command:**
```bash
npx sigil export-config --output src/sigil-config.json
npx sigil export-config --watch  # Development mode
```

**Output Schema:**
```json
{
  "version": "4.0.0",
  "exported_at": "2026-01-07T12:00:00Z",

  "personas": {
    "henlocker": {
      "name": "Henlocker",
      "trust_level": "high",
      "default_lens": "default"
    }
  },

  "zones": {
    "critical": {
      "layout": "CriticalZone",
      "persona_likely": "henlocker",
      "trust_state": "critical"
    }
  },

  "vocabulary": {
    "vault": {
      "material": "fortress",
      "motion": "deliberate"
    }
  }
}
```

**Runtime Usage:**
```tsx
import config from './sigil-config.json';

const persona = config.personas[currentUser.type];
const zone = config.zones.critical;
```

**Acceptance Criteria:**
- [ ] `sigil export-config` CLI command implemented
- [ ] JSON schema matches TypeScript types
- [ ] Watch mode for development
- [ ] Optional SigilConfigProvider for React

---

### FR-7: Interaction Model — When to Ask (P0)

**Problem:** No consistent model for when tools ask questions vs proceed.

**Solution:** Explicit decision framework.

```
ASK (via AskUserQuestion):
────────────────────────────
✓ Multiple valid approaches with DIFFERENT tradeoffs
✓ Missing CRITICAL information (cannot proceed)
✓ Taste decision (agent MUST NOT decide)
✓ Destructive action (replace vs update)

PROCEED (without asking):
─────────────────────────
✓ User provided clear intent
✓ Only one reasonable interpretation
✓ Context files provide needed info
✓ Defaults are sensible AND documented

NEVER ASK:
──────────
✗ Confirmation of obvious actions
✗ Permission to proceed with stated intent
✗ Equivalent choices (no meaningful tradeoff)
✗ "Are you sure?" interruptions
```

**Acceptance Criteria:**
- [ ] Each tool documents when it asks vs proceeds
- [ ] /craft uses AskUserQuestion only for tradeoffs
- [ ] No "are you sure?" style confirmations

---

### FR-8: Gap Surfacing at End (P1)

**Problem:** Gap detection could interrupt flow.

**Solution:** Gaps surfaced at END of output as suggestions, never inline.

**Format:**
```
═══════════════════════════════════════════════════════════════
                     IMPLEMENTATION
═══════════════════════════════════════════════════════════════

[Full implementation code here]

═══════════════════════════════════════════════════════════════
                     GAPS DETECTED
═══════════════════════════════════════════════════════════════

Context gaps that may affect future /craft calls:

1. PERSONA GAP
   You mentioned "depositor" but no persona with that ID exists.
   → /refine --persona depositor

2. ZONE GAP
   "claim_moment" isn't a defined zone.
   → /refine --zone claim_moment

These are SUGGESTIONS. The implementation above is complete.
```

**Acceptance Criteria:**
- [ ] Gaps surfaced at end of /craft output
- [ ] Gaps are suggestions, not blockers
- [ ] Each gap includes /refine command to fix

---

## 5. Non-Functional Requirements

### NFR-1: Claude in Chrome MCP Requirement

/observe requires the Claude in Chrome MCP extension. Graceful fallback for users without MCP:
- Manual screenshot upload option
- Clear error message pointing to MCP installation

### NFR-2: Backwards Compatibility

v3.x code should work with v4.0:
- Old imports work with deprecation warnings
- Old file locations work with warnings
- Migration guide provided

### NFR-3: Evidence Formats

Agent-readable evidence formats:
- YAML (structured analytics)
- JSON (API exports)
- Markdown (interview notes, with structured frontmatter)

### NFR-4: Performance

- /craft responds in <2 seconds for L1
- /observe captures screenshot in <1 second
- Export generates JSON in <500ms

---

## 6. User Stories

### US-1: New Project Setup

**As a** developer starting a new project
**I want** to capture my product's soul quickly
**So that** every generated component reflects my intent

**Flow:**
```
/envision           # 10-minute interview
/codify             # Define rules
/craft "button"     # First component with full context
```

**Acceptance Criteria:**
- [ ] /envision completes in <15 minutes
- [ ] /craft uses captured context immediately
- [ ] No setup command required

---

### US-2: Visual Verification

**As a** designer reviewing generated UI
**I want** to verify implementation matches intent
**So that** I can provide targeted feedback

**Flow:**
```
/craft "claim button"     # Generate component
# View in browser
/observe                   # Capture visual state
# Answer feedback questions
/refine --from feedback    # Update context
```

**Acceptance Criteria:**
- [ ] /observe captures current screen
- [ ] Feedback questions are specific and actionable
- [ ] Feedback updates context for next /craft

---

### US-3: Incremental Refinement

**As a** product manager with new analytics
**I want** to update personas with evidence
**So that** design decisions reflect real user data

**Flow:**
```
# Export analytics to YAML
/refine --persona henlocker --evidence analytics.yaml
```

**Acceptance Criteria:**
- [ ] Analytics parsed and added as evidence
- [ ] Persona description updated if needed
- [ ] last_refined timestamp updated

---

### US-4: Progressive Mastery

**As a** developer new to Sigil
**I want** to start simple and learn more over time
**So that** I'm not overwhelmed

**Flow:**
```
# Week 1: L1 only
/craft "button"

# Week 2: Discover L2
/craft "button" --zone critical

# Week 3: Full control
/craft "button" --zone critical --persona power_user --lens strict
```

**Acceptance Criteria:**
- [ ] L1 works with zero arguments
- [ ] L2 discoverable via output suggestions
- [ ] L3 documented but not required

---

## 7. Technical Architecture

### 7.1 Tool Execution Model

```
┌─────────────────────────────────────────────────────────────────┐
│                     TOOL EXECUTION                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   USER INPUT                                                    │
│       │                                                         │
│       ▼                                                         │
│   ┌─────────────┐                                               │
│   │ Parse Args  │ Determine L1/L2/L3 from flags                 │
│   └──────┬──────┘                                               │
│          │                                                      │
│          ▼                                                      │
│   ┌─────────────┐                                               │
│   │Load Context │ Read YAML files (graceful if missing)         │
│   └──────┬──────┘                                               │
│          │                                                      │
│          ▼                                                      │
│   ┌─────────────┐                                               │
│   │ Check Locks │ Any decisions that conflict?                  │
│   └──────┬──────┘                                               │
│          │                                                      │
│          ▼                                                      │
│   ┌─────────────┐                                               │
│   │  Execute    │ Tool-specific action                          │
│   └──────┬──────┘                                               │
│          │                                                      │
│          ▼                                                      │
│   ┌─────────────┐                                               │
│   │Detect Gaps  │ Surface at end as suggestions                 │
│   └──────┬──────┘                                               │
│          │                                                      │
│          ▼                                                      │
│   OUTPUT (structured)                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Feedback Loop

```
/craft → Implementation
           │
           ▼
       /observe → Visual capture + analysis
                       │
                       ▼
                  HUMAN FEEDBACK
                       │
                       ▼
                  /refine → Context updated
                       │
                       └────────────────┐
                                        │
                                        ▼
                                   /craft (with updated context)
```

### 7.3 File Structure (v4.0)

```
sigil-mark/
├── moodboard.md                # Product feel
├── moodboard/                  # Rich inspiration
├── rules.md                    # Design tokens
├── personas/
│   └── personas.yaml           # v4.0: with evidence
├── vocabulary/
│   └── vocabulary.yaml
├── soul-binder/
│   ├── philosophy.yaml
│   └── canon-of-flaws.yaml
├── consultation-chamber/
│   └── decisions/
├── evidence/                   # v4.0: NEW
│   └── analytics-*.yaml        # Structured evidence files
└── .sigil-observations/        # v4.0: NEW
    ├── screenshots/
    └── feedback/

.sigilrc.yaml                   # v4.0: with journey context
sigil-config.json               # v4.0: build-time export
```

---

## 8. Migration Path

### 8.1 From v3.x to v4.0

```
PHASE 1: Schema Updates (Non-Breaking)
──────────────────────────────────────
• Add evidence, journey_stages to personas.yaml
• Add journey_stage, persona_likely, trust_state to zones
• Old schemas still work

PHASE 2: Command Consolidation
──────────────────────────────
• Deprecate old commands with clear messages
• Add /observe and /refine
• Add progressive disclosure to all tools

PHASE 3: Build-Time Export
──────────────────────────
• Add sigil export-config CLI
• Document runtime usage
• Remove ProcessContextProvider (was already broken)

PHASE 4: MCP Integration
────────────────────────
• /observe integrates with Claude in Chrome MCP
• Fallback for manual screenshots
• Feedback capture system
```

### 8.2 Deprecation Warnings

```
/setup
  → "Setup is automatic. First /envision or /codify initializes Sigil."

/approve
  → "Use /consult to record decisions."

/canonize "behavior"
  → "Use /consult 'behavior' --protect"

/unlock DEC-001
  → "Use /consult DEC-001 --unlock 'reason'"

/validate
  → "Use /garden --validate"
```

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| MCP not installed | /observe fails | Clear error, manual screenshot fallback |
| Evidence format variance | /refine can't parse | Standard YAML schema, validation |
| Command count reduction | Users miss old commands | Clear deprecation messages, migration guide |
| Feedback not applied | Context stays stale | /garden warns about unapplied feedback |
| Build export forgotten | Runtime has no context | CI/CD integration, pre-commit hook option |

---

## 10. Out of Scope (v4.0)

| Feature | Reason | Future Version |
|---------|--------|----------------|
| Real-time persona detection (ML) | Complex infrastructure | v5.0 |
| Visual editor for personas | Nice-to-have | v4.1 |
| Automatic MCP install | Platform dependency | v4.1 |
| Multi-product vocabulary sharing | Enterprise feature | v5.0 |
| A/B testing integration | Requires analytics | v4.2 |

---

## 11. Success Metrics

| Metric | Measurement | Target |
|--------|-------------|--------|
| Commands to learn | Documentation | 7 |
| Time to first output | User testing | <10 min |
| Persona evidence coverage | Audit personas.yaml | 80% |
| /observe usage | Telemetry | 50% of /craft calls followed by /observe |
| Feedback application rate | Audit feedback/ | 90% within 7 days |
| /garden findings per month | Report | <5 critical |

---

## 12. Open Questions

### For Feedback

**Q1: Is 7 tools the right count?**
Could /observe be optional? Should /garden absorb /validate?

**Q2: MCP Requirement**
Hard requirement for /observe, or fallback to manual screenshots?

**Q3: Evidence Strictness**
Should personas without evidence trigger warnings? Or is evidence optional?

**Q4: Naming**
Is "/observe" the right name? Alternatives: /sense, /witness, /compare

**Q5: Build Export Automation**
Should export run automatically on YAML changes? Or manual only?

---

## Summary

Sigil v4.0 simplifies the interface while deepening the capability:

| Before (v3.x) | After (v4.0) |
|---------------|--------------|
| 37 commands | 7 discrete tools |
| Generic archetypes | Product-specific personas with evidence |
| One-time capture | Incremental /refine |
| No visual verification | /observe via MCP |
| Broken runtime | Build-time export |
| Ask too much or too little | Progressive disclosure L1/L2/L3 |

**The Mission:** Each tool does one thing. Does it extremely well. No apologies.

---

*PRD v4.0*
*Status: RFC — Ready for Feedback*
*Date: 2026-01-07*
*Sources: Session conversation, loa-grimoire/prd.md (v3.0), architecture-v4.1.md*
