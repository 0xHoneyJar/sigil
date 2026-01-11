# Sigil v4.1 SDD — "Living Guardrails"

**Version:** 4.1.0
**Codename:** Living Guardrails
**Status:** Draft
**Date:** 2026-01-07

---

## Executive Summary

This Software Design Document describes the architecture for Sigil v4.1 "Living Guardrails", which adds enforcement capabilities to the existing v4.0 context documentation system.

### Core Architecture Additions

| Component | Purpose | Type |
|-----------|---------|------|
| `useSigilMutation` | Zone+Persona-aware mutation hook | Runtime (React) |
| `eslint-plugin-sigil` | Token/zone enforcement at lint time | Compile-time (ESLint) |
| `SigilProvider` | Context provider for persona + vibe state | Runtime (React) |
| `vocabulary.yaml` | Term → physics mapping | Agent-time (YAML) |
| `physics.yaml` | Motion name → timing mapping | Agent-time (YAML) |
| Remote Soul Adapter | LaunchDarkly/Statsig integration | Runtime (TypeScript) |

### Design Philosophy

```
v4.0: "Context as documentation — agents read, nothing enforces"
v4.1: "Context as enforcement — compile + runtime + agent all consume"
```

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           AGENT TIME                                     │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐  │
│  │  zone-      │   │  persona-   │   │  vocab-     │   │  physics-   │  │
│  │  reader.ts  │   │  reader.ts  │   │  reader.ts  │   │  reader.ts  │  │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘  │
│         └──────────────────┴────────────────┴──────────────────┘         │
│                                    │                                     │
│                                    ▼                                     │
│                          ┌──────────────────┐                            │
│                          │   Agent Context  │                            │
│                          │   (CLAUDE.md)    │                            │
│                          └──────────────────┘                            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          COMPILE TIME                                    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    eslint-plugin-sigil                          │    │
│  │  ┌───────────────┐  ┌────────────────┐  ┌──────────────────┐   │    │
│  │  │ enforce-      │  │ zone-          │  │ input-           │   │    │
│  │  │ tokens        │  │ compliance     │  │ physics          │   │    │
│  │  │               │  │                │  │                  │   │    │
│  │  │ "gap-[13px]"  │  │ "duration-200  │  │ "onClick without │   │    │
│  │  │ → error       │  │  in critical"  │  │  keyboard"       │   │    │
│  │  │               │  │  → warning     │  │  → warning       │   │    │
│  │  └───────────────┘  └────────────────┘  └──────────────────┘   │    │
│  └──────────────────────────────────┬──────────────────────────────┘    │
│                                     │                                    │
│                      Reads .sigilrc.yaml for rules                       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           RUNTIME                                        │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                       SigilProvider                               │   │
│  │  ┌──────────────┐  ┌───────────────┐  ┌────────────────────┐     │   │
│  │  │ ZoneContext  │  │ PersonaContext│  │ RemoteSoulContext  │     │   │
│  │  │              │  │               │  │                    │     │   │
│  │  │ Detected     │  │ User's        │  │ LaunchDarkly/      │     │   │
│  │  │ from layout  │  │ persona       │  │ Statsig vibes      │     │   │
│  │  └──────┬───────┘  └───────┬───────┘  └─────────┬──────────┘     │   │
│  │         └──────────────────┼──────────────────────┘               │   │
│  │                            ▼                                      │   │
│  │                   ┌────────────────────┐                          │   │
│  │                   │  useSigilMutation  │                          │   │
│  │                   │                    │                          │   │
│  │                   │  • Auto-resolves   │                          │   │
│  │                   │    physics         │                          │   │
│  │                   │  • Returns CSS     │                          │   │
│  │                   │    vars            │                          │   │
│  │                   │  • Enforces        │                          │   │
│  │                   │    disabled state  │                          │   │
│  │                   └────────────────────┘                          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Core Dependencies

| Technology | Version | Justification |
|------------|---------|---------------|
| TypeScript | ^5.3.0 | Type safety, existing codebase |
| React | ^18.2.0 | Existing runtime, hooks system |
| ESLint | ^8.0.0 | Industry standard, plugin system |
| YAML | ^2.4.0 | Human-readable config (existing) |
| Vitest | ^1.2.0 | Testing (existing) |

### New Dependencies

