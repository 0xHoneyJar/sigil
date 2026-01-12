# Software Design Document: Sigil v10.1 "Usage Reality"

**Version:** 10.1.0
**Status:** SDD Complete
**Date:** 2026-01-11
**PRD Reference:** grimoires/loa/prd.md
**Architecture:** Hooks-Based Skill Enhancement

---

## 1. Executive Summary

This SDD describes the technical architecture for Sigil v10.1, which bridges the gap between the existing TypeScript library (`src/lib/sigil/`) and Claude Code skills using the **hooks system**.

**Key Architectural Decisions:**
1. **Hooks as Bridge** — SessionStart and PreToolUse hooks inject context and validate output
2. **Skills as Readers** — Skills read library modules for patterns, not execute them
3. **Bash as Runtime** — Shell scripts compute values (import counts, stability days)
4. **JSON Context** — Accumulated context stored in `.context/` directory

**Components:**
- 2 hooks (SessionStart, PreToolUse)
- 3 enhanced skills (Mason, Gardener, Diagnostician)
- 4 bash helper scripts
- 1 context accumulator

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLAUDE CODE SESSION                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────┐     ┌─────────────────────────────────────────┐   │
│  │   SessionStart      │     │  SKILLS LAYER                           │   │
│  │   Hook              │────▶│  ┌───────────┐ ┌───────────┐ ┌────────┐ │   │
│  │   sigil-init.sh     │     │  │  Mason    │ │ Gardener  │ │ Diag.  │ │   │
│  │   - Inject physics  │     │  │  /craft   │ │ /garden   │ │ errors │ │   │
│  │   - Inject authority│     │  └───────────┘ └───────────┘ └────────┘ │   │
│  └─────────────────────┘     └─────────────────────────────────────────┘   │
│                                              │                              │
│                                              ▼                              │
│  ┌─────────────────────┐     ┌─────────────────────────────────────────┐   │
│  │   PreToolUse        │     │  LIBRARY LAYER (Read-Only)              │   │
│  │   Hook              │◀───│  ┌───────────────────────────────────┐   │   │
│  │   validate-physics  │     │  │ src/lib/sigil/                    │   │   │
│  │   - Check timing    │     │  │ - physics.ts    - context.ts     │   │   │
│  │   - Check sync      │     │  │ - survival.ts   - ast-reader.ts  │   │   │
│  │   - Warn on error   │     │  │ - search.ts     - diagnostician.ts│  │   │
│  └─────────────────────┘     │  └───────────────────────────────────┘   │   │
│                              └─────────────────────────────────────────┘   │
│                                              │                              │
│                                              ▼                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  BASH HELPERS                                                        │   │
│  │  ┌────────────────┐  ┌─────────────────┐  ┌───────────────────────┐ │   │
│  │  │ count-imports  │  │ check-stability │  │ validate-physics.sh  │ │   │
│  │  │ .sh            │  │ .sh             │  │ (PreToolUse)         │ │   │
│  │  └────────────────┘  └─────────────────┘  └───────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                              │                              │
│                                              ▼                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  CONFIGURATION LAYER                                                 │   │
│  │  ┌─────────────────────────┐  ┌────────────────────────────────────┐ │   │
│  │  │ grimoires/sigil/        │  │ .claude/settings.local.json       │ │   │
│  │  │ - constitution.yaml     │  │ - hooks configuration             │ │   │
│  │  │ - authority.yaml        │  │                                    │ │   │
│  │  │ - .context/             │  │                                    │ │   │
│  │  └─────────────────────────┘  └────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 1. SESSION START                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ sigil-init.sh executes                                                    │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ Output to Claude's context:                                          │ │
│ │ === SIGIL PHYSICS CONTEXT ===                                        │ │
│ │ version: "10.1"                                                      │ │
│ │ effect_physics:                                                      │ │
│ │   mutation: { sync: pessimistic, timing: 800 }                       │ │
│ │   query: { sync: optimistic, timing: 150 }                           │ │
│ │   ...                                                                │ │
│ │ ---                                                                  │ │
│ │ gold: { min_imports: 10, min_stability_days: 14 }                    │ │
│ │ silver: { min_imports: 5 }                                           │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ 2. USER INVOKES /craft "claim button"                                     │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ Mason Skill Activates                                                     │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ 1. Read grimoires/sigil/constitution.yaml                            │ │
│ │ 2. Parse "claim button" → { mutation: true, financial: true }        │ │
│ │ 3. Apply physics decision tree → pessimistic, 800ms                  │ │
│ │ 4. Search for canonical patterns in src/components/                  │ │
│ │ 5. Generate component with useMotion('deliberate')                   │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ 3. CLAUDE ATTEMPTS Edit/Write TOOL                                        │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ PreToolUse Hook: validate-physics.sh                                      │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ Input: Tool name, file path, content                                 │ │
│ │ Process:                                                             │ │
│ │   - Check for useMotion() calls                                      │ │
│ │   - Verify timing matches effect type                                │ │
│ │   - Check confirmation flow for financial mutations                  │ │
│ │ Output:                                                              │ │
│ │   - Pass: Allow tool execution                                       │ │
│ │   - Warn: Show warning, allow execution                              │ │
│ │   - Block: Prevent execution (future)                                │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ 4. FILE WRITTEN, CONTEXT UPDATED                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Design

