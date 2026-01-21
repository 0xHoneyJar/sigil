// Types
export * from './types'

// Provider
export {
  DevToolbarProvider,
  useDevToolbar,
  useDevToolbarSelector,
  useDevToolbarConfig,
  type DevToolbarProviderProps,
} from './providers/DevToolbarProvider'

// Hooks
export {
  useLensAwareAccount,
  useIsImpersonating,
  useImpersonatedAddress,
  useSavedAddresses,
  type LensAwareAccount,
} from './hooks/useUserLens'

export { useIPCClient, type UseIPCClientReturn } from './hooks/useIPCClient'

export { useForkState, type UseForkStateReturn } from './hooks/useForkState'

export {
  useTransactionSimulation,
  useSimulation,
  type TransactionInput,
  type UseTransactionSimulationConfig,
  type UseTransactionSimulationReturn,
} from './hooks/useTransactionSimulation'

// Components
export { UserLens, LensActiveBadge } from './components/UserLens'
export { DevToolbar, DevToolbarTrigger, DevToolbarWithTrigger } from './components/DevToolbar'
export { DiagnosticPanel, useDiagnosticItems, type DiagnosticPanelProps } from './components/DiagnosticPanel'
export { SimulationPanel, type SimulationPanelProps } from './components/SimulationPanel'
export {
  StateComparison,
  useStateSnapshots,
  type DataSource,
  type StateValue,
  type ComparisonItem,
  type StateSnapshot,
  type StateComparisonProps,
} from './components/StateComparison'

// IPC
export {
  IPCClient,
  getIPCClient,
  resetIPCClient,
  LocalStorageTransport,
  MockTransport,
  type IPCTransport,
} from './ipc/client'

export type {
  IPCRequest,
  IPCResponse,
  IPCRequestType,
  IPCResponseStatus,
  IPCClientConfig,
  LensValidatePayload,
  LensValidateResponse,
  AnchorValidatePayload,
  AnchorValidateResponse,
} from './ipc/types'

// Fork Services
export {
  createForkService,
  createAnvilForkService,
  createTenderlyForkService,
  getForkService,
  resetForkService,
  type ForkProvider,
  type ForkConfig,
  type ForkState,
  type ForkSnapshot,
  type ForkService,
} from './services/fork'

// Simulation Services
export {
  createSimulationService,
  getSimulationService,
  resetSimulationService,
  type SimulationTransactionRequest,
  type BalanceChange,
  type StateChange,
  type SimulationLog,
  type SimulationResult,
  type SimulationService,
} from './services/simulation'
