# Experiment: {NAME}

```yaml
---
id: "EXP-XXX"
name: "{Descriptive Name}"
status: "💡 idea"  # 💡 idea | 🤔 review | 🏃 in_progress | ✅ concluded
outcome: null      # marry | kiss | kill

# Lifecycle
dates:
  proposed: "YYYY-MM-DD"
  started: null
  review_by: null   # Default: 2 weeks from start
  concluded: null

# Ownership
owner: null
backup: null
---
```

---

## Hypothesis

**IF** we [specific change]
**THEN** [expected user behavior change]
**BECAUSE** [reasoning grounded in observation]

---

## Observations (Evidence)

| User | Insight | Type | Gap | Link |
|------|---------|------|-----|------|
| {handle} | "{key quote}" | {user_type} | {gap_type} | [diagnostic](../observations/{user}-diagnostic.md) |

---

## What We're Changing

| Component | Change | Physics Adjustment |
|-----------|--------|-------------------|
| {component} | {description} | {physics if UI} |

---

## Success Criteria

| Metric | Baseline | Target | How Measured |
|--------|----------|--------|--------------|
| {metric} | {current} | {goal} | {method} |

---

## Implementation Plan

- [ ] Step 1
- [ ] Step 2
- [ ] Step 3
- [ ] Ship to staging
- [ ] Announce experiment
- [ ] Monitor for review period

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
- Move to: `orchard/{feature}.md`
- Document as permanent feature

### If Kiss
- Follow-up experiment: EXP-XXX
- What to iterate on: {specifics}

### If Kill
- Why it failed: {evidence}
- What we'd do differently: {learnings}

---

## References

- Original observation: [link]
- Related taste signals: [link]
- Craft sessions: [links]
