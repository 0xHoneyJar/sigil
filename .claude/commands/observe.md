# /observe Command

Capture user feedback as structured diagnostic observations OR perform blockchain state inspection for debugging.

---

## Purpose

Two modes:
1. **Feedback Mode** - Transform raw user feedback into structured observations that inform design physics decisions
2. **Diagnose Mode** - Inspect on-chain state to verify data source correctness in web3 components

---

## Usage

```
# Feedback mode
/observe "<user-quote>" [options]

# Diagnose mode (web3 debugging)
/observe diagnose [ComponentName]

# Parse Agentation output (visual annotations)
/observe parse
```

### Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `user-quote` | Direct quote from user feedback | "Im planning some henlo burns so gud to know how much im receiving" |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--user NAME` | Username/handle of the person | anonymous |
| `--channel SOURCE` | Where feedback came from | direct |
| `--existing FILE` | Add to existing diagnostic file | creates new |

---

## What It Does

1. **Parses** the user quote for behavioral signals
2. **Creates** a diagnostic file in `grimoires/sigil/observations/`
3. **Generates** Level 3 diagnostic questions (Mom Test style)
4. **Tracks** hypothesis space for gap classification
5. **Links** to `/craft` workflow when UI work is needed

---

## The Level 3 Diagnostic Framework

Most feedback stops at Level 1 (what they said) or Level 2 (what they want). Level 3 asks: **What are they trying to accomplish?**

| Level | Question | Example |
|-------|----------|---------|
| Level 1 | What did they say? | "Rewards aren't updating" |
| Level 2 | What do they want? | "I want to see my rewards" |
| Level 3 | What are they trying to accomplish? | "I need to decide when to burn based on accumulation" |

Level 3 reveals whether the gap is:
- **Bug**: Feature exists but broken
- **Discoverability**: Feature exists but not found
- **Feature**: Capability doesn't exist yet

---

## Output Structure

Creates `grimoires/sigil/observations/{username}-diagnostic.md`:

```markdown
# {Username} Diagnostic Log

## User Profile

| Field | Value |
|-------|-------|
| **Type** | [Decision-maker/Builder/Trust-checker/Casual] |
| **Behavior** | [Observed behavior pattern] |
| **Stakes** | [What's at risk for them] |
| **Engagement** | [High/Medium/Low + evidence] |

---

## Level 3 Diagnostic

### Initial Report
> "{Original quote}"

### Goal (Level 3)
**What are they trying to accomplish?**
- [Inferred goal from quote]

### Questions to Ask

- [ ] "[Diagnostic question 1]"
- [ ] "[Diagnostic question 2]"

### Responses

*(Awaiting responses)*

---

## What We're Trying to Learn

| Question | What it reveals |
|----------|-----------------|
| [Question] | [What we learn from the answer] |

---

## Hypothesis Space

| If they say... | Gap type | Action |
|----------------|----------|--------|
| "[Response A]" | Feature | [Action] |
| "[Response B]" | Bug | [Action] |
| "[Response C]" | Discoverability | [Action] |

---

## Timeline

| Date | Event |
|------|-------|
| {today} | Initial report captured |
| {today} | Diagnostic questions queued |
| | *(awaiting responses)* |

---

## Next Steps

1. Get answers to diagnostic questions
2. Classify gap type
3. Mark diagnostic as `status: validated`
4. Create experiment → `/observe` prompts for EXP-XXX creation
5. If UI work needed → `/craft --experiment EXP-XXX`
6. Update `user-insights.md` with confirmed findings

---

## Experiment Link (after validation)

*Filled in when experiment is created from this observation*

| Experiment | Status | Outcome |
|------------|--------|---------|
| *none yet* | | |
```

---

## Examples

### Basic observation
```
/observe "Im planning some henlo burns so gud to know how much im receiving" --user papa_flavio
```

### With channel
```
/observe "the claim button doesn't show my rewards" --user alice --channel discord
```

### Adding to existing diagnostic
```
/observe "ah I track it in a spreadsheet actually" --user papa_flavio --existing papa_flavio-diagnostic.md
```

---

## User Type Classification

| Type | Signals | Physics Implications |
|------|---------|---------------------|
| **Decision-maker** | Planning actions, checking data for decisions | Needs accuracy, timing matters |
| **Builder-minded** | Thinks about implementation, reports technical details | Tolerates complexity, values transparency |
| **Trust-checker** | Frequent checks "just to make sure" | Needs confidence signals, timestamps |
| **Casual** | Uses occasionally, basic needs | Needs simplicity, clear feedback |

