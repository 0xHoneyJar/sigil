# Sigil

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> *"Physics, not opinions. Constraints, not debates."*

Design Physics Engine for AI-assisted development. Gives AI agents physics constraints for consistent design decisions—materials, zones, fidelity ceilings, and human authority.

## Philosophy

### The Problem

AI agents generate UI without understanding your product's soul. Every generation is a coin flip—sometimes it matches your vision, sometimes it doesn't. Design systems help, but they're too abstract for AI to reason about. You end up spending more time correcting than creating.

Meanwhile, design debates consume hours. "Should this button be blue or green?" "Is this animation too slow?" These aren't physics problems—they're taste problems. But without a framework, every decision becomes a debate.

### The Insight: Physics vs Opinions

Sigil treats design decisions like physics, not opinions:

- **Physics can't be argued with.** Gravity doesn't care about your feelings. Server-authoritative data MUST show pending states—this isn't a preference, it's a constraint.
- **Opinions invite debate.** "I think this should be faster" leads to bikeshedding. "This violates discrete tick physics" ends the conversation.

When you frame constraints as physics, AI agents follow them without question. Humans stop debating and start building.

### Core Principles

**1. Feel Before Form**

Design is about how things *feel*, not how they *look*. A checkout button and a browse button might be visually identical—same color, same size, same font. But they *behave* differently because they're in different physics zones. Checkout is heavy and deliberate. Browse is light and instant. Define the feel first; the form follows.

**2. Context Over Components**

The same component behaves differently based on where it lives. Zone is determined by *file path*, not component type. This means physics are automatic—no manual annotation needed. Put a file in `/checkout/` and it inherits critical zone physics. Move it to `/explore/` and it becomes exploratory.

**3. Constraints Enable Creativity**

Unlimited options produce paralysis. "You can do anything" means "you must decide everything." Physics constraints free you to focus on what matters. When the agent knows checkout buttons MUST have pending states, it stops asking and starts building.

**4. Diagnose Before Prescribe**

When something feels wrong, don't jump to solutions. "Make it faster" might break the system. "Why does it feel slow?" reveals the root cause. Often, the "problem" is actually physics working correctly—checkout *should* feel deliberate.

**5. Entropy Is Inevitable**

Products drift. What felt right at launch feels stale at scale. Design systems decay. Decisions become outdated. Sigil treats this as physics: entropy is real, and gardens need tending. Plan for evolution, not perfection.

### The Hierarchy

Not all constraints are equal:

1. **IMPOSSIBLE** — Physics violations. Cannot be generated. Ever. No override exists. (e.g., optimistic updates in server-authoritative zones)
2. **BLOCK** — Budget/fidelity violations. Blocked by default, but the Taste Key holder can create a ruling to override. (e.g., exceeding element count)
3. **WARN** — Drift from essence. Suggestions only. Human decides. (e.g., using a color outside the palette)

This hierarchy eliminates debate: physics is physics, taste is taste.

## Best Practices

### The Setup Flow

Run these commands in order when starting a new project:

```
/sigil-setup    → Creates state zone structure
/envision       → Captures product soul (interview)
/codify         → Defines material physics
/map            → Configures zone paths
```

**Time investment:** ~30 minutes
**Payoff:** Every future generation inherits your design physics automatically.

### 1. Start with Soul, Not Rules

Run `/envision` before anything else. The soul interview captures *why* your product feels the way it does—reference products, anti-patterns, key moments. Rules without soul produce soulless output.

**Bad**: "Use blue buttons with 8px radius"
**Good**: "We want the confidence of Linear with the warmth of Notion. Checkout should feel like confirming a bank transfer—heavy and deliberate."

The `/envision` command asks about:
- **Reference products**: "What apps/games inspire the feel?" (Linear, Notion, Stripe, Nintendo)
- **Anti-patterns**: "What should we never do?" (No spinners in critical flows, no bounce animations)
- **Key moments**: "What are the high-stakes interactions?" (Claim, purchase, delete)

### 2. Define Zones Early

Zones are your biggest lever. Most products have 3-5:

