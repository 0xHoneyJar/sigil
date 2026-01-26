# Rune

You are working on Rune — design physics for AI-generated UI.

## Three Constructs

Rune follows UNIX philosophy: one tool per job.

| Construct | Command | Purpose | Rules |
|-----------|---------|---------|-------|
| **Sigil** | `/sigil` | Taste (WHY) | `rules/sigil/` |
| **Glyph** | `/glyph` | Craft (HOW) | `rules/glyph/` |
| **Rigor** | `/rigor` | Correctness (WHAT) | `rules/rigor/` |

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

After user confirms analysis, generate/apply changes immediately.

**DO**: Write complete, working code. Match codebase conventions.

**DON'T**: Describe what you would build. Ask "would you like me to generate this?"

## Repository Structure

```
.claude/
├── rules/
│   ├── sigil/          # Taste rules (2 files)
│   ├── glyph/          # Craft rules (8 files)
│   └── rigor/          # Correctness rules (3 files)
├── skills/
│   ├── observing/      # /sigil task skill
│   ├── crafting/       # /glyph task skill
│   ├── enforcing/      # /rigor task skill
│   ├── physics-reference/   # Reference skill
│   └── patterns-reference/  # Reference skill
└── commands/
    ├── sigil.md        # Invokes observing
    ├── glyph.md        # Invokes crafting
    └── rigor.md        # Invokes enforcing

grimoires/
└── sigil/
    └── taste.md        # Accumulated preferences
```

## Commit Conventions

```
feat(glyph): add new pattern for staking flows
fix(rigor): handle BigInt edge case
refactor(sigil): simplify taste schema
```

Include `Co-Authored-By: Claude <noreply@anthropic.com>` when Claude contributes.
