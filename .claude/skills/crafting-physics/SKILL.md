# Crafting Physics Skill

Apply design physics to any UX-affecting change. Three layers: Behavioral + Animation + Material = Feel.

---

## Core Principle

```
Effect → Physics → Code
```

Detect the effect from keywords and types, apply the physics, generate the code.

---

## Craft Types

| Signal | Craft Type | Output |
|--------|------------|--------|
| "new", "create", "build" | **Generate** | New component file |
| "refine", "polish", "improve" | **Refine** | Edit existing code |
| "theme", "colors", "mode" | **Configure** | Edit config/theme |
| "loading", "data", "fetch" | **Pattern** | Hook or utility |
| "hover", "focus", multiple files | **Polish** | Batch edits |

---

## Workflow

### Step 1: Discover Context

**1a. Read project context** (if exists):
- `grimoires/sigil/context/` — Personas, brand, domain
- `grimoires/sigil/moodboard/` — Visual references
- `grimoires/sigil/taste.md` — Accumulated preferences

**1b. Discover codebase conventions**:
```bash
Read package.json
```
Extract:
- Animation: `framer-motion` | `react-spring` | CSS
- Data: `@tanstack/react-query` | `swr` | `fetch`
- Styling: `tailwindcss` | `styled-components` | `@emotion`

### Step 2: Detect Craft Type and Effect

**Effect Detection Priority**:
1. Types in props (`Currency`, `Wei`, `Token`) → Always Financial
2. Keywords (`claim`, `delete`, `like`, `toggle`) → See lexicon
3. Context (`with undo`, `for wallet`) → Modifies effect

### Step 2b: Pre-Detect Gate (Back Pressure)

Before proceeding to analysis, run the Pre-Detect Gate:

**Gate Logic**:
```
1. Effect Confidence Check:
   - IF effect detection is ambiguous (no clear keyword/type/context match):
     → Ask MAX 2 clarifying questions:
       "What happens when the user clicks this?"
       "Does this action call a server?"
     → If still unclear after 2 questions, default to Standard effect with warning

2. Taste Learning Check:
   - Read taste.md for last 30 days
   - Count MODIFY signals for similar effect type
   - IF count >= 3 with same change pattern:
     → Apply learned preference automatically
     → Note in analysis: "Adjusted [X] per taste.md (N prior modifications)"
```

