# Development Process

This document outlines the Sigil v0.3 workflow for capturing and maintaining design context in AI-assisted development.

> "Culture is the Reality. Code is Just the Medium."

## Philosophy

Sigil v0.3 is a constitutional framework that protects both intended soul (Immutable Values) and emergent soul (Canon of Flaws). It enables culture through:

- **Soul Protection** — Both intended and emergent soul are protected
- **Multiple Truths** — Different users can have different valid experiences (Lenses)
- **Layered Authority** — Not every decision needs community input (Consultation Chamber)
- **Prove at Scale** — Features must demonstrate stability before becoming canonical
- **Human Accountability** — All automated decisions can be overridden (with logging)

Systems that block will be bypassed. Systems that enable will be adopted.

---

## Four Pillars

| Pillar | Directory | Purpose |
|--------|-----------|---------|
| Soul Binder | `soul-binder/` | Protects values and emergent behaviors |
| Lens Array | `lens-array/` | Supports multiple user truths |
| Consultation Chamber | `consultation-chamber/` | Layered decision authority |
| Proving Grounds | `proving-grounds/` | Scale validation before production |

---

## Overview

Sigil's workflow has two paths:

### New Project Path
```
/setup → /envision → /codify → (build) → /craft → /approve
```

### Existing Codebase Path
```
/setup → /inherit → /envision → /codify → (build) → /craft → /approve
```

---

## Command Decision Tree

Use this to quickly find the right command:

```
┌─ Starting a project?
│  ├─ New project → /setup → /envision → /codify
│  └─ Existing code → /setup → /inherit → /envision
│
├─ During development?
│  ├─ Need design guidance → /craft
│  ├─ Validate in specific lens → /craft --lens <name>
│  └─ New pattern needs sign-off → /approve
│
├─ Protecting culture?
│  ├─ Emergent behavior to protect → /canonize
│  ├─ Major design decision → /consult
│  └─ Need to revisit locked decision → /unlock
│
├─ Validating at scale?
│  ├─ Feature ready for proving → /prove
│  └─ Proving complete → /graduate
│
└─ Maintenance?
   └─ Get framework updates → /update
```

---

## Commands

### Phase 0: Setup (`/setup`)

**Goal**: Initialize Sigil on a repository

**Process**:
1. Creates `sigil-mark/` directory structure
2. Initializes `.sigilrc.yaml` configuration
3. Creates `.sigil-setup-complete` marker
4. Displays next steps

**Command**:
```bash
/setup
```

**Outputs**:
- `sigil-mark/` directory
- `.sigilrc.yaml` (zone configuration)
- `.sigil-setup-complete` marker

---

### Phase 1A: Envision (`/envision`) - New Projects

**Skill**: `envisioning-moodboard`

**Goal**: Capture product moodboard through interview

**Process**:
1. **Reference Products**: What games, apps, or products inspire the feel?
2. **Feel Descriptors**: How should different contexts feel? (critical = deliberate, marketing = playful)
3. **Anti-Patterns**: What to explicitly avoid?
4. **Key Moments**: High-stakes, celebrations, error recovery

**Command**:
```bash
/envision
```

**Output**: `sigil-mark/moodboard.md`

**Moodboard Structure**:
```markdown
# Product Moodboard

## Reference Products
- [Product] - Why it inspires us

## Feel by Context
| Context | Feel | Example |
|---------|------|---------|
| Critical | Deliberate, reassuring | Checkout, claims |
| Marketing | Playful, energetic | Landing pages |

## Anti-Patterns
- Pattern to avoid - Why

## Key Moments
- High-stakes: How to handle
- Celebrations: How to handle
- Recovery: How to handle
```

---

### Phase 1B: Inherit (`/inherit`) - Existing Codebases

**Skill**: `inheriting-design`

**Goal**: Bootstrap design context from existing code

**Process**:
1. Scans codebase for components
2. Detects color tokens, typography, spacing
3. Identifies motion patterns in use
4. Generates draft moodboard and rules
5. Creates component inventory

