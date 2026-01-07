# Software Design Document: Sigil v2.6

**Version:** 1.0
**Date:** 2026-01-06
**Author:** Architecture Designer Agent
**Status:** Draft
**PRD Reference:** loa-grimoire/prd.md
**Codename:** Craftsman's Flow

---

## Table of Contents

1. [Project Architecture](#1-project-architecture)
2. [Software Stack](#2-software-stack)
3. [Data Architecture](#3-data-architecture)
4. [Component Design](#4-component-design)
5. [API Specifications](#5-api-specifications)
6. [Error Handling Strategy](#6-error-handling-strategy)
7. [Testing Strategy](#7-testing-strategy)
8. [Development Phases](#8-development-phases)
9. [Known Risks and Mitigation](#9-known-risks-and-mitigation)
10. [Open Questions](#10-open-questions)
11. [Appendix](#11-appendix)

---

## 1. Project Architecture

### 1.1 System Overview

Sigil v2.6 is a **two-tier design framework** that separates human design decisions (Sigil Process) from implementation primitives (Sigil Core). This architecture enables:

- **Craftsman Flow Protection**: Restore context after time away, lock settled decisions
- **Design Decision Durability**: Constitution, Lens Array, Consultation Chamber stored as YAML
- **AI Agent Integration**: Claude Code reads Process layer before generating UI code
- **React Primitives**: Core hooks, layouts, and lenses for building interfaces

### 1.2 Architectural Pattern

**Pattern:** Layered Configuration + Component Library

**Justification:**
- Process Layer (YAML/Markdown) is human-readable and version-controlled
- Core Layer (React/TypeScript) is strongly typed and testable
- Separation allows humans to focus on "what" while code handles "how"
- AI agents can parse YAML configuration easily

### 1.3 Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SIGIL v2.6                                      │
│                         "Craftsman's Flow"                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      SIGIL PROCESS (Human Layer)                      │  │
│  │                         YAML / Markdown                               │  │
│  │                                                                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │  │
│  │  │ Constitution │  │  Lens Array  │  │ Consultation │  │  Surveys  │ │  │
│  │  │  (Protected) │  │  (Personas)  │  │   Chamber    │  │  (Vibe)   │ │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └───────────┘ │  │
│  │                                                                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │  │
│  │  │   Moodboard  │  │    Rules     │  │   Zones      │               │  │
│  │  │   (Vision)   │  │   (Taste)    │  │  (.sigilrc)  │               │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                              ↓                                              │
│                    Process informs Core behavior                            │
│                              ↓                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      SIGIL CORE (Implementation Layer)                │  │
│  │                         React / TypeScript                            │  │
│  │                                                                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │  │
│  │  │  Core Hooks  │  │   Layouts    │  │    Lenses    │               │  │
│  │  │ useCritical  │  │ CriticalZone │  │  DefaultLens │               │  │
│  │  │   Action     │  │ Machinery    │  │  StrictLens  │               │  │
│  │  │ useLocalCache│  │ GlassLayout  │  │   A11yLens   │               │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      CLAUDE CODE INTEGRATION                          │  │
│  │                                                                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │  │
│  │  │   /craft     │  │   /consult   │  │   /garden    │               │  │
│  │  │  (Context)   │  │   (Lock)     │  │  (Health)    │               │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.4 System Components

#### 1.4.1 Sigil Process (Human Layer)

**Purpose:** Capture human design decisions in durable, queryable format

**Responsibilities:**
- Store protected capabilities (Constitution)
- Define user personas (Lens Array)
- Lock deliberated decisions (Consultation Chamber)
- Collect qualitative feedback (Vibe Checks)
- Store product vision (Moodboard) and rules (Rules)

**Interfaces:**
- YAML files read by AI agents and validation tools
- Markdown files for human documentation

**Dependencies:** None (pure configuration)

#### 1.4.2 Sigil Core (Implementation Layer)

**Purpose:** Provide React primitives for building interfaces

**Responsibilities:**
- State management with time authorities (useCriticalAction)
- Layout primitives enforcing physics (CriticalZone, etc.)
- Interchangeable UI renderers (Lenses)

**Interfaces:**
- React hooks and components
- TypeScript types for consumers

**Dependencies:** React 18+, TypeScript

#### 1.4.3 Claude Code Integration

**Purpose:** Enable AI agents to respect Process decisions

**Responsibilities:**
- Read Constitution before generating UI code
- Surface locked decisions when relevant files opened
- Restore context after time away (/craft)
- Lock decisions after deliberation (/consult)

**Interfaces:**
- `.claude/commands/` for slash commands
- `.claude/skills/` for agent skills

**Dependencies:** Claude Code CLI

### 1.5 Data Flow

```
Human Decision
      ↓
  /consult "button color"
      ↓
  [Decision locked in YAML]
      ↓
  sigil-mark/consultation-chamber/decisions/DEC-2026-001.yaml
      ↓
Engineer opens file
      ↓
  /craft src/features/checkout/Button.tsx
      ↓
  [AI reads Constitution + Consultation]
      ↓
  "This zone has a locked decision: Primary CTA is Blue"
      ↓
  [AI generates code respecting decision]
```

### 1.6 External Integrations

| Service | Purpose | API Type | Documentation |
|---------|---------|----------|---------------|
| Claude Code | AI agent integration | CLI commands | CLAUDE.md |
| Loa | Project workflow orchestration | Skill invocation | loa-grimoire/ |
| Edge Config | Remote config (optional) | REST | Vercel docs |

### 1.7 Deployment Architecture

Sigil is a **client-side framework** distributed via:

1. **Mount Script**: Copy `sigil-mark/` into target project
2. **NPM Package** (future): `npm install sigil-mark`

No server deployment required. All Process data stored in repository.

### 1.8 Scalability Strategy

Not applicable — client-side framework with file-based configuration.

### 1.9 Security Architecture

- **Constitution Override Audit**: All override attempts logged with justification
- **No Secrets**: Process layer contains no sensitive data
- **Git-Based Access Control**: Repository permissions govern who can modify decisions

---

## 2. Software Stack

### 2.1 Process Layer Technologies

| Category | Technology | Version | Justification |
|----------|------------|---------|---------------|
| Config Format | YAML | 1.2 | Human-readable, parseable by AI |
| Documentation | Markdown | CommonMark | Standard, version-controllable |
| Validation | JSON Schema | Draft-07 | Type safety for YAML |

### 2.2 Core Layer Technologies

| Category | Technology | Version | Justification |
|----------|------------|---------|---------------|
| Runtime | React | 18+ | Hooks, Suspense, concurrent features |
| Language | TypeScript | 5.0+ | Type safety, IDE support |
| Styling | Tailwind CSS | 3.x | Utility-first, tree-shakeable |
| Testing | Vitest | 1.x | Fast, ESM-native |

**Key Libraries:**
- `yaml`: Parse YAML configuration files
- `zod`: Runtime validation of Process data
- `@testing-library/react`: Component testing

### 2.3 Claude Code Integration

| Category | Technology | Purpose |
|----------|------------|---------|
| Commands | `.claude/commands/*.md` | Slash command definitions |
| Skills | `.claude/skills/*/SKILL.md` | Agent capabilities |
| Config | `CLAUDE.md` | Agent instructions |

---

## 3. Data Architecture

### 3.1 Data Storage

**Storage Model:** File-based (Git repository)

**Justification:**
- Version-controlled with full history
- No external dependencies
- Portable across projects
- Human-editable

### 3.2 Schema Design

#### 3.2.1 Constitution Schema

```yaml
# sigil-mark/constitution/protected-capabilities.yaml
version: "2.6.0"
enforcement: block  # block | warn | log

protected:
  - id: string          # Unique identifier (e.g., "withdraw")
    name: string        # Human-readable name
    description: string # What this capability does
    enforcement: block | warn | log
    rationale: string   # Why this is protected

override_audit:
  enabled: boolean
  path: string          # Where to log overrides
  requires_justification: boolean
  notify: string[]      # Stakeholders to notify
```

**TypeScript Interface:**
```typescript
interface Constitution {
  version: string;
  enforcement: 'block' | 'warn' | 'log';
  protected: ProtectedCapability[];
  override_audit: OverrideAuditConfig;
}

interface ProtectedCapability {
  id: string;
  name: string;
  description: string;
  enforcement: 'block' | 'warn' | 'log';
  rationale: string;
}
```

#### 3.2.2 Lens Array Schema

```yaml
# sigil-mark/lens-array/lenses.yaml
version: "2.6.0"

lenses:
  power_user:
    name: string
    alias: string
    description: string
    priority: number        # Lower = higher priority
    target_audience: string[]
    mental_model: string
    interaction_style: string
    physics:
      tap_targets: string   # e.g., "32px"
      input_method: string  # e.g., "numeric"
      shortcuts: string     # e.g., "full"
      deposit: string       # e.g., "numeric_input + quick_amounts"
      confirmation: string  # e.g., "cmd+enter"
    constraints:
      - id: string
        description: string
        required: boolean
    validation: string[]

immutable_properties:
  description: string
  properties:
    - name: string
      description: string

stacking:
  description: string
  allowed_combinations: string[][]
  conflict_resolution:
    priority_order: string[]
    rule: string
```

**TypeScript Interface:**
```typescript
interface LensArray {
  version: string;
  lenses: Record<string, UserPersona>;
  immutable_properties: ImmutableProperties;
  stacking: StackingConfig;
}

interface UserPersona {
  name: string;
  alias: string;
  description: string;
  priority: number;
  target_audience: string[];
  mental_model: string;
  interaction_style: string;
  physics: PersonaPhysics;
  constraints: PersonaConstraint[];
  validation: string[];
}
```

#### 3.2.3 Consultation Chamber Schema

```yaml
# sigil-mark/consultation-chamber/decisions/DEC-2026-001.yaml
id: "DEC-2026-001"
topic: string           # What was decided
decision: string        # The actual decision
scope: strategic | direction | execution
locked_at: ISO8601      # When locked
locked_by: string       # Who locked it
expires_at: ISO8601     # When lock expires
context:
  zone: string          # Relevant zone
  moodboard_ref: string # Relevant moodboard section
  options_considered:
    - option: string
      pros: string[]
      cons: string[]
rationale: string       # Why this decision
status: locked | unlocked | expired
unlock_history:
  - unlocked_at: ISO8601
    unlocked_by: string
    justification: string
```

**TypeScript Interface:**
```typescript
interface Decision {
  id: string;
  topic: string;
  decision: string;
  scope: 'strategic' | 'direction' | 'execution';
  locked_at: string;
  locked_by: string;
  expires_at: string;
  context: DecisionContext;
  rationale: string;
  status: 'locked' | 'unlocked' | 'expired';
  unlock_history: UnlockEvent[];
}

type LockPeriod = {
  strategic: 180;  // days
  direction: 90;
  execution: 30;
};
```

#### 3.2.4 Vibe Checks Schema

```yaml
# sigil-mark/surveys/vibe-checks.yaml
version: "2.6.0"

triggers:
  - id: string
    trigger: string       # Event that triggers survey
    question: string      # Question to ask
    options: string[]     # Multiple choice options
    cooldown_days: number # Days before asking again
    priority: high | medium | low

feedback:
  enabled: boolean
  destination: string     # Where to send responses
  aggregate_patterns: boolean
  patterns:
    - name: string
      description: string
      condition: string   # Pattern detection rule
      action: string      # Suggested action

display:
  position: string        # UI position
  style: string
  animation: string
  dismiss_on_click_outside: boolean
  skip_always_visible: boolean
```

### 3.3 File Structure

```
sigil-mark/
├── constitution/
│   ├── protected-capabilities.yaml    # Core capabilities
│   └── schemas/
│       └── constitution.schema.json   # JSON Schema
│
├── lens-array/
│   ├── lenses.yaml                    # User personas
│   └── schemas/
│       └── lens-array.schema.json
│
├── consultation-chamber/
│   ├── config.yaml                    # Chamber config
│   ├── decisions/
│   │   ├── DEC-2026-001.yaml         # Individual decisions
│   │   └── ...
│   └── schemas/
│       └── decision.schema.json
│
├── surveys/
│   ├── vibe-checks.yaml              # Survey definitions
│   └── schemas/
│       └── vibe-checks.schema.json
│
├── moodboard.md                       # Product vision
├── rules.md                           # Design rules
│
├── core/                              # React hooks (existing)
│   ├── use-critical-action.ts
│   ├── use-local-cache.ts
│   └── types.ts
│
├── layouts/                           # Layout components (existing)
│   ├── critical-zone.tsx
│   ├── machinery-layout.tsx
│   └── glass-layout.tsx
│
├── lenses/                            # UI renderers (existing)
│   ├── default/
│   ├── strict/
│   └── a11y/
│
├── process/                           # NEW: Process utilities
│   ├── constitution-reader.ts        # Read constitution
│   ├── decision-reader.ts            # Read decisions
│   ├── lens-array-reader.ts          # Read personas
│   ├── vibe-check-trigger.ts         # Trigger surveys
│   └── index.ts
│
└── index.ts                           # Public API
```

### 3.4 Data Access Patterns

| Query | Frequency | Implementation |
|-------|-----------|----------------|
| Read Constitution | On file open | YAML parse |
| Read decisions for zone | On file open | Glob + YAML parse |
| Lock decision | On /consult | YAML write |
| Check decision expiry | On /craft | Date comparison |
| Trigger vibe check | On event | Event listener |

---

## 4. Component Design

### 4.1 Process Reader Components

#### 4.1.1 ConstitutionReader

**Purpose:** Load and validate Constitution YAML

```typescript
// sigil-mark/process/constitution-reader.ts

import { z } from 'zod';
import yaml from 'yaml';

const ProtectedCapabilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  enforcement: z.enum(['block', 'warn', 'log']),
  rationale: z.string(),
});

const ConstitutionSchema = z.object({
  version: z.string(),
  enforcement: z.enum(['block', 'warn', 'log']),
  protected: z.array(ProtectedCapabilitySchema),
  override_audit: z.object({
    enabled: z.boolean(),
    path: z.string(),
    requires_justification: z.boolean(),
    notify: z.array(z.string()),
  }),
});

export type Constitution = z.infer<typeof ConstitutionSchema>;

export async function readConstitution(
  path: string = 'sigil-mark/constitution/protected-capabilities.yaml'
): Promise<Constitution> {
  const content = await fs.readFile(path, 'utf-8');
  const parsed = yaml.parse(content);
  return ConstitutionSchema.parse(parsed);
}

export function isCapabilityProtected(
  constitution: Constitution,
  capabilityId: string
): boolean {
  return constitution.protected.some(c => c.id === capabilityId);
}

export function getCapabilityEnforcement(
  constitution: Constitution,
  capabilityId: string
): 'block' | 'warn' | 'log' | null {
  const capability = constitution.protected.find(c => c.id === capabilityId);
  return capability?.enforcement ?? null;
}
```

#### 4.1.2 DecisionReader

**Purpose:** Load and manage locked decisions

```typescript
// sigil-mark/process/decision-reader.ts

import { z } from 'zod';
import yaml from 'yaml';
import glob from 'fast-glob';

const DecisionSchema = z.object({
  id: z.string(),
  topic: z.string(),
  decision: z.string(),
  scope: z.enum(['strategic', 'direction', 'execution']),
  locked_at: z.string(),
  locked_by: z.string(),
  expires_at: z.string(),
  context: z.object({
    zone: z.string().optional(),
    moodboard_ref: z.string().optional(),
    options_considered: z.array(z.object({
      option: z.string(),
      pros: z.array(z.string()),
      cons: z.array(z.string()),
    })).optional(),
  }),
  rationale: z.string(),
  status: z.enum(['locked', 'unlocked', 'expired']),
  unlock_history: z.array(z.object({
    unlocked_at: z.string(),
    unlocked_by: z.string(),
    justification: z.string(),
  })).optional(),
});

export type Decision = z.infer<typeof DecisionSchema>;

export const LOCK_PERIODS = {
  strategic: 180,
  direction: 90,
  execution: 30,
} as const;

export async function readAllDecisions(
  basePath: string = 'sigil-mark/consultation-chamber/decisions'
): Promise<Decision[]> {
  const files = await glob(`${basePath}/*.yaml`);
  const decisions: Decision[] = [];

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const parsed = yaml.parse(content);
    decisions.push(DecisionSchema.parse(parsed));
  }

  return decisions;
}

export async function getDecisionsForZone(
  zone: string,
  basePath?: string
): Promise<Decision[]> {
  const all = await readAllDecisions(basePath);
  return all.filter(d => d.context.zone === zone && d.status === 'locked');
}

export function isDecisionExpired(decision: Decision): boolean {
  return new Date(decision.expires_at) < new Date();
}

export async function lockDecision(
  topic: string,
  decision: string,
  scope: Decision['scope'],
  context: Decision['context'],
  rationale: string,
  lockedBy: string
): Promise<Decision> {
  const id = generateDecisionId();
  const lockedAt = new Date().toISOString();
  const expiresAt = new Date(
    Date.now() + LOCK_PERIODS[scope] * 24 * 60 * 60 * 1000
  ).toISOString();

  const newDecision: Decision = {
    id,
    topic,
    decision,
    scope,
    locked_at: lockedAt,
    locked_by: lockedBy,
    expires_at: expiresAt,
    context,
    rationale,
    status: 'locked',
    unlock_history: [],
  };

  const path = `sigil-mark/consultation-chamber/decisions/${id}.yaml`;
  await fs.writeFile(path, yaml.stringify(newDecision));

  return newDecision;
}

function generateDecisionId(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `DEC-${year}-${seq}`;
}
```

#### 4.1.3 LensArrayReader

**Purpose:** Load user personas and validate lens stacking

```typescript
// sigil-mark/process/lens-array-reader.ts

import { z } from 'zod';
import yaml from 'yaml';

const PersonaConstraintSchema = z.object({
  id: z.string(),
  description: z.string(),
  required: z.boolean(),
});

const PersonaPhysicsSchema = z.object({
  tap_targets: z.string(),
  input_method: z.string(),
  shortcuts: z.string(),
  deposit: z.string(),
  confirmation: z.string(),
});

const UserPersonaSchema = z.object({
  name: z.string(),
  alias: z.string(),
  description: z.string(),
  priority: z.number(),
  target_audience: z.array(z.string()),
  mental_model: z.string(),
  interaction_style: z.string(),
  physics: PersonaPhysicsSchema,
  constraints: z.array(PersonaConstraintSchema),
  validation: z.array(z.string()),
});

const LensArraySchema = z.object({
  version: z.string(),
  lenses: z.record(UserPersonaSchema),
  immutable_properties: z.object({
    description: z.string(),
    properties: z.array(z.object({
      name: z.string(),
      description: z.string(),
    })),
  }),
  stacking: z.object({
    description: z.string(),
    allowed_combinations: z.array(z.array(z.string())),
    conflict_resolution: z.object({
      priority_order: z.array(z.string()),
      rule: z.string(),
    }),
  }),
});

export type LensArray = z.infer<typeof LensArraySchema>;
export type UserPersona = z.infer<typeof UserPersonaSchema>;

export async function readLensArray(
  path: string = 'sigil-mark/lens-array/lenses.yaml'
): Promise<LensArray> {
  const content = await fs.readFile(path, 'utf-8');
  const parsed = yaml.parse(content);
  return LensArraySchema.parse(parsed);
}

export function getPersona(
  lensArray: LensArray,
  personaId: string
): UserPersona | undefined {
  return lensArray.lenses[personaId];
}

export function validateLensStack(
  lensArray: LensArray,
  stack: string[]
): { valid: boolean; error?: string } {
  const allowed = lensArray.stacking.allowed_combinations;
  const isAllowed = allowed.some(
    combo => combo.length === stack.length &&
      combo.every(lens => stack.includes(lens))
  );

  if (!isAllowed) {
    return {
      valid: false,
      error: `Lens combination [${stack.join(', ')}] is not allowed`,
    };
  }

  return { valid: true };
}

export function resolveStackConflict(
  lensArray: LensArray,
  stack: string[]
): string {
  const order = lensArray.stacking.conflict_resolution.priority_order;
  for (const lens of order) {
    if (stack.includes(lens)) {
      return lens;
    }
  }
  return stack[0];
}
```

### 4.2 Claude Code Integration

#### 4.2.1 /craft Command

**Purpose:** Restore context after time away

```markdown
<!-- .claude/commands/craft.md -->
---
name: craft
description: Restore context and support deep exploration
skill: crafting-guidance
skill_path: .claude/skills/crafting-guidance/SKILL.md
preflight:
  - sigil_mounted
human_effort: low
effort_type: conversation
---

# /craft — Return to Flow

## Purpose

`/craft` helps you:
1. **Restore context** after time away
2. **Get zone-specific guidance** during implementation
3. **Deep dive** when the craft demands it

## Usage

# Restore context after time away
/craft

# Get guidance for a specific file
/craft src/features/checkout/Button.tsx

# Validate against a specific lens
/craft --lens mobile
```

#### 4.2.2 /consult Command

**Purpose:** Lock a deliberated decision

```markdown
<!-- .claude/commands/consult.md -->
---
name: consult
description: Lock a decision you've already made through deliberation
skill: consulting-decisions
skill_path: .claude/skills/consulting-decisions/SKILL.md
preflight:
  - sigil_mounted
human_effort: low
effort_type: confirmation
---

# /consult — Lock a Deliberated Decision

## Usage

# Lock a decision you've made
/consult "button color for primary CTA"

# Unlock if new information emerges
/consult --unlock DEC-2026-001

## Agent Behavior

1. Ask: "What have you decided about?"
2. Ask: "What is your decision?"
3. Ask: "What scope? (strategic/direction/execution)"
4. Gather context (zone, moodboard references)
5. Present options with trade-offs
6. Confirm decision
7. Generate decision YAML file
8. Report lock status and expiry
```

### 4.3 Zone Resolution

The zone resolver determines which zone a file belongs to:

```typescript
// sigil-mark/core/zone-resolver.ts (enhanced)

export interface ZoneConfig {
  paths: string[];
  motion: string;
  timing: string;
  time_authority: string;
  lens_enforcement: 'strict' | 'user';
  patterns: {
    prefer: string[];
    warn: string[];
  };
}

export async function resolveZoneForPath(
  filePath: string,
  sigilrcPath: string = '.sigilrc.yaml'
): Promise<{ zone: string; config: ZoneConfig } | null> {
  const sigilrc = await readSigilrc(sigilrcPath);

  for (const [zoneName, config] of Object.entries(sigilrc.zones)) {
    for (const pattern of config.paths) {
      if (minimatch(filePath, pattern)) {
        return { zone: zoneName, config };
      }
    }
  }

  return null;
}
```

---

## 5. API Specifications

### 5.1 Process Reader API

```typescript
// Public API for Process layer

// Constitution
export {
  readConstitution,
  isCapabilityProtected,
  getCapabilityEnforcement,
  type Constitution,
  type ProtectedCapability,
} from './process/constitution-reader';

// Decisions
export {
  readAllDecisions,
  getDecisionsForZone,
  isDecisionExpired,
  lockDecision,
  unlockDecision,
  LOCK_PERIODS,
  type Decision,
} from './process/decision-reader';

// Lens Array
export {
  readLensArray,
  getPersona,
  validateLensStack,
  resolveStackConflict,
  type LensArray,
  type UserPersona,
} from './process/lens-array-reader';

// Vibe Checks
export {
  readVibeChecks,
  shouldTriggerSurvey,
  recordSurveyResponse,
  type VibeCheck,
  type SurveyTrigger,
} from './process/vibe-check-trigger';
```

### 5.2 Core API (Existing)

```typescript
// Core Layer API (already implemented)

// Hooks
export { useCriticalAction } from './core/use-critical-action';
export { useLocalCache } from './core/use-local-cache';

// Layouts
export { CriticalZone } from './layouts/critical-zone';
export { MachineryLayout } from './layouts/machinery-layout';
export { GlassLayout } from './layouts/glass-layout';

// Lenses
export { DefaultLens, StrictLens, A11yLens } from './lenses';
export { useLens, LensProvider } from './lenses';

// Zone Resolution
export { resolveZone, resolveZoneForPath } from './core/zone-resolver';
```

---

## 6. Error Handling Strategy

### 6.1 Error Categories

| Category | Example | Handling |
|----------|---------|----------|
| Parse Error | Invalid YAML syntax | Log error, use defaults |
| Validation Error | Missing required field | Log warning, skip entry |
| File Not Found | Constitution missing | Return empty/defaults |
| Lock Conflict | Decision already locked | Return existing decision |

### 6.2 Error Response Format

```typescript
interface ProcessError {
  code: string;
  message: string;
  path?: string;
  details?: unknown;
}

// Example errors
const ERRORS = {
  CONSTITUTION_PARSE_ERROR: 'Failed to parse constitution YAML',
  DECISION_NOT_FOUND: 'Decision not found',
  INVALID_LOCK_SCOPE: 'Invalid lock scope',
  DECISION_ALREADY_LOCKED: 'Decision is already locked',
  LENS_STACK_INVALID: 'Lens combination not allowed',
};
```

### 6.3 Graceful Degradation

If Process layer files are missing or invalid:
- Constitution: Assume no protected capabilities (warn)
- Decisions: Return empty array
- Lens Array: Use default persona only
- Vibe Checks: Skip surveys

---

## 7. Testing Strategy

### 7.1 Testing Pyramid

| Level | Coverage Target | Tools |
|-------|-----------------|-------|
| Unit | 80% | Vitest |
| Integration | Key flows | Vitest |
| E2E | Critical paths | Playwright |

### 7.2 Process Layer Tests

```typescript
// __tests__/process/constitution-reader.test.ts

describe('ConstitutionReader', () => {
  it('parses valid constitution YAML', async () => {
    const constitution = await readConstitution('fixtures/valid-constitution.yaml');
    expect(constitution.protected).toHaveLength(8);
  });

  it('identifies protected capabilities', async () => {
    const constitution = await readConstitution('fixtures/valid-constitution.yaml');
    expect(isCapabilityProtected(constitution, 'withdraw')).toBe(true);
    expect(isCapabilityProtected(constitution, 'nonexistent')).toBe(false);
  });

  it('handles missing file gracefully', async () => {
    const constitution = await readConstitution('nonexistent.yaml');
    expect(constitution.protected).toEqual([]);
  });
});
```

### 7.3 Decision Lock Tests

```typescript
// __tests__/process/decision-reader.test.ts

describe('DecisionReader', () => {
  it('locks a decision with correct expiry', async () => {
    const decision = await lockDecision(
      'button color',
      'Blue',
      'direction',
      { zone: 'critical' },
      'Industry standard',
      'engineer@example.com'
    );

    const expiryDays = (new Date(decision.expires_at).getTime() - Date.now())
      / (24 * 60 * 60 * 1000);
    expect(expiryDays).toBeCloseTo(90, 0);
  });

  it('detects expired decisions', () => {
    const expiredDecision = {
      expires_at: '2020-01-01T00:00:00Z',
      status: 'locked',
    } as Decision;

    expect(isDecisionExpired(expiredDecision)).toBe(true);
  });
});
```

---

## 8. Development Phases

### Phase 1: Process Foundation (Sprint 1-2)

- [ ] Constitution system
  - [ ] YAML schema and validation
  - [ ] ConstitutionReader implementation
  - [ ] JSON Schema for validation
- [ ] Consultation Chamber
  - [ ] Decision schema and validation
  - [ ] DecisionReader implementation
  - [ ] Lock/unlock functionality
- [ ] /craft command (basic)
- [ ] /consult command

### Phase 2: Persona System (Sprint 3-4)

- [ ] Lens Array
  - [ ] UserPersona schema
  - [ ] LensArrayReader implementation
  - [ ] Stacking validation
- [ ] Zone-persona integration
  - [ ] Zone → persona mapping
  - [ ] Persona physics surfacing
- [ ] /craft command (persona-aware)

### Phase 3: Feedback Loop (Sprint 5-6)

- [ ] Vibe Checks
  - [ ] Survey trigger system
  - [ ] Cooldown management
  - [ ] Response recording
- [ ] Pattern detection
- [ ] Research dashboard integration (optional)

### Phase 4: Polish & Documentation (Sprint 7)

- [ ] CLAUDE.md updates
- [ ] Command documentation
- [ ] Migration guide from v2.0
- [ ] Example project

---

## 9. Known Risks and Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| YAML parsing errors break workflow | Medium | High | Graceful degradation, defaults |
| Lock periods too restrictive | Medium | Medium | Configurable per-project |
| AI misinterprets Constitution | Low | High | Explicit CLAUDE.md instructions |
| Persona explosion (too many) | Medium | Low | Limit to 4-6 core personas |
| Decision bikeshedding on scope | Medium | Low | Clear guidelines in /consult |

---

## 10. Open Questions

| Question | Owner | Due Date | Status |
|----------|-------|----------|--------|
| Should decisions support team voting? | Product | TBD | Open |
| Remote config for Constitution? | Engineering | TBD | Open |
| Vibe check analytics destination? | Product | TBD | Open |

---

## 11. Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| **Constitution** | YAML file defining capabilities that always work |
| **User Persona** | Definition of a user type with physics and constraints |
| **Visual Lens** | React component that renders UI (DefaultLens, etc.) |
| **Decision Lock** | Time-limited protection against reopening a decision |
| **Vibe Check** | Micro-survey triggered by user action |
| **Zone** | File path pattern with associated motion/timing |

### B. References

- PRD: `loa-grimoire/prd.md`
- Sigil v2.0 PRD (archived): `loa-grimoire/archive/prd-v2.0.md`
- Sigil Core implementation: `sigil-mark/`
- Claude Code documentation: CLAUDE.md

### C. Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-06 | Initial version | Architecture Designer Agent |

---

*Generated by Architecture Designer Agent*
