---
name: "understand"
version: "1.0.0"
description: |
  Research before crafting. Trigger domain analysis to gather
  knowledge before applying Sigil physics. Use when you need to
  understand a system, contract, or architecture before working on it.

arguments:
  - name: "topic"
    type: "string"
    required: true
    description: "What to understand"
    examples:
      - "how does the staking vault work"
      - "the reward distribution system"
      - "contract 0x1234..."
      - "authentication flow"

agent: "domain-handler"

context_files:
  - path: "grimoires/loa/context/domain/"
    required: false
    purpose: "Existing domain knowledge"
  - path: "grimoires/loa/context/ecosystem/"
    required: false
    purpose: "Repository relationships"

outputs:
  - path: "grimoires/loa/context/domain/${TOPIC_SLUG}.md"
    type: "file"
    description: "Domain documentation"
---

# /understand

Research before crafting.

## Purpose

When you need to understand a system before working on it, `/understand` gathers context via the Domain Handler and stores it for subsequent Sigil commands.

This is the manual trigger for what complexity detection does automatically.

## Usage

```bash
/understand "how does the staking vault work"
/understand "contract 0x1234..."
/understand "the authentication flow"
```

## Workflow

1. **Check Existing Knowledge**
   - Look in `grimoires/loa/context/domain/` for cached docs
   - If exists and < 30 days old, display and offer refresh

2. **Gather New Knowledge**
   - For contracts: Analyze ABI, extract functions/events
   - For systems: Research architecture, map relationships
   - For concepts: Generate documentation

3. **Store Results**
   - Save to `grimoires/loa/context/domain/{topic}.md`
   - Include metadata (discoveredAt, expiresAt, source)

4. **Display Summary**
   - Show key findings
   - Context now available for `/craft`, `/implement`, etc.

## Examples

### Understanding a Contract

```
> /understand "StakingVault contract"

┌─ Domain Research ──────────────────────────────────────┐
│                                                        │
│  Topic: StakingVault                                   │
│  Source: Contract Analysis                             │
│                                                        │
│  Key Functions:                                        │
│  • stake(uint256) - Financial effect                   │
│  • unstake(uint256) - Financial effect                 │
│  • claimRewards() - Financial effect                   │
│                                                        │
│  Events:                                               │
│  • Staked(address, uint256)                            │
│  • Unstaked(address, uint256)                          │
│  • RewardsClaimed(address, uint256)                    │
│                                                        │
│  Stored: grimoires/loa/context/domain/staking-vault.md │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Understanding a System

```
> /understand "how does the reward distribution work"

┌─ Domain Research ──────────────────────────────────────┐
│                                                        │
│  Topic: Reward Distribution                            │
│  Source: Architecture Analysis                         │
│                                                        │
│  Components:                                           │
│  • RewardDistributor contract                          │
│  • StakingVault integration                            │
│  • Merkle proof verification                           │
│                                                        │
│  Flow:                                                 │
│  1. Rewards accumulated in vault                       │
│  2. Merkle root updated weekly                         │
│  3. Users claim with proof                             │
│                                                        │
│  Stored: grimoires/loa/context/domain/reward-dist.md   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## Integration with Sigil

After `/understand`, the gathered context enriches:

- **`/craft`** — Physics analysis includes domain knowledge
- **`/implement`** — Handler code uses contract understanding
- **DX Physics** — Event handlers informed by contract events

## When to Use

| Scenario | Use /understand |
|----------|-----------------|
| Working on new contract | Yes - gather before crafting |
| Modifying existing handler | Maybe - if architecture unclear |
| Simple UI component | No - Sigil physics sufficient |
| Complex system integration | Yes - map relationships first |

## Caching

- Domain docs cached for 30 days
- Force refresh: `/understand "topic" --refresh`
- View cached: `ls grimoires/loa/context/domain/`
