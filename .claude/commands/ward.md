---
name: "ward"
version: "1.1.0"
agent: "validating-physics"
description: |
  Protective barrier check against Sigil design physics.
  Reveals violations before they harm users.

  Checks: physics compliance, performance patterns,
  protected capabilities, material constraints,
  animation correctness, and taste alignment.

arguments:
  - name: "scope"
    type: "string"
    required: false
    description: "What to audit"
    default: "all"
    examples:
      - "all"
      - "physics"
      - "performance"
      - "protected"
      - "material"
      - "animation"
      - "file:src/components/ClaimButton.tsx"
  - name: "url"
    type: "string"
    required: false
    description: "URL for visual validation (enables runtime checks)"
    examples:
      - "http://localhost:3000"
      - "https://staging.example.com"
  - name: "scenario"
    type: "string"
    required: false
    description: "Web3 scenario (presence enables web3 mode)"
    examples:
      - "connected"
      - "whale"
      - "disconnected"
      - "empty"
      - "pending"
      - "error"
      - "arbitrum"
      - "base"
    notes: |
      When a scenario is provided, web3 mode is automatically enabled.
      The injection script mocks wallet state for wagmi/viem dApps.
      Custom scenarios can be defined in grimoires/sigil/web3.yaml.
  - name: "mode"
    type: "string"
    required: false
    description: "Web3 execution mode"
    default: "mock"
    options:
      - "mock"   # Full mocking, no network (default)
      - "fork"   # Real contract state from forked chain

context_files:
  - path: ".claude/rules/00-sigil-core.md"
    required: true
  - path: ".claude/rules/01-sigil-physics.md"
    required: true
  - path: ".claude/rules/04-sigil-protected.md"
    required: true
  - path: ".claude/rules/05-sigil-animation.md"
    required: true
  - path: ".claude/rules/07-sigil-material.md"
    required: true
  - path: ".claude/rules/08-sigil-lexicon.md"
    required: true
  - path: ".claude/rules/10-react-core.md"
    required: false
  - path: ".claude/rules/11-react-async.md"
    required: false
  - path: ".claude/rules/12-react-bundle.md"
    required: false
  - path: "grimoires/sigil/taste.md"
    required: false

outputs:
  - path: "grimoires/sigil/ward-report.md"
    type: "file"
    description: "Audit findings with severity and fix suggestions"

integrations: [ck, agent-browser]
---

# /ward

Protective barrier check — reveals physics violations before they harm users.

<philosophy>
## The Audit Philosophy

**An audit reveals the gap between intent and implementation.**

Code drifts from physics. A financial button might accidentally use optimistic sync. A high-frequency toggle might have unnecessary animation. Protected capabilities might hide behind loading states.

The audit doesn't judge — it reveals. Every finding is an opportunity to align implementation with intent.

**Severity Levels:**
| Level | Meaning | Action |
|-------|---------|--------|
| 🔴 CRITICAL | User harm possible | Fix immediately |
| 🟡 WARNING | Physics mismatch | Fix soon |
| 🟢 INFO | Optimization opportunity | Consider |
</philosophy>

<audit_categories>
## Audit Categories

### 1. Physics Audit
Check behavioral physics compliance for detected effect types.

**What it checks:**
- Sync strategy matches effect (pessimistic for financial/destructive)
- Timing values align with physics table
- Confirmation patterns present where required
- Rollback implemented for optimistic operations

**Effect detection heuristics:**
| Pattern | Inferred Effect |
|---------|-----------------|
| `claim`, `withdraw`, `transfer`, `stake`, `mint` in name | Financial |
| `Currency`, `Money`, `Wei`, `Balance` in types | Financial |
| `delete`, `remove`, `destroy`, `revoke` in name | Destructive |
| `archive`, `trash`, `dismiss` in name | Soft Delete |
| `onMutate` present | Optimistic (verify effect allows) |
| `toggle`, `expand`, `collapse` in name | Local State |

### 2. Performance Audit
Check React patterns from rules 10-16.

**What it checks:**
- Async waterfalls (sequential awaits)
- Barrel imports from heavy packages
- Missing Suspense boundaries
- Re-render issues (object deps, missing memo)
- Storage API without caching

**Known barrel-heavy packages:**
```
lucide-react, @mui/material, @mui/icons-material,
@tabler/icons-react, react-icons, @radix-ui/react-*,
lodash, date-fns, rxjs
```

