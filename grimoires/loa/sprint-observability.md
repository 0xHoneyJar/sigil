# Sprint Plan: Observability Loop

**Version**: 1.0.0
**Created**: 2026-01-25
**Duration**: 1-week sprints
**Focus**: Close the observation loop - from user feedback to visible improvements

---

## Overview

**Theme**: Observability Loop Closure

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Agentation  │────►│  /observe   │────►│  Synthesis  │────►│  Changelog  │
│ (annotate)  │     │  (capture)  │     │  (patterns) │     │ (communicate)│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
     Sprint 1            Sprint 1           Sprint 2            Sprint 3
```

**Goal**: Users annotate issues → Patterns emerge → Improvements communicated back

---

## Sprint 1: Agentation + Observation Capture

**Duration**: 1 week
**Goal**: Wire Agentation into Sigil; enhance `/observe` to parse annotations
**Issues**: #60, enhances #40

### Task 1.1: Install Agentation Skill on Mount

**Description**: Update `mount-sigil.sh` to install the Agentation Claude skill automatically.

**File**: `.claude/scripts/mount-sigil.sh`

**Implementation**:
```bash
# After Sigil setup completes
if command -v npx &> /dev/null; then
  echo ""
  echo "📌 Installing Agentation skill for visual feedback..."
  npx add-skill benjitaylor/agentation 2>/dev/null || echo "  (optional - install manually with: npx add-skill benjitaylor/agentation)"
fi
```

**Acceptance Criteria**:
- [ ] Mount script attempts Agentation skill install
- [ ] Failure is non-blocking (graceful fallback)
- [ ] Success message shown to user

**Effort**: S (1-2 hours)

---

### Task 1.2: Document Agentation in Sigil Rules

**Description**: Add Agentation integration documentation to the rules system.

**File**: `.claude/rules/24-sigil-agentation.md` (new)

**Content**:
```markdown
# Sigil: Agentation Integration

Visual feedback tool for AI agents. Annotate UI issues directly.

## Installation

Installed automatically during `/mount`. Manual install:
\`\`\`bash
npx add-skill benjitaylor/agentation
\`\`\`

## React Integration

\`\`\`tsx
import { Agentation } from "agentation"

function App() {
  return (
    <>
      <YourApp />
      {process.env.NODE_ENV === "development" && <Agentation />}
    </>
  )
}
\`\`\`

## Usage

1. Open app in browser
2. Activate Agentation (keyboard shortcut or via HUD)
3. Click elements to annotate issues
4. Copy markdown output
5. Paste into Claude Code
6. Use `/observe` to parse and store

## Observation Bridge

Paste Agentation output, then run:
\`\`\`
/observe parse
\`\`\`

This will:
- Parse selectors from annotations
- Grep codebase for matching elements
- Store as observation with code references
```

**Acceptance Criteria**:
- [ ] Rule file created with correct structure
- [ ] Installation instructions clear
- [ ] React integration documented
- [ ] `/observe parse` workflow documented

**Effort**: S (1-2 hours)

---

### Task 1.3: Add Agentation Toggle to HUD

**Description**: Add a button to the Sigil Dev Toolbar that toggles Agentation annotation mode.

**File**: `packages/hud/src/components/HudPanel.tsx`

**Implementation**:
```tsx
// Add to toolbar actions
const AgentationToggle = () => {
  const [active, setActive] = useState(false)

  const toggle = () => {
    // Check if Agentation is available
    if (typeof window !== 'undefined' && window.__agentation) {
      window.__agentation.toggle()
      setActive(!active)
    } else {
      console.warn('Agentation not installed. Run: npm install agentation')
    }
  }

  return (
    <button
      onClick={toggle}
      className={active ? 'bg-amber-500' : 'bg-gray-700'}
      title="Toggle Agentation annotations"
    >
      📌 {active ? 'Annotating' : 'Annotate'}
    </button>
  )
}
```

