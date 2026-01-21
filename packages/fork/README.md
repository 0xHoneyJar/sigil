# @sigil/fork

Fork chain state for local testing. Supports Anvil and Tenderly.

## Installation

```bash
pnpm add @sigil/fork
```

## Usage

```typescript
import { createAnvilForkService } from '@sigil/fork'

// Create a fork service
const forkService = createAnvilForkService()

// Create a fork
const state = await forkService.createFork({
  provider: 'anvil',
  forkUrl: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
  chainId: 1,
})

// Take a snapshot
const snapshot = await forkService.snapshot('before-test')

// Impersonate an account
await forkService.impersonateAccount('0x...')

// Set balance
await forkService.setBalance('0x...', 1000000000000000000n)

// Revert to snapshot
await forkService.revert(snapshot.id)
```

## API

### `createForkService(provider: ForkProvider): ForkService`

Create a fork service for the specified provider.

### `ForkService`

| Method | Description |
|--------|-------------|
| `createFork(config)` | Create a new fork |
| `getState()` | Get current fork state |
| `snapshot(description?)` | Take a snapshot |
| `revert(snapshotId)` | Revert to snapshot |
| `reset()` | Reset fork to initial state |
| `destroy()` | Destroy the fork |
| `setBalance(address, balance)` | Set account balance |
| `impersonateAccount(address)` | Impersonate an account |
| `stopImpersonating(address)` | Stop impersonating |
| `mineBlock(blocks?)` | Mine blocks |
| `getRpcUrl()` | Get RPC URL |

## License

MIT
