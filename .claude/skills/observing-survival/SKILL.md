# Observing Survival

## Purpose

Silent pattern tracking via PostToolUse hook.
Observe what patterns emerge, track their survival.

## Trigger

Automatic - runs after Write|Edit tool.

## Philosophy

> "Watch. Don't interrupt. Let patterns prove themselves."

The observation system tracks patterns silently, without interrupting
the creative flow. It observes, records, and lets usage data speak.

## Hook Behavior

- Runs after every Write|Edit tool call
- Non-blocking (never interrupts generation)
- Silent (no user prompts)
- Updates survival.json incrementally

## Pattern Detection

Detected patterns:
- Animation/transition patterns
- Component structure patterns
- Hook usage patterns
- State management patterns
- Styling patterns

## JSDoc Pattern Tags

After generation, patterns are tagged:
```typescript
// @sigil-pattern: spring-entrance (2026-01-09)
const enterAnimation = { ... }
```

Tags are:
- Non-intrusive (comments only)
- Parseable (for gardener)
- Dated (first appearance)

## Survival Index

Pattern tracking in `survival.json`:
```json
{
  "patterns": {
    "survived": {
      "spring-entrance": {
        "occurrences": 5,
        "first_seen": "2026-01-09",
        "last_seen": "2026-01-15",
        "files": ["src/Button.tsx", "src/Card.tsx"],
        "status": "canonical"
      }
    },
    "canonical": ["spring-entrance", "deliberate-exit"],
    "rejected": ["instant-fade", "jarring-bounce"]
  }
}
```

## Promotion Rules

Pattern status progression:
1. **experimental** — First appearance (0-2 occurrences)
2. **surviving** — Repeated usage (3-4 occurrences)
3. **canonical** — Established pattern (5+ occurrences)

Demotion:
- **rejected** — Deleted from all files

## Gardener Script

Weekly scan that:
1. Finds all @sigil-pattern tags via ripgrep
2. Counts occurrences per pattern
3. Applies promotion rules
4. Detects deletions (rejected)
5. Updates survival.json

## Integration

### PostToolUse Hook

Registered in settings.json:
```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "script": ".claude/skills/observing-survival/scripts/observe.sh"
    }]
  }
}
```

### Craft Integration

During `/craft`:
1. Generate code
2. Tag new patterns
3. Return generated code
4. PostToolUse observes

## What Gets Tracked

| Category | Examples |
|----------|----------|
| Animation | spring-entrance, deliberate-exit |
| Structure | compound-component, slot-pattern |
| Hooks | useSigilMutation, useSpring |
| State | optimistic-update, server-tick |
| Style | gradient-accent, glass-bg |

## Performance

- Pattern detection: <10ms
- Survival update: <5ms
- No blocking
- Async write

## Safety

- Never modifies generated code
- Only adds comments (tags)
- Non-blocking by design
- Graceful failure (silent)
