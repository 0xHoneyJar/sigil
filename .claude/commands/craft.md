---
name: "craft"
version: "12.3.0"
description: |
  Generate UI components with design physics.
  Shows physics analysis before generating, like RAMS shows accessibility issues.
  Learns from usage via taste accumulation.

arguments:
  - name: "description"
    type: "string"
    required: true
    description: "What to build"
    examples:
      - "claim button"
      - "like button for posts"
      - "delete with undo"
      - "dark mode toggle"

context_files:
  - path: ".claude/rules/01-sigil-physics.md"
    required: true
    purpose: "Physics table and rationale"
  - path: ".claude/rules/02-sigil-detection.md"
    required: true
    purpose: "Effect detection rules with examples"
  - path: ".claude/rules/03-sigil-patterns.md"
    required: true
    purpose: "Golden pattern templates"
  - path: ".claude/rules/04-sigil-protected.md"
    required: true
    purpose: "Protected capabilities checklist"
  - path: ".claude/rules/05-sigil-animation.md"
    required: true
    purpose: "Animation physics - easing, timing by frequency, springs"
  - path: ".claude/rules/06-sigil-taste.md"
    required: true
    purpose: "Taste accumulation - learn from accept/modify/reject"
  - path: "grimoires/sigil/taste.md"
    required: false
    purpose: "Accumulated taste signals (read for patterns)"

outputs:
  - path: "src/components/$COMPONENT_NAME.tsx"
    type: "file"
    description: "Generated component with correct physics"

workflow_next: "garden"
---

# /craft

Generate UI components with correct design physics.

## Workflow

Execute these steps in order:

### Step 1: Discover Context

Before generating anything:

**1a. Read taste log** (if exists):
```
Read grimoires/sigil/taste.md
```
Look for patterns (3+ occurrences = apply automatically):
- Timing adjustments (user prefers faster/slower?)
- Animation preferences (springs vs easing?)
- Structure preferences (always adds loading states?)

**1b. Check libraries**:
```bash
# Check animation library
grep -E "framer-motion|react-spring|@emotion" package.json

# Check data fetching
grep -E "@tanstack/react-query|swr|apollo" package.json

# Check toast library
grep -E "sonner|react-hot-toast|react-toastify" package.json
```

**1c. Read existing component** to understand:
- Import style (named vs default, path aliases)
- File structure (single file vs folder)
- Naming conventions (PascalCase, kebab-case files)

### Step 2: Detect Effect Type

Parse the user's description for effect indicators:

| Priority | Check | Example |
|----------|-------|---------|
| 1. Types | Props with `Currency`, `Money`, `Wei`, `Balance` | Always financial |
| 2. Keywords | "claim", "delete", "like", "toggle" | See detection rules |
| 3. Context | "with undo", "for checkout", "wallet" | Modifies effect |

### Step 3: Show Physics Analysis

Display analysis in this exact format, then wait for confirmation:

```
┌─ Physics Analysis ─────────────────────────────────────┐
│                                                        │
│  Component:    [ComponentName]                         │
│  Effect:       [Effect type]                           │
│  Detected by:  [keyword/type/context that triggered]   │
│                                                        │
│  ┌─ Applied Physics ────────────────────────────────┐  │
│  │  Sync:         [Pessimistic/Optimistic/Immediate]│  │
│  │  Timing:       [Xms] [why this timing]           │  │
│  │  Confirmation: [Required/None/Toast+Undo]        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─ Animation ─────────────────────────────────────┐   │
│  │  Easing:       [ease-out/spring/ease-in-out]    │   │
│  │  Spring:       [stiffness, damping] (if spring) │   │
│  │  Entrance:     [Xms, curve]                     │   │
│  │  Exit:         [Xms, curve] (asymmetric)        │   │
│  │  Frequency:    [high/medium/low/rare]           │   │
│  │  Interruptible: [Yes/No]                        │   │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  Codebase:     [animation lib] + [data fetching lib]   │
│  Template:     [pattern from 03-sigil-patterns.md]     │
│                                                        │
│  Protected capabilities:                               │
│  [✓/✗] Cancel button                                  │
│  [✓/✗] Error recovery                                 │
│  [✓/✗] Balance display (if financial)                │
│  [✓/✗] Reduced motion support                        │
│                                                        │
└────────────────────────────────────────────────────────┘

Proceed with these physics? (yes / or describe what's different)
```

