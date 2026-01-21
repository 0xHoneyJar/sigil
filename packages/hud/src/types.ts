/**
 * @sigil/hud
 *
 * Types for the diagnostic HUD.
 */

import type { ReactNode } from 'react'

// Local interfaces for optional services
// These mirror the actual service interfaces from optional packages

export interface LensState {
  enabled: boolean
  impersonatedAddress: string | null
  realAddress: string | null
  savedAddresses: Array<{ address: string; label: string }>
}

export interface LensService {
  getState(): LensState
  setImpersonatedAddress(address: string): void
  clearImpersonation(): void
  saveAddress(entry: { address: string; label: string }): void
  enable(): void
  disable(): void
}

export interface ForkState {
  active: boolean
  chainId?: number
  blockNumber?: number
  snapshotCount?: number
  rpcUrl?: string
}

export interface ForkService {
  getState(): ForkState
}

export interface SimulationState {
  isRunning: boolean
  lastResult: unknown | null
}

export interface SimulationService {
  getState(): SimulationState
}

export interface DiagnosticIssue {
  severity: 'error' | 'warning' | 'info'
  code: string
  message: string
  suggestion?: string
}

export type EffectType = 'financial' | 'destructive' | 'soft-delete' | 'standard' | 'local' | 'navigation' | 'query'

export interface BehavioralCompliance {
  sync: string
  timing: number
  confirmation: boolean
  compliant: boolean
}

export interface AnimationCompliance {
  easing: string
  duration: number
  compliant: boolean
}

export interface MaterialCompliance {
  surface: string
  shadow: string
  compliant: boolean
}

export interface ComplianceResult {
  behavioral: BehavioralCompliance
  animation: AnimationCompliance
  material: MaterialCompliance
}

export interface DiagnosticResult {
  component: string
  effect: EffectType
  issues: DiagnosticIssue[]
  compliance: ComplianceResult
  suggestions: string[]
}

export interface DiagnosticsService {
  analyze(component: string, code?: string): Promise<DiagnosticResult>
  diagnose(symptom: string): string
  checkCompliance(effect: string, physics: unknown): boolean
  detectEffect(keywords: string[], types?: string[]): string
}

// Anchor client is not directly used but kept for compatibility
export type AnchorClient = unknown

/**
 * HUD panel position
 */
export type HudPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'

/**
 * HUD configuration
 */
export interface HudConfig {
  /** Enable keyboard shortcuts */
  shortcuts?: boolean
  /** Default panel position */
  position?: HudPosition
  /** Persist panel state to localStorage */
  persist?: boolean
  /** Enable observation capture */
  observationCapture?: boolean
  /** Enable signal capture */
  signalCapture?: boolean
  /** Default panel to open */
  defaultPanel?: HudPanelType
}

/**
 * HUD panel types
 */
export type HudPanelType =
  | 'lens'
  | 'simulation'
  | 'diagnostics'
  | 'state'
  | 'signals'

/**
 * HUD state
 */
export interface HudState {
  /** Whether HUD is open */
  isOpen: boolean
  /** Current active panel */
  activePanel: HudPanelType | null
  /** Panel position */
  position: HudPosition
  /** Whether HUD is minimized */
  isMinimized: boolean
}

/**
 * HUD actions
 */
export interface HudActions {
  /** Open the HUD */
  open: () => void
  /** Close the HUD */
  close: () => void
  /** Toggle HUD visibility */
  toggle: () => void
  /** Set active panel */
  setActivePanel: (panel: HudPanelType | null) => void
  /** Set position */
  setPosition: (position: HudPosition) => void
  /** Toggle minimized state */
  toggleMinimized: () => void
}

/**
 * HUD context value
 */
export interface HudContextValue extends HudState, HudActions {
  /** Lens service instance (if available) */
  lensService: LensService | null
  /** Fork service instance (if available) */
  forkService: ForkService | null
  /** Simulation service instance (if available) */
  simulationService: SimulationService | null
  /** Diagnostics service instance (if available) */
  diagnosticsService: DiagnosticsService | null
  /** Anchor client instance (if available) */
  anchorClient: AnchorClient | null
  /** HUD configuration */
  config: HudConfig
}

/**
 * HUD provider props
 */
export interface HudProviderProps {
  children: ReactNode
  config?: HudConfig
  /** Optional package instances (for composition) */
  lensService?: LensService
  forkService?: ForkService
  simulationService?: SimulationService
  diagnosticsService?: DiagnosticsService
  anchorClient?: AnchorClient
}

/**
 * Observation for capturing user insights
 */
export interface Observation {
  id: string
  timestamp: string
  type: 'user-truth' | 'issue' | 'insight'
  content: string
  tags: string[]
  context?: {
    component?: string
    effect?: string
    lensAddress?: string
    screenshot?: string
  }
  linkedSignals?: string[]
}

/**
 * Taste signal for learning user preferences
 */
export interface Signal {
  timestamp: string
  signal: 'ACCEPT' | 'MODIFY' | 'REJECT'
  source: 'cli' | 'toolbar' | 'hud'
  component: {
    name: string
    effect: string
    craft_type: 'generate' | 'diagnose' | 'repair'
  }
  physics?: {
    behavioral?: { sync: string; timing: string; confirmation: string }
    animation?: { easing: string; duration: string }
    material?: { surface: string; shadow: string; radius: string }
  }
  hud_context?: {
    panel_visible: boolean
    diagnostics_shown: boolean
    observation_linked?: string
  }
  change?: { from: string; to: string }
  learning?: { inference: string; recommendation?: string }
  rejection_reason?: string
}

/**
 * Default HUD state
 */
export const DEFAULT_HUD_STATE: HudState = {
  isOpen: false,
  activePanel: null,
  position: 'bottom-right',
  isMinimized: false,
}

/**
 * Default HUD config
 */
export const DEFAULT_HUD_CONFIG: HudConfig = {
  shortcuts: true,
  position: 'bottom-right',
  persist: true,
  observationCapture: true,
  signalCapture: true,
}

/**
 * Default lens state for when lens service is not available
 */
export const DEFAULT_LENS_STATE: LensState = {
  enabled: false,
  impersonatedAddress: null,
  realAddress: null,
  savedAddresses: [],
}
