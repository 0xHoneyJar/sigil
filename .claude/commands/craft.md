---
name: "craft"
version: "13.0.0"
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

<action_default>
## Action Default

CRITICAL: After user confirms analysis, generate complete working code immediately.

DO:
- Write the full component file
- Match codebase conventions exactly
- Include all three physics layers

DO NOT:
- Describe what you would build
- Ask "would you like me to generate this?"
- Provide partial implementations
- Add comments unless explaining physics override
</action_default>

<permissions>
## Permission Boundaries

**Proactive** (do without asking):
- Read package.json, existing components, taste.md
- Show physics analysis
- Detect effect from keywords/types/context

**Requires confirmation** (ask first):
- Write new component files
- Modify existing components
- Override physics defaults based on user input

**Never** (even if asked):
- Delete existing components without explicit request
- Modify package.json or node_modules
- Skip protected capability checks
</permissions>

<output_modes>
## Output Modes

Check `grimoires/sigil/taste.md` for `output_mode` preference.

**Compact mode** (default after 5+ accepts):
```
ClaimButton | Financial | Pessimistic 800ms | Confirm: Yes
Animation: ease-out | Material: elevated, 8px radius
Protected: [all pass]

Proceed? (y/n)
```

**Verbose mode** (default for new users):
Full analysis box with nested sections.

Auto-switch to compact after 5 consecutive ACCEPT signals.
</output_modes>

<workflow>
## Workflow

<step_0>
### Step 0: Track Progress

Use TodoWrite to track this workflow:
```
1. [ ] Discover context (libs, conventions)
2. [ ] Detect effect and material
3. [ ] Show physics analysis
4. [ ] Get user confirmation
5. [ ] Generate component
6. [ ] Collect feedback
7. [ ] Log taste signal
```
Mark each in_progress then completed as you work.
</step_0>

<step_1>
### Step 1: Discover Context

**1a. Read taste log** (if exists):
```
Read grimoires/sigil/taste.md
```
Look for:
- Patterns with 3+ occurrences (apply automatically)
- `output_mode` preference (compact vs verbose)
- Timing/animation/material overrides

**1b. Discover codebase conventions** (single read):
```
Read package.json
```
Extract from dependencies:
- Animation: `framer-motion` | `react-spring` | CSS
- Data: `@tanstack/react-query` | `swr` | `fetch`
- Toast: `sonner` | `react-hot-toast` | native
- Styling: `tailwindcss` | `styled-components` | `@emotion`

**1c. Read one existing component** to match:
- Import style (named vs default, path aliases)
- File structure (single file vs folder)
- Naming conventions (PascalCase, kebab-case files)
</step_1>

<step_2>
### Step 2: Detect Effect and Material

**Effect Detection** (determines behavioral + animation physics):

| Priority | Signal | Example |
|----------|--------|---------|
| 1. Types | Props with `Currency`, `Money`, `Wei` | Always Financial |
| 2. Keywords | "claim", "delete", "like", "toggle" | See lexicon |
| 3. Context | "with undo", "for wallet" | Modifies effect |

**Material Detection** (determines surface physics):

| Keyword | Treatment |
|---------|-----------|
| glassmorphism | blur backdrop, subtle border |
| elevated | shadow, slight lift |
| flat | no shadows, solid colors |
| outlined | border only |
| retro, pixel | grit signatures |
| (no keyword) | Infer from effect |
</step_2>

<step_3>
### Step 3: Show Physics Analysis

**If compact mode:**
```
[ComponentName] | [Effect] | [Sync] [Timing] | Confirm: [Yes/No]
Animation: [easing] | Material: [surface], [radius]
Protected: [pass/fail indicators]

Proceed? (y/n)
```

**If verbose mode:**
```
┌─ Physics Analysis ─────────────────────────────────────┐
│                                                        │
│  Component:    [ComponentName]                         │
│  Effect:       [Effect type]                           │
│  Detected by:  [keyword/type/context that triggered]   │
│                                                        │
│  Behavioral    [Sync] | [Timing] | [Confirmation]      │
│  Animation     [Easing] | [Spring values] | [Interrupt]│
│  Material      [Surface] | [Shadow] | [Radius] | [Grit]│
│                                                        │
│  Codebase:     [styling] + [animation] + [data]        │
│                                                        │
│  Protected:                                            │
│  [✓/✗] Cancel  [✓/✗] Error recovery  [✓/✗] 44px       │
│  [✓/✗] Focus ring  [✓/✗] Reduced motion               │
│                                                        │
└────────────────────────────────────────────────────────┘

Proceed? (yes / or describe what's different)
```
</step_3>

<step_4>
### Step 4: Get Confirmation

Wait for user response:
- **"yes", "y", "proceed"** → Generate immediately (Step 5)
- **Correction provided** → Update analysis, show again
- **Question asked** → Answer, then re-confirm
</step_4>

<step_5>
### Step 5: Generate Component

IMMEDIATELY generate complete working code that:
- Uses discovered libraries only (never assume)
- Matches existing code style exactly
- Applies all three physics layers from analysis
- Includes all protected capabilities
- Has reduced motion fallback
- Has no comments (unless explaining physics override)

Write the full component. Do not describe — build.
</step_5>

<step_6>
### Step 6: Collect Feedback

Ask the user to reflect on feel from their end user's perspective:

> "Does this feel right? Think about your user in the moment of clicking."

