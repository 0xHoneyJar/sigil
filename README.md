# Rune

Design physics for AI-generated UI.

> "Effect is truth. What the code does determines its physics."

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/0xHoneyJar/rune/main/.claude/scripts/mount-rune.sh | bash
```

Or with options:
```bash
# Auto-confirm updates
curl ... | bash -s -- -y

# Minimal install (rules only, no skills/hooks)
curl ... | bash -s -- --minimal
```

## Physics Table

| Effect | Sync | Timing | Confirmation |
|--------|------|--------|--------------|
| Financial | Pessimistic | 800ms | Required |
| Destructive | Pessimistic | 600ms | Required |
| Soft Delete | Optimistic | 200ms | Toast + Undo |
| Standard | Optimistic | 200ms | None |
| Navigation | Immediate | 150ms | None |
| Local State | Immediate | 100ms | None |

## Five Constructs

| Construct | Command | Purpose |
|-----------|---------|---------|
| ᚷ **Glyph** | `/glyph` | Craft (HOW) — Generate with correct physics |
| ᛊ **Sigil** | `/sigil` | Taste (WHY) — Capture human preferences |
| ᚱ **Rigor** | `/rigor` | Correctness (WHAT) — Validate web3 safety |
| ᚹ **Wyrd** | `/wyrd` | Learning (FEEDBACK) — Confidence calibration |
| ᛚ **Lore** | `/lore` | Knowledge (EXTERNAL) — Slot external knowledge |

## Usage

### Generate a Component

```
/glyph "claim rewards button"
```

Output:
```
## Hypothesis

**Effect**: Financial (detected: "claim" keyword)
**Physics**: Pessimistic sync, 800ms timing, confirmation required
**Confidence**: 0.90

[y/n/adjust]
```

On accept, generates complete React component with correct physics.

### Record a Preference

```
/sigil "500ms feels more responsive for power users"
```

Future generations apply this preference.

### Validate Web3 Code

```
/rigor src/components/VaultWithdraw.tsx
```

Checks for BigInt safety, data source correctness, receipt guards.

### Check Confidence State

```
/wyrd
```

Shows confidence calibration and learning metrics.

### Slot External Knowledge

```
/lore --source ~/.claude/skills/design-engineering --construct glyph
```

Imports curated external knowledge into Rune constructs.

## What Gets Installed

```
.claude/
├── rules/
│   ├── glyph/    (21 files) — Craft rules
│   ├── sigil/    (4 files)  — Taste rules
│   ├── rigor/    (3 files)  — Correctness rules
│   └── wyrd/     (11 files) — Learning rules
├── skills/
│   ├── glyph/              — /glyph
│   ├── sigil/              — /sigil
│   ├── rigor/              — /rigor
│   ├── wyrd/               — /wyrd
│   ├── lore/               — /lore
│   └── validating/         — /validate
└── hooks/                  — Workflow integration

grimoires/rune/
├── taste.md    — Accumulated preferences
└── wyrd.md     — Learning state
```

## Protected Capabilities

Non-negotiable rules that Rune enforces:

| Capability | Rule |
|------------|------|
| Withdraw | Always reachable |
| Cancel | Always visible |
| Balance | Always accurate |
| Touch target | ≥ 44px |
| Focus ring | Always visible |

## Learning Loop

```
Generate → Hypothesis → User Feedback → Learn → Improve

           ↓                    ↓
       Accept/Reject      Record as taste
           ↓                    ↓
     Self-validate        Update confidence
           ↓                    ↓
     Write file          Detect patterns
```

## Effect Detection

Rune detects effect from keywords and types:

| Keywords | Effect |
|----------|--------|
| claim, deposit, withdraw, stake, swap | Financial |
| delete, remove, destroy, revoke | Destructive |
| archive, hide, trash (with undo) | Soft Delete |
| save, update, edit, create | Standard |
| toggle, switch, expand, theme | Local State |

Types override keywords: `Currency`, `Wei`, `Token`, `BigInt` → always Financial.

## Best Practices

Rune doesn't replace the artist. It empowers the artist.

Each construct is a **mindset** — a way of thinking about the work. Like UNIX tools, they do one thing well and chain together.

### The Five Mindsets

| Mindset | Activate When | You're Thinking About |
|---------|---------------|----------------------|
| **Glyph** | Creating UI | "What effect does this have? What physics follow?" |
| **Sigil** | Learning something | "This insight should influence future work" |
| **Rigor** | Handling money/data | "Is this correct? Will this lose funds?" |
| **Wyrd** | Uncertain | "How confident am I? What have I learned?" |
| **Lore** | Adding knowledge | "This external wisdom should enhance a construct" |

### Chaining Constructs

Constructs compose like UNIX pipes:

```bash
# Observe → Craft
/sigil "Our users are power traders who find 800ms sluggish"
/glyph "claim button"  # Now generates with 500ms

# Craft → Validate
/glyph "withdraw modal"
/rigor src/components/WithdrawModal.tsx  # Check what was generated

# Learn → Improve
/wyrd  # See confidence is low for Financial
/sigil "Always use inline confirmation, never modals"
# Next /glyph applies this automatically
```

### The Artist's Control

You are always in control:

```
/glyph "claim button"

## Hypothesis
**Effect**: Financial
**Physics**: Pessimistic, 800ms

[y/n/adjust]
```

- **y** — "Your hypothesis matches my intent"
- **n** — "Wrong. Let me tell you why" → Rune learns
- **adjust timing 400** — "Override this value" → Rune asks to record

**Rune proposes. You decide.**

### Building Taste

Taste is your artistic fingerprint encoded in `grimoires/rune/taste.md`.

| Tier | How It Forms | Meaning |
|------|--------------|---------|
| Observation | You record an insight | "I noticed this once" |
| Pattern | 3+ similar corrections | "I keep doing this" |
| Rule | You promote a pattern | "Always do this" |

**Good taste entries:**
- "Power users find 800ms sluggish — use 500ms for Financial"
- "Never use modals for confirmation — inline only"
- "Springs feel more alive than easing curves"

**Not taste:**
- "Make it faster" (vague)
- "Changed color to blue" (styling, not physics)

### Team Taste

Commit taste to share your team's collective wisdom:

```bash
git add grimoires/rune/taste.md
git commit -m "taste: power user timing preferences"
```

New team members inherit the team's taste on clone.

## Philosophy

**Effect is truth.** What the code does determines its physics. "Claim" means financial. "Delete" means destructive.

**Physics over preferences.** "Make it feel trustworthy" is not physics. "800ms pessimistic with confirmation" is physics.

**Correctness over feel.** A beautiful button that sends the wrong amount is worse than an ugly one that's accurate.

**Learn from rejection.** Every "no" teaches the system. Three similar rejections become a pattern.

## Links

- [GitHub](https://github.com/0xHoneyJar/rune)
- [Issues](https://github.com/0xHoneyJar/rune/issues)

---

*Co-Authored-By: Claude <noreply@anthropic.com>*
