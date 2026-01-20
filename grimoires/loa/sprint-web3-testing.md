# Sprint Plan: Sigil Web3 Testing Capability

**Version:** 1.0.0
**Status:** Draft
**Created:** 2026-01-19
**PRD:** `grimoires/loa/prd-web3-testing.md`
**SDD:** `grimoires/loa/sdd-web3-testing.md`

---

## Sprint Overview

| Attribute | Value |
|-----------|-------|
| **Team Size** | Solo developer |
| **Sprint Duration** | 1 week |
| **Total Sprints** | 5 |
| **Priority Mode** | Fork mode (real contract state) |
| **MVP Definition** | Sprint 1-2: Core injection + Fork mode working |

### Priority Rationale

Fork mode prioritized over pure mocking because:
- Transactions must honor blockchain state
- Real contract reads ensure accurate UI testing
- Mock mode can layer on top of fork infrastructure

---

## Sprint 1: Core Infrastructure & Fork Foundation

**Goal:** Three-layer injection architecture with fork-first design

**Duration:** Week 1

### Tasks

#### Task 1.1: Create web3-testing skill structure
**Description:** Set up the skill directory and SKILL.md with core workflow definition.

**Files:**
- `.claude/skills/web3-testing/SKILL.md`
- `.claude/skills/web3-testing/resources/` (directory)

**Acceptance Criteria:**
- [ ] Skill directory created with proper structure
- [ ] SKILL.md defines injection workflow
- [ ] Resources directory exists for scripts/presets

**Effort:** Small

---

#### Task 1.2: Implement three-layer injection script (fork-aware)
**Description:** Create the browser injection script with all three layers: reactive state store, EIP-1193 provider, and fetch interception. Design fetch layer to redirect to fork RPC when configured.

**Files:**
- `.claude/skills/web3-testing/resources/injection-script.js`

**Acceptance Criteria:**
- [ ] Layer 1: SigilMockStore with reactive state and event emission
- [ ] Layer 2: EIP-1193 provider (window.ethereum) with full method support
- [ ] Layer 3: Fetch interception that can route to fork RPC or return mocks
- [ ] sessionStorage persistence for navigation
- [ ] `accountsChanged`, `chainChanged` events trigger wagmi re-renders
- [ ] Fork RPC URL configurable via state

**Effort:** Large

**Testing:**
- Verify injection runs before React hydration
- Verify wagmi `useAccount()` returns mock address
- Verify fetch interception catches viem transport calls

---

#### Task 1.3: Implement fork provider auto-detection
**Description:** Create detection logic for Tenderly, Anvil, and Hardhat fork providers from environment.

**Files:**
- `.claude/skills/web3-testing/resources/fork-detector.sh`

**Acceptance Criteria:**
- [ ] Detects `TENDERLY_ACCESS_KEY` → Tenderly
- [ ] Detects anvil on `:8545` → Anvil
- [ ] Detects hardhat on `:8545` → Hardhat
- [ ] Returns provider type and RPC URL
- [ ] Falls back gracefully when no fork available

**Effort:** Small

---

#### Task 1.4: Create web3.yaml config loader
**Description:** Implement configuration loading from `grimoires/sigil/web3.yaml` for fork settings, scenarios, and custom flows.

**Files:**
- Skill workflow in SKILL.md

**Acceptance Criteria:**
- [ ] Loads fork provider config (tenderly/anvil/hardhat)
- [ ] Loads custom scenarios
- [ ] Loads custom flows
- [ ] Provides sensible defaults when no config exists
- [ ] Auto-detects fork provider from environment

**Effort:** Medium

---

#### Task 1.5: Create built-in scenarios (fork-compatible)
**Description:** Define state presets that work with both fork and mock modes.

**Files:**
- `.claude/skills/web3-testing/resources/scenarios.yaml`

**Acceptance Criteria:**
- [ ] `disconnected` - Provider installed, not connected
- [ ] `connected` - Default wallet with 10 ETH
- [ ] `whale` - High balance (1000 ETH)
- [ ] `empty` - Near-zero balance (0.001 ETH)
- [ ] `pending` - Mid-transaction state
- [ ] `error` - Transaction failed state
- [ ] `arbitrum` - Chain 42161 preset
- [ ] `base` - Chain 8453 preset
- [ ] All use valid checksummed addresses

