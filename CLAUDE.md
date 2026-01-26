# Rune

You are working on Rune — design physics for AI-generated UI.

## Four Constructs

Rune follows UNIX philosophy: one tool per job.

| Construct | Command | Purpose | Rules |
|-----------|---------|---------|-------|
| **Sigil** | `/sigil` | Taste (WHY) | `rules/sigil/` |
| **Glyph** | `/glyph` | Craft (HOW) | `rules/glyph/` |
| **Rigor** | `/rigor` | Correctness (WHAT) | `rules/rigor/` |
| **Wyrd** | `/wyrd` | Learning (FEEDBACK) | `rules/wyrd/` |

## Sigil (Taste)

Captures human insights. Learns preferences from usage.

**When to use**: After user modifies generated code, or when observing feedback.

**Key files**:
- `rules/sigil/00-sigil-core.md` — Philosophy
- `rules/sigil/01-sigil-taste.md` — How taste is read and applied
- `skills/observing/SKILL.md` — Task skill for capturing insights

**Output**: `grimoires/sigil/taste.md` (append-only, human-readable)

## Glyph (Craft)

Generates UI with correct design physics.

**When to use**: Creating or modifying interactive components.

**Key files**:
- `rules/glyph/00-glyph-core.md` — Priority, permissions, action default
- `rules/glyph/01-glyph-physics.md` — THE physics table
- `rules/glyph/02-glyph-detection.md` — Effect detection + keywords
- `rules/glyph/03-glyph-protected.md` — Non-negotiable capabilities
- `rules/glyph/04-glyph-patterns.md` — Golden implementation patterns
- `rules/glyph/05-glyph-animation.md` — Animation physics
- `rules/glyph/06-glyph-material.md` — Material physics
- `rules/glyph/07-glyph-practices.md` — React best practices

**Physics table** (memorize this):

| Effect | Sync | Timing | Confirmation |
|--------|------|--------|--------------|
| Financial | Pessimistic | 800ms | Required |
| Destructive | Pessimistic | 600ms | Required |
| Soft Delete | Optimistic | 200ms | Toast + Undo |
| Standard | Optimistic | 200ms | None |
| Navigation | Immediate | 150ms | None |
| Local State | Immediate | 100ms | None |

## Rigor (Correctness)

Validates data correctness in web3 components. Catches bugs that lose money.

**When to use**: Any transaction flow (stake, claim, bridge, swap, approve).

**Key files**:
- `rules/rigor/00-rigor-core.md` — Philosophy, Rigor vs Glyph
- `rules/rigor/01-rigor-data.md` — Indexed vs on-chain decision table
- `rules/rigor/02-rigor-web3.md` — BigInt safety, receipt guards, stale closures

**Critical patterns**:
- BigInt: `0n` is falsy — use `amount != null && amount > 0n`
- Receipt guard: Check hash changed before processing
- Data source: Transaction amounts MUST come from on-chain

## Wyrd (Learning)

Closed-loop feedback system. Hypothesize → Generate → Validate → Learn.

**When to use**: Automatically integrated into `/glyph`. Captures rejections and learns patterns.

**Key files**:
- `rules/wyrd/00-wyrd-core.md` — Philosophy, closed-loop workflow
- `rules/wyrd/01-wyrd-hypothesis.md` — Hypothesis generation with confidence
- `rules/wyrd/03-wyrd-confidence.md` — Confidence calculation from taste
- `rules/wyrd/07-wyrd-pattern-detection.md` — 3+ rejections = pattern

**State**: `grimoires/rune/wyrd.md` (rejection log, patterns, confidence)

**Learning loop**:
1. Hypothesis with confidence score
2. User accepts/rejects
3. Rejection captured with reason
4. 3+ similar rejections → pattern detected
5. Pattern promoted to taste.md

## Philosophy

**Effect is truth.** What the code does determines its physics.

**Physics over preferences.** "Make it feel trustworthy" is not physics. "800ms pessimistic with confirmation" is physics.

**Correctness over feel.** A beautiful button that sends the wrong amount is worse than an ugly one that's accurate.

## Protected Capabilities (Non-Negotiable)

