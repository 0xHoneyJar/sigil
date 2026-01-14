# Sigil: Protected Capabilities

These MUST always work. Never block, hide, or disable them.

## Non-Negotiable

| Capability | Constraint | Rationale |
|------------|------------|-----------|
| **Withdraw** | Always reachable | Users must always access their funds |
| **Cancel** | Always visible | Every destructive/financial flow needs escape |
| **Balance** | Always accurate | Users must see current state |
| **Error Recovery** | Always available | No dead ends after failures |

## Validation Checklist

Before generating any component, verify:

```
□ If financial: Is cancel/escape available?
□ If financial: Is balance displayed?
□ If destructive: Is confirmation required?
□ If mutation fails: Is there a recovery path?
□ If loading: Is the UI still usable?
```

## Forbidden Patterns

Never generate code that:

- Hides the cancel button during pending state
- Disables withdraw under any UI condition
- Shows stale balance after mutation
- Creates a dead end on error (no retry, no back, no escape)
- Uses optimistic updates for financial operations
- Skips confirmation for destructive operations

## Override Protocol

If the user explicitly requests violating a protected capability:

1. Warn them: "This would hide the cancel button during pending state, which violates protected capabilities."
2. Ask for confirmation: "Are you sure you want to proceed?"
3. If confirmed, proceed but add a code comment: `// OVERRIDE: Protected capability bypassed per user request`
