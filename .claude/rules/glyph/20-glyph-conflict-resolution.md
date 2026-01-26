# Glyph: Physics Conflict Resolution

Protocol for resolving conflicts between physics sources.

## Conflict Sources

| Source | Priority | Example |
|--------|----------|---------|
| Test expectations | 1 (highest) | Test expects 800ms timeout |
| Tier 3 taste (Rule) | 2 | User promoted to always-apply |
| Physics table | 3 | Default 800ms for Financial |
| Tier 2 taste (Pattern) | 4 | Pattern suggests 500ms |
| Tier 1 taste (Observation) | 5 (lowest) | Single observation of preference |

## Conflict Types

### Timing Conflict

```markdown
**Conflict**: Timing mismatch

Sources:
- Test: 800ms (line 67)
- Taste (Tier 2): 500ms (power-user-timing)
- Physics table: 800ms

Resolution: Test takes priority unless user overrides.
```

### Sync Strategy Conflict

```markdown
**Conflict**: Sync strategy mismatch

Sources:
- Test: expects optimistic (onMutate mock present)
- Physics table: Pessimistic (Financial effect)

Resolution: Physics table takes priority for Financial.
BLOCK: Cannot make Financial optimistic.
```

### Confirmation Conflict

```markdown
**Conflict**: Confirmation expectation mismatch

Sources:
- Test: expects modal dialog
- Taste (Tier 3): inline confirmation only

Resolution: User taste (Tier 3) takes priority.
Update test to use inline pattern.
```

## Resolution Algorithm

```typescript
function resolveConflict(
  conflict: Conflict,
  sources: ConflictSource[]
): Resolution {
  // Sort by priority
  const sorted = sources.sort((a, b) => a.priority - b.priority);

  // Check for hard rules (cannot be overridden)
  if (isHardRule(conflict, sorted)) {
    return {
      type: 'BLOCK',
      winner: getHardRuleSource(conflict),
      message: `Cannot override: ${conflict.field} is protected for ${conflict.effect}`
    };
  }

  // Test expectations have highest priority by default
  const testSource = sorted.find(s => s.type === 'test');
  if (testSource) {
    return {
      type: 'RESOLVE',
      winner: testSource,
      message: 'Test expectation takes priority',
      action: 'update_generation'
    };
  }

  // Tier 3 taste (Rule) has second priority
  const ruleSource = sorted.find(s => s.type === 'taste' && s.tier === 3);
  if (ruleSource) {
    return {
      type: 'RESOLVE',
      winner: ruleSource,
      message: 'User rule takes priority',
      action: 'update_test'
    };
  }

  // Physics table is default
  const physicsSource = sorted.find(s => s.type === 'physics_table');
  return {
    type: 'RESOLVE',
    winner: physicsSource,
    message: 'Using physics table default',
    action: 'none'
  };
}
```

## Hard Rules (Cannot Override)

| Effect | Field | Hard Rule |
|--------|-------|-----------|
| Financial | sync | Must be pessimistic |
| Financial | confirmation | Must be required |
| Destructive | sync | Must be pessimistic |
| Destructive | confirmation | Must be required |
| Any | touch_target | Must be >= 44px |
| Any | cancel_visible | Must be true |

```typescript
function isHardRule(conflict: Conflict, sources: ConflictSource[]): boolean {
  const hardRules = {
    Financial: { sync: 'pessimistic', confirmation: 'required' },
    Destructive: { sync: 'pessimistic', confirmation: 'required' }
  };

  const rules = hardRules[conflict.effect];
  if (!rules) return false;

  return rules[conflict.field] !== undefined;
}
```

## Resolution UI

### Interactive Resolution

```
## Conflict Detected

**Field**: timing
**Effect**: Financial

| Source | Value | Priority |
|--------|-------|----------|
| Test | 800ms | 1 |
| Taste (Tier 2) | 500ms | 4 |
| Physics table | 800ms | 3 |

Recommended: Use test value (800ms)

Options:
1. Accept test value (update generation)
2. Use taste value (update test)
3. Use physics default (800ms)

[1/2/3]
```

### Auto-Resolution

For non-interactive contexts, use priority order:

```typescript
async function autoResolve(conflict: Conflict): Promise<Resolution> {
  const sources = await gatherSources(conflict);
  const resolution = resolveConflict(conflict, sources);

  // Log auto-resolution
  await logToNotes({
    type: 'auto_resolution',
    conflict,
    resolution,
    timestamp: new Date()
  });

  return resolution;
}
```

## Logging Resolutions

All resolutions logged to NOTES.md:

```markdown
### Conflict Resolutions
| Date | Component | Field | Winner | Loser | Rationale |
|------|-----------|-------|--------|-------|-----------|
| 2026-01-26 | ClaimButton | timing | Test (800ms) | Taste (500ms) | Test expectation priority |
| 2026-01-26 | DeleteModal | confirmation | Physics (modal) | Taste (inline) | Hard rule for Destructive |
```

## Conflict Prevention

### During Sprint Planning

Warn if task has conflicting requirements:

```
⚠ Potential Conflict

Task: "Create fast claim button (< 300ms)"

Conflict with:
- Physics table: Financial requires 800ms minimum
- Hard rule: Cannot reduce Financial timing below 500ms

Recommendation: Clarify requirements before implementation.
```

### During Generation

Check for conflicts before hypothesis:

```typescript
async function checkPreConflicts(
  description: string,
  tasteEntries: TasteEntry[]
): Promise<PreConflict[]> {
  const conflicts: PreConflict[] = [];

  const effect = detectEffect(description);
  const physics = PHYSICS_TABLE[effect];

  // Check taste vs physics
  for (const taste of tasteEntries) {
    if (taste.effect === effect) {
      if (taste.field === 'timing' && taste.value < physics.timing) {
        // Check if allowed
        if (!canReduceTiming(effect, taste.value)) {
          conflicts.push({
            field: 'timing',
            taste: taste.value,
            physics: physics.timing,
            type: 'hard_rule'
          });
        }
      }
    }
  }

  return conflicts;
}
```
