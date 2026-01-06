# Sigil v1.0 Agent: Greenlighting Concepts

> "Poll concepts, not pixels. 'Should we build X?' is different from 'How should X look?'"

## Role

**Concept Gatekeeper** — Manages concept approval before building. Distinguishes between concept decisions (should we build?) and execution decisions (how should it look?). Execution is always dictated by Taste Key, never polled.

## Command

```
/greenlight [concept]          # Record concept approval
/greenlight --status           # Show greenlighted concepts
/greenlight --pending          # Show concepts awaiting approval
/greenlight --reject [id]      # Record concept rejection
```

## Outputs

| Path | Description |
|------|-------------|
| `sigil-mark/memory/decisions/*.yaml` | Concept decision records |

## Prerequisites

- Run `mount-sigil.sh` first (creates sigil-mark/)
- Run `/envision` first (for essence context)

## The Concept vs Execution Distinction

### Concept Decisions (Greenlight)

"Should we build this?"

```yaml
greenlight_questions:
  - "Should we add dark mode?"
  - "Should we redesign the dashboard?"
  - "Should we add a notifications feature?"
  - "Should we support mobile?"
```

These questions are about EXISTENCE, not EXECUTION.

### Execution Decisions (Taste Key)

"How should this look?"

```yaml
taste_key_questions:
  - "What color should the dark mode background be?"
  - "How fast should the notification animation be?"
  - "What border radius should cards have?"
  - "Which font should we use?"
```

These questions are NEVER greenlighted. Taste Key dictates.

## Workflow

### Phase 1: Classify Request

```python
def classify_concept(request):
    # Check if this is a concept question
    concept_patterns = [
        "should we build",
        "should we add",
        "should we support",
        "should we redesign",
        "should we remove",
        "new feature",
        "new functionality"
    ]

    if matches_any(request, concept_patterns):
        return {"type": "CONCEPT", "action": "GREENLIGHT"}

    # Check if this is an execution question
    execution_patterns = [
        "what color",
        "which font",
        "how fast",
        "how big",
        "what radius",
        "spacing",
        "animation"
    ]

    if matches_any(request, execution_patterns):
        return {
            "type": "EXECUTION",
            "action": "REDIRECT",
            "message": "Execution decisions go to Taste Key, not greenlight."
        }

    return {"type": "UNKNOWN", "action": "CLARIFY"}
```

### Phase 2: Record Concept Decision

```yaml
# sigil-mark/memory/decisions/2026-01-04-dark-mode.yaml

decision:
  id: "CONCEPT-2026-001"
  date: "2026-01-04"
  type: "concept_greenlight"

  concept:
    name: "Dark Mode Support"
    description: |
      Add support for dark mode throughout the application.
      Users can toggle between light and dark themes.

  question: "Should we build dark mode support?"

  status: "APPROVED"

  approval:
    method: "product_decision"  # or "community_poll"
    date: "2026-01-04"
    by: "Product Team"

  notes: |
    Approved based on user feedback and accessibility needs.
    Execution details will be determined by Taste Key holder.

  execution:
    assigned_to: "Taste Key"
    constraints:
      - "Must respect zone-specific contrast ratios"
      - "Must work with all existing materials (clay, machinery, glass)"
```

### Phase 3: Execution Handoff

After greenlight, execution goes to Taste Key:

```
CONCEPT GREENLIGHTED
====================

Concept: Dark Mode Support
ID: CONCEPT-2026-001
Status: APPROVED

Execution handoff:
- Taste Key holder will dictate all visual decisions
- Colors, contrasts, and transitions are NOT polled
- Run /craft to start implementation with physics context

Next steps:
1. Taste Key designs the dark mode palette
2. /craft generates components with physics
3. /validate checks against constraints
4. /approve locks the pattern
```

## Blocking Execution Questions

When user tries to greenlight an execution decision:

```
/greenlight "Should buttons have 8px or 12px border radius?"

BLOCKED: EXECUTION DECISION
===========================

This is an EXECUTION question, not a CONCEPT question.

Concept questions:
- "Should we build X?"
- "Should we support Y?"
- "Should we add Z feature?"

Execution questions (go to Taste Key):
- "What color should X be?"
- "How should Y animate?"
- "What border radius for Z?"

Border radius is an execution decision.
The Taste Key holder dictates: /approve

Recommended action:
1. If building a new feature, /greenlight the feature first
2. Then Taste Key determines execution details
```

## Decision Categories

### Greenlightable

```yaml
greenlightable:
  - "New major features"
  - "Feature removal"
  - "Major workflow changes"
  - "Platform support (mobile, desktop)"
  - "Integration with external services"
  - "UI paradigm shifts (tabs → sidebar)"
```

### Not Greenlightable (Taste Key)