### 3. Protected Audit
Check non-negotiable capabilities.

**What it checks:**
- Touch targets ≥ 44px
- Focus rings visible
- Cancel always reachable (not hidden during pending)
- Error recovery paths (not dead ends)
- Balance invalidation after financial mutations

**Visual checks (when URL provided):**
If a URL is provided, visual validation enhances protected checks:
- `ab_check_touch_targets()` — Runtime measurement of actual rendered sizes
- `ab_check_focus_rings()` — Keyboard navigation test for focus visibility
- Screenshot capture for material audit

See `.claude/protocols/browser-automation.md` for fallback behavior.

### 4. Material Audit
Check material physics constraints.

**What it checks:**
- Shadow layers ≤ 1
- Gradient stops ≤ 2
- Border radius ≤ 16px (except pills)
- Font weights ≤ 2 per component
- Font sizes ≤ 3 per component
- Contrast ratio ≥ 4.5:1

### 5. Animation Audit
Check animation physics compliance.

**What it checks:**
- High-frequency interactions have 0ms animation
- Financial/destructive use ease-out (not bouncy spring)
- Reduced motion respected (`prefers-reduced-motion`)
- SVGs wrapped for GPU acceleration
- No ease-in on UI elements

### 6. Taste Audit
Check alignment with learned preferences.

**What it checks:**
- Patterns with 3+ signals in taste.md
- Whether those patterns are applied in code
- Opportunities to codify recurring modifications
</audit_categories>

<workflow>
## Workflow

<step_1>
### Step 1: Discover Scope

**If scope is "all" or omitted:**
```
Glob: src/**/*.tsx, src/**/*.jsx
Exclude: *.test.*, *.spec.*, *.stories.*
```

**If scope is a category:**
Run only that category's checks.

**If scope is "file:path":**
Audit only that file across all categories.

Report scan scope:
```
Scanning [N] component files for Sigil compliance...
```
</step_1>

<step_2>
### Step 2: Run Detection Passes

For each file:

**2a. Effect Detection:**
Search for keywords in function/variable names:
- Financial: `claim|withdraw|deposit|transfer|swap|stake|mint|burn|send|pay`
- Destructive: `delete|remove|destroy|revoke|terminate|close`
- Soft Delete: `archive|trash|dismiss|hide`
- Standard: `save|update|create|like|follow|bookmark`
- Local: `toggle|switch|expand|collapse|select`

Search for type patterns:
- `Currency|Money|Balance|Wei|Token|BigInt` → Financial override

**2b. Physics Check:**
For detected effect, verify:
- Sync: Is `onMutate` present? (bad for financial)
- Timing: Check transition/duration values
- Confirmation: Is there a confirm step?

**2c. Performance Check:**
- Sequential `await` statements
- Barrel imports: `import { X } from 'package'`
- Missing Suspense around async components

**2d. Protected Check:**
- `{!isPending && <Cancel` pattern
- Missing `focus:ring` or `focus-visible`
- Error states without retry/back buttons
- Missing `invalidateQueries` after financial mutations

**2e. Material Check:**
- Count `shadow-` classes per component
- Count gradient color stops
- Check border-radius values

**2f. Animation Check:**
- `ease-in` usage (not ease-in-out)
- `<svg className="animate-` without wrapper
- Missing `prefers-reduced-motion` check

**2g. Visual Check (if URL provided):**

When a URL is provided, invoke the `agent-browser` skill for visual validation:

1. **Open URL**: `agent-browser open <url>`
2. **Snapshot interactive elements**: `agent-browser snapshot -i`
3. **Check touch targets**: Verify buttons/links have element refs, check computed sizes
4. **Test focus visibility**: Tab through interactive elements, verify focus rings
5. **Capture screenshot**: `agent-browser screenshot grimoires/sigil/observations/ward-$(date +%Y%m%d).png`
6. **Close browser**: `agent-browser close`

**Touch target verification:**
```bash
agent-browser snapshot -i --json | # Parse for button/link elements
# Check that interactive elements are ≥44px in rendered size
```

**Focus ring verification:**
```bash
agent-browser click @e1           # Focus first interactive element
agent-browser press Tab           # Tab through elements
agent-browser screenshot          # Capture to verify visible focus ring
```

Visual checks silently enhance findings when available. If browser unavailable, skip without error.

