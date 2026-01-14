---
name: "surface"
version: "12.4.0"
description: |
  Apply material physics to components.
  Use when you only need surface treatment (no behavioral physics).
  For full physics (behavioral + animation + material), use /craft.

arguments:
  - name: "description"
    type: "string"
    required: true
    description: "What surface treatment to apply"
    examples:
      - "glassmorphism card"
      - "minimal outline button"
      - "retro pixel badge"
      - "elevated card with soft shadow"

context_files:
  - path: ".claude/rules/07-sigil-material.md"
    required: true
    purpose: "Material constraints and fidelity rules"
  - path: ".claude/rules/05-sigil-animation.md"
    required: true
    purpose: "Animation physics for surface transitions"
  - path: ".claude/rules/06-sigil-taste.md"
    required: true
    purpose: "Taste accumulation for material preferences"
  - path: "grimoires/sigil/taste.md"
    required: false
    purpose: "Accumulated taste signals (read for patterns)"

outputs:
  - path: "src/components/$COMPONENT_NAME.tsx"
    type: "file"
    description: "Component with correct material treatment"
---

# /surface

Apply material treatment to components. Surface = how it looks.

## Workflow

Execute these steps in order:

### Step 1: Discover Context

**1a. Read taste log** (if exists):
```
Read grimoires/sigil/taste.md
```
Look for material patterns:
- Color preferences (user prefers certain palette?)
- Shadow preferences (soft vs none?)
- Border styles (outline vs filled?)
- Grit level (clean vs textured?)

**1b. Check libraries**:
```bash
# Check styling approach
grep -E "tailwind|styled-components|@emotion|css-modules" package.json

# Check component library
grep -E "@radix|@headlessui|shadcn|chakra" package.json
```

**1c. Read existing component** for:
- Class naming conventions (cn, clsx, classnames)
- Color system (CSS variables, Tailwind theme)
- Design tokens if any

### Step 2: Detect Material Intent

Parse description for surface cues:

| Keyword | Material Treatment |
|---------|-------------------|
| glassmorphism | blur backdrop, transparency, subtle border |
| neumorphism | soft inner/outer shadows, same-color depth |
| flat | no shadows, solid colors, sharp or rounded |
| elevated | shadow, slight lift from surface |
| outlined | border only, transparent background |
| ghost | no border, no background, text/icon only |
| gradient | brand gradient, max 2 stops |
| minimal | reduce all visual elements |
| bold | increase weight, contrast, presence |
| retro, pixel | apply grit signatures |
| soft | rounded corners, muted colors, gentle shadows |

### Step 3: Show Material Analysis

Display analysis in this exact format, then wait for confirmation:

```
┌─ Material Analysis ────────────────────────────────────┐
│                                                        │
│  Component:    [ComponentName]                         │
│  Surface:      [glassmorphism/flat/elevated/etc]       │
│  Detected by:  [keyword/context that triggered]        │
│                                                        │
│  ┌─ Fidelity ─────────────────────────────────────┐   │
│  │  Gradient:    [None/2-stop/brand]              │   │
│  │  Shadow:      [None/soft/elevated]             │   │
│  │  Border:      [None/subtle/solid]              │   │
│  │  Radius:      [Xpx]                            │   │
│  │  Backdrop:    [None/blur]                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
│  ┌─ Color ────────────────────────────────────────┐   │
│  │  Primary:     [color]                          │   │
│  │  States:      [hover/active/focus approach]    │   │
│  │  Contrast:    [ratio] ✓/✗                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
│  ┌─ Grit ─────────────────────────────────────────┐   │
│  │  Profile:     [Clean/Subtle/Retro/Pixel]       │   │
│  │  Edge:        [0-1]                            │   │
│  │  Banding:     [0-1]                            │   │
│  │  Noise:       [0-1]                            │   │
│  │  Chunky:      [0-1]                            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
│  Ergonomics:                                           │
│  [✓/✗] Touch target ≥44px                            │
│  [✓/✗] Focus ring visible                            │
│  [✓/✗] Contrast ≥4.5:1                               │
│                                                        │
└────────────────────────────────────────────────────────┘

Proceed with this material? (yes / or describe what's different)
```

