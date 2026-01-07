---
severity: high
zones: [critical]
tags: [loading, ux, financial]
---

# Spinner Anxiety

## The Pattern

Using generic loading spinners during financial transactions or critical actions.

## Why to Avoid

1. **Creates uncertainty** — "Is it working? Did it go through?"
2. **No sense of progress** — User has no idea how long to wait
3. **Rage-clicking risk** — Users may click again, causing duplicate transactions
4. **Undermines trust** — Feels like the system is struggling

## What to Do Instead

### Option 1: Skeleton Loading with Deliberate Reveal

```tsx
<CriticalZone>
  <Skeleton reveal="deliberate" duration={800}>
    <ConfirmationContent />
  </Skeleton>
</CriticalZone>
```

Show the shape of what's coming, then reveal with weight.

### Option 2: Progress Indicators with Copy

```tsx
<CriticalZone>
  <ProgressIndicator>
    <Step>Verifying payment details...</Step>
    <Step>Processing transaction...</Step>
    <Step>Confirming with bank...</Step>
  </ProgressIndicator>
</CriticalZone>
```

Tell the user what's happening at each stage.

### Option 3: Optimistic UI with Reconciliation

```tsx
const action = useCriticalAction({
  mutation: () => api.processPayment(),
  timeAuthority: 'optimistic', // Show success immediately
  reconcile: true, // Rollback if server fails
});
```

Show success immediately, reconcile with server state.

## When Spinners ARE Acceptable

- **Admin zones** — Power users expect efficiency over ceremony
- **Non-critical actions** — Search results, filter updates
- **Very short operations** — Under 300ms, spinner won't even show

## Related

- See: `references/stripe/checkout-confirmation.md` for the right pattern
- See: Motion Design Principles for timing guidelines
