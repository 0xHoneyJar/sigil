# Sigil: Anchor/Lens Integration

Formal verification for design physics via the Anchor and Lens CLIs.

<integration_overview>
## Overview

Anchor and Lens provide formal verification for Sigil physics:

| CLI | Purpose | Invocation |
|-----|---------|------------|
| **Anchor** | Validate keywords → zones, data sources | `anchor validate` |
| **Lens** | Verify physics + lint components | `lens lint` |

**When to verify:**
- After physics analysis, before generating code
- When user confirms the physics analysis
- When correction loop is active (retry after violations)
</integration_overview>

<verification_flow>
## Verification Flow

### Step 1: Write Request

Before validation, write the physics analysis to `grimoires/pub/requests/`:

```json
{
  "request_id": "<uuid>",
  "physics": {
    "effect": "Financial",
    "behavioral": {
      "sync": "pessimistic",
      "timing": 800,
      "confirmation": true,
      "has_undo": false
    },
    "animation": {
      "easing": "ease-out",
      "duration": 800
    },
    "material": {
      "surface": "elevated",
      "shadow": "soft",
      "radius": 8
    }
  },
  "component_code": "<tsx source if available>",
  "keywords": ["claim", "rewards"],
  "context": {
    "file_path": "src/components/ClaimButton.tsx",
    "effect_source": "keyword:claim"
  }
}
```

### Step 2: Invoke CLIs

Run both validations in parallel via Bash:

```bash
# Generate request UUID
REQUEST_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')

# Write request file
echo '{ ... }' > grimoires/pub/requests/$REQUEST_ID.json

# Run validations in parallel
anchor validate --request $REQUEST_ID &
lens lint --request-id $REQUEST_ID &
wait
```

**Important:** Use `&` and `wait` to run in parallel. This reduces total validation time.

### Step 3: Read Responses

Read response files from `grimoires/pub/responses/`:

```bash
# Read anchor response
cat grimoires/pub/responses/$REQUEST_ID-anchor.json

# Read lens response
cat grimoires/pub/responses/$REQUEST_ID-lens.json
```

### Step 4: Process Results

Parse the responses and check for violations:

**Anchor Response:**
```json
{
  "request_id": "...",
  "zone": "Critical",
  "valid": true,
  "violations": [],
  "warnings": []
}
```

**Lens Response:**
```json
{
  "request_id": "...",
  "pass": true,
  "results": [...],
  "summary": {
    "total": 5,
    "passed": 5,
    "failed": 0,
    "errors": 0,
    "warnings": 0
  },
  "correction": null
}
```
</verification_flow>

<correction_loop>
## Correction Loop

When Lens returns `pass: false` with a correction context:

### Loop Logic

1. **Check correction context**
   ```json
   {
     "correction": {
       "violations": [...],
       "fixes": [...],
       "attempt": 1,
       "max_attempts": 2
     }
   }
   ```

2. **Apply suggested fixes** to the physics analysis:
   ```json
   {
     "target": "behavioral.timing",
     "current_value": "400",
     "required_value": "800",
     "reason": "Financial operations require minimum 800ms timing"
   }
   ```

3. **Regenerate component** with corrected physics

4. **Re-run Lens lint** (attempt 2)

5. **If still failing after max attempts:**
   - Surface conflict to user
   - Show what was attempted
   - Ask for override or clarification

### Correction Box

When correction is needed, show:

```
┌─ Constraint Violation ─────────────────────────────────┐
│                                                        │
│  ✗ Financial Timing Requirement                        │
│    Rule: timing >= 800 for Financial effects           │
│    Actual: 400ms                                       │
│    Required: 800ms                                     │
│                                                        │
│  Suggested Fix:                                        │
│    → behavioral.timing: 400 → 800                      │
│    Reason: Financial ops need 800ms for user verify    │
│                                                        │
│  [a] Apply fix and regenerate                          │
│  [o] Override (explain why this is acceptable)         │
│  [c] Cancel and reconsider                             │
│                                                        │
└────────────────────────────────────────────────────────┘
```
</correction_loop>

