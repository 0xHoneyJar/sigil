---
name: "animate"
version: "13.0.0"
description: |
  Apply animation physics only.
  Use when movement feels off but behavior and looks are fine.
  For full physics, use /craft.

arguments:
  - name: "description"
    type: "string"
    required: true
    description: "Component and animation adjustment"
    examples:
      - "card — more organic"
      - "button — snappier"
      - "modal — smoother entrance"
      - "dropdown — less bouncy"

context_files:
  - path: ".claude/rules/05-sigil-animation.md"
    required: true
    purpose: "Animation physics - easing, springs, frequency"
  - path: ".claude/rules/06-sigil-taste.md"
    required: true
    purpose: "Taste accumulation for animation preferences"
  - path: "grimoires/sigil/taste.md"
    required: false
    purpose: "Accumulated taste signals (read for patterns)"

outputs:
  - path: "src/components/$COMPONENT_NAME.tsx"
    type: "file"
    description: "Component with adjusted animation"
---

# /animate

Apply animation physics to components. Animation = how it moves.

<action_default>
## Action Default

CRITICAL: After user confirms analysis, apply animation changes immediately.

DO:
- Edit the component with new animation values
- Only change animation-related code (easing, duration, spring values)
- Preserve behavioral and material physics

DO NOT:
- Describe what you would change
- Ask "would you like me to apply this?"
- Rewrite sync strategy or confirmation logic
- Change styling/material values
- Add comments unless explaining override
</action_default>

<permissions>
## Permission Boundaries

**Proactive** (do without asking):
- Read component file, package.json, taste.md
- Show animation analysis
- Detect animation library in use

**Requires confirmation** (ask first):
- Modify animation values
- Override animation defaults

**Never** (even if asked):
- Change behavioral physics (sync, timing, confirmation)
- Change material physics (styles, colors, shadows)
- Delete components
</permissions>

<output_modes>
## Output Modes

**Compact mode** (default after 5+ accepts):
```
[ComponentName] | Current: [values] → Proposed: [values]
Feel: [snappier/organic/smoother/etc]

Apply? (y/n)
```

**Verbose mode** (default for new users):
Full analysis box with current/proposed comparison.
</output_modes>

<workflow>
## Workflow

<step_0>
### Step 0: Track Progress

Use TodoWrite:
```
1. [ ] Read component
2. [ ] Detect current animation
3. [ ] Parse intent
4. [ ] Show analysis
5. [ ] Get confirmation
6. [ ] Apply changes
7. [ ] Collect feedback
8. [ ] Log taste
```
</step_0>

<step_1>
### Step 1: Read Component

Read the target component file. Identify:
- Animation library used (framer-motion, react-spring, CSS)
- Current easing/spring settings
- Duration values
- Entrance/exit animations
- Reduced motion handling
</step_1>

<step_2>
### Step 2: Parse Animation Intent

Extract intent from user description:

| Keyword | Action |
|---------|--------|
| snappier, faster, quicker | Increase stiffness, reduce duration |
| organic, natural, smooth | Lower stiffness, moderate damping |
| bouncier | Lower damping (min 15) |
| stiffer, mechanical | Higher damping, or switch to ease-out |
| smoother | Use ease-in-out instead of spring |
| slower, more deliberate | Increase duration, lower stiffness |
| instant, none | Remove animation (0ms) |

Map adjectives to spring values:
- "snappier" → stiffness +200, damping +5
- "organic" → stiffness -200, damping -5
- "bouncier" → damping -10 (floor at 15)
- "stiffer" → damping +10
</step_2>

<step_3>
### Step 3: Show Animation Analysis

**If compact mode:**
```
[ComponentName] | Current: spring(500,30) → Proposed: spring(700,35)
Feel: snappier (~100ms vs ~200ms)

Apply? (y/n)
```

**If verbose mode:**
```
┌─ Animation Analysis ───────────────────────────────────┐
│                                                        │
│  Component:    [ComponentName]                         │
│  Library:      [framer-motion/react-spring/CSS]        │
│                                                        │
│  Current:                                              │
│  Easing:       [spring/ease-out/etc]                   │
│  Values:       [stiffness, damping] or [duration]      │
│  Feel:         [~Xms perceived duration]               │
│                                                        │
│  Proposed:                                             │
│  Easing:       [spring/ease-out/etc]                   │
│  Values:       [new stiffness, damping] or [duration]  │
│  Feel:         [~Xms perceived duration]               │
│                                                        │
│  Entrance:     [Xms] → [Yms]                          │
│  Exit:         [Xms] → [Yms]                          │
│                                                        │
└────────────────────────────────────────────────────────┘

Apply? (yes / or describe what's different)
```
</step_3>

<step_4>
### Step 4: Get Confirmation

Wait for user response:
- **"yes", "y"** → Apply immediately (Step 5)
- **Correction** → Adjust values, show again
</step_4>

<step_5>
### Step 5: Apply Animation Changes

IMMEDIATELY edit the component with new animation values.

Only modify animation-related code:
- `transition` props
- `animate` / `initial` / `exit` values
- Spring stiffness/damping
- Duration values
- Easing functions

Do NOT modify:
- Event handlers (onClick, onSubmit)
- State management (useState, useMutation)
- Styling (className, colors, shadows)
- Data fetching logic