**Command**:
```bash
/inherit
```

**Outputs**:
- `sigil-mark/moodboard.md` (draft, needs review)
- `sigil-mark/rules.md` (draft, needs review)
- `sigil-mark/inventory.md` (component list)

**Note**: After `/inherit`, run `/envision` to refine the moodboard with intent, not just observation.

---

### Phase 2: Codify (`/codify`)

**Skill**: `codifying-rules`

**Goal**: Define explicit design rules by category

**Process**:
1. **Colors**: Token definitions, light/dark modes
2. **Typography**: Font classes, size conventions
3. **Spacing**: Values and when to use them
4. **Motion**: Recipes by zone (deliberate, playful, snappy)
5. **Components**: Specific component rules

**Command**:
```bash
/codify
```

**Output**: `sigil-mark/rules.md`

**Rules Structure**:
```markdown
# Design Rules

## Colors
| Token | Light | Dark | Usage |
|-------|-------|------|-------|

## Typography
| Class | Size | Weight | Usage |
|-------|------|--------|-------|

## Spacing
| Value | Usage |
|-------|-------|

## Motion by Zone
| Zone | Recipe | Duration | Spring |
|------|--------|----------|--------|

## Component Rules
- Component: Specific guidance
```

---

### Phase 3: Build (Your Work)

With moodboard and rules captured, you build your product. Sigil provides context to AI agents during this phase.

**What Happens Automatically**:
- Agents read `sigil-mark/moodboard.md` and `sigil-mark/rules.md`
- Zone resolution based on file path in `.sigilrc.yaml`
- Pattern suggestions based on zone

---

### Phase 4: Craft (`/craft`)

**Skill**: `crafting-guidance`

**Goal**: Get design guidance during implementation

**Modes**:

1. **Zone Detection**: Which zone is this file in?
   ```bash
   /craft src/features/checkout/PaymentForm.tsx
   ```

2. **Pattern Suggestion**: What pattern fits this context?
   ```bash
   /craft "loading state for checkout"
   ```

3. **Rule Lookup**: What's the rule for this?
   ```bash
   /craft "button spacing"
   ```

4. **Forced Lens Mode**: Validate in a specific lens
   ```bash
   /craft --lens power_user "accessible loading state"
   ```

**Command**:
```bash
/craft [--lens <lens_name>] [file_path | question]
```

**Arguments**:
| Argument | Description |
|----------|-------------|
| `--lens <name>` | Force validation in specific lens (e.g., `power_user`, `new_visitor`) |
| `file_path` | Path to get zone context for |
| `question` | Design question to answer |

**Output**: Conversational guidance with zone context

---

### Phase 5: Approve (`/approve`)

**Skill**: `approving-patterns`

**Goal**: Human sign-off on design patterns

**Process**:
1. Review new patterns or deviations
2. Taste owner approves or requests changes
3. Approval recorded in rules

**Command**:
```bash
/approve
```

**Output**: Approval record in `sigil-mark/rules.md`

---

### Maintenance: Update (`/update`)

**Goal**: Pull latest Sigil framework updates

**Command**:
```bash
/update
```

**What Happens**:
1. Fetches latest from upstream
2. Updates symlinks to new versions
3. Preserves your `sigil-mark/` content

---

## v0.3 Constitutional Commands

### Canonize (`/canonize`)

**Skill**: `canonizing-flaws`

**Goal**: Protect emergent behaviors that users love

**Process**:
1. Identify a behavior that emerged organically
2. Document why it matters
3. Register in Canon of Flaws

**Command**:
```bash
/canonize "double-click submit"
```

**Output**: `sigil-mark/soul-binder/canon-of-flaws.yaml`

---

### Consult (`/consult`)

**Skill**: `consulting-decisions`

**Goal**: Start a consultation process for design decisions

**Layers**:
| Layer | Process | Authority |
|-------|---------|-----------|
| Strategic | Community poll | Binding vote |
| Direction | Sentiment gathering | Taste Owner decides |
| Execution | None | Taste Owner dictates |

