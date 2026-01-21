#!/usr/bin/env node

/**
 * Anchor CLI
 *
 * Ground truth enforcement for Sigil design physics.
 */

import { Command } from 'commander';
import { ForkManager } from '../lifecycle/fork-manager.js';
import { SnapshotManager } from '../lifecycle/snapshot-manager.js';
import { CheckpointManager } from '../lifecycle/checkpoint-manager.js';
import { SessionManager } from '../lifecycle/session-manager.js';
import { TaskGraph } from '../graph/task-graph.js';
import type { NetworkConfig } from '../types.js';

const VERSION = '4.3.1';

/** Known network configurations */
const NETWORKS: Record<string, NetworkConfig> = {
  mainnet: {
    name: 'mainnet',
    chainId: 1,
    rpcUrl: process.env['ETH_RPC_URL'] ?? 'https://eth.llamarpc.com',
  },
  sepolia: {
    name: 'sepolia',
    chainId: 11155111,
    rpcUrl: process.env['SEPOLIA_RPC_URL'] ?? 'https://rpc.sepolia.org',
  },
  arbitrum: {
    name: 'arbitrum',
    chainId: 42161,
    rpcUrl: process.env['ARBITRUM_RPC_URL'] ?? 'https://arb1.arbitrum.io/rpc',
  },
  optimism: {
    name: 'optimism',
    chainId: 10,
    rpcUrl: process.env['OPTIMISM_RPC_URL'] ?? 'https://mainnet.optimism.io',
  },
  polygon: {
    name: 'polygon',
    chainId: 137,
    rpcUrl: process.env['POLYGON_RPC_URL'] ?? 'https://polygon-rpc.com',
  },
  base: {
    name: 'base',
    chainId: 8453,
    rpcUrl: process.env['BASE_RPC_URL'] ?? 'https://mainnet.base.org',
  },
};

const program = new Command();

program
  .name('anchor')
  .description('Ground truth enforcement for Sigil design physics')
  .version(VERSION);

// =============================================================================
// Fork Commands
// =============================================================================

