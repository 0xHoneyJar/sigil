# Sigil v4.0 Migration Guide

> "Sharp Tools" — From 37 commands to 7 discrete tools

This guide helps you migrate from Sigil v3.0 to v4.0 "Sharp Tools".

---

## Overview

Sigil v4.0 consolidates commands into 7 discrete tools with progressive disclosure:

| v3.0 Commands | v4.0 Tool |
|---------------|-----------|
| /setup, /inherit | Auto-setup (removed) |
| /envision | /envision (enhanced) |
| /codify | /codify (enhanced) |
| /craft | /craft (enhanced) |
| (new) | /observe |
| (new) | /refine |
| /approve, /canonize, /unlock | /consult |
| /garden, /validate | /garden |

---

## Breaking Changes

### 1. Auto-Setup

**v3.0:**
```bash
/setup              # Required before other commands
/inherit            # Bootstrap from existing codebase
```

**v4.0:**
```bash
/envision           # Auto-initializes Sigil if needed
/codify             # Auto-initializes Sigil if needed
```

No explicit setup required. First `/envision` or `/codify` creates `sigil-mark/` automatically.

---

### 2. Decision Commands Consolidated

**v3.0:**
```bash
/approve "decision"              # Record decision
/canonize "capability"           # Protected behavior
/unlock DEC-001                  # Unlock decision
```

**v4.0:**
```bash
/consult "decision"                          # Record decision (30d lock)
/consult "capability" --protect              # Protected behavior (365d lock)
/consult DEC-001 --unlock "reason"           # Unlock with reason
```

---

### 3. Validation Moved to /garden

**v3.0:**
```bash
/validate           # Schema validation
```

**v4.0:**
```bash
/garden --validate  # Schema validation for CI/CD
```

---

### 4. New Required Fields (Optional for Backwards Compatibility)

#### Persona Schema

New optional fields in `personas.yaml`:

```yaml
personas:
  - name: depositor
    # ... existing fields ...

    # NEW in v4.0 (optional)
    source: analytics          # Where persona data came from
    evidence:                  # Supporting evidence
      - id: EV-2026-001
        summary: "Mixpanel data"
    trust_level: high          # low | medium | high
    journey_stages:            # Which zones they visit
      - discovery
      - onboarding
      - active
    last_refined: "2026-01-07" # Last update timestamp
```

#### Zone Schema

New optional fields in `.sigilrc.yaml`:

```yaml
zones:
  critical:
    paths:
      - "src/features/claim/**"

    # NEW in v4.0 (optional)
    journey_stage: active      # discovery | onboarding | active | return
    persona_likely: depositor  # Which persona uses this zone
    trust_state: critical      # building | established | critical
    evidence:
      - id: EV-2026-002
```

---

## Deprecation Warnings

When you use deprecated commands, you'll see warnings:

```
⚠️ DEPRECATED: /setup

Setup is now automatic. First /envision or /codify initializes Sigil.

This command will be removed in v5.0.
```

### Deprecated Commands

| Command | Warning | Replacement |
|---------|---------|-------------|
| /setup | "Setup is automatic" | None needed |
| /inherit | "/envision auto-detects existing codebase" | /envision |
| /approve | "Use /consult to record decisions" | /consult |
| /canonize | "Use /consult --protect" | /consult --protect |
| /unlock | "Use /consult --unlock" | /consult --unlock |
| /validate | "Use /garden --validate" | /garden --validate |

---

## New Features

### 1. /observe — Visual Feedback Loop

Capture and analyze UI screenshots:

```bash
/observe                           # Capture current screen
/observe --component ClaimButton   # Focus on specific component
```

Requires Claude in Chrome MCP for automatic capture, or manual screenshot upload.

### 2. /refine — Incremental Context Updates

Update context without full interviews:

```bash
/refine --persona depositor --evidence analytics.yaml
/refine --zone critical
/refine --from-feedback    # Apply /observe feedback
```

### 3. Progressive Disclosure

All tools now support L1/L2/L3 grip levels:

```bash
# L1: Default (sensible defaults)
/craft "claim button"

# L2: Targeted
/craft "claim button" --zone critical

# L3: Full control
/craft "claim button" --zone critical --persona depositor --no-gaps
```

### 4. Evidence-Based Context

Personas and zones can now cite evidence:

```yaml
# sigil-mark/evidence/analytics-2026-01.yaml
source_type: analytics
source_name: Mixpanel
date_range:
  start: "2026-01-01"
  end: "2026-01-31"
metrics:
  - name: deposit_completion
    value: 0.82
insights:
  - "82% of users complete deposits on first try"
```

### 5. /garden Health Monitoring

Unified health checks with CI mode:

```bash
/garden                    # Summary health report
/garden --personas         # Persona evidence health
/garden --feedback         # Unapplied feedback check
/garden --validate         # Schema validation (exit code 0/1)
```

---

## Migration Steps

### Step 1: Update Sigil

```bash
# Pull latest Sigil framework
/update
```

### Step 2: Verify Existing Files

```bash
# Check schema compatibility
/garden --validate
```

Fix any validation errors before proceeding.

### Step 3: Add Evidence (Optional)

Add evidence to personas and zones for better /craft guidance:

```bash
# Create evidence file
# sigil-mark/evidence/analytics-2026-01.yaml

# Link to persona
/refine --persona depositor --evidence analytics-2026-01.yaml
```

### Step 4: Add Journey Context (Optional)

Add journey context to zones for better persona resolution:

```bash
# Update zone with journey context
/refine --zone critical
```

### Step 5: Test /craft

Verify /craft works with new context:

```bash
/craft "claim button"

# Check for gaps at end of output
# Use suggested /refine commands to fill gaps
```

---

## Backwards Compatibility

### Supported

- Existing `personas.yaml` files work without new fields
- Existing `.sigilrc.yaml` zones work without new fields
- Existing `moodboard.md` and `rules.md` unchanged

### Not Supported

- Deprecated commands will show warnings
- /setup no longer required (but works with warning)
- /validate redirects to /garden --validate

---

## Version Detection

Check current version:

```bash
cat .sigil-version.json
```

v4.0 output:
```json
{
  "version": "4.0.0",
  "codename": "Sharp Tools"
}
```

---

## Timeline

| Milestone | Date | Action |
|-----------|------|--------|
| v4.0 Release | 2026-01-07 | New tools available |
| Deprecation Warnings | 2026-01-07 | Old commands show warnings |
| v5.0 Release | Future | Deprecated commands removed |

---

## Getting Help

If you encounter issues during migration:

1. Run `/garden --validate` to check file compatibility
2. Check deprecation warnings for replacement commands
3. Use `/refine` to add missing context
4. Review this guide for command mapping

---

## Quick Reference

### Command Mapping

| Action | v3.0 | v4.0 |
|--------|------|------|
| Initialize | /setup | (automatic) |
| Bootstrap | /inherit | /envision |
| Capture feel | /envision | /envision |
| Define rules | /codify | /codify |
| Get guidance | /craft | /craft |
| Visual feedback | (none) | /observe |
| Update context | (full interview) | /refine |
| Record decision | /approve | /consult |
| Protect behavior | /canonize | /consult --protect |
| Unlock decision | /unlock | /consult --unlock |
| Health check | /garden | /garden |
| Schema validation | /validate | /garden --validate |

### The 7 Tools

```
CAPTURE              CREATE               OBSERVE
───────              ──────               ───────
/envision            /craft               /observe
/codify

REFINE               DECIDE               TEND
──────               ──────               ────
/refine              /consult             /garden
```

---

*Migration Guide v4.0.0*
*Last Updated: 2026-01-07*
