/**
 * @sigil/hud
 *
 * Diagnostic HUD for Sigil - composable React components for development.
 */

// Types
export type {
  HudPosition,
  HudConfig,
  HudPanelType,
  HudState,
  HudActions,
  HudContextValue,
  HudProviderProps,
  Observation,
  Signal,
  // Service types (mirrored from optional packages)
  LensService,
  LensState,
  ForkService,
  ForkState,
  SimulationService,
  SimulationState,
  DiagnosticsService,
  DiagnosticResult,
  DiagnosticIssue,
  EffectType,
  ComplianceResult,
  BehavioralCompliance,
  AnimationCompliance,
  MaterialCompliance,
} from './types'

export {
  DEFAULT_HUD_STATE,
  DEFAULT_HUD_CONFIG,
  DEFAULT_LENS_STATE,
} from './types'

// Store
export { useHudStore, getHudState } from './store'
export type { HudStore } from './store'

// Provider
export { HudProvider, useHud, useHudOptional } from './providers/HudProvider'

// Components
export { HudPanel } from './components/HudPanel'
export type { HudPanelProps } from './components/HudPanel'

export { HudTrigger } from './components/HudTrigger'
export type { HudTriggerProps } from './components/HudTrigger'

export { LensPanel } from './components/LensPanel'
export type { LensPanelProps } from './components/LensPanel'

export { SimulationPanel } from './components/SimulationPanel'
export type { SimulationPanelProps } from './components/SimulationPanel'

export { DiagnosticsPanel } from './components/DiagnosticsPanel'
export type { DiagnosticsPanelProps } from './components/DiagnosticsPanel'

export { PhysicsAnalysis } from './components/PhysicsAnalysis'
export type { PhysicsAnalysisProps } from './components/PhysicsAnalysis'

export { IssueList } from './components/IssueList'
export type { IssueListProps } from './components/IssueList'

export { DataSourceIndicator } from './components/DataSourceIndicator'
export type { DataSourceIndicatorProps, DataSourceType } from './components/DataSourceIndicator'

export { StateComparison } from './components/StateComparison'
export type { StateComparisonProps } from './components/StateComparison'

export { ObservationCaptureModal } from './components/ObservationCaptureModal'
export type { ObservationCaptureModalProps } from './components/ObservationCaptureModal'

export { FeedbackPrompt } from './components/FeedbackPrompt'
export type { FeedbackPromptProps } from './components/FeedbackPrompt'

// Hooks
export { useKeyboardShortcuts, getShortcutHelp } from './hooks/useKeyboardShortcuts'
export type { UseKeyboardShortcutsProps } from './hooks/useKeyboardShortcuts'

export { useSignalCapture } from './hooks/useSignalCapture'
export type { UseSignalCaptureProps } from './hooks/useSignalCapture'

export { useObservationCapture } from './hooks/useObservationCapture'
export type { UseObservationCaptureProps } from './hooks/useObservationCapture'

export { useDataSource, useMultipleDataSources } from './hooks/useDataSource'
export type {
  UseDataSourceProps,
  DataSourceMeta,
  DataSourceEntry,
} from './hooks/useDataSource'

// Theme
export {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  transitions,
  zIndex,
  patterns,
  effectColors,
  getEffectColor,
  createStyles,
} from './styles/theme'
