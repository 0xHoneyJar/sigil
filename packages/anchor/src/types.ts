/**
 * Anchor Core Types
 *
 * Type definitions for the Anchor ground truth enforcement layer.
 */

import { z } from 'zod';

// =============================================================================
// Fork Types
// =============================================================================

/** Network configuration for forking */
export interface NetworkConfig {
  /** Network name (e.g., 'mainnet', 'sepolia') */
  name: string;
  /** Chain ID */
  chainId: number;
  /** RPC URL to fork from */
  rpcUrl: string;
}

/** Fork configuration */
export interface ForkConfig {
  /** Network to fork */
  network: NetworkConfig;
  /** Block number to fork at (optional, defaults to latest) */
  blockNumber?: number;
  /** Local RPC port (optional, auto-assigned if not specified) */
  port?: number;
  /** Session ID this fork belongs to */
  sessionId?: string;
}

/** Active fork instance */
export interface Fork {
  /** Unique fork identifier */
  id: string;
  /** Network configuration */
  network: NetworkConfig;
  /** Block number fork was created at */
  blockNumber: number;
  /** Local RPC URL */
  rpcUrl: string;
  /** Local RPC port */
  port: number;
  /** Process ID */
  pid: number;
  /** Creation timestamp */
  createdAt: Date;
  /** Session ID this fork belongs to */
  sessionId?: string;
}

/** Fork registry schema for persistence */
export const ForkSchema = z.object({
  id: z.string(),
  network: z.object({
    name: z.string(),
    chainId: z.number(),
    rpcUrl: z.string(),
  }),
  blockNumber: z.number(),
  rpcUrl: z.string(),
  port: z.number(),
  pid: z.number(),
  createdAt: z.string().transform((s: string) => new Date(s)),
  sessionId: z.string().optional(),
});

export const ForkRegistrySchema = z.object({
  forks: z.array(ForkSchema),
  lastUpdated: z.string().transform((s: string) => new Date(s)),
});

export type ForkRegistry = z.infer<typeof ForkRegistrySchema>;

// =============================================================================
// Snapshot Types
// =============================================================================

/** Snapshot metadata */
export interface SnapshotMetadata {
  /** Snapshot ID (from Anvil) */
  id: string;
  /** Fork ID this snapshot belongs to */
  forkId: string;
  /** Session ID */
  sessionId: string;
  /** Task ID that created this snapshot */
  taskId?: string;
  /** Block number at snapshot time */
  blockNumber: number;
  /** Creation timestamp */
  createdAt: Date;
  /** Description */
  description?: string;
}

/** Snapshot configuration */
export interface SnapshotConfig {
  /** Fork ID to snapshot */
  forkId: string;
  /** Session ID */
  sessionId: string;
  /** Task ID */
  taskId?: string;
  /** Description */
  description?: string;
}

// =============================================================================
// Checkpoint Types
// =============================================================================

/** Checkpoint metadata */
export interface CheckpointMetadata {
  /** Checkpoint ID */
  id: string;
  /** Session ID */
  sessionId: string;
  /** Fork ID this checkpoint was created from */
  forkId: string;
  /** Snapshot range covered by this checkpoint */
  snapshotRange: {
    first: string;
    last: string;
  };
  /** Block number at checkpoint time */
  blockNumber: number;
  /** Creation timestamp */
  createdAt: Date;
  /** Number of snapshots since last checkpoint */
  snapshotCount: number;
}

/** Checkpoint configuration */
export interface CheckpointConfig {
  /** Session ID */
  sessionId: string;
  /** Fork ID */
  forkId: string;
  /** Snapshot interval before checkpointing */
  interval?: number;
}

// =============================================================================
// Task Graph Types
// =============================================================================

/** Task types in the Anchor pipeline */
export type TaskType = 'fork' | 'ground' | 'warden' | 'generate' | 'validate' | 'write';

/** Task status */
export type TaskStatus = 'pending' | 'running' | 'complete' | 'blocked' | 'failed';

/** Task in the state-pinned graph */
export interface Task {
  /** Unique task ID */
  id: string;
  /** Task type */
  type: TaskType;
  /** Current status */
  status: TaskStatus;
  /** Snapshot ID binding this task to EVM state */
  snapshotId?: string;
  /** Checkpoint ID for recovery */
  checkpointId?: string;
  /** IDs of tasks this depends on */
  dependencies: string[];
  /** Task input data */
  input: unknown;
  /** Task output data */
  output?: unknown;
  /** Error if failed */
  error?: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Completion timestamp */
  completedAt?: Date;
}

/** Task graph data for persistence */
export interface TaskGraphData {
  /** Session ID */
  sessionId: string;
  /** All tasks */
  tasks: Task[];
  /** Current head task ID */
  headTaskId?: string;
  /** Last updated timestamp */
  lastUpdated: Date;
}

// =============================================================================
// Warden Types
// =============================================================================

/** Zone hierarchy for physics validation */
export type Zone = 'critical' | 'elevated' | 'standard' | 'local';

/** Zone hierarchy order (most restrictive first) */
export const ZONE_HIERARCHY: Zone[] = ['critical', 'elevated', 'standard', 'local'];

/** Warden validation input */
export interface WardenInput {
  /** Component or action being validated */
  component: string;
  /** Cited zone in grounding statement */
  citedZone: Zone | null;
  /** Keywords detected in the component */
  keywords: string[];
  /** Grounding statement from agent */
  groundingStatement: string;
  /** Physics rules being applied */
  appliedPhysics?: {
    sync?: string;
    timing?: string;
    confirmation?: string;
  };
}

