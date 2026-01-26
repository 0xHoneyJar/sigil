# PRD: Sigil Simplification & UNIX Decomposition

**Version**: 1.0
**Date**: 2026-01-25
**Status**: Draft
**Author**: Claude + Human collaboration

---

## Executive Summary

Sigil has grown to 6,231 lines of rules, 29 skills, and 46 commands - but only ~17% is actively used. This PRD proposes an aggressive simplification following UNIX philosophy: decompose into focused tools that do one thing well.

**The reframe**:
- **Sigil** = Taste (why it should feel this way)
- **Glyph** = Craft (how to achieve that feel)
- **Rigor** = Correctness (what must be true)
- **Voice** = Future (how it should speak)

---

## Problem Statement

### Current State

| Dimension | Current | Actually Used | Waste |
|-----------|---------|---------------|-------|
| Rules | 6,231 lines | ~1,800 lines | 71% |
| Skills | 29 | 4 | 86% |
| Commands | 46 | 3 | 93% |
| Context/session | ~10k tokens | ~3k needed | 70% |

### Root Causes

1. **Conflated concerns**: Taste, physics, data correctness, and architecture all in one monolith
2. **Aspirational infrastructure**: Built for 100-person org, used by 1-2 people
3. **No deprecation policy**: Features added, never removed
4. **Premature abstraction**: Rules for CLIs that don't exist (Anchor/Lens)

### Evidence

From codebase analysis:
- 5 skills have 0 references (dead code)
- 36 of 46 commands never called in git history
- 18-sigil-complexity.md (1,013 lines) never triggered
- `domain-handler` skill referenced but doesn't exist

From Anthropic best practices:
- CLAUDE.md should be under ~500 lines (Sigil has thousands)
- Skills are the pattern, not complex rule hierarchies
- Human-in-the-loop should be conversational, not approval gates

---

## Vision

### UNIX Philosophy Applied

> "Do one thing and do it well. Write programs to work together."

| Construct | Domain | Question It Answers | Interface |
|-----------|--------|---------------------|-----------|
| **Sigil** | Taste | *"Why should it feel this way?"* | `/observe`, taste.md |
| **Glyph** | Craft | *"How do we achieve that feel?"* | `/craft`, `/ward` |
| **Rigor** | Correctness | *"What must be true?"* | `/rigor` |
| **Loa** | Architecture | *"What should we build?"* | `/architect`, etc. |
| **[Future]** | Voice | *"How should it speak?"* | TBD |

### The Nuance: Sigil vs Glyph

**Sigil** captures the artist's intuition — insights from user conversations, observations, inspiration. It answers *why* something should feel a certain way.

**Glyph** implements that feel — physics tables, animation best practices, WCAG compliance, React patterns, optimization. It answers *how* to achieve the feel.

They pair together:
- Sigil says: "Users want to feel confident before claiming"
- Glyph says: "Therefore: 800ms timing, confirmation required, prominent amount display"

### Composition

```
User talks to customers → /observe → Sigil learns taste (WHY)
                                          ↓
User crafts component  → /craft   → Glyph applies physics (HOW) + Sigil's taste
                                          ↓
User validates         → /ward    → Glyph checks compliance
                                          ↓
Web3 data flows        → /rigor   → Rigor enforces correctness (WHAT)
```

### Glyph Includes Best Practices

Glyph is not just physics tables. It's the craft knowledge:
- **Behavioral physics** — Timing, sync strategy, confirmation patterns
- **Animation** — Easing, springs, performance, reduced motion
- **Material** — Surface, shadow, radius, grit signatures
- **Accessibility** — WCAG, touch targets (44px), focus rings, contrast
- **React patterns** — Async, bundle optimization, re-render prevention (as best practices)

---

## Detailed Design

### 1. Sigil (Taste System)

**Purpose**: Capture and apply artist intuition from user conversations, observations, and inspiration.

**Philosophy**: Taste is NOT automated signal detection. Taste is:
- Insights from user conversations (Mom Test)
- Observations while using the product
- Stepping away and coming back with fresh eyes
- Inspiration from other products

#### Commands

| Command | Purpose |
|---------|---------|
| `/observe` | Capture user insight, add to taste log |

#### Files

```
.claude/
  rules/
    sigil/
      00-sigil-core.md       # Minimal philosophy (~50 lines)
      01-sigil-taste.md      # How to read/apply taste (~100 lines)
  skills/
    observing-users/         # Mom Test framework
  commands/
    observe.md               # Capture observations

grimoires/
  sigil/
    taste.md                 # Append-only insights (free-form)
    observations/            # Structured observation files
```

