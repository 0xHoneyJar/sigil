import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  DevToolbarState,
  DevToolbarActions,
  DevToolbarConfig,
  SavedAddress,
  SimulationScenario,
  PhysicsViolation,
  TasteSignal,
  ToolbarTab,
} from '../types'
import type { Address } from 'viem'

/**
 * Initial state for the toolbar
 */
const initialState: DevToolbarState = {
  visible: true,
  collapsed: true,
  activeTab: 'lens',
  userLens: {
    enabled: false,
    impersonatedAddress: null,
    savedAddresses: [],
  },
  simulation: {
    enabled: false,
    scenario: null,
  },
  comparison: {
    enabled: false,
    beforeState: null,
    afterState: null,
  },
  diagnostics: {
    enabled: false,
    violations: [],
    tasteSignals: [],
  },
}

/**
 * Create the Zustand store with persistence
 */
type DevToolbarStore = DevToolbarState & DevToolbarActions

const createDevToolbarStore = (config: Partial<DevToolbarConfig>) =>
  create<DevToolbarStore>()(
    persist(
      (set, get) => ({
        ...initialState,
        collapsed: config.defaultCollapsed ?? true,

        // Visibility
        show: () => set({ visible: true }),
        hide: () => set({ visible: false }),
        toggle: () => set((state) => ({ visible: !state.visible })),
        collapse: () => set({ collapsed: true }),
        expand: () => set({ collapsed: false }),
        setActiveTab: (tab: ToolbarTab) => set({ activeTab: tab, collapsed: false }),

        // User Lens
        enableLens: (address: Address) =>
          set({
            userLens: {
              ...get().userLens,
              enabled: true,
              impersonatedAddress: address,
            },
          }),
        disableLens: () =>
          set({
            userLens: {
              ...get().userLens,
              enabled: false,
            },
          }),
        setImpersonatedAddress: (address: Address | null) =>
          set({
            userLens: {
              ...get().userLens,
              impersonatedAddress: address,
              enabled: address !== null,
            },
          }),
        saveAddress: (entry: SavedAddress) =>
          set({
            userLens: {
              ...get().userLens,
              savedAddresses: [
                ...get().userLens.savedAddresses.filter((a) => a.address !== entry.address),
                entry,
              ],
            },
          }),
        removeAddress: (address: Address) =>
          set({
            userLens: {
              ...get().userLens,
              savedAddresses: get().userLens.savedAddresses.filter((a) => a.address !== address),
            },
          }),

        // Simulation
        enableSimulation: (scenario: SimulationScenario) =>
          set({
            simulation: {
              enabled: true,
              scenario,
            },
          }),
        disableSimulation: () =>
          set({
            simulation: {
              enabled: false,
              scenario: null,
            },
          }),

        // Comparison
        captureBeforeState: (state: Record<string, unknown>) =>
          set({
            comparison: {
              ...get().comparison,
              enabled: true,
              beforeState: state,
            },
          }),
        captureAfterState: (state: Record<string, unknown>) =>
          set({
            comparison: {
              ...get().comparison,
              afterState: state,
            },
          }),
        clearComparison: () =>
          set({
            comparison: {
              enabled: false,
              beforeState: null,
              afterState: null,
            },
          }),

        // Diagnostics
        addViolation: (violation: PhysicsViolation) =>
          set({
            diagnostics: {
              ...get().diagnostics,
              violations: [...get().diagnostics.violations.slice(-49), violation],
            },
          }),
        clearViolations: () =>
          set({
            diagnostics: {
              ...get().diagnostics,
              violations: [],
            },
          }),
        addTasteSignal: (signal: TasteSignal) => {
          set({
            diagnostics: {
              ...get().diagnostics,
              tasteSignals: [...get().diagnostics.tasteSignals.slice(-49), signal],
            },
          })
          // Call external callback if provided
          config.onTasteSignal?.(signal)
        },
        clearTasteSignals: () =>
          set({
            diagnostics: {
              ...get().diagnostics,
              tasteSignals: [],
            },
          }),

        // Reset
        reset: () => set(initialState),
      }),
      {
        name: 'sigil-dev-toolbar',
        partialize: (state) => ({
          collapsed: state.collapsed,
          activeTab: state.activeTab,
          userLens: {
            savedAddresses: state.userLens.savedAddresses,
          },
        }),
      }
    )
  )

/**
 * Context for the store
 */
const DevToolbarContext = createContext<ReturnType<typeof createDevToolbarStore> | null>(null)

/**
 * Context for the config
 */
const DevToolbarConfigContext = createContext<DevToolbarConfig | null>(null)

/**
 * Default configuration
 */
const defaultConfig: DevToolbarConfig = {
  position: 'bottom-right',
  defaultCollapsed: true,
  enableUserLens: true,
  enableSimulation: true,
  enableComparison: true,
  enableDiagnostics: true,
  toggleShortcut: 'ctrl+shift+d',
}

/**
 * Props for DevToolbarProvider
 */
export interface DevToolbarProviderProps {
  children: ReactNode
  config?: Partial<DevToolbarConfig>
}

/**
 * Provider component for the dev toolbar
 */
export function DevToolbarProvider({ children, config: userConfig }: DevToolbarProviderProps) {
  const config = useMemo(() => ({ ...defaultConfig, ...userConfig }), [userConfig])
  const store = useMemo(() => createDevToolbarStore(config), [config])

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = config.toggleShortcut.toLowerCase().split('+')
      const ctrlMatch = keys.includes('ctrl') === (e.ctrlKey || e.metaKey)
      const shiftMatch = keys.includes('shift') === e.shiftKey
      const altMatch = keys.includes('alt') === e.altKey
      const keyMatch = keys.filter((k) => !['ctrl', 'shift', 'alt'].includes(k))[0] === e.key.toLowerCase()

      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        e.preventDefault()
        store.getState().toggle()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [config.toggleShortcut, store])

  return (
    <DevToolbarConfigContext.Provider value={config}>
      <DevToolbarContext.Provider value={store}>{children}</DevToolbarContext.Provider>
    </DevToolbarConfigContext.Provider>
  )
}

/**
 * Hook to access the dev toolbar store
 */
export function useDevToolbar(): DevToolbarStore {
  const store = useContext(DevToolbarContext)
  if (!store) {
    throw new Error('useDevToolbar must be used within a DevToolbarProvider')
  }
  return store()
}

/**
 * Hook to access specific state with selector
 */
export function useDevToolbarSelector<T>(selector: (state: DevToolbarStore) => T): T {
  const store = useContext(DevToolbarContext)
  if (!store) {
    throw new Error('useDevToolbarSelector must be used within a DevToolbarProvider')
  }
  return store(selector)
}

/**
 * Hook to access the toolbar config
 */
export function useDevToolbarConfig(): DevToolbarConfig {
  const config = useContext(DevToolbarConfigContext)
  if (!config) {
    throw new Error('useDevToolbarConfig must be used within a DevToolbarProvider')
  }
  return config
}