See `.claude/skills/agent-browser/SKILL.md` for full command reference.

**2h. Web3 Visual Check (if URL + scenario provided):**

When both a URL and a Web3 scenario are provided, enable Web3 mode:

1. **Load Scenario**:
   - Check built-in scenarios in `.claude/skills/web3-testing/resources/scenarios.yaml`
   - Check custom scenarios in `grimoires/sigil/web3.yaml`
   - Fall back to `connected` if scenario not found

2. **Generate Injection Script**:
   - Load template from `.claude/skills/web3-testing/resources/injection-script.js`
   - Replace `__SIGIL_MOCK_STATE_PLACEHOLDER__` with scenario state
   - If fork mode: Replace `__SIGIL_FORK_RPC_URL_PLACEHOLDER__` with fork RPC URL
   - If mock mode: Set to `null`

3. **Initialize Fork (if fork mode)**:
   - Detect fork provider: `./resources/fork-detector.sh`
   - If Tenderly: `./resources/tenderly-fork.sh create`
   - If Anvil: `./resources/anvil-fork.sh start`
   - Store fork RPC URL for injection

4. **Inject and Navigate**:
   ```bash
   # Use evaluateOnNewDocument for pre-hydration injection
   agent-browser open <url> --evaluate-on-new-document <injection-script>
   agent-browser wait --load networkidle
   ```

5. **Run Standard Visual Checks** (touch targets, focus rings, screenshot)

6. **Report Web3 Context**:
   ```
   ├─ Web3 Context ────────────────────────────────────────────┤
   │                                                           │
   │  Scenario: whale                                          │
   │  Mode: fork (Tenderly)                                    │
   │  Address: 0xf39F...2266                                   │
   │  Balance: 1000 ETH                                        │
   │  Chain: 1 (mainnet)                                       │
   │                                                           │
   ```

**UNIX Philosophy Syntax:**

Web3 mode is enabled implicitly when a scenario is provided:

```bash
# Mock mode (scenario implies web3)
/ward http://localhost:3000 connected

# Fork mode (explicit third arg)
/ward http://localhost:3000 whale fork

# Still works without web3
/ward http://localhost:3000
```
</step_2>

<step_3>
### Step 3: Collect Findings

Group by severity:

**🔴 CRITICAL (fix immediately):**
- Financial operation with optimistic sync
- Cancel hidden during pending
- Missing error recovery
- Focus ring missing on interactive element

**🟡 WARNING (fix soon):**
- Async waterfall
- Barrel import
- Wrong timing for effect
- Missing Suspense
- ease-in on UI element
- Missing reduced motion

**🟢 INFO (consider):**
- Shadow limit exceeded
- Taste pattern not applied
- Minor material constraint violation
</step_3>

<step_4>
### Step 4: Generate Report

```
┌─ Ward Report ─────────────────────────────────────────────┐
│                                                           │
│  Scanned:    [N] components                               │
│  Passed:     [M] ([%])                                    │
│  Critical:   [X]                                          │
│  Warnings:   [Y]                                          │
│  Info:       [Z]                                          │
│                                                           │
├─ Critical Issues ─────────────────────────────────────────┤
│                                                           │
│  🔴 [Category]: [Message]                                 │
│     File: [path]:[line]                                   │
│     Expected: [expected behavior]                         │
│     Found: [actual behavior]                              │
│     Fix: [how to fix]                                     │
│                                                           │
├─ Warnings ────────────────────────────────────────────────┤
│                                                           │
│  🟡 [Category]: [Message]                                 │
│     File: [path]:[line]                                   │
│     Fix: [how to fix]                                     │
│                                                           │
├─ Info ────────────────────────────────────────────────────┤
│                                                           │
│  🟢 [Category]: [Message]                                 │
│     Files: [list]                                         │
│                                                           │
├─ Recommendations ─────────────────────────────────────────┤
│                                                           │
│  1. [Priority action]                                     │
│  2. [Next action]                                         │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

Save full report to `grimoires/sigil/ward-report.md`.
</step_4>

<step_5>
### Step 5: Offer Fixes

After showing report:

> "Would you like me to fix any of these issues?"
>
> - Fix all critical issues
> - Fix specific issue by number
> - Generate fix plan
> - Skip

If user chooses to fix, use `/craft` in Refine mode.
</step_5>
</workflow>

<detection_patterns>
## Detection Patterns

### Financial Physics Violation

**Detect:**
```typescript
// VIOLATION: Financial with optimistic sync
const { mutate } = useMutation({
  mutationFn: () => claimRewards(amount),
  onMutate: async () => { // ← PROBLEM
    // optimistic update
  }
})
```

**Expected:**
```typescript
// CORRECT: Pessimistic sync
const { mutate } = useMutation({
  mutationFn: () => claimRewards(amount),
  // NO onMutate
  onSuccess: () => {
    queryClient.invalidateQueries(['balance'])
  }
})
```

### Protected Capability Violation

**Detect:**
```typescript
// VIOLATION: Cancel hidden
{!isPending && <CancelButton />}

