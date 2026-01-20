# Sigil Feedback Loops: PRD

```
    ╔═══════════════════════════════════════════════╗
    ║  ✦ SIGIL FEEDBACK LOOPS                       ║
    ║  Learn from usage, not opinions               ║
    ║                                               ║
    ║  PRD v0.1.0 (Discovery Phase)                 ║
    ╚═══════════════════════════════════════════════╝
```

**Version**: 0.1.0
**Created**: 2026-01-19
**Status**: Discovery / Architecture Exploration
**Author**: zksoju + Claude

---

## Executive Summary

This PRD explores how to build feedback loops that make Sigil learn from real usage. The core insight: **behavior is truth, opinions are fiction**.

### Current Sigil Feedback State

```
/craft → Analysis Box → User confirms → Generate → "Does this feel right?"
                                                           │
                                        ┌──────────────────┴──────────────────┐
                                        │                                     │
                                    ACCEPT (+1)                          MODIFY (+5)
                                    │                                     │
                                    └──────────────── taste.md ──────────┘
                                                          │
                                                    /inscribe
                                                          │
                                                    Rule updates
```

### Gap Analysis

| What We Capture | What's Missing |
|-----------------|----------------|
| Signal: ACCEPT/MODIFY/REJECT | **Why** — What felt wrong? What were they trying to achieve? |
| Diff: Code changes | **Context** — Was it timing? Animation? Feel? |
| Pattern: 3x similar changes | **Diagnostic** — Why do multiple users make same change? |
| Inscription: Rule updates | **Validation** — Did the update actually improve outcomes? |

### Vision

**Level 3 Feedback for Sigil**: When a user says "doesn't feel right", Sigil should:
1. Ask: "What were you trying to accomplish for your user?"
2. Ask: "What did you expect to happen?"
3. Diagnose: Map the gap between expectation and reality
4. Learn: Update physics with diagnostic context, not just the diff

---

## Problem Statement: Sigil Feedback Loop

### Current /craft Feedback (Step 6)

```
Agent: "Does this feel right? Think about your user in the moment of clicking."

User options:
- "yes" / "looks good" → ACCEPT signal → taste.md
- "too slow" / "needs more contrast" → MODIFY signal → taste.md
- "no" / "wrong" → REJECT signal → taste.md
```

**What works**:
- Simple, low-friction question
- Captures signal type
- `MODIFY` signals have 5x weight (corrections teach more)

**What's missing**:
- After MODIFY, we don't dig deeper
- "Too slow" doesn't tell us: for whom? in what context? what did they expect?
- The learning is shallow: "User prefers 600ms" vs "Mobile users want faster feedback when checking status"

### The Mom Test Problem in Sigil

From Level-3 Protocol:
> "Users describe solutions, not problems."

```
Current flow:
User: "Too slow"
→ Sigil logs: Learning: User prefers faster timing
→ /inscribe: Financial timing 800ms → 600ms

Mom Test flow:
User: "Too slow"
→ Sigil asks: "What were you trying to accomplish for your user?"
→ User: "Mobile users checking if rewards are building"
→ Sigil asks: "What should it feel like for them?"
→ User: "Quick confirmation, they're doing this 10x/day"
→ Sigil logs: Learning: High-frequency status checks should use Local physics (100ms), not Financial (800ms)
→ Insight: This isn't a timing tweak. It's an effect misclassification.
```

### The Annotation Problem for Physics

