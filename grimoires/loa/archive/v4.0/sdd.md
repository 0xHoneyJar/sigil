# Sigil v4.0 SDD — "Sharp Tools"

**Version:** 4.0.0
**Codename:** Sharp Tools
**Status:** RFC
**Date:** 2026-01-07

---

## Executive Summary

This Software Design Document describes the architecture for Sigil v4.0 "Sharp Tools." The key architectural changes are:

1. **Tool Consolidation** — 37 commands → 7 discrete tools
2. **Progressive Disclosure** — L1/L2/L3 grip levels for each tool
3. **Communication Layer** — /observe via Claude in Chrome MCP
4. **Incremental Refinement** — /refine updates context with evidence
5. **Evidence-Based Context** — Personas and zones cite evidence
6. **Build-Time Export** — CLI generates JSON for runtime access

### Architecture Philosophy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           TOOL LAYERS                                   │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    CAPTURE (Setup)                                │  │
│  │                    /envision, /codify                             │  │
│  │                    Extract soul, carve rules                      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                 │                                       │
│                                 ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    CREATION (Build)                               │  │
│  │                    /craft                                         │  │
│  │                    Shape code with context                        │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                 │                                       │
│                                 ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    OBSERVATION (See)                              │  │
│  │                    /observe                                       │  │
│  │                    Visual capture via MCP                         │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                 │                                       │
│                                 ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    REFINEMENT (Evolve)                            │  │
│  │                    /refine, /consult                              │  │
│  │                    Update context, lock decisions                 │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                 │                                       │
│                                 ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    MAINTENANCE (Tend)                             │  │
│  │                    /garden                                        │  │
│  │                    Detect drift, health report                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## System Architecture

### 1. Tool Overview

| Tool | Material | Action | Output |
|------|----------|--------|--------|
| `/envision` | Conversation | Extract soul | moodboard, personas, philosophy |
| `/codify` | Design decisions | Carve rules | rules.md, zones |
| `/craft` | Intent + context | Shape code | Implementation |
| `/observe` | Visual + structured | Compare & bridge | Feedback request |
| `/refine` | Evidence | Sharpen context | Updated personas/zones |
| `/consult` | Decision | Stamp record | Decision file |
| `/garden` | All context | Detect drift | Health report |

### 2. Layer Structure (Preserved from v3.0)

| Layer | Purpose | Execution Context |
|-------|---------|-------------------|
| **Process** | Design context (YAML) | Agent-only |
| **Core** | Physics hooks, state | Runtime |
| **Layout** | Zone primitives | Runtime |
| **Lens** | UI rendering variants | Runtime |

**Key Constraint:** Process layer uses Node.js fs. Never imports into browser.

---

## Component Design

### 1. The Seven Tools

#### 1.1 /envision — Soul Extraction

**Purpose:** Interview-driven capture of product soul.

**Progressive Disclosure:**
```
L1: /envision
    → Full interview: moodboard, personas, philosophy, references
    → Detects existing codebase automatically (inherits from /inherit)
    → Creates sigil-mark/ with all files

L2: /envision --quick
    → Minimal interview: just feel descriptors and key personas
    → Skips moodboard references

L3: /envision --from context/product-doc.md
    → Extracts from existing documentation
    → Fills gaps with targeted questions
```

**Output Files:**
- `sigil-mark/moodboard.md`
- `sigil-mark/moodboard/*.md` (reference products)
- `sigil-mark/personas/personas.yaml`
- `sigil-mark/soul-binder/philosophy.yaml`
- `.sigilrc.yaml` (initialized)

**When to Ask:**
- Product domain (if not detectable)
- Key personas (if no existing users)
- Feel descriptors (taste decision)
- Reference products (taste decision)

**When to Proceed:**
- Existing codebase detected
- Context files provided
- Clear domain from file names

---

#### 1.2 /codify — Rule Carving

**Purpose:** Define design tokens and zone rules.

**Progressive Disclosure:**
```
L1: /codify
    → Guided interview for colors, typography, spacing, motion
    → Creates rules.md with sensible structure

L2: /codify --zone claim_moment
    → Define single zone
    → Adds to .sigilrc.yaml

L3: /codify --from existing-design-system.json
    → Import from existing design system
    → Maps to Sigil schema
```

**Output Files:**
- `sigil-mark/rules.md`
- `sigil-mark/vocabulary/vocabulary.yaml`
- `.sigilrc.yaml` (zones section)