```yaml
# sigil-mark/resonance/zones.yaml
definitions:
  critical:
    paths:
      - "**/checkout/**"
      - "**/claim/**"
      - "**/payment/**"
    physics:
      sync: server_authoritative
      tick: discrete
      tick_rate_ms: 600
      material: clay
      budget:
        interactive_elements: 5
        decisions: 2

  exploratory:
    paths:
      - "**/browse/**"
      - "**/discover/**"
      - "**/gallery/**"
    physics:
      sync: client_authoritative
      tick: continuous
      material: glass
      budget:
        interactive_elements: 20
        decisions: 10
```

**Zone resolution works by file path:**
1. Agent gets file path: `src/features/checkout/ConfirmButton.tsx`
2. Matches against zones in priority order
3. `**/checkout/**` matches → critical zone
4. Physics applied automatically

**To refine zones:**
```
/map              # Review current zones, add paths
/map --add        # Create custom zone (e.g., "gaming", "social")
/map --paths      # Focus on path mapping only
```

Once zones are set, every file inherits the right physics. No per-component decisions needed.

### 3. Use /craft Diagnostically

When something "feels wrong," don't ask for a fix—ask for diagnosis:

**Bad**: `/craft "make the button faster"`
**Good**: `/craft "the claim button feels slow, diagnose why"`

The Hammer tool identifies root causes:

```
/craft "checkout feels slow"

DIAGNOSIS: Physics conflict detected.

The claim button is in critical zone (server_authoritative).
Physics requires:
  - Pending state while waiting for server
  - Discrete tick (600ms minimum rhythm)
  - No optimistic updates

This is NOT a design problem. The delay IS the trust.

Options:
1. Accept the physics (recommended for money)
2. Handoff to Loa for architectural review (see Best Practice #6)
3. Add loading feedback within physics constraints
```

Often, "feels slow" is physics working correctly. Fixing the symptom breaks the trust model.

### 4. One Taste Key Holder

Design by committee produces mediocrity. Designate ONE person as the Taste Key holder:

```yaml
# sigil-mark/taste-key/holder.yaml
holder:
  name: "Design Lead"
  email: "lead@example.com"
  github: "@designlead"

authority:
  can_override:
    - budgets
    - fidelity
    - colors
    - typography
  cannot_override:
    - physics
    - security
    - accessibility
```

The Taste Key holder can:
- Override budget violations with rulings (`/approve`)
- Make final calls on aesthetic decisions
- But they CANNOT override physics

This isn't dictatorship—it's clarity. Everyone knows who decides taste.

### 5. Garden Regularly

Entropy is real. Run `/garden` monthly:

```
/garden              # Full entropy check
/garden drift        # Just drift detection
/garden mutations    # Review active changes
/garden era          # Check for era transition signals
```

What it catches:
- **Drift**: Components straying from essence
- **Stale mutations**: Decisions older than 30 days without resolution
- **Obsolete rulings**: Overrides no longer needed
- **Era signals**: Patterns suggesting a major evolution

Products evolve. Your design physics should evolve with them—deliberately, not accidentally.

### 6. Let Loa Handle Architecture

Sigil handles design physics. When you hit structural issues, hand off to Loa:

| Problem | Owner |
|---------|-------|
| "Button feels wrong" | Sigil (`/craft`) |
| "Should checkout be optimistic?" | Loa (architectural decision) |
| "Animation is too slow" | Sigil (`/craft`) |
| "Do we need real-time updates?" | Loa (architectural decision) |

**The handoff workflow:**

When Sigil detects a structural issue, it generates a handoff document:

```
/craft "checkout feels slow"

DIAGNOSIS: Physics conflict detected.
This is NOT a design problem—it's architecture.

The claim button is in critical zone (server_authoritative).
Changing this requires an architectural decision.

HANDOFF TO LOA:
1. Create: loa-grimoire/context/sigil-handoff.md
2. Run: /plan-and-analyze
3. Loa will evaluate sync strategy options
```

The handoff document (`sigil-handoff.md`) contains:
- Current physics constraints
- The conflict detected
- Options to evaluate
- Impact of each option

Loa ingests this via `/plan-and-analyze` and produces architectural recommendations.

