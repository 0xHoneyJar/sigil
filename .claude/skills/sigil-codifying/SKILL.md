---
zones:
  state:
    paths:
      - sigil-mark/rules.md
      - sigil-mark/moodboard.md
      - .sigilrc.yaml
    permission: read-write
  config:
    paths:
      - .sigil-setup-complete
    permission: read
---

# Sigil Codifying Skill

## Purpose

Define design rules through a structured interview. Captures colors, typography, spacing, motion patterns, and component-specific rules.

## Pre-Flight Checks

1. **Sigil Setup**: Verify `.sigil-setup-complete` exists
2. **Moodboard Context**: Read `sigil-mark/moodboard.md` for context (optional)
3. **Existing Rules**: Check if rules.md has content (offer update vs replace)

## Interview Flow

### Question 1: Color Strategy

```
question: "How do you manage colors in your design system?"
header: "Colors"
options:
  - label: "Tailwind defaults"
    description: "Using standard Tailwind color palette"
  - label: "Custom tokens"
    description: "Custom CSS variables or theme tokens"
  - label: "Brand colors only"
    description: "Small set of brand-specific colors"
  - label: "I'll specify"
    description: "Define specific color tokens"
multiSelect: false
```

**Follow-up** if "I'll specify" or "Custom tokens":
- "What are your primary colors?"
- "Do you support dark mode?"
- "What semantic colors do you use (success, error, warning)?"

### Question 2: Typography

```
question: "What typography approach do you use?"
header: "Typography"
options:
  - label: "System fonts"
    description: "Native system font stack"
  - label: "Single custom font"
    description: "One font family for everything"
  - label: "Heading + Body fonts"
    description: "Different fonts for headings and body"
  - label: "Custom scale"
    description: "Define specific type scale"
multiSelect: false
```

**Follow-up**:
- "What font families?"
- "What's your size scale?"

### Question 3: Spacing

```
question: "What's your spacing system?"
header: "Spacing"
options:
  - label: "4px base"
    description: "Multiples of 4 (4, 8, 12, 16, 24, 32...)"
  - label: "8px base"
    description: "Multiples of 8 (8, 16, 24, 32, 48...)"
  - label: "Tailwind default"
    description: "Standard Tailwind spacing scale"
  - label: "Custom"
    description: "Define your own spacing values"
multiSelect: false
```

### Question 4: Critical Zone Motion

```
question: "How should motion work in critical/high-stakes contexts?"
header: "Critical"
options:
  - label: "Deliberate (800ms+)"
    description: "Slow, weighty, builds confidence"
  - label: "Measured (400-600ms)"
    description: "Noticeable but not slow"
  - label: "Quick (200-400ms)"
    description: "Responsive but still visible"
  - label: "Custom"
    description: "Define specific timing"
multiSelect: false
```

### Question 5: Marketing Zone Motion

```
question: "How should motion work in marketing/showcase contexts?"
header: "Marketing"
options:
  - label: "Playful & Bouncy"
    description: "Attention-grabbing, fun springs"
  - label: "Elegant & Smooth"
    description: "Refined, sophisticated easing"
  - label: "Bold & Dynamic"
    description: "Strong, impactful movements"
  - label: "Custom"
    description: "Define specific feel"
multiSelect: false
```

### Question 6: Admin Zone Motion

```
question: "How should motion work in admin/utility contexts?"
header: "Admin"
options:
  - label: "Snappy (<200ms)"
    description: "Instant response, no waiting"
  - label: "Minimal"
    description: "Almost no animation"
  - label: "Subtle (200-300ms)"
    description: "Quick but noticeable"
  - label: "Same as critical"
    description: "Use critical zone settings"
multiSelect: false
```

### Question 7: Zone Paths

For each zone, ask for file paths:

```
question: "Which paths should use critical zone motion?"
header: "Paths"
options:
  - label: "checkout/**"
    description: "Checkout and payment flows"
  - label: "claim/**"
    description: "Claims and transactions"
  - label: "auth/**"
    description: "Authentication flows"
  - label: "I'll specify"
    description: "Define custom paths"
multiSelect: true
```

