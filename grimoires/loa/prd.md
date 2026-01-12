# Product Requirements Document: Sigil v10.1 "Usage Reality"

**Version:** 10.1.0
**Codename:** Usage Reality
**Status:** PRD Complete
**Date:** 2026-01-11
**Supersedes:** v9.1.0 "Migration Debt Zero" (completed)
**Sources:** sigil-v10.1-package.zip, CLAUDE.md, existing src/lib/sigil/

---

## 1. Executive Summary

Sigil v10.1 "Usage Reality" completes the v10 vision with three core principles:

1. **Usage is Authority** — Components earn Gold status through import counts, not directories
2. **Effect is Physics** — The verb (mutation/query/local) determines timing, not the noun
3. **Never Interrupt Flow** — Infer, don't ask; generate, don't configure

**Current State:**
- v9.1 migration complete: `sigil-mark/` deleted, grimoire structure established
- Core library exists: `src/lib/sigil/` with 6 modules (~110K bytes)
- Skills exist: Mason, Gardener, Diagnostician in `.claude/skills/`
- Configuration exists: `grimoires/sigil/constitution.yaml`, `authority.yaml`
- Runtime hook exists: `src/hooks/useMotion.ts`

**The Gap:**
The v10.1 concepts are documented in CLAUDE.md but the skills don't fully implement them. The skills reference library functions that exist but aren't wired into the `/craft` and `/garden` workflows.

**The Solution:**
Use Claude Code's **hooks system** to bridge the library-skill gap:
- **SessionStart hook** injects physics rules into context
- **PreToolUse hook** validates generated code before writing
- **Skills read** library modules for patterns (not call them)
- **Bash scripts** compute runtime values (import counts, stability)

This enables:
- AST-based intent inference (skill reads ast-reader.ts patterns)
- Usage-based authority computation (bash script counts imports)
- Effect-based physics selection (hook injects constitution.yaml)
- Semantic pattern search (skill queries indexed components)
- Pattern debugging without questions (skill reads diagnostician.ts)

---

## 2. Problem Statement

### 2.1 Skills Can't Call Library Functions

**Critical Insight from Oracle Analysis:** Claude Code skills are **markdown prompts**, not code executors.

```markdown
# What skills CAN do:
- Guide Claude's behavior with instructions
- Reference files for Claude to read
- Trigger bash scripts via hooks

# What skills CANNOT do:
import { inferIntent } from '@/lib/sigil/ast-reader';  // NOT POSSIBLE
const intent = await inferIntent({ target: userRequest });
```

The Mason skill documents a workflow that assumes runtime function calls. But skills are prompts that Claude follows—they don't execute TypeScript.

**The Bridge: Hooks**

Claude Code's hooks system allows scripts to run at lifecycle points:
- `SessionStart` - Initialize context before conversation
- `PreToolUse` - Validate before tool execution
- `PostToolUse` - Process after tool execution

### 2.2 Library Modules Not Integrated

| Module | Lines | Status | Gap |
|--------|-------|--------|-----|
| `context.ts` | 15,462 | ✅ Implemented | Not called by skills |
| `survival.ts` | 16,702 | ✅ Implemented | Not called by /garden |
| `physics.ts` | 12,555 | ✅ Implemented | Not called by Mason |
| `ast-reader.ts` | 17,296 | ✅ Implemented | Not called by Mason |
| `diagnostician.ts` | 27,084 | ✅ Implemented | Not called on errors |
| `search.ts` | 17,890 | ✅ Implemented | Not called for canonicals |

### 2.3 v10.1 Package Provides Reference

The `sigil-v10.1-package.zip` provides a reference implementation with:
- 6 MCP tools that implement the exact workflow
- Clear input/output contracts
- Tool composition examples

While we're keeping the skill-based approach, the tool implementations provide the **logic** that skills should invoke.

---

## 3. Goals

### 3.1 Primary Goal

**Mason skill generates code using the full v10.1 pipeline:**

```
User: /craft "claim button for rewards pool"

Mason internally:
1. inferIntent("claim button for rewards pool")
   → { mutation: true, financial: true, interactive: true }

2. inferPhysicsFromEffect({ mutation: true, financial: true })
   → { sync: 'pessimistic', timing: 800, confirmation: true }

3. findCanonical("claim button financial")
   → [{ file: "TransferButton.tsx", authority: "gold" }]

4. analyzeAST("TransferButton.tsx")
   → { patterns: { hooks: [...], animations: [...] } }

5. [Generate code using patterns + physics]

6. validateGeneration(code, physics)
   → { valid: true }
```

### 3.2 Secondary Goals

1. **Gardener skill computes authority** — Run `inferAuthority()` from survival.ts
2. **Diagnostician activates on errors** — Call `matchSymptoms()` from diagnostician.ts
3. **Context accumulates invisibly** — Call `processLearningSignal()` from context.ts
4. **No questions policy enforced** — Skills infer, never ask

