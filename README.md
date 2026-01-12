# Sigil

[![Version](https://img.shields.io/badge/version-10.1.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> *"The codebase is the dataset. Usage is the authority."*

Design Context Framework for AI-assisted development. Learns your design preferences invisibly, promotes patterns through survival, and guides agents toward consistent decisions—without interrupting flow.

## v10.1 "Usage Reality"

```
THE LAYER CAKE
──────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────┐
│                  DESIGNER EXPERIENCE                    │
│                                                         │
│                      /craft                             │
│                         │                               │
│                "Just use it. Ship."                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                     SKILLS LAYER                        │
│                                                         │
│      ┌──────────┐   ┌──────────┐   ┌──────────────┐    │
│      │  MASON   │   │ GARDENER │   │ DIAGNOSTICIAN│    │
│      │          │   │          │   │              │    │
│      │Generation│   │Governance│   │   Debugging  │    │
│      │ UI+Copy  │   │ Survival │   │   Patterns   │    │
│      └────┬─────┘   └────┬─────┘   └──────┬───────┘    │
│           │              │                │             │
├───────────┼──────────────┼────────────────┼─────────────┤
│           └──────────────┼────────────────┘             │
│                          │                              │
│                ┌─────────▼─────────┐                    │
│                │   CONTEXT LAYER   │                    │
│                │                   │                    │
│                │  ┌─────────────┐  │                    │
│                │  │    Taste    │  │  Design prefs     │
│                │  └─────────────┘  │                    │
│                │  ┌─────────────┐  │                    │
│                │  │   Persona   │  │  Who you build    │
│                │  └─────────────┘  │  for              │
│                │  ┌─────────────┐  │                    │
│                │  │   Project   │  │  Codebase         │
│                │  └─────────────┘  │  knowledge        │
│                │                   │                    │
│                └───────────────────┘                    │
│                                                         │
│              All invisible. All learned.                │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                     FOUNDATION                          │
│                                                         │
│                ┌───────────────────┐                    │
│                │       CORE        │                    │
│                │                   │                    │
│                │  "Using it IS     │                    │
│                │   the experience" │                    │
│                └───────────────────┘                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**What's new in v10.1:**
- **Usage-Based Authority** — Authority computed from imports (10+ = gold, 5+ = silver)
- **Effect-Based Physics** — Physics inferred from effect type (mutation/query/local_state)
- **AST Intent Inference** — TypeScript Compiler API reads code without JSDoc
- **Invisible Context** — Taste, Persona, Project learned from accept/modify/reject
- **Pattern Diagnostics** — Match symptoms to solutions automatically
- **3 Consolidated Skills** — Mason, Gardener, Diagnostician (from 49 → 14 total)
- **Core Library** — 6 modules at `src/lib/sigil/`

---

## The Three Laws

### 1. Code is Precedent
Patterns that survive in your codebase become canonical. No governance dialogs, no approval workflows. If you use a pattern 5+ times, it becomes the standard.

### 2. Survival + Cleanliness = Gold
Usage is necessary, linter gate is sufficient. 5+ Gold imports, 2+ weeks stable, lint passes → automatic promotion.

### 3. Never Interrupt Flow
No blocking dialogs. No approval prompts. Context accumulates invisibly. Designer never sees the machinery.

---

## Installation

```bash
# Mount Sigil onto any repository
npx sigil mount

# Start Claude Code
claude
/craft "your first component"
```

**Time investment:** Zero configuration
**Payoff:** Every generation inherits your design physics automatically

---

## The Three Skills

### Mason — Generation

```
Trigger: /craft "..."

Designer: /craft "trustworthy claim button"

Mason:
  ├── Reads Taste → Physics selection (deliberate)
  ├── Reads Persona → Copy voice (friendly, low jargon)
  ├── Reads Project → Conventions (@/ aliases)
  ├── Reads Gold → Stable patterns to prefer
  │
  └── Generates complete UI with appropriate copy
```

**No questions asked.** Mason infers everything from context.

### Gardener — Invisible Governance

```
Trigger: Background / git push

Survival Engine:
  ├── Draft → 5+ uses → Silver
  │             2 weeks stable
  │             Lint passes
  │                    ↓
  │               → Gold
  │
  └── Modified? 3+ rejections? → Demoted

Designer never sees this process.
```

### Diagnostician — Debugging

```
Trigger: "It's broken" / "glitches" / error detected

Pattern Library:
  ├── Hydration mismatches
  ├── Dialog instability
  ├── CSS conflicts
  ├── React pitfalls
  └── Performance issues
        │
        ▼
  Investigation (INVISIBLE)
  Designer NEVER:
    • Checks console
    • Adds console.log
    • Digs through logs
        │
        ▼
  "I found the issue. Here's the fix..."
```

---

## Context Layer

All invisible. All learned from usage.

### Taste Accumulation

| Signal | Example | Learning |
|--------|---------|----------|
| Accept | Keeps `server-tick` physics | "Prefers deliberate for critical" |
| Modify | Changes `snappy` to `deliberate` | "Deliberate > snappy for buttons" |
| Reject | Discards generation | "Pattern doesn't fit" |

### Persona Inference

| Signal | Example | Learning |
|--------|---------|----------|
| Prompt | "skip the tutorial stuff" | Expert audience |
| Kept copy | "Deposit" survived | Technical terms OK |
| Changed copy | "Yield" → "Earnings" | Avoid DeFi jargon |

### Project Familiarity

| Signal | Example | Learning |
|--------|---------|----------|
| File found | `assets/logo.svg` | Asset folder exists |
| Import style | `@/components/ui` | Using path aliases |
| Naming | `claim-button.tsx` | Kebab-case convention |

---

## Core Library

```
src/lib/sigil/
├── index.ts          # Public API
├── context.ts        # Context management
├── survival.ts       # Authority computation
├── physics.ts        # Physics inference
├── ast-reader.ts     # AST intent inference
├── diagnostician.ts  # Pattern matching
└── search.ts         # Fuzzy file finding
```

### Usage-Based Authority

```typescript
import { computeAuthority } from '@/lib/sigil';

// Authority computed from imports
const tier = computeAuthority('Button');
// → 'gold' (10+ imports)
// → 'silver' (5-9 imports)
// → 'draft' (1-4 imports)
```

### Effect-Based Physics

```typescript
import { inferPhysics } from '@/lib/sigil';

// Physics inferred from effect type
const physics = inferPhysics('mutation', 'financial');
// → { sync: 'pessimistic', timing: 'deliberate' }
```

---

## Architecture

### Directory Structure

```
src/lib/sigil/           # Core library (6 modules)
├── index.ts
├── context.ts
├── survival.ts
├── physics.ts
├── ast-reader.ts
├── diagnostician.ts
└── search.ts

grimoires/sigil/         # Design state
├── .context/            # Invisible accumulation (gitignored)
├── constitution.yaml    # Design constraints
└── authority.yaml       # Component tiers

.claude/skills/          # 14 skills (3 Sigil + 11 Loa)
├── mason/               # Generation
├── gardener/            # Governance
├── diagnostician/       # Debugging
└── (11 Loa skills)      # Workflow automation

.github/workflows/
└── sigil-gardener.yaml  # Auto-promote on merge
```

### Skills

| Skill | Purpose |
|-------|---------|
| **mason** | Zone-aware generation with context |
| **gardener** | Survival engine, invisible promotion |
| **diagnostician** | Pattern-based debugging |

### GitHub Actions

The Gardener runs on every merge to main:

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'src/**/*.tsx'
      - 'src/**/*.ts'
```

Computes authority from imports, updates context automatically.

---

## Commands

| Command | Purpose |
|---------|---------|
| `/craft` | Design guidance with full context |
| `/garden` | Check pattern health |
| `/audit` | Visual cohesion report |

### /craft

```bash
/craft "trustworthy claim button"
```

Flow:
1. Infer zone from vocabulary ("claim" → critical)
2. Read context (taste, persona, project)
3. Apply physics (deliberate, 800ms)
4. Select Gold patterns
5. Generate code
6. Update context (invisible)

No questions. No configuration. Just works.

---

## Cold Start

**Day one: No context accumulated. What happens?**

| Context | Cold Start | First Learning |
|---------|------------|----------------|
| Taste | Gold patterns if exist, else standard | First accept/modify |
| Persona | Neutral voice | First prompt language |
| Project | Scan codebase on mount | First file reference |

By 5th `/craft`: Meaningful taste signal
By 20th `/craft`: Confident context (90%)

---

## Veto Mechanism

Corrections are the veto. No forms, no config.

```
Designer: /craft "claim button"
Agent: [Generates newcomer-friendly based on inference]

Designer: "Use technical language, this is for DeFi natives"

Agent: "Got it — adjusting for DeFi-native audience"
       [Updates persona with 5x weight]
       [Regenerates]
```

Explicit corrections override implicit signals.

---

## Migration from Earlier Versions

v10.1 consolidates the architecture:

| Before | After |
|--------|-------|
| 49 skills | 14 skills |
| 37 process files | 6 core library modules |
| sigil-mark/ | grimoires/sigil/ |
| JIT grep | Pre-computed authority |

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

## Philosophy

### The Problem

AI agents generate UI without understanding your product's soul. Every generation is a coin flip—sometimes it matches your vision, sometimes it doesn't.

### The v10.1 Insight: Usage is Reality

Instead of configuration files and governance dialogs:
- **Read the code** — AST tells us intent
- **Count imports** — Usage determines authority
- **Observe outcomes** — Accept/modify/reject shapes taste

The codebase itself becomes the dataset. No questions needed.

---

## Why "Sigil"?

A sigil is a symbolic representation of intent—a mark that carries meaning beyond its form. Sigil captures your product's design intent and makes it available to AI agents, ensuring every generated component carries the same soul.

---

## Documentation

- **[CLAUDE.md](CLAUDE.md)** — Agent protocol and quick reference
- **[CHANGELOG.md](CHANGELOG.md)** — Version history

---

## License

[MIT](LICENSE)

## Links

- [Claude Code](https://claude.ai/code)
- [Loa Framework](https://github.com/0xHoneyJar/loa)
- [Repository](https://github.com/0xHoneyJar/sigil)
- [Issues](https://github.com/0xHoneyJar/sigil/issues)

---

*Sigil v10.1.0 "Usage Reality"*
*Last Updated: 2026-01-11*