// VIOLATION: No recovery
{isError && <p>Error</p>}
```

**Expected:**
```typescript
// CORRECT: Cancel always visible
<CancelButton disabled={false} />

// CORRECT: Recovery path
{isError && (
  <>
    <p>Error</p>
    <button onClick={retry}>Try again</button>
  </>
)}
```

### Async Waterfall

**Detect:**
```typescript
// VIOLATION: Sequential
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()
```

**Expected:**
```typescript
// CORRECT: Parallel
const [user, posts, comments] = await Promise.all([
  fetchUser(), fetchPosts(), fetchComments()
])
```

### Barrel Import

**Detect:**
```typescript
// VIOLATION
import { Check, X } from 'lucide-react'
```

**Expected:**
```typescript
// CORRECT
import Check from 'lucide-react/dist/esm/icons/check'
import X from 'lucide-react/dist/esm/icons/x'
```

### SVG Animation

**Detect:**
```typescript
// VIOLATION: No GPU acceleration
<svg className="animate-spin">
```

**Expected:**
```typescript
// CORRECT: Wrapped
<div className="animate-spin">
  <svg>
</div>
```
</detection_patterns>

<severity_reference>
## Severity Reference

| Issue | Severity | Why |
|-------|----------|-----|
| Financial + optimistic | 🔴 CRITICAL | Money can't roll back |
| Cancel hidden | 🔴 CRITICAL | User trapped |
| No error recovery | 🔴 CRITICAL | Dead end |
| Focus ring missing | 🔴 CRITICAL | Accessibility |
| Async waterfall | 🟡 WARNING | Performance |
| Barrel import | 🟡 WARNING | Bundle size |
| Wrong timing | 🟡 WARNING | Physics mismatch |
| Missing Suspense | 🟡 WARNING | UX blocked |
| ease-in on UI | 🟡 WARNING | Feels sluggish |
| No reduced motion | 🟡 WARNING | Accessibility |
| Shadow limit | 🟢 INFO | Material constraint |
| Taste not applied | 🟢 INFO | Opportunity |
</severity_reference>

<scope_options>
## Scope Options

| Scope | Checks |
|-------|--------|
| `all` | Everything |
| `physics` | Behavioral physics |
| `performance` | React patterns |
| `protected` | Protected capabilities |
| `material` | Material constraints |
| `animation` | Animation physics |
| `taste` | Taste alignment |
| `file:path` | Single file, all checks |
</scope_options>

<examples>
## Examples

### Full Audit

```
User: /rams

Scanning 47 component files for Sigil compliance...

┌─ Ward Report ─────────────────────────────────────────────┐
│                                                           │
│  Scanned:    47 components                                │
│  Passed:     39 (83%)                                     │
│  Critical:   2                                            │
│  Warnings:   5                                            │
│  Info:       3                                            │
│                                                           │
├─ Critical Issues ─────────────────────────────────────────┤
│                                                           │
│  🔴 Physics: Financial uses optimistic sync               │
│     File: src/components/ClaimButton.tsx:24               │
│     Expected: Pessimistic (no onMutate)                   │
│     Found: onMutate with optimistic update                │
│     Fix: Remove onMutate, add loading state               │
│                                                           │
│  🔴 Protected: Cancel hidden during pending               │
│     File: src/components/WithdrawModal.tsx:67             │
│     Expected: Cancel always visible                       │
│     Found: {!isPending && <CancelButton />}               │
│     Fix: Remove isPending condition                       │
│                                                           │
├─ Warnings ────────────────────────────────────────────────┤
│                                                           │
│  🟡 Performance: Async waterfall                          │
│     File: src/pages/Dashboard.tsx:15-22                   │
│     Fix: Use Promise.all()                                │
│                                                           │
│  🟡 Performance: Barrel import lucide-react               │
│     File: src/components/Header.tsx:3                     │
│     Fix: Import from dist/esm/icons/                      │
│                                                           │
│  🟡 Animation: Missing reduced motion                     │
│     Files: LoadingSpinner.tsx, ProgressBar.tsx            │
│     Fix: Add useReducedMotion check                       │
│                                                           │
├─ Info ────────────────────────────────────────────────────┤
│                                                           │
│  🟢 Material: 2 components exceed shadow limit            │
│  🟢 Taste: "faster financial timing" not applied          │
│                                                           │
├─ Recommendations ─────────────────────────────────────────┤
│                                                           │
│  1. Fix ClaimButton physics violation                     │
│  2. Fix WithdrawModal protected capability                │
│  3. Parallelize Dashboard fetching                        │
│                                                           │
└───────────────────────────────────────────────────────────┘

