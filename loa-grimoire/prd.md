# Sigil v2 Product Requirements Document

**Version**: 2.0
**Status**: Draft (Reality-Checked)
**Date**: 2026-01-01
**Author**: Discovery Interview
**Reality Check**: 2026-01-01 via /ride

> **Grounding Notice**: This PRD has been verified against code reality.
> Claims marked with [GROUNDED], [GHOST], or [VERIFIED] based on /ride analysis.

---

## 1. Problem Statement

When building UI with AI agents, design consistency breaks down because:

1. **No component visibility** - Can't see what components exist, hard to discover
2. **Design knowledge loss** - Why decisions were made gets lost over time
3. **Inconsistent patterns** - Same problems solved differently across codebase
4. **Onboarding friction** - New devs don't know what to use or why
5. **Agent-human context loss** - Claude lacks design context during implementation
6. **Single-developer drift** - Inconsistent patterns even with one developer

> Sources: Discovery interview Phase 1

---

## 2. Vision & Goals

### Vision

Sigil is a design context framework that gives AI agents the information they need to make consistent design decisions. It captures product "taste" and provides guardrails during implementation.

**Core Philosophy**: "Make the right path easy. Make the wrong path visible. Don't make the wrong path impossible."

### Goals

| Goal | Success Metric |
|------|----------------|
| Capture product taste | Moodboard with references, anti-patterns, feel descriptors |
| Define design rules | Rules by category (colors, typography, spacing, components) |
| Guide implementation | Claude uses design context automatically during /craft |
| Inherit existing patterns | /inherit produces draft moodboard + rules + inventory |
| Human accountability | All validation is human approval, not automated |

> Sources: Discovery interview Phase 2

---

## 3. User Personas

### Primary: Solo Developer (You)

- Building S&F with Claude Code
- Needs design consistency across sessions
- Has tacit knowledge about product feel that needs to be externalized
- Wants Claude to "just know" the design patterns

### Secondary: Claude Agent

- Implements components during Loa's /implement
- Needs design context injected automatically
- Should suggest recipes, not raw animation values
- Should warn about rejected patterns (but not refuse)

### Future: Designers & Stakeholders

- Non-technical people who need to validate product feel
- Browse design system without running the app
- (Deferred: Visual showcase)

> Sources: Discovery interview Phase 3

---

## 4. Functional Requirements

### 4.1 Command Workflow

```
/setup → /inherit (existing) or /envision (new)
                ↓
            /codify
                ↓
            /craft (guidance during implementation)
                ↓
            /approve (human sign-off)
```

### 4.2 Commands

| Command | Purpose | Output | Status |
|---------|---------|--------|--------|
| `/setup` | Initialize Sigil on a repo | sigil-mark/, .sigilrc.yaml, .sigil-setup-complete | [GROUNDED] Implemented |
| `/envision` | Create product moodboard | sigil-mark/moodboard.md | [GROUNDED] Implemented |
| `/codify` | Define design rules | sigil-mark/rules.md | [GHOST] Not implemented |
| `/craft` | Get design guidance during implementation | Context injection, Q&A | [GHOST] Not implemented |
| `/approve` | Human review and sign-off | Approval record in rules.md | [GHOST] Not implemented |
| `/inherit` | Bootstrap from existing codebase | Draft moodboard, rules, component inventory | [GROUNDED] Implemented |
| `/update` | Pull latest Sigil framework | Updated symlinks | [GROUNDED] Implemented |

> Sources: Discovery interview Phase 4

### 4.3 /setup Requirements

**Acceptance Criteria**:
- [ ] Creates sigil-mark/ directory with empty moodboard.md and rules.md
- [ ] Detects component directories (components/, app/components/, src/components/)
- [ ] Creates .sigil-setup-complete marker
- [ ] Creates .sigilrc.yaml with detected component paths

### 4.4 /envision Requirements

**Acceptance Criteria**:
- [ ] Interview captures: visual references, feel descriptors, reference products, anti-patterns
- [ ] Deep-dive follow-up questions for specifics
- [ ] Produces sigil-mark/moodboard.md with all captured context
- [ ] References products/games that inspire the feel
- [ ] Documents what to explicitly avoid

