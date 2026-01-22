# Sigil: Minimal Architecture

**Principle**: Trust the model. Provide knowledge. Get out of the way.

---

## What RAMS Actually Is

```
.claude/
└── commands/
    └── rams.md     # Instructions for accessibility review
```

That's it. No hooks. No skills. No state. No authority tracking. No workshop index. No mutiny ledger.

Just a markdown file that tells Claude what to look for and how to fix it.

**Why it works**: Claude is intelligent. Give it clear instructions and domain knowledge, it applies them correctly.

---

## Minimal Sigil

```
.claude/
└── rules/
    └── sigil.md    # Physics knowledge + examples
```

One file. Contains:
1. The physics table (effect → sync → timing → confirmation)
2. Detection rules (keywords, types)
3. Inline examples (not separate files)
4. Protected capabilities

That's it.

---

## The Single File

```markdown
# SIGIL.md

You generate UI components with correct physics.
Physics are determined by EFFECT, not preferences.

## Physics Table

| Effect | Sync | Timing | Confirmation |
|--------|------|--------|--------------|
| Financial | Pessimistic | 800ms | Required |
| Destructive | Pessimistic | 600ms | Required |
| Standard | Optimistic | 200ms | None |
| Navigation | Immediate | 150ms | None |
| Local state | Immediate | 100ms | None |

## Detection

Financial: claim, deposit, withdraw, transfer, swap, stake
Destructive: delete, remove, destroy, revoke, burn
Standard: save, update, edit, create, toggle, like
Types that override: Currency, Money, Balance, Wei → always financial

## Examples

### Financial (ClaimButton)
[inline code example]

### Standard (LikeButton)
[inline code example]

## Protected

- Withdraw: always reachable
- Cancel: always visible
- Balance: always current

## Forbidden

- Optimistic sync on financial ops
- < 500ms timing on money movement
- Missing confirmation on destructive ops
```

---

## Why This Works

1. **Claude reads `.claude/rules/` automatically** - No command needed
2. **One cached file** - No context drift between fragments
3. **Inline examples** - No file lookups, everything in one place
4. **Trust the model** - It knows how to apply the rules

---

## What About Compounding?

The critique wants: Mutiny Ledger, Authority tracking, Decision Traces.

**Simple answer**: Put it in the code.

```typescript
/**
 * @canonical - Gold pattern, do not modify
 * @physics financial
 * @rationale 800ms timing validated in user research 2024-03
 */
export function ClaimButton() { ... }
```

Claude can grep for `@canonical`. The code IS the registry.

```bash
grep -r "@canonical" src/  # Find all canonical patterns
grep -r "@physics" src/    # Find physics annotations
```

No sidecar JSON files. No SQLite. The code documents itself.

---

## What About Hooks?

Hooks are optional machinery. The question is: **do you trust the model?**

If Claude reads SIGIL.md and generates optimistic code for a financial op, that's a model failure, not a tooling failure. The fix is better instructions, not more guardrails.

**If you want hooks anyway** (for enforcement):

```yaml
# .claude/hooks.yaml
hooks:
  - event: PreToolUse
    matcher: "Write|Edit"
    command: "grep -q '@physics financial' && grep -q 'onMutate' && exit 1 || exit 0"
```

One-liner. Blocks optimistic mutations on files tagged `@physics financial`. No sentinel.sh, no complex validation.

---

## What About /craft?

You don't need it.

**Old model**:
```
User: /craft "claim button"
Agent: [activates Sigil, generates code]
```

**New model**:
```
User: make a claim button
Agent: [already read SIGIL.md, generates correct code]
```

The rules are always loaded. No command invocation needed.

**If you want a command** (for explicit invocation):

```markdown
# .claude/commands/craft.md
---
description: Generate component with physics
---
Generate a component based on the user's description.
Apply physics from SIGIL.md rules.
Detect effect from keywords and types.
Use inline examples as templates.
```

That's it. The command just points to the rules.

---

## The Whole Architecture

```
.claude/
├── rules/
│   └── sigil.md        # Physics knowledge (ONE file)
└── commands/
    └── craft.md        # Optional: explicit invocation
```

**Everything else is optional**:
- hooks.yaml (if you want enforcement)
- agents/ (if you want subagents for batch ops)
- Nothing else

---

## Comparison

| Aspect | v12 "Invisible Craft" | Minimal Sigil |
|--------|----------------------|---------------|
| Files | ~15 | 1-2 |
| Hooks | Required (Sentinel, Polisher) | Optional |
| State | workshop.json, mutiny.jsonl | None (code annotations) |
| Authority | Directory-based (gold/silver/draft) | Code-based (@canonical) |
| Commands | None (hook-based) | Optional (/craft) |
| Machinery | Complex | None |

---

## The RAMS Lesson

RAMS works because it:
1. Trusts Claude to understand accessibility
2. Provides clear instructions
3. Gets out of the way

Sigil should work the same way:
1. Trust Claude to understand physics
2. Provide clear instructions (one file)
3. Get out of the way

---

## Migration

From v11.1.0 to Minimal Sigil:

1. **Consolidate** all rules into one `sigil.md`
2. **Delete** everything else (skills, protocols, 100 scripts)
3. **Add** `@canonical` and `@physics` JSDoc tags to existing components
4. **Done**

The model is smart. Trust it.
