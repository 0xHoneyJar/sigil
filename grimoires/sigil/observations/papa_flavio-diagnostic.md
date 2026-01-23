---
created: "2026-01-19T10:00:00Z"
updated: "2026-01-19T14:30:00Z"
user:
  handle: "papa_flavio"
  channel: "discord"
  type: "decision-maker"
  engagement: "high"
  stakes: "Token burns are irreversible; needs confidence before executing"
status: "in-progress"
gap_type: null
related_components: [ClaimButton, RewardsDisplay, StakingPanel]
---

# papa_flavio Diagnostic Log

## User Profile

| Field | Value |
|-------|-------|
| **Type** | Decision-maker |
| **Behavior** | Planning burns, needs data to decide timing |
| **Stakes** | Token burns are irreversible |
| **Engagement** | High - active community member |

---

## Level 3 Diagnostic

### Initial Report
> "Im planning some henlo burns so gud to know how much im receiving"

### Goal (Level 3)
**What are they trying to accomplish?**
- Deciding optimal timing for token burns based on accumulated rewards
- Needs visibility into current reward rate to plan burn strategy

### Questions to Ask

- [ ] "When do you typically check your rewards? What triggers that check?"
- [ ] "How do you currently track your rewards over time?"
- [ ] "What would help you decide when to burn?"

### Responses

*(Awaiting responses)*

---

## What We're Trying to Learn

| Question | What it reveals |
|----------|-----------------|
| When do you check rewards? | Frequency + trigger of behavior |
| How do you track? | Whether they use workarounds (spreadsheet, etc.) |
| What would help decide? | True information need |

---

## Hypothesis Space

| If they say... | Gap type | Action |
|----------------|----------|--------|
| "I have to calculate it manually" | Discoverability | Show projected rewards in UI |
| "The number doesn't update" | Bug | Fix rewards refresh |
| "There's no history view" | Feature | Add rewards history component |

---

## Timeline

| Date | Event |
|------|-------|
| 2026-01-19 10:00 | Initial report captured |
| 2026-01-19 10:00 | Diagnostic questions queued |
| | *(awaiting responses)* |

---

## Next Steps

1. Get answers to diagnostic questions
2. Classify gap type
3. If UI work needed -> `/craft ClaimButton @context/papa_flavio-diagnostic.md`
4. Update `user-insights.md` with confirmed findings
