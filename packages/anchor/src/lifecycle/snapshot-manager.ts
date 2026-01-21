/**
 * SnapshotManager - Anvil snapshot lifecycle management
 *
 * Manages creating, reverting, and tracking EVM snapshots.
 * Persists snapshot metadata to grimoires/anchor/sessions/{sessionId}/snapshots/
 */

import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { rpcCall } from '../utils/rpc.js';
import type { SnapshotMetadata, SnapshotConfig } from '../types.js';

/** Snapshot manager configuration */
export interface SnapshotManagerConfig {
  /** Base path for session data */
  basePath?: string;
}

/** Default base path for session data */
const DEFAULT_BASE_PATH = 'grimoires/anchor/sessions';

/**
 * SnapshotManager class for managing Anvil snapshots
 */
export class SnapshotManager {
  private snapshots: Map<string, SnapshotMetadata> = new Map();
  private taskToSnapshot: Map<string, string> = new Map();
  private basePath: string;
  private sessionId: string | null = null;

  constructor(config?: SnapshotManagerConfig) {
    this.basePath = config?.basePath ?? DEFAULT_BASE_PATH;
  }

  /**
   * Initialize the manager for a session
   *
   * @param sessionId - Session ID to manage snapshots for
   */
  async init(sessionId: string): Promise<void> {
    this.sessionId = sessionId;
    await this.loadSnapshots();
  }

  /**
   * Create a new snapshot
   *
   * @param config - Snapshot configuration
   * @param rpcUrl - RPC URL of the fork
   * @returns Promise resolving to snapshot metadata
   */
  async create(config: SnapshotConfig, rpcUrl: string): Promise<SnapshotMetadata> {
    // Call evm_snapshot
    const snapshotId = await rpcCall<string>(rpcUrl, 'evm_snapshot');

    // Get current block number
    const blockNumberHex = await rpcCall<string>(rpcUrl, 'eth_blockNumber');
    const blockNumber = parseInt(blockNumberHex, 16);

    const metadata: SnapshotMetadata = {
      id: snapshotId,
      forkId: config.forkId,
      sessionId: config.sessionId,
      blockNumber,
      createdAt: new Date(),
      ...(config.taskId !== undefined && { taskId: config.taskId }),
      ...(config.description !== undefined && { description: config.description }),
    };

    // Store in memory
    this.snapshots.set(snapshotId, metadata);
    if (config.taskId) {
      this.taskToSnapshot.set(config.taskId, snapshotId);
    }

    // Persist to disk
    await this.saveSnapshot(metadata);

    return metadata;
  }

  /**
   * Revert to a snapshot
   *
   * @param rpcUrl - RPC URL of the fork
   * @param snapshotId - Snapshot ID to revert to
   * @returns Promise resolving to true if successful
   */
  async revert(rpcUrl: string, snapshotId: string): Promise<boolean> {
    const result = await rpcCall<boolean>(rpcUrl, 'evm_revert', [snapshotId]);
    return result;
  }

  /**
   * Get snapshot metadata by ID
   *
   * @param snapshotId - Snapshot ID
   * @returns Snapshot metadata if found
   */
  get(snapshotId: string): SnapshotMetadata | undefined {
    return this.snapshots.get(snapshotId);
  }

  /**
   * List all snapshots sorted by creation time
   *
   * @returns Array of snapshot metadata
   */
  list(): SnapshotMetadata[] {
    return Array.from(this.snapshots.values()).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  /**
   * Get snapshot for a specific task
   *
   * @param taskId - Task ID
   * @returns Snapshot metadata if found
   */
  getForTask(taskId: string): SnapshotMetadata | undefined {
    const snapshotId = this.taskToSnapshot.get(taskId);
    if (!snapshotId) return undefined;
    return this.snapshots.get(snapshotId);
  }

  /**
   * Get the count of snapshots
   *
   * @returns Number of snapshots
   */
  count(): number {
    return this.snapshots.size;
  }

  /**
   * Cleanup old snapshots, keeping the most recent
   *
   * @param keepLast - Number of recent snapshots to keep
   */
  async cleanup(keepLast: number): Promise<void> {
    const sorted = this.list();
    const toDelete = sorted.slice(0, -keepLast);

    for (const snapshot of toDelete) {
      await this.deleteSnapshot(snapshot.id);
    }
  }

  /**
   * Get snapshot directory path for current session
   */
  private getSnapshotDir(): string {
    if (!this.sessionId) {
      throw new Error('SnapshotManager not initialized with session ID');
    }
    return join(this.basePath, this.sessionId, 'snapshots');
  }

  /**
   * Get file path for a snapshot
   */
  private getSnapshotPath(snapshotId: string): string {
    return join(this.getSnapshotDir(), `${snapshotId}.json`);
  }

  /**
   * Load existing snapshots from disk
   */
  private async loadSnapshots(): Promise<void> {
    const dir = this.getSnapshotDir();

    if (!existsSync(dir)) {
      return;
    }

    try {
      const files = await readdir(dir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        try {
          const content = await readFile(join(dir, file), 'utf-8');
          const data = JSON.parse(content) as SnapshotMetadata;
          data.createdAt = new Date(data.createdAt);

          this.snapshots.set(data.id, data);
          if (data.taskId) {
            this.taskToSnapshot.set(data.taskId, data.id);
          }
        } catch {
          // Skip corrupt files
        }
      }
    } catch {
      // Directory doesn't exist or can't be read
    }
  }

  /**
   * Save snapshot metadata to disk
   */
  private async saveSnapshot(metadata: SnapshotMetadata): Promise<void> {
    const dir = this.getSnapshotDir();

    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    await writeFile(
      this.getSnapshotPath(metadata.id),
      JSON.stringify(metadata, null, 2)
    );
  }

  /**
   * Delete a snapshot from memory and disk
   */
  private async deleteSnapshot(snapshotId: string): Promise<void> {
    const metadata = this.snapshots.get(snapshotId);

    this.snapshots.delete(snapshotId);
    if (metadata?.taskId) {
      this.taskToSnapshot.delete(metadata.taskId);
    }

    try {
      await unlink(this.getSnapshotPath(snapshotId));
    } catch {
      // File might not exist
    }
  }
}

/** Singleton instance for convenience */
let defaultManager: SnapshotManager | null = null;

/**
 * Get the default SnapshotManager instance
 */
export function getSnapshotManager(): SnapshotManager {
  if (!defaultManager) {
    defaultManager = new SnapshotManager();
  }
  return defaultManager;
}

/**
 * Reset the default SnapshotManager (for testing)
 */
export function resetSnapshotManager(): void {
  defaultManager = null;
}
