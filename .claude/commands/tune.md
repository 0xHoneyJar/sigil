---
name: "tune"
version: "1.0.0"
description: |
  Promote tuning notes from CRAFT.md back to Sigil's rules.
  Closes the Ralph feedback loop — learnings become physics.

arguments:
  - name: "source"
    type: "string"
    required: false
    default: "CRAFT.md"
    description: "File containing tuning notes"

context_files:
  - path: "CRAFT.md"
    required: false
    purpose: "Source of tuning notes"
  - path: "grimoires/sigil/taste.md"
    required: false
    purpose: "Accumulated taste signals"
  - path: ".claude/rules/08-sigil-lexicon.md"
    required: true
    purpose: "Target for keyword updates"
  - path: ".claude/rules/01-sigil-physics.md"
    required: true
    purpose: "Target for timing updates"
  - path: ".claude/rules/05-sigil-animation.md"
    required: true
    purpose: "Target for animation updates"
  - path: ".claude/rules/07-sigil-material.md"
    required: true
    purpose: "Target for material updates"
---

# /tune

Promote tuning notes to Sigil's rules. Close the feedback loop.

<workflow>

## Step 1: Gather Tuning Notes

Read tuning sources in order:
1. `CRAFT.md` → Tuning Notes section
2. `grimoires/sigil/taste.md` → MODIFY signals with patterns

Look for:
- **Keyword additions**: "X should be financial/destructive/standard/local"
- **Timing adjustments**: "changed Xms to Yms", "prefer Xms"
- **Animation preferences**: "using spring(X,Y)", "prefer ease-X"
- **Material preferences**: "all buttons use Xpx radius", "no shadows"
- **New vocabulary**: words that should map to specific physics

## Step 2: Categorize Findings

Group into categories:

```
┌─ Tuning Analysis ──────────────────────────────────┐
│                                                    │
│  Keywords (→ 08-sigil-lexicon.md)                 │
│  ─────────────────────────────────                │
│  • "harvest" → financial (seen 3x)                │
│  • "archive" → soft-delete (confirmed)            │
│                                                    │
│  Timing (→ 01-sigil-physics.md)                   │
│  ─────────────────────────────────                │
│  • financial: 800ms → 600ms (team preference)     │
│                                                    │
│  Animation (→ 05-sigil-animation.md)              │
│  ─────────────────────────────────                │
│  • default spring: (500,30) → (500,25)            │
│                                                    │
│  Material (→ 07-sigil-material.md)                │
│  ─────────────────────────────────                │
│  • default radius: 8px (design system)            │
│  • no shadows on standard buttons                 │
│                                                    │
└────────────────────────────────────────────────────┘
```

## Step 3: Propose Updates

For each finding, show:
1. What will change
2. Which file
3. The specific edit

Format:
```
Proposed Update 1/N
───────────────────
File:   .claude/rules/08-sigil-lexicon.md
Change: Add "harvest" to Financial keywords
Reason: Seen 3x in tuning notes, always corrected to financial

Current:
  Primary: claim, deposit, withdraw, transfer...

Proposed:
  Primary: claim, deposit, withdraw, transfer...
  Extended: mint, burn, stake, unstake, bridge, approve, redeem, harvest
                                                              ^^^^^^^^

Apply? (yes/no/skip)
```

## Step 4: Apply Approved Updates

For each approved update:
1. Edit the target rule file
2. Add a comment noting the source: `# Added via /tune from CRAFT.md`
3. Log to taste.md:
   ```
   ## [timestamp] | TUNE
   Source: CRAFT.md
   Promoted: "harvest" → financial keyword
   ---
   ```

## Step 5: Summary

Show what was tuned:

```
┌─ Tuning Complete ──────────────────────────────────┐
│                                                    │
│  Applied: 3 updates                               │
│  Skipped: 1 update                                │
│                                                    │
│  Files modified:                                  │
│  • .claude/rules/08-sigil-lexicon.md (1 keyword)  │
│  • .claude/rules/01-sigil-physics.md (1 timing)   │
│  • .claude/rules/05-sigil-animation.md (1 spring) │
│                                                    │
│  The guitar is tuned. Future /craft will use      │
│  these preferences automatically.                 │
│                                                    │
└────────────────────────────────────────────────────┘
```

</workflow>

<parsing_patterns>

## How to Parse Tuning Notes

Look for these patterns in natural language:

### Keywords
```
"X should be financial"     → add X to financial keywords
"X detected wrong"          → check what it should be
"always correcting X to Y"  → add X to Y effect keywords
```

### Timing
```
"changed 800ms to 600ms"    → timing preference
"prefer Xms"                → timing preference
"too slow/fast"             → timing adjustment needed
```

### Animation
```
"using spring(X,Y)"         → spring preference
"changed to ease-X"         → easing preference
"more/less bouncy"          → damping adjustment
```

### Material
```
"Xpx radius"                → radius preference
"no shadows"                → shadow preference
"using glass/elevated/flat" → surface preference
```

</parsing_patterns>

<safety>

## Safety Rules

1. **Show before applying** — Never auto-apply without confirmation
2. **One at a time** — Present each update individually
3. **Preserve existing** — Add to lists, don't replace
4. **Comment source** — Mark updates with their origin
5. **Log everything** — Record to taste.md for audit trail

</safety>