| Capability | Rule |
|------------|------|
| Withdraw | Always reachable (never hide behind loading) |
| Cancel | Always visible (every flow needs escape) |
| Balance | Always accurate (invalidate on mutation) |
| Touch target | ≥44px |
| Focus ring | Always visible |

## Action Default

**Guided Workflow** (v0.21.0): `/loa` - Shows current state and suggests next command

**Ad-hoc**: `/audit`, `/audit-deployment`, `/translate`, `/contribute`, `/update-loa`, `/validate`

**DO**: Write complete, working code. Match codebase conventions.

**DON'T**: Describe what you would build. Ask "would you like me to generate this?"

## Enhancement Flow

Slot external knowledge into constructs using `/enhance`:

```bash
# Install external skill (e.g., animations.dev)
curl -s "https://animations.dev/api/..." | bash

# Slot into Rune
/enhance --source ~/.claude/skills/emil-design-engineering --construct glyph
```

**References** live in `.claude/references/`:

| Reference | Construct | Content |
|-----------|-----------|---------|
| `design-engineering/` | Glyph | Animations, UI polish, forms, accessibility |

Rules reference this knowledge:
```markdown
# In rules/glyph/05-glyph-animation.md
See `references/design-engineering/animations.md` for easing selection...
```

**Two learning flows**:
- `/enhance` — Import curated external knowledge
- `continuous-learning` — Capture organic debugging discoveries

## Intelligent Subagents

| Subagent | Purpose | Verdict Levels |
|----------|---------|----------------|
| `architecture-validator` | SDD compliance checking | COMPLIANT, DRIFT_DETECTED, CRITICAL_VIOLATION |
| `security-scanner` | OWASP Top 10 vulnerability detection | CRITICAL, HIGH, MEDIUM, LOW |
| `test-adequacy-reviewer` | Test quality assessment | STRONG, ADEQUATE, WEAK, INSUFFICIENT |
| `documentation-coherence` | Per-task documentation validation | COHERENT, NEEDS_UPDATE, ACTION_REQUIRED |
| `goal-validator` | PRD goal achievement verification | GOAL_ACHIEVED, GOAL_AT_RISK, GOAL_BLOCKED |

**Usage**: `/validate`, `/validate architecture`, `/validate security`, `/validate goals`

### Goal Traceability (v0.21.0)

Prevents silent goal failures by mapping PRD goals through sprint tasks to validation:

**Components**:
- **Goal IDs**: PRD goals identified as G-1, G-2, etc.
- **Appendix C**: Sprint plan section mapping goals to contributing tasks
- **E2E Validation Task**: Auto-generated in final sprint
- **Goal Validator**: Subagent verifying goals are achieved

**Configuration** (`.loa.config.yaml`):
```yaml
goal_traceability:
  enabled: true              # Enable goal ID system
  require_goal_ids: false    # Require G-N IDs in PRD (backward compat)
  auto_assign_ids: true      # Auto-assign if missing
  generate_appendix_c: true  # Generate goal mapping in sprint
  generate_e2e_task: true    # Auto-generate E2E validation task

goal_validation:
  enabled: true              # Enable goal validation
  block_on_at_risk: false    # Block review on AT_RISK (default: warn)
  block_on_blocked: true     # Block review on BLOCKED
  require_e2e_task: true     # Require E2E task in final sprint
```

**Workflow Integration**:
- `/sprint-plan`: Generates Appendix C + E2E task
- `/review-sprint`: Invokes goal-validator on final sprint
- `/validate goals`: Manual goal validation

## Key Protocols

### Structured Agentic Memory

Agents maintain persistent working memory in `grimoires/loa/NOTES.md`:
- **Current Focus**: Active task, status, blocked by, next action
- **Session Log**: Append-only event history table
- **Decisions**: Architecture/implementation decisions table
- **Blockers**: Checkbox list with [RESOLVED] marking
- **Technical Debt**: Issues for future attention
- **Goal Status**: PRD goal achievement tracking (v0.21.0)
- **Learnings**: Project-specific knowledge
- **Session Continuity**: Recovery anchor

**Protocol**: See `.claude/protocols/structured-memory.md`

### Lossless Ledger Protocol

The "Clear, Don't Compact" paradigm for context management:

**Truth Hierarchy**:
1. CODE (src/) - Absolute truth
2. BEADS (.beads/) - Lossless task graph
3. NOTES.md - Decision log, session continuity
4. TRAJECTORY - Audit trail, handoffs
5. PRD/SDD - Design intent

**Key Protocols**:
- `session-continuity.md` - Tiered recovery, fork detection
- `grounding-enforcement.md` - Citation requirements (>=0.95 ratio)
- `synthesis-checkpoint.md` - Pre-clear validation
- `jit-retrieval.md` - Lightweight identifiers + cache integration

### Recursive JIT Context (v0.20.0)

Context optimization for multi-subagent workflows, leveraging RLM research patterns:

| Component | Script | Purpose |
|-----------|--------|---------|
| Semantic Cache | `cache-manager.sh` | Cross-session result caching |
| Condensation | `condense.sh` | Result compression (~20-50 tokens) |
| Early-Exit | `early-exit.sh` | Parallel subagent coordination |
| Semantic Recovery | `context-manager.sh --query` | Query-based section selection |

**Usage**:
```bash
# Cache audit results
key=$(cache-manager.sh generate-key --paths "src/auth.ts" --query "audit")
cache-manager.sh set --key "$key" --condensed '{"verdict":"PASS"}'

# Condense large results
condense.sh condense --strategy structured_verdict --input result.json

# Coordinate parallel subagents
early-exit.sh signal session-123 agent-1
```

**Protocol**: See `.claude/protocols/recursive-context.md`, `.claude/protocols/semantic-cache.md`

### Feedback Loops

Three quality gates:

1. **Implementation Loop** (Phase 4-5): Engineer <-> Senior Lead until "All good"
2. **Security Audit Loop** (Phase 5.5): After approval -> Auditor review -> "APPROVED - LETS FUCKING GO"
3. **Deployment Loop**: DevOps <-> Auditor until infrastructure approved

**Priority**: Audit feedback checked FIRST on `/implement`, then engineer feedback.

### Git Safety

Prevents accidental pushes to upstream template:
- 4-layer detection (cached -> origin URL -> upstream remote -> GitHub API)
- Soft block with user confirmation via AskUserQuestion
- `/contribute` command bypasses (has own safeguards)

### beads_rust Integration

Optional task graph management using beads_rust (`br` CLI). Non-invasive by design:
- Never touches git (no daemon, no auto-commit)
- Explicit sync protocol
- SQLite for fast queries, JSONL for git-friendly diffs

**Sync Protocol**:
```bash
br sync --import-only    # Session start
br sync --flush-only     # Session end
```

### Sprint Ledger

Global sprint numbering across multiple development cycles:

**Location**: `grimoires/loa/ledger.json`

**Commands**: `/ledger`, `/ledger history`, `/archive-cycle "label"`

## Document Flow

```
.claude/
├── rules/
│   ├── sigil/          # Taste rules (4 files)
│   ├── glyph/          # Craft rules (21 files)
│   ├── rigor/          # Correctness rules (3 files)
│   └── wyrd/           # Learning rules (11 files)
├── skills/
│   ├── observing/      # /sigil task skill
│   ├── crafting/       # /glyph task skill
│   ├── enforcing/      # /rigor task skill
│   ├── fating/         # /wyrd task skill
│   ├── validating/     # /validate task skill
│   ├── physics-reference/
│   └── patterns-reference/
├── references/         # External knowledge sources
│   └── design-engineering/  # Emil's animations.dev
├── hooks/
│   ├── sprint-plan-hook.md
│   ├── implement-hook.md
│   ├── review-sprint-hook.md
│   └── audit-sprint-hook.md
└── commands/
    ├── sigil.md
    ├── glyph.md
    ├── rigor.md
    └── enhance.md      # Slot external knowledge

grimoires/
├── loa/                # Loa state (ledger, notes)
└── rune/               # Rune state
    ├── taste.md        # Accumulated preferences (Sigil)
    └── wyrd.md         # Learning state (Wyrd)
```

## Commit Conventions

```
feat(glyph): add new pattern for staking flows
fix(rigor): handle BigInt edge case
refactor(sigil): simplify taste schema
```

Include `Co-Authored-By: Claude <noreply@anthropic.com>` when Claude contributes.
