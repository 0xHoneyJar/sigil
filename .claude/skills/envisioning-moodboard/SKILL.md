---
zones:
  state:
    paths:
      - grimoires/sigil/moodboard/
      - grimoires/sigil/moodboard.md
      - sigil-mark/personas/
      - sigil-mark/personas/personas.yaml
      - sigil-mark/evidence/
    permission: read-write
  config:
    paths:
      - .sigil-setup-complete
      - .sigilrc.yaml
    permission: read-write
---

# Sigil Envisioning Skill (v4.0)

## Purpose

Capture the product's soul through an interview-based workflow with progressive disclosure. Creates:
1. **Moodboard** — Product feel, references, anti-patterns
2. **Personas** — Evidence-based user archetypes with journey stages
3. **Evidence Files** — Optional analytics/interview data to ground personas

## Philosophy

> "Culture is the Reality. Code is Just the Medium."

v4.0 emphasizes **evidence-based personas** over generic archetypes. Ask for YOUR users, not generic "power user" templates.

---

## Progressive Disclosure (v4.0)

### L1: Full Interview (Default)
```
/envision
```
Full guided interview with sensible defaults. Best for new projects or when starting fresh.

### L2: Quick Capture
```
/envision --quick
```
Minimal interview focusing on:
- Product domain
- Primary user type
- Key feel descriptors
- One anti-pattern

### L3: Extract from Documentation
```
/envision --from <file>
```
Extracts product soul from existing documentation:
- README.md, PRD, GTM docs
- Attempts to infer personas, feel, and anti-patterns
- Confirms findings with user before writing

### Auto-Inherit (v4.0)
If an existing codebase is detected, /envision offers to inherit:
```
/envision --inherit
```
Combines /inherit analysis with /envision interview:
- Extracts patterns from existing code
- Surfaces implicit personas
- Confirms before codifying

---

## Auto-Setup (v4.0)

No need for explicit `/setup`. If Sigil is not initialized:

1. Create `sigil-mark/` directory structure
2. Create `.sigilrc.yaml` with defaults
3. Create `sigil-mark/personas/` and `sigil-mark/evidence/`
4. Continue with interview

```
I notice Sigil hasn't been set up yet. I'll initialize it now...

Created:
  - sigil-mark/
  - grimoires/sigil/moodboard/
  - sigil-mark/personas/
  - sigil-mark/evidence/
  - .sigilrc.yaml

Now let's capture your product's soul.
```

---

## Pre-Flight Checks

1. **Auto-Setup**: If `.sigil-setup-complete` missing, initialize Sigil
2. **Existing State**: Check for existing files and offer to update vs replace
3. **Section Focus**: If section argument provided, skip other sections
4. **Moodboard Folder**: Check if `grimoires/sigil/moodboard/` exists for v3.1 inspiration collection

---

## Interview Flow

### Section 0: Product Domain (v4.0 - NEW)

**Question 0.1: Product Identity**

```
question: "What's the name of your product?"
header: "Product"
```

**Question 0.2: Product Domain**

```
question: "What domain is this product in?"
header: "Domain"
options:
  - label: "DeFi / Financial"
    description: "Tokens, transactions, deposits, claims"
  - label: "E-Commerce"
    description: "Shopping, checkout, orders"
  - label: "SaaS / Productivity"
    description: "Tools, dashboards, workflows"
  - label: "Gaming"
    description: "Games, achievements, progression"
  - label: "Community / Social"
    description: "Forums, messaging, profiles"
  - label: "Other"
    description: "Describe your domain"
multiSelect: false
```

This context shapes all subsequent questions.

---

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

---

### Section 2: Product-Specific Personas (v4.0 - UPDATED)

v4.0 asks for YOUR users, not generic archetypes.

#### Question 2.1: Evidence Source

```
question: "How do you know about your users?"
header: "Evidence"
options:
  - label: "Analytics"
    description: "Usage data, funnels, cohorts"
  - label: "User Interviews"
    description: "Direct conversations with users"
  - label: "GTM Documents"
    description: "Market research, personas from marketing"
  - label: "Observation"
    description: "Support tickets, user feedback"
  - label: "Just starting"
    description: "Hypotheses only, no data yet"
multiSelect: true
```

