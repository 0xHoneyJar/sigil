/**
 * HUD Store
 *
 * Zustand store for HUD state management.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HudState, HudActions, HudPosition, HudPanelType } from './types'
import { DEFAULT_HUD_STATE } from './types'

/**
 * Combined HUD store type
 */
export type HudStore = HudState & HudActions

/**
 * Create the HUD store
 */
export const useHudStore = create<HudStore>()(
  persist(
    (set) => ({
      ...DEFAULT_HUD_STATE,

      open: () => set({ isOpen: true }),

      close: () => set({ isOpen: false }),

      toggle: () => set((state) => ({ isOpen: !state.isOpen })),

      setActivePanel: (panel: HudPanelType | null) =>
        set({ activePanel: panel }),

      setPosition: (position: HudPosition) => set({ position }),

      toggleMinimized: () =>
        set((state) => ({ isMinimized: !state.isMinimized })),
    }),
    {
      name: 'sigil-hud-storage',
      partialize: (state) => ({
        position: state.position,
        isMinimized: state.isMinimized,
      }),
    }
  )
)

/**
 * Get HUD store state (for non-React contexts)
 */
export function getHudState(): HudState {
  const state = useHudStore.getState()
  return {
    isOpen: state.isOpen,
    activePanel: state.activePanel,
    position: state.position,
    isMinimized: state.isMinimized,
  }
}
