# /craft Examples

Comprehensive examples demonstrating all craft modes and physics applications.

## Example 1: New Component (Generate)

```
User: /craft "claim button for staking rewards"

┌─ Craft Analysis ───────────────────────────────────────┐
│  Target:       StakingClaimButton (new)                │
│  Craft Type:   Generate                                │
│  Effect:       Financial mutation                      │
│                                                        │
│  Behavioral    Pessimistic | 800ms | Confirmation      │
│  Animation     ease-out | 800ms | Non-interruptible   │
│  Material      Elevated | Soft shadow | 8px radius     │
│                                                        │
│  Output:       src/components/StakingClaimButton.tsx   │
│  Protected:    [✓] All capabilities included          │
└────────────────────────────────────────────────────────┘

Proceed? (y/n)

User: y

[Generates complete component]

Does this feel right? Think about your user in the moment of clicking.

User: feels a bit slow, our users claim multiple times a day

Ah, high-frequency financial action. Adjusting to 600ms — still
deliberate but respects their workflow.

[Applies adjustment, logs MODIFY with learning]
```

## Example 2: Theme Refinement (Configure)

```
User: /craft "improve light mode readability, the lines are hard to read"

┌─ Craft Analysis ───────────────────────────────────────┐
│  Target:       Theme configuration                     │
│  Craft Type:   Configure                               │
│  Issue:        Lines hard to read in light mode        │
│                                                        │
│  Material      Readability focus                       │
│  Changes:      - Border colors: increase contrast      │
│                - Text secondary: darken for legibility │
│                - Line elements: higher opacity         │
│                                                        │
│  Output:       Edit vocs.config.ts                     │
└────────────────────────────────────────────────────────┘

Proceed? (y/n)

User: y

[Edits config with improved contrast values]

Does this look right for your product's personality?

User: much better, but maybe a touch more contrast on the borders

[Increases border contrast, logs MODIFY]
```

## Example 3: Existing Code Polish (Refine)

```
User: /craft "refine hover states on the navigation, they feel inconsistent"

┌─ Craft Analysis ───────────────────────────────────────┐
│  Target:       Navigation hover states                 │
│  Craft Type:   Polish                                  │
│  Scope:        3 files: NavItem, NavGroup, NavHeader   │
│                                                        │
│  Animation     Hover: spring(500, 30), 150ms feel      │
│  Material      Hover: +5% brightness, subtle shadow    │
│                                                        │
│  Output:       Edit src/components/Nav*.tsx            │
└────────────────────────────────────────────────────────┘

Proceed? (y/n)

User: y

[Applies consistent hover physics across all 3 files]

Do these interactions feel cohesive now?

User: yes, much better

[Logs ACCEPT]
```

## Example 4: Data Pattern (Pattern)

```
User: /craft "optimize the loading state for the dashboard data"

┌─ Craft Analysis ───────────────────────────────────────┐
│  Target:       Dashboard loading pattern               │
│  Craft Type:   Pattern                                 │
│  Effect:       Query (optimistic, 150ms)               │
│                                                        │
│  Behavioral    Suspense boundary at data component     │
│  Animation     Skeleton with subtle pulse (1.5s)       │
│  Material      Skeleton matches card layout            │
│                                                        │
│  Output:       Edit src/components/Dashboard.tsx       │
│                Add src/components/DashboardSkeleton.tsx│
└────────────────────────────────────────────────────────┘

Proceed? (y/n)

User: y, but the skeleton should show the rough shape of the charts too

Good call — skeletal content should preview what's coming.

[Generates skeleton with chart placeholders, logs taste signal]
```

## Example 5: Quick Refinement (Compact Mode)

```
User: /craft "make the submit button snappier"

 SubmitButton | Standard | Refine
Animation: 200ms → 150ms, spring(600,30) | Material: unchanged

Apply? (y/n)

User: y

[Applies change]
```

## Example 6: Visual Verification with URL

