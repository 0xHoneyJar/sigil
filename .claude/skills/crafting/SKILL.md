---
name: crafting
description: Generate or validate UI with design physics (Wyrd-integrated)
user-invocable: true
disable-model-invocation: true
allowed-tools:
  - Read
  - Write
  - Glob
---

# Crafting

Generate UI components with correct design physics, with Wyrd closed-loop integration.

## Usage

```
/glyph "component description"       # Generate mode (default)
/glyph --analyze "component"         # Analyze mode (physics only)
/glyph validate file.tsx             # Validate mode
/glyph --diagnose file.tsx           # Diagnose mode (suggest fixes)
```

## Philosophy

**Effect is truth.** What the code does determines its physics.

**Physics over preferences.** "Make it feel trustworthy" is not physics. "800ms pessimistic with confirmation" is physics.

## Workflow: Generate (Wyrd-Integrated)

### Phase 1: Hypothesis (Wyrd)

1. Read `grimoires/rune/taste.md` for user preferences
2. Detect effect from keywords/types (see Detection)
3. Look up physics from rules
4. Calculate confidence from `grimoires/rune/wyrd.md`
5. Present Hypothesis Box:

```
## Hypothesis

**Effect**: Financial (detected: "claim" keyword, Amount type)
**Physics**: Pessimistic sync, 800ms timing, confirmation required
**Taste Applied**: 500ms override (power user preference, Tier 2)
**Confidence**: 0.85

Does this match your intent? [y/n/adjust]
```

### Phase 2: Generation (on accept)

1. Generate complete React/TSX code
2. Apply physics rules:
   - Sync strategy (pessimistic/optimistic/immediate)
   - Timing (ms values)
   - Confirmation pattern
   - Animation physics
3. Match codebase conventions

### Phase 3: Self-Validation (Wyrd + Rigor)

1. Check physics compliance:
   - No `onMutate` for pessimistic sync
   - Loading states present
   - Timing values match
2. Check protected capabilities:
   - Cancel button not hidden during loading
   - Withdraw always reachable
   - Touch targets >= 44px
3. Run Rigor checks if web3 detected:
   - BigInt safety
   - Data source correctness
   - Receipt guards
4. Auto-repair if violations found
5. Show validation summary:

```
## Self-Validation
✓ Physics: Pessimistic sync implemented correctly
✓ Protected: Cancel button present and visible
✓ Rigor: BigInt checks use `!= null && > 0n`

[Auto-repaired: Added min-h-[44px] to button]
```

### Phase 4: Write and Log

1. Write component to file
2. Log decision to NOTES.md Design Physics section:
   ```
   | 2026-01-25 | ClaimButton | Financial | 500ms | power-user | Sprint-1 |
   ```
3. Start 30-minute edit monitoring

### Phase 5: Learn from Edits (Wyrd)

If user modifies file within 30 minutes:

1. Detect changes via git diff
2. Analyze for physics-relevant modifications
3. Prompt: "Record as taste? [y/n]"
4. Log to rejections.md
5. Update confidence calibration

## Detection

### Priority

1. **Types** — `Currency`, `Wei`, `Token` → Always Financial
2. **Keywords** — Match against effect lists
3. **Context** — Phrases like "with undo" modify effect

### Keywords by Effect

**Financial**: claim, deposit, withdraw, transfer, swap, send, pay, mint, burn, stake, unstake, bridge, approve

**Destructive**: delete, remove, destroy, revoke, terminate, purge, erase, wipe, clear, reset

**Soft Delete**: archive, hide, trash, dismiss, snooze, mute (with undo)

**Standard**: save, update, edit, create, add, like, follow, bookmark, favorite, star

**Local**: toggle, switch, expand, collapse, select, focus, show, hide, open, close, theme

## Physics Table

| Effect | Sync | Timing | Confirmation |
|--------|------|--------|--------------|
| Financial | Pessimistic | 800ms | Required |
| Destructive | Pessimistic | 600ms | Required |
| Soft Delete | Optimistic | 200ms | Toast + Undo |
| Standard | Optimistic | 200ms | None |
| Navigation | Immediate | 150ms | None |
| Local State | Immediate | 100ms | None |

