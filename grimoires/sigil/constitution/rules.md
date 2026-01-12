# Sigil Design Rules

> Version: 9.1.0

## Motion Physics

Motion timing is determined by zone and data type:

| Zone | Physics | Duration | Use Case |
|------|---------|----------|----------|
| Critical | server-tick | 600ms | Financial transactions, irreversible actions |
| Important | deliberate | 800ms | Settings, preferences, significant changes |
| Casual | snappy | 150ms | Tooltips, hovers, quick interactions |
| Default | smooth | 300ms | General UI, cards, panels |

## Protected Capabilities

See: [protected-capabilities.yaml](./protected-capabilities.yaml)

These capabilities can NEVER be disabled:
- Withdraw funds
- Deposit funds
- Risk alerts
- Slippage warnings
- Fee disclosure
- Balance visibility
- Error messages
- Help access

## Vocabulary

See: [vocabulary.yaml](./vocabulary.yaml)

Vocabulary terms map to zones:
- "claim", "deposit", "withdraw" → critical zone
- "settings", "preferences" → important zone
- "tooltip", "hint" → casual zone

## Quality Gates

Before promotion to Gold:
1. **Linter Gate** - ESLint 0 warnings, TSC strict
2. **Survival Criteria** - 5+ Gold imports, 2+ weeks stable
3. **No Console Logs** - Production code only
4. **Has Docstring** - Document purpose and usage

## Slot-Based Composition

Gold components can accept Draft children:

```tsx
// ALLOWED - Draft as children
<GoldButton>
  <DraftAnimation />
</GoldButton>

// BLOCKED - Direct import
import { DraftThing } from '../draft'; // ERROR
```
