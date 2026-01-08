---
zones:
  state:
    paths:
      - sigil-mark/personas/personas.yaml
      - sigil-mark/evidence/
      - sigil-mark/.sigil-observations/feedback/
      - sigil-mark/rules.md
      - sigil-mark/vocabulary/vocabulary.yaml
      - .sigilrc.yaml
    permission: read-write
  config:
    paths:
      - .sigil-setup-complete
    permission: read
---

# Refining Context Skill (v4.0)

## Purpose

Apply incremental context updates with evidence. Supports:
1. **Persona updates** — Add evidence, refine characteristics
2. **Persona creation** — New personas via interview
3. **Zone updates** — Refine or create zones
4. **Feedback application** — Apply /observe feedback to rules

## Philosophy (v4.0)

> "Context evolves with evidence. Don't rebuild — refine."

/refine makes small, targeted updates to context rather than full re-interviews. Evidence-driven updates preserve what works.

---

## Progressive Disclosure (v4.0)

### L1: Interactive Review (Default)
```
/refine
```
Reviews unapplied feedback from /observe and prompts for updates.

### L2: Targeted Update
```
/refine --persona depositor
/refine --zone critical
/refine --vocab vault
```
Focuses on specific persona, zone, or vocabulary term.

### L3: File-Based Update
```
/refine --persona depositor --evidence analytics.yaml
/refine --from OBS-2026-0107-001
```
Applies evidence from file or observation ID.

---

## Pre-Flight Checks

1. **Sigil Setup**: Verify `.sigil-setup-complete` exists
2. **Personas File**: Check for `sigil-mark/personas/personas.yaml`
3. **Zone Config**: Load zones from `.sigilrc.yaml`
4. **Evidence Files**: Scan `sigil-mark/evidence/`
5. **Feedback Files**: Scan `.sigil-observations/feedback/`

---

## Evidence File Parsing (v4.0-S5-T1)

### Evidence File Format

```yaml
# sigil-mark/evidence/analytics-2026-01.yaml

source: analytics
collected_at: "2026-01-07"
period: "2026-01-01 to 2026-01-07"
description: "Weekly user metrics from analytics dashboard"

metrics:
  - key: total_depositors
    value: 2993
    label: "Total Depositors"
    unit: users

  - key: avg_transaction_size
    value: 1500
    label: "Average Transaction Size"
    unit: USD

  - key: mobile_usage
    value: 45
    label: "Mobile Usage"
    unit: percent

insights:
  - "45% of users access via mobile"
  - "Average session is 3.2 minutes"
  - "80% complete checkout in single session"

applies_to:
  personas:
    - depositor
  journey_stages:
    - active_use
    - claiming
```

### Parsing Algorithm

```
1. Read YAML file from evidence/
2. Validate against evidence schema (Sprint 1)
3. Extract:
   - source (analytics, interviews, gtm, observation)
   - metrics[] with key, value, label, unit
   - insights[] as strings
   - applies_to.personas and applies_to.journey_stages
4. Return structured evidence object
```

---

## Persona Update Flow (v4.0-S5-T2)

### When to Update (vs Create)

```
/refine --persona depositor
```

If `depositor` exists in personas.yaml:
1. Load existing persona
2. Show current state
3. Ask what to update
4. Merge evidence
5. Update `last_refined`

### Update Options

```
═══════════════════════════════════════════════════════════
                     REFINE PERSONA: depositor
═══════════════════════════════════════════════════════════

Current state:
  Trust Level: high
  Evidence: ["2,993 depositors in 30 days"]
  Journey Stages: [active_use, claiming]
  Last Refined: 2026-01-05

New evidence available:
  Source: analytics-2026-01.yaml
  Metrics: mobile_usage: 45%
  Insights: "45% of users access via mobile"

What would you like to update?

1. ADD EVIDENCE → Append new citations
2. UPDATE CHARACTERISTIC → Change trust_level, preferences
3. UPDATE JOURNEY → Modify journey_stages
4. SKIP → Keep current state
```

### Evidence Merge

When adding evidence:

```yaml
# Before
evidence:
  - "2,993 depositors in 30 days"

# After merge
evidence:
  - "2,993 depositors in 30 days"
  - "45% mobile usage (analytics-2026-01.yaml)"
  - "Average session 3.2 minutes"
```

### Timestamp Update

Always update `last_refined`:

