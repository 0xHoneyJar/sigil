# Sigil

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> *"Context before code. Constitution before creativity."*

Design Physics Framework for AI-assisted development. **v3.0 "Living Engine"** separates Agent-Time context from Runtime components, introduces Vocabulary as the API surface, and enables User Fluidity.

## What's New in v3.0

### Architecture: Agent-Time vs Runtime

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AGENT TIME (Generation)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Constitution│  │  Vocabulary │  │   Personas  │  │ Philosophy  │    │
│  │   (YAML)    │  │    (YAML)   │  │    (YAML)   │  │   (YAML)    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
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
│                         RUNTIME (Browser)                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                     │
│  │    Core     │  │   Layout    │  │    Lens     │                     │
│  │  (Hooks)    │  │   (Zones)   │  │  (Render)   │                     │
│  └─────────────┘  └─────────────┘  └─────────────┘                     │
│                                                                         │
│               Pure React, no fs, no YAML parsing                        │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Insight:** Process layer is agent-context-only. Runtime never touches YAML.

### Vocabulary: The API Surface

Vocabulary is Sigil's public API—the bridge between human concepts and code:

```yaml
# sigil-mark/vocabulary/vocabulary.yaml
terms:
  - id: vault
    engineering_name: PositionDisplay
    user_facing: ["Vault", "Position"]
    mental_model: "A secure container for assets"
    feel:
      critical: { material: fortress, motion: deliberate }
      dashboard: { material: glass, motion: responsive }
```

Agent protocol: Look up term → Get zone-appropriate feel → Generate code.

### User Fluidity

**Persona** (who) + **Zone** (where) = **Effective Experience**

```tsx
// Runtime: Pure React, no YAML
<PersonaProvider defaultPersona="power_user">
  <ZoneProvider zone="critical">
    <App />  {/* Experience adapts to persona + zone */}
  </ZoneProvider>
</PersonaProvider>
```

### Philosophy Layer (Intent)

Capture the "why" behind design decisions:

```yaml
# sigil-mark/soul-binder/philosophy.yaml
primary_intent: "Make DeFi feel trustworthy, not scary"
principles:
  - id: security_first
    statement: "Security indicators must be visible"
    priority: 1
    zones: ["critical"]
```

### Behavioral Signals

Passive observation patterns for UX insights (no interruption):

| Signal | Insight | Severity |
|--------|---------|----------|
| rage_clicking | Element unresponsive or unclear | high |
| back_button_loop | User may be lost | warning |
| form_abandonment | Form too complex | warning |
| deep_engagement | Content resonates | positive |

## Philosophy

### The Core Insight: Truth vs Experience

Sigil separates **Truth** (what happens) from **Experience** (how it looks):

- **Truth can't be argued with.** Server-authoritative data MUST show pending states.
- **Experience is swappable.** Same physics renders as DefaultLens, StrictLens, or A11yLens.

### Core Principles

**1. Feel Before Form** — Design is about how things *feel*, not how they *look*.

**2. Layouts ARE Zones** — `<CriticalZone>` inherits critical physics. Structure IS the zone.

**3. Constraints Enable Creativity** — Physics constraints free you to focus on what matters.

**4. Diagnose Before Prescribe** — "Feels slow" might be physics working correctly.

**5. Entropy Is Inevitable** — Plan for evolution, not perfection.

### The Hierarchy

1. **IMPOSSIBLE** — Physics violations. Cannot be generated.
2. **BLOCK** — Lens forced. StrictLens in financial zones.
3. **WARN** — Suggestions only. User preference respected.

## Quick Start

### Install

```bash
npm install sigil-mark
```

### Mount onto Existing Repository

```bash
# One-liner install (adds skills and commands)
curl -fsSL https://raw.githubusercontent.com/0xHoneyJar/sigil/main/.claude/scripts/mount-sigil.sh | bash

# Start Claude Code
claude

# Initialize and capture soul
/setup
/envision
```

### Basic Usage

