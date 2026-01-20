# Sigil Feedback Loops - Sprint Plan

```
    ╔═══════════════════════════════════════════════╗
    ║  ✦ SIGIL FEEDBACK LOOPS                       ║
    ║  Sprint Plan                                  ║
    ║                                               ║
    ║  Sprint Plan v1.0.0                           ║
    ╚═══════════════════════════════════════════════╝
```

**Version**: 1.0.0
**Created**: 2026-01-19
**Based On**: PRD v0.1.0, SDD v0.1.2
**Status**: Ready for Implementation
**Team Size**: Solo (1 developer)
**Sprint Duration**: 2 weeks per sprint

---

## Executive Summary

This sprint plan implements the Sigil Feedback Loops system across 4 phases, enabling Sigil to learn from real usage through diagnostic conversations, visual annotations, quality gates, and pattern synthesis.

**Total Implementation**: 4 sprints (8 weeks)

| Sprint | Phase | Focus | Complexity |
|--------|-------|-------|------------|
| 1 | Phase 1 | Interactive Diagnostic in /craft | Low |
| 2 | Phase 2a | Sigil Toolbar - Core Extension | High |
| 3 | Phase 2b + 3 | Toolbar Polish + Back Pressure Gates | Medium |
| 4 | Phase 4 | Taste Synthesis | Medium |

**Key Deliverables**:
- Enhanced /craft with diagnostic follow-up questions
- Browser extension for visual physics annotation
- Quality gates preventing physics violations before generation
- Pattern synthesis from accumulated feedback signals

---

## Sprint 1: Interactive Diagnostic (Phase 1)

**Goal**: Add Level 3 diagnostic follow-up after MODIFY/REJECT signals in /craft

**Duration**: Days 1-14

**Complexity**: Low (skill file modifications only)

### S1-01: Update crafting-physics SKILL.md

**ID**: S1-01
**Description**: Add Step 6b (Diagnostic Mode) to the crafting-physics skill
**Estimated Effort**: Medium (4-6 hours)
**Dependencies**: None

**Changes**:
1. Add diagnostic question flow after MODIFY/REJECT detection
2. Parse user responses for user_type, goal, expected_feel
3. Pass DiagnosticContext to Step 7 (logging)

**Acceptance Criteria**:
- [ ] Diagnostic questions appear after MODIFY feedback
- [ ] Diagnostic questions appear after REJECT feedback
- [ ] "Skip" option is clearly available and functional
- [ ] User can provide free-text goal descriptions
- [ ] Skipped diagnostics log with `skipped: true`

**File**: `.claude/skills/crafting-physics/SKILL.md`

---

### S1-02: Update sigil-taste Rule

**ID**: S1-02
**Description**: Update taste signal format to include diagnostic context
**Estimated Effort**: Low (2-3 hours)
**Dependencies**: S1-01

**Changes**:
1. Document new YAML frontmatter schema
2. Add DiagnosticContext section specification
3. Update Learning section format
4. Add source field (cli/toolbar/product)

**Acceptance Criteria**:
- [ ] Rule documents YAML frontmatter schema
- [ ] DiagnosticContext fields documented (user_type, goal, expected_feel, skipped)
- [ ] Example shows enhanced signal format
- [ ] Parser specification is clear

**File**: `.claude/rules/06-sigil-taste.md`

---

### S1-03: Create taste.md Parser Utility

**ID**: S1-03
**Description**: Create TypeScript utility for parsing structured taste.md
**Estimated Effort**: Low (2-3 hours)
**Dependencies**: S1-02

**Changes**:
1. Create `parseTasteMd()` function
2. Handle YAML frontmatter extraction
3. Handle malformed signals gracefully
4. Export types for TasteSignal interface

**Acceptance Criteria**:
- [ ] Parses valid YAML frontmatter signals
- [ ] Handles malformed YAML without crashing
- [ ] Parses multiple signals in single file
- [ ] Exports TypeScript types

