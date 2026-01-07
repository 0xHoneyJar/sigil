---
zones:
  state:
    paths:
      - sigil-mark/rules.md
      - sigil-mark/moodboard.md
      - sigil-mark/vocabulary/
      - .sigilrc.yaml
    permission: read-write
  config:
    paths:
      - .sigil-setup-complete
      - sigil-mark/personas/personas.yaml
    permission: read-write
---

# Sigil Codifying Skill (v4.0)

## Purpose

Define design rules through a structured interview with progressive disclosure. Captures:
1. **Design Tokens** — Colors, typography, spacing
2. **Zone Configurations** — Journey-based contexts with trust states
3. **Motion Recipes** — Zone-specific animation patterns
4. **Component Rules** — Specific component constraints

## Philosophy

> "Layout-based zones declare context. Journey-based zones explain why."

v4.0 zones include **journey context** (what stage of the user journey) and **persona mapping** (who is likely in this zone).

---

## Progressive Disclosure (v4.0)

### L1: Full Interview (Default)
```
/codify
```
Full guided interview for design tokens, zones, and rules.

### L2: Single Zone Definition
```
/codify --zone critical
```
Define a single zone with journey context:
- Zone paths
- Journey stage
- Likely persona
- Trust state
- Motion style

### L3: Import from Design System
```
/codify --from design-tokens.json
```
Import existing design system:
- Parses JSON/YAML token files
- Extracts colors, typography, spacing
- Confirms mapping with user
- Creates rules.md automatically

### Quick Rules
```
/codify --quick
```
Minimal interview:
- Color strategy (Tailwind/custom)
- One zone configuration
- Skip component rules

---

## Auto-Setup (v4.0)

No need for explicit `/setup`. If Sigil is not initialized:

1. Create `sigil-mark/` directory structure
2. Create `.sigilrc.yaml` with defaults
3. Continue with interview

```
I notice Sigil hasn't been set up yet. I'll initialize it now...

Created:
  - sigil-mark/
  - .sigilrc.yaml

Now let's define your design rules.
```

---

## Pre-Flight Checks

1. **Auto-Setup**: If `.sigil-setup-complete` missing, initialize Sigil
2. **Moodboard Context**: Read `sigil-mark/moodboard.md` for context (optional)
3. **Personas Context**: Read `sigil-mark/personas/personas.yaml` for persona list
4. **Existing Rules**: Check if rules.md has content (offer update vs replace)

---

## Interview Flow

### Section 1: Design Tokens

#### Question 1.1: Color Strategy

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

#### Question 1.2: Typography

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

#### Question 1.3: Spacing

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

---

### Section 2: Zone Configurations (v4.0 Journey-Based)

v4.0 zones include journey context for better design decisions.

#### Question 2.1: Zone Identification

```
question: "What zones does your product have?"
header: "Zones"
options:
  - label: "Critical"
    description: "High-stakes transactions, claims, payments"
  - label: "Marketing"
    description: "Showcase, landing pages, promotional"
  - label: "Admin"
    description: "Dashboard, settings, management"
  - label: "Onboarding"
    description: "First-time user flows"
  - label: "Recovery"
    description: "Error states, support flows"
  - label: "Custom"
    description: "Define your own zones"
multiSelect: true
```

#### Question 2.2: Zone Details (Per Zone)

For EACH selected zone:

**Question 2.2.1: Zone Paths**
```
question: "Which file paths should use this zone?"
header: "Paths"
```

Examples:
- `src/features/checkout/**`
- `src/features/claim/**`
- `app/(marketing)/**`

**Question 2.2.2: Journey Stage (v4.0)**
```
question: "What user journey stage does this zone represent?"
header: "Journey"
options:
  - label: "Discovery"
    description: "Finding and evaluating the product"
  - label: "Onboarding"
    description: "First-time setup and learning"
  - label: "Active Use"
    description: "Regular product usage"
  - label: "Claiming/Exit"
    description: "Withdrawing value, completing flow"
  - label: "Recovery"
    description: "After errors or issues"
  - label: "Admin/Management"
    description: "Configuration and oversight"
multiSelect: false
```

