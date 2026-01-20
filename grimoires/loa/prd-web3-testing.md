# PRD: Sigil Web3 Testing Capability

**Version:** 1.0.0
**Status:** Draft
**Author:** Claude (from /plan-and-analyze)
**Date:** 2026-01-18
**Source:** [Issue #13](https://github.com/0xHoneyJar/sigil/issues/13)

---

## 1. Problem Statement

### The Core Problem

Sigil's design physics framework cannot validate Web3 dApp components that depend on wallet connections and on-chain data. When agent-browser attempts to test these components, it encounters:

1. **Blank/incomplete UI** — Components render "Connect Wallet" or nothing
2. **No contract data** — wagmi hooks return undefined without chain connection
3. **Untestable flows** — Financial physics (pessimistic sync, 800ms timing, confirmation dialogs) cannot be visually validated

### Why This Matters

Sigil's core value proposition is ensuring UI feels right before it ships. For Web3 products:
- **Financial components are the highest-stakes UI** — They require pessimistic physics, confirmation steps, and protected capabilities
- **Visual validation is blocked** — `/ward` cannot verify touch targets, focus rings, or capture meaningful screenshots
- **PR workflows break** — Teams can't attach before/after screenshots showing wallet-dependent changes

### Evidence from Issue #13

> "Components rendering balance displays, position cards, and transaction buttons cannot function meaningfully without a connected wallet address, chain-specific contract reads, and balance/allowance state."

> "Financial physics require testing confirmation dialogs, pending states, error recovery—but actual transactions require real wallet signing."

---

## 2. Goals & Success Metrics

### Primary Goal

Enable AI-driven testing of Web3 dApp UI flows without requiring real wallet connections or blockchain transactions.

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Flow coverage** | Test 100% of wallet-dependent UI states | Count of states testable before vs after |
| **Screenshot capture** | Capture meaningful screenshots for PRs | Screenshots show actual UI, not "Connect Wallet" |
| **Physics validation** | `/ward` validates financial components visually | Touch targets, focus rings verified on wallet UI |
| **Developer adoption** | Zero manual setup for mock state | Works with standard wagmi/viem projects |

### Non-Goals

- Real transaction signing or blockchain interaction
- Replacing unit/integration tests
- Supporting non-EVM chains (initial release)
- Wallet-specific features (MetaMask snaps, etc.)

---

## 3. User & Stakeholder Context

### Primary Persona: Web3 Product Engineer

**Profile:**
- Building dApps with React + wagmi + viem
- Uses Sigil for design physics
- Wants AI to validate UI flows end-to-end
- Creates PRs that need visual documentation

**Jobs to Be Done:**
1. "I want to see what my claim button looks like with a connected wallet"
2. "I want to test the full claim flow: connect → confirm → pending → success"
3. "I want before/after screenshots attached to my PR automatically"
4. "I want `/ward` to validate my financial components are accessible"

### Secondary Persona: Design Reviewer

**Profile:**
- Reviews PRs for design consistency
- Needs to see component states without running locally
- Validates that physics match the intended feel

**Jobs to Be Done:**
1. "I want to see screenshots of all component states in the PR"
2. "I want to verify the confirmation dialog timing feels deliberate"

---

## 4. Functional Requirements

### 4.1 Web3 Testing Skill

**Skill:** `web3-testing`
**Location:** `.claude/skills/web3-testing/SKILL.md`

#### Core Capabilities

| Capability | Description |
|------------|-------------|
| **State Injection** | Inject mock wallet state into browser context |
| **Mock Connectors** | Configure wagmi mock connector with arbitrary address |
| **Contract Mocking** | Override `useReadContract` results with specified values |
| **Transaction Simulation** | Simulate pending/success/error states |
| **State Presets** | Pre-built scenarios (whale, empty, multi-token) |

#### Injection Mechanism

```typescript
// Injected into page via agent-browser evaluate
window.__SIGIL_WEB3_MOCK__ = {
  connected: true,
  address: "0x1234...abcd",
  chainId: 1,
  balances: {
    ETH: "10.5",
    USDC: "1000.00"
  },
  contractReads: {
    "useReadCubMainnetBadgesPercentageOfUser": { percentage: 15 }
  },
  transactionState: "idle" // idle | pending | success | error
}
```

#### User Stories

**US-1: Mock Connected Wallet**
```
As a developer
I want to inject a mock wallet address
So that I can test wallet-dependent UI without MetaMask

Acceptance Criteria:
- [ ] Address appears in wallet display components
- [ ] `useAccount()` returns the mock address
- [ ] `isConnected` returns true
- [ ] No actual wallet extension required
```

**US-2: Mock Token Balances**
```
As a developer
I want to inject mock token balances
So that I can test balance displays and conditional UI

Acceptance Criteria:
- [ ] `useBalance()` returns injected values
- [ ] Multiple tokens can be mocked simultaneously
- [ ] Balances update when mock state changes
```

**US-3: Mock Contract Reads**
```
As a developer
I want to mock specific contract read results
So that I can test components that depend on on-chain data

Acceptance Criteria:
- [ ] Custom hook results can be overridden by name
- [ ] Complex return types supported (arrays, structs)
- [ ] Mock applies before component renders
```

**US-4: Simulate Transaction States**
```
As a developer
I want to simulate transaction pending/success/error states
So that I can test loading UI and error recovery

Acceptance Criteria:
- [ ] Can trigger pending state
- [ ] Can trigger success with mock receipt
- [ ] Can trigger error with mock message
- [ ] States persist until explicitly changed
```

---

### 4.2 Snapshot Command

**Command:** `/snapshot`
**Location:** `.claude/commands/snapshot.md`

#### Purpose

Capture before/after screenshots for PR documentation with optional Web3 state injection.

#### Syntax

```bash
/snapshot <url> [--before] [--after] [--states "state1,state2"] [--web3]
/snapshot <url> --flow "connect,claim,confirm,success"
/snapshot --attach-pr   # Attach captured screenshots to current PR
```

#### Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                     /snapshot WORKFLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Parse arguments                                             │
│     └── Determine mode (single, before/after, flow)             │
│                                                                 │
│  2. Inject Web3 state (if --web3)                               │
│     └── Apply mock wallet, balances, contract reads             │
│                                                                 │
│  3. Navigate to URL                                             │
│     └── Wait for network idle                                   │
│                                                                 │
│  4. Capture screenshots                                         │
│     └── Save to grimoires/sigil/snapshots/                      │
│                                                                 │
│  5. Generate comparison (if before/after)                       │
│     └── Side-by-side markdown                                   │
│                                                                 │
│  6. Attach to PR (if --attach-pr)                               │
│     └── Update PR description with images                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### User Stories

**US-5: Before/After Screenshots**
```
As a developer
I want to capture before and after screenshots
So that PR reviewers can see what changed

Acceptance Criteria:
- [ ] Captures screenshot at current HEAD~1 (before)
- [ ] Captures screenshot at current HEAD (after)
- [ ] Generates side-by-side comparison
- [ ] Saves to grimoires/sigil/snapshots/
```

**US-6: Flow Screenshots**
```
As a developer
I want to capture screenshots of a complete user flow
So that I can document the full experience

Acceptance Criteria:
- [ ] Accepts comma-separated state names
- [ ] Captures screenshot at each state
- [ ] Supports Web3 state transitions
- [ ] Generates numbered sequence
```

**US-7: PR Attachment**
```
As a developer
I want screenshots automatically attached to my PR
So that reviewers see visual changes without asking

Acceptance Criteria:
- [ ] Uploads images to PR (or links from repo)
- [ ] Adds markdown image references to PR description
- [ ] Works with `gh pr create` and `gh pr edit`
```

---

### 4.3 Test Flow Command

**Command:** `/test-flow`
**Location:** `.claude/commands/test-flow.md`

#### Purpose

Execute and validate a complete user flow (Job to Be Done) with automatic state management and physics validation.

#### Syntax

```bash
/test-flow <url> --flow "claim-rewards"
/test-flow <url> --jtbd "user claims staking rewards"
/test-flow <url> --steps "connect,navigate:/claim,click:@claim-btn,confirm,wait:success"
```

#### Built-in Flows

| Flow Name | Steps | Web3 State |
|-----------|-------|------------|
| `connect-wallet` | Open → Click connect → Mock connected | address, chainId |
| `claim-rewards` | Connect → Navigate to claim → Click claim → Confirm → Success | address, balances, pending→success |
| `stake-tokens` | Connect → Enter amount → Approve → Stake → Confirm | address, allowance, pending→success |
| `withdraw` | Connect → Enter amount → Withdraw → Confirm | address, balances, pending→success |

#### User Stories

**US-8: Execute Predefined Flow**
```
As a developer
I want to run a predefined user flow
So that I can validate the complete experience

Acceptance Criteria:
- [ ] Executes all steps in sequence
- [ ] Captures screenshot at each step
- [ ] Reports any physics violations found
- [ ] Generates flow completion report
```

**US-9: Custom Flow Definition**
```
As a developer
I want to define custom flows with steps
So that I can test project-specific journeys

Acceptance Criteria:
- [ ] Accepts step DSL (navigate, click, wait, screenshot)
- [ ] Supports Web3 state changes mid-flow
- [ ] Can reference element refs from snapshots
```

---

### 4.4 Extended /ward Integration

**Enhancement to:** `/ward`

#### New Flags

| Flag | Description |
|------|-------------|
| `--web3` | Inject default mock wallet state |
| `--address <addr>` | Mock connected address |
| `--balance <token>=<amount>` | Mock token balance |
| `--mock <hook>=<json>` | Mock specific hook result |
| `--chain <id>` | Mock chain ID (default: 1) |

#### Example

```bash
# Validate claim button with mocked wallet
/ward http://localhost:3000/claim --web3 --balance ETH=10

# Validate with specific contract read mock
/ward http://localhost:3000/dashboard --web3 \
  --mock "useReadUserPosition={\"staked\":\"1000\",\"rewards\":\"50\"}"
```

---

## 5. Technical Requirements

### 5.1 Browser Context Injection

The web3-testing skill must inject mock state into the page context before wagmi hooks execute.

**Injection Strategy:**
1. Use `agent-browser` to open page
2. Before page load completes, inject mock provider script
3. Script intercepts wagmi connector resolution
4. Return mock data for configured hooks

**Compatibility:**
- wagmi v2.x (current)
- viem ^2.0
- React 18+

### 5.2 State Persistence

Mock state must persist across:
- Page navigations within same origin
- Component re-renders
- React Query refetches

**Implementation:**
- Use `sessionStorage` for state persistence
- Intercept at provider level, not individual hooks
- Support hot-reload without state loss

### 5.3 Screenshot Storage

```
grimoires/sigil/
└── snapshots/
    ├── {date}/
    │   ├── {component}-before.png
    │   ├── {component}-after.png
    │   └── {component}-comparison.md
    └── flows/
        └── {flow-name}/
            ├── step-01-connect.png
            ├── step-02-claim.png
            └── flow-report.md
```

### 5.4 PR Integration

Use `gh` CLI for PR operations:
- `gh pr view --json body` — Get current PR description
- `gh pr edit --body` — Update with screenshots
- Upload images to issue comments or use repo-relative paths

---

## 6. Scope & Prioritization

### MVP (Sprint 1)

| Feature | Priority |
|---------|----------|
| Web3 state injection (address, balances) | P0 |
| `/snapshot` basic capture | P0 |
| `/ward --web3` flag | P0 |
| Mock `useAccount`, `useBalance` | P0 |

### Phase 2

| Feature | Priority |
|---------|----------|
| Custom contract read mocking | P1 |
| Transaction state simulation | P1 |
| `/test-flow` command | P1 |
| Before/after comparison | P1 |

### Phase 3

| Feature | Priority |
|---------|----------|
| PR auto-attachment | P2 |
| Built-in flow library | P2 |
| Multi-chain support | P2 |
| State presets (whale, empty) | P2 |

### Out of Scope

- Actual blockchain transactions
- Wallet-specific UI (MetaMask popups)
- Non-EVM chains
- Real signature generation
- Transaction broadcasting

---

## 7. Risks & Dependencies

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| wagmi internals change | Medium | High | Pin supported versions, test on release |
| Injection timing issues | Medium | Medium | Use page.evaluateOnNewDocument |
| State desync with real hooks | Low | Medium | Comprehensive mock coverage |

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| agent-browser | Required | Exists in Sigil |
| gh CLI | Required for PR attachment | Standard dev tool |
| wagmi v2 | Target framework | Stable |

### Open Questions

1. **State file format** — Should mock state be configurable via file (e.g., `.sigil-web3-mock.json`)?
2. **Multi-wallet testing** — Support multiple addresses in one session?
3. **Real RPC fallback** — Allow some reads to hit real RPC while mocking others?

---

## 8. Acceptance Criteria Summary

### Must Have (MVP)

- [ ] Agent can test wallet-dependent UI without MetaMask
- [ ] `/ward --web3` validates financial components visually
- [ ] `/snapshot` captures meaningful screenshots with mock wallet
- [ ] Mock address appears in UI components
- [ ] Mock balances display correctly

### Should Have (Phase 2)

- [ ] Custom contract reads can be mocked
- [ ] Transaction pending/success/error states simulatable
- [ ] Before/after screenshot comparison
- [ ] `/test-flow` executes multi-step journeys

### Nice to Have (Phase 3)

- [ ] Screenshots auto-attach to PRs
- [ ] Built-in flows for common Web3 patterns
- [ ] State presets for quick testing

---

## Appendix A: Example Workflows

### A.1 Validating a Claim Button

```bash
# Developer runs ward with web3 mocking
/ward http://localhost:3000/claim --web3 --balance ETH=10.5

# Ward output includes:
# - Touch target validation (44px) ✓
# - Focus ring visibility ✓
# - Screenshot: grimoires/sigil/snapshots/ward-20260118.png
# - Financial physics compliance check
```

### A.2 PR Screenshot Workflow

```bash
# Capture before (stash changes, run on main)
/snapshot http://localhost:3000/dashboard --before --web3

# Make changes, capture after
/snapshot http://localhost:3000/dashboard --after --web3

# Attach to PR
/snapshot --attach-pr

# PR description now includes:
# ## Visual Changes
# | Before | After |
# |--------|-------|
# | ![before](snapshots/...) | ![after](snapshots/...) |
```

### A.3 Testing Complete Claim Flow

```bash
/test-flow http://localhost:3000 --flow claim-rewards

# Executes:
# 1. Inject connected wallet state
# 2. Navigate to /claim
# 3. Screenshot: step-01-claim-page.png
# 4. Click claim button
# 5. Screenshot: step-02-confirmation.png
# 6. Confirm transaction
# 7. Inject pending state
# 8. Screenshot: step-03-pending.png
# 9. Inject success state
# 10. Screenshot: step-04-success.png
# 11. Generate flow-report.md
```

---

## Appendix B: Technical Spike Areas

### B.1 wagmi Mock Connector

wagmi provides `mock` connector for testing. Investigate:
- Can it be injected at runtime via browser context?
- Does it support custom hook result overrides?
- What's the minimal setup required?

### B.2 Viem Test Client

viem has `testClient` for local testing. Investigate:
- Can it run in browser context?
- Does it provide RPC-level mocking?
- Performance implications?

### B.3 agent-browser Script Injection

Verify:
- `page.evaluateOnNewDocument` timing
- Script execution order relative to React hydration
- Hot reload behavior

---

*End of PRD*
