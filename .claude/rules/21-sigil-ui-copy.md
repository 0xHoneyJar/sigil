# Sigil: UI Copy Physics

UI copy must reflect user truth, not assumed behavior. Copy physics ensures terminology accuracy, consistency, and clarity.

<copy_principles>
## Core Principles

**User truth over marketing.** Copy must accurately describe what the system does, not what sounds better.

**Consistency over novelty.** Match existing terminology before inventing new terms.

**Verification over assumption.** Read source code when domain behavior is unclear.
</copy_principles>

<verification_order>
## Verification Order

Before writing UI copy for domain-specific features, verify in this order:

| Priority | Source | What to Check |
|----------|--------|---------------|
| 1 | **Contract/Backend Code** | Actual behavior, not documentation |
| 2 | **Existing UI** | Terminology already in use |
| 3 | **User Confirmation** | Verify understanding if uncertain |

### When to Read Source Code

Trigger source code verification when:
- Web3 keywords detected (rebate, fee, rewards, stake, claim, etc.)
- Financial calculations involved
- Percentage/ratio displays
- System behavior descriptions

```
┌─ User Truth Check ─────────────────────────────────────┐
│                                                        │
│  Before writing UI copy, verify against source:        │
│                                                        │
│  □ Read contract/backend code (not just docs)          │
│  □ Confirm understanding with user if uncertain        │
│  □ Check existing UI for terminology conflicts         │
│  □ Identify established terms that must be preserved   │
│                                                        │
└────────────────────────────────────────────────────────┘
```
</verification_order>

<terminology_consistency>
## Terminology Consistency

### Before Proposing New Terms

| Check | Action |
|-------|--------|
| Label exists elsewhere in UI | Use existing term |
| Term used in docs/code | Match established usage |
| New terminology needed | Confirm with user first |
| Changing existing term | Explain why, get approval |

### Common Conflicts

| Proposed | Check For | Risk |
|----------|-----------|------|
| "Rewards" | Existing "Rewards" section | Ambiguity |
| "Balance" | Multiple balance types | Confusion |
| "Fee" | Fee vs cost vs price | Inconsistency |
| "Claim" | Claim rewards vs claim NFT | Context mismatch |

### Resolution Protocol

When terminology conflict detected:

1. **Surface the conflict**: "This label conflicts with existing usage"
2. **Show context**: Where the term already appears
3. **Propose alternatives**: Different term or qualifier
4. **User decides**: Consistency vs. new term
</terminology_consistency>

<read_aloud_heuristic>
## Read Aloud Heuristic

Before proposing copy changes, apply the "read aloud" test:

### The Test

1. Read the full UI element aloud (label + value + context)
2. Does it sound natural when spoken?
3. Does the phrase make sense without seeing the UI?

### Common Failures

| Pattern | Problem | Fix |
|---------|---------|-----|
| "Keep 16.6%" | Sounds awkward | Just "16.6%" with clear label |
| "Your rewards rewards" | Redundant | Check label/value overlap |
| "Fee Bonus: -5%" | Contradictory | Negative bonus confuses |
| "Claim your claim" | Repetitive | Restructure hierarchy |

### Label + Value Combinations

| Label | Value | Read Aloud | Pass? |
|-------|-------|------------|-------|
| "Fee Rebate" | "16.6%" | "Fee Rebate: 16.6%" | ✓ |
| "Keep" | "16.6%" | "Keep: 16.6%" | ✗ Awkward |
| "Your Share" | "16.6%" | "Your Share: 16.6%" | ✓ |
</read_aloud_heuristic>

<framing_priority>
## Framing Priority

When choosing how to frame copy:

| Priority | Principle | Example |
|----------|-----------|---------|
| 1 | **Accuracy** | Must reflect actual system behavior |
| 2 | **Consistency** | Match existing terminology |
| 3 | **User-centric** | Focus on what user gets/does |
| 4 | **Positive framing** | Only if 1-3 are satisfied |

### Positive Framing Traps

