---
zones:
  state:
    paths:
      - sigil-mark/moodboard/
      - sigil-mark/moodboard.md
      - sigil-mark/soul-binder/immutable-values.yaml
      - sigil-mark/lens-array/lenses.yaml
    permission: read-write
  config:
    paths:
      - .sigil-setup-complete
      - .sigilrc.yaml
    permission: read
---

# Sigil Envisioning Skill (v0.3)

## Purpose

Capture the product's soul through an interview-based workflow. Creates:
1. **Moodboard** — Product feel, references, anti-patterns
2. **Immutable Values** — Core principles with enforcement rules
3. **Lens Definitions** — User persona perspectives

## Philosophy

> "Culture is the Reality. Code is Just the Medium."

This skill captures both intended soul (values) and sets up the framework for protecting emergent soul (flaws via /canonize).

## Pre-Flight Checks

1. **Sigil Setup**: Verify `.sigil-setup-complete` exists
2. **Existing State**: Check for existing files and offer to update vs replace
3. **Section Focus**: If section argument provided, skip other sections
4. **Moodboard Folder**: Check if `sigil-mark/moodboard/` exists for v3.1 inspiration collection

## Moodboard Folder (v3.1)

Before or after the interview, prompt users about the moodboard folder:

```
Sigil supports a moodboard folder for collecting design inspiration:

  sigil-mark/moodboard/
  ├── references/     → Product screenshots, flows (organize by source)
  ├── articles/       → Design article syntheses
  ├── anti-patterns/  → Patterns to avoid
  ├── gtm/            → Brand voice, messaging
  └── screenshots/    → Quick visual drops

You can drop files here anytime. I'll reference them during /craft.

Would you like to:
1. Continue with the interview (creates moodboard.md)
2. Start dropping files in the folder (skip interview)
3. Do both (interview + folder for artifacts)
```

If the folder already has content, acknowledge it:

```
I found {N} entries in your moodboard folder:
  - {X} references
  - {Y} anti-patterns
  - {Z} articles

I'll use these during /craft. The interview adds structured feel descriptors.
```

## Workflow

### Section 1: Moodboard (Product Feel)

#### Question 1.1: Reference Products

Use AskUserQuestion with multiSelect:

```
question: "What apps or games inspire this product's feel?"
header: "References"
options:
  - label: "Games (console/mobile)"
    description: "Games with satisfying interactions or motion"
  - label: "Consumer Apps"
    description: "Apps with great UX feel"
  - label: "Crypto/Web3 Apps"
    description: "DeFi, NFT, or blockchain apps"
  - label: "Other"
    description: "Specify your own references"
multiSelect: true
```

**Follow-up** (for each selection):
- "Which specific [games/apps] inspire you?"
- "What specifically about [product] do you want to capture?"

#### Question 1.2: Transaction Feel

```
question: "How should users feel during important actions?"
header: "Transactions"
options:
  - label: "Confident & Secure"
    description: "Deliberate, weighty, reassuring"
  - label: "Swift & Efficient"
    description: "Quick, seamless, no friction"
  - label: "Exciting & Rewarding"
    description: "Celebratory, gamified"
  - label: "Custom"
    description: "Describe your own feel"
multiSelect: false
```

#### Question 1.3: Success States

```
question: "How should wins and completions feel?"
header: "Success"
options:
  - label: "Subtle Satisfaction"
    description: "Quiet confidence, job well done"
  - label: "Celebratory"
    description: "Confetti, particles, big moments"
  - label: "Earned Achievement"
    description: "Weight and significance"
  - label: "Custom"
    description: "Describe your own feel"
multiSelect: false
```

#### Question 1.4: Loading States

```
question: "How should waiting moments feel?"
header: "Loading"
options:
  - label: "Calm & Patient"
    description: "Skeleton loading, no anxiety"
  - label: "Engaged & Informed"
    description: "Progress indicators, status updates"
  - label: "Minimal & Quick"
    description: "Optimistic UI, instant feel"
  - label: "Custom"
    description: "Describe your own feel"
multiSelect: false
```

#### Question 1.5: Error States

