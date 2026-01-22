# PRD: Construct Feedback Protocol (IPC)

## Document Metadata
- **Version**: 0.1.0-draft
- **Status**: Draft
- **Author**: soju + Claude
- **Date**: 2026-01-22
- **Related RFC**: [loa#48](https://github.com/0xHoneyJar/loa/issues/48)

---

## 1. Problem Statement

### The Feedback Gap

Constructs (like Sigil) accumulate valuable learnings from user behavior:
- **Taste signals** (ACCEPT/MODIFY/REJECT) reveal preferences
- **Diagnostic observations** capture friction patterns
- **Pending learnings** extract reusable knowledge

But this knowledge is **trapped**. There's no structured way for learnings to flow upstream to:
1. **The Loa Constructs Registry** (distribution/packaging issues)
2. **The Mother Construct (Loa)** (protocol gaps, architectural feedback)

### Evidence from Sigil

| Issue | Natural Target | Why It's Trapped |
|-------|----------------|------------------|
| #44 - Package name friction | Registry | No channel to report |
| #21 - Version channels blocked | Registry | Manual issue filing only |
| #51 - Context management | Loa | Protocol-level, not Sigil-specific |
| #50 - Auto-trigger diagnostics | Loa | Skill inheritance pattern |

### The Mom Test Insight

From your conversation:
> "I would not even respect every feedback that comes from other constructs... until human confirms"
> "reviewing them is gud though"
> "90% of this doesn't make sense for us, but this 10% is gud"

**Feedback should be interrogative, not assertive.** Constructs should:
1. Surface observations with evidence
2. Let humans (maintainers) evaluate relevance
3. Accept filtering/rejection gracefully
4. Learn from what gets accepted

This is the "Mom Test" applied to protocol communication.

---

## 2. Goals & Success Metrics

### Goals

| Goal | Description |
|------|-------------|
| **G1** | Enable Constructs to report learnings upstream with evidence |
| **G2** | Maintain human review as the quality gate (no auto-merge) |
| **G3** | Route feedback to correct target (Loa vs Registry vs Self) |
| **G4** | Preserve provenance (which Construct, what evidence, when) |
| **G5** | Make review efficient (not 90% noise) |

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Feedback → Reviewed | >80% | Tracked in Registry |
| Feedback → Accepted | 10-30% | Expected filtering rate |
| Time to Review | <7 days | From submission to decision |
| False Positive Rate | <20% | Rejected as "not relevant" |

### Non-Goals

- **Auto-merging feedback** — Human review is non-negotiable
- **Real-time sync** — Batch/async is acceptable
- **Cross-org feedback** — THJ internal only for v1

---

## 3. User & Stakeholder Context

### Actors

| Actor | Type | Role |
|-------|------|------|
| **Child Construct** (Sigil) | Engine | Surfaces learnings with evidence |
| **Registry** | Service | Routes, indexes, tracks feedback |
| **Mother Construct** (Loa) | Engine | Evaluates protocol-level feedback |
| **Human Maintainer** (Jani) | Human | Reviews, accepts/rejects, provides context |

### User Journey

```
Sigil detects friction pattern (3+ similar taste signals)
    ↓
Sigil drafts upstream feedback item
    ↓
Human reviews in Sigil: "Submit upstream? [y/n]"
    ↓
If yes: Feedback submitted to Registry
    ↓
Registry routes to target (Loa or self)
    ↓
Maintainer reviews: "Accept this learning? [y/n/ask questions]"
    ↓
If accept: Learning incorporated into target
If reject: Feedback marked rejected with reason
If questions: Mom Test dialogue begins
```

### The Mom Test Dialogue

When maintainer has questions, the protocol supports **interrogative clarification**:

```
Maintainer: "What user type encountered this?"
Sigil: "Power users (3/3 signals from mobile context)"

Maintainer: "Was this during a specific flow?"
Sigil: "All during stake→claim flow, multi-step transactions"

Maintainer: "This seems specific to web3. Is it?"
Sigil: "Yes, all evidence from web3 transaction flows"
```

This mirrors the Mom Test: **ask about their experience, not validate your solution**.

---

## 4. Functional Requirements

### 4.1 Feedback Signal Schema

Extends the portAPI pattern:

```yaml
kind: construct_feedback
uid: hmuid:thj:sigil:feedback:01JQ...
org: thj
source_construct:
  id: sigil
  version: 4.0.0
target: loa | registry | self
signal_type: friction | gap | capability | pattern
severity: low | medium | high | critical
evidence:
  - type: taste_signal
    ref: grimoires/sigil/taste.md:142-186
    count: 5
    pattern: "timing_override_500ms"
  - type: issue
    ref: https://github.com/0xHoneyJar/sigil/issues/51
  - type: observation
    ref: grimoires/sigil/observations/2026-01-22-context-loss.md
summary: "Users consistently override 800ms timing to 500ms for financial buttons"
suggested_action: "Consider user-type-specific timing defaults"
human_reviewed: false
submitted_at: null
```

### 4.2 Routing Logic

| Signal Pattern | Target | Rationale |
|----------------|--------|-----------|
| Package/install friction | Registry | Distribution is Registry's domain |
| Version/channel issues | Registry | Channel API is Registry feature |
| Grimoire structure gaps | Loa | Protocol-level pattern |
| Recovery protocol issues | Loa | Core Loa behavior |
| Skill inheritance | Loa | How Constructs extend Loa |
| Physics timing | Self (Sigil) | Domain-specific |
| Material presets | Self (Sigil) | Domain-specific |

### 4.3 Evidence Thresholds

Not every signal should surface. Thresholds prevent noise:

| Severity | Threshold | Auto-draft? | Submit? |
|----------|-----------|-------------|---------|
| Critical | 1 signal + blocking issue | Yes | Prompt human |
| High | 3+ signals, same pattern | Yes | Prompt human |
| Medium | 5+ signals OR explicit report | Draft only | Manual |
| Low | 10+ signals | Aggregate weekly | Digest |

### 4.4 Commands

**In Sigil (inherited from Loa):**

```bash
/feedback              # Review pending upstream items
/feedback --target loa # Filter by target
/feedback --submit 3   # Submit item #3 (requires human confirm)
/feedback --digest     # Generate weekly summary
```

**Interaction:**

```
┌─ Pending Upstream Feedback ────────────────────────────┐
│                                                        │
│  #1 [HIGH] Context loss on compaction                  │
│     Target: Loa                                        │
│     Evidence: 5 taste signals, 2 issues (#50, #51)     │
│     Pattern: diagnostic_context_lost                   │
│                                                        │
│  #2 [MEDIUM] Package name confusion                    │
│     Target: Registry                                   │
│     Evidence: 3 issues (#41, #44, #45)                 │
│     Pattern: npm_scope_friction                        │
│                                                        │
│  [1] Review #1  [2] Review #2  [a] Submit all  [q] Quit│
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 4.5 Approval Flow (portAPI-style)

Following the portAPI pattern:

**Step 1: Construct Submits**
```json
{
  "recipe_id": "FEEDBACK_SUBMIT",
  "org": "thj",
  "source_construct": "sigil",
  "feedback_uid": "hmuid:thj:sigil:feedback:01JQ..."
}
```

**Step 2: Registry Validates (Sufficient/Insufficient)**
```json
{
  "sufficient": true,
  "routed_to": "loa",
  "review_queue_position": 3
}
```
or
```json
{
  "sufficient": false,
  "missing": [
    {
      "code": "INSUFFICIENT_EVIDENCE",
      "message": "Feedback requires at least 3 taste signals or 1 issue",
      "suggested_action": "Gather more evidence before submitting"
    }
  ]
}
```

**Step 3: Maintainer Reviews**
```json
{
  "kind": "feedback_review",
  "uid": "hmuid:thj:loa:review:01JQ...",
  "target": {
    "uid": "hmuid:thj:sigil:feedback:01JQ...",
    "tier_transition": "pending->accepted"
  },
  "decision": "accept" | "reject" | "needs_clarification",
  "reason": "Pattern confirms mobile users need faster timing",
  "actor": { "actor_id": "act_jani", "actor_type": "human" },
  "follow_up_action": "Create issue in Loa to add user-type-specific timing"
}
```

**Step 4: If needs_clarification (Mom Test)**
```json
{
  "kind": "clarification_request",
  "questions": [
    "What percentage of signals came from mobile vs desktop?",
    "Were these first-time users or power users?"
  ]
}
```

Construct responds:
```json
{
  "kind": "clarification_response",
  "answers": [
    { "question_id": 1, "answer": "100% mobile (3/3 signals)" },
    { "question_id": 2, "answer": "Power users based on diagnostic context" }
  ]
}
```

---

## 5. Technical Requirements

### 5.1 IPC Mechanism

**Hybrid approach** (combining Sigil and portAPI patterns):

**Fast path (file-based, Sigil-style):**
```
grimoires/sigil/upstream/
├── pending/
│   └── {uid}.yaml          ← Drafted feedback
├── submitted/
│   └── {uid}.yaml          ← Submitted to Registry
└── resolved/
    └── {uid}.yaml          ← Accepted/Rejected
```

**Slow path (API-based, portAPI-style):**
```
POST /v1/feedback/submit
GET  /v1/feedback/{uid}/status
POST /v1/feedback/{uid}/clarify
```

### 5.2 Identity

Use HMUID pattern from portAPI:
```
hmuid:thj:sigil:feedback:01JQ7FZ8B7QK6A7W9D4JH5JZ7K
      ├─ org ──┬─ construct ─┬─ kind ────┬─ unique
            ("thj") ("sigil")  ("feedback")
```

### 5.3 Security

Inherit from Sigil's `sigil-ipc` crate:
- Path traversal prevention
- UUID validation
- File size limits (1MB)
- Advisory locking
- TTL cleanup (stale after 30 days for feedback)

### 5.4 Persistence

| State | Location | TTL |
|-------|----------|-----|
| Pending | `grimoires/sigil/upstream/pending/` | Until submitted or 30 days |
| Submitted | Registry database | Until resolved |
| Resolved | `grimoires/sigil/upstream/resolved/` | 1 year (audit trail) |

---

## 6. Scope & Prioritization

### MVP (Phase 1)

- [ ] `/feedback` command in Sigil
- [ ] `upstream.yaml` schema
- [ ] File-based pending/submitted/resolved flow
- [ ] Manual submission (human must confirm)
- [ ] Routing logic (Loa vs Registry vs Self)
- [ ] GitHub issue creation (target repo)

### Phase 2

- [ ] Registry API integration
- [ ] Sufficiency validation
- [ ] Review queue in Registry
- [ ] Clarification protocol (Mom Test dialogue)

### Phase 3

- [ ] Cross-construct correlation
- [ ] Automated pattern detection
- [ ] Weekly digest generation
- [ ] Metrics dashboard

### Out of Scope

- Auto-merging feedback (human review required)
- Cross-org feedback (THJ internal only)
- Real-time sync (async batch is acceptable)
- Feedback on feedback (resolution propagation)

---

## 7. Risks & Dependencies

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Noise overwhelms maintainers | Medium | High | Strict thresholds, evidence requirements |
| Feedback ignored (no review) | Medium | Medium | Time-to-review metric, weekly digest |
| Routing errors | Low | Medium | Explicit routing rules, human override |
| Stale feedback accumulates | Medium | Low | TTL cleanup, periodic archive |

### Dependencies

| Dependency | Status | Blocker? |
|------------|--------|----------|
| Loa RFC acceptance (#48) | Submitted | No (can prototype in Sigil) |
| portAPI implementation | In progress | No (file-based MVP works) |
| Registry channel support | Blocked (#21) | No (MVP uses GitHub issues) |

---

## 8. Open Questions

1. **Should feedback auto-create GitHub issues, or stage for human to create?**
   - Leaning: Stage first, human creates after review

2. **How do we handle feedback that spans multiple targets?**
   - e.g., "Package naming is a Registry issue but also affects Loa docs"
   - Leaning: Primary target + "related" field

3. **Should rejected feedback be visible to the source Construct?**
   - Leaning: Yes, with reason (helps Construct learn what's relevant)

4. **What's the right evidence threshold for "high" severity?**
   - Current: 3+ signals, same pattern
   - May need tuning based on real data

---

## 9. Appendix

### A. Conversation Context

From Discord (2026-01-22):

> **jani**: fink the way here would likely be capturing the learnings as PR or issues. but always have it that loa maintainer (jani, in future also others) then reviews and gets loa to use them learnings as context to form it's own PRD around etc. this way there is some cohesion and consistency
>
> **soju**: yeah i think alot about feedback is understanding intent... i would not even respect every feedback that comes from other constructs until human confirms
>
> **jani**: e.g. jani imports patterns from the creator of claude and loa was like. 90% of this doesn't make sense for us, but this 10% is gud
>
> **soju**: infinite consumption and no action will fry u

### B. Related Systems

- **Sigil Taste System**: `06-sigil-taste.md`
- **Sigil Anchor/Lens IPC**: `22-sigil-anchor-lens.md`, `anchor-rust/sigil-ipc/`
- **portAPI Schemas**: `/Users/zksoju/Documents/GitHub/portAPI/schema/`
- **Loa RFC**: [github.com/0xHoneyJar/loa/issues/48](https://github.com/0xHoneyJar/loa/issues/48)

### C. Example Workflow

```
Day 1: User reports "my 420 pot is missing"
       Sigil captures observation (Issue #50 pattern)

Day 3: 3rd similar signal detected
       Sigil auto-drafts upstream feedback

Day 3: Human reviews: "Submit to Loa? [y/n]"
       Human: "y"

Day 4: Submitted to Registry, routed to Loa

Day 5: Jani reviews in Loa maintainer queue
       Jani: "needs_clarification" - "Is this web3 specific?"

Day 5: Sigil responds with evidence breakdown

Day 6: Jani: "accept" - "Add auto-trigger for support patterns"
       Creates issue in Loa repo

Day 7: Loa implements, feedback marked resolved
       Sigil notified: "Your feedback was accepted"
```