Would you like me to fix any of these issues?
```

### Focused Audit

```
User: /rams performance

Scanning for performance issues...

┌─ Performance Audit ───────────────────────────────────────┐
│                                                           │
│  🟡 Async waterfall: src/pages/Dashboard.tsx:15-22        │
│  🟡 Barrel import: src/components/Header.tsx:3            │
│  🟡 Barrel import: src/components/Sidebar.tsx:2           │
│  🟢 Missing Suspense: src/pages/Profile.tsx               │
│                                                           │
└───────────────────────────────────────────────────────────┘

Fix these? (y/n)
```

### Audit with Visual Validation

```
User: /ward http://localhost:3000

Scanning 47 component files for Sigil compliance...
Running visual checks on http://localhost:3000...

┌─ Ward Report ─────────────────────────────────────────────┐
│                                                           │
│  Scanned:    47 components                                │
│  Passed:     38 (81%)                                     │
│  Critical:   3                                            │
│  Warnings:   5                                            │
│  Info:       3                                            │
│                                                           │
├─ Critical Issues ─────────────────────────────────────────┤
│                                                           │
│  🔴 Protected: Touch target below 44px (visual check)    │
│     Element: .icon-btn                                    │
│     Found: 32x32px                                        │
│     Fix: Add min-h-[44px] min-w-[44px]                   │
│                                                           │
│  🔴 Protected: Focus ring not visible (visual check)     │
│     Element: button#submit                                │
│     Fix: Add focus:ring-2 focus:ring-offset-2            │
│                                                           │
│  🔴 Physics: Financial uses optimistic sync               │
│     File: src/components/ClaimButton.tsx:24               │
│     Fix: Remove onMutate                                  │
│                                                           │
├─ Attachments ─────────────────────────────────────────────┤
│                                                           │
│  Screenshot: grimoires/sigil/observations/ward-20260114.png │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### Single File Audit

```
User: /ward file:src/components/ClaimButton.tsx

Auditing ClaimButton.tsx...

┌─ File Audit: ClaimButton.tsx ─────────────────────────────┐
│                                                           │
│  Effect: Financial (keyword: "claim")                     │
│                                                           │
│  Physics:                                                 │
│  [✗] Sync: optimistic (should be pessimistic)             │
│  [✓] Timing: 800ms                                        │
│  [✓] Confirmation: present                                │
│                                                           │
│  Protected:                                               │
│  [✓] Touch target: 44px                                   │
│  [✓] Focus ring: visible                                  │
│  [✓] Cancel: always visible                               │
│  [✗] Balance: not invalidated                             │
│                                                           │
│  Animation:                                               │
│  [✓] Easing: ease-out                                     │
│  [✓] Reduced motion: respected                            │
│                                                           │
│  Issues: 2                                                │
│  🔴 Remove onMutate for pessimistic sync                  │
│  🟡 Add invalidateQueries(['balance'])                    │
│                                                           │
└───────────────────────────────────────────────────────────┘

Fix? (y/n)
```
</examples>

<when_to_use>
## When to Use /rams

**Good times:**
- Before a release
- After refactoring
- When onboarding to a codebase
- Periodic health checks
- After adding components

**Not for:**
- Generating new code → `/craft`
- Fixing a single known issue → Edit
- Understanding codebase → Explore agent
- Security audit → `/audit`
</when_to_use>

---

<user-request>
$ARGUMENTS
</user-request>
