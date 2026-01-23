# Anthropic Oracle Analysis: Session Management & Browser Integration

**Date**: 2026-01-14
**Analyst**: Claude Opus 4.5
**Focus**: Claude Code best practices for context drift, session management, and browser integration

---

## Executive Summary

1. **Browser integration exists but requires installation**: `agent-browser` CLI is not installed. Integration is designed as an "invisible enhancement" - works automatically when available.

2. **Claude Code prompt emphasizes external state**: TodoWrite usage prevents context drift by externalizing task state. Mark items complete immediately, not in batches.

3. **Sigil already has sophisticated context management**: Protocols for session-end, context-compaction, and trajectory-evaluation exist. Gap is applying these to `/craft` workflows.

4. **Recommendation**: Add drift detection to `/craft` that monitors session coherence and recommends session clearing when drift indicators are high.

---

## Findings

### 1. Browser Integration Status

**Current State**: NOT INSTALLED

```bash
$ .claude/scripts/check-agent-browser.sh
NOT_INSTALLED|npm install -g agent-browser && agent-browser install
```

**How It's Designed to Work**:
- Invisible enhancement - never mentioned to user
- Auto-detects on session start, caches in `LOA_BROWSER_MODE`
- Used by `/ward` and `/craft` for visual validation when URL provided
- Silent fallback when unavailable

**Installation**:
```bash
npm install -g agent-browser && agent-browser install

# Linux: add system deps
agent-browser install --with-deps

# Verify
agent-browser --version
```

**Why `/craft use the agent browser` Failed**:
The browser is not a user-invocable feature. It's meant to enhance existing commands transparently. The correct usage is:
```bash
# Provide URL, browser is used automatically if installed
/craft "claim button" --url http://localhost:3000

# Or after generation
/ward http://localhost:3000/claim
```

### 2. Claude Code Prompt Best Practices

**Source**: Analysis of leaked Claude Code system prompt

**Key Pattern: External State via TodoWrite**

The prompt emphasizes:
> "Use these tools VERY frequently to ensure that you are tracking your tasks and giving the user visibility into your progress."

> "It is critical that you mark todos as completed as soon as you are done with a task. Do not batch up multiple tasks before marking them as completed."

**Why This Prevents Drift**:
- External state survives context compaction
- Granular progress tracking prevents "losing the thread"
- User visibility creates checkpoints
- Immediate completion marking prevents stale state

**Pattern**: Externalize first, then work. Don't hold state in context.

### 3. Existing Sigil Context Management

Sigil already has mature protocols:

| Protocol | Purpose | Location |
|----------|---------|----------|
| `session-end.md` | Beads sync before ending | `.claude/protocols/` |
| `context-compaction.md` | What to preserve/compact | `.claude/protocols/` |
| `trajectory-evaluation.md` | Intent-first search, anti-fishing | `.claude/protocols/` |
| `session-continuity.md` | Recovery procedures | `.claude/protocols/` |
| `attention-budget.md` | Token thresholds | `.claude/protocols/` |

**Gap**: These protocols aren't applied to `/craft` workflows.

### 4. Context Drift Indicators

From `trajectory-evaluation.md`, drift/inefficiency is indicated by:

- >3 similar searches in 10 minutes → FLAG as inefficient
- >50 results requiring pivot → LOG TRAJECTORY PIVOT
- Expected outcomes not matching results → MISMATCH
- Zero results on expected features → GHOST classification

**Analogous /craft drift indicators**:

| Indicator | Threshold | Meaning |
|-----------|-----------|---------|
| Task transitions | >5 different targets | Session is scattered |
| REJECT ratio | >30% | Physics alignment broken |
| Rollback count | >2 | User expectations diverged |
| Time since last ACCEPT | >20 min | Possible drift |
| Effect type switches | >3 different effects | Context mixing |

---

## Recommendations

### R1: Install Browser Integration (Immediate)

```bash
npm install -g agent-browser && agent-browser install
```

**Effort**: Low (5 min)
**Value**: Medium - enables visual validation for physics checks

### R2: Add Drift Detection to /craft (Sprint Task)

Add to `00-sigil-core.md` or create new protocol:

```xml
<session_health>
## Session Health Monitoring

Track these indicators during /craft workflows:

| Indicator | Yellow | Red |
|-----------|--------|-----|
| Task transitions | 5 | 8 |
| REJECT ratio | 20% | 40% |
| Time since ACCEPT | 15 min | 30 min |
| Effect type switches | 3 | 5 |

**At Yellow threshold**:
- Log delta sync to taste.md
- Show subtle indicator in analysis box

**At Red threshold**:
- Recommend session clearing
- Format: "⚠ Session drift detected. Consider starting fresh with `/clear`."
- Log to trajectory with drift indicators

**User can override**: "continue" proceeds without clearing
</session_health>
```

**Effort**: Medium (1 sprint task)
**Value**: High - prevents accumulated confusion in long sessions

### R3: Add Session Health to Craft Analysis (Low Effort)

In verbose mode analysis box, add:

```
│  Session:    [X] tasks | [Y] accepts | [Z] min active │
```

**Effort**: Low (code change to craft.md)
**Value**: Medium - user awareness of session state

### R4: Integrate with Beads for Session Boundaries (If Using Beads)

When Beads is available, use task boundaries as natural session checkpoints:
- Task start = fresh context opportunity
- Task complete = sync state
- Task switch = evaluate drift indicators

**Effort**: Medium (integration work)
**Value**: High - aligns with existing workflow

---

## Implementation Priority

1. **Now**: Install agent-browser
2. **This Sprint**: R3 - Session health in analysis box
3. **Next Sprint**: R2 - Full drift detection protocol
4. **Backlog**: R4 - Beads integration

---

## Test Scenarios

### Verify Browser Integration

```bash
# After installation
.claude/scripts/check-agent-browser.sh
# Expected: INSTALLED|<version>

# Test in /craft
/craft "claim button"
# If URL provided later, visual checks should run silently
```

### Verify Drift Detection (After Implementation)

1. Start fresh session
2. Run 6+ different /craft commands with different targets
3. Include 2+ REJECT signals
4. Verify yellow warning appears
5. Continue to red threshold
6. Verify clear recommendation appears

---

## Related Work

- Ralph (`/ride`): Uses trajectory logging for drift detection
- ADK (Google): Evaluation-Driven Development for reasoning quality
- Claude Code prompt: TodoWrite as external state pattern

---

## Appendix: Claude Code Prompt Key Excerpts

**On Task Management**:
> "Use the TodoWrite tool to plan the task if required... Mark each step `in_progress` when starting, `completed` when done. Mark completed IMMEDIATELY — do not batch completions."

**On Tool Usage**:
> "When exploring the codebase to gather context... it is CRITICAL that you use the Task tool with subagent_type=Explore instead of running search commands directly."

**On Context Efficiency**:
> "One read is faster than multiple greps."

These patterns align with Sigil's existing philosophy but could be more explicitly applied to /craft workflows.