**File**: `.claude/skills/crafting-physics/lib/taste-parser.ts` (or embedded in SKILL.md)

---

### S1-04: Add Learning Inference Logic

**ID**: S1-04
**Description**: Generate learning inferences from diagnostic context
**Estimated Effort**: Medium (3-4 hours)
**Dependencies**: S1-03

**Inference Rules**:
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

**Acceptance Criteria**:
- [ ] Inferences appear in taste.md Learning section
- [ ] Effect misclassification detection works
- [ ] User type + timing correlation works
- [ ] Goal keyword analysis works
- [ ] Recommendation field populated for actionable insights

---

### S1-05: Integration Testing

**ID**: S1-05
**Description**: End-to-end testing of diagnostic flow
**Estimated Effort**: Medium (3-4 hours)
**Dependencies**: S1-01 through S1-04

**Test Cases**:
1. `/craft "claim button"` → MODIFY "too slow" → Diagnostic questions → Enhanced taste.md
2. `/craft "delete button"` → REJECT → Diagnostic questions → Enhanced taste.md
3. `/craft "like button"` → ACCEPT → No diagnostic (just log)
4. Diagnostic with "skip" → taste.md has `skipped: true`
5. Diagnostic with full context → All fields populated

**Acceptance Criteria**:
- [ ] Diagnostic flow works for MODIFY signals
- [ ] Diagnostic flow works for REJECT signals
- [ ] ACCEPT signals skip diagnostic
- [ ] Skip option works correctly
- [ ] taste.md format matches schema
- [ ] Learning inferences are actionable

---

## Sprint 2: Sigil Toolbar Core (Phase 2a)

**Goal**: Build browser extension with physics detection, annotation, and Linear integration

**Duration**: Days 15-28

**Complexity**: High (new package, extension APIs, Linear integration)

### S2-01: Extension Scaffolding

**ID**: S2-01
**Description**: Create browser extension package with Manifest V3
**Estimated Effort**: Medium (4-6 hours)
**Dependencies**: None

**Setup**:
```bash
mkdir -p packages/sigil-toolbar
cd packages/sigil-toolbar
pnpm init
pnpm add -D vite @crxjs/vite-plugin preact
pnpm add zustand viem
```

**File Structure**:
```
packages/sigil-toolbar/
├── manifest.json           # Manifest V3
├── package.json
├── vite.config.ts
├── src/
│   ├── background/
│   ├── content/
│   ├── ui/
│   └── shared/
└── public/icons/
```

**Acceptance Criteria**:
- [ ] Extension loads in Chrome
- [ ] Basic toolbar renders on page
- [ ] HMR works in development
- [ ] Build produces distributable

**Files**: `packages/sigil-toolbar/*`

---

### S2-02: Physics Detector

**ID**: S2-02
**Description**: Implement physics detection from DOM elements
**Estimated Effort**: Medium (4-6 hours)
**Dependencies**: S2-01

**Features**:
1. Parse `data-sigil-physics` attribute
2. Infer timing from CSS transitions
3. Infer easing from animation properties
4. Handle malformed data gracefully

**Acceptance Criteria**:
- [ ] Detects physics from data attributes
- [ ] Falls back to CSS inference
- [ ] Handles malformed JSON
- [ ] Returns null for no detectable physics

**File**: `packages/sigil-toolbar/src/content/physics-detector.ts`

---

### S2-03: Violation Checker

**ID**: S2-03
**Description**: Check elements for physics violations
**Estimated Effort**: Medium (4-6 hours)
**Dependencies**: S2-02

**Violations to Check**:
- Touch target < 44px
- Missing focus ring
- Missing cancel button (Financial/Destructive)
- Protected capability violations

**Acceptance Criteria**:
- [ ] Detects touch targets below 44px
- [ ] Detects missing focus indicators
- [ ] Returns violation severity (error/warning)
- [ ] Provides fix recommendations

**File**: `packages/sigil-toolbar/src/content/violation-checker.ts`

