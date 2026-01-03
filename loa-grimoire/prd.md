# Product Requirements Document: Sigil v0.4 — Soul Engine

**Version:** 2.0
**Date:** 2026-01-02
**Author:** PRD Architect Agent (Interview-Updated)
**Status:** Draft
**Branch:** feature/soul-engine

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Goals & Success Metrics](#goals--success-metrics)
4. [User Personas & Use Cases](#user-personas--use-cases)
5. [Functional Requirements](#functional-requirements)
6. [Non-Functional Requirements](#non-functional-requirements)
7. [Architecture Overview](#architecture-overview)
8. [The Six Systems](#the-six-systems)
9. [Command Design](#command-design)
10. [Configuration System](#configuration-system)
11. [Scope & Prioritization](#scope--prioritization)
12. [Success Criteria](#success-criteria)
13. [Risks & Mitigation](#risks--mitigation)
14. [Interview Findings](#interview-findings)
15. [Appendix](#appendix)

---

## Executive Summary

Sigil v0.4 is the **Soul Engine** — a complete evolution from v0.3 Constitutional Design Framework. It merges the governance concepts of v0.3 with a runtime-aware architecture that brings Material physics, Interaction routing, and Tension controls into the development workflow.

> **Philosophy:** "A Studio, not a Factory. Craft, not just consistency."

The Soul Engine addresses a fundamental insight: design systems fail because they treat the **symptom** (inconsistent outputs) rather than the **disease** (tacit knowledge trapped in people's heads, lack of physics-based constraints, and missing feedback loops).

**Key Evolution from v0.3:**
- **Material Core**: Glass, Clay, Machinery as physics models (not just styles)
- **Interaction Router**: Sync by intent (CRDT, LWW, Server-Tick)
- **Tension System**: Real-time feel adjustment (Playfulness, Weight, Density, Speed)
- **Gardener Protocol**: 3:1 paper cuts to features (quality over quantity)
- **Convergence Studio**: Multi-role craft with role-per-session
- **Soul Binder**: Bidirectional AI-human context with local learning

**Core Principle:** Feel like playing with a toy, not a cop watching over. Progressive disclosure guides users through use-case paths, like Runescape's open-world exploration with hints.

---

## Problem Statement

### The Problem

Design systems fail to prevent inconsistency because they treat the **symptom** (inconsistent outputs) rather than the **disease** (tacit knowledge trapped in people's heads). Traditional approaches assume:

| Assumption | Reality |
|------------|---------|
| Documentation = Governance | Writing rules doesn't enforce them |
| Consistency = Matching specs | Consistency = Matching the *feel* |
| Styles are sufficient | Materials need physics, not just tokens |
| All sync is the same | Money needs server-tick, text needs CRDT |
| One role per person | Small teams wear multiple hats per session |
| More features = better | 3:1 paper cuts to features = better |

### User Pain Points

- **No physics-based constraints**: Buttons "feel" wrong despite correct colors
- **Sync strategy mismatch**: Optimistic UI for money transfers causes bugs
- **Tension conflicts**: "Playful" and "fast" instructions contradict
- **Paper cut debt**: Features ship while polish rots
- **Cross-functional friction**: Designers and engineers speak different languages
- **AI context leakage**: Claude ignores Sigil config in complex prompts

### Current State (Sigil v0.3)

Sigil v0.3 provides:
- Soul Binder (values + flaws)
- Lens Array (personas)
- Consultation Chamber (decisions)
- Proving Grounds (feature validation)
- Progressive strictness (4 levels)

**Limitations:**
- No runtime awareness (pure YAML config)
- No Material physics (just zone hints)
- No sync strategy guidance
- No tension controls
- No cross-functional coordination tools
- No gardener protocol

### Desired State (Sigil v0.4)

A Soul Engine where:
- **Material physics** define how UI elements behave (Glass refracts, Clay has weight)
- **Sync strategies** match interaction intent (money → server-tick, always)
- **Tensions** can be tuned in real-time with immediate preview
- **Gardener protocol** enforces quality before features
- **Role-per-session** constrains context for focused exploration
- **Local learning** captures corrections for future prompts

---

## Goals & Success Metrics

### Primary Goals

1. **Material Physics** — UI elements behave according to material rules, not just styling
2. **Intent-Based Sync** — Sync strategy automatically detected and enforced by interaction type
3. **Real-Time Tensions** — Feel can be adjusted live with immediate feedback
4. **Quality Culture** — 3:1 paper cuts to features ratio enforced
5. **Cross-Functional Craft** — Design engineers work in constrained role sessions
6. **AI Context Fidelity** — Claude reliably applies Sigil context without leakage

### Key Performance Indicators (KPIs)

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Material Compliance | N/A | 95% components match material physics | Automated check |
| Sync Strategy Correctness | N/A | 100% money/health uses server-tick | Code review |
| Paper Cut Ratio | N/A | 3:1 fixes to features | PR analysis |
| AI Context Application | N/A | 90% prompts correctly apply Sigil | User feedback |
| Adoption Friction | N/A | <30 min to first /craft | User testing |

### Constraints (Interview-Derived)

- **React-first, port later**: Core runtime in React, Vue/Svelte/vanilla future work
- **NextJS/Tailwind/Shadcn opinionated**: Optimized for this stack, OSS-extensible
- **PR comment only (CI)**: Gardener is advisory, not blocking
- **Local context for learning**: Corrections saved locally, memory services future
- **Qualitative feedback for small communities**: Replace polls with interviews <1000 users

---

## User Personas & Use Cases

### Primary Persona: Design Engineer

**Demographics:**
- Role: Full-stack developer who owns both design and engineering
- Technical Proficiency: High—React, TypeScript, Tailwind daily
- Goals: Ship craft without context-switching between "designer mode" and "engineer mode"

**Behaviors:**
- Wears different hats per session (role-per-session)
- Tunes tensions while coding
- Fixes paper cuts before features
- Uses AI to accelerate, not replace judgment

**Pain Points:**
- Context bleeding between roles
- AI ignoring design context
- No physics-based constraints

---

### Secondary Persona: Taste Owner

**Demographics:**
- Role: Founder or design lead with final authority
- Technical Proficiency: Medium—comfortable with config files
- Goals: Maintain soul without being a bottleneck

**Behaviors:**
- Approves/overrides with pair (Founder Mode requires second Taste Owner)
- Sets tension presets for the product
- Adjudicates cross-boundary paper cuts

**Pain Points:**
- 2am rage-decisions (Founder Mode guardrails)
- Design-by-committee on execution details
- Losing context when decisions need revisiting

---

### Tertiary Persona: Non-Technical Stakeholder

**Demographics:**
- Role: PM, exec, or community manager
- Technical Proficiency: Low—views, doesn't edit
- Goals: Understand product soul without breaking it

**Behaviors:**
- Uses Workbench in sandbox mode (experiment without persisting)
- Views component library and tension states
- Provides qualitative feedback

**Pain Points:**
- Breaking things by accident
- Not understanding technical constraints
- Feeling excluded from design process

---

### Use Cases

#### UC-1: Mount Soul Engine on Existing Codebase

**Actor:** Design Engineer
**Preconditions:** Existing NextJS project
**Flow:**
1. Run mounting procedure (CLI or script)
2. System bootstraps Workbench app in repo
3. System creates `.sigilrc.yaml` with detected zone mappings
4. User runs `/envision` to capture soul
5. System generates Claude context (CLAUDE.md update)

**Postconditions:** Project has Soul Engine active
**Acceptance Criteria:**
- [ ] Workbench app accessible at localhost
- [ ] Claude context correctly injected
- [ ] Material detection working for zones

---

#### UC-2: Tune Tensions in Workbench

**Actor:** Design Engineer
**Preconditions:** Soul Engine mounted
**Flow:**
1. Open Workbench app
2. Navigate to component or flow
3. Adjust tension sliders (Playfulness, Weight, Density, Speed)
4. See live preview update
5. Optionally: Commit tension preset to codebase

**Postconditions:** Tensions adjusted with immediate feedback
**Acceptance Criteria:**
- [ ] Sliders affect CSS variables in real-time
- [ ] Preview shows actual component behavior
- [ ] Presets can be saved

---

#### UC-3: Declare Sync Strategy for Novel Feature

**Actor:** Design Engineer
**Preconditions:** Building feature with unclear sync requirements
**Flow:**
1. Interaction Router cannot classify keywords
2. System prompts for explicit declaration
3. User selects: CRDT, LWW, or Server-Tick
4. System registers declaration in config
5. Future uses of this pattern auto-classify

**Postconditions:** Novel feature has explicit sync strategy
**Acceptance Criteria:**
- [ ] Unknown interactions require declaration (no guessing)
- [ ] Declaration persisted for future reference
- [ ] Warnings shown if strategy mismatched

---

#### UC-4: Enforce 3:1 Paper Cut Ratio

**Actor:** Design Engineer
**Preconditions:** Feature PR submitted
**Flow:**
1. Gardener bot analyzes PR
2. Counts paper cuts fixed vs features added
3. Posts PR comment with ratio analysis
4. If ratio < 3:1, suggests paper cuts to fix
5. Merge decision remains human

**Postconditions:** Quality ratio visible, not blocked
**Acceptance Criteria:**
- [ ] PR comment shows paper cut analysis
- [ ] Suggestions link to specific paper cuts
- [ ] No blocking—advisory only

---

## Functional Requirements

### FR-1: Material Core

**Priority:** P0 (Must Have)
**Description:** Define UI physics, not just styles. Three materials with distinct behaviors.

**Materials:**

| Material | Feel | Physics | Use For |
|----------|------|---------|---------|
| **Glass** | Light, translucent | Refraction, blur, depth parallax | Exploratory, discovery |
| **Clay** | Warm, tactile | Weight, soft shadows, spring motion | Critical actions, marketing |
| **Machinery** | Instant, precise | Zero-latency, step transitions | Command palettes, data tables |

**Behavior:**
- Auto-detect material from zone (configurable in `.sigilrc.yaml`)
- Component-level override available
- Material blending rules: Auto-detect hierarchy (container/overlay relationships)
- Each material has forbidden patterns (e.g., Machinery forbids bounce effects)

**Acceptance Criteria:**
- [ ] Three materials implemented with distinct physics
- [ ] Zone-to-material mapping configurable
- [ ] Blending rules auto-detected for overlays
- [ ] Forbidden patterns warn, not block

---

### FR-2: Interaction Router

**Priority:** P0 (Must Have)
**Description:** Map sync strategy to interaction intent, not data type.

**Strategies:**

| Strategy | When | UI Feedback |
|----------|------|-------------|
| **CRDT** | Collaborative text | Presence cursors, subtle sync indicator |
| **LWW** | Property state | Optimistic (instant), no sync indicator |
| **Server-Tick** | High stakes | Pending state, confirmation animation |

**Behavior:**
- Keyword classification for common patterns
- **Unknown interactions require explicit declaration** (no guessing)
- Server-tick rate is operation-severity based (configurable per risk level)
- Confirmation animation is material-dependent (not always XP-drop style)

**Acceptance Criteria:**
- [ ] Common patterns auto-classified by keywords
- [ ] Unknown patterns prompt for explicit declaration
- [ ] Server-tick never uses optimistic UI
- [ ] Confirmation style varies by material

---

### FR-3: Tension System

**Priority:** P0 (Must Have)
**Description:** Real-time adjustable feel parameters with immediate preview.

**Tensions (0-100 each):**

| Tension | Low | High | Affects |
|---------|-----|------|---------|
| **Playfulness** | Serious, professional | Playful, fun | Animation bounce, color saturation, border radius |
| **Weight** | Light, airy | Heavy, grounded | Shadow depth, font weight, padding |
| **Density** | Spacious, minimal | Dense, information-rich | Spacing, font size, information per screen |
| **Speed** | Deliberate, measured | Instant, snappy | Transition duration, loading behavior |

**Behavior:**
- Tensions affect CSS variables in real-time
- **Allow weird states** for innovative exploration
- Presets available for established products (Linear, Airbnb, Nintendo, OSRS)
- Soft constraints: no hard limits on combinations

**Acceptance Criteria:**
- [ ] Four tension sliders with 0-100 range
- [ ] CSS variables update in real-time
- [ ] Weird combinations allowed (high playfulness + high speed)
- [ ] Presets available for common product styles

---

### FR-4: Gardener Protocol

**Priority:** P1 (Should Have)
**Description:** Maintain quality through continuous polish. 3:1 paper cuts to features.

**Paper Cut Categories:**
- Spacing drift (padding inconsistencies)
- Color drift (hardcoded hex values)
- Animation inconsistency (timing off-spec)
- Component duplication (similar code)
- Accessibility gaps (missing ARIA)

**Behavior:**
- **Design engineers adjudicate cross-boundary paper cuts** (no role separation)
- Gardener bot posts PR comment with analysis
- **Advisory, not blocking** — humans decide if debt is acceptable
- Paper cut threshold configurable

**Acceptance Criteria:**
- [ ] Paper cuts detected automatically
- [ ] PR comment shows 3:1 ratio analysis
- [ ] Suggestions link to specific issues
- [ ] No merge blocking

---

### FR-5: Convergence Studio

**Priority:** P1 (Should Have)
**Description:** Multi-role craft with role-per-session.

**Roles:**

| Role | Powers |
|------|--------|
| **Taste Owner** | Veto, tension control, override constraints |
| **Designer** | Propose directions, create artifacts |
| **Researcher** | Usability tests, user insight |
| **Engineer** | Feasibility, performance |
| **Gamifier** | Engagement loops, depth rewards |

**Behavior:**
- **Role-per-session** constrains context (e.g., "Today you're the Researcher")
- One person can hold multiple roles across sessions
- Small teams (2 people) can still use all roles
- Phases: Diverge → Converge → Polish → Validate

**Acceptance Criteria:**
- [ ] Roles defined with clear powers
- [ ] Session can declare active role
- [ ] Role context injected into Claude prompts
- [ ] Role switching logged

---

### FR-6: Soul Binder (Updated)

**Priority:** P0 (Must Have)
**Description:** Bidirectional context injection with human override and local learning.

**Injection Layers:**
1. Material physics
2. Essence invariants (values)
3. Zone context
4. Tension state
5. Role context (from Convergence Studio)

**Human Override Behavior:**
- Flag issues in generated output
- Provide correction
- **Correction saved to local context file** (e.g., `.sigil/corrections.yaml`)
- Future prompts include corrections
- Memory services for cross-session learning: future work

**Acceptance Criteria:**
- [ ] All layers injected into Claude context
- [ ] Override workflow functional
- [ ] Corrections persisted locally
- [ ] Future prompts reference corrections

---

### FR-7: Founder Mode (Updated)

**Priority:** P1 (Should Have)
**Description:** Full override capability with guardrails.

**Behavior:**
- **Pair required**: Founder Mode requires a second Taste Owner to confirm
- Scope limits: Can override components but not global invariants (accessibility, security)
- All overrides logged to audit trail
- No cooling-off period for solo action (pair requirement handles this)

**Acceptance Criteria:**
- [ ] Founder Mode requires second Taste Owner
- [ ] Global invariants cannot be overridden
- [ ] Audit trail captures all overrides
- [ ] Clear UI for pair confirmation

---

### FR-8: Governance Model (Updated)

**Priority:** P1 (Should Have)
**Description:** Layered authority with Visual Lock and qualitative feedback.

**Visual Lock:**
- Visuals are NEVER polled (design-by-committee kills quality)
- **Split rule: WCAG compliance is mandatory, aesthetics are Taste Owner decision**
- Accessibility requirements bypass Visual Lock

**Polling for Small Communities:**
- **Qualitative over quantitative** for communities <1000 users
- Replace polls with user interviews and feedback synthesis
- Only use binding polls when community reaches critical mass

**Acceptance Criteria:**
- [ ] Visual Lock implemented with accessibility exception
- [ ] Qualitative feedback tools for small communities
- [ ] Binding polls only for strategic decisions at scale

---

### FR-9: Artifact Workbench

**Priority:** P0 (Must Have)
**Description:** Standalone NextJS app for previewing components with tension controls.

**Form:**
- **Standalone NextJS app bootstrapped per repo**
- HUD tool handles settings edits
- Workbench focuses on component/flow preview
- **Sandbox mode** for non-technical stakeholders (experiment without persisting)

**Features:**
- Live preview with hot reload
- Tension sliders with immediate effect
- Material selection override
- Component library browser
- Flow visualization

**Acceptance Criteria:**
- [ ] NextJS app template created
- [ ] Bootstrapping script for new repos
- [ ] Sandbox mode for stakeholders
- [ ] HUD separate for settings edits

---

## Non-Functional Requirements

### Performance
- Tension slider updates in <16ms (60fps)
- Workbench preview hot reload in <500ms
- Material detection in <100ms
- No blocking on Claude cold start

### Scalability
- Support projects with 1000+ components
- Tension system works with any component library
- Material physics extensible (add new materials)

### Security
- No secrets in configuration files
- Sandbox mode prevents accidental changes
- Audit trail for all Taste Owner actions

### Reliability
- Framework works offline after initial setup
- Graceful degradation if Workbench unavailable
- Local context survives Claude session restarts

### Compatibility
- **React-first**: Core runtime in React
- **NextJS/Tailwind/Shadcn opinionated**: Optimized for this stack
- **OSS-extensible**: Community can add Vue/Svelte/vanilla ports
- **Claude-powered**: Built for Claude Code, Cursor

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SIGIL SOUL ENGINE v0.4                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  THE WORKBENCH (Where Craft Happens)                                 │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │ Artifact    │  │ Tension     │  │ Founder     │  │ Gardener   │  │   │
│  │  │ Preview     │  │ Controls    │  │ Mode        │  │ Dashboard  │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              │ Soul Calls                                    │
│                              ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  THE SOUL LAYER (What Defines the Feel)                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │ Material    │  │ Soul        │  │ Interaction │  │ Convergence│  │   │
│  │  │ Core        │  │ Binder      │  │ Router      │  │ Studio     │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              │ Runtime Calls                                 │
│                              ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  THE RUNTIME (React Hooks + CSS Variables)                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │   │
│  │  │ useTensions │  │ useMaterial │  │ useSync     │                  │   │
│  │  │             │  │             │  │ Hooks       │                  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The Six Systems

### 1. Material Core

**Purpose:** Define UI physics, not just styles.

**Materials:**
- **Glass**: Light, translucent (VisionOS, iOS) — exploratory zones
- **Clay**: Warm, tactile (Airbnb, OSRS) — critical zones, trust
- **Machinery**: Instant, precise (Linear, TE) — command palettes, data

**Key Decision:** Material blending uses auto-detect hierarchy. Overlaid components inherit container material unless explicitly overridden.

### 2. Interaction Router

**Purpose:** Map sync strategy to interaction intent.

**Strategies:**
- **CRDT**: Collaborative text (Yjs)
- **LWW**: Property state (optimistic)
- **Server-Tick**: High stakes (pending → confirm)

**Key Decision:** Unknown interactions require explicit declaration. No guessing.

### 3. Tension System

**Purpose:** Real-time adjustable feel parameters.

**Axes:** Playfulness, Weight, Density, Speed (0-100 each)

**Key Decision:** Allow weird states for innovation. Presets help for established products.

### 4. Gardener Protocol

**Purpose:** Maintain quality through continuous polish.

**Rule:** 3:1 paper cuts to features.

**Key Decision:** Design engineers cross boundaries (no role separation for paper cut adjudication). CI is advisory only (PR comment, not blocking).

### 5. Convergence Studio

**Purpose:** Multi-role craft, not insular execution.

**Roles:** Taste Owner, Designer, Researcher, Engineer, Gamifier

**Key Decision:** Role-per-session constrains context. One person can hold multiple roles across sessions.

### 6. Soul Binder

**Purpose:** Bidirectional context injection with learning.

**Key Decision:** Local context file for corrections. Memory services are future work.

---

## Command Design

### Progressive Disclosure

Commands use progressive disclosure — show only relevant commands based on context.

```
┌─ Starting a project?
│  └─ /setup → /envision → Creates Workbench + Claude context
│
├─ During development?
│  ├─ /craft → Get design guidance with material + tension context
│  ├─ /workbench → Open artifact preview with tension controls
│  └─ /role <name> → Set session role for focused exploration
│
├─ Quality maintenance?
│  ├─ /garden → See paper cut debt and suggestions
│  └─ /approve → Sign off on patterns
│
└─ Governance?
   ├─ /consult → Start consultation (layer-appropriate)
   └─ /founder → Pair-confirmed override
```

### Core Commands (Consolidated)

| Command | Purpose | Output |
|---------|---------|--------|
| `/setup` | Initialize Soul Engine + Workbench | Directory structure, NextJS app |
| `/envision` | Capture soul (materials, tensions, values) | Config files, Claude context |
| `/craft` | Get design guidance | Material + tension-aware recommendations |
| `/workbench` | Open artifact preview | Browser opens Workbench app |
| `/role` | Set session role | Role context injected |
| `/garden` | Show paper cut analysis | Debt report with suggestions |
| `/approve` | Human sign-off | Approval record |
| `/founder` | Pair-confirmed override | Audit trail entry |

---

## Configuration System

### Directory Structure

```
project/
├── CLAUDE.md                        # Claude context (auto-updated)
├── .sigilrc.yaml                    # Soul Engine configuration
├── .sigil-setup-complete            # Setup marker
├── .sigil/
│   └── corrections.yaml             # Local learning from overrides
│
├── sigil-workbench/                 # Standalone NextJS app
│   ├── package.json
│   ├── app/
│   │   ├── page.tsx                 # Workbench home
│   │   └── components/
│   │       ├── TensionControls.tsx
│   │       └── ArtifactPreview.tsx
│   └── ...
│
└── sigil-mark/                      # Soul state
    ├── soul/
    │   ├── material-core.yaml       # Material physics definitions
    │   ├── interaction-router.yaml  # Sync strategy mappings
    │   ├── essence.yaml             # Soul statement, invariants
    │   ├── tensions.yaml            # Current tension state
    │   └── paper-cuts.yaml          # Paper cut queue
    ├── governance/
    │   ├── charter.yaml             # Separation of powers
    │   └── decisions/               # Decision records
    └── inventory.md                 # Component inventory
```

### Configuration Format

**`.sigilrc.yaml`:**
```yaml
version: "0.4"

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

  exploratory:
    material: "glass"
    sync: "lww"
    paths:
      - "src/features/discovery/**"

# Tension presets
tensions:
  default:
    playfulness: 50
    weight: 50
    density: 50
    speed: 50
  presets:
    - name: "linear"
      playfulness: 20
      weight: 30
      density: 70
      speed: 95
    - name: "airbnb"
      playfulness: 50
      weight: 60
      density: 40
      speed: 50

# Gardener settings
gardener:
  paper_cut_threshold: 10
  three_to_one_rule: true
  enforcement: "advisory"  # advisory | blocking (advisory only for now)

# Governance
governance:
  visual_lock: true
  accessibility_override: true  # WCAG bypasses visual lock
  polling_threshold: 1000       # Below this, use qualitative feedback

# Founder Mode
founder_mode:
  pair_required: true
  invariant_protection: ["accessibility", "security"]
```

---

## Scope & Prioritization

### Sprint 0: Claude Integration + Mounting (First Build)

**Priority:** P0 — This is the first thing to build.

1. **Claude context update** — CLAUDE.md with Soul Engine prompt
2. **Mounting procedure** — Script to bootstrap onto existing repo
3. **See it in action** — Iterate after real usage

### In Scope (v0.4 MVP)

1. **Material Core** — Three materials with physics
2. **Interaction Router** — CRDT, LWW, Server-Tick with explicit declaration
3. **Tension System** — Four axes with CSS variable output
4. **Soul Binder** — Context injection with local learning
5. **Workbench App** — NextJS app with tension controls
6. **Gardener Protocol** — Paper cut analysis (PR comment only)
7. **Founder Mode** — Pair-confirmed overrides

### In Scope (v0.5 Future)

- **Convergence Studio** — Full role system
- **Governance Model** — Qualitative feedback tools
- **Memory Services** — Cross-session learning
- **Framework Ports** — Vue, Svelte, vanilla

### Explicitly Out of Scope

- **Figma sync**: Code is source of truth
- **Automated blocking CI**: Advisory only
- **Non-Claude agents**: Built for Claude
- **Mobile native**: Web-first

### Priority Matrix

| Feature | Priority | Effort | Impact |
|---------|----------|--------|--------|
| Claude Integration | P0 | S | Critical |
| Mounting Procedure | P0 | S | Critical |
| Material Core | P0 | M | High |
| Tension System | P0 | M | High |
| Interaction Router | P0 | M | High |
| Workbench App | P0 | L | High |
| Soul Binder (Local) | P0 | M | High |
| Gardener Protocol | P1 | M | Medium |
| Founder Mode | P1 | S | Medium |
| Convergence Studio | P2 | M | Medium |

---

## Success Criteria

### Launch Criteria

- [ ] Claude context correctly applies Material + Tension + Zone
- [ ] Mounting procedure works on existing NextJS repo
- [ ] Workbench app shows live preview with tension sliders
- [ ] Server-tick interactions never use optimistic UI
- [ ] Paper cut analysis posts to PRs

### Failure Modes to Avoid (Interview-Derived)

1. **Too complex to adopt** — Progressive disclosure essential
2. **AI ignores context** — Context must be reliably injected
3. **Taste gets diluted** — Founder Mode guardrails
4. **Confusion on how to use** — Use-case paths, not documentation walls

### Post-Launch Success (30 days)

- [ ] 3+ projects using Soul Engine
- [ ] <30 min time to first /craft
- [ ] 3:1 paper cut ratio maintained
- [ ] No server-tick optimistic UI bugs

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Complexity overwhelming adoption | High | High | Progressive disclosure, use-case paths |
| AI ignoring Sigil context | Medium | High | Robust context injection, testing |
| Taste dilution from flexibility | Medium | Medium | Founder Mode guardrails, pair required |
| Runtime performance overhead | Low | Medium | Optimize CSS variable updates |
| React-only limits adoption | Medium | Low | OSS-extensible for community ports |

---

## Interview Findings

The following decisions were made through in-depth interview:

### Architecture Decisions

1. **v0.3 → v0.4 Merge**: Start fresh — v0.4 is Soul Engine with v0.3 concepts restructured
2. **Material Conflicts**: Auto-detect hierarchy (container/overlay)
3. **Tick Rate**: Operation-severity based (designer decides intent)
4. **Tension Conflicts**: Allow weird states for innovation

### Team & Governance Decisions

5. **Paper Cut Adjudication**: Design engineers cross boundaries (no role separation)
6. **Founder Mode**: Pair required (second Taste Owner confirms)
7. **Small Teams**: Role-per-session constrains context
8. **Accessibility vs Visual Lock**: WCAG mandatory, aesthetics = Taste Owner
9. **Poll Threshold**: Qualitative over quantitative for <1000 users

### Technical Decisions

10. **Unknown Sync**: Require explicit declaration (no guessing)
11. **Workbench Form**: Standalone NextJS app per repo
12. **AI Learning**: Local context file for now
13. **Framework Scope**: React-first, port later
14. **Stack**: NextJS/Tailwind/Shadcn opinionated, OSS-extensible
15. **CI Integration**: PR comment only (advisory)

### UX Decisions

16. **Primary User**: Both AI and humans equally
17. **XP Drop Style**: Abstract to material-dependent confirmation
18. **Learning Curve**: Progressive disclosure like Runescape exploration
19. **Commands**: Consolidate where possible, use-case paths
20. **Stakeholder Access**: Sandbox mode (experiment without persisting)

### First Build

21. **Priority**: Claude integration and mounting procedure onto existing codebase

---

## Appendix

### A. Material Physics Reference

**Glass:**
```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.2);
```
Forbidden: Solid backgrounds, hard shadows

**Clay:**
```css
background: linear-gradient(135deg, #FAFAF9 0%, #F5F5F4 100%);
border-radius: 16px;
box-shadow: 0 1px 2px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.08);
```
Forbidden: Flat design, instant state changes

**Machinery:**
```css
background: #0A0A0A;
color: #FAFAFA;
border: 1px solid #2A2A2A;
transition: none;
```
Forbidden: Fade-in animations, bounce effects, loading spinners

### B. Tension Presets

| Preset | Playfulness | Weight | Density | Speed |
|--------|-------------|--------|---------|-------|
| Linear | 20 | 30 | 70 | 95 |
| Airbnb | 50 | 60 | 40 | 50 |
| Nintendo | 80 | 50 | 30 | 60 |
| OSRS | 30 | 70 | 60 | 40 |

### C. Sync Strategy Keywords

**Server-Tick (highest priority):**
trade, transfer, buy, sell, attack, claim, money, currency, balance, wallet, health, hp, inventory, item, withdraw, deposit, payment, transaction, combat, competitive

**CRDT:**
edit, type, write, comment, message, document, text, draft, note, content, description, body, collaborative, shared

**LWW:**
move, toggle, select, preference, status, position, state, setting, config, option, choice, switch

### D. References

**Product Inspirations:**
- OSRS: Tick-based physics, community governance, nostalgia preservation
- Linear: Local-first sync, keyboard-first UI, gardening over roadmaps
- Airbnb 2025: Skeuomorphism as functional navigation, tactile warmth
- Teenage Engineering: Muscle memory, analog friction, zero-latency
- Uniswap v4: Hooks architecture, curated permissionless

**Technical:**
- Yjs: CRDT implementation
- Framer Motion: Spring physics
- CSS Custom Properties: Tension variables

---

*Generated by PRD Architect Agent*
*Interview Date: 2026-01-02*
*Sigil v0.4: A Studio, not a Factory. Craft, not just consistency.*