**When to Ask:**
- Color palette source (brand guidelines, existing system, or define new)
- Zone criticality (which paths are high-stakes)
- Motion preferences (by context)

**When to Proceed:**
- Design system file provided
- Previous /envision established feel

---

#### 1.3 /craft — Code Shaping

**Purpose:** Generate implementation with full context.

**Progressive Disclosure:**
```
L1: /craft "claim button"
    → Uses all detected context
    → Sensible defaults for zone/persona
    → Gaps surfaced at end (not blocking)

L2: /craft "claim button" --zone critical
    → Explicit zone context
    → Uses zone's persona_likely

L3: /craft "claim button" --zone critical --persona depositor --lens strict --no-gaps
    → Full control over all parameters
    → Suppress gap suggestions
```

**Execution Flow:**
```
                    ┌─────────────────┐
                    │   Parse Intent  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Load Context   │
                    │  (graceful)     │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
            Context exists?     No context?
                    │                 │
                    │                 ▼
                    │         Use sensible defaults
                    │         Note gap at end
                    │                 │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Check Decisions │
                    │ (conflicts?)    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    Generate     │
                    │ Implementation  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Surface Gaps   │
                    │  (at end)       │
                    └─────────────────┘
```

**Context Loading:**
```typescript
interface CraftContext {
  // From sigil-mark/
  moodboard?: Moodboard;
  rules?: Rules;
  personas?: PersonaArray;
  vocabulary?: Vocabulary;
  philosophy?: Philosophy;

  // From .sigilrc.yaml
  zones?: ZoneConfig[];

  // From decisions/
  activeDecisions?: Decision[];

  // Resolved for this request
  resolvedZone?: Zone;
  resolvedPersona?: Persona;
  resolvedLens?: string;
}
```

**Gap Detection:**
```typescript
interface Gap {
  type: 'persona' | 'zone' | 'vocabulary' | 'rule';
  mentioned: string;      // What was referenced
  exists: boolean;        // Whether it exists in context
  suggestion: string;     // /refine command to fix
}

// Example gaps:
// { type: 'persona', mentioned: 'depositor', exists: false,
//   suggestion: '/refine --persona depositor' }
```

---

#### 1.4 /observe — Visual Bridge (NEW)

**Purpose:** Bridge agent perception and human judgment via Claude in Chrome MCP.

**Progressive Disclosure:**
```
L1: /observe
    → Capture current screen via MCP
    → Compare to rules.md and zone expectations
    → Present feedback questions

L2: /observe --component ClaimButton
    → Focus on specific component
    → Compare to vocabulary term

L3: /observe --screenshot manual.png --rules border-radius,animation
    → Manual screenshot (if no MCP)
    → Check specific rules only
```

**Execution Flow:**
```
                    ┌─────────────────┐
                    │ Get MCP Context │
                    │ tabs_context    │
                    └────────┬────────┘
                             │
                             ▼
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
        MCP Available?              MCP Not Available?
              │                             │
              ▼                             ▼
        ┌─────────────┐            ┌─────────────────┐
        │  Screenshot │            │ Request Manual  │
        │  via MCP    │            │ Screenshot      │
        └──────┬──────┘            └────────┬────────┘
               │                            │
               └────────────┬───────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ Load Context    │
                   │ rules, zones    │
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ Structural      │
                   │ Analysis        │
                   │ (Agent verifies)│
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ Measurable      │
                   │ Properties      │
                   │ (Agent compares)│
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ Generate        │
                   │ Feedback        │
                   │ Questions       │
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ Present to      │
                   │ Human           │
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ Record Feedback │
                   │ to observations/│
                   └─────────────────┘
```

**MCP Integration:**
```typescript
// Tool calls used by /observe
interface ObserveMCPCalls {
  // Get tab context
  tabsContext: () => Promise<{ tabs: Tab[] }>;

  // Capture screenshot
  screenshot: (tabId: number) => Promise<{ imageId: string }>;

  // Read page structure (for structural analysis)
  readPage: (tabId: number) => Promise<AccessibilityTree>;

  // Find specific elements
  find: (tabId: number, query: string) => Promise<Element[]>;
}
```

