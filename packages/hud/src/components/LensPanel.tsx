/**
 * Lens Panel Component
 *
 * Panel for address impersonation controls.
 * FR-005 fix: All hooks called unconditionally at top level.
 */

import { useState, useCallback } from 'react'
import { useHud } from '../providers/HudProvider'
import { DEFAULT_LENS_STATE } from '../types'

/**
 * Props for LensPanel
 */
export interface LensPanelProps {
  /** Custom class name */
  className?: string
}

/**
 * Lens panel for address impersonation
 */
export function LensPanel({ className = '' }: LensPanelProps) {
  // FR-005 fix: All hooks called unconditionally at top level
  const { lensService, activePanel } = useHud()
  const [inputAddress, setInputAddress] = useState('')
  const [inputLabel, setInputLabel] = useState('')

  // Get state from service or use default
  const state = lensService?.getState() ?? DEFAULT_LENS_STATE
  const isImpersonating = state.enabled && state.impersonatedAddress !== null

  // Handle impersonation
  const handleImpersonate = useCallback(() => {
    if (!lensService || !inputAddress) return

    // Basic validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(inputAddress)) {
      alert('Invalid address format')
      return
    }

    lensService.setImpersonatedAddress(inputAddress as `0x${string}`)
    setInputAddress('')
  }, [lensService, inputAddress])

  // Handle save address
  const handleSaveAddress = useCallback(() => {
    if (!lensService || !inputAddress || !inputLabel) return

    lensService.saveAddress({
      address: inputAddress as `0x${string}`,
      label: inputLabel,
    })
    setInputAddress('')
    setInputLabel('')
  }, [lensService, inputAddress, inputLabel])

  // Handle stop impersonation
  const handleStopImpersonation = useCallback(() => {
    if (!lensService) return
    lensService.clearImpersonation()
  }, [lensService])

  // Don't render if not the active panel
  if (activePanel !== 'lens') return null

  // Show message if lens service not available
  if (!lensService) {
    return (
      <div className={className} style={{ color: '#666' }}>
        <p>Lens service not available.</p>
        <p style={{ fontSize: '10px', marginTop: '8px' }}>
          Install @sigil/lens to enable address impersonation.
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Current Status */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isImpersonating ? '#10b981' : '#666',
            }}
          />
          <span style={{ color: isImpersonating ? '#10b981' : '#888' }}>
            {isImpersonating ? 'Impersonating' : 'Not impersonating'}
          </span>
        </div>

        {isImpersonating && (
          <div style={{ marginLeft: '16px' }}>
            <code
              style={{
                fontSize: '11px',
                color: '#10b981',
                wordBreak: 'break-all',
              }}
            >
              {state.impersonatedAddress}
            </code>
            <button
              onClick={handleStopImpersonation}
              style={{
                display: 'block',
                marginTop: '8px',
                padding: '4px 8px',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '4px',
                color: '#ef4444',
                fontSize: '10px',
                cursor: 'pointer',
              }}
            >
              Stop Impersonation
            </button>
          </div>
        )}

        {state.realAddress && (
          <div style={{ marginTop: '8px', color: '#666', fontSize: '10px' }}>
            Real: {state.realAddress.slice(0, 6)}...{state.realAddress.slice(-4)}
          </div>
        )}
      </div>

      {/* Impersonate Address */}
      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            color: '#888',
            fontSize: '10px',
            marginBottom: '4px',
          }}
        >
          Impersonate Address
        </label>
        <input
          type="text"
          value={inputAddress}
          onChange={(e) => setInputAddress(e.target.value)}
          placeholder="0x..."
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '11px',
            fontFamily: 'ui-monospace, monospace',
          }}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button
            onClick={handleImpersonate}
            disabled={!inputAddress}
            style={{
              flex: 1,
              padding: '6px 12px',
              backgroundColor: inputAddress
                ? 'rgba(16, 185, 129, 0.2)'
                : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '4px',
              color: inputAddress ? '#10b981' : '#666',
              fontSize: '11px',
              cursor: inputAddress ? 'pointer' : 'not-allowed',
            }}
          >
            Impersonate
          </button>
        </div>
      </div>

      {/* Save Address */}
      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            color: '#888',
            fontSize: '10px',
            marginBottom: '4px',
          }}
        >
          Save with Label
        </label>
        <input
          type="text"
          value={inputLabel}
          onChange={(e) => setInputLabel(e.target.value)}
          placeholder="Label (e.g., Whale)"
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '11px',
            marginBottom: '8px',
          }}
        />
        <button
          onClick={handleSaveAddress}
          disabled={!inputAddress || !inputLabel}
          style={{
            width: '100%',
            padding: '6px 12px',
            backgroundColor:
              inputAddress && inputLabel
                ? 'rgba(59, 130, 246, 0.2)'
                : 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '4px',
            color: inputAddress && inputLabel ? '#3b82f6' : '#666',
            fontSize: '11px',
            cursor: inputAddress && inputLabel ? 'pointer' : 'not-allowed',
          }}
        >
          Save Address
        </button>
      </div>

      {/* Saved Addresses */}
      {state.savedAddresses.length > 0 && (
        <div>
          <label
            style={{
              display: 'block',
              color: '#888',
              fontSize: '10px',
              marginBottom: '8px',
            }}
          >
            Saved Addresses
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {state.savedAddresses.map((saved) => (
              <button
                key={saved.address}
                onClick={() =>
                  lensService?.setImpersonatedAddress(saved.address)
                }
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ color: '#fff', fontSize: '11px' }}>
                  {saved.label}
                </span>
                <code style={{ color: '#666', fontSize: '10px' }}>
                  {saved.address.slice(0, 6)}...{saved.address.slice(-4)}
                </code>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
