# Web3 Testing Skill

## Purpose

Enable AI-driven testing of Web3 dApp UI flows without requiring real wallet connections or blockchain transactions. Supports mock mode (fast, deterministic) and fork mode (real contract state from Tenderly/Anvil).

## Capabilities

| Capability | Description |
|------------|-------------|
| **State Injection** | Inject mock wallet state into browser context |
| **Fork Mode** | Real contract state from forked chain (Tenderly, Anvil) |
| **Mock Mode** | Full mocking for offline, deterministic testing |
| **Flow Execution** | Multi-step user journeys with state transitions |
| **Screenshot Capture** | Document UI states for PR comparison |

## Architecture

### Three-Layer Interception Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     THREE-LAYER INTERCEPTION MODEL                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  LAYER 1: REACTIVE STATE STORE                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  SigilMockStore                                                      │   │
│  │  • Mutable state with getter pattern                                 │   │
│  │  • Event emission on state changes                                   │   │
│  │  • sessionStorage persistence                                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│                              ▼                                              │
│  LAYER 2: EIP-1193 PROVIDER                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  window.ethereum                                                     │   │
│  │  • Full EIP-1193 request() method                                    │   │
│  │  • EventEmitter for accountsChanged, chainChanged                    │   │
│  │  • Reads from SigilMockStore.state (always current)                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│                              ▼                                              │
│  LAYER 3: FETCH TRANSPORT INTERCEPTION                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  window.fetch (monkey-patched)                                       │   │
│  │  • Intercepts JSON-RPC calls to known RPC URLs                       │   │
│  │  • Fork mode: Redirect to fork RPC                                   │   │
│  │  • Mock mode: Return canned responses                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Modes

| Mode | What it does | When to use |
|------|--------------|-------------|
| **mock** | Full mocking, no network | Default. Fast, deterministic, offline. |
| **fork** | Real contract state, mock wallet | Testing against real data without transactions. |
| **live** | Real testnet | E2E testing with deployed contracts. (Future) |

## Configuration

Configuration lives in `grimoires/sigil/web3.yaml`:

```yaml
# grimoires/sigil/web3.yaml

# Default chain for mock mode
chain: 1  # mainnet

# Fork Mode Configuration
fork:
  provider: tenderly  # tenderly | anvil | hardhat
  tenderly:
    project: my-project    # or use TENDERLY_PROJECT env
  anvil:
    url: http://localhost:8545
  block: latest

# Custom Scenarios
scenarios:
  staker:
    balance: 50 ETH
    tokens:
      HONEY: 10000
    contracts:
      balanceOf: "5000000000000000000000"

# Custom Flows
flows:
  stake:
    - scenario: staker
    - navigate: /stake
    - screenshot: stake-page
    - click: "[data-testid='stake-button']"
```

## Commands

### /ward with Web3

```bash
# Standard ward (no web3)
/ward http://localhost:3000

# Web3 with scenario (mock mode)
/ward http://localhost:3000 connected

# Web3 with fork mode
/ward http://localhost:3000 whale fork
```

### /snapshot

```bash
# Simple capture
/snapshot http://localhost:3000/claim connected

# Before/after for PR comparison
/snapshot http://localhost:3000/claim connected before
/snapshot http://localhost:3000/claim connected after
```

### /test-flow

```bash
# Run built-in flow
/test-flow http://localhost:3000 claim

# Run with fork mode
/test-flow http://localhost:3000 claim fork

# Run custom flow (from web3.yaml)
/test-flow http://localhost:3000 stake
```

## Built-in Scenarios

| Scenario | Description |
|----------|-------------|
| `disconnected` | Provider installed, not connected |
| `connected` | Default wallet with 10 ETH |
| `whale` | High balance (1000 ETH) |
| `empty` | Near-zero balance (0.001 ETH) |
| `pending` | Mid-transaction state |
| `error` | Transaction failed state |
| `arbitrum` | Chain 42161 preset |
| `base` | Chain 8453 preset |

## Built-in Flows

| Flow | Description |
|------|-------------|
| `connect` | Wallet connection flow |
| `claim` | Full claim with states (idle → pending → success) |
| `switch` | Chain switching flow |
| `error` | Error recovery flow |

## Workflow

### Injection Sequence

1. **Parse Arguments**: Detect scenario, mode from command
2. **Load Config**: Read web3.yaml if exists, apply defaults
3. **Generate Script**: Create injection script with state
4. **Fork Setup** (if fork mode): Create Tenderly fork or detect Anvil
5. **Inject & Navigate**: Use agent-browser with evaluateOnNewDocument
6. **Capture/Validate**: Take screenshots, validate physics
7. **Cleanup**: Close browser, clean up fork if needed

### State Update Protocol

For multi-step flows, use the reactive store:

```javascript
// Triggers wagmi re-renders automatically
window.__SIGIL_MOCK_STORE__.update({
  connected: true,
  transactionState: 'pending'
});
```

## Resources

| File | Description |
|------|-------------|
| `resources/injection-script.js` | Browser injection template |
| `resources/scenarios.yaml` | Built-in state presets |
| `resources/flows.yaml` | Built-in flow definitions |
| `resources/flow-executor.js` | Flow step executor module |
| `resources/fork-detector.sh` | Fork provider auto-detection |
| `resources/tenderly-fork.sh` | Tenderly fork management |
| `resources/anvil-fork.sh` | Anvil fork management |
| `templates/flow-report.md` | Flow execution report template |
| `templates/comparison.md` | Before/after comparison template |

## Dependencies

- **agent-browser**: Browser automation (existing Sigil skill)
- **gh CLI**: PR attachment (optional)
- **Tenderly account** or **Anvil**: Fork mode

## Compatibility

| Framework | Version | Support Level |
|-----------|---------|---------------|
| wagmi | v2.x | Full (primary target) |
| viem | v2.x | Full |
| React | 18+ | Full |
| Next.js | 13+, 14+ | Full (App Router and Pages) |
| ethers.js | v6.x | Partial (via provider patching) |

## Troubleshooting

### wagmi not detecting mock wallet

Ensure injection runs before React hydration. The script uses `evaluateOnNewDocument` to run before any app code.

### Balance not updating after state change

Use `store.update()` not direct mutation. Direct mutation won't trigger events:

```javascript
// ❌ Wrong
window.__SIGIL_WEB3_MOCK__.connected = true;

// ✅ Correct
window.__SIGIL_MOCK_STORE__.update({ connected: true });
```

### Fork mode shows stale data

Check fork block number. By default uses `latest`. Specify block in web3.yaml for determinism.

### viem publicClient reads fail

Fetch interception must be enabled. Check that RPC URL patterns include your provider.

### Smoke test failing

Run the smoke test to diagnose issues:

```bash
.claude/skills/web3-testing/fixtures/smoke-test.sh
```

### Fixture app not showing mocked data

1. Verify injection script is loaded: Check console for `[Sigil] Web3 mock injected`
2. Verify wagmi detected provider: `useAccount()` should return the mock address
3. Check browser console for errors

## Fixture App

A minimal wagmi v2 app is included for testing:

```bash
cd .claude/skills/web3-testing/fixtures/wagmi-app
npm install
npm run dev
# Opens http://localhost:5173
```

Test commands against it:

```bash
/ward http://localhost:5173 connected
/ward http://localhost:5173 whale fork
/test-flow http://localhost:5173 connect
```

See `fixtures/wagmi-app/README.md` for component reference.
