---
name: "inherit"
version: "2.0.0"
description: |
  Bootstrap design system from existing codebase.
  Scans components, infers patterns, and creates draft moodboard and rules.

command_type: "analysis"

arguments: []

pre_flight:
  - check: "file_exists"
    path: ".sigil-setup-complete"
    error: "Sigil not set up. Run /setup first."

outputs:
  - path: "sigil-mark/inventory.md"
    type: "file"
    description: "Component inventory from codebase scan"
  - path: "sigil-mark/moodboard.md"
    type: "file"
    description: "Draft moodboard (needs human review)"
  - path: "sigil-mark/rules.md"
    type: "file"
    description: "Draft rules (needs human review)"

mode:
  default: "foreground"
  allow_background: false
---

# Inherit

## Purpose

Bootstrap Sigil design context from an existing codebase. Scans components, infers design patterns, and creates draft documents that need human review.

## Invocation

```
/inherit
```

## Prerequisites

- Sigil must be set up (`.sigil-setup-complete` exists)
- Existing component code to analyze

## Workflow

### Phase 1: Component Discovery

Run component detection:
```bash
.claude/skills/sigil-setup/scripts/detect-components.sh
```

For each discovered component directory, scan for:
- React/Vue/Svelte components
- CSS/Tailwind patterns
- Animation libraries (framer-motion, react-spring)

### Phase 2: Pattern Inference

Analyze discovered components for:

**Colors**:
- CSS custom properties (--color-*)
- Tailwind color usage
- Theme tokens

**Typography**:
- Font families
- Size scales
- Weight patterns

**Spacing**:
- Padding/margin patterns
- Gap values
- Layout conventions

**Motion**:
- Animation durations
- Easing functions
- Transition patterns

### Phase 3: Tacit Knowledge Interview

Use AskUserQuestion to gather context the code can't reveal:

```
question: "What's the overall feel you're going for with this product?"
header: "Feel"
options:
  - label: "Professional & Trustworthy"
    description: "Enterprise, finance, serious"
  - label: "Playful & Delightful"
    description: "Consumer, gaming, creative"
  - label: "Minimal & Efficient"
    description: "Developer tools, productivity"
  - label: "Custom"
    description: "Describe your own feel"
multiSelect: false
```

```
question: "Are there any patterns you've intentionally avoided?"
header: "Rejections"
options:
  - label: "Spinners"
    description: "Using skeleton loading instead"
  - label: "Modals"
    description: "Using inline or slide-over instead"
  - label: "Instant transitions"
    description: "Always animating state changes"
  - label: "None specific"
    description: "No intentional rejections"
multiSelect: true
```

```
question: "Which components best represent your design?"
header: "Representative"
options:
  - label: "I'll specify"
    description: "Name specific components"
  - label: "Most recent ones"
    description: "Latest components are most refined"
  - label: "Core UI primitives"
    description: "Button, Input, Card, etc."
  - label: "Feature components"
    description: "Complex composed components"
multiSelect: false
```

### Phase 4: Generate Inventory

Write `sigil-mark/inventory.md`:

```markdown
# Component Inventory

**Generated**: [Date]
**Source**: [Component directories]

---

## Components

| Component | Path | Category |
|-----------|------|----------|
| Button | components/Button.tsx | Primitive |
| Card | components/Card.tsx | Primitive |
| ...

---

## Inferred Patterns

### Colors
[Detected color tokens/patterns]

### Typography
[Detected type patterns]

### Spacing
[Detected spacing patterns]

### Motion
[Detected animation patterns]
```

### Phase 5: Generate Draft Moodboard

Write `sigil-mark/moodboard.md` with DRAFT markers:

```markdown
# Product Moodboard

**Product**: [Inferred]
**Created**: [Date]
**Status**: DRAFT - Needs human review

---

> **DRAFT**: This moodboard was generated from codebase analysis.
> Please review and refine with `/envision` or manual editing.

## Reference Products

### Inferred from Code
[Based on libraries, patterns detected]

---

## Feel Descriptors

| Context | Feel | Confidence |
|---------|------|------------|
| Transactions | [Inferred] | Low/Medium/High |
| ...

---

## Anti-Patterns

| Pattern | Source |
|---------|--------|
| [From interview] | User input |
| [Inferred from code] | Code analysis |
```

### Phase 6: Generate Draft Rules

Write `sigil-mark/rules.md` with DRAFT markers:

```markdown
# Design Rules

**Version**: 1.0
**Status**: DRAFT - Needs human review

---

> **DRAFT**: These rules were inferred from codebase analysis.
> Please review and refine with `/codify` or manual editing.

## Colors

| Token | Value | Source |
|-------|-------|--------|
| [Detected tokens] | | Code |

---

## Typography

| Element | Value | Source |
|---------|-------|--------|
| [Detected patterns] | | Code |

---

## Spacing

| Context | Value | Source |
|---------|-------|--------|
| [Detected patterns] | | Code |

---

## Motion

| Pattern | Duration | Easing | Source |
|---------|----------|--------|--------|
| [Detected] | | | Code |
```

## Arguments

| Argument | Description | Required |
|----------|-------------|----------|
| None | | |

## Outputs

| Path | Description |
|------|-------------|
| `sigil-mark/inventory.md` | Component list from codebase |
| `sigil-mark/moodboard.md` | Draft moodboard (marked for review) |
| `sigil-mark/rules.md` | Draft rules (marked for review) |

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "Sigil not set up" | Missing `.sigil-setup-complete` | Run `/setup` first |
| "No components found" | Empty component directories | Check component_paths in .sigilrc.yaml |

## Next Steps

After inherit:
- Review and refine with `/envision` (moodboard)
- Review and refine with `/codify` (rules)
- Or manually edit the draft files
