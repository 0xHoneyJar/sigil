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
