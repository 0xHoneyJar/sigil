# Sprint 4 Implementation Report: Sigil v2 Guidance

**Sprint**: Sprint 4 - Guidance
**Status**: Complete
**Date**: 2026-01-01

---

## Summary

Implemented the guidance phase of Sigil v2, enabling design guidance during implementation (`/craft`), human sign-off (`/approve`), and motion recipe templates for each zone.

---

## Tasks Completed

### SIGIL-9: Implement /craft Command ✅

**Files Created**:
- `.claude/commands/craft.md`
- `.claude/skills/sigil-crafting/index.yaml`
- `.claude/skills/sigil-crafting/SKILL.md`

**Features**:
- Pre-flight check for `.sigil-setup-complete`
- Loads `sigil-mark/moodboard.md` for feel context
- Loads `sigil-mark/rules.md` for design rules
- Zone detection via `get-zone.sh` when file path provided
- Three modes:
  1. General guidance (no arguments)
  2. Zone-specific guidance (file path argument)
  3. Question answering (question argument)
- Warns about rejected patterns (never refuses)
- Purely conversational (no file output)

### SIGIL-10: Implement /approve Command ✅

**Files Created**:
- `.claude/commands/approve.md`
- `.claude/skills/sigil-approving/index.yaml`
- `.claude/skills/sigil-approving/SKILL.md`

**Features**:
- Pre-flight checks for setup and rules.md
- Takes component or pattern name as argument
- Presents applicable rules for review
- Uses AskUserQuestion for approval decision
- Asks for approver identity
- Records approval in rules.md Approvals section
- Handles existing approvals (re-approve, revoke, keep)
- Simple approve/reject/skip flow

### SIGIL-11: Recipe Templates ✅

**Files Created**:
- `templates/recipes/useDeliberateEntrance.ts`
- `templates/recipes/usePlayfulBounce.ts`
- `templates/recipes/useSnappyTransition.ts`
- `templates/recipes/README.md`

**Features**:

#### useDeliberateEntrance.ts (Critical Zone)
- 800ms+ entrance timing
- Heavy spring (tension: 120, friction: 14, mass: 1.2)
- JSDoc explaining zone and feel
- Includes `useDeliberateStagger` for lists
- Works with react-spring

#### usePlayfulBounce.ts (Marketing Zone)
- Bouncy spring (stiffness: 200, damping: 10)
- Includes `bounce()` trigger
- Includes `useAttentionPulse` for CTAs
- Includes `useStaggerReveal` for content
- Works with react-spring

#### useSnappyTransition.ts (Admin Zone)
- <200ms timing
- Clamped spring (no overshoot)
- Includes `useInstantFeedback` for buttons
- Includes `useQuickFade` for content switching
- Includes `useSnappyCollapse` for expandables
- Works with react-spring

#### README.md
- Installation instructions
- Usage examples for each recipe
- Zone selection guide
- Framer-motion adaptation guide
- Spring-to-duration mapping

---

## File Structure

```
.claude/
├── commands/
│   ├── craft.md                      # /craft command
│   └── approve.md                    # /approve command
└── skills/
    ├── sigil-crafting/
    │   ├── index.yaml
    │   └── SKILL.md
    └── sigil-approving/
        ├── index.yaml
        └── SKILL.md

templates/
└── recipes/
    ├── README.md                     # Usage guide
    ├── useDeliberateEntrance.ts      # Critical zone
    ├── usePlayfulBounce.ts           # Marketing zone
    └── useSnappyTransition.ts        # Admin zone
```

---

## Acceptance Criteria Met

### SIGIL-9: /craft command
- [x] Checks for .sigil-setup-complete (preflight)
- [x] Loads moodboard.md into context
- [x] Loads rules.md into context
- [x] Determines zone from file path (if provided)
- [x] Answers questions about design patterns
- [x] Suggests recipes based on zone
- [x] Warns about rejected patterns (doesn't refuse)
- [x] Purely conversational (no file output)

### SIGIL-10: /approve command
- [x] Checks for .sigil-setup-complete (preflight)
- [x] Takes component or pattern name as argument
- [x] Reads applicable rules from rules.md
- [x] Presents for human review via AskUserQuestion
- [x] Records approval in rules.md Approvals section
- [x] Includes date and approver
- [x] Simple approve/reject (no automated validation)

### SIGIL-11: Recipe templates
- [x] useDeliberateEntrance.ts template
- [x] usePlayfulBounce.ts template
- [x] useSnappyTransition.ts template
- [x] Each with JSDoc explaining zone and feel
- [x] Works with react-spring (can adapt to framer-motion)

---

## /craft Guidance Modes

### Mode 1: General Guidance

```
/craft
```

Provides overview of design context without zone-specific focus.

### Mode 2: Zone-Specific

```
/craft src/features/checkout/Cart.tsx
```

Detects zone via `get-zone.sh`, applies zone-specific patterns.

### Mode 3: Question Answering

```
/craft "How should loading states work?"
```

Answers based on moodboard and rules context.

---

## /approve Interview Flow

1. **Present Context**: Show applicable rules for target
2. **Decision**: Approve / Reject / Skip
3. **Approver**: Me / Design lead / Team / Custom
4. **Record**: Update rules.md Approvals section

---

## Recipe Spring Configurations

| Recipe | Tension | Friction | Mass | Notes |
|--------|---------|----------|------|-------|
| Deliberate | 120 | 14 | 1.2 | Slow, weighty |
| Playful | 200 | 10 | 1 | Bouncy, energetic |
| Snappy | 400 | 30 | 1 | Fast, clamped |

---

## Notes

- Recipes use `@react-spring/web` but README includes framer-motion adaptation
- Each recipe includes utility hooks for common patterns
- /craft never refuses - always warns and offers alternatives
- /approve has no automated validation - human accountability

---

## Sprint 4 Success Criteria

- [x] `/craft` provides contextual design guidance
- [x] `/approve` records human sign-off
- [x] Recipe templates are usable
- [x] Full workflow functional: setup → envision → codify → craft → approve

---

## Sigil v2 Complete

With Sprint 4 complete, the full Sigil workflow is now functional:

```
/setup → /envision → /codify → /craft → /approve
         ↓
      /inherit (for existing codebases)
```

Ready for deployment to target repository.
