---
zones:
  state:
    paths:
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

# Sigil Envisioning Skill (v3)

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
multiSelect: true
```

For each selected user type:
- "What constraints matter most for [user type]?"
- "What's the priority? (1 = most constrained, truth test)"

#### Question 3.2: Immutable Properties

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
  - label: "Custom"
    description: "Specify your own"
multiSelect: true
```

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

version: "1.0"
generated_by: "/envision"
generated_at: "[timestamp]"

lenses:
  power_user:
    name: "Power User"
    description: "Experienced users optimizing for efficiency"
    priority: 1  # Lower = more constrained = truth test

    constraints:
      - id: "keyboard_shortcuts"
        description: "All actions accessible via keyboard"
        required: true

    validation:
      - "All interactive elements have tabindex"

  # Additional lenses from interview...

immutable_properties:
  description: "Properties that cannot vary between lenses"
  properties:
    - name: "security"
    - name: "core_logic"
    - name: "data_integrity"

stacking:
  allowed_combinations: []
  conflict_resolution:
    priority_order: []
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

Strictness Level: [current from .sigilrc.yaml]
  [Description of what this means]

Next steps:
  - /codify to define design rules
  - /canonize to protect emergent behaviors
  - /craft to get design guidance
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
