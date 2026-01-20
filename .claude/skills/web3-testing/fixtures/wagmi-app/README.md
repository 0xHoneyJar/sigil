# Sigil wagmi Fixture App

Minimal wagmi v2 + viem application for testing Sigil Web3 injection.

## Purpose

This fixture app provides deterministic components for testing the Web3 injection script:

- **ConnectButton** - Tests `useAccount`, `useConnect`
- **BalanceDisplay** - Tests `useBalance`
- **ChainSwitcher** - Tests `useChainId`, `useSwitchChain`
- **ActionButtons** - Tests claim/send/stake button styling

## Setup

```bash
cd .claude/skills/web3-testing/fixtures/wagmi-app
npm install
npm run dev
```

## Testing with Sigil

### Mock Mode

```bash
# Run ward with connected wallet
/ward http://localhost:5173 connected

# Run ward with whale scenario
/ward http://localhost:5173 whale
```

### Fork Mode

```bash
# Run with Tenderly fork
TENDERLY_ACCESS_KEY=xxx TENDERLY_PROJECT=yyy /ward http://localhost:5173 whale fork

# Run with Anvil fork
anvil --fork-url https://eth.llamarpc.com &
/ward http://localhost:5173 connected fork
```

### Flow Testing

```bash
/test-flow http://localhost:5173 connect
/test-flow http://localhost:5173 claim
```

## Components

| Component | Data TestID | wagmi Hooks |
|-----------|-------------|-------------|
| Connect Button | `connect-button` | `useConnect` |
| Disconnect Button | `disconnect-button` | `useDisconnect` |
| Address Display | `address` | `useAccount` |
| Balance Display | `balance` | `useBalance` |
| Chain ID | `chain-id` | `useChainId` |
| Chain Buttons | `chain-{id}` | `useSwitchChain` |
| Claim Button | `claim-button` | N/A (UI only) |
| Send Button | `send-button` | N/A (UI only) |
| Stake Button | `stake-button` | N/A (UI only) |

## Verified Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| `disconnected` | Shows connect button only |
| `connected` | Shows address, balance, actions |
| `whale` | Shows high balance (1000 ETH) |
| `empty` | Shows low balance (0.001 ETH) |
| `arbitrum` | Shows chain ID 42161 |

## Smoke Test

Run the smoke test to verify injection works:

```bash
../smoke-test.sh
```
