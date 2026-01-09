# Forging Patterns

## Purpose

Explicit precedent-breaking mode for exploring new design directions.
Forge mode bypasses survival patterns while still respecting physics constraints.

## Trigger

- `/craft --forge` flag
- `/forge` standalone command

## Philosophy

> "Sometimes you need to break precedent to find something better."

Forge mode recognizes that survival patterns represent what HAS worked,
but not necessarily what WILL work best. It provides a controlled space
for exploration while maintaining physics safety.

## What Gets Bypassed

In forge mode:
- **Survival patterns** — Not loaded or checked
- **Rejected patterns** — Not warned about
- **Canonical patterns** — Not preferred
- **Pattern precedent** — Not enforced

## What Remains Enforced

Even in forge mode:
- **Zone constraints** — Physics must match zone
- **Material constraints** — Timing must match material
- **API correctness** — Proper exports required
- **Fidelity ceiling** — Visual limits respected

## Flow

```
1. User invokes /craft --forge or /forge
2. Agent sets forge mode context
3. Agent generates without survival constraints
4. Agent applies physics-only validation
5. User reviews generation
6. User decides: keep or discard
7. If keep: normal /craft flow applies
8. If discard: generation removed, no trace
```

## User Decision

After forge generation:
- **Keep**: Generated code enters normal workflow
- **Discard**: Generated code removed entirely

The user decides. Forge mode never auto-promotes.

## Context Flags

When forge mode active:
```typescript
{
  forgeMode: true,
  survivalBypass: true,
  physicsOnly: true
}
```

## Integration with /craft

```
/craft --forge "button with new gradient style"
```

Runs normal craft but:
1. Skips survival pattern matching
2. Skips rejected pattern warnings
3. Applies physics validation only
4. Prompts for keep/discard

## Logging

Forge mode logs:
- Activation timestamp
- Generated output (if kept)
- Keep/discard decision
- User who decided

## Safety

Forge mode is controlled exploration, not chaos:
- Physics constraints remain absolute
- Zone rules still apply
- Material timing still enforced
- Only pattern precedent is lifted

This means generated code is still SAFE, just potentially NOVEL.

## When to Use Forge Mode

- Exploring new design directions
- Breaking out of established patterns
- Testing alternatives to survival patterns
- Creative exploration with physics safety

## When NOT to Use Forge Mode

- Production-critical components
- Components in critical zones
- When consistency is paramount
- When survival patterns are known to work well
