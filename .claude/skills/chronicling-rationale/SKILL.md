# Chronicling Rationale

## Purpose

Lightweight craft documentation via Stop hook.
Create decision logs without blocking generation.

## Trigger

Automatic - runs at end of /craft session via Stop hook.

## Philosophy

> "Document the why, not just the what. Let the log tell the story."

Craft logs capture the reasoning behind design decisions, creating
an audit trail that explains why patterns were chosen.

## Hook Behavior

- Runs at end of /craft session (Stop hook)
- Non-blocking (never interrupts generation)
- Silent (no user prompts)
- Writes to grimoires/sigil/state/craft-log/

## Craft Log Format

```markdown
# Craft Log: ComponentName
Date: 2026-01-08
Era: v1

## Request
[Original prompt from user]

## Context Resolution
- Zone: critical
- Physics: deliberate
- Vocabulary: ["claim", "trustworthy"]

## Decisions
| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Zone | critical | Contains "claim" term |
| Physics | deliberate | Zone requires weighted spring |
| Pattern | spring-entrance | Canonical pattern (5 uses) |

## New Patterns
- entrance-fade (experimental) — first appearance

## Physics Validated
- [x] Zone constraint: critical → deliberate
- [x] Material constraint: glass → smooth spring
- [x] Fidelity ceiling: no 3D effects
```

## Output Path

`grimoires/sigil/state/craft-log/{date}-{component}.md`

Example: `grimoires/sigil/state/craft-log/2026-01-08-ClaimButton.md`

## Log Sections

### Header
- Component name
- Date
- Current era name

### Request
- Original user prompt (verbatim)

### Context Resolution
- Resolved zone
- Applied physics
- Matched vocabulary terms

### Decisions
- Each decision point with choice and reasoning
- References to canonical patterns used
- Why this pattern was selected

### New Patterns
- Any newly created patterns
- Initial status (experimental)

### Physics Validated
- Checklist of constraints checked
- Each should pass or log wouldn't be generated

## Integration

### Stop Hook

Registered in settings.json:
```json
{
  "hooks": {
    "Stop": [{
      "script": ".claude/skills/chronicling-rationale/scripts/ensure-log.sh"
    }]
  }
}
```

### During /craft

1. Collect decisions during generation
2. At session end, format log
3. Write to craft-log directory
4. Log filename in output

## Performance

- Log generation: <100ms
- No blocking
- Async write

## Safety

- Never modifies generated code
- Read-only decision capture
- Graceful failure (missing fields logged)
