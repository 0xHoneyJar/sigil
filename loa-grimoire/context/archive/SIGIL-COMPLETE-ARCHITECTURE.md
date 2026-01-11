# Sigil v4: Complete Architecture Specification

> "Physics, not opinions. Constraints, not debates."
> 
> A Design Physics Engine for AI-assisted product development.

**Version**: 4.0.0
**Date**: 2026-01-05
**Status**: Implementation Ready

---

# Part I: Foundation

## 1. What Sigil Is

Sigil is a design context framework that gives AI agents the physics they need to make consistent design decisions. Unlike traditional design systems that document patterns, Sigil enforces physics—immutable laws that cannot be violated.

### The Problem

When building UI with AI agents, design consistency breaks down because:
- No component visibility (hard to discover what exists)
- Design knowledge loss (why decisions were made)
- Inconsistent patterns (same problems solved differently)
- Agent-human context loss (Claude lacks design context)
- Single-developer drift (inconsistency even with one person)

### The Solution

Sigil captures product "taste" as:
- **Immutable physics** (core constraints)
- **Tunable parameters** (product-specific resonance)
- **Era-versioned memory** (decisions in context)
- **Single authority** (Taste Key holder)

### The Anti-Beads Promise

Sigil will NEVER:
- Run a background daemon
- Hijack git hooks
- Use a database (SQLite, etc.)
- Require migrations
- Auto-delete content
- Create hidden branches

**To remove Sigil**: `rm -rf sigil-mark/` — Done.

---

## 2. Core Philosophy

### 2.0 Domain Boundary: Sigil vs Loa

Sigil and Loa share a scene graph but own different questions:

| Question | Owner | Examples |
|----------|-------|----------|
| "Does it feel right?" | **Sigil** | Animation timing, copy tone, visual rhythm |
| "Does it work correctly?" | **Loa** | Bug fixes, API logic, test coverage |
| "Why does this feel off?" | **Sigil** | Diagnose qualitative complaints |
| "Why is this broken?" | **Loa** | Diagnose quantitative errors |

**Inputs to Sigil**:
- User feedback: "checkout feels slow", "button is confusing"
- Analytics patterns: "conversion dropped" → is it a feel issue?
- Copy/content: tone, messaging, clarity
- Design work: components, flows, motion

**Handoff to Loa**:
When Sigil diagnoses "feels slow because API takes 3s" — the fix is Loa's domain.

```yaml
# Sigil handoff to Loa
handoff:
  from: sigil
  to: loa
  node: checkout/payment/ClaimButton
  diagnosis: "Feels sluggish - API latency (3s), not animation"
  sigil_constraints:
    zone: critical
    note: "Cannot use optimistic UI here"
```

### 2.1 Physics Over Law

The agent respects physics (tick rate, sync model), not statutes. You can't exceed the speed of light. You can't show state before the server confirms in a server-authoritative zone.

### 2.2 Eras Over Precedents

Decisions are versioned. What was true in Era 1 ("animation is latency") may be false in Era 2 ("animation aids retention"). History informs, not constrains.

### 2.3 Taste Key Over Council

One person holds the key. They dictate execution, not a committee. "Quality doesn't come from committees... it comes from individuals with taste." — Karri Saarinen

### 2.4 Mutations Over Compliance

Breaking precedent is allowed in sandbox. Experiments either become canon (promoted) or training data (graveyard).

### 2.5 Resonance Over Strategy

The product "feels right" because physics align—not because of strategic documentation.

---

## 3. Inspirations

### 3.1 Old School RuneScape (OSRS)

**Key Lessons**:
- The 600ms tick isn't lag—it's the RHYTHM
- The Mod Ghost Rule: "Better graphics" that don't match the product's soul are WORSE
- 117HD as Lens, not replacement (HD/SD coexistence)
- Poll concepts, dictate execution
- Community stewardship with supermajority (70%) for changes

**What Sigil Adopted**:
- Temporal Governor (discrete tick as design material)
- Fidelity Ceiling (technical superiority ≠ resonance)
- Lens Registry (HD and SD coexist)
- Greenlight vs Execute separation

### 3.2 Linear

