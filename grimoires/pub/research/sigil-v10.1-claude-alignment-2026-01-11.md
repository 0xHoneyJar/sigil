# Sigil v10.1 PRD Analysis: Claude Code Alignment

**Date:** 2026-01-11
**Analyst:** Oracle Analysis
**Subject:** Sigil v10.1 "Usage Reality" PRD vs Claude Code Capabilities
**Sources:** PRD, Claude Code Docs, Skills/Commands Inventory

---

## Executive Summary

The Sigil v10.1 PRD proposes wiring 6 TypeScript library modules into 3 skills (Mason, Gardener, Diagnostician). Analysis against Claude Code's current capabilities reveals:

1. **Critical Gap**: Skills can't directly invoke TypeScript functions - they're markdown prompts, not runtime code
2. **Opportunity**: Claude Code's new hooks system could bridge library → skill integration
3. **Alignment**: The "Never Interrupt Flow" principle matches Claude Code's skill hot-reload philosophy
4. **Risk**: PRD assumes skills execute code; reality is skills guide Claude's behavior
5. **Recommendation**: Pivot from "skills invoke library" to "hooks prepare context for skills"

---

## 1. PRD Architecture Analysis

### 1.1 What the PRD Proposes

```
User: /craft "claim button"
       │
       ▼
┌─────────────────────────────────────────────┐
│  Mason Skill (SKILL.md)                      │
│  ┌─────────────────────────────────────────┐ │
│  │ 1. inferIntent() from ast-reader.ts     │ │
│  │ 2. inferPhysicsFromEffect() from physics│ │
│  │ 3. findCanonical() from search.ts       │ │
│  │ 4. analyzeAST() from ast-reader.ts      │ │
│  │ 5. [Generate code]                      │ │
│  │ 6. validateGeneration() from physics    │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 1.2 What Claude Code Skills Actually Are

From [Claude Code Docs](https://code.claude.com/docs/en/slash-commands):

> "Skills are markdown-based guides that teach Claude Code how to handle specific tasks. Unlike slash commands, skills are invoked via natural language, so Claude decides when to use them."

**Key Insight**: Skills are **prompts**, not **code executors**.

```
.claude/skills/mason/
├── SKILL.md      ← Markdown instructions for Claude
└── index.yaml    ← Metadata (triggers, context)
```

A skill **cannot** do:
```typescript
// This is NOT possible in a skill
import { inferIntent } from '@/lib/sigil/ast-reader';
const intent = await inferIntent({ target: userRequest });
```

A skill **can** do:
```markdown
## Workflow
When generating components, follow these steps:
1. Infer the intent from the user's request
2. Determine physics based on effect type...
```

### 1.3 The Gap

| PRD Assumption | Claude Code Reality |
|----------------|---------------------|
| Skills invoke TypeScript functions | Skills are markdown prompts |
| Library modules are "called" | Library modules can be "read" by Claude |
| Workflow is runtime execution | Workflow is prompt-guided behavior |
| `inferIntent()` runs as code | Claude reads the function and applies its logic |

---

## 2. Claude Code Capabilities Inventory

### 2.1 What Claude Code Offers (2026)

| Feature | Description | Sigil Relevance |
|---------|-------------|-----------------|
| **Skills** | Markdown guides for task handling | ✅ Mason, Gardener, Diagnostician use this |
| **Slash Commands** | User-invoked prompts | ✅ /craft, /garden use this |
| **Hooks** | Scripts that run at lifecycle points | 🔥 **NEW opportunity** |
| **MCP Tools** | External tool integrations | ⚠️ PRD explicitly rejected this |
| **Skill Hot-Reload** | Skills update without restart | ✅ Aligns with iteration speed |
| **Context Fork** | Skills can run in sub-agent | 🔥 Could isolate heavy processing |
| **Agent Field** | Specify agent type for skill | 🔥 Could use specialized agents |

### 2.2 Hooks: The Missing Bridge

From [Hooks Reference](https://code.claude.com/docs/en/hooks):

> "Hooks are a powerful API for Claude Code that allows users to activate commands and run scripts at different points in Claude's agentic lifecycle."

**Hook Types:**
- `PreToolUse` - Before a tool executes
- `PostToolUse` - After a tool executes
- `SessionStart` - When session begins
- `Notification` - For displaying messages

**This is exactly what the PRD needs!**

```yaml
# .claude/hooks/sigil-context.yaml
hooks:
  - event: SessionStart
    script: .claude/scripts/sigil-context-loader.sh
    # Loads constitution.yaml, authority.yaml into context

  - event: PreToolUse
    match: "Edit|Write"
    script: .claude/scripts/sigil-physics-check.sh
    # Validates physics before code generation
