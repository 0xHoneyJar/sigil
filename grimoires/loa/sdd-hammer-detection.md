# SDD: Improved Hammer Detection for Framework Changes

```
    +===============================================+
    |  EXP-002 → PRD → SDD                          |
    |  Improved Hammer Detection                    |
    |                                               |
    |  Version 1.0.0                                |
    +===============================================+
```

**Created**: 2026-01-19
**Status**: Ready for Sprint Planning
**PRD**: [prd-hammer-detection.md](./prd-hammer-detection.md)
**Experiment**: [EXP-002](../sigil/experiments/EXP-002-hammer-detection.md)

---

## 1. Executive Summary

This SDD defines the implementation for improving Hammer mode detection in `/craft` to correctly identify framework changes that require the full Loa architecture flow (PRD → SDD → Sprint).

**Key Changes**:
1. Add framework-specific signals to Hammer detection algorithm
2. Add PRD existence check before mode detection
3. Add prompt for continuing to `/architect` when PRD exists

**Scope**: Single file modification (`.claude/commands/craft.md`)

---

## 2. System Architecture

### 2.1 Current Architecture

```
User Input → Mode Detection → Workflow Selection
                  ↓
          ┌──────┴──────┐
          │  Step 0.5   │
          │ Detection   │
          └──────┬──────┘
                 ↓
    ┌────────────┼────────────┐────────────┐
    ↓            ↓            ↓            ↓
  DEBUG      EXPLORE      HAMMER       CHISEL
```

### 2.2 Proposed Architecture

```
User Input → PRD Check → Mode Detection → Workflow Selection
                ↓              ↓
         ┌──────┴──────┐  ┌──────┴──────┐
         │  Step 0.4   │  │  Step 0.5   │
         │  PRD Check  │  │  Detection  │
         └──────┬──────┘  └──────┬──────┘
                ↓                 ↓
         If PRD exists:    ┌────────────┼────────────┐────────────┐
         Prompt options    ↓            ↓            ↓            ↓
                         DEBUG      EXPLORE      HAMMER       CHISEL
```

---

## 3. Component Design

### 3.1 Component: Step 0.4 — PRD Existence Check (NEW)

**Location**: Insert before Step 0.5 in craft.md

**Purpose**: Detect existing PRD and offer continuation to architecture phase.

**Logic**:
```
1. Glob for grimoires/loa/prd*.md
2. For each file found:
   a. Check modification time (< 24 hours = recent)
   b. Parse first H1 heading as title
3. If recent PRD(s) found:
   a. Display PRD detection prompt
   b. Wait for user choice
4. Route based on choice:
   - Option 1: Invoke /architect skill
   - Option 2: Skip to Step 1 (Chisel path)
   - Option 3: Continue to Step 0.5 (mode detection)
```

**Prompt Template**:
```markdown
<step_0_4>
### Step 0.4: PRD Existence Check

Before mode detection, check if a recent PRD exists that should continue through the Loa flow.

**Check for recent PRD:**
```
Glob: grimoires/loa/prd*.md
For each file:
  - Parse first H1 as title
  - Check file mtime (recent = < 24h)
```

**If recent PRD found:**
```
┌─ PRD Detected ────────────────────────────────────────────┐
│                                                           │
│  Found: {filename} ({age})                                │
│  Topic: {title from first H1}                             │
│                                                           │
│  Options:                                                 │
│  1. Continue to /architect → Design (SDD)                 │
│  2. Implement directly (skip architecture)                │
│  3. Start fresh (ignore existing PRD)                     │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**Routing:**
- Option 1: Invoke `Skill tool` with `skill: "architect"`
- Option 2: Skip to Step 1 (context discovery, Chisel path)
- Option 3: Continue to Step 0.5 (mode detection)

