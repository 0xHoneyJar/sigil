# Migration Guide: v1.2.5 → v2.0

This guide helps you migrate from Sigil v1.2.5 to v2.0 (Reality Engine).

## Philosophy Change

**v1.2.5:** Zones defined by file paths, physics configured via props
**v2.0:** Layouts ARE Zones, physics separated from rendering (Truth vs Experience)

## Quick Migration

### Before (v1.2.5)

```tsx
import { SigilZone, useSigilPhysics, useServerTick } from 'sigil-mark';
import { DecisiveButton } from 'sigil-mark/recipes/decisive';

function PaymentForm({ amount }) {
  const { isLoading, handleAction } = useServerTick(async () => {
    return api.pay(amount);
  });

  return (
    <SigilZone material="decisive">
      <DecisiveButton
        onClick={handleAction}
        disabled={isLoading}
        spring={{ stiffness: 180, damping: 12 }}
      >
        {isLoading ? 'Processing...' : `Pay $${amount}`}
      </DecisiveButton>
    </SigilZone>
  );
}
```

### After (v2.0)

```tsx
import { useCriticalAction, CriticalZone, useLens } from 'sigil-mark';

function PaymentForm({ amount }) {
  const payment = useCriticalAction({
    mutation: () => api.pay(amount),
    timeAuthority: 'server-tick',
  });

  const Lens = useLens();

  return (
    <CriticalZone financial>
      <CriticalZone.Content>
        <h2>Confirm Payment</h2>
      </CriticalZone.Content>
      <CriticalZone.Actions>
        <Lens.CriticalButton
          state={payment.state}
          onAction={() => payment.commit()}
          labels={{ pending: 'Processing...' }}
        >
          Pay ${amount}
        </Lens.CriticalButton>
      </CriticalZone.Actions>
    </CriticalZone>
  );
}
```

## API Mapping

### Zone Components

| v1.2.5 | v2.0 |
|--------|------|
| `<SigilZone material="decisive">` | `<CriticalZone financial>` |
| `<SigilZone material="machinery">` | `<MachineryLayout>` |
| `<SigilZone material="glass">` | `<GlassLayout>` |

### Hooks

| v1.2.5 | v2.0 |
|--------|------|
| `useServerTick(fn)` | `useCriticalAction({ mutation: fn, timeAuthority: 'server-tick' })` |
| `useSigilPhysics()` | `useLens()` |
| `useServerAuthoritative()` | `useCriticalAction({ timeAuthority: 'server-tick' })` |

### Components

| v1.2.5 | v2.0 |
|--------|------|
| `<DecisiveButton>` | `<Lens.CriticalButton>` |
| `<MachineryButton>` | `<Lens.GlassButton variant="secondary">` |
| `<GlassButton>` | `<Lens.GlassButton variant="primary">` |

### Props

| v1.2.5 | v2.0 |
|--------|------|
| `spring={{ stiffness, damping }}` | Animations live in lens |
| `disabled={isLoading}` | `state={action.state}` |
| `onClick={handleAction}` | `onAction={() => action.commit()}` |

## State Model Change

### v1.2.5: Boolean Flags

```tsx
const { isLoading, error, data, handleAction } = useServerTick(fn);

<Button disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</Button>
```

### v2.0: State Machine

```tsx
const action = useCriticalAction({ mutation: fn, timeAuthority: 'server-tick' });

// State is a machine with status
action.state.status  // 'idle' | 'confirming' | 'pending' | 'confirmed' | 'failed'
action.state.error   // Error | null
action.state.data    // TData | null

<Lens.CriticalButton
  state={action.state}
  onAction={() => action.commit()}
  labels={{
    pending: 'Processing...',
    confirmed: 'Done!',
    failed: 'Retry',
  }}
>
  Submit
</Lens.CriticalButton>
```

## Layout Structure Change

### v1.2.5: Wrapper Only

