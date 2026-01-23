---
version: 1
last_updated: "2026-01-19T15:00:00Z"
insight_count: 1
by_gap_type:
  bug: 0
  discoverability: 1
  feature: 0
by_user_type:
  decision-maker: 0
  builder: 0
  trust-checker: 1
  casual: 0
---

# User Insights

Aggregated findings from validated observations. These insights inform `/craft` physics decisions.

---

## How to Use This File

When observations are validated (diagnostic questions answered + gap classified):

1. Add a new insight entry below with the validated findings
2. Update the frontmatter counts
3. Reference the insight in `/craft` when relevant components are being crafted

---

## Validated Findings

### Insight: Rewards visibility for trust-checkers

| Field | Value |
|-------|-------|
| **Gap Type** | discoverability |
| **User Types** | trust-checker |
| **Evidence** | `alice-diagnostic.md` |
| **Status** | open |
| **Action Taken** | pending /craft improvement |

**Summary**: Trust-checkers need visual confirmation that rewards are accumulating. Current display shows only current value, not delta or trend.

**Physics Implications**:
- Show "+X since last check" delta for trust-checker personas
- Include trend indicator (↑/↓) for quick confidence
- Use subtle pulse animation on value increase (not annoying for high-frequency checks)
- Consider mini-chart for last 24h to show continuous growth

---

## Insight Template

When adding a new insight, use this format:

```markdown
### Insight: [Title]

| Field | Value |
|-------|-------|
| **Gap Type** | bug / discoverability / feature |
| **User Types** | comma-separated list |
| **Evidence** | diagnostic file reference(s) |
| **Status** | open / addressed |
| **Action Taken** | what was done |

**Summary**: 1-2 sentence description

**Physics Implications**:
- Implication for /craft (e.g., "Show amounts prominently for decision-makers")
- Additional implication if applicable
```

---

## Integration with /craft

When `/craft` is run, this file is scanned for insights matching:
- Component name in craft target
- Effect type being crafted
- User types relevant to the component

Matching insights are shown in the Observations section of the analysis box.
