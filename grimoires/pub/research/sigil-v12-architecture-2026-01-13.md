# Sigil v12: "Invisible Craft"

**Date**: 2026-01-13
**Status**: Architecture Revision
**Incorporates**: Senior Agent Architect critique of v11.1.0

---

## The Core Correction

> "A Staff-level system is intent-aware, not command-driven."

Sigil v11 failed because it remained something the human **manages**. v12 must be something the human **inhabits**. The agent doesn't wait for `/craft`—it **knows** the physics the moment a file path is touched.

---

## Rejected Patterns (v11 Mistakes)

| v11 Proposal | Why It Failed | v12 Correction |
|--------------|---------------|----------------|
| Split into 7 rule files | Context drift; agent loads timing.md but misses protected.md | **One cached Soul** (SIGIL.md) |
| `/craft` command | Human must invoke Sigil to get taste | **Hook-based injection**; physics applied on any Write/Edit |
| Subagent orchestration | Serialization bottleneck destroys flow | **Pre-computed workshop index** (<5ms lookup) |
| `authority.json` sidecar | Shadow codebase drifts from truth | **Directory-based authority** (filesystem IS database) |
| Silent fixes (Yield & Patch) | Gaslights the user; code drifts post-stream | **Atomic streaming** (validate before first token) |
| Effect detection by keywords | Misses data physics | **Schema-bound physics** (types determine sync) |

---

## Part 1: The Soul (One File)

### 1.1 Why One File

Claude Opus 4.5 has 200k+ token context with prompt caching. Fragmenting rules into 7 files creates:
- **Context drift**: Agent loads one file, misses constraint in another
- **Keyword scan failures**: PreToolUse triggers on "button" but misses "protected capability"
- **Cache misses**: 7 files = 7 cache entries vs 1 file = 1 cached reflex

### 1.2 The Soul Structure

```markdown
# SIGIL.md — The Soul

## Physics Table
[Full effect → physics mapping in ONE place]

## Effect Detection
[Keywords AND types AND schemas]

## Sync Strategies
[With cross-references to timing]

## Protected Capabilities
[Inline, not separate file]

## Forbidden Patterns
[The "Mod Ghost Rule" - what breaks the soul]

## Golden Patterns
[Direct references to src/gold/ with rationale]
```

**Key Insight**: Cross-dimensional relationships (Sync affects Timing affects Confirmation) must be **explicit in one document**, not scattered across files where the agent must reconstruct the relationship.

### 1.3 Location

```
.claude/SIGIL.md    # The Soul - loaded into every session via prompt cache
```

Not `.claude/rules/sigil-*.md` (fragmented), not `grimoires/sigil/constitution.yaml` (wrong format). One markdown file that Claude caches and reflexively applies.

---

## Part 2: Hook-Based, Not Command-Based

### 2.1 Kill the Command

> "If the human must invoke a specific 'Sigil command' to get tasteful output, the system has failed to disappear into the workflow."

**Old model**: User types `/craft "claim button"` → Sigil activates
**New model**: User types "make a claim button" → Sigil already active (via hooks)

### 2.2 The PreToolUse Hook

```yaml
# .claude/hooks.yaml
hooks:
  - event: PreToolUse
    matcher: "Write|Edit"
    command: ".claude/hooks/sentinel.sh"
```

**sentinel.sh** does:
1. Reads file path → Determines zone (`src/gold/`, `src/draft/`, etc.)
2. Reads content → Detects effect from keywords AND types
3. Validates against Forbidden Patterns
4. Injects physics constraints into Claude's working context
5. Returns "proceed" or "block with reason"

### 2.3 Atomic Streaming

> "The agent must perform its Chain-of-Thought validation before emitting the first token."

**Rejected**: "Yield & Patch" (stream code, then silently fix)
**Accepted**: "Atomic Streaming" (validate first, stream correct code)

The 500ms initial delay is acceptable. What's unacceptable is the human reading one thing while something else is saved to disk.

**Implementation**: PreToolUse hook runs validation. If validation passes, the Write/Edit proceeds. The human sees exactly what will be saved.

---

## Part 3: Directory-Based Authority

### 3.1 Filesystem IS Database

> "If a pattern exists in src/gold/, it is the authority."

**Rejected**: `grimoires/sigil/state/authority.json`
**Accepted**: Directory structure as authority

```
src/
├── gold/           # Canonical patterns (agent mimics exactly)
│   ├── ClaimButton.tsx
│   ├── LikeButton.tsx
│   └── ...
├── silver/         # Proven patterns (agent prefers)
│   └── ...
├── draft/          # Experimental (Sentinel silent)
│   └── ...
└── components/     # Standard (normal physics apply)
    └── ...
```

### 3.2 Authority by Directory

| Directory | Authority | Sentinel Behavior | Agent Behavior |
|-----------|-----------|-------------------|----------------|
| `src/gold/` | Canonical | **Strict** - any deviation blocked | **Mimic exactly** |
| `src/silver/` | Proven | **Advisory** - warnings only | **Prefer as template** |
| `src/draft/` | Experimental | **Silent** - no validation | **Ignore for templates** |
| `src/*` | Standard | **Normal** - physics apply | **Apply physics** |