## Quick Start

### Mount onto Existing Repository (Recommended)

```bash
# One-liner install
curl -fsSL https://raw.githubusercontent.com/0xHoneyJar/sigil/main/.claude/scripts/mount-sigil.sh | bash

# Start Claude Code
claude

# Initialize and capture soul
/sigil-setup
/envision
```

### Clone and Mount

```bash
git clone https://github.com/0xHoneyJar/sigil.git ~/.sigil/sigil
~/.sigil/sigil/.claude/scripts/mount-sigil.sh
```

## Architecture: State Zone Model

Sigil uses a **state zone** architecture for design context:

| Zone | Path | Purpose |
|------|------|---------|
| **Core** | `sigil-mark/core/` | Physics (immutable after lock) |
| **Resonance** | `sigil-mark/resonance/` | Product tuning (materials, zones, tensions) |
| **Memory** | `sigil-mark/memory/` | History (eras, decisions, mutations) |
| **Taste Key** | `sigil-mark/taste-key/` | Human authority (holder, rulings) |

**Key principle**: Physics violations are IMPOSSIBLE. Budget/fidelity violations are BLOCK (Taste Key can override). Drift is WARN (suggestions only).

## The Workflow

| Phase | Command | Agent | Output |
|-------|---------|-------|--------|
| 0 | `/sigil-setup` | initializing-sigil | State zone structure |
| 1 | `/envision` | envisioning-soul | `resonance/essence.yaml` |
| 2 | `/codify` | codifying-materials | `resonance/materials.yaml` |
| 3 | `/map` | mapping-zones | `resonance/zones.yaml` |
| 4 | `/craft` | crafting-components | Design guidance (Hammer/Chisel) |
| 5 | `/validate` | validating-fidelity | Violation report |
| 6 | `/approve` | approving-patterns | Taste Key rulings |
| 7 | `/greenlight` | greenlighting-concepts | Concept approval |
| 8 | `/garden` | gardening-entropy | Entropy management |

## The Three Laws

1. **Physics violations are IMPOSSIBLE** — No override for server authority, tick modes
2. **Budget/fidelity violations are BLOCK** — Taste Key can create rulings to override
3. **Drift warnings are WARN** — Suggestions only, human decides

## Materials

Materials define physics, not just styles:

| Material | Light | Weight | Motion | Feedback | Zone Affinity |
|----------|-------|--------|--------|----------|---------------|
| **Clay** | Diffuse | Heavy | Spring (120/14) | Depress | Critical, Transactional |
| **Machinery** | Flat | None | Instant | Highlight | Admin |
| **Glass** | Refract | Weightless | Ease (200ms) | Glow | Exploratory, Marketing |

## Zones

Zones determine physics by file path:

| Zone | Material | Sync | Elements | Decisions |
|------|----------|------|----------|-----------|
| Critical | clay | server_authoritative | 5 max | 2 max |
| Transactional | clay | client_authoritative | 12 max | 5 max |
| Exploratory | glass | client_authoritative | 20 max | 10 max |
| Marketing | glass | client_authoritative | 15 max | 8 max |

## Hammer/Chisel Toolkit

The `/craft` command uses a diagnostic-first approach:

**Hammer** (Diagnosis): Load zone physics → Analyze complaint → Identify root cause → Suggest fix

**Chisel** (Execution): Generate with context → Check constraints → Route structural issues to Loa

```
/craft "checkout feels slow"

DIAGNOSIS: Physics conflict detected.
The claim button is in critical zone (server_authoritative).
Physics requires pending state and discrete tick (600ms).

This is NOT a design problem. This is architecture.

Handoff to Loa:
→ Create loa-grimoire/context/sigil-handoff.md with conflict details
→ Run /plan-and-analyze to evaluate sync strategy options
```

## Repository Structure