```

---

## 3. Recommended Architecture Pivot

### 3.1 Current PRD Approach (Problematic)

```
Skill SKILL.md → tries to "call" → TypeScript library
       ❌ Not possible - skills are prompts
```

### 3.2 Recommended Approach (Hooks + Skills)

```
┌─────────────────────────────────────────────────────────────┐
│ SessionStart Hook                                            │
│ .claude/scripts/sigil-context-loader.sh                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 1. Read constitution.yaml → inject as system context    │ │
│ │ 2. Read authority.yaml → inject tier thresholds         │ │
│ │ 3. Build component index → cache to .context/           │ │
│ │ 4. Set systemMessage with physics rules                 │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ User: /craft "claim button"                                  │
│                           │                                  │
│                           ▼                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Mason Skill (SKILL.md)                                  │ │
│ │ - Has access to physics rules via hook-injected context │ │
│ │ - Reads src/lib/sigil/physics.ts for effect mappings    │ │
│ │ - Reads canonical components from index                 │ │
│ │ - Generates code following physics constraints          │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ PreToolUse Hook (on Edit/Write)                             │
│ .claude/scripts/sigil-validate.sh                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ - Parse generated code for physics compliance           │ │
│ │ - Check timing values match effect type                 │ │
│ │ - Validate confirmation flow for financial mutations    │ │
│ │ - Return warning if non-compliant                       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Implementation Mapping

| PRD Requirement | Original Approach | Recommended Approach |
|-----------------|-------------------|---------------------|
| `inferIntent()` | Skill calls function | Skill reads ast-reader.ts, applies logic |
| `inferPhysicsFromEffect()` | Skill calls function | Hook injects physics rules, skill follows |
| `findCanonical()` | Skill calls function | Hook builds index, skill queries it |
| `validateGeneration()` | Skill calls function | PostToolUse hook validates output |
| Context accumulation | Skill calls context.ts | Hook logs to .context/ on session end |

---

## 4. Skills/Commands Audit

### 4.1 Current Inventory

**Sigil Skills (3):**
| Skill | Trigger | Gap |
|-------|---------|-----|
| mason | /craft, "create" | Doesn't read library modules |
| gardener | /garden | Doesn't compute authority from imports |
| diagnostician | "broken", "error" | Doesn't match symptom patterns |

**Sigil Commands (2):**
| Command | Purpose | Gap |
|---------|---------|-----|
| /craft | Generate UI | Doesn't enforce physics |
| /garden | Check patterns | Doesn't count imports |

**Loa Skills (11):** auditing-security, deploying-infrastructure, designing-architecture, discovering-requirements, implementing-tasks, mounting-framework, planning-sprints, reviewing-code, riding-codebase, translating-for-executives, updating-framework

**Loa Commands (20+):** /plan-and-analyze, /architect, /sprint-plan, /implement, /review-sprint, /audit-sprint, /audit, /deploy-production, /mount, /ride, /translate, /contribute, /update, /feedback, /mcp-config, /oracle, /oracle-analyze, /setup

### 4.2 Skill Enhancement Opportunities

**Mason Skill Enhancement:**
```markdown
## Context Awareness (ADD)

Before generating, I read these files to understand physics:
- `grimoires/sigil/constitution.yaml` - Effect → physics mapping
- `grimoires/sigil/authority.yaml` - Tier thresholds
- `src/lib/sigil/physics.ts` - EFFECT_PHYSICS constant

## Physics Decision Tree (ADD)

1. Is this a mutation? (POST, PUT, DELETE, useMutation)
   - Yes → Check if financial
     - Financial keywords: claim, deposit, withdraw, transfer, swap
     - Financial → pessimistic sync, 800ms, confirmation required
     - Non-financial → optimistic sync, 150ms
   - No → Query or display
     - Query → optimistic sync, 150ms
     - Display → immediate, 0ms
```

**Gardener Skill Enhancement:**
```markdown
## Authority Computation (ADD)

To determine a component's authority tier:

1. Count imports using grep:
   ```bash
   grep -r "from.*ComponentName" src/ --include="*.tsx" | wc -l
   ```

2. Check stability (days since last modification):
   ```bash
   git log -1 --format="%cr" -- path/to/component.tsx
   ```

3. Apply thresholds from authority.yaml:
   - Gold: 10+ imports AND 14+ days stable
   - Silver: 5+ imports
   - Draft: Everything else
```

