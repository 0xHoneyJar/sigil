# Sigil

[![Version](https://img.shields.io/badge/version-2.6.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> *"Context before code. Constitution before creativity."*

Design Physics Framework for AI-assisted development. **v2.6 "Craftsman's Flow"** adds a Process Layer for human-AI collaboration on design decisions.

## Philosophy

### The Problem

AI agents generate UI without understanding your product's soul. Every generation is a coin flip—sometimes it matches your vision, sometimes it doesn't. Design systems help, but they're too abstract for AI to reason about.

Meanwhile, design debates consume hours. "Should this button be blue or green?" "Is this animation too slow?" These aren't physics problems—they're taste problems. But without a framework, every decision becomes a debate.

### The Insight: Truth vs Experience

Sigil v2.0 separates **Truth** (what happens) from **Experience** (how it looks):

- **Truth can't be argued with.** Server-authoritative data MUST show pending states—this isn't a preference, it's a constraint.
- **Experience is swappable.** The same physics can render as DefaultLens, StrictLens, or A11yLens without changing behavior.

When you frame constraints as physics, AI agents follow them without question. Humans stop debating and start building.

### Core Principles

**1. Feel Before Form**

Design is about how things *feel*, not how they *look*. A checkout button and a browse button might be visually identical—same color, same size, same font. But they *behave* differently because they're in different zones. Checkout is heavy and deliberate. Browse is light and instant.

**2. Layouts ARE Zones**

The same component behaves differently based on where it lives. Wrap in `<CriticalZone>` and it inherits critical physics. Wrap in `<GlassLayout>` and it becomes exploratory. No config files needed—the structure IS the zone.

**3. Constraints Enable Creativity**

Unlimited options produce paralysis. Physics constraints free you to focus on what matters. When the agent knows financial buttons MUST use StrictLens, it stops asking and starts building.

**4. Diagnose Before Prescribe**

When something feels wrong, don't jump to solutions. "Make it faster" might break the system. Often, the "problem" is actually physics working correctly—checkout *should* feel deliberate.

**5. Entropy Is Inevitable**

Products drift. What felt right at launch feels stale at scale. Plan for evolution, not perfection.

### The Hierarchy

1. **IMPOSSIBLE** — Physics violations. Cannot be generated. (e.g., optimistic updates in server-tick zones)
2. **BLOCK** — Lens forced. StrictLens in financial zones can't be overridden.
3. **WARN** — Suggestions only. User lens preference respected outside critical zones.

## What's New in v2.6

**Process Layer** — Human decisions that inform AI behavior:

| Component | Purpose | Key Feature |
|-----------|---------|-------------|
| **Constitution** | Protected capabilities | `withdraw`, `deposit` MUST always work |
| **Decisions** | Locked design choices | Time-based locks prevent endless debates |
| **Personas** | User archetypes | Physics/constraints per user type |
| **Vibe Checks** | Micro-surveys | Qualitative feedback at key moments |

**Commands** (v2.6):

```bash
/craft "Create checkout button"    # Design guidance with Process context
/consult "Primary CTA color"       # Lock design decisions
/consult DEC-001 --unlock          # Early unlock with justification
/garden                            # Health report (Constitution + Decisions)
```

**Zone-Persona Mapping:**

| Zone | Persona | Input | Constraint |
|------|---------|-------|------------|
| critical | power_user | keyboard | max_actions: 10 |
| marketing | newcomer | mouse | reading_level: beginner |
| mobile | mobile | touch | tap_targets: 48px |

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
| **v2.0.0** | **Reality Engine** | **Truth vs Experience, 3 layers** |

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
