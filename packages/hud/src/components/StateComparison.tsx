/**
 * State Comparison Component
 *
 * Compare state between real and impersonated addresses.
 */

import { useHud } from '../providers/HudProvider'
import { DEFAULT_LENS_STATE } from '../types'

/**
 * Props for StateComparison
 */
export interface StateComparisonProps {
  /** Custom class name */
  className?: string
}

/**
 * State comparison panel
 */
export function StateComparison({ className = '' }: StateComparisonProps) {
  const { lensService, forkService, activePanel } = useHud()

  // Don't render if not the active panel
  if (activePanel !== 'state') return null

  const lensState = lensService?.getState() ?? DEFAULT_LENS_STATE
  const forkState = forkService?.getState()
  const isImpersonating = lensState.enabled && lensState.impersonatedAddress !== null

  return (
    <div className={className}>
      {/* Addresses */}
      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'block',
            color: '#888',
            fontSize: '10px',
            marginBottom: '8px',
          }}
        >
          Address Context
        </label>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Real Address */}
          <div
            style={{
              padding: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '4px',
              border: !isImpersonating
                ? '1px solid rgba(16, 185, 129, 0.3)'
                : '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px',
              }}
            >
              <span style={{ color: '#888', fontSize: '10px' }}>Real</span>
              {!isImpersonating && (
                <span
                  style={{
                    fontSize: '9px',
                    padding: '2px 6px',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderRadius: '4px',
                    color: '#10b981',
                  }}
                >
                  Active
                </span>
              )}
            </div>
            <code
              style={{
                fontSize: '10px',
                color: lensState.realAddress ? '#fff' : '#666',
                wordBreak: 'break-all',
              }}
            >
              {lensState.realAddress ?? 'Not connected'}
            </code>
          </div>

          {/* Impersonated Address */}
          <div
            style={{
              padding: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '4px',
              border: isImpersonating
                ? '1px solid rgba(16, 185, 129, 0.3)'
                : '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px',
              }}
            >
              <span style={{ color: '#888', fontSize: '10px' }}>Impersonated</span>
              {isImpersonating && (
                <span
                  style={{
                    fontSize: '9px',
                    padding: '2px 6px',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderRadius: '4px',
                    color: '#10b981',
                  }}
                >
                  Active
                </span>
              )}
            </div>
            <code
              style={{
                fontSize: '10px',
                color: lensState.impersonatedAddress ? '#fff' : '#666',
                wordBreak: 'break-all',
              }}
            >
              {lensState.impersonatedAddress ?? 'None'}
            </code>
          </div>
        </div>
      </div>

      {/* Fork State */}
      {forkState && (
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              color: '#888',
              fontSize: '10px',
              marginBottom: '8px',
            }}
          >
            Fork State
          </label>

          <div
            style={{
              padding: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '4px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '10px',
              }}
            >
              <div>
                <span style={{ color: '#666' }}>Status: </span>
                <span style={{ color: forkState.active ? '#10b981' : '#888' }}>
                  {forkState.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <span style={{ color: '#666' }}>Chain: </span>
                <span style={{ color: '#fff' }}>
                  {forkState.chainId ?? '—'}
                </span>
              </div>
              <div>
                <span style={{ color: '#666' }}>Block: </span>
                <span style={{ color: '#fff' }}>
                  {forkState.blockNumber?.toString() ?? '—'}
                </span>
              </div>
              <div>
                <span style={{ color: '#666' }}>Snapshots: </span>
                <span style={{ color: '#fff' }}>{forkState.snapshotCount}</span>
              </div>
            </div>

            {forkState.rpcUrl && (
              <div style={{ marginTop: '8px' }}>
                <span style={{ color: '#666', fontSize: '10px' }}>RPC: </span>
                <code
                  style={{
                    fontSize: '9px',
                    color: '#888',
                    wordBreak: 'break-all',
                  }}
                >
                  {forkState.rpcUrl}
                </code>
              </div>
            )}
          </div>
        </div>
      )}

      {/* State Comparison Info */}
      <div
        style={{
          padding: '12px',
          backgroundColor: 'rgba(251, 191, 36, 0.05)',
          border: '1px solid rgba(251, 191, 36, 0.2)',
          borderRadius: '4px',
        }}
      >
        <div
          style={{ color: '#fbbf24', fontSize: '11px', marginBottom: '8px' }}
        >
          State Comparison
        </div>
        <div style={{ color: '#888', fontSize: '10px', lineHeight: 1.6 }}>
          When impersonating, reads use the impersonated address while writes
          still use your real wallet. This lets you test how the UI looks for
          different users without affecting their funds.
        </div>
      </div>
    </div>
  )
}
