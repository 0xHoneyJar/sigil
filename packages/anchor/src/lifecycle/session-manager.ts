/**
 * SessionManager - Session lifecycle management
 *
 * Manages session creation, persistence, and recovery.
 * Coordinates ForkManager, SnapshotManager, CheckpointManager, and TaskGraph.
 */

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ForkManager } from './fork-manager.js';
import { SnapshotManager } from './snapshot-manager.js';
import { CheckpointManager } from './checkpoint-manager.js';
import { TaskGraph } from '../graph/task-graph.js';
import type { Fork, NetworkConfig, Task } from '../types.js';

/** Session metadata */
export interface SessionMetadata {
  /** Session ID */
  id: string;
  /** Network configuration */
  network: NetworkConfig;
  /** Current fork ID */
  forkId: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last activity timestamp */
  lastActivity: Date;
  /** Session status */
  status: 'active' | 'suspended' | 'complete' | 'failed';
  /** Initial block number */
  initialBlock: number;
}

/** Session manager configuration */
export interface SessionManagerConfig {
  /** Base path for session data */
  basePath?: string;
}

/** Session state with all managers */
export interface Session {
  metadata: SessionMetadata;
  fork: Fork;
  forkManager: ForkManager;
  snapshotManager: SnapshotManager;
  checkpointManager: CheckpointManager;
  taskGraph: TaskGraph;
}

/** Default base path */
const DEFAULT_BASE_PATH = 'grimoires/anchor/sessions';

/**
 * SessionManager class for session lifecycle
 */
export class SessionManager {
  private sessions: Map<string, SessionMetadata> = new Map();
  private currentSession: Session | null = null;
  private basePath: string;

  constructor(config?: SessionManagerConfig) {
    this.basePath = config?.basePath ?? DEFAULT_BASE_PATH;
  }

  /**
   * Initialize the manager by loading session index
   */
  async init(): Promise<void> {
    await this.loadSessionIndex();
  }

  /**
   * Create a new session
   *
   * @param network - Network to fork
   * @param options - Session options
   * @returns Created session
   */
  async create(
    network: NetworkConfig,
    options?: { blockNumber?: number }
  ): Promise<Session> {
    const sessionId = this.generateSessionId();

    // Create fork manager and spawn fork
    const forkManager = new ForkManager();
    await forkManager.init();

    const fork = await forkManager.fork({
      network,
      sessionId,
      ...(options?.blockNumber !== undefined && { blockNumber: options.blockNumber }),
    });

    // Create snapshot manager
    const snapshotManager = new SnapshotManager();
    await snapshotManager.init(sessionId);

    // Create checkpoint manager
    const checkpointManager = new CheckpointManager();
    await checkpointManager.init(sessionId, fork.id);

    // Create task graph
    const taskGraph = new TaskGraph({
      sessionId,
      basePath: this.basePath,
      autoSave: true,
    });
    await taskGraph.init();

    // Create initial snapshot
    const initialSnapshot = await snapshotManager.create(
      {
        forkId: fork.id,
        sessionId,
        description: 'Initial session snapshot',
      },
      fork.rpcUrl
    );

    // Create fork task in graph
    const forkTask: Task = {
      id: `fork-${fork.id}`,
      type: 'fork',
      status: 'complete',
      snapshotId: initialSnapshot.id,
      dependencies: [],
      input: { network, blockNumber: fork.blockNumber },
      output: { forkId: fork.id, rpcUrl: fork.rpcUrl },
      createdAt: new Date(),
      completedAt: new Date(),
    };
    await taskGraph.addTask(forkTask);

    // Create session metadata
    const metadata: SessionMetadata = {
      id: sessionId,
      network,
      forkId: fork.id,
      createdAt: new Date(),
      lastActivity: new Date(),
      status: 'active',
      initialBlock: fork.blockNumber,
    };

    // Save session
    this.sessions.set(sessionId, metadata);
    await this.saveSession(metadata);
    await this.saveSessionIndex();

    // Set as current session
    this.currentSession = {
      metadata,
      fork,
      forkManager,
      snapshotManager,
      checkpointManager,
      taskGraph,
    };

    return this.currentSession;
  }

  /**
   * Resume an existing session
   *
   * @param sessionId - Session ID to resume
   * @returns Resumed session
   */
  async resume(sessionId: string): Promise<Session> {
    const metadata = this.sessions.get(sessionId);
    if (!metadata) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Initialize fork manager
    const forkManager = new ForkManager();
    await forkManager.init();

    // Initialize snapshot manager
    const snapshotManager = new SnapshotManager();
    await snapshotManager.init(sessionId);

    // Initialize checkpoint manager
    const checkpointManager = new CheckpointManager();

    // Initialize task graph
    const taskGraph = new TaskGraph({
      sessionId,
      basePath: this.basePath,
      autoSave: true,
    });
    await taskGraph.init();

    // Check for recovery needs
    let fork = forkManager.get(metadata.forkId);

    if (!fork || taskGraph.hasBlocked()) {
      // Need recovery
      fork = await this.recover(
        sessionId,
        metadata,
        forkManager,
        snapshotManager,
        checkpointManager,
        taskGraph
      );
    }

    if (!fork) {
      throw new Error(`Failed to restore fork for session ${sessionId}`);
    }

    // Update checkpoint manager with fork
    await checkpointManager.init(sessionId, fork.id);

    // Update metadata
    metadata.lastActivity = new Date();
    metadata.forkId = fork.id;
    metadata.status = 'active';
    await this.saveSession(metadata);

    // Set as current session
    this.currentSession = {
      metadata,
      fork,
      forkManager,
      snapshotManager,
      checkpointManager,
      taskGraph,
    };

    return this.currentSession;
  }

