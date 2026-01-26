# Rune

Build with AI. Direct with precision.

Rune is a toolkit of stackable constructs for AI-assisted development. Toggle on what you need. Stay in creative flow.

```bash
# Try a construct
/glyph "claim button"
```

---

## The Mental Model

Think of constructs like prayers you activate based on the task at hand. Stack what you need. Stay in flow.

| Construct | Command | Captures |
|-----------|---------|----------|
| **Sigil** | `/sigil` | Taste — why users prefer what they prefer |
| **Glyph** | `/glyph` | Craft — design physics for UI generation |
| **Rigor** | `/rigor` | Correctness — data safety for web3 |
| *Voice* | coming | Copy — UI text that matches product tone |
| *Ward* | coming | Security — patterns that prevent vulnerabilities |

---

## The Constructs

### Sigil — Taste

Captures human insights. Learns preferences from usage.

**When to use:** After user modifies generated code, or when observing feedback.

```bash
/sigil "they prefer 500ms for financial operations, power traders find default sluggish"
```

<details>
<summary>How it works</summary>

Sigil appends insights to `grimoires/sigil/taste.md`. When Glyph runs, it reads this file and applies relevant preferences.

**Key files:**
- `rules/sigil/00-sigil-core.md` — Philosophy
- `rules/sigil/01-sigil-taste.md` — How taste is read and applied

</details>

---

### Glyph — Craft

Generates UI with correct design physics. Effect determines timing, sync, and confirmation.

**When to use:** Creating or modifying interactive components.

```bash
/glyph "withdraw button"
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

**Effect is truth.** What the code *does* determines its physics. A "claim" button is Financial—doesn't matter what you call it.

**800ms for financial:** Minimum time for users to read amount, mentally commit, feel weight of irreversible decision.

**Pessimistic sync:** Server confirms before UI updates. Money can't roll back.

**Key files:**
- `rules/glyph/01-glyph-physics.md` — The physics table
- `rules/glyph/02-glyph-detection.md` — Effect detection + keywords
- `rules/glyph/04-glyph-patterns.md` — Golden implementation patterns

</details>

---

### Rigor — Correctness

Validates data correctness in web3 components. Catches bugs that lose money.

**When to use:** Any transaction flow (stake, claim, bridge, swap, approve).

```bash
/rigor ClaimButton.tsx
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

## How They Stack

**Glyph alone** — Simple UI generation with correct physics.
```bash
/glyph "like button"
```

**Glyph + Rigor** — Web3 UI with data correctness.
```bash
/glyph "stake panel"
/rigor StakePanel.tsx
```

**Sigil + Glyph** — Learning loop. Capture feedback, generate with taste.
```bash
/sigil "they hate modals, use inline confirmations"
/glyph "delete button"  # Uses inline confirmation
```

---

## For Different Builders

**Developers:** Start with `/glyph`. The physics table is your reference. Stack `/rigor` for web3.

**Designers:** Focus on Sigil. Record taste insights. Glyph will apply them.

**Product:** Use `/sigil` to capture user feedback patterns. The constructs learn from you.

---

## Protected Capabilities

Non-negotiable. These take priority over all other rules.

| Capability | Rule |
|------------|------|
| Withdraw | Always reachable (never hide behind loading) |
| Cancel | Always visible (every flow needs escape) |
| Balance | Always accurate (invalidate on mutation) |
| Touch target | ≥44px |
| Focus ring | Always visible |

---

## Philosophy

**Effect is truth.** What the code does determines its physics. Not what you call it.

**Physics over preferences.** "Make it feel trustworthy" is not physics. "800ms pessimistic with confirmation" is physics.

**Correctness over feel.** A beautiful button that sends the wrong amount is worse than an ugly one that's accurate.

---

<details>
<summary><strong>Reference: Full Physics Tables</strong></summary>

### Behavioral Physics

| Effect | Sync | Timing | Confirmation | Why |
|--------|------|--------|--------------|-----|
| Financial | Pessimistic | 800ms | Required | Money can't roll back |
| Destructive | Pessimistic | 600ms | Required | Permanent needs deliberation |
| Soft Delete | Optimistic | 200ms | Toast + Undo | Reversible, be fast |
| Standard | Optimistic | 200ms | None | Low stakes = snappy |
| Local | Immediate | 100ms | None | No server = instant |

### Animation Physics

| Effect | Easing | Spring |
|--------|--------|--------|
| Financial | ease-out, 800ms | stiffness: 200, damping: 30 |
| Standard | spring | stiffness: 500, damping: 30 |
| Local | spring | stiffness: 700, damping: 35 |

### Detection Keywords

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

---

*Rune v5.0.0*