**Effort:** Small

---

### Sprint 1 Acceptance

**Definition of Done:**
```bash
# Injection script can be loaded into browser context
# Fork RPC URL can be configured
# State updates trigger wagmi re-renders
```

---

## Sprint 2: Fork Mode & /ward Integration

**Goal:** Working fork mode with `/ward` command extension

**Duration:** Week 2

### Tasks

#### Task 2.1: Implement Tenderly fork integration
**Description:** Create Tenderly-specific fork setup that creates a fork and returns RPC URL.

**Files:**
- `.claude/skills/web3-testing/resources/tenderly-fork.sh`

**Acceptance Criteria:**
- [ ] Creates Tenderly fork via API
- [ ] Returns fork RPC URL
- [ ] Supports block number specification
- [ ] Cleans up fork after session (optional)
- [ ] Uses `TENDERLY_ACCESS_KEY` and `TENDERLY_PROJECT` env vars

**Effort:** Medium

---

#### Task 2.2: Implement Anvil fork integration
**Description:** Create Anvil-specific fork setup for local development.

**Files:**
- `.claude/skills/web3-testing/resources/anvil-fork.sh`

**Acceptance Criteria:**
- [ ] Detects running Anvil instance
- [ ] Supports starting Anvil with fork flag
- [ ] Returns local RPC URL
- [ ] Supports mainnet/testnet fork sources

**Effort:** Small

---

#### Task 2.3: Extend /ward with Web3 support
**Description:** Add scenario-based Web3 support to /ward command using UNIX philosophy (scenarios as positional args).

**Files:**
- `.claude/commands/ward.md` (modification)

**Acceptance Criteria:**
- [ ] `/ward <url> <scenario>` enables Web3 mode
- [ ] `/ward <url> <scenario> fork` uses fork mode
- [ ] Scenario presence implies Web3 mode (no --web3 flag needed)
- [ ] Injects state before page load via agent-browser
- [ ] Screenshots capture wallet-connected UI
- [ ] Touch target and focus ring validation works

**Effort:** Medium

**Testing:**
```bash
/ward http://localhost:3000 connected        # Mock mode
/ward http://localhost:3000 whale fork       # Fork mode with Tenderly/Anvil
```

---

#### Task 2.4: Implement RPC redirect in injection script
**Description:** Modify fetch interception to redirect RPC calls to fork provider instead of mocking.

**Files:**
- `.claude/skills/web3-testing/resources/injection-script.js` (modification)

**Acceptance Criteria:**
- [ ] When `forkRpcUrl` in state, redirect eth_* calls to fork
- [ ] Wallet operations (eth_requestAccounts, etc.) still mocked
- [ ] Contract reads (eth_call) go to fork RPC
- [ ] Balance queries (eth_getBalance) go to fork RPC
- [ ] Maintains mock wallet address for signing

**Effort:** Medium

---

#### Task 2.5: Create /snapshot command (basic)
**Description:** Implement basic screenshot capture with Web3 state support.

**Files:**
- `.claude/commands/snapshot.md`

**Acceptance Criteria:**
- [ ] `/snapshot <url> [scenario]` captures screenshot
- [ ] Injects Web3 state if scenario provided
- [ ] Saves to `grimoires/sigil/snapshots/{date}/`
- [ ] Supports fork mode via third positional arg

**Effort:** Medium

---

### Sprint 2 Acceptance

**Definition of Done:**
```bash
# Fork mode working with real contract state
/ward http://localhost:3000 connected fork
# Shows real on-chain balances with mock wallet address

/snapshot http://localhost:3000/claim whale fork
# Captures screenshot with real contract data
```

---

## Sprint 3: Flow Execution

**Goal:** Multi-step flow testing with `/test-flow` command

**Duration:** Week 3

### Tasks

#### Task 3.1: Create /test-flow command
**Description:** Implement flow execution command with built-in and custom flow support.

**Files:**
- `.claude/commands/test-flow.md`

**Acceptance Criteria:**
- [ ] `/test-flow <url> <flow> [mode]` syntax
- [ ] Loads built-in flows or custom from web3.yaml
- [ ] Executes steps sequentially
- [ ] Captures screenshot at each step
- [ ] Generates flow report