```tsx
import {
  useCriticalAction,
  CriticalZone,
  useLens,
} from 'sigil-mark';

function PaymentForm({ amount }) {
  // Core: Physics engine with time authority
  const payment = useCriticalAction({
    mutation: () => api.pay(amount),
    timeAuthority: 'server-tick',
  });

  // Lens: Auto-selects StrictLens in CriticalZone
  const Lens = useLens();

  return (
    <CriticalZone financial>
      <CriticalZone.Content>
        <h2>Confirm Payment</h2>
        <p>${amount}</p>
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

## Best Practices

### The Setup Flow

Run these commands in order when starting a new project:

```
/setup      → Creates state zone structure
/envision   → Captures product soul (interview)
/codify     → Defines zone rules
```

**Time investment:** ~15 minutes
**Payoff:** Every future generation inherits your design physics automatically.

### 1. Start with Soul, Not Rules

Run `/envision` before anything else. The soul interview captures *why* your product feels the way it does.

**Bad**: "Use blue buttons with 8px radius"
**Good**: "Checkout should feel like confirming a bank transfer—heavy and deliberate."

### 2. Let Layouts Define Zones

Don't configure file paths. Use layout primitives:

```tsx
// This IS your zone definition
<CriticalZone financial>
  {/* StrictLens forced, server-tick required */}
</CriticalZone>

<MachineryLayout>
  {/* Keyboard nav, optimistic OK */}
</MachineryLayout>

<GlassLayout>
  {/* Hover physics, playful */}
</GlassLayout>
```

### 3. Use /craft Diagnostically

When something "feels wrong," ask for diagnosis:

**Bad**: `/craft "make the button faster"`
**Good**: `/craft "the claim button feels slow, diagnose why"`

Often, "feels slow" is physics working correctly. Checkout *should* feel deliberate.

### 4. Garden Regularly

Run `/garden` monthly to catch drift:
- Components straying from patterns
- Stale sandbox experiments
- v1.2.5 deprecated API usage

## Architecture (3 Layers)

```
┌────────────────────────────────────────────────────────────┐
│  CORE LAYER — Physics engines (Truth)                     │
│  useCriticalAction → State Stream                         │
│  { status, timeAuthority, selfPrediction, worldTruth }    │
├────────────────────────────────────────────────────────────┤
│  LAYOUT LAYER — Zones + Structural Physics                │
│  CriticalZone, MachineryLayout, GlassLayout               │
│  Layouts ARE Zones. Physics is DOM, not lint.             │
├────────────────────────────────────────────────────────────┤
│  LENS LAYER — Interchangeable UIs (Experience)            │
│  useLens() → Lens components                              │
│  DefaultLens, StrictLens, A11yLens                        │
└────────────────────────────────────────────────────────────┘
```

## Core Layer

### useCriticalAction

Main physics hook with time authority:

```tsx
const action = useCriticalAction({
  mutation: () => api.doThing(),
  timeAuthority: 'server-tick' | 'optimistic' | 'hybrid',
  onSuccess: (data) => {},
  onError: (error) => {},
});

// State stream
action.state.status    // 'idle' | 'confirming' | 'pending' | 'confirmed' | 'failed'
action.state.progress  // 0-100 for hybrid

// Actions
action.commit()        // Execute mutation
action.cancel()        // Cancel
action.reset()         // Reset to idle
```

### Time Authorities

| Authority | Behavior | Use Case |
|-----------|----------|----------|
| `server-tick` | Wait for server confirmation | Payments, destructive actions |
| `optimistic` | Instant update, silent rollback | Admin tools, lists |
| `hybrid` | Instant + sync indicator | Real-time collaboration |

## Layout Layer

Layouts ARE Zones. Wrap your content in a layout to provide zone context.

### CriticalZone

For high-stakes financial/destructive actions:

```tsx
<CriticalZone financial={true}>
  <CriticalZone.Content>...</CriticalZone.Content>
  <CriticalZone.Actions>...</CriticalZone.Actions>
</CriticalZone>
```

- Forces `server-tick` time authority
- Forces `StrictLens` when `financial={true}`
- 32px gap between actions
- Auto-sorts critical buttons last

### MachineryLayout

For keyboard-driven admin interfaces:

```tsx
<MachineryLayout stateKey="items" onAction={fn} onDelete={fn}>
  <MachineryLayout.Search />
  <MachineryLayout.List>
    <Lens.MachineryItem id="1">...</Lens.MachineryItem>
  </MachineryLayout.List>
  <MachineryLayout.Empty />
</MachineryLayout>
```

**Keyboard shortcuts:** Arrow keys, j/k, Enter/Space, Delete, Escape

### GlassLayout

For hover-driven marketing interfaces:

```tsx
<GlassLayout variant="card">
  <GlassLayout.Image />
  <GlassLayout.Content>
    <GlassLayout.Title />
    <GlassLayout.Description />
  </GlassLayout.Content>
  <GlassLayout.Actions />
