/**
 * Keyboard Shortcuts Hook
 *
 * Handle keyboard shortcuts for HUD navigation.
 */

import { useEffect, useCallback } from 'react'
import { useHudStore } from '../store'
import type { HudPanelType } from '../types'

/**
 * Default keyboard shortcuts
 */
const DEFAULT_SHORTCUTS: Record<string, () => void> = {}

/**
 * Props for useKeyboardShortcuts
 */
export interface UseKeyboardShortcutsProps {
  /** Whether shortcuts are enabled */
  enabled?: boolean
  /** Custom shortcuts to add */
  customShortcuts?: Record<string, () => void>
}

/**
 * Hook to handle keyboard shortcuts for HUD
 */
export function useKeyboardShortcuts({
  enabled = true,
  customShortcuts = {},
}: UseKeyboardShortcutsProps = {}) {
  const toggle = useHudStore((state) => state.toggle)
  const setActivePanel = useHudStore((state) => state.setActivePanel)
  const isOpen = useHudStore((state) => state.isOpen)

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Ignore if typing in an input
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Cmd/Ctrl + Shift + D: Toggle HUD
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'd') {
        event.preventDefault()
        toggle()
        return
      }

      // Only handle panel shortcuts when HUD is open
      if (!isOpen) return

      // Number keys for panels when HUD is open
      const panelMap: Record<string, HudPanelType> = {
        '1': 'lens',
        '2': 'simulation',
        '3': 'diagnostics',
        '4': 'state',
        '5': 'signals',
      }

      if (panelMap[event.key]) {
        event.preventDefault()
        setActivePanel(panelMap[event.key])
        return
      }

      // Escape to close
      if (event.key === 'Escape') {
        event.preventDefault()
        toggle()
        return
      }

      // Custom shortcuts
      const shortcutKey = getShortcutKey(event)
      if (customShortcuts[shortcutKey]) {
        event.preventDefault()
        customShortcuts[shortcutKey]()
      }
    },
    [enabled, toggle, setActivePanel, isOpen, customShortcuts]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, handleKeyDown])
}

/**
 * Get shortcut key string from event
 */
function getShortcutKey(event: KeyboardEvent): string {
  const parts: string[] = []

  if (event.metaKey) parts.push('cmd')
  if (event.ctrlKey) parts.push('ctrl')
  if (event.altKey) parts.push('alt')
  if (event.shiftKey) parts.push('shift')
  parts.push(event.key.toLowerCase())

  return parts.join('+')
}

/**
 * Get keyboard shortcut help text
 */
export function getShortcutHelp(): Array<{ keys: string; description: string }> {
  return [
    { keys: '⌘⇧D', description: 'Toggle HUD' },
    { keys: '1-5', description: 'Switch panels (when open)' },
    { keys: 'Esc', description: 'Close HUD' },
  ]
}
