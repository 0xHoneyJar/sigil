# Synthesizing Taste Skill

Extract patterns from accumulated diagnostic signals and propose rule changes.

---

## Core Principle

```
Accumulate → Detect → Recommend → Inscribe
```

Taste signals contain user preferences encoded as feedback. Synthesis extracts patterns and proposes permanent rule changes when confidence is high enough.

---

## When to Use

- After accumulating 10+ MODIFY/REJECT signals
- Weekly health check of feedback patterns
- Before major releases to consolidate learnings
- When users report consistent friction

---

## Data Sources

| Source | File | What it captures |
|--------|------|------------------|
| `/craft` signals | `grimoires/sigil/taste.md` | Developer physics preferences |
| `/observe` diagnostics | `grimoires/sigil/observations/*.md` | Actual user behavior and gaps |
| Toolbar feedback | `grimoires/sigil/taste.md` | End-user in-product preferences |

**Cross-reference**: When synthesizing, correlate taste signals with observations to validate whether developer preferences align with actual user needs.

---

## Workflow

### Step 1: Load Signals

Read and parse `grimoires/sigil/taste.md`:

```
1. Parse all signal entries (YAML frontmatter)
2. Filter to MODIFY and REJECT signals only (ACCEPT has no learning value)
3. Filter by timeframe (default: 30 days, configurable)
4. Extract signals with diagnostic context for richer analysis
```

**Signal Statistics**:
```
Found 47 signals in last 30 days:
- 35 ACCEPT (skipped - no learning value)
- 10 MODIFY (analyzing)
- 2 REJECT (analyzing)

Of 12 actionable signals:
- 8 have diagnostic context
- 4 skipped diagnostics
```

### Step 2: Group Signals

Group signals by these dimensions:

| Dimension | Grouping Key | Example |
|-----------|--------------|---------|
| Effect | `component.effect` | "Financial", "Destructive" |
| Change Type | `change.from` → `change.to` | "800ms → 500ms" |
| User Type | `diagnostic.user_type` | "mobile", "power-user" |
| Expected Feel | `diagnostic.expected_feel` | "snappy", "trustworthy" |
| Goal Keywords | `diagnostic.goal` contains | "quickly", "checking" |

**Grouping Algorithm**:
```
groups = {}

for signal in signals:
  # Group by effect + change
  if signal.change:
    key = f"{signal.component.effect}:{signal.change.from}:{signal.change.to}"
    groups[key].append(signal)

  # Group by user type + effect
  if signal.diagnostic?.user_type:
    key = f"user:{signal.diagnostic.user_type}:{signal.component.effect}"
    groups[key].append(signal)

  # Group by expected feel mismatch
  if signal.diagnostic?.expected_feel:
    actual_tier = timing_to_tier(signal.physics.behavioral.timing)
    expected_tier = feel_to_tier(signal.diagnostic.expected_feel)
    if abs(actual_tier - expected_tier) > 1:
      key = f"mismatch:{expected_tier}:{actual_tier}"
      groups[key].append(signal)
```

### Step 3: Detect Patterns

For each group with 3+ signals, flag as a pattern:

**Pattern Types**:

| Type | Detection Rule | Example |
|------|----------------|---------|
| **Timing** | 3+ signals with same timing change | "Financial 800ms → 500ms (4 signals)" |
| **User Segment** | 3+ signals with same user_type + similar change | "Mobile users prefer 500ms for Financial" |
| **Effect Mismatch** | 3+ signals where expected_feel differs by >1 tier | "Users expect 'snappy' but Financial gives 'trustworthy'" |
| **Frequency** | 3+ signals with goal containing "checking"/"status"/"quickly" | "Component may be misclassified as mutation" |
| **Animation** | 3+ signals changing easing/spring | "Users prefer spring(400,25) over ease-out" |

**Confidence Levels**:

| Count | Confidence | Action |
|-------|------------|--------|
| 3-4 | LOW | Surface pattern, don't auto-recommend |
| 5-7 | MEDIUM | Surface pattern, suggest for review |
| 8+ | HIGH | Auto-recommend for /inscribe |

### Step 4: Generate Recommendations

For HIGH confidence patterns, generate specific recommendations:

**Recommendation Format**:
```yaml
pattern:
  type: "Timing"
  description: "Financial timing preference"
  confidence: HIGH
  signal_count: 8
  signals:
    - timestamp: "2026-01-15T10:00:00Z"
      component: "ClaimButton"
      change: "800ms → 500ms"
    - timestamp: "2026-01-16T14:00:00Z"
      component: "WithdrawButton"
      change: "800ms → 500ms"
    # ... 6 more
recommendation:
  target_file: ".claude/rules/01-sigil-physics.md"
  section: "The Physics Table"
  current_value: "Financial | 800ms"
  proposed_value: "Financial | 500ms (or add mobile modifier)"
  rationale: |
    8 users have independently changed Financial timing from 800ms to 500ms.
    Diagnostic context shows 5/8 are mobile users preferring faster feedback.
  action: "Add mobile modifier OR reduce base timing"
```

### Step 5: Present Synthesis Report

```
┌─ Taste Synthesis Report ───────────────────────────────────┐
│                                                            │
│  Period: Jan 1 - Jan 19, 2026 (19 days)                    │
│  Signals Analyzed: 12 (10 MODIFY, 2 REJECT)                │
│                                                            │
│  ─────────────────────────────────────────────────────────│
│                                                            │
│  🟢 HIGH CONFIDENCE PATTERNS (2)                           │
│                                                            │
│  1. Financial Timing Preference                            │
│     Confidence: HIGH (8 signals)                           │
│     Pattern: 800ms → 500ms                                 │
│     User Context: 5/8 mobile users                         │
│     Recommendation: Add mobile modifier to Financial       │
│     Target: .claude/rules/01-sigil-physics.md              │
│                                                            │
│  2. Spring Animation Preference                            │
│     Confidence: HIGH (6 signals)                           │
│     Pattern: ease-out → spring(400, 25)                    │
│     User Context: "more tactile" in feedback               │
│     Recommendation: Default to spring for Financial        │
│     Target: .claude/rules/05-sigil-animation.md            │
│                                                            │
│  ─────────────────────────────────────────────────────────│
│                                                            │
│  🟡 MEDIUM CONFIDENCE PATTERNS (1)                         │
│                                                            │
│  3. Effect Misclassification                               │
│     Confidence: MEDIUM (4 signals)                         │
│     Pattern: "refresh" actions treated as Financial        │
│     User Context: Users expect "snappy" feel               │
│     Watch: May need new "Query" effect type                │
│                                                            │
│  ─────────────────────────────────────────────────────────│
│                                                            │
│  Actions:                                                  │
│  [1] Inscribe pattern 1 (Financial timing)                 │
│  [2] Inscribe pattern 2 (Spring animation)                 │
│  [3] Watch pattern 3 (no action yet)                       │
│  [S] Skip all                                              │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Step 6: Handle User Selection

| Selection | Action |
|-----------|--------|
| [1] | Run `/inscribe` with pattern 1 recommendation |
| [2] | Run `/inscribe` with pattern 2 recommendation |
| [3] | Log pattern as "watched" to avoid re-surfacing |
| [S] | Exit without changes |

**After /inscribe**:
- Mark signals as "inscribed" to avoid re-proposing
- Log inscription event to taste.md
- Pattern won't appear in future synthesis until new signals accumulate

---

## Pattern Detection Logic

### Timing Pattern

```typescript
function detectTimingPattern(signals: TasteSignal[]): Pattern | null {
  // Group by effect + timing change
  const timingChanges = signals
    .filter(s => s.change?.from?.includes('ms') && s.change?.to?.includes('ms'))
    .reduce((acc, s) => {
      const key = `${s.component.effect}:${s.change.from}→${s.change.to}`;
      acc[key] = acc[key] || [];
      acc[key].push(s);
      return acc;
    }, {});

  // Find groups with 3+ signals
  for (const [key, group] of Object.entries(timingChanges)) {
    if (group.length >= 3) {
      const [effect, change] = key.split(':');
      const [from, to] = change.split('→');

      return {
        type: 'Timing',
        description: `${effect} timing: ${from} → ${to}`,
        confidence: group.length >= 8 ? 'HIGH' : group.length >= 5 ? 'MEDIUM' : 'LOW',
        signal_count: group.length,
        signals: group,
        recommendation: {
          target_file: '.claude/rules/01-sigil-physics.md',
          section: 'The Physics Table',
          current_value: `${effect} | ${from}`,
          proposed_value: `${effect} | ${to}`,
        }
      };
    }
  }

  return null;
}
```

### User Segment Pattern

```typescript
function detectUserSegmentPattern(signals: TasteSignal[]): Pattern | null {
  // Group by user_type + effect
  const userGroups = signals
    .filter(s => s.diagnostic?.user_type && s.change)
    .reduce((acc, s) => {
      const key = `${s.diagnostic.user_type}:${s.component.effect}`;
      acc[key] = acc[key] || [];
      acc[key].push(s);
      return acc;
    }, {});

  for (const [key, group] of Object.entries(userGroups)) {
    if (group.length >= 3) {
      const [userType, effect] = key.split(':');

      // Find common change pattern in group
      const commonChange = findCommonChange(group);

      if (commonChange) {
        return {
          type: 'User Segment',
          description: `${userType} users prefer different ${effect} physics`,
          confidence: group.length >= 8 ? 'HIGH' : group.length >= 5 ? 'MEDIUM' : 'LOW',
          signal_count: group.length,
          signals: group,
          recommendation: {
            target_file: '.claude/rules/01-sigil-physics.md',
            section: 'Automatic Inference',
            current_value: `No ${userType} modifier`,
            proposed_value: `Add ${userType} modifier: ${commonChange}`,
          }
        };
      }
    }
  }

  return null;
}
```

### Effect Mismatch Pattern

```typescript
function detectEffectMismatchPattern(signals: TasteSignal[]): Pattern | null {
  // Find signals where expected_feel differs significantly from physics
  const TIER_MAP = {
    'instant': 1,     // 100ms
    'snappy': 2,      // 200ms
    'deliberate': 3,  // 600ms
    'trustworthy': 4  // 800ms
  };

  const mismatches = signals.filter(s => {
    if (!s.diagnostic?.expected_feel || !s.physics?.behavioral?.timing) return false;

    const expectedTier = TIER_MAP[s.diagnostic.expected_feel] || 2;
    const actualTiming = parseInt(s.physics.behavioral.timing);
    const actualTier = actualTiming <= 100 ? 1 : actualTiming <= 200 ? 2 : actualTiming <= 600 ? 3 : 4;

    return Math.abs(expectedTier - actualTier) > 1;
  });

  if (mismatches.length >= 3) {
    return {
      type: 'Effect Mismatch',
      description: 'Users expect different feel than physics provide',
      confidence: mismatches.length >= 8 ? 'HIGH' : mismatches.length >= 5 ? 'MEDIUM' : 'LOW',
      signal_count: mismatches.length,
      signals: mismatches,
      recommendation: {
        target_file: '.claude/rules/02-sigil-detection.md',
        section: 'Effect Detection',
        current_value: 'Current effect classification',
        proposed_value: 'Review effect classification for mismatched components',
      }
    };
  }

  return null;
}
```

---

## Inscribed Patterns Tracking

After a pattern is inscribed, track it to avoid re-proposing:

**File**: `grimoires/sigil/inscribed-patterns.yaml`

```yaml
patterns:
  - id: "timing-financial-800-500"
    inscribed_at: "2026-01-19T10:00:00Z"
    signal_count: 8
    rule_file: ".claude/rules/01-sigil-physics.md"
    change: "Financial timing 800ms → 500ms"

  - id: "animation-spring-400-25"
    inscribed_at: "2026-01-19T10:05:00Z"
    signal_count: 6
    rule_file: ".claude/rules/05-sigil-animation.md"
    change: "Financial animation ease-out → spring(400, 25)"