**Key Lessons**:
- "Spinners mean broken architecture" — Don't bandaid, fix root cause
- Local-first = optimistic lies that create flow
- Issues not User Stories (speed of input)
- Ignore feedback that doesn't align with vision
- Quality is removing the non-essential

**What Sigil Adopted**:
- Hammer tool (diagnose before solving)
- Machinery material (instant, no animation)
- Creative friction (say no to wrong users)
- The Linear Test for diagnostics

### 3.3 Uniswap

**Key Lessons**:
- Immutable core, extensible hooks
- Protocol vs Interface separation
- Abstraction of complexity as design
- Unix philosophy of modularity

**What Sigil Adopted**:
- Core layer (immutable physics)
- Resonance layer (tunable)
- Clean separation of concerns

### 3.4 Uber Base

**Key Lessons**:
- Design System Observability (compliance as metric)
- Treat design like server uptime
- Base Adoption Rate dashboards
- Typography as identity (Uber Move)

**What Sigil Adopted**:
- Budgets as enforcement
- Validation as metric
- /garden for entropy detection

---

# Part II: Layer Architecture

## 4. The Four Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TASTE KEY                                    │
│  Single holder with absolute authority over visual execution.       │
│  Polls concepts. Dictates craft. Cannot be overridden by vote.      │
└─────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────────┐
│                         MEMORY                                       │
│  Era-versioned decisions. What worked, what didn't, in context.     │
│  NOT case law. Historical record that informs, not constrains.      │
└─────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────────┐
│                        RESONANCE                                     │
│  Product-specific tuning. Materials, zones, tensions.               │
│  How the physics manifest in THIS product.                          │
└─────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────────┐
│                          CORE                                        │
│  Immutable physics. Tick rate. Sync model. Budgets. Fidelity.       │
│  The ONLY things that cannot be broken.                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Core Layer (Immutable)

### 5.1 Temporal Governor

Time is a design material, not just a technical constraint.

**Discrete Tick (Ritual Mode)**:
```yaml
rate_ms: 600
feel: "Heavy, rhythmic, ceremonial"
ui_behavior: "UI waits for tick. Delay validates the action."
example: "OSRS combat, bank transactions, claim operations"
rule: "The delay IS the trust"
```

**Continuous (Tool Mode)**:
```yaml
rate_ms: 0
feel: "Instant, fluid, seamless"
ui_behavior: "Optimistic updates. UI lies to create flow."
example: "Linear task creation, Figma canvas, settings toggles"
rule: "The lie IS the speed"
```

### 5.2 Sync Authority

**Server Authoritative**:
- Server is truth. Client waits for confirmation.
- NO optimistic updates. Ever.
- Zones: critical, financial, inventory
- Violation: PHYSICS_VIOLATION — Cannot be overridden

**Client Authoritative**:
- Client is truth. Server syncs eventually.
- Optimistic updates expected. UI lies.
- Zones: transactional, exploratory

### 5.3 Budgets (Inflation Guardrails)

Fidelity ceiling prevents "too good." Budgets prevent "too much."

**Cognitive Budget**:
```yaml
interactive_elements:
  critical: 5       # High-stakes = focused
  transactional: 12 # Work = efficient
  exploratory: 20   # Browse = abundant
violation: "BUDGET_EXCEEDED — Cognitive overload"
```

**Visual Budget**:
```yaml
animation_count:
  critical: 1       # One thing moves, user focuses
  transactional: 3
  exploratory: 5
color_count: 5      # Distinct hues per view
depth_layers: 4     # Z-index layers max
```

**Complexity Budget**:
```yaml
props_per_component: 10
variants_per_component: 12
dependencies_per_component: 8
```

### 5.4 Fidelity Ceiling (Mod Ghost Rule)

Technical superiority is NOT justification for breaking resonance.

```yaml
ceiling:
  gradients: { max_stops: 2 }
  shadows: { max_layers: 3 }
  animation: { max_duration_ms: 800 }
  blur: { max_radius_px: 16 }
  border_radius: { max_px: 24 }
```

**Agent Rule**: "It is not enough to make good art; the art must match the product's soul."

### 5.5 Lens Registry

HD and SD coexist without fighting.

