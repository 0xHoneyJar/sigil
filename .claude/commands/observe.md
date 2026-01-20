# /observe Command

Capture user feedback as structured diagnostic observations. Implements "Mom Test" style questioning to extract actionable truths.

---

## Purpose

Transform raw user feedback into structured observations that inform design physics decisions. Goes beyond taste signals (which capture developer preferences) to capture actual user behavior, expectations, and gaps.

---

## Usage

```
/observe "<user-quote>" [options]
```

### Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `user-quote` | Direct quote from user feedback | "Im planning some henlo burns so gud to know how much im receiving" |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--user NAME` | Username/handle of the person | anonymous |
| `--channel SOURCE` | Where feedback came from | direct |
| `--existing FILE` | Add to existing diagnostic file | creates new |

---

## What It Does

1. **Parses** the user quote for behavioral signals
2. **Creates** a diagnostic file in `grimoires/sigil/observations/`
3. **Generates** Level 3 diagnostic questions (Mom Test style)
4. **Tracks** hypothesis space for gap classification
5. **Links** to `/craft` workflow when UI work is needed

---

## The Level 3 Diagnostic Framework

Most feedback stops at Level 1 (what they said) or Level 2 (what they want). Level 3 asks: **What are they trying to accomplish?**

| Level | Question | Example |
|-------|----------|---------|
| Level 1 | What did they say? | "Rewards aren't updating" |
| Level 2 | What do they want? | "I want to see my rewards" |
| Level 3 | What are they trying to accomplish? | "I need to decide when to burn based on accumulation" |

Level 3 reveals whether the gap is:
- **Bug**: Feature exists but broken
- **Discoverability**: Feature exists but not found
- **Feature**: Capability doesn't exist yet

---

## Output Structure

Creates `grimoires/sigil/observations/{username}-diagnostic.md`:

```markdown
# {Username} Diagnostic Log

## User Profile

| Field | Value |
|-------|-------|
| **Type** | [Decision-maker/Builder/Trust-checker/Casual] |
| **Behavior** | [Observed behavior pattern] |
| **Stakes** | [What's at risk for them] |
| **Engagement** | [High/Medium/Low + evidence] |

---

## Level 3 Diagnostic

### Initial Report
> "{Original quote}"

### Goal (Level 3)
**What are they trying to accomplish?**
- [Inferred goal from quote]

### Questions to Ask

- [ ] "[Diagnostic question 1]"
- [ ] "[Diagnostic question 2]"

### Responses

*(Awaiting responses)*

---

## What We're Trying to Learn

| Question | What it reveals |
|----------|-----------------|
| [Question] | [What we learn from the answer] |

---

## Hypothesis Space

| If they say... | Gap type | Action |
|----------------|----------|--------|
| "[Response A]" | Feature | [Action] |
| "[Response B]" | Bug | [Action] |
| "[Response C]" | Discoverability | [Action] |

---

## Timeline

| Date | Event |
|------|-------|
| {today} | Initial report captured |
| {today} | Diagnostic questions queued |
| | *(awaiting responses)* |

---

## Next Steps

1. Get answers to diagnostic questions
2. Classify gap type
3. If UI work needed → `/craft` with full context
4. Update `user-insights.md` with confirmed findings
```

---

## Examples

### Basic observation
```
/observe "Im planning some henlo burns so gud to know how much im receiving" --user papa_flavio
```

### With channel
```
/observe "the claim button doesn't show my rewards" --user alice --channel discord
```

### Adding to existing diagnostic
```
/observe "ah I track it in a spreadsheet actually" --user papa_flavio --existing papa_flavio-diagnostic.md
```

---

## User Type Classification

| Type | Signals | Physics Implications |
|------|---------|---------------------|
| **Decision-maker** | Planning actions, checking data for decisions | Needs accuracy, timing matters |
| **Builder-minded** | Thinks about implementation, reports technical details | Tolerates complexity, values transparency |
| **Trust-checker** | Frequent checks "just to make sure" | Needs confidence signals, timestamps |
| **Casual** | Uses occasionally, basic needs | Needs simplicity, clear feedback |

---

## Integration with Taste System

Observations feed into the taste system differently than `/craft` signals:

| Source | What it captures | File |
|--------|------------------|------|
| `/craft` diagnostic | Developer's feel preferences | `taste.md` |
| `/observe` | Actual user behavior and gaps | `observations/*.md` |
| Toolbar | End-user preferences in-product | `taste.md` |

When running `/craft`, check observations for:
- User types that inform physics (power-user vs first-time)
- Gap classifications that prioritize features
- Hypothesis validations that confirm/reject assumptions

---

## Related Commands

- `/craft` - Generate components (reads observations for context)
- `/taste-synthesize` - Analyze taste patterns
- `/plan-and-analyze` - Full PRD discovery (includes user research phase)

---

## The Mom Test Principles

Questions should follow "The Mom Test" rules:

1. **Talk about their life, not your idea**
   - Bad: "Would you use a burn calculator?"
   - Good: "How do you decide when to burn?"

2. **Ask about specifics in the past**
   - Bad: "Do you check your rewards often?"
   - Good: "When did you last check? What triggered it?"

3. **Talk less, listen more**
   - Let them tell their story
   - Follow up on specifics, not generalizations

4. **Seek disconfirming evidence**
   - "When was this NOT a problem?"
   - "What workarounds do you use?"