```
.claude/                        # System Zone (framework-managed)
├── skills/                     # 9 agent skills
├── commands/                   # 9 slash commands
└── scripts/                    # Helper scripts
    └── mount-sigil.sh          # One-command install

sigil-mark/                     # State Zone (design context)
├── core/                       # Physics (immutable)
│   ├── sync.yaml               # Temporal Governor
│   ├── budgets.yaml            # Cognitive/visual limits
│   ├── fidelity.yaml           # Fidelity Ceiling
│   └── lens.yaml               # Rendering layers
├── resonance/                  # Tuning (product-specific)
│   ├── materials.yaml          # Material definitions
│   ├── zones.yaml              # Zone mappings
│   ├── tensions.yaml           # 4-axis tuning
│   └── essence.yaml            # Soul statement
├── memory/                     # History
│   ├── eras/                   # Era snapshots
│   ├── decisions/              # Greenlight records
│   ├── mutations/active/       # Active changes
│   └── graveyard/              # Archived items
└── taste-key/                  # Authority
    ├── holder.yaml             # Current Taste Key holder
    └── rulings/                # Override records

.sigilrc.yaml                   # Configuration
.sigil-version.json             # Version manifest
.sigil-setup-complete           # Setup marker
```

## Configuration

`.sigilrc.yaml` is user-owned:

```yaml
version: "0.5"

component_paths:
  - "components/"
  - "src/components/"

zones:
  critical:
    paths: ["src/features/checkout/**", "src/features/claim/**"]
    material: clay
    sync: server_authoritative

taste_key:
  holder:
    name: "Design Lead"
    email: "lead@example.com"

physics:
  enforcement: "physics"  # IMPOSSIBLE/BLOCK/WARN
```

## Taste Key Authority

### CAN Override
- Budgets (element count, animation count)
- Fidelity (gradient stops, shadow layers)
- Taste (colors, typography, spacing)

### CANNOT Override
- Physics (sync authority, tick modes)
- Security (auth, validation)
- Accessibility (contrast, keyboard nav)

## Coexistence with Loa

Sigil and Loa coexist with different responsibilities:

| Aspect | Sigil | Loa |
|--------|-------|-----|
| Domain | Design physics | Product architecture |
| State zone | `sigil-mark/` | `loa-grimoire/` |
| Handoff | Physics issues → Loa | Structural decisions |

## Workbench

The Sigil Workbench provides a 4-panel development environment:

```bash
# Launch the workbench
sigil-workbench.sh
```

### Panel Layout

```
┌─────────────────┬─────────────────┐
│                 │                 │
│   Claude CLI    │   Preview       │
│   (Pane 0)      │   (Pane 1)      │
│                 │                 │
├─────────────────┼─────────────────┤
│                 │                 │
│   Tensions      │   Validation    │
│   (Pane 2)      │   (Pane 3)      │
│                 │                 │
└─────────────────┴─────────────────┘
```

### Individual Scripts

If you don't want the full workbench:

```bash
sigil-tensions.sh      # Real-time tension monitor
sigil-validate.sh      # File validation monitor
sigil-detect-zone.sh   # Zone detection utility
```

### Keybindings (tmux)

| Key | Action |
|-----|--------|
| `Ctrl+b ↑/↓/←/→` | Navigate between panes |
| `Ctrl+b z` | Toggle pane zoom |
| `Ctrl+b d` | Detach from session |

## Documentation

- **[CLAUDE.md](CLAUDE.md)** - Agent instructions
- **[CHANGELOG.md](CHANGELOG.md)** - Version history

## Why "Sigil"?

A sigil is a symbolic representation of intent—a mark that carries meaning beyond its form. Sigil captures your product's design intent and makes it available to AI agents, ensuring every generated component carries the same soul.

## Requirements

- Git
- Claude Code CLI
- jq (optional, for better JSON handling)

## Version History

| Version | Codename | Description |
|---------|----------|-------------|
| v0.3.x | Constitutional Design Framework | Four pillars, progressive strictness |
| v0.4.x | Soul Engine | npm package, React hooks, workbench |
| v0.5.0 | Design Physics Engine | Simplified architecture, physics focus |
| v1.0.0 | Full Workbench | 4-panel tmux environment, complete toolkit |

## License

[MIT](LICENSE)

## Links

- [Claude Code](https://claude.ai/code)
- [Repository](https://github.com/0xHoneyJar/sigil)
- [Issues](https://github.com/0xHoneyJar/sigil/issues)
