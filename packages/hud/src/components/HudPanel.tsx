/**
 * HUD Panel Component
 *
 * Main panel container for the HUD.
 * Uses inline styles only - no Tailwind classes for consumer compatibility.
 */

import { useState, type ReactNode } from 'react'
import { useHud } from '../providers/HudProvider'
import { colors, typography, spacing, radii, shadows, zIndex } from '../styles/theme'
import type { HudPanelType, HudPosition } from '../types'

/**
 * Props for HudPanel
 */
export interface HudPanelProps {
  /** Panel content */
  children?: ReactNode
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
 * Position styles mapping - inline CSS instead of Tailwind classes
 */
const positionStyles: Record<HudPosition, React.CSSProperties> = {
  'bottom-right': { bottom: '16px', right: '16px' },
  'bottom-left': { bottom: '16px', left: '16px' },
  'top-right': { top: '16px', right: '16px' },
  'top-left': { top: '16px', left: '16px' },
}

/**
 * Extend window interface for Agentation
 */
declare global {
  interface Window {
    __agentation?: {
      toggle: () => void
      isActive?: () => boolean
    }
  }
}

/**
 * Agentation toggle button for visual annotations
 */
function AgentationToggle() {
  const [isActive, setIsActive] = useState(false)

  const toggle = () => {
    if (typeof window !== 'undefined' && window.__agentation) {
      window.__agentation.toggle()
      setIsActive(!isActive)
    } else {
      console.warn(
        'Agentation not installed. Add to your app:\n' +
        '  npm install agentation\n' +
        '  import { Agentation } from "agentation"\n' +
        '  {process.env.NODE_ENV === "development" && <Agentation />}'
      )
    }
  }

  return (
    <button
      onClick={toggle}
      title={isActive ? 'Stop annotating' : 'Start annotating UI elements'}
      style={{
        background: isActive ? colors.primaryLight : 'none',
        border: 'none',
        color: isActive ? colors.primary : colors.textDim,
        cursor: 'pointer',
        fontSize: typography.sm,
        padding: '2px 6px',
        borderRadius: radii.sm,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      📌 {isActive ? 'Annotating' : 'Annotate'}
    </button>
  )
}

/**
 * Main HUD panel component
 */
export function HudPanel({ children }: HudPanelProps) {
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

  return (
    <div
      data-sigil-hud="panel"
      style={{
        position: 'fixed',
        ...positionStyles[position],
        zIndex: zIndex.fixed,
        width: isMinimized ? '200px' : '400px',
        maxHeight: isMinimized ? '40px' : '600px',
        backgroundColor: colors.background,
        borderRadius: radii.lg,
        border: `1px solid ${colors.border}`,
        boxShadow: shadows.xl,
        fontFamily: typography.fontFamily,
        fontSize: typography.base,
        color: colors.text,
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
          borderBottom: isMinimized ? 'none' : `1px solid ${colors.border}`,
          backgroundColor: colors.backgroundHover,
        }}
      >
        <span style={{ fontWeight: typography.semibold, color: colors.primary }}>◆ Sigil HUD</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <AgentationToggle />
          <button
            onClick={toggleMinimized}
            style={{
              background: 'none',
              border: 'none',
              color: colors.textDim,
              cursor: 'pointer',
              fontSize: typography.lg,
            }}
          >
            {isMinimized ? '◻' : '–'}
          </button>
          <button
            onClick={close}
            style={{
              background: 'none',
              border: 'none',
              color: colors.textDim,
              cursor: 'pointer',
              fontSize: typography.lg,
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
              backgroundColor: colors.backgroundInput,
            }}
          >
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id)}
                style={{
                  flex: 1,
                  padding: `${spacing.sm} ${spacing.md}`,
                  background:
                    activePanel === tab.id
                      ? colors.primaryLight
                      : 'transparent',
                  border: 'none',
                  borderRadius: radii.sm,
                  color: activePanel === tab.id ? colors.primary : colors.textMuted,
                  cursor: 'pointer',
                  fontSize: typography.sm,
                  fontWeight: typography.medium,
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
              <div style={{ color: colors.textDim, textAlign: 'center', padding: spacing['2xl'] }}>
                Select a panel to get started
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