### 3.1 Hooks Configuration

**File:** `.claude/settings.local.json`

```json
{
  "hooks": {
    "SessionStart": [
      {
        "script": ".claude/scripts/sigil-init.sh",
        "timeout": 5000,
        "description": "Inject Sigil physics context"
      }
    ],
    "PreToolUse": {
      "Edit": [
        {
          "script": ".claude/scripts/validate-physics.sh",
          "timeout": 3000,
          "description": "Validate physics compliance"
        }
      ],
      "Write": [
        {
          "script": ".claude/scripts/validate-physics.sh",
          "timeout": 3000,
          "description": "Validate physics compliance"
        }
      ]
    }
  }
}
```

**Design Rationale:**
- `SessionStart` runs once at conversation start
- `PreToolUse` runs before every Edit/Write operation
- Timeout prevents hung scripts from blocking Claude
- Separate hooks for separation of concerns

### 3.2 SessionStart Hook: sigil-init.sh

**File:** `.claude/scripts/sigil-init.sh`

```bash
#!/opt/homebrew/bin/bash
# Sigil v10.1 - Session Initialization Hook
# Injects physics rules and authority thresholds into Claude's context

set -euo pipefail

SIGIL_DIR="grimoires/sigil"
CONSTITUTION="$SIGIL_DIR/constitution.yaml"
AUTHORITY="$SIGIL_DIR/authority.yaml"

echo "=== SIGIL v10.1 PHYSICS CONTEXT ==="
echo ""

# Inject constitution (effect physics)
if [[ -f "$CONSTITUTION" ]]; then
  echo "## Effect Physics (from constitution.yaml)"
  echo ""
  cat "$CONSTITUTION"
  echo ""
else
  echo "WARNING: constitution.yaml not found at $CONSTITUTION"
fi

echo "---"
echo ""

# Inject authority thresholds
if [[ -f "$AUTHORITY" ]]; then
  echo "## Authority Thresholds (from authority.yaml)"
  echo ""
  cat "$AUTHORITY"
  echo ""
else
  echo "WARNING: authority.yaml not found at $AUTHORITY"
fi

echo "---"
echo ""

# Inject active context if exists
CONTEXT_DIR="$SIGIL_DIR/.context"
if [[ -d "$CONTEXT_DIR" ]]; then
  echo "## Accumulated Context"
  echo ""

  # Taste preferences
  if [[ -f "$CONTEXT_DIR/taste.json" ]]; then
    echo "### Taste Preferences"
    cat "$CONTEXT_DIR/taste.json"
    echo ""
  fi

  # Recent generations
  if [[ -f "$CONTEXT_DIR/recent.json" ]]; then
    echo "### Recent Generations"
    cat "$CONTEXT_DIR/recent.json"
    echo ""
  fi
fi

echo "=== END SIGIL CONTEXT ==="
```