**Prompt creative reflection:**
- Who is clicking this? (new user, power user, anxious customer)
- What's the moment? (first deposit, routine action, high-stakes decision)
- What should they feel? (trust, speed, safety, delight)

**If user gives feedback:**
Listen for what layer is off:
- "feels slow/fast" → behavioral (`/behavior`)
- "movement feels off" → animation (`/animate`)
- "looks wrong" → material (`/style`)

Ask follow-up: "What should it feel like instead?"
Use their language — don't force physics terminology.

**Signal detection:**
- ACCEPT: "yes", "looks good", "perfect", moves to next task
- MODIFY: Describes what's off ("feels heavy", "too clinical", "needs more weight")
- REJECT: "no", "wrong", "start over"
</step_6>

<step_7>
### Step 7: Log Taste Signal

Append to `grimoires/sigil/taste.md`:

**ACCEPT** (user confirms):
```markdown
## [YYYY-MM-DD HH:MM] | ACCEPT
Component: [name]
Effect: [type]
Physics: [behavioral], [animation], [material]
---
```

**MODIFY** (user edits file or selects non-Yes option):
```markdown
## [YYYY-MM-DD HH:MM] | MODIFY
Component: [name]
Changed: [what user indicated was off]
Learning: [infer preference]
---
```

**REJECT** (user says no/wrong/redo):
```markdown
## [YYYY-MM-DD HH:MM] | REJECT
Component: [name]
Reason: [user feedback]
---
```
</step_7>
</workflow>

<error_recovery>
## Error Recovery

**Detection fails** (can't determine effect):
1. Ask max 2 clarifying questions
2. If still unclear: Default to Standard, note in analysis
3. Format: "⚠ Defaulted to Standard (unclear input)"

**Missing package.json**:
1. Check imports in existing component files
2. Infer libraries from import statements
3. If no files exist: Ask user for preferences

**Convention conflict** (multiple styles found):
1. Show both patterns
2. Ask which to follow
3. Log preference to taste.md for future

**Protected capability violation**:
1. Stop generation
2. Explain which capability would be violated
3. Offer compliant alternative
</error_recovery>

<quick_reference>
## Detection Quick Reference

| Keywords | Effect | Sync | Timing | Confirm |
|----------|--------|------|--------|---------|
| claim, deposit, withdraw, transfer, swap, stake | Financial | Pessimistic | 800ms | Yes |
| delete, remove, destroy, revoke, burn | Destructive | Pessimistic | 600ms | Yes |
| archive, trash, soft-delete, dismiss | Soft Delete | Optimistic | 200ms | Toast+Undo |
| save, update, like, follow, create, bookmark | Standard | Optimistic | 200ms | No |
| toggle, switch, expand, collapse, select | Local State | Immediate | 100ms | No |
| command palette, keyboard nav, frequent hover | High-freq | Immediate | 0ms | No |

**Type Override**: `Currency`, `Money`, `Balance`, `Wei`, `Token`, `BigInt` → always Financial
**Frequency Override**: 50+ uses/day → reduce or remove animation
</quick_reference>

<when_not_to_use>
## When NOT to Use /craft

- **Single property change**: Use Edit tool directly
- **Only styling wrong**: Use `/style` instead
- **Only animation wrong**: Use `/animate` instead
- **Only timing wrong**: Use `/behavior` instead
- **Non-UI code**: Not applicable
- **Tiny fix to existing component**: Edit directly

Rule: If it's a 1-3 line change, don't use /craft.
</when_not_to_use>

<examples>
## Examples

### Example 1: Financial with Creative Feedback

```
User: /craft "claim button for staking rewards"

StakingClaimButton | Financial | Pessimistic 800ms | Confirm: Yes
Animation: ease-out 800ms | Material: elevated, 8px, soft shadow
Protected: [✓ all pass]

Proceed? (y/n)

User: y

[Generates complete component]

Does this feel right? Think about your user in the moment of clicking.

User: feels a bit too slow, our users claim rewards multiple times a day

Ah, high-frequency financial action. That changes things.
Reducing to 600ms — still deliberate but respects their workflow.

[Applies adjustment, logs MODIFY: "User prefers faster timing for routine financial actions"]
```

### Example 2: Understanding the Persona

```
User: /craft "delete account button"

⚠ Destructive action detected. Before I generate:
Who is clicking this? What's their state of mind?

User: frustrated users who want to leave, we want to give them one last chance

Got it — this should feel serious but not hostile.
Adding a "We're sorry to see you go" confirmation with clear cancel.
Timing: 600ms to give weight without feeling punitive.

DeleteAccountButton | Destructive | Pessimistic 600ms | Confirm: Yes (soft tone)

Proceed?

User: yes, but make the cancel button more prominent than confirm

[Generates with prominent cancel, logs taste signal]
```

### Example 3: GTM Context Matters

```
User: /craft "subscribe button"

User: actually this is for a free trial, not paid

That changes the physics entirely.
Free trial = low commitment = should feel easy and fast.

SubscribeButton | Standard | Optimistic 200ms | Confirm: No
Animation: spring(500,30) — snappy, encouraging
Material: elevated with brand gradient — draws attention

Does this match how you want users to feel about trying your product?

User: yes but maybe even snappier, we want zero friction

[Adjusts to 150ms with spring(600,30), logs MODIFY]
```
</examples>

---

<user-request>
$ARGUMENTS
</user-request>
