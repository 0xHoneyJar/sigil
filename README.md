# Sigil

[![Version](https://img.shields.io/badge/version-2.4.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-AGPL--3.0-green.svg)](LICENSE.md)
[![Release](https://img.shields.io/badge/release-Craft_States-purple.svg)](CHANGELOG.md#240---2026-01-19--craft-states)

> *"A sigil holds the tension — creative intuition grounded in user truth. Move fast without losing sight of what actually matters."*

**Taste for building products.** Sigil teaches AI to understand what users need to feel, then translates that into physics — timing, motion, surface, voice. Built as a [Loa Construct](https://github.com/0xHoneyJar/loa).

```bash
# Install via Loa Constructs
loa install sigil

# Start crafting
/craft "claim button"
```

---

## The Model

Everything starts with **User Truth** — who your users are, what moment they're in, what they need to feel. Physics is how you create that feel.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   USER TRUTH                                                    │
│   ══════════                                                    │
│   Who is the user?     Power user, casual, first-time, mobile   │
│   What's the moment?   High stakes, routine, discovery, error   │
│   What should they     Trust, speed, delight, safety, control   │
│   feel?                                                         │
│                                                                 │
│                            ↓                                    │
│                                                                 │
│                          FEEL                                   │
│                    (the goal, not the input)                    │
│                                                                 │
│                            ↓                                    │
│                                                                 │
│   PHYSICS (tools to create feel)                                │
│   ══════════════════════════════                                │
│                                                                 │
│   ┌─ Behavioral ────────────────────────────────────────────┐   │
│   │  Sync, timing, confirmation                             │   │
│   │  "Does clicking feel instant or deliberate?"            │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─ Animation ─────────────────────────────────────────────┐   │
│   │  Easing, springs, curves                                │   │
│   │  "Does movement feel mechanical or alive?"              │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─ Material ──────────────────────────────────────────────┐   │
│   │  Surface, shadow, radius, grit                          │   │
│   │  "Does it look trustworthy or playful?"                 │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌─ Voice ─────────────────────────────────────────────────┐   │
│   │  Copy, tone, microcopy, empty states                    │   │
│   │  "Does it sound helpful or clinical?"                   │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                            ↓                                    │
│                                                                 │
│                         TASTE                                   │
│              (accumulated understanding of                      │
│               your users + physics that work)                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Taste** isn't just your preferences — it's your accumulated understanding of your users and what makes them feel right. Physics are the tools. User truth is the foundation.

---

## The Feedback Loop

Sigil learns through a continuous cycle. Each command feeds into the next.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   UNDERSTAND                    CRAFT                      VALIDATE      │
│   ───────────                   ─────                      ────────      │
│                                                                          │
│   /observe         ──→         /craft          ──→         /ward         │
│   /understand                  /style                      /garden       │
│                                /animate                    /review       │
│   Capture user                 /behavior                                 │
│   truth, context,              /distill                    Audit against │
│   domain knowledge                                         physics,      │
│                                Generate with               check feel    │
│         │                      physics                                   │
│         │                                                       │        │
│         │                          │                            │        │
│         │                          ▼                            │        │
│         │                                                       │        │
│         │                    USER FEEDBACK                      │        │
│         │                    "Does this feel right?"            │        │
│         │                                                       │        │
│         │                      ┌─────┐                          │        │
│         │                      │     │                          │        │
│         │              ┌───────┴─────┴───────┐                  │        │
│         │              │                     │                  │        │
│         │              ▼                     ▼                  │        │
│         │                                                       │        │
│         │         ACCEPT (+1)          MODIFY (+5)              │        │
│         │         "yes, ship it"       "feels heavy"            │        │
│         │              │               "too clinical"           │        │
│         │              │               "timing is off"          │        │
│         │              │                     │                  │        │
│         │              │                     │                  │        │
│         │              ▼                     ▼                  │        │
│         │                                                       │        │
│         │                      TASTE                            │        │
│         │              grimoires/sigil/taste.md                 │        │
│         │              (accumulated learning)                   │        │
│         │                          │                            │        │
│         │                          │                            │        │
│         │                          ▼                            │        │
│         │                                                       │        │
│         │                     /inscribe                         │        │
│         │              (graduate to permanent rules)            │        │
│         │                          │                            │        │
│         │                          │                            │        │
│         └──────────────────────────┴────────────────────────────┘        │
│                                                                          │
│                           CONTINUOUS REFINEMENT                          │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### The Commands

| Phase | Command | Purpose |
|-------|---------|---------|
| **Understand** | `/observe` | Capture user insights, behavior patterns, context |
| | `/understand` | Research domain before crafting |
| **Craft** | `/craft` | Apply physics to any UX change — primary entry point |
| | `/style` | Material only (looks wrong) |
| | `/animate` | Animation only (movement off) |
| | `/behavior` | Behavioral only (timing wrong) |
| | `/distill` | Break feature into craft-able components |
| **Validate** | `/ward` | Audit codebase against physics |
| | `/garden` | Component authority report |
| | `/review-sprint` | Validate against acceptance criteria |
| **Learn** | `/inscribe` | Graduate taste patterns to permanent rules |

### The Signal Weights

Every interaction teaches:

| Signal | Weight | Trigger | What It Captures |
|--------|--------|---------|------------------|
| ACCEPT | +1 | User ships code as-is | "This felt right" |
| MODIFY | +5 | User edits generated code | "This is what right looks like" |
| REJECT | -3 | User says no, rewrites | "This felt wrong" |

Modifications weight 5x because corrections teach more than silence. After 3+ similar signals, Sigil applies the pattern automatically.

---

## Prerequisites

| Tool | Required | Purpose | Install |
|------|----------|---------|---------|
| [Claude Code](https://claude.ai/code) | Yes | AI runtime | `npm install -g @anthropic-ai/claude-code` |
| [Loa](https://github.com/0xHoneyJar/loa) | Yes | Architecture framework | See Loa docs |
| [agent-browser](https://github.com/anthropics/agent-browser) | No | Visual validation | `npm install -g agent-browser` |

---

## Quick Start

### Via Loa Construct Registry (Recommended)

```bash
loa install sigil
```

Or add to your `.claude/constructs.yaml`:

```yaml
constructs:
  - name: sigil
    version: "^2.0.0"
```

### Manual Installation

```bash
git clone https://github.com/0xHoneyJar/sigil.git
cd sigil && ./.claude/scripts/constructs-install.sh
```

---

## Usage

```bash
# Craft with physics
/craft "claim button"                    # Chisel mode (component)
/craft "build rewards feature"           # Hammer mode (full architecture)

# Layer-specific adjustments
/style "warmer, less corporate"          # Material only
/animate "snappier"                      # Animation only
/behavior "needs more deliberation"      # Behavioral only

# Understand your users
/observe                                 # Capture user insights
/understand "DeFi claiming patterns"     # Research domain

# Validate
/ward                                    # Audit full codebase
/ward http://localhost:3000              # Visual validation
/garden                                  # Component authority

# Learn
/inscribe                                # Graduate patterns to rules
```

Before generating, Sigil asks about **user truth**:

```
┌─ User Truth ───────────────────────────────────────┐
│                                                    │
│  Who is clicking this?   [power user / casual /   │
│                           mobile / first-time]    │
│                                                    │
│  What's the moment?      [high stakes / routine / │
│                           discovery / recovery]   │
│                                                    │
│  What should they feel?  [trust / speed /         │
│                           delight / safety]       │
│                                                    │
└────────────────────────────────────────────────────┘
```

Then shows physics analysis:

```
┌─ Physics Analysis ─────────────────────────────────┐
│                                                    │
│  Component:    ClaimButton                         │
│  Effect:       Financial mutation                  │
│                                                    │
│  Behavioral    pessimistic, 800ms, confirmation   │
│  Animation     ease-out, deliberate               │
│  Material      elevated, soft shadow, 8px         │
│  Voice         "Claim rewards" → "Claiming..."    │
│                → "Claimed!" / "Failed, retry?"    │
│                                                    │
│  Protected:    ✓ cancel  ✓ recovery  ✓ 44px      │
│                                                    │
└────────────────────────────────────────────────────┘

Does this feel right for your user?
```

Your answer — even vague ("feels heavy", "too clinical") — trains the system.

---

## The Craft-First Workflow

`/craft` is the primary entry point. Sometimes you need a button. Sometimes you need an entire feature. Sigil detects the difference:

```
/craft "claim button"           → Chisel mode (fine-grained physics)
/craft "build rewards feature"  → Hammer mode (full architecture)
```

**Scope Detection:**
- Hammer signals: "feature", "system", "flow", "build", "implement"
- Chisel signals: "button", "modal", "animation", "improve", "polish"
- Score ≥2 hammer signals → Hammer mode

**Hammer mode** orchestrates Loa for complete features:

```
/craft "build rewards feature"
  → Scope detection: HAMMER
  → /plan-and-analyze (seeded with observations, taste)
  → /architect
  → /sprint-plan
  → Review plan
  → /run sprint-plan → Complete feature with physics
```

Force mode: `--hammer` or `--chisel`

---

## Physics Reference

### Behavioral Physics

How interactions respond.

| Effect | Sync | Timing | Confirmation | Why |
|--------|------|--------|--------------|-----|
| Financial | Pessimistic | 800ms | Required | Money can't roll back |
| Destructive | Pessimistic | 600ms | Required | Permanent needs deliberation |
| Soft Delete | Optimistic | 200ms | Toast + Undo | Reversible, be fast |
| Standard | Optimistic | 200ms | None | Low stakes = snappy |
| Local | Immediate | 100ms | None | No server = instant |
| High-frequency | Immediate | 0ms | None | Animation = friction |

### Animation Physics

How movement feels.

| Effect | Easing | Spring | Why |
|--------|--------|--------|-----|
| Financial | ease-out, 800ms | — | Weight communicates gravity |
| Standard | spring | 500, 30 | Snappy, organic |
| Local | spring | 700, 35 | Instant, direct |
| High-frequency | none | — | No animation is best |

### Material Physics

How surfaces communicate.

| Surface | Shadow | Border | Radius | Grit |
|---------|--------|--------|--------|------|
| Elevated | soft, 1 layer | subtle | 8-12px | Clean |
| Glass | lg + blur | white/20 | 12-16px | Clean |
| Flat | none | optional | 4-8px | Clean |
| Retro | hard offset | solid 2px | 0px | Pixel |

**Fidelity ceiling:** gradients ≤2 stops, shadows ≤1 layer, radius ≤16px.

### Voice Physics

How products speak.

| Moment | Tone | Pattern | Example |
|--------|------|---------|---------|
| Action | Direct, confident | Verb + object | "Claim rewards" |
| Loading | Reassuring, active | Present participle | "Claiming..." |
| Success | Celebratory, brief | Past tense + next | "Claimed! View balance" |
| Error | Helpful, not alarming | What happened + fix | "Couldn't claim. Retry?" |
| Empty | Guiding, not sad | Opportunity + action | "No rewards yet. Stake to earn" |
| Confirmation | Clear stakes | What will happen | "Claim 100 HONEY to wallet?" |

**Voice constraints:**
- Buttons: 1-3 words (action-oriented)
- Errors: What + Why + Fix
- Empty states: Explain + Guide
- Confirmations: Stakes + Escape

---

## Protected Capabilities

Non-negotiable. Sigil enforces these:

| Capability | Rule |
|------------|------|
| Withdraw | Always reachable |
| Cancel | Always visible (even during loading) |
| Balance | Always accurate |
| Touch target | ≥44px minimum |
| Focus ring | Always visible |
| Error recovery | Always possible |

Override requires explicit justification.

---

## Loa Integration

Sigil is a **Loa Construct** — extends Loa without modifying it.

| Loa (Architecture) | Sigil (Physics) |
|-------------------|-----------------|
| "What to build" | "How it feels" |
| PRD → SDD → Sprint | Understand → Craft → Validate |
| Spec'd upfront | Emerges through iteration |

**Key principle:** Sigil **invokes** Loa commands — never modifies them. Context flows from Sigil (observations, taste) into Loa (planning), then Sigil applies physics during implementation.

```
/craft detects HAMMER
     │
     ▼
Sigil invokes Loa:
• /plan-and-analyze (seeded with user observations, taste)
• /architect
• /sprint-plan
     │
     ▼
User reviews plan → /run sprint-plan
     │
     ▼
Loa executes tasks, Sigil applies physics to UI work
```

---

## Repository Structure

```
.claude/
├── commands/                 # Slash commands (47 total)
│   ├── craft.md              # Primary entry point (v2.0.0)
│   ├── ward.md               # Physics audit
│   ├── observe.md            # Capture user truth
│   ├── style.md              # Material only
│   ├── animate.md            # Animation only
│   ├── behavior.md           # Behavioral only
│   ├── inscribe.md           # Graduate patterns
│   └── ...
│
├── rules/                    # Physics laws (auto-loaded)
│   ├── 00-sigil-core.md      # Priority, actions
│   ├── 01-sigil-physics.md   # Behavioral
│   ├── 02-sigil-detection.md # Effect detection
│   ├── 03-sigil-patterns.md  # Golden patterns
│   ├── 04-sigil-protected.md # Non-negotiables
│   ├── 05-sigil-animation.md # Animation
│   ├── 06-sigil-taste.md     # Taste system
│   ├── 07-sigil-material.md  # Material
│   ├── 08-sigil-lexicon.md   # Keywords
│   └── 10-16-react-*.md      # Implementation
│
└── scripts/                  # Installation

grimoires/sigil/
├── taste.md                  # Accumulated learning
├── hammer-state.json         # Resume interrupted work
├── observations/             # User truth captures
│   ├── user-insights.md      # Validated findings
│   └── {user}-diagnostic.md  # Individual sessions
├── context/                  # Project context
└── moodboard/                # Visual references
```

---

## Configuration

### Taste File

`grimoires/sigil/taste.md` — your accumulated understanding:

```yaml
---
timestamp: "2026-01-19T14:32:00Z"
signal: MODIFY
component:
  name: "ClaimButton"
  effect: "Financial"
diagnostic:
  user_type: "mobile"
  goal: "claim rewards while commuting"
  expected_feel: "snappy"
physics:
  behavioral:
    timing: "800ms"
change:
  from: "800ms"
  to: "500ms"
learning:
  inference: "Mobile users prefer faster timing for financial actions"
---
```

### Observations

`grimoires/sigil/observations/user-insights.md` — validated user truths:

```markdown
## Mobile Users
- Prefer faster timing (500ms vs 800ms for financial)
- Need larger touch targets (48px minimum)
- Expect haptic feedback on confirmation

## Power Users
- Skip confirmations for repeated actions
- Prefer keyboard shortcuts
- Want information density over whitespace
```

---

## Why "Sigil"?

A sigil is a symbol that holds intention. You speak a desire, condense it into a mark, and the mark carries the meaning forward.

Sigil captures product intention as physics:

- **User truth is foundation.** Who, moment, feeling needed.
- **Feel is the goal.** Not features, not pixels — feel.
- **Physics are tools.** Behavioral, animation, material, voice.
- **Taste is memory.** Accumulated understanding of your users.
- **Feedback refines everything.** Understand → Craft → Validate → Learn → Repeat.

---

## License

AGPL-3.0. See [LICENSE.md](LICENSE.md).

---

## Links

- [GitHub](https://github.com/0xHoneyJar/sigil)
- [Issues](https://github.com/0xHoneyJar/sigil/issues)
- [Loa Framework](https://github.com/0xHoneyJar/loa)
- [CHANGELOG](CHANGELOG.md)

---

*v2.4.0 "Craft States"*
