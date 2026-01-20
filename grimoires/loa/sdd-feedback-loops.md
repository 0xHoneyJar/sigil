# Sigil Feedback Loops: Software Design Document

```
    ╔═══════════════════════════════════════════════╗
    ║  ✦ SIGIL FEEDBACK LOOPS                       ║
    ║  Software Design Document                     ║
    ║                                               ║
    ║  SDD v0.1.0                                   ║
    ╚═══════════════════════════════════════════════╝
```

**Version**: 0.1.2
**Created**: 2026-01-19
**Updated**: 2026-01-19 (Security review fixes applied)
**Status**: Architecture Design
**Author**: zksoju + Claude
**PRD Reference**: `grimoires/loa/prd-feedback-loops.md`

**Review Fixes (0.1.2)** - Security audit response:
- **CRITICAL**: CLI source authentication now requires HMAC signature (prevents spoofing)
- **HIGH**: Salt/IV/iterations persisted in encrypted key storage (enables decryption)
- **HIGH**: Screenshot cropping uses devicePixelRatio scaling + MV3 OffscreenDocument
- **MEDIUM**: Screenshot storage includes quota checks, eviction strategy, QUOTA_EXCEEDED handling
- **MEDIUM**: Focus ring audit uses `preventScroll`, filters invisible/disabled elements
- **MEDIUM**: Annotation schema normalized to always use `screenshot_ref` (never inline base64)
- Added Design Decisions section addressing reviewer questions
- Added negative test cases for CLI authentication

**Review Fixes (0.1.1)**:
- API contract standardized with validation rules
- taste.md structured with YAML frontmatter schema
- Screenshot capture with agent-browser integration (element-scoped, 500KB max, 7-day retention)
- Protected capabilities audit uses proper DOM traversal (not :contains())
- Animation inspector uses `document.getAnimations()` for performance
- detectPhysics has try/catch guards for JSON parsing
- Source-dependent authentication matrix (dApps require wallet, toolbar optional, CLI HMAC)
- Comprehensive test plan added

---

## Executive Summary

This document specifies the technical architecture for enhancing Sigil's feedback loop system. The design spans four phases:

| Phase | Component | Complexity | Dependencies |
|-------|-----------|------------|--------------|
| **1** | Interactive Diagnostic in /craft | Low | Skill file edits only |
| **2** | Sigil Toolbar (Browser Extension) | High | New package, Linear API |
| **3** | Back Pressure Gates | Medium | Skill file edits, /ward integration |
| **4** | Taste Synthesis | Medium | New skill, pattern matching |