Repeat for marketing and admin zones.

### Question 8: Component Rules

```
question: "Any component-specific rules to capture?"
header: "Components"
options:
  - label: "Buttons"
    description: "Define button animation rules"
  - label: "Modals/Dialogs"
    description: "Define modal entrance/exit"
  - label: "Toasts/Notifications"
    description: "Define notification behavior"
  - label: "None for now"
    description: "Skip component rules"
multiSelect: true
```

**Follow-up** for each selection with specific rules.

## Output Generation

### rules.md

```markdown
# Design Rules

**Version**: 1.0
**Updated**: [Date]

---

## Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| primary | [value] | [value] | Main brand color |
| secondary | [value] | [value] | Secondary actions |
| background | [value] | [value] | Page background |
| surface | [value] | [value] | Card/component background |
| text | [value] | [value] | Primary text |
| text-muted | [value] | [value] | Secondary text |
| success | [value] | [value] | Success states |
| warning | [value] | [value] | Warning states |
| error | [value] | [value] | Error states |

---

## Typography

| Element | Class | Notes |
|---------|-------|-------|
| h1 | [class] | [notes] |
| h2 | [class] | |
| h3 | [class] | |
| body | [class] | |
| small | [class] | |
| mono | [class] | Code/technical |

---

## Spacing

| Context | Value | Notes |
|---------|-------|-------|
| base | [value] | Base unit |
| xs | [value] | Tight spacing |
| sm | [value] | Small gaps |
| md | [value] | Standard gaps |
| lg | [value] | Section spacing |
| xl | [value] | Large sections |

---

## Motion

### By Zone

| Zone | Style | Timing | Spring |
|------|-------|--------|--------|
| critical | [style] | [timing] | [config] |
| marketing | [style] | [timing] | [config] |
| admin | [style] | [timing] | [config] |

### Recipes

| Recipe | Zone | Parameters |
|--------|------|------------|
| deliberate-entrance | critical | duration: 800ms, ease: ease-out |
| playful-bounce | marketing | stiffness: 200, damping: 10 |
| snappy-transition | admin | duration: 150ms |

---

## Components

### Buttons
[Rules from interview]

### Modals
[Rules from interview]

### Toasts
[Rules from interview]

---

## Approvals

| Component | Approved | Date | By |
|-----------|----------|------|----|
| [None yet] | | | |
```

### .sigilrc.yaml Update

```yaml
version: "1.0"

component_paths:
  - "components/"
  - "src/components/"

zones:
  critical:
    paths:
      - "src/features/checkout/**"
      - "src/features/claim/**"
    motion: "deliberate"
    patterns:
      prefer:
        - "deliberate-entrance"
        - "confirmation-flow"
      warn:
        - "instant-transition"
        - "playful-bounce"

  marketing:
    paths:
      - "src/features/marketing/**"
      - "app/(marketing)/**"
    motion: "playful"
    patterns:
      prefer:
        - "playful-bounce"
        - "attention-grab"
      warn:
        - "instant-transition"

  admin:
    paths:
      - "src/features/admin/**"
      - "app/admin/**"
    motion: "snappy"
    patterns:
      prefer:
        - "snappy-transition"
      warn:
        - "deliberate-entrance"

rejections:
  - pattern: "Spinner"
    reason: "Creates anxiety in critical zones"
    exceptions: ["admin/**"]
```

## Handling Existing Rules

If `sigil-mark/rules.md` already has content:

```
question: "Design rules already exist. What would you like to do?"
header: "Existing"
options:
  - label: "Update existing"
    description: "Add to or refine current rules"
  - label: "Start fresh"
    description: "Replace with new rules"
  - label: "Cancel"
    description: "Keep existing, exit codify"
multiSelect: false
```

## Success Output

```
Rules Codified!

Written to: sigil-mark/rules.md
Updated: .sigilrc.yaml

Captured:
  - X color tokens
  - Typography scale
  - Spacing system
  - 3 zone configurations
  - Y component rules

Next step: /craft to get design guidance
```