```
question: "How should errors and failures feel?"
header: "Errors"
options:
  - label: "Gentle & Helpful"
    description: "Clear guidance, no blame"
  - label: "Direct & Actionable"
    description: "What went wrong, how to fix"
  - label: "Recoverable & Safe"
    description: "Nothing lost, try again"
  - label: "Custom"
    description: "Describe your own feel"
multiSelect: false
```

#### Question 1.6: Anti-Patterns

```
question: "What patterns should we explicitly avoid?"
header: "Avoid"
options:
  - label: "Spinners/Loading wheels"
    description: "Creates anxiety in critical contexts"
  - label: "Instant transitions"
    description: "Feels jarring or cheap"
  - label: "Overly playful motion"
    description: "Undermines serious actions"
  - label: "Aggressive animations"
    description: "Overwhelming or distracting"
multiSelect: true
```

**Follow-up**: For each selection, ask "Why is this important to avoid?"

#### Question 1.7: Key Moments (Free Text)

For each key moment, use free-form follow-up:

1. "Describe your ideal high-stakes moment - what does confirming a big action look like?"
2. "Describe your ideal celebration - what does a major win look like?"
3. "Describe your ideal recovery - what does bouncing back from an error look like?"

### Section 2: Immutable Values (Soul Binder)

#### Question 2.1: Shared Values

```
question: "Which shared values are non-negotiable for your product?"
header: "Core Values"
options:
  - label: "Security First"
    description: "No compromises on user safety or data protection"
  - label: "Accessibility"
    description: "All users can interact with the product"
  - label: "Performance"
    description: "Fast, responsive, no blocking operations"
  - label: "Privacy"
    description: "Minimal data collection, user control"
multiSelect: true
```

For each selected value, ask:
- "What's the enforcement level? (block = hard stop, warn = allow with warning, review = flag for review)"
- "Any specific constraints? For example: 'No API keys in code' for Security"

#### Question 2.2: Project-Specific Values

```
question: "Any values specific to THIS project?"
header: "Project Values"
```

Free-form input. For each value mentioned:
- "What enforcement level? (block/warn/review)"
- "Any specific constraints or patterns to check?"

#### Question 2.3: Domain Values

```
question: "What domain is this product in?"
header: "Domain"
options:
  - label: "DeFi / Financial"
    description: "Adds: Transaction safety, exploit prevention"
  - label: "Creative Tools"
    description: "Adds: Export reliability, performance"
  - label: "Community Platform"
    description: "Adds: Content moderation, abuse prevention"
  - label: "Gaming"
    description: "Adds: Fair play, skill expression"
  - label: "General / Other"
    description: "No domain-specific values"
multiSelect: false
```

Each domain auto-suggests relevant values:
- DeFi: transaction_safety, no_exploits
- Creative: export_reliability, no_data_loss
- Community: content_safety, no_abuse_vectors
- Gaming: fair_play, skill_expression

### Section 3: Lens Definitions (Lens Array)

Per SDD Section 3.4, lenses represent user perspectives/avatars that interpret the same core product differently. Each lens needs: name, description, priority, constraints, and validation rules.

#### Question 3.1: User Types

```
question: "Who are your primary user types?"
header: "Users"
options:
  - label: "Power Users"
    description: "Experienced, efficiency-focused"
  - label: "Newcomers"
    description: "First-time users needing guidance"
  - label: "Mobile Users"
    description: "Touch-first, limited screen"
  - label: "Accessibility Users"
    description: "Screen reader, keyboard-only"
  - label: "Custom"
    description: "Define a custom user type"
multiSelect: true
```

#### Question 3.2: Lens Details (Per Selected User Type)

For EACH selected user type, conduct detailed interview:

**Question 3.2.1: Lens Name**
```
question: "What should we call this lens? (e.g., 'power_user', 'newcomer')"
header: "Name"
```

Use lowercase with underscores for the ID.

**Question 3.2.2: Lens Description**
```
question: "Who does this lens represent? Describe the target user."
header: "Description"
```

Capture:
- Who they are (daily active users, first-time visitors, etc.)
- What they're optimizing for (efficiency, learning, accessibility)
- Their context (desktop, mobile, assistive technology)

