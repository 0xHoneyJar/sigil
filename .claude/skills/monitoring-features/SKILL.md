---
zones:
  state:
    paths:
      - sigil-mark/proving-grounds/active/
      - sigil-mark/proving-grounds/config.yaml
    permission: read-write
  config:
    paths:
      - .sigilrc.yaml
    permission: read
---

# Monitoring Features

## Purpose

Update monitor status for features in the Proving Grounds. Monitors track feature health throughout the proving period and determine graduation eligibility.

## Philosophy

> "Monitors don't lie. They reveal."

Monitors provide objective data about feature performance. They should be updated honestly—gaming the monitors defeats the purpose of proving.

## Monitor Status Values

| Status | Meaning | Graduation Impact |
|--------|---------|-------------------|
| `pending` | Not yet checked | Blocks graduation |
| `green` | Meets or exceeds threshold | Allows graduation |
| `yellow` | Slightly below threshold | Requires acknowledgment |
| `red` | Significantly below threshold | Blocks graduation |

## Workflow

### Step 1: Load Proving Record

```bash
proving_file="sigil-mark/proving-grounds/active/${feature_id}.yaml"
```

If file doesn't exist:
```
Feature {feature_id} not found in Proving Grounds.
```

### Step 2: Find Monitor

Locate the specified monitor in the monitors array:

```yaml
monitors:
  - id: "tx_success_rate"
    name: "Transaction Success Rate"
    status: "pending"
    threshold: "99%"
    current_value: null
```

If monitor not found:
```
Monitor {monitor_id} not found for feature {feature_id}.

Available monitors:
{list of monitor IDs}
```

### Step 3: Validate Value

Check if value meets threshold to determine status:

```bash
# Percentage thresholds
if value >= threshold:
    status = "green"
elif value >= threshold * 0.9:  # Within 10%
    status = "yellow"
else:
    status = "red"
```

### Step 4: Update Record

```yaml
monitors:
  - id: "{monitor_id}"
    name: "{monitor_name}"
    status: "{green|yellow|red}"
    threshold: "{threshold}"
    current_value: "{new_value}"
    last_checked: "{ISO-8601}"
    history:
      - value: "{previous_value}"
        at: "{previous_timestamp}"
```

### Step 5: Check for Violations

If status changes to red, check if it constitutes a violation:

```yaml
# First time red = P2 violation
violations:
  p2:
    - monitor: "{monitor_id}"
      value: "{value}"
      threshold: "{threshold}"
      at: "{timestamp}"

# Consecutive red or critical failure = P1 violation
violations:
  p1:
    - monitor: "{monitor_id}"
      description: "Sustained failure of {monitor_name}"
      started_at: "{first_red_timestamp}"
      at: "{timestamp}"
```

### Step 6: Update Eligibility

Recalculate graduation eligibility:

```yaml
graduation:
  eligible: {true if all monitors green and no P1s}
  blockers:
    - "{monitor_id} is {status}"
    - "P1 violation exists"
```

### Step 7: Report

```
📊 MONITOR UPDATED

Feature: {feature_name}
Monitor: {monitor_name}

Previous: {previous_value} ({previous_status})
Current: {new_value} ({new_status})
Threshold: {threshold}

{If status changed}
Status changed: {previous_status} → {new_status}

{If violation recorded}
⚠️ Violation recorded: {p1|p2}

Graduation Eligible: {yes|no}
{If no: Blockers: {blockers}}
```

## Batch Updates

Multiple monitors can be updated at once:

```yaml
updates:
  - monitor_id: "tx_success_rate"
    value: "99.5%"
  - monitor_id: "gas_efficiency"
    value: "91%"
```

## Threshold Evaluation

Different threshold types:

| Type | Example | Evaluation |
|------|---------|------------|
| Percentage | `99%` | value >= 99 |
| Time | `500ms` | value <= 500 |
| Count | `0 errors` | value == 0 |
| Status | `green` | value == "green" |
| Trend | `positive` | value in ["positive", "stable"] |

## Error Handling

| Situation | Response |
|-----------|----------|
| Feature not found | "Feature {id} not found in Proving Grounds." |
| Monitor not found | "Monitor {id} not found. Available: {list}" |
| Invalid value format | "Cannot parse value. Expected format: {format}" |
| Feature graduated | "Feature has already graduated. Cannot update monitors." |

## Integration Points

### Called By

- `/prove {id} --update {monitor} {value}` — Manual update
- External webhook — Automated updates
- Scheduled check — Polling check_url endpoints

### Affects

- Graduation eligibility
- Violation tracking
- `/graduate` command decisions

## Automated Monitoring

Monitors with `check_url` can be polled automatically:

```yaml
monitors:
  - id: "tx_success_rate"
    name: "Transaction Success Rate"
    check_url: "https://api.example.com/metrics/tx-success"
    check_interval: "1h"
    last_checked: null
```

The monitoring system will:
1. Call the URL at the specified interval
2. Parse the response (expects JSON with `value` field)
3. Update the monitor status automatically

## Philosophy Notes

Monitors should reflect reality:
- Don't game thresholds
- Investigate failures, don't hide them
- Yellow is a warning, not a failure

The goal is to catch issues before canonization, not to prevent graduation.
