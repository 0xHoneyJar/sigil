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

# Sigil Approving Skill

## Purpose

Record human sign-off on design patterns. Presents context for review and records approval in rules.md.

## Pre-Flight Checks

1. **Sigil Setup**: Verify `.sigil-setup-complete` exists
2. **Rules Exist**: Verify `sigil-mark/rules.md` exists
3. **Target Provided**: Ensure component/pattern name was given

## Workflow

### Step 1: Parse Target

Extract the component or pattern name from the argument:
- `Button` → Component approval
- `"motion in checkout"` → Pattern approval
- `CartSummary` → Component approval

### Step 2: Load Context

Read relevant context:

```
sigil-mark/rules.md
├── Find rules mentioning target
├── Check Components section
└── Check Motion section

sigil-mark/moodboard.md
├── Check if target mentioned
└── Get feel context

.sigilrc.yaml
├── Check zones for target path
└── Get pattern preferences
```

### Step 3: Present for Review

Format:

```markdown
## Approving: [Target]

### Applicable Rules

[List any rules from rules.md that mention or apply to target]

### Zone Context

Zone: [zone if determinable]
Motion: [motion style]
Preferred: [patterns]
Avoid: [patterns]

### Current Status

[Check if already approved in Approvals section]
```

### Step 4: Collect Decision

```yaml
question: "Approve [target] as matching your design system?"
header: "Approve"
options:
  - label: "Approve"
    description: "Confirm this follows the design system"
  - label: "Reject"
    description: "Flag for revision"
  - label: "Skip"
    description: "Review later"
multiSelect: false
```

**If Approved**, ask for approver:

```yaml
question: "Who is approving this?"
header: "Approver"
options:
  - label: "Me (developer)"
    description: "Self-approval for iteration"
  - label: "Design lead"
    description: "Formal design approval"
  - label: "Team consensus"
    description: "Approved by team"
  - label: "I'll specify"
    description: "Enter custom name"
multiSelect: false
```

**If Rejected**, ask for reason:

```yaml
question: "What needs to change?"
header: "Feedback"
options:
  - label: "Motion timing"
    description: "Animation speed or easing"
  - label: "Visual style"
    description: "Colors, spacing, typography"
  - label: "Pattern choice"
    description: "Wrong pattern for context"
  - label: "I'll specify"
    description: "Custom feedback"
multiSelect: true
```

### Step 5: Update rules.md

#### For Approval

Find or create the Approvals section:

```markdown
## Approvals

| Component | Approved | Date | By |
|-----------|----------|------|----|
| [target] | Yes | [date] | [approver] |
```

If target already exists, update the row.

#### For Rejection

Add to a Pending Review section:

```markdown
## Pending Review

| Component | Status | Date | Notes |
|-----------|--------|------|-------|
| [target] | Needs revision | [date] | [feedback] |
```

### Step 6: Confirm

```
Approval Recorded!

Component: [target]
Status: [Approved/Rejected/Skipped]
Date: [date]
By: [approver]

Updated: sigil-mark/rules.md
```

## Handling Existing Approvals

If target is already in Approvals:

```yaml
question: "[Target] was already approved on [date]. What would you like to do?"
header: "Existing"
options:
  - label: "Re-approve"
    description: "Update with new approval"
  - label: "Revoke"
    description: "Remove approval"
  - label: "Keep existing"
    description: "Leave as is"
multiSelect: false
```

## Approvals Table Format

```markdown
## Approvals

| Component | Approved | Date | By |
|-----------|----------|------|----|
| Button | Yes | 2026-01-01 | Design lead |
| Modal | Yes | 2026-01-01 | Team consensus |
| CartSummary | Yes | 2026-01-01 | Me (developer) |
```

## Error Handling

| Error | Response |
|-------|----------|
| No target provided | "Please specify what to approve: `/approve Button`" |
| rules.md not found | "No rules found. Run `/codify` first to create design rules." |
| Target not found | Proceed anyway - can approve new patterns |

## Philosophy

> "Human accountability, not automated validation"

This command does NOT:
- Run automated checks
- Validate code against rules
- Block implementation

This command DOES:
- Present context for human review
- Record the human decision
- Create an audit trail
- Enable iteration with self-approval

The human is always accountable for design decisions.
