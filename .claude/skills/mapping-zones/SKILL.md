# Sigil v1.0 Agent: Mapping Zones

> "Zones are physics contexts. Different zones, different rules."

## Role

**Zone Architect** — Analyzes codebase structure, suggests zone mappings, and configures path-based design zones. Zones live in Sigil; codebase stays clean.

## Command

```
/map              # Analyze codebase and review zone configuration
/map --analyze    # Deep analysis: scan codebase, suggest zone mappings
/map --suggest    # Suggest file reorganization (optional, non-destructive)
/map --refine     # Refine existing zones: gaps, conflicts, specificity
/map --add        # Add a new custom zone
/map --paths      # Focus on path mapping only
```

## Philosophy

**Zones adapt to codebases, not vice versa.**

- Zone definitions live in `sigil-mark/resonance/zones.yaml`
- Codebase structure is respected, not dictated
- Glob patterns are flexible enough for any structure
- Suggestions are optional; existing taste is preserved

## Outputs

| Path | Description |
|------|-------------|
| `sigil-mark/resonance/zones.yaml` | Zone definitions and path mappings |

## Prerequisites

- Run `mount-sigil.sh` first (creates sigil-mark/ structure)
- Run `/envision` first (need essence.yaml for feel context)
- Run `/codify` first (optional, but recommended)

---

## Workflow: `/map` (Default)

### Phase 1: Load Context

Read:
- `sigil-mark/resonance/zones.yaml` — Current zone configuration
- `sigil-mark/resonance/essence.yaml` — Product feel for tension defaults
- `sigil-mark/core/sync.yaml` — Temporal Governor constraints

### Phase 2: Scan Codebase Structure

Identify component directories:
```bash
# Common patterns to scan
src/features/*/
src/components/
app/(app)/*/
components/
pages/
```

Build a structure map:
```
Codebase Structure:

src/
├── features/
│   ├── checkout/      ← likely critical
│   ├── claim/         ← likely critical
│   ├── dashboard/     ← likely transactional
│   ├── settings/      ← likely transactional
│   ├── browse/        ← likely exploratory
│   └── social/        ← likely exploratory
├── components/        ← shared (default zone)
└── pages/
    ├── landing/       ← likely marketing
    └── about/         ← likely marketing
```

### Phase 3: Present Zone Mapping

Display current zones with coverage analysis:

```
Zone Coverage Analysis:

┌─────────────────────────────────────────────────────────────────────┐
│ CRITICAL (server_authoritative, discrete 600ms, clay)               │
│ Budget: 5 elements, 2 decisions, 1 animation                        │
├─────────────────────────────────────────────────────────────────────┤
│ Mapped paths:                                                       │
│   ✓ **/checkout/**     → src/features/checkout/ (12 files)         │
│   ✓ **/claim/**        → src/features/claim/ (8 files)             │
│   ✗ **/payment/**      → no matches                                 │
│                                                                     │
│ Suggested additions:                                                │
│   + **/withdraw/**     → src/features/withdraw/ (5 files)          │
│   + **/trade/**        → src/features/trade/ (15 files)            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ UNMAPPED (will use default zone)                                    │
├─────────────────────────────────────────────────────────────────────┤
│   ? src/features/profile/     (18 files) — suggest: transactional   │
│   ? src/features/notifications/ (7 files) — suggest: transactional  │
│   ? src/features/rewards/     (9 files) — suggest: exploratory      │
└─────────────────────────────────────────────────────────────────────┘

Actions: [add paths] [create zone] [accept suggestions] [done]
```

### Phase 4: Interactive Refinement

Use AskUserQuestion to refine:

```
Unmapped: src/features/profile/

This directory contains user profile management.
Based on the files, this appears to be routine operations.

Suggested zone: transactional
  - Optimistic updates OK
  - Instant feedback
  - Machinery material

Accept suggestion? [yes / different zone / skip]
```

### Phase 5: Update zones.yaml

After refinement, update the configuration:

```yaml
definitions:
  critical:
    paths:
      - "**/checkout/**"
      - "**/claim/**"
      - "**/withdraw/**"    # Added
      - "**/trade/**"       # Added
    # ... physics unchanged

  transactional:
    paths:
      - "**/dashboard/**"
      - "**/settings/**"
      - "**/profile/**"     # Added
      - "**/notifications/**" # Added
```

---

## Workflow: `/map --analyze`

Deep analysis mode for new or inherited codebases.

### Phase 1: Full Codebase Scan

```
Scanning codebase...

Found 47 feature directories
Found 156 component files
Found 23 page routes

Analyzing patterns...
```

### Phase 2: Pattern Detection

Identify high-stakes vs low-stakes patterns:

```
Pattern Analysis:

HIGH-STAKES INDICATORS (→ critical zone):
  - Files with "confirm", "submit", "purchase" in name
  - Directories: checkout/, payment/, claim/, trade/, withdraw/
  - Components with loading states + server calls
  - Forms with financial data

ROUTINE INDICATORS (→ transactional zone):
  - Settings, preferences, profile management
  - List/table views with CRUD operations
  - Dashboard components

DISCOVERY INDICATORS (→ exploratory zone):
  - Browse, explore, discover, gallery
  - Infinite scroll, card grids
  - Social features, feeds

MARKETING INDICATORS (→ marketing zone):
  - Landing pages, home, about, pricing
  - Hero sections, testimonials
  - Promotional content
```

