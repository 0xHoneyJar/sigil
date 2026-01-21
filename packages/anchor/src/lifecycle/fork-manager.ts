/**
 * ForkManager - Anvil fork lifecycle management
 *
 * Manages spawning, tracking, and killing Anvil fork processes.
 * Persists fork registry to grimoires/anchor/forks.json.
 */

import { spawn, ChildProcess } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { EventEmitter } from 'eventemitter3';
import { rpcCall, waitForRpc } from '../utils/rpc.js';
import type { Fork, ForkConfig, ForkRegistry } from '../types.js';
import { ForkRegistrySchema } from '../types.js';

/** ForkManager events */
interface ForkManagerEvents {
  'fork:created': (fork: Fork) => void;
  'fork:exit': (forkId: string, code: number | null) => void;
  'fork:error': (forkId: string, error: Error) => void;
}

/** Default port range for Anvil forks */
const DEFAULT_PORT_START = 8545;
const DEFAULT_PORT_END = 8600;

/** Path to fork registry file */
const DEFAULT_REGISTRY_PATH = 'grimoires/anchor/forks.json';

/**
 * ForkManager class for managing Anvil fork lifecycle
 */
export class ForkManager extends EventEmitter<ForkManagerEvents> {
  private forks: Map<string, Fork> = new Map();
  private processes: Map<string, ChildProcess> = new Map();
  private usedPorts: Set<number> = new Set();
  private registryPath: string;

  constructor(options?: { registryPath?: string }) {
    super();
    this.registryPath = options?.registryPath ?? DEFAULT_REGISTRY_PATH;
  }

  /**
   * Initialize the ForkManager by loading persisted registry
   */
  async init(): Promise<void> {
    await this.loadRegistry();
  }

  /**
   * Spawn a new Anvil fork
   *
   * @param config - Fork configuration
   * @returns Promise resolving to the created Fork
   */
  async fork(config: ForkConfig): Promise<Fork> {
    const port = config.port ?? this.findAvailablePort();
    const forkId = this.generateForkId();

    // Build Anvil arguments
    const args = [
      '--fork-url',
      config.network.rpcUrl,
      '--port',
      port.toString(),
      '--chain-id',
      config.network.chainId.toString(),
    ];

    if (config.blockNumber !== undefined) {
      args.push('--fork-block-number', config.blockNumber.toString());
    }

    // Spawn Anvil process
    const process = spawn('anvil', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
    });

    const pid = process.pid;
    if (!pid) {
      throw new Error('Failed to spawn Anvil process');
    }

    const rpcUrl = `http://127.0.0.1:${port}`;

    // Wait for RPC to be ready
    try {
      await waitForRpc(rpcUrl, 30, 500);
    } catch {
      process.kill();
      throw new Error(`Anvil fork failed to become ready at ${rpcUrl}`);
    }

    // Get actual block number
    const blockNumberHex = await rpcCall<string>(rpcUrl, 'eth_blockNumber');
    const blockNumber = config.blockNumber ?? parseInt(blockNumberHex, 16);

    const fork: Fork = {
      id: forkId,
      network: config.network,
      blockNumber,
      rpcUrl,
      port,
      pid,
      createdAt: new Date(),
      sessionId: config.sessionId,
    };

    // Track fork
    this.forks.set(forkId, fork);
    this.processes.set(forkId, process);
    this.usedPorts.add(port);

    // Handle process exit
    process.on('exit', (code) => {
      this.handleProcessExit(forkId, code);
    });

    process.on('error', (error) => {
      this.emit('fork:error', forkId, error);
    });

    // Persist registry
    await this.saveRegistry();