---

### S2-04: Animation Inspector

**ID**: S2-04
**Description**: Pause/resume animations and inspect timing
**Estimated Effort**: Medium (3-4 hours)
**Dependencies**: S2-01

**Features**:
1. Use `document.getAnimations()` for performance
2. Pause all running animations
3. Resume only previously paused
4. Get element-specific animation state

**Acceptance Criteria**:
- [ ] Pauses all animations on page
- [ ] Resumes only paused animations
- [ ] Gets animation details for specific element
- [ ] Performance acceptable (< 100ms for 50 animations)

**File**: `packages/sigil-toolbar/src/content/animation-inspector.ts`

---

### S2-05: Protected Capabilities Auditor

**ID**: S2-05
**Description**: Scan page for protected capability compliance
**Estimated Effort**: Medium (4-6 hours)
**Dependencies**: S2-03

**Audits**:
- Cancel/escape hatch presence
- Cancel visibility during loading states
- Balance display staleness
- Error recovery paths
- Touch target sizes
- Focus ring visibility

**Acceptance Criteria**:
- [ ] Finds cancel buttons by text and attributes
- [ ] Detects hidden cancel during loading
- [ ] Checks focus rings safely (preventScroll)
- [ ] Returns audit results with status

**File**: `packages/sigil-toolbar/src/content/capability-auditor.ts`

---

### S2-06: Screenshot Capture

**ID**: S2-06
**Description**: Element-scoped screenshot capture with MV3 OffscreenDocument
**Estimated Effort**: High (6-8 hours)
**Dependencies**: S2-01

**Features**:
1. `chrome.tabs.captureVisibleTab` in background
2. MV3 OffscreenDocument for canvas cropping
3. devicePixelRatio scaling for HiDPI
4. 500KB size limit with compression
5. 7-day retention in chrome.storage.local

**Acceptance Criteria**:
- [ ] Captures element with 20px padding
- [ ] Correct scaling on HiDPI displays
- [ ] Compresses to under 500KB
- [ ] Stores with 7-day expiration
- [ ] Quota management with eviction

**Files**:
- `packages/sigil-toolbar/src/background/screenshot.ts`
- `packages/sigil-toolbar/offscreen.html`
- `packages/sigil-toolbar/offscreen.js`

---

### S2-07: Annotator Component

**ID**: S2-07
**Description**: Point-and-click annotation with context capture
**Estimated Effort**: High (6-8 hours)
**Dependencies**: S2-02, S2-06

**Features**:
1. Enable annotation mode with overlay
2. Click element to capture context
3. Capture physics, styles, screenshot
4. Show annotation modal with note input

**Acceptance Criteria**:
- [ ] Annotation mode highlights elements on hover
- [ ] Click captures element selector
- [ ] Physics detection runs on selected element
- [ ] Screenshot captured for element bounds
- [ ] Modal allows note input

**File**: `packages/sigil-toolbar/src/content/annotator.ts`

---

### S2-08: Toolbar UI

**ID**: S2-08
**Description**: Main toolbar component with all tool buttons
**Estimated Effort**: Medium (4-6 hours)
**Dependencies**: S2-02 through S2-07

**Buttons**:
- ⚡ Physics Detector
- 🎭 Animation Inspector
- ♿ Protected Capabilities Audit
- 📸 Screenshot
- 💬 Annotate
- ≡ Menu

**Acceptance Criteria**:
- [ ] Toolbar renders in corner of page
- [ ] Draggable positioning
- [ ] Keyboard shortcuts (configurable)
- [ ] All tools accessible
- [ ] Modals render correctly

**Files**: `packages/sigil-toolbar/src/ui/*`

---

### S2-09: Linear API Integration

**ID**: S2-09
**Description**: Submit annotations as Linear issues
**Estimated Effort**: Medium (4-6 hours)
**Dependencies**: S2-07