```
User: /craft "claim button" http://localhost:3000/staking

┌─ Craft Analysis ───────────────────────────────────────┐
│  Target:       ClaimButton (new)                       │
│  Craft Type:   Generate                                │
│  Effect:       Financial mutation                      │
│  URL:          http://localhost:3000/staking           │
│                                                        │
│  Behavioral    Pessimistic | 800ms | Confirmation      │
│  Animation     ease-out | deliberate | no bounce       │
│  Material      Elevated | Soft shadow | 8px radius     │
│                                                        │
│  Output:       src/components/ClaimButton.tsx          │
│  Verify:       Visual check after generation           │
└────────────────────────────────────────────────────────┘

Proceed? (y/n)

User: y

[Generates component]

Running visual verification...
Opening http://localhost:3000/staking
Capturing screenshot...
Checking protected capabilities...
✓ Touch target: 48px (≥44px)
✓ Focus ring: visible

Screenshot saved: grimoires/sigil/observations/craft-ClaimButton-20260114.png

Here's the rendered component. Does this feel right?

User: yes, looks good

[Logs ACCEPT with screenshot reference]
```

## Example 7: Session Drift Warning

```
User: /craft "notification badge"

⚠ Session drift detected (9 distinct targets, 35% reject ratio).
Physics alignment may be degraded. Consider `/clear` to start fresh.
Continue anyway? (y/n)

User: continue

┌─ Craft Analysis ───────────────────────────────────────┐
│  Target:       NotificationBadge (new)                 │
│  Craft Type:   Generate                                │
│  Effect:       Local State                             │
│  Session:      ⚠ 9 targets | 35% rejects              │
│                                                        │
│  Behavioral    Immediate | 100ms | No confirmation     │
│  Animation     spring(700, 35) | snappy                │
│  Material      Elevated | Red accent | 4px radius      │
│                                                        │
│  Output:       src/components/NotificationBadge.tsx    │
└────────────────────────────────────────────────────────┘

Proceed? (y/n)

User: y

[Generates component, logs SESSION_OVERRIDE to taste.md]
```

## Example 8: Hammer Mode — Fresh Start

```
User: /craft "build rewards claiming feature"

[Scope Detection: Score = 4]
• "build" (+1)
• "feature" (+1)
• "claiming" implies contract interaction (+1)
• "rewards" implies financial (+1)

┌─ Scope Detection ─────────────────────────────────────────┐
│                                                           │
│  This looks like HAMMER work:                             │
│  • "build" — implementation keyword                       │
│  • "feature" — multi-component scope                      │
│  • "claiming" — contract interaction                      │
│  • "rewards" — financial domain                           │
│                                                           │
│  Full-stack implementation requires architecture.         │
│  I'll run the complete sequence:                          │
│                                                           │
│  1. /plan-and-analyze → Requirements (PRD)                │
│  2. /architect → Design (SDD)                             │
│  3. /sprint-plan → Tasks                                  │
│  4. Review plan                                           │
│  5. /run sprint-plan → Implementation                     │
│                                                           │
│  [Proceed with Hammer] [Chisel anyway (UI only)]          │
│                                                           │
└───────────────────────────────────────────────────────────┘

User: Proceed with Hammer

[Initializing hammer-state.json...]
[Aggregating Sigil context...]

Found 2 observations:
- @papa_flavio: "Can't see my claimable amount before clicking"
- @builder_dan: "Claim flow too slow for power users"

Found 3 taste patterns:
- Financial timing: 600ms preferred (3 MODIFY signals)
- Spring animations preferred

[Invoking /plan-and-analyze with seeded context...]

... [PRD interview/synthesis runs] ...

PRD complete: grimoires/loa/prd.md

[Invoking /architect...]

... [SDD design runs] ...

SDD complete: grimoires/loa/sdd.md

[Invoking /sprint-plan...]

... [Sprint planning runs] ...

Sprint complete: grimoires/loa/sprint.md

┌─ Hammer Plan Complete ────────────────────────────────────┐
│                                                           │
│  Feature: Rewards claiming feature                        │
│                                                           │
│  Artifacts:                                               │
│  • PRD: grimoires/loa/prd.md                             │
│  • SDD: grimoires/loa/sdd.md                             │
│  • Sprint: grimoires/loa/sprint.md                       │
│                                                           │
│  Components to implement:                                 │
│  1. [Backend] RewardsClaimed indexer handler              │
│  2. [Backend] GET /rewards/:address endpoint              │
│  3. [Frontend] useRewards hook                            │
│  4. [Frontend] RewardsList (standard physics)             │
│  5. [Frontend] ClaimButton (financial physics)            │
│                                                           │
│  ─────────────────────────────────────────────────────────│
│                                                           │
│  Ready to implement.                                      │
│  Review the artifacts above, then run:                    │
│                                                           │
│    /run sprint-plan                                       │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## Example 9: Hammer Mode — Existing Artifacts

```
User: /craft "implement notification system"

[Scope Detection: HAMMER (score = 3)]

[Checking existing artifacts...]

