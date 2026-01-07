# Sigil v3.0 SDD — "Living Engine"

**Version:** 3.0.0
**Codename:** Living Engine
**Status:** Draft
**Date:** 2026-01-06

---

## Executive Summary

This Software Design Document describes the architecture for Sigil v3.0 "Living Engine," addressing the fatal runtime bugs and product strategy gaps identified in the v2.6 review. The key architectural change is separating **agent-time** concerns (Process layer) from **runtime** concerns (Core/Layout/Lens layers).

### Architecture Philosophy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AGENT TIME (Generation)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ Constitution │  │  Vocabulary  │  │   Personas   │  │ Philosophy │  │
│  │    (YAML)    │  │    (YAML)    │  │    (YAML)    │  │   (YAML)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │
│                              │                                          │
│                    Agent reads & embeds context                         │
│                              ↓                                          │
│                   ┌──────────────────┐                                  │
│                   │   CLAUDE.md +    │                                  │
│                   │   Generated Code │                                  │
│                   └──────────────────┘                                  │
└─────────────────────────────────────────────────────────────────────────┘
                               │
                               ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         RUNTIME (Browser)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │     Core     │  │    Layout    │  │     Lens     │                  │
│  │  (Hooks,     │  │ (CriticalZone│  │ (DefaultLens │                  │
│  │   Physics)   │  │  Machinery)  │  │  StrictLens) │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                              │                                          │
│               Pure React, no fs, no YAML parsing                        │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Insight:** Process layer is agent-context-only. Runtime never touches YAML files.

---

## System Architecture

### Layer Overview

| Layer | Purpose | Execution Context | Files |
|-------|---------|-------------------|-------|
| **Process** | Design context, decisions, vocabulary | Agent-only | `sigil-mark/process/` |
| **Core** | Physics hooks, state management | Runtime | `sigil-mark/core/` |
| **Layout** | Zone primitives, structural physics | Runtime | `sigil-mark/layouts/` |
| **Lens** | UI rendering variants | Runtime | `sigil-mark/lenses/` |

### New Components (v3.0)

| Component | Layer | Purpose |
|-----------|-------|---------|
| `vocabulary.yaml` | Process | Term → feel mapping (API surface) |
| `philosophy.yaml` | Process | Intent hierarchy, conflict resolution |
| `personas/` | Process | Renamed from lens-array/ |
| `persona_overrides` | Config | Per-zone persona customization |

---

## Component Design

### 1. Process Layer (Agent-Only)

The Process layer provides design context to the agent during code generation. It does NOT execute at runtime.

#### 1.1 Directory Structure

```
sigil-mark/
├── process/                    # Agent-only readers
│   ├── index.ts               # Barrel export (server-only)
│   ├── constitution-reader.ts # Protected capabilities
│   ├── vocabulary-reader.ts   # NEW: Term → feel mapping
│   ├── persona-reader.ts      # Renamed from lens-array-reader
│   ├── decision-reader.ts     # Locked decisions
│   ├── philosophy-reader.ts   # NEW: Intent hierarchy
│   └── vibe-check-reader.ts   # Surveys + behavioral signals
│
├── constitution/              # Protected capabilities
│   └── protected-capabilities.yaml
│
├── vocabulary/                # NEW: API surface
│   ├── vocabulary.yaml
│   └── schemas/
│       └── vocabulary.schema.json
│
├── personas/                  # Renamed from lens-array/
│   ├── personas.yaml
│   └── schemas/
│       └── personas.schema.json
│
├── soul-binder/               # NEW: Philosophy/Intent
│   ├── philosophy.yaml
│   └── schemas/
│       └── philosophy.schema.json
│
└── surveys/                   # Vibe checks
    └── vibe-checks.yaml
```

#### 1.2 Process Layer Export Strategy

```typescript
// sigil-mark/process/index.ts

// Mark entire module as server-only
// This prevents bundlers from including it in browser bundles

/**
 * @module process
 * @server-only
 *
 * The Process layer is for AGENT USE ONLY.
 * These functions read YAML files and are not compatible with browser environments.
 *
 * DO NOT import this module in client-side code.
 * DO NOT use ProcessContextProvider (removed in v3.0).
 */

// Constitution
export { readConstitution, readConstitutionSync } from './constitution-reader';
export type { Constitution, ProtectedCapability } from './constitution-reader';

// Vocabulary (NEW)
export { readVocabulary, readVocabularySync, getTerm, getTermFeel } from './vocabulary-reader';
export type { Vocabulary, VocabularyTerm, TermFeel } from './vocabulary-reader';

// Personas (renamed from lens-array)
export { readPersonas, readPersonasSync, getPersona } from './persona-reader';
export type { PersonaArray, Persona } from './persona-reader';

// Decisions
export { readAllDecisions, getActiveDecisions } from './decision-reader';
export type { Decision } from './decision-reader';

// Philosophy (NEW)
export { readPhilosophy, resolveConflict } from './philosophy-reader';
export type { Philosophy, Principle, ConflictResolution } from './philosophy-reader';

// Vibe Checks
export { readVibeChecks, getBehavioralSignals } from './vibe-check-reader';
export type { VibeCheck, BehavioralSignal } from './vibe-check-reader';

// REMOVED: ProcessContextProvider (caused browser crashes)
// Migration: Use agent protocol to embed context at generation time
```

