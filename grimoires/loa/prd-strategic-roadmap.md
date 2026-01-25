# Strategic Roadmap: Sigil Framework Evolution

**Version**: 1.0.0
**Status**: Draft
**Created**: 2026-01-25
**Author**: Claude Opus 4.5

---

## Executive Summary

This document outlines the strategic roadmap for Sigil, addressing:
1. **Open GitHub Issues** - Prioritized backlog with dependencies
2. **Agentation Support** - Native agent infrastructure for mounted repositories
3. **Construct Distribution** - Packaging Sigil for the Loa Constructs registry

---

## 1. Current State Analysis

### 1.1 Open Issues Overview

| Issue | Title | Theme | Priority |
|-------|-------|-------|----------|
| #59 | User-Facing Changelog Generation | Observability | P2 |
| #58 | Cross-Conversation Feedback Synthesis | Observability | P1 |
| #40 | Dev Toolbar with User Lens + Agent Simulation | Tooling (parent) | P0 |
| #21 | Version Channels (blocked) | Distribution | P1 (blocked) |

### 1.2 Completed Foundation

- ✅ `@thehoneyjar/sigil-hud` package (v0.2.0)
- ✅ Loa Constructs integration (scripts complete)
- ✅ Physics rules system (24 rules files)
- ✅ Taste accumulation (signals, patterns)
- ✅ Observing users skill (Mom Test framework)

### 1.3 Blocked Dependencies

| Blocker | Upstream Issue | Impact |
|---------|----------------|--------|
| Constructs pack publishing | loa-constructs#12 | Can't distribute via registry |
| Channel API support | loa-constructs#13 | Can't switch develop/canary |

---

## 2. Proposed Themes

### Theme 1: Agentation Integration

