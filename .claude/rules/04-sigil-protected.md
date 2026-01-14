# Sigil: Protected Capabilities

These capabilities MUST always work. Verify them before generating any financial or destructive component.

## Non-Negotiable Capabilities

| Capability | Constraint | Why |
|------------|------------|-----|
| **Withdraw** | Always reachable | Users must always access their funds. Never hide behind loading states or disabled conditions. |
| **Cancel** | Always visible | Every destructive/financial flow needs an escape. Users must be able to back out at any point. |
| **Balance** | Always accurate | Users must see their current balance. Never show stale data for financial displays. |
| **Error Recovery** | Always available | No dead ends after failures. Every error state must have a path forward (retry, go back, contact support). |

## Verification Checklist

Before generating any component, verify applicable protections:

### For Financial Components
```
✓ Cancel button present and always clickable
✓ Amount displayed clearly before confirmation
✓ Balance shown and current
✓ Error state has retry option
✓ Loading state doesn't hide cancel
✓ Disabled state explains why (if applicable)
```

### For Destructive Components
```
✓ Confirmation step required
✓ Cancel/back option visible
✓ Clear description of what will be deleted
✓ Error recovery path exists
✓ Undo option if soft delete
```

### For All Mutations
```
✓ Error messages are user-friendly
✓ Loading states don't block escape
✓ Network failure has recovery path
```

## Forbidden Patterns

These patterns violate protected capabilities. Never generate them:

| Pattern | Why It's Forbidden |
|---------|-------------------|
| Cancel hidden during pending | User trapped in flow they can't escape |
| Withdraw disabled without explanation | User can't access their funds |
| Stale balance after mutation | User sees wrong financial state |
| Error with no retry/back/escape | Dead end, user stuck |
| Optimistic update for financial ops | Rollback impossible for money |
| Confirmation skipped for destructive ops | Accidental permanent deletion |

## When User Requests Violation

If the user explicitly requests violating a protected capability:

1. **Warn clearly:**
   ```
   ⚠️ This would hide the cancel button during pending state.
   This violates protected capabilities because users could be
   trapped in a flow they can't escape.
   ```

2. **Ask for confirmation:**
   ```
   Are you sure you want to proceed? (yes to override)
   ```

3. **If confirmed, proceed with comment:**
   ```tsx
   // OVERRIDE: Cancel hidden during pending per user request
   // This violates protected capability: escape hatch
   ```

## Examples of Correct Protection

### Cancel Always Visible
```tsx
// ✓ Correct: Cancel visible even during pending
<div>
  <button onClick={onCancel}>Cancel</button>
  <button onClick={mutate} disabled={isPending}>
    {isPending ? 'Processing...' : 'Confirm'}
  </button>
</div>

// ✗ Wrong: Cancel hidden during pending
{!isPending && <button onClick={onCancel}>Cancel</button>}
```

### Error Recovery Path
```tsx
// ✓ Correct: Error has retry and back options
{isError && (
  <div>
    <p>Something went wrong: {error.message}</p>
    <button onClick={() => mutate()}>Try Again</button>
    <button onClick={onBack}>Go Back</button>
  </div>
)}

// ✗ Wrong: Error with no escape
{isError && <p>Error occurred</p>}
```

### Balance Always Current
```tsx
// ✓ Correct: Refetch balance after mutation
const { mutate } = useMutation({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['balance'] })
  }
})

// ✗ Wrong: Balance could be stale
const { mutate } = useMutation({
  onSuccess: () => {
    // no balance refresh
  }
})
```