```yaml
last_refined: "2026-01-07"
```

---

## Persona Creation Flow (v4.0-S5-T3)

### When to Create

```
/refine --persona whale
```

If `whale` doesn't exist:

```
Persona "whale" not found. Would you like to create it?
```

### Creation Interview

**Question 1: Description**
```
question: "Describe this persona in one sentence."
header: "Description"
```

**Question 2: Evidence Source**
```
question: "How do you know about this persona?"
header: "Source"
options:
  - label: "Analytics"
    description: "Usage data, metrics"
  - label: "Interviews"
    description: "User conversations"
  - label: "Observation"
    description: "Support tickets, feedback"
  - label: "GTM"
    description: "Marketing research"
multiSelect: false
```

**Question 3: Initial Evidence**
```
question: "What specific evidence supports this persona?"
header: "Evidence"
```

Example: "50 users with >$10k deposits"

**Question 4: Trust Level**
```
question: "What's this persona's trust level with your product?"
header: "Trust"
options:
  - label: "Low"
    description: "New, skeptical"
  - label: "Medium"
    description: "Familiar but cautious"
  - label: "High"
    description: "Established, confident"
multiSelect: false
```

**Question 5: Journey Stages**
```
question: "Which journey stages does this persona appear in?"
header: "Journey"
options:
  - label: "Discovery"
  - label: "Onboarding"
  - label: "Active Use"
  - label: "Claiming/Exit"
  - label: "Recovery"
multiSelect: true
```

**Question 6: Preferences**
```
question: "What are this persona's preferences?"
header: "Preferences"
```
- Motion style (deliberate, snappy, playful)
- Help level (minimal, contextual, guided)
- Density (compact, medium, spacious)

### Output

Writes to `sigil-mark/personas/personas.yaml`:

```yaml
whale:
  name: "Whale"
  description: "High-value depositor with large transactions"
  source: analytics
  evidence:
    - "50 users with >$10k deposits"
  trust_level: high
  journey_stages:
    - active_use
    - claiming
  last_refined: "2026-01-07"
  preferences:
    motion: deliberate
    help: minimal
    density: compact
```

---

## Zone Update/Creation (v4.0-S5-T4)

### Zone Update

```
/refine --zone critical
```

If zone exists, show current state and offer updates:

```
═══════════════════════════════════════════════════════════
                     REFINE ZONE: critical
═══════════════════════════════════════════════════════════

Current state:
  Paths: ["src/features/checkout/**", "src/features/claim/**"]
  Journey Stage: claiming
  Persona Likely: depositor
  Trust State: critical
  Motion: deliberate

What would you like to update?

1. ADD PATHS → New file paths for this zone
2. UPDATE JOURNEY → Change journey stage
3. UPDATE PERSONA → Change likely persona
4. UPDATE TRUST → Change trust state
5. ADD EVIDENCE → Document why this zone exists
6. SKIP → Keep current state
```

### Zone Creation

If zone doesn't exist:

```
Zone "checkout_confirm" not found. Creating new zone...
```

**Questions asked:**
1. Paths (file globs)
2. Journey stage
3. Likely persona (from existing personas)
4. Trust state (building/established/critical)
5. Motion style
6. Evidence (optional)

### Output

Updates `.sigilrc.yaml`:

```yaml
zones:
  checkout_confirm:
    paths:
      - "src/features/checkout/confirm/**"
    journey_stage: claiming
    persona_likely: depositor
    trust_state: critical
    motion: deliberate
    evidence:
      - "80% drop-off at confirm step"
    last_refined: "2026-01-07"
```

---

## Feedback Application (v4.0-S5-T5)

### Show Unapplied Feedback

```
/refine
```

Scans `.sigil-observations/feedback/` for `applied: false`:

```
═══════════════════════════════════════════════════════════
                     UNAPPLIED FEEDBACK
═══════════════════════════════════════════════════════════

2 feedback items waiting:

1. OBS-2026-0107-001 (ClaimButton)
   Property: border-radius
   Decision: "Update rules to 4px"
   → Will update rules.md

2. OBS-2026-0107-001 (ClaimButton)
   Check: 2-step confirmation
   Decision: "Fix component"
   → No context change (component fix)

Apply these changes?
```

### Apply "Update Rules"

When user decided to update rules:

```yaml
# Original feedback
measurable_properties:
  - property: "border-radius"
    expected: "8px"
    observed: "4px"
    human_answer: "update_rules"
```