<conflict_detection>
## Conflict Detection

Some requests are inherently conflicting:

| Request | Conflict | Resolution |
|---------|----------|------------|
| "quick claim button" | Financial requires 800ms, "quick" implies fast | Ask: speed or safety? |
| "snappy delete" | Destructive requires confirmation + 600ms | Ask: priority? |
| "instant transfer" | Financial cannot be instant | Explain why, offer alternatives |

### Conflict Box

When conflict detected:

```
┌─ Physics Conflict ─────────────────────────────────────┐
│                                                        │
│  Your request implies conflicting physics:             │
│                                                        │
│  "quick claim button"                                  │
│  ├─ "claim" → Financial → 800ms, confirmation          │
│  └─ "quick" → Fast → <200ms, no delay                  │
│                                                        │
│  These conflict because:                               │
│  Financial operations require deliberate timing for    │
│  user verification. "Quick" would skip this safety.    │
│                                                        │
│  Options:                                              │
│  [s] Prioritize safety (800ms, confirmation)           │
│  [p] Prioritize speed (400ms, still confirm)           │
│  [e] Explain context (help me understand)              │
│                                                        │
└────────────────────────────────────────────────────────┘
```
</conflict_detection>

<exit_codes>
## Exit Codes

Both CLIs use consistent exit codes:

| Code | Meaning | Action |
|------|---------|--------|
| 0 | Success | Proceed |
| 10 | Critical zone violations | Show errors, require fix |
| 11 | Cautious zone warnings | Show warnings, can proceed |
| 12 | Standard zone info | Proceed |
| 20 | Schema validation error | Fix request format |
| 30 | I/O error | Retry or report |

### Handling Errors

```
┌─ Validation Error ─────────────────────────────────────┐
│                                                        │
│  ✗ Anchor validation failed (exit code 10)             │
│                                                        │
│  Zone: Critical (Financial keywords detected)          │
│  Violation: Optimistic sync not allowed                │
│                                                        │
│  The physics analysis will be adjusted before          │
│  generating code.                                      │
│                                                        │
└────────────────────────────────────────────────────────┘
```
</exit_codes>

<trigger_conditions>
## When to Run Validation

**Always validate before code generation when:**
- Effect is Financial, Destructive, or SoftDelete
- Keywords match Critical or Cautious zones
- User has enabled strict mode in taste.md

**Skip validation when:**
- Effect is Local or Standard with no financial keywords
- User has explicitly disabled validation
- Running in quick mode (taste.md preference)

**Re-validate when:**
- Physics are modified after initial generation
- User overrides a constraint
- Correction loop is active
</trigger_conditions>

<taste_integration>
## Taste Integration

Log validation results to taste.md:

```yaml
---
timestamp: "2026-01-20T10:30:00Z"
signal: ACCEPT
source: cli
component:
  name: "ClaimButton"
  effect: "Financial"
validation:
  anchor:
    zone: "Critical"
    valid: true
  lens:
    pass: true
    constraints_checked: 5
    corrections_applied: 0
---
```

For corrections:

```yaml
---
timestamp: "2026-01-20T10:31:00Z"
signal: MODIFY
source: cli
component:
  name: "ClaimButton"
validation:
  lens:
    pass: false
    correction_applied: true
    fix:
      target: "behavioral.timing"
      from: "400"
      to: "800"
learning:
  inference: "User accepted timing correction for financial"
---
```
</taste_integration>

<cli_availability>
## CLI Availability

Check if CLIs are available before running:

```bash
# Check if anchor is available
if command -v anchor &> /dev/null; then
    # Run anchor validation
    anchor validate --request-id $REQUEST_ID
else
    # Fallback: skip anchor validation, warn user
    echo "Warning: anchor CLI not found, skipping zone validation"
fi

# Check if lens is available
if command -v lens &> /dev/null; then
    lens lint --request-id $REQUEST_ID
else
    echo "Warning: lens CLI not found, skipping constraint verification"
fi
```

When CLIs are not available:
1. Log warning to output
2. Proceed with built-in physics rules only
3. Note in taste.md that formal verification was skipped
</cli_availability>

