# Glyph: Protected Capabilities

Non-negotiable. These take priority over all other rules.

## The Capabilities

| Capability | Rule | Why |
|------------|------|-----|
| **Withdraw** | Always reachable | Users must always access funds. Never hide behind loading. |
| **Cancel** | Always visible | Every flow needs escape. Users must back out at any point. |
| **Balance** | Always accurate | Stale financial data causes real harm. Invalidate on mutation. |
| **Error Recovery** | Always available | No dead ends. Every error has a path forward. |
| **Touch Target** | Minimum 44px | Apple HIG, accessibility. Smaller = mistakes. |
| **Focus Ring** | Always visible | Keyboard users must know where they are. |

## Verification Checklist

Before generating financial components:
- [ ] Cancel button present and clickable during loading
- [ ] Amount displayed before confirmation
- [ ] Balance shown and current
- [ ] Error state has retry option
- [ ] No optimistic updates

Before generating destructive components:
- [ ] Confirmation step required
- [ ] Cancel option visible
- [ ] Clear description of what's deleted
- [ ] Undo option if soft delete

Before generating any interactive component:
- [ ] Touch target ≥44px
- [ ] Focus ring visible
- [ ] Error messages user-friendly

## Forbidden Patterns

| Pattern | Why Forbidden | Fix |
|---------|---------------|-----|
| `{!isPending && <Cancel />}` | User trapped during loading | Always show cancel |
| `{balance}` without invalidation | Stale financial data | Invalidate on mutation |
| `onMutate` for financial | Can't roll back money | Pessimistic sync |
| Delete without confirmation | Accidental permanent loss | Require confirmation |
| No focus styles | Keyboard users lost | Add `:focus-visible` |

## Override Protocol

If user requests violating a protected capability:

1. Explain the risk clearly
2. Ask for explicit confirmation
3. If confirmed, document the override in code comment

## External Reference

See `references/ui-skills/fixing-accessibility.md` for expanded a11y guidance:
- Screen reader compatibility checks
- Keyboard navigation patterns
- ARIA attribute requirements
- Focus management

See `references/rams/SKILL.md` for automated review:
- WCAG 2.1 critical/serious/moderate checks
- Output format with line numbers and fixes