**Acceptance Criteria**:
- [ ] Button appears in HUD
- [ ] Clicking toggles Agentation state
- [ ] Visual indicator when active
- [ ] Graceful fallback if Agentation not installed

**Effort**: M (2-4 hours)

---

### Task 1.4: Create `/observe parse` Command

**Description**: Extend `/observe` to parse Agentation markdown output and extract structured data.

**File**: `.claude/skills/observing-users/agentation-parser.md` (new)

**Implementation**:

The parser detects Agentation format and extracts:
- Element selectors (CSS classes, IDs)
- Issue descriptions
- Position coordinates
- Text selections

**Output format** (stored in `grimoires/sigil/observations/`):
```yaml
---
timestamp: "2026-01-25T10:00:00Z"
source: agentation
type: ui-annotation
elements:
  - selector: "button.claim-button.bg-emerald-600"
    issue: "Button text unclear - doesn't show amount"
    position: { x: 245, y: 380 }
    code_ref: "src/components/ClaimButton.tsx:45"
text_selections:
  - text: "Claim your rewards"
    issue: "Should show actual HENLO amount"
---

## User Feedback

Button text unclear - "Claim" doesn't show amount.
Should show actual HENLO amount.
```

**Acceptance Criteria**:
- [ ] Parses Agentation markdown format
- [ ] Extracts selectors and issues
- [ ] Greps codebase for selector matches
- [ ] Stores structured observation
- [ ] Links to source code when found

**Effort**: M (3-5 hours)

---

### Task 1.5: Add User Lens to HUD

**Description**: Enable address impersonation for read operations in the Dev Toolbar.

**File**: `packages/hud/src/wagmi/UserLens.tsx`

**Implementation**:
```tsx
import { useHudStore } from '../store'

export function UserLensPanel() {
  const { impersonatedAddress, setImpersonatedAddress } = useHudStore()
  const [input, setInput] = useState('')

  const handleImpersonate = () => {
    if (isAddress(input)) {
      setImpersonatedAddress(input)
    }
  }

  const handleClear = () => {
    setImpersonatedAddress(null)
    setInput('')
  }

  return (
    <div className="p-4 space-y-3">
      <h3 className="font-medium">User Lens</h3>

      {impersonatedAddress && (
        <div className="bg-amber-500/20 p-2 rounded text-sm">
          Viewing as: {truncateAddress(impersonatedAddress)}
        </div>
      )}

      <input
        type="text"
        placeholder="0x..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full bg-gray-800 px-3 py-2 rounded"
      />

      <div className="flex gap-2">
        <button onClick={handleImpersonate}>View As</button>
        <button onClick={handleClear}>Clear</button>
      </div>
    </div>
  )
}
```

**Acceptance Criteria**:
- [ ] Address input with validation
- [ ] Visual indicator when impersonating
- [ ] Clear button to reset
- [ ] Persists in HUD store

**Effort**: M (3-4 hours)

---

### Task 1.6: Wire User Lens to Wagmi Hooks

**Description**: Create `useEffectiveAddress` hook that returns impersonated address when set.

**File**: `packages/hud/src/wagmi/useEffectiveAddress.ts`

**Implementation**:
```tsx
import { useAccount } from 'wagmi'
import { useHudStore } from '../store'

export function useEffectiveAddress() {
  const { address: realAddress } = useAccount()
  const { impersonatedAddress } = useHudStore()

  return {
    address: impersonatedAddress ?? realAddress,
    isImpersonating: !!impersonatedAddress,
    realAddress,
    impersonatedAddress,
  }
}
```

**Usage in consumer apps**:
```tsx
// Instead of useAccount()
const { address, isImpersonating } = useEffectiveAddress()

// All data fetching uses this address
const { data } = useReadContract({
  address: VAULT,
  functionName: 'balanceOf',
  args: [address], // Uses impersonated if set
})
```

**Acceptance Criteria**:
- [ ] Hook exported from `@thehoneyjar/sigil-hud/wagmi`
- [ ] Returns impersonated address when set
- [ ] Falls back to real wallet address
- [ ] Provides `isImpersonating` flag

