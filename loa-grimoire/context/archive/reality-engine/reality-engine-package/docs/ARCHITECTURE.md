# Reality Engine — Architectural Overview

**Version**: 1.0.0  
**Date**: 2026-01-02  
**Status**: Production Ready

---

## Executive Summary

The Reality Engine is a design governance framework for products where **culture is the primary constraint**—not just technical specifications. It emerged from 11 architectural iterations, each solving the fatal flaw of the previous.

**Core Insight**: In high-affinity products (games, creative tools, community platforms), the most important design constraints are often unwritten, emergent, and cultural. A system that only enforces intended behavior will destroy the emergent magic that makes products beloved.

---

## The Problem Space

Traditional design systems fail for high-affinity products because they assume:

| Assumption | Reality |
|------------|---------|
| Code = Truth | Culture = Truth; code is just the medium |
| Bugs should be fixed | Some bugs become skill expression (prayer flicking) |
| Consistency = Matching specs | Consistency = Matching the *feel* (grit, not polish) |
| Internal testing catches issues | Scale reveals exploits, economy breaks, social dynamics |
| Democratic polling ensures approval | Committees produce average; taste requires ownership |

---

## Architectural Evolution

The Reality Engine is the result of 11 iterations, each addressing a fatal flaw:

| # | Architecture | Fatal Flaw | Learning |
|---|--------------|------------|----------|
| 1 | Sigil (Documentation) | Capture ≠ Governance | Writing rules down doesn't enforce them |
| 2 | Sovereign (Government) | Voting ≠ Taste | Democracy produces average, not excellence |
| 3 | Studio OS (Dictatorship) | Bus factor | Single point of failure |
| 4 | Studio Console (Dashboard) | Alt-tab ignored | Out of sight = out of mind |
| 5 | Studio HUD (Cop) | Reactive fear | Policing creates fear, not craft |
| 6 | Living Atelier (Factory) | Replication only | Perfect replication prevents evolution |
| 7 | The Foundry (Workshop) | AI judging taste | AI can see patterns, not soul |
| 8 | Master-Apprentice (Hierarchy) | Single canon | Multiple truths coexist |
| 9 | The Guild (Museum) | Archived eras | 2007 isn't history; it's the runtime |
| 10 | The Omniverse (Physics) | Forgot metaphysics | Code is just the medium |
| 11 | **Reality Engine** | **Final architecture** | Culture is the reality |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        THE REALITY ENGINE                               │
│           "Culture is the Reality. Code is Just the Medium."           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                    THE SOUL BINDER (Metaphysics)                        │
│                                                                         │
│   ┌─────────────────────────┬─────────────────────────┐                │
│   │    IMMUTABLE VALUES     │    CANON OF FLAWS       │                │
│   │    (Intended Soul)      │    (Emergent Soul)      │                │
│   └─────────────────────────┴─────────────────────────┘                │
│                                                                         │
│   + Visual Soul (Grit Signatures)                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                    THE LENS ARRAY (Interpretations)                     │
│                                                                         │
│   Nostalgia + Modern + Utility (Additive, Simultaneous)                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                THE CONSULTATION CHAMBER (Soft Poll)                     │
│                                                                         │
│   Concept Blog → Sentiment Heatmap → Taste Owner Decision → LOCK       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                  THE PROVING GROUNDS (Public Beta)                      │
│                                                                         │
│   Monitors: XP Rate | Economy | Exploit Radar                          │
│   Graduation: 7 days clean → Canon                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                       THE LIVING CANON                                  │
│                                                                         │
│   Gold Standard assets + Approved patterns + Cultural precedent        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## The Four Pillars

### Pillar 1: The Soul Binder

**Purpose**: Protect both intended AND emergent product soul.

**Components**:

1. **Immutable Values** — The intended design principles
   - The Grind: Effort = Value
   - The Click: Tactile, mechanical, responsive
   - The Risk: Loss is real, choices matter
   - The Look: Low-fidelity with soul, not Play-Doh

2. **Canon of Flaws** — Bugs/exploits that became features
   - Criteria: >5% high-level usage, skill expression, removal causes backlash
   - Examples: Prayer flicking, tick manipulation, animation canceling
   - Agent behavior: BLOCK any "fix" that would break a canonized flaw

