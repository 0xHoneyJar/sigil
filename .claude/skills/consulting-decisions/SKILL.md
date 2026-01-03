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

# Consulting Decisions

## Purpose

Guide the user through a consultation process for design decisions. Determines the appropriate decision tier (strategic/direction/execution) and facilitates the consultation process.

## Philosophy

> "Direction was consulted. Decision was made."

Not every decision needs community input. The Consultation Chamber routes decisions to the appropriate authority level and locks them once made.

## Pre-Flight Checks

1. **Sigil Setup**: Verify `.sigil-setup-complete` exists
2. **Consultation Config**: Check `sigil-mark/consultation-chamber/config.yaml` exists
   - If missing, create with default settings
3. **Strictness Level**: Load from `.sigilrc.yaml`

## Decision Layers

| Layer | Scope | Process | Authority |
|-------|-------|---------|-----------|
| **Strategic** | New features, major changes | Community poll | Binding vote |
| **Direction** | Visual style A vs B, tone | Sentiment gathering | Taste Owner |
| **Execution** | Pixel-level details | None | Taste Owner dictates |

## Workflow

### Step 1: Identify the Topic

If topic not provided, ask:

```
question: "What design decision would you like to consult on?"
header: "Topic"
```

### Step 2: Determine Layer

Ask the user to help classify the decision:

```
question: "What type of decision is this?"
header: "Layer"
options:
  - label: "Strategic"
    description: "New features, major changes, affects product direction"
  - label: "Direction"
    description: "Visual style choices, tone, experience patterns"
  - label: "Execution"
    description: "Pixel-level details, specific implementation choices"
  - label: "Not sure"
    description: "Help me determine the appropriate layer"
multiSelect: false
```

If "Not sure", ask clarifying questions:

```
question: "Does this decision affect product strategy or roadmap?"
header: "Scope"
options:
  - label: "Yes - major impact"
    description: "→ Strategic layer"
  - label: "No - within existing strategy"
    description: "Could be Direction or Execution"
multiSelect: false
```

### Step 3: Layer-Specific Process

#### Strategic Layer

Output format for community poll:

```markdown
## 🗳️ Strategic Decision: {topic}

**Question:** {formatted question}

**Options:**
1. {option_a} - {description}
2. {option_b} - {description}
3. Abstain / No strong opinion

**Context:**
{background_context}

**Voting Period:** {duration} days
**Threshold:** Simple majority (50%+1) or configured threshold

Post this to your community channels. Results will be recorded in the decision record.
```

#### Direction Layer

Output format for sentiment gathering:

```markdown
## 📊 Direction Decision: {topic}

**Comparing:**
| Option A | Option B |
|----------|----------|
| {description} | {description} |
| {pros} | {pros} |

**Gathering Sentiment:**
Share these options with your team/community and record:
- Overall preference (A vs B)
- Key themes in positive feedback
- Key themes in concerns

**Duration:** {duration} days

After gathering sentiment, the Taste Owner will make the final call.
```

#### Execution Layer

Output format:

```
ℹ️ EXECUTION DECISION

This is a Taste Owner decision.

**Topic:** {topic}

No community consultation required. The Taste Owner should:
1. Make the decision based on design principles
2. Document the reasoning
3. Lock the decision

Would you like me to record this decision now?
```

### Step 4: Create Decision Record

Generate unique ID: `DEC-{YYYY}-{NNN}`

Create decision record at `sigil-mark/consultation-chamber/decisions/{id}.yaml`:

```yaml
id: "{id}"
created_at: "{ISO-8601}"
created_by: "/consult"

decision:
  title: "{topic}"
  scope: "{strategic|direction|execution}"

description: |
  {Description of the decision}

options:
  - id: "{option_a_id}"
    label: "{Option A}"
    description: "{Description}"
  - id: "{option_b_id}"
    label: "{Option B}"
    description: "{Description}"

consultation:
  method: "{poll|sentiment_gathering|none}"
  duration_days: {7|14|0}
  started_at: "{ISO-8601}"
  ended_at: null  # Filled when complete

  # Filled during/after consultation
  sentiment: {}
  key_themes:
    positive: []
    negative: []

outcome:
  decision: null  # Filled when decided
  decided_by: null
  decided_at: null
  reasoning: null
  override_sentiment: false

lock:
  locked: false
  locked_at: null
  unlock_date: null
  message: null
```

### Step 5: Report

```
✅ DECISION RECORD CREATED

Decision: {id}
Layer: {strategic|direction|execution}
Topic: {topic}

{Layer-specific output from Step 3}

Next steps:
- {For Strategic: Run poll, then /consult {id} --record-outcome}
- {For Direction: Gather sentiment, then /consult {id} --record-outcome}
- {For Execution: Make decision, then /consult {id} --decide}

View decision: sigil-mark/consultation-chamber/decisions/{id}.yaml
```

## Recording Outcomes

When called with `--record-outcome` or `--decide`:

1. Load existing decision record
2. Ask for outcome details:
   - Which option was chosen?
   - Reasoning for the decision
   - Override sentiment? (if applicable)
3. Update record with outcome
4. Lock the decision (for direction/execution)
5. Set unlock date based on config

## Lock Duration

Default lock durations from config:

```yaml
# sigil-mark/consultation-chamber/config.yaml
lock_durations:
  strategic: 180  # 6 months
  direction: 90   # 3 months
  execution: 30   # 1 month
```

## Strictness Behavior

Consultation is always allowed regardless of strictness level.
Lock enforcement is strictness-aware (see `/craft` SKILL.md).

## Error Handling

| Situation | Response |
|-----------|----------|
| No setup | "Sigil not initialized. Run `/setup` first." |
| No config | Create default consultation config |
| Decision exists | "Decision {id} already exists. View or update it?" |
| Invalid layer | Default to Direction, ask for confirmation |

## Philosophy

The three-tier system prevents:
- **Over-consultation**: Not every button color needs a poll
- **Under-consultation**: Strategic changes should involve community
- **Endless debates**: Decisions lock after being made

Do NOT:
- Skip layer detection
- Create decisions without proper classification
- Allow execution decisions to trigger community polls

DO:
- Help users understand the difference between layers
- Generate appropriate output for each layer
- Lock decisions promptly after outcomes are recorded
