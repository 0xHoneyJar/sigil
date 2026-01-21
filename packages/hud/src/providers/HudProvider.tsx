/**
 * HUD Provider
 *
 * Context provider for HUD state and services.
 */

import { createContext, useContext, useMemo } from 'react'
import type { HudProviderProps, HudContextValue, HudConfig } from '../types'
import { DEFAULT_HUD_CONFIG, DEFAULT_HUD_STATE } from '../types'
import { useHudStore } from '../store'

/**
 * HUD context
 */
const HudContext = createContext<HudContextValue | null>(null)

/**
 * HUD Provider component
 */
export function HudProvider({
  children,
  config = {},
  lensService,
  forkService,
  simulationService,
  diagnosticsService,
  anchorClient,
}: HudProviderProps) {
  // Get state and actions from store
  const isOpen = useHudStore((state) => state.isOpen)
  const activePanel = useHudStore((state) => state.activePanel)
  const position = useHudStore((state) => state.position)
  const isMinimized = useHudStore((state) => state.isMinimized)
  const open = useHudStore((state) => state.open)
  const close = useHudStore((state) => state.close)
  const toggle = useHudStore((state) => state.toggle)
  const setActivePanel = useHudStore((state) => state.setActivePanel)
  const setPosition = useHudStore((state) => state.setPosition)
  const toggleMinimized = useHudStore((state) => state.toggleMinimized)

  // Merge config with defaults
  const mergedConfig: HudConfig = useMemo(
    () => ({
      ...DEFAULT_HUD_CONFIG,
      ...config,
    }),
    [config]
  )

  // Build context value
  const value: HudContextValue = useMemo(
    () => ({
      // State
      isOpen,
      activePanel,
      position,
      isMinimized,
      // Actions
      open,
      close,
      toggle,
      setActivePanel,
      setPosition,
      toggleMinimized,
      // Services
      lensService: lensService ?? null,
      forkService: forkService ?? null,
      simulationService: simulationService ?? null,
      diagnosticsService: diagnosticsService ?? null,
      anchorClient: anchorClient ?? null,
      // Config
      config: mergedConfig,
    }),
    [
      isOpen,
      activePanel,
      position,
      isMinimized,
      open,
      close,
      toggle,
      setActivePanel,
      setPosition,
      toggleMinimized,
      lensService,
      forkService,
      simulationService,
      diagnosticsService,
      anchorClient,
      mergedConfig,
    ]
  )

  return <HudContext.Provider value={value}>{children}</HudContext.Provider>
}

/**
 * Hook to access HUD context
 *
 * @throws Error if used outside HudProvider
 */
export function useHud(): HudContextValue {
  const context = useContext(HudContext)
  if (!context) {
    throw new Error('useHud must be used within a HudProvider')
  }
  return context
}

/**
 * Hook to access HUD context (returns null if not in provider)
 */
export function useHudOptional(): HudContextValue | null {
  return useContext(HudContext)
}
