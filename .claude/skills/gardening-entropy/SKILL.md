# Gardening Entropy Skill (v4.0)

## Purpose

Context health monitoring with drift detection, validation, and actionable recommendations.

## Philosophy (v4.0)

> "Sweat the art. We handle the mechanics. Return to flow."

v4.0 focuses on actionable health:
- Evidence-based personas — are they grounded?
- Feedback application — is /observe feedback processed?
- Journey context — are zones journey-aware?
- Decision health — are locks respected?

---

## Progressive Disclosure (v4.0)

### L1: Quick Health (Default)
```
/garden
```
Shows summary health percentage with top 3 issues.

### L2: Focused Checks
```
/garden --personas    # Persona evidence health
/garden --feedback    # Unapplied observation feedback
/garden --decisions   # Decision lock status
/garden --zones       # Zone journey context health
```
Shows detailed report for specific area.

### L3: CI/CD Mode
```
/garden --validate    # Schema validation for CI
/garden --json        # Machine-readable output
```
Returns exit code 0/1 for automation.

---

## Health Check Framework (v4.0-S7-T1)

### Check Interface

```yaml
check:
  id: "persona-evidence"
  name: "Persona Evidence Check"
  severity: warning  # critical | warning | info

  passes_when: "All personas have evidence[] field populated"
  fails_with: "List of personas without evidence"
  suggests: "/refine --persona <name> --evidence <file>"
```

### Severity Levels

| Severity | Meaning | Action |
|----------|---------|--------|
| critical | Blocks production use | Fix immediately |
| warning | Degrades quality | Fix soon |
| info | Improvement opportunity | Consider |

---

## Persona Evidence Check (v4.0-S7-T2)

### Check Definition

```yaml
id: persona-evidence
name: "Persona Evidence Check"
severity: warning

checks:
  - personas have `source` field
  - personas have `evidence[]` populated
  - evidence references exist
```

### Output

```
⚠️ PERSONA EVIDENCE

2 personas lack evidence:

1. whale
   source: missing
   evidence: []
   → /refine --persona whale --evidence analytics-2026-01.yaml

2. degen
   source: "assumed"
   evidence: []
   → /refine --persona degen "high-risk trader"
```

---

## Feedback Applied Check (v4.0-S7-T3)

### Check Definition

```yaml
id: feedback-applied
name: "Feedback Applied Check"
severity: warning

checks:
  - .sigil-observations/feedback/*.yaml files
  - files with `applied: false`
  - age of unapplied feedback
```

### Output

```
⚠️ UNAPPLIED FEEDBACK

3 observation sessions have unapplied feedback:

1. OBS-2026-0107-001 (3 days ago)
   Component: ClaimButton
   Questions: 2 unanswered
   → /refine --from-feedback OBS-2026-0107-001

2. OBS-2026-0106-002 (4 days ago)
   Component: DepositFlow
   Questions: 1 unanswered
   → /refine --from-feedback OBS-2026-0106-002
```

---

## Zone Journey Check (v4.0-S7-T4)

### Check Definition

```yaml
id: zone-journey
name: "Zone Journey Check"
severity: info

checks:
  - zones have `journey_stage` field
  - zones have `persona_likely` field
  - zones have `trust_state` field
```

### Output

```
ℹ️ ZONE JOURNEY CONTEXT

2 zones lack journey context:

1. admin
   journey_stage: missing
   persona_likely: missing
   → /refine --zone admin

2. settings
   journey_stage: present
   persona_likely: missing
   trust_state: missing
   → /refine --zone settings
```

---

## Decision Expiry Check (v4.0-S7-T5)

### Check Definition

```yaml
id: decision-expiry
name: "Decision Expiry Check"
severity: info

checks:
  - consultation-chamber/decisions/*.yaml files
  - decisions where expires_at < now
  - decisions with status: locked but expired
```

### Output