**Vanilla** (Gold Standard):
- Core fidelity, baked lighting, original textures
- Default experience, always works

**High Fidelity** (117HD Style):
- Dynamic lighting, shadows, post-processing
- User opt-in only
- Cannot change geometry, only rendering

**Utility** (RuneLite Style):
- Overlays, tile markers, data visualization
- Power user opt-in
- Additive only

**Accessibility**:
- High contrast, larger text, reduced motion
- Overrides other lenses

**Rule**: "NEVER bake lens features into core assets. Core is truth. Lens is experience."

---

## 6. Resonance Layer (Tunable)

### 6.1 Essence (Product Soul)

Captured via `/envision` interview:
- Reference products (games, apps, physical)
- Feel descriptors by context
- Anti-patterns (what to avoid)
- Key moments (high-stakes, celebrations, recovery)

### 6.2 Materials

Materials are physics configurations, not themes.

**Clay**:
```yaml
physics: { light: diffuse, weight: heavy, motion: spring, feedback: depress }
feel: "Things made of clay have weight. They resist. They confirm."
spring_config: { stiffness: 120, damping: 14 }
zone_affinity: [critical, celebration]
when_to_use: "High-stakes actions, irreversible operations, success celebrations"
```

**Machinery**:
```yaml
physics: { light: flat, weight: none, motion: instant, feedback: highlight }
feel: "Machinery has no personality. It has function."
spring_config: null  # No spring, instant
zone_affinity: [transactional, admin]
when_to_use: "High-frequency actions, admin interfaces, power user workflows"
```

**Glass**:
```yaml
physics: { light: refract, weight: weightless, motion: ease, feedback: glow }
feel: "Glass elements float above the surface."
spring_config: { stiffness: 200, damping: 20 }
zone_affinity: [exploratory, marketing]
when_to_use: "Modals, overlays, browse/discovery, marketing pages"
```

### 6.3 Zones

Zones are physics contexts, not folders.

**Critical Zone**:
```yaml
physics:
  sync: server_authoritative
  tick: discrete
  material: clay
rules:
  - "Server confirms before state changes"
  - "Pending state is always visible"
  - "No optimistic updates (PHYSICS VIOLATION)"
  - "No skeleton loading (use text pending state)"
paths: ["**/checkout/**", "**/claim/**", "**/trade/**", "**/wallet/**"]
budgets: { interactive_elements: 5, animations: 1, decisions: 2 }
tensions: { weight: 80, speed: 30, playfulness: 20 }
```

**Transactional Zone**:
```yaml
physics:
  sync: client_authoritative
  tick: continuous
  material: machinery
rules:
  - "Optimistic updates expected"
  - "No loading states (pre-fetch)"
  - "Instant feedback"
  - "Keyboard-first navigation"
paths: ["**/dashboard/**", "**/settings/**", "**/admin/**", "**/tasks/**"]
budgets: { interactive_elements: 12, animations: 3, decisions: 5 }
tensions: { weight: 20, speed: 95, playfulness: 30 }
```

**Exploratory Zone**:
```yaml
physics:
  sync: client_authoritative
  tick: continuous
  material: glass
rules:
  - "Animation aids orientation"
  - "Skeleton loading acceptable"
  - "Spring physics for delight"
paths: ["**/browse/**", "**/discover/**", "**/search/**", "**/gallery/**"]
budgets: { interactive_elements: 20, animations: 5, decisions: 10 }
tensions: { weight: 50, speed: 60, playfulness: 70 }
```

### 6.4 Tensions (Sliders)

Continuous tuning knobs, not binary switches.

```yaml
playfulness: [0-100]  # Serious ↔ Fun
weight: [0-100]       # Light ↔ Heavy
density: [0-100]      # Spacious ↔ Dense
speed: [0-100]        # Slow ↔ Fast
clarity: [0-100]      # Lore ↔ Utility (for copy)
```

---

## 7. Memory Layer (Versioned)

### 7.1 Eras

```yaml
era:
  id: 2
  name: "The Warmth Era"
  started: "2025-06-01"
  context:
    - "Airbnb reintroduces skeuomorphism"
    - "Flat design fatigue"
  truths:
    - "Animation aids retention"
    - "Depth communicates hierarchy"
  deprecated:
    - statement: "Animation is latency"
      was_true_in: "era_1"
```