**Analysis Types:**
```typescript
interface StructuralAnalysis {
  // Agent CAN verify these
  checks: Array<{
    check: string;          // "CriticalZone wrapper present"
    expected: boolean;
    actual: boolean;
    pass: boolean;
  }>;
}

interface MeasurableAnalysis {
  // Agent CAN compare these
  properties: Array<{
    property: string;       // "border-radius"
    expected: string;       // "4px"
    actual: string;         // "8px"
    delta: boolean;         // true = mismatch
  }>;
}

interface FeedbackQuestions {
  // Human MUST judge these
  questions: Array<{
    id: string;
    question: string;       // "Border radius is 8px (rules say 4px). Intentional?"
    options: string[];      // ["Yes — update rules", "No — fix component"]
    context: string;        // Why this matters
  }>;
}
```

**Output Storage:**
```
sigil-mark/.sigil-observations/
├── screenshots/
│   └── 2026-01-07-claim-button.png
└── feedback/
    └── 2026-01-07-claim-button.yaml
```

**Feedback Schema:**
```yaml
# .sigil-observations/feedback/2026-01-07-claim-button.yaml
observation_id: obs-2026-01-07-001
timestamp: 2026-01-07T12:00:00Z
component: ClaimButton
screenshot: screenshots/2026-01-07-claim-button.png

structural:
  - check: "CriticalZone wrapper"
    pass: true
  - check: "StrictLens components"
    pass: true

measurable:
  - property: border-radius
    expected: 4px
    actual: 8px
    delta: true

feedback:
  - question_id: q1
    question: "Border radius is 8px. Intentional?"
    answer: "yes_update_rules"
    comment: "8px feels better for this button size"

  - question_id: q2
    question: "Animation is 400ms. Intentional?"
    answer: "no_fix_component"

applied: false  # Set to true when /refine processes this
```

---

#### 1.5 /refine — Context Sharpening (NEW)

**Purpose:** Incrementally update context with evidence.

**Progressive Disclosure:**
```
L1: /refine
    → Interactive mode
    → Reviews unapplied feedback
    → Suggests updates

L2: /refine --persona depositor
    → Create/update specific persona
    → Interview for evidence

L3: /refine --persona depositor --evidence analytics.yaml
    → Update persona with evidence file
    → No interview needed
```

**Evidence Sources:**
```typescript
type EvidenceSource =
  | 'generic'      // No specific evidence (weak)
  | 'gtm'          // Go-to-market positioning
  | 'analytics'    // Quantitative data
  | 'interview'    // User research
  | 'observation'; // Behavioral observation

interface Evidence {
  source: EvidenceSource;
  citations: string[];     // Specific quotes/data points
  collected_at?: string;   // ISO timestamp
}
```

**Persona Update Flow:**
```
                    ┌─────────────────┐
                    │ Load Existing   │
                    │ Persona         │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
              Exists?          Doesn't exist?
                    │                 │
                    ▼                 ▼
              Update mode      Create mode
                    │                 │
                    └────────┬────────┘
                             │
                             ▼
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
        Evidence file?              No evidence file?
              │                             │
              ▼                             ▼
        Parse & merge              Interview for:
        evidence                   - Description
              │                    - Evidence source
              │                    - Characteristics
              │                    - Journey stages
              │                             │
              └────────────┬───────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Write personas  │
                  │ .yaml           │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Update          │
                  │ last_refined    │
                  └─────────────────┘
```

**Evidence File Schema:**
```yaml
# evidence/analytics-depositors-2026-01.yaml
source: analytics
collected_at: 2026-01-15
period: "2025-12-15 to 2026-01-15"

metrics:
  - key: total_depositors
    value: 2993
    label: "Total unique depositors"

  - key: avg_transactions
    value: 3.2
    label: "Average transactions per month"

  - key: device_split
    value:
      desktop: 0.60
      mobile: 0.40
    label: "Device distribution"

insights:
  - "60% desktop usage suggests keyboard-heavy interaction"
  - "3.2 tx/month indicates established habit, not exploration"
```

**Feedback Application:**
```typescript
async function applyFeedback(feedbackPath: string): Promise<void> {
  const feedback = await readFeedback(feedbackPath);

  for (const item of feedback.feedback) {
    if (item.answer === 'yes_update_rules') {
      // Update rules.md with new value
      await updateRule(item.property, item.actual);
    }
    // 'no_fix_component' doesn't update context
    // (component should be fixed instead)
  }

  // Mark feedback as applied
  await markFeedbackApplied(feedbackPath);
}
```

---

#### 1.6 /consult — Decision Stamping

**Purpose:** Record and lock decisions.

**Progressive Disclosure:**
```
L1: /consult "border-radius: 8px for critical buttons"
    → Records decision
    → Default time lock (30 days)

L2: /consult "border-radius: 8px" --scope critical --lock 90d
    → Explicit scope
    → Custom lock duration

L3: /consult DEC-001 --unlock "requirements changed"
    → Unlock existing decision
    → Requires reason
```

