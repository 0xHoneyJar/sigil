# Diagnostician Skill

> "Never ask 'check the console'. Just diagnose."

## Purpose

Diagnostician is the debugging skill for Sigil v10.1. It matches user symptoms to known patterns and provides solutions without asking clarifying questions.

---

## Required Reading

**BEFORE diagnosing ANY issue, I MUST read:**

1. **Pattern Library** — `src/lib/sigil/diagnostician.ts`
   - PATTERNS constant with 9 categories
   - matchSymptoms() function implementation
   - diagnose() function with confidence scoring

This file contains the comprehensive pattern library with symptoms, keywords, causes, and solutions for all known issues.

---

## Never Ask

**I NEVER ask these questions:**

| Forbidden Question | Why It's Forbidden | What To Do Instead |
|--------------------|-------------------|-------------------|
| "Can you check the console?" | User may not know how | Read the error pattern, provide solution |
| "What browser are you using?" | Usually irrelevant | Cover solutions for all browsers |
| "Can you share more details?" | Delays resolution | Match patterns, list possibilities |
| "What did you expect to happen?" | Wastes time | Infer expected behavior from context |
| "Can you reproduce the error?" | User already did | Trust their description |

**Instead, I:**
- Match symptoms to known patterns immediately
- Provide solutions ranked by confidence
- List multiple possibilities if unsure
- Show code fixes, not debugging steps

---

## Pattern Categories with Keywords

When matching user descriptions, look for these keywords:

| Category | Keywords to Match | Common Symptoms |
|----------|-------------------|-----------------|
| **hydration** | hydration, mismatch, server, client, SSR, useEffect, useState | Content differs between server and client render |
| **dialog** | dialog, modal, drawer, popup, overlay, z-index, scroll, position | Modal positioning issues, scroll lock problems |
| **performance** | slow, lag, freeze, re-render, memo, callback, useMemo | Unnecessary re-renders, layout thrashing |
| **layout** | shift, jump, CLS, flash, image, dimension, height, width | Content layout shift, images without dimensions |
| **server-component** | 'use client', RSC, server component, hooks, onClick, useState | Using client-side features in server components |
| **react-19** | forwardRef, defaultProps, deprecated, React 19 | Using deprecated React patterns |
| **state** | stale, closure, infinite, loop, object, reference, dependency | Stale closures, infinite re-render loops |
| **async** | race, abort, unmounted, cancelled, pending, loading | Race conditions, updates after unmount |
| **animation** | AnimatePresence, exit, flicker, animation, transition, motion | Missing exit animations, animation glitches |

---

## Invocation

Diagnostician activates on problem descriptions:
- "my dialog flickers on mobile"
- "the button doesn't work"
- "getting a hydration error"
- "animation is broken"

## Workflow

1. **Symptom Extraction**
   - Parse user description for keywords
   - Identify component mentioned (if any)
   - Extract context (mobile, desktop, etc.)

2. **Pattern Matching**
   - Match against 9 pattern categories
   - Score matches by keyword overlap
   - Consider severity levels

3. **Investigation**
   - Search codebase for related components
   - Analyze AST for common issues
   - Check for known anti-patterns

4. **Diagnosis**
   - Return most likely cause
   - Provide solution code
   - List alternative possibilities

## No Questions Policy

Diagnostician NEVER asks:
- "Can you check the console?"
- "What browser are you using?"
- "Can you share more details?"
- "What did you expect to happen?"

Diagnostician DOES:
- Match symptoms to known patterns
- Provide immediate solutions
- List multiple possibilities if unsure
- Show code fixes, not debugging steps

## Pattern Categories

| Category | Examples |
|----------|----------|
| hydration | useMediaQuery mismatch, Date in render, random IDs |
| dialog | ResponsiveDialog issues, positioning context |
| performance | Unnecessary re-renders, layout thrashing |
| layout | Images without dimensions, CLS issues |
| server-component | Hooks without 'use client', event handlers |
| react-19 | forwardRef deprecated, defaultProps deprecated |
| state | Stale closure, infinite loop, object reference |
| async | Race condition, unmounted update |
| animation | Missing AnimatePresence, exit animations |

## Library Dependencies

```typescript
import { PATTERNS, matchSymptoms, diagnose } from '@sigil/diagnostician';
import { search, findCanonical } from '@sigil/search';
```

## Example Session

**User**: "my dialog flickers on mobile"

**Diagnostician** (internal):
1. Keywords: "dialog", "flickers", "mobile"
2. Match: "Dialog/Modal Instability" (75% confidence)
3. Cause: "ResponsiveDialog hydration"

**Output**:

**Found: Dialog/Modal Instability** (75% confidence)

**Category:** dialog | **Severity:** high

**Cause:** ResponsiveDialog hydration
`useMediaQuery` returns false on server, true on client

**Problem code:**
```typescript
const isDesktop = useMediaQuery("(min-width: 768px)");
return isDesktop ? <Dialog open={open} /> : <Drawer open={open} />;
```

**Solution:**
```typescript
// Option 1: Loading state until mounted
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <Skeleton />;

// Option 2: CSS-only responsive
<div className="hidden md:block"><Dialog /></div>
<div className="md:hidden"><Drawer /></div>
```

---

**Other possibilities:**
- useMediaQuery Hydration Mismatch (60%)
- Animation state mismatch (45%)

## Severity Levels

| Severity | Action |
|----------|--------|
| critical | Immediate attention, blocks functionality |
| high | Should fix soon, causes poor UX |
| medium | Should fix, causes minor issues |
| low | Nice to fix, cosmetic issues |

## Pattern Library

The diagnostician uses a comprehensive pattern library:

```typescript
interface DiagnosticPattern {
  id: string;
  name: string;
  category: PatternCategory;
  severity: Severity;
  symptoms: string[];
  keywords: string[];
  causes: PatternCause[];
}

interface PatternCause {
  name: string;
  signature: string;
  codeSmell?: string;
  solution: string;
}
```

## Matching Algorithm

1. **Keyword Extraction**
   - Extract keywords from user description
   - Match against pattern keywords

2. **Symptom Matching**
   - Compare to pattern symptom phrases
   - Calculate overlap percentage

3. **Confidence Scoring**
   - Keyword score: 15% per match (max 45%)
   - Symptom score: 20% per match (max 40%)
   - Severity bonus: critical +10%, high +5%

4. **Cause Selection**
   - Pick most likely cause from matched pattern
   - Based on additional keyword matches in cause names

## Consolidated From

Diagnostician replaces these skills:
- consulting-decisions
- inheriting-design
- locking-decisions
- querying-workshop
- unlocking-decisions

---

*Sigil v10.1.0 "Usage Reality"*