### 7.2 Decisions

```yaml
decision:
  id: "loading-states"
  rulings:
    - era: 1
      verdict: "skeleton"
    - era: 2
      verdict: "text-pending-in-critical"
      context: "Skeletons confused users in critical zones"
```

### 7.3 Mutations

Experimental sandbox for breaking precedent:

```yaml
mutation:
  id: "bouncy-claim-button"
  breaks: "deliberate-timing decision"
  status: "dogfooding"
  expires: "2026-01-12"
  success_criteria:
    - "Completion rate >= 94%"
    - "Trust score >= 4.0"
```

Survivors → promoted to canon. Failures → graveyard (training data).

### 7.4 Progress (Simple Tracking)

```markdown
## Active Sprint
- [ ] Task 1
- [x] Task 2 (2026-01-05)

## Decisions Log
| Date | Decision | Zone | Rationale |
|------|----------|------|-----------|
```

No database. No daemon. Just markdown.

---

## 8. Taste Key (Authority)

### 8.1 Single Owner

```yaml
taste_key:
  holder: "@username"
  authority:
    absolute: ["visual execution", "animation", "color"]
    cannot_override: ["core physics", "fidelity ceiling"]
```

### 8.2 Decision Process

**Greenlight**: Concept approval (polled or founder)
- "Should we build dark mode?"
- Community or founder decides

**Execution**: How it looks/feels (NOT polled)
- "What color is dark mode?"
- Taste Key holder only

**Integrity**: Maintenance, balance, bugs
- Engineering team, no approval needed

---

# Part III: Command System

## 9. The 8 Commands

| # | Command | Purpose | Output |
|---|---------|---------|--------|
| 1 | `/envision` | Capture product essence | essence.yaml |
| 2 | `/codify` | Define material physics | materials.yaml |
| 3 | `/map` | Define zones and paths | zones.yaml |
| 4 | `/craft` | Generate with Hammer/Chisel | Code + guidance |
| 5 | `/validate` | Check violations | Report |
| 6 | `/garden` | Detect entropy | Drift report |
| 7 | `/approve` | Taste Key rulings | Ruling record |
| 8 | `/greenlight` | Concept approval | Greenlight record |

### Workflow

```
SETUP:    /envision → /codify → /map
BUILD:    /greenlight → /craft → /validate → /approve
MAINTAIN: /garden
```

---

## 10. The Craft Toolkit

### 10.1 Hammer (Diagnose + Route)

**Purpose**: Find ROOT CAUSE before solving

**Method**: AskUserQuestion loop to investigate

**Triggers**:
- Ambiguous symptoms ("feels slow", "doesn't feel right")
- Questions about approach
- New component creation

**Outcomes**:
- "This IS a UI issue" → Hand off to Chisel
- "This is structural" → Generate Loa handoff
- "This needs Taste Key input" → Route to /approve

### 10.2 Chisel (Execute)

**Purpose**: Refine aesthetics AFTER root cause is understood

**Method**: Quick execution, minimal ceremony

**Triggers**:
- Clear aesthetic fix ("adjust padding", "change timing")
- Explicit values ("make it 4px", "200ms animation")
- Iteration after Hammer diagnosis

### 10.3 The Linear Test

```
User: "The claim button feels slow"

❌ FAIL: Immediately add skeleton loader
❌ FAIL: Add optimistic UI without checking zone
✓ PASS: Ask "What kind of slow?"
✓ PASS: Diagnose root cause (UI vs infra)
✓ PASS: Check zone temporal physics
✓ PASS: Route correctly (Chisel vs Loa)
```

### 10.4 Loa Handoff

When issue is structural (not UI):

```yaml
handoff:
  from: sigil
  to: loa
  problem:
    symptom: "Claim button feels laggy"
    diagnosis: "Envio indexer latency (3-4s)"
  investigation:
    questions_asked:
      - q: "What kind of lag?"
        a: "Takes too long to confirm"
  constraints:
    zone: "critical"
    sync: "server_authoritative"
    physics_note: "Cannot use optimistic UI in this zone"
  target:
    current: "3-4s confirmation"
    goal: "<500ms confirmation"
```