| Technology | Version | Justification |
|------------|---------|---------------|
| @typescript-eslint/utils | ^6.0.0 | ESLint rule development |
| minimatch | ^9.0.0 | Path glob matching for zones |
| launchdarkly-react-client-sdk | ^3.0.0 | Remote config (optional) |

### Build Tooling

| Tool | Purpose |
|------|---------|
| tsup | Package bundling for ESLint plugin |
| vitest | Unit/integration testing |
| tsc | Type checking |

---

## Component Design

### 1. useSigilMutation Hook

**Location:** `sigil-mark/hooks/use-sigil-mutation.ts`

**Purpose:** Replace `useCriticalAction` with a hook that auto-resolves physics from context.

```typescript
// =============================================================================
// TYPES
// =============================================================================

interface SigilMutationConfig<TData, TVariables> {
  /** The async mutation function */
  mutation: (variables: TVariables) => Promise<TData>;

  /** Optional zone override (default: auto-detected) */
  zone?: string;

  /** Optional persona override (default: from context) */
  persona?: string;

  /** Explicit override (requires unsafe_ prefix + reason) */
  unsafe_override_physics?: Partial<ResolvedPhysics>;
  unsafe_override_reason?: string;

  /** Callbacks */
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

interface ResolvedPhysics {
  sync: 'optimistic' | 'pessimistic' | 'hybrid';
  timing: number;
  motion: string;
  easing: string;
  disabled_while_pending: boolean;
}

interface SigilMutationResult<TData, TVariables> {
  /** Current state */
  status: 'idle' | 'pending' | 'confirmed' | 'failed';
  data: TData | null;
  error: Error | null;

  /** Resolved physics */
  physics: ResolvedPhysics;

  /** Computed UI state */
  disabled: boolean;
  isPending: boolean;

  /** CSS variables for styling */
  style: {
    '--sigil-duration': string;
    '--sigil-easing': string;
  };

  /** Actions */
  execute: (variables: TVariables) => Promise<void>;
  reset: () => void;
}

// =============================================================================
// IMPLEMENTATION
// =============================================================================

export function useSigilMutation<TData = unknown, TVariables = void>(
  config: SigilMutationConfig<TData, TVariables>
): SigilMutationResult<TData, TVariables> {
  const zoneContext = useZoneContext();
  const personaContext = usePersonaContext();
  const remoteSoul = useRemoteSoulContext();

  // Resolve zone (explicit > layout-detected > default)
  const zone = config.zone ?? zoneContext.current ?? 'default';

  // Resolve persona (explicit > context > default)
  const persona = config.persona ?? personaContext.current ?? 'power_user';

  // Resolve physics from zone + persona matrix
  const basePhysics = resolvePhysics(zone, persona, remoteSoul);

  // Apply unsafe overrides if present
  const physics = config.unsafe_override_physics
    ? { ...basePhysics, ...config.unsafe_override_physics }
    : basePhysics;

  // Log override for friction tracking (if override present)
  useEffect(() => {
    if (config.unsafe_override_physics && config.unsafe_override_reason) {
      console.warn(
        `[Sigil] Physics override in ${zone} zone:`,
        config.unsafe_override_reason
      );
    }
  }, [config.unsafe_override_physics, config.unsafe_override_reason, zone]);

  // ... mutation state management (similar to useCriticalAction)
}
```

**Physics Resolution Algorithm:**

```typescript
function resolvePhysics(
  zoneId: string,
  personaId: string,
  remoteSoul: RemoteSoulState
): ResolvedPhysics {
  // 1. Load zone config from .sigilrc.yaml (cached)
  const zone = getZoneConfig(zoneId);

  // 2. Get base physics from zone
  const base: ResolvedPhysics = {
    sync: zone.timeAuthority === 'server-tick' ? 'pessimistic' : 'optimistic',
    timing: getMotionTiming(zone.motion ?? 'warm'),
    motion: zone.motion ?? 'warm',
    easing: getMotionEasing(zone.motion ?? 'warm'),
    disabled_while_pending: zone.timeAuthority === 'server-tick',
  };

  // 3. Apply persona overrides if present
  const personaOverride = zone.persona_overrides?.[personaId];
  if (personaOverride) {
    if (personaOverride.motion) {
      base.timing = getMotionTiming(personaOverride.motion);
      base.motion = personaOverride.motion;
      base.easing = getMotionEasing(personaOverride.motion);
    }
  }

  // 4. Apply remote soul vibe overrides (marketing-controlled)
  if (remoteSoul.vibes?.timing_modifier) {
    base.timing = Math.round(base.timing * remoteSoul.vibes.timing_modifier);
  }

  return base;
}

function getMotionTiming(motion: string): number {
  const timings: Record<string, number> = {
    instant: 0,
    snappy: 150,
    warm: 300,
    deliberate: 800,
    reassuring: 1200,
    celebratory: 1200,
    reduced: 0,
  };
  return timings[motion] ?? 300;
}

function getMotionEasing(motion: string): string {
  const easings: Record<string, string> = {
    instant: 'linear',
    snappy: 'ease-out',
    warm: 'ease-in-out',
    deliberate: 'ease-out',
    reassuring: 'ease-in-out',
    celebratory: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    reduced: 'linear',
  };
  return easings[motion] ?? 'ease-in-out';
}
```