**Question 2.2.3: Likely Persona (v4.0)**

If personas are defined, ask:
```
question: "Which persona is most likely in this zone?"
header: "Persona"
options:
  - [List from personas.yaml]
  - label: "Any/All"
    description: "No specific persona dominates"
multiSelect: false
```

**Question 2.2.4: Trust State (v4.0)**
```
question: "What's the trust context in this zone?"
header: "Trust"
options:
  - label: "Building"
    description: "Users are establishing trust (onboarding, first use)"
  - label: "Established"
    description: "Users have existing trust relationship"
  - label: "Critical"
    description: "High-stakes moment, trust must be reinforced"
multiSelect: false
```

**Question 2.2.5: Motion Style**
```
question: "How should motion work in this zone?"
header: "Motion"
options:
  - label: "Deliberate (800ms+)"
    description: "Slow, weighty, builds confidence"
  - label: "Measured (400-600ms)"
    description: "Noticeable but not slow"
  - label: "Snappy (<200ms)"
    description: "Instant response, efficiency"
  - label: "Playful"
    description: "Bouncy, attention-grabbing"
  - label: "Reduced"
    description: "Minimal animation for accessibility"
multiSelect: false
```

**Question 2.2.6: Evidence (v4.0, Optional)**
```
question: "Any evidence supporting this zone configuration?"
header: "Evidence"
```

Examples:
- "Support tickets show users confused in checkout"
- "Analytics show 80% drop-off at this step"

#### Question 2.3: Layout Mapping

```
question: "What layout should wrap components in this zone?"
header: "Layout"
options:
  - label: "CriticalZone"
    description: "High-stakes actions with confirmation"
  - label: "MachineryLayout"
    description: "Keyboard-driven admin interface"
  - label: "GlassLayout"
    description: "Hover-driven marketing showcase"
  - label: "None"
    description: "No special layout wrapper"
multiSelect: false
```

#### Question 2.4: Zone Constraints

```
question: "What patterns should be constrained in this zone?"
header: "Constraints"
options:
  - label: "Optimistic UI"
    description: "Forbid/Warn/Allow instant updates before server confirmation"
  - label: "Loading Spinners"
    description: "Forbid/Warn/Allow spinner animations"
  - label: "Auto-play Animations"
    description: "Forbid/Warn/Allow automatic animations"
multiSelect: true
```

For each selection, follow up:
```
question: "[Pattern] should be:"
options:
  - label: "Forbidden"
    description: "Hard block, never allow"
  - label: "Warn"
    description: "Allow with warning"
  - label: "Allowed"
    description: "No restrictions"
```

---

### Section 3: Motion Recipes

#### Question 3.1: Recipe Definitions

For each zone's motion style, define recipes:

**Critical Zone Recipes:**
```yaml
recipes:
  deliberate-entrance:
    zone: critical
    duration: 800ms
    easing: ease-out
    description: "Slow entrance for high-stakes content"

  confirmation-pulse:
    zone: critical
    duration: 1200ms
    easing: ease-in-out
    description: "Confirmation animation after action"
```

**Marketing Zone Recipes:**
```yaml
recipes:
  playful-bounce:
    zone: marketing
    spring:
      stiffness: 200
      damping: 10
    description: "Bouncy entrance for engagement"

  attention-grab:
    zone: marketing
    duration: 600ms
    easing: cubic-bezier(0.68, -0.55, 0.265, 1.55)
    description: "Eye-catching animation"
```

**Admin Zone Recipes:**
```yaml
recipes:
  snappy-transition:
    zone: admin
    duration: 150ms
    easing: ease-out
    description: "Fast, efficient transitions"
```

#### Question 3.2: Pattern Preferences

For each zone:
```
question: "Which motion recipes should be preferred in [zone]?"
header: "Prefer"
```

```
question: "Which motion recipes should show warnings in [zone]?"
header: "Warn"
```

---

### Section 4: Component Rules

#### Question 4.1: Component Selection

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
  - label: "Cards"
    description: "Define card hover/selection"
  - label: "None for now"
    description: "Skip component rules"