#### taste.md Format (Simplified)

```markdown
# Taste Log

Append-only. Free-form. No schema.

---

## 2026-01-25

Talked to power user about staking flow. They said "I just want to see my
number go up without thinking." Insight: The reward amount should be
prominent, not buried. Consider showing projected rewards on hover.

---

## 2026-01-24

Watched new user try to claim. They hesitated at the confirmation dialog -
too much text. Insight: Confirmation should be scannable, not a wall of text.
Maybe just: "Claim 1,234 HENLO?" with amount prominent.

---
```

No ACCEPT/MODIFY/REJECT weights. No diagnostic fields. Just human insights that Claude reads and applies intuitively.

---

### 2. Glyph (Design Physics)

**Purpose**: Apply correct behavioral, animation, and material physics to UI components.

**Philosophy**: Physics encodes user psychology into timing, motion, and surface. The physics table is the core - everything else supports it.

#### Commands

| Command | Purpose |
|---------|---------|
| `/craft` | Generate component with physics |
| `/ward` | Validate physics compliance |

#### Files

```
.claude/
  rules/
    glyph/
      00-glyph-core.md         # Instruction priority, permissions (~100 lines)
      01-glyph-physics.md      # THE physics table (~70 lines)
      02-glyph-detection.md    # Effect detection + keywords (~150 lines)
      03-glyph-protected.md    # Non-negotiable capabilities (~80 lines)
      04-glyph-patterns.md     # 3 golden patterns (~100 lines)
      05-glyph-animation.md    # Animation essentials (~80 lines)
      06-glyph-material.md     # Material essentials (~80 lines)
      07-glyph-practices.md    # Best practices: WCAG, React, optimization (~200 lines)
  skills/
    crafting-glyph/            # /craft agent
    warding-glyph/             # /ward agent
  commands/
    craft.md
    ward.md
```

**Total: ~860 lines** (includes best practices, down from 4,000+)

#### Best Practices (07-glyph-practices.md)

Consolidated from React rules, distilled to essentials:
- Accessibility: WCAG AA, touch targets, focus rings, contrast
- Async: Suspense boundaries, parallel fetching, no waterfalls
- Bundle: Direct imports, dynamic loading, preload on intent
- Performance: Memo, transitions, content-visibility

#### Physics Table (The Gem)

```
| Effect      | Sync        | Timing | Confirmation |
|-------------|-------------|--------|--------------|
| Financial   | Pessimistic | 800ms  | Required     |
| Destructive | Pessimistic | 600ms  | Required     |
| Soft Delete | Optimistic  | 200ms  | Toast+Undo   |
| Standard    | Optimistic  | 200ms  | None         |
| Navigation  | Immediate   | 150ms  | None         |
| Local       | Immediate   | 100ms  | None         |
```

This 6-row table encodes 80% of Sigil's value. Everything else supports applying it correctly.

#### Simplified /craft Flow

```
1. Parse input for effect keywords
2. Detect effect type (Financial/Destructive/Standard/Local)
3. Look up physics from table
4. Check protected capabilities
5. Read taste.md for relevant insights
6. Show compact analysis:

   ┌─ Glyph ───────────────────────────────┐
   │ ClaimButton · Financial               │
   │ Pessimistic | 800ms | Confirm         │
   │ Taste: "amount should be prominent"   │
   └───────────────────────────────────────┘
   Apply? (y/n)

7. Generate complete code
8. Done (no logging, no state tracking)
```

**Removed from /craft:**
- Pre-flight checks (feedback-first, session memory, loop detection, PRD check)
- Mode detection (hammer/chisel/debug/explore)
- TodoWrite progress tracking
- Taste signal logging (manual via /observe instead)
- Session health warnings

---

### 3. Rigor (Data Correctness)

**Purpose**: Prevent data bugs in Web3 flows. Enforce correctness over feel.

**Philosophy**: Different from Glyph. Glyph is about feel. Rigor is about correctness. A component can feel right but be wrong (showing stale balance).

#### Commands

| Command | Purpose |
|---------|---------|
| `/rigor` | Validate data correctness in component |

#### Files

