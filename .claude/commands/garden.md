---
name: garden
version: "2.6.0"
description: Health report including Process layer (Constitution, Decisions, Personas)
agent: gardening-entropy
agent_path: .claude/skills/gardening-entropy/SKILL.md
preflight:
  - sigil_mark_exists
---

# /garden (v2.6)

Health report including Process layer status. Detects drift, Constitution compliance, decision health, and recommends maintenance actions.

## Usage

```
/garden                   # Show full health report (Core + Process)
/garden --layout [name]   # Report for specific Layout
/garden --deprecated      # Focus on deprecated patterns
/garden --drift           # Focus on pattern drift
/garden --process         # Focus on Process layer health (NEW)
/garden --constitution    # Constitution compliance only (NEW)
/garden --decisions       # Decision status only (NEW)
```

## What Gets Reported

### 1. Layout Coverage

Shows which Layouts are used and component coverage.

### 2. Lens Distribution

Shows lens usage across the codebase.

### 3. Process Layer Health (NEW in v2.6)

Shows Constitution compliance, decision status, and persona coverage.

### 4. Deprecated Patterns

Lists deprecated patterns that should be migrated.

### 5. Pattern Drift

Components that have drifted from v2.6 patterns.

### 6. Recommendations

Prioritized actions based on findings.

## Output Format (v2.6)

```
/garden

SIGIL v2.6 HEALTH REPORT
═══════════════════════════════════════════════════════════

                     PROCESS LAYER (NEW)
═══════════════════════════════════════════════════════════

CONSTITUTION COMPLIANCE
┌─────────────────────────────────────────────────────────┐
│ Capability      │ Enforcement │ Status                  │
├─────────────────────────────────────────────────────────┤
│ withdraw        │ block       │ ✓ Always available      │
│ deposit         │ block       │ ✓ Always available      │
│ risk_alert      │ warn        │ ✓ Properly displayed    │
│ fee_disclosure  │ warn        │ ⚠️ Missing in 2 files   │
│ balance_visible │ log         │ ✓ Visible               │
└─────────────────────────────────────────────────────────┘

DECISION STATUS
┌─────────────────────────────────────────────────────────┐
│ Decision        │ Status  │ Expires      │ Issues      │
├─────────────────────────────────────────────────────────┤
│ DEC-2026-001    │ 🔒 locked│ 90 days     │ None        │
│ DEC-2026-002    │ 🔒 locked│ 30 days     │ None        │
│ DEC-2026-003    │ ⚠️ expired│ -15 days   │ Re-consult  │
│ DEC-2026-004    │ 🔓 unlocked│ Manual    │ Flagged     │
└─────────────────────────────────────────────────────────┘

PERSONA COVERAGE
┌─────────────────────────────────────────────────────────┐
│ Persona         │ Zones │ Components │ Coverage         │
├─────────────────────────────────────────────────────────┤
│ power_user      │ 3     │ 12         │ ████████████ 80% │
│ newcomer        │ 2     │ 8          │ ████████░░░░ 60% │
│ mobile          │ 1     │ 4          │ ██████░░░░░░ 50% │
│ accessibility   │ 0     │ 0          │ ░░░░░░░░░░░░ 0%  │
└─────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════

                     CORE LAYER
═══════════════════════════════════════════════════════════

LAYOUT COVERAGE
┌─────────────────────────────────────────────────────────┐
│ Layout          │ Components │ Coverage                 │
├─────────────────────────────────────────────────────────┤
│ CriticalZone    │ 8          │ ██████████████████░░ 90% │
│ MachineryLayout │ 12         │ ████████████████████ 100%│
│ GlassLayout     │ 6          │ ████████████████████ 100%│
│ No Layout       │ 4          │ ░░░░░░░░░░░░░░░░░░░░ 0%  │
└─────────────────────────────────────────────────────────┘

LENS DISTRIBUTION
┌─────────────────────────────────────────────────────────┐
│ Lens        │ Usage │ Context                          │
├─────────────────────────────────────────────────────────┤
│ StrictLens  │ 8     │ CriticalZone (forced)            │
│ DefaultLens │ 14    │ MachineryLayout, GlassLayout     │
│ A11yLens    │ 0     │ Not enabled                      │
└─────────────────────────────────────────────────────────┘

DEPRECATED PATTERNS
┌─────────────────────────────────────────────────────────┐
│ Pattern          │ Files │ Migration                    │
├─────────────────────────────────────────────────────────┤
│ SigilZone        │ 3     │ → CriticalZone/Machinery/Glass│
│ useServerTick    │ 2     │ → useCriticalAction          │
│ useSigilPhysics  │ 1     │ → useLens()                  │
└─────────────────────────────────────────────────────────┘

PATTERN DRIFT
┌─────────────────────────────────────────────────────────┐
│ File                           │ Issue                  │
├─────────────────────────────────────────────────────────┤
│ src/checkout/QuickBuy.tsx      │ Raw button in Layout   │
│ src/features/DeleteBtn.tsx     │ Missing Layout context │
│ src/admin/BulkAction.tsx       │ Wrong time authority   │
└─────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════

                     RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. FIX CONSTITUTION VIOLATIONS (Priority: CRITICAL)
   Issue: fee_disclosure missing in 2 files
   Files: src/checkout/Summary.tsx, src/wallet/Deposit.tsx
   Action: Add fee disclosure per Constitution requirement

2. RE-CONSULT EXPIRED DECISIONS (Priority: HIGH)
   Decision: DEC-2026-003 expired 15 days ago
   Action: /consult DEC-2026-003 --record-outcome (or delete)

3. REVIEW MANUALLY UNLOCKED DECISIONS (Priority: HIGH)
   Decision: DEC-2026-004 was manually unlocked
   Action: Re-lock if still valid, or document justification

4. ADD ACCESSIBILITY PERSONA COVERAGE (Priority: MEDIUM)
   Issue: No components target accessibility persona
   Action: Review critical paths for A11yLens support

5. MIGRATE DEPRECATED PATTERNS (Priority: MEDIUM)
   Files: 6 files using deprecated patterns
   Action: See sigil-mark/MIGRATION.md

6. ADD LAYOUT CONTEXT (Priority: LOW)
   Files: 4 components without Layout
   Action: /craft [file] to get Layout recommendation

═══════════════════════════════════════════════════════════
Last Updated: 2026-01-06
```

