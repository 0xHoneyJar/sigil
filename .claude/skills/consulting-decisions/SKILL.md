---
zones:
  state:
    paths:
      - sigil-mark/consultation-chamber/decisions/
      - sigil-mark/consultation-chamber/config.yaml
      - sigil-mark/evidence/
      - sigil-mark/.sigil-observations/feedback/
    permission: read-write
  config:
    paths:
      - .sigilrc.yaml
      - .sigil-setup-complete
    permission: read
---

# Consulting Decisions Skill (v4.0)

## Purpose

Record deliberated decisions with time locks. Consolidates /approve, /canonize, and /unlock into single /consult command.

## Philosophy (v4.0)

> "Sweat the art. We handle the mechanics. Return to flow."

v4.0 consolidates decision recording:
- `/consult` replaces /approve for decisions
- `--protect` replaces /canonize for protected capabilities
- `--unlock` replaces /unlock command

---

## Progressive Disclosure (v4.0)

### L1: Quick Decision (Default)
```
/consult "2-step confirmation for transactions > $100"
```
Creates decision with default 30-day execution lock.

### L2: Scoped Decision
```
/consult "button border radius is 8px" --scope critical --lock 90d
/consult "use deliberate motion" --scope ClaimButton
```
Adds zone/component scope and custom lock duration.

### L3: Protected Decision
```
/consult "withdraw must always work" --protect
/consult "fee disclosure must show before confirmation" --protect --evidence OBS-2026-001
```
Protected decisions (like /canonize) with 365-day default lock.

---

## Core Decision Recording (v4.0-S6-T1)

### Decision Creation

```
/consult "decision text"
```

1. Generate ID: `DEC-{YYYY}-{NNN}`
2. Default 30-day execution lock
3. Write to `consultation-chamber/decisions/`

### Decision File Format

```yaml
id: "DEC-2026-007"
topic: "2-step confirmation for transactions > $100"
decision: "All transactions over $100 require explicit confirm step"
scope: execution
locked_at: "2026-01-07T14:30:00Z"
expires_at: "2026-02-06T14:30:00Z"
status: locked

# v4.0 additions
protected: false
evidence: []

context:
  zone: null  # or specific zone if scoped
  components: []  # or specific components if scoped

rationale: |
  User research shows anxiety at checkout for large amounts.
  2-step reduces accidental purchases.

unlock_history: []
```

---

## Scope and Lock Options (v4.0-S6-T2)

### Zone Scope

```
/consult "decision" --scope critical
```

Limits decision to specific zone:

```yaml
context:
  zone: "critical"
  components: []
```

### Component Scope

```
/consult "decision" --scope ClaimButton
/consult "decision" --scope "Checkout*"
```

Limits decision to specific components (glob patterns allowed):

```yaml
context:
  zone: null
  components: ["ClaimButton", "Checkout*"]
```

### Custom Lock Duration

```
/consult "decision" --lock 90d
/consult "decision" --lock 180d
```

| Duration | Use Case |
|----------|----------|
| 30d | Execution (default) |
| 90d | Direction |
| 180d | Strategic |
| 365d | Protected (default for --protect) |

---

## Decision Unlock (v4.0-S6-T3)

### Unlock Command

```
/consult DEC-2026-007 --unlock "New user research shows users prefer single-click"
```

### Requirements

- Reason is **required** (cannot be empty)
- Updates decision history
- Sets `status: unlocked`

### Unlock Flow

```
🔓 EARLY UNLOCK REQUEST

Decision: DEC-2026-007
Topic: 2-step confirmation for transactions > $100
Days remaining: 25

Original decision:
  All transactions over $100 require explicit confirm step

Please provide justification for unlocking.
```

### After Unlock

```yaml
status: unlocked
unlock_history:
  - unlocked_at: "2026-01-10T10:00:00Z"
    justification: "New user research shows users prefer single-click"
    remaining_days: 25
```

---

## Protected Capabilities (v4.0-S6-T4)

### Protect Flag

