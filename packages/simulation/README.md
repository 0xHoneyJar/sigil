# @sigil/simulation

Transaction simulation against forks. Dry-run transactions to see gas, balance changes, and revert reasons.

## Installation

```bash
pnpm add @sigil/simulation @sigil/fork
```

## Usage

```typescript
import { createForkService } from '@sigil/fork'
import { createSimulationService } from '@sigil/simulation'

// Create services
const forkService = createForkService('anvil')
const simulationService = createSimulationService(forkService)

// Create a fork first
await forkService.createFork({
  provider: 'anvil',
  forkUrl: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
  chainId: 1,
})

// Simulate a transaction
const result = await simulationService.simulate({
  from: '0x...',
  to: '0x...',
  value: 1000000000000000000n,
  data: '0x...',
})

console.log('Success:', result.success)
console.log('Gas used:', result.gasUsed)
console.log('Balance changes:', result.balanceChanges)
```

## API

### `createSimulationService(forkService: ForkService): SimulationService`

Create a simulation service using an existing fork service.

### `SimulationService`

| Method | Description |
|--------|-------------|
| `simulate(tx)` | Simulate a transaction |
| `estimateGas(tx)` | Estimate gas for transaction |
| `getGasPrice()` | Get current gas price |
| `decodeRevertReason(data)` | Decode revert reason |

### `SimulationResult`

| Field | Description |
|-------|-------------|
| `success` | Whether transaction succeeded |
| `hash` | Transaction hash |
| `gasUsed` | Gas used |
| `gasLimit` | Gas limit |
| `effectiveGasPrice` | Effective gas price |
| `totalCost` | Total cost in wei |
| `returnValue` | Return value |
| `revertReason` | Revert reason if failed |
| `balanceChanges` | Balance changes |
| `stateChanges` | State changes |
| `logs` | Event logs |

## FR-006 Fix

Impersonation cleanup is handled in a `finally` block to ensure accounts are always un-impersonated even if simulation fails.

## License

MIT