#### 1.3 Vocabulary Reader Design

```typescript
// sigil-mark/process/vocabulary-reader.ts

import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';

// =============================================================================
// TYPES
// =============================================================================

export interface TermFeel {
  material: 'glass' | 'machinery' | 'decisive';
  motion: 'warm' | 'deliberate' | 'snappy' | 'celebratory_then_deliberate';
  tone: 'friendly' | 'serious' | 'exciting' | 'reassuring';
}

export interface VocabularyTerm {
  /** Internal engineering name */
  engineering_name: string;
  /** User-facing display name */
  user_facing: string;
  /** Mental model description */
  mental_model: string;
  /** Recommended feel for this term */
  recommended: TermFeel;
  /** Zones where this term typically appears */
  zones: string[];
}

export interface Vocabulary {
  version: string;
  terms: Record<string, VocabularyTerm>;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const DEFAULT_VOCABULARY: Vocabulary = {
  version: '3.0.0',
  terms: {},
};

// =============================================================================
// READER
// =============================================================================

const DEFAULT_PATH = 'sigil-mark/vocabulary/vocabulary.yaml';

export async function readVocabulary(
  filePath: string = DEFAULT_PATH
): Promise<Vocabulary> {
  try {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    const content = await fs.readFile(resolvedPath, 'utf-8');
    const parsed = yaml.parse(content);

    return validateVocabulary(parsed);
  } catch (error) {
    console.warn(`[Sigil Vocabulary] Could not read ${filePath}, using defaults`);
    return DEFAULT_VOCABULARY;
  }
}

export function readVocabularySync(filePath: string = DEFAULT_PATH): Vocabulary {
  try {
    const fsSync = require('fs');
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    const content = fsSync.readFileSync(resolvedPath, 'utf-8');
    const parsed = yaml.parse(content);

    return validateVocabulary(parsed);
  } catch (error) {
    console.warn(`[Sigil Vocabulary] Could not read ${filePath}, using defaults`);
    return DEFAULT_VOCABULARY;
  }
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get a term from the vocabulary.
 */
export function getTerm(
  vocabulary: Vocabulary,
  termId: string
): VocabularyTerm | undefined {
  return vocabulary.terms[termId.toLowerCase()];
}

/**
 * Get the recommended feel for a term.
 * Falls back to zone defaults if term not found.
 */
export function getTermFeel(
  vocabulary: Vocabulary,
  termId: string,
  zoneFallback: Partial<TermFeel> = {}
): TermFeel {
  const term = getTerm(vocabulary, termId);

  if (term) {
    return term.recommended;
  }

  // Fallback to zone defaults
  return {
    material: zoneFallback.material ?? 'machinery',
    motion: zoneFallback.motion ?? 'deliberate',
    tone: zoneFallback.tone ?? 'serious',
  };
}

// =============================================================================
// VALIDATION
// =============================================================================

function validateVocabulary(data: unknown): Vocabulary {
  if (!data || typeof data !== 'object') {
    return DEFAULT_VOCABULARY;
  }

  const obj = data as Record<string, unknown>;

  return {
    version: typeof obj.version === 'string' ? obj.version : '3.0.0',
    terms: validateTerms(obj.terms),
  };
}

function validateTerms(terms: unknown): Record<string, VocabularyTerm> {
  if (!terms || typeof terms !== 'object') {
    return {};
  }

  const result: Record<string, VocabularyTerm> = {};

  for (const [key, value] of Object.entries(terms as Record<string, unknown>)) {
    if (isValidTerm(value)) {
      result[key.toLowerCase()] = value;
    }
  }

  return result;
}

function isValidTerm(value: unknown): value is VocabularyTerm {
  if (!value || typeof value !== 'object') return false;

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.engineering_name === 'string' &&
    typeof obj.user_facing === 'string' &&
    typeof obj.mental_model === 'string' &&
    obj.recommended && typeof obj.recommended === 'object' &&
    Array.isArray(obj.zones)
  );
}
```

#### 1.4 Philosophy Reader Design

