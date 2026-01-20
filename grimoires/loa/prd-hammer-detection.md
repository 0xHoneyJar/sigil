# PRD: Improved Hammer Detection for Framework Changes

```
    +===============================================+
    |  EXP-002 → PRD                                |
    |  Improved Hammer Detection                    |
    |                                               |
    |  Version 1.0.0                                |
    +===============================================+
```

**Created**: 2026-01-19
**Status**: Ready for Architecture
**Experiment**: [EXP-002](../sigil/experiments/EXP-002-hammer-detection.md)
**Owner**: zksoju

---

## 1. Problem Statement

### 1.1 Current State

The `/craft` command has four modes: Chisel (UI), Hammer (architecture), Debug (investigation), and Explore (research). Mode detection relies on keyword matching to determine which workflow to execute.

**Current Hammer signals** (from craft.md Step 0.5):
```
| Signal Type | Patterns |
|-------------|----------|
| Keywords | "feature", "system", "flow", "pipeline", "integrate", "build", "implement", "create" |
| Contract refs | contract, vault, pool, token, staking |
| API refs | endpoint, api, GET, POST, fetch.*backend |
| Indexer refs | indexer, index, sync, historical, events |
| Multi-component | "feature", "flow", scope > 5 words |
```

### 1.2 The Gap

Framework changes (commands, skills, workflows, experiments, observations) are **not recognized** as Hammer work. Requests like:
- "create experiments structure"
- "add workflow integration"
- "update the observe command"

...are interpreted as Chisel (or ignored) despite requiring multi-file architectural changes.

### 1.3 Evidence

**Session 2026-01-19** (experiments system implementation):
1. User invoked `/plan-and-analyze` → PRD created for experiments system
2. User asked: "Experiment artifact structure in relation to crafting and observing"
3. Claude interpreted as direct implementation request
4. **Skipped**: `/architect` (no SDD created)
5. **Skipped**: `/sprint-plan` (no task breakdown)
6. Went straight to creating 8 files across 3 directories

**Result**: Implementation without architecture review, discovered gaps post-implementation.

### 1.4 Root Cause

The detection algorithm optimizes for **product development** (Web3 DeFi apps) but not for **framework development** (Sigil/Loa tooling). When working on the framework itself, requests don't hit Web3-specific keywords.

---

## 2. Goals & Success Metrics

### 2.1 Goals

| Priority | Goal |
|----------|------|
| P0 | Framework changes correctly route to Hammer mode |
| P0 | PRD existence triggers architecture continuation prompt |
| P1 | False positive rate stays below 10% |
| P2 | User can still override to Chisel when appropriate |

### 2.2 Success Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Hammer detection for framework changes | ~20% (estimated) | >80% | Manual review of /craft sessions |
| PRD → SDD → Sprint completion rate | Unknown | >70% when PRD exists | Taste log analysis |
| False positive rate (unnecessary Hammer) | 0% | <10% | User overrides to Chisel |
| User satisfaction | Frustrated (skipped steps) | Confident (guided flow) | Qualitative feedback |

---

## 3. User Context

### 3.1 Primary Persona: Framework Maintainer

| Attribute | Value |
|-----------|-------|
| Role | Developer maintaining Sigil/Loa |
| Behavior | Makes changes to commands, skills, rules, workflows |
| Expectation | When touching multiple system files, wants architecture review |
| Pain point | Changes bypass PRD→SDD→Sprint, discovers gaps late |

### 3.2 User Journey (Current vs. Desired)

**Current (broken)**:
```
User: "create experiments structure"
  ↓
/craft detects: "create" (+1), "structure" (not recognized)
  ↓
Score: 1 → CHISEL mode
  ↓
Direct implementation (skips architecture)
  ↓
Post-implementation: "Why did we skip the PRD flow?"
```

**Desired (fixed)**:
```
User: "create experiments structure"
  ↓
/craft detects: "create" (+1), "experiments" (+1), "structure" (+1)
  ↓
Score: 3 → HAMMER mode
  ↓
Checks: PRD exists? → Yes (from earlier /plan-and-analyze)
  ↓
Prompt: "Continue to /architect?"
  ↓
Full Loa flow: PRD → SDD → Sprint → Implementation
```

---

## 4. Functional Requirements

### 4.1 FR-1: Add Framework-Change Signals

**Priority**: P0

Add new signal categories to Hammer detection:

```
| Signal Type | Patterns | Weight |
|-------------|----------|--------|
| Framework refs | "command", "skill", "workflow", "integration", "protocol", "rule" | +1 each |
| Grimoire refs | "grimoire", "experiments", "observations", "taste", "moodboard" | +1 each |
| Multi-file hints | "structure", "across", "throughout", "system-wide" | +1 each |
```