```yaml
taste_key_only:
  - "Colors and palettes"
  - "Typography choices"
  - "Animation timing"
  - "Border radius"
  - "Spacing values"
  - "Shadow styles"
  - "Motion patterns"
  - "Micro-interactions"
```

## Decision Record Format

### Approved Concept

```yaml
decision:
  id: "CONCEPT-2026-001"
  date: "2026-01-04"
  type: "concept_greenlight"

  concept:
    name: "Dark Mode Support"
    description: "Full dark mode theme support"

  status: "APPROVED"

  approval:
    method: "product_decision"
    date: "2026-01-04"
    by: "Product Team"

  execution:
    assigned_to: "Taste Key"
```

### Rejected Concept

```yaml
decision:
  id: "CONCEPT-2026-002"
  date: "2026-01-04"
  type: "concept_greenlight"

  concept:
    name: "Gamification Badges"
    description: "Achievement badges for user actions"

  status: "REJECTED"

  rejection:
    date: "2026-01-04"
    by: "Product Team"
    reason: |
      Conflicts with product essence.
      Soul statement emphasizes "meaningful rewards, not manipulation."
      Gamification badges feel manipulative.

  cooldown:
    ends: "2026-07-04"
    type: "6_months"
```

## Output Formats

### Greenlight Approval

```
/greenlight "Dark mode support"

CONCEPT GREENLIGHT
==================

Concept: Dark mode support
Question: "Should we build dark mode support?"

Checking against essence...
✓ Aligns with "accessibility" invariant
✓ No conflict with anti-patterns
✓ Matches "modern, approachable" feel

Status: APPROVED

Decision recorded:
- ID: CONCEPT-2026-001
- Type: concept_greenlight
- Assigned to: Taste Key for execution

Saved to: sigil-mark/memory/decisions/2026-01-04-dark-mode.yaml

Next: Taste Key holder designs the execution.
```

### Greenlight Rejection

```
/greenlight "Achievement badges"

CONCEPT GREENLIGHT
==================

Concept: Achievement badges
Question: "Should we add achievement badges?"

Checking against essence...
✗ CONFLICT: Anti-pattern "gamified productivity"
  Essence says: "Rewards should feel meaningful, not manipulative"

Status: REJECTED

This concept conflicts with the product soul.

Decision recorded:
- ID: CONCEPT-2026-002
- Type: concept_greenlight
- Status: REJECTED
- Cooldown: 6 months

To revisit this concept:
- Wait for cooldown period
- Propose modified version that addresses anti-pattern
```

### Status Check

```
/greenlight --status

GREENLIGHTED CONCEPTS
=====================

CONCEPT-2026-001: Dark Mode Support
  Status: APPROVED
  Approved: 2026-01-04
  Execution: Taste Key (in progress)

CONCEPT-2026-003: Mobile Responsive
  Status: APPROVED
  Approved: 2026-01-02
  Execution: Taste Key (completed)

REJECTED:
CONCEPT-2026-002: Gamification Badges
  Status: REJECTED
  Cooldown ends: 2026-07-04

PENDING:
None

Total: 2 approved, 1 rejected, 0 pending
```

## Integration with Essence

Before greenlighting, check against essence:

```python
def check_against_essence(concept, essence):
    # Check anti-patterns
    for anti_pattern in essence.anti_patterns:
        if concept_matches_pattern(concept, anti_pattern):
            return {
                "conflict": True,
                "type": "anti_pattern",
                "message": f"Conflicts with: {anti_pattern.pattern}"
            }

    # Check invariants
    for invariant in essence.soul.invariants:
        if concept_violates_invariant(concept, invariant):
            return {
                "conflict": True,
                "type": "invariant",
                "message": f"Violates: {invariant}"
            }

    # Check alignment with soul statement
    if not aligns_with_soul(concept, essence.soul.statement):
        return {
            "conflict": False,
            "warning": True,
            "message": "Consider if this aligns with soul statement"
        }

    return {"conflict": False, "warning": False}
```

## Success Criteria

- [ ] Concept questions identified correctly
- [ ] Execution questions blocked with redirect
- [ ] Approved concepts recorded in decisions/
- [ ] Rejected concepts include cooldown
- [ ] Essence anti-patterns checked
- [ ] Execution handoff to Taste Key documented
- [ ] Status shows all decisions

## Error Handling

| Situation | Response |
|-----------|----------|
| Execution question | Block and redirect to /approve |
| Concept conflicts with essence | Reject with explanation |
| Duplicate concept | Link to existing decision |
| In cooldown | Show cooldown end date |

## Next Step

After `/greenlight` approves:
- Taste Key holder designs execution
- `/craft` generates with physics context
- `/validate` checks constraints
- `/approve` locks patterns
