---
name: "approve"
version: "2.0.0"
description: |
  Human review and sign-off on design patterns.
  Records approval in rules.md with date and approver.

command_type: "interview"

arguments:
  - name: "target"
    type: "string"
    required: true
    description: "Component or pattern name to approve"

pre_flight:
  - check: "file_exists"
    path: ".sigil-setup-complete"
    error: "Sigil not set up. Run /setup first."
  - check: "file_exists"
    path: "sigil-mark/rules.md"
    error: "No rules found. Run /codify first."

outputs:
  - path: "sigil-mark/rules.md"
    type: "file"
    description: "Updated with approval record"

mode:
  default: "foreground"
  allow_background: false
---

# Approve

## Purpose

Human review and sign-off on design patterns. Records approval in the Approvals section of `sigil-mark/rules.md` with date and approver name.

## Invocation

```
/approve Button
/approve "motion in checkout"
/approve CartSummary
```

## Prerequisites

- Sigil must be set up (`.sigil-setup-complete` exists)
- Rules must exist (`sigil-mark/rules.md`)

## Workflow

### Phase 1: Load Context

Read:
- `sigil-mark/rules.md` - Find relevant rules for the target
- `sigil-mark/moodboard.md` - Get feel context (optional)
- `.sigilrc.yaml` - Get zone context if applicable

### Phase 2: Present for Review

Show the user what they're approving:

```
## Approving: [Target]

**Applicable Rules**:
[List rules that apply to this component/pattern]

**Zone**: [If applicable]
**Motion Style**: [If applicable]

**Current Implementation**:
[If component exists, summarize its patterns]
```

### Phase 3: Collect Approval

Ask via AskUserQuestion:

```
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

If approved, ask for approver name:

```
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

### Phase 4: Record Approval

Update `sigil-mark/rules.md` Approvals section:

```markdown
## Approvals

| Component | Approved | Date | By |
|-----------|----------|------|----|
| Button | Yes | 2026-01-01 | Design lead |
| CartSummary | Yes | 2026-01-01 | Team consensus |
```

### Phase 5: Confirm

```
Approval Recorded!

Component: [target]
Status: Approved
Date: [date]
By: [approver]

Updated: sigil-mark/rules.md
```

## Arguments

| Argument | Description | Required |
|----------|-------------|----------|
| `target` | Component or pattern name | Yes |

## Outputs

| Path | Description |
|------|-------------|
| `sigil-mark/rules.md` | Updated Approvals section |

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "Sigil not set up" | Missing `.sigil-setup-complete` | Run `/setup` first |
| "No rules found" | Missing rules.md | Run `/codify` first |
| "Target not specified" | Missing argument | Provide component/pattern name |

## Philosophy

Approval is human, not automated. This command simply:
1. Presents context for review
2. Records the human decision
3. Creates an audit trail

No automated validation - the human is accountable.

## Next Step

After approval: Continue implementation or move to next component