**Effort**: S (1-2 hours)

---

### Sprint 1 Summary

| Task | Effort | Priority |
|------|--------|----------|
| 1.1 Mount script update | S | High |
| 1.2 Documentation | S | High |
| 1.3 HUD toggle | M | Medium |
| 1.4 /observe parse | M | High |
| 1.5 User Lens panel | M | Medium |
| 1.6 useEffectiveAddress | S | High |

**Total Effort**: ~2-3 days
**Deliverables**: Agentation installed on mount, observation parsing, User Lens in HUD

---

## Sprint 2: Feedback Synthesis

**Duration**: 1 week
**Goal**: Detect patterns across observations; surface related feedback
**Issue**: #58

### Task 2.1: Design Observation Index Schema

**Description**: Create an index file that tracks observations for fast querying.

**File**: `grimoires/sigil/observations/index.json`

**Schema**:
```json
{
  "version": "1.0.0",
  "observations": [
    {
      "id": "obs-2026-01-25-001",
      "timestamp": "2026-01-25T10:00:00Z",
      "source": "agentation",
      "tags": ["claim-button", "amount-visibility", "ux-clarity"],
      "theme": "reward-visibility",
      "file": "2026-01-25-claim-button.md"
    }
  ],
  "themes": {
    "reward-visibility": {
      "count": 4,
      "observations": ["obs-001", "obs-002", "obs-003", "obs-004"],
      "confidence": "HIGH"
    }
  }
}
```

**Acceptance Criteria**:
- [ ] Index schema defined
- [ ] New observations auto-indexed
- [ ] Theme clustering tracked
- [ ] Confidence calculated from count

**Effort**: M (2-3 hours)

---

### Task 2.2: Implement Semantic Tagging

**Description**: When storing observations, auto-generate semantic tags.

**Implementation**:
- Extract keywords from issue descriptions
- Map to known theme categories
- Suggest new themes when patterns emerge

**Tag Categories**:
```yaml
ux-clarity:
  - "unclear", "confusing", "doesn't show", "missing"

reward-visibility:
  - "claim", "rewards", "amount", "balance", "see"

mobile-experience:
  - "mobile", "scroll", "touch", "responsive"

performance:
  - "slow", "loading", "lag", "stuck"
```

**Acceptance Criteria**:
- [ ] Tags extracted from observation text
- [ ] Mapped to known categories
- [ ] Unknown tags flagged for review
- [ ] Tags stored in index

**Effort**: M (3-4 hours)

---

### Task 2.3: Build Cross-Reference Detection

**Description**: When new observation is added, check for related existing observations.

**Implementation**:
```typescript
function findRelatedObservations(newObs: Observation): RelatedResult[] {
  const index = loadIndex()
  const related: RelatedResult[] = []

  // 1. Tag overlap
  for (const tag of newObs.tags) {
    const matches = index.observations.filter(o =>
      o.id !== newObs.id && o.tags.includes(tag)
    )
    related.push(...matches.map(m => ({ obs: m, reason: `shared tag: ${tag}` })))
  }

  // 2. Theme match
  if (newObs.theme) {
    const themeObs = index.themes[newObs.theme]?.observations || []
    related.push(...themeObs.map(id => ({
      obs: index.observations.find(o => o.id === id)!,
      reason: `same theme: ${newObs.theme}`
    })))
  }

  // 3. Selector similarity (for Agentation)
  if (newObs.selector) {
    const selectorMatches = index.observations.filter(o =>
      o.selector && similarSelector(o.selector, newObs.selector)
    )
    related.push(...selectorMatches.map(m => ({
      obs: m,
      reason: 'similar UI element'
    })))
  }

  return dedupeByObsId(related)
}
```

**Acceptance Criteria**:
- [ ] Related observations found by tags
- [ ] Related observations found by theme
- [ ] Related observations found by selector
- [ ] Results deduplicated