### 3.3 Non-Goals

1. **MCP tools** — We're enhancing skills, not creating tools
2. **New library modules** — The 6 modules are complete
3. **UI changes** — This is agent-time workflow only
4. **Runtime layer** — useMotion.ts and physics already work

---

## 4. Requirements

### 4.1 P0: Hooks Infrastructure

**Create Claude Code hooks to bridge library → skill gap:**

1. **Create `.claude/settings.local.json` with hooks:**
```json
{
  "hooks": {
    "SessionStart": [".claude/scripts/sigil-init.sh"],
    "PreToolUse": {
      "Edit": [".claude/scripts/validate-physics.sh"],
      "Write": [".claude/scripts/validate-physics.sh"]
    }
  }
}
```

2. **Create `sigil-init.sh` (SessionStart hook):**
```bash
#!/bin/bash
# Inject physics rules into Claude's context
echo "=== SIGIL PHYSICS CONTEXT ==="
cat grimoires/sigil/constitution.yaml
echo "---"
cat grimoires/sigil/authority.yaml
```

3. **Create `validate-physics.sh` (PreToolUse hook):**
```bash
#!/bin/bash
# Validate generated code matches physics constraints
# Returns warning if timing/sync mismatches detected
```

**Acceptance Criteria:**
- [ ] SessionStart hook runs on conversation start
- [ ] Physics rules visible in Claude's context
- [ ] PreToolUse hook validates Edit/Write operations

---

### 4.2 P0: Mason Skill Enhancement

**Update `.claude/skills/mason/SKILL.md` to READ library modules:**

Add "Required Reading" section:
```markdown
## Required Reading

Before generating ANY component, I MUST read these files:

1. `grimoires/sigil/constitution.yaml` - Effect → physics mapping
2. `grimoires/sigil/authority.yaml` - Tier thresholds
3. `src/lib/sigil/physics.ts` (lines 1-100) - EFFECT_PHYSICS constant

## Physics Decision Tree

1. Is this a mutation? (POST, PUT, DELETE, useMutation)
   - Yes → Check if financial
     - Financial keywords: claim, deposit, withdraw, transfer, swap
     - Financial → pessimistic sync, 800ms, confirmation required
     - Non-financial → optimistic sync, 150ms
   - No → Query or display
     - Query → optimistic sync, 150ms
     - Display → immediate, 0ms
```

**Acceptance Criteria:**
- [ ] Mason reads constitution.yaml before generating
- [ ] Mason never asks "What physics do you prefer?"
- [ ] Mason never asks "What zone should this be in?"
- [ ] Generated code includes correct physics values
- [ ] Financial mutations get pessimistic sync + confirmation

---

### 4.3 P0: Gardener Skill Enhancement

**Update `.claude/skills/gardener/SKILL.md` to use bash scripts:**

1. **Create `count-imports.sh` helper:**
```bash
#!/bin/bash
# Count imports of a component
component="$1"
grep -r "from.*${component}" src/ --include="*.tsx" --include="*.ts" | wc -l
```

2. **Create `check-stability.sh` helper:**
```bash
#!/bin/bash
# Days since last modification
file="$1"
last_mod=$(git log -1 --format="%ct" -- "$file")
now=$(date +%s)
days=$(( (now - last_mod) / 86400 ))
echo "$days"
```

3. **Add to Gardener SKILL.md:**
```markdown
## Authority Computation

To determine a component's authority tier:

1. Count imports: `bash .claude/scripts/count-imports.sh ComponentName`
2. Check stability: `bash .claude/scripts/check-stability.sh path/to/file.tsx`
3. Apply thresholds from grimoires/sigil/authority.yaml:
   - Gold: 10+ imports AND 14+ days stable
   - Silver: 5+ imports
   - Draft: Everything else
```

**Acceptance Criteria:**
- [ ] /garden reports accurate import counts
- [ ] /garden shows authority tier (gold/silver/draft)
- [ ] /garden identifies promotion-eligible components
- [ ] No file moves required for authority changes

---

### 4.4 P0: Diagnostician Skill Enhancement

**Update `.claude/skills/diagnostician/SKILL.md` to READ pattern library:**

Add "Required Reading" section:
```markdown
## Required Reading

When a user reports an error, I MUST read:
1. `src/lib/sigil/diagnostician.ts` - PATTERNS constant (9 categories)

## Pattern Matching Process

1. Extract keywords from error description
2. Match against PATTERNS categories:
   - hydration: useMediaQuery, Date in render, SSR mismatch
   - dialog: positioning, scroll, z-index, portal
   - performance: re-render, layout thrash, memo
   - layout: CLS, image dimensions, shift
   - server-component: 'use client', hooks in RSC
   - react-19: forwardRef deprecated
   - state: stale closure, infinite loop
   - async: race condition, unmounted update
   - animation: AnimatePresence, exit animation

3. Return solutions ranked by keyword match count

## Never Ask

NEVER ASK:
- "Can you check the console?"
- "What browser are you using?"
- "Can you reproduce the error?"

INSTEAD: Match patterns and provide solutions directly.
```

