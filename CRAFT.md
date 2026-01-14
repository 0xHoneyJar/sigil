# CRAFT.md

Ralph-style prompt for Sigil. One component per loop. Tune until consistent.

```bash
./ralph.sh 20 grimoires/sigil/CRAFT.md
```

---

## Deterministic Stack

Load every loop:
- `.claude/rules/sigil-*` — Physics laws
- `grimoires/sigil/taste.md` — Accumulated preferences
- **Signs** below — Corrections from HOTL

---

## Queue

<!--
Components to build. Pick ONE unchecked item per loop.
Format: description — effect hint, feel hint, material hint
-->

- [ ] primary CTA button — financial, trustworthy, elevated
- [ ] secondary action — standard, subtle, minimal
- [ ] card container — query, clean, elevated
- [ ] toggle switch — local, snappy, minimal

---

## Task

1. Pick the most important unchecked `[ ]` item from Queue
2. **Invoke:** `/craft "<item description>"`
3. Verify against **Backpressure** (automated checks)
4. **Pass** → mark `[x]`, commit, continue to next item
5. **Fail** → fix errors, retry
6. When Queue complete → loop exits

---

## Signs

<!--
HOTL adds signs after reviewing completed loop.
Signs prevent known failures on next run.
-->

### Timing
<!-- e.g., "financial: 500ms not 800ms" -->

### Animation
<!-- e.g., "prefer springs over ease-out" -->

### Material
<!-- e.g., "no shadows, flat aesthetic" -->
<!-- e.g., "radius: 12px not 8px" -->

---

## Backpressure

Automated checks — loop continues if ALL pass:

- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] Component renders
- [ ] Matches codebase conventions

**These are automated. Feel is judged by HOTL after loop completes.**

---

## After Loop Completes

```
1. Review generated components

2. Identify what felt wrong:
   - "CTA timing too slow"
   - "Card shadows too heavy"

3. Edit this file:
   - Reset wrong items: [x] → [ ]
   - Add Signs with corrections

4. Run loop again:
   ./ralph.sh 20 grimoires/sigil/CRAFT.md

5. Ralph regenerates, reads Signs, overwrites files

6. Repeat until feel is right

7. Run /inscribe to make patterns permanent
```

---

## Example

```
# First run
./ralph.sh 20 CRAFT.md
→ All items marked [x]
→ Loop completes

# HOTL reviews
→ "CTA feels slow, card shadows heavy"

# HOTL edits CRAFT.md
Queue:
- [ ] primary CTA button    ← reset from [x]
- [x] secondary action      ← keep
- [ ] card container        ← reset from [x]
- [x] toggle switch         ← keep

Signs:
### Timing
- financial: 500ms not 800ms

### Material
- no shadows

# Second run
./ralph.sh 20 CRAFT.md
→ Regenerates CTA and card with Signs applied
→ Overwrites existing files
→ Loop completes

# HOTL reviews
→ "Feels right now"

# Make permanent
/inscribe
```