**Consolidated from v3.x:**
- `/approve` → `/consult` (records approval as decision)
- `/canonize` → `/consult --protect` (protected capability)
- `/unlock` → `/consult <id> --unlock` (unlock with reason)

**Decision Schema:**
```yaml
# consultation-chamber/decisions/DEC-2026-001.yaml
id: DEC-2026-001
created: 2026-01-07T12:00:00Z
created_by: human

decision: "Critical buttons use 8px border-radius"
rationale: "8px feels more approachable than 4px for high-stakes actions"

scope:
  zones: [critical]
  components: [ClaimButton, DepositButton]

lock:
  duration: 90d
  expires: 2026-04-07T12:00:00Z
  locked: true

evidence:
  - source: observation
    citation: "User feedback in /observe session 2026-01-07"

history:
  - timestamp: 2026-01-07T12:00:00Z
    action: created
    by: human
```

---

#### 1.7 /garden — Health Monitoring

**Purpose:** Detect drift and report health.

**Progressive Disclosure:**
```
L1: /garden
    → Full health check
    → Returns report with priorities

L2: /garden --validate
    → Schema validation only
    → CI/CD friendly

L3: /garden --fix
    → Auto-fix trivial issues
    → Interactive for complex issues
```

**Health Checks:**
```typescript
interface GardenCheck {
  id: string;
  name: string;
  severity: 'critical' | 'warning' | 'info';
  check: () => Promise<CheckResult>;
  fix?: () => Promise<void>;
}

const GARDEN_CHECKS: GardenCheck[] = [
  {
    id: 'persona-evidence',
    name: 'Personas have evidence',
    severity: 'warning',
    check: async () => {
      const personas = await readPersonas();
      const noEvidence = personas.filter(p => !p.evidence?.length);
      return { pass: noEvidence.length === 0, issues: noEvidence };
    }
  },
  {
    id: 'feedback-unapplied',
    name: 'Observation feedback applied',
    severity: 'warning',
    check: async () => {
      const feedback = await listUnappliedFeedback();
      return { pass: feedback.length === 0, issues: feedback };
    }
  },
  {
    id: 'zone-journey',
    name: 'Zones have journey context',
    severity: 'info',
    check: async () => {
      const zones = await readZones();
      const noJourney = zones.filter(z => !z.journey_stage);
      return { pass: noJourney.length === 0, issues: noJourney };
    }
  },
  {
    id: 'decision-expired',
    name: 'No expired decision locks',
    severity: 'info',
    check: async () => {
      const decisions = await readDecisions();
      const expired = decisions.filter(d => d.lock.expires < new Date());
      return { pass: expired.length === 0, issues: expired };
    }
  }
];
```

**Report Format:**
```
═══════════════════════════════════════════════════════════════
                     GARDEN HEALTH REPORT
═══════════════════════════════════════════════════════════════

CRITICAL (0)
───────────────────────────────────────────────────────────────
All clear.

WARNING (2)
───────────────────────────────────────────────────────────────
⚠ persona-evidence: 2 personas without evidence
  → depositor, mobile_user
  → /refine --persona depositor

⚠ feedback-unapplied: 1 observation feedback not applied
  → .sigil-observations/feedback/2026-01-07-claim-button.yaml
  → /refine --from-feedback

INFO (1)
───────────────────────────────────────────────────────────────
ℹ decision-expired: 1 decision lock expired
  → DEC-2025-042 "Use skeleton loading"
  → Review and re-lock or remove

SUMMARY
───────────────────────────────────────────────────────────────
Context health: 85%
Next action: /refine --persona depositor
```

---

### 2. Schema Evolution (v3.0 → v4.0)

#### 2.1 Persona Schema

**v3.0:**
```yaml
personas:
  power_user:
    alias: "Chef"
    description: "Expert user who lives in the product"
    characteristics: [...]
    default_lens: strict
    preferences:
      motion: snappy
```

**v4.0:**
```yaml
personas:
  henlocker:
    name: "Henlocker"
    description: "Existing depositor with high trust"

    # v4.0: Evidence-based
    source: analytics  # generic | analytics | gtm | interview | observation
    evidence:
      - "2,993 depositors in Henlo product"
      - "Average 3.2 transactions/month"
      - "60% desktop, 40% mobile"

    # Characteristics (evolved)
    trust_level: high        # low | medium | high
    input_method: mixed      # keyboard | touch | mixed
    reading_level: intermediate

    # v4.0: Journey context
    journey_stages:
      - active_depositor
      - claim_moment

    # Preferences (preserved)
    default_lens: default
    preferences:
      motion: snappy
      help: on_demand
      density: high

    # v4.0: Metadata
    last_refined: 2026-01-07
```