### Phase 3: Generate Zone Map

```
Recommended Zone Configuration:

CRITICAL (5 directories, 42 files)
├── src/features/checkout/
├── src/features/claim/
├── src/features/payment/
├── src/features/trade/
└── src/features/withdraw/

TRANSACTIONAL (8 directories, 67 files)
├── src/features/dashboard/
├── src/features/settings/
├── src/features/profile/
├── src/features/inventory/
├── src/features/history/
├── src/features/notifications/
├── src/features/preferences/
└── src/features/account/

EXPLORATORY (4 directories, 38 files)
├── src/features/browse/
├── src/features/discover/
├── src/features/social/
└── src/features/gallery/

MARKETING (3 directories, 15 files)
├── pages/landing/
├── pages/about/
└── pages/pricing/

DEFAULT (shared components, 47 files)
└── src/components/

Apply this configuration? [yes / modify / cancel]
```

---

## Workflow: `/map --suggest`

Suggests file reorganization WITHOUT requiring changes.

### Philosophy

> "Zones adapt to structure. But if structure is unclear, we can suggest clarity."

This mode is **advisory only**. It helps teams think about organization but never forces changes.

### Output

```
Structure Suggestions (Optional):

Your codebase works with the current structure.
These suggestions might improve zone clarity:

1. CONSIDER: Move src/components/ClaimButton.tsx
   FROM: src/components/ (default zone)
   TO:   src/features/claim/components/ (critical zone)
   WHY:  This component handles irreversible claims.
         It would inherit critical zone physics automatically.

2. CONSIDER: Rename src/features/buy/ → src/features/checkout/
   WHY:  "checkout" is a standard pattern that maps to critical.
         Current path requires explicit mapping.

3. CONSIDER: Split src/features/wallet/
   - wallet/balance/     → transactional (viewing)
   - wallet/withdraw/    → critical (money movement)
   WHY:  Different operations have different stakes.

These are SUGGESTIONS. Your current structure works fine.
Zone patterns can accommodate any structure.

[Apply suggestions] [Ignore] [Add to zones.yaml instead]
```

### The "Add to zones.yaml instead" Option

If user doesn't want to move files, add more specific patterns:

```yaml
# Instead of moving files, add specific patterns
critical:
  paths:
    - "**/checkout/**"
    - "**/claim/**"
    - "**/wallet/withdraw/**"    # Specific path within wallet
    - "src/components/ClaimButton.tsx"  # Specific file
```

---

## Workflow: `/map --refine`

Refine existing zones for better coverage and specificity.

### Phase 1: Gap Analysis

```
Zone Gap Analysis:

GAPS (files falling to default when they shouldn't):
  ⚠ src/features/staking/Stake.tsx
    Currently: default zone
    Likely should be: critical (involves locking funds)

  ⚠ src/features/rewards/ClaimReward.tsx
    Currently: default zone
    Likely should be: critical (contains "claim")

OVER-BROAD PATTERNS:
  ⚠ **/settings/** matches too much
    - src/features/settings/ (intended) ✓
    - src/features/checkout/settings/ (conflict) ✗

UNUSED PATTERNS:
  ⚠ **/confirm/** — no files match this pattern
```

### Phase 2: Conflict Resolution

```
PATH CONFLICT DETECTED:

Path: src/features/checkout/settings/PaymentMethods.tsx

Matches multiple zones:
  1. critical (**/checkout/**)
  2. transactional (**/settings/**)

Current resolution: critical (higher priority)

Options:
  a) Keep current (critical wins)
  b) Add explicit exclusion to critical
  c) Add explicit path to transactional
  d) Use @sigil-zone comment in file

Choose [a/b/c/d]:
```

### Phase 3: Specificity Suggestions

```
Specificity Improvements:

Current: **/checkout/**
  Matches: 15 files

Suggested split:
  **/checkout/confirm/** → critical
  **/checkout/cart/**    → transactional (cart is reversible)
  **/checkout/success/** → marketing (celebration)

This gives more precise physics per interaction type.

Apply refinement? [yes / no]
```

---

## Zone Resolution Algorithm

```
When agent needs zone for a file:

1. Check for @sigil-zone comment in file
   // @sigil-zone critical

2. Match path against zone patterns (priority order):
   - critical (check first — highest stakes)
   - admin (power users)
   - marketing (specific pages)
   - transactional (routine operations)
   - exploratory (discovery)
   - default (fallback)

3. Return matching zone with all physics
```

## Success Criteria

- [ ] All feature paths are analyzed
- [ ] High-stakes paths mapped to critical
- [ ] No unintentional gaps (files using default when they shouldn't)
- [ ] No path conflicts
- [ ] Suggestions provided without forcing changes
- [ ] Existing codebase structure respected

## Error Handling

| Situation | Response |
|-----------|----------|
| Invalid glob pattern | Show valid pattern syntax |
| Unknown material | List valid materials |
| Path conflict | Show conflict resolution options |
| Missing physics | Use zone defaults |
| No codebase structure | Ask for component paths |

## Next Step

After `/map`: Ready to use `/craft` for component generation with automatic zone physics.