**Effort**: M (3-4 hours)

---

### Task 2.4: Surface Patterns in /observe Output

**Description**: When `/observe` runs, show related feedback and pattern confidence.

**Output Format**:
```
┌─ Observation Stored ───────────────────────────────────────┐
│                                                            │
│  New: Claim button doesn't show amount                     │
│  Tags: claim-button, amount-visibility, ux-clarity         │
│                                                            │
│  Related observations (same theme: reward-visibility):     │
│  • 2026-01-24: "want to see number go up"                  │
│  • 2026-01-23: "need confirmation before claiming"         │
│  • 2026-01-22: "check and sweep workflow"                  │
│                                                            │
│  Pattern: 4 users → reward visibility before action        │
│  Confidence: HIGH                                          │
│                                                            │
│  Synthesized insight:                                      │
│  Users want to see claimable amounts prominently to:       │
│  - Decide if claiming is worth the gas                     │
│  - Get dopamine from watching growth                       │
│  - Efficiently manage multiple positions                   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria**:
- [ ] Related observations shown
- [ ] Pattern count displayed
- [ ] Confidence level calculated
- [ ] Synthesized insight generated

**Effort**: M (4-5 hours)

---

### Task 2.5: Add Synthesis to Taste Signals

**Description**: When patterns are detected, log to taste.md with synthesis metadata.

**Signal Format**:
```yaml
---
timestamp: "2026-01-25T10:00:00Z"
signal: OBSERVE
source: agentation
component:
  name: "ClaimButton"
  selector: ".claim-button"
synthesis:
  theme: "reward-visibility"
  related_count: 4
  confidence: "HIGH"
  insight: "Users want to see claimable amounts before action"
learning:
  recommendation: "Show amount in button text or tooltip"
---
```

**Acceptance Criteria**:
- [ ] OBSERVE signal type added
- [ ] Synthesis metadata included
- [ ] Insight captured for learning
- [ ] Recommendation generated

**Effort**: S (2-3 hours)

---

### Sprint 2 Summary

| Task | Effort | Priority |
|------|--------|----------|
| 2.1 Index schema | M | High |
| 2.2 Semantic tagging | M | High |
| 2.3 Cross-reference | M | High |
| 2.4 Pattern surfacing | M | High |
| 2.5 Taste integration | S | Medium |

**Total Effort**: ~3-4 days
**Deliverables**: Observation index, pattern detection, synthesized insights

---

## Sprint 3: Changelog Generation

**Duration**: 1 week
**Goal**: Translate implementations into user-facing changelogs
**Issue**: #59

### Task 3.1: Define Changelog Entry Schema

**Description**: Create schema for changelog entries that links to observations.

**File**: `grimoires/sigil/changelog/schema.yaml`

**Schema**:
```yaml
entry:
  id: string          # e.g., "changelog-2026-01-25-001"
  timestamp: datetime
  type: "feat" | "fix" | "improve" | "clarify"
  internal:
    commits: string[] # Git commit hashes
    description: string
  user_facing:
    headline: string  # Short, user-friendly
    detail: string    # Why this matters
    benefit: string   # What user gains
  persona_match: string # From observations
  feedback_ref: string  # Observation that requested this
