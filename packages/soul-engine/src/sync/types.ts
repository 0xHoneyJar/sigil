/**
 * Sync / Interaction Router Types
 *
 * Type definitions for the sync strategy classification system.
 * Sync by interaction intent, not data type.
 */

/**
 * Available sync strategies:
 * - server_tick: Server is absolute truth, tick-aligned (money, health, inventory)
 * - crdt: Collaborative text, every keystroke merges (documents, comments)
 * - lww: Last write wins per property (preferences, toggles)
 * - none: Local UI state only, no sync needed (modals, hover states)
 */
export type SyncStrategy = 'crdt' | 'lww' | 'server_tick' | 'none';

/**
 * UI feedback configuration for each sync strategy
 */
export interface UIFeedbackConfig {
  /** Whether to show optimistic updates before server confirmation */
  optimistic: boolean;
  /** Whether to show presence indicators for other users */
  showPresence: boolean;
  /** How prominently to show pending state */
  pendingIndicator: 'none' | 'subtle' | 'prominent';
  /** How to show confirmation of successful sync */
  confirmationStyle: 'none' | 'toast' | 'inline' | 'material';
}

/**
 * Full sync configuration for a strategy
 */
export interface SyncConfig {
  strategy: SyncStrategy;
  description: string;
  uiFeedback: UIFeedbackConfig;
  /** Server tick rate in milliseconds (only for server_tick strategy) */
  tickRateMs?: number;
}

/**
 * Record of an explicit sync strategy declaration
 */
export interface DeclarationRecord {
  /** The data path this declaration applies to (e.g., 'user.balance', 'document.*') */
  dataPath: string;
  /** The declared sync strategy */
  strategy: SyncStrategy;
  /** Who made this declaration (e.g., 'dev:john@example.com') */
  declaredBy: string;
  /** When this declaration was made (ISO 8601) */
  declaredAt: string;
  /** Human-readable explanation of why this strategy was chosen */
  rationale: string;
}

/**
 * Explicit sync declaration input (used when declaring new strategies)
 */
export interface SyncDeclaration {
  /** The data path pattern (supports wildcards like 'game.*.inventory') */
  dataPath: string;
  /** The sync strategy to use */
  strategy: SyncStrategy;
  /** Why this strategy is appropriate for this data */
  rationale: string;
}

/**
 * Context for routing a sync strategy
 */
export interface RouteContext {
  /** The data path being accessed */
  dataPath: string;
  /** Human-readable description of the interaction */
  description: string;
  /** Optional zone context (e.g., 'critical', 'exploratory') */
  zone?: string;
}

/**
 * Result of sync strategy detection
 */
export interface SyncDetectionResult {
  /** The detected strategy, or null if unknown */
  strategy: SyncStrategy | null;
  /** Human-readable explanation of why this strategy was chosen */
  rationale: string;
  /** Warnings or considerations for using this strategy */
  warnings: string[];
  /** Confidence level of the detection */
  confidence: 'high' | 'medium' | 'low';
  /** Keywords that triggered this detection */
  matchedKeywords: string[];
}

/**
 * Result of routing request
 */
export type RouteResult =
  | SyncConfig
  | { requiresDeclaration: true; reason: string; suggestions: SyncStrategy[] };

/**
 * Sync warning for specific strategies
 */
export interface SyncWarning {
  strategy: SyncStrategy;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  recommendation: string;
}

/**
 * Hook options for useServerTick
 */
export interface UseServerTickOptions {
  /** Server tick rate in milliseconds (default: 600) */
  tickRateMs?: number;
  /** Callback when update fails */
  onError?: (error: Error) => void;
  /** Callback when update succeeds */
  onSuccess?: () => void;
}

/**
 * Hook result for useServerTick
 */
export interface UseServerTickResult<T> {
  /** Current confirmed value from server */
  value: T;
  /** Submit an update (returns promise that resolves on server confirmation) */
  update: (newValue: T) => Promise<void>;
  /** Whether an update is pending server confirmation */
  isPending: boolean;
  /** Last error from failed update */
  error: Error | null;
  /** Timestamp of last successful server confirmation */
  lastConfirmedAt: Date | null;
}

/**
 * Hook options for useLocalFirst
 */
export interface UseLocalFirstOptions {
  /** Whether to sync to server (default: true) */
  syncToServer?: boolean;
  /** Debounce time for sync in milliseconds (default: 1000) */
  debounceMs?: number;
  /** Callback when sync fails */
  onError?: (error: Error) => void;
}

/**
 * Hook result for useLocalFirst
 */
export interface UseLocalFirstResult<T> {
  /** Current value (immediately reflects local changes) */
  value: T;
  /** Update value (immediately applies locally, syncs in background) */
  update: (newValue: T) => void;
  /** Whether background sync is in progress */
  isSyncing: boolean;
  /** Last sync error */
  error: Error | null;
}

/**
 * Presence information for CRDT
 */
export interface CRDTPresence {
  userId: string;
  displayName: string;
  color: string;
  cursor?: { index: number };
  selection?: { start: number; end: number };
  lastActive: Date;
}

/**
 * Hook options for useCRDTText
 */
export interface UseCRDTTextOptions {
  /** Callback when presence changes */
  onPresenceChange?: (presence: CRDTPresence[]) => void;
  /** User display name */
  displayName?: string;
  /** User color for presence indicators */
  color?: string;
}

/**
 * Hook result for useCRDTText
 */
export interface UseCRDTTextResult {
  /** Current text content */
  content: string;
  /** Insert text at index */
  insert: (index: number, text: string) => void;
  /** Delete text at index */
  delete: (index: number, length: number) => void;
  /** Replace text range */
  replace: (start: number, end: number, text: string) => void;
  /** Other users' presence */
  presence: CRDTPresence[];
  /** Whether sync is in progress */
  isSyncing: boolean;
  /** Set cursor position (for presence) */
  setCursor: (index: number) => void;
  /** Set selection range (for presence) */
  setSelection: (start: number, end: number) => void;
}
