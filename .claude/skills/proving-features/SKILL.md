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
      - .sigil-setup-complete
    permission: read
---

# Proving Features

## Purpose

Register a feature for the proving period. Features must prove themselves at scale before becoming part of the Living Canon. Domain-specific monitors track behavior during the proving period.

## Philosophy

> "Trust, but verify. At scale."

The Proving Grounds ensure:
- Features work under real conditions
- Edge cases are discovered before canonization
- Graduation requires demonstrated stability

## Pre-Flight Checks

1. **Sigil Setup**: Verify `.sigil-setup-complete` exists
2. **Proving Config**: Check `sigil-mark/proving-grounds/config.yaml` exists
   - If missing, create with default settings
3. **Domain Config**: Load available domains from config
4. **Active Directory**: Ensure `sigil-mark/proving-grounds/active/` exists

## Workflow

### Step 1: Identify the Feature

If feature not provided, ask:

```
question: "What feature would you like to register for proving?"
header: "Feature"
```

### Step 2: Determine Domain

Ask for domain to apply appropriate monitors:

```
question: "What domain does this feature belong to?"
header: "Domain"
options:
  - label: "DeFi"
    description: "Financial transactions, token operations, liquidity"
  - label: "Creative"
    description: "Art, content, media, visual experiences"
  - label: "Community"
    description: "Social features, governance, collaboration"
  - label: "Games"
    description: "Gaming mechanics, player interactions, rewards"
  - label: "General"
    description: "No specific domain monitors"
multiSelect: false
```

### Step 3: Configure Proving Period

Ask for proving duration:

```
question: "How long should the proving period be?"
header: "Duration"
options:
  - label: "7 days"
    description: "Quick validation for low-risk features"
  - label: "14 days"
    description: "Standard proving period (recommended)"
  - label: "30 days"
    description: "Extended validation for high-stakes features"
  - label: "Custom"
    description: "Specify custom duration"
multiSelect: false
```

### Step 4: Load Domain Monitors

Get monitors for the selected domain:

```bash
monitors=$(.claude/scripts/get-monitors.sh "{domain}")
# Returns JSON array of monitor definitions
```

Default monitors by domain:

#### DeFi Monitors
- `tx_success_rate`: Transaction success rate > 99%
- `slippage_tolerance`: Slippage within configured bounds
- `gas_efficiency`: Gas usage within expected range
- `liquidity_health`: Pool health metrics green

#### Creative Monitors
- `load_performance`: Asset load times acceptable
- `render_quality`: No visual glitches reported
- `accessibility_score`: WCAG compliance maintained
- `engagement_metrics`: User engagement positive

#### Community Monitors
- `response_latency`: Feature response times acceptable
- `error_rate`: Error rate below threshold
- `user_feedback`: No critical user complaints
- `governance_compliance`: Follows established rules

#### Games Monitors
- `frame_rate`: Performance targets met
- `fairness_check`: No exploits detected
- `reward_balance`: Economy metrics healthy
- `player_retention`: Engagement maintained

#### General Monitors
- `error_rate`: Error rate < 1%
- `uptime`: Service availability > 99%
- `user_feedback`: No P1 issues reported

### Step 5: Create Proving Record

Generate feature ID: `PROVE-{YYYY}-{NNN}`

Create proving record at `sigil-mark/proving-grounds/active/{feature}.yaml`:

```yaml
id: "{feature_id}"
feature: "{feature_name}"
created_at: "{ISO-8601}"
created_by: "/prove"

domain: "{defi|creative|community|games|general}"

proving:
  status: "active"
  started_at: "{ISO-8601}"
  duration_days: {7|14|30|custom}
  ends_at: "{calculated end date}"

  # Calculated fields
  days_elapsed: 0
  days_remaining: {duration}

monitors:
  - id: "{monitor_id}"
    name: "{Monitor Name}"
    status: "pending"  # pending|green|yellow|red
    last_checked: null
    threshold: "{threshold_value}"
    current_value: null

violations:
  p1: []  # Critical issues (block graduation)
  p2: []  # Major issues (require review)
  p3: []  # Minor issues (noted but allowed)

graduation:
  eligible: false
  blockers: []
  reviewed_by: null
  graduated_at: null
```

### Step 6: Report

```
✅ FEATURE REGISTERED FOR PROVING

Feature: {feature_name}
ID: {feature_id}
Domain: {domain}
Duration: {duration} days
Ends: {ends_at}

Monitors Active:
{For each monitor}
- {monitor_name}: {status}

Next Steps:
1. Feature is now being monitored
2. Check status: /prove {feature_id} --status
3. When ready: /graduate {feature_id}

View record: sigil-mark/proving-grounds/active/{feature}.yaml
```

## Status Checking

When called with `--status`:

```
📊 PROVING STATUS: {feature_name}

Status: {active|passed|failed}
Days Elapsed: {days_elapsed} / {duration}
Days Remaining: {days_remaining}

Monitor Status:
{For each monitor}
- {monitor_name}: {status_emoji} {status}
  Current: {current_value} | Threshold: {threshold}

Violations:
- P1 (Critical): {count}
- P2 (Major): {count}
- P3 (Minor): {count}

Graduation Eligible: {yes/no}
{If no: Blockers: {blockers}}
```

## Monitor Updates

Monitors can be updated via:

1. **Manual Update**: `/prove {id} --update {monitor_id} {value}`
2. **Webhook**: External systems can POST to update monitors
3. **Scheduled Check**: Monitors with `check_url` are polled

## Error Handling

| Situation | Response |
|-----------|----------|
| No setup | "Sigil not initialized. Run `/setup` first." |
| Feature exists | "Feature {name} is already being proved. View status?" |
| Invalid domain | Default to "general" domain |
| Invalid duration | Use 14-day default |

## Philosophy Notes

The proving period serves as:
- A cooling-off period for hasty decisions
- Real-world validation before canonization
- A clear path from experiment to canon

Features should NOT be rushed through proving. The goal is stability, not speed.