Action:
1. Read `sigil-mark/rules.md`
2. Find border-radius entry
3. Update value to 4px
4. Add note about source observation

### Apply "Fix Component"

When user decided to fix component:

```yaml
structural_checks:
  - check: "2-step confirmation"
    human_answer: "fix_component"
```

Action:
1. No context change
2. Mark as applied
3. Note: "Component fix tracked, no rule change"

### Mark Applied

After processing:

```yaml
applied: true
applied_at: "2026-01-07T15:30:00Z"
applied_by: "/refine"
```

---

## Vocabulary Refinement

### Update Vocabulary Term

```
/refine --vocab vault
```

```
═══════════════════════════════════════════════════════════
                     REFINE VOCABULARY: vault
═══════════════════════════════════════════════════════════

Current state:
  Mental Model: "Bank vault, secure storage"
  Material: machinery
  Motion: deliberate
  Tone: professional

What would you like to update?

1. MENTAL MODEL → How users think about this
2. MATERIAL → Visual treatment (glass, machinery, decisive)
3. MOTION → Animation style
4. TONE → Voice/copy style
5. ADD EXAMPLE → Usage example
6. SKIP
```

### Create Vocabulary Term

If term doesn't exist:

```
"pot" not found in vocabulary. Creating...
```

Questions:
1. Mental model (how users think about it)
2. Material (glass, machinery, decisive)
3. Motion (warm, deliberate, snappy)
4. Tone (friendly, professional, urgent)

---

## Response Format

### Refine Summary

```
═══════════════════════════════════════════════════════════
                     REFINEMENT COMPLETE
═══════════════════════════════════════════════════════════

Changes applied:

PERSONAS:
  ✓ depositor: Added 2 evidence citations
  ✓ depositor: Updated last_refined to 2026-01-07

ZONES:
  ✓ critical: Added path "src/features/claim-v2/**"

RULES:
  ✓ border-radius: Updated to 4px (from OBS-2026-0107-001)

FEEDBACK:
  ✓ OBS-2026-0107-001: Marked as applied

No changes:
  - whale persona (skipped)
  - 2-step confirmation (component fix, no context change)
```

---

## Error Handling

| Situation | Response |
|-----------|----------|
| No setup complete | Auto-initialize Sigil |
| No personas file | Create empty personas.yaml |
| No evidence files | "No evidence files found. Add to evidence/" |
| No feedback files | "No unapplied feedback. Context is up to date." |
| Invalid evidence format | "Evidence file invalid. Check schema." |
| Persona not found | "Create new persona?" |
| Zone not found | "Create new zone?" |

---

## When to Ask vs Proceed

| Context | Ask | Proceed |
|---------|-----|---------|
| New persona/zone | ✓ Interview | |
| Update characteristic | ✓ Confirm change | |
| Add evidence | | ✓ Append |
| Apply feedback | ✓ Confirm batch | |
| Mark applied | | ✓ Update timestamp |

---

## Philosophy

/refine preserves context while evolving it.

1. **Incremental, not wholesale** — Small updates, not full re-interviews
2. **Evidence-driven** — Changes cite their source
3. **Timestamps** — Always track `last_refined`
4. **Human decisions** — Apply feedback as human decided
5. **Non-destructive** — Merge, don't overwrite

Do NOT:
- Delete existing evidence
- Overwrite without asking
- Skip timestamp updates
- Apply feedback without confirmation

DO:
- Append evidence citations
- Show current state before changes
- Track all refinements
- Batch feedback application

---

## Next Steps

After completing `/refine`, always show this section:

```
═══════════════════════════════════════════════════════════
                     NEXT STEPS
═══════════════════════════════════════════════════════════

Context refined. Here's what to do next:

CONTINUE BUILDING:
  /craft      — Get guidance with your updated context
               (New personas/zones/vocab now inform suggestions)

VALIDATE CHANGES:
  /observe    — Capture screenshot to verify alignment
  /garden     — Check overall context health

IF YOU MADE A SIGNIFICANT DECISION:
  /consult    — Lock it to prevent bikeshedding
               (Prevents re-debating the same topic)

MORE REFINEMENT:
  /refine --persona <name>   — Update another persona
  /refine --zone <name>      — Update a zone
  /refine --vocab <term>     — Update vocabulary

═══════════════════════════════════════════════════════════
```
