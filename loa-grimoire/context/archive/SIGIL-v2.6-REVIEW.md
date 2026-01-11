# Sigil v2.6 Implementation Review

**Reviewers**: Staff Design Engineer (Technical) + Product Strategy  
**Date**: 2026-01-06  
**Verdict**: Impressive engineering. Incomplete product thinking.

---

## Executive Summary

Sigil v2.6 demonstrates sophisticated architectural thinking — the Core/Layout/Lens separation is clean, the Constitution concept is principled, and the TypeScript implementation is comprehensive. However, the implementation suffers from **fatal technical flaws** and **fundamental product blind spots**.

You have built a Physics Engine for a closed system.  
You have not built a Product Engine for a living market.

| Dimension | Rating | Summary |
|-----------|--------|---------|
| **Architecture** | A- | Clean separation, good mental model |
| **Implementation** | D | Fatal runtime errors, missing components |
| **Philosophy Alignment** | C | Skills contradict agreed principles |
| **Product Strategy** | C | Static world assumption, no user fluidity |
| **Documentation** | B+ | Comprehensive but verbose |
| **Overall** | **C+** | Strong foundation, broken execution |

---

## Part I: Fatal Technical Issues

These issues will cause runtime failures. Fix before any other work.

### 1. Node.js `fs` in Browser Context (FATAL)

**The Code:**
```typescript
// constitution-reader.ts
import * as fs from 'fs/promises';
```

```typescript
// process-context.tsx line 11
'use client';
```

**The Problem:** The Process Layer readers use Node.js `fs` module, but `ProcessContextProvider` is marked as a client component. **This will crash in the browser.** The `fs` module doesn't exist client-side.

**The Fix:**

| Option | Complexity | Recommendation |
|--------|------------|----------------|
| Server Components only | Medium | ✓ Best for Next.js |
| Build-time embedding | Medium | Good for static config |
| API route fetching | Low | Works but adds latency |
| Remove runtime reading | Low | ✓ Make Process agent-only |

**Recommendation:** Make Process Layer agent-context-only. The agent reads YAML during code generation. The runtime never touches these files.

---

### 2. Two Conflicting "Lens" Concepts

**The Confusion:**

| Location | "Lens" Means |
|----------|--------------|
| `sigil-mark/lenses/` | UI rendering components (DefaultLens, StrictLens) |
| `sigil-mark/lens-array/lenses.yaml` | User personas (power_user, newcomer) |

From CLAUDE.md:
```
LENSES CONFIGURED
│ Priority 1: power_user (truth test)    ← This is a Persona
```

From code:
```tsx
const Lens = useLens(); // Returns StrictLens ← This is a UI Component
```

**The Fix:** Rename one concept:
- **Lens** = UI rendering system (keep)
- **Persona** = User archetype (rename `lens-array/` → `personas/`)

---

### 3. Zone Detection: Path vs Layout Contradiction

**Documentation claims path-based:**
```
# CLAUDE.md
ZONES
│ critical: checkout/**, claim/** (deliberate, 800ms+)
```

**Config claims layout-based:**
```yaml
# .sigilrc.yaml
zones:
  critical:
    layout: CriticalZone  # Not path-based
```

**Code is layout-based:**
```tsx
// CriticalZone provides zone context via React Context
<ZoneContext.Provider value={zoneContextValue}>
```

**The Problem:** Skill files tell agents to use path detection (`get-zone.sh`), but the runtime uses layout detection. Agents will generate incorrect code.

**The Fix:** Align on layout-based zones. Remove all path-based claims from documentation and skills.

---

### 4. Missing Implementations

Features referenced in documentation that don't exist:

| Feature | Referenced In | Status |
|---------|---------------|--------|
| `<InspectorOverlay>` | CLAUDE.md | ❌ Not implemented |
| `VibeSurvey` component | CLAUDE.md, skills | ❌ Not implemented |
| `get-zone.sh` script | crafting-guidance/SKILL.md | ❌ Not implemented |
| Zone-to-persona auto-mapping | CLAUDE.md | ❌ Not implemented |
| `useCriticalAction` full state machine | README | ⚠️ Types only, thin logic |

**The Problem:** Agents will try to use these and fail.

---

### 5. Philosophy Drift in Skills

**Agreed Philosophy:**
> "Sweat the art. We handle the mechanics. Return to flow."

**What Skills Say:**
```markdown
# consulting-decisions/SKILL.md line 26-27
> "Decide fast. Lock it. Move on."
```

**The Problem:** We agreed `/consult` is for AFTER deliberation. The skill explicitly says "don't deliberate endlessly" — contradicting the revised philosophy.

**The Fix:** Rewrite all skill files to reflect:
- Craftsman SHOULD think deeply
- `/consult` locks decisions AFTER deliberation
- Agent handles mechanics, not taste decisions

---

## Part II: Product Strategy Failures

These issues won't crash the app, but will prevent product-market fit.

### 6. The "Path is Destiny" Fallacy