**Features**:
1. FeedbackRequest API contract
2. Annotation → Linear issue creation
3. Screenshot attachment upload
4. Issue URL returned to user

**Acceptance Criteria**:
- [ ] Validates FeedbackRequest before submission
- [ ] Creates Linear issue with physics context
- [ ] Attaches screenshot (resolved from ref)
- [ ] Returns issue URL to user
- [ ] Handles API errors gracefully

**File**: `packages/sigil-toolbar/src/background/linear-client.ts`

---

### S2-10: Extension Settings

**ID**: S2-10
**Description**: User-configurable settings via chrome.storage
**Estimated Effort**: Low (2-3 hours)
**Dependencies**: S2-01

**Settings**:
- Feedback API URL (configurable endpoint)
- Keyboard shortcuts
- Default position
- Enable/disable specific tools

**Acceptance Criteria**:
- [ ] Settings page accessible
- [ ] Settings persist across sessions
- [ ] Custom API endpoint works
- [ ] Keyboard shortcuts configurable

**File**: `packages/sigil-toolbar/src/background/settings-store.ts`

---

## Sprint 3: Toolbar Polish + Back Pressure (Phase 2b + 3)

**Goal**: Polish toolbar, add wallet support, implement /craft quality gates

**Duration**: Days 29-42

**Complexity**: Medium

### S3-01: Wallet Manager

**ID**: S3-01
**Description**: Agent wallet creation and management
**Estimated Effort**: High (6-8 hours)
**Dependencies**: Sprint 2 complete

**Features**:
1. Create agent wallet (generate keypair)
2. Encrypt private key with user password
3. Store salt/IV/iterations in encrypted data
4. Inject EIP-1193 provider into page

**Acceptance Criteria**:
- [ ] Can create new agent wallet
- [ ] Private key encrypted with password
- [ ] Decryption works with correct password
- [ ] Wallet address accessible for signing

**File**: `packages/sigil-toolbar/src/background/wallet-manager.ts`

---

### S3-02: Source Authentication

**ID**: S3-02
**Description**: Implement source-dependent authentication for /api/feedback
**Estimated Effort**: Medium (4-6 hours)
**Dependencies**: S3-01

**Authentication Matrix**:
- dApps: Wallet signature required
- Toolbar: Optional wallet signature
- CLI (loa): HMAC signature + timestamp

**Acceptance Criteria**:
- [ ] dApp sources require wallet
- [ ] Toolbar works with/without wallet
- [ ] CLI source rejected without valid HMAC
- [ ] Timestamps validated (5-minute window)

**Files**:
- Server-side: shared API handler
- CLI: `~/.config/loa/secret` generation

---

### S3-03: Pre-Detect Gate

**ID**: S3-03
**Description**: Add effect confidence check before analysis
**Estimated Effort**: Medium (3-4 hours)
**Dependencies**: Sprint 1 complete

**Gate Logic**:
1. Check if effect detection is confident
2. If ambiguous, ask max 2 clarifying questions
3. Check taste.md for 3+ similar MODIFY signals
4. Apply learned values automatically

**Acceptance Criteria**:
- [ ] Ambiguous effects trigger clarifying questions
- [ ] Max 2 questions asked
- [ ] Taste learning applied with 3+ signals
- [ ] Analysis shows "Adjusted per taste.md" when applicable

**File**: `.claude/skills/crafting-physics/SKILL.md` (Step 2b)

---

### S3-04: Pre-Generate Gate

**ID**: S3-04
**Description**: Check for conflicts before generating code
**Estimated Effort**: Low (2-3 hours)
**Dependencies**: S3-03

**Gate Logic**:
1. Check for recent REJECT (7 days) for similar component
2. Warn if conflict detected
3. Ensure protected capabilities prepared for Financial/Destructive

**Acceptance Criteria**:
- [ ] Recent REJECT triggers warning
- [ ] Warning shows rejection reason if available
- [ ] Protected capabilities listed for Financial/Destructive

**File**: `.claude/skills/crafting-physics/SKILL.md` (Step 3b)

