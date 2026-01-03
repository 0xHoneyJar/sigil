---
zones:
  state:
    paths:
      - sigil-mark/
      - .sigilrc.yaml
      - .sigil-setup-complete
      - .sigil-version.json
    permission: read-write
  app:
    paths:
      - components/
      - app/components/
      - src/components/
      - src/features/
    permission: read
---

# Sigil v3 Setup Skill

## Purpose

Initialize Sigil v3 Constitutional Design Framework on a repository. Creates the four-pillar directory structure, configuration files, and prepares for design capture through interviews.

## Philosophy

> "Culture is the Reality. Code is Just the Medium."

Sigil v3 is a constitutional framework that protects both intended soul (Immutable Values) and emergent soul (Canon of Flaws). This setup creates the foundation for the four pillars:

1. **Soul Binder** — Protects values and emergent behaviors
2. **Lens Array** — Supports multiple user truths
3. **Consultation Chamber** — Layered decision authority
4. **Proving Grounds** — Scale validation before production

## Pre-Flight Checks

1. **Not Already Setup**: Check for `.sigil-setup-complete`
   - If exists, warn and offer refresh options
   - Never overwrite existing state files

## Workflow

### Step 1: Detect Component Directories

Scan for common component directory patterns:
- `components/`
- `app/components/`
- `src/components/`
- `src/features/**/components/`

Use Glob or the detect-components.sh script.

### Step 2: Create v3 Directory Structure

Create the complete Sigil v3 directory tree:

```bash
# Core state directory
mkdir -p sigil-mark

# Soul Binder (Pillar 1)
mkdir -p sigil-mark/soul-binder

# Lens Array (Pillar 2)
mkdir -p sigil-mark/lens-array

# Consultation Chamber (Pillar 3)
mkdir -p sigil-mark/consultation-chamber/decisions

# Proving Grounds (Pillar 4)
mkdir -p sigil-mark/proving-grounds/active

# Canon and Audit
mkdir -p sigil-mark/canon/graduated
mkdir -p sigil-mark/audit
```

### Step 3: Create Core State Files

Copy templates from `.claude/templates/`:
- `moodboard.md` → `sigil-mark/moodboard.md`
- `rules.md` → `sigil-mark/rules.md`

Create empty `sigil-mark/inventory.md`.

### Step 4: Create Soul Binder Files

Create `sigil-mark/soul-binder/immutable-values.yaml`:
```yaml
# Soul Binder — Immutable Values
# Core principles that hard-block violations
# Generated through /envision interview

version: "1.0"
generated_by: null  # Set by /envision
generated_at: null

values: {}
  # Values will be populated by /envision interview
  # Example:
  # security:
  #   name: "Security First"
  #   type: "shared"
  #   enforcement:
  #     level: "block"
```

Create `sigil-mark/soul-binder/canon-of-flaws.yaml`:
```yaml
# Soul Binder — Canon of Flaws
# Protected emergent behaviors
# Register new flaws with /canonize

version: "1.0"
last_updated: null

flaws: []
  # Flaws registered through /canonize interview
  # Example:
  # - id: "FLAW-001"
  #   name: "Double-Click Submit"
  #   status: "PROTECTED"

canonization_criteria:
  usage_threshold_percent: 5
  requires_community_attachment: true
```

Create `sigil-mark/soul-binder/visual-soul.yaml`:
```yaml
# Soul Binder — Visual Soul
# Grit signatures for cultural validation
# Detects "Play-Doh" problem (too smooth, too clean)

version: "1.0"
generated_at: null

grit_signatures: {}
  # Defined through /codify interview

anti_patterns: []
  # Patterns that fail cultural check
```

### Step 5: Create Lens Array Files

Create `sigil-mark/lens-array/lenses.yaml`:
```yaml
# Lens Array — User Persona Definitions
# Multiple truths coexist on top of core
# Define through /envision interview

version: "1.0"
generated_at: null

lenses: {}
  # Lenses defined through /envision interview
  # Example:
  # power_user:
  #   name: "Power User"
  #   priority: 1  # Lower = more constrained = truth test
  #   constraints: [...]

immutable_properties:
  description: "Properties that cannot vary between lenses"
  properties:
    - name: "core_logic"
    - name: "security"
    - name: "data_integrity"

stacking:
  allowed_combinations: []
  conflict_resolution:
    priority_order: []
```

### Step 6: Create Consultation Chamber Files

Create `sigil-mark/consultation-chamber/config.yaml`:
```yaml
# Consultation Chamber — Decision Authority
# Poll strategic, consult direction, dictate execution

version: "1.0"

layers:
  strategic:
    description: "Major features, pivots"
    process: "community_poll"
    authority: "binding_vote"

  direction:
    description: "Visual style, tone"
    process: "sentiment_gathering"
    authority: "taste_owner"

  execution:
    description: "Pixel-level details"
    process: "none"
    authority: "taste_owner_dictates"

lock_durations:
  strategic: 180  # 6 months
  direction: 90   # 3 months
  execution: 30   # 1 month

lock:
  unlock_requires: "taste_owner_approval"
  early_unlock_reasons:
    - "new_information"
    - "causing_harm"
    - "external_requirement"
```

