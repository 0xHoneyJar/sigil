---
zones:
  state:
    paths:
      - sigil-mark/rules.md
      - grimoires/sigil/moodboard.md
      - grimoires/sigil/moodboard/
      - sigil-mark/vocabulary/vocabulary.yaml
      - grimoires/sigil/constitution/physics.yaml
      - .sigilrc.yaml
    permission: read
  output:
    paths:
      - .sigil-observations/feedback/
    permission: write
---

# Observing Feedback Skill (v4.1)

## Purpose

Complete the visual feedback loop by capturing screenshots and analyzing them against design rules. This skill bridges the gap between implementation and design intent.

## Philosophy

> "What the eye sees, the tool measures. What the tool measures, the craftsman refines."

The /observe skill:
1. **Captures reality** - Screenshots show what users actually see
2. **Measures against rules** - Structural, measurable checks (not subjective opinions)
3. **Generates questions** - Prompts for human judgment where needed
4. **Links to /refine** - Closes the loop for design evolution

---

## Progressive Disclosure

### L1: Auto-Capture (Default)
```
/observe
```
- Checks for MCP browser automation availability
- If available: Captures current browser state via screenshot
- If unavailable: Prompts for manual screenshot upload
- Analyzes against rules.md
- Generates feedback report

### L2: Focused Analysis
```
/observe --component ClaimButton
/observe --url http://localhost:3000/checkout
```
- Focus analysis on specific component or page
- Navigate to URL if provided (requires MCP)
- More targeted feedback questions

### L3: Full Control
```
/observe --screenshot /path/to/screenshot.png --rules
```
- Use existing screenshot (no capture)
- Include full rules breakdown
- Detailed structural analysis

---

## Workflow

### Step 1: Check MCP Availability

```
1. Check if mcp__claude-in-chrome__computer tool is available
2. If available: MCP mode enabled
3. If unavailable: Manual mode (request screenshot upload)
```

**MCP Available Response:**
```
MCP browser automation detected. Ready to capture.

Capturing screenshot of current browser state...
[Screenshot captured]

Analyzing against design rules...
```

**MCP Unavailable Response:**
```
MCP browser automation not available.

Please upload a screenshot of the UI you want to analyze.
You can:
1. Take a screenshot and drag it into this chat
2. Provide a path to an existing screenshot: /observe --screenshot /path/to/file.png

Once you provide a screenshot, I'll analyze it against your design rules.
```

### Step 2: Capture Screenshot

**If MCP available:**
```typescript
// Use mcp__claude-in-chrome__computer with action: screenshot
mcp__claude-in-chrome__computer({
  action: 'screenshot',
  tabId: currentTabId
})
```

**If URL provided:**
```typescript
// Navigate first, then capture
mcp__claude-in-chrome__navigate({
  url: providedUrl,
  tabId: currentTabId
})

// Wait for load
mcp__claude-in-chrome__computer({
  action: 'wait',
  duration: 2,
  tabId: currentTabId
})

// Then capture
mcp__claude-in-chrome__computer({
  action: 'screenshot',
  tabId: currentTabId
})
```

### Step 3: Load Rules Context

```
1. Read sigil-mark/rules.md
2. Read grimoires/sigil/moodboard.md (for feel reference)
3. Read .sigilrc.yaml (for zone definitions)
4. Load vocabulary if component name matches a term
```

### Step 4: Analyze Screenshot

Analyze against STRUCTURAL, MEASURABLE criteria:

**Color Analysis:**
- Token usage (are colors from defined tokens?)
- Contrast ratios (accessibility)
- Consistency with moodboard palette

**Typography Analysis:**
- Font sizes against scale
- Line heights
- Text hierarchy

**Spacing Analysis:**
- Consistent spacing scale usage
- Component padding/margin patterns

**Motion Indicators:**
- Loading states visible
- Transition indicators
- Animation presence

**Zone Compliance:**
- Does layout match zone expectations?
- Critical zone: deliberate, clear hierarchy
- Marketing zone: engaging, visual interest
- Admin zone: dense, keyboard-friendly

### Step 5: Generate Feedback Questions

Output format for feedback:

```
=====================================================================
                     OBSERVATION REPORT
=====================================================================

CAPTURED: 2026-01-07T14:32:00Z
SOURCE: [MCP capture / Manual upload]
COMPONENT: [focused component or "Full page"]
ZONE: [detected zone from file path or URL]

---------------------------------------------------------------------
                     STRUCTURAL ANALYSIS
---------------------------------------------------------------------

COLORS:
  [x] Uses defined tokens (--color-primary, --color-surface)
  [ ] Arbitrary color detected: #ff6b35 (not in token set)
      -> Consider adding to tokens or using existing --color-accent

TYPOGRAPHY:
  [x] Font sizes follow scale (text-sm, text-base, text-lg)
  [x] Line heights appropriate for readability

SPACING:
  [x] Consistent spacing scale (gap-4, p-6)
  [ ] Arbitrary spacing detected: gap-[13px]
      -> Use gap-3 (12px) or gap-4 (16px) instead

ZONE COMPLIANCE:
  Zone: critical
  Motion expectation: deliberate (800ms+)
  [x] Visual weight appropriate for critical zone
  [ ] Button appears to use fast transition
      -> Consider deliberate motion for critical actions

---------------------------------------------------------------------
                     FEEL QUESTIONS
---------------------------------------------------------------------

These require human judgment (not measurable):

1. ALIGNMENT WITH MOODBOARD
   Moodboard describes "trustworthy, professional, serious"
   -> Does this screenshot convey those qualities?

2. MOMENT TYPE
   This appears to be a [claiming/critical] moment.
   -> Does the visual weight match the importance?

3. USER JOURNEY
   -> Would a newcomer feel confident proceeding?
   -> Would a power user find it efficient?

---------------------------------------------------------------------
                     RECOMMENDATIONS
---------------------------------------------------------------------

IMMEDIATE (violations):
  - Replace #ff6b35 with token
  - Replace gap-[13px] with gap-3

CONSIDER (suggestions):
  - Increase button transition duration for critical zone
  - Add visual confirmation state

REFINE (design evolution):
  - /refine --vocab "claim" to ensure consistent claim styling
  - /refine --zone critical to update zone constraints

=====================================================================
```