```typescript
// sigil-mark/process/philosophy-reader.ts

import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';

// =============================================================================
// TYPES
// =============================================================================

export interface Principle {
  id: string;
  when: string;
  decision: string;
  rationale: string;
}

export interface ConflictResolution {
  [conflict: string]: string; // e.g., "trust_vs_speed": "trust_wins"
}

export interface Philosophy {
  version: string;
  intent: {
    primary: string;
    secondary: string;
  };
  principles: Principle[];
  conflict_resolution: ConflictResolution;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const DEFAULT_PHILOSOPHY: Philosophy = {
  version: '3.0.0',
  intent: {
    primary: 'Protect user trust in high-stakes moments',
    secondary: 'Enable power user efficiency without sacrificing newcomer safety',
  },
  principles: [
    {
      id: 'trust_over_speed',
      when: 'Trust conflicts with speed',
      decision: 'Trust wins',
      rationale: 'Speed can be recovered. Trust cannot.',
    },
    {
      id: 'newcomer_safety',
      when: 'Newcomer needs conflict with power user preferences',
      decision: 'Newcomer safety first',
      rationale: 'Power users can customize. Newcomers cannot recover from mistakes.',
    },
  ],
  conflict_resolution: {
    trust_vs_speed: 'trust_wins',
    newcomer_vs_power_user: 'newcomer_safety_first',
    marketing_vs_security: 'security_wins',
  },
};

// =============================================================================
// READER
// =============================================================================

const DEFAULT_PATH = 'sigil-mark/soul-binder/philosophy.yaml';

export async function readPhilosophy(
  filePath: string = DEFAULT_PATH
): Promise<Philosophy> {
  try {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    const content = await fs.readFile(resolvedPath, 'utf-8');
    const parsed = yaml.parse(content);

    return validatePhilosophy(parsed);
  } catch (error) {
    console.warn(`[Sigil Philosophy] Could not read ${filePath}, using defaults`);
    return DEFAULT_PHILOSOPHY;
  }
}

// =============================================================================
// CONFLICT RESOLUTION
// =============================================================================

/**
 * Resolve a conflict using the philosophy's conflict resolution rules.
 *
 * @param philosophy - The philosophy configuration
 * @param conflict - The conflict key (e.g., "trust_vs_speed")
 * @returns The winning principle ID, or null if conflict not defined
 */
export function resolveConflict(
  philosophy: Philosophy,
  conflict: string
): string | null {
  return philosophy.conflict_resolution[conflict] ?? null;
}

// =============================================================================
// VALIDATION
// =============================================================================

function validatePhilosophy(data: unknown): Philosophy {
  if (!data || typeof data !== 'object') {
    return DEFAULT_PHILOSOPHY;
  }

  const obj = data as Record<string, unknown>;

  return {
    version: typeof obj.version === 'string' ? obj.version : '3.0.0',
    intent: validateIntent(obj.intent),
    principles: validatePrinciples(obj.principles),
    conflict_resolution: validateConflictResolution(obj.conflict_resolution),
  };
}

function validateIntent(intent: unknown): Philosophy['intent'] {
  if (!intent || typeof intent !== 'object') {
    return DEFAULT_PHILOSOPHY.intent;
  }

  const obj = intent as Record<string, unknown>;

  return {
    primary: typeof obj.primary === 'string' ? obj.primary : DEFAULT_PHILOSOPHY.intent.primary,
    secondary: typeof obj.secondary === 'string' ? obj.secondary : DEFAULT_PHILOSOPHY.intent.secondary,
  };
}

function validatePrinciples(principles: unknown): Principle[] {
  if (!Array.isArray(principles)) {
    return DEFAULT_PHILOSOPHY.principles;
  }

  return principles.filter(isValidPrinciple);
}

function isValidPrinciple(value: unknown): value is Principle {
  if (!value || typeof value !== 'object') return false;

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.when === 'string' &&
    typeof obj.decision === 'string' &&
    typeof obj.rationale === 'string'
  );
}

function validateConflictResolution(resolution: unknown): ConflictResolution {
  if (!resolution || typeof resolution !== 'object') {
    return DEFAULT_PHILOSOPHY.conflict_resolution;
  }

  const result: ConflictResolution = {};

  for (const [key, value] of Object.entries(resolution as Record<string, unknown>)) {
    if (typeof value === 'string') {
      result[key] = value;
    }
  }

  return result;
}
```

---

### 2. Vocabulary Layer Schema

