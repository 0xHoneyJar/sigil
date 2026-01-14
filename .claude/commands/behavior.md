---
name: "behavior"
version: "13.0.0"
description: |
  Apply behavioral physics only.
  Use when timing/sync is wrong but looks and animation are fine.
  For full physics, use /craft.

arguments:
  - name: "description"
    type: "string"
    required: true
    description: "Component and behavioral adjustment"
    examples:
      - "claim button — feels too slow"
      - "like button — should be snappier"
      - "delete — needs confirmation"
      - "save — make it optimistic"

context_files:
  - path: ".claude/rules/01-sigil-physics.md"
    required: true
    purpose: "Behavioral physics - sync, timing, confirmation"
  - path: ".claude/rules/02-sigil-detection.md"
    required: true
    purpose: "Effect detection"
  - path: ".claude/rules/04-sigil-protected.md"
    required: true
    purpose: "Protected capabilities"
  - path: ".claude/rules/06-sigil-taste.md"
    required: true
    purpose: "Taste accumulation"
  - path: "grimoires/sigil/taste.md"
    required: false
    purpose: "Accumulated taste signals"

outputs:
  - path: "src/components/$COMPONENT_NAME.tsx"
    type: "file"
    description: "Component with adjusted behavioral physics"
---

# /behavior

Apply behavioral physics to components. Behavior = how it responds.

<action_default>
## Action Default

CRITICAL: After user confirms analysis, apply behavioral changes immediately.

DO:
- Edit the component with new behavioral values
- Only change timing, sync strategy, confirmation logic
- Preserve animation and material physics

DO NOT:
- Describe what you would change
- Ask "would you like me to apply this?"
- Rewrite animation easing or spring values
- Change styling/material values
- Add comments unless explaining override
</action_default>

<permissions>
## Permission Boundaries

**Proactive** (do without asking):
- Read component file, package.json, taste.md
- Show behavioral analysis
- Detect current sync strategy and timing

**Requires confirmation** (ask first):
- Modify sync strategy (optimistic ↔ pessimistic)
- Change timing values
- Add/remove confirmation step

**Never** (even if asked):
- Remove confirmation from financial operations
- Make destructive operations optimistic
- Skip protected capability checks
- Change animation physics (easing, springs)
- Change material physics (styles, colors)
</permissions>

<output_modes>
## Output Modes

**Compact mode** (default after 5+ accepts):
```
[ComponentName] | Effect: [type]
Current: [Sync] [Xms] [Confirm] → Proposed: [Sync] [Yms] [Confirm]

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
2. [ ] Detect current behavior
3. [ ] Parse intent
4. [ ] Show analysis
5. [ ] Check protected capabilities
6. [ ] Get confirmation
7. [ ] Apply changes
8. [ ] Collect feedback
9. [ ] Log taste
```
</step_0>

<step_1>
### Step 1: Read Component

Read the target component file. Identify:
- Current sync strategy (optimistic/pessimistic/immediate)
- Timing values (loading state duration, delays)
- Confirmation step (present/absent)
- Data fetching library (tanstack-query, swr, fetch)
- Effect type from mutation/action
</step_1>

<step_2>
### Step 2: Parse Behavioral Intent

Extract intent from user description:

| Keyword | Action |
|---------|--------|
| too slow | Reduce timing, consider optimistic |
| too fast | Increase timing, consider pessimistic |
| snappier | Reduce timing |
| needs confirmation | Add confirmation step |
| should be optimistic | Switch to optimistic sync |
| should be pessimistic | Switch to pessimistic sync |
| feels dangerous | Add confirmation, increase timing |
| feels safe | Consider removing confirmation |

Map to behavioral changes:
- "too slow" → timing -200ms (floor at effect minimum)
- "snappier" → timing -100ms (floor at effect minimum)
- "needs confirmation" → add two-phase flow
</step_2>

<step_3>
### Step 3: Show Behavioral Analysis

**If compact mode:**
```
[ComponentName] | Effect: [Financial/Standard/etc]
Current: Pessimistic 800ms Confirm:Yes → Proposed: Pessimistic 600ms Confirm:Yes

Apply? (y/n)
```

