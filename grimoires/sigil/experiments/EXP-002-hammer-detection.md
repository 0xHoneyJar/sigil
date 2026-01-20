# Experiment: Improved Hammer Detection for Framework Changes

```yaml
---
id: "EXP-002"
name: "Improved Hammer Detection for Framework Changes"
status: "🏃 in_progress"
outcome: null

# Lifecycle
dates:
  proposed: "2026-01-19"
  started: "2026-01-19"
  review_by: null
  concluded: null

# Ownership
owner: null
backup: null
---
```

---

## Hypothesis

**IF** we add framework-change signals (commands, skills, workflows, integrations) to Hammer detection
**THEN** /craft will correctly route architecture-requiring work through Loa's PRD → SDD → Sprint flow
**BECAUSE** current keyword detection misses requests that seem "small" but touch multiple system files

---

## Observations (Evidence)

| User | Insight | Type | Gap | Link |
|------|---------|------|-----|------|
| zksoju | "Is there a reason we skipped over Loa's PRD flow here? I find it that it's common we skip over it in craft as well" | framework-maintainer | process-gap | Session 2026-01-19 |

### Session Context

During implementation of the experiments system:
1. `/plan-and-analyze` was invoked → PRD created
2. User asked for "artifact structure in relation to crafting and observing"
3. Claude interpreted as direct implementation request
4. Skipped `/architect` and `/sprint-plan`
5. Went straight to creating files

**Root cause**: Hammer detection relies on keywords like "build", "feature", "implement". Requests phrased as "create X structure" or "add Y to Z" bypass detection even when they require multi-file architectural changes.

---

## What We're Changing

| Component | Change | Physics Adjustment |
|-----------|--------|-------------------|
| craft.md Step 0.5 | Add framework-change signals to Hammer detection | N/A (workflow) |
| craft.md Step 0.5 | Add "PRD exists" check with architect prompt | N/A (workflow) |

### Proposed Detection Changes

**New Hammer signals (+1 each):**
```
| Signal Type | Patterns |
|-------------|----------|
| Framework refs | "command", "skill", "workflow", "integration", "protocol" |
| Grimoire refs | "grimoire", "experiments", "observations", "taste" |
| Multi-file hints | "structure", "system", "across", "throughout" |
| PRD exists | grimoires/loa/prd.md exists and is < 24h old |
```

**New prompt when PRD exists:**
```
┌─ PRD Detected ────────────────────────────────────────────┐
│                                                           │
│  Found: grimoires/loa/prd.md (created today)              │
│  Topic: {prd title}                                       │
│                                                           │
│  Options:                                                 │
│  1. Continue to /architect → Design (SDD)                 │
│  2. Implement directly (skip architecture)                │
│  3. Start fresh (new PRD)                                 │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## Success Criteria

| Metric | Baseline | Target | How Measured |
|--------|----------|--------|--------------|
| Hammer detection for framework changes | ~20% (estimated) | >80% | Manual review of /craft sessions |
| PRD → SDD → Sprint completion rate | Unknown | >70% when PRD exists | Taste log analysis |
| False positive rate (unnecessary Hammer) | 0% | <10% | User overrides to Chisel |

---

## Implementation Plan

- [ ] Add framework-change signals to Step 0.5 detection algorithm
- [ ] Add "PRD exists" check before mode detection
- [ ] Add prompt for PRD → architect continuation
- [ ] Test with framework change requests
- [ ] Monitor for false positives (Chisel requests routed to Hammer)
- [ ] Gather feedback for 2 weeks

---

## Craft Sessions

| Date | Component | Session ID | Signal |
|------|-----------|------------|--------|
| *linked when /craft --experiment runs* | | | |

---

## Learning Memo

*Filled in when experiment concludes*

### What We Observed

{Evidence from the experiment period}

### What We Learned

{Conclusions drawn from evidence}

### Outcome Decision

**Decision**: {marry | kiss | kill}

**Reasoning**: {Why this decision}

### If Marry
- Move to: `orchard/hammer-detection.md`
- Document as permanent feature

### If Kiss
- Follow-up experiment: EXP-XXX
- What to iterate on: {specifics}

### If Kill
- Why it failed: {evidence}
- What we'd do differently: {learnings}

---

## References

- Original observation: Session 2026-01-19 (experiments system implementation)
- Related: EXP-001 (also created without full Loa flow)
- **PRD**: [prd-hammer-detection.md](../../loa/prd-hammer-detection.md)
- **SDD**: [sdd-hammer-detection.md](../../loa/sdd-hammer-detection.md)
- **Sprint**: [sprint-hammer-detection.md](../../loa/sprint-hammer-detection.md)
- craft.md Step 0.5: Mode Detection
- Loa workflow: /plan-and-analyze → /architect → /sprint-plan
