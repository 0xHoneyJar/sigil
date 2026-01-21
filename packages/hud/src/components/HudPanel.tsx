/**
 * HUD Panel Component
 *
 * Main panel container for the HUD.
 */

import type { ReactNode } from 'react'
import { useHud } from '../providers/HudProvider'
import type { HudPanelType } from '../types'

/**
 * Props for HudPanel
 */
export interface HudPanelProps {
  /** Panel content */
  children?: ReactNode
  /** Custom class name */
  className?: string
}

/**
 * Panel tab configuration
 */
interface PanelTab {
  id: HudPanelType
  label: string
  available: boolean
}

/**
 * Main HUD panel component
 */
export function HudPanel({ children, className = '' }: HudPanelProps) {
  const {
    isOpen,
    isMinimized,
    activePanel,
    position,
    setActivePanel,
    toggleMinimized,
    close,
    lensService,
    forkService,
    simulationService,
    diagnosticsService,
  } = useHud()

  if (!isOpen) return null

  // Determine which tabs are available based on services
  const tabs: PanelTab[] = [
    { id: 'lens', label: 'Lens', available: lensService !== null },
    { id: 'simulation', label: 'Simulation', available: simulationService !== null },
    { id: 'diagnostics', label: 'Diagnostics', available: diagnosticsService !== null },
    { id: 'state', label: 'State', available: forkService !== null },
    { id: 'signals', label: 'Signals', available: true },
  ]

  const availableTabs = tabs.filter((t) => t.available)

  // Position classes
  const positionClasses: Record<typeof position, string> = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  }

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 ${className}`}
      style={{
        width: isMinimized ? '200px' : '400px',
        maxHeight: isMinimized ? '40px' : '600px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        fontFamily: 'ui-monospace, monospace',
        fontSize: '12px',
        color: '#fff',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderBottom: isMinimized ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <span style={{ fontWeight: 600, color: '#10b981' }}>◆ Sigil HUD</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={toggleMinimized}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {isMinimized ? '◻' : '–'}
          </button>
          <button
            onClick={close}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ×
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '2px',
              padding: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id)}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  background:
                    activePanel === tab.id
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  color: activePanel === tab.id ? '#10b981' : '#888',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 500,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div
            style={{
              padding: '12px',
              overflowY: 'auto',
              maxHeight: '500px',
            }}
          >
            {children}
            {!activePanel && (
              <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                Select a panel to get started
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