### Step 4: Wait for Confirmation

Do not generate code until user confirms or corrects.

If user corrects: Update analysis and show again.
If user confirms: Proceed to generation.

### Step 5: Generate Styled Component

Generate code that:
- Uses discovered styling approach (Tailwind, CSS-in-JS, etc)
- Matches existing design tokens
- Applies material from analysis
- Includes all state variants (hover, active, focus, disabled)
- Meets ergonomic minimums

### Step 6: Log Taste Signal

After user responds, append to `grimoires/sigil/taste.md`:

**If user accepts**:
```markdown
## [YYYY-MM-DD HH:MM] | ACCEPT
Component: [name]
Surface: [treatment type]
Material: [gradient, shadow, border, grit profile]
---
```

**If user modifies**:
```markdown
## [YYYY-MM-DD HH:MM] | MODIFY
Component: [name]
Surface: [treatment type]
Material: [what was generated]
Changed: [what user changed]
Learning: [infer the preference]
---
```

**If user rejects**:
```markdown
## [YYYY-MM-DD HH:MM] | REJECT
Component: [name]
Reason: [user feedback if given]
---
```

---

## Material Quick Reference

| Surface | Gradient | Shadow | Border | Blur | Grit |
|---------|----------|--------|--------|------|------|
| glassmorphism | None | lg | white/20 | Yes | Clean |
| neumorphism | None | soft dual | None | No | Clean |
| flat | None | None | Optional | No | Clean |
| elevated | None | md-lg | None | No | Clean |
| outlined | None | None | solid | No | Clean |
| ghost | None | None | None | No | Clean |
| retro | None | hard | solid 2px | No | Retro |
| pixel | None | None | solid 2px | No | Pixel |

---

## Examples

### Example 1: Glassmorphism Card

```
User: /surface "glassmorphism card for dashboard"

┌─ Material Analysis ────────────────────────────────────┐
│                                                        │
│  Component:    DashboardCard                           │
│  Surface:      Glassmorphism                           │
│  Detected by:  "glassmorphism" keyword                 │
│                                                        │
│  ┌─ Fidelity ─────────────────────────────────────┐   │
│  │  Gradient:    None                             │   │
│  │  Shadow:      lg (0 25px 50px -12px)           │   │
│  │  Border:      1px white/20                     │   │
│  │  Radius:      16px                             │   │
│  │  Backdrop:    blur-xl (24px)                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
│  ┌─ Grit ─────────────────────────────────────────┐   │
│  │  Profile:     Clean                            │   │
│  │  Edge: 0  Banding: 0  Noise: 0  Chunky: 0      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
└────────────────────────────────────────────────────────┘

Proceed with this material?

User: yes

[Generates glassmorphism card component]
```

### Example 2: Retro Button

```
User: /surface "retro pixel button for game UI"

┌─ Material Analysis ────────────────────────────────────┐
│                                                        │
│  Component:    GameButton                              │
│  Surface:      Retro/Pixel                             │
│  Detected by:  "retro pixel" + "game" context          │
│                                                        │
│  ┌─ Fidelity ─────────────────────────────────────┐   │
│  │  Gradient:    None                             │   │
│  │  Shadow:      hard (2px 2px 0 black)           │   │
│  │  Border:      2px solid black                  │   │
│  │  Radius:      0px (sharp)                      │   │
│  │  Backdrop:    None                             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
│  ┌─ Grit ─────────────────────────────────────────┐   │
│  │  Profile:     Pixel                            │   │
│  │  Edge: 0.8  Banding: 0.8  Noise: 0  Chunky: 0.9│   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
└────────────────────────────────────────────────────────┘

Proceed with this material?

User: yes

[Generates pixel-art styled button]
```

---

## When to Use /surface vs /craft

| Situation | Command |
|-----------|---------|
| New interactive component | `/craft` (all three physics layers) |
| Decorative/layout element | `/surface` (material physics only) |
| Restyling existing component | `/surface` |
| Component with server effects | `/craft` |
| Pure visual treatment | `/surface` |

**Rule of thumb**: `/craft` = behavioral + animation + material. `/surface` = material only.

---

<user-request>
$ARGUMENTS
</user-request>