---

## 5. Gap Analysis: Anthropic Features vs Sigil

### 5.1 Features Sigil Should Adopt

| Anthropic Feature | Sigil Status | Recommendation |
|-------------------|--------------|----------------|
| **Hooks** | Not used | Add SessionStart + PreToolUse hooks |
| **Skill hot-reload** | Passive | Leverage for rapid iteration |
| **Context fork** | Not used | Consider for heavy AST analysis |
| **MCP tools** | Rejected in PRD | Reconsider for physics validation |
| **Agent field** | Not used | Use Explore agent for canonical search |

### 5.2 What Sigil Has That Anthropic Lacks

| Sigil Unique | Value |
|--------------|-------|
| Effect-based physics | Codified timing/sync rules |
| Usage-based authority | Computed tier system |
| Constitution.yaml | Declarative physics config |
| Invisible context | Learning without questions |
| Diagnostician patterns | 9-category symptom matching |

---

## 6. Recommended Actions

### Priority 1: Add Hooks (Effort: Medium, Value: High)

Create hooks to bridge library → skill gap:

```bash
# .claude/hooks.yaml (or settings.json)
hooks:
  - event: SessionStart
    script: .claude/scripts/sigil-init.sh

  - event: PreToolUse
    match: "Edit|Write"
    script: .claude/scripts/validate-physics.sh
```

**sigil-init.sh:**
```bash
#!/bin/bash
# Load physics rules into context
cat grimoires/sigil/constitution.yaml
echo "---"
cat grimoires/sigil/authority.yaml
```

### Priority 2: Enhance Skill Prompts (Effort: Low, Value: High)

Update SKILL.md files to explicitly read library modules:

```markdown
## Required Reading

Before generating, I MUST read:
1. `src/lib/sigil/physics.ts` - lines 1-50 (EFFECT_PHYSICS)
2. `grimoires/sigil/constitution.yaml` - full file
```

### Priority 3: Add Bash Helpers (Effort: Low, Value: Medium)

Create scripts that skills can reference:

```bash
# .claude/scripts/count-imports.sh
#!/bin/bash
component="$1"
grep -r "from.*${component}" src/ --include="*.tsx" | wc -l

# .claude/scripts/check-stability.sh
#!/bin/bash
file="$1"
git log -1 --format="%cr" -- "$file"
```

### Priority 4: Consider MCP for Validation (Effort: High, Value: Medium)

The v10.1 package has MCP tools ready. While PRD rejected this, reconsider:

```
Pros:
- True code execution for physics validation
- Claude can call validateGeneration() as a tool
- Matches Anthropic's recommended architecture

Cons:
- Additional infrastructure (MCP server)
- Complexity vs prompt-based approach
```

---

## 7. Revised Sprint Plan

### Sprint 1: Hooks + Skill Enhancement (Was: Mason Pipeline)

1. ~~Update Mason SKILL.md with library invocations~~ **Revise**: Add "Required Reading" section
2. Create `.claude/hooks.yaml` with SessionStart hook
3. Create `sigil-init.sh` to inject physics context
4. Update Mason to read constitution.yaml before generating
5. Test: `/craft "claim button"` → verify physics in output

### Sprint 2: Validation Hooks (Was: Gardener + Diagnostician)

6. Create PreToolUse hook for physics validation
7. Create `validate-physics.sh` script
8. Update Gardener to run import counts via bash
9. Update Diagnostician to read diagnostician.ts patterns
10. Test: Validation warnings appear on physics violations

### Sprint 3: Context + Iteration (Was: Context + Polish)

11. Create SessionEnd hook for context logging
12. Build simple JSON context accumulator
13. Test full flow: /craft → /garden → error diagnosis

---

## 8. Conclusion

The Sigil v10.1 PRD has the right vision but the wrong mechanism. Skills cannot directly invoke TypeScript functions. The path forward:

1. **Use hooks** to prepare context and validate output
2. **Enhance skills** to read (not call) library modules
3. **Add bash scripts** for computed values (import counts, stability)
4. **Consider MCP** if hooks prove insufficient

The library modules are complete and valuable. The architecture just needs to match how Claude Code actually works.

---

*Analysis Generated: 2026-01-11*
*Framework: Loa v0.13.0 with Sigil v10.1*
*Key Insight: Skills are prompts, not runtime. Hooks are the bridge.*
