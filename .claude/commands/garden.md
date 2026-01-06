---
name: garden
version: "1.2.4"
description: Health report on recipes, sandboxes, and variants
agent: gardening-entropy
agent_path: .claude/skills/gardening-entropy/SKILL.md
preflight:
  - sigil_mark_exists
---

# /garden

Health report on recipes, sandboxes, and variants. Shows coverage and recommends actions.

## Usage

```
/garden                 # Show health report
/garden --zone [zone]   # Report for specific zone
/garden --sandboxes     # Focus on sandbox status
/garden --variants      # Show recipe variants
```

## What Gets Reported

### 1. Recipe Coverage by Zone

Shows which zones have recipes and how many components use them.

### 2. Active Sandboxes

Lists sandboxes with age. Flags stale sandboxes (>7 days).

### 3. Recipe Variants

Shows variants created (e.g., `Button.nintendo.tsx`).

### 4. Recommendations

Suggests actions based on findings.

## Output Format

```
/garden

SIGIL HEALTH REPORT
═══════════════════════════════════════════════════════════

RECIPE COVERAGE
┌─────────────────────────────────────────────────────────┐
│ Zone       │ Recipes │ Components │ Coverage           │
├─────────────────────────────────────────────────────────┤
│ decisive   │ 4       │ 12         │ ████████████░░ 85% │
│ machinery  │ 3       │ 8          │ ████████████░░ 88% │
│ glass      │ 3       │ 6          │ ██████████████ 100%│
└─────────────────────────────────────────────────────────┘

ACTIVE SANDBOXES (2)
┌─────────────────────────────────────────────────────────┐
│ File                           │ Age    │ Status       │
├─────────────────────────────────────────────────────────┤
│ src/checkout/ExperimentBtn.tsx │ 3 days │ OK           │
│ src/marketing/NewHero.tsx      │ 12 days│ ⚠ STALE     │
└─────────────────────────────────────────────────────────┘

RECIPE VARIANTS (3)
┌─────────────────────────────────────────────────────────┐
│ Base        │ Variant       │ Physics    │ Purpose     │
├─────────────────────────────────────────────────────────┤
│ Button      │ Button.nintendo│ (300, 8)  │ Snappy feel │
│ Button      │ Button.relaxed │ (140, 16) │ Soft feel   │
└─────────────────────────────────────────────────────────┘

RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. CODIFY STALE SANDBOX
   File: src/marketing/NewHero.tsx
   Age: 12 days
   Action: /codify src/marketing/NewHero.tsx

2. IMPROVE DECISIVE COVERAGE
   Missing: 2 components without recipes
   Files: src/checkout/FastPay.tsx, src/checkout/Retry.tsx
   Action: /craft for these files

3. REVIEW VARIANTS
   Button has 2 variants — consider if both are needed

═══════════════════════════════════════════════════════════
Last Updated: 2026-01-05
```

## Sandbox States

| Status | Age | Action |
|--------|-----|--------|
| OK | <7 days | Continue experimenting |
| STALE | 7-14 days | Should codify soon |
| CRITICAL | >14 days | Must codify or clear |

## Variant Guidelines

Variants should be created when:
- Physics feels substantially different
- Pattern is reusable across components
- Refinement feedback leads to new feel

Variants should NOT be created for:
- One-off adjustments
- Temporary experiments
- Minor tweaks

## Report Output

With zone flag:
```
/garden --zone decisive

DECISIVE ZONE HEALTH
────────────────────
Recipes: 4 (Button, ButtonNintendo, ButtonRelaxed, ConfirmFlow)
Components: 12
Coverage: 85%
Sandboxes: 1 (OK)
Variants: 2

Missing Coverage:
  - src/checkout/FastPay.tsx
  - src/checkout/Retry.tsx
```

## Next Steps

Based on recommendations:
- `/codify` for stale sandboxes
- `/craft` for missing coverage
- `/sandbox --clear` for abandoned experiments
