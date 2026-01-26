# Rune

Design physics for AI-generated UI.

> "Effect is truth. What the code does determines its physics."

## Overview

Rune is a construct pack that ensures AI-generated UI components have correct design physics. It provides:

- **Hypothesis-driven generation**: Analyze before generating
- **Self-validation**: Check physics compliance automatically
- **Learning from feedback**: Capture taste from rejections and edits
- **Workflow integration**: Hooks for sprint planning, review, and audit

## Four Constructs

| Construct | Command | Purpose |
|-----------|---------|---------|
| **Sigil** | `/sigil` | Taste (WHY) — Capture human preferences |
| **Glyph** | `/glyph` | Craft (HOW) — Generate with correct physics |
| **Rigor** | `/rigor` | Correctness (WHAT) — Validate web3 safety |
| **Wyrd** | `/wyrd` | Fate (VALIDATION) — Confidence calibration |

## Physics Table

| Effect | Sync | Timing | Confirmation |
|--------|------|--------|--------------|
| Financial | Pessimistic | 800ms | Required |
| Destructive | Pessimistic | 600ms | Required |
| Soft Delete | Optimistic | 200ms | Toast + Undo |
| Standard | Optimistic | 200ms | None |
| Navigation | Immediate | 150ms | None |
| Local State | Immediate | 100ms | None |

## Quick Start

### Generate a Component

```
/glyph "claim rewards button"
```

Output:
```
## Hypothesis

**Effect**: Financial (detected: "claim" keyword)
**Physics**: Pessimistic sync, 800ms timing, confirmation required
**Confidence**: 0.90

[y/n/adjust]
```

On accept, generates complete React component with correct physics.

### Record a Preference

```
/sigil "500ms feels more responsive for power users"
```

Future generations will apply this preference.

### Validate Web3 Code

```
/rigor src/components/VaultWithdraw.tsx
```

Checks for BigInt safety, data source correctness, receipt guards.

### Check Confidence State

```
/wyrd
```

Shows confidence calibration and learning metrics.

## Workflow Integration

### With Sprint Planning

During `/sprint-plan`, Rune suggests physics requirements for UI tasks:

```
Task: Create claim rewards button

Suggested Physics:
- Effect: Financial
- Sync: Pessimistic
- Timing: 800ms
- Confirmation: Required
```

### With Implementation

During `/implement`, Rune prompts for Glyph generation on UI tasks.

### With Review

During `/review-sprint`, Rune validates physics compliance:

```
## Physics Validation

ClaimButton.tsx: ✓ Physics compliant
DeleteModal.tsx: ⚠ Timing below minimum (taste override applied)
```

### With Audit

During `/audit-sprint`, Rune runs Rigor checks on web3 code.

## Learning Loop

```
Generate → Hypothesis → User Feedback → Learn → Improve

           ↓                    ↓
       Accept/Reject      Record as taste
           ↓                    ↓
     Self-validate        Update confidence
           ↓                    ↓
     Write file          Detect patterns
```

## Protected Capabilities

Non-negotiable rules that Rune enforces:

| Capability | Rule |
|------------|------|
| Withdraw | Always reachable |
| Cancel | Always visible |
| Balance | Always accurate |
| Touch target | >= 44px |
| Focus ring | Always visible |

## Structure

```
.claude/constructs/packs/rune/
├── manifest.yaml           # Pack metadata
├── skills/
│   ├── observing/          # /sigil
│   ├── crafting/           # /glyph
│   ├── enforcing/          # /rigor
│   ├── fating/             # /wyrd
│   ├── validating/         # /validate
│   ├── physics-reference/  # Reference skill
│   └── patterns-reference/ # Reference skill
├── rules/
│   ├── sigil/              # Taste rules (3 files)
│   ├── glyph/              # Craft rules (20 files)
│   ├── wyrd/               # Fate rules (10 files)
│   └── rigor/              # Correctness rules (3 files)
├── hooks/
│   ├── implement-hook.md
│   ├── sprint-plan-hook.md
│   ├── review-sprint-hook.md
│   └── audit-sprint-hook.md
└── templates/
    └── notes-design-physics.md

grimoires/rune/
├── taste.md                # Accumulated preferences
├── wyrd.md                 # Confidence state
├── rejections.md           # Rejection log
└── patterns.md             # Detected patterns
```

## Installation

See [INSTALL.md](INSTALL.md) for installation instructions.

## Configuration

In `.loa.config.yaml`:

```yaml
rune:
  hooks:
    implement:
      enabled: true
    sprint_plan:
      enabled: true
    review_sprint:
      enabled: true
    audit_sprint:
      enabled: true
```

## Philosophy

**Effect is truth.** What the code does determines its physics. "Claim" means financial. "Delete" means destructive.

**Physics over preferences.** "Make it feel trustworthy" is not physics. "800ms pessimistic with confirmation" is physics.

**Correctness over feel.** A beautiful button that sends the wrong amount is worse than an ugly one that's accurate.

**Learn from rejection.** Every "no" teaches the system. Three similar rejections become a pattern.

## License

MIT

---

*Co-Authored-By: Claude <noreply@anthropic.com>*