**Schema File:**
```json
// sigil-mark/personas/schemas/personas.schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Sigil Personas Schema v4.0",
  "type": "object",
  "required": ["version", "personas"],
  "properties": {
    "version": { "type": "string" },
    "personas": {
      "type": "object",
      "additionalProperties": {
        "$ref": "#/definitions/Persona"
      }
    }
  },
  "definitions": {
    "Persona": {
      "type": "object",
      "required": ["name", "description"],
      "properties": {
        "name": { "type": "string" },
        "description": { "type": "string" },
        "source": {
          "type": "string",
          "enum": ["generic", "analytics", "gtm", "interview", "observation"]
        },
        "evidence": {
          "type": "array",
          "items": { "type": "string" }
        },
        "trust_level": {
          "type": "string",
          "enum": ["low", "medium", "high"]
        },
        "input_method": {
          "type": "string",
          "enum": ["keyboard", "touch", "mixed"]
        },
        "reading_level": {
          "type": "string",
          "enum": ["beginner", "intermediate", "expert"]
        },
        "journey_stages": {
          "type": "array",
          "items": { "type": "string" }
        },
        "default_lens": { "type": "string" },
        "preferences": {
          "$ref": "#/definitions/PersonaPreferences"
        },
        "last_refined": {
          "type": "string",
          "format": "date"
        }
      }
    },
    "PersonaPreferences": {
      "type": "object",
      "properties": {
        "motion": { "type": "string" },
        "help": {
          "type": "string",
          "enum": ["always", "on_demand", "never", "contextual"]
        },
        "density": {
          "type": "string",
          "enum": ["low", "medium", "high"]
        }
      }
    }
  }
}
```

---

#### 2.2 Zone Schema

**v3.0:**
```yaml
# .sigilrc.yaml
zones:
  critical:
    layout: CriticalZone
    timeAuthority: server-tick
    default_persona: power_user
    persona_overrides: {...}
```

**v4.0:**
```yaml
# .sigilrc.yaml
zones:
  claim_moment:
    # Paths (for agent file detection)
    paths:
      - "src/features/claim/**"

    # Layout & Physics (preserved)
    layout: CriticalZone
    time_authority: server-tick
    motion: deliberate

    # v4.0: Journey context
    journey_stage: "claiming_rewards"
    persona_likely: henlocker
    trust_state: critical  # building | established | critical

    # Persona overrides (preserved)
    default_persona: henlocker
    persona_overrides:
      newcomer:
        lens: guided
        motion: reassuring

    # v4.0: Evidence
    evidence:
      - "73% complete claims in <30s"
      - "40% of claims from mobile"

    # v4.0: Metadata
    last_refined: 2026-01-07
```

---

### 3. Build-Time Export System

#### 3.1 CLI Command

```typescript
// packages/sigil-cli/src/commands/export-config.ts

import { readPersonas, readZones, readVocabulary, readPhilosophy } from 'sigil-mark/process';
import * as fs from 'fs';
import * as path from 'path';

interface ExportConfig {
  version: string;
  exported_at: string;
  personas: Record<string, RuntimePersona>;
  zones: Record<string, RuntimeZone>;
  vocabulary: Record<string, RuntimeVocabularyTerm>;
  philosophy: RuntimePhilosophy;
}

interface ExportOptions {
  output: string;
  watch?: boolean;
  minify?: boolean;
}

export async function exportConfig(options: ExportOptions): Promise<void> {
  const config = await buildConfig();

  const content = options.minify
    ? JSON.stringify(config)
    : JSON.stringify(config, null, 2);

  await fs.promises.writeFile(options.output, content, 'utf-8');

  console.log(`Exported Sigil config to ${options.output}`);

  if (options.watch) {
    watchForChanges(options);
  }
}

async function buildConfig(): Promise<ExportConfig> {
  const [personas, zones, vocabulary, philosophy] = await Promise.all([
    readPersonas(),
    readZones(),
    readVocabulary(),
    readPhilosophy()
  ]);

  return {
    version: '4.0.0',
    exported_at: new Date().toISOString(),

    personas: Object.fromEntries(
      Object.entries(personas).map(([id, p]) => [id, {
        name: p.name,
        trust_level: p.trust_level,
        default_lens: p.default_lens,
        preferences: p.preferences,
        journey_stages: p.journey_stages
      }])
    ),

    zones: Object.fromEntries(
      Object.entries(zones).map(([id, z]) => [id, {
        layout: z.layout,
        persona_likely: z.persona_likely,
        trust_state: z.trust_state,
        motion: z.motion
      }])
    ),

    vocabulary: Object.fromEntries(
      Object.entries(vocabulary.terms).map(([id, t]) => [id, {
        user_facing: t.user_facing,
        material: t.recommended.material,
        motion: t.recommended.motion
      }])
    ),

    philosophy: {
      primary_intent: philosophy.intent.primary,
      conflict_resolution: philosophy.conflict_resolution
    }
  };
}
```