---

### S3-05: Post-Generate Gate

**ID**: S3-05
**Description**: Validate generated code before showing to user
**Estimated Effort**: Medium (4-6 hours)
**Dependencies**: S3-04

**Validation Checks**:
| Check | Action |
|-------|--------|
| Touch target < 44px | Auto-fix |
| Missing focus ring | Auto-fix |
| Missing cancel (Financial) | Warn |
| Optimistic for Financial | Block |

**Acceptance Criteria**:
- [ ] Touch target auto-fixed with padding adjustment
- [ ] Focus ring auto-added if missing
- [ ] Missing cancel surfaced as warning
- [ ] Optimistic financial sync blocked
- [ ] Validation shown in analysis box

**File**: `.claude/skills/crafting-physics/SKILL.md` (Step 5b)

---

### S3-06: /ward-all Skill

**ID**: S3-06
**Description**: Batch validation across codebase components
**Estimated Effort**: Medium (4-6 hours)
**Dependencies**: S3-05

**Features**:
1. Scan component directories
2. Run validation checks on each
3. Generate summary report
4. List errors and warnings

**Acceptance Criteria**:
- [ ] Discovers components in standard locations
- [ ] Runs physics compliance checks
- [ ] Reports touch target violations
- [ ] Reports focus ring issues
- [ ] Summary shows pass/warn/error counts

**Files**:
- `.claude/skills/validating-physics/SKILL.md` (enhance existing)
- `.claude/commands/ward-all.md` (new command)

---

### S3-07: Integration Testing (Gates)

**ID**: S3-07
**Description**: Test all gates in /craft flow
**Estimated Effort**: Medium (3-4 hours)
**Dependencies**: S3-03 through S3-05

**Test Cases**:
1. Ambiguous effect → clarifying questions
2. 3+ MODIFY signals → learning applied
3. Recent REJECT → warning shown
4. Small touch target → auto-fixed
5. Financial optimistic → blocked

**Acceptance Criteria**:
- [ ] All gate trigger conditions work
- [ ] Auto-fixes apply correctly
- [ ] Blocks prevent invalid code
- [ ] Warnings don't block generation

---

## Sprint 4: Taste Synthesis (Phase 4)

**Goal**: Extract patterns from diagnostic signals and propose rule changes

**Duration**: Days 43-56

**Complexity**: Medium

### S4-01: /taste-synthesize Skill

**ID**: S4-01
**Description**: Create skill to analyze accumulated taste signals
**Estimated Effort**: High (6-8 hours)
**Dependencies**: Sprint 1 complete

**Features**:
1. Load and parse all taste.md signals
2. Filter to MODIFY/REJECT with diagnostic context
3. Group by user_type, goal keywords, expected_feel
4. Detect patterns with confidence levels

**Acceptance Criteria**:
- [ ] Parses taste.md correctly
- [ ] Groups signals by diagnostic fields
- [ ] Identifies timing patterns
- [ ] Identifies user segment patterns
- [ ] Assigns confidence (HIGH/MEDIUM/LOW)

**Files**:
- `.claude/skills/synthesizing-taste/index.yaml`
- `.claude/skills/synthesizing-taste/SKILL.md`
- `.claude/commands/taste-synthesize.md`

---

### S4-02: Pattern Detection Logic

**ID**: S4-02
**Description**: Implement pattern detection algorithms
**Estimated Effort**: Medium (4-6 hours)
**Dependencies**: S4-01

**Pattern Types**:
1. **Timing**: 3+ signals with same timing change
2. **User Segment**: 3+ signals with same user_type + similar change
3. **Effect Misclassification**: expected_feel differs by >1 tier
4. **Frequency**: goal contains "checking"/"status"

**Acceptance Criteria**:
- [ ] Timing patterns detected
- [ ] User segment patterns detected
- [ ] Effect misclassification detected
- [ ] High-frequency use cases identified
- [ ] Confidence levels accurate