### Step 4: Wait for Confirmation

Do not generate code until user confirms or corrects.

If user corrects: Update analysis and show again.
If user confirms: Proceed to generation.

### Step 5: Generate Component

Generate code that:
- Uses discovered libraries (not assumed ones)
- Matches existing code style exactly
- Applies physics from analysis
- Includes all protected capabilities
- Has no comments (unless explaining physics override)

### Step 6: Suggest Next Step

After generating:
```
Component generated. Run /garden to check if it's becoming canonical.
```

### Step 7: Log Taste Signal

After user responds to the generated code, append to `grimoires/sigil/taste.md`:

**If user accepts** (says "yes", uses code, moves on):
```markdown
## [YYYY-MM-DD HH:MM] | ACCEPT
Component: [name]
Effect: [type]
Physics: [sync, timing, animation]
---
```

**If user modifies** (edits the generated file):
```markdown
## [YYYY-MM-DD HH:MM] | MODIFY
Component: [name]
Effect: [type]
Physics: [what was generated]
Changed: [what user changed]
Learning: [infer the preference - timing? animation? structure?]
---
```

**If user rejects** (says "no", "wrong", deletes, rewrites):
```markdown
## [YYYY-MM-DD HH:MM] | REJECT
Component: [name]
Reason: [user feedback if given]
---
```

---

## Detection Quick Reference

| Keywords | Effect | Sync | Timing | Easing |
|----------|--------|------|--------|--------|
| claim, deposit, withdraw, transfer, swap, stake | Financial | Pessimistic | 800ms | ease-out (deliberate) |
| delete, remove, destroy, revoke, burn | Destructive | Pessimistic | 600ms | ease-out (deliberate) |
| archive, trash, soft-delete, dismiss | Soft Delete | Optimistic | 200ms | spring(500, 30) |
| save, update, like, follow, create, bookmark | Standard | Optimistic | 200ms | spring(500, 30) |
| toggle, switch, expand, collapse, select | Local State | Immediate | 100ms | spring(700, 35) |
| command palette, keyboard nav, frequent hover | High-freq | Immediate | 0ms | none |

**Type Override**: `Currency`, `Money`, `Balance`, `Wei`, `Token`, `BigInt` in props → always Financial.

**Frequency Override**: If component is used 50+ times/day → reduce or remove animation regardless of effect type.

---

## Examples

### Example 1: Financial Component

```
User: /craft "claim button for staking rewards"

[Step 1: Discover] Found framer-motion, @tanstack/react-query, sonner
[Step 2: Detect] "claim" + "staking" → Financial

┌─ Physics Analysis ─────────────────────────────────────┐
│                                                        │
│  Component:    StakingClaimButton                      │
│  Effect:       Financial mutation                      │
│  Detected by:  "claim" keyword + "staking" context     │
│                                                        │
│  ┌─ Applied Physics ────────────────────────────────┐  │
│  │  Sync:         Pessimistic (server confirms)     │  │
│  │  Timing:       800ms (time to verify amount)     │  │
│  │  Confirmation: Required (two-phase)              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─ Animation ─────────────────────────────────────┐   │
│  │  Easing:       ease-out (deliberate)            │   │
│  │  Entrance:     300ms, ease-out                  │   │
│  │  Exit:         150ms, ease-in                   │   │
│  │  Frequency:    Low (occasional claim)           │   │
│  │  Interruptible: No (financial)                  │   │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  Codebase:     framer-motion + tanstack-query          │
│  Template:     ClaimButton from 03-sigil-patterns.md   │
│                                                        │
│  Protected capabilities:                               │
│  ✓ Cancel button                                      │
│  ✓ Error recovery                                     │
│  ✓ Amount display                                     │
│  ✓ Reduced motion support                            │
│                                                        │
└────────────────────────────────────────────────────────┘

Proceed with these physics? (yes / or describe what's different)

User: yes

[Generates component with framer-motion, useMutation, two-phase confirmation]
```

