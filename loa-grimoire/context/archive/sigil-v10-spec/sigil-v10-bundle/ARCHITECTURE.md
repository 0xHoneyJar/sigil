# Sigil Soul Engine v10 — Architectural Overview

**Version**: 10.0  
**Philosophy**: A Studio, not a Factory. Craft, not just consistency.

---

## Executive Summary

Sigil Soul Engine is a design context framework for AI-assisted product development. It evolved through 10 iterations of rigorous critique, synthesizing lessons from:

- **OSRS**: Tick-based physics, community governance, nostalgia preservation
- **Linear**: Local-first sync, keyboard-first UI, gardening over roadmaps
- **Airbnb 2025**: Skeuomorphism as functional navigation, tactile warmth
- **Teenage Engineering**: Muscle memory, analog friction, zero-latency
- **Uniswap v4**: Hooks architecture, curated permissionless
- **RuneLite/117HD**: Community clients, state streams, visual overlays

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SIGIL SOUL ENGINE v10                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  THE SHOWROOM (Where Craft Happens)                                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │ Artifact    │  │ Perception  │  │ Founder     │  │ Gardener   │  │   │
│  │  │ Workbench   │  │ Atelier     │  │ Mode        │  │ Dashboard  │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              │ Soul Calls                                    │
│                              ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  THE SOUL LAYER (What Defines the Feel)                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │ Material    │  │ Soul        │  │ Interaction │  │ Convergtic │  │   │
│  │  │ Core        │  │ Binder      │  │ Router      │  │ Studio     │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              │ Kernel Calls                                  │
│                              ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  THE KERNEL (Immutable Physics)                                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │   │
│  │  │ Truth Store │  │ Tick Engine │  │ State       │                  │   │
│  │  │ (Server)    │  │ (600ms)     │  │ Stream      │                  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The Six Systems

### 1. Material Core

**Purpose**: Define UI physics, not just styles.

| Material | Feel | Physics | References |
|----------|------|---------|------------|
| **Glass** | Light, translucent | Refraction, blur, depth parallax | VisionOS, iOS |
| **Clay** | Warm, tactile | Weight, soft shadows, spring motion | Airbnb, OSRS |
| **Machinery** | Instant, precise | Zero-latency, step transitions | Linear, TE |

**Selection Logic**:
- Critical zones → Clay (trust)
- Transactional zones → Machinery (speed)
- Exploratory zones → Glass (curiosity)

### 2. Interaction Router

**Purpose**: Map sync strategy to interaction intent, not data type.

| Strategy | When | Examples | UI Feedback |
|----------|------|----------|-------------|
| **CRDT** | Collaborative text | Docs, comments, chat | Presence cursors |
| **LWW** | Property state | Toggles, positions, status | Optimistic (instant) |
| **Server-Tick** | High stakes | Money, inventory, health | Pending → Confirm |

**Rule**: NEVER use optimistic UI for server-tick data.

### 3. Artifact Workbench

**Purpose**: Real-time vibe coding with instant feedback.

**Components**:
- **Prompt Studio**: Natural language input with context display
- **Live Preview**: Interactive artifact with hot reload
- **Tension Sliders**: Playfulness, Weight, Density, Speed (0-100)
- **Founder Mode**: Full override capability for Taste Owner

**Workflow**:
1. Prompt → 2. Generate → 3. Tune tensions → 4. Iterate → 5. Validate

### 4. Gardener Protocol

**Purpose**: Maintain quality through continuous polish.

**The 3:1 Rule**: Before 1 new feature, fix 3 paper cuts.

**Paper Cut Categories**:
- Spacing drift (padding inconsistencies)
- Color drift (hardcoded hex values)
- Animation inconsistency (timing off-spec)
- Component duplication (similar code)
- Accessibility gaps (missing ARIA)

**Enforcement**: CI can block feature PRs if paper_cut_debt > threshold.

### 5. Convergence Studio

**Purpose**: Multi-role craft, not insular execution.

| Role | Powers |
|------|--------|
| **Taste Owner** | Veto, tension control, override constraints |
| **Designer** | Propose directions, create artifacts |
| **Researcher** | Usability tests, user insight |
| **Engineer** | Feasibility, performance |
| **Gamifier** | Engagement loops, depth rewards |

**Phases**: Diverge → Converge → Polish → Validate

### 6. Soul Binder

**Purpose**: Bidirectional context injection with human override.

**Injection Layers**:
1. Material physics
2. Essence invariants
3. Zone context
4. Tension state

**Human Override**:
- Flag issues in generated output
- Provide correction
- System learns for future
- Regenerate with correction applied