**Effort:** Large

---

#### Task 3.2: Implement built-in flows
**Description:** Create standard flow definitions for common Web3 patterns.

**Files:**
- `.claude/skills/web3-testing/resources/flows.yaml`

**Acceptance Criteria:**
- [ ] `connect` - Wallet connection flow
- [ ] `claim` - Full claim with states (idle → pending → success)
- [ ] `switch` - Chain switching flow
- [ ] `error` - Error recovery flow
- [ ] Each flow has clear step definitions
- [ ] Flows work with both mock and fork modes

**Effort:** Medium

---

#### Task 3.3: Implement flow step executor
**Description:** Create executor that processes flow steps (inject, update, click, navigate, screenshot, wait).

**Files:**
- Skill workflow enhancement

**Acceptance Criteria:**
- [ ] `inject` - Initial state injection
- [ ] `update` - Runtime state update (triggers events)
- [ ] `click` - Click element by selector
- [ ] `fill` - Fill input field
- [ ] `navigate` - Navigate to path
- [ ] `wait` - Wait for duration or selector
- [ ] `screenshot` - Capture with name

**Effort:** Large

---

#### Task 3.4: Implement flow report generation
**Description:** Generate markdown report after flow execution.

**Files:**
- `.claude/skills/web3-testing/templates/flow-report.md`

**Acceptance Criteria:**
- [ ] Lists all steps with status
- [ ] Includes screenshot links
- [ ] Shows physics validation results
- [ ] Records state transitions
- [ ] Includes timing information

**Effort:** Small

---

#### Task 3.5: Add custom flow support from web3.yaml
**Description:** Allow users to define project-specific flows in web3.yaml.

**Files:**
- Config loader enhancement

**Acceptance Criteria:**
- [ ] Custom flows load from `flows:` section
- [ ] Support same step types as built-in
- [ ] Can reference custom scenarios
- [ ] Validates flow structure on load

**Effort:** Medium

---

### Sprint 3 Acceptance

**Definition of Done:**
```bash
/test-flow http://localhost:3000 claim fork
# Executes: inject → navigate → click → pending → success
# Captures 4+ screenshots
# Generates grimoires/sigil/snapshots/flows/claim/report.md
```

---

## Sprint 4: PR Integration & Before/After

**Goal:** Screenshot workflows for PR documentation

**Duration:** Week 4

### Tasks

#### Task 4.1: Implement before/after snapshot workflow
**Description:** Add git-based before/after capture to /snapshot command.

**Files:**
- `.claude/commands/snapshot.md` (enhancement)

**Acceptance Criteria:**
- [ ] `/snapshot <url> <scenario> before` stashes changes, captures from main
- [ ] `/snapshot <url> <scenario> after` captures current branch
- [ ] Generates side-by-side comparison markdown
- [ ] Restores git state after before capture

**Effort:** Medium

---

#### Task 4.2: Implement PR image attachment
**Description:** Automatically attach screenshots to PR description.

**Files:**
- Snapshot workflow enhancement

**Acceptance Criteria:**
- [ ] Detects current PR via `gh pr view`
- [ ] Uploads images or uses repo-relative paths
- [ ] Appends "Visual Changes" section to PR body
- [ ] Creates comparison table for before/after
- [ ] Works with `gh pr create` and `gh pr edit`

**Effort:** Medium

---

#### Task 4.3: Create comparison markdown generator
**Description:** Generate formatted comparison document for PR.

**Files:**
- `.claude/skills/web3-testing/templates/comparison.md`

**Acceptance Criteria:**
- [ ] Side-by-side image table
- [ ] Before/after labels
- [ ] Timestamp and URL recorded
- [ ] Scenario/mode documented

**Effort:** Small

---

#### Task 4.4: Add flow screenshots to PR
**Description:** Support attaching flow screenshots to PR.

**Files:**
- Test-flow enhancement

**Acceptance Criteria:**
- [ ] Option to attach flow report to PR
- [ ] Embeds key screenshots (first, last, any failures)
- [ ] Links to full flow report

**Effort:** Small

---

### Sprint 4 Acceptance

**Definition of Done:**
```bash
/snapshot http://localhost:3000/claim connected before
# ... make changes ...
/snapshot http://localhost:3000/claim connected after

# PR description now includes visual comparison
```