**Question 3.2.3: Priority**
```
question: "What priority is this lens? (1 = most constrained, used as truth test)"
header: "Priority"
options:
  - label: "1 - Truth Test"
    description: "Most constrained lens - if it breaks here, it's rejected"
  - label: "2 - High Priority"
    description: "Important to validate, but not the ultimate test"
  - label: "3 - Standard"
    description: "Normal priority validation"
  - label: "4 - Low Priority"
    description: "Nice to have, not critical"
multiSelect: false
```

**Note**: The lens with priority 1 is the "truth test" - assets that fail in this lens are rejected.

**Question 3.2.4: Constraints**
```
question: "What constraints apply to this lens? List the key requirements."
header: "Constraints"
```

For each constraint, capture:
- Constraint ID (e.g., `keyboard_shortcuts`)
- Description (e.g., "All actions accessible via keyboard")
- Required (true/false - is this mandatory?)

Example prompts:
- "What MUST work for this user type?"
- "What would break their experience if missing?"

**Common constraints by lens type:**
- Power Users: keyboard_shortcuts, dense_display, batch_operations
- Newcomers: clear_onboarding, contextual_help, forgiving_interactions
- Mobile: touch_targets, responsive_layout, reduced_data
- Accessibility: screen_reader, high_contrast, reduced_motion

**Question 3.2.5: Validation Rules**
```
question: "What validation rules should we check for this lens?"
header: "Validation"
```

Capture specific checks that can be performed:
- "All interactive elements have tabindex" (for keyboard users)
- "Touch targets >= 44px" (for mobile)
- "ARIA labels on all interactive elements" (for accessibility)
- "No jargon without explanation" (for newcomers)

These become actionable validation criteria during `/craft`.

#### Question 3.3: Lens Stacking

```
question: "Can lenses be combined? Select allowed combinations."
header: "Stacking"
options:
  - label: "Power User + Accessibility"
    description: "Keyboard experts using screen readers"
  - label: "Newcomer + Mobile"
    description: "First-time mobile users"
  - label: "Mobile + Accessibility"
    description: "Mobile users with assistive needs"
  - label: "No stacking"
    description: "Lenses are mutually exclusive"
multiSelect: true
```

#### Question 3.4: Immutable Properties

```
question: "What properties should NEVER vary between user types?"
header: "Immutable"
options:
  - label: "Security"
    description: "All users get same security protections"
  - label: "Core Logic"
    description: "Business rules don't change per user"
  - label: "Data Integrity"
    description: "Data handling is consistent"
  - label: "API Contracts"
    description: "Request/response shapes are identical"
  - label: "Custom"
    description: "Specify your own"
multiSelect: true
```

These properties remain constant across ALL lenses - lenses only affect presentation, never core behavior.

## Output Generation

### Moodboard Output

Write to `sigil-mark/moodboard.md`:

```markdown
# Product Moodboard

**Product**: [Inferred from context or ask]
**Created**: [Current date]
**Updated**: [Current date]

---

## Reference Products

### Games
[List games with what to capture from each]

### Apps
[List apps with what to capture from each]

---

## Feel Descriptors

| Context | Feel | Reference |
|---------|------|-----------|
| Transactions | [Answer from Q1.2] | [Relevant reference] |
| Success states | [Answer from Q1.3] | [Relevant reference] |
| Loading | [Answer from Q1.4] | [Relevant reference] |
| Errors | [Answer from Q1.5] | [Relevant reference] |

---

## Anti-Patterns

| Pattern | Reason |
|---------|--------|
[From Q1.6 with follow-up reasons]

---

## Key Moments

### High-Stakes Actions
[From Q1.7]

### Celebrations
[From Q1.7]

### Recovery
[From Q1.7]
```

### Immutable Values Output

Write to `sigil-mark/soul-binder/immutable-values.yaml`:

```yaml
# Soul Binder — Immutable Values
# Core principles that hard-block violations
# Generated through /envision interview

version: "1.0"
generated_by: "/envision"
generated_at: "[timestamp]"

values:
  security:
    name: "Security First"
    description: "[from interview]"
    type: "shared"
    enforcement:
      level: "block"  # block | warn | review
      constraints:
        - name: "no_exposed_keys"
          description: "API keys and secrets must not appear in code"
          pattern: "(?i)(api[_-]?key|secret|password|token)\\s*[:=]"
          scope: ["**/*.ts", "**/*.js", "**/*.yaml"]

  # Additional values from interview...
```

### Lens Array Output