┌─ Existing Artifacts Detected ────────────────────────────┐
│                                                          │
│  PRD: grimoires/loa/prd.md (2 days old) ✓ relevant      │
│  SDD: grimoires/loa/sdd.md (2 days old) ✓ relevant      │
│                                                          │
│  Options:                                                │
│  1. Use existing → Skip to sprint planning               │
│  2. Regenerate PRD → Full sequence                       │
│  3. Regenerate SDD only → Keep PRD, redo architecture    │
│  4. Chisel anyway → UI only                              │
│                                                          │
└──────────────────────────────────────────────────────────┘

User: 1

[Using existing PRD and SDD...]
[Invoking /sprint-plan...]

... [Sprint planning runs] ...

┌─ Hammer Plan Complete ────────────────────────────────────┐
│  ...                                                      │
└───────────────────────────────────────────────────────────┘
```

## Example 10: User Chooses Chisel Anyway

```
User: /craft "build portfolio dashboard"

[Scope Detection: HAMMER (score = 2)]

┌─ Scope Detection ─────────────────────────────────────────┐
│                                                           │
│  This looks like HAMMER work:                             │
│  • "build" — implementation keyword                       │
│  • "dashboard" — multi-component scope                    │
│                                                           │
│  [Proceed with Hammer] [Chisel anyway (UI only)]          │
│                                                           │
└───────────────────────────────────────────────────────────┘

User: Chisel anyway

⚠ Proceeding chisel-only. Supporting infrastructure not included.

[Logging CHISEL_OVERRIDE to taste.md...]

┌─ Craft Analysis ───────────────────────────────────────┐
│  Target:       PortfolioDashboard (new)                │
│  Craft Type:   Generate                                │
│  Effect:       Query (data display)                    │
│  Note:         Chisel override — no backend/data layer │
│                                                        │
│  ...                                                   │
└────────────────────────────────────────────────────────┘

Proceed? (y/n)
```

## Example 11: Resume Interrupted Hammer Session

```
User: /craft "claim button"

[Checking hammer state...]

┌─ Hammer Mode In Progress ─────────────────────────────────┐
│                                                           │
│  Feature: "rewards claiming feature"                      │
│  Phase: sdd_complete                                      │
│  Started: 2 hours ago                                     │
│                                                           │
│  Options:                                                 │
│  1. Resume from current phase (sprint planning next)      │
│  2. Abandon and start fresh                               │
│  3. Switch to chisel mode for quick work                  │
│                                                           │
└───────────────────────────────────────────────────────────┘

User: 1

[Resuming hammer mode...]
[Invoking /sprint-plan...]

... [continues from where it left off] ...
```

## Example 12: Debug Mode — Deployment Issue

```
User: /craft "fix the docs deployment, build is failing"

[Mode Detection: DEBUG]
• "fix" — debug keyword
• "failing" — debug keyword
• "deployment" — deployment context

┌─ Mode: DEBUG ─────────────────────────────────────────────┐
│                                                           │
│  Detected: fix, failing, deployment                       │
│                                                           │
│  I'll investigate systematically:                         │
│  1. Reproduce the issue                                   │
│  2. Identify root cause                                   │
│  3. Propose fix                                           │
│  4. Verify resolution                                     │
│                                                           │
│  [Proceed] [Switch to Chisel] [Switch to Explore]         │
│                                                           │
└───────────────────────────────────────────────────────────┘

User: Proceed

┌─ Debug Analysis ───────────────────────────────────────────┐
│                                                            │
│  Issue: Docs deployment build failing                      │
│  Affected: Build pipeline, docs site                       │
│  Error: (checking build logs...)                           │
│                                                            │
│  Hypothesis: Configuration or dependency issue             │
│                                                            │
│  Investigation plan:                                       │
│  1. Check recent commits to docs config                    │
│  2. Review build logs for specific error                   │
│  3. Verify dependencies are up to date                     │
│                                                            │
│  Proceed with investigation? (y/n)                         │
│                                                            │
└────────────────────────────────────────────────────────────┘

User: y

[Reading build logs...]
[Checking vocs.config.ts...]
[Checking package.json...]

┌─ Root Cause Found ─────────────────────────────────────────┐
│                                                            │
│  Root cause: Invalid sidebar configuration                 │
│  Location: vocs.config.ts:47                               │
│  Evidence: Build error "Cannot read property of undefined" │
│                                                            │
│  Proposed fix:                                             │
│  Add null check for sidebar items                          │
│                                                            │
│  Apply fix? (y/n)                                          │
│                                                            │
└────────────────────────────────────────────────────────────┘