---

### S4-03: Recommendation Generator

**ID**: S4-03
**Description**: Generate actionable recommendations from patterns
**Estimated Effort**: Medium (3-4 hours)
**Dependencies**: S4-02

**Output Format**:
```
Pattern: Mobile User Timing
Confidence: HIGH (5 signals)
Recommendation: Add mobile modifier to Financial physics
Target: .claude/rules/01-sigil-physics.md
```

**Acceptance Criteria**:
- [ ] Recommendations are specific
- [ ] Target rule file identified
- [ ] Proposed change is clear
- [ ] Signal count shown

---

### S4-04: /inscribe Integration

**ID**: S4-04
**Description**: Connect synthesis to inscription workflow
**Estimated Effort**: Medium (3-4 hours)
**Dependencies**: S4-03

**Features**:
1. Output synthesis as /inscribe candidates
2. Allow user to approve/skip/dismiss patterns
3. Track inscribed patterns to avoid re-proposing

**Acceptance Criteria**:
- [ ] High confidence patterns proposed for /inscribe
- [ ] User can approve, skip, or dismiss
- [ ] Inscribed patterns tracked
- [ ] Dismissed patterns not re-proposed

---

### S4-05: Synthesis Report UI

**ID**: S4-05
**Description**: Generate readable synthesis report
**Estimated Effort**: Low (2-3 hours)
**Dependencies**: S4-03

**Report Sections**:
1. Summary (signals analyzed, period)
2. High confidence patterns
3. Medium confidence patterns
4. Recommendations

**Acceptance Criteria**:
- [ ] Report is human-readable
- [ ] Patterns organized by confidence
- [ ] Clear action items for each pattern

---

### S4-06: Integration Testing (Synthesis)

**ID**: S4-06
**Description**: End-to-end synthesis testing
**Estimated Effort**: Medium (3-4 hours)
**Dependencies**: S4-01 through S4-05

**Test Cases**:
1. 5+ timing MODIFY signals → HIGH confidence pattern
2. 3 mobile user signals → User segment pattern
3. Mixed signals → Grouped correctly
4. /inscribe flow works from synthesis

**Acceptance Criteria**:
- [ ] Patterns detected from test signals
- [ ] Confidence levels correct
- [ ] Recommendations actionable
- [ ] /inscribe integration works

---

## File Changes Summary

### Sprint 1 (Phase 1)

| File | Change Type | Task |
|------|-------------|------|
| `.claude/skills/crafting-physics/SKILL.md` | Modify | S1-01 |
| `.claude/rules/06-sigil-taste.md` | Modify | S1-02 |

### Sprint 2 (Phase 2a)

| File | Change Type | Task |
|------|-------------|------|
| `packages/sigil-toolbar/` | Create | S2-01 |
| `packages/sigil-toolbar/manifest.json` | Create | S2-01 |
| `packages/sigil-toolbar/src/content/physics-detector.ts` | Create | S2-02 |
| `packages/sigil-toolbar/src/content/violation-checker.ts` | Create | S2-03 |
| `packages/sigil-toolbar/src/content/animation-inspector.ts` | Create | S2-04 |
| `packages/sigil-toolbar/src/content/capability-auditor.ts` | Create | S2-05 |
| `packages/sigil-toolbar/src/background/screenshot.ts` | Create | S2-06 |
| `packages/sigil-toolbar/offscreen.html` | Create | S2-06 |
| `packages/sigil-toolbar/src/content/annotator.ts` | Create | S2-07 |
| `packages/sigil-toolbar/src/ui/toolbar.tsx` | Create | S2-08 |
| `packages/sigil-toolbar/src/background/linear-client.ts` | Create | S2-09 |
| `packages/sigil-toolbar/src/background/settings-store.ts` | Create | S2-10 |

### Sprint 3 (Phase 2b + 3)

