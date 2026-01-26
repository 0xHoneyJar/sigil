# Rune

Constructs for AI-assisted craftsmanship. Activate what the task demands.

## Constructs

|  | Construct | Activate | Effect | Status |
|:--:|:--|:--|:--|:--:|
| ✦ | **Sigil** | `/sigil` | Captures taste — why users prefer what they prefer | ✓ |
| ◆ | **Glyph** | `/glyph` | Design physics — correct timing, sync, confirmation | ✓ |
| ◉ | **Rigor** | `/rigor` | Data correctness — catches bugs that lose money | ✓ |
| ◇ | *Voice* | `/voice` | UI copy — text that matches product tone | · |
| ❖ | *Ward* | `/ward` | Security — patterns that prevent vulnerabilities | · |

---

## Quick Start

```
Build a claim button /glyph
```

```
Build the staking flow /glyph /rigor
```

```
/glyph for the UI, /rigor for the data — build a withdraw panel
```

---

## Activation Examples

**Single construct:**
```
/glyph create a like button
```

**Chained constructs:**
```
/glyph /rigor build the claim rewards flow
```

**Inline activation:**
```
Build a staking panel. Use /glyph for the component and /rigor to validate the data handling.
```

**Sequential work:**
```
/sigil "they prefer inline confirmations over modals"
```
Then later:
```
/glyph delete button
```
Glyph reads what Sigil captured and applies it.

---

## Sigil — Taste

Captures insights about user preferences. Glyph reads these when generating.

```
/sigil "power traders find 800ms sluggish, they prefer 500ms for financial ops"
```

```
/sigil "they hate modals — always use inline confirmation patterns"
```

<details>
<summary>How it works</summary>

Sigil appends to `grimoires/sigil/taste.md`. When Glyph runs, it reads this file and adjusts physics accordingly.

**Key files:**
- `rules/sigil/00-sigil-core.md` — Philosophy
- `rules/sigil/01-sigil-taste.md` — How taste is read and applied

</details>

---

## Glyph — Craft

Generates UI with correct design physics. Detects what the action *does* and applies appropriate timing, sync, and confirmation.

```
/glyph withdraw button
```

```
/glyph validate StakePanel.tsx
```

**The Physics Table:**

| Effect | Timing | Sync | Confirmation |
|--------|--------|------|--------------|
| Financial | 800ms | Pessimistic | Required |
| Destructive | 600ms | Pessimistic | Required |
| Soft Delete | 200ms | Optimistic | Toast+Undo |
| Standard | 200ms | Optimistic | None |
| Navigation | 150ms | Immediate | None |
| Local State | 100ms | Immediate | None |

<details>
<summary>Why these physics?</summary>

**Effect is truth.** A "claim" button is Financial — doesn't matter what you call it.

**800ms for financial:** Time for users to read amount, mentally commit, feel the weight of irreversible decision.

**Pessimistic sync:** Server confirms before UI updates. Money can't roll back.

**Key files:**
- `rules/glyph/01-glyph-physics.md` — The physics table
- `rules/glyph/02-glyph-detection.md` — Effect detection + keywords
- `rules/glyph/04-glyph-patterns.md` — Golden implementation patterns

</details>

---

## Rigor — Correctness

Validates data handling in web3 components. Catches bugs that lose money.

```
/rigor ClaimButton.tsx
```

```
/glyph /rigor build the bridge flow
```

**Critical patterns:**
- BigInt: `0n` is falsy — use `amount != null && amount > 0n`
- Receipt guard: Check hash changed before processing
- Data source: Transaction amounts MUST come from on-chain

<details>
<summary>Common bugs by symptom</summary>

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Button never enables | BigInt falsy check | `!= null && > 0n` |
| Same tx triggers twice | Missing receipt guard | Add hash comparison |
| Wrong amount in tx | Using indexed data | On-chain read |
| Callback uses old data | Stale closure | Use ref or useCallback |

**Key files:**
- `rules/rigor/01-rigor-data.md` — Indexed vs on-chain decision table
- `rules/rigor/02-rigor-web3.md` — BigInt safety, receipt guards, stale closures

</details>

---

## Stringing Constructs

The power is in combination. Activate what the moment demands.

| Task | Activate | Why |
|------|----------|-----|
| Simple UI | `/glyph` | Just need correct physics |
| Web3 UI | `/glyph /rigor` | Physics + data correctness |
| After feedback | `/sigil` then `/glyph` | Capture taste, apply on next generation |
| Full flow | `/sigil /glyph /rigor` | Learning + craft + correctness |

**Example — building a staking feature:**

```
/sigil "users here are degens, they want speed over hand-holding"
```

```
/glyph /rigor build the stake and unstake panels with real-time balance updates
```

The constructs work together: Sigil's taste influences Glyph's physics, Rigor validates the data handling.

---

## Protected Capabilities

Non-negotiable. These override everything else.

| Capability | Rule |
|------------|------|
| Withdraw | Always reachable (never hide behind loading) |
| Cancel | Always visible (every flow needs escape) |
| Balance | Always accurate (invalidate on mutation) |
| Touch target | ≥44px |
| Focus ring | Always visible |

---

## Philosophy

**Effect is truth.** What the code does determines its physics.

**Physics over preferences.** "Make it feel trustworthy" is not physics. "800ms pessimistic with confirmation" is physics.

**Correctness over feel.** A beautiful button that sends the wrong amount is worse than an ugly one that's accurate.

---

<details>
<summary><strong>Reference: Detection Keywords</strong></summary>

**Financial:** claim, deposit, withdraw, transfer, swap, send, pay, mint, burn, stake, unstake, bridge, approve

**Destructive:** delete, remove, destroy, revoke, terminate, purge, close account

**Soft Delete:** archive, hide, trash, dismiss, snooze, mute

**Standard:** save, update, edit, create, add, like, follow, bookmark

**Local:** toggle, switch, expand, collapse, select, theme, dark mode

</details>

---

## Links

- [GitHub](https://github.com/0xHoneyJar/rune)
- [Issues](https://github.com/0xHoneyJar/rune/issues)
