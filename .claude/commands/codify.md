---
name: "codify"
version: "2.0.0"
description: |
  Define design rules by category through interview.
  Captures colors, typography, spacing, motion, and component rules.

command_type: "interview"

arguments: []

pre_flight:
  - check: "file_exists"
    path: ".sigil-setup-complete"
    error: "Sigil not set up. Run /setup first."

outputs:
  - path: "sigil-mark/rules.md"
    type: "file"
    description: "Design rules organized by category"
  - path: ".sigilrc.yaml"
    type: "file"
    description: "Updated zone definitions"

mode:
  default: "foreground"
  allow_background: false
---

# Codify

## Purpose

Define design rules through a structured interview. Captures colors, typography, spacing, motion patterns, and component-specific rules. Updates `.sigilrc.yaml` with zone definitions.

## Invocation

```
/codify
```

## Prerequisites

- Sigil must be set up (`.sigil-setup-complete` exists)
- Recommended: Run `/envision` first to have moodboard context

## Workflow

### Phase 0: Load Context

Read `sigil-mark/moodboard.md` if it exists to inform questions and provide context.

### Phase 1: Colors

```
What are your key color tokens?

Think about:
- Primary/secondary brand colors
- Background and surface colors
- Text colors (primary, secondary, muted)
- Semantic colors (success, warning, error)
```

Ask about light/dark mode support.

### Phase 2: Typography

```
What typography patterns do you use?

Think about:
- Font families (heading, body, mono)
- Size scale (how do you size text?)
- Weight usage (when bold, when light?)
```

### Phase 3: Spacing

```
What are your spacing conventions?

Think about:
- Base unit (4px? 8px?)
- Component internal spacing
- Section/layout spacing
- Consistent gaps
```

### Phase 4: Motion by Zone

For each zone (critical, marketing, admin), ask:

```
How should motion work in [zone] contexts?

Options:
- Deliberate (800ms+, heavy spring)
- Playful (bouncy, attention-grabbing)
- Snappy (<200ms, instant response)
- Custom
```

### Phase 5: Zone Paths

For each zone, ask which file paths belong:

```
Which paths should use [zone] motion?

Examples:
- src/features/checkout/** (critical)
- src/features/marketing/** (marketing)
- src/features/admin/** (admin)
```

### Phase 6: Component Rules

```
Any component-specific rules to capture?

Examples:
- Button: always animate on hover
- Modal: deliberate entrance, quick exit
- Toast: snappy entrance from corner
```

### Phase 7: Generate Rules

Write `sigil-mark/rules.md`:

```markdown
# Design Rules

**Version**: 1.0
**Updated**: [Date]

---

## Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| primary | [value] | [value] | [usage] |
...

---

## Typography

| Element | Class | Notes |
|---------|-------|-------|
...

---

## Spacing

| Context | Value | Notes |
|---------|-------|-------|
...

---

## Motion

### By Zone

| Zone | Style | Timing | Notes |
|------|-------|--------|-------|
| critical | deliberate | 800ms+ | |
| marketing | playful | - | |
| admin | snappy | <200ms | |

### Recipes

| Recipe | Zone | Parameters |
|--------|------|------------|
...

---

## Components

[Component-specific rules]

---

## Approvals

| Component | Approved | Date | By |
|-----------|----------|------|----|
```

### Phase 8: Update .sigilrc.yaml

Update zone definitions with captured paths:

```yaml
zones:
  critical:
    paths: ["src/features/checkout/**", ...]
    motion: "deliberate"
    patterns:
      prefer: ["deliberate-entrance"]
      warn: ["instant-transition"]
  ...
```

## Arguments

| Argument | Description | Required |
|----------|-------------|----------|
| None | | |

## Outputs

| Path | Description |
|------|-------------|
| `sigil-mark/rules.md` | Design rules organized by category |
| `.sigilrc.yaml` | Updated zone definitions |

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "Sigil not set up" | Missing `.sigil-setup-complete` | Run `/setup` first |
| "Rules already exist" | Previous `/codify` | Offer to update or replace |

## Next Step

After codify: `/craft` to get design guidance during implementation