---

## Integration with Taste System

Observations feed into the taste system differently than `/craft` signals:

| Source | What it captures | File |
|--------|------------------|------|
| `/craft` diagnostic | Developer's feel preferences | `taste.md` |
| `/observe` | Actual user behavior and gaps | `observations/*.md` |
| Toolbar | End-user preferences in-product | `taste.md` |

When running `/craft`, check observations for:
- User types that inform physics (power-user vs first-time)
- Gap classifications that prioritize features
- Hypothesis validations that confirm/reject assumptions

---

## Experiment Integration

When a diagnostic reaches **validated** status, prompt to create an experiment:

### Validation Criteria

A diagnostic is validated when:
- Level 3 diagnostic questions have been answered
- Gap type has been classified (bug, discoverability, feature)
- Hypothesis has been confirmed with evidence

### Post-Validation Flow

```
Diagnostic VALIDATED
        ↓
┌─────────────────────────────────────────────────────────┐
│  This observation is validated.                          │
│                                                          │
│  Gap type: {discoverability | feature | bug}             │
│  Key insight: "{user's key quote}"                       │
│                                                          │
│  Create experiment to address this?                      │
│  [Yes, create EXP-XXX] [No, just track]                 │
└─────────────────────────────────────────────────────────┘
```

### If "Yes, create experiment":

1. Generate next experiment ID (EXP-XXX)
2. Create `experiments/EXP-XXX-{slug}.md` from template
3. Pre-fill:
   - Observation link to this diagnostic
   - Gap type from classification
   - User type from profile
   - Suggested hypothesis based on gap
4. Update `experiments/laboratory.md` index
5. Set experiment status: 💡 idea

### Experiment File Location

```
grimoires/sigil/
├── observations/
│   └── {user}-diagnostic.md     # ← You are here (validated)
│
└── experiments/
    └── EXP-XXX-{feature}.md     # ← Created from observation
```

### Example: Observation → Experiment

```markdown
# In alice-diagnostic.md (after validation)

## Status: VALIDATED

Gap type: Discoverability
Key insight: "I try to remember the number from before but I forget"

## Experiment Created

→ EXP-001: Rewards Visibility for Trust-Checkers
  Link: experiments/EXP-001-rewards-visibility.md
```

---

## Related Commands

- `/craft` - Generate components (reads observations for context)
- `/craft --experiment EXP-XXX` - Generate components for specific experiment
- `/taste-synthesize` - Analyze taste patterns
- `/plan-and-analyze` - Full PRD discovery (includes user research phase)

---

## Blockchain Diagnostics Mode

When invoked as `/observe diagnose [ComponentName]`:

### Overview

Use this mode when debugging web3 components that show incorrect data. It compares on-chain state with indexed/cached data to identify mismatches.

### Step D1: Identify Component Data Needs

Read the component file and extract:
- Contract addresses referenced
- Data hooks (useReadContract, useQuery, useContractRead)
- Data sources (Envio queries, on-chain reads)
- User address context (from props or hooks)

```
Read component file
Extract: contracts[], hooks[], data_sources[]
Show:

┌─ Component Analysis ───────────────────────────────────┐
│                                                        │
│  Component:    {ComponentName}                         │
│  File:         {file_path}                             │
│                                                        │
│  Contracts found:                                      │
│  • {contract_name}: {address}                          │
│                                                        │
│  Data hooks:                                           │
│  • useReadContract: {function_name}                    │
│  • useQuery: {query_name} (Envio)                      │
│                                                        │
│  Proceed with on-chain inspection? (y/n)               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Step D2: Execute On-Chain Reads

Use blockchain-inspector skill or cast fallback to:
1. Get current block number
2. Read contract state for relevant addresses
3. Query Envio for same data points (if applicable)

**Implementation Options (in priority order):**

1. **Viem** (if project has viem installed):
```typescript
const client = createPublicClient({
  chain: targetChain,
  transport: http(process.env.RPC_URL)
})