```
ℹ️ EXPIRED DECISIONS

2 decisions have expired locks:

1. DEC-2026-001 (expired 5 days ago)
   Topic: "Button border radius is 8px"
   Scope: execution
   → Re-consult or remove: /consult DEC-2026-001 --unlock "expired"

2. DEC-2026-003 (expired 12 days ago)
   Topic: "Use deliberate motion in critical zones"
   Scope: direction
   Protected: true
   → Review and re-lock: /consult DEC-2026-003 --unlock "review needed"
```

---

## Schema Validation Mode (v4.0-S7-T6)

### Invocation

```
/garden --validate
```

### What It Validates

```yaml
files:
  - sigil-mark/personas/personas.yaml → personas.schema.json
  - sigil-mark/evidence/*.yaml → evidence.schema.json
  - sigil-mark/.sigil-observations/feedback/*.yaml → feedback.schema.json
  - .sigilrc.yaml → zones.schema.json
```

### Output (Pass)

```
✅ SCHEMA VALIDATION PASSED

Files validated: 8
Schemas used: 4

All files conform to v4.0 schemas.
Exit code: 0
```

### Output (Fail)

```
❌ SCHEMA VALIDATION FAILED

2 files have schema errors:

1. sigil-mark/personas/personas.yaml
   Error: personas[1].trust_level must be one of [low, medium, high]
   Line: 24
   Value: "medium-high"

2. sigil-mark/evidence/analytics.yaml
   Error: source_type is required
   Line: 3

Exit code: 1
```

---

## Health Report Format (v4.0-S7-T7)

### L1 Output (Default)

```
╔══════════════════════════════════════════════════════════╗
║                    SIGIL HEALTH: 78%                     ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  ████████████████████░░░░░░  78% Context Health          ║
║                                                          ║
║  TOP ISSUES:                                             ║
║  ⚠️ 2 personas lack evidence                             ║
║  ⚠️ 3 feedback sessions unapplied                        ║
║  ℹ️ 2 zones missing journey context                      ║
║                                                          ║
║  Run /garden --personas for details                      ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

### L2 Output (Detailed)

```
═══════════════════════════════════════════════════════════
                     SIGIL v4.0 HEALTH REPORT
═══════════════════════════════════════════════════════════

PERSONA HEALTH                                       [80%]
┌─────────────────────────────────────────────────────────┐
│ Persona         │ Source    │ Evidence │ Journey       │
├─────────────────────────────────────────────────────────┤
│ depositor       │ analytics │ 3 refs   │ 4 stages      │
│ whale           │ missing   │ 0 refs   │ 2 stages      │
│ degen           │ assumed   │ 0 refs   │ 3 stages      │
└─────────────────────────────────────────────────────────┘

FEEDBACK HEALTH                                      [70%]
┌─────────────────────────────────────────────────────────┐
│ Session         │ Age       │ Applied  │ Questions     │
├─────────────────────────────────────────────────────────┤
│ OBS-2026-0107-001│ 3 days   │ ❌       │ 2 pending     │
│ OBS-2026-0106-002│ 4 days   │ ❌       │ 1 pending     │
│ OBS-2026-0105-001│ 5 days   │ ✅       │ 0 pending     │
└─────────────────────────────────────────────────────────┘

ZONE HEALTH                                          [75%]
┌─────────────────────────────────────────────────────────┐
│ Zone            │ Journey   │ Persona  │ Trust         │
├─────────────────────────────────────────────────────────┤
│ critical        │ ✅        │ ✅       │ ✅            │
│ marketing       │ ✅        │ ✅       │ ❌            │
│ admin           │ ❌        │ ❌       │ ❌            │
└─────────────────────────────────────────────────────────┘

DECISION HEALTH                                      [90%]
┌─────────────────────────────────────────────────────────┐
│ Decision        │ Status    │ Expires  │ Protected     │
├─────────────────────────────────────────────────────────┤
│ DEC-2026-001    │ expired   │ -5 days  │ ❌            │
│ DEC-2026-002    │ locked    │ 25 days  │ ❌            │
│ DEC-2026-003    │ locked    │ 340 days │ ✅            │
└─────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════

