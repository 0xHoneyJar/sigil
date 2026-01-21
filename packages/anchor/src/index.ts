/**
 * Anchor v4.3.1 - Ground Truth Enforcement
 *
 * Sigil marks intent. Anchor grounds it, enforces it, and catches every lie.
 */

// Lifecycle
export { ForkManager, getForkManager, resetForkManager } from './lifecycle/index.js';

// Utils
export {
  rpcCall,
  RpcError,
  RpcTimeoutError,
  isRpcReady,
  waitForRpc,
} from './utils/index.js';

// Types
export type {
  Fork,
  ForkConfig,
  ForkRegistry,
  NetworkConfig,
  SnapshotMetadata,
  SnapshotConfig,
  CheckpointMetadata,
  CheckpointConfig,
  Task,
  TaskType,
  TaskStatus,
  TaskGraphData,
  Zone,
  WardenInput,
  WardenResult,
  CheckResult,
  ExitCodeValue,
} from './types.js';

export { ForkSchema, ForkRegistrySchema, ZONE_HIERARCHY, ExitCode } from './types.js';

// Version
export const VERSION = '4.3.1';