---

### 2. SigilProvider Context

**Location:** `sigil-mark/providers/sigil-provider.tsx`

**Purpose:** Provide zone, persona, and remote soul context to child components.

```typescript
// =============================================================================
// TYPES
// =============================================================================

interface SigilProviderProps {
  children: React.ReactNode;

  /** Initial persona (default: auto-detected from user state) */
  persona?: string;

  /** Remote config provider ID (for LaunchDarkly/Statsig) */
  remoteConfigKey?: string;

  /** Fallback if remote unavailable */
  localVibes?: VibeConfig;
}

interface ZoneContextValue {
  current: string | null;
  setZone: (zone: string) => void;
}

interface PersonaContextValue {
  current: string;
  setPersona: (persona: string) => void;
  traits: PersonaTraits;
}

interface RemoteSoulContextValue {
  vibes: VibeConfig | null;
  isLoading: boolean;
  error: Error | null;
}

// =============================================================================
// CONTEXT DEFINITIONS
// =============================================================================

const ZoneContext = createContext<ZoneContextValue>({
  current: null,
  setZone: () => {},
});

const PersonaContext = createContext<PersonaContextValue>({
  current: 'power_user',
  setPersona: () => {},
  traits: {},
});

const RemoteSoulContext = createContext<RemoteSoulContextValue>({
  vibes: null,
  isLoading: false,
  error: null,
});

// =============================================================================
// PROVIDER IMPLEMENTATION
// =============================================================================

export function SigilProvider({
  children,
  persona: initialPersona,
  remoteConfigKey,
  localVibes,
}: SigilProviderProps) {
  // Zone state (set by layout wrappers)
  const [zone, setZone] = useState<string | null>(null);

  // Persona state
  const [persona, setPersona] = useState(initialPersona ?? 'power_user');
  const traits = useMemo(() => getPersonaTraits(persona), [persona]);

  // Remote soul state
  const remoteSoul = useRemoteSoul(remoteConfigKey, localVibes);

  return (
    <ZoneContext.Provider value={{ current: zone, setZone }}>
      <PersonaContext.Provider value={{ current: persona, setPersona, traits }}>
        <RemoteSoulContext.Provider value={remoteSoul}>
          {children}
        </RemoteSoulContext.Provider>
      </PersonaContext.Provider>
    </ZoneContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

export function useZoneContext() {
  return useContext(ZoneContext);
}

export function usePersonaContext() {
  return useContext(PersonaContext);
}

export function useRemoteSoulContext() {
  return useContext(RemoteSoulContext);
}
```

---

### 3. Zone Layout Wrappers

**Location:** `sigil-mark/layouts/`

**Purpose:** Set zone context when entering a layout region.

```typescript
// layouts/critical-zone.tsx

import { useZoneContext } from '../providers/sigil-provider';

interface CriticalZoneProps {
  children: React.ReactNode;
  financial?: boolean;
}

export function CriticalZone({ children, financial }: CriticalZoneProps) {
  const { setZone } = useZoneContext();

  useEffect(() => {
    setZone('critical');
    return () => setZone(null);
  }, [setZone]);

  return (
    <div data-sigil-zone="critical" data-sigil-financial={financial}>
      {children}
    </div>
  );
}
```

---

### 4. ESLint Plugin

**Location:** `packages/eslint-plugin-sigil/`

**Structure:**

