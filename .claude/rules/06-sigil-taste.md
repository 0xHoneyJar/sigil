# Sigil: Taste Accumulation

Learn user preferences from usage. No forms, no ratings - usage IS feedback.

## The Log

All signals go to `grimoires/sigil/taste.md`. Append-only. Human-readable.

## Signal Types

| Signal | Weight | Trigger |
|--------|--------|---------|
| ACCEPT | +1 | User uses generated code without changes |
| MODIFY | +5 | User edits generated code (diff reveals preference) |
| REJECT | -3 | User says no, deletes, or rewrites |
| OBSERVE | +2 | User feedback captured via /observe or Agentation |
| CHANGELOG_ENGAGEMENT | +1 | Track reactions/engagement on shared changelogs |

Modifications weight 5x because corrections teach more than silent acceptance.
OBSERVE signals capture user feedback patterns that inform future generation.
CHANGELOG_ENGAGEMENT tracks which framings resonate with end users.

## Signal Schema (YAML Frontmatter)

Each signal is logged with structured YAML frontmatter for machine parsing:

```yaml
---
timestamp: "2026-01-19T14:32:00Z"
signal: MODIFY
source: cli                          # cli | toolbar | product
component:
  name: "ClaimButton"
  effect: "Financial"
  craft_type: "generate"
physics:
  behavioral:
    sync: "pessimistic"
    timing: "800ms"
    confirmation: "required"
  animation:
    easing: "ease-out"
    duration: "800ms"
  material:
    surface: "elevated"
    shadow: "soft"
    radius: "8px"
diagnostic:                          # From diagnostic questions (Step 6b)
  user_type: "mobile"
  goal: "quickly check and claim rewards while commuting"
  expected_feel: "snappy"
  skipped: false
change:
  from: "800ms"
  to: "500ms"
learning:
  inference: "Mobile users prefer faster timing for financial buttons"
  recommendation: "Consider mobile-specific physics (faster timing)"
---
```

## DiagnosticContext Schema

When users provide feedback (MODIFY/REJECT), optional diagnostic questions capture context:

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `user_type` | string | `power-user`, `casual`, `mobile`, `first-time`, custom | Who is the end user |
| `goal` | string | free text | What the user was trying to accomplish |
| `expected_feel` | string | `instant`, `snappy`, `deliberate`, `trustworthy`, custom | Desired interaction feel |
| `skipped` | boolean | `true`, `false` | Whether user skipped diagnostics |

**Source Field**:
| Source | Description |
|--------|-------------|
| `cli` | Signal from Claude Code /craft command |
| `toolbar` | Signal from Sigil Dev Toolbar |
| `product` | Signal from product-embedded feedback widget |

## Toolbar-Specific Fields

When signals are captured from the Sigil Dev Toolbar (`source: toolbar`), additional context is available:

| Field | Type | Description |
|-------|------|-------------|
| `lens_context` | object | User Lens impersonation state when signal was captured |
| `lens_context.enabled` | boolean | Whether User Lens was active |
| `lens_context.impersonated_address` | string | Address being impersonated (if enabled) |
| `lens_context.real_address` | string | Real connected wallet address |
| `screenshot_ref` | string | Path to screenshot if captured (relative to grimoires/sigil/) |

### Lens Context Example

```yaml
---
timestamp: "2026-01-20T10:15:00Z"
signal: MODIFY
source: toolbar
component:
  name: "StakePanel"
  effect: "Financial"
  craft_type: "diagnose"
lens_context:
  enabled: true
  impersonated_address: "0x1234...abcd"
  real_address: "0xabcd...1234"
screenshot_ref: "screenshots/stake-panel-2026-01-20-101500.png"
physics:
  behavioral:
    sync: "pessimistic"
    timing: "800ms"
change:
  from: "indexed data source"
  to: "on-chain data source"
learning:
  inference: "Financial displays should use on-chain data when lens is active"
  recommendation: "Switch to on-chain reads when impersonating for accuracy"
---
```