---

## Sprint 5: Mock Mode & Polish

**Goal:** Full mock mode for offline/fast testing, fixture app, documentation

**Duration:** Week 5

### Tasks

#### Task 5.1: Implement full mock mode
**Description:** Complete mock mode that returns canned responses without any network calls.

**Files:**
- Injection script enhancement

**Acceptance Criteria:**
- [ ] All eth_* methods return mock data when no fork configured
- [ ] Contract reads return from `contractReads` config
- [ ] Function selector mapping (0x70a08231 → balanceOf)
- [ ] Default responses for common functions
- [ ] Works completely offline

**Effort:** Medium (much already done in Sprint 1)

---

#### Task 5.2: Create fixture wagmi app for testing
**Description:** Build minimal wagmi v2 + viem app for deterministic testing.

**Files:**
- `.claude/skills/web3-testing/fixtures/wagmi-app/`

**Acceptance Criteria:**
- [ ] ConnectButton component (useAccount, useConnect)
- [ ] BalanceDisplay component (useBalance)
- [ ] TokenBalance component (useReadContract)
- [ ] SendTransaction component (useSendTransaction)
- [ ] ChainSwitcher component (useSwitchChain)
- [ ] Standard wagmi config
- [ ] README with test instructions

**Effort:** Medium

---

#### Task 5.3: Create smoke test script
**Description:** Automated CI script to verify injection works.

**Files:**
- `.claude/skills/web3-testing/fixtures/smoke-test.sh`

**Acceptance Criteria:**
- [ ] Starts fixture app
- [ ] Runs basic injection test
- [ ] Runs connect flow test
- [ ] Verifies screenshots created
- [ ] Returns exit code for CI

**Effort:** Small

---

#### Task 5.4: Write skill documentation
**Description:** Complete SKILL.md with all workflows, examples, troubleshooting.

**Files:**
- `.claude/skills/web3-testing/SKILL.md` (enhancement)

**Acceptance Criteria:**
- [ ] All commands documented with examples
- [ ] Fork vs mock mode explained
- [ ] Configuration reference
- [ ] Troubleshooting section
- [ ] Compatibility notes

**Effort:** Medium

---

#### Task 5.5: Add contract read mocking by selector
**Description:** Support mocking specific contract reads by function selector or name.

**Files:**
- Injection script enhancement

**Acceptance Criteria:**
- [ ] Mock by selector: `"0x70a08231": "1000000"`
- [ ] Mock by address+selector: `"0xContract:0x70a08231": "500"`
- [ ] Mock by name: `"balanceOf": "1000000"`
- [ ] Known selector lookup table (balanceOf, totalSupply, etc.)

**Effort:** Small (partially done in Sprint 1)

---

### Sprint 5 Acceptance

**Definition of Done:**
```bash
# Mock mode works offline
/ward http://localhost:3000 whale
# Returns mocked balances, no network calls

# Fixture app validates injection
cd .claude/skills/web3-testing/fixtures/wagmi-app
./smoke-test.sh
# All tests pass
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Tenderly API changes | Low | Medium | Pin API version, handle errors gracefully |
| wagmi v3 breaks injection | Medium | High | EIP-1193 is standard; event emission pattern stable |
| agent-browser timing issues | Medium | Medium | Add retry logic, configurable wait times |
| Fork RPC rate limits | Medium | Low | Cache reads, batch requests |

---

## Dependencies

| Dependency | Required By | Notes |
|------------|-------------|-------|
| agent-browser | All sprints | Existing Sigil skill |
| gh CLI | Sprint 4 | Standard dev tool |
| Tenderly account | Sprint 2 (fork) | Or use local Anvil |
| wagmi v2 project | Testing | For validation |

---

## Success Metrics

| Metric | Target | Sprint |
|--------|--------|--------|
| Fork mode captures real state | Working | Sprint 2 |
| /ward validates wallet UI | 100% coverage | Sprint 2 |
| Flow execution works | 4 built-in flows | Sprint 3 |
| PR screenshots attach | Automated | Sprint 4 |
| Offline mock mode | Full support | Sprint 5 |

---

## Next Steps

After plan approval:
```bash
/implement sprint-1
```

---

*End of Sprint Plan*