```
packages/eslint-plugin-sigil/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                 # Plugin entry
│   ├── config-loader.ts         # .sigilrc.yaml loader
│   ├── zone-resolver.ts         # File path → zone mapping
│   ├── rules/
│   │   ├── enforce-tokens.ts    # No magic numbers
│   │   ├── zone-compliance.ts   # Zone-appropriate timing
│   │   └── input-physics.ts     # Keyboard requirements
│   └── configs/
│       └── recommended.ts       # Preset config
└── tests/
    ├── enforce-tokens.test.ts
    ├── zone-compliance.test.ts
    └── input-physics.test.ts
```

#### Rule: enforce-tokens

```typescript
// rules/enforce-tokens.ts

import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://sigil.dev/rules/${name}`
);

export const enforceTokens = createRule({
  name: 'enforce-tokens',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow arbitrary values in Tailwind classes',
    },
    messages: {
      noMagicNumber: 'Use token value instead of arbitrary {{type}}: {{value}}',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    // Regex to match Tailwind arbitrary value syntax
    const arbitraryPattern = /\[(\d+(?:px|rem|em|%|ms|s)?)\]/;

    return {
      JSXAttribute(node) {
        if (node.name.name !== 'className') return;
        if (node.value?.type !== 'Literal') return;

        const className = String(node.value.value);
        const match = className.match(arbitraryPattern);

        if (match) {
          context.report({
            node,
            messageId: 'noMagicNumber',
            data: {
              type: 'value',
              value: match[0],
            },
          });
        }
      },
    };
  },
});
```

#### Rule: zone-compliance

```typescript
// rules/zone-compliance.ts

import { loadSigilConfig, resolveZoneFromPath } from '../config-loader';

export const zoneCompliance = createRule({
  name: 'zone-compliance',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce zone-appropriate timing values',
    },
    messages: {
      timingTooFast:
        'Duration {{actual}}ms is too fast for {{zone}} zone (min: {{min}}ms)',
      timingTooSlow:
        'Duration {{actual}}ms is too slow for {{zone}} zone (max: {{max}}ms)',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const config = loadSigilConfig(context.cwd);
    const filePath = context.filename;
    const zone = resolveZoneFromPath(filePath, config);

    if (!zone) return {};

    const constraints = getZoneTimingConstraints(zone, config);

    return {
      // Check framer-motion transition duration
      Property(node) {
        if (
          node.key.type === 'Identifier' &&
          node.key.name === 'duration' &&
          node.value.type === 'Literal' &&
          typeof node.value.value === 'number'
        ) {
          const duration = node.value.value * 1000; // framer uses seconds

          if (duration < constraints.min) {
            context.report({
              node,
              messageId: 'timingTooFast',
              data: {
                actual: duration,
                zone: zone.id,
                min: constraints.min,
              },
            });
          }

          if (duration > constraints.max) {
            context.report({
              node,
              messageId: 'timingTooSlow',
              data: {
                actual: duration,
                zone: zone.id,
                max: constraints.max,
              },
            });
          }
        }
      },

      // Check Tailwind duration classes
      JSXAttribute(node) {
        if (node.name.name !== 'className') return;
        if (node.value?.type !== 'Literal') return;

        const className = String(node.value.value);
        const durationMatch = className.match(/duration-(\d+)/);

        if (durationMatch) {
          const duration = parseInt(durationMatch[1], 10);

          if (duration < constraints.min) {
            context.report({
              node,
              messageId: 'timingTooFast',
              data: {
                actual: duration,
                zone: zone.id,
                min: constraints.min,
              },
            });
          }
        }
      },
    };
  },
});

function getZoneTimingConstraints(
  zone: Zone,
  config: SigilConfig
): { min: number; max: number } {
  // Map motion type to timing constraints
  const motionConstraints: Record<string, { min: number; max: number }> = {
    instant: { min: 0, max: 50 },
    snappy: { min: 100, max: 200 },
    warm: { min: 200, max: 400 },
    deliberate: { min: 500, max: 1000 },
    reassuring: { min: 800, max: 1500 },
  };

  const motion = zone.motion ?? 'warm';
  return motionConstraints[motion] ?? { min: 0, max: 2000 };
}
```

#### Rule: input-physics

```typescript
// rules/input-physics.ts