| File | Change Type | Task |
|------|-------------|------|
| `packages/sigil-toolbar/src/background/wallet-manager.ts` | Create | S3-01 |
| `.claude/skills/crafting-physics/SKILL.md` | Modify | S3-03, S3-04, S3-05 |
| `.claude/skills/validating-physics/SKILL.md` | Modify | S3-06 |
| `.claude/commands/ward-all.md` | Create | S3-06 |

### Sprint 4 (Phase 4)

| File | Change Type | Task |
|------|-------------|------|
| `.claude/skills/synthesizing-taste/index.yaml` | Create | S4-01 |
| `.claude/skills/synthesizing-taste/SKILL.md` | Create | S4-01 |
| `.claude/commands/taste-synthesize.md` | Create | S4-01 |

---

## Dependency Graph

```
Sprint 1 (Phase 1):
  S1-01 ──► S1-02 ──► S1-03 ──► S1-04 ──► S1-05

Sprint 2 (Phase 2a):
  S2-01 ─┬─► S2-02 ──► S2-03 ──► S2-05
         │           │
         │           └──────────────────┐
         ├─► S2-04                      │
         │                              ▼
         ├─► S2-06 ─────────────────► S2-07 ──► S2-08 ──► S2-09
         │                                              │
         └─► S2-10                                      │
                                                        ▼
                                                   [Sprint 2 Complete]

Sprint 3 (Phase 2b + 3):
  [Sprint 2] ──► S3-01 ──► S3-02

  [Sprint 1] ──► S3-03 ──► S3-04 ──► S3-05 ──► S3-06 ──► S3-07

Sprint 4 (Phase 4):
  [Sprint 1] ──► S4-01 ──► S4-02 ──► S4-03 ──► S4-04
                                          │
                                          └─► S4-05 ──► S4-06
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Diagnostic friction too high | Medium | High | Prominent skip option, track skip rate in metrics |
| Extension MV3 complexity | Medium | Medium | CRXJS handles most boilerplate |
| Screenshot cropping accuracy | Medium | Low | devicePixelRatio handling, manual crop fallback |
| Linear API rate limits | Low | Low | Exponential backoff, batch submissions |
| Pattern detection false positives | Medium | Low | Human approval required for /inscribe |
| Wallet encryption complexity | Low | High | Use proven Web Crypto APIs |

---

## Success Metrics

| Metric | Target | Sprint | Verification |
|--------|--------|--------|--------------|
| Diagnostic completion rate | > 50% | 1 | Users complete vs skip |
| Diagnostic triggers correctly | 100% | 1 | MODIFY/REJECT detection |
| Extension loads successfully | 100% | 2 | Chrome://extensions |
| Annotation → Linear issue | 100% | 2 | E2E test |
| Gate auto-fixes work | 100% | 3 | Touch target, focus ring tests |
| Pattern detection accuracy | > 80% | 4 | Manual review of patterns |
| Inscription rate | Monthly | 4 | Signals → rules (feedback loop closes) |

---

## Notes

### Phase 1 Priority

Phase 1 is the foundation. Without diagnostic context, later phases have less value. Focus on getting the diagnostic questions right and ensuring the taste.md schema is solid.

### Extension Architecture

The Manifest V3 OffscreenDocument pattern for screenshot cropping is non-obvious. The SDD provides full implementation detail in Section 4 (Phase 2).

### Gate Philosophy

From the PRD: "Respect craftsman agency, surface issues don't hide them." Gates warn but don't block except for critical violations (optimistic financial).

### Taste Synthesis Timing

Don't run synthesis until sufficient signals accumulate. The PRD suggests: "Manual synthesis initially (via /taste-synthesize). Evolve to weekly automated synthesis."

---

## Implementation Command

To start implementation:

```
/implement sprint-1
```

The implement command handles task state automatically.

---

```
    ╔═══════════════════════════════════════════════╗
    ║  SPRINT PLAN COMPLETE                         ║
    ║  Ready for /implement sprint-1                ║
    ╚═══════════════════════════════════════════════╝
```
