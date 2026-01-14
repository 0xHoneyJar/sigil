---
name: "craft"
version: "12.4.0"
description: |
  Generate UI components with design physics AND material.
  Physics = how it behaves. Material = how it looks. Together = feel.
  Shows analysis before generating, learns from usage via taste.

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
      - "retro pixel badge"

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
  - path: ".claude/rules/07-sigil-material.md"
    required: true
    purpose: "Material system - fidelity, ergonomics, grit"
  - path: "grimoires/sigil/taste.md"
    required: false
    purpose: "Accumulated taste signals (read for patterns)"

outputs:
  - path: "src/components/$COMPONENT_NAME.tsx"
    type: "file"
    description: "Generated component with correct physics and material"

workflow_next: "garden"
---

# /craft

Generate UI components with correct physics and material.

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

# Check styling approach
grep -E "tailwind|styled-components|@emotion|css-modules" package.json
```

**1c. Read existing component** to understand:
- Import style (named vs default, path aliases)
- File structure (single file vs folder)
- Naming conventions (PascalCase, kebab-case files)

### Step 2: Detect Effect Type AND Material

**Physics Detection** (behavior):

| Priority | Check | Example |
|----------|-------|---------|
| 1. Types | Props with `Currency`, `Money`, `Wei`, `Balance` | Always financial |
| 2. Keywords | "claim", "delete", "like", "toggle" | See detection rules |
| 3. Context | "with undo", "for checkout", "wallet" | Modifies effect |

**Material Detection** (surface):

| Keyword | Material Treatment |
|---------|-------------------|
| glassmorphism | blur backdrop, transparency, subtle border |
| neumorphism | soft shadows, same-color depth |
| flat | no shadows, solid colors |
| elevated | shadow, slight lift |
| outlined | border only, transparent bg |
| ghost | no border, no bg |
| minimal | reduce visual elements |
| bold | increase weight/contrast |
| retro, pixel | apply grit signatures |

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
Material: [surface, gradient, shadow, grit]
---
```

**If user modifies** (edits the generated file):
```markdown
## [YYYY-MM-DD HH:MM] | MODIFY
Component: [name]
Effect: [type]
Physics: [what was generated]
Material: [what was generated]
Changed: [what user changed - physics? material? both?]
Learning: [infer the preference]
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

---

<user-request>
$ARGUMENTS
</user-request>