**Command**:
```bash
/consult "new onboarding flow"
```

**Output**: `sigil-mark/consultation-chamber/decisions/{id}.yaml`

---

### Prove (`/prove`)

**Skill**: `proving-features`

**Goal**: Register a feature for proving period

**Domains**: defi, creative, community, games, general

**Command**:
```bash
/prove token-swap --domain defi
```

**Output**: `sigil-mark/proving-grounds/active/{feature}.yaml`

---

### Graduate (`/graduate`)

**Skill**: `graduating-features`

**Goal**: Graduate a proven feature to the Living Canon

**Requirements**:
- All monitors green
- No P1 violations
- Taste Owner sign-off

**Command**:
```bash
/graduate token-swap
```

**Output**: `sigil-mark/canon/graduated/{feature}.yaml`

---

### Unlock (`/unlock`)

**Skill**: `unlocking-decisions`

**Goal**: Unlock a locked decision before its natural unlock date

**When to Use**:
- Decision was locked but circumstances changed
- Need to revisit a decision earlier than planned
- Taste Owner needs to override a lock

**Command**:
```bash
/unlock DEC-001
```

**Process**:
1. Verifies decision exists and is locked
2. Checks if natural unlock time has passed
3. If still locked, requires justification
4. Updates decision record with unlock reason
5. Logs override to audit trail

**Output**: Updated `sigil-mark/consultation-chamber/decisions/{id}.yaml`

---

## Strictness Levels

Sigil v0.3 has progressive strictness:

| Level | Behavior |
|-------|----------|
| `discovery` | All suggestions, no blocks (default) |
| `guiding` | Warnings on violations |
| `enforcing` | Blocks on protected flaws/values |
| `strict` | Blocks on all violations |

Configure in `.sigilrc.yaml`:
```yaml
strictness: "discovery"
```

---

## Zone System

Zones define design context by file path. They're configured in `.sigilrc.yaml`:

```yaml
zones:
  critical:
    paths: ["src/features/checkout/**", "src/features/claim/**"]
    motion: "deliberate"
    patterns:
      prefer: ["deliberate-entrance", "confirmation-flow"]
      warn: ["instant-transition", "playful-bounce"]

  marketing:
    paths: ["src/features/marketing/**"]
    motion: "playful"
    patterns:
      prefer: ["playful-bounce", "attention-grab"]

  admin:
    paths: ["src/admin/**"]
    motion: "snappy"
```

### Zone Resolution

When you're working in a file:

1. Agent gets current file path
2. Matches against zone patterns in `.sigilrc.yaml`
3. Returns zone name (or "default" if no match)
4. Applies zone-appropriate patterns

### Motion Recipes by Zone

| Zone | Recipe | Feel | Parameters |
|------|--------|------|------------|
| critical | `useDeliberateEntrance` | Heavy, reassuring | 800ms+, tension: 120 |
| marketing | `usePlayfulBounce` | Bouncy, energetic | Fast, tension: 200 |
| admin | `useSnappyTransition` | Instant, efficient | <200ms, tension: 400 |

---

## Rejections

Rejections are patterns to avoid, but **not blocked**:

```yaml
rejections:
  - pattern: "Spinner"
    reason: "Creates anxiety in critical zones"
    exceptions: ["admin/**"]
```

When a user wants a rejected pattern, agents:
1. Explain the concern
2. Offer alternatives
3. Allow override if user insists

Example response:
> "Spinners are noted as creating anxiety in critical zones. Alternatives:
> 1. Skeleton loading with deliberate reveal
> 2. Progress indicator with copy
>
> If you still need a spinner, I can add it—just note this deviates from established patterns."

---

## State Zone Structure

All design context lives in `sigil-mark/` (v0.3 four-pillar architecture):

