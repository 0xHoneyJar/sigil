---
zones:
  state:
    paths:
      - sigil-mark/moodboard.md
      - sigil-mark/rules.md
      - sigil-mark/soul-binder/immutable-values.yaml
      - sigil-mark/soul-binder/canon-of-flaws.yaml
      - sigil-mark/lens-array/lenses.yaml
      - .sigilrc.yaml
    permission: read
  config:
    paths:
      - .sigil-setup-complete
    permission: read
---

# Sigil Crafting Skill (v3)

## Purpose

Provide design guidance during implementation with awareness of:
1. **Moodboard** — Product feel and anti-patterns
2. **Rules** — Design rules by zone
3. **Immutable Values** — Core principles with enforcement
4. **Canon of Flaws** — Protected emergent behaviors
5. **Lenses** — User persona perspectives

## Philosophy

> "Make the right path easy. Make the wrong path visible. Don't make the wrong path impossible."

Craft enables good decisions, it doesn't enforce them. The human is always accountable.

## Pre-Flight Checks

1. **Sigil Setup**: Verify `.sigil-setup-complete` exists
2. **Strictness Level**: Load from `.sigilrc.yaml`
3. **Design Context**: Check for moodboard.md and rules.md (warn if missing)
4. **Soul Binder**: Load immutable-values.yaml and canon-of-flaws.yaml
5. **Lens Array**: Load lenses.yaml for lens-aware guidance

## Context Loading

### Required Files

Load and internalize these files at the start:

```
sigil-mark/moodboard.md
├── Reference Products
├── Feel Descriptors (by context)
├── Anti-Patterns
└── Key Moments

sigil-mark/rules.md
├── Colors
├── Typography
├── Spacing
├── Motion (by zone)
├── Components
└── Approvals

sigil-mark/soul-binder/immutable-values.yaml
├── values
│   ├── {value_id}
│   │   ├── name
│   │   ├── enforcement.level (block/warn/review)
│   │   └── enforcement.constraints[]

sigil-mark/soul-binder/canon-of-flaws.yaml
├── flaws[]
│   ├── id
│   ├── status (PROTECTED/UNDER_REVIEW)
│   ├── affected_code_patterns[]
│   └── protection_rule

sigil-mark/lens-array/lenses.yaml
├── lenses
│   ├── {lens_id}
│   │   ├── priority
│   │   └── constraints[]

.sigilrc.yaml
├── strictness (discovery/guiding/enforcing/strict)
├── zones (paths, motion, patterns)
└── rejections
```

### Zone Detection

If a file path is provided:

```bash
zone=$(.claude/scripts/get-zone.sh "src/features/checkout/Cart.tsx")
# Returns: critical, marketing, admin, or default
```

Use zone to apply specific guidance:
- `critical` → Deliberate motion, skeleton loading, confirmation flows
- `marketing` → Playful motion, attention-grabbing, stagger reveals
- `admin` → Snappy motion, instant feedback, minimal animation

### Flaw Detection

Check if file path matches any protected flaw:

```bash
result=$(.claude/scripts/check-flaw.sh "src/features/checkout/Cart.tsx")
# Returns JSON with matching flaws or empty array
```

### Lens Detection

Detect applicable lens for file path or get all available lenses:

```bash
# Get lens for specific file
lens_result=$(.claude/scripts/get-lens.sh "src/mobile/components/Button.tsx")
# Returns: {"lenses": [{"id": "mobile", ...}], "primary": "mobile", "status": "detected"}

# Get all available lenses
all_lenses=$(.claude/scripts/get-lens.sh)
# Returns: {"lenses": [...], "primary": "power_user", "status": "available"}
```

Use lens context to apply lens-specific constraints and validation.

## Strictness-Aware Behavior

Based on `.sigilrc.yaml` strictness level:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      AGENT RESPONSE MATRIX                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Violation Type          │ discovery │ guiding  │ enforcing │ strict       │
│  ────────────────────────┼───────────┼──────────┼───────────┼──────────    │
│  Immutable Value         │ "Consider"│ ⚠️ WARN  │ ⛔ BLOCK  │ ⛔ BLOCK     │
│  Protected Flaw          │ "Consider"│ ⚠️ WARN  │ ⛔ BLOCK  │ ⛔ BLOCK     │
│  Lens Failure            │ "Consider"│ ⚠️ WARN  │ ⚠️ WARN   │ ⛔ BLOCK     │
│  Pattern Warning         │ "FYI"     │ "Consider"│ "Consider"│ ⚠️ WARN     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Message Formats

