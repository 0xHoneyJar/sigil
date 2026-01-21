/**
 * Simulation Panel Component
 *
 * Panel for transaction simulation controls.
 */

import { useHud } from '../providers/HudProvider'

/**
 * Props for SimulationPanel
 */
export interface SimulationPanelProps {
  /** Custom class name */
  className?: string
}

/**
 * Simulation panel for transaction dry-runs
 */
export function SimulationPanel({ className = '' }: SimulationPanelProps) {
  const { simulationService, forkService, activePanel } = useHud()

  // Don't render if not the active panel
  if (activePanel !== 'simulation') return null

  // Show message if simulation service not available
  if (!simulationService) {
    return (
      <div className={className} style={{ color: '#666' }}>
        <p>Simulation service not available.</p>
        <p style={{ fontSize: '10px', marginTop: '8px' }}>
          Install @sigil/simulation to enable transaction simulation.
        </p>
      </div>
    )
  }

  const forkState = forkService?.getState()
  const forkActive = forkState?.active ?? false

  return (
    <div className={className}>
      {/* Fork Status */}
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
              backgroundColor: forkActive ? '#10b981' : '#666',
            }}
          />
          <span style={{ color: forkActive ? '#10b981' : '#888' }}>
            {forkActive ? 'Fork Active' : 'No Fork'}
          </span>
        </div>

        {forkState && forkActive && (
          <div
            style={{
              padding: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '4px',
              fontSize: '10px',
            }}
          >
            <div style={{ color: '#888', marginBottom: '4px' }}>
              Chain: {forkState.chainId}
            </div>
            <div style={{ color: '#888', marginBottom: '4px' }}>
              Block: {forkState.blockNumber?.toString()}
            </div>
            <div style={{ color: '#888' }}>
              Snapshots: {forkState.snapshotCount}
            </div>
          </div>
        )}
      </div>

      {/* Simulation Info */}
      <div
        style={{
          padding: '12px',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '4px',
        }}
      >
        <div style={{ color: '#3b82f6', fontSize: '11px', marginBottom: '8px' }}>
          Transaction Simulation
        </div>
        <div style={{ color: '#888', fontSize: '10px', lineHeight: 1.6 }}>
          Simulate transactions before sending them on-chain. View gas estimates,
          balance changes, and potential revert reasons.
        </div>
        <div
          style={{
            marginTop: '12px',
            padding: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
            fontSize: '10px',
            color: '#666',
          }}
        >
          To simulate a transaction, use the simulation service programmatically:
          <pre
            style={{
              marginTop: '8px',
              fontFamily: 'ui-monospace, monospace',
              color: '#10b981',
            }}
          >
            {`simulationService.simulate({
  from: '0x...',
  to: '0x...',
  value: 1000000n,
  data: '0x...'
})`}
          </pre>
        </div>
      </div>

      {/* Features List */}
      <div style={{ marginTop: '16px' }}>
        <label
          style={{
            display: 'block',
            color: '#888',
            fontSize: '10px',
            marginBottom: '8px',
          }}
        >
          Simulation Features
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { icon: '⛽', label: 'Gas estimation' },
            { icon: '💰', label: 'Balance changes' },
            { icon: '📝', label: 'State changes' },
            { icon: '❌', label: 'Revert reasons' },
            { icon: '📊', label: 'Event logs' },
          ].map((feature) => (
            <div
              key={feature.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 8px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '4px',
                fontSize: '11px',
                color: '#888',
              }}
            >
              <span>{feature.icon}</span>
              <span>{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