**Acceptance Criteria:**
- [ ] Diagnostician reads diagnostician.ts patterns
- [ ] Diagnostician matches symptoms without questions
- [ ] Diagnostician provides solutions ranked by confidence
- [ ] Covers 9 pattern categories

---

### 4.4 P1: Context Accumulation

**Wire context.ts into skill workflows:**

1. **After generation (Mason)**:
```typescript
import { processLearningSignal } from '@/lib/sigil/context';
await processLearningSignal({
  type: 'generation',
  component: generatedComponent,
  physics: appliedPhysics,
  intent: inferredIntent
});
```

2. **After user feedback**:
```typescript
await processLearningSignal({
  type: 'feedback',
  action: 'accept' | 'modify' | 'reject',
  component: componentPath
});
```

**Acceptance Criteria:**
- [ ] Learning signals recorded to grimoires/sigil/.context/
- [ ] Context influences future generations
- [ ] No explicit configuration required

---

### 4.5 P1: Constitution Alignment

**Ensure constitution.yaml matches library physics:**

Current `grimoires/sigil/constitution.yaml`:
```yaml
effect_physics:
  mutation:
    sync: pessimistic
    timing: 800
```

Library `src/lib/sigil/physics.ts`:
```typescript
export const EFFECT_PHYSICS = {
  mutation: { sync: 'pessimistic', timing: 800 },
  ...
};
```

**Verify alignment:**
- [ ] All effect types in constitution.yaml match physics.ts
- [ ] All protected capabilities match
- [ ] All physics presets match useMotion.ts

---

### 4.6 P2: Search Index Initialization

**Enable semantic search:**

```bash
# Build search index
npx sigil index-components src/components/

# Outputs to grimoires/sigil/index/
```

**Acceptance Criteria:**
- [ ] search.ts can find canonical patterns
- [ ] Index regenerates on component changes
- [ ] Index is gitignored (build artifact)

---

## 5. Implementation Sprints

### Sprint 1: Hooks Infrastructure (P0)

1. Create `.claude/settings.local.json` with hooks config
2. Create `sigil-init.sh` SessionStart hook
3. Create `validate-physics.sh` PreToolUse hook
4. Update Mason SKILL.md with "Required Reading" section
5. Test: `/craft "claim button"` generates code with 800ms pessimistic physics

**Exit Criteria:** Hooks run, physics rules injected, Mason reads constitution.yaml

### Sprint 2: Skill Enhancements + Helpers (P0)

6. Create `count-imports.sh` bash helper
7. Create `check-stability.sh` bash helper
8. Update Gardener SKILL.md with authority computation workflow
9. Update Diagnostician SKILL.md with pattern reading workflow
10. Test: `/garden` shows accurate authority, errors trigger pattern matching

**Exit Criteria:** All 3 skills enhanced, bash helpers working

### Sprint 3: Context + Validation (P1-P2)

11. Create SessionEnd hook for context logging
12. Build JSON context accumulator in `.context/`
13. Enhance PreToolUse validation with physics checking
14. Verify end-to-end /craft → /garden → Diagnostician flow

**Exit Criteria:** Full v10.1 pipeline operational with hooks

---

## 6. File Changes Summary

### Files to Create

| File | Purpose |
|------|---------|
| `.claude/settings.local.json` | Hooks configuration |
| `.claude/scripts/sigil-init.sh` | SessionStart hook - inject physics |
| `.claude/scripts/validate-physics.sh` | PreToolUse hook - validate code |
| `.claude/scripts/count-imports.sh` | Helper - count component imports |
| `.claude/scripts/check-stability.sh` | Helper - check file stability |

### Files to Update

| File | Changes |
|------|---------|
| `.claude/skills/mason/SKILL.md` | Add "Required Reading" + physics decision tree |
| `.claude/skills/gardener/SKILL.md` | Add authority computation workflow |
| `.claude/skills/diagnostician/SKILL.md` | Add pattern reading workflow |

### Files Already Complete

| File | Status |
|------|--------|
| `src/lib/sigil/context.ts` | ✅ Implemented |
| `src/lib/sigil/survival.ts` | ✅ Implemented |
| `src/lib/sigil/physics.ts` | ✅ Implemented |
| `src/lib/sigil/ast-reader.ts` | ✅ Implemented |
| `src/lib/sigil/diagnostician.ts` | ✅ Implemented |
| `src/lib/sigil/search.ts` | ✅ Implemented |
| `src/hooks/useMotion.ts` | ✅ Implemented |
| `grimoires/sigil/constitution.yaml` | ✅ Complete |
| `grimoires/sigil/authority.yaml` | ✅ Complete |
| `CLAUDE.md` | ✅ Documents v10.1 |

