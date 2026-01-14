# Sigil

Design physics for AI code generation.

```
$ curl -fsSL https://sigil.dev/install | bash
> /craft "claim button"
```

---

## Why "Sigil"

A sigil is a symbol that holds intention. You speak a desire, condense it into a mark, and the mark carries the meaning forward.

That's what this does. You speak in feel — "trustworthy", "snappy", "glassy". Sigil condenses it into physics — timing, easing, surface. The physics carry the feel into code.

Use it, and it learns. Accept a generation, and the sigil remembers. Modify it, and the sigil adapts. Over time, your sigil becomes yours — a condensed symbol of your taste that generates physics matching your intent.

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

```bash
curl -fsSL https://sigil.dev/install | bash
```

Adds rules to `.claude/rules/`. Your `CLAUDE.md` stays untouched.

---

## Usage

```
/craft "claim button"              # All three physics layers
/craft "snappy like button"        # Adjectives inform physics
/craft "glassmorphism card"        # Material keywords detected
/craft "retro pixel badge"         # Grit signature applied
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

## Taste

Your accumulated preferences across all physics layers.

```
Session 1:  You change 800ms → 500ms              (behavioral)
Session 2:  You change ease-out → spring          (animation)
Session 3:  You change soft shadow → none         (material)
Session 4:  Sigil applies all three automatically
```

Corrections weight 5x. Usage is feedback. Taste is physics personalized.

---

## From Task to Queue

Got a feature, not a component? Use `/distill` to extract the craft-able pieces.

```
/distill "implement mobile checkout flow"

┌─ Distilled: Mobile Checkout Flow ─────────────────────┐
│                                                       │
│  Touchpoints found:  8                                │
│  Components extracted:  6                             │
│                                                       │
│  Effect Distribution:                                 │
│    Financial:    2 (cart total, pay CTA)              │
│    Standard:     2 (address form, shipping)           │
│    Local:        1 (payment toggle)                   │
│    Query:        1 (order summary)                    │
│                                                       │
└───────────────────────────────────────────────────────┘

## Queue (Ready for CRAFT.md)

- [ ] cart total display — financial, always accurate, pessimistic
- [ ] pay now button — financial, 800ms, confirmation, elevated
- [ ] address form — standard, optimistic, inline validation
- [ ] shipping selector — standard, radio group, immediate
- [ ] payment method toggle — local, accordion, touch-friendly
- [ ] order summary — query, skeleton loading, pull-to-refresh
```

**Bridges architecture → physics.** If using Loa for PRD/SDD, `/distill` takes sprint tasks and extracts the components with physics hints.

---

## Ralph Mode

For continuous generation, Sigil supports [Ralph-style loops](https://ghuntley.com/ralph/) — one component per loop, tune until consistent.

**The Loop:**
```bash
while :; do cat CRAFT.md | claude-code ; done
```

**Key principle:** One thing per loop. Trust eventual consistency.

**CRAFT.md structure:**
```markdown
## Queue           ← What to build (pick ONE per loop)
## Signs           ← Instructions to prevent known failures
## Backpressure    ← Acceptance criteria (rejects bad generations)
## Learnings       ← Temporary observations (inform next loops)
```

**The HOTL (Human On The Loop):**

Design can't be fully spec'd upfront like architecture. Feel emerges through iteration. Your job:

```
WATCH    → Observe /craft output for physics mistakes
TUNE     → Add sign when Ralph fails ("financial timing: 600ms")
THROW    → Delete Learnings when it goes off rails, re-loop
INSCRIBE → Run /inscribe when patterns solidify (3+ times)
```

**Signs prevent failures:**

When Ralph makes a mistake, you add a sign — like putting "SLIDE DOWN, DON'T JUMP" next to the slide. Future loops read the signs.

```markdown
## Signs
### Timing
- financial should be 600ms not 800ms

### Animation
- prefer springs over ease-out for interactive
```

**The Cycle:**
```
Loop 1: /craft "claim button" → 800ms feels slow
        → HOTL adds sign: "financial: 600ms"
        → Fail backpressure, loop

Loop 2: /craft "claim button" → reads sign, uses 600ms
        → Pass backpressure
        → Mark [x], commit

Loop 3: /craft "like button" → correct (taste.md)
        → Mark [x], commit

Loop 4: Queue empty → /inscribe → 600ms becomes permanent
```

**`/inscribe`** promotes learnings to rules:
```
/inscribe

Found 3 learnings to inscribe:
• Adjust financial timing 800ms → 600ms? (y/n)
• Add "harvest" to financial keywords? (y/n)

The sigil is inscribed. Future /craft carries these marks forward.
```

Each failed loop teaches. Each `/inscribe` makes the teaching permanent.

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

Sigil is designed to work with [Loa](https://github.com/0xHoneyJar/loa) and will be available as a construct on [Loa Constructs](https://constructs.network).

**The division of labor:**

| Loa (Architecture) | Sigil (Physics) |
|-------------------|-----------------|
| "What to build" | "How it feels" |
| PRD → SDD → Tasks | Distill → Craft → Inscribe |
| Plan once, execute | Loop until right |
| Deterministic | Iterative |

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
              /distill → Queue
                    ↓
              Ralph loop → /craft × N
                    ↓
              /inscribe → taste persists
```

**Why the split:**

Architecture can be spec'd upfront — data models, APIs, dependencies. These are deterministic.

Feel cannot be fully spec'd. You know "trustworthy" when you see it, but you can't describe it completely in advance. Feel emerges through iteration — loop, observe, tune, loop.

Loa plans structure. Sigil tunes feel. They meet at the task/component boundary.

---

## Links

- [GitHub](https://github.com/0xHoneyJar/sigil)
- [Issues](https://github.com/0xHoneyJar/sigil/issues)
- [Loa Framework](https://github.com/0xHoneyJar/loa)
- [Loa Constructs](https://constructs.network)

---

*v12.7.0*