```tsx
<SigilZone material="decisive">
  <form>
    <Input />
    <DecisiveButton>Submit</DecisiveButton>
  </form>
</SigilZone>
```

### v2.0: Structured Slots

```tsx
<CriticalZone financial>
  <CriticalZone.Content>
    <form>
      <Input />
    </form>
  </CriticalZone.Content>
  <CriticalZone.Actions>
    <button>Cancel</button>
    <Lens.CriticalButton state={state} onAction={commit}>
      Submit
    </Lens.CriticalButton>
  </CriticalZone.Actions>
</CriticalZone>
```

## Lens Selection

### v1.2.5: Manual Physics Props

```tsx
<DecisiveButton
  spring={{ stiffness: 180, damping: 12 }}
  whileTap={{ scale: 0.98 }}
>
```

### v2.0: Automatic Lens Selection

```tsx
// In CriticalZone with financial=true → StrictLens (forced)
// In MachineryLayout → User preference
// In GlassLayout → User preference
// Outside layouts → DefaultLens

const Lens = useLens();
// Physics are baked into the lens — no manual configuration
```

### Lens Override (User Preference)

```tsx
import { LensProvider, A11yLens } from 'sigil-mark';

// App-wide preference
<LensProvider initialLens={A11yLens}>
  <App />
</LensProvider>

// Note: CriticalZone with financial=true STILL forces StrictLens
// This is intentional for trust/safety
```

## File Path Zones → Layout Zones

### v1.2.5: Config Files

```yaml
# src/checkout/.sigilrc.yaml
sigil: "1.2.4"
recipes: decisive
sync: server_authoritative
```

### v2.0: Structural Zones

```tsx
// Zone is now declared by the Layout primitive
// No config file needed — the structure IS the zone

<CriticalZone financial>
  {/* This IS a critical zone */}
  {/* Server-tick authority is automatic */}
  {/* StrictLens is forced */}
</CriticalZone>
```

## Deprecated APIs

These still work in v2.0 but will be removed in v3.0:

```tsx
// Still works (deprecated)
import {
  SigilZone,           // Use layout primitives
  useSigilPhysics,     // Use useLens()
  useServerAuthoritative, // Use useCriticalAction
  withSigilPhysics,    // Use useLens()
} from 'sigil-mark';
```

Console warnings will appear in development when using deprecated APIs.

## Recipes Still Work

v1.2.5 recipes are still valid:

```tsx
// This still works
import { DecisiveButton } from 'sigil-mark/recipes/decisive';
import { MachineryTable } from 'sigil-mark/recipes/machinery';
import { GlassHeroCard } from 'sigil-mark/recipes/glass';
```

However, we recommend migrating to the lens system for new code.

## Migration Checklist

- [ ] Replace `<SigilZone material="...">` with appropriate Layout
- [ ] Replace `useServerTick` with `useCriticalAction`
- [ ] Replace `useSigilPhysics` with `useLens`
- [ ] Replace recipe buttons with `Lens.CriticalButton` / `Lens.GlassButton`
- [ ] Update state handling from boolean flags to state machine
- [ ] Add structured slots (`Content`, `Actions`) to layouts
- [ ] Remove manual physics props (handled by lens)
- [ ] Test lens enforcement in CriticalZone

## Need Help?

- See [CLAUDE.md](../CLAUDE.md) for AI agent documentation
- Check [__examples__/](./__examples__/) for complete examples
- Run `/craft` command for guided component generation

---

# Migration Guide: v2.0 → v2.6

This section covers migration from v2.0 "Reality Engine" to v2.6 "Craftsman's Flow".

## Overview

v2.6 adds the **Process Layer** — a human interaction layer for capturing design decisions. The Core, Layout, and Lens layers from v2.0 remain unchanged.

**Breaking Changes:** None. v2.6 is fully backwards compatible with v2.0.

## New Features

### 1. Constitution System