### Step 7: Create Proving Grounds Files

Create `sigil-mark/proving-grounds/config.yaml`:
```yaml
# Proving Grounds — Scale Validation
# Prove features before production graduation

version: "1.0"

default_duration_days: 14

# Duration options for proving
duration_options:
  quick: 7      # Low-risk features
  standard: 14  # Default
  extended: 30  # High-stakes features

graduation_requires:
  - all_monitors_green
  - no_p1_violations
  - taste_owner_signoff

# Domain-specific monitors
# Use get-monitors.sh to retrieve for a specific domain
domains:
  defi:
    name: "DeFi"
    monitors:
      - tx_success_rate
      - slippage_tolerance
      - gas_efficiency
      - liquidity_health
  creative:
    name: "Creative"
    monitors:
      - load_performance
      - render_quality
      - accessibility_score
      - engagement_metrics
  community:
    name: "Community"
    monitors:
      - response_latency
      - error_rate
      - user_feedback
      - governance_compliance
  games:
    name: "Games"
    monitors:
      - frame_rate
      - fairness_check
      - reward_balance
      - player_retention
  general:
    name: "General"
    monitors:
      - error_rate
      - uptime
      - user_feedback
```

### Step 8: Create Audit Files

Create `sigil-mark/audit/overrides.yaml`:
```yaml
# Audit Log — Human Overrides
# Tracks when humans override agent recommendations

version: "1.0"

overrides: []
  # Each override logs:
  # - timestamp
  # - violation_type
  # - reasoning
  # - user
```

### Step 9: Create Configuration

Create `.sigilrc.yaml` with v3 schema:
```yaml
# Sigil v3 Configuration
# Constitutional Design Framework

version: "3.0"

# Progressive strictness level
# discovery: All suggestions, no blocks
# guiding: Warnings on violations, optional blocks on critical
# enforcing: Blocks on protected flaws and immutable values
# strict: Blocks on all violations, requires approval for overrides
strictness: "discovery"

# Detected component paths
component_paths:
  - "components/"        # Add detected paths
  # - "src/components/"

# Taste Owners with domain authority
taste_owners:
  design:
    name: "Design Lead"
    placeholder: "@design-lead"
    scope:
      - "sigil-mark/**"
      - "src/components/**"

# Domain for proving monitors
domains: []
  # - "defi"
  # - "creative"
  # - "community"
  # - "games"

# Consultation configuration
consultation:
  internal_tool: null  # "linear" | "notion" | etc.
  community_channels: []

# Proving configuration
proving:
  default_duration_days: 7
  environments:
    testnet: false
    staging: false
    beta: false
```

### Step 10: Create Marker and Version Files

Create `.sigil-setup-complete`:
```
Sigil v3 setup completed at [timestamp]
Framework version: 3.0.0
Strictness: discovery

Next steps:
  - /envision to capture product soul and define values
  - /codify to define design rules
  - /canonize to protect emergent behaviors
```

Create/update `.sigil-version.json`:
```json
{
  "version": "3.0.0",
  "schema_version": "3.0",
  "setup_at": "[timestamp]",
  "pillars": {
    "soul_binder": true,
    "lens_array": true,
    "consultation_chamber": true,
    "proving_grounds": true
  }
}
```

### Step 11: Report Success

Output:
```
Sigil v3 Setup Complete

Constitutional Design Framework initialized with four pillars:
  1. Soul Binder (sigil-mark/soul-binder/)
     - immutable-values.yaml
     - canon-of-flaws.yaml
     - visual-soul.yaml

  2. Lens Array (sigil-mark/lens-array/)
     - lenses.yaml

  3. Consultation Chamber (sigil-mark/consultation-chamber/)
     - config.yaml
     - decisions/

  4. Proving Grounds (sigil-mark/proving-grounds/)
     - config.yaml
     - active/

Configuration:
  - .sigilrc.yaml (strictness: discovery)
  - Detected component paths: [list]

Strictness Level: discovery
  All suggestions, no blocks. Perfect for greenfield projects.
  Increase with: Edit .sigilrc.yaml strictness field.

Next steps:
  - /envision → Capture product soul, define values and lenses
  - /codify → Define design rules
  - /craft → Get design guidance during implementation

Philosophy: "Culture is the Reality. Code is Just the Medium."
```

## Idempotency

If already set up:
1. Warn user that v3 setup already complete
2. Show current strictness level
3. Offer options:
   - Refresh directory structure (add missing directories)
   - View current configuration
   - Proceed to /envision

Never overwrite existing state files (values, flaws, lenses, decisions).

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "Setup already complete" | `.sigil-setup-complete` exists | Offer refresh or proceed to /envision |
| "Cannot detect components" | No standard component paths | Proceed with empty paths; user can edit .sigilrc.yaml |
| "Permission denied" | File system issue | Check directory permissions |

## Scripts

- `detect-components.sh`: Find component directories in codebase
- `get-strictness.sh`: Return current strictness level from .sigilrc.yaml