const balance = await client.readContract({
  address: CONTRACT_ADDRESS,
  abi: contractAbi,
  functionName: 'balanceOf',
  args: [userAddress]
})
```

2. **Cast** (fallback - foundry CLI):
```bash
cast call $CONTRACT "balanceOf(address)(uint256)" $USER --rpc-url $RPC
```

3. **Raw JSON-RPC** (universal fallback):
```bash
curl -X POST "$RPC_URL" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_call","params":[{"to":"'$CONTRACT'","data":"'$CALLDATA'"},"latest"],"id":1}'
```

### Step D3: Source Comparison

Show diagnostic report with mismatch highlighting:

```
┌─ Diagnostic Report ────────────────────────────────────┐
│                                                        │
│  Component: StakeButton                                │
│  File:      src/components/StakeButton.tsx             │
│  User:      0x79092...                                 │
│  Block:     15,899,150                                 │
│                                                        │
│  ┌─ Source Comparison ─────────────────────────────┐   │
│  │                                                 │   │
│  │  Field          On-Chain    Envio    Match?     │   │
│  │  ────────────────────────────────────────────   │   │
│  │  vaultShares    0           8.25e18  ❌ NO      │   │
│  │  stakedShares   8.25e18     8.25e18  ✓ Yes      │   │
│  │  allowance      MAX         MAX      ✓ Yes      │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
│  Diagnosis: User has STAKED shares (in MultiRewards)   │
│  but component shows VAULT shares (Envio).             │
│                                                        │
│  Root Cause: Wrong contract address or field queried   │
│                                                        │
│  Suggested Fix:                                        │
│  Query multiRewards.balanceOf() not vault.balanceOf()  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Step D4: Update craft-state.md

Save diagnostic findings to `grimoires/sigil/craft-state.md` for next /craft iteration:

```yaml
diagnostics:
  - timestamp: "{ISO8601}"
    command: "/observe diagnose {ComponentName}"
    block: 15899150
    findings:
      on_chain:
        vault_shares: "0"
        staked_shares: "8.25e18"
      envio:
        vault_shares: "8.25e18"
      mismatch: ["vault_shares"]
    diagnosis: "User has staked, but component queries vault"
    suggested_fix: "Query multiRewards.balanceOf() not vault.balanceOf()"
```

### Step D5: Recommend Next Action

Based on findings, suggest next step:

```
┌─ Recommended Action ───────────────────────────────────┐
│                                                        │
│  Findings saved to craft-state.md                      │
│                                                        │
│  Options:                                              │
│  [f] /craft "fix {ComponentName}" - Apply fix          │
│  [u] /understand "{topic}" - Research further          │
│  [m] Manual fix - I'll handle it                       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Diagnostic Report YAML Output

For machine parsing, save structured output:

```yaml
# grimoires/sigil/observations/{component}-diagnostic.yaml
component: StakeButton
file: src/components/StakeButton.tsx
timestamp: "2026-01-20T15:45:00Z"
block: 15899150

contracts:
  - name: vault
    address: "0x3bEC4..."
  - name: multiRewards
    address: "0x8d15E..."

reads:
  - contract: "vault"
    function: "balanceOf"
    args: ["0x79092..."]
    result: "0"
    decoded: "0 shares"
  - contract: "multiRewards"
    function: "balanceOf"
    args: ["0x79092..."]
    result: "8250000000000000000"
    decoded: "8.25 shares"

comparison:
  on_chain:
    vault_shares: "0"
    staked_shares: "8.25e18"
  envio:
    vault_shares: "8.25e18"
    staked_shares: null
  mismatch:
    - field: "vault_shares"
      on_chain: "0"
      envio: "8.25e18"
      severity: "critical"

diagnosis:
  summary: "User has staked, but component queries vault"
  root_cause: "Wrong contract address queried"
  confidence: "high"

suggested_fix:
  description: "Query multiRewards.balanceOf() instead of vault.balanceOf()"
  affected_files:
    - src/components/StakeButton.tsx
  physics_impact: "Data source should be on-chain for button states"
```

### RPC Configuration

Reads RPC URL from (in priority order):
1. Environment variable: `RPC_URL`, `VITE_RPC_URL`, `NEXT_PUBLIC_RPC_URL`
2. Project config: `envio.config.ts` networks section
3. Package.json scripts (look for RPC references)
4. Prompt user if not found

### Limitations

- Read-only (no state changes)
- Requires ABI for complex decoding (or falls back to raw bytes)
- Rate limited on public RPCs
- May need user address context for per-user queries

---

## Agentation Parse Mode

When invoked as `/observe parse`:

### Overview

Parses Agentation output (visual UI annotations) and converts them into structured observations. Agentation lets users click UI elements and generates markdown with CSS selectors that can be grepped in the codebase.

### Expected Input Format

The user will paste Agentation output in this format:

```markdown
## Agentation Feedback