</GlassLayout>
```

**Hover physics:** Scale 1.02, translateY -4px, shadow increase

## Lens Layer

### useLens

Returns appropriate lens based on zone context:

```tsx
const Lens = useLens();

// In CriticalZone with financial=true → StrictLens (forced)
// In MachineryLayout/GlassLayout → User preference
// No layout → DefaultLens
```

### Built-in Lenses

| Lens | Touch Target | Contrast | Animations |
|------|-------------|----------|------------|
| `DefaultLens` | 44px | Standard | Yes |
| `StrictLens` | 48px | High | No |
| `A11yLens` | 56px | WCAG AAA | No |

### LensProvider

Set user preference app-wide:

```tsx
import { LensProvider, A11yLens } from 'sigil-mark';

<LensProvider initialLens={A11yLens}>
  <App />
</LensProvider>
```

Note: CriticalZone with `financial={true}` still forces StrictLens.

## Commands

| Command | Purpose |
|---------|---------|
| `/setup` | Initialize Sigil on a repo |
| `/envision` | Capture product soul (interview) |
| `/craft` | Get design guidance with zone context |
| `/codify` | Define zone rules |
| `/inherit` | Bootstrap from existing codebase |
| `/validate` | Check physics compliance |
| `/garden` | Entropy detection and maintenance |

## State Zone: `sigil-mark/`

```
sigil-mark/
├── index.ts              # Main entry point
├── moodboard.md          # Product feel + references
├── rules.md              # Design rules by category
│
├── core/                 # Physics engines (Truth)
│   ├── use-critical-action.ts
│   ├── use-local-cache.ts
│   └── proprioception.ts
│
├── layouts/              # Zone primitives
│   ├── critical-zone.tsx
│   ├── machinery-layout.tsx
│   └── glass-layout.tsx
│
├── lenses/               # UI renderers (Experience)
│   ├── default/
│   ├── strict/
│   └── a11y/
│
└── __examples__/         # Usage examples
```

## Migration from v1.2.5

| v1.2.5 | v2.0 |
|--------|------|
| `<SigilZone material="decisive">` | `<CriticalZone financial>` |
| `useServerTick()` | `useCriticalAction({ timeAuthority: 'server-tick' })` |
| `useSigilPhysics()` | `useLens()` |
| `<DecisiveButton>` | `<Lens.CriticalButton state={...}>` |

See [sigil-mark/MIGRATION.md](sigil-mark/MIGRATION.md) for detailed guide.

## Version History

| Version | Codename | Description |
|---------|----------|-------------|
| v0.3.x | Constitutional Design Framework | Four pillars, strictness |
| v0.4.x | Soul Engine | npm package, hooks |
| v0.5.0 | Design Physics Engine | Simplified physics |
| v1.0.0 | Full Workbench | 4-panel tmux, materials |
| v1.2.5 | Zone Provider | Context-based physics |
| v2.0.0 | Reality Engine | Truth vs Experience, 3 layers |
| v2.6.0 | Craftsman's Flow | Process layer (agent-context) |
| **v3.0.0** | **Living Engine** | **Agent-time/Runtime split, Vocabulary, User Fluidity** |

## Migration Checklist (v2.6 → v3.0)

**Breaking Changes:**

- [ ] Remove `ProcessContextProvider` from client code (now agent-only)
- [ ] Replace `readLensArray` with `readPersonas` (deprecated alias still works)
- [ ] Update imports: `LensArray` → `PersonaArray` types

**New Features:**

- [ ] Add `vocabulary.yaml` for term definitions
- [ ] Add `philosophy.yaml` for intent hierarchy
- [ ] Configure `remote-config.yaml` if using dynamic values
- [ ] Add behavioral signals to `vibe-checks.yaml`

**Runtime Providers (Optional):**

```tsx
// New v3.0 runtime providers
import { PersonaProvider, ZoneProvider } from 'sigil-mark';

<PersonaProvider defaultPersona="power_user">
  <ZoneProvider zone="critical">
    <App />
  </ZoneProvider>
</PersonaProvider>
```

See [sigil-mark/MIGRATION.md](sigil-mark/MIGRATION.md) for detailed guide.

## Requirements

- Node.js 18+
- React 18+
- TypeScript 5+

## License

[MIT](LICENSE)

## Links

- [Claude Code](https://claude.ai/code)
- [Repository](https://github.com/0xHoneyJar/sigil)
- [Issues](https://github.com/0xHoneyJar/sigil/issues)
