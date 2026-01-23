# Skills & Commands Best Practices Audit

**Date**: 2026-01-22
**Source**: Claude Code official documentation (code.claude.com)
**Scope**: 28 skills, 44 commands

---

## Executive Summary

Analysis of Sigil's skills and commands against Anthropic's official Claude Code best practices reveals several areas for improvement:

1. **Critical**: 5 of 7 analyzed skills missing YAML frontmatter
2. **High**: `implementing-tasks` skill exceeds 500-line limit (593 lines)
3. **High**: `craft.md` command too large (~6500 lines)
4. **Medium**: No `allowed-tools` declarations on most skills
5. **Medium**: Inconsistent argument documentation across commands

---

## Best Practices Reference

### Skill Structure (from code.claude.com/docs/en/skills)

```yaml
---
name: skill-name
description: Brief description for model to decide when to use
disable-model-invocation: false  # Set true for user-only triggers
allowed-tools: [Read, Grep, Glob]  # Security constraint
context: fork  # Optional: isolated execution
agent: true  # Optional: run as subagent
---
```

**Key Guidelines**:
- Keep SKILL.md under 500 lines
- Use YAML frontmatter for auto-invocation control
- Declare `allowed-tools` for security
- Provide clear `description` for model matching

### Command Structure (from code.claude.com/docs/en/slash-commands)

- User-triggered only (not model-triggered)
- Support `$ARGUMENTS` for user input
- Can use dynamic context with `!`command`` syntax
- Should document scope and expected behavior

---

## Skills Analysis

### Summary Table

| Skill | Lines | Frontmatter | allowed-tools | Status |
|-------|-------|-------------|---------------|--------|
| crafting-physics | 157 | ✅ | ✅ | Complete |
| observing-users | 402 | ✅ | ✅ | Complete |
| implementing-tasks | 593 | ✅ | ✅ | 🔴 Exceeds limit |
| validating-physics | 224 | ✅ | ✅ | Complete |
| agent-browser | 289 | ✅ | ✅ | Complete |
| continuous-learning | 303 | ✅ | ✅ | Complete |
| run-mode | 199 | ✅ | ✅ | Complete |

### Detailed Findings

#### 1. crafting-physics (157 lines) ✅
- **Good**: Concise, focused on physics application
- **Fix**: Add YAML frontmatter with description
- **Tools needed**: Read, Write, Edit, Glob, Grep

#### 2. observing-users (402 lines) ⚠️
- **Good**: Comprehensive Mom Test framework
- **Concern**: Approaching line limit
- **Fix**: Add frontmatter, consider splitting diagnostic templates
- **Tools needed**: Read, Write, WebFetch (for on-chain queries)

#### 3. implementing-tasks (593 lines) 🔴
- **Problem**: Exceeds 500-line limit by 18%
- **Fix**: Split into multiple files:
  - `implementing-tasks/SKILL.md` - Core workflow (300 lines)
  - `implementing-tasks/patterns.md` - Code patterns
  - `implementing-tasks/checklist.md` - Pre-flight checklists
- **Tools needed**: Read, Write, Edit, Bash, Glob, Grep

#### 4. validating-physics (224 lines) ✅
- **Good**: Well-structured validation rules
- **Fix**: Add frontmatter
- **Tools needed**: Read, Glob, Grep (read-only validation)

#### 5. agent-browser (289 lines) ⚠️
- **Good**: Has some metadata in file
- **Fix**: Convert to proper YAML frontmatter
- **Tools needed**: WebFetch, Bash (browser automation)

#### 6. continuous-learning (303 lines) ✅
- **Good**: Has metadata, clear purpose
- **Fix**: Convert metadata to YAML frontmatter
- **Tools needed**: Read, Write, Edit, Glob

#### 7. run-mode (199 lines) ✅
- **Good**: Compact, focused
- **Fix**: Add frontmatter
- **Tools needed**: Read, TaskCreate, TaskUpdate

---

## Commands Analysis

### Summary Table

| Command | Size | Structure | Arguments | Status |
|---------|------|-----------|-----------|--------|
| craft | ~6500 | ✅ | ⚠️ Complex | 🔴 Too large |
| implement | Good | ✅ | ⚠️ Underdoc | Needs docs |
| architect | Good | ✅ | ✅ | Good |
| sprint-plan | Good | ✅ | ⚠️ Buffer unclear | Minor fix |
| audit | Good | ⚠️ | ❌ No scope | Needs work |
| validate | Good | ✅ | ✅ | Excellent |
| garden | Good | ✅ | ✅ | Good |