## Layout-Specific Report

```
/garden --layout CriticalZone

CRITICALZONE HEALTH
────────────────────────────────────────────────────

Components: 8
Lens: StrictLens (forced for financial=true)
Time Authority: server-tick (enforced)

Files:
┌─────────────────────────────────────────────────────────┐
│ File                    │ Financial │ Lens      │ Status│
├─────────────────────────────────────────────────────────┤
│ PaymentForm.tsx         │ true      │ Strict    │ ✓     │
│ ConfirmDialog.tsx       │ true      │ Strict    │ ✓     │
│ DeleteAccount.tsx       │ true      │ Strict    │ ✓     │
│ QuickBuy.tsx            │ true      │ RAW BTN   │ ✗     │
└─────────────────────────────────────────────────────────┘

Issues:
  - QuickBuy.tsx: Uses raw <button> instead of Lens.CriticalButton
```

## Deprecated Patterns Detail

```
/garden --deprecated

DEPRECATED v1.2.5 PATTERNS
────────────────────────────────────────────────────

SigilZone (3 files):
  - src/legacy/OldCheckout.tsx:12
  - src/legacy/OldAdmin.tsx:8
  - src/legacy/OldMarketing.tsx:15
  Migration: Replace with CriticalZone, MachineryLayout, or GlassLayout

useServerTick (2 files):
  - src/legacy/PaymentBtn.tsx:23
  - src/legacy/ConfirmBtn.tsx:18
  Migration: Use useCriticalAction({ timeAuthority: 'server-tick' })

useSigilPhysics (1 file):
  - src/legacy/AnimatedCard.tsx:9
  Migration: Use useLens()

@sigil/recipes/* imports (4 files):
  - src/features/Button.tsx:3
  - src/features/Card.tsx:2
  - src/features/Table.tsx:4
  - src/features/Form.tsx:1
  Migration: Use Layout + Lens components

Total: 10 files need migration
Guide: sigil-mark/MIGRATION.md
```

## Drift Detection

Pattern drift occurs when:
- Raw HTML elements used inside Layouts
- Wrong time authority for action type
- Missing Layout context for action components
- Lens bypass (not using useLens())

## Migration Priority

| Pattern | Priority | Reason |
|---------|----------|--------|
| SigilZone | HIGH | Core architecture change |
| useServerTick | HIGH | Time authority pattern |
| useSigilPhysics | MEDIUM | Lens resolution |

## Process Layer Reports (NEW in v2.6)

### Constitution-Only Report

```
/garden --constitution

CONSTITUTION COMPLIANCE REPORT
════════════════════════════════════════════════════════════

Protected Capabilities: 8
Violations: 1

VIOLATIONS:
┌─────────────────────────────────────────────────────────┐
│ Capability      │ File                 │ Issue          │
├─────────────────────────────────────────────────────────┤
│ fee_disclosure  │ src/checkout/Sum.tsx │ Not displayed  │
│ fee_disclosure  │ src/wallet/Dep.tsx   │ Missing        │
└─────────────────────────────────────────────────────────┘

RECOMMENDATIONS:
- Add fee disclosure component to affected files
- Review Constitution rationale in protected-capabilities.yaml
```

### Decisions-Only Report

```
/garden --decisions

DECISION STATUS REPORT
════════════════════════════════════════════════════════════

Total Decisions: 4
Locked: 2
Expired: 1
Unlocked: 1

ATTENTION REQUIRED:
┌─────────────────────────────────────────────────────────┐
│ Decision     │ Status   │ Action Needed                 │
├─────────────────────────────────────────────────────────┤
│ DEC-2026-003 │ expired  │ Re-consult or delete          │
│ DEC-2026-004 │ unlocked │ Review justification          │
└─────────────────────────────────────────────────────────┘

HEALTHY:
┌─────────────────────────────────────────────────────────┐
│ Decision     │ Status │ Expires     │ Topic             │
├─────────────────────────────────────────────────────────┤
│ DEC-2026-001 │ locked │ 90 days    │ Primary CTA color  │
│ DEC-2026-002 │ locked │ 30 days    │ Mobile nav pattern │
└─────────────────────────────────────────────────────────┘
```

### Process-Only Report

```
/garden --process

PROCESS LAYER HEALTH
════════════════════════════════════════════════════════════

Constitution:
  - Protected capabilities: 8
  - Violations: 1 (warn level)
  - Status: ⚠️ Needs attention

Decisions:
  - Total: 4
  - Healthy: 2
  - Expired: 1
  - Unlocked: 1
  - Status: ⚠️ Needs attention

Personas:
  - Defined: 4 (power_user, newcomer, mobile, accessibility)
  - Active: 3 (accessibility not used)
  - Status: ℹ️ Review accessibility coverage

Overall Process Health: ⚠️ NEEDS ATTENTION
```

## Next Steps

Based on recommendations:
- `/craft [file]` for guidance on specific files with Process context
- `/consult --status [id]` to check decision details
- `/consult --unlock [id]` for early unlock requests
- `/validate` for detailed violation report
- See `sigil-mark/MIGRATION.md` for full migration guide