This determines the `source` field for personas.

#### Question 2.2: Primary Users (Product-Specific)

Instead of generic archetypes, ask for product-specific users:

```
question: "Who are your primary user types? Be specific to YOUR product."
header: "Your Users"
```

**Follow-up prompts:**
- "In [domain], who are the main user groups?"
- "What do you call these users internally?"
- "What distinguishes each group?"

**Example for DeFi:**
- "Depositors" (not "power users")
- "Claimers" (not "occasional users")
- "Watchers" (not "browsers")

**Example for E-Commerce:**
- "Buyers"
- "Browsers"
- "Returners"

#### Question 2.3: Persona Details (Per User Type)

For EACH identified user type:

**Question 2.3.1: Persona Name & Alias**
```
question: "What should we call this persona? (ID: lowercase_with_underscores)"
header: "Name"
```

**Question 2.3.2: Evidence**
```
question: "What evidence supports this persona? (e.g., '2,993 depositors in 30 days')"
header: "Evidence"
```

Capture as array of strings in `evidence` field.

**Question 2.3.3: Trust Level**
```
question: "How much trust has this user built with your product?"
header: "Trust"
options:
  - label: "Low"
    description: "New, skeptical, needs proof"
  - label: "Medium"
    description: "Familiar but cautious"
  - label: "High"
    description: "Established, confident"
multiSelect: false
```

**Question 2.3.4: Journey Stages (v4.0)**
```
question: "What journey stages is this persona active in?"
header: "Journey"
options:
  - label: "Discovery"
    description: "Finding and evaluating the product"
  - label: "Onboarding"
    description: "First-time setup and learning"
  - label: "Active Use"
    description: "Regular product usage"
  - label: "Power Use"
    description: "Advanced features, optimization"
  - label: "Recovery"
    description: "After errors or issues"
  - label: "Claiming/Exit"
    description: "Withdrawing value, leaving"
multiSelect: true
```

**Question 2.3.5: Physics (Interaction Style)**
```
question: "How does this user interact with the product?"
header: "Input"
options:
  - label: "Keyboard-first"
    description: "Desktop, keyboard shortcuts"
  - label: "Mouse-primary"
    description: "Desktop, pointer-based"
  - label: "Touch"
    description: "Mobile or tablet"
  - label: "Mixed"
    description: "Varies by context"
multiSelect: false
```

**Question 2.3.6: Constraints**
```
question: "What constraints apply to this user?"
header: "Constraints"
```

Capture:
- Max actions per screen
- Reading level
- Error tolerance
- Accessibility needs

#### Question 2.4: Persona Stacking

```
question: "Can these personas overlap? (e.g., 'depositor + mobile')"
header: "Stacking"
```

Define allowed combinations and conflict resolution.

---

### Section 3: Moodboard Folder Prompt

Prompt users about the moodboard folder:

```
Sigil supports a moodboard folder for collecting design inspiration:

  grimoires/sigil/moodboard/
  ├── references/     → Product screenshots, flows (organize by source)
  ├── articles/       → Design article syntheses
  ├── anti-patterns/  → Patterns to avoid
  ├── gtm/            → Brand voice, messaging
  └── screenshots/    → Quick visual drops

You can drop files here anytime. I'll reference them during /craft.

Would you like to:
1. Continue (creates moodboard.md)
2. Drop files first (skip interview for now)
3. Both (interview + folder)
```

---

## Output Generation

### Moodboard Output

Write to `grimoires/sigil/moodboard.md`:

```markdown
# Product Moodboard

**Product**: [Name from Q0.1]
**Domain**: [Domain from Q0.2]
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
| Transactions | [Answer] | [Reference] |
| Success states | [Answer] | [Reference] |
| Loading | [Answer] | [Reference] |
| Errors | [Answer] | [Reference] |

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

### Personas Output (v4.0)

Write to `sigil-mark/personas/personas.yaml`:

```yaml
# Sigil Personas v4.0
# Evidence-based user archetypes
# Generated through /envision interview

version: "4.0.0"
generated_by: "/envision"
generated_at: "[timestamp]"