#### 3.2 Runtime Usage

```tsx
// src/sigil-config.json (generated)
{
  "version": "4.0.0",
  "exported_at": "2026-01-07T12:00:00Z",
  "personas": {
    "henlocker": {
      "name": "Henlocker",
      "trust_level": "high",
      "default_lens": "default",
      "journey_stages": ["active_depositor", "claim_moment"]
    }
  },
  "zones": {
    "critical": {
      "layout": "CriticalZone",
      "persona_likely": "henlocker",
      "trust_state": "critical",
      "motion": "deliberate"
    }
  }
}

// Usage in React
import sigilConfig from './sigil-config.json';

function ClaimButton({ userType }: { userType: string }) {
  const persona = sigilConfig.personas[userType] || sigilConfig.personas.henlocker;
  const zone = sigilConfig.zones.critical;

  return (
    <CriticalZone>
      <Button
        motion={zone.motion}
        lens={persona.default_lens}
      >
        Claim Rewards
      </Button>
    </CriticalZone>
  );
}
```

#### 3.3 Optional React Provider

```tsx
// sigil-mark/runtime/provider.tsx

import React, { createContext, useContext, type ReactNode } from 'react';

export interface SigilConfig {
  version: string;
  personas: Record<string, RuntimePersona>;
  zones: Record<string, RuntimeZone>;
  vocabulary: Record<string, RuntimeVocabularyTerm>;
  philosophy: RuntimePhilosophy;
}

const SigilConfigContext = createContext<SigilConfig | null>(null);

export function SigilConfigProvider({
  config,
  children
}: {
  config: SigilConfig;
  children: ReactNode;
}) {
  return (
    <SigilConfigContext.Provider value={config}>
      {children}
    </SigilConfigContext.Provider>
  );
}

export function useSigilConfig(): SigilConfig {
  const config = useContext(SigilConfigContext);
  if (!config) {
    throw new Error('useSigilConfig must be used within SigilConfigProvider');
  }
  return config;
}

export function usePersona(personaId: string): RuntimePersona | undefined {
  const config = useSigilConfig();
  return config.personas[personaId];
}

export function useZone(zoneId: string): RuntimeZone | undefined {
  const config = useSigilConfig();
  return config.zones[zoneId];
}
```

---

### 4. Skill Architecture (v4.0)

#### 4.1 Skill Directory Structure

```
.claude/skills/
├── envisioning-moodboard/
│   ├── index.yaml          # Metadata (~100 tokens)
│   ├── SKILL.md            # Tool implementation guide
│   └── interview/
│       └── questions.yaml  # Interview questions
│
├── codifying-rules/
│   ├── index.yaml
│   ├── SKILL.md
│   └── templates/
│       └── rules.md.tmpl
│
├── crafting-guidance/
│   ├── index.yaml
│   ├── SKILL.md
│   └── context-loader.md   # How to load context
│
├── observing-visual/        # NEW
│   ├── index.yaml
│   ├── SKILL.md
│   └── analysis/
│       ├── structural.md   # Structural checks
│       └── measurable.md   # Property comparison
│
├── refining-context/        # NEW
│   ├── index.yaml
│   ├── SKILL.md
│   └── interview/
│       └── persona.yaml    # Persona interview
│
├── consulting-decisions/
│   ├── index.yaml
│   └── SKILL.md
│
└── gardening-health/
    ├── index.yaml
    ├── SKILL.md
    └── checks/
        └── health-checks.yaml
```

#### 4.2 Skill Index Format

