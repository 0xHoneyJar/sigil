# @sigil/lens

Address impersonation for testing different user states. View your app as any address.

## Installation

```bash
pnpm add @sigil/lens
```

## Usage

### React Hooks

```tsx
import { useLens, useIsImpersonating, useLensActions } from '@sigil/lens'

function MyComponent() {
  const { enabled, impersonatedAddress, realAddress } = useLens()
  const isImpersonating = useIsImpersonating()
  const { setImpersonatedAddress, clearImpersonation } = useLensActions()

  return (
    <div>
      {isImpersonating ? (
        <p>Viewing as: {impersonatedAddress}</p>
      ) : (
        <p>Viewing as: {realAddress}</p>
      )}
      <button onClick={() => setImpersonatedAddress('0x...')}>
        Impersonate
      </button>
      <button onClick={clearImpersonation}>
        Stop
      </button>
    </div>
  )
}
```

### Wagmi Integration

```tsx
import { useLensAwareAccount } from '@sigil/lens/wagmi'

function WalletInfo() {
  const { address, realAddress, isImpersonating } = useLensAwareAccount()

  // Use `address` for reading data (respects impersonation)
  const { data: balance } = useBalance({ address })

  // Use `realAddress` for signing transactions
  return (
    <div>
      <p>Viewing: {address}</p>
      {isImpersonating && <Badge>Lens Active</Badge>}
    </div>
  )
}
```

### Service API

```typescript
import { createLensService } from '@sigil/lens'

const lensService = createLensService()

// Impersonate an address
lensService.setImpersonatedAddress('0x...')

// Get current state
const state = lensService.getState()

// Save addresses for quick access
lensService.saveAddress({ address: '0x...', label: 'Whale' })

// Clear impersonation
lensService.clearImpersonation()
```

## API

### Hooks

| Hook | Description |
|------|-------------|
| `useLens()` | Get full lens state |
| `useLensContext()` | Get lens context for components |
| `useIsImpersonating()` | Check if currently impersonating |
| `useImpersonatedAddress()` | Get impersonated address |
| `useRealAddress()` | Get real connected address |
| `useEffectiveAddress()` | Get effective address (impersonated or real) |
| `useSavedAddresses()` | Get saved addresses and actions |
| `useLensActions()` | Get lens actions |

### Wagmi Hooks

| Hook | Description |
|------|-------------|
| `useLensAwareAccount()` | Wagmi useAccount that respects lens |

### Service

| Method | Description |
|--------|-------------|
| `getState()` | Get current state |
| `setImpersonatedAddress(address)` | Set impersonated address |
| `clearImpersonation()` | Clear impersonation |
| `saveAddress(entry)` | Save an address |
| `removeAddress(address)` | Remove saved address |
| `getContext()` | Get lens context |
| `subscribe(listener)` | Subscribe to state changes |

## Persistence

Saved addresses are persisted to localStorage under the key `sigil-lens-storage`.

## License

MIT