```yaml
# sigil-mark/vocabulary/vocabulary.yaml
version: "3.0.0"

terms:
  # Financial containers
  pot:
    engineering_name: "savings_container"
    user_facing: "Pot"
    mental_model: "Piggy bank, casual saving"
    recommended:
      material: glass
      motion: warm
      tone: friendly
    zones: [marketing, dashboard]

  vault:
    engineering_name: "savings_container"
    user_facing: "Vault"
    mental_model: "Bank vault, security"
    recommended:
      material: machinery
      motion: deliberate
      tone: serious
    zones: [critical]

  # Actions
  claim:
    engineering_name: "reward_claim"
    user_facing: "Claim"
    mental_model: "Receiving earned reward"
    recommended:
      material: decisive
      motion: celebratory_then_deliberate
      tone: exciting
    zones: [critical]

  deposit:
    engineering_name: "deposit_funds"
    user_facing: "Deposit"
    mental_model: "Adding to your position"
    recommended:
      material: decisive
      motion: deliberate
      tone: reassuring
    zones: [critical]

  withdraw:
    engineering_name: "withdraw_funds"
    user_facing: "Withdraw"
    mental_model: "Taking out your money"
    recommended:
      material: decisive
      motion: deliberate
      tone: serious
    zones: [critical]

  stake:
    engineering_name: "stake_position"
    user_facing: "Stake"
    mental_model: "Locking for rewards"
    recommended:
      material: decisive
      motion: deliberate
      tone: serious
    zones: [critical]

  # Navigation
  dashboard:
    engineering_name: "user_dashboard"
    user_facing: "Dashboard"
    mental_model: "Command center"
    recommended:
      material: machinery
      motion: snappy
      tone: serious
    zones: [admin, dashboard]

  settings:
    engineering_name: "user_settings"
    user_facing: "Settings"
    mental_model: "Control panel"
    recommended:
      material: machinery
      motion: snappy
      tone: serious
    zones: [admin]

  # States
  pending:
    engineering_name: "pending_state"
    user_facing: "Pending"
    mental_model: "Waiting for confirmation"
    recommended:
      material: machinery
      motion: deliberate
      tone: reassuring
    zones: [critical, dashboard]

  confirmed:
    engineering_name: "confirmed_state"
    user_facing: "Confirmed"
    mental_model: "Successfully completed"
    recommended:
      material: glass
      motion: celebratory_then_deliberate
      tone: friendly
    zones: [critical, dashboard]
```

```json
// sigil-mark/vocabulary/schemas/vocabulary.schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://sigil.dev/schemas/vocabulary.schema.json",
  "title": "Sigil Vocabulary Schema",
  "description": "Maps product terms to design recommendations",
  "type": "object",
  "required": ["version", "terms"],
  "properties": {
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    "terms": {
      "type": "object",
      "additionalProperties": {
        "$ref": "#/definitions/VocabularyTerm"
      }
    }
  },
  "definitions": {
    "VocabularyTerm": {
      "type": "object",
      "required": ["engineering_name", "user_facing", "mental_model", "recommended", "zones"],
      "properties": {
        "engineering_name": {
          "type": "string",
          "description": "Internal engineering identifier"
        },
        "user_facing": {
          "type": "string",
          "description": "User-facing display name"
        },
        "mental_model": {
          "type": "string",
          "description": "Description of the mental model this term evokes"
        },
        "recommended": {
          "$ref": "#/definitions/TermFeel"
        },
        "zones": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "TermFeel": {
      "type": "object",
      "required": ["material", "motion", "tone"],
      "properties": {
        "material": {
          "type": "string",
          "enum": ["glass", "machinery", "decisive"]
        },
        "motion": {
          "type": "string",
          "enum": ["warm", "deliberate", "snappy", "celebratory_then_deliberate", "reassuring"]
        },
        "tone": {
          "type": "string",
          "enum": ["friendly", "serious", "exciting", "reassuring"]
        }
      }
    }
  }
}
```

---

### 3. Persona System (Renamed from Lens Array)

#### 3.1 Directory Rename

```
OLD: sigil-mark/lens-array/
NEW: sigil-mark/personas/

OLD: sigil-mark/lens-array/lenses.yaml
NEW: sigil-mark/personas/personas.yaml
```

#### 3.2 Backwards Compatibility

```typescript
// sigil-mark/process/persona-reader.ts

// ... main implementation ...

// =============================================================================
// BACKWARDS COMPATIBILITY (Deprecated)
// =============================================================================

/**
 * @deprecated Use readPersonas instead. Will be removed in v4.0.
 */
export const readLensArray = readPersonas;

/**
 * @deprecated Use PersonaArray instead. Will be removed in v4.0.
 */
export type LensArray = PersonaArray;

// Log deprecation warning on first use
let hasWarnedLensArray = false;
export function warnLensArrayDeprecation() {
  if (!hasWarnedLensArray) {
    console.warn(
      '[Sigil] "LensArray" is deprecated. Use "PersonaArray" instead. ' +
      'The term "Lens" now refers only to UI rendering variants.'
    );
    hasWarnedLensArray = true;
  }
}
```

