---
created: "2026-01-19T11:00:00Z"
updated: "2026-01-19T11:30:00Z"
user:
  handle: "alice"
  channel: "telegram"
  type: "trust-checker"
  engagement: "medium"
  stakes: "Wants reassurance that rewards are accumulating correctly"
status: "validated"
gap_type: "discoverability"
related_components: [RewardsDisplay, ClaimButton, StakingDashboard]
---

# alice Diagnostic Log

## User Profile

| Field | Value |
|-------|-------|
| **Type** | Trust-checker |
| **Behavior** | Checks rewards multiple times daily |
| **Stakes** | Wants confidence that system is working |
| **Engagement** | Medium - asks questions in support |

---

## Level 3 Diagnostic

### Initial Report
> "I keep checking if my rewards are going up but can't tell if it's working"

### Goal (Level 3)
**What are they trying to accomplish?**
- Verifying that staking is actively generating rewards
- Building confidence in the system's reliability

### Questions to Ask

- [x] "When do you typically check your rewards? What triggers that check?"
- [x] "How do you currently track your rewards over time?"
- [x] "What would make you feel confident the system is working?"

### Responses

1. **When do you check?** "I check like 5 times a day, whenever I'm bored or worried"
2. **How do you track?** "I try to remember the number from before but I forget"
3. **What would help?** "If I could see it going up over time, like a chart or something"

---

## What We Learned

| Question | Insight |
|----------|---------|
| When do you check rewards? | High frequency (5x/day) driven by anxiety, not planning |
| How do you track? | No tracking mechanism - relies on memory (fails) |
| What would help? | Wants visual confirmation of growth over time |

---

## Classification

**Gap Type**: Discoverability

The capability exists (rewards accumulate) but the user cannot verify it's working.
This is not a bug (system works) or a feature request (data exists) — it's a visibility issue.

---

## Hypothesis Space (Validated)

| Response | Gap type | Action |
|----------|----------|--------|
| "I try to remember the number" | **Discoverability** ✓ | Show delta or trend indicator |

---

## Timeline

| Date | Event |
|------|-------|
| 2026-01-19 11:00 | Initial report captured |
| 2026-01-19 11:15 | Responses collected |
| 2026-01-19 11:30 | Gap classified as discoverability |

---

## Action

**Recommended**: `/craft RewardsDisplay` with trust-checker physics:
- Show "+X since last check" delta
- Include trend indicator (↑ growing)
- Add subtle pulse animation on increase
- Consider mini-chart for last 24h

---

## Physics Implications for /craft

- **User type**: trust-checker → needs confidence signals
- **Frequency**: high (5x/day) → animation should be subtle, not annoying
- **Information need**: delta/trend, not just current value
- **Emotional state**: anxious → reassuring visual language

---

## Experiment Link

| Experiment | Status | Outcome |
|------------|--------|---------|
| [EXP-001](../experiments/EXP-001-rewards-visibility.md) | 💡 idea | - |

Created: 2026-01-19
