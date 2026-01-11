---
name: garden
description: Health report on recipes, sandboxes, and compliance
skill: sigil-core
---

# /garden

Health report showing recipe coverage, active sandboxes, and recommendations.

## Usage

```
/garden
/garden --verbose
```

## Output

```
╔═══════════════════════════════════════════════════════════╗
║                    SIGIL GARDEN REPORT                    ║
╚═══════════════════════════════════════════════════════════╝

RECIPE COVERAGE:
  Components scanned: 47
  Using recipes: 44 (94%)
  In sandbox: 2 (4%)
  Raw override: 1 (2%)

BY ZONE:
  checkout (decisive): 12 components, 100% compliant
  admin (machinery): 21 components, 95% compliant
  marketing (glass): 14 components, 86% compliant

SANDBOXES:
  ⚠ src/checkout/Experiment.tsx
    Age: 3 days
    Physics: spring(240, 10)
    → Ready for /codify?
  
  🚨 src/marketing/NewHero.tsx
    Age: 12 days ← STALE
    → Needs attention

VARIANTS CREATED:
  decisive/Button.nintendo — 2 days ago
  decisive/Button.relaxed — 5 days ago
  glass/Card.floating — 1 week ago

RECOMMENDATIONS:
  1. /codify src/checkout/Experiment.tsx (3 days in sandbox)
  2. Review src/marketing/NewHero.tsx (stale sandbox)
  3. Consider recipe for marketing (3 raw overrides)

Next: /codify | Review sandboxes | /validate
```

## Metrics Tracked

- Recipe coverage percentage
- Active sandboxes (with age)
- Stale sandboxes (>7 days warning)
- Recipe variants created
- Compliance by zone