Ensure reduced motion fallback is preserved or added:
```tsx
const prefersReducedMotion = useReducedMotion?.() ?? false
const transition = prefersReducedMotion
  ? { duration: 0 }
  : { type: 'spring', stiffness: 700, damping: 35 }
```
</step_5>

<step_6>
### Step 6: Collect Feedback

Ask the user to reflect on motion from their user's perspective:

> "Does the motion match how this action should feel?"

**Prompt creative reflection:**
- What's the action's weight? (casual tap, important decision, routine task)
- How often does this happen? (once a day, 50 times a day, once ever)
- What should the motion communicate? (speed, care, playfulness, precision)

**If user gives feedback:**
Listen for motion language:
- "feels sluggish/laggy" → increase stiffness
- "feels rushed/jarring" → decrease stiffness, increase duration
- "feels robotic/mechanical" → switch to spring, lower damping
- "feels wobbly/unstable" → increase damping
- "feels like jello" → much more damping

Ask follow-up: "What should the motion feel like?"
Use their words — "snappy", "smooth", "bouncy", "instant" all map to physics.

**Signal detection:**
- ACCEPT: "yes", "feels right", "perfect"
- MODIFY: Describes motion feeling ("too bouncy", "needs more weight", "feels cheap")
- REJECT: "no", "wrong", "hate it"
</step_6>

<step_7>
### Step 7: Log Taste Signal

Append to `grimoires/sigil/taste.md`:

**ACCEPT:**
```markdown
## [YYYY-MM-DD HH:MM] | ACCEPT
Component: [name]
Layer: Animation
Values: spring([stiffness],[damping]) or ease-[type] [duration]
---
```

**MODIFY:**
```markdown
## [YYYY-MM-DD HH:MM] | MODIFY
Component: [name]
Layer: Animation
Changed: spring(500,30) → spring(700,35)
Learning: User prefers snappier animations
---
```

**REJECT:**
```markdown
## [YYYY-MM-DD HH:MM] | REJECT
Component: [name]
Layer: Animation
Reason: [user feedback]
---
```
</step_7>
</workflow>

<error_recovery>
## Error Recovery

**No animation found in component**:
1. Note: "No existing animation detected"
2. Offer to add animation with detected physics
3. If user confirms: Add animation, log as new

**Unknown animation library**:
1. Check for motion/animated imports
2. Check for CSS transition/animation
3. If none: Suggest using framer-motion or CSS

**Reduced motion not handled**:
1. Always add reduced motion fallback
2. Note: "Added prefers-reduced-motion support"
</error_recovery>

<quick_reference>
## Animation Quick Reference

| Feel | Spring | CSS Easing | Perceived |
|------|--------|------------|-----------|
| Snappy | stiffness: 700, damping: 35 | — | ~100ms |
| Responsive | stiffness: 500, damping: 30 | — | ~200ms |
| Organic | stiffness: 300, damping: 25 | — | ~300ms |
| Deliberate | stiffness: 200, damping: 30 | ease-out 600-800ms | ~500ms |
| Smooth | — | ease-in-out 300ms | ~300ms |
| None | — | — | 0ms |

**Spring tuning:**
- More bounce → Lower damping (min 15)
- Less bounce → Higher damping
- Faster → Higher stiffness
- Slower → Lower stiffness

**Entrance vs Exit:**
- Entrance: Full duration (300ms)
- Exit: Half duration (150ms)
</quick_reference>

<when_not_to_use>
## When NOT to Use /animate

- **Behavior is wrong**: Use `/behavior`
- **Styling is wrong**: Use `/style`
- **Everything is wrong**: Use `/craft`
- **New component needed**: Use `/craft`
- **Single value change**: Use Edit tool directly

Rule: /animate is for motion physics only.
</when_not_to_use>

<examples>
## Examples

### Example 1: Understanding Frequency

```
User: /animate "submit button — snappier"

SubmitButton | Current: spring(500,30) → Proposed: spring(700,35)
Feel: ~200ms → ~100ms

How often do users click this?

User: it's a search form, they use it constantly

Ah, high-frequency action. Going even snappier —
spring(700,35) with very subtle scale feedback.
Users shouldn't even notice the animation, just the response.

[Applies, asks for feedback]

Does the motion match how this action should feel?

User: perfect, feels instant now

[Logs ACCEPT]
```

### Example 2: Brand Personality

```
User: /animate "modal — more organic feel"

What kind of product is this? What's the vibe?

User: it's a meditation app, everything should feel calm

Got it — calm means slower, gentler motion.
Switching from ease-out to a very soft spring.

ConfirmModal | Current: ease-out 200ms → Proposed: spring(200,25)
Feel: gentle float-in, natural settle, no bounce

The exit should be even softer — fading away rather than snapping.

[Applies calming animation]
```

### Example 3: Iterative Tuning with Context

```
User: /animate "card — feels too bouncy"

What's on these cards? What are users doing with them?

User: financial portfolio cards, users are checking their balances

Financial context → bouncy feels unserious.
Increasing damping significantly for a more stable, trustworthy feel.

[Applies: damping 25 → 40]

Does the motion match how this action should feel?

User: better but now it feels a bit dead

Finding the balance — financial but not lifeless.

[Adjusts: damping 40 → 32, logs MODIFY: "financial cards need stability but not rigidity"]
```
</examples>

---

<user-request>
$ARGUMENTS
</user-request>
