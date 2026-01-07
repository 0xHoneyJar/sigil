# Sigil

[![Version](https://img.shields.io/badge/version-4.0.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> *"Sweat the art. We handle the mechanics. Return to flow."*

Design Context Framework for AI-assisted development. Captures product soul, defines zone physics, and guides agents toward consistent design decisions—without blocking human creativity.

## v4.0 "Sharp Tools"

37 commands → **7 discrete tools** with progressive disclosure.

```
CAPTURE              CREATE               OBSERVE
───────              ──────               ───────
/envision            /craft               /observe
/codify

REFINE               DECIDE               TEND
──────               ──────               ────
/refine              /consult             /garden
```

---

## Quick Start

```bash
# No setup required - just start
claude

# Capture your product's soul
/envision

# Define design rules
/codify

# Get guidance during implementation
/craft "claim button for critical zone"
```

**Time investment:** ~15 minutes to capture soul
**Payoff:** Every future generation inherits your design physics automatically

---

## The 7 Tools

| Tool | Purpose | L1 (Default) | L2 (Targeted) | L3 (Full Control) |
|------|---------|--------------|---------------|-------------------|
| `/envision` | Capture product moodboard | Full interview | `--quick` | `--from <file>` |
| `/codify` | Define design rules | Guided interview | `--zone <name>` | `--from <design-system.json>` |
| `/craft` | Get design guidance | Auto-context | `--zone`, `--persona` | `--no-gaps` |
| `/observe` | Visual feedback loop | Capture screen | `--component` | `--screenshot`, `--rules` |
| `/refine` | Incremental updates | Review feedback | `--persona`, `--zone` | `--evidence` |
| `/consult` | Record decisions | 30d lock | `--scope`, `--lock` | `--protect`, `--evidence` |
| `/garden` | Health monitoring | Summary | `--personas`, `--feedback` | `--validate` (CI) |

### Progressive Disclosure

All tools support three grip levels:

- **L1**: Sensible defaults, minimal input required
- **L2**: Targeted options for specific needs
- **L3**: Full control for power users

---

## Key Features

### Evidence-Based Context

Personas and zones can cite real evidence:

```yaml
# sigil-mark/personas/personas.yaml
personas:
  - name: depositor
    trust_level: high
    source: analytics
    evidence:
      - id: EV-2026-001
        summary: "Mixpanel shows 80% completion rate"
    journey_stages: [discovery, onboarding, active]
```

### Visual Feedback Loop

```
/craft "button" → generates code
        ↓
/observe → captures screenshot, compares to rules
        ↓
User answers: "Yes — update rules" or "No — fix component"
        ↓
/refine → applies feedback to context
```

### Journey-Based Zones

```yaml
# .sigilrc.yaml
zones:
  critical:
    paths: ["src/features/claim/**"]
    journey_stage: active
    persona_likely: depositor
    trust_state: critical
    motion: deliberate
```

### Consolidated Decision Recording

```bash
/consult "button border radius is 8px"                    # 30d lock
/consult "use deliberate motion" --scope critical         # Zone-scoped
/consult "withdraw must always work" --protect            # 365d protected
/consult DEC-2026-001 --unlock "new research"             # Unlock with reason
```

### Health Monitoring

```bash
/garden              # Summary health report
/garden --personas   # Check persona evidence
/garden --feedback   # Check unapplied feedback
/garden --validate   # Schema validation for CI (exit code 0/1)
```

### Build-Time Export

```bash
sigil export-config              # Export for runtime
sigil export-config --minify     # Production build
sigil export-config --watch      # Development mode
```

---

## Philosophy

### The Problem

AI agents generate UI without understanding your product's soul. Every generation is a coin flip. Design debates consume hours on taste questions.

### The Insight: Physics vs Opinions

| Physics | Opinions |
|---------|----------|
| Can't be argued with | Invite debate |
| "Server data MUST show pending states" | "I think this should be faster" |
| Ends the conversation | Starts bikeshedding |

### Core Principles

1. **Feel Before Form** — Design is about how things *feel*, not how they *look*
2. **Context Over Components** — Same component behaves differently based on zone
3. **Constraints Enable Creativity** — Physics constraints free you to focus on what matters
4. **Diagnose Before Prescribe** — Understand "why" before jumping to solutions
5. **Entropy Is Inevitable** — Products drift, gardens need tending

---

## Architecture

### State Zone Structure

```
sigil-mark/
├── moodboard.md              # Product feel
├── rules.md                  # Design rules
├── personas/                 # User archetypes with evidence
│   └── personas.yaml
├── evidence/                 # Analytics, interviews
│   └── *.yaml
├── .sigil-observations/      # Screenshots and feedback
│   ├── screenshots/
│   └── feedback/
├── consultation-chamber/     # Locked decisions
│   └── decisions/
└── vocabulary/               # Term definitions
    └── vocabulary.yaml
```

### Config File

```yaml
# .sigilrc.yaml
zones:
  critical:
    paths: ["src/features/checkout/**"]
    journey_stage: active
    persona_likely: depositor
    trust_state: critical
    motion: deliberate

  marketing:
    paths: ["src/features/marketing/**"]
    journey_stage: discovery
    motion: playful
```

---

## Agent Protocol

When generating UI code, agents:

1. **Load context** — Read moodboard, rules, personas, vocabulary
2. **Determine zone** — Match file path to `.sigilrc.yaml`
3. **Resolve persona** — From zone's `persona_likely`
4. **Check decisions** — Load active locks from consultation-chamber
5. **Generate code** — Apply zone physics
6. **Surface gaps** — Show `/refine` commands for missing context

### Gap Detection

At the END of `/craft` output:

```
═══════════════════════════════════════════════════════════
                     CONTEXT GAPS
═══════════════════════════════════════════════════════════

⚠️ 2 gaps detected:

1. UNDEFINED PERSONA: "whale"
   → /refine --persona whale "high-value depositor"

2. MISSING EVIDENCE: depositor persona
   → /refine --persona depositor --evidence analytics.yaml
```

---

## Migration from v3.0

See **[MIGRATION-v4.md](MIGRATION-v4.md)** for the complete migration guide.

### Quick Reference

| v3.0 | v4.0 |
|------|------|
| /setup | (automatic) |
| /inherit | /envision |
| /approve | /consult |
| /canonize | /consult --protect |
| /unlock | /consult --unlock |
| /validate | /garden --validate |

---

## MCP Integration

`/observe` uses Claude in Chrome MCP for automatic screenshots:

- Automatic screen capture when MCP available
- Falls back to manual screenshot upload
- Structural analysis against rules.md
- Feedback questions for human judgment

---

## Documentation

- **[CLAUDE.md](CLAUDE.md)** — Agent protocol and quick reference
- **[MIGRATION-v4.md](MIGRATION-v4.md)** — v3.0 → v4.0 migration guide
- **[CHANGELOG.md](CHANGELOG.md)** — Version history

---

## Coexistence with Loa

Sigil and Loa operate independently:

| Aspect | Sigil | Loa |
|--------|-------|-----|
| State Zone | `sigil-mark/` | `loa-grimoire/` |
| Config | `.sigilrc.yaml` | `.loa.config.yaml` |
| Focus | Design context | Product lifecycle |

---

## Why "Sigil"?

A sigil is a symbolic representation of intent—a mark that carries meaning beyond its form. Sigil captures your product's design intent and makes it available to AI agents, ensuring every generated component carries the same soul.

---

## License

[MIT](LICENSE)

## Links

- [Claude Code](https://claude.ai/code)
- [Loa Framework](https://github.com/0xHoneyJar/loa)
- [Repository](https://github.com/0xHoneyJar/sigil)
- [Issues](https://github.com/0xHoneyJar/sigil/issues)