---

## Data Flow

```
┌──────────────┐
│ User Prompt  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│                    SOUL BINDER                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Material │  │ Essence  │  │ Zone     │  │ Tensions │ │
│  │ Context  │  │ Invariant│  │ Context  │  │ State    │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  AI Generation │
              └────────┬───────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│                  ARTIFACT WORKBENCH                       │
│  ┌──────────────────┐  ┌───────────────────────────────┐ │
│  │ Live Preview     │  │ Tension Sliders               │ │
│  │ (Interactive)    │  │ Playfulness ═══════○───── 70  │ │
│  │                  │  │ Weight      ════○──────── 40  │ │
│  │  [Component]     │  │ Density     ═══○───────── 30  │ │
│  │                  │  │ Speed       ══════○────── 60  │ │
│  └──────────────────┘  └───────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│              CONSTITUTION CHECK (Post-Gen)                │
│  ☑ Material compliance    ☑ Accessibility                │
│  ☑ Sync alignment         ☑ Performance                  │
└──────────────────────────────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │ Ship or Iterate│
              └────────────────┘
```

---

## File Structure

```
sigil-mark/                          # State zone (project-specific)
├── soul/
│   ├── material-core.yaml           # Material physics definitions
│   ├── interaction-router.yaml      # Sync strategy mappings
│   ├── essence.yaml                 # Soul statement, invariants
│   ├── tensions.yaml                # Current tension state
│   └── paper-cuts.yaml              # Paper cut queue
├── governance/
│   ├── greenlight.yaml              # Poll configuration
│   └── charter.yaml                 # Separation of powers
└── inventory.md                     # Component inventory

.sigilrc.yaml                        # Project configuration
.sigil-setup-complete                # Setup marker
```

---

## Configuration Reference

### .sigilrc.yaml

```yaml
version: "10.0"

# Material defaults by zone
zones:
  critical:
    material: "clay"
    sync: "server_tick"
    paths:
      - "src/features/checkout/**"
      - "src/features/claim/**"
      
  transactional:
    material: "machinery"
    sync: "lww"
    paths:
      - "src/features/dashboard/**"
      - "src/features/settings/**"
      
  exploratory:
    material: "glass"
    sync: "lww"
    paths:
      - "src/features/discovery/**"

# Default tensions
tensions:
  playfulness: 50
  weight: 50
  density: 50
  speed: 50

# Gardener settings
gardener:
  paper_cut_threshold: 10
  three_to_one_rule: true
  weekly_scan: true

# Constitution checks
constitution:
  material_compliance: true
  accessibility: true
  performance_budget_ms: 100
```

---

## Governance Model

### The Charter (Separation of Powers)

| Domain | Authority | Polling |
|--------|-----------|---------|
| **Core** (Visuals, Integrity) | Taste Owner | FORBIDDEN |
| **Expansion** (New Features) | Community | REQUIRED |
| **Hooks** (Extensions) | Market | NONE |

### Visual Lock

Visuals are NEVER polled. The "Mod Ghost" lesson: high-quality assets were voted down because they didn't match nostalgia. Design by committee kills quality.

### Greenlight Pipeline

1. **Sentiment** (60% threshold): "Should we explore this?"
2. **Execution**: Taste Owner dictates visuals/mechanics (no polling)
3. **Validation**: Beta testing, telemetry, sentiment analysis

---

## Evolution History

| Version | Focus | Fatal Flaw | Fixed In |
|---------|-------|------------|----------|
| v7 | Heirloom | Time capsule, not living organism | v8 |
| v8 | Kernel | OS without client awareness | v9 |
| v9 | Reality | Factory, not studio | v10 |
| v10 | Soul | **Final architecture** | — |

---

## Key Principles

1. **Material is physics, not styles** — Glass refracts, Clay has weight
2. **Sync by interaction intent** — Text→CRDT, State→LWW, Money→Tick
3. **Vibe coding is real-time** — Tension sliders, instant preview
4. **Garden before feature** — 3:1 paper cuts to features
5. **Studio is multi-role** — Not just Taste Owner dictating
6. **Human can override AI** — Bidirectional, not one-way

---

## References

- [Linear Method](https://linear.app/method) — Practices for building
- [OSRS Polling Charter](https://osrs.runescape.com/polling-charter) — Community governance
- [Airbnb 2025 Redesign](https://news.airbnb.com) — Skeuomorphism returns
- [Uniswap v4 Hooks](https://blog.uniswap.org) — Permissionless extension
- [Teenage Engineering](https://teenage.engineering) — Muscle memory design
