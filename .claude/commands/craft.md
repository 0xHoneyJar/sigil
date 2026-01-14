---
name: "craft"
version: "12.8.0"
description: |
  Generate UI components with unified design physics.
  Three layers: Behavioral + Animation + Material = Feel.
  Shows analysis before generating. Learns from usage.

arguments:
  - name: "description"
    type: "string"
    required: true
    description: "What to build"
    examples:
      - "claim button"
      - "like button for posts"
      - "delete with undo"
      - "glassmorphism card"

context_files:
  - path: ".claude/rules/00-sigil-core.md"
    required: true
    purpose: "Core instructions, priority hierarchy, action behavior"
  - path: ".claude/rules/01-sigil-physics.md"
    required: true
    purpose: "Behavioral physics - sync, timing, confirmation"
  - path: ".claude/rules/02-sigil-detection.md"
    required: true
    purpose: "Effect detection with examples"
  - path: ".claude/rules/03-sigil-patterns.md"
    required: true
    purpose: "Golden pattern templates"
  - path: ".claude/rules/04-sigil-protected.md"
    required: true
    purpose: "Protected capabilities (non-negotiable)"
  - path: ".claude/rules/05-sigil-animation.md"
    required: true
    purpose: "Animation physics - easing, springs, frequency"
  - path: ".claude/rules/06-sigil-taste.md"
    required: true
    purpose: "Taste accumulation - learn from usage"
  - path: ".claude/rules/07-sigil-material.md"
    required: true
    purpose: "Material physics - surface, fidelity, grit"
  - path: ".claude/rules/08-sigil-lexicon.md"
    required: true
    purpose: "Lookup tables - keywords, adjectives, domains"
  - path: "grimoires/sigil/taste.md"
    required: false
    purpose: "Accumulated taste signals"

outputs:
  - path: "src/components/$COMPONENT_NAME.tsx"
    type: "file"
    description: "Generated component with unified physics"

workflow_next: "garden"
---

# /craft

Generate UI components with unified design physics (behavioral + animation + material).

<workflow>
## Workflow

Execute these steps in order. After confirmation, generate complete working code — don't just describe what to build.

<step_1>
### Step 1: Discover Context

Before generating, gather this information:

**1a. Read taste log** (if exists):
```
Read grimoires/sigil/taste.md
```
Look for patterns with 3+ occurrences — apply these automatically and mention in analysis.

**1b. Discover codebase conventions**:
```bash
# Animation library
grep -E "framer-motion|react-spring|@emotion" package.json

# Data fetching
grep -E "@tanstack/react-query|swr|apollo" package.json

# Toast library
grep -E "sonner|react-hot-toast|react-toastify" package.json

# Styling approach
grep -E "tailwind|styled-components|@emotion" package.json
```

**1c. Read an existing component** to match:
- Import style (named vs default, path aliases)
- File structure (single file vs folder)
- Naming conventions
</step_1>

<step_2>
### Step 2: Detect Effect and Material

**Effect Detection** (determines behavioral + animation physics):

| Priority | Signal | Example |
|----------|--------|---------|
| 1. Types | Props with `Currency`, `Money`, `Wei` | Always Financial |
| 2. Keywords | "claim", "delete", "like", "toggle" | See 02-sigil-detection.md |
| 3. Context | "with undo", "for wallet" | Modifies effect |

**Material Detection** (determines surface physics):

| Keyword | Treatment |
|---------|-----------|
| glassmorphism | blur backdrop, subtle border |
| elevated | shadow, slight lift |
| flat | no shadows, solid colors |
| outlined | border only |
| retro, pixel | grit signatures |
| (no keyword) | Infer from effect: Financial→Elevated, Standard→Flat |
</step_2>

<step_3>
### Step 3: Show Physics Analysis

Display analysis in this exact format, then wait for confirmation:

```
┌─ Physics Analysis ─────────────────────────────────────┐
│                                                        │
│  Component:    [ComponentName]                         │
│  Effect:       [Effect type]                           │
│  Detected by:  [keyword/type/context that triggered]   │
│                                                        │
│  ┌─ Behavioral ────────────────────────────────────┐   │
│  │  Sync:         [Pessimistic/Optimistic/Immediate]│  │
│  │  Timing:       [Xms] [why this timing]          │   │
│  │  Confirmation: [Required/None/Toast+Undo]       │   │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─ Animation ─────────────────────────────────────┐   │
│  │  Easing:       [ease-out/spring]                │   │
│  │  Spring:       [stiffness, damping]             │   │
│  │  Entrance:     [Xms] / Exit: [Xms]              │   │
│  │  Interruptible: [Yes/No]                        │   │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─ Material ──────────────────────────────────────┐   │
│  │  Surface:      [flat/elevated/glass/retro]      │   │
│  │  Shadow:       [None/soft/elevated/hard]        │   │
│  │  Border:       [None/subtle/solid]              │   │
│  │  Radius:       [Xpx]                            │   │
│  │  Grit:         [Clean/Subtle/Retro/Pixel]       │   │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  Codebase:     [styling] + [animation] + [data]        │
│                                                        │
│  Protected:                                            │
│  [✓/✗] Cancel  [✓/✗] Error recovery  [✓/✗] 44px      │
│  [✓/✗] Focus ring  [✓/✗] Reduced motion              │
│                                                        │
└────────────────────────────────────────────────────────┘

Proceed? (yes / or describe what's different)
```
</step_3>

