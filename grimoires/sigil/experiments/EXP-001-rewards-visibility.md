# Experiment: Rewards Visibility for Trust-Checkers

```yaml
---
id: "EXP-001"
name: "Rewards Visibility for Trust-Checkers"
status: "💡 idea"
outcome: null

# Lifecycle
dates:
  proposed: "2026-01-19"
  started: null
  review_by: null
  concluded: null

# Ownership
owner: null
backup: null
---
```

---

## Hypothesis

**IF** we show reward deltas (+X since last check) and trend indicators
**THEN** trust-checker users will feel more confident and check less frequently
**BECAUSE** their anxiety stems from inability to verify accumulation, not actual system issues

---

## Observations (Evidence)

| User | Insight | Type | Gap | Link |
|------|---------|------|-----|------|
| alice | "I try to remember the number from before but I forget" | trust-checker | discoverability | [diagnostic](../observations/alice-diagnostic.md) |

---

## What We're Changing

| Component | Change | Physics Adjustment |
|-----------|--------|-------------------|
| RewardsDisplay | Add "+X since last" delta indicator | Query physics, 150ms |
| RewardsDisplay | Add trend arrow (↑/↓/→) | Local state, 100ms |
| RewardsDisplay | Subtle pulse on value increase | Animation: spring(500), scale 1.02 |

---

## Success Criteria

| Metric | Baseline | Target | How Measured |
|--------|----------|--------|--------------|
| Support tickets about reward visibility | Unknown | Reduce by 50% | Support channel monitoring |
| User-reported confidence | "can't tell if working" | "I can see it growing" | Follow-up interview |
| Check frequency for trust-checkers | 5x/day (alice self-reported) | 2-3x/day | Qualitative feedback |

---

## Implementation Plan

- [ ] `/craft RewardsDisplay` with delta indicator
- [ ] Add trend arrow component
- [ ] Apply subtle pulse animation on increase
- [ ] Ship to staging
- [ ] Announce experiment in release notes
- [ ] Follow up with alice for feedback
- [ ] Monitor for 2 weeks

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
- Move to: `orchard/rewards-visibility.md`
- Document as permanent feature

### If Kiss
- Follow-up experiment: EXP-XXX
- What to iterate on: {specifics}

### If Kill
- Why it failed: {evidence}
- What we'd do differently: {learnings}

---

## References

- Original observation: [alice-diagnostic.md](../observations/alice-diagnostic.md)
- Related components: RewardsDisplay, ClaimButton, StakingDashboard
- Craft sessions: *to be linked*