personas:
  depositor:  # Product-specific ID
    name: "Depositor"
    alias: "Henlocker"
    description: "Users who deposit tokens into the protocol"

    # v4.0: Evidence-based
    source: analytics
    evidence:
      - "2,993 depositors in Henlo product"
      - "Average 3.2 transactions/month"
    trust_level: high
    journey_stages:
      - active_use
      - claiming
    last_refined: "[date]"

    default_lens: default
    priority: 1

    physics:
      input_method: mixed
      tap_targets:
        min_size: "44px"
      shortcuts:
        expected: true
      motion:
        reduced: false

    constraints:
      max_actions_per_screen: 5
      error_tolerance: low
      cognitive_load: moderate

    preferences:
      motion: deliberate
      help: contextual
      density: medium

  # Additional personas...

immutable_properties:
  - security
  - core_logic
  - data_integrity

stacking:
  allowed_combinations:
    - [depositor]
    - [depositor, mobile]
    - [claimer]
  conflict_resolution: priority
  max_stack_depth: 2
```

### Evidence Output (Optional)

If user provides analytics data, write to `sigil-mark/evidence/[source]-[date].yaml`:

```yaml
source: analytics
collected_at: "[date]"
period: "[date range]"
description: "User data from initial /envision interview"

metrics:
  - key: total_depositors
    value: 2993
    label: "Total Depositors"
    unit: users
  - key: avg_transactions
    value: 3.2
    label: "Avg Monthly Transactions"
    unit: transactions/month

applies_to:
  personas:
    - depositor
  journey_stages:
    - active_use
```

---

## Handling Existing State

If files already exist:

```
question: "Existing [moodboard/personas] found. What would you like to do?"
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

---

## Success Output

```
Product Soul Captured!

Written to:
  - grimoires/sigil/moodboard.md
  - sigil-mark/personas/personas.yaml
  [- sigil-mark/evidence/analytics-2026-01-07.yaml]

Captured:
  - X reference products
  - Y feel descriptors
  - Z product-specific personas (with evidence)
  - N journey stages mapped

Personas Created:
  - depositor (analytics, high trust)
  - claimer (analytics, medium trust)
  - watcher (observation, low trust)

Moodboard Folder:
  grimoires/sigil/moodboard/ is ready for inspiration artifacts.
  Drop screenshots, articles, and references anytime.

Next steps:
  - /codify to define design rules and zones
  - /craft to get design guidance
  - /garden to check configuration health
```

---

## Error Handling

| Situation | Response |
|-----------|----------|
| No setup complete | Auto-initialize Sigil (v4.0 auto-setup) |
| User cancels | Save partial state, note incomplete sections |
| Empty selections | Use sensible defaults, note in output |
| No evidence | Mark personas with `source: generic` |

---

## When to Ask vs Proceed

| Context | Ask | Proceed |
|---------|-----|---------|
| No existing files | ✓ Full interview | |
| Files exist, --quick flag | | ✓ Minimal interview |
| Files exist, no flag | ✓ Update or replace? | |
| --from flag with file | | ✓ Extract and confirm |
| --inherit flag | | ✓ Analyze code first |

---

## Philosophy

This interview captures the INTENDED soul with EVIDENCE. v4.0 emphasizes:

1. **Product-specific personas** over generic archetypes
2. **Evidence-based** characteristics over assumptions
3. **Journey stages** to map where personas appear
4. **Progressive disclosure** to match user expertise

Do NOT:
- Rush the interview
- Suggest generic "power user" / "newcomer" unless truly applicable
- Skip evidence questions
- Make assumptions without asking

DO:
- Ask for THEIR user terminology
- Capture specific numbers when available
- Map users to journey stages
- Save progress incrementally

---

## Next Steps

After completing `/envision`, always show this section:

```
═══════════════════════════════════════════════════════════
                     NEXT STEPS
═══════════════════════════════════════════════════════════

Your product soul has been captured. Here's what to do next:

RECOMMENDED:
  /codify     — Define design rules, zones, and motion recipes
               (Best done immediately after /envision)

LATER:
  /craft      — Get design guidance during implementation
  /garden     — Check context health and completeness

ANYTIME:
  /refine     — Update personas or add evidence incrementally
  /consult    — Record design decisions with time locks

═══════════════════════════════════════════════════════════
```