---

## 11. Violation Hierarchy

| Type | Severity | Override | Example |
|------|----------|----------|---------|
| Physics | IMPOSSIBLE | None | Optimistic UI in server_authoritative |
| Budget | BLOCK | Taste Key | 12 elements in critical zone (max 5) |
| Fidelity | BLOCK | Taste Key | 4 gradient stops (max 2) |
| Drift | WARN | None needed | Clay physics in transactional zone |

---

# Part IV: Directory Structure

## 12. File Layout

```
sigil-mark/
├── core/                    # IMMUTABLE
│   ├── sync.yaml            # Temporal Governor + Authority
│   ├── budgets.yaml         # Cognitive, Visual, Complexity
│   ├── fidelity.yaml        # Mod Ghost Rule (ceiling)
│   └── lens.yaml            # Rendering layers (HD/SD)
│
├── resonance/               # TUNABLE
│   ├── essence.yaml         # Product soul
│   ├── materials.yaml       # Clay, Machinery, Glass
│   ├── zones.yaml           # Zone definitions + paths
│   └── tensions.yaml        # Tuning sliders
│
├── memory/                  # VERSIONED
│   ├── eras/                # Era definitions
│   ├── decisions/           # Era-versioned decisions
│   ├── mutations/active/    # Current experiments
│   ├── graveyard/           # Failed experiments
│   └── progress.md          # Simple task tracking
│
├── taste-key/               # AUTHORITY
│   ├── holder.yaml          # Who holds the key
│   └── rulings/             # Recorded rulings
│
├── context/                 # CROSS-FUNCTIONAL
│   ├── gtm/messaging.md     # GTM messaging context
│   ├── mrd/insights.md      # Market requirements
│   └── NOTES.md             # Refinement session notes
│
└── .sigil/                  # MACHINERY
    ├── commands/            # 8 command definitions
    ├── skills/              # Agent skills
    └── scripts/             # mount.sh
```

---

# Part V: Extensions (Future)

## 13. Cross-Context Integration

Hammer loads GTM/MRD context during diagnosis for copy decisions.

```
/craft "Design claim page banner"

GTM CONTEXT LOADED:
- Value prop: "Turn idle game assets into yield"
- Tone: "Clear over clever"
- Don'ts: "Harvest", "Journey", "Magical"

OUTPUT: "Claim Your Earned Tokens" (not "Harvest Your Magical Rewards")
```

## 14. Territory-Specific Handoffs

Known structural territories with specific context:

| Territory | Trigger | Context |
|-----------|---------|---------|
| Indexer | "Data stale" | Envio config, latency |
| RPC/Chain | "Transaction slow" | Chain, endpoints |
| Auth | "Wallet disconnect" | Provider, session |
| Cache | "Images slow" | CDN strategy |

## 15. Loa Constructs Distribution

Sigil as a distributable construct:

```bash
/loa-constructs install sigil-core           # Free
/loa-constructs install sigil-pack-gamefi    # Pro
/loa-constructs install sigil-pack-saas      # Pro
```

## 16. Contribution Model

```
sigil/
├── core/           # Core team maintained
└── community/      # Open contributions
    ├── materials/  # obsidian, silk, metal
    ├── recipes/    # useConfettiDrop
    ├── zones/      # content zone for blogs
    └── lenses/     # retro-crt aesthetic
```

---

# Part VI: Vision — The Sigil Workbench

## 17. The Ultimate Interface

A real-time design environment like Figma, but for code.

