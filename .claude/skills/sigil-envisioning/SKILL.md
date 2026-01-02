---
zones:
  state:
    paths:
      - sigil-mark/moodboard.md
    permission: read-write
  config:
    paths:
      - .sigil-setup-complete
    permission: read
---

# Sigil Envisioning Skill

## Purpose

Capture product feel and design context through an interview-based workflow. Creates a moodboard that guides design decisions.

## Pre-Flight Checks

1. **Sigil Setup**: Verify `.sigil-setup-complete` exists
2. **Existing Moodboard**: Check if `sigil-mark/moodboard.md` has content (offer to update vs replace)

## Interview Flow

### Question 1: Reference Products

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

### Question 2: Transaction Feel

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

### Question 3: Success States

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

### Question 4: Loading States

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

### Question 5: Error States

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

### Question 6: Anti-Patterns

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

### Question 7: Key Moments (Free Text)

For each key moment, use free-form follow-up:

1. "Describe your ideal high-stakes moment - what does confirming a big action look like?"
2. "Describe your ideal celebration - what does a major win look like?"
3. "Describe your ideal recovery - what does bouncing back from an error look like?"

## Output Generation

After completing the interview, generate `sigil-mark/moodboard.md`:

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
| Transactions | [Answer from Q2] | [Relevant reference] |
| Success states | [Answer from Q3] | [Relevant reference] |
| Loading | [Answer from Q4] | [Relevant reference] |
| Errors | [Answer from Q5] | [Relevant reference] |

---

## Anti-Patterns

| Pattern | Reason |
|---------|--------|
[From Q6 with follow-up reasons]

---

## Key Moments

### High-Stakes Actions
[From Q7]

### Celebrations
[From Q7]

### Recovery
[From Q7]
```

## Handling Existing Moodboard

If `sigil-mark/moodboard.md` already has content:

```
question: "A moodboard already exists. What would you like to do?"
header: "Existing"
options:
  - label: "Update existing"
    description: "Add to or refine current moodboard"
  - label: "Start fresh"
    description: "Replace with new moodboard"
  - label: "Cancel"
    description: "Keep existing, exit envision"
multiSelect: false
```

## Success Output

```
Moodboard Captured!

Written to: sigil-mark/moodboard.md

Captured:
  - X reference products
  - 4 feel descriptors
  - Y anti-patterns
  - 3 key moments

Next step: /codify to define design rules
```