### Screenshot Capture

Screenshots are saved to `grimoires/sigil/screenshots/` with naming convention:
`{component}-{timestamp}.png`

Screenshots are captured when:
- User clicks "Report Issue" in toolbar
- User manually captures via toolbar
- Diagnostic panel detects critical mismatch

## OBSERVE Signal Schema

When user feedback is captured via `/observe` or Agentation parsing:

```yaml
---
timestamp: "2026-01-25T10:00:00Z"
signal: OBSERVE
source: agentation                    # agentation | discord | direct | diagnose
component:
  name: "ClaimButton"
  selector: ".claim-button"
  effect: "Financial"
observation:
  id: "obs-2026-01-25-001"
  file: "agentation-2026-01-25.md"
  type: "ui-annotation"               # ui-annotation | feedback | diagnostic
synthesis:
  theme: "reward-visibility"
  tags: ["ux-clarity", "reward-visibility"]
  related_count: 4
  confidence: "HIGH"                  # LOW | MEDIUM | HIGH
  insight: "Users want claimable amounts visible before action"
learning:
  recommendation: "Show amount in button or nearby indicator"
  affected_components: ["ClaimButton", "RewardsDisplay"]
---
```

### OBSERVE-Specific Fields

| Field | Type | Description |
|-------|------|-------------|
| `observation.id` | string | Unique observation ID (obs-{date}-{seq}) |
| `observation.file` | string | Path to observation markdown file |
| `observation.type` | enum | ui-annotation, feedback, diagnostic |
| `synthesis.theme` | string | Detected theme from pattern clustering |
| `synthesis.tags` | array | Auto-extracted semantic tags |
| `synthesis.related_count` | number | Count of related observations |
| `synthesis.confidence` | enum | Pattern confidence level |
| `learning.affected_components` | array | Components that should apply this learning |

### Pattern Detection

OBSERVE signals build patterns over time:

| Observations | Confidence | Action |
|--------------|------------|--------|
| 1-2 | LOW | Log only, no auto-apply |
| 3-4 | MEDIUM | Surface in /craft analysis |
| 5+ | HIGH | Auto-apply recommendation |

When `/craft` runs, check for HIGH-confidence OBSERVE patterns affecting the target component.

## Reading Taste

At /craft time, read `grimoires/sigil/taste.md` and look for patterns:

- **Timing patterns**: "User changed 800ms → 600ms three times" → use 600ms
- **Animation patterns**: "User replaces ease-out with springs" → use springs
- **Structure patterns**: "User always adds loading states" → include them

If a pattern appears 3+ times, apply it automatically. Mention the adjustment in the physics analysis.

## Writing Taste

After generation, detect the signal:

1. **ACCEPT**: User confirms "yes" and moves on without editing
2. **MODIFY**: User uses Edit tool on the generated file
3. **REJECT**: User says "no", "wrong", "redo", or explicitly rejects

Append to `grimoires/sigil/taste.md`:

```markdown
## [YYYY-MM-DD HH:MM] | [SIGNAL]
Component: [name]
Effect: [type]
Physics: [what was generated]
[If MODIFY: Changed: what user changed, Learning: inferred preference]
[If REJECT: Reason: user feedback if given]
---
```

## Cold Start

If `grimoires/sigil/taste.md` has no signals yet, use physics defaults from the rules.

## Example: Enhanced Format