```

When running synthesis, skip patterns that match inscribed IDs.

---

## Dismissed Patterns Tracking

Patterns explicitly dismissed won't be re-surfaced:

**File**: `grimoires/sigil/dismissed-patterns.yaml`

```yaml
patterns:
  - id: "timing-standard-200-100"
    dismissed_at: "2026-01-15T12:00:00Z"
    reason: "Too aggressive for production users"
    dismissed_by: "user"
```

---

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--days N` | Analyze signals from last N days | 30 |
| `--min-confidence` | Minimum confidence to show | LOW |
| `--effect TYPE` | Filter to specific effect | all |
| `--auto-inscribe` | Auto-inscribe HIGH patterns | false |

---

## Example Session

```
> /taste-synthesize --days 30

Analyzing taste signals...
Found 47 signals (12 actionable) in last 30 days

Grouping by:
- Effect + Change: 8 groups
- User Type: 3 groups
- Expected Feel: 2 groups

Detecting patterns...
- HIGH confidence: 2 patterns
- MEDIUM confidence: 1 pattern
- LOW confidence: 4 patterns (hidden)

[Report displayed]

> 1

Running /inscribe for Financial timing pattern...

Target: .claude/rules/01-sigil-physics.md
Section: The Physics Table
Change: Financial | 800ms → Financial | 500ms (mobile modifier)

Confirm inscription? (yes/no)

> yes

✓ Rule updated
✓ 8 signals marked as inscribed
✓ Pattern logged to inscribed-patterns.yaml

Would you like to inscribe pattern 2? (yes/no)
```