```
.claude/
  rules/
    rigor/
      00-rigor-core.md       # Philosophy: correctness over feel (~50 lines)
      01-rigor-data.md       # Indexed vs on-chain decisions (~100 lines)
      02-rigor-web3.md       # BigInt, receipts, stale closures (~150 lines)
  skills/
    enforcing-rigor/         # /rigor agent
  commands/
    rigor.md
```

**Total: ~300 lines** (extracted from current 19-20 rules)

#### Key Rules

```
| Use Case            | Source    | Rationale                    |
|---------------------|-----------|------------------------------|
| Display (read-only) | Indexed   | Faster UX, acceptable stale  |
| Transaction amounts | On-chain  | Must be accurate for tx      |
| Button visibility   | On-chain  | Prevents failed tx           |
| Balance display     | On-chain  | Users verify before tx       |
```

```
# BigInt Safety
if (amount)           # WRONG: 0n is falsy
if (amount != null && amount > 0n)  # CORRECT
```

---

### 4. Loa (Unchanged - Just Clarify Boundary)

**Purpose**: Orchestrate architecture, sprints, planning, and reviews.

**Boundary**: Loa handles the "what to build" and "how to ship". Sigil/Glyph/Rigor handle the "how it should feel/work".

**Commands that stay with Loa:**
- /architect, /plan-and-analyze
- /sprint-plan, /implement, /review-sprint, /audit-sprint
- /ride, /understand
- /translate, /feedback
- /deploy-production, /audit-deployment

---

## Migration Plan

### Phase 1: Delete Dead Code (Immediate)

```bash
# Dead skills
rm -rf .claude/skills/changelog-generation
rm -rf .claude/skills/mounting-framework
rm -rf .claude/skills/synthesizing-taste
rm -rf .claude/skills/updating-framework
rm -rf .claude/skills/updating-sigil

# Theoretical rules
rm .claude/rules/18-sigil-complexity.md
rm .claude/rules/22-sigil-anchor-lens.md
rm .claude/rules/24-sigil-agentation.md

# HUD (premature)
rm .claude/rules/23-sigil-hud.md
```

**Impact**: ~2,000 lines removed, 0 functionality lost

### Phase 2: Archive Unused Commands

```bash
mkdir -p grimoires/archive/commands

# Keep: craft.md, observe.md, ward.md
# Move everything else
mv .claude/commands/animate.md grimoires/archive/commands/
mv .claude/commands/behavior.md grimoires/archive/commands/
mv .claude/commands/style.md grimoires/archive/commands/
# ... (36 commands total)
```

**Impact**: 93% of commands archived, frequently used ones remain

### Phase 3: Consolidate React Rules into Glyph Best Practices

Instead of archiving React rules, distill them into `07-glyph-practices.md`:

```bash
# Create consolidated best practices file
# Extract essentials from 10-16 React rules into ~200 lines
# Then delete originals

rm .claude/rules/10-react-core.md
rm .claude/rules/11-react-async.md
rm .claude/rules/12-react-bundle.md
rm .claude/rules/13-react-rendering.md
rm .claude/rules/14-react-rerender.md
rm .claude/rules/15-react-server.md
rm .claude/rules/16-react-js.md
rm .claude/rules/17-semantic-search.md
```

**Impact**: 1,900+ lines consolidated to ~200 lines of essential best practices

### Phase 4: Restructure into Constructs

```bash
# Create new structure
mkdir -p .claude/rules/sigil
mkdir -p .claude/rules/glyph
mkdir -p .claude/rules/rigor

# Move and rename files (see detailed mapping below)
```

#### File Mapping

| Current | New Location | Action |
|---------|--------------|--------|
| 00-sigil-core.md | glyph/00-glyph-core.md | Simplify to 100 lines |
| 01-sigil-physics.md | glyph/01-glyph-physics.md | Keep as-is |
| 02-sigil-detection.md | glyph/02-glyph-detection.md | Merge lexicon keywords |
| 03-sigil-patterns.md | glyph/04-glyph-patterns.md | Trim to 3 patterns |
| 04-sigil-protected.md | glyph/03-glyph-protected.md | Keep as-is |
| 05-sigil-animation.md | glyph/05-glyph-animation.md | Trim essentials |
| 06-sigil-taste.md | sigil/01-sigil-taste.md | Rewrite for intuition |
| 07-sigil-material.md | glyph/06-glyph-material.md | Trim essentials |
| 08-sigil-lexicon.md | (deleted) | Merge into 02-detection |
| 10-16 React rules | glyph/07-glyph-practices.md | Consolidate to ~200 lines |
| 17-semantic-search.md | (deleted) | Not needed |
| 19-sigil-data-physics.md | rigor/01-rigor-data.md | Move |
| 20-sigil-web3-flows.md | rigor/02-rigor-web3.md | Move |
| 21-sigil-ui-copy.md | (archived) | Future Voice construct |
| rlm-core-summary.md | (deleted) | Merge into cores |