Write to `sigil-mark/lens-array/lenses.yaml`:

```yaml
# Lens Array — User Persona Definitions
# Multiple truths coexist on top of core
# Generated through /envision interview
# Schema: SDD Section 3.4

version: "1.0"
generated_by: "/envision"
generated_at: "[timestamp]"

lenses:
  power_user:
    name: "Power User"
    description: "Experienced users optimizing for efficiency"
    priority: 1  # Lower = more constrained = truth test

    target_audience:
      - "Daily active users"
      - "Keyboard-first users"
      - "High-volume transaction users"

    constraints:
      - id: "keyboard_shortcuts"
        description: "All actions accessible via keyboard"
        required: true

      - id: "dense_display"
        description: "Information-dense layouts preferred"
        required: false

      - id: "batch_operations"
        description: "Bulk actions available"
        required: true

    validation:
      - "All interactive elements have tabindex"
      - "No hover-only interactions"
      - "Shortcuts documented in UI"

  newcomer:
    name: "Newcomer"
    description: "First-time users needing guidance"
    priority: 2

    target_audience:
      - "New signups"
      - "Infrequent users"
      - "Users from competing products"

    constraints:
      - id: "clear_onboarding"
        description: "Guided first experience"
        required: true

      - id: "contextual_help"
        description: "Tooltips and help available"
        required: true

      - id: "forgiving_interactions"
        description: "Undo available for destructive actions"
        required: true

    validation:
      - "Help button visible on every screen"
      - "No jargon without explanation"
      - "Confirmation for destructive actions"

  # Additional lenses from interview...

immutable_properties:
  description: |
    These properties MUST be identical across all lenses.
    Lenses only affect presentation, never core behavior.
  properties:
    - name: "core_logic"
      description: "Business rules and calculations"
    - name: "security"
      description: "Authentication, authorization, encryption"
    - name: "data_integrity"
      description: "Validation rules, constraints"
    - name: "api_contracts"
      description: "Request/response shapes"

stacking:
  description: "Lenses can be combined for specific scenarios"
  allowed_combinations:
    - ["power_user"]
    - ["newcomer"]
    - ["mobile"]
    - ["accessibility"]
    - ["power_user", "accessibility"]
    - ["newcomer", "mobile"]
    - ["mobile", "accessibility"]

  conflict_resolution:
    priority_order: ["accessibility", "power_user", "newcomer", "mobile"]
    rule: "When lenses conflict, higher priority wins"
```

## Handling Existing State

If files already exist:

```
question: "Existing [moodboard/values/lenses] found. What would you like to do?"
header: "Existing"
options:
  - label: "Update existing"
    description: "Add to or refine current state"
  - label: "Start fresh"
    description: "Replace with new state"
  - label: "Skip this section"
    description: "Keep existing, move to next section"
multiSelect: false
```

## Success Output

```
Product Soul Captured!

Written to:
  - sigil-mark/moodboard.md
  - sigil-mark/soul-binder/immutable-values.yaml
  - sigil-mark/lens-array/lenses.yaml

Captured:
  - X reference products
  - Y feel descriptors
  - Z immutable values (N blocking, M warning)
  - L user lenses

Moodboard Folder (v3.1):
  sigil-mark/moodboard/ is ready for inspiration artifacts.
  Drop screenshots, articles, and references anytime.
  See sigil-mark/moodboard/README.md for usage.

Strictness Level: [current from .sigilrc.yaml]
  [Description of what this means]

Next steps:
  - /codify to define design rules
  - /canonize to protect emergent behaviors
  - /craft to get design guidance
  - Drop inspiration into sigil-mark/moodboard/
```

## Error Handling

| Situation | Response |
|-----------|----------|
| No setup complete | "Sigil not initialized. Run `/setup` first." |
| User cancels | Save partial state, note incomplete sections |
| Empty selections | Use sensible defaults, note in output |
| Invalid enforcement | Default to "warn", note the fallback |

## Philosophy

This interview captures the INTENDED soul. The EMERGENT soul develops over time and is protected via `/canonize`. Both are equally important.

Do NOT:
- Rush the interview
- Make assumptions without asking
- Skip sections without user consent

DO:
- Explain why each question matters
- Offer examples when helpful
- Save progress incrementally