### 3.3 PreToolUse Hook: validate-physics.sh

**File:** `.claude/scripts/validate-physics.sh`

```bash
#!/opt/homebrew/bin/bash
# Sigil v10.1 - Physics Validation Hook
# Validates generated code matches physics constraints

set -euo pipefail

# Hook receives: TOOL_NAME, FILE_PATH, CONTENT (via stdin or env)
TOOL_NAME="${CLAUDE_TOOL_NAME:-unknown}"
FILE_PATH="${CLAUDE_FILE_PATH:-unknown}"

# Read content from stdin if available
CONTENT=""
if [[ ! -t 0 ]]; then
  CONTENT=$(cat)
fi

# Skip non-component files
if [[ ! "$FILE_PATH" =~ \.(tsx|jsx)$ ]]; then
  exit 0
fi

WARNINGS=()

# Check 1: Financial mutations should have confirmation
if echo "$CONTENT" | grep -qE "(claim|withdraw|transfer|deposit|swap)"; then
  if ! echo "$CONTENT" | grep -qE "(confirm|confirmation|Confirm)"; then
    WARNINGS+=("PHYSICS: Financial mutation detected but no confirmation flow found")
  fi
fi

# Check 2: Mutations should use deliberate/server-tick timing
if echo "$CONTENT" | grep -qE "useMutation|mutation:"; then
  if echo "$CONTENT" | grep -qE "useMotion\(['\"]snappy['\"]|duration:\s*150"; then
    WARNINGS+=("PHYSICS: Mutation using snappy (150ms) timing - should use deliberate (800ms)")
  fi
fi

# Check 3: useMotion should be present for interactive components
if echo "$CONTENT" | grep -qE "onClick|onSubmit|onPress"; then
  if ! echo "$CONTENT" | grep -qE "useMotion|transition|animation"; then
    WARNINGS+=("PHYSICS: Interactive component without motion/transition")
  fi
fi

# Output warnings if any
if [[ ${#WARNINGS[@]} -gt 0 ]]; then
  echo "=== SIGIL PHYSICS WARNINGS ==="
  for warning in "${WARNINGS[@]}"; do
    echo "  - $warning"
  done
  echo "=== END WARNINGS ==="
fi

# Always exit 0 (warn, don't block)
exit 0
```

### 3.4 Bash Helper: count-imports.sh

**File:** `.claude/scripts/count-imports.sh`

```bash
#!/opt/homebrew/bin/bash
# Count how many files import a given component
# Usage: count-imports.sh ComponentName

set -euo pipefail

COMPONENT="${1:-}"

if [[ -z "$COMPONENT" ]]; then
  echo "Usage: count-imports.sh ComponentName" >&2
  exit 1
fi

# Search for import statements
COUNT=$(grep -rE "import.*${COMPONENT}.*from|from.*${COMPONENT}" \
  src/ \
  --include="*.tsx" \
  --include="*.ts" \
  --include="*.jsx" \
  --include="*.js" \
  2>/dev/null | wc -l | tr -d ' ')

echo "$COUNT"
```

### 3.5 Bash Helper: check-stability.sh

**File:** `.claude/scripts/check-stability.sh`