**Acceptance Criteria**:
- [ ] Framework refs added to Step 0.5 Hammer signals table
- [ ] Grimoire refs added to Step 0.5 Hammer signals table
- [ ] Multi-file hints added to Step 0.5 Hammer signals table
- [ ] Test: `/craft "add skill integration"` → Score ≥ 2 → HAMMER

### 4.2 FR-2: PRD Existence Check

**Priority**: P0

Before mode detection, check if a recent PRD exists:

```
If grimoires/loa/prd*.md exists AND modified < 24h:
  Parse title from first heading
  Show PRD continuation prompt
```

**PRD Continuation Prompt**:
```
┌─ PRD Detected ────────────────────────────────────────────┐
│                                                           │
│  Found: grimoires/loa/prd-{name}.md ({age})               │
│  Topic: {title from first H1}                             │
│                                                           │
│  Options:                                                 │
│  1. Continue to /architect → Design (SDD)                 │
│  2. Implement directly (skip architecture)                │
│  3. Start fresh (ignore existing PRD)                     │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- [ ] PRD check added before mode detection
- [ ] Checks all `prd*.md` files in `grimoires/loa/`
- [ ] Shows age of PRD (e.g., "2 hours ago", "yesterday")
- [ ] Option 1 invokes `/architect` skill
- [ ] Option 2 proceeds to Chisel
- [ ] Option 3 proceeds to mode detection (ignores PRD)

### 4.3 FR-3: Experiment Integration

**Priority**: P1

When crafting with `--experiment` flag and experiment has linked PRD:

```
If experiment references a PRD:
  Check if SDD exists for that PRD
  If no SDD: Suggest /architect first
```

**Acceptance Criteria**:
- [ ] Experiment file parsed for PRD references
- [ ] Missing SDD triggers suggestion
- [ ] User can override and proceed without SDD

---

## 5. Technical Requirements

### 5.1 Files Modified

| File | Changes |
|------|---------|
| `.claude/commands/craft.md` | Step 0.5 detection algorithm, PRD check |

### 5.2 No Breaking Changes

- Existing Hammer signals remain unchanged
- Web3 detection continues to work
- Override flags (`--hammer`, `--chisel`) still work
- Chisel mode unchanged for UI-only work

### 5.3 Backward Compatibility

| Scenario | Expected Behavior |
|----------|-------------------|
| `/craft "claim button"` | Still detects as Chisel (UI work) |
| `/craft "build rewards feature"` | Still detects as Hammer (Web3 keywords) |
| `/craft "add skill workflow"` | **NEW**: Detects as Hammer (framework keywords) |
| `/craft --chisel "add skill"` | Chisel (explicit override) |

---

## 6. Scope & Prioritization

### 6.1 In Scope (MVP)

- [x] FR-1: Framework-change signals
- [x] FR-2: PRD existence check
- [ ] FR-3: Experiment integration (P1, can defer)

### 6.2 Out of Scope

- Automatic PRD generation from experiments (future)
- Learning from past sessions (requires analytics)
- IDE integration (Claude Code only)

### 6.3 Future Considerations

- **EXP-003**: Auto-suggest experiment → PRD promotion when experiment is started
- **EXP-004**: Taste signal analysis to improve detection thresholds

---

## 7. Risks & Dependencies

### 7.1 Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| False positives (over-triggering Hammer) | Medium | Medium | User can override with `--chisel` |
| Keyword conflicts with product domain | Low | Low | Framework keywords are specific |
| PRD check slows down /craft | Low | Low | File existence check is fast |

### 7.2 Dependencies

| Dependency | Status |
|------------|--------|
| Experiments system | ✓ Implemented (EXP-001, EXP-002 exist) |
| /architect skill | ✓ Available |
| /sprint-plan skill | ✓ Available |

---

## 8. Implementation Approach

### 8.1 Recommended Order

1. Add framework-change signals to Step 0.5 (FR-1)
2. Add PRD existence check (FR-2)
3. Test with framework change requests
4. Monitor for false positives
5. Gather feedback for 2 weeks

### 8.2 Test Cases

| Input | Current | Expected |
|-------|---------|----------|
| "create experiments structure" | Chisel | Hammer |
| "add skill integration" | Chisel | Hammer |
| "update workflow" | Chisel | Hammer |
| "improve button animation" | Chisel | Chisel (unchanged) |
| "build rewards feature" | Hammer | Hammer (unchanged) |

---

## References

- Experiment: [EXP-002-hammer-detection.md](../sigil/experiments/EXP-002-hammer-detection.md)
- Current implementation: [craft.md Step 0.5](./.claude/commands/craft.md)
- Loa workflow: /plan-and-analyze → /architect → /sprint-plan

---

*PRD ready for architecture. Next: `/architect` to create SDD.*