From [benji.org/annotating](https://benji.org/annotating):
> "The harder something is to describe, the more helpful it is to just point at it."

**Feel** is hard to describe:
- "Feels sluggish" — which element? what timing? compared to what?
- "Animation is jumpy" — which keyframe? what easing? at what screen size?
- "Doesn't feel trustworthy" — is it the timing? the confirmation? the copy?

**Sigil physics are specific** (800ms, ease-out, pessimistic) but feedback is vague.

The gap between vague feedback and precise physics requires diagnostic conversation.

---

## Proposed Solution: Enhanced Sigil Feedback Loop

### Phase 1: Interactive Diagnostic (Post-Feedback Follow-up)

**Key insight**: Ask Level 3 questions *after* the user gives initial feedback, not before.

```
Current Step 6:
Agent: "Does this feel right?"
User: "Too slow"
→ Log to taste.md
→ End

Enhanced Step 6:
Agent: "Does this feel right?"
User: "Too slow"
→ Log initial signal
→ Trigger Diagnostic Mode
```

**Diagnostic Mode** (interactive continuation):

```
┌─ Diagnostic Follow-up ─────────────────────────────────────┐
│                                                            │
│  Thanks for the feedback. Help me understand better:       │
│                                                            │
│  1. Who is the user experiencing this?                     │
│     □ First-time user   □ Power user   □ Mobile user      │
│     □ Other: ___________                                   │
│                                                            │
│  2. What were they trying to accomplish?                   │
│     (e.g., "checking rewards", "confirming a deposit")     │
│     _________________________________________________      │
│                                                            │
│  3. What should it feel like?                              │
│     □ Instant (100ms)     □ Snappy (200ms)                │
│     □ Deliberate (500ms)  □ Current is OK but needs X     │
│                                                            │
│  [Skip] [Submit]                                           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Why post-feedback, not pre-feedback**:
- User already committed to giving feedback (lower friction)
- We have context: which component, what they said
- Skip option respects their time
- Feels like conversation, not interrogation

### Implementation: Enhanced taste.md Signal

```markdown
## 2026-01-19 14:32 | MODIFY

Target: ClaimButton
Craft Type: Generate
Effect: Financial
Physics: 800ms pessimistic, ease-out

Changed: 800ms → 500ms
Initial feedback: "too slow"

### Diagnostic Context (optional)
User type: Mobile user, power user
Goal: "checking if rewards are building, does this 10x/day"
Expected feel: Snappy (200ms)

### Learning
- Effect may be misclassified: user treats this as status check (Local), not financial action
- For high-frequency status checks, consider separate physics
- Recommendation: Add `frequency: high` detection for financial components used for checking vs acting

---
```

This richer signal feeds into:
1. **/inscribe** — Creates more nuanced rules
2. **Pattern detection** — Groups similar diagnostics
3. **Physics evolution** — Informs new effect types or modifiers

### Phase 2: Sigil Toolbar (Visual Annotation)

**Inspiration**: [Vercel Toolbar](https://vercel.com/docs/vercel-toolbar) — point-at-it feedback with context capture.

**Sigil's version focuses on physics**:
- Layout Shift Tool → **Physics Violation Tool**
- Interaction Timing → **Animation Timing Inspector**
- Accessibility Audit → **Protected Capabilities Audit**

```
┌─────────────────────────────────────────────────────────────┐
│  SIGIL TOOLBAR (Development Mode)                           │
│                                                             │
│  ┌─────┬─────┬─────┬─────┬─────┬─────┐                     │
│  │  ⚡ │  🎭 │  ♿ │  📸 │  💬 │  ≡  │                     │
│  └─────┴─────┴─────┴─────┴─────┴─────┘                     │
│    │     │     │     │     │     │                         │
│    │     │     │     │     │     └─ Menu                   │
│    │     │     │     │     └─ Comment/Annotate             │
│    │     │     │     └─ Screenshot + Context               │
│    │     │     └─ Protected Capabilities Check             │
│    │     └─ Animation Timing Inspector                     │
│    └─ Physics Violation Detector                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Physics Violation Detector (⚡)**:
- Highlights elements with detected physics
- Flags violations: touch target < 44px, missing focus ring, etc.
- Click element to see current physics vs expected

**Animation Timing Inspector (🎭)**:
- Pause animations mid-flight
- Show current timing values
- Compare to Sigil physics tables

**Protected Capabilities Check (♿)**:
- Scan for cancel buttons, error recovery
- Check balance displays for staleness
- Verify escape hatches are always visible

**Comment/Annotate (💬)**:
- Click element to annotate
- Captures: selector, computed styles, animation state, screenshot
- Pre-fills Linear issue with physics context

**Implementation approach**:
1. **Phase 2a**: Bookmarklet that enables annotation mode
2. **Phase 2b**: NPM package (`@sigil/toolbar`) like Vercel's
3. **Phase 2c**: Browser extension for production inspection

### Phase 3: Back Pressure in /craft

**From [ghuntley.com/pressure](https://ghuntley.com/pressure)**:
> "Back pressure is essential infrastructure for delegating work to AI agents."

**Current /craft flow has no quality gates**:
```
User: /craft "claim button"
→ Sigil generates
→ User reviews
→ Ship
```

**With back pressure**:
```
User: /craft "claim button"
→ Sigil detects effect: Financial
→ Sigil generates
→ PRE-CONFIRM GATE:
  ✓ Protected capabilities checklist
  ✓ Physics compliance
  ⚠ Touch target 36px (minimum 44px) — AUTO-FIXED
→ Show analysis with fixes
→ User reviews
→ POST-ACCEPT GATE (if ACCEPT):
  ✓ No taste.md conflicts
  ✓ Pattern not recently REJECT'd
→ Ship
```

**Implementation in Step 3 (Physics Analysis)**:

```
┌─ Craft Analysis ───────────────────────────────────────────┐
│                                                            │
│  Target:       ClaimButton                                 │
│  Effect:       Financial mutation                          │
│                                                            │
│  ┌─ Pre-Generation Gate ────────────────────────────────┐  │
│  │ ✓ Effect detection confident (keyword: "claim")      │  │
│  │ ✓ No conflicting taste.md patterns                   │  │
│  │ ⚠ Similar component MODIFY'd 2x → applying learning  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  Behavioral    pessimistic, 800ms→600ms*, confirmation     │
│  Animation     ease-out, deliberate                        │
│  Material      elevated, soft shadow                       │
│                                                            │
│  * Adjusted per taste.md: 2 prior MODIFY signals          │
│                                                            │
│  ┌─ Protected Capabilities ─────────────────────────────┐  │
│  │ ✓ Cancel always visible                              │  │
│  │ ✓ Amount displayed                                   │  │
│  │ ✓ Touch target ≥ 44px                               │  │
│  │ ✓ Focus ring present                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Key back pressure points**:

| Gate | When | What It Checks |
|------|------|----------------|
| **Pre-detect** | Before analysis | Is effect clear? If not, ask (max 2 questions) |
| **Pre-generate** | After analysis, before code | Taste conflicts, recent REJECTs |
| **Post-generate** | After code, before show | Protected capabilities, touch targets |
| **Post-accept** | After ACCEPT | Log signal, check for inscription candidates |

---

## Sigil Taste Synthesis (Phase 4)

When taste.md accumulates enough diagnostic signals, synthesis becomes valuable.

### Skill: `/taste-synthesize`

Reads taste.md and extracts patterns from diagnostic context.

```
┌─ Taste Synthesis ──────────────────────────────────────────┐
│                                                            │
│  Signals analyzed: 47                                      │
│  Period: Last 30 days                                      │
│                                                            │
│  Pattern 1: Mobile User Timing (HIGH confidence)           │
│  ────────────────────────────────────────────────          │
│  Signals: 5 MODIFY                                         │
│  Common: User type = "mobile user"                         │
│          Goal = "quick status check"                       │
│          Changed: 800ms → 500-600ms                        │
│  Recommendation: Add `mobile: true` modifier to physics    │
│  Action: /inscribe candidate                               │
│                                                            │
│  Pattern 2: Power User Confirmation Skip (MEDIUM)          │
│  ────────────────────────────────────────────────          │
│  Signals: 3 MODIFY                                         │
│  Common: User type = "power user"                          │
│          Goal = "repeat action quickly"                    │
│          Changed: Removed confirmation step                │
│  Recommendation: Add frequency-based confirmation bypass   │
│  Action: Needs discussion (protected capability)           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Integration with /inscribe**:
- /taste-synthesize outputs candidates
- /inscribe proposes specific rule changes
- Human approves (safety for physics changes)


---

## Future: Physics Lenses

From your mention of "lenses which are visual layers over the backend targeted for X user."

**Concept**: Same component, different physics by user segment.

```
┌─────────────────────────────────────────────────────────────┐
│  PHYSICS LENSES (Future Exploration)                        │
│                                                             │
│  Example: ClaimButton rendered with different physics       │
│                                                             │
│  Default (Financial):     800ms, pessimistic, confirmation  │
│  Mobile Lens:             600ms, pessimistic, confirmation  │
│  Power User Lens:         500ms, pessimistic, skip confirm* │
│                                                             │
│  * Protected capability exception: requires explicit opt-in │
│                                                             │
│  Implementation:                                            │
│  <PhysicsLensProvider lens="mobile">                       │
│    <ClaimButton />                                         │
│  </PhysicsLensProvider>                                    │
│                                                             │
│  Sigil's role: Generate lens variants from diagnostic data  │
│  /taste-synthesize identifies patterns → /craft generates   │
│  lens-aware variants                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

This is deferred until:
1. Diagnostic data shows clear user segment patterns
2. Taste synthesis can reliably identify lens candidates

---

## Implementation Roadmap

### Phase 1: Interactive Diagnostic in /craft (Priority: NOW)

**Goal**: Add Level 3 follow-up after MODIFY/REJECT signals

**Changes to crafting-physics skill**:

```markdown
### Step 6: Collect Feedback (ENHANCED)

Ask user to reflect on feel:
> "Does this feel right? Think about your user in the moment of clicking."

**Signal detection**:
- ACCEPT: "yes", "looks good", "perfect" → Log, end
- MODIFY: Describes what's off → Log, trigger Diagnostic
- REJECT: "no", "wrong", "start over" → Log, trigger Diagnostic

**Diagnostic Mode (for MODIFY/REJECT)**:

If signal is MODIFY or REJECT:

> Thanks for the feedback. Quick follow-up to help me learn:
>
> 1. Who's the user? (first-time / power user / mobile / other)
> 2. What were they trying to accomplish?
> 3. What should it feel like? (instant / snappy / deliberate / other)
>
> [Skip] to log without context

Capture responses and append to taste.md with diagnostic section.
```

**Files to modify**:
- `.claude/skills/crafting-physics/SKILL.md` — Add diagnostic mode
- `.claude/rules/06-sigil-taste.md` — Update signal format

**Validation**:
- Run /craft, give MODIFY feedback
- Confirm diagnostic questions appear
- Check taste.md has diagnostic context

### Phase 2: Sigil Toolbar (Priority: NEXT)

**Goal**: Point-at-it feedback for physics issues

**Approach**: Start with bookmarklet, evolve to NPM package

**Phase 2a: Bookmarklet**
```javascript
// sigil-annotate.js bookmarklet
// 1. Enable annotation mode (adds overlay)
// 2. Click element → capture context
// 3. Open prefilled feedback form
```

**Phase 2b: NPM Package**
```tsx
// @sigil/toolbar
import { SigilToolbar } from '@sigil/toolbar'

// In development layout:
{process.env.NODE_ENV === 'development' && <SigilToolbar />}
```

**Features**:
- Physics inspection (hover to see timing, easing)
- Protected capabilities audit
- Annotation → Linear issue creation

### Phase 3: Back Pressure Gates (Priority: INTEGRATE)

**Goal**: Quality gates in /craft flow

**Changes to crafting-physics skill**:
- Add pre-generation gate (taste conflicts, detection confidence)
- Add post-generation gate (protected capabilities)
- Surface warnings in analysis box

**New skill: /ward-all**
- Batch validation across components
- Integrates with Loa sprint review

### Phase 4: Pattern Synthesis (Priority: LATER)

**Goal**: Extract patterns from accumulated signals

**New skill: /taste-synthesize**
- Reads taste.md diagnostic signals
- Groups by user type, goal, expected feel
- Outputs pattern recommendations

**Integrates with /inscribe**:
- /taste-synthesize outputs candidates
- /inscribe proposes rule changes
- Human approves inscriptions

---

## Open Questions

1. **Diagnostic friction**: Will users skip the diagnostic questions?
   - Mitigation: Make it feel like conversation, not form. Keep Skip visible.
   - Validation: Track skip rate in Phase 1.

2. **Toolbar scope**: Bookmarklet vs NPM package vs browser extension?
   - Current lean: Start with bookmarklet (fastest to validate), then NPM package.
   - Vercel's approach: NPM package + browser extension.

3. **Back pressure strictness**: Hard block vs warning?
   - Current lean: Warning by default, auto-fix where safe (touch targets).
   - Philosophy: Respect craftsman agency, surface issues don't hide them.

4. **Synthesis frequency**: Real-time vs batch?
   - Current lean: Manual synthesis initially (via /taste-synthesize).
   - Evolve to: Weekly automated synthesis → pattern recommendations.

5. **Cross-product learning**: Should S&F learnings feed into Sigil defaults?
   - Current lean: Yes, but with attribution.
   - Format: `Learning (from: S&F)` in taste.md.

---

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Diagnostic completion | > 50% of MODIFY signals | Users complete diagnostic vs skip |
| Learning quality | Actionable insights | Manual review: can we /inscribe from this? |
| Back pressure catches | > 80% of violations | Violations caught pre-ship vs post-ship |
| Inscription rate | Monthly | Signals → rules (shows feedback loop closes) |
| Repeat MODIFY rate | Decreasing | Same change made less often (we learned) |

---

## Related Documents

- **Level-3 Protocol**: `grimoires/loa/context/level-3-protocol.md`
- **Mom Test**: `grimoires/loa/context/mom_test.md`
- **Sigil Taste Rule**: `.claude/rules/06-sigil-taste.md`
- **Crafting Physics Skill**: `.claude/skills/crafting-physics/SKILL.md`
- **Inscribing Taste Skill**: `.claude/skills/inscribing-taste/SKILL.md`
- **Vercel Toolbar Docs**: https://vercel.com/docs/vercel-toolbar
- **Back Pressure Philosophy**: https://ghuntley.com/pressure
- **Annotation Methodology**: https://benji.org/annotating

---

## Next Steps

**Immediate (this conversation)**:
1. ✓ Review this PRD
2. Decide: Start Phase 1 now or refine further?
3. If starting: Scope the SKILL.md changes

**Phase 1 Implementation**:
1. Update `.claude/skills/crafting-physics/SKILL.md` — Add Diagnostic Mode to Step 6
2. Update `.claude/rules/06-sigil-taste.md` — New signal format with diagnostic context
3. Test: Run /craft, give MODIFY feedback, verify diagnostic flow
4. Validate: Check taste.md captures context

**After Phase 1**:
- Use Sigil to build actual components
- Collect diagnostic data from real usage
- Evaluate: Are insights actionable? Can we /inscribe from them?

---

## Appendix: S&F Integration (Future)

When ready to extend to S&F product feedback:

1. **FeedbackPopover enhancement**: Add post-submit diagnostic question
2. **Linear classifier update**: Pass diagnostic context to issue body
3. **UTC directory**: `grimoires/loa/utc/` for cross-product synthesis
4. **Bidirectional flow**: S&F learnings → Sigil defaults (with attribution)

This is deferred until Sigil's feedback loop is validated.

---

```
    ╔═══════════════════════════════════════════════╗
    ║  PRD COMPLETE                                 ║
    ║  Focus: Sigil Feedback Loop Enhancement       ║
    ║  Ready for Phase 1 implementation             ║
    ╚═══════════════════════════════════════════════╝
```