User: y

[Applies fix, verifies build passes]
[Logs DEBUG_RESOLVED to taste.md]
```

## Example 13: Explore Mode — Understanding Architecture

```
User: /craft "how does the auth flow work in this app?"

[Mode Detection: EXPLORE]
• "how does" — explore keyword
• "?" — question format

┌─ Mode: EXPLORE ───────────────────────────────────────────┐
│                                                           │
│  Detected: how does, question                             │
│                                                           │
│  I'll research thoroughly:                                │
│  1. Map the relevant code/systems                         │
│  2. Understand the architecture                           │
│  3. Document findings                                     │
│  4. Provide recommendations                               │
│                                                           │
│  [Proceed] [Switch to Debug] [Switch to Chisel]           │
│                                                           │
└───────────────────────────────────────────────────────────┘

User: Proceed

┌─ Explore Analysis ─────────────────────────────────────────┐
│                                                            │
│  Question: How does the auth flow work?                    │
│  Scope: Authentication system                              │
│                                                            │
│  Exploration plan:                                         │
│  1. Find auth-related files and entry points               │
│  2. Trace login/logout flow                                │
│  3. Identify session management approach                   │
│                                                            │
│  Proceed? (y/n)                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘

User: y

[Spawning Explore agent...]
[Mapping auth system...]

┌─ Exploration Complete ─────────────────────────────────────┐
│                                                            │
│  Question: How does the auth flow work?                    │
│                                                            │
│  Summary:                                                  │
│  The app uses NextAuth.js with JWT tokens stored in        │
│  httpOnly cookies. Sessions are validated server-side.     │
│                                                            │
│  Key findings:                                             │
│  • src/lib/auth.ts:12 — NextAuth configuration             │
│  • src/middleware.ts:8 — Route protection logic            │
│  • src/hooks/useAuth.ts:3 — Client-side auth hook          │
│                                                            │
│  Architecture notes:                                       │
│  JWT + server validation provides good security.           │
│  Protected routes defined in middleware matcher.           │
│                                                            │
│  Recommendations:                                          │
│  Consider adding refresh token rotation for long sessions. │
│                                                            │
└────────────────────────────────────────────────────────────┘

[Logs EXPLORE_COMPLETE to taste.md]
```

## Example 14: Debug Mode — Can't Identify Root Cause

```
User: /craft "debug the intermittent crash on mobile"

[Mode Detection: DEBUG]

... [investigation proceeds] ...

┌─ Investigation Blocked ───────────────────────────────────────┐
│                                                               │
│  I've checked crash logs, recent changes, and device-specific │
│  code but can't identify the root cause. The issue might      │
│  require:                                                     │
│                                                               │
│  • More context about reproduction steps                      │
│  • Access to device-specific crash reports                    │
│  • Real device testing (not simulator)                        │
│                                                               │
│  What I've learned so far:                                    │
│  - Crash only occurs on iOS 16+                               │
│  - Related to animation timing                                │
│  - Memory pressure may be a factor                            │
│                                                               │
│  [Provide more context] [Try different approach] [Stop here]  │
│                                                               │
└───────────────────────────────────────────────────────────────┘

User: The crash happens when scrolling fast through a long list

[Updates hypothesis with new information...]
[Continues investigation...]
```

## Example 15: Debug → Hammer Escalation (Context Preservation)

```
User: /craft "fix the rewards not showing up"

[Mode Detection: DEBUG]

┌─ Debug Analysis ───────────────────────────────────────────┐
│                                                            │
│  Issue: Rewards not displaying                             │
│  Affected: RewardsList component                           │
│                                                            │
│  Investigation plan:                                       │
│  1. Check RewardsList component                            │
│  2. Trace data fetching                                    │
│  3. Verify API endpoint                                    │
│                                                            │
└────────────────────────────────────────────────────────────┘

User: y