  /**
   * Recover a session from checkpoint or snapshot
   */
  private async recover(
    sessionId: string,
    metadata: SessionMetadata,
    forkManager: ForkManager,
    snapshotManager: SnapshotManager,
    checkpointManager: CheckpointManager,
    taskGraph: TaskGraph
  ): Promise<Fork> {
    // First, try to find a checkpoint
    const latestCheckpoint = checkpointManager.latest();

    if (latestCheckpoint) {
      // Restore from checkpoint
      console.log(`Recovering session ${sessionId} from checkpoint ${latestCheckpoint.id}`);
      return await checkpointManager.restore(
        latestCheckpoint.id,
        forkManager,
        metadata.network
      );
    }

    // No checkpoint - find recovery point in task graph
    const blockedTasks = taskGraph.getTasksByStatus('blocked');
    const failedTasks = taskGraph.getTasksByStatus('failed');
    const problematicTask = blockedTasks[0] ?? failedTasks[0];

    if (problematicTask) {
      const recoveryPoint = taskGraph.findRecoveryPoint(problematicTask.id);

      if (recoveryPoint?.snapshotId) {
        // Spawn new fork and revert to snapshot
        const fork = await forkManager.fork({
          network: metadata.network,
          blockNumber: metadata.initialBlock,
          sessionId,
        });

        const success = await snapshotManager.revert(fork.rpcUrl, recoveryPoint.snapshotId);
        if (!success) {
          throw new Error(`Failed to revert to snapshot ${recoveryPoint.snapshotId}`);
        }

        // Mark problematic tasks as pending for retry
        for (const task of [...blockedTasks, ...failedTasks]) {
          await taskGraph.updateStatus(task.id, 'pending');
        }

        return fork;
      }
    }

    // No recovery point found - create fresh fork
    console.log(`No recovery point found, creating fresh fork for session ${sessionId}`);
    return await forkManager.fork({
      network: metadata.network,
      blockNumber: metadata.initialBlock,
      sessionId,
    });
  }

  /**
   * Get current session
   *
   * @returns Current session or null
   */
  current(): Session | null {
    return this.currentSession;
  }

  /**
   * List all sessions
   *
   * @param filter - Optional filter for status
   * @returns Array of session metadata
   */
  list(filter?: { status?: SessionMetadata['status']; blocked?: boolean }): SessionMetadata[] {
    let sessions = Array.from(this.sessions.values());

    if (filter?.status) {
      sessions = sessions.filter((s) => s.status === filter.status);
    }

    return sessions.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }

  /**
   * Get session by ID
   *
   * @param sessionId - Session ID
   * @returns Session metadata if found
   */
  get(sessionId: string): SessionMetadata | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Update session status
   *
   * @param sessionId - Session ID
   * @param status - New status
   */
  async updateStatus(sessionId: string, status: SessionMetadata['status']): Promise<void> {
    const metadata = this.sessions.get(sessionId);
    if (!metadata) {
      throw new Error(`Session ${sessionId} not found`);
    }

    metadata.status = status;
    metadata.lastActivity = new Date();
    await this.saveSession(metadata);
  }

  /**
   * Get session directory path
   */
  private getSessionDir(sessionId: string): string {
    return join(this.basePath, sessionId);
  }

  /**
   * Get session metadata path
   */
  private getSessionPath(sessionId: string): string {
    return join(this.getSessionDir(sessionId), 'session.json');
  }

  /**
   * Load session index
   */
  private async loadSessionIndex(): Promise<void> {
    if (!existsSync(this.basePath)) {
      return;
    }

    try {
      const entries = await readdir(this.basePath, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const sessionPath = this.getSessionPath(entry.name);
        if (!existsSync(sessionPath)) continue;

        try {
          const content = await readFile(sessionPath, 'utf-8');
          const data = JSON.parse(content) as SessionMetadata;
          data.createdAt = new Date(data.createdAt);
          data.lastActivity = new Date(data.lastActivity);
          this.sessions.set(data.id, data);
        } catch {
          // Skip corrupt session
        }
      }
    } catch {
      // Can't read sessions directory
    }
  }

  /**
   * Save session index
   */
  private async saveSessionIndex(): Promise<void> {
    if (!existsSync(this.basePath)) {
      await mkdir(this.basePath, { recursive: true });
    }

    const index = Array.from(this.sessions.values()).map((s) => ({
      id: s.id,
      status: s.status,
      lastActivity: s.lastActivity,
    }));

    await writeFile(
      join(this.basePath, 'index.json'),
      JSON.stringify(index, null, 2)
    );
  }

  /**
   * Save session metadata
   */
  private async saveSession(metadata: SessionMetadata): Promise<void> {
    const dir = this.getSessionDir(metadata.id);

    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    await writeFile(this.getSessionPath(metadata.id), JSON.stringify(metadata, null, 2));
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `session-${timestamp}-${random}`;
  }
}

/** Singleton instance */
let defaultManager: SessionManager | null = null;

/**
 * Get the default SessionManager instance
 */
export function getSessionManager(): SessionManager {
  if (!defaultManager) {
    defaultManager = new SessionManager();
  }
  return defaultManager;
}

/**
 * Reset the default SessionManager (for testing)
 */
export function resetSessionManager(): void {
  defaultManager = null;
}