#### 3.3 Personas Schema

```yaml
# sigil-mark/personas/personas.yaml
version: "3.0.0"

personas:
  power_user:
    alias: "Chef"
    description: "Expert user who lives in the product"
    characteristics:
      - "Keyboard-driven navigation"
      - "High information density preference"
      - "Minimal hand-holding needed"
      - "Values speed over reassurance"
    default_lens: strict
    preferences:
      motion: snappy
      help: on_demand
      density: high

  newcomer:
    alias: "Henlocker"
    description: "New user learning the product"
    characteristics:
      - "Needs guidance through flows"
      - "Appreciates reassurance"
      - "Click-driven navigation"
      - "Values clarity over density"
    default_lens: guided
    preferences:
      motion: reassuring
      help: always
      density: low

  mobile:
    alias: "Mobile User"
    description: "User on mobile device"
    characteristics:
      - "Touch-first interaction"
      - "Limited screen space"
      - "May be in low-attention context"
    default_lens: default
    preferences:
      motion: warm
      help: contextual
      density: medium
      touch_targets: 56px

  accessibility:
    alias: "A11y User"
    description: "User requiring accessibility accommodations"
    characteristics:
      - "May use screen reader"
      - "May have motor limitations"
      - "Requires WCAG AAA compliance"
    default_lens: a11y
    preferences:
      motion: reduced
      help: always
      density: low
      touch_targets: 56px
      animations: false
```

---

### 4. Persona Fluidity System

#### 4.1 Configuration Schema

```yaml
# .sigilrc.yaml (updated)
sigil: "3.0.0"
codename: "Living Engine"

zones:
  critical:
    layout: CriticalZone
    timeAuthority: server-tick
    default_persona: power_user
    persona_overrides:
      newcomer:
        lens: guided
        motion: reassuring
        show_help: always
        confirmation_style: explicit
      power_user:
        lens: strict
        motion: snappy
        show_help: on_demand
        confirmation_style: inline

  marketing:
    layout: GlassLayout
    timeAuthority: optimistic
    default_persona: newcomer
    persona_overrides:
      power_user:
        lens: default
        motion: playful
        show_help: never
        density: high

  admin:
    layout: MachineryLayout
    timeAuthority: optimistic
    default_persona: power_user
    # No persona_overrides - admin is always power_user
```

#### 4.2 Runtime Persona Detection

```typescript
// sigil-mark/core/persona-context.tsx

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

// =============================================================================
// TYPES
// =============================================================================

export type PersonaId = 'power_user' | 'newcomer' | 'mobile' | 'accessibility' | string;

export interface PersonaPreferences {
  lens?: string;
  motion?: string;
  show_help?: 'always' | 'on_demand' | 'never' | 'contextual';
  density?: 'high' | 'medium' | 'low';
  confirmation_style?: 'inline' | 'explicit';
}

export interface PersonaContextValue {
  /** Current persona ID */
  personaId: PersonaId;
  /** Persona preferences */
  preferences: PersonaPreferences;
  /** Set the current persona */
  setPersona: (id: PersonaId) => void;
  /** Detect persona from device/context */
  detectPersona: () => PersonaId;
}

// =============================================================================
// CONTEXT
// =============================================================================

const PersonaContext = createContext<PersonaContextValue | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

export interface PersonaProviderProps {
  children: ReactNode;
  /** Initial persona (optional, will auto-detect if not provided) */
  initialPersona?: PersonaId;
  /** Persona preference storage key */
  storageKey?: string;
}

export function PersonaProvider({
  children,
  initialPersona,
  storageKey = 'sigil-persona',
}: PersonaProviderProps) {
  // Detect persona from context
  const detectPersona = useCallback((): PersonaId => {
    // Check localStorage for saved preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) return saved as PersonaId;
    }

    // Check for mobile
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'mobile';
    }

    // Check for accessibility preferences
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        return 'accessibility';
      }
    }

    // Default to newcomer for new sessions
    return 'newcomer';
  }, [storageKey]);

  const [personaId, setPersonaId] = useState<PersonaId>(
    initialPersona ?? detectPersona()
  );

  // Get preferences for current persona (these would come from config)
  const preferences = useMemo((): PersonaPreferences => {
    switch (personaId) {
      case 'power_user':
        return { motion: 'snappy', show_help: 'on_demand', density: 'high' };
      case 'newcomer':
        return { motion: 'reassuring', show_help: 'always', density: 'low' };
      case 'mobile':
        return { motion: 'warm', show_help: 'contextual', density: 'medium' };
      case 'accessibility':
        return { motion: 'reduced', show_help: 'always', density: 'low' };
      default:
        return { motion: 'deliberate', show_help: 'contextual', density: 'medium' };
    }
  }, [personaId]);

  const setPersona = useCallback((id: PersonaId) => {
    setPersonaId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, id);
    }
  }, [storageKey]);

  const value = useMemo<PersonaContextValue>(() => ({
    personaId,
    preferences,
    setPersona,
    detectPersona,
  }), [personaId, preferences, setPersona, detectPersona]);

  return (
    <PersonaContext.Provider value={value}>
      {children}
    </PersonaContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

export function usePersona(): PersonaContextValue {
  const context = useContext(PersonaContext);

  if (!context) {
    // Return sensible defaults if no provider
    return {
      personaId: 'newcomer',
      preferences: { motion: 'deliberate', show_help: 'contextual' },
      setPersona: () => {},
      detectPersona: () => 'newcomer',
    };
  }

  return context;
}
```

