# Gardener Skill

> "Patterns earn status through usage, not approval dialogs."

## Purpose

Gardener is the invisible governance skill for Sigil v10.1. It monitors pattern usage and automatically promotes components to higher authority tiers based on real usage data.

## Invocation

Gardener runs automatically in the background. Manual invocation:

```
/garden
```

## Workflow

1. **Pattern Scanning**
   - Scan `src/components/**/*.tsx` for component usage
   - Count imports across codebase
   - Calculate stability (days since last change)

2. **Authority Inference**
   - Apply thresholds from `authority.yaml`
   - Gold: 10+ imports, 14+ days stable
   - Silver: 5+ imports, 7+ days stable
   - Draft: everything else

3. **Promotion Decision**

   | Confidence | Action |
   |------------|--------|
   | 95%+ | Auto-promote (no human needed) |
   | 80-95% | Create PR for review |
   | <80% | No action |

4. **Context Update**
   - Update `grimoires/sigil/.context/authority.json`
   - Log promotion in `grimoires/sigil/.context/history.json`

## No Dialogs Policy

Gardener NEVER:
- Asks "Should this be promoted?"
- Shows "Pattern X reached threshold"
- Interrupts with approval requests
- Requires manual nomination PRs

Gardener DOES:
- Silently track usage
- Automatically promote when thresholds met
- Create PRs only when human judgment genuinely needed
- Log all actions for audit trail

## Authority Thresholds

```yaml
# grimoires/sigil/authority.yaml
gold:
  min_imports: 10
  min_stability_days: 14

silver:
  min_imports: 5
  min_stability_days: 7

evolution:
  auto_promote: 0.95
  human_review: 0.80
```

## Triggers

### On Push to Main

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'src/**/*.tsx'
      - 'src/**/*.ts'
```

When code is merged:
1. Scan affected components
2. Recount imports
3. Update authority metrics
4. Auto-promote if thresholds met

### Daily Cron

```yaml
on:
  schedule:
    - cron: '0 0 * * *'
```

Daily at midnight:
1. Full codebase scan
2. Check stability windows
3. Bulk promotions if any qualify

## Library Dependencies

```typescript
import { SurvivalEngine, inferAuthority, countImports } from '@sigil/survival';
import { analyzeAST, inferIntent } from '@sigil/ast-reader';
```

## Authority Computation

Authority is computed, never stored:

```typescript
async function inferAuthority(component: string): Promise<Tier> {
  const imports = await countImports(component);
  const stability = await getStabilityDays(component);

  if (imports >= 10 && stability >= 14) return 'gold';
  if (imports >= 5) return 'silver';
  return 'draft';
}
```

No file moves required. Authority is a computed property.

## GitHub Actions Integration

```yaml
# .github/workflows/sigil-gardener.yaml
name: Sigil Gardener

on:
  push:
    branches: [main]
    paths:
      - 'src/**/*.tsx'
      - 'src/**/*.ts'

jobs:
  garden:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx ts-node src/lib/sigil/survival.ts
      - run: |
          if [ -n "$(git status --porcelain)" ]; then
            git config user.name "Sigil Gardener"
            git config user.email "sigil@bot"
            git add -A
            git commit -m "chore(sigil): update authority metrics"
            git push
          fi
```

## Metrics Tracked

| Metric | Description |
|--------|-------------|
| `imports` | Count of files importing this component |
| `stability_days` | Days since last modification |
| `usage_patterns` | How component is typically used |
| `dependency_health` | Status of component's dependencies |

## Promotion History

All promotions logged to `grimoires/sigil/.context/history.json`:

```json
{
  "promotions": [
    {
      "component": "Button",
      "from": "silver",
      "to": "gold",
      "reason": "10+ imports, 14+ days stable",
      "confidence": 0.97,
      "timestamp": "2026-01-11T10:00:00Z"
    }
  ]
}
```

## Consolidated From

Gardener replaces these 10+ skills:
- canonizing-flaws
- gardening-entropy
- graduating-features
- graphing-imports
- managing-eras
- monitoring-features
- observing-survival
- proving-features
- scanning-sanctuary
- seeding-sanctuary

---

*Sigil v10.1.0 "Usage Reality"*