Define protected capabilities that MUST always work:

```yaml
# sigil-mark/constitution/protected-capabilities.yaml
protected:
  - id: withdraw
    name: "Withdraw Funds"
    enforcement: block
    rationale: "Users must always be able to withdraw"
```

### 2. Decision Locking

Lock design decisions to prevent endless debates:

```bash
/consult "Primary CTA color"      # Start consultation
/consult DEC-2026-001 --status    # Check status
/consult DEC-2026-001 --unlock    # Request early unlock
```

**Lock Periods:**
- `strategic` — 180 days
- `direction` — 90 days
- `execution` — 30 days

### 3. Persona System

Zone-persona mapping for contextual constraints:

| Zone | Persona | Input | Constraint |
|------|---------|-------|------------|
| critical | power_user | keyboard | max_actions: 10 |
| checkout | power_user | keyboard | reading_level: advanced |
| marketing | newcomer | mouse | max_actions: 5 |
| mobile | mobile | touch | tap_targets: 48px |

### 4. Enhanced Commands

```bash
/craft "button"           # Now surfaces Process context
/consult "topic"          # Lock decisions
/garden                   # Health report with Process layer
```

## New Imports

```tsx
// Process Context
import {
  ProcessContextProvider,
  useProcessContext,
  useConstitution,
  useDecisions,
  useCurrentPersona,
} from 'sigil-mark';

// Zone-Persona Mapping
import {
  getPersonaForZone,
  resolveZoneWithPersona,
  DEFAULT_ZONE_PERSONA_MAP,
  LOCK_PERIODS,
} from 'sigil-mark';
```

## Migration Steps

1. **Update Package:** `npm update sigil-mark@2.6.0`
2. **Initialize Process Layer (Optional):** Run `/setup`
3. **Define Constitution (Optional):** Create protected capabilities
4. **Add ProcessContextProvider (Optional):** Wrap app if using Process context

## Graceful Degradation

All Process layer features gracefully degrade. Missing files return defaults:

| Missing | Behavior |
|---------|----------|
| No constitution file | Returns empty protected array |
| No decisions directory | Returns empty decisions array |
| No lenses.yaml | Returns default personas |

Your v2.0 code continues to work without any Process layer files.

---

# Migration Guide: v2.6 → v3.0

This section covers migration from v2.6 "Craftsman's Flow" to v3.0 "Living Engine".

## Overview

v3.0 introduces a fundamental architectural split: **Agent-Time** (process layer) vs **Runtime** (React components). The Process layer no longer runs in the browser.

## Breaking Changes

### 1. ProcessContextProvider Removed from Client

**v2.6 (BROKEN in v3.0):**
```tsx
// This crashes in browser - fs not available
import { ProcessContextProvider } from 'sigil-mark';

<ProcessContextProvider>
  <App />
</ProcessContextProvider>
```

**v3.0 (CORRECT):**
```tsx
// Process layer is agent-only (reads YAML at generation time)
// Use new runtime providers instead:
import { PersonaProvider, ZoneProvider } from 'sigil-mark';

<PersonaProvider defaultPersona="power_user">
  <ZoneProvider zone="critical">
    <App />
  </ZoneProvider>
</PersonaProvider>
```

### 2. Lens Array → Personas Rename

**v2.6:**
```tsx
import { readLensArray, type LensArray } from 'sigil-mark/process';
```

**v3.0:**
```tsx
import { readPersonas, type PersonaArray } from 'sigil-mark/process';

// Deprecated aliases still work with console warning:
import { readLensArray, type LensArray } from 'sigil-mark/process'; // ⚠️ deprecated
```

### 3. Process Layer is Agent-Only

The `sigil-mark/process/` module now has `@server-only` JSDoc and must NOT be imported in browser code:

```tsx
// ❌ WRONG - crashes in browser
import { readConstitution } from 'sigil-mark/process';

// ✅ CORRECT - agent reads at generation time, embeds in code
// Agent reads: sigil-mark/constitution/protected-capabilities.yaml
// Agent generates code with embedded values
```