```markdown
---
timestamp: "2026-01-13T14:32:00Z"
signal: ACCEPT
source: cli
component:
  name: "ClaimButton"
  effect: "Financial"
  craft_type: "generate"
physics:
  behavioral:
    sync: "pessimistic"
    timing: "800ms"
    confirmation: "required"
  animation:
    easing: "ease-out"
---

---
timestamp: "2026-01-13T15:45:00Z"
signal: MODIFY
source: cli
component:
  name: "WithdrawButton"
  effect: "Financial"
  craft_type: "generate"
physics:
  behavioral:
    sync: "pessimistic"
    timing: "800ms"
    confirmation: "required"
  animation:
    easing: "ease-out"
diagnostic:
  user_type: "power-user"
  goal: "withdraw quickly during volatile market"
  expected_feel: "snappy"
  skipped: false
change:
  from: "800ms"
  to: "500ms"
learning:
  inference: "Power users prefer faster timing for financial buttons"
  recommendation: "Consider user-type-specific timing"
---

---
timestamp: "2026-01-13T16:20:00Z"
signal: MODIFY
source: cli
component:
  name: "StakeButton"
  effect: "Financial"
  craft_type: "generate"
physics:
  behavioral:
    sync: "pessimistic"
    timing: "800ms"
  animation:
    easing: "ease-out"
diagnostic:
  user_type: "mobile"
  goal: "stake rewards while checking phone quickly"
  expected_feel: "snappy"
  skipped: false
change:
  from: "800ms, ease-out"
  to: "500ms, spring(400, 25)"
learning:
  inference: "Mobile users prefer springs for tactile feedback"
  recommendation: "Consider mobile-first animation physics"
---

---
timestamp: "2026-01-13T17:00:00Z"
signal: REJECT
source: cli
component:
  name: "DeleteAccountButton"
  effect: "Destructive"
  craft_type: "generate"
physics:
  behavioral:
    sync: "pessimistic"
    timing: "600ms"
    confirmation: "required"
diagnostic:
  skipped: true
rejection_reason: "Missing two-step confirmation for account deletion"
---
```

After 3 MODIFY signals showing 500ms preference, /craft would generate financial buttons with 500ms by default and note: "Adjusted timing to 500ms based on taste log."

## Example: Skipped Diagnostics

When user skips diagnostic questions:

```markdown
---
timestamp: "2026-01-13T18:00:00Z"
signal: MODIFY
source: cli
component:
  name: "TransferButton"
  effect: "Financial"
physics:
  behavioral:
    sync: "pessimistic"
    timing: "800ms"
diagnostic:
  skipped: true
change:
  from: "ease-out"
  to: "spring(500, 30)"
learning:
  inference: "User prefers spring animations (no context available)"
---
```

## DX Physics Signals

DX Physics generates test configurations for blockchain indexers. Track acceptance and modifications.

### Schema Extension

```yaml
---
timestamp: "2026-01-19T14:32:00Z"
signal: ACCEPT | MODIFY | REJECT
source: cli
component:
  name: "DX Physics - Test Config"
  effect: "DX"
  craft_type: "generate"
dx_physics:
  framework: "envio"
  event: "Staked"
  block_range:
    start: 15899050
    end: 15899150
  sync_time_actual: "28s"
  events_indexed: 7
learning:
  inference: "100-block range sufficient for Staked"
---
```

### DX-Specific Fields

| Field | Type | Description |
|-------|------|-------------|
| `dx_physics.framework` | string | "envio", "subgraph", "ponder" |
| `dx_physics.event` | string | Target event name |
| `dx_physics.block_range` | object | { start, end } block numbers |
| `dx_physics.sync_time_actual` | string | Actual sync duration |
| `dx_physics.events_indexed` | number | Events found in range |

### Signal Detection

| User Action | Signal | Learning |
|-------------|--------|----------|
| Accepts generated config | ACCEPT | Block range was appropriate |
| Modifies block range | MODIFY | User prefers different range size |
| Skips DX Physics | REJECT | User doesn't want auto-config |
| Modifies events list | MODIFY | User wants different events |

### Pattern Detection

After 3+ DX Physics signals for same event type:
- Apply learned block range preferences
- Note in analysis: "Adjusted range based on taste log"

Example: If user consistently expands 100-block ranges to 500, future configs use 500 by default.
