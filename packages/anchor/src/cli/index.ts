#!/usr/bin/env node

/**
 * Anchor CLI
 *
 * Ground truth enforcement for Sigil design physics.
 */

import { Command } from 'commander';
import { ForkManager } from '../lifecycle/fork-manager.js';
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
        blockNumber: options.block ? parseInt(options.block, 10) : undefined,
        port: options.port ? parseInt(options.port, 10) : undefined,
        sessionId: options.session,
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