### Block Message (⛔)

```
⛔ {VIOLATION_TYPE} VIOLATION

{Violation description}

CONTEXT:
{Why this matters - reference to value/flaw}

DETAILS:
- Affected: {what triggered the block}
- Rule: {specific constraint violated}
- Strictness: {current level}

OPTIONS:
[Fix Issue] [Override with Reasoning] [Escalate to Taste Owner] [Abandon]

If you believe this is a false positive, choose "Override with Reasoning"
and provide justification. This will be logged for audit purposes.
```

### Warning Message (⚠️)

```
⚠️ {ISSUE_TYPE} WARNING

{Issue description}

CONCERN:
{Why this might be problematic}

SUGGESTION:
{Alternative approach}

You can proceed anyway—this is a warning, not a block.
If you proceed, consider documenting why this deviation is acceptable.

[Proceed] [Follow Suggestion] [Get More Context]
```

### Suggestion Message (💡)

```
💡 DESIGN CONSIDERATION

{Suggestion}

Based on:
- {Reference to moodboard/rules/values}

This is purely informational. Your judgment takes precedence.
```

## Guidance Modes

### Mode 1: General Guidance

When invoked without arguments:

```
/craft
```

Response format:

```
I've loaded your design context.

**Product Feel**
[Summarize moodboard - references, feel descriptors]

**Key Rules**
[Summarize rules - motion by zone, key patterns]

**Immutable Values**
[List values with enforcement level]
- Security First (block)
- Accessibility (warn)

**Protected Flaws**
[List protected flaws]
- FLAW-001: Double-Click Submit

**Zones Configured**
- critical: [paths summary]
- marketing: [paths summary]
- admin: [paths summary]

**Lenses Defined**
[List lenses by priority]
- power_user (priority 1 - truth test)
- newcomer (priority 2)
- mobile (priority 3)
- accessibility (priority 4)

**Strictness Level**: {level}
  {Description of what this means}

What would you like guidance on?
```

### Mode 2: Zone-Specific Guidance

When invoked with a file path:

```
/craft src/features/checkout/CartSummary.tsx
```

**First**: Check for flaw matches, lens context, and value concerns:

```bash
# Check flaws
flaw_result=$(.claude/scripts/check-flaw.sh "src/features/checkout/CartSummary.tsx")

# Check lens
lens_result=$(.claude/scripts/get-lens.sh "src/features/checkout/CartSummary.tsx")

# Get strictness
strictness=$(.claude/scripts/get-strictness.sh)
```

**Then**: Provide response based on findings:

If protected flaw matched:
```
⚠️ PROTECTED FLAW DETECTED

This file matches pattern for: FLAW-001 "Double-Click Submit"

Protection Rule:
{protection_rule from flaw}

Any changes to this file should NOT:
{what must be avoided}

Current strictness: {level}
{What this means for this file}
```

Otherwise, normal zone guidance:
```
This file is in the **[zone]** zone.

**Zone Context**
- Motion: [zone motion style]
- Timing: [zone timing]
- Preferred patterns: [list]
- Patterns to avoid: [list]

**Lens Context**
[If lens detected from path]
- Detected lens: [lens_name] (priority [N])
- Key constraints:
  - [constraint_1]: [description]
  - [constraint_2]: [description]
- Validation rules:
  - [rule_1]
  - [rule_2]

[If no lens detected]
- No specific lens detected for this path
- Truth test lens: [primary_lens] will be used for validation

**Applicable Values**
[Values relevant to this zone/file]

**Relevant Rules**
[Extract applicable rules from rules.md]

**Recommendations**
[Specific suggestions for this context]

What specifically are you implementing?
```

### Mode 3: Question Answering

When invoked with a question:

```
/craft "How should loading states work?"
```

Response format:

```
Based on your design context:

**General Approach**
[Answer based on moodboard and rules]

**By Zone**
- Critical: [zone-specific answer]
- Marketing: [zone-specific answer]
- Admin: [zone-specific answer]

**Value Considerations**
[Any immutable values that apply]

**Relevant Rules**
[Quote applicable rules]

**Example Implementation**
[Suggest pattern or recipe]
```

### Mode 4: Lens Validation

When asked to validate against lenses:

```
/craft "Does this component work for all lenses?"
```

Response format:

```
Validating against configured lenses...

**Truth Test: [primary_lens]** (priority 1)
[Validation result for most constrained lens]

**Other Lenses:**
| Lens | Priority | Status | Notes |
|------|----------|--------|-------|
| power_user | 1 | ✅ Pass | All constraints met |
| newcomer | 2 | ✅ Pass | Help tooltips present |
| mobile | 3 | ⚠️ Warn | Touch targets at 40px (recommend 44px) |
| accessibility | 4 | ✅ Pass | ARIA labels present |

**Immutable Properties:** ✅ Consistent across all lenses

[If any lens fails:]
The [lens_name] lens has failing constraints:
- [constraint_id]: [what's wrong]

Recommendations:
1. [Specific fix]
2. [Alternative approach]
```

## Warning About Rejected Patterns

When user mentions a rejected pattern:

1. **Acknowledge** the request
2. **Explain** why it's in the rejection list
3. **Offer alternatives** that match the design system
4. **Allow override** - never refuse

Example:

```
User: "Add a spinner to the checkout"

Agent: Spinners are listed in your rejections because they can
create anxiety in critical zones.

**Why it's rejected**:
[Quote reason from .sigilrc.yaml]

**Alternatives**:
1. Skeleton loading with deliberate reveal
2. Progress indicator with reassuring copy
3. Optimistic UI with confirmation animation

If you still want a spinner, I can help implement it - just note
this deviates from your established patterns. Would you like to:
- Use an alternative
- Proceed with spinner anyway
- Discuss further
```

## Override Logging

When user overrides a block or warning, log to `sigil-mark/audit/overrides.yaml`:

```yaml
overrides:
  - timestamp: "{ISO-8601}"
    violation_type: "PROTECTED_FLAW"
    flaw_id: "FLAW-001"
    file_path: "src/features/checkout/Button.tsx"
    reasoning: "{user provided reasoning}"
    user: "{git user or unknown}"
```

## Recipe Suggestions

When suggesting motion, reference available recipes:

| Recipe | Zone | When to Use |
|--------|------|-------------|
| `useDeliberateEntrance` | critical | High-stakes content appearance |
| `usePlayfulBounce` | marketing | Attention-grabbing elements |
| `useSnappyTransition` | admin | Quick state changes |

## Response Guidelines

1. **Be specific**: Reference actual moodboard, rules, and values content
2. **Be strictness-aware**: Adjust response based on current level
3. **Be honest**: Warn about anti-patterns and flaw impacts clearly
4. **Be flexible**: Never refuse, always offer alternatives
5. **Be concise**: Don't overwhelm with information
6. **Log overrides**: Track when users deviate from guidance

## Error Handling

| Situation | Response |
|-----------|----------|
| No moodboard.md | "No moodboard found. Run `/envision` to capture product feel." |
| No rules.md | "No rules found. Run `/codify` to define design rules." |
| No values | "No immutable values defined. Run `/envision` to capture values." |
| No lenses | "No lenses configured. Run `/envision` to define user lenses." |
| Unknown zone | "This path doesn't match any configured zone. Using default guidance." |
| Unknown lens | "No lens detected for this path. Using truth test lens for validation." |
| Empty context | Provide general guidance mode |

## Lens-Aware Guidance Principles

1. **Truth Test First**: Always validate against the most constrained lens (lowest priority)
2. **Immutable Properties**: Never allow lens variations to modify security, core logic, or data integrity
3. **Constraint Awareness**: Surface required vs optional constraints clearly
4. **Stacking Support**: When multiple lenses apply, use conflict resolution rules
5. **Actionable Feedback**: Provide specific fixes when lens constraints fail
