---
zones:
  state:
    paths:
      - sigil-mark/proving-grounds/active/
      - sigil-mark/canon/graduated/
    permission: read-write
  config:
    paths:
      - .sigilrc.yaml
      - .sigil-setup-complete
    permission: read
---

# Graduating Features

## Purpose

Graduate a feature from the Proving Grounds to the Living Canon. Graduation requires:
1. Proving period complete
2. All monitors green (or yellow with acknowledgment)
3. No P1 violations
4. Taste Owner sign-off

## Philosophy

> "Graduation is earned, not granted."

A feature in the Living Canon represents:
- Proven stability at scale
- Community or Taste Owner endorsement
- Commitment to maintain the pattern

## Pre-Flight Checks

1. **Sigil Setup**: Verify `.sigil-setup-complete` exists
2. **Feature Exists**: Verify proving record exists in `active/`
3. **Not Already Graduated**: Check feature isn't in `graduated/`

## Eligibility Requirements

All must be true for graduation:

```yaml
eligibility:
  duration_complete: true    # Proving period has ended
  monitors_green: true       # All monitors green (or yellow acknowledged)
  no_p1_violations: true     # Zero P1 (critical) violations
  taste_owner_approval: true # Explicit sign-off required
```

## Workflow

### Step 1: Load Proving Record

```bash
proving_file="sigil-mark/proving-grounds/active/${feature}.yaml"
```

### Step 2: Check Eligibility

#### Duration Check

```bash
current_date=$(date -u +%Y-%m-%dT%H:%M:%SZ)
if [ "$current_date" \< "$ends_at" ]; then
    echo "Proving period not complete. ${days_remaining} days remaining."
fi
```

If not complete:

```
⏳ PROVING PERIOD NOT COMPLETE

Feature: {feature_name}
Days Remaining: {days_remaining}
Ends: {ends_at}

The proving period must complete before graduation.
To force early graduation (not recommended): /graduate {feature} --force
```

#### Monitor Check

All monitors must be green:

```
{For each monitor}
- {monitor_name}: {status}
```

If any monitor is red:

```
⛔ MONITORS NOT GREEN

Feature: {feature_name}

Failing Monitors:
- {monitor_name}: 🔴 {status}
  Current: {value} | Required: {threshold}

Address these issues before graduation.
```

If monitors are yellow:

```
⚠️ MONITORS REQUIRE ACKNOWLEDGMENT

Feature: {feature_name}

Yellow Monitors:
- {monitor_name}: 🟡 {status}
  Current: {value} | Threshold: {threshold}

question: "Acknowledge yellow monitors and proceed?"
header: "Acknowledge"
options:
  - label: "Yes, proceed"
    description: "Yellow status is acceptable for this feature"
  - label: "No, wait"
    description: "Address yellow monitors first"
multiSelect: false
```

#### P1 Violation Check

```
if violations.p1.length > 0:
    ⛔ P1 VIOLATIONS EXIST

    Critical violations must be resolved before graduation:
    {For each P1}
    - {violation_description}
      Occurred: {timestamp}
```

### Step 3: Require Taste Owner Sign-Off

```
question: "Who is approving this graduation?"
header: "Taste Owner"
```

```
question: "Please confirm graduation of {feature_name} to the Living Canon"
header: "Confirm"
options:
  - label: "Graduate"
    description: "Move feature to Living Canon"
  - label: "Cancel"
    description: "Keep in Proving Grounds"
multiSelect: false
```

### Step 4: Create Graduated Record

Move and update record:

1. Copy `sigil-mark/proving-grounds/active/{feature}.yaml`
2. Move to `sigil-mark/canon/graduated/{feature}.yaml`
3. Update with graduation details:

```yaml
id: "{feature_id}"
feature: "{feature_name}"
created_at: "{original_created_at}"
created_by: "/prove"

domain: "{domain}"

proving:
  status: "graduated"
  started_at: "{started_at}"
  duration_days: {duration}
  ended_at: "{actual_end}"
  days_elapsed: {days}

monitors:
  # Final monitor states preserved
  - id: "{monitor_id}"
    name: "{Monitor Name}"
    final_status: "green"
    final_value: "{value}"

violations:
  p1: []
  p2: {preserved}
  p3: {preserved}

graduation:
  eligible: true
  graduated_at: "{ISO-8601}"
  graduated_by: "{taste_owner}"
  acknowledgments:
    - "{any yellow monitor acknowledgments}"
```

### Step 5: Remove from Active

Delete `sigil-mark/proving-grounds/active/{feature}.yaml`

### Step 6: Confirm

```
🎓 FEATURE GRADUATED

Feature: {feature_name}
Domain: {domain}
Graduated by: {taste_owner}
Graduated at: {timestamp}

Proving Summary:
- Duration: {days_elapsed} days
- Final Monitor Status: All green
- P1 Violations: 0

This feature is now part of the Living Canon.

View graduated record: sigil-mark/canon/graduated/{feature}.yaml
```

## Force Graduation

With `--force` flag (requires additional confirmation):

```
⚠️ FORCE GRADUATION

You are attempting to force graduation before proving period completes.

Days Remaining: {days_remaining}
Current Monitor Status: {summary}

This bypasses the normal proving process and should only be used
in exceptional circumstances.

question: "Confirm force graduation?"
header: "Force"
options:
  - label: "Force Graduate"
    description: "I understand the risks"
  - label: "Cancel"
    description: "Wait for proving to complete"
multiSelect: false
```

Force graduation is logged:

```yaml
graduation:
  forced: true
  force_reason: "{provided_reason}"
  days_remaining_at_force: {days}
```

## Error Handling

| Situation | Response |
|-----------|----------|
| Feature not found | "Feature {name} not found in Proving Grounds." |
| Already graduated | "Feature {name} has already graduated. View in Living Canon?" |
| No Taste Owner | "Graduation requires Taste Owner sign-off." |
| P1 violations | "Cannot graduate with P1 violations. Resolve first." |

## Integration Points

### Called By

- Manual invocation via `/graduate {feature}`
- Scheduled check when proving period ends

### Affects

- Living Canon (`sigil-mark/canon/graduated/`)
- Proving Grounds (removes from `active/`)
- `/craft` — Graduated features inform guidance

## Philosophy Notes

Graduation should feel significant:
- It represents commitment
- The feature is now "canon"
- Changes require new consultation

Don't rush graduation. The proving period exists for a reason.
