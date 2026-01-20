# PRD: Sigil Observations System

## Problem Statement

The current Sigil feedback loops capture **developer preferences** through `/craft` diagnostics, but miss **actual user behavior**. When developers modify generated code, we learn their taste — but we don't systematically capture why users struggle with interfaces in the first place.

**Gap**: There's no structured way to:
1. Capture raw user feedback from support channels
2. Dig to Level 3 (what are they trying to accomplish?)
3. Classify gaps (bug vs discoverability vs feature)
4. Feed validated insights back into physics decisions

## Solution

Add an **Observations System** that complements the existing taste system:

| System | Captures | Source | File |
|--------|----------|--------|------|
| Taste | Developer preferences | `/craft`, toolbar | `taste.md` |
| Observations | User behavior/gaps | `/observe` | `observations/*.md` |

## User Stories

### US-1: Capture User Feedback
> As a developer, I want to capture user feedback in a structured way so that I don't lose important signals in chat noise.

**Acceptance Criteria**:
- `/observe "<quote>" --user name` creates a diagnostic file
- File includes user profile, Level 3 goal, hypothesis space
- Questions are generated following Mom Test principles

### US-2: Classify Gaps
> As a developer, I want to understand whether user feedback indicates a bug, discoverability issue, or feature gap so that I take the right action.

**Acceptance Criteria**:
- Hypothesis space maps possible responses to gap types
- Gap classification leads to specific actions (fix/improve/build)
- Validated classifications update `user-insights.md`

### US-3: Inform /craft Decisions
> As a developer, I want observations to inform physics decisions when I run /craft so that components reflect actual user needs.

**Acceptance Criteria**:
- `/craft` checks `observations/` for relevant diagnostics
- User type from observations adjusts physics (power-user vs casual)
- Analysis box shows observation references

### US-4: Cross-Validate Taste Patterns
> As a developer, I want to validate taste patterns against observations so that physics changes are user-grounded.

**Acceptance Criteria**:
- `/taste-synthesize` cross-references observations
- Patterns with observation backing get elevated confidence
- Synthesis report shows observation evidence

## Architecture

### File Structure

```
grimoires/sigil/
├── taste.md                          # Developer preferences (existing)
├── observations/
│   ├── {username}-diagnostic.md      # Individual diagnostic logs
│   ├── user-insights.md              # Aggregated confirmed findings
│   └── open-questions.md             # Questions awaiting answers
├── inscribed-patterns.yaml           # Applied rules (existing)
└── dismissed-patterns.yaml           # Rejected patterns (existing)
```

### Data Flow

```
User Feedback (Discord/TG/Support)
         │
         ▼
    /observe "<quote>"
         │
         ▼
  {user}-diagnostic.md
         │
    ┌────┴────┐
    │         │
    ▼         ▼
Questions   Hypothesis
  Asked      Space
    │         │
    ▼         │
 Responses   │
    │        │
    └───┬────┘
        ▼
  Gap Classification
        │
   ┌────┼────┐
   │    │    │
   ▼    ▼    ▼
  Bug  Disc  Feature
   │    │      │
   ▼    ▼      ▼
  Fix  /craft  PRD
        │
        ▼
  user-insights.md
        │
        ▼
  /taste-synthesize
  (cross-validation)
```

## Implementation

### Phase 1: /observe Command
- Create command file
- Create skill file
- Generate diagnostic template

### Phase 2: /craft Integration
- Read observations in Step 1a
- Show observation context in analysis
- Adjust physics based on user type

### Phase 3: /taste-synthesize Integration
- Cross-reference observations
- Elevate confidence with observation backing
- Generate user-insights updates

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Feedback capture rate | 80% of actionable feedback | Observations created vs feedback received |
| Gap classification accuracy | 90% | Validated classification vs actual resolution |
| Cross-validation hits | 50% of HIGH confidence patterns | Patterns with observation backing |
| /craft context usage | Show observation in 30% of crafts | Crafts with observation reference |

## Dependencies

- Existing `/craft` workflow (Sprint 1-3)
- Existing `/taste-synthesize` (Sprint 4)
- `grimoires/sigil/` directory structure

## Out of Scope

- Automated feedback ingestion from Discord/TG (manual `/observe` for now)
- User authentication/identity management
- Real-time observation streaming

## Timeline

| Phase | Deliverable | Status |
|-------|-------------|--------|
| Phase 1 | `/observe` command + skill | Complete |
| Phase 2 | `/craft` integration | In PR #16 |
| Phase 3 | `/taste-synthesize` integration | Complete |

---

## Appendix: Level 3 Diagnostic Framework

### The Three Levels

| Level | Question | Value |
|-------|----------|-------|
| 1 | What did they say? | Surface symptom |
| 2 | What do they want? | Stated desire |
| 3 | What are they trying to accomplish? | Actionable truth |

### Mom Test Principles

1. Talk about their life, not your idea
2. Ask about specifics in the past, not generics about the future
3. Talk less, listen more
4. Seek disconfirming evidence
5. Push for commitment or advancement

### Gap Types

| Type | Meaning | Action |
|------|---------|--------|
| Bug | Feature exists but broken | Fix immediately |
| Discoverability | Feature exists but not found | `/craft` improvement |
| Feature | Capability doesn't exist | Add to roadmap |
