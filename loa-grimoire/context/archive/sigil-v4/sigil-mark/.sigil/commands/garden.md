---
name: garden
description: Detect drift, stale decisions, and mutation outcomes
skill: gardening-entropy
skill_path: .sigil/skills/gardening-entropy/SKILL.md
allowed_tools:
  - Read
  - Write
  - Bash
preflight:
  - sigil_setup_complete
---

# /garden

Maintain the design system by detecting entropy.

## What It Detects

### 🌿 Healthy
Components aligned with resonance, no violations

### 🍂 Stale
Decisions not matched in 6+ months. Should be:
- Reviewed and confirmed
- Archived if no longer relevant
- Updated if context changed

### 🌪️ Drift
Components that have drifted from zone specs:
- Material physics mismatch
- Tension values outside range
- Styles not matching material

### 🧪 Mutations
Active experiments:
- Status (dogfooding, testing, expired)
- Metrics vs success criteria
- Recommendation (promote, reject, extend)

## Usage

```
/garden                # Full entropy scan
/garden --stale        # Just stale decisions
/garden --drift        # Just drift detection
/garden --mutations    # Just mutation status
```

## Output

Entropy report with:
- Healthy count
- Stale decisions (with action needed)
- Drift locations (with fix suggestions)
- Mutation outcomes (with recommendation)
