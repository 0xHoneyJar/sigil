# Sigil

[![Version](https://img.shields.io/badge/version-3.1.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-AGPL--3.0-green.svg)](LICENSE.md)
[![Release](https://img.shields.io/badge/release-Anchor_Rust_%26_craft_Evolution-purple.svg)](CHANGELOG.md#310---2026-01-20--anchor-rust--craft-evolution)

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
│   ┌─ Data ──────────────────────────────────────────────────┐   │
│   │  Source selection, staleness, refresh strategies        │   │
│   │  "Is the data fresh enough for this moment?"            │   │
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

### The Primary Entry Point

**`/craft` is Sigil's single entry point.** Everything flows through craft:

```
/craft "claim button"        → Chisel mode: fast iteration on feel
/craft "build rewards flow"  → Hammer mode: triggers architecture first
/craft --debug              → Debug mode: systematic investigation
```

All other commands exist to support `/craft` in the feedback loop:

```
                    ┌──────────────────────────┐
                    │                          │
                    │         /craft           │
                    │    (primary entry)       │
                    │                          │
                    │  Quick → Chisel → Hammer │
                    │  → Debug                 │
                    │                          │
                    └──────────────────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
       ▼                      ▼                      ▼
  UNDERSTAND              VALIDATE                LEARN
  ───────────             ────────               ─────
  /observe                /ward                  /inscribe
  /understand             /garden                taste.md
       │                      │                      │
       └──────────────────────┴──────────────────────┘
                              │
                              ▼
                         ITERATE
```

### Supporting Commands

| Phase | Command | When to Use |
|-------|---------|-------------|
| **Understand** | `/observe` | Capture user insights before crafting |
| | `/understand` | Research domain knowledge |
| **Validate** | `/ward` | Audit physics compliance after crafting |
| | `/garden` | Check component authority health |
| **Learn** | `/inscribe` | Graduate taste patterns to permanent rules |
| **Run** | `/run` | Autonomous sprint execution |

### Specialized Refinement

When `/craft` output needs targeted fixes (rare — usually iterate via `/craft`):

| Command | When | Instead of Full /craft |
|---------|------|------------------------|
| `/style` | Only material is wrong | "Too clinical" → adjust surface |
| `/animate` | Only motion is off | "Too bouncy" → adjust springs |
| `/behavior` | Only timing is wrong | "Too slow" → adjust sync |

### By Speed

| Speed | Commands | When |
|-------|----------|------|
| **Fast iteration** | `/craft` (chisel) | You have intuition, test it |
| **Strategic pause** | `/craft` (hammer) | Scope requires architecture |
| **Debug** | `/craft --debug` | Something's wrong, investigate |
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

### Data Physics

How data sources are selected (Web3/blockchain contexts).

| Source | When | Staleness | Use Case |
|--------|------|-----------|----------|
| On-chain (RPC) | Financial display, pre-tx validation | 0 blocks | Balance before withdraw |
| Indexed (Envio) | Historical, lists, aggregations | Minutes OK | Transaction history |
| Cached | Repeated reads, static data | Depends | Token metadata |

**Decision tree:**
- Displaying balance before transaction? → On-chain
- Showing historical data? → Indexed
- Pre-populating form? → Indexed (with refresh option)
- Confirming action? → On-chain

**Staleness signals:**
```
"Balance: 100 HONEY" (12 blocks ago)  ← Show staleness for financial
"Last updated: 2m ago"                 ← Acceptable for history
```

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

## Anchor: Ground Truth Enforcement

Anchor is Sigil's validation layer — it ensures AI-generated code actually follows the physics rules.

### Why Anchor?

When AI generates UI code, it might *claim* to follow physics ("800ms pessimistic for financial") but generate something different. Anchor validates grounding statements against actual physics requirements.

### Quick Start

```bash
# Validate a grounding statement
anchor warden --text "Component: ClaimButton\nZone: critical\nSync: pessimistic\nTiming: 800ms"

# Check from file
anchor warden --file grounding.txt

# Show zone hierarchy
anchor warden --hierarchy
# Output: critical (most restrictive) > elevated > standard > local (least restrictive)
```

### Validation Status

| Code | Status | Meaning |
|------|--------|---------|
| 0 | VALID | Grounding matches required physics |
| 1 | DRIFT | Over-claiming (citing strict physics for simple components) |
| 2 | DECEPTIVE | Under-claiming (citing lenient physics for critical operations) |

### Zone Hierarchy

| Zone | Components | Example |
|------|------------|---------|
| **critical** | Financial, transaction | ClaimButton, WithdrawModal |
| **elevated** | Destructive, revoke | DeleteButton, RevokeAccess |
| **standard** | CRUD, social | SaveButton, LikeButton |
| **local** | UI state, preferences | ThemeToggle, FilterDropdown |

### Advanced: Session Management

Anchor can manage EVM state for testing Web3 flows:

```bash
# Create a session with fork
anchor session mainnet --block 19000000

# Take snapshots during testing
anchor snapshot --description "Before claim"

# Revert if needed
anchor revert <snapshot-id>

# Checkpoint for recovery
anchor checkpoint <session-id>
```

See `packages/anchor/` for full documentation.

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
├── rules/                    # Physics laws (on-demand via RLM)
│   ├── index.yaml            # RLM rule index
│   ├── rlm-core-summary.md   # Always-loaded core (~1k tokens)
│   ├── 00-sigil-core.md      # Priority, actions
│   ├── 01-sigil-physics.md   # Behavioral
│   ├── 02-sigil-detection.md # Effect detection
│   ├── 03-sigil-patterns.md  # Golden patterns
│   ├── 04-sigil-protected.md # Non-negotiables (always loaded)
│   ├── 05-sigil-animation.md # Animation
│   ├── 06-sigil-taste.md     # Taste system
│   ├── 07-sigil-material.md  # Material
│   ├── 08-sigil-lexicon.md   # Keywords
│   ├── 10-16-react-*.md      # Implementation
│   ├── 19-sigil-data-physics.md    # Data source selection
│   └── 20-sigil-web3-flows.md      # Web3 flow patterns
│
├── skills/                   # Specialized capabilities
│   └── blockchain-inspector/ # On-chain state inspection
│
└── scripts/                  # Installation

grimoires/sigil/
├── taste.md                  # Accumulated understanding
├── craft-state.md            # Session state for iterative debugging
├── hammer-state.json         # Resume interrupted work
├── observations/             # User truth captures
│   ├── user-insights.md      # Validated findings
│   └── {user}-diagnostic.md  # Individual sessions
├── context/                  # Project context
└── moodboard/                # Visual references

packages/
├── anchor/                   # Ground truth enforcement (v4.3.1)
│   ├── src/
│   │   ├── lifecycle/        # Fork, snapshot, checkpoint management
│   │   ├── graph/            # Task dependency graph
│   │   ├── warden/           # Grounding validation + adversarial detection
│   │   └── cli/              # Command-line interface
│   └── dist/                 # Built artifacts
└── sigil-toolbar/            # Browser extension for visual feedback
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

### Installation

```bash
# Clone and install
git clone https://github.com/0xHoneyJar/sigil.git
cd sigil && ./.claude/scripts/constructs-install.sh

# Or mount onto existing project
cd your-project
/mount  # from Claude Code
```

### Via Loa Framework

If you have [Loa](https://github.com/0xHoneyJar/loa) installed:

```bash
# Sigil is a Loa Construct - install via mount
cd your-project
/mount sigil
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

*v3.1.0 "Anchor Rust & /craft Evolution"*
