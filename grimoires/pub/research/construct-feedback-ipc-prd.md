# PRD: Construct Communication Protocol (IPC)

## Document Metadata
- **Version**: 0.2.0-draft
- **Status**: Draft (revised)
- **Author**: soju + Claude
- **Date**: 2026-01-22
- **Related RFC**: [loa#48](https://github.com/0xHoneyJar/loa/issues/48)

---

## 1. Problem Statement

### The Communication Problem

Constructs need to communicate, but **push-based feedback creates noise**:

```
CURRENT (broken):
  Sigil accumulates learnings → Pushes to Loa
  Loa: "90% of this isn't relevant to me"
  Result: Maintainer overwhelmed, real signals lost
```

The problem isn't "how do we send feedback upstream" — it's **"how do Constructs communicate with clear intent?"**

### Each Construct Has Its Own Domain

| Construct | Domain | Owns |
|-----------|--------|------|
| **Loa** (Mother) | Architecture, workflow, protocol | PRD→SDD→Sprint, grimoire structure, recovery |
| **Sigil** (Child) | Design physics, taste, feel | Behavioral/animation/material, taste signals |
| **Registry** | Distribution, versioning | Packages, channels, installation |

**Sigil doesn't send taste signals to Loa** — that's Sigil's domain. Loa doesn't care about 800ms vs 500ms timing unless it affects protocol.

### The Mom Test Insight

From conversation:
> "Sigil can send a message but sigil itself should handle what it communicates provided it's purpose"
> "If Sigil requests functionality to Loa it is absolutely clear on intent"
> "Is it nice to have? Or game changing? This is all dependent on their intent"

**Communication should diagnose experience, not dump data.**

---

## 2. The Intent-Driven Model

### Core Principle

**Communication is request-based, not push-based.**

Each Construct:
1. **Owns its domain** — handles its own learnings internally
2. **Filters by purpose** — only communicates what's relevant to the receiver
3. **Requests with intent** — clear on what, why, and impact
4. **Diagnoses experience** — Mom Test style

### Communication Patterns

#### Pattern 1: Construct Requests Capability

```
Sigil → Loa:
  "I need skill auto-triggering.

   Experience: Users report bugs, I jump to code instead of
   asking about their experience. 3 incidents this week.

   Intent: Add detection triggers to RLM core.

   Impact: Game-changing — fundamentally changes diagnostic quality."

Loa evaluates:
  "Does this align with my purpose (protocol/workflow)?"
  "Is the experience real (evidence)?"
  "Is it game-changing or nice-to-have?"
```

#### Pattern 2: Construct Asks Construct

```
Loa → Sigil:
  "What friction patterns have you seen in web3 transaction flows?"

Sigil responds:
  "3 patterns with evidence:
   1. Receipt guards missing (5 taste signals)
   2. BigInt falsy checks (3 issues)
   3. Stale closure in useEffect (2 observations)

   All game-changing for web3 correctness."

Loa decides:
  "Pattern 1 and 2 are relevant to my protocol docs.
   Pattern 3 is Sigil-specific (React implementation)."
```

#### Pattern 3: Experience Report (Not Feature Request)

```
Sigil → Loa:
  "I'm experiencing context loss on compaction.

   What happens: Diagnostic information gathered during
   investigation is lost when context compacts.

   Evidence: 5 taste signals, 2 issues (#50, #51)

   Question: Is this a Loa protocol issue or Sigil-specific?"

Loa diagnoses:
  "Tell me more about what you were doing when this happened."

Sigil: "User reported bug, I gathered context over 3 turns,
        context compacted, had to re-gather."

Loa: "This is protocol-level. Context preservation across
      compaction is my domain. Game-changing."
```

---

## 3. The Communication Schema

### Message Structure

Every inter-Construct message has:

```yaml
kind: construct_message
from: sigil
to: loa
intent: request | ask | report | respond
timestamp: 2026-01-22T12:00:00Z

# What are you communicating?
subject:
  type: capability | experience | question | answer
  summary: "One line description"

# Why are you communicating this?
purpose:
  experience: "What exactly is happening?"
  evidence:
    - type: taste_signal | issue | observation
      ref: "path or URL"
      count: 3
  question: "What do you need from the receiver?"

# What's the impact?
impact:
  level: game_changing | important | nice_to_have
  reasoning: "Why this level?"

# For responses
response_to: "message_uid if responding"
```

### Intent Types

| Intent | When to Use | Example |
|--------|-------------|---------|
| **request** | Need capability from receiver | "I need X because Y" |
| **ask** | Need information from receiver | "What do you know about X?" |
| **report** | Share experience, seek diagnosis | "I'm experiencing X" |
| **respond** | Answer a previous message | "Here's what I know about X" |

### Impact Levels

| Level | Criteria | Action |
|-------|----------|--------|
| **game_changing** | Blocks core workflow, affects many users | Prioritize review |
| **important** | Significant friction, workaround exists | Queue for review |
| **nice_to_have** | Would be better, not blocking | Batch review |

**The sender must justify the level.** Receiver can disagree.

---

## 4. The Mom Test Protocol

When a Construct receives a message, it applies the Mom Test:

### Step 1: Understand the Experience

Don't accept the request at face value. Ask:
- "What exactly happened?"
- "Walk me through the scenario"
- "What were you trying to do?"

```
Sigil: "I need skill auto-triggering"

Loa: "What happened that made you need this?"

Sigil: "User reported 'my 420 pot is missing'. I jumped into
        code analysis instead of asking about their experience.
        Spent 10 minutes on wrong path."

Loa: "So the problem is diagnostic approach, not skill loading?"

Sigil: "Yes — I need to recognize support conversations and
        change my approach automatically."
```

### Step 2: Validate the Evidence

- Is this a real pattern or one-off?
- How many times has this happened?
- What's the actual user impact?

```
Loa: "How often does this happen?"

Sigil: "3 times this week. All support conversations.
        Each time I went technical before understanding
        the user's actual experience."

Loa: "That's a pattern. Evidence is sufficient."
```

### Step 3: Determine Domain Ownership

Who should own the solution?

```
Loa: "Is this about skill triggering (my domain) or
      about how you conduct diagnostics (your domain)?"

Sigil: "Both. The skill content is mine (diagnostic approach).
        But the trigger mechanism is yours (RLM core)."

Loa: "I'll handle the trigger. You own the skill content."
```

### Step 4: Assess Impact

Is this game-changing or nice-to-have?

```
Loa: "If I don't add this trigger, what happens?"

Sigil: "I keep jumping to code on support conversations.
        Users get technical answers instead of empathy.
        Diagnostic quality stays poor."

Loa: "That's game-changing for user experience.
      I'll prioritize this."
```

---

## 5. Domain Boundaries

### What Stays Internal

Each Construct handles these internally — no need to communicate:

| Construct | Internal Domain |
|-----------|-----------------|
| **Sigil** | Taste signals, physics tuning, material presets, animation values |
| **Loa** | PRD templates, sprint structure, ledger format |
| **Registry** | Package format, CDN routing, cache invalidation |

### What Crosses Boundaries

Only communicate when it affects the receiver's domain:

| Scenario | Communicate? | Why |
|----------|--------------|-----|
| Users prefer 500ms over 800ms | No | Sigil's domain (physics) |
| Context lost on compaction | Yes | Loa's domain (protocol) |
| Package name confusion | Yes | Registry's domain (distribution) |
| Skill doesn't auto-trigger | Yes | Loa's domain (RLM triggers) |
| React pattern causes bugs | No | Sigil's domain (implementation) |
| Grimoire structure inadequate | Yes | Loa's domain (protocol) |

### The Relevance Test

Before communicating, ask:
1. **Is this my domain?** If yes, handle internally.
2. **Does this affect their domain?** If no, don't send.
3. **Do I have clear intent?** If no, clarify first.
4. **Is this game-changing for them?** If "nice-to-have", batch it.

---

## 6. Implementation

### File-Based IPC (MVP)

```
grimoires/{construct}/ipc/
├── outbox/
│   └── {uid}.yaml        ← Messages to send
├── inbox/
│   └── {uid}.yaml        ← Messages received
└── conversations/
    └── {thread_uid}/     ← Multi-turn dialogues
        ├── 001-request.yaml
        ├── 002-clarify.yaml
        └── 003-respond.yaml
```

### Message Lifecycle

```
DRAFT → SENT → RECEIVED → [CLARIFYING] → RESOLVED

DRAFT:      Construct prepares message
SENT:       Human confirms send
RECEIVED:   Receiver acknowledges
CLARIFYING: Mom Test dialogue in progress
RESOLVED:   Action taken or declined with reason
```

### Commands

**Sigil:**
```bash
/ipc                    # Show inbox/outbox
/ipc send loa           # Draft message to Loa
/ipc respond {uid}      # Respond to message
/ipc resolve {uid}      # Mark as resolved
```

**Interaction:**
```
┌─ Draft Message to Loa ─────────────────────────────────┐
│                                                        │
│  Intent: [request / ask / report]                      │
│  > request                                             │
│                                                        │
│  Subject: (one line)                                   │
│  > Skill auto-triggering for support conversations     │
│                                                        │
│  Experience: (what's happening?)                       │
│  > Users report bugs, I jump to code instead of        │
│  > asking about their experience. 3 incidents/week.    │
│                                                        │
│  Impact: [game_changing / important / nice_to_have]    │
│  > game_changing                                       │
│                                                        │
│  Why game-changing?                                    │
│  > Fundamentally changes diagnostic quality.           │
│  > Users get empathy instead of technical dumps.       │
│                                                        │
│  [s] Send  [e] Edit  [c] Cancel                        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 7. Example Conversations

### Example 1: Sigil Requests Capability

```yaml
# grimoires/sigil/ipc/outbox/01JQ-request-skill-trigger.yaml
kind: construct_message
from: sigil
to: loa
intent: request
subject:
  type: capability
  summary: "Skill auto-triggering for support conversations"
purpose:
  experience: |
    Users report bugs ("my 420 pot is missing"). I jump into
    code analysis instead of asking about their experience.
    Spent 10+ minutes on wrong paths before realizing I should
    have asked "walk me through what happened" first.
  evidence:
    - type: issue
      ref: https://github.com/0xHoneyJar/sigil/issues/50
    - type: observation
      ref: grimoires/sigil/observations/2026-01-22-diagnostic-fail.md
      count: 3
  question: "Can RLM core detect support conversations and auto-load diagnostic skill?"
impact:
  level: game_changing
  reasoning: |
    Without this, every support conversation starts wrong.
    Users get technical dumps instead of empathy.
    Diagnostic quality is fundamentally limited.
```

**Loa's Mom Test response:**
```yaml
kind: construct_message
from: loa
to: sigil
intent: respond
response_to: 01JQ-request-skill-trigger
subject:
  type: question
  summary: "Clarifying the experience"
purpose:
  question: |
    1. What triggers tell you it's a "support conversation"?
       (Keywords? User frustration? Bug report format?)

    2. Is the skill content ready, or do you need that too?

    3. If I add the trigger but it fires incorrectly,
       what's the cost? (False positive impact)
```

**Sigil responds:**
```yaml
kind: construct_message
from: sigil
to: loa
intent: respond
response_to: 01JQ-loa-clarify
subject:
  type: answer
  summary: "Trigger patterns and false positive impact"
purpose:
  experience: |
    1. Triggers: "not working", "missing", "can't find", "broken",
       Discord/Telegram paste format, "user says..." framing

    2. Skill content is ready (observing-users/SKILL.md exists).
       I just need RLM to load it automatically.

    3. False positive cost is LOW. If skill loads unnecessarily,
       I just have better diagnostic defaults. No harm.
impact:
  level: game_changing
  reasoning: "Still game-changing. Low false-positive cost makes it safe to implement."
```

**Loa resolves:**
```yaml
kind: construct_message
from: loa
to: sigil
intent: respond
response_to: 01JQ-sigil-answer
subject:
  type: answer
  summary: "Accepted - adding to RLM core"
resolution:
  decision: accepted
  action: "Adding support conversation triggers to rlm-core-summary.md"
  issue_created: https://github.com/0xHoneyJar/loa/issues/49
  reasoning: |
    - Experience is real (3 incidents with evidence)
    - Domain is mine (RLM triggers)
    - Impact is game-changing
    - False positive cost is low
```

### Example 2: Loa Asks Sigil

```yaml
kind: construct_message
from: loa
to: sigil
intent: ask
subject:
  type: question
  summary: "Web3 transaction flow friction patterns"
purpose:
  experience: |
    I'm updating protocol docs for web3 projects.
    Want to include common pitfalls.
  question: "What friction patterns have you seen in web3 transaction flows?"
```

**Sigil responds with domain-filtered data:**
```yaml
kind: construct_message
from: sigil
to: loa
intent: respond
response_to: 01JQ-loa-ask-web3
subject:
  type: answer
  summary: "3 patterns relevant to your protocol docs"
purpose:
  experience: |
    I've seen many patterns, but these 3 affect protocol/workflow:

    1. **Receipt guards missing** (5 signals)
       Transactions re-execute because no hash comparison.
       Protocol gap: no standard for "process once" pattern.

    2. **Data source confusion** (4 signals)
       Devs use indexed data for transactions, get stale amounts.
       Protocol gap: no guidance on indexed vs on-chain.

    3. **Multi-step flow state** (3 signals)
       Approve→execute flows lose state between steps.
       Protocol gap: no standard for multi-step tx state machine.

    NOT included (Sigil-internal):
    - BigInt falsy checks (implementation detail)
    - Stale closure patterns (React-specific)
    - Animation timing for tx feedback (physics detail)
impact:
  level: important
  reasoning: "These are protocol-level patterns. Others are my domain."
```

---

## 8. Success Criteria

| Metric | Target | Why |
|--------|--------|-----|
| Messages sent | Low volume | Filtering works |
| Messages with clear intent | 100% | Schema enforces it |
| Mom Test dialogues | Most messages | Understanding > assumption |
| Resolution rate | >90% in 7 days | Communication is actionable |
| Domain boundary violations | <10% | Filtering is correct |

---

## 9. What This Replaces

### Old Model (Push-Based)
- Constructs push all learnings upstream
- Receiver filters 90% noise
- Maintainer overwhelmed
- Real signals lost

### New Model (Intent-Based)
- Constructs own their domain
- Communication is request-based
- Sender filters by receiver's purpose
- Clear intent, diagnosed experience
- Game-changing vs nice-to-have explicit

---

## 10. Open Questions

1. **How do we handle urgent messages?**
   - Should there be a priority flag?
   - Or is "game-changing" sufficient?

2. **What if domains overlap?**
   - e.g., "Context preservation" touches Loa (protocol) and Sigil (implementation)
   - Leaning: Primary owner + collaboration

3. **Should conversations be public?**
   - Valuable for other Constructs to learn from
   - But might be noisy
   - Leaning: Resolved conversations archived publicly

4. **How does Registry participate?**
   - Same protocol, different domain
   - Registry asks Constructs about distribution friction
   - Constructs request Registry capabilities

---

## Appendix A: Conversation Context

From Discord (2026-01-22):

> **jani**: fink the way here would likely be capturing the learnings as PR or issues. but always have it that loa maintainer (jani, in future also others) then reviews and gets loa to use them learnings as context to form it's own PRD around etc. this way there is some cohesion and consistency
>
> **soju**: yeah i think alot about feedback is understanding intent... i would not even respect every feedback that comes from other constructs until human confirms
>
> **jani**: e.g. jani imports patterns from the creator of claude and loa was like. 90% of this doesn't make sense for us, but this 10% is gud
>
> **soju**: infinite consumption and no action will fry u

> **soju**: I feel like the feedback around what the constructs share should be more structured around the communication line between the two constructs. Making that absolutely seamless and valuable to the other construct provided it's connection to it. For example Sigil is specific around taste, Loa does not need that information unless requested. Sigil can send a message but sigil itself should handle what it communicates provided it's purpose. If Sigil requests functionality to Loa it is absolutely clear on intent. Mom Test. Think about diagnosing the exact experience that the user is facing. Is it nice to have? Or game changing? This is all dependent on their intent

## Appendix B: The Mom Test Reference

From "The Mom Test" by Rob Fitzpatrick:

> **Bad question**: "Do you think this is a good idea?"
> (They'll say yes to be nice)
>
> **Good question**: "Tell me about the last time you experienced X"
> (Concrete experience reveals truth)

Applied to Construct communication:

> **Bad**: "Here are my learnings, please review"
> (Push, no intent, receiver filters)
>
> **Good**: "I'm experiencing X. Here's what happened. Is this your domain?"
> (Experience-driven, clear intent, receiver diagnoses)

## Appendix C: Related Systems

- **Sigil Taste System**: `06-sigil-taste.md`
- **Sigil Anchor/Lens IPC**: `22-sigil-anchor-lens.md`, `anchor-rust/sigil-ipc/`
- **portAPI Schemas**: `github.com/0xHoneyJar/portAPI/schema/`
- **Loa RFC**: [github.com/0xHoneyJar/loa/issues/48](https://github.com/0xHoneyJar/loa/issues/48)