### Example 2: Correction Flow

```
User: /craft "rewards toggle"

┌─ Physics Analysis ─────────────────────────────────────┐
│                                                        │
│  Component:    RewardsToggle                           │
│  Effect:       Financial mutation                      │
│  Detected by:  "rewards" context (potential money)     │
│  ...                                                   │
└────────────────────────────────────────────────────────┘

Proceed with these physics?

User: no, this just toggles visibility of the rewards section, no server call

┌─ Physics Analysis (Corrected) ─────────────────────────┐
│                                                        │
│  Component:    RewardsToggle                           │
│  Effect:       Local state                             │
│  Detected by:  User override (UI visibility only)      │
│                                                        │
│  ┌─ Applied Physics ────────────────────────────────┐  │
│  │  Sync:         Immediate (no server)             │  │
│  │  Timing:       100ms instant                     │  │
│  │  Confirmation: None                              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─ Animation ─────────────────────────────────────┐   │
│  │  Easing:       spring (snappy)                  │   │
│  │  Spring:       stiffness: 700, damping: 35      │   │
│  │  Entrance:     100ms, spring                    │   │
│  │  Exit:         100ms, spring                    │   │
│  │  Frequency:    Medium (toggle during session)   │   │
│  │  Interruptible: Yes                             │   │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘

Proceed with these physics?

User: yes

[Generates local state toggle with spring animation]
```

### Example 3: Ambiguous Detection

```
User: /craft "fancy button"

┌─ Physics Analysis ─────────────────────────────────────┐
│                                                        │
│  ⚠ Could not detect effect from "fancy button"        │
│                                                        │
│  Help me understand:                                   │
│  • What happens when clicked?                          │
│  • Does it call a server?                              │
│  • Can it be undone?                                   │
│  • Does it involve money/tokens?                       │
│                                                        │
└────────────────────────────────────────────────────────┘

User: it submits a form to save user preferences

┌─ Physics Analysis ─────────────────────────────────────┐
│                                                        │
│  Component:    FancyButton                             │
│  Effect:       Standard mutation                       │
│  Detected by:  "save preferences" (user clarification) │
│  ...                                                   │
└────────────────────────────────────────────────────────┘
```

---

## Code Style

Generated code follows these rules:
- **No comments** unless explaining a physics override
- **No JSDoc** unless the project uses it
- **Match imports** to existing component style
- **Match naming** to existing conventions
- **Use discovered libraries** only (never assume)

---

## Automatic Inference

Infer these from effect type without asking:
- **Sync strategy** → from physics table
- **Timing** → from physics table
- **Confirmation** → from physics table
- **Easing type** → from animation physics (effect → easing)
- **Spring values** → from animation physics (effect → stiffness/damping)
- **Entrance/Exit asymmetry** → entrances slower than exits
- **Interruptibility** → financial/destructive = no, others = yes
- **Animation library** → from package.json discovery
- **Data fetching** → from package.json discovery
- **Toast library** → from package.json discovery

Animation frequency is inferred from context:
- Command palette, keyboard nav → high frequency → no animation
- Dropdowns, tooltips → medium frequency → fast animation
- Modals, confirmations → low frequency → standard animation
- Onboarding, celebrations → rare → can use longer animations

---

<user-request>
$ARGUMENTS
</user-request>