### 17.1 Layout (tmux-based)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SIGIL WORKBENCH                              │
├─────────────────────────────┬───────────────────────────────────────┤
│                             │                                       │
│      CLAUDE PANEL           │         CHROME VIEW                   │
│                             │                                       │
│  /craft ClaimButton         │    [Live Preview of Component]        │
│                             │                                       │
│  🔨 HAMMER: Diagnosing...   │    ┌───────────────────────────┐      │
│                             │    │                           │      │
│  Q: What kind of slow?      │    │    [ Claim 1,234 TOKENS ] │      │
│  > Takes too long to        │    │                           │      │
│    confirm                  │    │    Pending...             │      │
│                             │    │                           │      │
│  Zone: critical             │    └───────────────────────────┘      │
│  Material: clay             │                                       │
│  Physics: discrete tick     │                                       │
│                             │                                       │
├─────────────────────────────┼───────────────────────────────────────┤
│      TENSIONS PANEL         │         VALIDATION PANEL              │
│                             │                                       │
│  Playfulness ████░░░░ 40    │  ✓ Physics: PASS                      │
│  Weight      ████████ 80    │  ✓ Budgets: 3/5 elements              │
│  Speed       ██░░░░░░ 30    │  ✓ Fidelity: Within ceiling           │
│  Clarity     █████████ 90   │  ⚠ Drift: None                        │
│                             │                                       │
│  [Reset Zone] [Override]    │  [Run /validate] [Show Details]       │
│                             │                                       │
└─────────────────────────────┴───────────────────────────────────────┘
```

### 17.2 Real-Time Feedback Loop

```
1. Developer types in Claude panel
2. Claude generates/modifies component
3. Chrome view updates live (hot reload)
4. Tensions panel shows current values
5. Validation panel shows violations
6. Developer adjusts via Chisel
7. Repeat until approved
```

### 17.3 No Tab Switching

Everything visible at once:
- **Claude Panel**: Conversation, commands, Hammer/Chisel
- **Chrome View**: Live component preview
- **Tensions Panel**: Visual sliders for current zone
- **Validation Panel**: Real-time violation checking

### 17.4 Scoring System

Real-time component scoring:

```
┌─────────────────────────────────────────────────────────────────────┐
│  COMPONENT SCORE: ClaimButton                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Physics Alignment     ████████████████████ 100%                    │
│  Budget Compliance     ████████████░░░░░░░░  60%  (3/5 elements)    │
│  Fidelity Ceiling      ████████████████████ 100%                    │
│  Material Resonance    ██████████████████░░  90%                    │
│  Zone Appropriateness  ████████████████████ 100%                    │
│                                                                     │
│  OVERALL: 90/100 — Ready for /approve                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

# Part VII: Success Criteria

## 18. Implementation Checklist

- [ ] Temporal Governor enforced (discrete zones wait, continuous zones lie)
- [ ] Budgets enforced (cognitive budget blocks "too many elements")
- [ ] Hammer investigates (never jumps to solution)
- [ ] Chisel executes fast (no investigation for clearly aesthetic)
- [ ] Loa handoffs work (structural issues generate context)
- [ ] Physics block impossible (cannot generate violations)
- [ ] 8 commands only (no command creep)
- [ ] Single Taste Key (no committee language)
- [ ] Era-versioned (decisions tagged with era)
- [ ] No daemon, no database, no hooks

## 19. The Final Test

```bash
# To install Sigil:
./mount.sh

# To use Sigil:
/envision → /codify → /map → /craft → /validate → /approve

# To remove Sigil:
rm -rf sigil-mark/
# Done.
```

---

# Appendix A: Key Quotes

> "The delay IS the trust." — OSRS Temporal Philosophy

> "The lie IS the speed." — Linear Optimistic UI

> "Quality doesn't come from committees... it comes from individuals with taste." — Karri Saarinen

> "Technical superiority is NOT justification for breaking resonance." — Mod Ghost Rule

> "A screen with 50 perfect buttons is still bad design." — Budget Philosophy

> "470,000 lines of Go vs `mkdir .tickets && vim`" — Anti-Beads Principle

---

# Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Temporal Governor** | System that enforces time as design material |
| **Fidelity Ceiling** | Maximum visual complexity allowed in core |
| **Material** | Physics configuration (clay, machinery, glass) |
| **Zone** | Path-based physics context |
| **Tension** | Continuous tuning slider (0-100) |
| **Era** | Time-bounded design context |
| **Mutation** | Experimental pattern in sandbox |
| **Taste Key** | Single authority over visual execution |
| **Hammer** | Diagnostic tool that investigates before solving |
| **Chisel** | Execution tool for quick aesthetic fixes |
| **Lens** | Optional rendering layer (HD, utility, accessibility) |
| **Resonance** | Product-specific tuning of physics |

---

*End of Sigil v4 Architecture Specification*