---

### 5. Zone Configuration with Persona Overrides

#### 5.1 Zone Context Update

```typescript
// sigil-mark/layouts/context.ts (updated)

export interface ZoneContextValue {
  /** Zone type */
  type: 'critical' | 'admin' | 'marketing' | 'default';
  /** Whether zone handles financial operations */
  financial?: boolean;
  /** Time authority mode */
  timeAuthority: 'server-tick' | 'optimistic';
  /** Default persona for this zone */
  defaultPersona?: string;
  /** Persona overrides for this zone */
  personaOverrides?: Record<string, PersonaPreferences>;
}

/**
 * Get effective preferences by merging zone defaults with persona overrides.
 */
export function getEffectivePreferences(
  zone: ZoneContextValue,
  personaId: string
): PersonaPreferences {
  const zoneDefaults: PersonaPreferences = {
    motion: zone.type === 'critical' ? 'deliberate' : 'warm',
    show_help: zone.type === 'marketing' ? 'always' : 'on_demand',
  };

  const personaOverride = zone.personaOverrides?.[personaId] ?? {};

  return {
    ...zoneDefaults,
    ...personaOverride,
  };
}
```

---

### 6. Philosophy Layer Schema

```yaml
# sigil-mark/soul-binder/philosophy.yaml
version: "3.0.0"

intent:
  primary: "Protect user trust in high-stakes moments"
  secondary: "Enable power user efficiency without sacrificing newcomer safety"

principles:
  - id: trust_over_speed
    when: "Trust conflicts with speed"
    decision: "Trust wins"
    rationale: "Speed can be recovered. Trust cannot."

  - id: newcomer_safety
    when: "Newcomer needs conflict with power user preferences"
    decision: "Newcomer safety first"
    rationale: "Power users can customize. Newcomers can't recover from mistakes."

  - id: security_over_marketing
    when: "Marketing wants to modify protected capabilities"
    decision: "Security wins"
    rationale: "Constitution exists for a reason."

  - id: clarity_over_density
    when: "Information density conflicts with comprehension"
    decision: "Clarity wins for newcomers, density wins for power users"
    rationale: "Persona determines the tradeoff."

  - id: feedback_over_silence
    when: "Action needs acknowledgment but space is limited"
    decision: "Always provide feedback"
    rationale: "Users should never wonder if their action worked."

conflict_resolution:
  trust_vs_speed: trust_wins
  newcomer_vs_power_user: newcomer_safety_first
  marketing_vs_security: security_wins
  clarity_vs_density: persona_dependent
  feedback_vs_space: feedback_wins
```

---

### 7. Skill Rewrites (Philosophy Alignment)

#### 7.1 consulting-decisions/SKILL.md

```markdown
# Consulting Decisions Skill

> "Record your deliberated decision. Lock it. Return to flow."

## Philosophy

This skill helps craftsmen **record decisions they've already made**.
It does NOT make decisions for them.

The craftsman should:
1. **Deliberate deeply** — Consider tradeoffs, consult stakeholders
2. **Reach a conclusion** — Through their own judgment
3. **Use /consult to lock it** — So the decision persists

## What This Skill Does

- Records the decision with rationale
- Applies appropriate time lock based on scope
- Creates audit trail
- Prevents future bikeshedding on decided topics

## What This Skill Does NOT Do

- Make decisions for the craftsman
- Rush the deliberation process
- Override existing locked decisions
```

#### 7.2 crafting-guidance/SKILL.md