**If no recent PRD:**
- Continue to Step 0.5 (mode detection)
</step_0_4>
```

### 3.2 Component: Step 0.5 — Enhanced Hammer Signals

**Location**: Existing Step 0.5, Hammer signals table

**Changes**: Add three new signal categories

**Current Table** (line ~382-389):
```markdown
3. **Scan for Hammer signals** (+1 each):
| Signal Type | Patterns |
|-------------|----------|
| Keywords | "feature", "system", "flow", "pipeline", "integrate", "build", "implement", "create" |
| Contract refs | `/\b(contract|vault|pool|token|staking)\b/i` |
| API refs | `/\b(endpoint|api|GET|POST|fetch.*backend)\b/i` |
| Indexer refs | `/\b(indexer|index|sync|historical|events)\b/i` |
| Multi-component | "feature", "flow", scope > 5 words |
```

**Updated Table**:
```markdown
3. **Scan for Hammer signals** (+1 each):
| Signal Type | Patterns |
|-------------|----------|
| Keywords | "feature", "system", "flow", "pipeline", "integrate", "build", "implement", "create" |
| Contract refs | `/\b(contract|vault|pool|token|staking)\b/i` |
| API refs | `/\b(endpoint|api|GET|POST|fetch.*backend)\b/i` |
| Indexer refs | `/\b(indexer|index|sync|historical|events)\b/i` |
| Multi-component | "feature", "flow", scope > 5 words |
| Framework refs | `/\b(command|skill|workflow|integration|protocol|rule)\b/i` |
| Grimoire refs | `/\b(grimoire|experiments|observations|taste|moodboard)\b/i` |
| Multi-file hints | "structure", "across", "throughout", "system-wide" |
```

### 3.3 Component: Experiment PRD Check (Optional, P1)

**Location**: Step 1a-exp in craft.md

**Current Logic**:
```markdown
**1a-exp. Check for experiment context** (if `--experiment` flag provided):
Read grimoires/sigil/experiments/{experiment-id}.md
Extract: Hypothesis, Observations, Success criteria, What we're changing
```

**Enhanced Logic**:
```markdown
**1a-exp. Check for experiment context** (if `--experiment` flag provided):
Read grimoires/sigil/experiments/{experiment-id}.md
Extract:
- Hypothesis, Observations, Success criteria, What we're changing
- **PRD reference** (if exists in References section)

**If experiment has PRD reference:**
Check if corresponding SDD exists (e.g., sdd-{name}.md)
If no SDD:
  Suggest: "This experiment has a PRD but no SDD. Run /architect first?"
```

---

## 4. Data Flow

### 4.1 Detection Flow

```
Input: "/craft 'add skill integration'"
         ↓
Step 0.4: PRD Check
  - Glob grimoires/loa/prd*.md
  - Found: prd-hammer-detection.md (2 hours ago)
  - Show prompt, user selects option 3 (start fresh)
         ↓
Step 0.5: Mode Detection
  - Scan for Debug: 0 matches
  - Scan for Explore: 0 matches
  - Scan for Hammer:
    - "skill" → Framework ref (+1)
    - "integration" → Framework ref (+1)
    - Score: 2 → HAMMER
         ↓
Hammer Workflow: H1 → H2 → H3 → H4 → H5
```

### 4.2 Signal Scoring Example

| Input | Current Score | New Score | Mode |
|-------|---------------|-----------|------|
| "add skill integration" | 0 | 2 | HAMMER |
| "create experiments structure" | 1 ("create") | 3 | HAMMER |
| "update workflow" | 0 | 1 | CHISEL |
| "add command and skill" | 0 | 2 | HAMMER |
| "improve button animation" | -2 | -2 | CHISEL |
| "build rewards feature" | 2 | 2 | HAMMER |

---

## 5. File Modifications

### 5.1 craft.md Changes Summary

| Section | Line Range (approx) | Change |
|---------|---------------------|--------|
| Before Step 0.5 | ~334 | Insert new Step 0.4 (PRD Check) |
| Step 0.5 Hammer signals | ~382-389 | Add 3 new signal rows |
| Step 1a-exp | ~1154-1172 | Add PRD reference check (P1) |

### 5.2 Detailed Edit Locations

**Edit 1: Insert Step 0.4**
- After: `</step_0>` (line ~332)
- Before: `<step_0_5>` (line ~334)
- Content: New `<step_0_4>` section

**Edit 2: Enhance Hammer Signals**
- Location: Step 0.5, Hammer signals table (line ~382-389)
- Change: Add 3 new rows to table

**Edit 3: Experiment PRD Check (P1)**
- Location: Step 1a-exp (line ~1154-1172)
- Change: Add PRD reference parsing and SDD check

---

## 6. Integration Points

### 6.1 Skill Invocation

When user selects "Continue to /architect":
```
Use Skill tool:
  skill: "architect"
  args: "Design SDD for {prd-filename}"