**If verbose mode:**
```
┌─ Behavioral Analysis ──────────────────────────────────┐
│                                                        │
│  Component:    [ComponentName]                         │
│  Effect:       [Financial/Destructive/Standard/Local]  │
│                                                        │
│  Current:                                              │
│  Sync:         [Optimistic/Pessimistic/Immediate]      │
│  Timing:       [Xms]                                   │
│  Confirmation: [Yes/No/Toast+Undo]                     │
│                                                        │
│  Proposed:                                             │
│  Sync:         [new value]                             │
│  Timing:       [new value]                             │
│  Confirmation: [new value]                             │
│                                                        │
│  Protected:                                            │
│  [✓/✗] Cancel always visible                          │
│  [✓/✗] Error recovery path                            │
│  [✓/✗] Balance accurate (if financial)               │
│                                                        │
└────────────────────────────────────────────────────────┘

Apply? (yes / or describe what's different)
```
</step_3>

<step_4>
### Step 4: Check Protected Capabilities

Before applying changes, verify:

**For Financial:**
- [ ] Cancel button present and always clickable
- [ ] Amount displayed before confirmation
- [ ] Balance shown and current
- [ ] No optimistic updates (must remain pessimistic)

**For Destructive:**
- [ ] Confirmation step present
- [ ] Clear description of what will be deleted

If proposed change would violate protected capability:
1. STOP
2. Explain which protection would be violated
3. Offer compliant alternative
</step_4>

<step_5>
### Step 5: Get Confirmation

Wait for user response:
- **"yes", "y"** → Apply immediately (Step 6)
- **Correction** → Adjust values, show again
</step_5>

<step_6>
### Step 6: Apply Behavioral Changes

IMMEDIATELY edit the component with new behavioral values.

Only modify behavior-related code:
- `onMutate` / `onSuccess` / `onError` handlers
- Loading state management
- Confirmation modal/dialog logic
- Toast notifications
- Timing delays

Do NOT modify:
- Animation timing/easing
- Styling (className, colors, shadows)
- Component structure (unless adding confirmation)
</step_6>

<step_7>
### Step 7: Collect Feedback

Ask the user to reflect on timing from their user's perspective:

> "Does the timing match the stakes of this action?"

**Prompt creative reflection:**
- What are the stakes? (losing money, losing data, just a preference)
- How does the user feel? (confident, anxious, in a hurry, careful)
- What would make them trust this more? (speed, confirmation, clear feedback)

**If user gives feedback:**
Listen for behavioral language:
- "feels risky/scary" → add confirmation, slow down
- "feels slow/frustrating" → speed up, consider optimistic
- "users might misclick" → add confirmation step
- "users do this constantly" → make it faster, maybe optimistic
- "this is a big deal" → slow down, add weight

Ask follow-up: "What would make your user feel more confident?"
Use their context — understand the moment, not just the milliseconds.

**Signal detection:**
- ACCEPT: "yes", "feels right", "that's the right weight"
- MODIFY: Describes feeling ("too cautious", "too cavalier", "needs more gravity")
- REJECT: "no", "wrong timing", "doesn't match the stakes"
</step_7>

<step_8>
### Step 8: Log Taste Signal

Append to `grimoires/sigil/taste.md`:

**ACCEPT:**
```markdown
## [YYYY-MM-DD HH:MM] | ACCEPT
Component: [name]
Layer: Behavioral
Effect: [type]
Values: [Sync] [Xms] Confirm:[Yes/No]
---
```

**MODIFY:**
```markdown
## [YYYY-MM-DD HH:MM] | MODIFY
Component: [name]
Layer: Behavioral
Effect: [type]
Changed: 800ms → 600ms
Learning: User prefers faster timing for [effect type]
---
```

**REJECT:**
```markdown
## [YYYY-MM-DD HH:MM] | REJECT
Component: [name]
Layer: Behavioral
Reason: [user feedback]
---
```
</step_8>
</workflow>

<error_recovery>
## Error Recovery