```
sigil-mark/
├── moodboard.md              # Product feel
├── rules.md                  # Design rules by category
├── inventory.md              # Component list
│
├── soul-binder/              # Pillar 1: Values + Flaws
│   ├── immutable-values.yaml # Core values (hard-block violations)
│   ├── canon-of-flaws.yaml   # Protected emergent behaviors
│   └── visual-soul.yaml      # Grit signatures
│
├── lens-array/               # Pillar 2: User personas
│   └── lenses.yaml           # Multi-truth validation
│
├── consultation-chamber/     # Pillar 3: Decisions
│   ├── config.yaml           # Decision authority config
│   └── decisions/            # Individual decision records
│
├── proving-grounds/          # Pillar 4: Feature proving
│   ├── config.yaml           # Monitor configuration
│   └── active/               # Features currently proving
│
├── canon/                    # Graduated features
│   └── graduated/
│
└── audit/                    # Override logging
    └── overrides.yaml
```

---

## Skills

Sigil uses modular skills with 3-level architecture:

```
.claude/skills/{skill-name}/
├── index.yaml          # Metadata (~100 tokens)
├── SKILL.md            # Instructions (~2000 tokens)
└── scripts/            # Bash utilities
```

### Core Skills
| Skill | Purpose |
|-------|---------|
| `initializing-sigil` | Initialize Sigil v0.3 |
| `envisioning-moodboard` | Capture moodboard + values + lenses |
| `codifying-rules` | Define rules |
| `crafting-guidance` | Provide guidance |
| `approving-patterns` | Human sign-off |
| `inheriting-design` | Bootstrap from codebase |
| `updating-framework` | Pull updates |

### v0.3 Skills
| Skill | Purpose |
|-------|---------|
| `canonizing-flaws` | Protect emergent behaviors |
| `consulting-decisions` | Start decision consultation |
| `proving-features` | Register feature for proving |
| `graduating-features` | Graduate feature to canon |
| `validating-lenses` | Validate across user lenses |
| `locking-decisions` | Lock decisions after outcome |
| `unlocking-decisions` | Unlock decisions early |
| `monitoring-features` | Update proving monitors |

---

## Example Workflow

### New Project

```bash
# 1. Initialize Sigil
/setup

# 2. Capture product feel through interview
/envision
# → Answer questions about references, feel, anti-patterns
# → Review sigil-mark/moodboard.md

# 3. Define explicit design rules
/codify
# → Answer questions about colors, typography, spacing, motion
# → Review sigil-mark/rules.md

# 4. Build your product (your work)
# Agents automatically load design context

# 5. Get guidance during implementation
/craft src/features/checkout/PaymentForm.tsx
# → Zone detected: critical
# → Motion recipe: useDeliberateEntrance

# 6. Get human sign-off on new patterns
/approve
```

### Existing Codebase

```bash
# 1. Initialize Sigil
/setup

# 2. Scan codebase to bootstrap context
/inherit
# → Generates draft moodboard, rules, inventory

# 3. Refine moodboard with intent
/envision

# 4. Refine rules with explicit decisions
/codify

# 5. Continue with craft/approve as needed
```

---

## Best Practices

### Capturing Feel
- Be specific about contexts (checkout feels different than marketing)
- Include anti-patterns with reasons
- Reference real products, not abstract concepts

### Defining Rules
- Start loose, tighten as patterns emerge
- Document the "why" not just the "what"
- Use zone-appropriate motion recipes

### During Implementation
- Check zone before adding motion
- Use `/craft` when uncertain
- Request `/approve` for new patterns

### Approval Flow
- Taste owners (not bots) approve
- Document approvals in rules
- Allow escape hatches for edge cases

---

## Related Documentation

- **[README.md](README.md)** - Quick start guide
- **[INSTALLATION.md](INSTALLATION.md)** - Detailed installation guide
- **[CLAUDE.md](CLAUDE.md)** - Agent protocol reference
- **[MIGRATION.md](MIGRATION.md)** - Migration from v0.2 to v0.3
- **[CHANGELOG.md](CHANGELOG.md)** - Version history