<step_4>
### Step 4: Wait for Confirmation

Do not generate code until user confirms or corrects.

- **If user corrects**: Update analysis and show again
- **If user confirms**: Proceed immediately to generation
</step_4>

<step_5>
### Step 5: Generate Component

After confirmation, generate complete working code that:

- Uses discovered libraries (don't assume — check package.json)
- Matches existing code style exactly
- Applies all three physics layers from analysis
- Includes all protected capabilities (verify checklist)
- Has no comments (unless explaining physics override)

Generate the full component. Don't describe what to build — build it.
</step_5>

<step_6>
### Step 6: Get Feedback

After generating, use AskUserQuestion to get structured feedback:

```
Question: "Does this feel right?"
Header: "Feel check"
Options:
  - "Yes, feels right" → proceed to log ACCEPT
  - "Timing/behavior is off" → note for /behavior focus
  - "Animation feels off" → note for /animate focus
  - "Style/look is off" → note for /style focus
  - (Other) → free text correction
```

**If "Yes"**: Log ACCEPT, mark complete if in CRAFT.md loop.

**If correction**:
1. Add to Signs in CRAFT.md (if in loop)
2. Suggest the focused command: "Try `/behavior` to adjust timing"
3. Regenerate with correction applied
</step_6>

<step_7>
### Step 7: Log Taste Signal

After user responds, append to `grimoires/sigil/taste.md`:

**ACCEPT** (user confirms and uses code):
```markdown
## [YYYY-MM-DD HH:MM] | ACCEPT
Component: [name]
Effect: [type]
Physics: [behavioral, animation, material summary]
---
```

**MODIFY** (user edits generated code):
```markdown
## [YYYY-MM-DD HH:MM] | MODIFY
Component: [name]
Changed: [what user changed]
Learning: [infer the preference]
---
```

**REJECT** (user says no or rewrites):
```markdown
## [YYYY-MM-DD HH:MM] | REJECT
Component: [name]
Reason: [user feedback if given]
---
```
</step_7>
</workflow>

---

<quick_reference>
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
</quick_reference>

---

<examples>
## Examples

### Example 1: Financial Component

```
User: /craft "claim button for staking rewards"

[Step 1: Discover] Found tailwind, framer-motion, @tanstack/react-query
[Step 2: Detect] "claim" + "staking" → Financial effect

┌─ Physics Analysis ─────────────────────────────────────┐
│                                                        │
│  Component:    StakingClaimButton                      │
│  Effect:       Financial mutation                      │
│  Detected by:  "claim" keyword + "staking" context     │
│                                                        │
│  ┌─ Behavioral ────────────────────────────────────┐   │
│  │  Sync:         Pessimistic (server confirms)    │   │
│  │  Timing:       800ms (time to verify amount)    │   │
│  │  Confirmation: Required (two-phase)             │   │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─ Animation ─────────────────────────────────────┐   │
│  │  Easing:       ease-out (deliberate)            │   │
│  │  Entrance:     300ms / Exit: 150ms              │   │
│  │  Interruptible: No (financial)                  │   │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─ Material ──────────────────────────────────────┐   │
│  │  Surface:      Elevated (trust through weight)  │   │
│  │  Shadow:       soft (1 layer)                   │   │
│  │  Border:       solid, visible                   │   │
│  │  Radius:       8px                              │   │
│  │  Grit:         Clean                            │   │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  Protected:                                            │
│  ✓ Cancel  ✓ Error recovery  ✓ 44px  ✓ Focus ring   │
│                                                        │
└────────────────────────────────────────────────────────┘

Proceed? (yes / or describe what's different)

User: yes

[Generates component with unified physics]
```

### Example 2: Material-Focused Component

```
User: /craft "glassmorphism card for wallet balance"

[Step 1: Discover] Found tailwind, framer-motion
[Step 2: Detect] "wallet balance" → display, "glassmorphism" → material keyword

┌─ Physics Analysis ─────────────────────────────────────┐
│                                                        │
│  Component:    WalletBalanceCard                       │
│  Effect:       Display only                            │
│  Detected by:  "balance" (read) + "glassmorphism"      │
│                                                        │
│  ┌─ Behavioral ────────────────────────────────────┐   │
│  │  Sync:         None (display only)              │   │
│  │  Timing:       0ms (static content)             │   │
│  │  Confirmation: None                             │   │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─ Animation ─────────────────────────────────────┐   │
│  │  Easing:       fade-in on mount                 │   │
│  │  Entrance:     200ms / Exit: 150ms              │   │
│  │  Interruptible: Yes                             │   │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─ Material ──────────────────────────────────────┐   │
│  │  Surface:      Glass                            │   │
│  │  Shadow:       lg (depth behind blur)           │   │
│  │  Border:       1px white/20                     │   │
│  │  Radius:       16px                             │   │
│  │  Backdrop:     blur-xl                          │   │
│  │  Grit:         Clean                            │   │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘

Proceed? (yes / or describe what's different)

User: yes

[Generates glassmorphism card with unified physics]
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
</examples>

---

<user-request>
$ARGUMENTS
</user-request>