3. **Visual Soul** — Cultural signatures beyond technical specs
   - Grit signatures (edge roughness, color banding, hand-painted noise)
   - Play-Doh detection (too smooth, too clean = soul violation)
   - Mod West principle: Study imperfections, not just constraints

**Key Insight**: A perfect recreation of the intended design would be soulless. The emergent jank IS the product.

---

### Pillar 2: The Lens Array

**Purpose**: Support multiple coexisting visual truths.

**Lenses**:

| Lens | Description | Target |
|------|-------------|--------|
| Nostalgia | Pure, original, minimal | Purists, low-spec |
| Modern | HD, shadows, GPU effects | Enhancement seekers |
| Utility | Accessible, mobile, large targets | A11y, mobile users |

**Rules**:
- Lenses are **additive** (can stack)
- Lenses **cannot modify** hitboxes, timing, or game logic
- All assets validated in **most constrained lens** (Fixed Mode)
- If it breaks in Fixed Mode, it's rejected—regardless of HD appearance

**Key Insight**: HD isn't a replacement era; it's a lens interpreting the same core. Vanilla and HD run simultaneously, not sequentially.

---

### Pillar 3: The Consultation Chamber

**Purpose**: Get community input without design-by-committee.

**The Spectrum**:

| Type | Examples | Process |
|------|----------|---------|
| **Strategic** (Polled) | New skills, regions, major changes | Binding community vote |
| **Direction** (Consulted) | Visual style A vs B, tone | Concept blog + sentiment heatmap |
| **Execution** (Dictated) | Specific pixels, details | Taste Owner decides |

**Process**:
1. Generate Concept Blog (show options)
2. Gather Sentiment Heatmap (1 week)
3. Present to Taste Owner with context
4. Decision made (can override with documented reasoning)
5. **LOCK** — No further polling on execution details

**Key Insight**: Players rioted over a green pixel. You can't ignore sentiment. But you also can't poll every detail. The solution is layered authority.

---

### Pillar 4: The Proving Grounds

**Purpose**: Catch issues that only emerge at scale.

**Why Dogfooding Fails**:
- 50 people can't simulate 1M player economy
- Internal teams don't grief each other
- Scale reveals emergent behaviors

**Monitors**:

| Monitor | What It Tracks | Threshold |
|---------|----------------|-----------|
| XP Rate | Value generation per hour | Constitutional cap |
| Economy | Gold/item flow, inflation | 2% daily max |
| Exploit Radar | Anomalous patterns | Statistical deviation |

**Graduation**:
- 7 days in public beta
- All monitors green
- No unresolved P1 exploits
- Net positive sentiment
- **Then and only then**: Promote to Canon

**Key Insight**: If it survives the players, it deserves to ship. If the players break it, you learn before production.

---

## Data Flow

```
DEVELOPER CREATES ASSET/CODE
            │
            ▼
┌─────────────────────────────────────────┐
│         SOUL BINDER CHECK               │
│                                         │
│  • Does this affect a Protected Flaw?   │
│  • Does this violate Immutable Values?  │
│  • Does this pass Grit validation?      │
│                                         │
│  BLOCK if flaw affected                 │
│  FLAG if grit fails                     │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│         LENS ARRAY VALIDATION           │
│                                         │
│  • Validate in Nostalgia lens           │
│  • Validate in Modern lens              │
│  • Validate in Utility lens             │
│  • Check Fixed Mode (800x600)           │
│                                         │
│  REJECT if Fixed Mode fails             │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│    CONSULTATION (if visual change)      │
│                                         │
│  • Is this strategic? → Poll            │
│  • Is this direction? → Concept Blog    │
│  • Is this execution? → Taste Owner     │
│                                         │
│  LOCK after decision                    │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│         PROVING GROUNDS                 │
│                                         │
│  • Deploy to beta                       │
│  • Monitor for 7 days                   │
│  • Watch XP/Economy/Exploits            │
│                                         │
│  BLOCK graduation if monitors fail      │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│         GRADUATE TO CANON               │
│                                         │
│  • Add to Gold Standard                 │
│  • Update cultural precedent            │
│  • Ship to production                   │
└─────────────────────────────────────────┘
```

---

## File Structure