program
  .command('fork <network>')
  .description('Spawn an Anvil fork of the specified network')
  .option('-b, --block <number>', 'Block number to fork at')
  .option('-p, --port <number>', 'RPC port (auto-assigned if not specified)')
  .option('-s, --session <id>', 'Session ID to associate with fork')
  .option('--rpc-url <url>', 'Custom RPC URL (overrides network default)')
  .action(async (networkName: string, options: {
    block?: string;
    port?: string;
    session?: string;
    rpcUrl?: string;
  }) => {
    const manager = new ForkManager();
    await manager.init();

    // Get network config
    let network = NETWORKS[networkName.toLowerCase()];
    if (!network) {
      // Allow custom network with --rpc-url
      if (options.rpcUrl) {
        network = {
          name: networkName,
          chainId: 1, // Will be detected from RPC
          rpcUrl: options.rpcUrl,
        };
      } else {
        console.error(`Unknown network: ${networkName}`);
        console.error(`Available networks: ${Object.keys(NETWORKS).join(', ')}`);
        console.error('Or provide a custom RPC URL with --rpc-url');
        process.exit(1);
      }
    }

    // Override RPC URL if provided
    if (options.rpcUrl) {
      network = { ...network, rpcUrl: options.rpcUrl };
    }

    try {
      console.log(`Forking ${network.name}...`);

      const fork = await manager.fork({
        network,
        ...(options.block !== undefined && { blockNumber: parseInt(options.block, 10) }),
        ...(options.port !== undefined && { port: parseInt(options.port, 10) }),
        ...(options.session !== undefined && { sessionId: options.session }),
      });

      console.log('');
      console.log('Fork created successfully:');
      console.log('');
      console.log(`  ID:        ${fork.id}`);
      console.log(`  Network:   ${fork.network.name}`);
      console.log(`  Chain ID:  ${fork.network.chainId}`);
      console.log(`  Block:     ${fork.blockNumber}`);
      console.log(`  RPC URL:   ${fork.rpcUrl}`);
      console.log(`  PID:       ${fork.pid}`);
      console.log('');
      console.log('Environment variables:');
      const env = manager.exportEnv(fork.id);
      for (const [key, value] of Object.entries(env)) {
        console.log(`  export ${key}=${value}`);
      }
    } catch (error) {
      console.error('Failed to create fork:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('forks')
  .description('List all active forks')
  .option('--json', 'Output as JSON')
  .action(async (options: { json?: boolean }) => {
    const manager = new ForkManager();
    await manager.init();

    const forks = manager.list();

    if (options.json) {
      console.log(JSON.stringify(forks, null, 2));
      return;
    }

    if (forks.length === 0) {
      console.log('No active forks.');
      return;
    }

    console.log('Active forks:');
    console.log('');

    for (const fork of forks) {
      const age = Math.round((Date.now() - fork.createdAt.getTime()) / 1000 / 60);
      console.log(`  ${fork.id}`);
      console.log(`    Network:  ${fork.network.name} (chain ${fork.network.chainId})`);
      console.log(`    Block:    ${fork.blockNumber}`);
      console.log(`    RPC:      ${fork.rpcUrl}`);
      console.log(`    Age:      ${age} minutes`);
      if (fork.sessionId) {
        console.log(`    Session:  ${fork.sessionId}`);
      }
      console.log('');
    }
  });

program
  .command('kill <fork-id>')
  .description('Kill a specific fork')
  .action(async (forkId: string) => {
    const manager = new ForkManager();
    await manager.init();

    const fork = manager.get(forkId);
    if (!fork) {
      console.error(`Fork not found: ${forkId}`);
      process.exit(1);
    }

    await manager.kill(forkId);
    console.log(`Fork ${forkId} terminated.`);
  });

program
  .command('kill-all')
  .description('Kill all active forks')
  .action(async () => {
    const manager = new ForkManager();
    await manager.init();

    const forks = manager.list();
    if (forks.length === 0) {
      console.log('No active forks to kill.');
      return;
    }

    await manager.killAll();
    console.log(`Killed ${forks.length} fork(s).`);
  });

// =============================================================================
// Environment Export
// =============================================================================

program
  .command('env <fork-id>')
  .description('Export environment variables for a fork')
  .option('--format <type>', 'Output format: shell, fish, or json', 'shell')
  .action(async (forkId: string, options: { format: string }) => {
    const manager = new ForkManager();
    await manager.init();

    try {
      const env = manager.exportEnv(forkId);

      switch (options.format) {
        case 'json':
          console.log(JSON.stringify(env, null, 2));
          break;
        case 'fish':
          for (const [key, value] of Object.entries(env)) {
            console.log(`set -x ${key} ${value}`);
          }
          break;
        case 'shell':
        default:
          for (const [key, value] of Object.entries(env)) {
            console.log(`export ${key}=${value}`);
          }
          break;
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// =============================================================================
// Snapshot Commands
// =============================================================================

program
  .command('snapshot')
  .description('Create a new EVM snapshot')
  .requiredOption('-f, --fork <id>', 'Fork ID to snapshot')
  .requiredOption('-s, --session <id>', 'Session ID')
  .option('-t, --task <id>', 'Task ID to associate with snapshot')
  .option('-d, --description <text>', 'Description of the snapshot')
  .action(async (options: {
    fork: string;
    session: string;
    task?: string;
    description?: string;
  }) => {
    const forkManager = new ForkManager();
    await forkManager.init();

    const fork = forkManager.get(options.fork);
    if (!fork) {
      console.error(`Fork not found: ${options.fork}`);
      process.exit(1);
    }

    const snapshotManager = new SnapshotManager();
    await snapshotManager.init(options.session);

    try {
      const snapshot = await snapshotManager.create(
        {
          forkId: options.fork,
          sessionId: options.session,
          ...(options.task !== undefined && { taskId: options.task }),
          ...(options.description !== undefined && { description: options.description }),
        },
        fork.rpcUrl
      );

      console.log('Snapshot created:');
      console.log('');
      console.log(`  ID:          ${snapshot.id}`);
      console.log(`  Block:       ${snapshot.blockNumber}`);
      console.log(`  Session:     ${snapshot.sessionId}`);
      if (snapshot.taskId) {
        console.log(`  Task:        ${snapshot.taskId}`);
      }
      if (snapshot.description) {
        console.log(`  Description: ${snapshot.description}`);
      }
    } catch (error) {
      console.error('Failed to create snapshot:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('revert <snapshot-id>')
  .description('Revert to a previous EVM snapshot')
  .requiredOption('-f, --fork <id>', 'Fork ID to revert')
  .requiredOption('-s, --session <id>', 'Session ID')
  .action(async (snapshotId: string, options: { fork: string; session: string }) => {
    const forkManager = new ForkManager();
    await forkManager.init();

    const fork = forkManager.get(options.fork);
    if (!fork) {
      console.error(`Fork not found: ${options.fork}`);
      process.exit(1);
    }

    const snapshotManager = new SnapshotManager();
    await snapshotManager.init(options.session);

    const snapshot = snapshotManager.get(snapshotId);
    if (!snapshot) {
      console.error(`Snapshot not found: ${snapshotId}`);
      process.exit(1);
    }

    try {
      const success = await snapshotManager.revert(fork.rpcUrl, snapshotId);

      if (success) {
        console.log(`Reverted to snapshot ${snapshotId}`);
        console.log(`  Block: ${snapshot.blockNumber}`);
      } else {
        console.error('Revert failed');
        process.exit(1);
      }
    } catch (error) {
      console.error('Failed to revert:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('snapshots')
  .description('List all snapshots for a session')
  .requiredOption('-s, --session <id>', 'Session ID')
  .option('--json', 'Output as JSON')
  .action(async (options: { session: string; json?: boolean }) => {
    const snapshotManager = new SnapshotManager();
    await snapshotManager.init(options.session);

    const snapshots = snapshotManager.list();

    if (options.json) {
      console.log(JSON.stringify(snapshots, null, 2));
      return;
    }

    if (snapshots.length === 0) {
      console.log('No snapshots for this session.');
      return;
    }

    console.log(`Snapshots for session ${options.session}:`);
    console.log('');

    for (const snap of snapshots) {
      const age = Math.round((Date.now() - snap.createdAt.getTime()) / 1000 / 60);
      console.log(`  ${snap.id}`);
      console.log(`    Block: ${snap.blockNumber}`);
      console.log(`    Fork:  ${snap.forkId}`);
      console.log(`    Age:   ${age} minutes`);
      if (snap.taskId) {
        console.log(`    Task:  ${snap.taskId}`);
      }
      console.log('');
    }
  });

// =============================================================================
// Session Commands
// =============================================================================

program
  .command('session <network>')
  .description('Create a new Anchor session')
  .option('-b, --block <number>', 'Block number to fork at')
  .option('--rpc-url <url>', 'Custom RPC URL (overrides network default)')
  .action(async (networkName: string, options: { block?: string; rpcUrl?: string }) => {
    // Get network config
    let network = NETWORKS[networkName.toLowerCase()];
    if (!network) {
      if (options.rpcUrl) {
        network = {
          name: networkName,
          chainId: 1,
          rpcUrl: options.rpcUrl,
        };
      } else {
        console.error(`Unknown network: ${networkName}`);
        console.error(`Available networks: ${Object.keys(NETWORKS).join(', ')}`);
        process.exit(1);
      }
    }

    if (options.rpcUrl) {
      network = { ...network, rpcUrl: options.rpcUrl };
    }

    const sessionManager = new SessionManager();
    await sessionManager.init();

    try {
      console.log(`Creating session on ${network.name}...`);

      const session = await sessionManager.create(
        network,
        options.block ? { blockNumber: parseInt(options.block, 10) } : undefined
      );

      console.log('');
      console.log('Session created:');
      console.log('');
      console.log(`  Session ID:  ${session.metadata.id}`);
      console.log(`  Network:     ${session.metadata.network.name}`);
      console.log(`  Fork ID:     ${session.fork.id}`);
      console.log(`  Block:       ${session.fork.blockNumber}`);
      console.log(`  RPC URL:     ${session.fork.rpcUrl}`);
      console.log(`  Status:      ${session.metadata.status}`);
      console.log('');
      console.log('To resume this session later:');
      console.log(`  anchor resume ${session.metadata.id}`);
    } catch (error) {
      console.error('Failed to create session:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('sessions')
  .description('List all sessions')
  .option('--status <status>', 'Filter by status (active, suspended, complete, failed)')
  .option('--json', 'Output as JSON')
  .action(async (options: { status?: string; json?: boolean }) => {
    const sessionManager = new SessionManager();
    await sessionManager.init();

    const filter = options.status
      ? { status: options.status as 'active' | 'suspended' | 'complete' | 'failed' }
      : undefined;

    const sessions = sessionManager.list(filter);

    if (options.json) {
      console.log(JSON.stringify(sessions, null, 2));
      return;
    }

    if (sessions.length === 0) {
      console.log('No sessions found.');
      return;
    }

    console.log('Sessions:');
    console.log('');

    for (const session of sessions) {
      const age = Math.round((Date.now() - session.lastActivity.getTime()) / 1000 / 60);
      console.log(`  ${session.id}`);
      console.log(`    Network:  ${session.network.name}`);
      console.log(`    Status:   ${session.status}`);
      console.log(`    Block:    ${session.initialBlock}`);
      console.log(`    Age:      ${age} minutes`);
      console.log('');
    }
  });

program
  .command('resume <session-id>')
  .description('Resume an existing session')
  .action(async (sessionId: string) => {
    const sessionManager = new SessionManager();
    await sessionManager.init();

    try {
      console.log(`Resuming session ${sessionId}...`);

      const session = await sessionManager.resume(sessionId);

      console.log('');
      console.log('Session resumed:');
      console.log('');
      console.log(`  Session ID:  ${session.metadata.id}`);
      console.log(`  Network:     ${session.metadata.network.name}`);
      console.log(`  Fork ID:     ${session.fork.id}`);
      console.log(`  Block:       ${session.fork.blockNumber}`);
      console.log(`  RPC URL:     ${session.fork.rpcUrl}`);
      console.log(`  Status:      ${session.metadata.status}`);

      // Show task graph status
      const pending = session.taskGraph.getTasksByStatus('pending').length;
      const running = session.taskGraph.getTasksByStatus('running').length;
      const complete = session.taskGraph.getTasksByStatus('complete').length;
      const blocked = session.taskGraph.getTasksByStatus('blocked').length;

      console.log('');
      console.log('Task Graph:');
      console.log(`  Pending:   ${pending}`);
      console.log(`  Running:   ${running}`);
      console.log(`  Complete:  ${complete}`);
      console.log(`  Blocked:   ${blocked}`);
    } catch (error) {
      console.error('Failed to resume session:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('status <session-id>')
  .description('Show session status')
  .option('--json', 'Output as JSON')
  .action(async (sessionId: string, options: { json?: boolean }) => {
    const sessionManager = new SessionManager();
    await sessionManager.init();

    const metadata = sessionManager.get(sessionId);
    if (!metadata) {
      console.error(`Session not found: ${sessionId}`);
      process.exit(1);
    }

    if (options.json) {
      console.log(JSON.stringify(metadata, null, 2));
      return;
    }

    console.log('Session Status:');
    console.log('');
    console.log(`  ID:            ${metadata.id}`);
    console.log(`  Network:       ${metadata.network.name}`);
    console.log(`  Status:        ${metadata.status}`);
    console.log(`  Initial Block: ${metadata.initialBlock}`);
    console.log(`  Current Fork:  ${metadata.forkId}`);
    console.log(`  Created:       ${metadata.createdAt.toISOString()}`);
    console.log(`  Last Activity: ${metadata.lastActivity.toISOString()}`);
  });

program
  .command('graph <session-id>')
  .description('Show task graph for a session')
  .option('--json', 'Output as JSON')
  .action(async (sessionId: string, options: { json?: boolean }) => {
    const taskGraph = new TaskGraph({ sessionId, autoSave: false });
    await taskGraph.init();

    const data = taskGraph.toJSON();

    if (options.json) {
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    if (data.tasks.length === 0) {
      console.log('No tasks in graph.');
      return;
    }

    console.log(`Task Graph for session ${sessionId}:`);
    console.log('');

    // Group by status
    const byStatus = new Map<string, typeof data.tasks>();
    for (const task of data.tasks) {
      const existing = byStatus.get(task.status) ?? [];
      existing.push(task);
      byStatus.set(task.status, existing);
    }

    const statusOrder = ['running', 'pending', 'complete', 'blocked', 'failed'];

    for (const status of statusOrder) {
      const tasks = byStatus.get(status);
      if (!tasks || tasks.length === 0) continue;

      console.log(`  ${status.toUpperCase()} (${tasks.length}):`);

      for (const task of tasks) {
        console.log(`    ${task.id}`);
        console.log(`      Type: ${task.type}`);
        if (task.snapshotId) {
          console.log(`      Snapshot: ${task.snapshotId}`);
        }
        if (task.dependencies.length > 0) {
          console.log(`      Dependencies: ${task.dependencies.join(', ')}`);
        }
      }
      console.log('');
    }
  });

// =============================================================================
// Checkpoint Commands
// =============================================================================

program
  .command('checkpoint <session-id>')
  .description('Create a checkpoint for a session')
  .requiredOption('-f, --fork <id>', 'Fork ID to checkpoint')
  .action(async (sessionId: string, options: { fork: string }) => {
    const forkManager = new ForkManager();
    await forkManager.init();

    const fork = forkManager.get(options.fork);
    if (!fork) {
      console.error(`Fork not found: ${options.fork}`);
      process.exit(1);
    }

    const checkpointManager = new CheckpointManager();
    await checkpointManager.init(sessionId, options.fork);

    try {
      console.log('Creating checkpoint...');

      const checkpoint = await checkpointManager.create(fork.rpcUrl);

      console.log('');
      console.log('Checkpoint created:');
      console.log('');
      console.log(`  ID:             ${checkpoint.id}`);
      console.log(`  Session:        ${checkpoint.sessionId}`);
      console.log(`  Fork:           ${checkpoint.forkId}`);
      console.log(`  Block:          ${checkpoint.blockNumber}`);
      console.log(`  Snapshot Range: ${checkpoint.snapshotRange.first} - ${checkpoint.snapshotRange.last}`);
      console.log(`  Snapshot Count: ${checkpoint.snapshotCount}`);
    } catch (error) {
      console.error('Failed to create checkpoint:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('checkpoints <session-id>')
  .description('List checkpoints for a session')
  .option('--json', 'Output as JSON')
  .action(async (sessionId: string, options: { json?: boolean }) => {
    const checkpointManager = new CheckpointManager();
    // Initialize with dummy fork ID since we just want to list
    await checkpointManager.init(sessionId, 'list-only');

    const checkpoints = checkpointManager.list();

    if (options.json) {
      console.log(JSON.stringify(checkpoints, null, 2));
      return;
    }

    if (checkpoints.length === 0) {
      console.log('No checkpoints for this session.');
      return;
    }

    console.log(`Checkpoints for session ${sessionId}:`);
    console.log('');

    for (const cp of checkpoints) {
      const age = Math.round((Date.now() - cp.createdAt.getTime()) / 1000 / 60);
      console.log(`  ${cp.id}`);
      console.log(`    Block:          ${cp.blockNumber}`);
      console.log(`    Fork:           ${cp.forkId}`);
      console.log(`    Snapshot Range: ${cp.snapshotRange.first} - ${cp.snapshotRange.last}`);
      console.log(`    Age:            ${age} minutes`);
      console.log('');
    }
  });

program
  .command('restore <checkpoint-id>')
  .description('Restore session from a checkpoint')
  .requiredOption('-s, --session <id>', 'Session ID')
  .action(async (checkpointId: string, options: { session: string }) => {
    const sessionManager = new SessionManager();
    await sessionManager.init();

    const metadata = sessionManager.get(options.session);
    if (!metadata) {
      console.error(`Session not found: ${options.session}`);
      process.exit(1);
    }

    const forkManager = new ForkManager();
    await forkManager.init();

    const checkpointManager = new CheckpointManager();
    await checkpointManager.init(options.session, metadata.forkId);

    const checkpoint = checkpointManager.get(checkpointId);
    if (!checkpoint) {
      console.error(`Checkpoint not found: ${checkpointId}`);
      process.exit(1);
    }

    try {
      console.log(`Restoring from checkpoint ${checkpointId}...`);

      const fork = await checkpointManager.restore(checkpointId, forkManager, metadata.network);

      console.log('');
      console.log('Restored successfully:');
      console.log('');
      console.log(`  New Fork ID:  ${fork.id}`);
      console.log(`  Block:        ${fork.blockNumber}`);
      console.log(`  RPC URL:      ${fork.rpcUrl}`);
    } catch (error) {
      console.error('Failed to restore:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// =============================================================================
// Version Info
// =============================================================================

program
  .command('version')
  .description('Show Anchor version')
  .action(() => {
    console.log(`Anchor v${VERSION}`);
    console.log('Ground truth enforcement for Sigil design physics.');
  });

// Parse and run
program.parse();