export const inputPhysics = createRule({
  name: 'input-physics',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce keyboard navigation in machinery zones',
    },
    messages: {
      missingKeyboard:
        'Interactive element with onClick should also have onKeyDown and tabIndex in {{zone}} zone',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const config = loadSigilConfig(context.cwd);
    const zone = resolveZoneFromPath(context.filename, config);

    // Only enforce in admin/machinery zones
    if (!zone || zone.id !== 'admin') return {};

    return {
      JSXOpeningElement(node) {
        const hasOnClick = node.attributes.some(
          (attr) =>
            attr.type === 'JSXAttribute' && attr.name.name === 'onClick'
        );

        if (!hasOnClick) return;

        const hasOnKeyDown = node.attributes.some(
          (attr) =>
            attr.type === 'JSXAttribute' && attr.name.name === 'onKeyDown'
        );

        const hasTabIndex = node.attributes.some(
          (attr) =>
            attr.type === 'JSXAttribute' && attr.name.name === 'tabIndex'
        );

        // Exempt native interactive elements
        const tagName = node.name.type === 'JSXIdentifier' ? node.name.name : '';
        const nativeInteractive = ['button', 'a', 'input', 'select', 'textarea'];
        if (nativeInteractive.includes(tagName.toLowerCase())) return;

        if (!hasOnKeyDown || !hasTabIndex) {
          context.report({
            node,
            messageId: 'missingKeyboard',
            data: { zone: zone.id },
          });
        }
      },
    };
  },
});
```

---

### 5. Vocabulary Layer

**Location:** `sigil-mark/vocabulary/vocabulary.yaml`

**Schema:**

```yaml
# sigil-mark/vocabulary/vocabulary.yaml
version: "4.1.0"
schema_version: 1

terms:
  pot:
    engineering_name: savings_container
    user_facing: "Pot"
    mental_model: "Piggy bank, casual saving"
    recommended:
      material: glass
      motion: warm
      tone: friendly
    zones:
      - marketing
      - dashboard
    last_refined: null

  vault:
    engineering_name: savings_container
    user_facing: "Vault"
    mental_model: "Bank vault, security"
    recommended:
      material: machinery
      motion: deliberate
      tone: serious
    zones:
      - critical
    last_refined: null

  claim:
    engineering_name: reward_claim
    user_facing: "Claim"
    mental_model: "Receiving earned reward"
    recommended:
      material: decisive
      motion: celebratory_then_deliberate
      tone: exciting
    zones:
      - critical
      - celebration
    last_refined: null

  deposit:
    engineering_name: deposit_action
    user_facing: "Deposit"
    mental_model: "Adding funds to account"
    recommended:
      material: glass
      motion: warm
      tone: reassuring
    zones:
      - critical
    last_refined: null

  withdraw:
    engineering_name: withdraw_action
    user_facing: "Withdraw"
    mental_model: "Taking funds out"
    recommended:
      material: machinery
      motion: deliberate
      tone: serious
    zones:
      - critical
    last_refined: null

  boost:
    engineering_name: boost_multiplier
    user_facing: "Boost"
    mental_model: "Enhancing rewards"
    recommended:
      material: glass
      motion: celebratory
      tone: exciting
    zones:
      - marketing
      - dashboard
    last_refined: null

  stake:
    engineering_name: staking_action
    user_facing: "Stake"
    mental_model: "Locking funds for rewards"
    recommended:
      material: machinery
      motion: deliberate
      tone: serious
    zones:
      - critical
    last_refined: null

  unstake:
    engineering_name: unstaking_action
    user_facing: "Unstake"
    mental_model: "Unlocking staked funds"
    recommended:
      material: machinery
      motion: deliberate
      tone: serious
    zones:
      - critical
    last_refined: null

  harvest:
    engineering_name: harvest_rewards
    user_facing: "Harvest"
    mental_model: "Collecting earned rewards"
    recommended:
      material: glass
      motion: celebratory
      tone: exciting
    zones:
      - dashboard
    last_refined: null

  connect:
    engineering_name: wallet_connect
    user_facing: "Connect"
    mental_model: "Linking wallet to app"
    recommended:
      material: glass
      motion: warm
      tone: friendly
    zones:
      - marketing
      - dashboard
    last_refined: null
```

---

### 6. Physics Timing Layer

**Location:** `sigil-mark/kernel/physics.yaml`

```yaml
# sigil-mark/kernel/physics.yaml
version: "4.1.0"