### Detailed Findings

#### 1. craft.md (~6500 lines) 🔴
- **Problem**: Far exceeds reasonable command size
- **Root cause**: Inline examples, full rule references
- **Fix**: Extract to separate files:
  - `craft.md` - Core workflow (~2000 lines)
  - `.claude/rules/craft-examples.md` - Example library
  - Use `!`cat .claude/rules/craft-examples.md`` for dynamic inclusion
- **Impact**: ~40% size reduction

#### 2. implement.md ⚠️
- **Good**: Clear phase structure
- **Issue**: Variable interpolation (`$ARGUMENTS.*`, `$RESOLVED_*`) not documented
- **Fix**: Add "Variables Reference" section

#### 3. architect.md ✅
- **Good**: Follows PRD template well
- **Minor**: Question protocol could be more explicit
- **Status**: No action needed

#### 4. sprint-plan.md ⚠️
- **Good**: Comprehensive planning workflow
- **Issue**: Buffer calculation (15%) mentioned but formula undefined
- **Fix**: Add explicit formula: `buffer_hours = total_hours * 0.15`

#### 5. audit.md ⚠️
- **Issue**: No severity criteria defined
- **Issue**: No `--scope` argument for targeted audits
- **Fix**: Add severity matrix (CRITICAL/HIGH/MEDIUM/LOW) with examples
- **Fix**: Document scope argument pattern

#### 6. validate.md ✅
- **Good**: Clear validation rules
- **Minor**: Report format output undefined (but flexible is OK)
- **Status**: No action needed

#### 7. garden.md ✅
- **Good**: Pattern authority system well-defined
- **Minor**: Stability calculation implicit
- **Status**: No action needed

---

## Recommended Actions

### Priority 1: Critical (Immediate)

| Action | Effort | Impact | Status |
|--------|--------|--------|--------|
| Add frontmatter to 5 skills | 30 min | Enables proper auto-invocation | ✅ DONE |
| Add allowed-tools to all skills | 20 min | Better security model | ✅ DONE |
| Refactor implementing-tasks | 1 hr | Fixes line limit violation | ✅ DONE (593→440 lines) |

### Priority 2: High (This Sprint)

| Action | Effort | Impact | Status |
|--------|--------|--------|--------|
| Extract craft.md examples | 2 hr | 40% context reduction | ✅ DONE (3670→2965 lines, 19%) |
| Add severity criteria to audit.md | 30 min | Clearer audit outputs | ✅ DONE |
| Add --scope argument to audit.md | 15 min | Targeted audits | ✅ DONE |

### Priority 3: Medium (Backlog)

| Action | Effort | Impact |
|--------|--------|--------|
| Document variable interpolation | 1 hr | Better contributor DX |
| Add scope arguments to audit | 30 min | Targeted audits |
| Convert agent-browser metadata | 15 min | Consistency |

---

## Appendix: Frontmatter Templates

### Skill Frontmatter Template

```yaml
---
name: skill-name
description: One-line description for model matching
disable-model-invocation: false
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---
```

### Skills Frontmatter to Add

#### crafting-physics
```yaml
---
name: crafting-physics
description: Apply Sigil design physics to UI components
allowed-tools: [Read, Write, Edit, Glob, Grep]
---
```

#### observing-users
```yaml
---
name: observing-users
description: Diagnose user feedback using Mom Test framework
allowed-tools: [Read, Write, WebFetch, Glob, Grep]
---
```

#### implementing-tasks
```yaml
---
name: implementing-tasks
description: Execute sprint tasks with production-quality code
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep, Task]
---
```

#### validating-physics
```yaml
---
name: validating-physics
description: Validate component compliance with Sigil physics
allowed-tools: [Read, Glob, Grep]
---
```

#### run-mode
```yaml
---
name: run-mode
description: Manage task execution and status tracking
allowed-tools: [Read, TaskCreate, TaskUpdate, TaskList]
---
```

---

## References

- [Claude Code Skills Guide](https://code.claude.com/docs/en/skills)
- [Claude Code Slash Commands](https://code.claude.com/docs/en/slash-commands)
- [Claude Code Best Practices](https://code.claude.com/docs/en/best-practices)
- [Claude Code Memory Management](https://code.claude.com/docs/en/memory)