multiSelect: true
```

**Follow-up** for each selection with specific rules:
- "How should [component] animate on hover?"
- "How should [component] animate on click?"
- "Any zone-specific variations?"

---

## Output Generation

### rules.md

```markdown
# Design Rules

**Version**: 4.0
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

| Zone | Style | Timing | Journey | Trust |
|------|-------|--------|---------|-------|
| critical | deliberate | 800ms+ | claiming | critical |
| marketing | playful | varied | discovery | building |
| admin | snappy | <200ms | management | established |

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

### .sigilrc.yaml Update (v4.0)

```yaml
version: "4.0"

component_paths:
  - "components/"
  - "src/components/"

zones:
  critical:
    layout: CriticalZone
    time_authority: server-tick

    # v4.0: Journey context
    paths:
      - "src/features/checkout/**"
      - "src/features/claim/**"
    journey_stage: claiming
    persona_likely: depositor
    trust_state: critical
    evidence:
      - "Support tickets show high anxiety during claims"
    last_refined: "[date]"

    # Motion configuration
    motion: deliberate
    lens: strict
    constraints:
      optimistic_ui: forbidden
      loading_spinners: warn
      animations: allowed

    patterns:
      prefer:
        - "deliberate-entrance"
        - "confirmation-flow"
      warn:
        - "instant-transition"
        - "playful-bounce"

  marketing:
    layout: GlassLayout
    time_authority: optimistic

    # v4.0: Journey context
    paths:
      - "src/features/marketing/**"
      - "app/(marketing)/**"
    journey_stage: discovery
    persona_likely: null  # Any persona
    trust_state: building

    motion: playful
    patterns:
      prefer:
        - "playful-bounce"
        - "attention-grab"
      warn:
        - "instant-transition"

  admin:
    layout: MachineryLayout
    time_authority: optimistic

    # v4.0: Journey context
    paths:
      - "src/features/admin/**"
      - "app/admin/**"
    journey_stage: management
    trust_state: established

    motion: snappy
    patterns:
      prefer:
        - "snappy-transition"
      warn:
        - "deliberate-entrance"

  # Default zone (fallback)
  default:
    layout: null
    time_authority: optimistic
    motion: snappy
    constraints: {}

rejections:
  - pattern: "Spinner"
    reason: "Creates anxiety in critical zones"
    exceptions: ["admin/**"]
```

---

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

---

## Success Output

```
Rules Codified!

Written to:
  - sigil-mark/rules.md
  - .sigilrc.yaml

Captured:
  - X color tokens
  - Typography scale
  - Spacing system
  - N zone configurations

Zones Configured:
  - critical (claiming, depositor, trust: critical)
  - marketing (discovery, any, trust: building)
  - admin (management, trust: established)

Journey Mapping:
  - claiming → critical zone → depositor
  - discovery → marketing zone → any persona
  - management → admin zone → established trust

Next steps:
  - /craft to get design guidance
  - /garden to check configuration health
```

---

## Error Handling

| Situation | Response |
|-----------|----------|
| No setup complete | Auto-initialize Sigil (v4.0 auto-setup) |
| No personas defined | Proceed without persona_likely, suggest /envision |
| User cancels | Save partial state, note incomplete sections |
| Empty selections | Use sensible defaults, note in output |

---

## When to Ask vs Proceed

| Context | Ask | Proceed |
|---------|-----|---------|
| No existing files | ✓ Full interview | |
| --zone flag | | ✓ Single zone only |
| --from flag | | ✓ Import and confirm |
| --quick flag | | ✓ Minimal interview |
| Files exist, no flag | ✓ Update or replace? | |

---

## Philosophy

This interview codifies design rules with **journey context**. v4.0 emphasizes:

1. **Journey-based zones** over arbitrary paths
2. **Persona mapping** to connect zones to users
3. **Trust states** to guide motion and feedback
4. **Evidence** to ground decisions in data

Do NOT:
- Create zones without journey context
- Skip trust state questions
- Ignore persona mapping if personas exist
- Make assumptions about user flows

DO:
- Connect zones to user journeys
- Link zones to likely personas
- Capture evidence for zone decisions
- Define constraints by trust level