```yaml
# .claude/skills/observing-visual/index.yaml
name: observing-visual
version: 4.0.0
description: "Visual bridge via Claude in Chrome MCP"

tool: /observe

progressive_disclosure:
  L1: "Capture screen, compare to context"
  L2: "Focus on specific component"
  L3: "Manual screenshot, specific rules"

requires:
  - mcp: claude-in-chrome  # Optional but recommended

outputs:
  - .sigil-observations/screenshots/
  - .sigil-observations/feedback/
```

#### 4.3 Skill Implementation Guide

```markdown
# observing-visual/SKILL.md

# Observing Visual Skill

> "Bridge agent perception and human judgment"

## Purpose

Capture visual state via Claude in Chrome MCP, analyze against context,
and present targeted feedback questions to humans.

## Execution Steps

### Step 1: Check MCP Availability

```
Use mcp__claude-in-chrome__tabs_context_mcp to check for browser connection.

If MCP unavailable:
- Inform user: "Claude in Chrome MCP not detected"
- Offer: "Upload a screenshot manually, or install MCP"
```

### Step 2: Capture Visual State

```
Use mcp__claude-in-chrome__computer with action: screenshot
Store screenshot in .sigil-observations/screenshots/
```

### Step 3: Structural Analysis

Read the screenshot and check:
- Zone wrapper present (CriticalZone, etc.)
- Expected components used
- Flow matches zone expectations

### Step 4: Measurable Property Analysis

Compare visual properties to rules.md:
- Border radius
- Colors
- Spacing
- Animation timing

### Step 5: Generate Feedback Questions

For each DELTA found:
- Create yes/no question
- "Is this intentional?"
- Options: "Yes — update rules" or "No — fix component"

### Step 6: Record Feedback

Write to .sigil-observations/feedback/{date}-{component}.yaml

## When to Ask vs Proceed

ASK:
- Any subjective quality ("Does this feel right?")
- Any taste decision

PROCEED:
- Structural checks (pass/fail)
- Measurable deltas (objective comparison)

## Output Format

[See PRD FR-2 for exact output format]
```

---

### 5. File Structure (v4.0)

```
sigil-mark/
├── moodboard.md                    # Product feel (preserved)
├── moodboard/                      # Reference products
│   └── *.md
├── rules.md                        # Design tokens (preserved)
├── inventory.md                    # Component list
│
├── personas/                       # v4.0: Evidence-based
│   ├── personas.yaml
│   └── schemas/
│       └── personas.schema.json
│
├── vocabulary/                     # Preserved from v3.0
│   ├── vocabulary.yaml
│   └── schemas/
│       └── vocabulary.schema.json
│
├── soul-binder/                    # Preserved from v3.0
│   ├── philosophy.yaml
│   ├── canon-of-flaws.yaml
│   └── schemas/
│       └── philosophy.schema.json
│
├── consultation-chamber/           # Preserved from v3.0
│   └── decisions/
│       └── DEC-*.yaml
│
├── evidence/                       # v4.0: NEW
│   ├── analytics-*.yaml
│   ├── interviews/
│   └── observations/
│
├── .sigil-observations/            # v4.0: NEW
│   ├── screenshots/
│   └── feedback/
│
├── process/                        # Agent-only readers (preserved)
│   ├── index.ts
│   ├── persona-reader.ts
│   ├── vocabulary-reader.ts
│   ├── philosophy-reader.ts
│   └── ...
│
├── core/                           # Runtime (preserved)
│   ├── persona-context.tsx
│   ├── zone-resolver.ts
│   └── ...
│
├── layouts/                        # Runtime (preserved)
│   ├── critical-zone.tsx
│   └── ...
│
└── lenses/                         # Runtime (preserved)
    ├── default.tsx
    └── ...

.sigilrc.yaml                       # v4.0: with journey context
sigil-config.json                   # v4.0: build-time export
```

---

## Data Architecture

### Process Layer Files (Agent-Only)

| File | Purpose | Read By |
|------|---------|---------|
| `personas/personas.yaml` | User personas with evidence | Agent |
| `vocabulary/vocabulary.yaml` | Term → feel mapping | Agent |
| `soul-binder/philosophy.yaml` | Intent hierarchy | Agent |
| `consultation-chamber/decisions/*.yaml` | Locked decisions | Agent |
| `evidence/*.yaml` | Evidence files | Agent |
| `.sigil-observations/feedback/*.yaml` | Observation feedback | Agent |
| `.sigilrc.yaml` | Zone configuration | Agent + Build |

### Runtime Files

| File | Purpose | Read By |
|------|---------|---------|
| `sigil-config.json` | Exported configuration | Runtime |

