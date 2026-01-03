---
name: "graduate"
version: "3.0.0"
description: "Graduate a feature from proving to the Living Canon"
skill: "graduating-features"
command_type: "interview"

arguments:
  - name: "feature"
    type: "string"
    required: true
    description: "Feature name or ID to graduate"

  - name: "force"
    type: "boolean"
    required: false
    description: "Force graduation before proving complete"

pre_flight:
  - check: "file_exists"
    path: ".sigil-setup-complete"
    error: "Sigil not initialized. Run /setup first."

outputs:
  - path: "sigil-mark/canon/graduated/{feature}.yaml"
    type: "file"
    description: "Graduated feature record"

strictness_behavior:
  discovery: "allow"
  guiding: "allow"
  enforcing: "allow"
  strict: "allow"

mode:
  default: "foreground"
  allow_background: false
---

# Graduate

Graduate a feature from the Proving Grounds to the Living Canon after successful proving.

## Purpose

Graduation marks a feature as proven and canonical. Once graduated, the feature:
- Is considered stable and endorsed
- Informs future `/craft` guidance
- Requires new consultation for major changes

## Invocation

```
/graduate token-swap
/graduate PROVE-2026-001
/graduate token-swap --force
```

## Agent

Launches `graduating-features` skill from `.claude/skills/graduating-features/`.

See: `.claude/skills/graduating-features/SKILL.md` for full workflow details.

## Graduation Requirements

All must be true:

| Requirement | Description |
|-------------|-------------|
| Duration Complete | Proving period has ended |
| Monitors Green | All monitors green (yellow requires acknowledgment) |
| No P1 Violations | Zero critical violations |
| Taste Owner Sign-off | Explicit approval required |

## What Happens

1. Agent loads proving record
2. Checks all eligibility requirements
3. Requests Taste Owner sign-off
4. Moves feature to Living Canon
5. Archives proving record

## Example

```
/graduate token-swap

Agent: Checking graduation eligibility...

✅ ELIGIBILITY CHECK

Feature: token-swap
Domain: defi
Days Proved: 14 / 14

Monitor Status:
- tx_success_rate: ✅ green (99.9%)
- slippage_tolerance: ✅ green (0.2%)
- gas_efficiency: ✅ green (92%)

P1 Violations: 0

Agent: "Who is approving this graduation?"
[User: Design Lead]

Agent: "Please confirm graduation to Living Canon"
[User: Graduate]

🎓 FEATURE GRADUATED

Feature: token-swap
Graduated by: Design Lead
Now in: sigil-mark/canon/graduated/token-swap.yaml
```

## Force Graduation

Use `--force` to graduate before proving completes (not recommended):

```
/graduate token-swap --force

⚠️ FORCE GRADUATION

Days Remaining: 5
This bypasses the normal proving process.

[Requires explicit confirmation and reason]
```

Force graduation is logged for accountability.

## Error States

### Not Ready

```
⏳ PROVING PERIOD NOT COMPLETE

Feature: token-swap
Days Remaining: 5

Wait for proving to complete or use --force.
```

### Monitors Failing

```
⛔ MONITORS NOT GREEN

Failing Monitors:
- gas_efficiency: 🔴 red (78% | threshold: 90%)

Address issues before graduation.
```

### P1 Violations

```
⛔ P1 VIOLATIONS EXIST

Critical violations must be resolved:
- Transaction failure spike on 2026-01-05

Cannot graduate with P1 violations.
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "Feature not found" | Not in Proving Grounds | Run `/prove` first |
| "Already graduated" | In Living Canon | No action needed |
| "P1 violations exist" | Critical issues | Resolve violations |

## See Also

- `/prove` - Register feature for proving
- `/craft` - Uses graduated features for guidance