**Vision**: Seamless visual feedback loop with [Agentation](https://agentation.dev).

Agentation is a visual feedback tool that lets users annotate UI elements and generate structured markdown with selectors that AI agents can grep directly. When Sigil is mounted, Agentation should be available as a companion tool.

**Integration approach** (KISS):
- Recommend Agentation installation in mount output
- Add Agentation skill via `npx add-skill benjitaylor/agentation`
- Document the `/agentation` command in Sigil docs
- Wire Agentation feedback into `/observe` workflow

### Theme 2: Observability Loop Closure

**Vision**: User feedback flows back into visible improvements.

The loop: Observe → Synthesize → Implement → Communicate
- #58 addresses Observe → Synthesize
- #59 addresses Implement → Communicate

### Theme 3: Developer Tooling

**Vision**: Debug as your users, simulate as your agents.

The Dev Toolbar (#40) enables:
- User Lens (read impersonation)
- Agent Simulation (write simulation)
- State comparison (diff view)
- Physics inspection (rule verification)

---

## 3. Strategic Priorities

### P0: Complete Dev Toolbar (#40)

**Why First**: This is the highest-impact developer experience improvement. It directly helps debug user issues and test agent behaviors.

**Current Status**: Parent issue open, HUD package published but needs full toolbar integration.

**Deliverables**:
1. `@thehoneyjar/sigil-dev-toolbar` package completion
2. User Lens with wagmi integration
3. Agent Simulation with fork state
4. Physics inspector panel

**Acceptance Criteria**:
- [ ] Drop-in component works with any wagmi app
- [ ] User Lens affects all read operations
- [ ] Simulation shows gas + state changes
- [ ] Physics panel shows active rules for focused component

---

### P1: Agentation Integration (New Feature)

**Why**: Visual UI feedback directly wired to AI agents. Users annotate issues, agents grep the exact selectors.

**What is Agentation?**
[Agentation](https://agentation.dev) is a visual feedback tool:
- Click UI elements → captures selectors, class names, positions
- Select text → highlights content issues
- Pause animations → annotate specific frames
- Generates markdown → paste into Claude Code

**Integration Plan** (KISS approach):

| Task | Effort | Deliverable |
|------|--------|-------------|
| Add skill to mount | Small | `npx add-skill benjitaylor/agentation` in mount script |
| Document in rules | Small | Add `/agentation` to command reference |
| Wire to /observe | Medium | Agentation output → observation capture |
| Add to HUD | Medium | Agentation trigger in Dev Toolbar |

**Implementation**:

1. **Mount Script Update**
```bash
# In mount-sigil.sh, after Sigil setup:
echo "Installing Agentation skill..."
npx add-skill benjitaylor/agentation
```

2. **React Integration Guide**
```tsx
import { Agentation } from "agentation"

// In app root (dev only)
{process.env.NODE_ENV === "development" && <Agentation />}
```

3. **Observation Bridge**
When Agentation generates feedback, wire it to `/observe`:
- Paste Agentation output → `/observe` parses selectors
- Links feedback to specific component code
- Stores in `grimoires/sigil/observations/`

---

### P1: Feedback Synthesis (#58)

**Why**: This closes the observation loop. Currently, each piece of feedback is analyzed in isolation.

**Deliverables**:
1. Semantic tagging for observations
2. Cross-reference on new feedback
3. Pattern detection with confidence scores
4. Synthesized insight generation

**Implementation Approach**:
- Store observations with embeddings (lightweight, local)
- On new feedback, query for semantic similarity
- Track "observation clusters" representing same underlying need
- Surface cluster size and confidence in `/observe` output

---

### P2: Changelog Generation (#59)

**Why**: This communicates improvements back to users in their language.

**Deliverables**:
1. Changelog entry schema
2. Commit → user-facing translation
3. Persona matching from observations
4. Multi-format output (Discord, blog, in-app)

**Implementation Approach**:
- `/changelog` skill that reads commits
- Classifies by user impact type
- Matches to personas from observation canvases
- Generates copy in appropriate voice

---

### P1 (Blocked): Version Channels (#21)

**Status**: Waiting on loa-constructs#12 and #13

**When Unblocked**:
- Test constructs installation end-to-end
- Simplify `/switch-channel` to use constructs API
- Remove git-based fallback once stable

---

## 4. Dependency Graph

```
┌──────────────────┐
│  Dev Toolbar     │ ◄── P0 (no blockers)
│  (#40)           │
└────────┬─────────┘
         │ enables
         ▼
┌──────────────────┐     ┌──────────────────┐
│  User Lens       │     │  Agentation      │
│  Agent Simulation│     │  Integration     │
└──────────────────┘     └────────┬─────────┘
                                  │ feeds into
                         ┌────────▼─────────┐
                         │  /observe        │
                         │  workflow        │
                         └────────┬─────────┘
                                  │ enables
┌──────────────────┐     ┌────────▼─────────┐
│  Feedback        │────►│  Changelog       │
│  Synthesis (#58) │     │  Generation (#59)│
└──────────────────┘     └──────────────────┘
    (P1)                      (P2)

┌──────────────────┐
│  loa-constructs  │
│  #12, #13        │
└────────┬─────────┘
         │ blocks
┌────────▼─────────┐
│  Version         │
│  Channels (#21)  │
└──────────────────┘
```

---

## 5. Sprint Plan Proposal

### Sprint 1: Dev Toolbar Completion

**Goal**: Close #40 with production-ready toolbar

**Tasks**:
- [ ] Complete wagmi integration for User Lens
- [ ] Add Agent Simulation panel with fork state
- [ ] Integrate Physics inspector
- [ ] Publish `@thehoneyjar/sigil-dev-toolbar` v1.0.0
- [ ] Update `23-sigil-hud.md` with full integration guide

### Sprint 2: Agentation Integration

**Goal**: Wire Agentation into Sigil mount and Dev Toolbar

**Tasks**:
- [ ] Update `mount-sigil.sh` to install Agentation skill
- [ ] Add Agentation toggle to `@thehoneyjar/sigil-hud`
- [ ] Create `/agentation parse` command for observation bridge
- [ ] Document React integration in Sigil rules
- [ ] Test end-to-end: annotate → observe → implement

### Sprint 3: Feedback Synthesis

**Goal**: Close #58 with cross-conversation pattern detection

**Tasks**:
- [ ] Design observation tagging schema
- [ ] Implement semantic similarity matching
- [ ] Build cluster detection logic
- [ ] Integrate with `/observe` output
- [ ] Add synthesis to taste.md signals

### Sprint 4: Changelog & Polish

**Goal**: Close #59, prepare for distribution

**Tasks**:
- [ ] Create `/changelog` skill
- [ ] Implement commit classification
- [ ] Add persona matching
- [ ] Generate multi-format output
- [ ] (If unblocked) Test constructs distribution

---

## 6. Agentation Integration Detail

### 6.1 What Agentation Provides

[Agentation](https://agentation.dev) is an external tool - we integrate, not rebuild.

| Feature | How It Works |
|---------|--------------|
| Element annotation | Click → captures selector, class names, position |
| Text selection | Highlight → content issue flagged |
| Animation pause | Freeze frame → annotate specific state |
| Markdown output | Copy → paste into Claude Code |

### 6.2 Integration Points

**1. Mount Script**
```bash
# mount-sigil.sh addition
if command -v npx &> /dev/null; then
  echo "📌 Installing Agentation skill..."
  npx add-skill benjitaylor/agentation 2>/dev/null || true
fi
```

**2. React Component (user adds)**
```tsx
import { Agentation } from "agentation"

function App() {
  return (
    <>
      <YourApp />
      {process.env.NODE_ENV === "development" && <Agentation />}
    </>
  )
}
```

**3. Dev Toolbar Integration**
Add Agentation toggle to `@thehoneyjar/sigil-hud`:
```tsx
// In HudPanel
<button onClick={() => window.__agentation?.toggle()}>
  📌 Annotate
</button>
```

### 6.3 Observation Bridge

When user pastes Agentation output, `/observe` can parse it:

```markdown
## Agentation Feedback

### Element: `.claim-button`
- **Selector**: `button.claim-button.bg-emerald-600`
- **Issue**: Button text unclear - "Claim" doesn't show amount
- **Position**: (245, 380)

### Text Selection: "Claim your rewards"
- **Issue**: Should show actual HENLO amount
```

The `/observe` skill:
1. Detects Agentation format (selector + issue pattern)
2. Greps codebase for selector
3. Links to specific component file
4. Stores observation with code reference

### 6.4 Commands

After Agentation skill is installed:

| Command | Action |
|---------|--------|
| `/agentation` | Auto-detect framework, wire up component |
| `/agentation parse` | Parse pasted Agentation output |
| `/agentation observe` | Parse + store as observation |

---

## 7. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Dev Toolbar adoption | 5 external repos | GitHub dependency graph |
| Agentation skill installs | 10 via Sigil mount | npx add-skill logs |
| Annotation → fix cycle | < 10 min | Time from annotate to PR |
| Feedback synthesis accuracy | 80% relevant matches | Manual review |
| Changelog user satisfaction | Positive Discord reactions | Reaction counts |
| Time to resolve user issues | 50% reduction | Support thread duration |

---

## 8. Open Questions

1. **Agentation integration depth?**
   - Minimal: Just install skill during mount
   - Medium: Add to HUD + parse in /observe
   - Deep: Full observation bridge + code linking
   - Recommendation: Medium (HUD toggle + observation parsing)

2. **Observation storage format?**
   - YAML frontmatter (current) vs SQLite (for querying)
   - Recommendation: Keep YAML for human readability, add index file for queries

3. **Construct registry timeline?**
   - If loa-constructs#12 stays blocked, consider alternative distribution
   - Could publish as npm workspace package in the meantime

4. **Changelog automation level?**
   - Full auto (every commit) vs manual trigger vs PR-based
   - Recommendation: PR-based with manual review before publish

---

## 9. Next Actions

1. **Immediate**: Review this roadmap with stakeholders
2. **This Week**: Start Sprint 1 (Dev Toolbar completion)
3. **Follow Up**: Check loa-constructs blockers status
4. **Design**: Create detailed agentation pack specification

---

*Document generated by Claude Opus 4.5*
*Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>*