---

## Security Architecture

### MCP Integration Security

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     /observe Security Model                             │
│                                                                         │
│   1. SCREENSHOT ONLY                                                    │
│      - Only captures visual state                                       │
│      - No DOM manipulation                                              │
│      - No network requests                                              │
│                                                                         │
│   2. LOCAL STORAGE ONLY                                                 │
│      - Screenshots stored in .sigil-observations/                       │
│      - Never transmitted externally                                     │
│      - User controls retention                                          │
│                                                                         │
│   3. HUMAN GATED                                                        │
│      - Agent cannot auto-apply feedback                                 │
│      - Human must answer questions                                      │
│      - /refine requires explicit invocation                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Evidence File Handling

- Evidence files in `evidence/` are YAML only
- No executable content
- Schema validated before use
- Never imported at runtime

---

## Migration Strategy

### v3.0 → v4.0 Migration

#### Phase 1: Schema Updates (Non-Breaking)

```yaml
# Add to existing personas.yaml
personas:
  power_user:
    # ... existing fields preserved ...

    # Add v4.0 fields (optional during migration)
    source: generic
    evidence: []
    journey_stages: []
    last_refined: null
```

#### Phase 2: Command Deprecation

```
/setup
  → Deprecated: Setup is automatic on first /envision or /codify

/approve
  → Deprecated: Use /consult to record decisions

/canonize "behavior"
  → Deprecated: Use /consult "behavior" --protect

/unlock DEC-001
  → Deprecated: Use /consult DEC-001 --unlock "reason"

/validate
  → Deprecated: Use /garden --validate

/inherit
  → Deprecated: /envision auto-detects existing codebase
```

#### Phase 3: New Tools

- `/observe` available after MCP installed
- `/refine` available immediately
- Build-time export via `npx sigil export-config`

#### Phase 4: Full Migration

- Persona evidence populated (goal: 80%)
- Zone journey context added
- Observation feedback loop active

---

## Testing Strategy

### Tool Tests

| Tool | Test File |
|------|-----------|
| /envision | `__tests__/tools/envision.test.ts` |
| /codify | `__tests__/tools/codify.test.ts` |
| /craft | `__tests__/tools/craft.test.ts` |
| /observe | `__tests__/tools/observe.test.ts` |
| /refine | `__tests__/tools/refine.test.ts` |
| /consult | `__tests__/tools/consult.test.ts` |
| /garden | `__tests__/tools/garden.test.ts` |

### Integration Tests

| Scenario | Test |
|----------|------|
| Full feedback loop | `__tests__/integration/feedback-loop.test.ts` |
| Evidence application | `__tests__/integration/evidence-flow.test.ts` |
| Build-time export | `__tests__/integration/export-config.test.ts` |
| MCP integration | `__tests__/integration/mcp-observe.test.ts` |

### Schema Validation

All YAML files validated against JSON Schema:
- `personas.schema.json`
- `zones.schema.json` (extracted from sigilrc)
- `evidence.schema.json`
- `feedback.schema.json`

---

## Technical Risks

| Risk | Mitigation |
|------|------------|
| MCP not installed | Graceful fallback to manual screenshot |
| Evidence format variance | Standard schema, validation on read |
| Context staleness | /garden warns, suggests /refine |
| Build export forgotten | CI hook option, warning in /garden |
| Screenshot storage growth | Auto-cleanup after 30 days |

---

## Future Considerations

### v4.1

- Visual editor for personas (web UI)
- Auto-MCP installation helper
- Screenshot annotation

### v4.2

- A/B testing integration
- Analytics pipeline integration
- Multi-product context

### v5.0

- Real-time persona detection (ML)
- Cross-product vocabulary sharing
- Automated evidence collection

---

## Summary

Sigil v4.0 "Sharp Tools" transforms the framework from command overload to tool clarity:

| Aspect | v3.0 | v4.0 |
|--------|------|------|
| Commands | 37 | 7 |
| Interaction | One-shot | Progressive disclosure |
| Personas | Generic | Evidence-based |
| Context evolution | Manual | /refine incremental |
| Visual feedback | None | /observe via MCP |
| Runtime access | Broken | Build-time export |

**The Mission:** Each tool does one thing. Does it extremely well. No apologies.

---

*SDD v4.0*
*Status: RFC — Ready for Implementation*
*Date: 2026-01-07*
*Sources: loa-grimoire/prd-v4.md, loa-grimoire/sdd.md (v3.0)*