| Trap | Problem | Resolution |
|------|---------|------------|
| "Bonus" for rebate | May imply extra, not kept portion | Use established term |
| "Savings" for fee reduction | May imply comparison to baseline | Verify actual mechanic |
| "Reward" for return | May conflict with staking rewards | Check context |
</framing_priority>

<domain_verification>
## Domain-Specific Verification

### Web3/DeFi Keywords

When these keywords appear, verify against contract source:

```
rebate, fee, reward, stake, unstake, claim, withdraw,
deposit, vault, pool, share, percentage, ratio, basis points,
treasury, protocol, user, allocation
```

### Verification Steps

1. **Find the contract function** that implements the behavior
2. **Read the logic**, not just the function name
3. **Trace the math** for percentages/amounts
4. **Check for caps/limits** that may not be documented

### Common Misunderstandings

| Assumption | Reality Check |
|------------|---------------|
| "User gets X% of all fees" | May be X% of *their own* fees |
| "Treasury always gets minimum" | May have no hard cap |
| "Rewards auto-compound" | May require manual claim |
| "Fee is fixed" | May be dynamic based on tier |
</domain_verification>

<integration_with_craft>
## Integration with /craft

When `/craft` generates UI copy:

### Detection Triggers

Load this rule when detecting:
- "copy", "label", "text", "wording" in request
- UI component with user-facing strings
- Financial/percentage displays
- Action button text

### Analysis Box Addition

```
┌─ Copy Physics ─────────────────────────────────────────┐
│                                                        │
│  Terminology Check:                                    │
│  • "Rewards" - exists in sidebar nav (conflict)        │
│  • "Fee Rebate" - matches contract naming ✓            │
│                                                        │
│  Verification:                                         │
│  • Source: StakingVault.sol:calculateRebate()          │
│  • Behavior: User keeps X% of their own fees           │
│                                                        │
│  Read Aloud: "Fee Rebate: 16.6%" ✓                     │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Taste Signal Enhancement

When user modifies copy, log with context:

```yaml
signal: MODIFY
component:
  name: "RebateDisplay"
  effect: "Standard"
copy_change:
  from: "Keep 16.6%"
  to: "16.6%"
  reason: "Awkward phrasing"
learning:
  inference: "Avoid 'Keep X%' pattern"
```
</integration_with_craft>

<anti_patterns>
## Copy Anti-Patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| Assumed behavior | May be wrong | Verify against source |
| Label conflicts | Confuses users | Check existing UI |
| "Keep X%" | Sounds awkward | Just show percentage |
| Positive spin over accuracy | Misleads | Accuracy first |
| Inventing terms | Inconsistency | Use established terms |
| Redundant label+value | "Rewards rewards" | Check full read |
</anti_patterns>

<examples>
## Examples

### Example 1: Fee Rebate Display

**Request**: "Show the user's fee rebate percentage"

**Verification**:
1. Read `StakingVault.sol:calculateRebate()` - user keeps X% of their OWN fees
2. Check UI - "Rewards" exists in sidebar, avoid conflict
3. Existing term in codebase: "Fee Rebate"

**Generated**:
```tsx
<div className="flex justify-between">
  <span className="text-muted-foreground">Fee Rebate</span>
  <span className="font-medium">{rebatePercent}%</span>
</div>
```

### Example 2: Avoiding Conflict

**Request**: "Add rewards label to the card"

**Conflict detected**: "Rewards" section exists in sidebar navigation

**Resolution**:
```
Terminology conflict detected:
• "Rewards" already used in sidebar nav
• Options: "Cycle Rewards", "Earned", or keep section context

Which do you prefer?
```

### Example 3: Contract Verification

**Request**: "Show how much of protocol fees user receives"

**Initial assumption**: User gets X% of ALL protocol fees

**After reading contract**:
```solidity
// User keeps percentage of THEIR OWN fee token rewards
function calculateRebate(address user) returns (uint256) {
    return userFees[user] * userRebateBps[user] / 10000;
}
```

**Corrected copy**: "You keep {X}% of your fee rewards"
</examples>