### Phase 5: Simplify Skills

**Keep:**
- observing-users/ → for /observe
- crafting-physics/ → for /craft (rename to crafting-glyph/)
- validating-physics/ → for /ward (rename to warding-glyph/)
- agent-browser/ → utility

**Create:**
- enforcing-rigor/ → for /rigor

**Delete:** All others (24 skills)

### Phase 6: Start Fresh with taste.md

Archive current taste.md, create new free-form version.

```bash
# Archive existing
mv grimoires/sigil/taste.md grimoires/archive/taste-legacy.md

# Create fresh taste.md
cat > grimoires/sigil/taste.md << 'EOF'
# Taste Log

Append-only insights from user conversations, observations, and inspiration.
No schema. No weights. Just human insights that Claude reads and applies.

---

EOF
```

### Phase 7: Archive UI Copy for Future Voice Construct

```bash
mkdir -p grimoires/archive/future-voice
mv .claude/rules/21-sigil-ui-copy.md grimoires/archive/future-voice/
```

**Impact**: Seed material preserved for future Voice construct

---

## Success Metrics

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Rule lines | 6,231 | ~1,310 | <1,500 |
| Skills | 29 | 5 | <10 |
| Commands | 46 | 4 | <5 |
| Context/session | ~10k tokens | ~2.5k tokens | <3k |
| /craft steps | 11 | 5 | <6 |
| Constructs | 1 (monolith) | 3 (focused) | 3-4 |

### Line Count Breakdown

| Construct | Lines | Purpose |
|-----------|-------|---------|
| Sigil | ~150 | Taste (core + taste guide) |
| Glyph | ~860 | Craft (physics + best practices) |
| Rigor | ~300 | Correctness (data + web3) |
| **Total** | **~1,310** | **79% reduction** |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Lose important functionality | Low | Medium | Git preserves history; archive don't delete |
| Over-simplify taste | Medium | High | Start minimal, add back based on actual use |
| Break existing workflows | Low | Low | Only 3 commands actively used |
| Glyph/Rigor confusion | Medium | Medium | Clear README in each directory |

---

## Out of Scope

- Loa restructuring (separate effort)
- New features (this is simplification only)
- Documentation updates (follow-on)
- External distribution (just for personal use)

---

## Decisions (Resolved)

1. **Agentation**: Cut. Re-add when actually used and understood.
2. **Lexicon keywords**: Merge into detection (no separate file).
3. **React rules**: Keep as Glyph best practices (part of craft knowledge).
4. **taste.md history**: Start fresh with free-form format.
5. **UI copy rules**: Future 4th construct (Voice). Cut from current scope.

## Future Constructs

| Construct | Domain | Status |
|-----------|--------|--------|
| **Voice** | Copy, terminology, tone | Future — seed from 21-sigil-ui-copy.md |
| **[Unnamed]** | Agentation/annotation | Future — when actually used |

---

## Appendix: Naming Rationale

| Name | Meaning | Fits Because |
|------|---------|--------------|
| **Sigil** | A symbol with magical significance | The mark of the artist's intuition |
| **Glyph** | A carved symbol with precise meaning | Encodes physics into precise rules |
| **Rigor** | Exactness, strictness | Data correctness demands precision |
| **Loa** | Spirits that guide | Orchestrates the larger journey |

All four follow the mystical/craft theme while having distinct purposes.

---

## Next Steps

1. **Review this PRD** ← You are here
2. **Approve to proceed**
3. **Execute Phase 1**: Delete dead code (immediate, safe)
4. **Execute Phase 2**: Archive unused commands
5. **Execute Phase 3**: Consolidate React → Glyph best practices
6. **Execute Phase 4**: Restructure into Sigil/Glyph/Rigor directories
7. **Execute Phase 5**: Simplify skills
8. **Execute Phase 6**: Fresh taste.md
9. **Execute Phase 7**: Archive UI copy for Voice
10. **Test**: Real /craft, /observe, /ward usage
11. **Iterate**: Based on friction
