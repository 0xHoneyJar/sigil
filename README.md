# Sigil

[![Version](https://img.shields.io/badge/version-4.1.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> *"Physics, not opinions. Constraints, not debates."*

Design Context Framework for AI-assisted development. Captures product soul, defines zone physics, and guides agents toward consistent design decisions—without blocking human creativity.

## v4.1 "Living Guardrails"

The enforcement layer that makes physics real:

```
CAPTURE              CREATE               ENFORCE
───────              ──────               ───────
/envision            /craft               useSigilMutation
/codify              /refine              eslint-plugin-sigil

OBSERVE              DECIDE               TEND
───────              ──────               ────
/observe             /consult             /garden
```

**What's new in v4.1:**
- `useSigilMutation` — Zone+Persona-aware hook that auto-resolves physics
- `eslint-plugin-sigil` — Lint rules that catch physics violations at dev time
- `SigilProvider` — Runtime context for zones, personas, and remote config
- Remote Soul — A/B test motion timing without touching code

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
├── .claude/skills/sigil/     # Agent skills (/envision, /craft, etc.)
├── sigil-mark/               # Runtime components & state
│   ├── providers/            # SigilProvider, RemoteSoul
│   ├── hooks/                # useSigilMutation
│   ├── layouts/              # CriticalZone, GlassLayout
│   ├── kernel/               # physics.yaml (motion profiles)
│   └── vocabulary/           # vocabulary.yaml (term mappings)
├── .sigilrc.yaml             # Zone configuration
└── .sigil-version.json       # Version tracking
```

### Optional: ESLint Plugin

For compile-time enforcement, add the ESLint plugin to your project:

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

**Three rules enforced:**
- `sigil/enforce-tokens` — No arbitrary values like `[13px]`
- `sigil/zone-compliance` — Timing must match zone physics
- `sigil/input-physics` — Admin zones need keyboard navigation

---

## Philosophy

### The Problem

AI agents generate UI without understanding your product's soul. Every generation is a coin flip—sometimes it matches your vision, sometimes it doesn't. Design systems help, but they're too abstract for AI to reason about.

Meanwhile, design debates consume hours. "Should this button be blue or green?" "Is this animation too slow?" These aren't physics problems—they're taste problems. Without a framework, every decision becomes a debate.

### The Insight: Physics vs Opinions

Sigil treats design decisions like physics, not opinions:

| Physics | Opinions |
|---------|----------|
| Can't be argued with | Invite debate |
| "Server data MUST show pending states" | "I think this should be faster" |
| Ends the conversation | Starts bikeshedding |

When you frame constraints as physics, AI agents follow them without question. Humans stop debating and start building.

### Core Principles

**1. Feel Before Form**
Design is about how things *feel*, not how they *look*. A checkout button and browse button might be visually identical—same color, same size. But they *behave* differently because they're in different physics zones. Checkout is heavy and deliberate. Browse is light and instant.

**2. Context Over Components**
The same component behaves differently based on where it lives. Zone is determined by *file path*, not component type. Put a file in `/checkout/` and it inherits critical zone physics automatically.

**3. Constraints Enable Creativity**
Unlimited options produce paralysis. Physics constraints free you to focus on what matters. When the agent knows checkout buttons MUST have pending states, it stops asking and starts building.

**4. Diagnose Before Prescribe**
When something feels wrong, don't jump to solutions. "Make it faster" might break the system. "Why does it feel slow?" reveals the root cause. Often, the "problem" is physics working correctly—checkout *should* feel deliberate.

**5. Entropy Is Inevitable**
Products drift. What felt right at launch feels stale at scale. Sigil treats this as physics: entropy is real, gardens need tending. Plan for evolution, not perfection.

### The Physics Hierarchy

Not all constraints are equal:

| Level | Behavior | Example |
|-------|----------|---------|
| **IMPOSSIBLE** | Physics violations. Cannot be generated. | Optimistic updates in server-authoritative zones |
| **BLOCK** | Blocked by default. Taste Key holder can override. | Exceeding element count budget |
| **WARN** | Suggestions only. Human decides. | Using a color outside the palette |

---

## Mental Models

### Truth vs Experience

Sigil separates **Truth** (what happens) from **Experience** (how it looks):

```
Truth:      Server says "pending" → UI MUST show pending state
Experience: HOW that pending state looks (spinner, skeleton, progress bar)
```

- **Truth can't be argued with.** Server-authoritative data MUST show pending states.
- **Experience is swappable.** Same physics, different rendering per persona.

### Zone × Persona Matrix

**Zone** (where) + **Persona** (who) = **Effective Physics**

```yaml
# .sigilrc.yaml
zones:
  critical:
    default_physics: deliberate
    persona_overrides:
      power_user: warm      # Power users get faster timing
      newcomer: reassuring  # Newcomers get extra feedback
```

Same interface, different experiences based on user type and context.

### Vocabulary: The API Surface

Vocabulary bridges human concepts and code:

```yaml
# sigil-mark/vocabulary/vocabulary.yaml
terms:
  - id: claim
    engineering_name: ClaimAction
    user_facing: ["Claim", "Harvest"]
    mental_model: "Harvesting rewards from a position"
    recommended:
      motion: deliberate
      easing: ease-out
    zones: [critical]
```

Agent protocol: Look up term → Get zone-appropriate physics → Generate code.

---

## Best Practices

### 1. Start with Soul, Not Rules

Run `/envision` before anything else. Rules without soul produce soulless output.

| Bad | Good |
|-----|------|
| "Use blue buttons with 8px radius" | "Checkout should feel like confirming a bank transfer—heavy and deliberate" |
| "Animation duration: 200ms" | "We want the confidence of Linear with the warmth of Notion" |

### 2. Define Zones Early

Zones are your biggest lever. Most products have 3-5:

```yaml
# .sigilrc.yaml
zones:
  critical:
    paths: ["**/checkout/**", "**/claim/**"]
    default_physics: deliberate
    patterns:
      prefer: [confirmation-flow, deliberate-entrance]
      warn: [instant-transition, playful-bounce]

  exploratory:
    paths: ["**/browse/**", "**/discover/**"]
    default_physics: playful
```

### 3. Use /craft Diagnostically

When something "feels wrong," don't ask for a fix—ask for diagnosis:

| Bad | Good |
|-----|------|
| `/craft "make the button faster"` | `/craft "the claim button feels slow, diagnose why"` |

The agent identifies root causes:

```
/craft "checkout feels slow"

DIAGNOSIS: Physics conflict detected.
The claim button is in critical zone (server_authoritative).
Physics requires pending state (800ms deliberate timing).

This is NOT a design problem. The delay IS the trust.

Options:
1. Accept the physics (recommended for money)
2. Add loading feedback within physics constraints
3. Escalate: /consult "Should checkout be optimistic?"
```

### 4. One Taste Key Holder

Design by committee produces mediocrity. Designate ONE person:

| CAN Override | CANNOT Override |
|--------------|-----------------|
| Budgets (element count) | Physics (sync authority) |
| Fidelity (gradient stops) | Security (auth, validation) |
| Taste (colors, typography) | Accessibility (contrast, keyboard) |

### 5. Garden Regularly

Run `/garden` monthly to catch drift:
- Components straying from essence
- Stale decisions no longer relevant
- Obsolete rulings from past contexts

### 6. Trust the Enforcement Layer

v4.1 adds real enforcement—use it:

```bash
# ESLint catches physics violations at dev time
npm run lint

# useSigilMutation auto-resolves physics at runtime
const { cssVars } = useSigilMutation({ intent: 'claim' });
```

---

## The 7 Skills

| Skill | Purpose | L1 (Default) | L2 (Targeted) | L3 (Full Control) |
|-------|---------|--------------|---------------|-------------------|
| `/envision` | Capture product moodboard | Full interview | `--quick` | `--from <file>` |
| `/codify` | Define design rules | Guided interview | `--zone <name>` | `--from <design-system.json>` |
| `/craft` | Get design guidance | Auto-context | `--zone`, `--persona` | `--no-gaps` |
| `/observe` | Visual feedback loop | Capture screen | `--component` | `--screenshot`, `--rules` |
| `/refine` | Incremental updates | Review feedback | `--persona`, `--zone` | `--evidence` |
| `/consult` | Record decisions | 30d lock | `--scope`, `--lock` | `--protect`, `--evidence` |
| `/garden` | Health monitoring | Summary | `--personas`, `--feedback` | `--validate` (CI) |

### Progressive Disclosure

All skills support three grip levels:

- **L1**: Sensible defaults, minimal input required
- **L2**: Targeted options for specific needs
- **L3**: Full control for power users

---

## Runtime Integration

### SigilProvider

Wrap your app to enable zone context:

```tsx
import { SigilProvider, SigilProviderProps } from 'sigil-mark';

const config: SigilProviderProps = {
  remoteAdapter: launchDarklyAdapter,  // Optional: A/B test timing
  defaultPersona: 'default',
};

function App() {
  return (
    <SigilProvider {...config}>
      <YourApp />
    </SigilProvider>
  );
}
```

### useSigilMutation

The core hook that replaces manual physics wiring:

```tsx
import { useSigilMutation } from 'sigil-mark';

function ClaimButton({ poolId }) {
  const { execute, state, cssVars, physics } = useSigilMutation({
    mutation: () => api.claim(poolId),
    intent: 'claim',  // From vocabulary.yaml
    // Physics auto-resolved from: zone + persona + remote vibes
  });

  return (
    <button
      onClick={execute}
      disabled={state === 'pending'}
      style={cssVars}
    >
      {state === 'pending' ? 'Claiming...' : 'Claim Rewards'}
    </button>
  );
}
```

**What `cssVars` provides:**
```css
--sigil-duration: 800ms;    /* From physics.yaml */
--sigil-easing: ease-out;   /* From physics.yaml */
```

### Zone Layouts

Pre-built layout components that set zone context:

```tsx
import { CriticalZone, GlassLayout, MachineryLayout } from 'sigil-mark';

// Critical zone: deliberate physics, server-authoritative
<CriticalZone financial>
  <ClaimButton />
</CriticalZone>

// Glass layout: smooth physics, exploratory feel
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
<motion.div animate={{ opacity: 1 }} transition={{ duration: 0.2 }} />

// ✅ Good: Respects critical zone physics
<motion.div animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
```

**`sigil/input-physics`** — Admin zones need keyboard support

```tsx
// ❌ Error: Admin zone requires keyboard navigation
<div onClick={handleClick} />

// ✅ Good: Accessible interaction
<button onClick={handleClick} onKeyDown={handleKeyDown} />
```

### Configuration

```js
// eslint.config.js
import sigil from 'eslint-plugin-sigil';

export default [
  sigil.configs.recommended,
  {
    rules: {
      'sigil/enforce-tokens': 'warn',     // Downgrade to warning
      'sigil/zone-compliance': 'error',   // Keep strict
    },
  },
];
```

---

## Remote Soul (A/B Testing)

Adjust motion timing without code changes:

```yaml
# sigil-mark/remote-soul.yaml
remote_config:
  vibes:
    timing_modifier: 1.0    # 0.5 = faster, 2.0 = slower
    rhythm_preference: relaxed

kernel_locked:
  - physics           # Engineers control physics kernel
  - sync              # Sync strategies never remote
  - protected_zones   # Critical zone rules locked
```

### Adapter Integration

```tsx
import { createLaunchDarklyAdapter } from 'sigil-mark/providers/remote-soul';

const adapter = createLaunchDarklyAdapter(ldClient, 'sigil-vibes');

<SigilProvider remoteAdapter={adapter}>
  <App />
</SigilProvider>
```

**Philosophy:** Marketing can tune *feel*, but never break *physics*.

---

## Architecture

### State Zone Structure

```
sigil-mark/
├── moodboard.md              # Product feel
├── rules.md                  # Design rules
├── vocabulary/               # Term → physics mapping
│   └── vocabulary.yaml
├── kernel/                   # Physics definitions (v4.1)
│   └── physics.yaml          # 7 motion profiles
├── providers/                # Runtime contexts (v4.1)
│   ├── sigil-provider.tsx
│   └── remote-soul.ts
├── hooks/                    # React hooks (v4.1)
│   ├── use-sigil-mutation.ts
│   └── physics-resolver.ts
├── layouts/                  # Zone layout components
│   ├── critical-zone.tsx
│   ├── glass-layout.tsx
│   └── machinery-layout.tsx
├── personas/                 # User archetypes
│   └── personas.yaml
└── consultation-chamber/     # Locked decisions
    └── decisions/
```

### Physics Resolution Algorithm

```
1. Determine zone from file path
2. Get zone's default_physics
3. Check persona_overrides[current_persona]
4. Apply remote soul timing_modifier (if any)
5. Return final { duration, easing, constraints }
```

### Config File

```yaml
# .sigilrc.yaml
version: "1.0"
strictness: guiding  # discovery | guiding | enforcing | strict

zones:
  critical:
    paths: ["src/features/checkout/**", "src/features/claim/**"]
    default_physics: deliberate
    persona_overrides:
      power_user: warm
      newcomer: reassuring
    patterns:
      prefer: [confirmation-flow]
      warn: [instant-transition]

  exploratory:
    paths: ["src/features/browse/**"]
    default_physics: playful
```

---

## Motion Profiles

Defined in `sigil-mark/kernel/physics.yaml`:

| Motion | Duration | Easing | Use Case |
|--------|----------|--------|----------|
| `instant` | 0ms | linear | Admin actions, toggles |
| `snappy` | 150ms | ease-out | Quick feedback, hovers |
| `warm` | 300ms | ease-in-out | Standard transitions |
| `deliberate` | 800ms | ease-out | Critical actions, confirmations |
| `reassuring` | 600ms | ease-in-out | Onboarding, first-time flows |
| `celebratory` | 1200ms | spring | Success moments, rewards |
| `reduced` | 0ms | linear | Accessibility (prefers-reduced-motion) |

---

## Migration

See **[MIGRATION-v4.1.md](MIGRATION-v4.1.md)** for v4.0 → v4.1 migration.

### Quick Reference

| v4.0 | v4.1 |
|------|------|
| `useCriticalAction` | `useSigilMutation` |
| Manual physics wiring | Auto-resolved from context |
| No ESLint | `eslint-plugin-sigil` |
| No remote config | Remote Soul adapters |

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
- **[MIGRATION-v4.1.md](MIGRATION-v4.1.md)** — v4.0 → v4.1 migration guide
- **[CHANGELOG.md](CHANGELOG.md)** — Version history
- **[docs/MARKETING-VIBES.md](docs/MARKETING-VIBES.md)** — Remote soul for marketing

---

## License

[MIT](LICENSE)

## Links

- [Claude Code](https://claude.ai/code)
- [Loa Framework](https://github.com/0xHoneyJar/loa)
- [Repository](https://github.com/0xHoneyJar/sigil)
- [Issues](https://github.com/0xHoneyJar/sigil/issues)