```
/consult "withdraw must always work" --protect
```

Creates protected decision:

```yaml
protected: true
scope: strategic
locked_at: "2026-01-07"
expires_at: "2027-01-07"  # 365 days
```

### Protected vs Regular

| Aspect | Regular | Protected |
|--------|---------|-----------|
| Default lock | 30 days | 365 days |
| Scope | execution | strategic |
| /garden priority | HIGH | CRITICAL |
| Unlock | Standard | Requires strong justification |

---

## Evidence Linking (v4.0-S6-T5)

### Link Observation Feedback

```
/consult "border-radius is 4px" --evidence OBS-2026-0107-001
```

Links to /observe feedback:

```yaml
evidence:
  - type: observation
    id: "OBS-2026-0107-001"
    summary: "4px observed in ClaimButton, confirmed as intended"
```

### Link Evidence File

```
/consult "depositors prefer deliberate motion" --evidence analytics-2026-01.yaml
```

Links to evidence file:

```yaml
evidence:
  - type: evidence_file
    path: "evidence/analytics-2026-01.yaml"
    summary: "Analytics show 80% completion with deliberate motion"
```

---

## Decision Tiers

| Tier | Scope | Lock Period | Use Case |
|------|-------|-------------|----------|
| Execution | execution | 30 days | Pixel details, specific impl |
| Direction | direction | 90 days | Visual style, tone, patterns |
| Strategic | strategic | 180 days | New features, major changes |
| Protected | strategic | 365 days | Core behaviors that must work |

---

## Response Format

### Decision Created

```
✅ DECISION RECORDED

ID: DEC-2026-007
Topic: 2-step confirmation for transactions > $100
Scope: execution
Lock: 30 days (expires 2026-02-06)

Decision:
  All transactions over $100 require explicit confirm step

Evidence:
  - OBS-2026-0107-001: User observed confusion at checkout

This decision will be surfaced by /craft when relevant.
To unlock: /consult DEC-2026-007 --unlock "reason"
```

### Decision Unlocked

```
🔓 DECISION UNLOCKED

ID: DEC-2026-007
Justification: New user research shows users prefer single-click

The decision can now be modified or re-consulted.
Note: /garden will show this as manually unlocked.
```

---

## Migration from v3.0

| v3.0 Command | v4.0 Equivalent |
|--------------|-----------------|
| /approve "decision" | /consult "decision" |
| /canonize "capability" | /consult "capability" --protect |
| /unlock DEC-001 | /consult DEC-001 --unlock "reason" |

---

## Error Handling

| Situation | Response |
|-----------|----------|
| No setup | Auto-initialize Sigil |
| Decision exists | "Decision {id} already exists. View with --status." |
| Decision not found | "Decision {id} not found." |
| Already unlocked | "Decision {id} is not currently locked." |
| No justification | "Please provide justification for unlock." |
| Invalid evidence | "Evidence file/observation not found." |

---

## Philosophy

1. **Record, don't rush** — This skill records deliberated decisions
2. **Evidence matters** — Link decisions to observations and data
3. **Locks prevent bikeshedding** — Not reconsideration
4. **Unlocks are valid** — With justification
5. **Protection is strategic** — For behaviors that must always work

---

## Next Steps

After completing `/consult`, always show this section:

```
═══════════════════════════════════════════════════════════
                     NEXT STEPS
═══════════════════════════════════════════════════════════

Decision recorded. Here's what to do next:

CONTINUE BUILDING:
  /craft      — Get guidance (your locked decisions are now respected)
               (Agent will warn if implementation conflicts)

IF YOU WANT TO UNLOCK LATER:
  /consult DEC-XXXX-XXX --unlock "reason"
               (Requires justification)

CHECK DECISION HEALTH:
  /garden --decisions   — See all active locks and expirations
  /garden               — Overall health including decisions

OTHER TOOLS:
  /observe    — Validate implementations match decisions
  /refine     — Update context (won't override locked decisions)

═══════════════════════════════════════════════════════════
```