```bash
#!/opt/homebrew/bin/bash
# Check days since last modification
# Usage: check-stability.sh path/to/file.tsx

set -euo pipefail

FILE="${1:-}"

if [[ -z "$FILE" ]]; then
  echo "Usage: check-stability.sh path/to/file.tsx" >&2
  exit 1
fi

if [[ ! -f "$FILE" ]]; then
  echo "0"
  exit 0
fi

# Get last commit timestamp for file
LAST_MOD=$(git log -1 --format="%ct" -- "$FILE" 2>/dev/null || echo "0")

if [[ "$LAST_MOD" == "0" ]]; then
  LAST_MOD=$(stat -f "%m" "$FILE" 2>/dev/null || stat -c "%Y" "$FILE" 2>/dev/null || echo "0")
fi

NOW=$(date +%s)
DAYS=$(( (NOW - LAST_MOD) / 86400 ))

echo "$DAYS"
```

### 3.6 Bash Helper: infer-authority.sh

**File:** `.claude/scripts/infer-authority.sh`

```bash
#!/opt/homebrew/bin/bash
# Infer authority tier for a component
# Usage: infer-authority.sh path/to/Component.tsx

set -euo pipefail

FILE="${1:-}"
COMPONENT=$(basename "$FILE" .tsx | sed 's/.jsx$//')

if [[ -z "$FILE" ]]; then
  echo "Usage: infer-authority.sh path/to/Component.tsx" >&2
  exit 1
fi

# Get import count and stability
IMPORTS=$(.claude/scripts/count-imports.sh "$COMPONENT")
STABILITY=$(.claude/scripts/check-stability.sh "$FILE")

# Thresholds from authority.yaml
GOLD_IMPORTS=10
GOLD_STABILITY=14
SILVER_IMPORTS=5

# Determine tier
if [[ "$IMPORTS" -ge "$GOLD_IMPORTS" && "$STABILITY" -ge "$GOLD_STABILITY" ]]; then
  TIER="gold"
elif [[ "$IMPORTS" -ge "$SILVER_IMPORTS" ]]; then
  TIER="silver"
else
  TIER="draft"
fi

cat <<EOF
{
  "component": "$COMPONENT",
  "file": "$FILE",
  "imports": $IMPORTS,
  "stability_days": $STABILITY,
  "tier": "$TIER"
}
EOF
```

---

## 4. Skill Enhancements

### 4.1 Mason Skill Enhancement

**Additions to `.claude/skills/mason/SKILL.md`:**

```markdown
## Required Reading

Before generating ANY component, I MUST read these files:

1. **Constitution** — `grimoires/sigil/constitution.yaml`
2. **Authority** — `grimoires/sigil/authority.yaml`
3. **Physics Library** — `src/lib/sigil/physics.ts` (lines 1-100)

## Physics Decision Tree

┌─ Is this a MUTATION? (POST, PUT, DELETE, useMutation)
│
├─ YES ──┬─ Is it FINANCIAL? (claim, deposit, withdraw, transfer, swap, burn)
│        │
│        ├─ YES → SENSITIVE_MUTATION
│        │        sync: pessimistic, timing: 1200ms, confirmation: true
│        │        useMotion('server-tick')
│        │
│        └─ NO → MUTATION
│                sync: pessimistic, timing: 800ms
│                useMotion('deliberate')
│
└─ NO ───┬─ Is it a QUERY? (fetch, GET, useQuery, read)
         │
         ├─ YES → QUERY: sync: optimistic, timing: 150ms, useMotion('snappy')
         │
         └─ NO → LOCAL_STATE: sync: immediate, timing: 0ms
```

### 4.2 Gardener Skill Enhancement

**Additions to `.claude/skills/gardener/SKILL.md`:**

```markdown
## Authority Computation

Run these commands to determine authority:

1. Count imports: `.claude/scripts/count-imports.sh ComponentName`
2. Check stability: `.claude/scripts/check-stability.sh path/to/file.tsx`
3. Infer authority: `.claude/scripts/infer-authority.sh path/to/file.tsx`

| Tier | Min Imports | Min Stability |
|------|-------------|---------------|
| Gold | 10+ | 14+ days |
| Silver | 5+ | 7+ days |
| Draft | < 5 | any |
```

