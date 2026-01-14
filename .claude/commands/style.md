---
name: "style"
version: "13.0.0"
description: |
  Apply material physics only.
  Use when looks are wrong but behavior is fine.
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

# /style

Apply material physics to components. Material = how it looks.

<action_default>
## Action Default

CRITICAL: After user confirms analysis, apply material changes immediately.

DO:
- Edit the component with new material values
- Match existing styling approach (Tailwind, CSS-in-JS, etc.)
- Include all state variants (hover, active, focus, disabled)

DO NOT:
- Describe what you would change
- Ask "would you like me to apply this?"
- Rewrite behavioral or animation code
- Add comments unless explaining override
</action_default>

<permissions>
## Permission Boundaries

**Proactive** (do without asking):
- Read package.json, existing components, taste.md
- Show material analysis
- Detect surface from keywords

**Requires confirmation** (ask first):
- Modify component styles
- Override material defaults

**Never** (even if asked):
- Change behavioral physics (sync, timing, confirmation)
- Change animation physics (easing, springs)
- Delete components
</permissions>

<output_modes>
## Output Modes

**Compact mode** (default after 5+ accepts):
```
[ComponentName] | Surface: [type] | Shadow: [value] | Radius: [Xpx]
Grit: [profile] | Ergonomics: [pass/fail]

Apply? (y/n)
```

**Verbose mode** (default for new users):
Full analysis box with fidelity, color, and grit sections.
</output_modes>

<workflow>
## Workflow

<step_0>
### Step 0: Track Progress

Use TodoWrite:
```
1. [ ] Discover context
2. [ ] Detect material intent
3. [ ] Show analysis
4. [ ] Get confirmation
5. [ ] Apply styles
6. [ ] Collect feedback
7. [ ] Log taste
```
</step_0>

<step_1>
### Step 1: Discover Context

**1a. Read taste log** (if exists):
Look for material patterns:
- Shadow preferences (soft vs none)
- Border styles (outline vs filled)
- Radius preferences
- Grit level

**1b. Check styling approach** (single read of package.json):
- `tailwindcss` → utility classes
- `styled-components` / `@emotion` → CSS-in-JS
- `css-modules` → scoped CSS

**1c. Read existing component** for:
- Class naming conventions (cn, clsx, classnames)
- Color system (CSS variables, Tailwind theme)
- Design tokens if any
</step_1>

<step_2>
### Step 2: Detect Material Intent

Parse description for surface cues:

| Keyword | Treatment |
|---------|-----------|
| glassmorphism | blur backdrop, transparency, subtle border |
| neumorphism | soft inner/outer shadows, same-color depth |
| flat | no shadows, solid colors |
| elevated | shadow, slight lift |
| outlined | border only, transparent bg |
| ghost | no border, no bg, text/icon only |
| gradient | brand gradient, max 2 stops |
| minimal | reduce all visual elements |
| bold | increase weight, contrast |
| retro, pixel | apply grit signatures |
| soft | rounded corners, muted colors |
</step_2>

<step_3>
### Step 3: Show Material Analysis

**If compact mode:**
```
[ComponentName] | Surface: [type] | Shadow: [value] | Radius: [Xpx]
Grit: [profile] | Ergonomics: [✓ pass / ✗ fail]

Apply? (y/n)
```

**If verbose mode:**
```
┌─ Material Analysis ────────────────────────────────────┐
│                                                        │
│  Component:    [ComponentName]                         │
│  Surface:      [glassmorphism/flat/elevated/etc]       │
│  Detected by:  [keyword/context]                       │
│                                                        │
│  Fidelity:     Gradient: [None/2-stop]                │
│                Shadow: [None/soft/elevated]           │
│                Border: [None/subtle/solid]            │
│                Radius: [Xpx]                          │
│                Backdrop: [None/blur]                  │
│                                                        │
│  Grit:         [Clean/Subtle/Retro/Pixel]             │
│                                                        │
│  Ergonomics:                                           │
│  [✓/✗] Touch ≥44px  [✓/✗] Focus ring  [✓/✗] Contrast │
│                                                        │
└────────────────────────────────────────────────────────┘

Apply? (yes / or describe what's different)
```
</step_3>

<step_4>
### Step 4: Get Confirmation

Wait for user response:
- **"yes", "y"** → Apply immediately (Step 5)
- **Correction** → Update analysis, show again
</step_4>

<step_5>
### Step 5: Apply Styles

IMMEDIATELY edit the component with new material values.

Only modify style-related code:
- className / style props
- CSS variables / tokens
- Shadow, border, radius, background values

Do NOT modify:
- Event handlers
- State management
- Animation timing/easing
- Data fetching logic
</step_5>

<step_6>
### Step 6: Collect Feedback

Ask the user to reflect on material from their product's perspective:

> "Does this look right for your product's personality?"

**Prompt creative reflection:**
- What's the brand feeling? (premium, playful, trustworthy, minimal)
- Who sees this? (enterprise buyer, casual user, first-time visitor)
- What should the surface communicate? (stability, lightness, depth)