### 3.3 Promotion = Survival

**Rejected**: Promotion via metadata update or command
**Accepted**: Promotion via `mv` after survival

```bash
# Pattern survives 2 weeks in production with <3 mutinies
mv src/silver/NewPattern.tsx src/gold/NewPattern.tsx
```

The agent discovers authority by running `ls src/gold/` at session start. No JSON to rot. No registry to drift.

### 3.4 Workshop Index (Pre-computed)

For <5ms lookup at PreToolUse time:

```json
// .claude/workshop.json (auto-generated, gitignored)
{
  "gold": ["ClaimButton", "LikeButton", "DeleteButton"],
  "silver": ["NewCheckout", "ProfileCard"],
  "draft": ["ExperimentalNav"],
  "lastScan": "2026-01-13T12:00:00Z"
}
```

Generated by `ls` at session start. Stale after any `mv`. But it's a **cache**, not a **source of truth**. If stale, fall back to live `ls`.

---

## Part 4: Data Physics (Schema-Bound)

### 4.1 The Gap in v11

v11 detected effects by **keywords**: "claim" → financial
v12 detects effects by **keywords AND types AND schemas**

### 4.2 Type-Driven Physics

```typescript
// If the data type is Currency, Money, Balance, Wei, BigInt...
// → Automatically: Server-Tick authority + Simulation Layer

type Props = {
  amount: Currency;  // ← Type triggers physics
  onClaim: () => void;
}

// Agent sees Currency → applies:
// - Pessimistic sync (server-tick)
// - Simulation preview (transaction simulation)
// - 800ms deliberate timing
// - Two-phase confirmation
```

### 4.3 Schema Binding Table

| Data Type | Physics Binding |
|-----------|-----------------|
| `Currency`, `Money`, `Balance`, `Wei`, `BigInt` | Server-Tick + Simulation + Pessimistic |
| `User`, `Profile`, `Account` | Optimistic with rollback |
| `Message`, `Comment`, `Post` | Optimistic, no confirmation |
| `Session`, `Token`, `Auth` | Pessimistic, confirmation required |
| `LocalState`, `Preference`, `Theme` | Immediate, no server |

### 4.4 Implementation

PreToolUse hook parses the file for type annotations. If `Currency` type detected anywhere in the component props or state, financial physics are **automatically injected** regardless of what the human asked for.

---

## Part 5: The Toolkit

### 5.1 Sentinel (Atomic Validator)

**Purpose**: Enforce Fidelity Ceiling before first token streams

**Implementation**: PreToolUse hook

**Forbidden Patterns** (example):
- Mesh gradients (breaks brand)
- 3D transforms (performance)
- Inline styles when Tailwind exists
- `any` type when strict mode enabled
- Missing error boundaries in async components

**Behavior**:
```
User: "Add a glassmorphism effect to the card"

Sentinel detects: mesh gradient, blur backdrop
Sentinel checks: Forbidden Patterns list
Sentinel blocks: "Glassmorphism uses mesh gradients which are forbidden in the Soul.
                  Alternative: Use the 'frosted' pattern from src/gold/FrostedCard.tsx"
```

### 5.2 Chrono-Kernel (Time Authority)

**Purpose**: Determine "where time lives" for every interaction

**Implementation**: Auto-wraps critical actions in 4-state machine

```
Idle → Simulating → Confirming → Committed
```

**Binding**:
- Navigation → Movement Smoothing (predictive UI, client owns clock)
- Standard mutation → Optimistic (client owns clock, rollback on error)
- Financial mutation → Pessimistic (server owns clock, simulation first)
- Destructive mutation → Pessimistic with undo window

### 5.3 Silent Polisher (Format Governor)

**Purpose**: Clean by Construction

**Implementation**: PostToolUse hook runs before human sees code

**Actions**:
- `eslint --fix`
- `prettier --write`
- Auto-import resolution
- Unused import removal

**Key Constraint**: Runs in **staging buffer**. Human never sees a missing import or semicolon. If code is visible, it's already clean.

**Difference from "Yield & Patch"**: Polisher handles **formatting**. It does NOT change **logic or physics**. Physics are validated atomically in PreToolUse before streaming begins.

### 5.4 Gardener (Drift Detector)

**Purpose**: Compound learning from mutinies

**Implementation**: Tracks overrides in `.claude/mutiny.jsonl`

```jsonl
{"timestamp": "2026-01-13T12:00:00Z", "pattern": "ClaimButton", "override": "used 400ms instead of 800ms", "user": "senior-dev"}
{"timestamp": "2026-01-14T09:00:00Z", "pattern": "ClaimButton", "override": "used 400ms instead of 800ms", "user": "senior-dev"}
{"timestamp": "2026-01-15T14:00:00Z", "pattern": "ClaimButton", "override": "used 400ms instead of 800ms", "user": "senior-dev"}
```

**Weighted Mutiny**: After 3 overrides of same pattern by senior dev:

```
Gardener: "ClaimButton timing (800ms) has been overridden 3 times.
           Auto-suspending rule. Opening PR to evolve the Soul.

           Proposed change to SIGIL.md:
           - financial_mutation.timing: 800ms
           + financial_mutation.timing: 400ms  # Evolved via mutiny 2026-01-15"
```

The system **learns from disagreement**, not committees.

---

## Part 6: The Flow

### 6.1 Session Start

```
1. Claude loads .claude/SIGIL.md (The Soul) → cached
2. Workshop index generated: ls src/gold/ src/silver/ src/draft/
3. Mutiny ledger loaded: .claude/mutiny.jsonl
4. Hooks registered: PreToolUse (Sentinel), PostToolUse (Polisher)
```

### 6.2 User Request

```
User: "Make a claim button for the rewards pool"

Claude (internally):
- Detects "claim" keyword → financial effect
- Checks workshop: ClaimButton exists in src/gold/
- Plans: Use Gold pattern as template
```

### 6.3 PreToolUse (Sentinel)

```
Sentinel receives: Write to src/components/RewardsClaim.tsx

Sentinel validates:
- ✓ Financial physics applied (pessimistic, 800ms, confirmation)
- ✓ No forbidden patterns
- ✓ Schema types checked (if Currency type, simulation layer present)
- ✓ Protected capabilities preserved (cancel button exists)

Sentinel returns: PROCEED
```

### 6.4 Atomic Streaming

```
Claude streams code to user.
Code is correct by construction.
No yield & patch. What streams is what saves.
```

### 6.5 PostToolUse (Polisher)

```
Polisher runs: eslint --fix, prettier --write
Polisher handles: formatting, imports, semicolons
Polisher does NOT change: logic, physics, structure
```

### 6.6 Human Review

```
Human sees: Clean, physics-correct code
Human may: Accept, modify, or override

If override:
- Gardener logs mutiny
- After 3 mutinies → auto-evolve Soul
```

---

## Part 7: File Structure (v12)

```
.claude/
├── SIGIL.md                    # The Soul (ONE file, cached)
├── hooks.yaml                  # Hook registration
├── hooks/
│   ├── sentinel.sh             # PreToolUse: Atomic validation
│   └── polisher.sh             # PostToolUse: Format governance
├── workshop.json               # Pre-computed authority index (gitignored)
├── mutiny.jsonl                # Mutiny ledger (gitignored)
└── agents/
    └── gardener.md             # Drift detector (batch operations only)

src/
├── gold/                       # Canonical patterns
├── silver/                     # Proven patterns
├── draft/                      # Experimental (Sentinel silent)
└── components/                 # Standard
```

**What's Gone**:
- `grimoires/sigil/constitution.yaml` → Merged into SIGIL.md
- `grimoires/sigil/state/authority.json` → Replaced by directory structure
- `.claude/rules/sigil-*.md` (7 files) → One SIGIL.md
- `.claude/commands/craft.md` → Hook-based, no command
- `.claude/skills/` (14 skills) → Reduced to 1 (Gardener for batch only)

---

## Part 8: Migration from v11

### Phase 1: Soul Consolidation (Day 1)

1. Merge all rule files into single `SIGIL.md`
2. Include cross-dimensional relationships explicitly
3. Delete fragmented rule files
4. Update CLAUDE.md to import SIGIL.md

### Phase 2: Hook Implementation (Day 2)

1. Create `hooks.yaml` with PreToolUse/PostToolUse
2. Implement `sentinel.sh` for atomic validation
3. Implement `polisher.sh` for format governance
4. Delete `/craft` command

### Phase 3: Directory Authority (Day 3)

1. Create `src/gold/`, `src/silver/`, `src/draft/`
2. Move canonical examples to `src/gold/`
3. Implement workshop index generation
4. Delete `authority.json` and related scripts

### Phase 4: Data Physics (Day 4)

1. Add type detection to Sentinel
2. Implement schema-bound physics table
3. Test with Currency, Money, Balance types

### Phase 5: Mutiny Engine (Day 5)

1. Implement mutiny logging
2. Implement weighted mutiny detection
3. Implement auto-suspend + PR generation
4. Test evolution cycle

---

## Summary: v11 → v12

| Aspect | v11 "Pure Craft" | v12 "Invisible Craft" |
|--------|------------------|----------------------|
| Activation | `/craft` command | PreToolUse hook (automatic) |
| Knowledge | 7 fragmented files | One cached Soul |
| Authority | `authority.json` sidecar | Directory structure |
| Validation | Advisory (in SKILL.md) | Enforced (Sentinel hook) |
| Streaming | Yield & Patch | Atomic (validate before emit) |
| Effect detection | Keywords only | Keywords + Types + Schemas |
| Learning | None | Weighted Mutiny → Auto-evolve |
| Subagents | 3 (craft, explore, validate) | 1 (Gardener, batch only) |

---

## The Verdict

> "Implementation IS the feel."

v12 doesn't separate "human provides feel" from "agent provides implementation". They're the same thing. The agent that writes `Currency` type automatically writes Server-Tick sync. The agent that touches `src/gold/` automatically mimics exactly.

The human doesn't manage Sigil. The human **works within** Sigil. The physics are already there before the first token streams.

That's invisible craft.