### 4.3 Diagnostician Skill Enhancement

**Additions to `.claude/skills/diagnostician/SKILL.md`:**

```markdown
## Required Reading

Read `src/lib/sigil/diagnostician.ts` for PATTERNS constant.

## Pattern Categories

| Category | Keywords |
|----------|----------|
| hydration | mismatch, server/client, useMediaQuery |
| dialog | positioning, z-index, scroll, modal |
| performance | slow, re-render, laggy |
| layout | shift, jump, CLS, flash |
| server-component | 'use client', hooks in RSC |
| react-19 | forwardRef, deprecated |
| state | stale, closure, infinite loop |
| async | race condition, unmounted, abort |
| animation | AnimatePresence, exit, flicker |

## Never Ask

NEVER ASK: "Can you check the console?", "What browser?", "Can you reproduce?"
INSTEAD: Match patterns and provide solutions directly.
```

---

## 5. Context Accumulation

### 5.1 Directory Structure

```
grimoires/sigil/.context/
├── taste.json           # Design preferences
├── persona.json         # Audience context
├── project.json         # Project conventions
├── recent.json          # Recent generations (last 10)
└── feedback.jsonl       # Append-only feedback log
```

### 5.2 Context Schema

**taste.json:**
```json
{
  "version": "10.1",
  "preferences": {
    "animation_library": "framer-motion",
    "button_style": "rounded",
    "color_scheme": "emerald"
  },
  "reinforcement": {
    "accepted": 0,
    "modified": 0,
    "rejected": 0
  }
}
```

---

## 6. File Structure Summary

### Files to Create

| File | Purpose |
|------|---------|
| `.claude/settings.local.json` | Hooks configuration |
| `.claude/scripts/sigil-init.sh` | SessionStart hook |
| `.claude/scripts/validate-physics.sh` | PreToolUse hook |
| `.claude/scripts/count-imports.sh` | Import counter |
| `.claude/scripts/check-stability.sh` | Stability checker |
| `.claude/scripts/infer-authority.sh` | Authority inferer |

### Files to Update

| File | Changes |
|------|---------|
| `.claude/skills/mason/SKILL.md` | Required Reading, Physics Decision Tree |
| `.claude/skills/gardener/SKILL.md` | Authority Computation |
| `.claude/skills/diagnostician/SKILL.md` | Pattern Categories, Never Ask |

### Files Already Complete

| File | Status |
|------|--------|
| `src/lib/sigil/*.ts` | 6 modules complete |
| `grimoires/sigil/constitution.yaml` | Complete |
| `grimoires/sigil/authority.yaml` | Complete |
| `src/hooks/useMotion.ts` | Complete |

---

## 7. Testing Strategy

### Manual Test Cases

1. **Financial Mutation**: `/craft "claim button"` → 800ms pessimistic physics
2. **Query Component**: `/craft "balance display"` → 150ms optimistic physics
3. **Authority Check**: `/garden src/hooks/useMotion.ts` → Shows tier
4. **Error Diagnosis**: "dialog jumping" → Matches pattern, no questions

---

## 8. Sprint Implementation

### Sprint 1: Hooks Infrastructure

1. Create `.claude/settings.local.json`
2. Create `sigil-init.sh`
3. Update Mason SKILL.md with Required Reading
4. Test `/craft "claim button"`

### Sprint 2: Helpers + Skills

5. Create helper scripts (count-imports, check-stability, infer-authority)
6. Update Gardener and Diagnostician SKILL.md
7. Test `/garden` and error diagnosis

### Sprint 3: Context

8. Initialize `.context/` directory
9. Create context accumulator
10. Test full pipeline

---

*SDD Generated: 2026-01-11*
*Architecture: Hooks-Based Skill Enhancement*
*Key Insight: Skills read, hooks inject, bash computes*
