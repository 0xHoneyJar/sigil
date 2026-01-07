# Sigil

[![Version](https://img.shields.io/badge/version-3.1.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> *"Make the right path easy. Make the wrong path visible."*

Design Context Framework for AI-assisted development. Captures product soul, defines zone physics, and guides agents toward consistent design decisions—without blocking human creativity.

## Quick Start

### Mount onto Repository

```bash
# One-liner install
curl -fsSL https://raw.githubusercontent.com/0xHoneyJar/sigil/main/.claude/scripts/mount-sigil.sh | bash

# Start Claude Code
claude

# Initialize and capture soul
/sigil-setup
/envision
```

### With Loa (Recommended)

Sigil integrates seamlessly with [Loa](https://github.com/0xHoneyJar/loa) for full product lifecycle:

```bash
# Install Loa first
curl -fsSL https://raw.githubusercontent.com/0xHoneyJar/loa/main/.claude/scripts/mount-loa.sh | bash

# Then mount Sigil
curl -fsSL https://raw.githubusercontent.com/0xHoneyJar/sigil/main/.claude/scripts/mount-sigil.sh | bash

# Setup both
/setup        # Loa workflow
/sigil-setup  # Design context
```

## Architecture: State Zone Model

| Zone | Path | Purpose |
|------|------|---------|
| **System** | `.claude/skills/`, `.claude/commands/` | Sigil skills (symlinked from ~/.sigil) |
| **State** | `sigil-mark/` | Your design context (committed to repo) |
| **Config** | `.sigilrc.yaml` | Zone definitions, rejections |

**Key principle**: Design context lives in `sigil-mark/`. Skills are managed via `mount-sigil.sh`.

## The Workflow

| Phase | Command | Purpose | Output |
|-------|---------|---------|--------|
| 0 | `/sigil-setup` | Initialize framework | `.sigil-setup-complete` |
| 1 | `/envision` | Capture product soul (interview) | `sigil-mark/moodboard.md` |
| 2 | `/codify` | Define design rules | `sigil-mark/rules.md` |
| 3 | `/craft` | Get guidance during implementation | Zone-aware suggestions |
| 4 | `/approve` | Human sign-off on patterns | Approval record |

### Discovery Commands

| Command | Purpose |
|---------|---------|
| `/inherit` | Bootstrap from existing codebase |
| `/validate` | Check physics compliance |
| `/garden` | Entropy detection, maintenance |

### Governance Commands

| Command | Purpose |
|---------|---------|
| `/consult` | Log decisions requiring authority |
| `/unlock` | Override locked decisions |
| `/canonize` | Protect emergent flaws |

## State Zone Structure

```
sigil-mark/
├── moodboard.md              # Product feel, references, anti-patterns
├── moodboard/                # Rich inspiration collection
│   ├── references/           # Products to emulate
│   ├── anti-patterns/        # What to avoid
│   ├── articles/             # Design thinking
│   └── index.yaml            # Featured & tags
├── rules.md                  # Design rules by category
├── inventory.md              # Component list
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

## Core Concepts

### Zones

Zones define behavioral context. Files matched to zones get appropriate physics:

```yaml
# .sigilrc.yaml
zones:
  critical:
    paths: ["src/features/checkout/**"]
    motion: "deliberate"
    patterns:
      prefer: ["confirmation-flow", "deliberate-entrance"]
      warn: ["instant-transition", "playful-bounce"]

  marketing:
    paths: ["src/features/landing/**"]
    motion: "playful"
```

### Lenses (Personas)

Same interface, different experiences:

| Lens | Touch Target | Animations | Use Case |
|------|-------------|------------|----------|
| `default` | 44px | Yes | Standard users |
| `strict` | 48px | No | Financial zones |
| `a11y` | 56px | Reduced | Accessibility |
| `power_user` | 36px | Minimal | Keyboard-first |

### Rejections

Patterns to warn about (not block):

```yaml
# .sigilrc.yaml
rejections:
  - pattern: "Spinner"
    reason: "Creates anxiety in critical zones"
    exceptions: ["admin/**"]
```

**Philosophy**: Warn, don't block. Human decides.

## Agent Protocol

When generating UI code, Sigil-aware agents:

1. **Load context** — Read `sigil-mark/moodboard.md` + `rules.md`
2. **Determine zone** — Match file path to `.sigilrc.yaml` zones
3. **Query moodboard** — Find zone-relevant references
4. **Apply physics** — Use zone-appropriate patterns
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

## Philosophy

### Sigil Enables Craft—It Doesn't Police It

| Principle | Meaning |
|-----------|---------|
| **Right path easy** | Clear rules, zone context, pattern suggestions |
| **Wrong path visible** | Warnings on rejected patterns, not blocks |
| **Escape hatches exist** | Human can always override |
| **Humans accountable** | Approval is human, not automated |

### The Hierarchy

1. **IMPOSSIBLE** — Physics violations (cannot be generated)
2. **BLOCK** — Forced lens (StrictLens in financial zones)
3. **WARN** — Suggestions only (user preference respected)

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

## Runtime Package (Optional)

For React projects, Sigil provides runtime components:

```bash
npm install sigil-mark
```

```tsx
import { CriticalZone, useLens } from 'sigil-mark';

function PaymentForm() {
  const Lens = useLens();

  return (
    <CriticalZone financial>
      <Lens.CriticalButton state={payment.state}>
        Confirm Payment
      </Lens.CriticalButton>
    </CriticalZone>
  );
}
```

See **[packages/sigil-mark/README.md](packages/sigil-mark/README.md)** for runtime documentation.

## Coexistence with Loa

Sigil and Loa operate independently:

| Aspect | Sigil | Loa |
|--------|-------|-----|
| State Zone | `sigil-mark/` | `loa-grimoire/` |
| Config | `.sigilrc.yaml` | `.loa.config.yaml` |
| Focus | Design context | Product lifecycle |
| Skills | Design-focused | Workflow-focused |

No automatic cross-loading. Use both when you want design context in your development workflow.

## Configuration

`.sigilrc.yaml` is user-owned—updates never touch it:

```yaml
version: "1.0"

strictness: guiding  # discovery | guiding | enforcing | strict

component_paths:
  - "src/components/"
  - "components/"

zones:
  critical:
    paths: ["src/features/checkout/**"]
    motion: "deliberate"
  marketing:
    paths: ["src/features/marketing/**"]
    motion: "playful"

rejections:
  - pattern: "Spinner"
    reason: "Creates anxiety in critical zones"
```

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
