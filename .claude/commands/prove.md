---
name: "prove"
version: "3.0.0"
description: "Register a feature for proving period with domain-specific monitors"
skill: "proving-features"
command_type: "interview"

arguments:
  - name: "feature"
    type: "string"
    required: false
    description: "Feature name to register for proving"

  - name: "domain"
    type: "string"
    required: false
    description: "Domain for monitor selection"

pre_flight:
  - check: "file_exists"
    path: ".sigil-setup-complete"
    error: "Sigil not initialized. Run /setup first."

outputs:
  - path: "sigil-mark/proving-grounds/active/{feature}.yaml"
    type: "file"
    description: "Proving status record"

strictness_behavior:
  discovery: "allow"
  guiding: "allow"
  enforcing: "allow"
  strict: "allow"

mode:
  default: "foreground"
  allow_background: false
---

# Prove

Register a feature for the proving period. Features must demonstrate stability at scale before graduating to the Living Canon.

## Purpose

The Proving Grounds ensure features work under real conditions before becoming permanent. Domain-specific monitors track behavior throughout the proving period.

## Invocation

```
/prove
/prove token-swap
/prove onboarding --domain creative
/prove PROVE-2026-001 --status
```

## Agent

Launches `proving-features` skill from `.claude/skills/proving-features/`.

See: `.claude/skills/proving-features/SKILL.md` for full workflow details.

## Domains

| Domain | Focus | Example Monitors |
|--------|-------|------------------|
| **DeFi** | Financial transactions | tx_success_rate, slippage, gas |
| **Creative** | Art & media | load_performance, render_quality |
| **Community** | Social features | response_latency, user_feedback |
| **Games** | Gaming mechanics | frame_rate, fairness, rewards |
| **General** | Default | error_rate, uptime |

## What Happens

1. Agent asks for feature name (if not provided)
2. Selects appropriate domain for monitors
3. Configures proving duration (7/14/30 days)
4. Creates proving record with monitors
5. Feature enters active monitoring

## Proving Status

Check status of a proving feature:

```
/prove token-swap --status

📊 PROVING STATUS: token-swap

Status: active
Days Elapsed: 5 / 14
Days Remaining: 9

Monitor Status:
- tx_success_rate: ✅ green (99.8% | threshold: 99%)
- slippage_tolerance: ✅ green (0.3% | threshold: 1%)
- gas_efficiency: 🟡 yellow (85% | threshold: 90%)

Violations:
- P1: 0 | P2: 1 | P3: 3

Graduation Eligible: No
Blockers: gas_efficiency monitor is yellow
```

## Graduation

After proving period, graduate with Taste Owner sign-off:

```
/graduate token-swap
```

See `/graduate` command for graduation requirements.

## Example

```
/prove "new-onboarding"

Agent: "What domain does this feature belong to?"
[User selects: Creative]

Agent: "How long should the proving period be?"
[User selects: 14 days]

✅ FEATURE REGISTERED FOR PROVING

Feature: new-onboarding
ID: PROVE-2026-001
Domain: creative
Duration: 14 days

Monitors Active:
- load_performance: pending
- render_quality: pending
- accessibility_score: pending
- engagement_metrics: pending
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "Sigil not set up" | Missing `.sigil-setup-complete` | Run `/setup` first |
| "Feature already proving" | Duplicate registration | Check status instead |

## See Also

- `/graduate` - Graduate feature after proving
- `/craft` - Design guidance during implementation
