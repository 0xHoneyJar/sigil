# Sigil: Protected Capabilities

These capabilities are non-negotiable. They take priority over all other rules.

<protected_rules>
## Non-Negotiable Capabilities

| Capability | Rule | Why |
|------------|------|-----|
| **Withdraw** | Always reachable | Users must always access their funds. Never hide behind loading states. |
| **Cancel** | Always visible | Every flow needs an escape. Users must be able to back out at any point. |
| **Balance** | Always accurate | Users must see their current balance. Stale data causes real financial harm. |
| **Error Recovery** | Always available | No dead ends. Every error state must have a path forward. |
| **Touch Target** | Minimum 44px | Apple HIG, accessibility. Smaller targets cause frustration and mistakes. |
| **Focus Ring** | Always visible | Keyboard users need to know where they are. Non-negotiable accessibility. |
</protected_rules>

<verification_checklist>
## Verification Before Generation

Run this checklist before generating any component:

**For Financial Components:**
- [ ] Cancel button present and always clickable (even during loading)
- [ ] Amount displayed clearly before confirmation
- [ ] Balance shown and current (invalidate queries on success)
- [ ] Error state has retry option
- [ ] No optimistic updates (pessimistic only for money)

**For Destructive Components:**
- [ ] Confirmation step required
- [ ] Cancel/back option visible
- [ ] Clear description of what will be deleted
- [ ] Undo option if soft delete

**For All Interactive Components:**
- [ ] Touch target ≥44px
- [ ] Focus ring visible on keyboard navigation
- [ ] Error messages are user-friendly
- [ ] Loading states don't block escape
</verification_checklist>

<forbidden_patterns>
## Patterns That Violate Protected Capabilities

These patterns are forbidden. If you find yourself generating them, stop and reconsider:

| Pattern | Why Forbidden | Fix |
|---------|---------------|-----|
| `{!isPending && <CancelButton />}` | User trapped during loading | Always show cancel |
| `{balance}` without invalidation | Stale financial data | Invalidate queries on mutation |
| `{isError && <p>Error</p>}` | No recovery path | Add retry/back buttons |
| `onMutate` for financial ops | Can't roll back money | Use pessimistic sync |
| No confirmation for delete | Accidental permanent loss | Require confirmation step |
| Button with no focus styles | Keyboard users lost | Add `:focus-visible` ring |
</forbidden_patterns>

<override_protocol>
## When User Requests Violation

If the user explicitly requests violating a protected capability:

1. **Explain the risk clearly:**
   ```
   This would hide the cancel button during pending state.
   Users could be trapped in a flow they can't escape.
   ```

2. **Ask for explicit confirmation:**
   ```
   Are you sure you want to proceed? (yes to override)
   ```

3. **If confirmed, document the override:**
   ```tsx
   // OVERRIDE: Cancel hidden during pending per user request
   // This violates protected capability: escape hatch
   ```

Protected capabilities exist to prevent user harm. Override only when the user has considered the consequences.
</override_protocol>