## Protected Capabilities

| Capability | Rule |
|------------|------|
| Withdraw | Always reachable |
| Cancel | Always visible |
| Balance | Always accurate |
| Touch target | >= 44px |
| Focus ring | Always visible |

## Progressive Disclosure (L0-L4)

Reveal complexity gradually. Don't dump all physics upfront.

| Level | Trigger | Content | Token Budget |
|-------|---------|---------|--------------|
| L0 | User types `/glyph` | Nothing yet | ~10 |
| L1 | Description provided | Hypothesis box | ~100 |
| L2 | Ambiguous/low confidence | Clarifying question | ~50 |
| L3 | Confirmed | Generated code | Variable |
| L4 | "Why?" asked | Full physics explanation | ~500 |

See `rules/glyph/10-glyph-progressive-disclosure.md` for details.

## Mode Detection

| Mode | Trigger | Output |
|------|---------|--------|
| Generate | `/glyph "description"` | Hypothesis + Code |
| Analyze | `/glyph --analyze "description"` | Physics analysis only |
| Validate | `/glyph validate file.tsx` | Validation report |
| Diagnose | `/glyph --diagnose file.tsx` | Issues + suggested fixes |

See `rules/glyph/09-glyph-modes.md` for detection logic.

## Rules Loaded

### Always Loaded (L1+)
- `rules/glyph/00-glyph-core.md` - Priority, permissions
- `rules/glyph/01-glyph-physics.md` - Physics table
- `rules/glyph/02-glyph-detection.md` - Effect detection
- `rules/sigil/01-sigil-taste.md` - Reading taste

### On Generation (L3)
- `rules/glyph/03-glyph-protected.md` - Protected capabilities
- `rules/glyph/04-glyph-patterns.md` - Golden patterns
- `rules/rigor/*.md` - If web3 detected

### On Explanation (L4)
- `rules/glyph/17-glyph-disclosure-l4.md` - L4 content structure
- `physics-reference` skill - Full rationale
- `patterns-reference` skill - Implementation details

### Wyrd Integration
- `rules/wyrd/01-wyrd-hypothesis.md` - Hypothesis format
- `rules/wyrd/03-wyrd-confidence.md` - Confidence calculation
- `rules/wyrd/04-wyrd-rejection-capture.md` - Rejection handling

### Self-Validation (L3)
- `rules/glyph/11-glyph-physics-check.md` - Physics compliance
- `rules/glyph/12-glyph-protected-check.md` - Protected capabilities
- `rules/glyph/13-glyph-rigor-check.md` - Web3 safety (if detected)
- `rules/glyph/14-glyph-auto-repair.md` - Auto-repair logic
- `rules/glyph/15-glyph-validation-summary.md` - Summary display

### Logging & Continuity
- `rules/glyph/08-glyph-notes-logging.md` - NOTES.md protocol
- `rules/glyph/16-glyph-feedback-taste.md` - Feedback loop taste capture
- `rules/glyph/18-glyph-session-continuity.md` - Session state preservation

## Reference Skills (on-demand)

Load when detailed tables needed:
- `physics-reference` - Full physics tables with rationale
- `patterns-reference` - Golden implementations

## Self-Validation Pipeline

After generating code (Phase 3), run validation in order:

```
1. Physics Compliance Check (11)
   ├── Sync strategy matches effect
   ├── Loading states present
   ├── Timing >= minimum (or taste override)
   └── Confirmation present (Financial/Destructive)

2. Protected Capability Check (12)
   ├── Cancel always visible
   ├── Withdraw always reachable
   ├── Touch targets >= 44px
   └── Focus rings present

3. Rigor Check (13) - if web3 detected
   ├── BigInt safety
   ├── Data source correctness
   ├── Receipt guard
   └── Stale closure prevention

4. Auto-Repair (14)
   ├── Fix touch targets (add min-h-[44px])
   ├── Fix focus rings (add focus-visible:ring-2)
   └── Fix BigInt checks (change to != null && > 0n)

5. Summary Display (15)
   ├── Show all results
   ├── Block if BLOCK violations
   └── Proceed with warnings
```

If ANY block-level violation exists, refuse to write file and show fix suggestions.
