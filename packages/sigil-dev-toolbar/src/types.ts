import type { Address } from 'viem'

/**
 * Zone hierarchy for physics validation
 */
export type Zone = 'critical' | 'elevated' | 'standard' | 'local'

/**
 * Lens context for User Lens impersonation validation
 */
export interface LensContext {
  /** Address being impersonated */
  impersonatedAddress: string
  /** Real user address (for signing) */
  realAddress?: string
  /** Component being validated */
  component: string
  /** Value observed in the UI */
  observedValue?: string
  /** Value from on-chain read */
  onChainValue?: string
  /** Value from indexer (Envio, Subgraph) */
  indexedValue?: string
  /** Data source used by component */
  dataSource?: 'on-chain' | 'indexed' | 'mixed' | 'unknown'
}

/**
 * Lens validation issue types
 */
export type LensIssueType =
  | 'data_source_mismatch'
  | 'stale_indexed_data'
  | 'lens_financial_check'
  | 'impersonation_leak'

/**
 * Lens validation issue severity
 */
export type LensIssueSeverity = 'error' | 'warning' | 'info'

/**
 * Individual lens validation issue
 */
export interface LensValidationIssue {
  /** Issue type */
  type: LensIssueType
  /** Severity */
  severity: LensIssueSeverity
  /** Human-readable message */
  message: string
  /** Component where issue was found */
  component: string
  /** Zone context */
  zone?: Zone
  /** Expected value */
  expected?: string
  /** Actual value */
  actual?: string
  /** Suggested fix */
  suggestion?: string
}

/**
 * Lens validation result
 */
export interface LensValidationResult {
  /** Whether validation passed */
  valid: boolean
  /** List of issues found */
  issues: LensValidationIssue[]
  /** Summary message */
  summary: string
}

/**
 * User Lens state for address impersonation
 */
export interface UserLensState {
  /** Whether impersonation is enabled */
  enabled: boolean
  /** The address being impersonated (for reads) */
  impersonatedAddress: Address | null
  /** Saved addresses for quick selection */
  savedAddresses: SavedAddress[]
}

/**
 * Saved address entry
 */
export interface SavedAddress {
  address: Address
  label: string
  ens?: string
}

/**
 * Simulation state for testing scenarios
 */
export interface SimulationState {
  /** Whether simulation mode is active */
  enabled: boolean
  /** Current simulation scenario */
  scenario: SimulationScenario | null
}

/**
 * Simulation scenario configuration
 */
export interface SimulationScenario {
  id: string
  name: string
  description: string
  /** Override values for contract reads */
  overrides: Record<string, unknown>
}

/**
 * Comparison state for before/after views
 */
export interface ComparisonState {
  /** Whether comparison mode is active */
  enabled: boolean
  /** Captured "before" state */
  beforeState: Record<string, unknown> | null
  /** Current "after" state */
  afterState: Record<string, unknown> | null
}

/**
 * Diagnostics state for debugging
 */
export interface DiagnosticsState {
  /** Whether diagnostics panel is open */
  enabled: boolean
  /** Recent physics violations */
  violations: PhysicsViolation[]
  /** Recent taste signals */
  tasteSignals: TasteSignal[]
}

/**
 * Physics violation detected by toolbar
 */
export interface PhysicsViolation {
  id: string
  timestamp: number
  type: 'behavioral' | 'animation' | 'material' | 'protected'
  severity: 'error' | 'warning' | 'info'
  message: string
  element?: string
  suggestion?: string
}

/**
 * Taste signal for preference learning
 */
export interface TasteSignal {
  id: string
  timestamp: number
  type: 'ACCEPT' | 'MODIFY' | 'REJECT'
  component: string
  effect: string
  change?: {
    from: string
    to: string
  }
}

/**
 * Dev toolbar configuration options
 */
export interface DevToolbarConfig {
  /** Position of the toolbar */
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  /** Initial collapsed state */
  defaultCollapsed: boolean
  /** Enable User Lens feature */
  enableUserLens: boolean
  /** Enable Simulation feature */
  enableSimulation: boolean
  /** Enable Comparison feature */
  enableComparison: boolean
  /** Enable Diagnostics feature */
  enableDiagnostics: boolean
  /** Keyboard shortcut to toggle toolbar */
  toggleShortcut: string
  /** Callback for Anchor/Lens IPC */
  onAnchorRequest?: (request: AnchorRequest) => Promise<AnchorResponse>
  /** Callback for taste signal logging */
  onTasteSignal?: (signal: TasteSignal) => void
}

/**
 * Anchor verification request
 */
export interface AnchorRequest {
  type: 'validate' | 'verify' | 'check'
  context: {
    address: Address
    isImpersonating: boolean
    realAddress?: Address
  }
  payload: Record<string, unknown>
}

/**
 * Anchor verification response
 */
export interface AnchorResponse {
  valid: boolean
  violations?: PhysicsViolation[]
  suggestions?: string[]
}

/**
 * Active tab in the toolbar
 */
export type ToolbarTab = 'lens' | 'simulate' | 'compare' | 'diagnose'

/**
 * Complete toolbar state
 */
export interface DevToolbarState {
  /** Whether toolbar is visible */
  visible: boolean
  /** Whether toolbar is collapsed */
  collapsed: boolean
  /** Currently active tab */
  activeTab: ToolbarTab
  /** User Lens state */
  userLens: UserLensState
  /** Simulation state */
  simulation: SimulationState
  /** Comparison state */
  comparison: ComparisonState
  /** Diagnostics state */
  diagnostics: DiagnosticsState
}

/**
 * Dev toolbar store actions
 */
export interface DevToolbarActions {
  // Visibility
  show: () => void
  hide: () => void
  toggle: () => void
  collapse: () => void
  expand: () => void
  setActiveTab: (tab: ToolbarTab) => void

  // User Lens
  enableLens: (address: Address) => void
  disableLens: () => void
  setImpersonatedAddress: (address: Address | null) => void
  saveAddress: (entry: SavedAddress) => void
  removeAddress: (address: Address) => void

  // Simulation
  enableSimulation: (scenario: SimulationScenario) => void
  disableSimulation: () => void

  // Comparison
  captureBeforeState: (state: Record<string, unknown>) => void
  captureAfterState: (state: Record<string, unknown>) => void
  clearComparison: () => void

  // Diagnostics
  addViolation: (violation: PhysicsViolation) => void
  clearViolations: () => void
  addTasteSignal: (signal: TasteSignal) => void
  clearTasteSignals: () => void

  // Reset
  reset: () => void
}
