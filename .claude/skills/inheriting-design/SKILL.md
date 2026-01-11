---
zones:
  state:
    paths:
      - sigil-mark/
    permission: read-write
  config:
    paths:
      - .sigil-setup-complete
      - .sigilrc.yaml
    permission: read
  app:
    paths:
      - components/
      - src/components/
      - app/components/
      - src/features/
    permission: read
---

# Sigil Inheriting Skill

## Purpose

Bootstrap Sigil design context from an existing codebase. Scans components, infers patterns, and creates draft documents for human review.

## Pre-Flight Checks

1. **Sigil Setup**: Verify `.sigil-setup-complete` exists
2. **Component Paths**: Read `.sigilrc.yaml` for component_paths
3. **Existing Files**: Check for existing moodboard.md/rules.md (warn if present)

## Workflow

### Step 1: Discover Components

Use detect-components.sh or Glob to find components:

```bash
.claude/skills/initializing-sigil/scripts/detect-components.sh --json
```

Or manually glob:
- `components/**/*.tsx`
- `src/components/**/*.tsx`
- `app/components/**/*.tsx`

### Step 2: Analyze Components

For each component file, extract:

**File Analysis**:
```
1. Read component file
2. Extract:
   - Component name
   - Props interface
   - CSS classes used
   - Animation imports
   - Color/spacing values
```

**Pattern Detection**:

Colors:
- Look for Tailwind classes: `bg-*`, `text-*`, `border-*`
- Look for CSS variables: `var(--*)`
- Look for theme tokens

Typography:
- Look for `text-*` classes
- Look for `font-*` classes
- Look for heading patterns

Spacing:
- Look for `p-*`, `m-*`, `gap-*` classes
- Look for spacing constants

Motion:
- Look for `framer-motion` imports
- Look for `react-spring` imports
- Look for CSS transitions/animations
- Extract duration and easing values

### Step 3: Interview for Tacit Knowledge

**Question 1: Overall Feel**
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

**Question 2: Rejected Patterns**
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

**Question 3: Representative Components**
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

Follow up if "I'll specify" is selected.

### Step 4: Generate Inventory

Write `sigil-mark/inventory.md`:

```markdown
# Component Inventory

**Generated**: [Date]
**Source**: [List of scanned directories]

---

## Components

| Component | Path | Category | Notes |
|-----------|------|----------|-------|
| Button | components/Button.tsx | Primitive | [any notes] |
| Card | components/Card.tsx | Primitive | |
| Header | components/Header.tsx | Layout | |
| TransactionForm | features/checkout/TransactionForm.tsx | Feature | |

---

## Inferred Patterns

### Colors
- Primary: [detected]
- Secondary: [detected]
- Background: [detected]
- Text: [detected]

### Typography
- Headings: [detected font/sizes]
- Body: [detected font/sizes]
- Mono: [detected if present]

### Spacing
- Base unit: [detected, e.g., 4px]
- Common gaps: [detected values]
- Container padding: [detected]

### Motion
- Library: [framer-motion/react-spring/CSS]
- Common duration: [detected]
- Common easing: [detected]

---

## Representative Components

[From interview, with brief analysis of each]
```

### Step 5: Generate Draft Moodboard

Write `grimoires/sigil/moodboard.md`:

```markdown
# Product Moodboard

**Product**: [Inferred from package.json or ask]
**Created**: [Date]
**Updated**: [Date]
**Status**: DRAFT - Needs human review

---

> **DRAFT**: This moodboard was generated from codebase analysis and brief interview.
> Review and refine with `/envision` for complete capture, or edit manually.

## Reference Products

### Inferred from Code
- [Based on libraries and patterns detected]
- [e.g., "Uses framer-motion similar to Linear.app"]

---

## Feel Descriptors

| Context | Feel | Confidence |
|---------|------|------------|
| Transactions | [From interview] | High |
| Success states | [Inferred] | Medium |
| Loading | [Inferred from patterns] | Medium |
| Errors | [Inferred] | Low |

---

## Anti-Patterns

| Pattern | Reason | Source |
|---------|--------|--------|
| [From interview] | [Reason given] | Interview |
| [Inferred] | [Inferred reason] | Code analysis |

---

## Key Moments

> Not captured in /inherit. Run /envision to define key moments.

### High-Stakes Actions
[To be defined]

### Celebrations
[To be defined]

### Recovery
[To be defined]
```

### Step 6: Generate Draft Rules

Write `sigil-mark/rules.md`:

```markdown
# Design Rules

**Version**: 1.0
**Updated**: [Date]
**Status**: DRAFT - Needs human review

---

> **DRAFT**: These rules were inferred from codebase analysis.
> Review and refine with `/codify` for complete definition, or edit manually.

## Colors

| Token | Light | Dark | Source |
|-------|-------|------|--------|
| primary | [detected] | [detected] | Code |
| secondary | [detected] | [detected] | Code |
| background | [detected] | [detected] | Code |
| text | [detected] | [detected] | Code |

---

## Typography

| Element | Class/Value | Notes |
|---------|-------------|-------|
| h1 | [detected] | |
| h2 | [detected] | |
| body | [detected] | |
| small | [detected] | |

---

## Spacing

| Context | Value | Notes |
|---------|-------|-------|
| base | [detected] | |
| component-gap | [detected] | |
| section-gap | [detected] | |
| container-padding | [detected] | |

---

## Motion

### By Zone

| Zone | Style | Timing | Notes |
|------|-------|--------|-------|
| critical | [inferred] | [detected] | |
| marketing | [inferred] | [detected] | |
| admin | [inferred] | [detected] | |

### Detected Patterns

| Pattern | Duration | Easing | Source |
|---------|----------|--------|--------|
| [detected] | [value] | [value] | [file] |

---

## Components

> Component-specific rules to be defined in /codify

---

## Approvals

| Component | Approved | Date | By |
|-----------|----------|------|----|
| [None yet] | | | |
```

## Script: infer-patterns.sh

```bash
#!/usr/bin/env bash
# Infer design patterns from codebase
# Usage: infer-patterns.sh [component-dir]
set -e

DIR="${1:-.}"

echo "=== Colors ==="
# Find Tailwind color classes
grep -rho 'bg-[a-z]*-[0-9]*\|text-[a-z]*-[0-9]*' "$DIR" 2>/dev/null | sort | uniq -c | sort -rn | head -10

echo ""
echo "=== Typography ==="
# Find text size classes
grep -rho 'text-[a-z]*\|font-[a-z]*' "$DIR" 2>/dev/null | sort | uniq -c | sort -rn | head -10

echo ""
echo "=== Spacing ==="
# Find spacing classes
grep -rho 'p-[0-9]*\|m-[0-9]*\|gap-[0-9]*' "$DIR" 2>/dev/null | sort | uniq -c | sort -rn | head -10

echo ""
echo "=== Motion ==="
# Find animation imports
grep -rh 'framer-motion\|react-spring\|@react-spring' "$DIR" 2>/dev/null | head -5
# Find transition/animation values
grep -rho 'duration-[0-9]*\|transition-[a-z]*' "$DIR" 2>/dev/null | sort | uniq -c | sort -rn | head -5
```

## Success Output

```
Inherit Complete!

Scanned:
  - X component directories
  - Y component files

Generated:
  - sigil-mark/inventory.md (X components)
  - grimoires/sigil/moodboard.md (DRAFT)
  - sigil-mark/rules.md (DRAFT)

Drafts are marked for human review.

Next steps:
  - Review drafts and edit as needed
  - Run /envision to capture complete moodboard
  - Run /codify to define complete rules
```