---

## Integration with /craft

When /craft runs Step 1a (Discover Context), it checks:
1. `grimoires/sigil/taste.md` for recent patterns
2. `grimoires/sigil/inscribed-patterns.yaml` for applied rules
3. `grimoires/sigil/observations/*.md` for user context (NEW)

Applied patterns automatically affect physics analysis.

---

## Integration with /observe

Observations provide user-grounded validation for taste patterns:

### Cross-Validation

When a taste pattern emerges:
1. Search `observations/*.md` for related user feedback
2. Check if pattern aligns with observed user behavior
3. Elevate confidence if observation confirms pattern

**Example**:
```
Taste Pattern: Financial timing 800ms → 500ms (6 signals)
Observation Match: papa_flavio-diagnostic.md
  - User type: Decision-maker
  - Goal: "quickly check accumulation for burn decisions"
  - Gap type: Feature

Cross-validation: ✓ CONFIRMS faster timing need
Confidence: MEDIUM → HIGH (observation-backed)
```

### Observation-Derived Patterns

Some patterns emerge from observations before taste signals:

| Observation Pattern | Implied Physics | Action |
|---------------------|-----------------|--------|
| 3+ users with "quickly" in goal | Timing may be too slow | Watch for MODIFY signals |
| 3+ Decision-makers in user type | May need faster Financial | Consider preemptive rule |
| 3+ Trust-checkers | Need confidence signals | Add timestamps/confirmations |

### User Insights Synthesis

When running synthesis, also generate `user-insights.md` updates:

```markdown
## Synthesis-Derived Insights

| Pattern | User Evidence | Recommendation |
|---------|---------------|----------------|
| Mobile users prefer 500ms | 4 MODIFY + papa_flavio observation | Add mobile modifier |
| Power users skip confirmations | 3 "quickly" goals in diagnostics | Consider bypass option |
```

---

## Related

- `/craft` - Generation with physics (reads taste patterns + observations)
- `/observe` - Capture user feedback as structured diagnostics
- `/inscribe` - Apply learned patterns to rules
- `/ward` - Validation (checks pattern compliance)
