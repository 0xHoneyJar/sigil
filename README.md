# Sigil

[![Version](https://img.shields.io/badge/version-4.0.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-AGPL--3.0-green.svg)](LICENSE.md)
[![Release](https://img.shields.io/badge/release-Unified_Sigil_Architecture-purple.svg)](https://github.com/0xHoneyJar/sigil/releases/tag/v4.0.0)

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

## Observability Loop

Sigil closes the loop from user feedback to visible improvements:

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   1. ANNOTATE                     2. OBSERVE                 │
│   ───────────                     ──────────                 │
│   User clicks UI issue            Patterns detected          │
│   via Agentation                  across feedback            │
│                                                              │
│        ↓                               ↓                     │
│                                                              │
│   3. IMPLEMENT                    4. COMMUNICATE             │
│   ────────────                    ─────────────              │
│   /craft addresses                /changelog generates       │
│   the pattern                     user-facing update         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Agentation Integration

Install [Agentation](https://agentation.dev) for visual UI annotation:

```bash
npm install agentation
npx add-skill benjitaylor/agentation
```

Add to your React app:

```tsx
import { Agentation } from 'agentation'

{process.env.NODE_ENV === 'development' && <Agentation />}
```

Use the 📌 button in the Sigil HUD to toggle annotation mode.

### Workflow

1. **Annotate**: Click UI elements to capture selectors
2. **Observe**: Paste into Claude Code → `/observe parse`
3. **Synthesize**: Patterns detected across observations
4. **Implement**: `/craft` with observation context
5. **Communicate**: `/changelog` generates user-facing copy

### Key Commands

| Command | Purpose |
|---------|---------|
| `/observe` | Capture user feedback, diagnose issues |
| `/observe parse` | Parse Agentation annotations |
| `/changelog` | Generate user-facing release notes |

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

## Anchor & Lens: Rust CLIs

Anchor and Lens are **native Rust CLIs** for formal verification of design physics. They validate that AI-generated code actually follows physics rules.

| CLI | Purpose | Performance |
|-----|---------|-------------|
| **Anchor** | Zone/effect validation, keyword mapping | ~10ms |
| **Lens** | Formal constraint verification, component linting | ~27ms |

### Installation

```bash
# Build from source
cd anchor-rust
cargo build --release

# Binaries available at:
# ./target/release/anchor
# ./target/release/lens

# Optional: add to PATH
export PATH="$PATH:$(pwd)/target/release"
```

### Quick Start

```bash
# Validate physics request (zone/effect mapping)
anchor validate --request-id <UUID>

# Verify formal constraints (CEL-based)
lens verify --request-id <UUID>

# Lint a component directly
lens lint --file src/components/ClaimButton.tsx
```

### Zone Hierarchy

| Zone | Effects | Constraints |
|------|---------|-------------|
| **Critical** | Financial, Destructive | Strict timing, confirmation required |
| **Cautious** | SoftDelete | Undo required |
| **Standard** | Standard, Local, Navigation | Minimal constraints |

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 10 | Critical zone violations |
| 11 | Cautious zone warnings |
| 12 | Standard zone info |
| 20 | Schema validation error |
| 30 | I/O error |

### Communication Protocol

Anchor and Lens communicate via `grimoires/pub/`:

1. Claude writes request → `pub/requests/<uuid>.json`
2. `anchor validate` checks zone mapping
3. `lens verify` checks formal constraints
4. Claude reads response ← `pub/responses/anchor-<uuid>.json` / `lens-<uuid>.json`

See `anchor-rust/` for full documentation.

---

## Diagnostic HUD

The `@thehoneyjar/sigil-hud` package provides composable React components for diagnostic-first development. Use individual components or the full HUD.

### Quick Start

```tsx
import { HudProvider, HudPanel, HudTrigger } from '@thehoneyjar/sigil-hud'

function App() {
  return (
    <HudProvider>
      <YourApp />
      <HudPanel />
      <HudTrigger />  {/* Floating button to toggle */}
    </HudProvider>
  )
}
```

### Components

| Component | Purpose |
|-----------|---------|
| **DiagnosticsPanel** | Real-time physics compliance with issue detection |
| **DataSourceIndicator** | Visual staleness badges for on-chain/indexed/cached data |
| **FeedbackPrompt** | "Does this feel right?" with signal capture |
| **ObservationCaptureModal** | Capture User Truth, Issues, Insights |
| **StateComparison** | Side-by-side diff with data source tracing |
| **PhysicsAnalysis** | Effect badge and compliance display |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+D` | Toggle HUD panel |
| `Cmd+Shift+O` | Capture observation |
| `1-5` | Switch panel tabs |
| `Escape` | Close panel |

### Composable Packages

The HUD is built from smaller packages you can use independently:

| Package | Purpose | Install |
|---------|---------|---------|
| `@thehoneyjar/sigil-diagnostics` | Physics compliance checking | `pnpm add @thehoneyjar/sigil-diagnostics` |
| `@thehoneyjar/sigil-fork` | Anvil/Tenderly fork management | `pnpm add @thehoneyjar/sigil-fork` |
| `@thehoneyjar/sigil-lens` | Address impersonation | `pnpm add @thehoneyjar/sigil-lens` |
| `@thehoneyjar/sigil-simulation` | Transaction dry-run | `pnpm add @thehoneyjar/sigil-simulation` |

---

## Dev Toolbar

The `@thehoneyjar/sigil-dev-toolbar` package provides browser-based tools for debugging Web3 applications during development. It integrates the HUD components with Web3-specific features.

### Features

| Feature | Purpose |
|---------|---------|
| **User Lens** | Impersonate any wallet address to test different user states |
| **Transaction Simulation** | Dry-run transactions against fork to see gas, balance changes, logs |
| **State Comparison** | Side-by-side diff of state with data source tracing |
| **Diagnostics** | Real-time physics compliance checks with issue detection |
| **IPC Communication** | Bridge between toolbar and Anchor CLI for validation |

### Quick Start

```tsx
import { DevToolbarProvider, DevToolbar, useLensAwareAccount } from '@thehoneyjar/sigil-dev-toolbar'

function App() {
  return (
    <DevToolbarProvider config={{ enableIPC: true }}>
      <YourApp />
      <DevToolbar />
    </DevToolbarProvider>
  )
}

// In your components, use lens-aware hooks
function WalletInfo() {
  const { address, isImpersonating, realAddress } = useLensAwareAccount()
  return <div>Current: {address} {isImpersonating && `(real: ${realAddress})`}</div>
}
```

### Transaction Simulation

```tsx
import { useTransactionSimulation } from '@thehoneyjar/sigil-dev-toolbar'

function ClaimButton() {
  const { simulate, result, isSimulating } = useTransactionSimulation({
    from: userAddress,
    forkProvider: 'anvil',
  })

  const handlePreview = async () => {
    const sim = await simulate({
      to: contractAddress,
      data: encodedClaimCall,
      value: 0n,
    })

    if (!sim.success) {
      console.log('Would revert:', sim.revertReason)
    } else {
      console.log('Gas:', sim.gasUsed, 'Balance changes:', sim.balanceChanges)
    }
  }

  return <button onClick={handlePreview}>Preview Claim</button>
}
```

### State Comparison

```tsx
import { StateComparison, useStateSnapshots } from '@thehoneyjar/sigil-dev-toolbar'

function DebugPanel() {
  const { captureSnapshot, leftSnapshot, rightSnapshot, setLeftId, setRightId, snapshots } = useStateSnapshots()

  return (
    <>
      <button onClick={() => captureSnapshot('Before', currentState)}>Capture Before</button>
      <button onClick={() => captureSnapshot('After', currentState)}>Capture After</button>
      <StateComparison
        leftSnapshot={leftSnapshot}
        rightSnapshot={rightSnapshot}
        showOnlyDifferences
      />
    </>
  )
}
```

### Taste Signal Integration

The toolbar captures signals with additional context:

```yaml
signal: MODIFY
source: toolbar
lens_context:
  enabled: true
  impersonated_address: "0x1234..."
  real_address: "0xabcd..."
screenshot_ref: "screenshots/stake-panel-2026-01-20.png"
```

See `packages/sigil-dev-toolbar/` for full API documentation.

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

anchor-rust/                  # Native Rust CLIs (~10ms validation)
├── anchor/                   # Zone/effect validation
│   ├── src/commands/         # validate, check-source, state
│   └── data/                 # vocabulary.yaml, zones.yaml
├── lens/                     # Formal constraint verification
│   ├── src/cel/              # CEL constraint engine
│   ├── src/heuristics/       # Tree-sitter based checks
│   └── data/                 # constraints.yaml
└── sigil-ipc/                # Shared I/O crate

packages/
├── anchor/                   # Ground truth enforcement (TypeScript bindings)
│   ├── src/
│   │   ├── cli/              # CLI interface
│   │   └── warden/           # Lens validator integration
│   └── dist/
├── hud/                      # Diagnostic HUD components (v0.1.0)
│   ├── src/
│   │   ├── components/       # DiagnosticsPanel, FeedbackPrompt, StateComparison, etc.
│   │   ├── hooks/            # useDataSource, useSignalCapture, useObservationCapture
│   │   ├── providers/        # HudProvider
│   │   └── styles/           # Theme tokens
│   └── dist/
├── diagnostics/              # Physics compliance detection (v0.1.0)
│   └── src/                  # Effect detection, compliance checking
├── fork/                     # Chain fork management (v0.1.0)
│   └── src/providers/        # Anvil, Tenderly providers
├── lens/                     # User address impersonation (v0.1.0)
│   └── src/                  # Lens service, wagmi integration
├── simulation/               # Transaction simulation (v0.1.0)
│   └── src/                  # Dry-run execution
└── sigil-dev-toolbar/        # Dev toolbar (uses above packages)
    ├── src/
    │   ├── components/       # UserLens, DevToolbar, DiagnosticPanel
    │   ├── hooks/            # useForkState, useTransactionSimulation
    │   ├── services/         # Fork, simulation services
    │   └── ipc/              # IPC client for Anchor/Lens CLIs
    └── dist/
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
| Node.js 20+ | Yes | Runtime | [nodejs.org](https://nodejs.org) |
| Git | Yes | Version control | [git-scm.com](https://git-scm.com) |
| [Claude Code](https://claude.ai/code) | Yes | AI runtime | `npm install -g @anthropic-ai/claude-code` |
| [Loa](https://github.com/0xHoneyJar/loa) | Yes | Architecture framework | See Loa docs |
| [agent-browser](https://github.com/anthropics/agent-browser) | No | Visual validation | `npm install -g agent-browser` |

---

## Quick Start

### Unified Installation (Recommended)

Mount Sigil onto any project with a single command:

```bash
# From your project directory (via Claude Code)
/mount sigil
```

This runs the unified installer which:
1. **Pre-flight checks** — Verifies Node 20+, git, Loa
2. **Installs construct pack** — Rules, commands, skills
3. **Installs Rust CLIs** — anchor and lens for formal verification
4. **Detects React projects** — Offers npm packages for diagnostic HUD
5. **Verifies installation** — Confirms everything works

### Manual Installation

```bash
# Clone and run mount script
git clone https://github.com/0xHoneyJar/sigil.git
cd your-project
../sigil/scripts/mount-sigil.sh

# Or with options
../sigil/scripts/mount-sigil.sh --skip-cli    # Skip Rust CLI installation
../sigil/scripts/mount-sigil.sh --skip-npm    # Skip npm package suggestions
../sigil/scripts/mount-sigil.sh --force       # Reinstall even if already installed
```

### CLI-Only Installation

Install just the Rust CLIs (anchor and lens):

```bash
curl -fsSL https://cdn.jsdelivr.net/gh/0xHoneyJar/sigil@main/scripts/install-cli.sh | bash
```

### Updating Sigil

Check for updates and upgrade:

```bash
# Check for available updates
./scripts/update-sigil.sh --check

# Update all components
./scripts/update-sigil.sh

# Update specific components
./scripts/update-sigil.sh --construct  # Rules, commands, skills only
./scripts/update-sigil.sh --cli        # Rust CLIs only
./scripts/update-sigil.sh --npm        # npm packages only
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

*v3.2.0 "Diagnostic HUD & Package Architecture"*