```

**Acceptance Criteria**:
- [ ] Schema defined and documented
- [ ] Links to commits
- [ ] Links to observations
- [ ] Persona matching field

**Effort**: S (1-2 hours)

---

### Task 3.2: Create /changelog Skill

**Description**: Skill that reads commits and generates user-facing changelog entries.

**File**: `.claude/skills/changelog-generation/SKILL.md`

**Invocation**:
```bash
/changelog                           # From last release
/changelog --since v1.2.0            # From specific version
/changelog --commits a1b2c3..d4e5f6  # Specific range
/changelog --format discord          # Output format
```

**Workflow**:
1. Read commits in range
2. Classify by type (feat/fix/improve)
3. Match to observations if available
4. Generate user-facing copy
5. Output in requested format

**Acceptance Criteria**:
- [ ] Reads git commits
- [ ] Classifies commit types
- [ ] Matches to observations
- [ ] Generates user copy
- [ ] Multiple output formats

**Effort**: L (5-7 hours)

---

### Task 3.3: Implement Commit Classification

**Description**: Categorize commits by user impact.

**Classification Map**:
| Commit Pattern | User-Facing Type | Frame |
|----------------|------------------|-------|
| `feat:` | New | "New: You can now..." |
| `fix:` (UX) | Improved | "Improved: ..." |
| `fix:` (bug) | Fixed | "Fixed: ..." |
| `refactor:` | (usually skip) | Internal improvement |
| `docs:` | (usually skip) | Documentation |
| `chore:` | (always skip) | Internal |

**Acceptance Criteria**:
- [ ] Conventional commit parsing
- [ ] User impact categorization
- [ ] Skip internal-only changes
- [ ] Flag unclear commits for review

**Effort**: M (2-3 hours)

---

### Task 3.4: Implement Persona Matching

**Description**: Match changelog entries to observation personas.

**Implementation**:
```typescript
function matchPersona(entry: ChangelogEntry): string | null {
  // Check if entry addresses an observation
  if (entry.feedback_ref) {
    const obs = loadObservation(entry.feedback_ref)
    if (obs.persona) return obs.persona
  }

  // Infer from commit message keywords
  if (entry.internal.description.includes('mobile')) return 'mobile-user'
  if (entry.internal.description.includes('power')) return 'power-user'

  return 'general'
}
```

**Voice Adaptation**:
```yaml
power-user:
  tone: concise, technical OK
  example: "Claim button now shows amount"

casual:
  tone: friendly, explain benefits
  example: "See exactly how much you'll get before claiming"

mobile:
  tone: focus on mobile experience
  example: "Easier to claim on mobile with visible amounts"
```

**Acceptance Criteria**:
- [ ] Persona inferred from observations
- [ ] Voice adapted per persona
- [ ] Fallback to general voice

**Effort**: M (3-4 hours)

---

### Task 3.5: Generate Multi-Format Output

**Description**: Output changelogs in different formats.

**Formats**:

**Discord** (default):
```markdown
🍯 Kitchen Update

✨ New: See your claimable HENLO before clicking claim
📱 Improved: Cleaner mobile stats (less clutter, same info)
🔧 Fixed: Smooth scrolling on mobile kitchen view

Thanks to everyone who shared feedback! Keep it coming.
```

**Blog/Newsletter**:
```markdown
# What's New This Week

## Claim with Confidence
You asked, we listened! Now you can see exactly how much HENLO
you'll receive before clicking that claim button.

*Thanks to Adeitasuna and others who requested this!*

## Mobile Polish
We cleaned up the mobile header so stats are easier to read.
```

**In-App** (JSON):
```json
{
  "version": "1.2.3",
  "entries": [
    {
      "type": "feat",
      "headline": "See claimable amount before claiming",
      "detail": "The claim button now shows your HENLO amount"
    }
  ]
}
```

**Acceptance Criteria**:
- [ ] Discord format with emojis
- [ ] Blog format with prose
- [ ] JSON for in-app consumption
- [ ] Attribution when observation linked

**Effort**: M (3-4 hours)

---

### Task 3.6: Add Feedback Loop Tracking

**Description**: When changelogs are shared, track engagement for taste learning.

**Implementation**:
- Discord: Track reactions
- Blog: Track comments
- In-app: Track "dismiss" vs "read more"

**Taste Signal**:
```yaml
---
timestamp: "2026-01-25T12:00:00Z"
signal: CHANGELOG_ENGAGEMENT
format: discord
engagement:
  reactions: { "🔥": 5, "💯": 3, "❤️": 2 }
  replies: 2
entries:
  - id: "changelog-001"
    headline: "See claimable amount before claiming"
learning:
  inference: "Users respond well to 'you asked we listened' framing"
