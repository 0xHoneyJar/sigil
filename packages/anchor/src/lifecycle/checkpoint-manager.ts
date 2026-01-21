/**
 * CheckpointManager - Hard restart strategy for Anvil memory management
 *
 * Creates periodic checkpoints via anvil_dumpState to prevent memory bloat.
 * Restores checkpoints via anvil_loadState for crash recovery.
 */

import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { rpcCall } from '../utils/rpc.js';
import { ForkManager } from './fork-manager.js';
import type { CheckpointMetadata, Fork, NetworkConfig } from '../types.js';

/** Checkpoint manager configuration */
export interface CheckpointManagerConfig {
  /** Base path for checkpoint data */
  basePath?: string;
  /** Snapshot interval before creating checkpoint */
  snapshotInterval?: number;
  /** Maximum checkpoints to retain */
  maxCheckpoints?: number;
}

/** Default configuration values */
const DEFAULT_BASE_PATH = 'grimoires/anchor/checkpoints';
const DEFAULT_SNAPSHOT_INTERVAL = 10;
const DEFAULT_MAX_CHECKPOINTS = 5;

/**
 * CheckpointManager class for hard restart strategy
 */
export class CheckpointManager {
  private checkpoints: Map<string, CheckpointMetadata> = new Map();
  private snapshotCount: number = 0;
  private firstSnapshotId: string | null = null;
  private lastSnapshotId: string | null = null;
  private basePath: string;
  private snapshotInterval: number;
  private maxCheckpoints: number;
  private sessionId: string | null = null;
  private forkId: string | null = null;

  constructor(config?: CheckpointManagerConfig) {
    this.basePath = config?.basePath ?? DEFAULT_BASE_PATH;
    this.snapshotInterval = config?.snapshotInterval ?? DEFAULT_SNAPSHOT_INTERVAL;
    this.maxCheckpoints = config?.maxCheckpoints ?? DEFAULT_MAX_CHECKPOINTS;
  }

  /**
   * Initialize the manager for a session
   *
   * @param sessionId - Session ID
   * @param forkId - Fork ID
   */
  async init(sessionId: string, forkId: string): Promise<void> {
    this.sessionId = sessionId;
    this.forkId = forkId;
    await this.loadCheckpoints();
  }

  /**
   * Called when a snapshot is created. May trigger checkpoint.
   *
   * @param snapshotId - ID of the created snapshot
   * @param rpcUrl - RPC URL of the fork
   * @returns True if checkpoint was created
   */
  async onSnapshot(snapshotId: string, rpcUrl: string): Promise<boolean> {
    this.snapshotCount++;

    if (!this.firstSnapshotId) {
      this.firstSnapshotId = snapshotId;
    }
    this.lastSnapshotId = snapshotId;

    // Check if we should create a checkpoint
    if (this.snapshotCount >= this.snapshotInterval) {
      await this.create(rpcUrl);
      return true;
    }

    return false;
  }

  /**
   * Create a checkpoint by exporting state
   *
   * @param rpcUrl - RPC URL of the fork
   * @returns Checkpoint metadata
   */
  async create(rpcUrl: string): Promise<CheckpointMetadata> {
    if (!this.sessionId || !this.forkId) {
      throw new Error('CheckpointManager not initialized');
    }

    // Export state via anvil_dumpState
    const state = await rpcCall<string>(rpcUrl, 'anvil_dumpState');

    // Get current block number
    const blockNumberHex = await rpcCall<string>(rpcUrl, 'eth_blockNumber');
    const blockNumber = parseInt(blockNumberHex, 16);

    // Generate checkpoint ID
    const checkpointId = this.generateCheckpointId();

    const metadata: CheckpointMetadata = {
      id: checkpointId,
      sessionId: this.sessionId,
      forkId: this.forkId,
      snapshotRange: {
        first: this.firstSnapshotId ?? '',
        last: this.lastSnapshotId ?? '',
      },
      blockNumber,
      createdAt: new Date(),
      snapshotCount: this.snapshotCount,
    };

    // Save to disk
    await this.saveCheckpoint(checkpointId, state, metadata);

    // Store in memory
    this.checkpoints.set(checkpointId, metadata);

    // Reset snapshot counter
    this.snapshotCount = 0;
    this.firstSnapshotId = null;
    this.lastSnapshotId = null;

    // Cleanup old checkpoints
    await this.cleanup();

    return metadata;
  }

  /**
   * Restore from a checkpoint
   *
   * @param checkpointId - Checkpoint ID to restore
   * @param forkManager - ForkManager instance
   * @param network - Network configuration
   * @returns New fork with restored state
   */
  async restore(
    checkpointId: string,
    forkManager: ForkManager,
    network: NetworkConfig
  ): Promise<Fork> {
    if (!this.sessionId) {
      throw new Error('CheckpointManager not initialized');
    }

    const checkpoint = this.checkpoints.get(checkpointId);
    if (!checkpoint) {
      throw new Error(`Checkpoint ${checkpointId} not found`);
    }

    // Load state from disk
    const statePath = this.getStatePath(checkpointId);
    const state = await readFile(statePath, 'utf-8');

    // Kill existing forks
    await forkManager.killAll();

    // Spawn new fork
    const fork = await forkManager.fork({
      network,
      blockNumber: checkpoint.blockNumber,
      sessionId: this.sessionId,
    });

    // Load state via anvil_loadState
    await rpcCall<boolean>(fork.rpcUrl, 'anvil_loadState', [state]);

    // Update fork ID
    this.forkId = fork.id;

    return fork;
  }

