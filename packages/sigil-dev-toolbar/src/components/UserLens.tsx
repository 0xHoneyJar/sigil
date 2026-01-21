import { useState, useCallback } from 'react'
import { isAddress } from 'viem'
import type { Address } from 'viem'
import { useDevToolbar } from '../providers/DevToolbarProvider'
import { useSavedAddresses, useIsImpersonating } from '../hooks/useUserLens'

/**
 * Validates an Ethereum address or ENS name
 */
function isValidAddressInput(input: string): boolean {
  // Check if it's a valid address
  if (isAddress(input)) return true
  // Check if it looks like an ENS name
  if (input.endsWith('.eth') && input.length > 4) return true
  return false
}

/**
 * Truncates an address for display
 */
function truncateAddress(address: string): string {
  if (address.length <= 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * User Lens panel for address impersonation
 */
export function UserLens() {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isResolving, setIsResolving] = useState(false)

  const { setImpersonatedAddress, disableLens, saveAddress, userLens } = useDevToolbar()
  const { savedAddresses, selectAddress, removeAddress } = useSavedAddresses()
  const isImpersonating = useIsImpersonating()

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)

      const trimmed = input.trim()
      if (!trimmed) return

      if (!isValidAddressInput(trimmed)) {
        setError('Invalid address or ENS name')
        return
      }

      // If it's an ENS name, we'd need to resolve it
      // For now, we just check if it's a valid address
      if (isAddress(trimmed)) {
        setImpersonatedAddress(trimmed as Address)
        setInput('')
      } else if (trimmed.endsWith('.eth')) {
        // ENS resolution would go here
        // For MVP, show placeholder
        setIsResolving(true)
        setError('ENS resolution not yet implemented. Please use address.')
        setIsResolving(false)
      }
    },
    [input, setImpersonatedAddress]
  )

  const handleClear = useCallback(() => {
    disableLens()
    setInput('')
    setError(null)
  }, [disableLens])

  const handleSaveCurrentAddress = useCallback(() => {
    const trimmed = input.trim()
    if (isAddress(trimmed)) {
      saveAddress({
        address: trimmed as Address,
        label: `Address ${savedAddresses.length + 1}`,
      })
    }
  }, [input, saveAddress, savedAddresses.length])

  return (
    <div className="sigil-user-lens">
      <div className="sigil-user-lens__header">
        <h3>User Lens</h3>
        {isImpersonating && (
          <span className="sigil-user-lens__badge">Active</span>
        )}
      </div>

      <p className="sigil-user-lens__description">
        View the app as another address. Reads use the impersonated address,
        transactions still sign with your real wallet.
      </p>

      <form onSubmit={handleSubmit} className="sigil-user-lens__form">
        <div className="sigil-user-lens__input-group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="0x... or name.eth"
            className="sigil-user-lens__input"
            disabled={isResolving}
          />
          <button
            type="submit"
            className="sigil-user-lens__button sigil-user-lens__button--primary"
            disabled={isResolving || !input.trim()}
          >
            {isResolving ? 'Resolving...' : 'Impersonate'}
          </button>
        </div>
        {error && <p className="sigil-user-lens__error">{error}</p>}
      </form>

      {isImpersonating && (
        <div className="sigil-user-lens__active">
          <div className="sigil-user-lens__active-header">
            <span>Currently viewing as:</span>
            <button
              onClick={handleClear}
              className="sigil-user-lens__button sigil-user-lens__button--danger"
            >
              Clear
            </button>
          </div>
          <code className="sigil-user-lens__address">
            {userLens.impersonatedAddress}
          </code>
        </div>
      )}

      {savedAddresses.length > 0 && (
        <div className="sigil-user-lens__saved">
          <h4>Saved Addresses</h4>
          <ul className="sigil-user-lens__saved-list">
            {savedAddresses.map((entry) => (
              <li key={entry.address} className="sigil-user-lens__saved-item">
                <button
                  onClick={() => selectAddress(entry.address)}
                  className="sigil-user-lens__saved-button"
                >
                  <span className="sigil-user-lens__saved-label">
                    {entry.label}
                  </span>
                  <span className="sigil-user-lens__saved-address">
                    {truncateAddress(entry.address)}
                  </span>
                </button>
                <button
                  onClick={() => removeAddress(entry.address)}
                  className="sigil-user-lens__remove"
                  aria-label="Remove"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {input && isAddress(input) && !savedAddresses.find((a) => a.address === input) && (
        <button
          onClick={handleSaveCurrentAddress}
          className="sigil-user-lens__button sigil-user-lens__button--secondary"
        >
          Save Address
        </button>
      )}
    </div>
  )
}

/**
 * Badge component showing when lens is active
 */
export function LensActiveBadge() {
  const isImpersonating = useIsImpersonating()

  if (!isImpersonating) return null

  return (
    <div className="sigil-lens-badge">
      <span className="sigil-lens-badge__icon">👁</span>
      <span className="sigil-lens-badge__text">Lens Active</span>
    </div>
  )
}