```markdown
# Crafting Guidance Skill

> "Here are the tradeoffs to consider."

## Philosophy

This skill provides **context for decision-making**, not mandates.

The agent:
- Presents relevant options
- Explains tradeoffs clearly
- Cites vocabulary recommendations
- Respects locked decisions
- Does NOT make taste decisions

## Output Format

When presenting options:

### Option A: [Name]
**Tradeoffs:**
- Pro: [benefit]
- Con: [cost]
**Recommended when:** [context]

### Option B: [Name]
**Tradeoffs:**
- Pro: [benefit]
- Con: [cost]
**Recommended when:** [context]

### Vocabulary Note
The term "[term]" has mental model "[model]" which suggests [recommendation].

### Your Call
Choose based on your product context. Use `/consult` to lock your decision.
```

---

### 8. Updated Main Export

```typescript
// sigil-mark/index.ts

/**
 * Sigil v3.0 — Living Engine
 *
 * Design context framework for AI-assisted UI development.
 *
 * Architecture:
 * - Process (Agent-Only): Constitution, Vocabulary, Personas, Philosophy
 * - Core (Runtime): Physics hooks, state management
 * - Layout (Runtime): Zone primitives
 * - Lens (Runtime): UI rendering variants
 */

// =============================================================================
// VERSION
// =============================================================================

export const VERSION = '3.0.0';
export const CODENAME = "Living Engine";

// =============================================================================
// CORE (Runtime)
// =============================================================================

// Zone Resolution
export { resolveZone, getPersonaForZone } from './core/zone-resolver';
export type { ZoneConfig, PersonaId } from './core/zone-resolver';

// Persona Context (Runtime)
export { PersonaProvider, usePersona } from './core/persona-context';
export type { PersonaContextValue, PersonaPreferences } from './core/persona-context';

// Physics
export { useLocalCache, createLocalCache } from './core/use-local-cache';
export type { LocalCacheOptions, LocalCacheState } from './core/use-local-cache';

// =============================================================================
// LAYOUTS (Runtime)
// =============================================================================

export { CriticalZone } from './layouts/critical-zone';
export { MachineryLayout } from './layouts/machinery-layout';
export { GlassLayout } from './layouts/glass-layout';
export { ZoneContext, useZone, getEffectivePreferences } from './layouts/context';
export type { ZoneContextValue } from './layouts/context';

// =============================================================================
// LENSES (Runtime)
// =============================================================================

export { LensProvider, useLensPreference, useLens } from './lenses';
export { DefaultLens } from './lenses/default';
export { StrictLens } from './lenses/strict';
export { A11yLens } from './lenses/a11y';
export type { Lens, LensPreference } from './lenses/types';

// =============================================================================
// TYPES
// =============================================================================

export type * from './types';

// =============================================================================
// PROCESS (Agent-Only) — NOT EXPORTED TO RUNTIME
// =============================================================================

// The Process layer is intentionally NOT exported here.
// It uses Node.js fs and is only for agent use during code generation.
//
// To use Process functions, import directly:
//   import { readConstitution } from 'sigil-mark/process';
//
// This import will fail in browser environments (by design).
```

---

## Data Architecture

### YAML File Locations

| File | Purpose | Read By |
|------|---------|---------|
| `sigil-mark/constitution/protected-capabilities.yaml` | Protected capabilities | Agent |
| `sigil-mark/vocabulary/vocabulary.yaml` | Term → feel mapping | Agent |
| `sigil-mark/personas/personas.yaml` | User personas | Agent |
| `sigil-mark/soul-binder/philosophy.yaml` | Intent hierarchy | Agent |
| `sigil-mark/surveys/vibe-checks.yaml` | Surveys + signals | Agent |
| `sigil-mark/consultation-chamber/decisions/*.yaml` | Locked decisions | Agent |
| `.sigilrc.yaml` | Zone configuration | Agent + Runtime (build-time embed) |

### JSON Schema Validation

All YAML files have corresponding JSON Schema for validation:

| YAML File | Schema |
|-----------|--------|
| vocabulary.yaml | `vocabulary/schemas/vocabulary.schema.json` |
| personas.yaml | `personas/schemas/personas.schema.json` |
| philosophy.yaml | `soul-binder/schemas/philosophy.schema.json` |
| vibe-checks.yaml | `surveys/schemas/vibe-checks.schema.json` |

---

## Security Architecture

### Process Layer Isolation

The Process layer is isolated from browser bundles:

1. **No runtime exports** — Process functions not in main index.ts
2. **Server-only imports** — `import from 'sigil-mark/process'` fails in browser
3. **Build-time validation** — YAML validated at build, not runtime
4. **No secrets** — YAML files contain configuration, not credentials

### Constitution Protection

Protected capabilities are enforced via:
1. Agent checks Constitution before generating code
2. Constitution warnings surfaced in /craft output
3. Override requires explicit audit entry

---

## Migration Strategy

### v2.6 → v3.0 Migration