**Your Assumption:** Zone = File Path. `src/features/trade/**` → Critical Zone.

**The Reality:** Users are not file paths.

| User | Visits `/trade` | Needs |
|------|-----------------|-------|
| Henlocker (novice) | Yes | Reassurance, warmth, guidance |
| Chef (power user) | Yes | Density, speed, keyboard shortcuts |

Your architecture forces both into "Critical Zone" because they're in the same folder. **You have optimized for Code Organization over User Psychology.**

**How Others Solve This:**
- Airbnb designs by "Mode" (Guest vs Host), not directory
- Phantom allows click-to-expand, switching physics per user intent
- Linear adapts density based on user preference

**The Fix:** Contextual injection, not path staticism.

```yaml
# Zone determined by (Path + UserState), not just Path
zones:
  critical:
    layout: CriticalZone
    persona_overrides:
      newcomer:
        lens: guided      # Override for newcomers
        motion: reassuring
      power_user:
        lens: strict
        motion: snappy
```

---

### 7. The "Hardcoded Soul" Trap

**Your Assumption:** Soul lives in `essence.yaml`, changed via git commits.

**The Reality:** Marketing operates at the speed of culture. Engineering operates at the speed of commits.

| Team | Speed | Sigil Supports? |
|------|-------|-----------------|
| Marketing | Hours (campaign launch) | ❌ No |
| Product | Days (experiment) | ❌ No |
| Engineering | Weeks (PR cycle) | ✓ Yes |

If Marketing wants to test "High Yield Summer" (playful, gold accents), they cannot wait for a PR to merge.

**How Others Solve This:**
- Linear evolves landing pages constantly while keeping app stable
- OSRS runs "Leagues" (temporary modes with different vibes) without touching main game
- Every growth team uses feature flags for vibe testing

**The Fix:** Remote Soul Configuration.

```yaml
# essence.yaml is the DEFAULT soul
soul:
  feel: "Confident & Secure"
  
# Remote overrides via LaunchDarkly/Statsig
remote_config:
  marketing_controlled:
    - campaigns.summer_vibe
    - landing.hero_energy
  engineering_controlled:
    - constitution
    - protected_capabilities
```

**Constraint:** Physics (Core) stays immutable. Vibe (Material) must be swappable at runtime.

---

### 8. Democracy is Not Research

**Your Assumption:** Polls determine what to build (via `/consult`, inherited from OSRS model).

**The Reality:**

| Method | Good For | Bad For |
|--------|----------|---------|
| Polling | Retention (keeping existing users happy) | Growth (finding new users) |
| Research | Growth (understanding non-users) | Retention (existing users already vocal) |

If you poll "Should we simplify the Trade UI?", your power users (Chefs) will vote NO. Your potential users (Henlockers) are not there to vote.

**The OSRS Trap:** They poll everything, so innovation is "bounded by nostalgia." Good for a retro game. Bad for a growth-stage product.

**How Others Solve This:**
- Linear explicitly ignores feature requests that don't fit their vision
- They use intuition backed by deep observation, not ballot boxes
- Airbnb watches behavior, not surveys

**The Fix:** Replace Pollster with Observer.

```yaml
# Instead of asking "Do you want X?"
# Watch "Where do users rage-click?" or "Where do they drop off?"

vibe_checks:
  - trigger: "card_expanded_5x_in_session"
    insight: "User seeking information not immediately visible"
    action: "Consider surfacing key data"
    
  - trigger: "abandon_at_confirmation"
    insight: "Confirmation friction too high"
    action: "Review deliberate motion timing"
```

Feed Intent Data back to the Agent to nominate new patterns.

---

### 9. Physics Without Language

**Your Assumption:** Define Physics (Gravity, Motion) and you're done.

**The Reality:** A "Pot" and a "Vault" might have the same physics (Server-Tick), but they trigger completely different mental models.

| Term | Physics | Mental Model | Appropriate Material |
|------|---------|--------------|---------------------|
| Pot | server-tick | Piggy bank, saving | Warm, Glass |
| Vault | server-tick | Bank vault, security | Cold, Steel |

If the Agent generates a "Machinery" interface for a "Pot," it feels dissonant.  
If the Agent generates a "Glass" interface for a "Vault," it feels unsafe.

**How Others Solve This:**
- Airbnb maintains strict vocabulary (Guests/Hosts) aligned with design system
- Linear forces "Cycle" instead of "Sprint" to enforce mental model

**The Fix:** The Rosetta Stone Layer.

```yaml
# sigil-mark/vocabulary.yaml
terms:
  pot:
    engineering_name: "savings_vault"
    user_facing: "Pot"
    mental_model: "Piggy bank"
    recommended_material: glass
    recommended_motion: warm
    
  vault:
    engineering_name: "savings_vault"
    user_facing: "Vault"  
    mental_model: "Bank vault"
    recommended_material: steel
    recommended_motion: deliberate
```