  /**
   * Find the checkpoint containing a specific snapshot
   *
   * @param snapshotId - Snapshot ID to find
   * @returns Checkpoint metadata if found
   */
  findCheckpointForSnapshot(snapshotId: string): CheckpointMetadata | undefined {
    // Sort checkpoints by creation time (newest first)
    const sorted = this.list().sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    // Find the checkpoint whose range contains this snapshot
    // Note: This is a simplified check - in production, you'd need proper range tracking
    for (const checkpoint of sorted) {
      if (
        checkpoint.snapshotRange.first <= snapshotId &&
        checkpoint.snapshotRange.last >= snapshotId
      ) {
        return checkpoint;
      }
    }

    // Fall back to latest checkpoint
    return sorted[0];
  }

  /**
   * Get checkpoint by ID
   *
   * @param checkpointId - Checkpoint ID
   * @returns Checkpoint metadata if found
   */
  get(checkpointId: string): CheckpointMetadata | undefined {
    return this.checkpoints.get(checkpointId);
  }

  /**
   * List all checkpoints sorted by time
   *
   * @returns Array of checkpoint metadata
   */
  list(): CheckpointMetadata[] {
    return Array.from(this.checkpoints.values()).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  /**
   * Get the latest checkpoint
   *
   * @returns Latest checkpoint metadata
   */
  latest(): CheckpointMetadata | undefined {
    const sorted = this.list();
    return sorted[sorted.length - 1];
  }

  /**
   * Cleanup old checkpoints, keeping only the most recent
   */
  async cleanup(): Promise<void> {
    const sorted = this.list();

    if (sorted.length <= this.maxCheckpoints) {
      return;
    }

    const toDelete = sorted.slice(0, sorted.length - this.maxCheckpoints);

    for (const checkpoint of toDelete) {
      await this.deleteCheckpoint(checkpoint.id);
    }
  }

  /**
   * Get session directory path
   */
  private getSessionDir(): string {
    if (!this.sessionId) {
      throw new Error('Session ID not set');
    }
    return join(this.basePath, this.sessionId);
  }

  /**
   * Get checkpoint directory path
   */
  private getCheckpointDir(checkpointId: string): string {
    return join(this.getSessionDir(), checkpointId);
  }

  /**
   * Get state file path
   */
  private getStatePath(checkpointId: string): string {
    return join(this.getCheckpointDir(checkpointId), 'state.json');
  }

  /**
   * Get metadata file path
   */
  private getMetaPath(checkpointId: string): string {
    return join(this.getCheckpointDir(checkpointId), 'meta.json');
  }

  /**
   * Load checkpoints from disk
   */
  private async loadCheckpoints(): Promise<void> {
    const dir = this.getSessionDir();

    if (!existsSync(dir)) {
      return;
    }

    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const metaPath = this.getMetaPath(entry.name);
        if (!existsSync(metaPath)) continue;

        try {
          const content = await readFile(metaPath, 'utf-8');
          const data = JSON.parse(content) as CheckpointMetadata;
          data.createdAt = new Date(data.createdAt);
          this.checkpoints.set(data.id, data);
        } catch {
          // Skip corrupt metadata
        }
      }
    } catch {
      // Directory can't be read
    }
  }

  /**
   * Save checkpoint to disk
   */
  private async saveCheckpoint(
    checkpointId: string,
    state: string,
    metadata: CheckpointMetadata
  ): Promise<void> {
    const dir = this.getCheckpointDir(checkpointId);

    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    // Save state
    await writeFile(this.getStatePath(checkpointId), state);

    // Save metadata
    await writeFile(this.getMetaPath(checkpointId), JSON.stringify(metadata, null, 2));
  }

  /**
   * Delete a checkpoint from disk
   */
  private async deleteCheckpoint(checkpointId: string): Promise<void> {
    this.checkpoints.delete(checkpointId);

    const dir = this.getCheckpointDir(checkpointId);
    if (existsSync(dir)) {
      await rm(dir, { recursive: true });
    }
  }

  /**
   * Generate a unique checkpoint ID
   */
  private generateCheckpointId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `cp-${timestamp}-${random}`;
  }
}

/** Singleton instance */
let defaultManager: CheckpointManager | null = null;

/**
 * Get the default CheckpointManager instance
 */
export function getCheckpointManager(): CheckpointManager {
  if (!defaultManager) {
    defaultManager = new CheckpointManager();
  }
  return defaultManager;
}

/**
 * Reset the default CheckpointManager (for testing)
 */
export function resetCheckpointManager(): void {
  defaultManager = null;
}
