# Glyph: Effect Detection

Detect effect from keywords, types, and context. Types override keywords.

## Detection Priority

1. **Types** — Props with `Currency`, `Money`, `Wei`, `Token`, `BigInt` → Always Financial
2. **Keywords** — Match against lists below
3. **Context** — Phrases like "with undo" modify the detected effect

## Keywords by Effect

### Financial (Pessimistic, 800ms, Confirmation)

```
claim, deposit, withdraw, transfer, swap, send, pay, purchase,
mint, burn, stake, unstake, bridge, approve, redeem, harvest,
checkout, order, subscribe, airdrop, delegate, bond, unbond
```

### Destructive (Pessimistic, 600ms, Confirmation)

```
delete, remove, destroy, revoke, terminate, purge, erase,
wipe, clear, reset, ban, block, suspend, deactivate, cancel,
close account, delete account, remove access
```

### Soft Delete (Optimistic, 200ms, Toast+Undo)

```
archive, hide, trash, dismiss, snooze, mute, silence,
mark as read, mark as spam, move to folder
```

Context signals: "with undo", "reversible"

### Standard (Optimistic, 200ms, None)

```
save, update, edit, create, add, like, follow, bookmark,
favorite, star, pin, tag, comment, share, post, publish,
submit, upload, change, modify, configure
```

### Local State (Immediate, 100ms)

```
toggle, switch, expand, collapse, select, focus, show, hide,
open, close, check, uncheck, enable, disable, sort, filter,
search, zoom, dark mode, light mode, theme
```

### Navigation (Immediate, 150ms)

```
navigate, go, back, forward, link, route, visit, browse,
next, previous, tab, step, page
```

## Type Overrides

| Type Pattern | Forced Effect |
|--------------|---------------|
| `Currency`, `Money`, `Amount` | Financial |
| `Wei`, `BigInt`, `Token` | Financial |
| `Balance`, `Price`, `Fee` | Financial |
| `Password`, `Secret`, `Key` | Destructive |
| `Theme`, `Preference` | Local |

## Ambiguity Resolution

If effect unclear after checking types, keywords, context:

| Question | If Yes | If No |
|----------|--------|-------|
| Can it be undone? | Optimistic | Pessimistic |
| Involves money/tokens? | Financial | Check other signals |
| Hits a server? | Optimistic/Pessimistic | Immediate |
| Has undo button/toast? | Soft Delete | Hard Destructive |

## Examples

```
"claim button" → Financial (keyword: claim)
"delete with undo" → Soft Delete (context: with undo)
"dark mode toggle" → Local (keyword: toggle + theme)
```
