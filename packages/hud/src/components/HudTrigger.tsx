/**
 * HUD Trigger Component
 *
 * Floating button to open the HUD.
 */

import type { ReactNode } from 'react'
import { useHud } from '../providers/HudProvider'
import type { HudPosition } from '../types'

/**
 * Props for HudTrigger
 */
export interface HudTriggerProps {
  /** Custom class name */
  className?: string
  /** Custom children (replaces default icon) */
  children?: ReactNode
  /** Override position (defaults to HUD position) */
  position?: HudPosition
}

/**
 * Floating trigger button to open the HUD
 */
export function HudTrigger({
  className = '',
  children,
  position: overridePosition,
}: HudTriggerProps) {
  const { isOpen, toggle, position: hudPosition } = useHud()

  const position = overridePosition ?? hudPosition

  // Position classes
  const positionClasses: Record<typeof position, string> = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  }

  // Don't show trigger when HUD is open
  if (isOpen) return null

  return (
    <button
      onClick={toggle}
      className={`fixed ${positionClasses[position]} z-50 ${className}`}
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        backgroundColor: 'rgba(16, 185, 129, 0.9)',
        border: '2px solid rgba(16, 185, 129, 0.3)',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)'
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
      }}
      aria-label="Open Sigil HUD"
      title="Sigil HUD (⌘⇧D)"
    >
      {children ?? (
        <span style={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>
          ◆
        </span>
      )}
    </button>
  )
}