motion:
  instant:
    duration:
      value: 0
      unit: ms
    easing: linear
    description: "No animation, immediate state change"

  snappy:
    duration:
      value: 150
      unit: ms
    easing: ease-out
    description: "Quick response, power-user friendly"

  warm:
    duration:
      value: 300
      unit: ms
    easing: ease-in-out
    description: "Friendly, approachable feel"

  deliberate:
    duration:
      min: 500
      max: 1000
      default: 800
      unit: ms
    easing: ease-out
    wait_for_confirm: true
    description: "High-stakes, requires attention"

  reassuring:
    duration:
      value: 1200
      unit: ms
    easing: ease-in-out
    description: "Extra time for newcomers, builds confidence"

  celebratory:
    duration:
      value: 1200
      unit: ms
    easing: cubic-bezier(0.34, 1.56, 0.64, 1)
    spring:
      stiffness: 100
      damping: 10
    description: "Triumphant, reward moments"

  reduced:
    duration:
      value: 0
      unit: ms
    easing: linear
    description: "Accessibility preference, no motion"

sync:
  pessimistic:
    description: "Server owns clock. Wait for confirmation."
    optimistic_ui: false
    pending_indicator: required
    disable_during_pending: true

  optimistic:
    description: "Client owns clock. Instant update, silent rollback."
    optimistic_ui: true
    pending_indicator: none
    disable_during_pending: false

  hybrid:
    description: "Optimistic with sync indicator. Visible rollback."
    optimistic_ui: true
    pending_indicator: subtle
    disable_during_pending: false
```

---

### 7. Remote Soul Adapter

**Location:** `sigil-mark/providers/remote-soul.ts`

```typescript
// =============================================================================
// TYPES
// =============================================================================

interface VibeConfig {
  seasonal_theme?: 'summer' | 'winter' | 'default';
  hero_energy?: 'playful' | 'professional';
  warmth_level?: 'friendly' | 'direct';
  celebration_intensity?: 'subtle' | 'triumphant';
  timing_modifier?: number; // Multiplier for timing (e.g., 1.2 = 20% slower)
}

interface RemoteSoulState {
  vibes: VibeConfig | null;
  isLoading: boolean;
  error: Error | null;
}

// =============================================================================
// ABSTRACT ADAPTER
// =============================================================================

interface RemoteConfigAdapter {
  subscribe(callback: (vibes: VibeConfig) => void): () => void;
  getVibes(): VibeConfig | null;
}

// =============================================================================
// LAUNCHDARKLY ADAPTER
// =============================================================================

class LaunchDarklyAdapter implements RemoteConfigAdapter {
  private client: LDClient | null = null;
  private vibes: VibeConfig | null = null;

  constructor(clientId: string) {
    if (typeof window !== 'undefined') {
      import('launchdarkly-react-client-sdk').then(({ initialize }) => {
        this.client = initialize(clientId, {
          anonymous: true,
        });

        this.client.on('ready', () => {
          this.vibes = this.client!.allFlags() as VibeConfig;
        });

        this.client.on('change', () => {
          this.vibes = this.client!.allFlags() as VibeConfig;
        });
      });
    }
  }

  subscribe(callback: (vibes: VibeConfig) => void): () => void {
    if (!this.client) return () => {};

    const handler = () => callback(this.vibes!);
    this.client.on('change', handler);
    return () => this.client?.off('change', handler);
  }

  getVibes(): VibeConfig | null {
    return this.vibes;
  }
}

// =============================================================================
// HOOK
// =============================================================================

