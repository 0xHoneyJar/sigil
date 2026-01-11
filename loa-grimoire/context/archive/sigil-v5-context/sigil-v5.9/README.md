# Sigil

[![Version](https://img.shields.io/badge/version-5.9.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> *"Filesystem is truth. Agency stays with the human. Rules evolve."*

Design Context Framework for AI-assisted development. Captures product soul, defines zone physics, and guides agents toward consistent design decisions—without blocking human creativity.

## v5.9 "The Lucid Studio"

The transparent, fast, and deferential architecture:

```
SKILLS                           GOVERNANCE
──────                           ──────────
Scanning Sanctuary               Status Propagation
Analyzing Data Risk              Amendment Protocol
Auditing Cohesion                Justification Capture
Negotiating Integrity            Workflow Engine
Simulating Interaction
Polishing Code
```

**What's new in v5.9:**
- **Live Grep** — No cache, no drift. Filesystem is truth via ripgrep.
- **Type-Driven Physics** — Data schema determines physics, not button names.
- **JIT Polish** — Fix on demand, not on save. Debugging allowed.
- **Status Propagation** — Non-blocking tier downgrades. Reality over bureaucracy.
- **Amendment Protocol** — Constitution evolves. Negotiate, don't refuse.
- **Cohesion Overlay** — Visual context checks, not just pixel rules.

---

## Installation

```bash
# Mount Sigil onto any repository
curl -fsSL https://raw.githubusercontent.com/0xHoneyJar/sigil/main/.claude/scripts/mount-sigil.sh | bash

# Start Claude Code and capture your product's soul
claude
/envision
```

**Time investment:** ~15 minutes to capture soul  
**Payoff:** Every future generation inherits your design physics automatically

### What Gets Installed

```
your-repo/
├── .claude/skills/sigil/     # Agent skills (6 core skills)
├── sigil-mark/               # Runtime components & state
│   ├── kernel/               # constitution, fidelity, workflow, vocabulary
│   ├── skills/               # Skill definitions (YAML)
│   ├── canon/                # Gold implementations & patterns
│   ├── governance/           # Justifications, amendments
│   ├── hooks/                # useSigilMutation
│   ├── providers/            # SigilProvider
│   └── layouts/              # CriticalZone, GlassLayout, MachineryLayout
├── .sigilrc.yaml             # Zone configuration
└── .sigil-version.json       # Version tracking
```

### Optional: ESLint Plugin

For compile-time enforcement:

```bash
npm install eslint-plugin-sigil --save-dev
```

```js
// eslint.config.js
import sigil from 'eslint-plugin-sigil';

export default [
  sigil.configs.recommended,
];
```

**Rules enforced:**
- `sigil/enforce-tokens` — No arbitrary values like `[13px]`
- `sigil/zone-compliance` — Timing must match zone physics
- `sigil/input-physics` — Interactive elements need keyboard support
- `sigil/data-physics` — Money types require server-tick

---

## Philosophy

### The Problem

AI agents generate UI without understanding your product's soul. Every generation is a coin flip—sometimes it matches your vision, sometimes it doesn't. Design systems help, but they're too abstract for AI to reason about.

Meanwhile, previous approaches introduced new problems:
- **Caches drift** — Branch switch = stale index = hallucinated components
- **Auto-fix is hostile** — Engineers can't debug with red borders
- **Blocking rules encourage hacks** — Copy-paste to bypass bureaucracy
- **Static constitution blocks innovation** — Rules can't evolve

### The Insight: Lucid over Magic

Sigil v5.9 prioritizes transparency over cleverness:

| Magic (Bad) | Lucid (Good) |
|-------------|--------------|
| Cached indexes that drift | Live grep that's always true |
| Auto-fix on save | Polish on demand |
| Block imports that violate rules | Propagate status honestly |
| Refuse constitution violations | Negotiate amendments |

When you make the system transparent, engineers trust it. When engineers trust it, they use it.

### Core Principles

**1. Filesystem is Truth**  
No caches. No indexes. ripgrep reads the filesystem live. When you switch branches, the agent sees the new branch. Zero drift.

**2. Agency Stays with Human**  
Polish happens when you ask (`/polish`), not when you save. Debug with `border: 1px solid red` all you want. Clean commits, not clean keystrokes.

**3. Data is Constitution**  
Physics binds to data types, not button names. `Transfer(Money)` gets server-tick. `Transfer(Task)` gets CRDT. The schema decides.

**4. Rules Evolve**  
When you violate the constitution, the agent negotiates: COMPLY, BYPASS, or AMEND. One good justification changes the law.

**5. Cohesion over Technology**  
The Mod Ghost lesson: technically superior assets were rejected because they clashed with neighbors. Check visual context, not just pixel rules.

### The Physics Hierarchy

Not all constraints are equal:

| Level | Behavior | Example |
|-------|----------|---------|
| **IMPOSSIBLE** | Physics violations. Cannot be generated. | Optimistic updates on Money type |
| **NEGOTIATE** | Agent offers COMPLY/BYPASS/AMEND | Exceeding animation duration |
| **WARN** | Suggestions only. Human decides. | Using a color outside the palette |

---

## Mental Models

### Type-Driven Physics

The data type determines physics, not the button name:

```typescript
// Same word "Transfer" — different physics

// Linear context: Transfer a task → CRDT is fine
function TransferTaskButton({ taskId }: { taskId: Task }) { ... }

// Family context: Transfer ETH → Server-tick with simulation
function TransferButton({ amount }: { amount: Money }) { ... }
```

The agent reads type annotations, looks up the constitution, applies the correct physics.

### The Constitution

```yaml
# sigil-mark/kernel/constitution.yaml
data_physics:
  financial:
    types: [Money, Balance, Transfer, Withdrawal]
    physics: server-tick
    requires: [simulation, confirmation, explicit-pending]
    forbidden: [useOptimistic]
    
  collaborative:
    types: [Task, Document, Comment]
    physics: crdt
    requires: [conflict-resolution, background-sync]
    forbidden: [blocking-save]
    
  local:
    types: [Preference, Draft, Toggle]
    physics: local-first
    requires: [useOptimistic, instant-feedback]
    forbidden: [loading-spinner]
```

### Status Propagation

Tiers flow through dependencies:

```
Tier(Component) = min(DeclaredTier, Tier(Dependencies))

Gold imports Gold → stays Gold
Gold imports Silver → becomes Silver  
Gold imports Draft → becomes Draft
```

No blocking. Honest labeling. Reality over bureaucracy.

### Vocabulary: The API Surface

Vocabulary bridges human concepts and physics:

```yaml
# sigil-mark/kernel/vocabulary.yaml
terms:
  claim:
    data_type: Money
    physics: server-tick
    zones: [critical]
    requires: [simulation, confirmation]
    
  edit:
    data_type: Task
    physics: crdt
    zones: [standard]
```

Agent protocol: Look up term → Get data type → Apply physics from constitution.

---

## Best Practices

### 1. Start with Soul, Not Rules

Run `/envision` before anything else. Rules without soul produce soulless output.

| Bad | Good |
|-----|------|
| "Use blue buttons with 8px radius" | "Checkout should feel like confirming a bank transfer—heavy and deliberate" |
| "Animation duration: 200ms" | "We want the confidence of Linear with the warmth of Notion" |

### 2. Define Data Types Early

Your types are your constitution:

```typescript
// types/index.ts
export type Money = { _brand: 'Money'; amount: bigint };
export type Task = { _brand: 'Task'; id: string; title: string };
export type Draft = { _brand: 'Draft'; content: string };
```

When the agent sees these types, physics is automatic.

### 3. Use /craft Diagnostically

When something "feels wrong," ask for diagnosis:

| Bad | Good |
|-----|------|
| `/craft "make the button faster"` | `/craft "the claim button feels slow, diagnose why"` |

The agent identifies root causes:

```
/craft "checkout feels slow"

DIAGNOSIS: Physics working correctly.
The claim button operates on Money type (server-tick physics).
Constitution requires simulation + confirmation.

This is NOT a design problem. The delay IS the trust.

Options:
1. COMPLY: Add better loading feedback within physics
2. BYPASS: Override with justification (will be logged)
3. AMEND: Propose "instant-with-simulation" pattern
```

### 4. One Taste Key Holder

Design by committee produces mediocrity. Designate ONE person:

| CAN Override | CANNOT Override |
|--------------|-----------------|
| Fidelity ceiling | Data physics |
| Animation timing | Security patterns |
| Color choices | Accessibility requirements |

### 5. Polish at the Gate

Let engineers work messy. Enforce at commit:

```bash
# In .husky/pre-commit
npx sigil polish --check

# Or in CI
- name: Check Sigil compliance
  run: npx sigil polish --ci
```

### 6. Capture Justifications

When overriding, explain why:

```tsx
// @sigil-override: no-shadows
// Reason: Marketing page needs drop shadows for depth
<Card className="shadow-lg" />
```

One good reason > 15% silent mutiny.

---

## The 6 Skills

| Skill | Purpose | Trigger |
|-------|---------|---------|
| **Scanning Sanctuary** | Find components via live grep | Any component lookup |
| **Analyzing Data Risk** | Type → physics lookup | Action handler generation |
| **Auditing Cohesion** | Visual context check | New component generation |
| **Negotiating Integrity** | Amendment protocol | Constitution violation |
| **Simulating Interaction** | Timing verification | Critical components |
| **Polishing Code** | JIT standardization | `/polish` or commit |

### Skill Details

**Scanning Sanctuary**
```bash
# Live grep, no cache
rg "@sigil-tier gold" -l --type ts
```

**Analyzing Data Risk**
```
Function signature: (amount: Money) => ...
Lookup: Money → server-tick
Require: simulation, confirmation
Forbid: useOptimistic
```

**Auditing Cohesion**
```
Generated: <Card className="shadow-lg">
Context: Dashboard uses flat cards
Report: "Visual variance detected. Match context?"
```

**Negotiating Integrity**
```
VIOLATION: Optimistic update on Money type
OPTIONS:
1. COMPLY - Use simulation (feels instant, actually safe)
2. BYPASS - Override with justification
3. AMEND - Propose constitution change
```

---

## Runtime Components

### SigilProvider

```tsx
import { SigilProvider } from 'sigil-mark/providers';

function App() {
  return (
    <SigilProvider persona="power_user">
      <Router />
    </SigilProvider>
  );
}
```

### useSigilMutation

The core hook with type-driven physics:

```tsx
import { useSigilMutation } from 'sigil-mark/hooks';

function ClaimButton({ amount }: { amount: Money }) {
  const { 
    execute,
    simulate,      // Preview before commit
    confirm,       // User confirms after preview
    state,         // 'idle' | 'simulating' | 'confirming' | 'committing' | 'done'
    preview,       // Simulation result
    cssVars 
  } = useSigilMutation({
    mutation: () => api.claim(amount),
    // Physics auto-resolved: Money → server-tick → simulation required
  });

  return (
    <>
      {state === 'idle' && (
        <button onClick={() => simulate()}>
          Claim {amount}
        </button>
      )}
      
      {state === 'simulating' && <Spinner />}
      
      {state === 'confirming' && (
        <ConfirmDialog 
          preview={preview}
          onConfirm={() => confirm()}
        />
      )}
    </>
  );
}
```

### Zone Layouts

```tsx
import { CriticalZone, GlassLayout, MachineryLayout } from 'sigil-mark/layouts';

// Critical zone: server-tick physics, simulation required
<CriticalZone financial>
  <ClaimButton amount={amount} />
</CriticalZone>

// Glass layout: local-first physics, exploratory feel
<GlassLayout>
  <BrowsePanel />
</GlassLayout>

// Machinery layout: instant physics, admin efficiency
<MachineryLayout>
  <AdminDashboard />
</MachineryLayout>
```

---

## ESLint Plugin

### Rules

**`sigil/enforce-tokens`** — No arbitrary Tailwind values

```tsx
// ❌ Error: Use design tokens instead of [13px]
<div className="p-[13px]" />

// ✅ Good: Token-based spacing
<div className="p-3" />
```

**`sigil/zone-compliance`** — Timing matches zone physics

```tsx
// ❌ Error: Critical zone requires >= 600ms duration
<motion.div transition={{ duration: 0.2 }} />

// ✅ Good: Respects critical zone physics
<motion.div transition={{ duration: 0.8 }} />
```

**`sigil/data-physics`** — Money types require server-tick

```tsx
// ❌ Error: Money type requires server-tick physics
const { execute } = useOptimistic<Money>();

// ✅ Good: Uses server-tick with simulation
const { simulate, confirm } = useSigilMutation<Money>();
```

---

## Architecture

### File Structure

```
sigil-mark/
├── kernel/                   # Core truth (loaded in system prompt)
│   ├── constitution.yaml     # Data type → physics
│   ├── fidelity.yaml         # Visual + ergonomic ceiling
│   ├── workflow.yaml         # Process rules
│   └── vocabulary.yaml       # Term → physics mapping
│
├── skills/                   # Skill definitions
│   ├── scanning-sanctuary.yaml
│   ├── analyzing-data-risk.yaml
│   ├── auditing-cohesion.yaml
│   ├── negotiating-integrity.yaml
│   ├── simulating-interaction.yaml
│   └── polishing-code.yaml
│
├── canon/                    # Gold implementations
│   ├── components/
│   └── patterns/
│
├── governance/               # Evolution tracking
│   ├── justifications.log
│   └── amendments/
│
├── hooks/                    # React hooks
│   └── use-sigil-mutation.ts
│
├── providers/                # Runtime context
│   └── sigil-provider.tsx
│
└── layouts/                  # Zone components
    ├── critical-zone.tsx
    ├── glass-layout.tsx
    └── machinery-layout.tsx
```

### Physics Resolution Algorithm

```
1. Extract data type from function signature
2. Look up type in constitution.yaml
3. Get required physics (server-tick | crdt | local-first)
4. Apply persona overrides if any
5. Return { physics, requires, forbidden, cssVars }
```

### JSDoc Pragmas

Components declare status via JSDoc (zero runtime cost):

```tsx
/**
 * @sigil-tier gold
 * @sigil-zone critical
 * @sigil-data-type Money
 */
export function TransferButton({ amount }: { amount: Money }) {
  // ...
}
```

Discovery: `rg "@sigil-tier gold" -l`

---

## Migration

See **[MIGRATION-v5.9.md](MIGRATION-v5.9.md)** for v4.1 → v5.9 migration.

### Quick Reference

| v4.1 | v5.9 |
|------|------|
| `sigil.map` cache | Live grep (ripgrep) |
| Auto-fix on save | JIT polish on demand |
| Blocking contagion | Status propagation |
| Static constitution | Amendment protocol |
| Visual rules only | Cohesion + ergonomic checks |

---

## Coexistence with Loa

Sigil and Loa operate independently:

| Aspect | Sigil | Loa |
|--------|-------|-----|
| State Zone | `sigil-mark/` | `loa-grimoire/` |
| Config | `.sigilrc.yaml` | `.loa.config.yaml` |
| Focus | Design context | Product lifecycle |
| Handoff | Design issues | Architecture decisions |

---

## Why "Sigil"?

A sigil is a symbolic representation of intent—a mark that carries meaning beyond its form. Sigil captures your product's design intent and makes it available to AI agents, ensuring every generated component carries the same soul.

---

## Documentation

- **[CLAUDE.md](CLAUDE.md)** — Agent protocol and quick reference
- **[PROCESS.md](PROCESS.md)** — Development workflow
- **[MIGRATION-v5.9.md](MIGRATION-v5.9.md)** — v4.1 → v5.9 migration guide
- **[CHANGELOG.md](CHANGELOG.md)** — Version history
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — Deep architectural overview

---

## License

[MIT](LICENSE)

## Links

- [Claude Code](https://claude.ai/code)
- [Loa Framework](https://github.com/0xHoneyJar/loa)
- [Repository](https://github.com/0xHoneyJar/sigil)
- [Issues](https://github.com/0xHoneyJar/sigil/issues)
