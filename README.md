# Sigil

Constitutional Design Framework for AI-assisted development.

> "Culture is the Reality. Code is Just the Medium."

## What is Sigil?

Sigil v0.3 is a constitutional framework that protects both intended soul (Immutable Values) and emergent soul (Canon of Flaws). It captures and preserves design decisions so AI agents can make consistent UI choices.

**Four Pillars:**
1. **Soul Binder** - Protects values and emergent behaviors (Canon of Flaws)
2. **Lens Array** - Supports multiple user truths with persona-based validation
3. **Consultation Chamber** - Layered decision authority (poll/consult/dictate)
4. **Proving Grounds** - Scale validation before production graduation

**Core Features:**
- **Moodboard** - Capture product feel, references, and anti-patterns
- **Design Rules** - Define colors, typography, spacing, motion by zone
- **Zone System** - Path-based context for different areas of your app
- **Progressive Strictness** - Discovery → Guiding → Enforcing → Strict
- **Human Approval** - All validation is human review, not automation

## Installation

One-liner mount onto any repository:

```bash
curl -fsSL https://raw.githubusercontent.com/zksoju/sigil/main/.claude/scripts/mount-sigil.sh | bash
```

Or clone and mount manually:

```bash
git clone https://github.com/zksoju/sigil.git ~/.sigil/sigil
~/.sigil/sigil/.claude/scripts/mount-sigil.sh
```

## Quick Start

```bash
# 1. Mount Sigil onto your repo
curl -fsSL https://raw.githubusercontent.com/zksoju/sigil/main/.claude/scripts/mount-sigil.sh | bash

# 2. Start Claude Code
claude

# 3. Initialize Sigil
/setup

# 4. Choose your path:
/envision    # New project - interview to capture feel
/inherit     # Existing codebase - scan and infer
```

## Commands

### Core Commands
| Command | Purpose | Output |
|---------|---------|--------|
| `/setup` | Initialize Sigil v0.3 | sigil-mark/, .sigilrc.yaml |
| `/envision` | Capture product moodboard + values + lenses | moodboard.md, immutable-values.yaml, lenses.yaml |
| `/codify` | Define design rules | rules.md |
| `/craft` | Get design guidance | Conversational |
| `/approve` | Human review and sign-off | Approval record |
| `/inherit` | Bootstrap from existing code | Draft moodboard, rules, inventory |
| `/update` | Pull framework updates | Updated symlinks |

### v0.3 Commands (Constitutional Features)
| Command | Purpose | Output |
|---------|---------|--------|
| `/canonize` | Protect emergent behaviors | canon-of-flaws.yaml |
| `/consult` | Start decision consultation | decisions/{id}.yaml |
| `/unlock` | Unlock a locked decision early | Updated decision record |
| `/prove` | Register feature for proving | proving-grounds/active/{feature}.yaml |
| `/graduate` | Graduate feature to canon | canon/graduated/{feature}.yaml |

## When to Use What

### Starting Out
| Situation | Command | Why |
|-----------|---------|-----|
| Brand new project | `/setup` → `/envision` → `/codify` | Capture intent before code |
| Existing codebase | `/setup` → `/inherit` → `/envision` | Scan first, then refine |
| Pulling updates | `/update` | Get latest framework |

### During Development
| Situation | Command | Why |
|-----------|---------|-----|
| Need design guidance | `/craft` | Get zone-aware suggestions |
| Working in specific lens | `/craft --lens power_user` | Force validation in that lens |
| New pattern to approve | `/approve` | Human sign-off on deviations |

### Protecting Culture
| Situation | Command | Why |
|-----------|---------|-----|
| Users love a "bug" | `/canonize` | Protect it from optimization |
| Major design decision | `/consult` | Start appropriate consultation |
| Decision locked too long | `/unlock` | Early unlock with justification |

### Validating at Scale
| Situation | Command | Why |
|-----------|---------|-----|
| New feature ready for prod | `/prove` | Register for proving period |
| Proving period complete | `/graduate` | Graduate to Living Canon |

## Workflow

### New Project
```
/setup → /envision → /codify → (build) → /craft → /approve
```

### Existing Project
```
/setup → /inherit → /envision → /codify → (build) → /craft → /approve
```

## Directory Structure

After setup (v0.3 four-pillar architecture):

```
your-repo/
├── .claude/
│   ├── commands/      # Symlinked commands
│   └── skills/        # Symlinked skills
├── sigil-mark/        # Your design context
│   ├── moodboard.md           # Product feel, references
│   ├── rules.md               # Design rules by category
│   ├── inventory.md           # Component list
│   ├── soul-binder/           # Pillar 1: Values + Flaws
│   │   ├── immutable-values.yaml
│   │   ├── canon-of-flaws.yaml
│   │   └── visual-soul.yaml
│   ├── lens-array/            # Pillar 2: User personas
│   │   └── lenses.yaml
│   ├── consultation-chamber/  # Pillar 3: Decisions
│   │   ├── config.yaml
│   │   └── decisions/
│   ├── proving-grounds/       # Pillar 4: Feature proving
│   │   ├── config.yaml
│   │   └── active/
│   ├── canon/                 # Graduated features
│   │   └── graduated/
│   └── audit/                 # Override logging
│       └── overrides.yaml
├── .sigilrc.yaml      # Zone configuration + strictness
├── .sigil-version.json
└── .sigil-setup-complete
```

## Zone System

Zones define design context by file path:

```yaml
# .sigilrc.yaml
zones:
  critical:
    paths: ["src/features/checkout/**"]
    motion: "deliberate"
    patterns:
      prefer: ["deliberate-entrance"]
      warn: ["playful-bounce"]

  marketing:
    paths: ["src/features/marketing/**"]
    motion: "playful"
```

## Strictness Levels

Sigil v0.3 introduces progressive strictness:

| Level | Behavior |
|-------|----------|
| `discovery` | All suggestions, no blocks (default) |
| `guiding` | Warnings on violations |
| `enforcing` | Blocks on protected flaws/values |
| `strict` | Blocks on all violations |

Configure in `.sigilrc.yaml`:
```yaml
strictness: "discovery"
```

## Philosophy

Sigil doesn't enforce taste via CI blocking. It enables culture through:

- **Recipes** — Make good patterns easy to use
- **Warnings** — Make bad patterns visible (not blocked)
- **Human Review** — Taste owners approve, not bots

Systems that block will be bypassed. Systems that enable will be adopted.

## Coexistence with Loa

Sigil and [Loa](https://github.com/0xHoneyJar/loa) can coexist on the same repo:

| Aspect | Loa | Sigil |
|--------|-----|-------|
| State Zone | loa-grimoire/ | sigil-mark/ |
| Config | .loa.config.yaml | .sigilrc.yaml |
| Focus | Product development | Design context |

## Requirements

- Git
- Claude Code CLI
- jq (optional, for better JSON handling)
- yq (optional, for YAML parsing)

## Version

0.3.0 (Constitutional Design Framework)

See [CHANGELOG.md](CHANGELOG.md) for release history.

## License

MIT