    this.emit('fork:created', fork);
    return fork;
  }

  /**
   * Wait for a fork to be ready
   *
   * @param forkId - Fork ID to wait for
   * @param timeoutMs - Timeout in milliseconds
   */
  async waitForReady(forkId: string, timeoutMs: number = 30000): Promise<void> {
    const fork = this.forks.get(forkId);
    if (!fork) {
      throw new Error(`Fork ${forkId} not found`);
    }
    await waitForRpc(fork.rpcUrl, Math.ceil(timeoutMs / 500), 500);
  }

  /**
   * Kill a specific fork
   *
   * @param forkId - Fork ID to kill
   */
  async kill(forkId: string): Promise<void> {
    const process = this.processes.get(forkId);
    const fork = this.forks.get(forkId);

    if (process) {
      process.kill('SIGTERM');
      // Give it time to terminate gracefully
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (!process.killed) {
        process.kill('SIGKILL');
      }
    }

    if (fork) {
      this.usedPorts.delete(fork.port);
    }

    this.forks.delete(forkId);
    this.processes.delete(forkId);

    await this.saveRegistry();
  }

  /**
   * Kill all forks
   */
  async killAll(): Promise<void> {
    const forkIds = Array.from(this.forks.keys());
    await Promise.all(forkIds.map((id) => this.kill(id)));
  }

  /**
   * List all active forks
   *
   * @returns Array of active forks
   */
  list(): Fork[] {
    return Array.from(this.forks.values());
  }

  /**
   * Get a fork by ID
   *
   * @param forkId - Fork ID
   * @returns Fork if found, undefined otherwise
   */
  get(forkId: string): Fork | undefined {
    return this.forks.get(forkId);
  }

  /**
   * Export environment variables for a fork
   *
   * @param forkId - Fork ID
   * @returns Environment variables object
   */
  exportEnv(forkId: string): Record<string, string> {
    const fork = this.forks.get(forkId);
    if (!fork) {
      throw new Error(`Fork ${forkId} not found`);
    }

    return {
      RPC_URL: fork.rpcUrl,
      CHAIN_ID: fork.network.chainId.toString(),
      FORK_BLOCK: fork.blockNumber.toString(),
      FORK_ID: fork.id,
    };
  }

  /**
   * Load fork registry from disk
   */
  private async loadRegistry(): Promise<void> {
    try {
      if (!existsSync(this.registryPath)) {
        return;
      }

      const content = await readFile(this.registryPath, 'utf-8');
      const data = JSON.parse(content);
      const registry = ForkRegistrySchema.parse(data);

      // Only load forks that are still running (by checking if process exists)
      for (const fork of registry.forks) {
        try {
          // Check if process is still running
          process.kill(fork.pid, 0);
          // Check if RPC is responsive
          const ready = await this.checkForkHealth(fork);
          if (ready) {
            this.forks.set(fork.id, fork);
            this.usedPorts.add(fork.port);
          }
        } catch {
          // Process not running, skip
        }
      }
    } catch {
      // Registry doesn't exist or is corrupt, start fresh
    }
  }

  /**
   * Save fork registry to disk
   */
  private async saveRegistry(): Promise<void> {
    const registry: ForkRegistry = {
      forks: Array.from(this.forks.values()).map((fork) => ({
        ...fork,
        createdAt: fork.createdAt.toISOString() as unknown as Date,
      })),
      lastUpdated: new Date().toISOString() as unknown as Date,
    };

    // Ensure directory exists
    const dir = dirname(this.registryPath);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    await writeFile(this.registryPath, JSON.stringify(registry, null, 2));
  }

  /**
   * Check if a fork is still healthy
   */
  private async checkForkHealth(fork: Fork): Promise<boolean> {
    try {
      await rpcCall<string>(fork.rpcUrl, 'eth_chainId', [], 2000);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Handle process exit
   */
  private handleProcessExit(forkId: string, code: number | null): void {
    const fork = this.forks.get(forkId);
    if (fork) {
      this.usedPorts.delete(fork.port);
    }
    this.forks.delete(forkId);
    this.processes.delete(forkId);
    this.emit('fork:exit', forkId, code);
    void this.saveRegistry();
  }

  /**
   * Find an available port
   */
  private findAvailablePort(): number {
    for (let port = DEFAULT_PORT_START; port <= DEFAULT_PORT_END; port++) {
      if (!this.usedPorts.has(port)) {
        return port;
      }
    }
    throw new Error('No available ports in range');
  }

  /**
   * Generate a unique fork ID
   */
  private generateForkId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `fork-${timestamp}-${random}`;
  }
}

/** Singleton instance for convenience */
let defaultManager: ForkManager | null = null;

/**
 * Get the default ForkManager instance
 */
export function getForkManager(): ForkManager {
  if (!defaultManager) {
    defaultManager = new ForkManager();
  }
  return defaultManager;
}

/**
 * Reset the default ForkManager (for testing)
 */
export function resetForkManager(): void {
  defaultManager = null;
}