The Agent must check the **Noun's Gravity** before applying the **Zone's Physics**.

---

### 10. Missing the "Why" (Intent Layer)

**What You Built:**
- ✓ Physics Engine (Core/Layout/Lens)
- ✓ Governance (Constitution, Locked Decisions)

**What You Missed:**
- ✗ Philosophy/Intent

**Why This Matters:**

| Product | Has Engine? | Has Governance? | Has Philosophy? |
|---------|-------------|-----------------|-----------------|
| OSRS | ✓ Tick system | ✓ Polling Charter | ✓ "Protect Old School feel" |
| Linear | ✓ Sync Engine | ✓ Opinionated limits | ✓ "Linear Method" |
| Sigil | ✓ Physics | ✓ Constitution | ✗ Missing |

Without Intent, the Agent will optimize for the wrong outcome (efficiency over friction, speed over deliberation).

**The Fix:** Add the Soul Binder layer (partially implemented but not used):

```yaml
# sigil-mark/soul-binder/philosophy.yaml
intent:
  primary: "Protect user trust in high-stakes moments"
  secondary: "Enable power user efficiency without sacrificing newcomer safety"
  
  when_in_conflict:
    trust_vs_speed: trust_wins
    newcomer_vs_power_user: newcomer_safety_first
    marketing_vs_security: security_wins
```

---

## Part III: What's Good

Credit where due:

| Strength | Example |
|----------|---------|
| Core/Layout/Lens separation | Clean mental model, easy to explain |
| CriticalZone compound component | Well-structured API design |
| Constitution concept | Right principle, needs execution fix |
| Locked decisions | Good for stopping bikeshedding |
| Graceful degradation in readers | Defensive coding, never crashes on bad YAML |
| TypeScript types | Comprehensive, well-documented |
| State stream model | Clean abstraction for UI state |

---

## Part IV: Priority Fixes

### P0 — Fix Before Any Use

| Issue | Effort | Fix |
|-------|--------|-----|
| fs in browser crash | High | Make Process agent-only OR use Server Components |
| Philosophy in skills | Medium | Rewrite to match "sweat the art" philosophy |

### P1 — Fix Before Beta

| Issue | Effort | Fix |
|-------|--------|-----|
| Lens/Persona naming | Medium | Rename `lens-array/` to `personas/` |
| Path vs Layout zones | Low | Remove path-based claims from docs |
| Missing components | High | Implement InspectorOverlay, VibeSurvey |
| Document Process as agent-only | Low | Clarify runtime vs generation distinction |

### P2 — Fix Before Launch

| Issue | Effort | Fix |
|-------|--------|-----|
| User fluidity (persona in zone) | High | Add persona overrides per zone |
| Vocabulary layer | Medium | Add Rosetta Stone for term → material mapping |
| Remote soul config | High | Enable marketing-controlled vibe flags |
| Reduce skill verbosity | Medium | Remove ASCII art, use structured output |

### P3 — Fix for Scale

| Issue | Effort | Fix |
|-------|--------|-----|
| Observer over Pollster | High | Add intent tracking, replace polling |
| Philosophy/Intent layer | Medium | Document the "why" explicitly |
| Build/install story | Medium | Document monorepo, Next.js integration |
| Real enforcement | Very High | ESLint plugin, CI checks |

---

## Final Verdict

### Ratings

| Category | Grade | Notes |
|----------|-------|-------|
| **Architecture Design** | A- | Excellent separation of concerns |
| **TypeScript Quality** | A | Comprehensive types, good docs |
| **Runtime Implementation** | D | Fatal fs bug, missing components |
| **Agent Instructions** | C | Philosophy mismatch, verbosity |
| **Product Strategy** | C | Static world assumption |
| **Documentation** | B+ | Complete but contradictory |
| **Overall** | **C+** | Strong foundation, broken execution |

### The One-Sentence Summary

> You built a perfect engine for a static world. You need to build a responsive engine for a living market.

### What To Do Next

1. **Today:** Fix the fs-in-browser crash
2. **This Week:** Align skills with philosophy, resolve Lens/Persona naming
3. **This Sprint:** Make Process Layer agent-only, implement missing components
4. **Next Sprint:** Add persona fluidity, vocabulary layer, remote config

### The Path Forward

Sigil has the bones of something great. The Core/Layout/Lens architecture is sound. The Constitution concept is principled. The locked decisions prevent bikeshedding.

But it's built for a **closed system** (like a game console) when it needs to serve an **open market** (like a growth-stage product).

The fixes are tractable. The architecture doesn't need to be thrown out — it needs to be opened up:
- Personas that flow through zones (not locked to paths)
- Souls that can be tested (not locked to commits)
- Observation that drives evolution (not polls that preserve stasis)

Ship the P0 fixes. Then ship the P1 fixes. Then reassess.

---

*"Sweat the art. We handle the mechanics. Return to flow."*

*The art includes knowing your users are fluid, your market is living, and your soul must resonate — not just enforce.*
