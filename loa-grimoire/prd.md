# Product Requirements Document: Sigil v2.6

**Version**: 2.6.0
**Status**: Draft
**Date**: 2026-01-06
**Codename**: Craftsman's Flow

---

## Executive Summary

Sigil v2.6 introduces a **two-tier architecture** that separates human design decisions (Sigil Process) from implementation primitives (Sigil Core). This evolution recognizes that design systems serve two distinct purposes: capturing *what* and *why* (human decisions) and providing *how* (code primitives).

> *"Sweat the art. We handle the mechanics. Return to flow."*

**Architecture**:
```
┌─────────────────────────────────────────────────┐
│              SIGIL PROCESS                      │
│   Human interaction layer                       │
│   Constitution, Lenses, Consultation, Surveys   │
│   Commands: /envision, /consult, /craft         │
└─────────────────────────────────────────────────┘
                      ↓
              design decisions flow down
                      ↓
┌─────────────────────────────────────────────────┐
│              SIGIL CORE                         │
│   React primitives layer                        │
│   Hooks, Layouts, Lens Components               │
│   useCriticalAction, CriticalZone, StrictLens   │
└─────────────────────────────────────────────────┘
```

**Sources**: sigil-v2.6.zip/README.md, User clarification (Process/Core separation)

---

## 1. Problem Statement

### 1.1 The Flow Problem

Craftsmen (product engineers and designers) lose flow state due to:

| Interruption | Impact |
|--------------|--------|
| Context loss after time away | "Where was I? What did we decide?" |
| Re-arguing settled questions | Bikeshedding on decisions already made |
| Consistency tracking burden | Manual enforcement of design rules |
| Implementation mechanics | Boilerplate distracts from feel |

### 1.2 The Two-System Problem

Current design systems conflate two concerns:

| Concern | What It Is | Who Owns It |
|---------|------------|-------------|
| **Process** | Design decisions, constraints, rules | Humans (designers, PMs, leads) |
| **Core** | Implementation primitives, components | Code (React, TypeScript) |

Mixing these creates friction: humans fight code, code can't capture intent.

### 1.3 v2.6 Solution

**Sigil Process** captures human decisions in YAML/markdown:
- Constitution (protected capabilities that ALWAYS work)
- Lens Array (user personas viewing same truth)
- Consultation Chamber (locked decisions with time periods)
- Vibe Checks (qualitative feedback surveys)

**Sigil Core** provides implementation primitives:
- React hooks (`useCriticalAction`, `useLocalCache`)
- Layout components (`CriticalZone`, `MachineryLayout`)
- Lens components (`DefaultLens`, `StrictLens`, `A11yLens`)

**Sources**: sigil-v2.6.zip/README.md:67-74, CLAUDE.md:1-50

---

## 2. Product Vision

### 2.1 Vision Statement

Sigil v2.6 protects the craftsman's flow state by:
1. **Capturing decisions** in durable, queryable format (Constitution, Consultation)
2. **Restoring context** after time away (/craft command)
3. **Handling mechanics** so humans focus on feel
4. **Locking settled questions** to prevent bikeshedding

### 2.2 Philosophy

**PROTECT:**
- Deep thinking about feel and soul
- Time for inspiration and observation
- The joy of sweating the right details
- Deep dives when the craft demands it

**REMOVE:**
- Implementation mechanics
- Consistency tracking
- Context loss after time away
- Re-arguing settled questions

### 2.3 Key Insight

> "The craftsman SHOULD sweat the details — that's the essence of craft. Sigil removes the *wrong* cognitive load so you can focus on the *right* details."

**Sources**: sigil-v2.6.zip/README.md:9-27

---

## 3. Target Users

### 3.1 Primary Users

**Product Engineers**
- Build interfaces using Sigil Core primitives
- Reference Constitution for protected capabilities
- Use /craft to restore context after time away
- Lock decisions with /consult to prevent revisiting

**Product Designers**
- Capture product feel with /envision
- Define user personas in Lens Array
- Set protected capabilities in Constitution
- Review locked decisions in Consultation Chamber

