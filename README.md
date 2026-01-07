# Sigil

[![Version](https://img.shields.io/badge/version-3.1.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> *"Physics, not opinions. Constraints, not debates."*

Design Context Framework for AI-assisted development. Captures product soul, defines zone physics, and guides agents toward consistent design decisions—without blocking human creativity.

## Quick Start

```bash
# Mount onto any repository
curl -fsSL https://raw.githubusercontent.com/0xHoneyJar/sigil/main/.claude/scripts/mount-sigil.sh | bash

# Start Claude Code and initialize
claude
/sigil-setup
/envision
```

**Time investment:** ~15 minutes to capture soul
**Payoff:** Every future generation inherits your design physics automatically

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

### The Hierarchy

Not all constraints are equal:

| Level | Behavior | Example |
|-------|----------|---------|
| **IMPOSSIBLE** | Physics violations. Cannot be generated. No override. | Optimistic updates in server-authoritative zones |
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
- **Experience is swappable.** Same physics renders as DefaultLens, StrictLens, or A11yLens.

### Vocabulary: The API Surface

Vocabulary bridges human concepts and code:

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

Same interface, different experiences based on user type and context.

---

## Best Practices

### 1. Start with Soul, Not Rules

Run `/envision` before anything else. Rules without soul produce soulless output.

| Bad | Good |
|-----|------|
| "Use blue buttons with 8px radius" | "Checkout should feel like confirming a bank transfer—heavy and deliberate" |
| "Animation duration: 200ms" | "We want the confidence of Linear with the warmth of Notion" |

The `/envision` interview captures:
- **Reference products**: What apps/games inspire the feel?
- **Anti-patterns**: What should we never do?
- **Key moments**: What are the high-stakes interactions?

### 2. Define Zones Early

Zones are your biggest lever. Most products have 3-5:

```yaml
# .sigilrc.yaml
zones:
  critical:
    paths: ["**/checkout/**", "**/claim/**"]
    motion: deliberate
    patterns:
      prefer: [confirmation-flow, deliberate-entrance]
      warn: [instant-transition, playful-bounce]

  exploratory:
    paths: ["**/browse/**", "**/discover/**"]
    motion: playful
```

Zone resolution works by file path—no manual annotation needed.

### 3. Use /craft Diagnostically

When something "feels wrong," don't ask for a fix—ask for diagnosis:

| Bad | Good |
|-----|------|
| `/craft "make the button faster"` | `/craft "the claim button feels slow, diagnose why"` |
| `/craft "fix this animation"` | `/craft "this transition feels jarring, what's wrong?"` |

The agent identifies root causes:

```
/craft "checkout feels slow"

DIAGNOSIS: Physics conflict detected.
The claim button is in critical zone (server_authoritative).
Physics requires pending state and discrete tick (600ms).

This is NOT a design problem. The delay IS the trust.

Options:
1. Accept the physics (recommended for money)
2. Add loading feedback within physics constraints
3. Escalate: /consult "Should checkout be optimistic?"
```

### 4. One Taste Key Holder

Design by committee produces mediocrity. Designate ONE person as Taste Key holder:

| CAN Override | CANNOT Override |
|--------------|-----------------|
| Budgets (element count) | Physics (sync authority) |
| Fidelity (gradient stops) | Security (auth, validation) |
| Taste (colors, typography) | Accessibility (contrast, keyboard nav) |

This isn't dictatorship—it's clarity. Everyone knows who decides taste.

### 5. Garden Regularly

Run `/garden` monthly to catch drift:
- Components straying from essence
- Stale mutations without resolution
- Obsolete rulings no longer needed
- Era signals suggesting major evolution

### 6. Let Loa Handle Architecture

When you hit structural issues, hand off to Loa:

| Problem | Owner |
|---------|-------|
| "Button feels wrong" | Sigil (`/craft`) |
| "Should checkout be optimistic?" | Loa (`/consult`) |
| "Animation is too slow" | Sigil (`/craft`) |
| "Do we need real-time updates?" | Loa (`/architect`) |

---

## Architecture

### State Zone Model

| Zone | Path | Purpose |
|------|------|---------|
| **System** | `.claude/skills/`, `.claude/commands/` | Sigil skills (managed) |
| **State** | `sigil-mark/` | Your design context (committed) |
| **Config** | `.sigilrc.yaml` | Zone definitions, rejections |

### State Zone Structure

```
sigil-mark/
├── moodboard.md              # Product feel, references, anti-patterns
├── moodboard/                # Rich inspiration collection
│   ├── references/           # Products to emulate
│   ├── anti-patterns/        # What to avoid
│   ├── articles/             # Design thinking
│   └── index.yaml            # Featured & tags
├── rules.md                  # Design rules by category
├── vocabulary/               # Term definitions
│   └── vocabulary.yaml       # Human concepts → code mapping
│
├── soul-binder/              # Values and philosophy
│   ├── philosophy.yaml       # Primary intent, principles
│   └── canon-of-flaws.yaml   # Protected emergent behaviors
│
├── lens-array/               # User personas
│   └── lenses.yaml           # Persona definitions
│
├── consultation-chamber/     # Decision records
│   └── decisions/            # Consultation logs
│
└── proving-grounds/          # Validation artifacts
    └── snapshots/            # Before/after captures
```

---

## Core Concepts

### Materials

Materials define physics, not just styles:

| Material | Weight | Motion | Feedback | Zone Affinity |
|----------|--------|--------|----------|---------------|
| **Clay** | Heavy | Spring (deliberate) | Depress | Critical, Transactional |
| **Machinery** | None | Instant | Highlight | Admin, Dashboard |
| **Glass** | Weightless | Ease (smooth) | Glow | Exploratory, Marketing |
| **Fortress** | Immovable | None | Confirmation | Security, Vault |

### Zones

Zones determine physics by file path:

| Zone | Material | Motion | Budget | Decisions |
|------|----------|--------|--------|-----------|
| Critical | clay | deliberate | 5 elements | 2 max |
| Transactional | clay | responsive | 12 elements | 5 max |
| Exploratory | glass | playful | 20 elements | 10 max |
| Marketing | glass | bouncy | 15 elements | 8 max |

### Lenses (Personas)

Same interface, different physics:

| Lens | Touch Target | Animations | Use Case |
|------|-------------|------------|----------|
| `default` | 44px | Yes | Standard users |
| `strict` | 48px | No | Financial zones (forced) |
| `a11y` | 56px | Reduced | Accessibility |
| `power_user` | 36px | Minimal | Keyboard-first |

### Rejections

Patterns to warn about (not block):

```yaml
rejections:
  - pattern: "Spinner"
    reason: "Creates anxiety in critical zones"
    exceptions: ["admin/**"]
```

**Philosophy**: Warn, don't block. Human decides.

---

## The Workflow

| Phase | Command | Purpose | Output |
|-------|---------|---------|--------|
| 0 | `/sigil-setup` | Initialize framework | `.sigil-setup-complete` |
| 1 | `/envision` | Capture product soul | `sigil-mark/moodboard.md` |
| 2 | `/codify` | Define design rules | `sigil-mark/rules.md` |
| 3 | `/craft` | Get guidance during implementation | Zone-aware suggestions |
| 4 | `/validate` | Check physics compliance | Violation report |
| 5 | `/approve` | Human sign-off on patterns | Approval record |

### Additional Commands

| Command | Purpose |
|---------|---------|
| `/inherit` | Bootstrap from existing codebase |
| `/garden` | Entropy detection, maintenance |
| `/consult` | Log decisions requiring authority |
| `/unlock` | Override locked decisions |
| `/canonize` | Protect emergent flaws |

---

## Agent Protocol

When generating UI code, Sigil-aware agents:

1. **Load context** — Read `sigil-mark/moodboard.md` + `rules.md`
2. **Determine zone** — Match file path to `.sigilrc.yaml` zones
3. **Query moodboard** — Find zone-relevant references
4. **Apply physics** — Use zone-appropriate materials and motion
5. **Surface warnings** — Explain rejected patterns, offer alternatives

### On Rejected Patterns

Agents **never refuse**. They explain and offer alternatives:

```
User: "Add a spinner while processing"

Agent: "Spinners are noted as creating anxiety in critical zones.
Alternatives:
1. Skeleton loading with deliberate reveal
2. Progress indicator with copy
3. Confirmation animation

If you still need a spinner, I can add it—just note this deviates
from established patterns."
```

---

## Skills

| Skill | Purpose |
|-------|---------|
| `initializing-sigil` | Setup framework |
| `envisioning-moodboard` | Capture product soul |
| `envisioning-soul` | Define philosophy and values |
| `codifying-rules` | Define design rules |
| `codifying-materials` | Define material properties |
| `codifying-recipes` | Define motion recipes |
| `crafting-guidance` | Provide design guidance |
| `crafting-components` | Generate components |
| `approving-patterns` | Human sign-off |
| `inheriting-design` | Bootstrap from codebase |
| `validating-fidelity` | Check compliance |
| `gardening-entropy` | Detect drift |
| `mapping-zones` | Configure zones |
| `consulting-decisions` | Log decisions |
| `unlocking-decisions` | Override locks |
| `canonizing-flaws` | Protect behaviors |
| `greenlighting-concepts` | Approve concepts |
| `updating-framework` | Pull updates |

---

## Runtime Package (Optional)

For React projects, Sigil provides runtime components:

```bash
npm install sigil-mark
```

```tsx
import { CriticalZone, useLens, useCriticalAction } from 'sigil-mark';

function PaymentForm({ amount }) {
  const payment = useCriticalAction({
    mutation: () => api.pay(amount),
    timeAuthority: 'server-tick',
  });
  const Lens = useLens();

  return (
    <CriticalZone financial>
      <Lens.CriticalButton state={payment.state}>
        Pay ${amount}
      </Lens.CriticalButton>
    </CriticalZone>
  );
}
```

See **[packages/sigil-mark/README.md](packages/sigil-mark/README.md)** for full runtime documentation.

---

## Configuration

`.sigilrc.yaml` is user-owned—updates never touch it:

```yaml
version: "1.0"

strictness: guiding  # discovery | guiding | enforcing | strict

component_paths:
  - "src/components/"

zones:
  critical:
    paths: ["src/features/checkout/**"]
    motion: deliberate
    material: clay
  marketing:
    paths: ["src/features/marketing/**"]
    motion: playful
    material: glass

rejections:
  - pattern: "Spinner"
    reason: "Creates anxiety in critical zones"

taste_key:
  holder:
    name: "Design Lead"
    github: "@designlead"
```

---

## Coexistence with Loa

Sigil and Loa operate independently:

| Aspect | Sigil | Loa |
|--------|-------|-----|
| State Zone | `sigil-mark/` | `loa-grimoire/` |
| Config | `.sigilrc.yaml` | `.loa.config.yaml` |
| Focus | Design context | Product lifecycle |
| Handoff | Design issues | Architecture decisions |

Use both when you want design context in your development workflow.

---

## Why "Sigil"?

A sigil is a symbolic representation of intent—a mark that carries meaning beyond its form. Sigil captures your product's design intent and makes it available to AI agents, ensuring every generated component carries the same soul.

---

## Documentation

- **[CLAUDE.md](CLAUDE.md)** — Agent protocol and quick reference
- **[packages/sigil-mark/README.md](packages/sigil-mark/README.md)** — Runtime package docs
- **[CHANGELOG.md](CHANGELOG.md)** — Version history

## License

[MIT](LICENSE)

## Links

- [Claude Code](https://claude.ai/code)
- [Loa Framework](https://github.com/0xHoneyJar/loa)
- [Repository](https://github.com/0xHoneyJar/sigil)
- [Issues](https://github.com/0xHoneyJar/sigil/issues)
