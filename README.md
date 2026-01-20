# Sigil

[![Version](https://img.shields.io/badge/version-2.3.0--dev-orange.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-AGPL--3.0-green.svg)](LICENSE.md)
[![Release](https://img.shields.io/badge/release-Develop-purple.svg)](CHANGELOG.md#230---unreleased)

> *"A sigil is a symbol that holds intention. You speak a desire, condense it into a mark, and the mark carries the meaning forward."*

**Design physics for AI code generation.** Sigil teaches AI to understand feel — timing, motion, surface — so generated UI matches your intent. Built to work alongside [Loa](https://github.com/0xHoneyJar/loa).

```
$ curl -fsSL https://sigil.dev/install | bash
> /craft "claim button"
```

---

## The Problem

AI generates UI without understanding *feel*. Every generation is a guess.

"Make a button" could mean:
- Instant feedback (local toggle)
- Optimistic update (social like)
- Server confirmation (money transfer)

And *look* is part of feel:
- Clean and minimal (utility)
- Elevated with depth (importance)
- Textured with grit (character)

These aren't style choices. They're **physics**.

---

## Design Physics

Physics is everything that determines feel.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   DESIGN PHYSICS                                                │
│   ══════════════                                                │
│                                                                 │
│   ┌─ Behavioral ─────────────────────────────────────────────┐  │
│   │  Sync, timing, confirmation                              │  │
│   │  "Does clicking feel instant or deliberate?"             │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ┌─ Animation ──────────────────────────────────────────────┐  │
│   │  Easing, springs, curves                                 │  │
│   │  "Does movement feel mechanical or alive?"               │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ┌─ Material ───────────────────────────────────────────────┐  │
│   │  Surface, fidelity, grit                                 │  │
│   │  "Does it look trustworthy or playful?"                  │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│                         ↓                                       │
│                       FEEL                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Taste** is your accumulated preferences across all three.

---

## Behavioral Physics

How interactions respond.

```
EFFECT              SYNC              TIMING          WHY
────────────────────────────────────────────────────────────────────

Financial           Pessimistic       800ms           Money can't be
(claim, withdraw)   Server confirms   Deliberate      rolled back.

Destructive         Pessimistic       600ms           Permanent actions
(delete, revoke)    Server confirms   Deliberate      need deliberation.

Standard            Optimistic        200ms           Low stakes.
(like, save)        UI updates first  Snappy          Rolls back on error.

Local               Immediate         100ms           No server.
(toggle, expand)    No round-trip     Instant         Pure client state.
```

---

## Animation Physics

How movement feels.

```
EFFECT              EASING            SPRING          WHY
────────────────────────────────────────────────────────────────────

Financial           ease-out          —               Deliberate weight
                    800ms                             communicates gravity.

Standard            spring            500, 30         Snappy, organic.
                    200ms                             Feels alive.

Local               spring            700, 35         Instant, direct.
                    100ms                             No waiting.

High-frequency      none              —               Best animation is
                    0ms                               no animation.
```

---

## Material Physics

How surfaces communicate.

```
SURFACE             SHADOW      BORDER      RADIUS      GRIT
────────────────────────────────────────────────────────────────────

Elevated            soft        subtle      8-12px      Clean
(cards, dialogs)    1 layer     or none

Glass               lg + blur   white/20    12-16px     Clean
(overlays)          depth       subtle

Flat                none        optional    4-8px       Clean
(minimal)           —           or none

Retro               hard        solid 2px   0px         Pixel
(games)             offset      chunky      sharp
```

**Fidelity ceiling**: gradients ≤2 stops, shadows ≤1 layer, radius ≤16px.

---

## The Mental Model

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   What you say              Sigil infers            You get     │
│   ─────────────             ────────────            ───────     │
│                                                                 │
│   "claim button"       →    Behavioral: financial    →  800ms   │
│                             Animation: ease-out         confirm │
│                             Material: elevated          shadow  │
│                                                                 │
│   "snappy like         →    Behavioral: standard     →  200ms   │
│    button"                  Animation: spring           bounce  │
│                             Material: flat              minimal │
│                                                                 │
│   "retro pixel         →    Behavioral: local        →  100ms   │
│    toggle"                  Animation: none             sharp   │
│                             Material: retro             grit    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

One input. Three physics layers. Unified feel.

---

## Installation

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
curl -fsSL https://sigil.dev/install | bash
```

Adds rules to `.claude/rules/`, skills to `.claude/skills/`. Your `CLAUDE.md` stays untouched.

### Optional: Visual Validation

Install [agent-browser](https://github.com/vercel-labs/agent-browser) for automated visual checks:

```bash
npm install -g agent-browser
agent-browser install          # Download Chromium
# Linux: agent-browser install --with-deps
```

When installed, `/ward` validates protected capabilities visually:
- Touch targets (≥44px minimum)
- Focus rings (visible on keyboard nav)
- Screenshots for physics comparison

```bash
/ward http://localhost:3000    # Runs visual + code checks
```

---

## Commands

| Command | Purpose |
|---------|---------|
| `/craft` | Apply physics to any UX-affecting change (new, refine, configure, polish) |
| `/ward` | Audit codebase against physics (violations, performance, protected capabilities) |
| `/garden` | Health report on component authority (Gold/Silver/Draft tiers) |
| `/style` | Material only (looks wrong, behavior fine) |
| `/animate` | Animation only (movement feels off) |
| `/behavior` | Behavioral only (timing/sync wrong) |
| `/distill` | Break feature into craft-able components |
| `/inscribe` | Promote patterns to rules |

---

## Usage

```
/craft "claim button"                    # Generate new component
/craft "improve light mode readability"  # Refine configuration
/craft "polish hover states"             # Batch polish across files
/craft "optimize loading UX"             # Data pattern refinement
/ward                                    # Audit full codebase
/ward physics                            # Audit physics only
/garden                                  # Component authority report
```

Before generating, Sigil shows its analysis:

```
┌─ Physics Analysis ─────────────────────────────────────┐
│                                                        │
│  Component:    ClaimButton                             │
│  Effect:       Financial mutation                      │
│                                                        │
│  Behavioral    pessimistic, 800ms, confirmation        │
│  Animation     ease-out, deliberate, non-interruptible │
│  Material      elevated, soft shadow, 8px radius       │
│                                                        │
│  Protected:    ✓ cancel  ✓ error recovery  ✓ 44px     │
│                                                        │
└────────────────────────────────────────────────────────┘

Proceed? (yes / or describe what's different)
```

If wrong, correct it. Sigil learns from your feedback.

---

## Pair Design

Sigil works like two people at a whiteboard — one sketching, one reacting.

```
/craft "claim button"
→ "feels too corporate"
→ [adjusts]
→ "warmer, but the timing is off"
→ /behavior
→ "yes, that's it"
→ [logs to taste, done]
```

**The conversation is the loop.** You work on a component, iterate until it feels right, maybe notice something about another component along the way, work on that. Discoveries happen while doing.

This isn't a queue you grind through overnight. It's a creative session where:

- **You** bring taste, context, persona, GTM instincts
- **Sigil** brings physics vocabulary and memory

When Sigil asks "Does this feel right?", it's prompting you to think about your user:

- Who is clicking this?
- What's the moment?
- What should they feel?

Your answers — even vague ones like "feels heavy" or "too clinical" — teach the sigil.

**When to start fresh:**
- Context gets muddy
- Drifted into unrelated territory
- Just feels off

That's just a new conversation. No ceremony needed.

---

## Taste

Your accumulated preferences across all physics layers.

```
Session 1:  You change 800ms → 500ms              (behavioral)
Session 2:  You change ease-out → spring          (animation)
Session 3:  You change soft shadow → none         (material)
Session 4:  Sigil applies all three automatically
```

Corrections weight 5x. Usage is feedback. Taste is physics personalized.

**`/inscribe`** graduates patterns to permanent rules when they're solid enough.

---

## Protected Capabilities

Some things must always work:

| Capability | Rule |
|------------|------|
| Withdraw | Always reachable |
| Cancel | Always visible |
| Touch target | ≥44px minimum |
| Focus ring | Always visible |
| Error recovery | Always possible |

Sigil enforces these. You can override with justification.

---

## Philosophy

**Effect is truth.** What the code *does* determines behavioral physics. What it *is* determines material physics. Both determine feel.

**Feel over implementation.** You think in feel ("trustworthy", "snappy", "glassmorphism"). Sigil translates to physics.

**Taste is personal physics.** Usage is feedback. Accept, modify, or reject. Corrections teach more than silence.

**Visible reasoning.** Sigil shows its analysis before generating. You can correct before wasted effort.

**Physics is unified.** Behavioral, animation, and material aren't separate concerns—they're three layers of the same thing: how products make people feel.

---

## Loa Integration

Sigil is designed to work with [Loa](https://github.com/0xHoneyJar/loa).

**The division of labor:**

| Loa (Architecture) | Sigil (Physics) |
|-------------------|-----------------|
| "What to build" | "How it feels" |
| PRD → SDD → Sprint | Craft → Iterate → Inscribe |
| Spec'd upfront | Emerges through iteration |
| Deterministic | Creative |

**The handoff:**

```
Loa workflow                     Sigil takes over
────────────────────────────────────────────────────
/plan-and-analyze → PRD
/architect → SDD
/sprint-plan → Tasks
                    ↓
              "implement checkout UI"
                    ↓
              /distill → components with physics hints
                    ↓
              /craft each component
                    ↓
              iterate until right
                    ↓
              /inscribe when patterns solidify
```

**Why the split:**

Architecture can be spec'd upfront — data models, APIs, dependencies. These are deterministic.

Feel cannot be fully spec'd. You know "trustworthy" when you see it, but you can't describe it completely in advance. Feel emerges through iteration — observe, tune, repeat.

Loa plans structure. Sigil tunes feel. They meet at the component boundary.

---

## Links

- [GitHub](https://github.com/0xHoneyJar/sigil)
- [Issues](https://github.com/0xHoneyJar/sigil/issues)
- [Loa Framework](https://github.com/0xHoneyJar/loa)
- [Loa Construct Registry](https://constructs.network)

---

## What's New in v2.2.0

This release introduces the **Sigil Feedback Loops System**:

- ✨ **`/observe`** — Capture user research observations during testing
- ✨ **`/taste-synthesize`** — Analyze taste signals and extract patterns
- ✨ **`/ward-all`** — Comprehensive physics audit across all components
- 🔧 **Sigil Toolbar** — Browser extension for real-time physics detection
- 📊 **Enhanced taste schema** — Diagnostics, source tracking, learning inference

See [CHANGELOG.md](CHANGELOG.md) for full release notes.

---

*v2.2.0 "Feedback Loops"*