---

## 7. Validation

### 7.1 Manual Test Cases

**Test 1: Financial Mutation**
```
/craft "claim button for rewards"
```
Expected:
- Physics: pessimistic, 800ms
- Confirmation flow included
- useMotion('deliberate') in output

**Test 2: Query Component**
```
/craft "user balance display"
```
Expected:
- Physics: optimistic, 150ms
- No confirmation needed
- useMotion('snappy') in output

**Test 3: Authority Check**
```
/garden src/components/Button.tsx
```
Expected:
- Import count displayed
- Stability days displayed
- Authority tier (gold/silver/draft)

**Test 4: Error Diagnosis**
```
User: "The dialog is glitching when I scroll"
```
Expected:
- Diagnostician activates (no manual trigger)
- Matches "dialog" + "scroll" symptoms
- Provides solutions without asking browser info

### 7.2 Automated Validation

```bash
#!/bin/bash
# validate-v10.1.sh

echo "=== SIGIL v10.1 VALIDATION ==="

echo ""
echo "1. Checking library modules..."
for module in context survival physics ast-reader diagnostician search; do
  if [ -f "src/lib/sigil/${module}.ts" ]; then
    echo "  ✓ ${module}.ts exists"
  else
    echo "  ❌ MISSING: ${module}.ts"
  fi
done

echo ""
echo "2. Checking skill files..."
for skill in mason gardener diagnostician; do
  if [ -f ".claude/skills/${skill}/SKILL.md" ]; then
    echo "  ✓ ${skill}/SKILL.md exists"
  else
    echo "  ❌ MISSING: ${skill}/SKILL.md"
  fi
done

echo ""
echo "3. Checking constitution alignment..."
if grep -q "mutation:" grimoires/sigil/constitution.yaml; then
  echo "  ✓ constitution.yaml has effect_physics"
else
  echo "  ❌ Missing effect_physics in constitution.yaml"
fi

echo ""
echo "4. Checking useMotion hook..."
if [ -f "src/hooks/useMotion.ts" ]; then
  echo "  ✓ useMotion.ts exists"
else
  echo "  ❌ MISSING: useMotion.ts"
fi

echo ""
echo "=== VALIDATION COMPLETE ==="
```

---

## 8. Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Mason asks configuration questions | Yes | No |
| Gardener computes authority | No | Yes |
| Diagnostician matches patterns | No | Yes |
| Context accumulates | No | Yes |
| /craft uses correct physics | Partial | Full |

---

## 9. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Library modules have bugs | /craft fails | Test each module in isolation first |
| Skills don't invoke library | No improvement | Verify invocations in skill output |
| Physics values inconsistent | Wrong timings | Align constitution.yaml with physics.ts |
| Search index empty | No canonicals found | Seed with initial components |

---

## 10. Out of Scope

1. **MCP tools** — Using enhanced skills approach instead
2. **Runtime layer expansion** — useMotion.ts already works
3. **New library modules** — All 6 modules complete
4. **Component generation** — Focus is on skill integration
5. **UI/visual changes** — Agent-time only

---

## 11. Dependencies

### Internal Dependencies

| Dependency | Status | Required For |
|------------|--------|--------------|
| `src/lib/sigil/` | ✅ Complete | All skills |
| `src/hooks/useMotion.ts` | ✅ Complete | Generated code |
| `grimoires/sigil/constitution.yaml` | ✅ Complete | Physics config |
| `grimoires/sigil/authority.yaml` | ✅ Complete | Tier thresholds |

### External Dependencies

None — all dependencies are internal.

---

## 12. The Promise

After v10.1:

```
/craft "claim button for rewards"

# Mason internally:
# 1. inferIntent() → { mutation: true, financial: true }
# 2. inferPhysicsFromEffect() → { sync: 'pessimistic', timing: 800 }
# 3. findCanonical() → TransferButton.tsx (gold)
# 4. analyzeAST() → { patterns: [...] }
# 5. Generate with physics
# 6. validateGeneration() → valid

# Output: Code with correct physics, no questions asked
```

**The Three Laws in Action:**
1. Authority from usage (findCanonical → gold tier)
2. Physics from effect (financial mutation → pessimistic)
3. Never interrupt flow (infer, don't ask)

---

*PRD Generated: 2026-01-11*
*Sources: sigil-v10.1-package.zip, CLAUDE.md, src/lib/sigil/*
*Key Insight: The library is complete. Skills need to call it.*