**AI Agents (Claude Code)**
- Read Constitution before generating UI code
- Check Consultation Chamber for locked decisions
- Surface relevant context when files are opened
- Warn (don't block) on violations

### 3.2 User Stories

| As a... | I want to... | So that... |
|---------|--------------|------------|
| Engineer | Restore context after vacation | I don't waste time figuring out where I was |
| Engineer | Lock the button color decision | Team stops bikeshedding on settled question |
| Designer | Capture product feel before it fades | Intent survives after meetings end |
| Designer | Define user personas | Different users get appropriate experiences |
| PM | Set protected capabilities | Core features can't be accidentally disabled |
| AI Agent | Know locked decisions | I don't suggest changes to settled areas |
| AI Agent | Read Constitution | I ensure protected capabilities work |

**Sources**: sigil-v2.6.zip/README.md:61-74, FLOWS.md:1-50

---

## 4. Architecture

### 4.1 Two-Tier Model

```
SIGIL PROCESS (Human Layer)
├── Constitution           # Protected capabilities (immutable)
├── Lens Array            # User personas (multiple truths)
├── Consultation Chamber  # Locked decisions (time-boxed)
├── Surveys               # Vibe checks (qualitative)
├── Moodboard             # Product feel (vision)
└── Rules                 # Design rules (codified taste)

              ↓ Design decisions flow down ↓

SIGIL CORE (Implementation Layer)
├── Core Hooks            # useCriticalAction, useLocalCache
├── Layouts               # CriticalZone, MachineryLayout, GlassLayout
├── Lenses                # DefaultLens, StrictLens, A11yLens
├── Profiler              # Ergonomic validation
└── Integrity             # Lens classification
```

### 4.2 Sigil Process Components

#### 4.2.1 Constitution (Protected Capabilities)

Capabilities that ALWAYS work, regardless of:
- Remote configuration
- Marketing campaigns
- A/B tests
- Lens selection
- User preferences

| Capability | Description | Enforcement |
|------------|-------------|-------------|
| `withdraw` | User can always exit position | Block |
| `deposit` | User can always add to position | Block |
| `risk_alert` | Warnings shown for high-risk actions | Block |
| `slippage_warning` | Slippage displayed before trades | Block |
| `fee_disclosure` | All fees shown before confirmation | Block |
| `balance_visible` | User can always see balance | Block |
| `error_messages` | Errors never suppressed | Block |
| `help_access` | Help available on every screen | Warn |

**Philosophy**: *"Marketing needs levers. Product needs brakes."*

**Sources**: sigil-v2.6.zip/sigil-mark/constitution/protected-capabilities.yaml

#### 4.2.2 Lens Array (User Personas)

Different perspectives viewing the same core product:

| Lens | Alias | Mental Model | Interaction Style |
|------|-------|--------------|-------------------|
| `power_user` | Chef | Financial instrument | Keyboard-driven, dense |
| `newcomer` | Henlocker | Physical jar | Tactile, forgiving |
| `mobile` | Thumbzone | Pocket app | Thumb-reachable, gestural |
| `accessibility` | A11y | Structured document | Sequential, announced |

Each lens defines:
- Target audience
- Physics (tap targets, input method, shortcuts)
- Constraints (required vs optional)
- Validation rules

**Philosophy**: *"Multiple truths coexist on top of core."*

**Sources**: sigil-v2.6.zip/sigil-mark/lens-array/lenses.yaml

#### 4.2.3 Consultation Chamber (Locked Decisions)

After deliberation, lock decisions to prevent bikeshedding:

| Scope | Lock Period | Use Case |
|-------|-------------|----------|
| Strategic | 180 days | Fundamental direction |
| Direction | 90 days | Pattern choice |
| Execution | 30 days | Implementation detail |

Example:
```
Decision: Primary CTA is Blue
ID: DEC-2026-001
Scope: Direction
Lock: 90 days
```

**Philosophy**: *"After you've thought deeply, lock it. Stop re-arguing."*

**Sources**: sigil-v2.6.zip/.claude/commands/consult.md

#### 4.2.4 Vibe Checks (Micro-Surveys)

Capture qualitative intent, not just quantitative clicks:

| Trigger | Question | Purpose |
|---------|----------|---------|
| Strategy change | "What were you looking for?" | Understand WHY users switched views |
| First deposit | "What brought you to us?" | Attribution |
| First withdraw | "Why are you withdrawing?" | Churn understanding |
| Card expanded | "What did you want to see?" | Information architecture |
| Transaction failed | "What happened?" | Error diagnosis |

**Philosophy**: *"'Expanded card 5x' tells us WHAT. 'Looking for fees' tells us WHY."*

**Sources**: sigil-v2.6.zip/sigil-mark/surveys/vibe-checks.yaml

### 4.3 Sigil Core Components

(Retained from v2.0 "Reality Engine")

| Component | Purpose |
|-----------|---------|
| `useCriticalAction` | State stream with time authorities |
| `useLocalCache` | Local-first state management |
| `CriticalZone` | Layout for financial/critical actions |
| `MachineryLayout` | Keyboard-navigable list layout |
| `GlassLayout` | Hover-enabled marketing layout |
| `DefaultLens` | Standard UI rendering |
| `StrictLens` | Forced in critical zones |
| `A11yLens` | High contrast, large targets |

**Sources**: loa-grimoire/archive/prd-v2.0.md

---

## 5. Functional Requirements

### 5.1 Sigil Process Requirements

**FR-PROC-001**: Constitution Enforcement
- Protected capabilities cannot be overridden by remote config
- Violations logged with justification requirement
- Audit trail for any override attempts

**FR-PROC-002**: Lens Array Management
- Lenses can be stacked (e.g., power_user + accessibility)
- Conflict resolution by priority order
- Immutable properties never vary between lenses

**FR-PROC-003**: Decision Locking
- Decisions locked with ID, scope, and duration
- Unlock requires justification
- /craft surfaces locked decisions for relevant files

**FR-PROC-004**: Vibe Check Collection
- Cooldown periods prevent survey fatigue
- Max 1 survey per session
- Pattern detection for research insights

**FR-PROC-005**: Zone Configuration
- Zones defined by path patterns in .sigilrc.yaml
- Zone determines motion, timing, lens enforcement
- Critical zones force strict lens

### 5.2 Sigil Core Requirements

(Retained from v2.0)

**FR-CORE-001**: Critical Action Hook
- State stream with time authorities
- Optimistic, server-tick, hybrid modes

**FR-CORE-002**: Layout Primitives
- CriticalZone: 32px gap, max 3 actions
- MachineryLayout: Keyboard navigation
- GlassLayout: Hover physics

**FR-CORE-003**: Lens System
- Built-in lenses: Default, Strict, A11y
- Ergonomic profiler validation
- Zone-based enforcement

### 5.3 Command Requirements

| Command | Input | Output | Human Effort |
|---------|-------|--------|--------------|
| `/setup` | None | .sigilrc.yaml, sigil-mark/ | Low |
| `/envision` | Interview | moodboard.md | Medium |
| `/codify` | Interview | rules.md | Medium |
| `/craft` | File path (optional) | Context restoration | Low |
| `/consult` | Topic | Locked decision | Low |
| `/garden` | None | Health report | Low |
| `/inherit` | Codebase | Bootstrap rules | Medium |

**Sources**: sigil-v2.6.zip/PROCESS.md, .claude/commands/*

---

## 6. Technical Requirements

### 6.1 Technology Stack

| Component | Technology |
|-----------|------------|
| Process Layer | YAML, Markdown |
| Core Layer | React 18+, TypeScript |
| Styling | Tailwind CSS |
| Distribution | Mount script (sigil-mark/) |
| Configuration | .sigilrc.yaml |

### 6.2 File Structure

```
sigil-mark/
├── constitution/                  # Protected capabilities
│   └── protected-capabilities.yaml
├── lens-array/                    # User personas
│   └── lenses.yaml
├── consultation-chamber/          # Locked decisions
│   ├── config.yaml
│   └── decisions/
│       └── *.yaml
├── surveys/                       # Vibe checks
│   └── vibe-checks.yaml
├── moodboard.md                   # Product feel
├── rules.md                       # Design rules
│
├── core/                          # Physics engines (Core)
│   ├── use-critical-action.ts
│   ├── use-local-cache.ts
│   └── types.ts
├── layouts/                       # Layout primitives (Core)
│   ├── critical-zone.tsx
│   ├── machinery-layout.tsx
│   └── glass-layout.tsx
├── lenses/                        # UI renderers (Core)
│   ├── default/
│   ├── strict/
│   └── a11y/
└── index.ts                       # Public API
```

### 6.3 Integration Points

| System | Integration |
|--------|-------------|
| Loa | After Loa builds, use /craft to refine interface |
| Claude Code | Reads Constitution, Consultation before generating UI |
| Remote Config | Marketing can control aliases, themes (not Constitution) |
| Analytics | Vibe check responses → research dashboard |

---

## 7. Scope & Prioritization

### 7.1 MVP Scope

**Phase 1: Process Foundation**
1. Constitution system (protected capabilities)
2. Consultation Chamber (locked decisions)
3. /craft command (context restoration)
4. /consult command (decision locking)
5. .sigilrc.yaml zone configuration

**Phase 2: Persona System**
1. Lens Array (user personas)
2. Lens stacking and conflict resolution
3. Zone-based lens enforcement
4. Validation rules per lens

**Phase 3: Feedback Loop**
1. Vibe Checks (micro-surveys)
2. Pattern detection
3. Research dashboard integration

### 7.2 Out of Scope

- Multi-player sync engine (Figma-style CRDT)
- Server-side rendering support
- Native mobile (React Native)
- Custom lens marketplace
- Real-time collaboration on decisions

---

## 8. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Context restoration time | < 30 seconds | Time from /craft to productive work |
| Decision re-argument rate | 0 | Locked decisions that get reopened |
| Constitution violations | 0 in production | Protected capabilities always work |
| Vibe check response rate | > 30% | Survey completion rate |
| Lens validation pass rate | 100% | All lenses pass ergonomic profiler |

---

## 9. Risks & Mitigations

### 9.1 Process Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Constitution too restrictive | Medium | High | Allow justified overrides with audit |
| Lock periods too long/short | Medium | Medium | Configurable per-decision |
| Survey fatigue | Medium | Low | Cooldowns, max per session |

### 9.2 Integration Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Process/Core coupling | Medium | High | Clear separation, typed interfaces |
| AI misinterprets Constitution | Low | High | CLAUDE.md instructions, examples |
| Remote config override abuse | Low | High | Engineering controls (not remote) |

---

## 10. Glossary

| Term | Definition |
|------|------------|
| **Constitution** | Protected capabilities that always work |
| **Lens** | User persona with physics and constraints |
| **Consultation** | Process for locking deliberated decisions |
| **Vibe Check** | Micro-survey capturing qualitative intent |
| **Zone** | Area of product with specific motion/timing |
| **Sigil Process** | Human interaction layer (YAML/markdown) |
| **Sigil Core** | Implementation layer (React/TypeScript) |

---

## 11. Next Steps

1. `/architect` — Create Software Design Document
2. `/sprint-plan` — Break down into implementation sprints
3. `/implement sprint-1` — Begin with Constitution system

---

## Appendix: Source Tracing

| Section | Sources |
|---------|---------|
| Executive Summary | sigil-v2.6.zip/README.md, User clarification |
| Problem Statement | sigil-v2.6.zip/README.md:67-74, CLAUDE.md |
| Vision | sigil-v2.6.zip/README.md:9-27 |
| Architecture | sigil-v2.6.zip structure, User clarification |
| Constitution | sigil-v2.6.zip/sigil-mark/constitution/protected-capabilities.yaml |
| Lens Array | sigil-v2.6.zip/sigil-mark/lens-array/lenses.yaml |
| Consultation | sigil-v2.6.zip/.claude/commands/consult.md |
| Vibe Checks | sigil-v2.6.zip/sigil-mark/surveys/vibe-checks.yaml |
| Core Components | loa-grimoire/archive/prd-v2.0.md |
| Commands | sigil-v2.6.zip/PROCESS.md, .claude/commands/* |
| File Structure | sigil-v2.6.zip directory structure |

---

*PRD generated from sigil-v2.6.zip context and v2.0 archive*
*Architecture: Sigil Process (human) + Sigil Core (implementation)*