**If user gives feedback:**
Listen for what's off:
- "too heavy/light" → shadow adjustment
- "feels cold/warm" → color palette
- "too sharp/soft" → radius and edges
- "doesn't match our brand" → ask what their brand feels like

Ask follow-up: "What should it look like instead?"
Use their language — translate to material physics.

**Signal detection:**
- ACCEPT: "yes", "looks good", "that's it"
- MODIFY: Describes what's off ("too corporate", "needs more depth", "feels cheap")
- REJECT: "no", "wrong", "not our style"
</step_6>

<step_7>
### Step 7: Log Taste Signal

Append to `grimoires/sigil/taste.md`:

**ACCEPT:**
```markdown
## [YYYY-MM-DD HH:MM] | ACCEPT
Component: [name]
Layer: Material
Surface: [treatment type]
Values: shadow=[value], radius=[Xpx], grit=[profile]
---
```

**MODIFY:**
```markdown
## [YYYY-MM-DD HH:MM] | MODIFY
Component: [name]
Layer: Material
Changed: [shadows/colors/radius]
Learning: [infer preference]
---
```

**REJECT:**
```markdown
## [YYYY-MM-DD HH:MM] | REJECT
Component: [name]
Layer: Material
Reason: [user feedback]
---
```
</step_7>
</workflow>

<error_recovery>
## Error Recovery

**Unknown surface keyword**:
1. Default to "elevated" (safe default)
2. Note: "⚠ Unknown surface, defaulted to elevated"

**Missing component file**:
1. Ask user for file path
2. If still not found: Suggest `/craft` instead

**Styling approach unclear**:
1. Check for className usage → Tailwind/utility
2. Check for styled() → CSS-in-JS
3. Default to inline styles if unclear
</error_recovery>

<quick_reference>
## Material Quick Reference

| Surface | Shadow | Border | Blur | Radius | Grit |
|---------|--------|--------|------|--------|------|
| glassmorphism | lg | white/20 | Yes | 16px | Clean |
| neumorphism | soft dual | None | No | 12px | Clean |
| flat | None | Optional | No | 8px | Clean |
| elevated | md-lg | None | No | 8px | Clean |
| outlined | None | solid | No | 8px | Clean |
| ghost | None | None | No | 4px | Clean |
| retro | hard | 2px solid | No | 0px | Retro |
| pixel | None | 2px solid | No | 0px | Pixel |
</quick_reference>

<when_not_to_use>
## When NOT to Use /style

- **Behavior is wrong**: Use `/behavior`
- **Animation is wrong**: Use `/animate`
- **Everything is wrong**: Use `/craft`
- **New component needed**: Use `/craft`
- **Single value change**: Use Edit tool directly

Rule: /style is for surface treatment only.
</when_not_to_use>

<examples>
## Examples

### Example 1: Understanding Brand

```
User: /style "glassmorphism card for dashboard"

What's the brand personality? Who uses this dashboard?

User: fintech startup, we want to feel modern but trustworthy

Interesting tension — glassmorphism is trendy but can feel unstable for finance.
Let me find the balance:

DashboardCard | Surface: glass (subtle)
- Backdrop blur: 12px (not too extreme)
- Border: 1px white/30 (more defined than typical glass)
- Shadow: lg (adds grounding)
- Radius: 12px (modern but not playful)

The blur says "modern" but the solid border says "reliable."

Does this look right for your product's personality?

User: love it, but can we warm up the border color slightly?

[Adjusts border to white/25 with slight warm tint, logs MODIFY: "fintech prefers warmer glass treatment"]
```

### Example 2: Matching Product Context

```
User: /style "retro pixel button for game"

What kind of game? Who's the audience?

User: casual mobile puzzle game, mostly 25-40 year olds who grew up with 90s games

Nostalgia factor — they want to feel that era without it being inaccessible.

GameButton | Surface: pixel
- Sharp edges (0 radius) — that's the signature
- 2px hard shadow (classic drop shadow)
- Chunky border for that tactile feel
- But using modern, readable font (not actual pixel font)

The visual says "90s" but the usability is 2024.

Does this match the nostalgic feel you're going for?

User: yes! but the shadow feels too harsh on mobile

[Softens to 1px shadow, logs MODIFY: "mobile pixel style needs softer shadows"]
```

### Example 3: When Material Affects Trust

```
User: /style "elevated card — but it looks too corporate"

What do you want it to feel like instead?

User: we're a creative tools company, it should feel inspiring, not enterprise

Ah, "corporate" often means: too much shadow, too much structure, cool grays.
Let's loosen it up:

- Shadow: softer, warmer undertone
- Radius: 16px instead of 8px (friendlier)
- No border (borders feel formal)
- Subtle gradient instead of flat background

CreativeCard | Surface: elevated-soft
The card should feel like a canvas, not a container.

Does this match your creative brand?

User: much better, feels like us now

[Logs ACCEPT with learning: "creative brands prefer soft elevation, no borders"]
```
</examples>

---

<user-request>
$ARGUMENTS
</user-request>