**Interview Questions**:
1. What apps/games inspire this product's feel?
2. What patterns should we explicitly avoid?
3. How should users feel at key moments?
4. Follow-up questions for each answer

### 4.5 /codify Requirements

**Acceptance Criteria**:
- [ ] Produces sigil-mark/rules.md organized by category
- [ ] Categories: Colors, Typography, Spacing, Components, Motion
- [ ] Rules can include: Tailwind tokens, component patterns, semantic constraints, code snippets
- [ ] Rules reference components by pattern (e.g., `*Button`, `*Modal`)
- [ ] Updates .sigilrc.yaml with zone definitions

**Rules Format**:
```markdown
## Colors
- Error backgrounds: `red-50` (light), `red-900/20` (dark)
- Success: `green-50` / `green-900/20`

## Motion
- Critical zones: deliberate (800ms+, spring 120/14)
- Marketing zones: playful (bouncy spring)

## Components
### *Button
- Always use rounded-lg
- Critical zone: requires confirmation animation
```

### 4.6 /craft Requirements

**Acceptance Criteria**:
- [ ] Provides design guidance during implementation (not full implementation)
- [ ] Auto-injects relevant design context from moodboard.md and rules.md
- [ ] Answers questions about design patterns
- [ ] Suggests recipes based on zone context
- [ ] Warns about rejected patterns (doesn't refuse)

### 4.7 /approve Requirements

**Acceptance Criteria**:
- [ ] Human review only - no automated validation
- [ ] Presents component/pattern for approval
- [ ] Records approval in rules.md with date and approver
- [ ] Simple graduation: approved or not approved

### 4.8 /inherit Requirements

**Acceptance Criteria**:
- [ ] Scans existing codebase for components
- [ ] Produces draft moodboard (inferred from existing patterns)
- [ ] Produces draft rules (extracted from code)
- [ ] Produces component inventory (list with basic metadata)
- [ ] Uses AskUserQuestion to gather tacit knowledge
- [ ] Asks about product feel, key decisions, what to avoid

### 4.9 /update Requirements

**Acceptance Criteria**:
- [ ] Fetches latest from Sigil repo
- [ ] Refreshes symlinks to skills and commands
- [ ] Updates .sigil-version.json
- [ ] Shows changelog

---

## 5. Technical Requirements

### 5.1 Architecture

- **Loa-style skills/scripts**: 3-level structure (index.yaml, SKILL.md, resources/)
- **Symlink mount**: Sigil repo at ~/.sigil/sigil, symlinks into .claude/
- **One-liner install**: `curl -fsSL https://raw.githubusercontent.com/.../mount-sigil.sh | bash`

### 5.2 State Zone

```
sigil-mark/
├── moodboard.md      # Product feel, references, anti-patterns
├── rules.md          # Design rules by category
└── inventory.md      # Component inventory (from /inherit)

.sigilrc.yaml         # Zone definitions, component paths
.sigil-setup-complete # Setup marker
.sigil-version.json   # Version tracking
```

### 5.3 Zones (Path-Based Context)

```yaml
# .sigilrc.yaml
version: "1.0"

component_paths:
  - "components/"
  - "app/components/"
  - "src/components/"

zones:
  critical:
    paths: ["src/features/checkout/**", "src/features/claim/**"]
    motion: "deliberate"
    patterns:
      prefer: ["deliberate entrance", "confirmation flow"]
      warn: ["instant transition", "playful bounce"]

  marketing:
    paths: ["src/features/marketing/**", "app/(marketing)/**"]
    motion: "playful"
    patterns:
      prefer: ["playful bounce", "attention grab"]

rejections:
  - pattern: "Spinner"
    reason: "Creates anxiety in critical zones"
    exceptions: ["admin/**"]
```

### 5.4 No JSDoc Tags

- Component metadata lives in rules.md, not in code
- Clean separation of code and design metadata
- Rules reference components by glob pattern (`*Button`, `Claim*`)

### 5.5 Scripts

| Script | Purpose |
|--------|---------|
| detect-components.sh | Find all React/Vue/Svelte components |
| parse-rules.sh | Parse design rules from sigil-mark/rules.md |

### 5.6 Framework Coexistence

- Sigil and Loa can coexist on the same repo
- Separate commands, skills, state zones
- No automatic cross-loading (developer decides when to reference)

---

## 6. Non-Functional Requirements

### 6.1 Technical Preferences

- Framework agnostic in principle, Next.js focused in practice
- Not just Tailwind - also CSS animations (Emil Kowalski style)
- Performance is a consideration for animation approaches

### 6.2 Recipes

- Sigil provides recipe examples/templates
- User adapts to their codebase
- Goal: centralize animation/timing strategically
- Leave room for exploration within constraints

---

## 7. Scope & Prioritization

### In Scope (MVP)

- [x] Mount and setup workflow
- [x] /envision moodboard capture with interview
- [x] /codify design rules with categories
- [x] /craft design guidance (not implementation)
- [x] /approve human review
- [x] /inherit for existing codebases
- [x] /update for framework updates
- [x] Zones (path-based context)
- [x] .sigilrc.yaml configuration

### Out of Scope (Deferred)

- [ ] Visual showcase (Next.js app) - later
- [ ] ESLint integration - later
- [ ] Sealed decisions (JSONL on merge) - later
- [ ] Local preview CLI - later
- [ ] GitHub Actions for review - later
- [ ] Chromatic integration - later

---

## 8. Risks & Dependencies

### Risks

| Risk | Mitigation |
|------|------------|
| Moodboard capture is too abstract | Interview asks for specific references and examples |
| Rules get out of sync with code | Human approval keeps humans in the loop |
| Zone configuration is complex | Start with simple zones, add complexity as needed |

### Dependencies

- Sigil repo exists at github.com/zksoju/sigil (or similar)
- S&F repo for first deployment
- yq for YAML parsing (optional, fallback to grep)

---

## 9. Success Criteria

### First Use Case (S&F)

1. Run `/inherit` on S&F to capture existing components
2. Run `/envision` to capture product feel from your head
3. Run `/codify` to define design rules
4. Tie into GTM plans for V2 to build required features

### Validation

- [ ] Claude uses design context during implementation
- [ ] Component patterns are consistent across the codebase
- [ ] New features follow established design rules
- [ ] Design knowledge is captured and retrievable

---

## 10. Command Summary

| Command | Verb | Purpose | Key Output |
|---------|------|---------|------------|
| `/setup` | - | Initialize Sigil | sigil-mark/, .sigilrc.yaml |
| `/envision` | envision | Capture product feel | moodboard.md |
| `/codify` | codify | Define design rules | rules.md |
| `/craft` | craft | Get design guidance | Context + Q&A |
| `/approve` | approve | Human sign-off | Approval record |
| `/inherit` | inherit | Bootstrap from existing | Draft moodboard, rules, inventory |
| `/update` | update | Pull latest framework | Updated symlinks |

---

## Appendix A: Interview Transcript Summary

**Problems identified**: No visibility, knowledge loss, inconsistent patterns, onboarding friction, agent-human context loss, single-developer drift.

**Agent context needed**: Component examples, design rules, rejection history, moodboard reference.

**Workflow**: envision → codify → craft → approve (iterate by creating new moodboard versions).

**Moodboard captures**: Visual references, feel descriptors, reference products, anti-patterns.

**Rules format**: By category (Colors, Typography, Spacing, Components, Motion).

**Graduation**: Human approval only - no automated checks.

**First use case**: /inherit on S&F, /envision for product feel, then V2 features.

---

## Appendix B: Reference Architecture (v5.1 Bundle)

The sigil-bundle context provides a more sophisticated v5.1 architecture that can be adopted later:

- **Zones**: Path-based context (adopted in MVP)
- **Recipes**: Choreography hooks like `useDeliberateEntrance` (deferred, user creates)
- **Sealed Decisions**: JSONL snapshots on PR merge (deferred)
- **ESLint Rules**: `prefer-recipes`, `no-rejected-patterns` (deferred)
- **Local Preview**: `sigil preview <file>` (deferred)
- **GitHub Actions**: `sigil-review.yml`, `sigil-seal.yml` (deferred)

The MVP focuses on core workflow; v5.1 features can be added incrementally.
