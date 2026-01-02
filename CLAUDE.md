# Sigil: Design Context Framework

> "Make the right path easy. Make the wrong path visible. Don't make the wrong path impossible."

## What is Sigil?

Sigil is a design context framework that helps AI agents make consistent design decisions by:

1. **Providing zone context** — Knowing if you're in "critical" vs "marketing" context
2. **Surfacing design rules** — Colors, typography, spacing, motion patterns
3. **Capturing product feel** — Moodboard with references and anti-patterns
4. **Human accountability** — All validation is human approval, not automation

---

## Quick Reference

### Commands

| Command | Purpose |
|---------|---------|
| `/setup` | Initialize Sigil on a repo |
| `/envision` | Capture product moodboard (interview) |
| `/codify` | Define design rules (interview) |
| `/craft` | Get design guidance during implementation |
| `/approve` | Human review and sign-off |
| `/inherit` | Bootstrap from existing codebase |
| `/update` | Pull framework updates |

### Key Files

| File | Purpose |
|------|---------|
| `sigil-mark/moodboard.md` | Product feel, references, anti-patterns |
| `sigil-mark/rules.md` | Design rules by category |
| `sigil-mark/inventory.md` | Component list |
| `.sigilrc.yaml` | Zone definitions, rejections |
| `.sigil-version.json` | Version tracking |

---

## Agent Protocol

### Before Generating UI Code

1. **Check for Sigil setup**: Look for `.sigil-setup-complete`
2. **Load design context**: Read `sigil-mark/moodboard.md` and `sigil-mark/rules.md`
3. **Determine zone**: Match current file path to zones in `.sigilrc.yaml`
4. **Apply zone patterns**: Use preferred patterns, warn about warned patterns

### Zone Resolution

```
1. Get current file path
2. Read .sigilrc.yaml zones section
3. For each zone, check if path matches any glob pattern
4. Return matching zone name or "default"
```

### When Suggesting Motion/Animation

Match recipe to zone:
- `critical` → deliberate (800ms+, heavy spring)
- `marketing` → playful (bouncy spring)
- `admin` → snappy (instant response)

### When User Wants a Rejected Pattern

Do NOT refuse. Explain the concern and offer alternatives.

Example:
```
User: "Add a spinner while processing"

Agent: "Spinners are noted in .sigilrc.yaml as potentially creating anxiety
in critical zones. Here are alternatives:

1. Skeleton loading with deliberate reveal
2. Progress indicator with copy
3. Confirmation animation

If you still need a spinner, I can add it - just note this deviates
from the established patterns."
```

---

## State Zone Structure

```
sigil-mark/
├── moodboard.md      # Product feel
│   ├── Reference Products (games, apps)
│   ├── Feel Descriptors (by context)
│   ├── Anti-Patterns (what to avoid)
│   └── Key Moments (high-stakes, celebrations, recovery)
│
├── rules.md          # Design rules
│   ├── Colors (tokens, light/dark)
│   ├── Typography (classes, conventions)
│   ├── Spacing (values, contexts)
│   ├── Motion (by zone, recipes)
│   ├── Components (specific rules)
│   └── Approvals (sign-offs)
│
└── inventory.md      # Component list
    ├── All components with paths
    └── Zone assignments
```

---

## .sigilrc.yaml Format

```yaml
version: "1.0"

component_paths:
  - "components/"
  - "src/components/"

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

rejections:
  - pattern: "Spinner"
    reason: "Creates anxiety in critical zones"
    exceptions: ["admin/**"]
```

---

## Skill Structure

Skills follow 3-level architecture:

```
.claude/skills/{skill-name}/
├── index.yaml          # Metadata (~100 tokens)
├── SKILL.md            # Instructions (~2000 tokens)
└── scripts/            # Bash utilities
```

### Available Skills

| Skill | Purpose |
|-------|---------|
| `sigil-setup` | Initialize Sigil |
| `sigil-envisioning` | Capture moodboard |
| `sigil-codifying` | Define rules |
| `sigil-crafting` | Provide guidance |
| `sigil-approving` | Human sign-off |
| `sigil-inheriting` | Bootstrap from codebase |
| `sigil-updating` | Pull updates |

---

## Workflow

### New Project

```
/setup → /envision → /codify → (build) → /craft → /approve
```

### Existing Codebase

```
/setup → /inherit → /envision → /codify → (build) → /craft → /approve
```

### During Implementation

When implementing UI components:
1. Load sigil context (moodboard + rules)
2. Check zone for current file
3. Apply zone-appropriate patterns
4. Warn (don't refuse) on rejected patterns
5. Suggest `/approve` for new patterns

---

## Philosophy

Sigil enables craft, it doesn't police it.

- **Right path easy**: Clear rules, zone context, pattern suggestions
- **Wrong path visible**: Warnings on rejected patterns, not blocks
- **Escape hatches exist**: Human can always override
- **Humans accountable**: Approval is human, not automated

---

## Coexistence with Loa

Sigil and Loa can coexist. They have separate:
- State zones (sigil-mark/ vs loa-grimoire/)
- Config files (.sigilrc.yaml vs .loa.config.yaml)
- Skills (sigil-* vs others)

No automatic cross-loading — developer decides when to reference design context.
