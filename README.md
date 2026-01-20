# Sigil

[![Version](https://img.shields.io/badge/version-2.4.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-AGPL--3.0-green.svg)](LICENSE.md)
[![Release](https://img.shields.io/badge/release-Craft_States-purple.svg)](CHANGELOG.md#240---2026-01-19--craft-states)

> *"A sigil holds the tension — creative intuition grounded in user truth. Move fast without losing sight of what actually matters."*

**Creative speed, grounded in truth.** Sigil lets you iterate fast on feel while staying anchored to what users actually need. It's taste for building products — the balance between intuition and evidence, between shipping and strategy. Built as a [Loa Construct](https://github.com/0xHoneyJar/loa).

```bash
# Install via Loa Constructs
loa install sigil

# Start crafting
/craft "claim button"
```

---

## The Tension

Building products lives in tension:

**Creative intuition** — You know good feel when you see it. "Too corporate." "Feels heavy." "Not quite right." This instinct is real and valuable.

**User truth** — But intuition without grounding is guessing. What do users actually need? What moment are they in? What problem are we really solving?

**Speed** — Ship fast, learn fast, iterate. Don't overthink.

**Strategy** — But shipping the wrong thing fast is waste. Some work needs architecture first.

Most tools force you to choose. Sigil holds the tension.

---

## The Model

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   USER TRUTH (the ground)                                       │
│   ═══════════════════════                                       │
│   Who is the user?     Power user, casual, first-time, mobile   │
│   What's the moment?   High stakes, routine, discovery, error   │
│   What should they     Trust, speed, delight, safety, control   │
│   feel?                                                         │
│                                                                 │
│   You don't always know. That's okay. Sigil helps you discover  │
│   through iteration — but always asks the questions.            │
│                                                                 │
│                            ↓                                    │
│                                                                 │
│   CREATIVE INTUITION (the spark)                                │
│   ══════════════════════════════                                │
│   "Feels too corporate"    "Needs more weight"                  │
│   "Snappier"               "Something's off"                    │
│                                                                 │
│   Your instinct matters. Sigil translates vague feel into       │
│   concrete physics — then remembers what worked.                │
│                                                                 │
│                            ↓                                    │
│                                                                 │
│   PHYSICS (the tools)                                           │
│   ═══════════════════                                           │
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
│   TASTE (the memory)                                            │
│   ══════════════════                                            │
│   Accumulated understanding: what your users need +             │
│   what physics create that feel. Grows with every iteration.    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Taste** isn't just preferences — it's your accumulated understanding of your users and what makes them feel right. The more you iterate, the more grounded your intuition becomes.

---

## Speed vs Strategy

Not every task is the same. Sometimes you need to move fast. Sometimes you need to think first.

```
/craft "claim button"           → CHISEL: Move fast, iterate on feel
/craft "build rewards feature"  → HAMMER: Think first, then build
```

**Chisel mode** — Creative speed. You have intuition about what's needed. Craft it, see how it feels, adjust. The feedback loop keeps you grounded.

**Hammer mode** — Strategic grounding. The work is bigger than a component. Sigil invokes Loa to plan architecture first, then applies physics during implementation.

This isn't a tradeoff — it's choosing the right tool:

| Mode | When | Speed | Grounding |
|------|------|-------|-----------|
| Chisel | Component, polish, iteration | Fast | Feedback loop |
| Hammer | Feature, system, architecture | Measured | Upfront planning |

**Scope detection** chooses automatically:
- Hammer signals: "feature", "system", "flow", "build", "implement"
- Chisel signals: "button", "modal", "animation", "improve", "polish"

Force with `--hammer` or `--chisel` when you know what you need.

---

## The Feedback Loop

This is how you move fast without losing the truth. Each iteration grounds your intuition.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   UNDERSTAND                    CRAFT                      VALIDATE      │
│   (ground yourself)            (trust intuition)          (check truth) │
│                                                                          │
│   /observe         ──→         /craft          ──→         /ward         │
│   /understand                  /style                      /garden       │
│                                /animate                                  │
│   What do users                /behavior                   Does it       │
│   actually need?                                           actually      │
│                                Create with                 work?         │
│         │                      physics                                   │
│         │                                                       │        │
│         │                          │                            │        │
│         │                          ▼                            │        │
│         │                                                       │        │
│         │                    USER FEEDBACK                      │        │
│         │               "Does this feel right?"                 │        │
│         │                                                       │        │
│         │                          │                            │        │
│         │              ┌───────────┴───────────┐                │        │
│         │              │                       │                │        │
│         │              ▼                       ▼                │        │
│         │                                                       │        │
│         │         ACCEPT (+1)            MODIFY (+5)            │        │
│         │         Ship it                "feels heavy"          │        │
│         │              │                 "too clinical"         │        │
│         │              │                 "timing off"           │        │
│         │              │                       │                │        │
│         │              ▼                       ▼                │        │
│         │                                                       │        │
│         │                       TASTE                           │        │
│         │           (accumulated understanding)                 │        │
│         │                          │                            │        │
│         │                          ▼                            │        │
│         │                                                       │        │
│         │                     /inscribe                         │        │
│         │           (graduate to permanent rules)               │        │
│         │                          │                            │        │
│         └──────────────────────────┴────────────────────────────┘        │
│                                                                          │
│              Each loop: faster intuition, better grounding               │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**The loop makes you faster AND more grounded.** Early iterations might miss. But taste accumulates. After 3+ similar signals, Sigil applies patterns automatically. Your intuition becomes trained intuition.

### Signal Weights

| Signal | Weight | What It Teaches |
|--------|--------|-----------------|
| ACCEPT | +1 | "This felt right" |
| MODIFY | +5 | "This is what right actually looks like" |
| REJECT | -3 | "This felt wrong" |

Corrections weight 5x because they're specific. Silence is ambiguous.

---

## Commands

### By Phase

| Phase | Command | Purpose |
|-------|---------|---------|
| **Understand** | `/observe` | Capture user insights — what do they actually need? |
| | `/understand` | Research domain before crafting |
| **Craft** | `/craft` | Apply physics — primary entry point |
| | `/style` | Material only (looks wrong) |
| | `/animate` | Animation only (movement off) |
| | `/behavior` | Behavioral only (timing wrong) |
| | `/distill` | Break feature into craft-able components |
| **Validate** | `/ward` | Audit against physics — does it actually work? |
| | `/garden` | Component authority report |
| **Learn** | `/inscribe` | Graduate patterns to permanent rules |

### By Speed

| Speed | Commands | When |
|-------|----------|------|
| **Fast iteration** | `/craft`, `/style`, `/animate`, `/behavior` | You have intuition, test it |
| **Strategic pause** | `/observe`, `/understand`, `/distill` | Step back, get grounded |
| **Validation** | `/ward`, `/garden` | Check if reality matches intent |

---

## Usage

```bash
# Fast iteration (chisel)
/craft "claim button"                    # Trust intuition, craft it
/style "warmer, less corporate"          # Adjust feel
/animate "snappier"                      # Tune movement

# Strategic grounding (hammer)
/craft "build rewards feature"           # Triggers planning first
/observe                                 # What do users actually need?
/understand "DeFi claiming patterns"     # Research before building

# Validation
/ward                                    # Does it actually work?
/ward http://localhost:3000              # Visual check
/garden                                  # Component health

# Learning
/inscribe                                # Make patterns permanent
```

Before generating, Sigil asks about **user truth** (grounding):

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

Then shows physics analysis (creative translation):

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

Your answer — even vague ("feels heavy", "too clinical") — trains the system. Creative input, grounded output.

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
| Error | Helpful, not alarming | What + fix | "Couldn't claim. Retry?" |
| Empty | Guiding, not sad | Opportunity + action | "No rewards yet. Stake to earn" |
| Confirmation | Clear stakes | What will happen | "Claim 100 HONEY to wallet?" |

---

## Protected Capabilities

Some things aren't creative choices. They're user safety. Non-negotiable:

| Capability | Rule |
|------------|------|
| Withdraw | Always reachable |
| Cancel | Always visible (even during loading) |
| Balance | Always accurate |
| Touch target | ≥44px minimum |
| Focus ring | Always visible |
| Error recovery | Always possible |

Override requires explicit justification. This is grounding you can't skip.

---

## Loa Integration

Sigil is a **Loa Construct** — extends Loa without modifying it.

| Loa (Architecture) | Sigil (Feel) |
|-------------------|--------------|
| "What to build" | "How it feels" |
| Strategy | Creative execution |
| PRD → SDD → Sprint | Understand → Craft → Validate |

**Hammer mode** bridges them: when work needs architecture, Sigil invokes Loa for strategic grounding, then applies physics during implementation.

```
/craft detects HAMMER (needs strategy)
     │
     ▼
Sigil invokes Loa:
• /plan-and-analyze (seeded with user observations)
• /architect
• /sprint-plan
     │
     ▼
User reviews plan → /run sprint-plan
     │
     ▼
Loa executes, Sigil applies physics to UI work
```

---

## Repository Structure

```
.claude/
├── commands/                 # 47 commands
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
├── taste.md                  # Accumulated understanding
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

`grimoires/sigil/taste.md` — accumulated understanding:

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

## Why "Sigil"?

A sigil holds intention — but intention grounded in truth.

Traditional product development forces a choice: move fast and guess, or slow down and research. Creative intuition vs. user evidence. Speed vs. strategy.

Sigil holds the tension:

- **Ground yourself** in user truth — who they are, what they need
- **Trust your intuition** — "feels heavy" is valid input
- **Move fast** with chisel mode — iterate, adjust, ship
- **Think first** with hammer mode — when the work needs architecture
- **Stay grounded** through the feedback loop — every iteration teaches

The sigil remembers. Your taste accumulates. Creative intuition becomes trained intuition — fast AND grounded.

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