## New Features

### 1. Vocabulary Layer

Vocabulary is Sigil's public API—the bridge between human concepts and code:

```yaml
# sigil-mark/vocabulary/vocabulary.yaml
version: "3.0.0"
terms:
  - id: vault
    engineering_name: PositionDisplay
    user_facing: ["Vault", "Position"]
    mental_model: "A secure container for assets"
    feel:
      critical: { material: fortress, motion: deliberate }
      dashboard: { material: glass, motion: responsive }
```

**Agent Protocol:**
1. User says "create vault display"
2. Agent looks up `vault` → `PositionDisplay`
3. Agent checks zone → gets appropriate feel
4. Agent generates code with embedded physics

### 2. Philosophy Layer (Intent)

Capture the "why" behind design decisions:

```yaml
# sigil-mark/soul-binder/philosophy.yaml
version: "3.0.0"
primary_intent: "Make DeFi feel trustworthy, not scary"
principles:
  - id: security_first
    statement: "Security indicators must be visible"
    priority: 1
    zones: ["critical"]
```

### 3. User Fluidity (Persona + Zone = Experience)

```tsx
import { usePersona, useZone, useEffectivePhysics } from 'sigil-mark';

function MyComponent() {
  const persona = usePersona();     // "power_user"
  const zone = useZone();           // "critical"
  const physics = useEffectivePhysics(); // Combined from both

  // Physics adapts: power_user + critical = keyboard nav, heavy motion
}
```

### 4. Behavioral Signals

Passive observation patterns in vibe-checks.yaml:

```yaml
behavioral_signals:
  - id: rage_clicking
    name: Rage Clicking
    triggers:
      - event: element_click
        count_threshold: 3
        within_ms: 2000
    insight: "User expects something to happen that isn't"
    severity: high
```

### 5. Remote Configuration

Marketing vs Engineering controlled values:

```yaml
# sigil-mark/remote-config/remote-config.yaml
marketing_controlled:
  copy:
    hero_headline: { value: "Your Crypto, Your Way" }
  feature_flags:
    show_new_dashboard: { enabled: false }

engineering_controlled:
  physics: local_only  # NEVER remote
  rate_limits:
    api_general: { requests_per_minute: 60 }
```

## Migration Checklist

### Breaking Changes (Required)

- [ ] Remove `ProcessContextProvider` from all client code
- [ ] Replace `readLensArray` → `readPersonas` (or accept deprecation warning)
- [ ] Replace `LensArray` → `PersonaArray` types
- [ ] Ensure no `sigil-mark/process/` imports in browser bundles

### New Features (Optional)

- [ ] Create `vocabulary.yaml` with product terms
- [ ] Create `philosophy.yaml` with design principles
- [ ] Add behavioral signals to `vibe-checks.yaml`
- [ ] Configure `remote-config.yaml` for dynamic values

### Runtime Setup (Optional)

```tsx
// Wrap app with new providers
import { PersonaProvider, ZoneProvider } from 'sigil-mark';

function App() {
  return (
    <PersonaProvider defaultPersona="newcomer">
      <ZoneProvider zone="marketing">
        {/* App content */}
      </ZoneProvider>
    </PersonaProvider>
  );
}
```

## Graceful Degradation

All v3.0 features gracefully degrade. Missing files return defaults:

| Missing | Behavior |
|---------|----------|
| No vocabulary.yaml | Returns empty terms array |
| No philosophy.yaml | Returns default empty philosophy |
| No behavioral_signals | Returns empty signals array |
| No remote-config.yaml | Uses local_yaml fallback |

## Need Help?

- See [CLAUDE.md](../CLAUDE.md) for AI agent documentation
- Check [__examples__/](./__examples__/) for complete examples
- Run `/craft` command for guided component generation