---
```

**Acceptance Criteria**:
- [ ] Track Discord reactions
- [ ] Store engagement in taste.md
- [ ] Learn which framing resonates

**Effort**: M (3-4 hours)

---

### Sprint 3 Summary

| Task | Effort | Priority |
|------|--------|----------|
| 3.1 Schema definition | S | High |
| 3.2 /changelog skill | L | High |
| 3.3 Commit classification | M | High |
| 3.4 Persona matching | M | Medium |
| 3.5 Multi-format output | M | High |
| 3.6 Feedback loop | M | Medium |

**Total Effort**: ~4-5 days
**Deliverables**: `/changelog` skill, persona matching, multi-format output

---

## Sprint 4: Integration & Polish

**Duration**: 1 week
**Goal**: End-to-end workflow validation; publish packages

### Task 4.1: End-to-End Test

**Description**: Validate full workflow: annotate → observe → synthesize → changelog

**Test Scenario**:
1. Mount Sigil on test repo
2. Add Agentation component
3. Annotate a UI issue
4. Paste into Claude Code
5. Run `/observe parse`
6. Verify pattern detection
7. Make fix, commit
8. Run `/changelog`
9. Verify user-facing output

**Acceptance Criteria**:
- [ ] Full workflow completes
- [ ] Each step produces expected output
- [ ] Edge cases handled

**Effort**: M (4-5 hours)

---

### Task 4.2: Publish Updated Packages

**Description**: Publish `@thehoneyjar/sigil-hud` v0.3.0 with new features

**Changelog**:
- User Lens panel with address impersonation
- Agentation toggle integration
- useEffectiveAddress hook

**Acceptance Criteria**:
- [ ] Package version bumped
- [ ] Changelog updated
- [ ] Published to npm
- [ ] GitHub release created

**Effort**: S (2-3 hours)

---

### Task 4.3: Update Documentation

**Description**: Update all relevant docs with new features

**Files to Update**:
- `README.md` - Add observability section
- `.claude/rules/23-sigil-hud.md` - Add User Lens
- `.claude/rules/24-sigil-agentation.md` - Full docs
- `packages/hud/README.md` - API docs

**Acceptance Criteria**:
- [ ] All docs reflect new features
- [ ] Examples work
- [ ] Installation clear

**Effort**: M (3-4 hours)

---

### Task 4.4: Create Demo/Walkthrough

**Description**: Create a video or GIF walkthrough of the observability loop

**Content**:
1. "User reports issue" (Discord screenshot)
2. "Open Agentation, annotate"
3. "Paste into Claude Code"
4. "/observe detects pattern"
5. "Fix and commit"
6. "/changelog generates announcement"
7. "Users see their feedback addressed"

**Acceptance Criteria**:
- [ ] Walkthrough created
- [ ] Added to README
- [ ] Shared in Discord

**Effort**: M (3-4 hours)

---

## Total Roadmap

| Sprint | Duration | Focus | Key Deliverable |
|--------|----------|-------|-----------------|
| 1 | 1 week | Agentation + Observation | Visual feedback capture |
| 2 | 1 week | Synthesis | Pattern detection |
| 3 | 1 week | Changelog | User communication |
| 4 | 1 week | Integration | End-to-end workflow |

**Total Duration**: 4 weeks
**Primary Outcome**: Complete observability loop from user feedback to visible improvements

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Agentation API changes | Low | Medium | Pin version, monitor releases |
| Pattern detection false positives | Medium | Low | Add confidence thresholds |
| Changelog voice mismatch | Medium | Medium | User review before publish |
| wagmi version conflicts | Low | High | Peer dependency ranges |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time: annotation → fix | < 15 min | Track in observations |
| Pattern detection accuracy | > 80% | Manual review sample |
| Changelog positive reactions | > 5 per post | Discord metrics |
| Observation → changelog link rate | > 50% | Index analysis |

---

*Document generated by Claude Opus 4.5*
*Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>*