| Change | Migration |
|--------|-----------|
| ProcessContextProvider removed | Use agent protocol for context |
| lens-array/ → personas/ | Update imports, backwards compat available |
| LensArray → PersonaArray | Update types, alias available |
| Path-based zones removed | Use Layout components only |
| vocabulary.yaml required | Create with initial terms |
| philosophy.yaml required | Create or use defaults |

### Backwards Compatibility

```typescript
// These still work (with deprecation warnings):
import { readLensArray } from 'sigil-mark/process';  // → readPersonas
import { LensArray } from 'sigil-mark/process';      // → PersonaArray

// These are removed (breaking):
import { ProcessContextProvider } from 'sigil-mark'; // REMOVED
```

---

## Testing Strategy

### Unit Tests

| Component | Test File |
|-----------|-----------|
| vocabulary-reader | `__tests__/process/vocabulary-reader.test.ts` |
| philosophy-reader | `__tests__/process/philosophy-reader.test.ts` |
| persona-reader | `__tests__/process/persona-reader.test.ts` |
| persona-context | `__tests__/core/persona-context.test.tsx` |

### Integration Tests

| Scenario | Test |
|----------|------|
| Agent reads vocabulary | `__tests__/integration/agent-vocabulary.test.ts` |
| Persona fluidity | `__tests__/integration/persona-fluidity.test.tsx` |
| Zone + Persona override | `__tests__/integration/zone-persona.test.tsx` |

---

## Remote Configuration Architecture (v3.0)

### Overview

Sigil v3.0 introduces a remote configuration layer with clear separation between **marketing-controlled** and **engineering-controlled** values.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONFIGURATION LAYERS                                │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    MARKETING CONTROLLED                              │  │
│  │  • UI Copy           • Feature Flags (visibility only)              │  │
│  │  • Promotions        • Survey Trigger Enablement                    │  │
│  │                                                                      │  │
│  │  ✓ Can change without engineering approval                          │  │
│  │  ✓ Safe to A/B test                                                 │  │
│  │  ✓ Remote-capable                                                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    ENGINEERING CONTROLLED                            │  │
│  │  • Physics           • Rate Limits       • Security Settings        │  │
│  │  • Timeouts          • Validation Rules                             │  │
│  │                                                                      │  │
│  │  ✗ Requires engineering review                                      │  │
│  │  ✗ Physics are ALWAYS local (constitutional constraint)             │  │
│  │  ✗ Security settings are local-only                                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Constraints

1. **Physics are ALWAYS local** — Never remote. Physics affect trust.
2. **Security settings are local** — Never allow remote override.
3. **Marketing can modify copy** — Without engineering approval.
4. **Fallback to local YAML** — When remote provider is unavailable.

### Directory Structure

```
sigil-mark/remote-config/
├── remote-config.yaml           # Configuration file
└── schemas/
    └── remote-config.schema.json  # JSON Schema validation
```

### Integration Providers

| Provider | Status | Use Case |
|----------|--------|----------|
| `local_yaml` | Default | Development, single-tenant |
| `launchdarkly` | Supported | Enterprise, A/B testing |
| `statsig` | Supported | Growth, analytics-heavy |
| `firebase` | Supported | Mobile apps |
| `custom` | Supported | Self-hosted |

### Behavioral Signals (v3.0)

Vibe checks now support **behavioral signals** — passive observation patterns that don't interrupt users.

```yaml
behavioral_signals:
  - id: rage_clicking
    triggers:
      - event: element_click
        count_threshold: 3
        within_ms: 2000
    insight: "User expects something to happen that isn't"
    severity: high
```

**Signal Categories:**
- Information Seeking (tooltip hover, help clicks)
- Frustration Patterns (rage clicking, back button loop)
- Trust Patterns (security checking, price comparison)
- Engagement Patterns (content skimming, deep engagement)

---

## Technical Risks

| Risk | Mitigation |
|------|------------|
| Process imports in browser | Build-time check, clear error messages |
| Vocabulary term conflicts | JSON Schema validation |
| Persona detection accuracy | Fallback to safe defaults (newcomer) |
| Philosophy conflicts undefined | Default conflict resolution |

---

## Future Considerations

### v3.1 (Post-Launch)

- ESLint plugin for Process import detection
- CI/CD integration for YAML validation
- Build-time vocabulary embedding

### v3.2 (Feature)

- Remote config integration (LaunchDarkly)
- A/B testing for vibe flags
- Behavioral signal analytics

### v4.0 (Scale)

- Visual vocabulary editor
- Real-time persona detection (ML)
- Cross-product vocabulary sharing

---

*Sources: loa-grimoire/prd.md, loa-grimoire/context/SIGIL-v2.6-REVIEW.md*