<parallel_execution>
## Parallel Execution Pattern

For optimal performance, run both validations in parallel:

```bash
#!/bin/bash
REQUEST_ID="${1:-$(uuidgen | tr '[:upper:]' '[:lower:]')}"

# Write request
mkdir -p grimoires/pub/requests grimoires/pub/responses
cat > "grimoires/pub/requests/${REQUEST_ID}.json" << 'EOF'
{
  "request_id": "${REQUEST_ID}",
  ...
}
EOF

# Run in parallel
anchor validate --request "$REQUEST_ID" &
ANCHOR_PID=$!

lens lint --request-id "$REQUEST_ID" &
LENS_PID=$!

# Wait for both
wait $ANCHOR_PID
ANCHOR_EXIT=$?

wait $LENS_PID
LENS_EXIT=$?

# Check results
if [ $ANCHOR_EXIT -ne 0 ] || [ $LENS_EXIT -ne 0 ]; then
    echo "Validation failed"
    exit 1
fi

echo "Validation passed"
```
</parallel_execution>

<user_facing_ux>
## User-Facing Messaging Guidelines

### Tone & Voice

- **Be helpful, not alarming.** Violations aren't failures — they're guidance.
- **Explain the "why".** Users should understand the physics reasoning.
- **Offer clear paths forward.** Never leave users without options.

### Box Styling

All violation/conflict boxes follow this structure:

```
┌─ {Title} ────────────────────────────────────────────────┐
│                                                          │
│  {Icon} {Headline}                                       │
│    {Explanation line 1}                                  │
│    {Explanation line 2}                                  │
│                                                          │
│  {Secondary content if any}                              │
│                                                          │
│  [{key}] {Action description}                            │
│  [{key}] {Action description}                            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Icons

| Icon | Meaning |
|------|---------|
| ✗ | Violation / Error |
| ⚠ | Warning / Conflict |
| → | Suggested change |
| ✓ | Passed / Applied |

### Key Bindings

| Key | Action |
|-----|--------|
| `a` | Apply fix |
| `o` | Override (with explanation) |
| `c` | Cancel |
| `r` | Reconsider / Return |
| `s` | Prioritize safety |
| `p` | Prioritize speed/preference |
| `e` | Explain / More context |

### Multi-Violation Display

When multiple violations exist, group by severity:

```
┌─ Validation Results ─────────────────────────────────────┐
│                                                          │
│  Errors (must fix):                                      │
│  ✗ Financial timing too fast (400ms < 800ms required)    │
│  ✗ Missing confirmation for destructive action           │
│                                                          │
│  Warnings (recommended):                                 │
│  ⚠ Animation easing could be smoother for this effect   │
│                                                          │
│  [a] Apply all fixes                                     │
│  [1] Fix error #1 only                                   │
│  [2] Fix error #2 only                                   │
│  [c] Cancel                                              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Compact Mode

After 3+ consecutive passes, switch to minimal feedback:

```
✓ Anchor: Critical zone valid | Lens: 5/5 constraints passed
```

Only expand to full box on violations.

### Error Recovery

When CLIs fail (exit code 30):

```
┌─ Validation Unavailable ─────────────────────────────────┐
│                                                          │
│  Could not run formal verification:                      │
│  {error message}                                         │
│                                                          │
│  Proceeding with built-in physics rules only.            │
│  Recommendation: Run `anchor --check` to diagnose.       │
│                                                          │
│  [p] Proceed without formal verification                 │
│  [c] Cancel and investigate                              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Override Logging

When user chooses to override, capture reasoning for taste.md:

```yaml
---
timestamp: "2026-01-20T10:35:00Z"
signal: MODIFY
source: cli
component:
  name: "ClaimButton"
  effect: "Financial"
validation:
  lens:
    pass: false
    override: true
    override_reason: "Power users prefer faster timing"
    constraint_violated: "financial_timing_minimum"
learning:
  inference: "User prioritizes speed for power user audience"
---
```
</user_facing_ux>
