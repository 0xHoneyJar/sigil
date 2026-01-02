# Sigil

Design context framework for AI-assisted development.

> "Make the right path easy. Make the wrong path visible. Don't make the wrong path impossible."

## What is Sigil?

Sigil captures and preserves design decisions so AI agents can make consistent UI choices. It solves the problem of design drift when building with Claude Code.

**Core Features:**
- **Moodboard** - Capture product feel, references, and anti-patterns
- **Design Rules** - Define colors, typography, spacing, motion by zone
- **Zone System** - Path-based context for different areas of your app
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

| Command | Purpose | Output |
|---------|---------|--------|
| `/setup` | Initialize Sigil | sigil-mark/, .sigilrc.yaml |
| `/envision` | Capture product moodboard | moodboard.md |
| `/codify` | Define design rules | rules.md |
| `/craft` | Get design guidance | Conversational |
| `/approve` | Human review and sign-off | Approval record |
| `/inherit` | Bootstrap from existing code | Draft moodboard, rules, inventory |
| `/update` | Pull framework updates | Updated symlinks |

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

After setup:

```
your-repo/
├── .claude/
│   ├── commands/      # Symlinked commands
│   └── skills/        # Symlinked skills
├── sigil-mark/        # Your design context
│   ├── moodboard.md   # Product feel, references
│   ├── rules.md       # Design rules by category
│   └── inventory.md   # Component list
├── .sigilrc.yaml      # Zone configuration
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

2.0.0

## License

MIT
