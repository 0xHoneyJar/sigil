---
zones:
  state:
    paths:
      - sigil-mark/consultation-chamber/decisions/
      - sigil-mark/consultation-chamber/config.yaml
    permission: read-write
  config:
    paths:
      - .sigilrc.yaml
      - .sigil-setup-complete
    permission: read
---

# Consulting Decisions (v3.0)

## Purpose

Help craftsmen **record their deliberated decisions**. This skill captures decisions that have already been made through careful thought, not decisions that need to be rushed.

## Philosophy (v3.0)

> "Sweat the art. We handle the mechanics. Return to flow."

### What This Means

1. **Craftsman deliberation is valuable** — Take time to consider tradeoffs
2. **This skill records decisions, not makes them** — You bring the judgment
3. **/consult locks AFTER deliberation** — Not to shortcut thinking
4. **Return to flow** — Once locked, stop second-guessing

### What This Skill Does

- Records the decision you've already made
- Applies appropriate time lock based on scope
- Creates audit trail for future reference
- Prevents future bikeshedding on decided topics

### What This Skill Does NOT Do

- Make decisions for the craftsman
- Rush the deliberation process
- Override existing locked decisions without justification
- Pressure you into quick choices

## Decision Tiers

| Tier | Scope | Lock Period | Process |
|------|-------|-------------|---------|
| **Strategic** | New features, major changes | 180 days | Community input optional |
| **Direction** | Visual style, tone, patterns | 90 days | Team discussion optional |
| **Execution** | Pixel details, specific impl | 30 days | Craftsman decides |

**LOCK_PERIODS:** `{ strategic: 180, direction: 90, execution: 30 }`

## Pre-Flight Checks

1. **Sigil Setup**: Verify `.sigil-setup-complete` exists
2. **Consultation Config**: Check `sigil-mark/consultation-chamber/config.yaml` exists
3. **Strictness Level**: Load from `.sigilrc.yaml`

## Workflow

### Step 1: Understand the Topic

If topic not provided, ask:

```
question: "What design decision would you like to record?"
header: "Topic"
```

### Step 2: Determine Scope

Ask the craftsman to classify:

```
question: "What scope is this decision?"
header: "Scope"
options:
  - label: "Strategic"
    description: "New features, major changes, affects product direction"
  - label: "Direction"
    description: "Visual style choices, tone, experience patterns"
  - label: "Execution"
    description: "Pixel-level details, specific implementation choices"
  - label: "Help me decide"
    description: "I need help understanding the scope"
multiSelect: false
```

If "Help me decide", present the following for consideration:

```
Consider these questions:

**Strategic (180-day lock):**
- Does this change product direction?
- Would reversing this require significant rework?
- Should the community have input?

**Direction (90-day lock):**
- Is this about style, tone, or patterns?
- Does it affect multiple components?
- Should the team weigh in?

**Execution (30-day lock):**
- Is this a specific implementation detail?
- Can it be changed with minimal impact?
- Is this your call as the implementer?

What scope feels right for this decision?
```

### Step 3: Capture the Decision

Ask for the decision details:

```
question: "What is your decision?"
header: "Decision"
```

Then ask for context:

```
question: "What tradeoffs did you consider? What alternatives did you reject and why?"
header: "Rationale"
```

**Important:** The rationale is valuable for future you. Don't rush this.

### Step 4: Create Decision Record

Generate unique ID: `DEC-{YYYY}-{NNN}`

Create decision record at `sigil-mark/consultation-chamber/decisions/{id}.yaml`:

```yaml
id: "{id}"
topic: "{topic}"
decision: "{decision}"
scope: "{strategic|direction|execution}"
locked_at: "{ISO-8601}"
expires_at: "{ISO-8601 + lock_period}"
status: locked

context:
  zone: "{zone if applicable}"
  considerations: "{what was considered}"
  rejected_alternatives:
    - "{alternative 1}: {why rejected}"
    - "{alternative 2}: {why rejected}"

rationale: |
  {Full rationale from craftsman}

unlock_history: []
```

### Step 5: Confirm Lock

```
✅ DECISION RECORDED AND LOCKED

Decision: {id}
Topic: {topic}
Scope: {scope}
Lock expires: {expires_at} ({days} days)

Your decision:
  {decision}

Your rationale:
  {rationale summary}

This decision will be surfaced by /craft when relevant.
To unlock early: /consult {id} --unlock
```

## Status Check (--status)

When called with `--status`:

```
📋 DECISION STATUS

ID: {id}
Topic: {topic}
Scope: {scope}
Status: {locked | unlocked | expired}

Decision: {decision}
Locked at: {locked_at}
Expires: {expires_at}
Days remaining: {calculated}

Rationale:
  {rationale}

Unlock history:
  {List of previous unlocks, or "(none)"}
```

## Early Unlock (--unlock)

When called with `--unlock`:

### Step 1: Show Decision Context

```
🔓 EARLY UNLOCK REQUEST

Decision: {id}
Topic: {topic}
Scope: {scope}
Days remaining: {days}

Original decision:
  {decision}

Original rationale:
  {rationale}

⚠️ Note: Early unlocks are recorded in decision history.
   Consider whether this truly needs to change, or if
   you're revisiting a decision that was already deliberated.
```

### Step 2: Request Justification

```
question: "Why do you need to unlock this decision early?"
header: "Justification"

Note: "Changed my mind" is a valid reason if accompanied by
what new information or perspective led to reconsideration.
```

### Step 3: Update Record

```yaml
status: unlocked
unlock_history:
  - unlocked_at: "{current timestamp}"
    unlocked_by: "{user}"
    justification: "{user's justification}"
    remaining_days: {days that were remaining}
```

### Step 4: Confirm

```
🔓 DECISION UNLOCKED

Decision: {id}
Justification: {justification}

The decision can now be modified or re-consulted.
Note: /garden will show this as manually unlocked.
```

## Error Handling

| Situation | Response |
|-----------|----------|
| No setup | "Sigil not initialized. Run `/setup` first." |
| No config | Create default consultation config |
| Decision exists | "Decision {id} already exists. View with --status or modify." |
| Decision not found | "Decision {id} not found." |
| Already unlocked | "Decision {id} is not currently locked." |
| No justification | "Please provide justification for early unlock." |

## Key Principles

1. **Record, don't rush** — This skill records deliberated decisions
2. **Rationale matters** — Future you will thank present you
3. **Locks prevent bikeshedding** — Not reconsideration
4. **Unlocks are valid** — With justification
5. **Respect the process** — Deliberate, decide, lock, flow
