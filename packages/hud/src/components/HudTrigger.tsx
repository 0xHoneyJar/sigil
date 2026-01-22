/**
 * HUD Trigger Component
 *
 * Floating button to open the HUD.
 * Uses inline styles only - no Tailwind classes for consumer compatibility.
 */

import type { ReactNode } from 'react'
import { useHud } from '../providers/HudProvider'
import { colors, shadows, transitions, zIndex } from '../styles/theme'
import type { HudPosition } from '../types'

/**
 * Props for HudTrigger
 */
export interface HudTriggerProps {
  /** Custom children (replaces default icon) */
  children?: ReactNode
  /** Override position (defaults to HUD position) */
  position?: HudPosition
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
 * Floating trigger button to open the HUD
 */
export function HudTrigger({
  children,
  position: overridePosition,
}: HudTriggerProps) {
  const { isOpen, toggle, position: hudPosition } = useHud()

  const position = overridePosition ?? hudPosition

  // Don't show trigger when HUD is open
  if (isOpen) return null

  return (
    <button
      onClick={toggle}
      style={{
        position: 'fixed',
        ...positionStyles[position],
        zIndex: zIndex.fixed,
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        backgroundColor: colors.primary,
        border: `2px solid ${colors.primaryBorder}`,
        boxShadow: shadows.primary,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: `transform ${transitions.slow}, box-shadow ${transitions.slow}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)'
        e.currentTarget.style.boxShadow = shadows.primaryHover
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = shadows.primary
      }}
      aria-label="Open Sigil HUD"
      title="Sigil HUD (Ctrl+Shift+D)"
      data-sigil-hud="trigger"
    >
      {children ?? (
        <span style={{ color: colors.text, fontSize: '18px', fontWeight: 600 }}>
          ◆
        </span>
      )}
    </button>
  )
}