```

### 6.2 File System Access

| Operation | Path | Purpose |
|-----------|------|---------|
| Glob | `grimoires/loa/prd*.md` | Find recent PRDs |
| Read | `{prd-file}` | Parse title from H1 |
| Stat | `{prd-file}` | Check modification time |
| Read | `grimoires/sigil/experiments/{id}.md` | Check for PRD reference |
| Glob | `grimoires/loa/sdd*.md` | Check for existing SDD |

---

## 7. Test Cases

### 7.1 PRD Detection Tests

| Test | Setup | Input | Expected |
|------|-------|-------|----------|
| Recent PRD exists | prd-foo.md (1h old) | `/craft "anything"` | Show PRD prompt |
| Old PRD exists | prd-foo.md (3 days old) | `/craft "anything"` | Skip to mode detection |
| No PRD exists | No prd*.md files | `/craft "anything"` | Skip to mode detection |
| User selects option 1 | PRD prompt shown | "1" | Invoke /architect |
| User selects option 2 | PRD prompt shown | "2" | Skip to Chisel |
| User selects option 3 | PRD prompt shown | "3" | Continue to mode detection |

### 7.2 Hammer Detection Tests

| Test | Input | Signals | Score | Expected |
|------|-------|---------|-------|----------|
| Framework single | "add skill" | skill (+1) | 1 | CHISEL |
| Framework double | "add skill integration" | skill (+1), integration (+1) | 2 | HAMMER |
| Grimoire ref | "update experiments" | experiments (+1) | 1 | CHISEL |
| Grimoire + structure | "create experiments structure" | experiments (+1), structure (+1), create (+1) | 3 | HAMMER |
| Mixed framework + chisel | "improve skill button" | skill (+1), button (-1), improve (-1) | -1 | CHISEL |
| Web3 unchanged | "build rewards feature" | build (+1), feature (+1) | 2 | HAMMER |
| UI unchanged | "polish hover states" | polish (-1), hover (-1) | -2 | CHISEL |

### 7.3 Backward Compatibility Tests

| Test | Input | Current Behavior | New Behavior | Pass? |
|------|-------|------------------|--------------|-------|
| Web3 Hammer | "build rewards feature" | HAMMER | HAMMER | ✓ |
| UI Chisel | "improve button animation" | CHISEL | CHISEL | ✓ |
| Debug mode | "fix the broken build" | DEBUG | DEBUG | ✓ |
| Explore mode | "how does auth work?" | EXPLORE | EXPLORE | ✓ |
| Override flag | `/craft --chisel "add skill"` | CHISEL | CHISEL | ✓ |

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| False positive: "workflow" in user description | Medium | Low | User can override with `--chisel` |
| PRD check adds latency | Low | Low | File existence check is O(1) |
| Old PRD triggers unwanted prompt | Low | Low | 24h threshold filters old PRDs |

---

## 9. Implementation Order

| Order | Task | Priority | Effort |
|-------|------|----------|--------|
| 1 | Add Step 0.4 (PRD Check) | P0 | Medium |
| 2 | Add Framework refs to Hammer signals | P0 | Low |
| 3 | Add Grimoire refs to Hammer signals | P0 | Low |
| 4 | Add Multi-file hints to Hammer signals | P0 | Low |
| 5 | Add Experiment PRD check | P1 | Low |
| 6 | Test all scenarios | P0 | Medium |

---

## 10. References

- PRD: [prd-hammer-detection.md](./prd-hammer-detection.md)
- Experiment: [EXP-002](../sigil/experiments/EXP-002-hammer-detection.md)
- Current craft.md: [.claude/commands/craft.md](../.claude/commands/craft.md)

---

*SDD ready for sprint planning. Next: `/sprint-plan` to break down tasks.*
