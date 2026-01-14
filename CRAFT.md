# CRAFT.md

Ralph-style prompt for Sigil. One component per loop. Tune until consistent.

```bash
while :; do cat CRAFT.md | claude-code ; done
```

---

## Deterministic Stack

Load every loop (specs):
- `.claude/rules/sigil-*` — Physics laws
- `grimoires/sigil/taste.md` — Accumulated preferences

Read **Signs** and **Learnings** below before generating.

---

## Queue

<!--
Components to build. Pick ONE most important per loop.
Format: description — effect hint, feel hint, material hint
-->

- [ ] claim rewards button — trustworthy, deliberate, elevated
- [ ] like button for posts — snappy, playful, minimal
- [ ] dark mode toggle — instant, smooth, minimal

---

## Task

1. Study **Queue**, choose most important unchecked item
2. Run `/craft` for that ONE component
3. Verify against **Backpressure** criteria
4. Pass → mark `[x]`, commit, push
5. Fail → add to **Learnings**, loop continues
6. Pattern 3+ times → note "Ready for /inscribe"

**One component per loop. Trust eventual consistency.**

---

## Signs

<!--
Signs are instructions to prevent known failures.
When Ralph makes a mistake, add a sign here.
"SLIDE DOWN, DON'T JUMP, LOOK AROUND"
-->

### Detection
<!-- e.g., "harvest" is financial, not standard -->

### Timing
<!-- e.g., financial should be 600ms not 800ms -->

### Animation
<!-- e.g., prefer springs over ease-out -->

### Material
<!-- e.g., always use 8px radius -->

### Codebase
<!-- e.g., use motion.div not framer-motion -->

---

## Backpressure

Before marking complete, ALL must pass:

- [ ] Physics analysis shown before generation
- [ ] Effect correctly detected
- [ ] Timing matches effect
- [ ] Animation matches frequency
- [ ] Material matches feel
- [ ] Protected capabilities verified
- [ ] Matches codebase conventions
- [ ] No TypeScript errors
- [ ] Renders without errors

**ANY failure = do NOT mark complete. Add to Learnings. Loop.**

---

## Learnings

<!--
Temporary observations. These inform next loops.
Format: YYYY-MM-DD: what went wrong → what it should be
When pattern appears 3+ times: "Ready for /inscribe"
-->

---

## HOTL Guide

You (the human) watch the loop and tune:

```
WATCH   → Observe /craft output for physics mistakes
TUNE    → Add sign when Ralph fails (prevents future failure)
THROW   → Delete Learnings when it goes off rails, re-loop
INSCRIBE → Run /inscribe when patterns solidify
```

Design can't be spec'd upfront like architecture. Feel emerges through iteration.
You know "trustworthy" when you see it. Your job is adding signs until Ralph sees it too.

---

## Self-Improvement

When you (Claude) learn something:

1. **Temporary** → Add to Learnings
2. **3+ times** → Note "Ready for /inscribe"
3. **Codebase** → Update this file with command/pattern learnings

```
If you run commands multiple times before finding the correct one,
update this file with the correct command for future loops.
```

---

## Loop Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Loop N                                                        │
│   ───────                                                       │
│   1. Load deterministic stack (specs, taste, signs)             │
│   2. Read Learnings from previous loops                         │
│   3. Pick ONE item from Queue                                   │
│   4. /craft that component                                      │
│   5. Backpressure check                                         │
│      ├─ Pass → mark [x], commit, push                           │
│      └─ Fail → add Learning, exit (loop restarts)               │
│   6. Process exits                                              │
│                                                                 │
│   Loop N+1                                                      │
│   ─────────                                                     │
│   Fresh context, but reads updated CRAFT.md                     │
│   Sees new Learnings, applies them                              │
│   Eventually: all Queue items [x], or patterns ready            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## When Queue Empty

1. Review Learnings section
2. If patterns solidified → `/inscribe`
3. Clear or archive this CRAFT.md
4. The sigil now carries your marks forward

---

## Example

```
Loop 1: /craft "claim button"
        → 800ms generated, feels too slow
        → HOTL adds sign: "financial timing: 600ms not 800ms"
        → Fail backpressure, add Learning, loop

Loop 2: /craft "claim button"
        → Reads sign, applies 600ms
        → Pass backpressure
        → Mark [x], commit, push

Loop 3: /craft "like button"
        → Correct first try (taste.md had pattern)
        → Mark [x], commit, push

Loop 4: Queue empty
        → 3 timing adjustments in Learnings
        → HOTL runs /inscribe
        → 600ms becomes permanent mark
```

The sigil improves through use.