export function useRemoteSoul(
  configKey?: string,
  fallback?: VibeConfig
): RemoteSoulState {
  const [state, setState] = useState<RemoteSoulState>({
    vibes: fallback ?? null,
    isLoading: !!configKey,
    error: null,
  });

  useEffect(() => {
    if (!configKey) return;

    const adapter = new LaunchDarklyAdapter(configKey);

    const unsubscribe = adapter.subscribe((vibes) => {
      setState({ vibes, isLoading: false, error: null });
    });

    // Timeout fallback
    const timeout = setTimeout(() => {
      if (state.isLoading) {
        setState((prev) => ({
          ...prev,
          vibes: fallback ?? null,
          isLoading: false,
        }));
      }
    }, 100); // 100ms max latency per NFR-3

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [configKey, fallback]);

  return state;
}
```

---

### 8. /observe Skill

**Location:** `.claude/skills/observing-feedback/`

**index.yaml:**

```yaml
name: observing-feedback
version: "4.1.0"
description: "Visual feedback loop via MCP. Captures screenshots, compares to rules, surfaces gaps."
command: /observe
outputs:
  - sigil-mark/.sigil-observations/feedback/*.yaml
  - sigil-mark/.sigil-observations/screenshots/*.png
```

---

## Data Architecture

### File Structure

```
sigil-mark/
├── .sigil-observations/
│   ├── feedback/              # Observation feedback files
│   │   └── *.yaml
│   ├── screenshots/           # Captured screenshots
│   │   └── *.png
│   └── schemas/
│       └── feedback.schema.json
├── kernel/
│   └── physics.yaml           # Motion → timing mapping
├── vocabulary/
│   ├── vocabulary.yaml        # Term → physics mapping
│   └── schemas/
│       └── vocabulary.schema.json
├── providers/
│   ├── sigil-provider.tsx     # Main context provider
│   └── remote-soul.ts         # Remote config adapter
├── hooks/
│   ├── index.ts
│   ├── use-sigil-mutation.ts  # NEW: Zone+Persona-aware hook
│   └── use-server-tick.ts     # Existing
├── core/
│   ├── use-critical-action.ts # DEPRECATED: Keep for backwards compat
│   └── ...
└── process/                   # AGENT-ONLY (no runtime exports)
    ├── zone-reader.ts
    ├── persona-reader.ts
    ├── vocabulary-reader.ts
    └── ...
```

---

## Integration Points

### ESLint Integration

```javascript
// eslint.config.js
import sigil from 'eslint-plugin-sigil';

export default [
  sigil.configs.recommended,
  {
    rules: {
      'sigil/enforce-tokens': 'error',
      'sigil/zone-compliance': 'warn',
      'sigil/input-physics': 'warn',
    },
  },
];
```

### Remote Config Integration

```typescript
// app/providers.tsx
import { SigilProvider } from 'sigil-mark/providers';

export function Providers({ children }) {
  return (
    <SigilProvider
      persona={detectUserPersona()}
      remoteConfigKey={process.env.LAUNCHDARKLY_CLIENT_ID}
      localVibes={{
        seasonal_theme: 'default',
        celebration_intensity: 'subtle',
      }}
    >
      {children}
    </SigilProvider>
  );
}
```

---

## Security Architecture

### Process Layer Isolation

Process layer readers must not be bundleable for browser. Build will fail if imported in client code (no 'use client' directive).

### Remote Config Security

- Remote config only controls **vibe** keys (cosmetic)
- **Kernel** keys (physics, sync) require code changes
- Invalid vibe values fall back to local defaults
- 100ms timeout prevents blocking on slow remote

---

## Technical Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ESLint performance on large codebases | Medium | Medium | Cache config, lazy-load zone detection |
| Remote config latency | Medium | Low | 100ms timeout with local fallback |
| Zone detection ambiguity | Low | Medium | Explicit zone prop override on components |
| Breaking change for useCriticalAction users | High | Medium | Keep deprecated hook with warning |

---

## Package Structure

```
sigil/
├── sigil-mark/                    # Core package
│   ├── package.json               # v4.1.0
│   ├── hooks/
│   │   └── use-sigil-mutation.ts  # NEW
│   ├── providers/
│   │   ├── sigil-provider.tsx     # NEW
│   │   └── remote-soul.ts         # NEW
│   ├── layouts/                   # Existing
│   ├── lenses/                    # Existing
│   ├── core/                      # Existing (deprecated hooks)
│   └── process/                   # Agent-only
│
├── packages/
│   └── eslint-plugin-sigil/       # NEW
│       ├── package.json
│       └── src/
│           ├── rules/
│           │   ├── enforce-tokens.ts
│           │   ├── zone-compliance.ts
│           │   └── input-physics.ts
│           └── configs/
│               └── recommended.ts
│
└── .claude/skills/
    └── observing-feedback/        # NEW
        ├── index.yaml
        └── SKILL.md
```

---

*Sources: loa-grimoire/prd.md, sigil-mark/core/use-critical-action.ts, sigil-mark/process/zone-reader.ts, .sigilrc.yaml*