/** Individual check result */
export interface CheckResult {
  /** Whether the check passed */
  passed: boolean;
  /** Reason for pass/fail */
  reason: string;
}

/** Warden validation result */
export interface WardenResult {
  /** Overall validation status */
  status: 'VALID' | 'DRIFT' | 'DECEPTIVE';
  /** Individual check results */
  checks: {
    relevance: CheckResult;
    hierarchy: CheckResult;
    rules: CheckResult;
  };
  /** Required zone based on analysis */
  requiredZone: Zone;
  /** Zone cited by agent */
  citedZone: Zone | null;
  /** Correction message if needed */
  correction?: string;
}

// =============================================================================
// Learned Rules Types
// =============================================================================

/** Learned rule trigger conditions */
export interface LearnedRuleTrigger {
  /** Component name patterns to match */
  component_name_contains?: string[];
  /** Zone to match */
  zone?: Zone;
  /** Effect type to match */
  effect?: string;
  /** Props to check for */
  has_props?: string[];
}

/** Learned rule constraint */
export interface LearnedRuleConstraint {
  /** Constraint type */
  type: 'timing' | 'sync' | 'easing' | 'confirmation' | 'custom';
  /** Operator for comparison */
  operator: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'contains' | 'matches';
  /** Expected value */
  expected: string | number;
  /** Message on violation */
  message: string;
}

/** Grounding requirement for a rule */
export interface LearnedRuleGroundingRequirement {
  /** Fields that must be cited */
  must_cite?: {
    zone?: Zone;
    physics?: string[];
  };
  /** Warden check questions */
  warden_check?: string[];
}

/** A learned rule from pattern detection or manual definition */
export interface LearnedRule {
  /** Unique rule ID */
  id: string;
  /** Rule version */
  version: string;
  /** Human-readable description */
  description: string;
  /** How the rule was created */
  created_from: 'manual' | 'pattern_detection' | 'import';
  /** Pattern ID if created from pattern */
  pattern_id?: string;
  /** Rule definition */
  rule: {
    trigger: LearnedRuleTrigger;
    constraint: LearnedRuleConstraint;
  };
  /** Grounding requirements */
  grounding_requirement?: LearnedRuleGroundingRequirement;
  /** Creation timestamp */
  created_at: string;
  /** Last updated timestamp */
  updated_at: string;
}

// =============================================================================
// Exit Codes
// =============================================================================

/** Anchor exit codes */
export const ExitCode = {
  PASS: 0,
  DRIFT: 1,
  DECEPTIVE: 2,
  VIOLATION: 3,
  REVERT: 4,
  CORRUPT: 5,
  SCHEMA: 6,
} as const;

export type ExitCodeValue = (typeof ExitCode)[keyof typeof ExitCode];

// =============================================================================
// Lens Context Types (Sprint 4)
// =============================================================================

/**
 * Lens context for User Lens impersonation validation
 * Used to verify data source consistency when viewing as another address
 */
export interface LensContext {
  /** Address being impersonated */
  impersonatedAddress: string;
  /** Real user address (for signing) */
  realAddress?: string;
  /** Component being validated */
  component: string;
  /** Value observed in the UI */
  observedValue?: string;
  /** Value from on-chain read */
  onChainValue?: string;
  /** Value from indexer (Envio, Subgraph) */
  indexedValue?: string;
  /** Data source used by component */
  dataSource?: 'on-chain' | 'indexed' | 'mixed' | 'unknown';
}

/** Lens context schema for validation */
export const LensContextSchema = z.object({
  impersonatedAddress: z.string(),
  realAddress: z.string().optional(),
  component: z.string(),
  observedValue: z.string().optional(),
  onChainValue: z.string().optional(),
  indexedValue: z.string().optional(),
  dataSource: z.enum(['on-chain', 'indexed', 'mixed', 'unknown']).optional(),
});

/**
 * Lens validation issue types
 */
export type LensIssueType =
  | 'data_source_mismatch'     // observed != on_chain
  | 'stale_indexed_data'       // indexed != on_chain
  | 'lens_financial_check'     // Financial zone using indexed source
  | 'impersonation_leak';      // Real address used where impersonated expected

/**
 * Lens validation issue severity
 */
export type LensIssueSeverity = 'error' | 'warning' | 'info';

/**
 * Individual lens validation issue
 */
export interface LensValidationIssue {
  /** Issue type */
  type: LensIssueType;
  /** Severity (varies by zone) */
  severity: LensIssueSeverity;
  /** Human-readable message */
  message: string;
  /** Component where issue was found */
  component: string;
  /** Zone context */
  zone?: Zone;
  /** Expected value */
  expected?: string;
  /** Actual value */
  actual?: string;
  /** Suggested fix */
  suggestion?: string;
}

/** Lens validation issue schema */
export const LensValidationIssueSchema = z.object({
  type: z.enum(['data_source_mismatch', 'stale_indexed_data', 'lens_financial_check', 'impersonation_leak']),
  severity: z.enum(['error', 'warning', 'info']),
  message: z.string(),
  component: z.string(),
  zone: z.enum(['critical', 'elevated', 'standard', 'local']).optional(),
  expected: z.string().optional(),
  actual: z.string().optional(),
  suggestion: z.string().optional(),
});

/**
 * Lens validation result
 */
export interface LensValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** List of issues found */
  issues: LensValidationIssue[];
  /** Summary message */
  summary: string;
}

/** Extended exit codes for lens validation */
export const LensExitCode = {
  ...ExitCode,
  LENS_WARNING: 11,
  LENS_ERROR: 10,
} as const;

export type LensExitCodeValue = (typeof LensExitCode)[keyof typeof LensExitCode];
