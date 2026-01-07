---
zones:
  state:
    paths:
      - sigil-mark/.sigil-observations/
      - sigil-mark/.sigil-observations/screenshots/
      - sigil-mark/.sigil-observations/feedback/
      - sigil-mark/rules.md
      - .sigilrc.yaml
    permission: read-write
  config:
    paths:
      - .sigil-setup-complete
    permission: read
---

# Observing Visual Skill (v4.0)

## Purpose

Capture and analyze visual state through Claude in Chrome MCP. Provides visual feedback loop for:
1. **Structural checks** — Zone wrappers, component patterns
2. **Measurable properties** — Border-radius, colors, spacing, timing
3. **Human feedback** — Targeted questions for taste decisions

## Philosophy (v4.0)

> "See the reality. Surface the delta. Ask the craftsman."

/observe doesn't judge — it surfaces differences between reality and rules, then asks humans to decide which should change.

---

## Progressive Disclosure (v4.0)

### L1: Auto-Capture (Default)
```
/observe
```
Captures current screen via MCP and analyzes against zone context.

### L2: Component Focus
```
/observe --component ClaimButton
/observe --component "checkout form"
```
Focuses analysis on specific component.

### L3: Manual Mode
```
/observe --screenshot manual.png --rules border-radius
/observe --screenshot upload --component Button --zone critical
```
Manual screenshot with specific rule checks.

---

## Pre-Flight Checks

1. **MCP Availability**: Check for Claude in Chrome MCP connection
2. **Sigil Setup**: Verify `.sigil-setup-complete` exists
3. **Rules Exist**: Check for `sigil-mark/rules.md`
4. **Zone Context**: Load zones from `.sigilrc.yaml`

---

## MCP Availability Detection (v4.0-S4-T1)

### Check for Claude in Chrome MCP

```
1. Call mcp__claude-in-chrome__tabs_context_mcp
2. If successful → MCP available, proceed
3. If error → MCP not available, offer fallback
```

### Graceful Fallback

If MCP not available:

```
Claude in Chrome MCP is not connected.

For visual observation, you can:
1. Upload a screenshot manually: /observe --screenshot [path]
2. Paste screenshot in chat (drag & drop)
3. Connect Claude in Chrome extension

Without visual capture, I can still check:
- Zone configuration
- Rules consistency
- Component patterns (from code)

Would you like to proceed with code-only analysis?
```

---

## Screenshot Capture (v4.0-S4-T2)

### Via MCP

```
1. Get current tab via mcp__claude-in-chrome__tabs_context_mcp
2. Call mcp__claude-in-chrome__computer with action: screenshot
3. Store result with timestamp and component name
```

### Screenshot Storage

```
sigil-mark/.sigil-observations/screenshots/
├── 2026-01-07-143022-ClaimButton.png
├── 2026-01-07-143045-CheckoutForm.png
└── ...
```

### Filename Format

```
{YYYY-MM-DD}-{HHMMSS}-{component}.png
```

---

## Structural Analysis (v4.0-S4-T3)

### What Gets Checked

| Check | Expected | Detection |
|-------|----------|-----------|
| Zone wrapper | CriticalZone for critical zone | Look for characteristic patterns |
| Layout type | MachineryLayout for admin | Check keyboard hints |
| Component structure | Actions in CriticalZone.Actions | Verify button placement |
| Confirmation pattern | 2-step for high-stakes | Look for confirm/cancel |

### Output Format

```yaml
structural_checks:
  - check: "Zone wrapper"
    expected: "CriticalZone"
    found: true
    notes: "Detected CriticalZone with financial flag"

  - check: "2-step confirmation"
    expected: true
    found: false
    notes: "Single-click button detected"
```

---

## Measurable Property Comparison (v4.0-S4-T4)

### Properties Compared

| Property | Source | Detection |
|----------|--------|-----------|
| Border radius | rules.md | Visual estimation from corners |
| Colors | rules.md | Sample key areas |
| Spacing | rules.md | Measure gaps between elements |
| Animation timing | rules.md | Watch for motion speed |

### Comparison Algorithm

```
1. Load expected values from sigil-mark/rules.md
2. For each measurable property:
   a. Detect visual value (or estimate range)
   b. Compare to expected value
   c. Calculate delta
   d. Flag if delta exceeds threshold
```

### Output Format

```yaml
measurable_properties:
  - property: "border-radius"
    expected: "8px"
    observed: "4px"
    delta: "-4px"
    significance: "high"

  - property: "primary-color"
    expected: "#3B82F6"
    observed: "#3B82F6"
    delta: "0"
    significance: "none"
```

---

## Feedback Question Generation (v4.0-S4-T5)

### Question Format

For each significant delta, generate:

```
═══════════════════════════════════════════════════════════
                     OBSERVATION: border-radius
═══════════════════════════════════════════════════════════

Expected: 8px (from rules.md)
Observed: 4px (in ClaimButton)
Delta: -4px

Context: Border radius affects perceived friendliness.
8px is standard for critical zone components.

Question: Which is correct?

1. UPDATE RULES → Change rules.md to 4px
   (This button defines the new standard)

2. FIX COMPONENT → Keep rules.md at 8px
   (The component should match the rules)

3. EXCEPTION → Keep both, this component is special
   (Document exception in rules.md)
```

### Question Categories

| Category | Question Type |
|----------|--------------|
| Structural | "Should this zone use [pattern]?" |
| Color | "Is [observed color] the intended [token]?" |
| Spacing | "Should gaps be [observed] or [expected]?" |
| Motion | "Is [observed timing] appropriate for [zone]?" |

---

## Feedback Storage (v4.0-S4-T6)

### Feedback File Format

```yaml
# sigil-mark/.sigil-observations/feedback/OBS-2026-0107-001.yaml

observation_id: "OBS-2026-0107-001"
timestamp: "2026-01-07T14:30:22Z"
component: "ClaimButton"
zone: "critical"
screenshot: "2026-01-07-143022-ClaimButton.png"

structural_checks:
  - check: "Zone wrapper"
    expected: "CriticalZone"
    found: true

  - check: "2-step confirmation"
    expected: true
    found: false
    human_answer: "fix_component"
    human_notes: "Need to add confirm step"

measurable_properties:
  - property: "border-radius"
    expected: "8px"
    observed: "4px"
    human_answer: "update_rules"
    human_notes: "4px is our new standard"

applied: false
```

### File Location

```
sigil-mark/.sigil-observations/feedback/
├── OBS-2026-0107-001.yaml
├── OBS-2026-0107-002.yaml
└── ...
```

### Observation ID Format

```
OBS-{YYYY}-{MMDD}-{NNN}
```
Where NNN is sequential within the day.

---

## Response Format

### Full Observation Output

```
═══════════════════════════════════════════════════════════
                     VISUAL OBSERVATION
═══════════════════════════════════════════════════════════

Screenshot: 2026-01-07-143022-ClaimButton.png
Component: ClaimButton
Zone: critical (journey: claiming, trust: critical)

═══════════════════════════════════════════════════════════
                     STRUCTURAL CHECKS
═══════════════════════════════════════════════════════════

✓ Zone wrapper: CriticalZone detected
✓ Financial flag: Present
✗ 2-step confirmation: Not detected (single-click)

═══════════════════════════════════════════════════════════
                     MEASURABLE PROPERTIES
═══════════════════════════════════════════════════════════

border-radius:
  Expected: 8px | Observed: 4px | Delta: -4px

primary-color:
  Expected: #3B82F6 | Observed: #3B82F6 | Match ✓

spacing-md:
  Expected: 16px | Observed: 16px | Match ✓

═══════════════════════════════════════════════════════════
                     YOUR CALL
═══════════════════════════════════════════════════════════

2 items need your input:

1. 2-step confirmation missing
   → Fix component (add confirm step)?
   → Exception (single-click OK for this)?

2. border-radius is 4px, rules say 8px
   → Update rules to 4px?
   → Fix component to 8px?
   → Exception for this component?

Please answer each to record feedback.

═══════════════════════════════════════════════════════════
                     FEEDBACK STORED
═══════════════════════════════════════════════════════════

Saved to: sigil-mark/.sigil-observations/feedback/OBS-2026-0107-001.yaml
Applied: false

Run /refine --from OBS-2026-0107-001 to apply feedback.
```

---

## Error Handling

| Situation | Response |
|-----------|----------|
| MCP not available | Offer manual screenshot upload |
| No rules.md | "Run `/codify` to define design rules first." |
| Screenshot failed | "Screenshot capture failed. Try manual upload." |
| No visual differences | "All checks pass! No feedback needed." |
| Component not found | "Component not visible in screenshot." |

---

## When to Ask vs Proceed

| Context | Ask | Proceed |
|---------|-----|---------|
| Delta detected | ✓ Ask which is correct | |
| All checks pass | | ✓ Report success |
| MCP unavailable | ✓ Offer fallback | |
| Screenshot failed | ✓ Offer retry/manual | |
| Multiple deltas | ✓ Ask for each | |

---

## Philosophy

/observe enables the feedback loop, it doesn't judge.

1. **Surface, don't decide** — Show delta, ask human
2. **Reality over rules** — Rules might be wrong
3. **Human accountability** — Craftsman decides what's correct
4. **Structured feedback** — Store answers for /refine
5. **Graceful degradation** — Work without MCP if needed

Do NOT:
- Assume rules are always right
- Assume component is always wrong
- Block on missing MCP
- Make taste decisions

DO:
- Surface every measurable difference
- Ask structured questions
- Store feedback for later
- Suggest /refine to apply changes
- Work with manual screenshots