### Element: `.claim-button`
- **Selector**: `button.claim-button.bg-emerald-600`
- **Issue**: Button text unclear - "Claim" doesn't show amount
- **Position**: (245, 380)

### Text Selection: "Claim your rewards"
- **Issue**: Should show actual HENLO amount
```

### Step P1: Detect Agentation Format

When conversation contains text matching the Agentation pattern:
- `## Agentation Feedback` or `### Element:` headers
- `**Selector**:` with CSS selector
- `**Issue**:` with description
- `**Position**:` with coordinates (optional)

Trigger parse mode automatically or wait for `/observe parse` command.

### Step P2: Parse Elements

Extract structured data from each annotation:

```yaml
elements:
  - type: "element"
    selector: "button.claim-button.bg-emerald-600"
    issue: "Button text unclear - doesn't show amount"
    position: { x: 245, y: 380 }
  - type: "text-selection"
    content: "Claim your rewards"
    issue: "Should show actual HENLO amount"
```

### Step P3: Grep Codebase for Selectors

For each selector, search the codebase:

```bash
# Search for class names
grep -r "claim-button" src/ --include="*.tsx" --include="*.jsx"
grep -r "bg-emerald-600" src/ --include="*.tsx" --include="*.jsx"
```

Build a reference map linking selectors to source files:

```yaml
code_refs:
  - selector: "button.claim-button.bg-emerald-600"
    files:
      - path: "src/components/ClaimButton.tsx"
        line: 45
        context: "<button className=\"claim-button bg-emerald-600\">"
```

### Step P4: Generate Observation

Create structured observation in `grimoires/sigil/observations/`:

```yaml
---
timestamp: "2026-01-25T10:00:00Z"
source: agentation
type: ui-annotation
session_id: "{uuid}"
elements:
  - selector: "button.claim-button.bg-emerald-600"
    issue: "Button text unclear - doesn't show amount"
    position: { x: 245, y: 380 }
    code_ref: "src/components/ClaimButton.tsx:45"
  - type: text-selection
    content: "Claim your rewards"
    issue: "Should show actual HENLO amount"
    code_ref: null
---

# Agentation Observation - {date}

## Summary

{count} UI elements annotated via Agentation visual feedback.

## Elements

### 1. Claim Button
- **Selector**: `button.claim-button.bg-emerald-600`
- **Issue**: Button text unclear - doesn't show amount
- **Code**: `src/components/ClaimButton.tsx:45`

### 2. Text: "Claim your rewards"
- **Issue**: Should show actual HENLO amount

## Suggested Actions

Based on annotations, consider:
- [ ] Update ClaimButton to show amount: `Claim {amount} HENLO`
- [ ] Review copy physics for user-facing terminology

## Next Steps

1. Run `/craft "ClaimButton"` to apply physics-aware improvements
2. Or manually edit referenced files
```

### Step P5: Show Confirmation

```
┌─ Agentation Parsed ────────────────────────────────────┐
│                                                        │
│  Annotations: 2 elements captured                      │
│                                                        │
│  Code refs found:                                      │
│  • claim-button → src/components/ClaimButton.tsx:45    │
│                                                        │
│  Observation saved:                                    │
│  grimoires/sigil/observations/agentation-2026-01-25.md │
│                                                        │
│  Options:                                              │
│  [c] /craft "ClaimButton" - Apply physics to fix      │
│  [m] Manual - I'll handle it                          │
│  [a] Add more annotations                             │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Integration with /craft

When `/craft` is invoked after Agentation parsing:
1. Check for recent Agentation observations
2. Pre-load selector context and code references
3. Apply physics based on detected component effect

### Taste Signal

Log Agentation parsing to taste.md:

```yaml
---
timestamp: "2026-01-25T10:00:00Z"
signal: ACCEPT
source: agentation
component:
  name: "ClaimButton"
  effect: "Financial"
agentation:
  elements_parsed: 2
  code_refs_found: 1
  observation_file: "grimoires/sigil/observations/agentation-2026-01-25.md"
---
```

---

## The Mom Test Principles

Questions should follow "The Mom Test" rules:

1. **Talk about their life, not your idea**
   - Bad: "Would you use a burn calculator?"
   - Good: "How do you decide when to burn?"

2. **Ask about specifics in the past**
   - Bad: "Do you check your rewards often?"
   - Good: "When did you last check? What triggered it?"

3. **Talk less, listen more**
   - Let them tell their story
   - Follow up on specifics, not generalizations

4. **Seek disconfirming evidence**
   - "When was this NOT a problem?"
   - "What workarounds do you use?"