### Step 6: Store Feedback

```
1. Create .sigil-observations/feedback/ directory if not exists
2. Generate filename: feedback-{timestamp}-{component}.md
3. Write report to file
4. Output path to user
```

**Stored File Path:**
```
.sigil-observations/feedback/feedback-2026-01-07-claim-button.md
```

### Step 7: Link to /refine

End with actionable next steps:

```
---------------------------------------------------------------------
                     NEXT STEPS
---------------------------------------------------------------------

To address these findings:

1. Fix immediate violations:
   - Replace arbitrary values with tokens
   - Update transition timing

2. Update design context (if patterns should change):
   - /refine --vocab claim "update claim feel"
   - /refine --zone critical "adjust motion constraints"

3. Re-observe after changes:
   - /observe --component ClaimButton

Report saved to: .sigil-observations/feedback/feedback-2026-01-07-claim-button.md
```

---

## Analysis Categories

### Structural (Measurable)

These are objective, measurable criteria:

| Category | What to Check | Tool |
|----------|---------------|------|
| Colors | Token usage, contrast | Visual inspection |
| Typography | Scale adherence, hierarchy | Measurement |
| Spacing | Grid/scale compliance | Measurement |
| Motion | Duration, easing | Animation inspection |
| Layout | Zone-appropriate structure | Pattern matching |

### Feel (Human Judgment)

These require human input - generate questions, don't make judgments:

| Category | Question Format |
|----------|-----------------|
| Mood alignment | "Does this convey [moodboard adjective]?" |
| Moment weight | "Does visual weight match importance?" |
| User confidence | "Would [persona] feel confident here?" |
| Brand consistency | "Does this feel like the same product?" |

---

## MCP Tool Reference

When MCP is available, use these tools:

```typescript
// Take screenshot
mcp__claude-in-chrome__computer({
  action: 'screenshot',
  tabId: number
})

// Navigate to URL
mcp__claude-in-chrome__navigate({
  url: string,
  tabId: number
})

// Wait for page load
mcp__claude-in-chrome__computer({
  action: 'wait',
  duration: number,
  tabId: number
})

// Get current tab context
mcp__claude-in-chrome__tabs_context_mcp({
  createIfEmpty: true
})
```

---

## Error Handling

| Situation | Response |
|-----------|----------|
| MCP unavailable | Prompt for manual screenshot upload |
| No rules.md | "Run /codify to define design rules first" |
| No moodboard | "Run /envision to capture product feel first" |
| Screenshot too small | "Screenshot appears cropped. Capture full component." |
| No zone detected | "Unable to detect zone. Analyzing as 'default'." |

---

## Output Storage

All feedback reports are stored in:
```
.sigil-observations/
  feedback/
    feedback-{YYYY-MM-DD}-{component-or-page}.md
```

This directory should be:
- Added to .gitignore (observations are ephemeral)
- Cleared periodically (no historical value)
- Used as working memory, not permanent record

---

## Philosophy

This skill enables observation, it doesn't enforce taste.

1. **Measure, don't judge** - Report structural findings objectively
2. **Ask, don't decide** - Generate questions for feel/taste decisions
3. **Link, don't silo** - Connect to /refine for design evolution
4. **Capture, don't assume** - Use actual screenshots, not mental models

Do NOT:
- Make subjective aesthetic judgments
- Refuse to analyze based on missing context
- Override craftsman's design decisions
- Create new rules without human approval

DO:
- Report measurable findings with evidence
- Generate questions for human judgment
- Link to actionable /refine commands
- Store observations for reference

---

## Next Steps

After completing `/observe`, always show this section:

```
═══════════════════════════════════════════════════════════
                     NEXT STEPS
═══════════════════════════════════════════════════════════

Observation complete. Here's what to do next:

IF STRUCTURAL ISSUES FOUND:
  Fix the component directly
  Then re-run: /observe

IF RULES SHOULD CHANGE:
  /refine     — Apply feedback to update rules.md
               (Changes rules to match observed reality)

IF A DESIGN DECISION WAS MADE:
  /consult    — Lock the decision to prevent re-litigation
               ("border-radius is 4px" → 30-day lock)

CONTINUE BUILDING:
  /craft      — Get guidance for next component

PERIODICALLY:
  /garden     — Shows unapplied feedback count

═══════════════════════════════════════════════════════════
```