**Effect unclear from code**:
1. Check for mutation name keywords
2. Check for type hints (Currency, etc.)
3. If still unclear: Ask user what the effect is

**Protected capability violation requested**:
1. STOP — do not apply
2. Explain: "Cannot make financial operation optimistic"
3. Offer alternative: "Can reduce timing to 600ms instead"

**No data fetching library found**:
1. Check for fetch() calls
2. Check for axios/ky imports
3. If none: Behavior changes may be limited to UI timing
</error_recovery>

<quick_reference>
## Behavioral Quick Reference

| Effect | Sync | Timing | Confirmation | Minimum Timing |
|--------|------|--------|--------------|----------------|
| Financial | Pessimistic | 800ms | Required | 600ms |
| Destructive | Pessimistic | 600ms | Required | 400ms |
| Soft Delete | Optimistic | 200ms | Toast+Undo | 100ms |
| Standard | Optimistic | 200ms | None | 100ms |
| Local State | Immediate | 100ms | None | 0ms |

**Sync strategies:**
- **Pessimistic**: Server confirms → UI updates
- **Optimistic**: UI updates → rollback on error
- **Immediate**: No server, instant UI change

**Timing floors:**
- Financial: 600ms minimum (user verification time)
- Destructive: 400ms minimum (deliberation)
- Standard: 100ms minimum (perceived instant)
</quick_reference>

<when_not_to_use>
## When NOT to Use /behavior

- **Animation is wrong**: Use `/animate`
- **Styling is wrong**: Use `/style`
- **Everything is wrong**: Use `/craft`
- **New component needed**: Use `/craft`
- **Single value change**: Use Edit tool directly

Rule: /behavior is for sync, timing, and confirmation only.
</when_not_to_use>

<examples>
## Examples

### Example 1: Understanding User Workflow

```
User: /behavior "claim button — feels too slow"

Tell me about your users. How often do they claim rewards?

User: power users claim multiple times per session, it's part of their daily routine

Ah, high-frequency financial action. 800ms feels like friction for them.
Reducing to 600ms — still confirms server-side (money is money)
but respects that they know what they're doing.

ClaimButton | Pessimistic 600ms | Confirm: Yes

Does the timing match the stakes of this action?

User: much better, our users will appreciate this

[Logs MODIFY: "power users prefer faster timing for routine financial actions"]
```

### Example 2: Understanding the Moment

```
User: /behavior "delete button — feels too easy"

What are users deleting? What happens if they misclick?

User: it's deleting saved payment methods, we've had support tickets about accidents

That's a high-stakes destructive action. Adding proper friction:
- Two-step confirmation with clear "Cancel" escape
- 600ms timing to add weight
- Show what they're about to lose

DeletePaymentButton | Pessimistic 600ms | Confirm: Yes (shows card details)

Does this match the stakes?

User: yes, but can the confirmation mention it's permanent?

[Adds "This cannot be undone" copy, logs taste signal]
```

### Example 3: Protected Capability with Empathy

```
User: /behavior "withdraw — make it optimistic, users complain about slowness"

I understand the friction frustration, but I can't make financial operations optimistic.
Here's why: if the server fails after we show success, users think they have money they don't.
That's worse than slowness.

But let's address the real problem — the *perceived* slowness.
What if we:
- Reduce timing from 800ms to 600ms
- Add a progress indicator that explains what's happening
- Show "Confirming with network..." so users know why

Would that make your users feel more confident?

User: yes, the progress indicator is a great idea

[Applies 600ms + progress state, logs MODIFY]
```

### Example 4: GTM Context

```
User: /behavior "signup button — needs to feel frictionless"

What's the conversion goal? Who's signing up?

User: free trial for a B2B SaaS, we lose people at signup

Frictionless signup = optimistic, fast, no barriers.
200ms with immediate success feedback.
The "real" confirmation (email verification) happens after they're in.

SignupButton | Optimistic 200ms | Confirm: No (toast only)

Does this match how you want the signup moment to feel?

User: perfect, we want them in the product ASAP

[Logs ACCEPT]
```
</examples>

---

<user-request>
$ARGUMENTS
</user-request>