```
project/
├── CLAUDE.md                        # Agent instructions
├── .reality-engine.yaml             # System configuration
│
├── reality-engine/
│   │
│   ├── soul-binder/
│   │   ├── immutable-values.yaml    # Intended soul
│   │   ├── canon-of-flaws.yaml      # Emergent soul
│   │   └── visual-soul.yaml         # Grit signatures
│   │
│   ├── lens-array/
│   │   ├── lenses.yaml              # Lens definitions
│   │   └── validate.sh              # Validation script
│   │
│   ├── consultation-chamber/
│   │   ├── config.yaml              # Process configuration
│   │   ├── concept-blogs/           # Published blogs
│   │   ├── heatmaps/                # Sentiment analysis
│   │   └── decisions/               # Recorded decisions
│   │
│   ├── proving-grounds/
│   │   ├── config.yaml              # Monitor configuration
│   │   ├── monitors/                # Monitor definitions
│   │   └── active/                  # Currently proving
│   │
│   ├── canon/
│   │   └── gold/                    # Gold Standard assets
│   │
│   └── taste-owners.yaml            # Authority mapping
│
└── .claude/
    ├── commands/                    # Slash commands
    └── skills/reality-engine/       # Skill implementation
```

---

## Integration Points

### CI/CD Integration

```yaml
# .github/workflows/reality-engine.yml
on: [pull_request]

jobs:
  soul-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check Canon of Flaws
        run: ./reality-engine/soul-binder/check-flaws.sh
      
  lens-validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate all lenses
        run: ./reality-engine/lens-array/validate.sh
      
  grit-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check cultural signatures
        run: ./reality-engine/soul-binder/grit-check.sh
```

### IDE Integration

The agent instructions (CLAUDE.md) work with:
- Claude Code (claude-cli)
- Cursor with Claude
- Any Claude-powered IDE extension

Commands available:
- `/soul-check` — Validate against Canon of Flaws
- `/lens-validate <asset>` — Multi-lens validation
- `/grit-check <asset>` — Cultural signature check
- `/consult <feature>` — Start consultation
- `/prove <feature>` — Deploy to Proving Grounds

---

## Key Principles

### 1. Culture > Code

When technical specs and cultural expectations conflict, culture wins (within safety bounds). The green pixel stays if the community loves it.

### 2. Protect the Flaws

Some bugs are sacred. The Canon of Flaws exists to prevent well-meaning optimizations from destroying emergent gameplay. Prayer flicking was never intended—but it defines high-level play.

### 3. Grit > Polish

Technical compliance ≠ soul. An asset can meet every polygon budget and texture constraint while having the "Play-Doh" problem. The Mod West approach: study the imperfections.

### 4. Consult, Then Lock

Poll the direction. Gather sentiment. Make a decision. Then STOP polling. Execution belongs to Taste Owners, not committees. The green pixel debate ends when the Taste Owner locks.

### 5. Scale Reveals Truth

50 people cannot simulate what 1 million will do. The Proving Grounds exists because internal teams don't grief each other, don't find economy exploits, and don't stress-test at scale.

---

## Success Criteria

The Reality Engine is working when:

1. **Protected Flaws remain protected** — No "optimization" removes canonized emergent behavior
2. **Assets work across all lenses** — Fixed Mode validation catches HD-only designs
3. **Direction is consulted, execution is owned** — No green pixel debates in production
4. **Scale issues caught in beta** — Economy breaks and exploits found before live
5. **The product survives its community** — Features that ship have proven they belong

---

## References

This architecture draws from:

- **Old School RuneScape**: Polling system, 117HD integration, Canon of Flaws examples
- **Linear**: Opinionated design, rejecting A/B testing, Taste Owner authority
- **Jagex Polling Charter**: "Asset Visuals will no longer be subject to polls"
- **The Mod West Principle**: Studying imperfections to create authentic feel
- **The Mod Ghost Antipattern**: Technically superior but culturally rejected

---

## Getting Started

1. Copy `CLAUDE.md` to your project root
2. Copy `reality-engine/` directory to your project
3. Configure `taste-owners.yaml` with your team
4. Populate `canon-of-flaws.yaml` with your emergent behaviors
5. Define your lenses in `lens-array/lenses.yaml`
6. Run `/soul-check` on your first PR

**The Reality Engine builds products that survive their own community.**