**Ambiguous Effect Resolution**:
```
┌─ Clarifying Question ──────────────────────────────────────┐
│                                                            │
│  The effect for "refresh balance" is ambiguous.            │
│                                                            │
│  Does this action:                                         │
│  □ Just display current data (no server mutation)          │
│  □ Trigger a server refresh/sync                           │
│  □ Move or transfer funds                                  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Gate Outcomes**:
| Scenario | Action |
|----------|--------|
| Confident effect | Proceed to Step 3 |
| Ambiguous effect | Ask clarifying question (max 2) |
| Taste pattern found (3+) | Apply learned values, note in analysis |
| Still unclear after questions | Default to Standard with ⚠️ warning |

### Step 3: Show Physics Analysis

```
┌─ Craft Analysis ───────────────────────────────────────┐
│                                                        │
│  Target:       [what's being crafted]                  │
│  Craft Type:   [generate/refine/configure/pattern]    │
│  Effect:       [Financial/Destructive/Standard/Local]  │
│                                                        │
│  Behavioral    [Sync] | [Timing] | [Confirmation]      │
│  Animation     [Easing] | [Spring/duration] | [Freq]   │
│  Material      [Surface] | [Shadow] | [Radius]         │
│                                                        │
│  Codebase:     [styling] + [animation] + [data]        │
│  Output:       [file(s) to create/modify]              │
│                                                        │
│  Protected (if applicable):                            │
│  [✓/✗] Cancel  [✓/✗] Recovery  [✓/✗] Touch  [✓/✗] Focus│
│                                                        │
└────────────────────────────────────────────────────────┘

Proceed? (yes / or describe what's different)
```

### Step 3b: Pre-Generate Gate (Conflict Detection)

Before generating code, check for conflicts:

**Gate Logic**:
```
1. Recent Rejection Check:
   - Search taste.md for REJECT signals in last 7 days
   - IF similar component/effect found with REJECT:
     → Show warning with rejection reason
     → Ask: "Continue anyway? (yes/no)"

2. Protected Capability Check (Financial/Destructive only):
   - Verify analysis includes all required protected capabilities
   - IF Financial: Must have cancel button, balance display prep, error recovery
   - IF Destructive: Must have confirmation, cancel button, clear warning text
   - IF missing: Add to analysis checklist
```

**Conflict Warning**:
```
┌─ Warning: Recent Rejection ────────────────────────────────┐
│                                                            │
│  ⚠️ A similar component was REJECTED 3 days ago:           │
│                                                            │
│  Component: ClaimButton (Financial)                        │
│  Reason: "confirmation dialog felt too aggressive"         │
│                                                            │
│  Recommendation: Consider softer confirmation UX           │
│                                                            │
│  Continue with generation? (yes/no)                        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Protected Capability Checklist** (shown for Financial/Destructive):
```
┌─ Protected Capabilities Required ──────────────────────────┐
│                                                            │
│  For Financial effect, ensure:                             │
│  □ Cancel/escape button always visible (even during load)  │
│  □ Amount clearly displayed before confirmation            │
│  □ Error state has recovery path                           │
│  □ Touch targets ≥ 44px                                    │
│  □ Focus ring visible on all interactive elements          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Step 4: Get Confirmation

Wait for user response:
- **"yes", "y", "proceed"** → Apply immediately
- **Correction provided** → Update analysis, show again

### Step 5: Apply Changes

IMMEDIATELY apply changes based on craft type:
- **Generate**: Write complete new file with all three physics layers
- **Refine**: Use Edit tool to modify existing code
- **Configure**: Edit config file with physics-informed values
- **Pattern**: Write hook or utility with physics baked in
- **Polish**: Apply batch edits across identified files

### Step 5b: Post-Generate Gate (Validation)

After generating code but BEFORE showing to user, validate:

**Validation Checks**:

| Check | Severity | Action |
|-------|----------|--------|
| Touch target < 44px | Auto-fix | Add `min-h-[44px] min-w-[44px]` padding |
| Missing focus ring | Auto-fix | Add `focus:ring-2 focus:ring-offset-2` |
| Missing cancel button (Financial/Destructive) | Warning | Surface in validation box |
| Optimistic sync for Financial | **BLOCK** | Refuse to generate, explain why |
| Missing confirmation (Destructive) | Warning | Surface in validation box |
| Hidden cancel during loading | **BLOCK** | Refuse to generate, explain why |

**Auto-Fix Examples**:

Touch target fix:
```tsx
// Before (detected: 32px)
<button className="px-2 py-1">Claim</button>

// After (auto-fixed to 44px)
<button className="px-4 py-3 min-h-[44px] min-w-[44px]">Claim</button>
```

Focus ring fix:
```tsx
// Before (no focus ring)
<button className="bg-blue-500 text-white">Claim</button>

// After (auto-fixed)
<button className="bg-blue-500 text-white focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">Claim</button>
```

**Validation Box** (shown after generation):
```
┌─ Post-Generate Validation ─────────────────────────────────┐
│                                                            │
│  ✓ Touch targets: All ≥ 44px                               │
│  ✓ Focus rings: Present on all interactive elements        │
│  ✓ Cancel button: Present and always visible               │
│  ✓ Sync strategy: Pessimistic (correct for Financial)      │
│                                                            │
│  Auto-fixes applied:                                       │
│  • Added min-h-[44px] to confirm button                    │
│  • Added focus:ring-2 to cancel button                     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Block Scenarios**:

If a BLOCK condition is detected, refuse to generate and explain:

```
┌─ Generation Blocked ───────────────────────────────────────┐
│                                                            │
│  ❌ Cannot generate this component as specified:           │
│                                                            │
│  Violation: Optimistic sync for Financial effect           │
│                                                            │
│  Financial operations MUST use pessimistic sync because:   │
│  • Money transfers cannot be rolled back                   │
│  • Users need to see server confirmation                   │
│  • Optimistic updates create false confidence              │
│                                                            │
│  To proceed:                                               │
│  1. Confirm this is actually Financial (if not, clarify)   │
│  2. Or request pessimistic sync explicitly                 │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Step 6: Collect Feedback

Ask user to reflect on feel:
> "Does this feel right? Think about your user in the moment of clicking."

**Signal detection**:
- ACCEPT: "yes", "looks good", "perfect"
- MODIFY: Describes what's off ("too slow", "needs more contrast")
- REJECT: "no", "wrong", "start over"

### Step 6b: Diagnostic Mode (for MODIFY/REJECT signals)

When a MODIFY or REJECT signal is detected, enter diagnostic mode to capture context that helps the system learn:

```
┌─ Diagnostic Questions ─────────────────────────────────────────┐
│                                                                │
│  Help Sigil learn from this feedback (skip anytime):           │
│                                                                │
│  1. Who is your user?                                          │
│     □ power-user  □ casual  □ mobile  □ first-time  □ other   │
│                                                                │
│  2. What were they trying to accomplish?                       │
│     [free text: e.g., "quickly check their balance"]           │
│                                                                │
│  3. What should this interaction feel like?                    │
│     □ instant  □ snappy  □ deliberate  □ trustworthy  □ other │
│                                                                │
│  (Press Enter to skip diagnostics)                             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Diagnostic Flow**:

1. **On MODIFY/REJECT detection**, prompt with diagnostic questions
2. **Parse responses** into DiagnosticContext:
   ```typescript
   interface DiagnosticContext {
     user_type: 'power-user' | 'casual' | 'mobile' | 'first-time' | string;
     goal: string;           // Free-text description
     expected_feel: 'instant' | 'snappy' | 'deliberate' | 'trustworthy' | string;
     skipped: boolean;       // True if user pressed Enter to skip
   }
   ```
3. **If user skips** (presses Enter without answering):
   - Set `skipped: true` in DiagnosticContext
   - Log signal with `diagnostic.skipped: true`
   - Do NOT ask follow-up questions
4. **Pass DiagnosticContext to Step 7** for enhanced logging

**Skip Behavior**:
- Skip option is always clearly available
- Skipping is not a failure — it just means less learning data
- Never block the user from completing their task

### Step 7: Log Taste Signal

Append to `grimoires/sigil/taste.md` using the enhanced format with YAML frontmatter:

```markdown
---
timestamp: "YYYY-MM-DDTHH:MM:SSZ"
signal: ACCEPT | MODIFY | REJECT
source: cli
component:
  name: "ComponentName"
  effect: "Financial | Destructive | Standard | Local"
  craft_type: "generate | refine | configure | pattern | polish"
physics:
  behavioral:
    sync: "pessimistic | optimistic | immediate"
    timing: "800ms | 600ms | 200ms | 100ms"
    confirmation: "required | toast | none"
  animation:
    easing: "ease-out | spring(stiffness, damping)"
    duration: "300ms"
  material:
    surface: "elevated | flat | glass"
    shadow: "soft | none"
    radius: "8px"
diagnostic:
  user_type: "power-user | casual | mobile | first-time"
  goal: "Free text description of user goal"
  expected_feel: "instant | snappy | deliberate | trustworthy"
  skipped: false
change:
  from: "Original value (for MODIFY)"
  to: "New value (for MODIFY)"
learning:
  inference: "Inferred preference from this signal"
  recommendation: "Suggested rule adjustment"
rejection_reason: "User's stated reason (for REJECT)"
---
```

**Signal-specific fields**:

| Signal | Required Fields | Optional Fields |
|--------|-----------------|-----------------|
| ACCEPT | timestamp, signal, source, component, physics | diagnostic (if provided) |
| MODIFY | timestamp, signal, source, component, physics, change, learning | diagnostic |
| REJECT | timestamp, signal, source, component, physics, rejection_reason | diagnostic |

**Diagnostic Fields** (from Step 6b):
- Only present if user answered diagnostic questions
- If user skipped: include `diagnostic.skipped: true` only
- If user provided partial answers: include whatever was provided

---

## Taste Parser Specification

When reading `grimoires/sigil/taste.md` in Step 1a, parse signals using this approach:

### Parsing Algorithm

```
1. Split file content by "---\n---" to separate signal entries
2. For each entry:
   a. Extract YAML frontmatter between "---" delimiters
   b. Parse YAML into TasteSignal object
   c. Handle malformed YAML gracefully (skip entry, log warning)
3. Return array of TasteSignal objects
```

### TasteSignal Interface

```typescript
interface TasteSignal {
  timestamp: string;                    // ISO 8601 format
  signal: 'ACCEPT' | 'MODIFY' | 'REJECT';
  source: 'cli' | 'toolbar' | 'product';
  component: {
    name: string;
    effect: 'Financial' | 'Destructive' | 'Standard' | 'Local' | 'Soft Delete';
    craft_type?: 'generate' | 'refine' | 'configure' | 'pattern' | 'polish';
  };
  physics: {
    behavioral?: {
      sync?: 'pessimistic' | 'optimistic' | 'immediate';
      timing?: string;          // e.g., "800ms"
      confirmation?: 'required' | 'toast' | 'none';
    };
    animation?: {
      easing?: string;          // e.g., "ease-out" or "spring(400, 25)"
      duration?: string;
    };
    material?: {
      surface?: string;
      shadow?: string;
      radius?: string;
    };
  };
  diagnostic?: DiagnosticContext;
  change?: {
    from: string;
    to: string;
  };
  learning?: {
    inference: string;
    recommendation?: string;
  };
  rejection_reason?: string;
}

interface DiagnosticContext {
  user_type?: 'power-user' | 'casual' | 'mobile' | 'first-time' | string;
  goal?: string;
  expected_feel?: 'instant' | 'snappy' | 'deliberate' | 'trustworthy' | string;
  skipped: boolean;
}
```

### Pattern Detection

When analyzing taste.md for patterns:

```
1. Filter signals by timeframe (default: 30 days)
2. Group MODIFY signals by:
   - component.effect (e.g., "Financial")
   - change field (e.g., "timing: 800ms → 500ms")
3. Count occurrences of each change pattern
4. If count >= 3, flag as learned preference
5. Return learned preferences for application in Step 3
```

### Example: Reading Learned Preferences

```
Analyzing taste.md...
Found 12 signals in last 30 days:
- 5 ACCEPT, 6 MODIFY, 1 REJECT

Learned preferences detected:
- Financial timing: 500ms (3 MODIFY signals)
- Financial animation: spring(400, 25) (3 MODIFY signals)

Will apply: 500ms + spring for Financial effects
```

### Graceful Handling

| Scenario | Behavior |
|----------|----------|
| taste.md doesn't exist | Use physics defaults, no warning |
| taste.md is empty | Use physics defaults, no warning |
| Malformed YAML entry | Skip entry, continue parsing, log warning |
| Missing required field | Skip entry, continue parsing |
| Unknown field | Ignore field, parse rest of entry |

---

## Learning Inference Logic

When logging a MODIFY or REJECT signal with diagnostic context, generate learning inferences automatically.

### Inference Rules

Apply these rules to generate the `learning.inference` and `learning.recommendation` fields:

```
Rule 1: Effect Misclassification
IF diagnostic.expected_feel differs from physics tier by > 1 level:
  THEN inference: "Effect may be misclassified: user expects [expected_feel] but physics is [current_tier]"
  THEN recommendation: "Consider reclassifying this component's effect"

Tier mapping:
- instant → Local (100ms)
- snappy → Standard (200ms)
- deliberate → Destructive (600ms)
- trustworthy → Financial (800ms)

Example:
  expected_feel: "snappy", physics.timing: "800ms"
  → inference: "Effect may be misclassified: user expects snappy (200ms) but physics is 800ms"
```

```
Rule 2: Mobile User Timing
IF diagnostic.user_type == "mobile" AND physics.timing > 500ms:
  THEN inference: "Mobile users prefer faster timing"
  THEN recommendation: "Consider mobile-specific physics (faster timing)"

Example:
  user_type: "mobile", timing: "800ms"
  → inference: "Mobile users prefer faster timing"
  → recommendation: "Consider adding mobile modifier to Financial physics"
```

```
Rule 3: Power User Frequency
IF diagnostic.user_type == "power-user"
   AND (diagnostic.goal contains "repeat" OR "quickly" OR "batch" OR "multiple"):
  THEN inference: "Power user performing repetitive action"
  THEN recommendation: "Consider frequency-based confirmation bypass for trusted users"

Example:
  user_type: "power-user", goal: "quickly approve multiple transactions"
  → inference: "Power user performing repetitive action"
  → recommendation: "Consider frequency-based confirmation bypass"
```

```
Rule 4: Status Check Misclassification
IF diagnostic.goal contains ("checking" OR "status" OR "viewing" OR "monitoring"):
  THEN inference: "This may be a status check (Local physics) not a mutation"
  THEN recommendation: "Verify if this action mutates state or just reads it"

Example:
  goal: "checking if rewards are available"
  → inference: "This may be a status check (Local physics) not a mutation"
```

```
Rule 5: Trust Mismatch
IF diagnostic.expected_feel == "trustworthy"
   AND physics.behavioral.confirmation != "required":
  THEN inference: "User expects trust signals but confirmation is not required"
  THEN recommendation: "Add confirmation for trustworthy feel, even for non-financial"

Example:
  expected_feel: "trustworthy", confirmation: "none"
  → inference: "User expects trust signals but confirmation is not required"
```

```
Rule 6: Timing Change Pattern
IF change.from contains timing AND change.to contains timing:
  Parse both timings and calculate delta
  IF delta > 200ms:
    THEN inference: "Significant timing preference: [from] → [to]"
    THEN recommendation: "Consider adjusting base timing for [effect] effects"

Example:
  change.from: "800ms", change.to: "400ms"
  → inference: "Significant timing preference: 800ms → 400ms (400ms faster)"
  → recommendation: "Consider adjusting base timing for Financial effects"
```

```
Rule 7: Animation Preference
IF change involves animation (easing, spring, duration):
  THEN inference: "Animation preference detected: [from] → [to]"
  IF change.to contains "spring":
    THEN recommendation: "User prefers spring-based animations for tactile feedback"
  ELSE IF change.to contains "ease-in-out":
    THEN recommendation: "User prefers smooth transitions"

Example:
  change.from: "ease-out", change.to: "spring(400, 25)"
  → inference: "Animation preference: ease-out → spring(400, 25)"
  → recommendation: "User prefers spring-based animations for tactile feedback"
```

### Applying Multiple Rules

When multiple rules match, include all inferences:

```yaml
learning:
  inference: |
    1. Mobile users prefer faster timing
    2. Significant timing preference: 800ms → 500ms (300ms faster)
  recommendation: |
    Consider mobile-specific physics modifier AND
    Adjust base timing for Financial effects
```

### Inference in Analysis Box

When taste patterns are applied in Step 3, show them:

```
┌─ Craft Analysis ───────────────────────────────────────┐
│                                                        │
│  Target:       ClaimButton                             │
│  Effect:       Financial                               │
│                                                        │
│  Behavioral    Pessimistic | 500ms* | Required         │
│  Animation     spring(400, 25)*                        │
│  Material      Elevated | Soft | 8px                   │
│                                                        │
│  * Adjusted per taste.md (3 prior modifications)       │
│    - Timing: 800ms → 500ms (mobile user pattern)       │
│    - Easing: ease-out → spring (tactile preference)    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## Physics Quick Reference

| Effect | Sync | Timing | Confirmation |
|--------|------|--------|--------------|
| Financial | Pessimistic | 800ms | Required |
| Destructive | Pessimistic | 600ms | Required |
| Soft Delete | Optimistic | 200ms | Toast+Undo |
| Standard | Optimistic | 200ms | None |
| Local State | Immediate | 100ms | None |

---

## When NOT to Use /craft

- **Only animation wrong**: Use `/animate`
- **Only styling wrong**: Use `/style`
- **Only timing wrong**: Use `/behavior`
- **1-3 line change**: Use Edit tool directly
- **Non-UX code**: Backend logic, tests — physics don't apply

Rule: If it doesn't affect what users feel, don't use /craft.