**Key Architectural Decisions**:
1. **Storage**: Structured `taste.md` with YAML frontmatter (single source of truth, all signals including toolbar annotations)
2. **Toolbar**: Chrome/Edge browser extension (Rivet-inspired) for agent wallet support
3. **Linear API**: Shared endpoint for all THJ apps (`/api/feedback`) with consistent contract
4. **Screenshots**: Integration with agent-browser for capture, element-scoped, 7-day retention
5. **Auto-fix policy**: Auto-fix safe issues (touch targets), propose risky ones (missing cancel)
6. **No external dependencies for Phase 1**: Pure skill file modifications

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Phase 1: Interactive Diagnostic](#phase-1-interactive-diagnostic)
3. [Phase 2: Sigil Toolbar](#phase-2-sigil-toolbar)
4. [Phase 3: Back Pressure Gates](#phase-3-back-pressure-gates)
5. [Phase 4: Taste Synthesis](#phase-4-taste-synthesis)
6. [Data Architecture](#data-architecture)
7. [API Design](#api-design)
8. [Security Considerations](#security-considerations)
9. [Integration Points](#integration-points)
10. [Development Workflow](#development-workflow)
11. [Technical Risks](#technical-risks)

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SIGIL FEEDBACK SYSTEM                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   /craft        │    │  Sigil Toolbar  │    │  Product Apps   │         │
│  │   (CLI)         │    │  (Extension)    │    │  (S&F, etc.)    │         │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘         │
│           │                      │                      │                   │
│           │ Diagnostic Flow      │ Annotation Flow      │ Feedback Flow     │
│           │                      │                      │                   │
│           ▼                      ▼                      ▼                   │
│  ┌────────────────────────────────────────────────────────────────┐        │
│  │                      FEEDBACK CAPTURE LAYER                     │        │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │        │
│  │  │ Diagnostic   │  │ Annotation   │  │ Signal       │          │        │
│  │  │ Questions    │  │ Context      │  │ Classifier   │          │        │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │        │
│  └────────────────────────────────────────────────────────────────┘        │
│                                   │                                         │
│                                   ▼                                         │
│  ┌────────────────────────────────────────────────────────────────┐        │
│  │                        STORAGE LAYER                            │        │
│  │  ┌──────────────────────────────────────────────────────┐      │        │
│  │  │  grimoires/sigil/taste.md                            │      │        │
│  │  │  (Enhanced format with diagnostic context)           │      │        │
│  │  └──────────────────────────────────────────────────────┘      │        │
│  │  ┌──────────────────────────────────────────────────────┐      │        │
│  │  │  Linear API (shared endpoint)                        │      │        │
│  │  │  (For toolbar annotations → issue creation)          │      │        │
│  │  └──────────────────────────────────────────────────────┘      │        │
│  └────────────────────────────────────────────────────────────────┘        │
│                                   │                                         │
│                                   ▼                                         │
│  ┌────────────────────────────────────────────────────────────────┐        │
│  │                      LEARNING LAYER                             │        │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │        │
│  │  │ Pattern      │  │ /inscribe    │  │ Back         │          │        │
│  │  │ Detection    │  │ (Rule mods)  │  │ Pressure     │          │        │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │        │
│  └────────────────────────────────────────────────────────────────┘        │
│                                   │                                         │
│                                   ▼                                         │
│  ┌────────────────────────────────────────────────────────────────┐        │
│  │                      SIGIL RULES                                │        │
│  │  .claude/rules/ (physics, lexicon, animation, material)        │        │
│  └────────────────────────────────────────────────────────────────┘        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
User gives feedback ("too slow")
        │
        ▼
┌───────────────────┐
│ Signal Detection  │ ──▶ ACCEPT? ──▶ Log to taste.md, end
│ (Step 6)          │
└───────────────────┘
        │
        ▼ MODIFY/REJECT
┌───────────────────┐
│ Diagnostic Mode   │ ──▶ User answers questions (or skips)
│ (New Step 6b)     │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Enhanced Log      │ ──▶ taste.md with diagnostic context
│ (Step 7)          │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Pattern Detection │ ──▶ 3+ similar signals?
│ (at /craft time)  │
└───────────────────┘
        │
        ▼ Yes
┌───────────────────┐
│ /inscribe         │ ──▶ Propose rule changes
│ (Manual trigger)  │
└───────────────────┘
```

---

## Phase 1: Interactive Diagnostic

### Overview

Enhance `/craft` Step 6 to trigger diagnostic questions after MODIFY/REJECT signals.

**Scope**: Skill file modifications only. No new packages or infrastructure.

### Component Design

#### Modified Files

| File | Change Type | Description |
|------|-------------|-------------|
| `.claude/skills/crafting-physics/SKILL.md` | Modify | Add Step 6b (Diagnostic Mode) |
| `.claude/rules/06-sigil-taste.md` | Modify | Update signal format documentation |

#### Step 6b: Diagnostic Mode Specification

```markdown
### Step 6b: Diagnostic Mode (NEW)

Triggered when signal is MODIFY or REJECT.

**Diagnostic Questions** (presented conversationally):

> Thanks for the feedback. Quick follow-up to help me learn:
>
> **Who's the user?**
> (first-time / power user / mobile / other)
>
> **What were they trying to accomplish?**
> (free text, e.g., "checking rewards", "confirming deposit")
>
> **What should it feel like?**
> (instant 100ms / snappy 200ms / deliberate 500ms / other)
>
> Type your answers or say "skip" to continue without context.

**Response Parsing**:
- If user provides answers → Extract user_type, goal, expected_feel
- If user says "skip" or similar → Log without diagnostic context
- Timeout (no response) → Log without diagnostic context

**Output to Step 7**: DiagnosticContext object
```

#### DiagnosticContext Schema

```typescript
interface DiagnosticContext {
  user_type?: 'first-time' | 'power-user' | 'mobile' | string;
  goal?: string;           // Free text describing what user was trying to accomplish
  expected_feel?: 'instant' | 'snappy' | 'deliberate' | string;
  skipped: boolean;        // True if user skipped diagnostic
}
```

#### Enhanced taste.md Signal Format

```markdown
## [YYYY-MM-DD HH:MM] | [SIGNAL]

Target: [component name]
Craft Type: [generate/refine/configure/pattern/polish]
Effect: [Financial/Destructive/Standard/Local/etc]
Physics: [timing] [sync] [easing]

[If MODIFY/REJECT:]
Changed: [what was changed]
Initial feedback: "[user's original feedback text]"

### Diagnostic Context
User type: [first-time / power-user / mobile / other / not provided]
Goal: "[what they were trying to accomplish]"
Expected feel: [instant / snappy / deliberate / other]
Skipped: [yes/no]

### Learning
- [Inference 1: e.g., "Effect may be misclassified"]
- [Inference 2: e.g., "Consider frequency-based physics"]
- Recommendation: [actionable insight for /inscribe]

---
```

### Implementation Details

#### SKILL.md Diff (Conceptual)

```diff
### Step 6: Collect Feedback

Ask user to reflect on feel:
> "Does this feel right? Think about your user in the moment of clicking."

**Signal detection**:
- ACCEPT: "yes", "looks good", "perfect"
- MODIFY: Describes what's off ("too slow", "needs more contrast")
- REJECT: "no", "wrong", "start over"

+### Step 6b: Diagnostic Mode (for MODIFY/REJECT)
+
+If signal is MODIFY or REJECT, trigger diagnostic questions:
+
+> Thanks for the feedback. Quick follow-up to help me learn:
+>
+> 1. Who's the user? (first-time / power user / mobile / other)
+> 2. What were they trying to accomplish?
+> 3. What should it feel like? (instant / snappy / deliberate / other)
+>
+> Type your answers or say "skip" to continue.
+
+**Parse responses**:
+- Extract user_type, goal, expected_feel from user's response
+- If "skip" or no response: Set skipped=true
+
+**Output**: DiagnosticContext for Step 7

### Step 7: Log Taste Signal

Append to `grimoires/sigil/taste.md`:

```markdown
## [YYYY-MM-DD HH:MM] | [SIGNAL]
-Target: [what was crafted]
-Craft Type: [type]
-Effect: [if applicable]
-Physics: [key values applied]
-[If MODIFY: Changed: ..., Learning: ...]
+Target: [component name]
+Craft Type: [type]
+Effect: [detected effect]
+Physics: [timing] [sync] [easing]
+
+[If MODIFY/REJECT:]
+Changed: [what was changed]
+Initial feedback: "[original feedback]"
+
+### Diagnostic Context
+User type: [from diagnostic or "not provided"]
+Goal: "[from diagnostic or "not provided"]"
+Expected feel: [from diagnostic or "not provided"]
+Skipped: [yes/no]
+
+### Learning
+- [Inferred insights based on diagnostic context]
+- Recommendation: [actionable for /inscribe]
---
```

#### Learning Inference Logic

When diagnostic context is provided, generate learning inferences:

```
IF expected_feel differs from physics by > 1 tier:
  → "Effect may be misclassified: user expects [X] but physics is [Y]"

IF user_type is "mobile" AND timing > 500ms:
  → "Consider mobile-specific physics (faster timing)"

IF user_type is "power-user" AND goal contains "repeat" or "quickly":
  → "Consider frequency-based confirmation bypass"

IF goal contains "checking" or "status":
  → "This may be a status check (Local physics) not a mutation"
```

---

## Phase 2: Sigil Toolbar

### Overview

Browser extension for visual annotation and physics inspection, inspired by [Vercel Toolbar](https://vercel.com/docs/vercel-toolbar) and [Rivet](https://www.paradigm.xyz/2023/08/rivet).

**Key Insight**: Browser extension enables agent wallet connections for automated testing flows.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SIGIL TOOLBAR EXTENSION                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     BACKGROUND SERVICE WORKER                        │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │ Wallet       │  │ Linear API   │  │ Settings     │               │   │
│  │  │ Manager      │  │ Client       │  │ Store        │               │   │
│  │  │ (agent keys) │  │ (shared)     │  │ (chrome.storage) │           │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                         │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        CONTENT SCRIPT                                │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │ Physics      │  │ Animation    │  │ Protected    │               │   │
│  │  │ Detector     │  │ Inspector    │  │ Capability   │               │   │
│  │  │ (⚡)         │  │ (🎭)         │  │ Audit (♿)   │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  │  ┌──────────────┐  ┌──────────────┐                                 │   │
│  │  │ Screenshot   │  │ Annotator    │                                 │   │
│  │  │ Capture (📸) │  │ (💬)         │                                 │   │
│  │  └──────────────┘  └──────────────┘                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                         │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         TOOLBAR UI                                   │   │
│  │  ┌─────┬─────┬─────┬─────┬─────┬─────┐                              │   │
│  │  │  ⚡ │  🎭 │  ♿ │  📸 │  💬 │  ≡  │                              │   │
│  │  └─────┴─────┴─────┴─────┴─────┴─────┘                              │   │
│  │  Draggable, repositionable, keyboard shortcuts                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| Extension framework | Manifest V3 | Chrome/Edge/Firefox support |
| UI framework | Preact + Tailwind | Lightweight, familiar |
| State management | Zustand | Simple, no boilerplate |
| Build tooling | Vite + CRXJS | Modern, fast HMR |
| Wallet integration | Viem | Lightweight, TypeScript-native |

### Component Specifications

#### 1. Physics Violation Detector (⚡)

**Purpose**: Highlight elements with detected physics and flag violations.

```typescript
interface PhysicsViolation {
  element: HTMLElement;
  selector: string;
  violation_type: 'touch_target' | 'focus_ring' | 'timing' | 'protected_capability';
  expected: string;
  actual: string;
  severity: 'error' | 'warning';
}

interface DetectedPhysics {
  element: HTMLElement;
  selector: string;
  timing?: string;        // e.g., "800ms"
  easing?: string;        // e.g., "ease-out"
  sync_type?: string;     // e.g., "pessimistic"
  effect_type?: string;   // e.g., "Financial"
}
```

**Detection Logic**:
```typescript
function detectPhysics(element: HTMLElement): DetectedPhysics | null {
  const computed = getComputedStyle(element);

  // Check for Sigil data attributes (if present)
  const sigilData = element.dataset.sigilPhysics;
  if (sigilData) {
    try {
      const parsed = JSON.parse(sigilData);
      // Validate expected shape
      if (typeof parsed === 'object' && parsed !== null) {
        return {
          element,
          selector: getSelector(element),
          timing: parsed.timing,
          easing: parsed.easing,
          sync_type: parsed.sync_type,
          effect_type: parsed.effect_type
        };
      }
    } catch (e) {
      console.warn('[Sigil Toolbar] Invalid data-sigil-physics JSON:', e);
      // Fall through to CSS inference
    }
  }

  // Infer from CSS
  const transition = computed.transition;
  const animation = computed.animation;

  // Parse timing from transition/animation
  const timingMatch = transition.match(/(\d+(?:\.\d+)?)(m?s)/);
  const easingMatch = transition.match(/(ease-in-out|ease-out|ease-in|linear|cubic-bezier\([^)]+\))/);

  if (!timingMatch && !animation) {
    return null;  // No detectable physics
  }

  return {
    element,
    selector: getSelector(element),
    timing: timingMatch ? `${timingMatch[1]}${timingMatch[2]}` : undefined,
    easing: easingMatch ? easingMatch[1] : undefined
  };
}

// Safe wrapper for annotator use
function detectPhysicsSafe(element: HTMLElement): DetectedPhysics | null {
  try {
    return detectPhysics(element);
  } catch (e) {
    console.warn('[Sigil Toolbar] Physics detection failed:', e);
    return null;
  }
}

function checkViolations(element: HTMLElement): PhysicsViolation[] {
  const violations: PhysicsViolation[] = [];

  // Touch target check
  const rect = element.getBoundingClientRect();
  if (rect.width < 44 || rect.height < 44) {
    violations.push({
      element,
      selector: getSelector(element),
      violation_type: 'touch_target',
      expected: '44px minimum',
      actual: `${rect.width}x${rect.height}`,
      severity: 'error'
    });
  }

  // Focus ring check
  // Protected capability checks
  // ...

  return violations;
}
```

#### 2. Animation Timing Inspector (🎭)

**Purpose**: Pause animations and inspect timing values.

```typescript
interface AnimationState {
  element: HTMLElement;
  selector: string;
  animations: {
    name: string;
    duration: string;
    timing_function: string;
    delay: string;
    iteration_count: string;
    direction: string;
    fill_mode: string;
    play_state: string;
  }[];
  transitions: {
    property: string;
    duration: string;
    timing_function: string;
    delay: string;
  }[];
}

class AnimationInspector {
  private pausedAnimations: Set<Animation> = new Set();

  // Use document.getAnimations() for performance (O(animations) vs O(DOM nodes))
  pauseAll(): void {
    const animations = document.getAnimations();
    for (const anim of animations) {
      if (anim.playState === 'running') {
        anim.pause();
        this.pausedAnimations.add(anim);
      }
    }
  }

  resumeAll(): void {
    for (const anim of this.pausedAnimations) {
      anim.play();
    }
    this.pausedAnimations.clear();
  }

  // Get all animations for a specific element
  getElementAnimations(element: HTMLElement): Animation[] {
    return document.getAnimations().filter(
      anim => (anim as CSSAnimation | CSSTransition).effect?.target === element
    );
  }

  getState(element: HTMLElement): AnimationState {
    const computed = getComputedStyle(element);
    const elementAnimations = this.getElementAnimations(element);

    return {
      element,
      selector: getSelector(element),
      animations: elementAnimations
        .filter(a => a instanceof CSSAnimation)
        .map(a => ({
          name: (a as CSSAnimation).animationName,
          duration: computed.animationDuration,
          timing_function: computed.animationTimingFunction,
          delay: computed.animationDelay,
          iteration_count: computed.animationIterationCount,
          direction: computed.animationDirection,
          fill_mode: computed.animationFillMode,
          play_state: a.playState
        })),
      transitions: elementAnimations
        .filter(a => a instanceof CSSTransition)
        .map(a => ({
          property: (a as CSSTransition).transitionProperty,
          duration: computed.transitionDuration,
          timing_function: computed.transitionTimingFunction,
          delay: computed.transitionDelay
        }))
    };
  }
}
```

#### 3. Protected Capabilities Audit (♿)

**Purpose**: Scan page for protected capability compliance.

```typescript
interface CapabilityAudit {
  capability: string;
  status: 'pass' | 'fail' | 'warning';
  elements?: HTMLElement[];
  message: string;
}

// Helper: Find elements by text content (replaces invalid :contains())
function findElementsByText(
  selector: string,
  texts: string[]
): HTMLElement[] {
  const elements = Array.from(document.querySelectorAll(selector));
  return elements.filter(el =>
    texts.some(text =>
      el.textContent?.toLowerCase().includes(text.toLowerCase())
    )
  ) as HTMLElement[];
}

// Helper: Find interactive elements efficiently
function findInteractiveElements(): HTMLElement[] {
  return Array.from(document.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])'
  )) as HTMLElement[];
}

function auditProtectedCapabilities(): CapabilityAudit[] {
  const audits: CapabilityAudit[] = [];

  // Cancel button check - use data attributes + text search
  const cancelByAttr = Array.from(document.querySelectorAll('[data-cancel], [data-action="cancel"]'));
  const cancelByText = findElementsByText('button, a', ['cancel', 'back', 'close', 'dismiss']);
  const cancelButtons = [...new Set([...cancelByAttr, ...cancelByText])];

  audits.push({
    capability: 'Cancel/Escape Hatch',
    status: cancelButtons.length > 0 ? 'pass' : 'warning',
    elements: cancelButtons as HTMLElement[],
    message: cancelButtons.length > 0
      ? `Found ${cancelButtons.length} cancel/back element(s)`
      : 'No cancel/back buttons detected - verify escape hatch exists'
  });

  // Check if cancel buttons are visible during loading states
  const loadingIndicators = document.querySelectorAll(
    '[data-loading], [aria-busy="true"], .loading, .pending'
  );
  if (loadingIndicators.length > 0) {
    const visibleCancelDuringLoad = cancelButtons.filter(el => {
      const style = getComputedStyle(el as HTMLElement);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    if (visibleCancelDuringLoad.length === 0) {
      audits.push({
        capability: 'Cancel During Loading',
        status: 'fail',
        elements: cancelButtons as HTMLElement[],
        message: 'Cancel buttons hidden during loading state - violates protected capability'
      });
    }
  }

  // Balance display check
  const balanceDisplays = Array.from(document.querySelectorAll(
    '[data-balance], [data-amount], [class*="balance"], [class*="amount"]'
  )) as HTMLElement[];
  // Check for staleness indicators or "last updated" timestamps nearby

  // Error recovery check
  const errorStates = Array.from(document.querySelectorAll(
    '[data-error], [role="alert"], .error, .error-message'
  )) as HTMLElement[];
  if (errorStates.length > 0) {
    const retryButtons = findElementsByText('button', ['retry', 'try again', 'reload']);
    audits.push({
      capability: 'Error Recovery',
      status: retryButtons.length > 0 ? 'pass' : 'warning',
      elements: errorStates,
      message: retryButtons.length > 0
        ? 'Error states have recovery options'
        : 'Error states detected without clear recovery path'
    });
  }

  // Touch target check (interactive elements)
  const interactive = findInteractiveElements();
  const smallTargets = interactive.filter(el => {
    const rect = el.getBoundingClientRect();
    return rect.width < 44 || rect.height < 44;
  });
  if (smallTargets.length > 0) {
    audits.push({
      capability: 'Touch Target Size',
      status: 'fail',
      elements: smallTargets,
      message: `${smallTargets.length} element(s) below 44px minimum touch target`
    });
  }

  // Focus ring check - SAFE implementation
  // WARNING: el.focus() can trigger side effects (scroll, handlers, state changes)
  // Use focus({ preventScroll: true }) and filter to visible elements only
  const focusableWithoutRing: HTMLElement[] = [];
  const previousActiveElement = document.activeElement as HTMLElement;

  for (const el of interactive) {
    // Skip hidden/invisible elements
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') continue;

    // Skip disabled elements
    if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') continue;

    try {
      // Use preventScroll to avoid layout disruption
      el.focus({ preventScroll: true });

      // Only check if focus actually moved (some elements block focus)
      if (document.activeElement !== el) continue;

      const focusedStyle = getComputedStyle(el);

      // Check for visible focus indicator
      const hasOutline = focusedStyle.outlineWidth !== '0px' &&
                         focusedStyle.outlineStyle !== 'none';
      const hasBoxShadowRing = focusedStyle.boxShadow !== 'none' &&
                               focusedStyle.boxShadow !== '';
      const hasFocusClass = el.classList.contains('focus-visible') ||
                            el.matches(':focus-visible');

      if (!hasOutline && !hasBoxShadowRing && !hasFocusClass) {
        focusableWithoutRing.push(el);
      }
    } catch (e) {
      // Some elements throw on focus (e.g., in certain iframe contexts)
      console.warn('[Sigil Audit] Focus check failed for element:', e);
    }
  }

  // Restore previous focus
  try {
    if (previousActiveElement && previousActiveElement !== document.body) {
      previousActiveElement.focus({ preventScroll: true });
    } else {
      (document.activeElement as HTMLElement)?.blur?.();
    }
  } catch (e) {
    // Ignore restore errors
  }

  if (focusableWithoutRing.length > 0) {
    audits.push({
      capability: 'Focus Visibility',
      status: 'warning',
      elements: focusableWithoutRing,
      message: `${focusableWithoutRing.length} focusable element(s) may lack visible focus indicator`
    });
  }

  return audits;
}
```

#### 4. Annotator (💬)

**Purpose**: Point-and-click annotation with context capture.

**Integration**: Uses agent-browser patterns for screenshot capture and element targeting.

```typescript
interface Annotation {
  id: string;
  element_selector: string;
  accessibility_ref?: string;  // @e1 style ref from agent-browser
  component_name?: string;
  physics?: DetectedPhysics;
  computed_styles: Record<string, string>;
  screenshot_ref: string;      // Reference ID, not inline base64
  note: string;
  timestamp: string;
  page_url: string;
  user_agent: string;
  wallet_address?: string;
}

// Screenshot storage - 7-day retention, element-scoped
interface ScreenshotStore {
  id: string;
  created_at: string;
  expires_at: string;  // created_at + 7 days
  data: string;        // Base64
  element_bounds: { x: number; y: number; width: number; height: number };
  viewport: { width: number; height: number };
}

class Annotator {
  private overlay: HTMLElement | null = null;
  private selectedElement: HTMLElement | null = null;

  enableAnnotationMode(): void {
    this.overlay = document.createElement('div');
    this.overlay.id = 'sigil-annotation-overlay';
    document.body.appendChild(this.overlay);

    document.addEventListener('mouseover', this.handleHover);
    document.addEventListener('click', this.handleClick, { capture: true });
  }

  private handleClick = async (e: MouseEvent): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    this.selectedElement = target;

    // Capture element-scoped screenshot via background script
    const screenshotRef = await this.captureElementScreenshot(target);

    const annotation: Partial<Annotation> = {
      id: crypto.randomUUID(),
      element_selector: getSelector(target),
      accessibility_ref: getAccessibilityRef(target),
      physics: detectPhysicsSafe(target),  // Safe parsing with try/catch
      computed_styles: filterLayoutStyles(captureComputedStyles(target)),
      screenshot_ref: screenshotRef,
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      user_agent: navigator.userAgent
    };

    this.showAnnotationModal(annotation);
  };

  // Element-scoped screenshot capture
  private async captureElementScreenshot(element: HTMLElement): Promise<string> {
    const rect = element.getBoundingClientRect();
    const padding = 20;  // Context padding

    // Request screenshot from background script (has chrome.tabs.captureVisibleTab)
    // IMPORTANT: Include devicePixelRatio for correct coordinate scaling
    const response = await chrome.runtime.sendMessage({
      type: 'CAPTURE_SCREENSHOT',
      bounds: {
        x: Math.max(0, rect.x - padding),
        y: Math.max(0, rect.y - padding),
        width: rect.width + (padding * 2),
        height: rect.height + (padding * 2)
      },
      devicePixelRatio: window.devicePixelRatio,  // Required for HiDPI displays
      maxSize: 500 * 1024  // 500KB max
    });

    return response.screenshot_ref;
  }
}

// Background script screenshot handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CAPTURE_SCREENSHOT') {
    handleScreenshotCapture(message, sender.tab?.id)
      .then(sendResponse);
    return true;  // Async response
  }
});

async function handleScreenshotCapture(
  message: { bounds: DOMRect; maxSize: number; devicePixelRatio: number },
  tabId?: number
): Promise<{ screenshot_ref: string }> {
  if (!tabId) throw new Error('No tab ID');

  // Capture visible tab - returns image at device resolution
  const dataUrl = await chrome.tabs.captureVisibleTab(undefined, {
    format: 'png'
  });

  // Crop to element bounds using MV3-safe OffscreenDocument
  // Note: MV3 service workers cannot use DOM APIs (no Canvas, Image, etc.)
  // Must delegate to OffscreenDocument for image processing
  const croppedData = await cropScreenshotMV3Safe(
    dataUrl,
    message.bounds,
    message.devicePixelRatio
  );

  // Check size constraint
  if (croppedData.length > message.maxSize) {
    const compressed = await compressScreenshotMV3Safe(croppedData, message.maxSize);
    return storeScreenshot(compressed);
  }

  return storeScreenshot(croppedData);
}

// MV3-safe screenshot cropping via OffscreenDocument
// Service workers cannot use Canvas/Image - must use offscreen document
async function cropScreenshotMV3Safe(
  dataUrl: string,
  bounds: DOMRect,
  devicePixelRatio: number
): Promise<string> {
  // Ensure offscreen document exists
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT' as chrome.runtime.ContextType]
  });

  if (existingContexts.length === 0) {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['CANVAS' as chrome.offscreen.Reason],
      justification: 'Crop screenshot to element bounds'
    });
  }

  // Scale CSS bounds to device pixels
  const scaledBounds = {
    x: bounds.x * devicePixelRatio,
    y: bounds.y * devicePixelRatio,
    width: bounds.width * devicePixelRatio,
    height: bounds.height * devicePixelRatio
  };

  // Delegate cropping to offscreen document
  const response = await chrome.runtime.sendMessage({
    target: 'offscreen',
    action: 'cropImage',
    dataUrl,
    bounds: scaledBounds
  });

  return response.croppedDataUrl;
}

// offscreen.html companion script (offscreen.js)
// This runs in a document context with DOM access
/*
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target !== 'offscreen') return;

  if (message.action === 'cropImage') {
    cropImage(message.dataUrl, message.bounds)
      .then(croppedDataUrl => sendResponse({ croppedDataUrl }))
      .catch(error => sendResponse({ error: error.message }));
    return true;  // Async response
  }
});

async function cropImage(
  dataUrl: string,
  bounds: { x: number; y: number; width: number; height: number }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = bounds.width;
      canvas.height = bounds.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Draw cropped region
      ctx.drawImage(
        img,
        bounds.x, bounds.y, bounds.width, bounds.height,  // Source rect
        0, 0, bounds.width, bounds.height                  // Dest rect
      );

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}
*/

// Screenshot storage with 7-day retention and quota management
// chrome.storage.local quota: 10MB (unlimitedStorage permission can increase)
const SCREENSHOT_QUOTA_BYTES = 5 * 1024 * 1024;  // Reserve 5MB for screenshots
const MAX_SCREENSHOTS = 50;  // Limit count as secondary constraint

interface ScreenshotMetadata {
  id: string;
  created_at: string;
  expires_at: string;
  size_bytes: number;
}

async function storeScreenshot(data: string): Promise<{ screenshot_ref: string }> {
  const id = crypto.randomUUID();
  const now = new Date();
  const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const sizeBytes = new Blob([data]).size;

  // Check quota BEFORE storing
  const quotaStatus = await checkScreenshotQuota(sizeBytes);
  if (!quotaStatus.canStore) {
    // Evict oldest screenshots until we have space
    await evictScreenshotsForSpace(sizeBytes);
  }

  try {
    await chrome.storage.local.set({
      [`screenshot_${id}`]: {
        id,
        created_at: now.toISOString(),
        expires_at: expires.toISOString(),
        size_bytes: sizeBytes,
        data
      }
    });
  } catch (error) {
    // Handle QUOTA_EXCEEDED error
    if (error instanceof Error && error.message.includes('QUOTA')) {
      console.warn('[Sigil Toolbar] Storage quota exceeded, forcing eviction');
      await evictScreenshotsForSpace(sizeBytes, true);  // Force aggressive eviction
      // Retry once
      await chrome.storage.local.set({
        [`screenshot_${id}`]: {
          id,
          created_at: now.toISOString(),
          expires_at: expires.toISOString(),
          size_bytes: sizeBytes,
          data
        }
      });
    } else {
      throw error;
    }
  }

  // Schedule cleanup of expired (non-blocking)
  cleanupExpiredScreenshots().catch(console.warn);

  return { screenshot_ref: id };
}

// Check if we have quota for a new screenshot
async function checkScreenshotQuota(
  newSizeBytes: number
): Promise<{ canStore: boolean; usedBytes: number; count: number }> {
  const all = await chrome.storage.local.get(null);
  let usedBytes = 0;
  let count = 0;

  for (const [key, value] of Object.entries(all)) {
    if (key.startsWith('screenshot_') && value.size_bytes) {
      usedBytes += value.size_bytes;
      count++;
    }
  }

  return {
    canStore: (usedBytes + newSizeBytes) < SCREENSHOT_QUOTA_BYTES && count < MAX_SCREENSHOTS,
    usedBytes,
    count
  };
}

// Evict oldest screenshots to make room
async function evictScreenshotsForSpace(
  neededBytes: number,
  aggressive: boolean = false
): Promise<void> {
  const all = await chrome.storage.local.get(null);
  const screenshots: (ScreenshotMetadata & { key: string })[] = [];

  for (const [key, value] of Object.entries(all)) {
    if (key.startsWith('screenshot_') && value.created_at) {
      screenshots.push({ ...value, key });
    }
  }

  // Sort by created_at (oldest first)
  screenshots.sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  let freedBytes = 0;
  const toRemove: string[] = [];

  // If aggressive, remove at least 25% of screenshots
  const minRemove = aggressive ? Math.ceil(screenshots.length * 0.25) : 0;

  for (const screenshot of screenshots) {
    if (freedBytes >= neededBytes && toRemove.length >= minRemove) {
      break;
    }
    toRemove.push(screenshot.key);
    freedBytes += screenshot.size_bytes || 0;
  }

  if (toRemove.length > 0) {
    await chrome.storage.local.remove(toRemove);
    console.log(`[Sigil Toolbar] Evicted ${toRemove.length} screenshots, freed ${freedBytes} bytes`);
  }
}

// Cleanup expired screenshots
async function cleanupExpiredScreenshots(): Promise<void> {
  const all = await chrome.storage.local.get(null);
  const now = new Date();
  const toRemove: string[] = [];

  for (const [key, value] of Object.entries(all)) {
    if (key.startsWith('screenshot_') && value.expires_at) {
      if (new Date(value.expires_at) < now) {
        toRemove.push(key);
      }
    }
  }

  if (toRemove.length > 0) {
    await chrome.storage.local.remove(toRemove);
  }
}

// Test cases for quota management
// - test('evicts oldest when quota exceeded', ...)
// - test('handles QUOTA_EXCEEDED error gracefully', ...)
// - test('respects MAX_SCREENSHOTS limit', ...)
// - test('aggressive eviction removes 25% minimum', ...)
```

### Computed Styles Filtering

Only capture layout-relevant styles to reduce payload size:

```typescript
const LAYOUT_STYLE_ALLOWLIST = [
  'width', 'height', 'padding', 'margin',
  'display', 'flex-direction', 'align-items', 'justify-content',
  'position', 'top', 'left', 'right', 'bottom',
  'font-size', 'font-weight', 'line-height',
  'color', 'background-color', 'border-radius',
  'transition', 'animation'
];

function filterLayoutStyles(styles: Record<string, string>): Record<string, string> {
  const filtered: Record<string, string> = {};
  for (const prop of LAYOUT_STYLE_ALLOWLIST) {
    if (styles[prop]) {
      filtered[prop] = styles[prop];
    }
  }
  return filtered;
}
```

#### 5. Wallet Manager (Agent Support)

**Purpose**: Manage wallet connections for agent-driven testing.

```typescript
interface AgentWallet {
  id: string;
  name: string;
  address: `0x${string}`;
  private_key_encrypted: string;  // Encrypted with user password
  chain_id: number;
}

class WalletManager {
  private wallets: Map<string, AgentWallet> = new Map();
  private activeWallet: AgentWallet | null = null;

  async createAgentWallet(name: string): Promise<AgentWallet> {
    const { privateKey, address } = generateWallet();
    const wallet: AgentWallet = {
      id: crypto.randomUUID(),
      name,
      address,
      private_key_encrypted: await encrypt(privateKey),
      chain_id: 1  // Default to mainnet, configurable
    };
    this.wallets.set(wallet.id, wallet);
    await this.persistWallets();
    return wallet;
  }

  async injectProvider(): Promise<void> {
    // Inject EIP-1193 provider into page context
    // Similar to Rivet's approach
  }
}
```

### File Structure

```
packages/sigil-toolbar/
├── manifest.json           # Extension manifest (V3)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── background/
│   │   ├── index.ts        # Service worker entry
│   │   ├── linear-client.ts
│   │   ├── wallet-manager.ts
│   │   └── settings-store.ts
│   ├── content/
│   │   ├── index.ts        # Content script entry
│   │   ├── physics-detector.ts
│   │   ├── animation-inspector.ts
│   │   ├── capability-auditor.ts
│   │   ├── annotator.ts
│   │   └── screenshot.ts
│   ├── ui/
│   │   ├── toolbar.tsx     # Main toolbar component
│   │   ├── modals/
│   │   │   ├── annotation.tsx
│   │   │   ├── inspection.tsx
│   │   │   └── audit-results.tsx
│   │   └── components/
│   │       ├── button.tsx
│   │       ├── overlay.tsx
│   │       └── highlight.tsx
│   ├── shared/
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   └── styles/
│       └── toolbar.css
└── public/
    └── icons/
```

---

## Phase 3: Back Pressure Gates

### Overview

Add quality gates to `/craft` flow that validate output before showing to user.

### Gate Specifications

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACK PRESSURE GATES                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User: /craft "claim button"                                                │
│           │                                                                 │
│           ▼                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ GATE 1: PRE-DETECT                                                   │   │
│  │ ─────────────────                                                    │   │
│  │ □ Effect detection confident?                                        │   │
│  │   - If keyword/type match: PASS                                      │   │
│  │   - If ambiguous: Ask user (max 2 questions)                         │   │
│  │ □ Similar pattern in taste.md?                                       │   │
│  │   - If 3+ MODIFY signals with same change: Apply learning            │   │
│  │   - Flag in analysis: "Adjusted per taste.md"                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│           │                                                                 │
│           ▼ Analysis complete                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ GATE 2: PRE-GENERATE                                                 │   │
│  │ ─────────────────                                                    │   │
│  │ □ No conflicting taste.md patterns?                                  │   │
│  │   - Recent REJECT for similar component: WARN                        │   │
│  │ □ Protected capabilities applicable?                                 │   │
│  │   - Financial/Destructive: Require confirmation, cancel              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│           │                                                                 │
│           ▼ Code generated                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ GATE 3: POST-GENERATE                                                │   │
│  │ ─────────────────                                                    │   │
│  │ □ Touch target ≥ 44px?                                              │   │
│  │   - If not: AUTO-FIX (adjust padding)                               │   │
│  │ □ Focus ring present?                                                │   │
│  │   - If not: AUTO-FIX (add focus styles)                             │   │
│  │ □ Cancel button visible (if Financial/Destructive)?                  │   │
│  │   - If not: WARN (do not auto-add)                                  │   │
│  │ □ No banned patterns?                                                │   │
│  │   - Optimistic for financial: BLOCK                                  │   │
│  │   - State mutation in render: WARN                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│           │                                                                 │
│           ▼ User accepts                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ GATE 4: POST-ACCEPT                                                  │   │
│  │ ─────────────────                                                    │   │
│  │ □ Log signal to taste.md                                             │   │
│  │ □ Check for inscription candidates                                   │   │
│  │   - If 3+ similar patterns: Suggest /inscribe                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Gate Implementation in SKILL.md

```markdown
### Step 2b: Pre-Detect Gate (NEW)

Before showing analysis, verify:

**Effect Confidence Check**:
```
IF effect detection is ambiguous:
  Ask max 2 clarifying questions:
  - "Does this involve money/tokens?" → Financial
  - "Can this be undone?" → Optimistic vs Pessimistic
```

**Taste Learning Check**:
```
Read grimoires/sigil/taste.md
IF 3+ MODIFY signals for same effect with same change:
  Apply the learned value
  Add to analysis: "* Adjusted per taste.md: [N] prior MODIFY signals"
```

### Step 3b: Pre-Generate Gate (NEW)

After analysis, before generating:

**Conflict Check**:
```
IF recent REJECT (within 7 days) for similar component:
  Show warning: "⚠ Similar component was REJECT'd recently"
  Show reason from taste.md if available
```

**Protected Capability Preparation**:
```
IF effect is Financial or Destructive:
  Ensure generated code includes:
  - Confirmation step
  - Cancel button (always visible)
  - Error recovery path
```

### Step 5b: Post-Generate Gate (NEW)

After generating, before showing:

**Validation Checks** (with auto-fix where safe):

| Check | If Failed | Action |
|-------|-----------|--------|
| Touch target < 44px | Auto-fix | Adjust padding/min-height |
| Missing focus ring | Auto-fix | Add focus:ring styles |
| Missing cancel (Financial) | Warn | Do not auto-add, surface |
| Optimistic for Financial | Block | Refuse to generate |
| State in render | Warn | Surface anti-pattern |

**Show Validation in Analysis**:
```
┌─ Validation ─────────────────────────────────┐
│ ✓ Touch target ≥ 44px                       │
│ ✓ Focus ring present                         │
│ ⚠ Auto-fixed: Padding 8px → 12px            │
└──────────────────────────────────────────────┘
```
```

### New Skill: /ward-all

Batch validation across codebase components.

```markdown
# Ward All Skill

Validate Sigil physics compliance across multiple components.

## Workflow

### Step 1: Discover Components

Scan for component files:
- `src/components/**/*.tsx`
- `app/components/**/*.tsx`
- `components/**/*.tsx`

### Step 2: Run Validation

For each component, check:
- Touch target sizes (44px minimum)
- Focus ring presence
- Financial/Destructive physics compliance
- Protected capability patterns

### Step 3: Report

```
┌─ Ward All Results ─────────────────────────────────────┐
│                                                        │
│  Scanned: 47 components                                │
│  Passed:  43                                           │
│  Warnings: 3                                           │
│  Errors:   1                                           │
│                                                        │
│  Errors:                                               │
│  ────────                                              │
│  src/components/claim-button.tsx:34                    │
│    Touch target 32px (minimum 44px)                    │
│                                                        │
│  Warnings:                                             │
│  ─────────                                             │
│  src/components/deposit-form.tsx:78                    │
│    No cancel button during pending state               │
│                                                        │
└────────────────────────────────────────────────────────┘
```
```

---

## Phase 4: Taste Synthesis

### Overview

New skill to extract patterns from diagnostic signals and propose inscriptions.

### Skill: /taste-synthesize

```markdown
# Taste Synthesize Skill

Extract patterns from taste.md and propose rule changes.

## Workflow

### Step 1: Load Signals

Read `grimoires/sigil/taste.md` and parse all signals:
- Filter to MODIFY and REJECT signals
- Filter to signals with diagnostic context
- Group by: user_type, goal, expected_feel

### Step 2: Pattern Detection

For each group, detect patterns:

```
Pattern Detection Rules:
────────────────────────

1. Timing Pattern:
   IF 3+ signals have same "Changed: Xms → Yms":
     → Timing preference pattern detected

2. User Type Pattern:
   IF 3+ signals have same user_type with similar change:
     → User-segment physics pattern detected

3. Effect Misclassification:
   IF 3+ signals where expected_feel differs from effect by >1 tier:
     → Effect detection improvement candidate

4. Frequency Pattern:
   IF 3+ signals where goal contains "checking" or "status":
     → High-frequency use case candidate
```

### Step 3: Generate Recommendations

For each pattern, generate recommendation:

```
┌─ Pattern: Mobile User Timing ──────────────────────────┐
│                                                        │
│  Confidence: HIGH (5 signals)                          │
│  Signals:                                              │
│  - 2026-01-15: ClaimButton 800ms → 600ms              │
│  - 2026-01-16: WithdrawButton 800ms → 500ms           │
│  - 2026-01-17: StakeButton 800ms → 600ms              │
│  - 2026-01-18: DepositButton 800ms → 500ms            │
│  - 2026-01-19: RewardsButton 800ms → 600ms            │
│                                                        │
│  Common Context:                                       │
│  - User type: mobile                                   │
│  - Goal: "quick check", "status", "verify"            │
│  - Expected: snappy (200ms)                            │
│                                                        │
│  Recommendation:                                       │
│  Add mobile modifier to Financial physics:             │
│  "Financial (mobile): 600ms pessimistic"               │
│                                                        │
│  Action: /inscribe candidate                           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Step 4: Propose Inscriptions

For each HIGH confidence pattern:

```
Propose to /inscribe?

Pattern: Mobile User Timing
Target:  .claude/rules/01-sigil-physics.md
Change:  Add mobile modifier row to physics table

| Effect | Sync | Timing | Modifier |
|--------|------|--------|----------|
| Financial | Pessimistic | 800ms | default |
| Financial | Pessimistic | 600ms | mobile: true |

[Propose to /inscribe] [Skip] [Dismiss pattern]
```
```

### Data Structures

```typescript
interface ParsedSignal {
  timestamp: string;
  signal_type: 'ACCEPT' | 'MODIFY' | 'REJECT';
  target: string;
  craft_type: string;
  effect: string;
  physics: string;
  changed?: string;
  initial_feedback?: string;
  diagnostic?: DiagnosticContext;
  learning?: string[];
}

interface DetectedPattern {
  id: string;
  type: 'timing' | 'user_segment' | 'effect_misclassification' | 'frequency';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  signals: ParsedSignal[];
  common_context: {
    user_type?: string;
    goal_keywords?: string[];
    expected_feel?: string;
    change_pattern?: string;
  };
  recommendation: string;
  target_rule?: string;
  proposed_change?: string;
}
```

---

## Data Architecture

### taste.md Schema (Structured with YAML Frontmatter)

**Design Decision**: Use YAML frontmatter for machine-parseable fields, markdown body for human-readable context. This enables automated gates and pattern detection while maintaining readability.

```markdown
# Sigil Taste Log

Accumulated preferences from usage. Append-only. Schema version: 2.0

---

```yaml
# YAML frontmatter - machine-parseable
signal: MODIFY
timestamp: 2026-01-19T14:32:00Z
target: ClaimButton
craft_type: generate
effect: Financial
physics:
  timing: 800ms
  sync: pessimistic
  easing: ease-out
changed:
  field: timing
  from: 800ms
  to: 500ms
diagnostic:
  user_type: mobile        # first-time | power-user | mobile | other
  goal: "checking if rewards are building"
  expected_feel: snappy    # instant (100ms) | snappy (200ms) | deliberate (500ms) | other
  skipped: false
source: cli                 # cli | toolbar | product
```

**Initial feedback**: "too slow"

### Learning
- Effect may be misclassified: user treats this as status check (Local), not financial action
- For high-frequency status checks, consider separate physics
- Recommendation: Add `frequency: high` detection for financial components

---
```

### taste.md Parser Specification

```typescript
interface TasteSignal {
  // Required fields
  signal: 'ACCEPT' | 'MODIFY' | 'REJECT';
  timestamp: string;  // ISO 8601
  target: string;
  craft_type: 'generate' | 'refine' | 'configure' | 'pattern' | 'polish';
  source: 'cli' | 'toolbar' | 'product';

  // Optional - depends on craft type
  effect?: 'Financial' | 'Destructive' | 'SoftDelete' | 'Standard' | 'LocalState' | 'Navigation' | 'Query';
  physics?: {
    timing?: string;
    sync?: 'pessimistic' | 'optimistic' | 'immediate';
    easing?: string;
  };

  // For MODIFY/REJECT only
  changed?: {
    field: string;
    from: string;
    to: string;
  };

  // Diagnostic context (optional)
  diagnostic?: {
    user_type?: 'first-time' | 'power-user' | 'mobile' | 'other';
    goal?: string;
    expected_feel?: 'instant' | 'snappy' | 'deliberate' | 'other';
    skipped: boolean;
  };

  // Annotation-specific (source: toolbar)
  annotation?: {
    element_selector: string;
    page_url: string;
    screenshot_ref?: string;  // Reference to stored screenshot
    linear_issue_id?: string;
  };
}

// Parser function
function parseTasteMd(content: string): TasteSignal[] {
  const signals: TasteSignal[] = [];
  const blocks = content.split(/^---$/m).filter(Boolean);

  for (const block of blocks) {
    const yamlMatch = block.match(/```yaml\n([\s\S]*?)\n```/);
    if (yamlMatch) {
      try {
        const parsed = yaml.parse(yamlMatch[1]);
        signals.push(parsed as TasteSignal);
      } catch (e) {
        console.warn('Failed to parse taste signal:', e);
      }
    }
  }

  return signals;
}
```

### Timestamp Handling

All timestamps in taste.md use ISO 8601 format with timezone:
- Storage: `2026-01-19T14:32:00Z` (UTC)
- Display: Convert to user's local timezone
- Comparison: Always compare in UTC
- "Recent REJECT" gate: 7 days = 168 hours from current UTC time

### Annotation Schema (for Toolbar)

**IMPORTANT: Screenshot Storage Consistency**

Screenshots are ALWAYS stored by reference (`screenshot_ref`), never inline as base64.
This prevents:
1. Payload bloat in API requests
2. Duplicate storage (taste.md + chrome.storage + Linear)
3. Schema ambiguity

The `screenshot_ref` is a UUID that maps to a screenshot stored in `chrome.storage.local`.
When submitting to Linear, the background script fetches the screenshot data by ref
and uploads it as an attachment.

```typescript
// CANONICAL annotation schema - used everywhere (toolbar, taste.md, API)
interface StoredAnnotation {
  // Identity
  id: string;
  created_at: string;

  // Location
  page_url: string;
  element_selector: string;
  component_name?: string;

  // Context
  physics?: {
    timing?: string;
    easing?: string;
    sync_type?: string;
    effect_type?: string;
  };
  computed_styles: Record<string, string>;
  viewport: { width: number; height: number };

  // Capture - ALWAYS use screenshot_ref, never inline base64
  screenshot_ref: string;  // UUID reference to chrome.storage.local entry
  note: string;

  // Metadata
  user_agent: string;
  wallet_address?: string;  // If agent wallet connected

  // Integration
  linear_issue_id?: string;
  linear_issue_url?: string;
}

// Helper to resolve screenshot ref to data (for submission)
async function resolveScreenshotRef(ref: string): Promise<string | null> {
  const key = `screenshot_${ref}`;
  const result = await chrome.storage.local.get(key);
  return result[key]?.data ?? null;
}

// When submitting to Linear, resolve the ref:
async function prepareAnnotationForLinear(annotation: StoredAnnotation): Promise<LinearAttachment | null> {
  const screenshotData = await resolveScreenshotRef(annotation.screenshot_ref);
  if (!screenshotData) {
    console.warn(`[Sigil Toolbar] Screenshot ${annotation.screenshot_ref} not found (may have expired)`);
    return null;
  }
  return {
    filename: `sigil-annotation-${annotation.id}.png`,
    data: screenshotData,  // Base64 for Linear upload
    contentType: 'image/png'
  };
}
```

**Migration Note**: If existing code uses `screenshot` (base64 inline), migrate to `screenshot_ref`:
```typescript
// Migration helper
function normalizeAnnotation(annotation: any): StoredAnnotation {
  if (annotation.screenshot && !annotation.screenshot_ref) {
    // Legacy: inline base64 - store it and get ref
    const ref = await storeScreenshot(annotation.screenshot);
    return { ...annotation, screenshot_ref: ref.screenshot_ref, screenshot: undefined };
  }
  return annotation;
}
```

---

## API Design

### Shared Feedback Endpoint

**Endpoint**: `POST /api/feedback` (shared THJ endpoint, deployed per-product)

**Base URL**: Same origin for the hosting dApp (`/api/feedback`), or configured endpoint via `FEEDBACK_API_URL` env var.

**Purpose**: Unified feedback ingestion for all THJ apps and Sigil Toolbar.

```typescript
// Request - CANONICAL CONTRACT
interface FeedbackRequest {
  // Required
  type: 'bug' | 'feedback' | 'annotation';
  description: string;  // Required for all types, min 10 chars

  // Required for annotations
  source: 'sigil-toolbar' | 'set-and-forgetti' | 'loa' | string;

  // Common metadata (optional)
  page_url?: string;
  wallet_address?: string;
  user_agent?: string;

  // Annotation-specific (required when type: 'annotation')
  annotation?: {
    element_selector: string;           // CSS selector or accessibility ref
    component_name?: string;            // React component name if detectable
    physics?: {
      timing?: string;
      easing?: string;
      sync_type?: string;
      effect_type?: string;
    };
    computed_styles?: Record<string, string>;  // Limited to layout-relevant styles
    screenshot_ref?: string;            // Reference ID, not base64 inline
    viewport?: { width: number; height: number };
  };

  // Diagnostic context (optional, from Sigil CLI)
  diagnostic?: {
    user_type?: 'first-time' | 'power-user' | 'mobile' | 'other';
    goal?: string;
    expected_feel?: 'instant' | 'snappy' | 'deliberate' | 'other';
  };
}

// Response
interface FeedbackResponse {
  success: boolean;
  issue_url?: string;
  identifier?: string;
  classified_as?: 'bug' | 'feedback' | 'annotation';
  error?: string;
}
```

### Validation Rules

```typescript
function validateFeedbackRequest(request: FeedbackRequest): ValidationResult {
  const errors: string[] = [];

  // Description required for all types
  if (!request.description || request.description.length < 10) {
    errors.push('Description must be at least 10 characters');
  }

  // Annotation requires annotation object
  if (request.type === 'annotation') {
    if (!request.annotation) {
      errors.push('Annotation object required for type: annotation');
    } else if (!request.annotation.element_selector) {
      errors.push('element_selector required in annotation');
    }
  }

  // Source required for non-web submissions
  if (!request.source && request.type === 'annotation') {
    errors.push('Source required for annotations');
  }

  return { valid: errors.length === 0, errors };
}
```

### Annotator Submission (Corrected)

```typescript
// In toolbar annotator - CORRECT implementation
async submitAnnotation(annotation: Annotation): Promise<void> {
  const request: FeedbackRequest = {
    type: 'annotation',
    source: 'sigil-toolbar',
    description: annotation.note,  // User's annotation note becomes description
    page_url: annotation.page_url,
    wallet_address: annotation.wallet_address,
    user_agent: annotation.user_agent,
    annotation: {
      element_selector: annotation.element_selector,
      component_name: annotation.component_name,
      physics: annotation.physics,
      computed_styles: filterLayoutStyles(annotation.computed_styles),
      screenshot_ref: annotation.screenshot_ref,  // Reference, not base64
      viewport: annotation.viewport
    }
  };

  // Use configured endpoint (environment variable or default)
  const endpoint = process.env.FEEDBACK_API_URL || '/api/feedback';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`Feedback submission failed: ${response.statusText}`);
  }

  const result: FeedbackResponse = await response.json();

  // Also write to taste.md via background script message
  if (result.success) {
    chrome.runtime.sendMessage({
      type: 'LOG_TO_TASTE',
      signal: {
        signal: 'MODIFY',
        timestamp: new Date().toISOString(),
        target: annotation.component_name || annotation.element_selector,
        craft_type: 'refine',
        source: 'toolbar',
        annotation: {
          element_selector: annotation.element_selector,
          page_url: annotation.page_url,
          screenshot_ref: annotation.screenshot_ref,
          linear_issue_id: result.identifier
        }
      }
    });
  }
}
```

**Classification Logic**:
```typescript
async function classifyAndRoute(request: FeedbackRequest): Promise<LinearIssue> {
  // Annotations always route to UTC template with physics context
  if (request.type === 'annotation') {
    return createAnnotationIssue(request);
  }

  // Bug hint from user selection
  if (request.type === 'bug') {
    return createBugIssue(request);
  }

  // Otherwise use AI classification
  const classification = await classifyFeedback(request.description);
  return createIssue(request, classification);
}
```

---

## Security Considerations

### Browser Extension Security

| Concern | Mitigation |
|---------|------------|
| Private key exposure | Encrypt with user-provided password, never transmit |
| XSS in content script | Use strict CSP, sanitize all DOM insertions |
| Permission scope | Request only necessary permissions (activeTab, storage) |
| Data exfiltration | All API calls to known THJ endpoints only |

### Linear API Security

| Concern | Mitigation |
|---------|------------|
| API key exposure | Server-side only, never in client |
| Rate limiting | Implement exponential backoff |
| Spam prevention | Source-dependent authentication (see below) |

**Source Authentication Matrix**:

| Source Type | Authentication | Rationale |
|-------------|---------------|-----------|
| dApp (web3 product) | Wallet signature required | Wallet always available in dApps |
| `sigil-toolbar` | Optional wallet signature | Toolbar may have wallet connected for agent testing |
| `loa` (CLI) | HMAC signature + localhost origin | CLI must prove local execution |
| Unknown | Origin validation + rate limiting | Standard web security |

**Security Note**: The `loa` CLI source MUST authenticate via HMAC signature using a shared secret, not blind trust. If `/api/feedback` is publicly reachable, spoofing `source: 'loa'` would bypass all authentication.

**dApp Detection**: Any source with a connected wallet, or sources registered as THJ dApps in config.

```typescript
// Registered dApp sources (add new products here)
const DAPP_SOURCES = new Set([
  'set-and-forgetti',
  'thehoneyjar',
  // Add future dApps here
]);

// CLI authentication uses HMAC with shared secret
// Secret stored in: CLI (~/.config/loa/secret), Server (env var LOA_CLI_SECRET)
interface CLIAuthHeader {
  'x-loa-timestamp': string;  // Unix timestamp
  'x-loa-signature': string;  // HMAC-SHA256(timestamp + body, secret)
}

function validateSource(request: FeedbackRequest, headers: Headers): boolean {
  // dApps require wallet signature
  if (DAPP_SOURCES.has(request.source)) {
    if (!request.wallet_address) {
      return false;  // dApps must have wallet
    }
    return verifyWalletSignature(request);
  }

  // Toolbar - optional wallet verification
  if (request.source === 'sigil-toolbar') {
    if (request.wallet_address) {
      return verifyWalletSignature(request);
    }
    return true;  // Allow without wallet
  }

  // CLI - MUST authenticate with HMAC signature
  // CRITICAL: Do NOT trust source='loa' without cryptographic proof
  if (request.source === 'loa') {
    return validateCLISignature(request, headers);
  }

  // Unknown source - rate limiting only
  return checkRateLimit(request);
}

function validateCLISignature(request: FeedbackRequest, headers: Headers): boolean {
  const timestamp = headers.get('x-loa-timestamp');
  const signature = headers.get('x-loa-signature');
  const secret = process.env.LOA_CLI_SECRET;

  if (!timestamp || !signature || !secret) {
    return false;
  }

  // Reject stale timestamps (5 minute window)
  const age = Date.now() - parseInt(timestamp, 10);
  if (age > 5 * 60 * 1000 || age < -30 * 1000) {
    return false;  // Too old or clock skew
  }

  // Verify HMAC
  const payload = timestamp + JSON.stringify(request);
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// Negative test cases to add:
// - test('rejects source=loa without signature', ...)
// - test('rejects source=loa with invalid signature', ...)
// - test('rejects source=loa with expired timestamp', ...)
// - test('accepts source=loa with valid HMAC', ...)
```

### Wallet Manager Security

```typescript
// Encrypted key storage format
interface EncryptedKeyData {
  salt: Uint8Array;       // PBKDF2 salt (16 bytes)
  iv: Uint8Array;         // AES-GCM IV (12 bytes)
  ciphertext: Uint8Array; // Encrypted private key
  iterations: number;     // PBKDF2 iterations (for future-proofing)
  version: 1;             // Schema version
}

// Encryption for stored private keys
async function encryptPrivateKey(
  privateKey: string,
  password: string
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(privateKey);

  // Generate salt - MUST be stored alongside ciphertext for decryption
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 100000;

  // Derive key from password
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,  // Use the generated salt
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  // Return base64 encoded object with ALL required decryption params
  const stored: EncryptedKeyData = {
    salt,
    iv,
    ciphertext: new Uint8Array(encrypted),
    iterations,
    version: 1
  };
  return btoa(JSON.stringify({
    salt: Array.from(salt),
    iv: Array.from(iv),
    ciphertext: Array.from(new Uint8Array(encrypted)),
    iterations,
    version: 1
  }));
}

// Decryption - uses stored salt and iterations
async function decryptPrivateKey(
  encryptedData: string,
  password: string
): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Parse stored data
  const parsed = JSON.parse(atob(encryptedData));
  const salt = new Uint8Array(parsed.salt);
  const iv = new Uint8Array(parsed.iv);
  const ciphertext = new Uint8Array(parsed.ciphertext);
  const iterations = parsed.iterations || 100000;

  // Derive same key from password using stored salt
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,  // Use stored salt
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return decoder.decode(decrypted);
}
```

---

## Integration Points

### Existing Systems

| System | Integration Type | Purpose |
|--------|-----------------|---------|
| Linear | API | Issue creation from annotations |
| THJ dApps `/api/feedback` | Reuse | Shared feedback endpoint (deployed per-product) |
| Claude Code | Skill files | /craft, /inscribe workflows |
| Sigil rules | File edits | /inscribe target files |

### Future Systems

| System | Integration Type | Purpose |
|--------|-----------------|---------|
| Dune | Data export | Analytics dashboards |
| Posthog | Event tracking | Behavior observation |
| agent-browser | Automation | Agent-driven testing |

---

## Development Workflow

### Phase 1 (Skill Files Only)

```bash
# 1. Edit skill file
vim .claude/skills/crafting-physics/SKILL.md

# 2. Edit rule file
vim .claude/rules/06-sigil-taste.md

# 3. Test with /craft
claude /craft "claim button"
# Give MODIFY feedback, verify diagnostic questions appear

# 4. Check taste.md
cat grimoires/sigil/taste.md
```

### Phase 2 (Browser Extension)

```bash
# 1. Create package
mkdir -p packages/sigil-toolbar
cd packages/sigil-toolbar

# 2. Initialize
pnpm init
pnpm add -D vite @crxjs/vite-plugin

# 3. Development
pnpm dev  # HMR enabled

# 4. Build
pnpm build

# 5. Load in browser
# Chrome: chrome://extensions → Load unpacked → dist/
```

### Testing Strategy

| Phase | Test Type | What to Verify |
|-------|-----------|----------------|
| 1 | Manual | Diagnostic questions appear for MODIFY/REJECT |
| 1 | Manual | taste.md format is correct |
| 2 | Unit | Physics detection logic |
| 2 | Unit | Violation detection |
| 2 | E2E | Annotation flow end-to-end |
| 3 | Manual | Gates trigger at correct points |
| 4 | Manual | Pattern detection accuracy |

### Comprehensive Test Plan

#### Phase 1: Interactive Diagnostic Tests

**taste.md Parser Tests** (Unit):
```typescript
describe('parseTasteMd', () => {
  it('parses valid YAML frontmatter signal', () => {
    const content = `---
\`\`\`yaml
signal: MODIFY
timestamp: 2026-01-19T14:32:00Z
target: ClaimButton
craft_type: generate
source: cli
\`\`\`
---`;
    const signals = parseTasteMd(content);
    expect(signals).toHaveLength(1);
    expect(signals[0].signal).toBe('MODIFY');
  });

  it('handles malformed YAML gracefully', () => {
    const content = `---
\`\`\`yaml
signal: [invalid yaml
\`\`\`
---`;
    const signals = parseTasteMd(content);
    expect(signals).toHaveLength(0);  // Skips invalid
  });

  it('parses multiple signals', () => {
    const content = multipleSignalsFixture;
    const signals = parseTasteMd(content);
    expect(signals.length).toBeGreaterThan(1);
  });
});
```

**Diagnostic Flow Tests** (Integration):
```typescript
describe('Diagnostic Mode', () => {
  it('triggers diagnostic questions on MODIFY signal', async () => {
    // Simulate user feedback "too slow"
    const response = await simulateCraftFeedback({
      signal: 'MODIFY',
      feedback: 'too slow'
    });
    expect(response).toContain('Who\'s the user?');
  });

  it('skips diagnostic when user says "skip"', async () => {
    const signal = await captureSignalWithSkip();
    expect(signal.diagnostic?.skipped).toBe(true);
  });

  it('captures diagnostic context in taste.md', async () => {
    const signal = await captureSignalWithDiagnostic({
      user_type: 'mobile',
      goal: 'checking rewards',
      expected_feel: 'snappy'
    });
    expect(signal.diagnostic?.user_type).toBe('mobile');
  });
});
```

#### Phase 2: Sigil Toolbar Tests

**API Contract Tests** (Unit):
```typescript
describe('FeedbackRequest Validation', () => {
  it('rejects annotation without element_selector', () => {
    const result = validateFeedbackRequest({
      type: 'annotation',
      description: 'Test annotation',
      source: 'sigil-toolbar',
      annotation: {}  // Missing element_selector
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('element_selector required in annotation');
  });

  it('rejects description under 10 chars', () => {
    const result = validateFeedbackRequest({
      type: 'feedback',
      description: 'short',
      source: 'sigil-toolbar'
    });
    expect(result.valid).toBe(false);
  });

  it('accepts valid annotation request', () => {
    const result = validateFeedbackRequest({
      type: 'annotation',
      description: 'Button timing feels off',
      source: 'sigil-toolbar',
      annotation: {
        element_selector: '#claim-button',
        physics: { timing: '800ms' }
      }
    });
    expect(result.valid).toBe(true);
  });
});
```

**Physics Detection Tests** (Unit):
```typescript
describe('detectPhysics', () => {
  it('parses data-sigil-physics attribute', () => {
    const el = createElement('button', {
      'data-sigil-physics': '{"timing":"800ms","sync_type":"pessimistic"}'
    });
    const physics = detectPhysics(el);
    expect(physics?.timing).toBe('800ms');
    expect(physics?.sync_type).toBe('pessimistic');
  });

  it('handles malformed JSON gracefully', () => {
    const el = createElement('button', {
      'data-sigil-physics': 'not json'
    });
    const physics = detectPhysics(el);
    expect(physics).toBeNull();  // Falls back, no crash
  });

  it('infers timing from CSS transition', () => {
    const el = createElementWithStyle('button', {
      transition: 'all 0.8s ease-out'
    });
    const physics = detectPhysics(el);
    expect(physics?.timing).toBe('0.8s');
    expect(physics?.easing).toBe('ease-out');
  });
});
```

**Animation Inspector Tests** (Unit):
```typescript
describe('AnimationInspector', () => {
  it('pauses all running animations', () => {
    const inspector = new AnimationInspector();
    startTestAnimations(3);

    inspector.pauseAll();

    const animations = document.getAnimations();
    expect(animations.every(a => a.playState === 'paused')).toBe(true);
  });

  it('resumes only previously paused animations', () => {
    const inspector = new AnimationInspector();
    startTestAnimations(3);

    inspector.pauseAll();
    inspector.resumeAll();

    const animations = document.getAnimations();
    expect(animations.every(a => a.playState === 'running')).toBe(true);
  });
});
```

**Protected Capabilities Audit Tests** (Unit):
```typescript
describe('auditProtectedCapabilities', () => {
  it('detects missing cancel button', () => {
    renderFinancialFormWithoutCancel();
    const audits = auditProtectedCapabilities();
    const cancelAudit = audits.find(a => a.capability === 'Cancel/Escape Hatch');
    expect(cancelAudit?.status).toBe('warning');
  });

  it('detects touch targets below 44px', () => {
    renderSmallButton({ width: 30, height: 30 });
    const audits = auditProtectedCapabilities();
    const touchAudit = audits.find(a => a.capability === 'Touch Target Size');
    expect(touchAudit?.status).toBe('fail');
  });

  it('finds cancel buttons by text content', () => {
    render(<button>Go Back</button>);
    const audits = auditProtectedCapabilities();
    const cancelAudit = audits.find(a => a.capability === 'Cancel/Escape Hatch');
    expect(cancelAudit?.status).toBe('pass');
  });
});
```

**Extension E2E Tests** (Playwright):
```typescript
describe('Sigil Toolbar Extension', () => {
  it('injects toolbar into page', async ({ page, extensionId }) => {
    await page.goto('http://localhost:3000');
    const toolbar = await page.locator('#sigil-toolbar');
    await expect(toolbar).toBeVisible();
  });

  it('annotation flow creates Linear issue', async ({ page }) => {
    await page.click('#sigil-toolbar button[aria-label="Annotate"]');
    await page.click('#target-element');
    await page.fill('[name="annotation-note"]', 'Button feels too slow');
    await page.click('button:has-text("Submit")');

    // Verify Linear API called
    await expect(page.locator('.toast-success')).toBeVisible();
  });

  it('screenshot capture respects 500KB limit', async ({ page }) => {
    await page.click('#sigil-toolbar button[aria-label="Annotate"]');
    await page.click('#large-element');

    const screenshot = await getLastCapturedScreenshot();
    expect(screenshot.data.length).toBeLessThan(500 * 1024);
  });
});
```

#### Phase 3: Back Pressure Gates Tests

**Gate Integration Tests** (Integration):
```typescript
describe('Pre-Generate Gate', () => {
  it('warns on recent REJECT for similar component', async () => {
    // Setup: Add REJECT signal to taste.md
    await addTasteSignal({
      signal: 'REJECT',
      target: 'ClaimButton',
      timestamp: new Date().toISOString()
    });

    // Action: Craft similar component
    const analysis = await runCraftAnalysis('/craft "claim rewards button"');

    // Verify warning present
    expect(analysis).toContain('Similar component was REJECT\'d recently');
  });

  it('auto-fixes touch target below 44px', async () => {
    const generated = await runCraft('/craft "small button"', {
      mockStyles: { padding: '4px' }
    });

    expect(generated.validation).toContain('Auto-fixed: Padding');
    expect(generated.code).toMatch(/min-h-\[44px\]|padding.*12px/);
  });

  it('blocks optimistic sync for Financial effect', async () => {
    const result = await runCraft('/craft "claim button" with optimistic sync');

    expect(result.blocked).toBe(true);
    expect(result.reason).toContain('Financial operations require pessimistic sync');
  });
});
```

#### Phase 4: Taste Synthesis Tests

**Pattern Detection Tests** (Unit):
```typescript
describe('Taste Synthesis', () => {
  it('detects timing pattern from 3+ similar MODIFY signals', () => {
    const signals = [
      { signal: 'MODIFY', changed: { from: '800ms', to: '500ms' } },
      { signal: 'MODIFY', changed: { from: '800ms', to: '600ms' } },
      { signal: 'MODIFY', changed: { from: '800ms', to: '500ms' } }
    ];

    const patterns = detectPatterns(signals);

    expect(patterns).toContainEqual(expect.objectContaining({
      type: 'timing',
      confidence: 'HIGH'
    }));
  });

  it('groups patterns by user_type', () => {
    const signals = mobileTuningFixture;  // 5 signals from mobile users

    const patterns = detectPatterns(signals);
    const mobilePattern = patterns.find(p =>
      p.common_context.user_type === 'mobile'
    );

    expect(mobilePattern).toBeDefined();
  });
});
```

---

## Design Decisions & Clarifications

This section addresses questions raised during design review.

### Q1: Is `/api/feedback` publicly reachable?

**Answer**: Yes, `/api/feedback` is publicly reachable when deployed. This is intentional for toolbar submissions from any domain.

**Mitigation for CLI spoofing**:
- CLI submissions (`source: 'loa'`) now require HMAC signature authentication (see Source Authentication Matrix above)
- The CLI generates a local secret on first run (~/.config/loa/secret)
- Server validates signature using corresponding env var (LOA_CLI_SECRET)
- Without valid signature, `source: 'loa'` requests are rejected

**Alternative considered**: Separate `/api/feedback-cli` endpoint with localhost-only binding was rejected because:
1. CLI may run on remote dev machines (Codespaces, SSH)
2. Would require additional deployment complexity
3. HMAC provides equivalent security with simpler architecture

### Q2: Toolbar endpoint configuration

**Answer**: The toolbar uses a configurable endpoint with explicit host permissions.

**Configuration hierarchy**:
1. Extension options page: User-configurable `feedbackApiUrl`
2. Build-time default: `process.env.VITE_FEEDBACK_API_URL`
3. Same-origin fallback: `/api/feedback` (for first-party apps)

**Manifest V3 host permissions**:
```json
{
  "host_permissions": [
    "https://*.thehoneyjar.xyz/*",
    "https://*.setandforgetti.xyz/*"
  ],
  "optional_host_permissions": [
    "https://*/*"  // For custom endpoints
  ]
}
```

Users configuring custom endpoints will be prompted to grant host permission.

### Q3: Screenshot sensitivity and consent

**Answer**: Screenshots are considered potentially sensitive. The design includes:

1. **Explicit capture action**: User must click annotate button, then click specific element
2. **Element-scoped**: Only captures element bounds + 20px padding, not full page
3. **Local-first storage**: Screenshots stored in `chrome.storage.local` (7-day retention)
4. **No automatic transmission**: Screenshots only sent when user submits annotation
5. **Clear consent flow**: Submit modal shows screenshot preview before sending

**For enhanced privacy (optional future feature)**:
- Add toggle in extension settings: "Encrypt screenshots with password"
- Use same encryption as wallet private keys
- Linear issue would include link to encrypted blob, not inline image

**Current recommendation**: The explicit user action (click annotate → click element → review → submit) provides adequate consent for most use cases. Adding encryption would add friction and complexity.

---

## Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Diagnostic questions add too much friction | Medium | High | Skip option prominent, track skip rate |
| Physics detection inaccurate | Medium | Medium | Fallback to data attributes, improve heuristics |
| Browser extension adoption low | Low | Medium | Bookmarklet fallback for MVP |
| Pattern detection false positives | Medium | Low | Require human approval for /inscribe |
| Linear API rate limits | Low | Low | Implement exponential backoff |

---

## Appendix: Rivet-Inspired Features (Future)

For agent wallet testing capabilities:

```typescript
// Features inspired by Rivet for agent testing
interface AgentTestingCapabilities {
  // Account impersonation
  impersonateAccount(address: string): Promise<void>;

  // Balance override
  overrideBalance(address: string, balance: bigint): Promise<void>;

  // Transaction simulation
  simulateTransaction(tx: Transaction): Promise<SimulationResult>;

  // Mainnet fork
  forkMainnet(blockNumber?: number): Promise<void>;

  // Time manipulation
  advanceTime(seconds: number): Promise<void>;
  mineBlock(): Promise<void>;
}
```

These would enable automated physics testing:
- "Does the claim button behave correctly with pessimistic sync?"
- "Does the cancel button remain visible during pending state?"
- "What happens when the transaction fails?"

---

```
    ╔═══════════════════════════════════════════════╗
    ║  SDD COMPLETE                                 ║
    ║  Focus: Sigil Feedback Loop Enhancement       ║
    ║  Ready for sprint planning                    ║
    ╚═══════════════════════════════════════════════╝
```