[Investigating...]
[Reading RewardsList.tsx - no issues found]
[Tracing to useRewards hook - calls /api/rewards]
[Checking /api/rewards - endpoint doesn't exist]
[Checking indexer - RewardsClaimed event not indexed]
[Checking contract - event exists but no handler]

┌─ Scope Check ──────────────────────────────────────────────────┐
│                                                                │
│  Investigation scope has grown:                                │
│  • Files examined: 7                                           │
│  • Systems involved: Frontend, API, Indexer, Contract          │
│  • Root cause type: ARCHITECTURE (missing infrastructure)      │
│                                                                │
│  The rewards feature is incomplete:                            │
│  - Contract emits RewardsClaimed event ✓                       │
│  - Indexer handler: MISSING                                    │
│  - API endpoint: MISSING                                       │
│  - Frontend hook: calls non-existent API                       │
│                                                                │
│  This requires Hammer mode (full-stack implementation).        │
│                                                                │
│  Options:                                                      │
│  1. Continue debugging (won't help — infrastructure missing)   │
│  2. Escalate to Hammer (preserve findings, plan architecture)  │
│  3. Document and stop (hand off to human)                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘

User: 2

[Checkpointing findings to grimoires/sigil/craft-state.md...]

## 2026-01-19 14:32 | INVESTIGATION_CHECKPOINT

### Context
Mode: Debug
Original request: "fix the rewards not showing up"

### Findings So Far
- ${PROJECT_ROOT}/src/components/RewardsList.tsx:45 — Component OK
- ${PROJECT_ROOT}/src/hooks/useRewards.ts:12 — Calls /api/rewards (404)
- ${PROJECT_ROOT}/contracts/Rewards.sol:89 — RewardsClaimed event exists
- MISSING: Indexer handler for RewardsClaimed
- MISSING: API endpoint GET /api/rewards/:address

### Hypothesis
Rewards feature was partially implemented. Frontend exists but
backend infrastructure (indexer + API) was never built.

### Escalation Reason
Missing infrastructure — not a bug, needs full-stack implementation.

### Recommended Next Mode
Hammer

### Seed Context for Next Mode
- Need RewardsClaimed indexer handler
- Need GET /rewards/:address endpoint
- Frontend useRewards hook ready to consume
---

[Logged DEBUG_ESCALATED to taste.md]

┌─ Escalating to Hammer Mode ─────────────────────────────────┐
│                                                             │
│  Findings preserved: grimoires/sigil/craft-state.md        │
│                                                             │
│  Key discoveries:                                           │
│  • Frontend exists, backend missing                         │
│  • Need: Indexer handler + API endpoint                     │
│  • Contract event already deployed                          │
│                                                             │
│  These findings will seed /plan-and-analyze.               │
│                                                             │
│  Proceed with Hammer sequence? (y/n)                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

User: y

[Seeding /plan-and-analyze with checkpoint context...]
[Invoking /plan-and-analyze...]

... [Hammer sequence continues with investigation findings pre-loaded] ...
```

This example shows how Debug mode detects that a "bug" is actually missing
infrastructure, checkpoints findings before context is exhausted, and
hands off cleanly to Hammer mode with full context preserved.

## Example 16: Craft with Experiment Context

```
User: /craft "RewardsDisplay" --experiment EXP-001

[Reading experiment EXP-001-rewards-visibility.md...]

┌─ Craft Analysis ───────────────────────────────────────┐
│  Target:       RewardsDisplay (new)                    │
│  Craft Type:   Generate                                │
│  Effect:       Query (data display)                    │
│                                                        │
│  Experiment:   EXP-001: Rewards Visibility             │
│                Hypothesis: Delta display → confidence  │
│                Addressing: alice (trust-checker)       │
│                                                        │
│  From experiment "What We're Changing":                │
│  • Add "+X since last" delta indicator                 │
│  • Add trend arrow (↑/↓/→)                             │
│  • Subtle pulse on value increase                      │
│                                                        │
│  Behavioral    Optimistic | 150ms | No confirmation    │
│  Animation     spring(500) | pulse on change           │
│  Material      Elevated | Soft shadow | 8px radius     │
│                                                        │
│  Output:       src/components/RewardsDisplay.tsx       │
│  Protected:    [✓] Balance always accurate            │
└────────────────────────────────────────────────────────┘

Proceed? (y/n)

User: y

[Generates component with delta indicator, trend arrow, pulse animation]

Does this feel right for your trust-checker users?

User: looks good, the trend arrow is helpful

[Logs ACCEPT with Experiment: EXP-001]
[Updates EXP-001-rewards-visibility.md Craft Sessions table:]

| Date | Component | Session ID | Signal |
|------|-----------|------------|--------|
| 2026-01-19 | RewardsDisplay | 2026-01-19T14:32:00Z | ACCEPT |
```

This example shows how experiment context informs the craft — the physics
adjustments from "What We're Changing" are applied, and the craft session
is linked back to the experiment for tracking.