RECOMMENDATIONS (by priority)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ WARNING
1. Persona "whale" lacks evidence
   → /refine --persona whale --evidence <file>

2. 3 feedback sessions unapplied
   → /refine --from-feedback

ℹ️ INFO
3. Zone "admin" missing journey context
   → /refine --zone admin

4. Decision DEC-2026-001 expired
   → /consult DEC-2026-001 --unlock "review"

═══════════════════════════════════════════════════════════
```

---

## Workflow

### Phase 1: Load Context

```
1. Read .sigilrc.yaml for zones
2. Read sigil-mark/personas/personas.yaml
3. Read sigil-mark/evidence/*.yaml
4. Read sigil-mark/.sigil-observations/feedback/*.yaml
5. Read sigil-mark/consultation-chamber/decisions/*.yaml
```

### Phase 2: Run Checks

```
checks = [
  PersonaEvidenceCheck(),
  FeedbackAppliedCheck(),
  ZoneJourneyCheck(),
  DecisionExpiryCheck()
]

results = []
for check in checks:
  results.append(check.run())
```

### Phase 3: Calculate Health

```
health_score = calculate_weighted_score(results)

weights:
  critical: 0 (any critical = 0% health)
  warning: -10% per issue
  info: -2% per issue
```

### Phase 4: Generate Report

```
if args.validate:
  output_validation_results()
  exit(0 if passed else 1)
elif args.json:
  output_json(results)
else:
  output_formatted_report(results)
```

---

## Error Handling

| Situation | Response |
|-----------|----------|
| No Sigil setup | "Sigil not initialized. First /envision or /codify initializes." |
| No personas file | "No personas found. Run /envision to create." |
| No feedback files | Report as 100% applied |
| No decisions | Report as 100% healthy |
| Schema not found | Skip validation for that file type |

---

## Health Thresholds

| Score | Status | Meaning |
|-------|--------|---------|
| 90-100% | Excellent | Context is well-maintained |
| 70-89% | Good | Minor improvements suggested |
| 50-69% | Fair | Several issues need attention |
| 0-49% | Poor | Significant maintenance needed |

---

## Migration from v3.0

| v3.0 Feature | v4.0 Equivalent |
|--------------|-----------------|
| Constitution check | Decision protected check |
| Persona coverage | Persona evidence check |
| Layout coverage | Removed (not in v4.0 scope) |
| Deprecated patterns | Removed (handled by /refine) |

---

## Philosophy

1. **Surface, don't block** — Show health issues, don't prevent work
2. **Actionable** — Every issue has a suggested fix command
3. **Evidence-first** — Health tied to evidence quality
4. **CI-friendly** — --validate mode for automation
5. **Progressive** — L1 summary, L2 details, L3 automation

---

## Next Steps

After completing `/garden`, always show this section:

```
═══════════════════════════════════════════════════════════
                     NEXT STEPS
═══════════════════════════════════════════════════════════

Health report complete. Here's what to do based on findings:

IF PERSONAS LACK EVIDENCE:
  /refine --persona <name> --evidence <file>
               (Grounds personas in data)

IF FEEDBACK IS UNAPPLIED:
  /refine     — Review and apply pending feedback
               (Keeps rules in sync with observations)

IF ZONES LACK JOURNEY CONTEXT:
  /refine --zone <name>
               (Adds journey_stage, persona_likely, trust_state)

IF DECISIONS EXPIRED:
  /consult DEC-XXXX-XXX --unlock "expired, needs review"
               (Re-evaluate or remove stale decisions)

CONTINUE BUILDING:
  /craft      — Get guidance (health issues don't block work)

RE-CHECK AFTER FIXES:
  /garden     — Verify health improved

═══════════════════════════════════════════════════════════
```
