import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ForkManager } from './fork-manager.js';
import type { ForkConfig, NetworkConfig } from '../types.js';

// Mock child_process
vi.mock('node:child_process', () => ({
  spawn: vi.fn(() => ({
    pid: 12345,
    on: vi.fn(),
    kill: vi.fn(),
    killed: false,
  })),
}));

// Mock fs operations
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

vi.mock('node:fs', () => ({
  existsSync: vi.fn(() => false),
}));

// Mock RPC functions
vi.mock('../utils/rpc.js', () => ({
  rpcCall: vi.fn().mockResolvedValue('0x1'),
  waitForRpc: vi.fn().mockResolvedValue(undefined),
  isRpcReady: vi.fn().mockResolvedValue(true),
}));

describe('ForkManager', () => {
  let manager: ForkManager;

  const testNetwork: NetworkConfig = {
    name: 'mainnet',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com',
  };

  const testConfig: ForkConfig = {
    network: testNetwork,
    blockNumber: 19000000,
    port: 8545,
  };

  beforeEach(() => {
    manager = new ForkManager({ registryPath: '/tmp/test-forks.json' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('fork', () => {
    it('should create a new fork', async () => {
      const fork = await manager.fork(testConfig);

      expect(fork).toBeDefined();
      expect(fork.id).toMatch(/^fork-/);
      expect(fork.network).toEqual(testNetwork);
      expect(fork.port).toBe(8545);
      expect(fork.rpcUrl).toBe('http://127.0.0.1:8545');
      expect(fork.pid).toBe(12345);
    });

    it('should emit fork:created event', async () => {
      const handler = vi.fn();
      manager.on('fork:created', handler);

      const fork = await manager.fork(testConfig);

      expect(handler).toHaveBeenCalledWith(fork);
    });

    it('should auto-assign port if not specified', async () => {
      const configWithoutPort: ForkConfig = {
        network: testNetwork,
      };

      const fork = await manager.fork(configWithoutPort);
      expect(fork.port).toBeGreaterThanOrEqual(8545);
    });
  });

  describe('list', () => {
    it('should return all active forks', async () => {
      const fork1 = await manager.fork({ ...testConfig, port: 8545 });
      const fork2 = await manager.fork({ ...testConfig, port: 8546 });

      const forks = manager.list();
      expect(forks).toHaveLength(2);
      expect(forks).toContainEqual(fork1);
      expect(forks).toContainEqual(fork2);
    });
  });

  describe('get', () => {
    it('should return fork by ID', async () => {
      const fork = await manager.fork(testConfig);
      const retrieved = manager.get(fork.id);

      expect(retrieved).toEqual(fork);
    });

    it('should return undefined for unknown ID', () => {
      const result = manager.get('unknown-id');
      expect(result).toBeUndefined();
    });
  });

  describe('kill', () => {
    it('should remove fork from registry', async () => {
      const fork = await manager.fork(testConfig);
      expect(manager.list()).toHaveLength(1);

      await manager.kill(fork.id);
      expect(manager.list()).toHaveLength(0);
    });
  });

  describe('killAll', () => {
    it('should remove all forks', async () => {
      await manager.fork({ ...testConfig, port: 8545 });
      await manager.fork({ ...testConfig, port: 8546 });
      expect(manager.list()).toHaveLength(2);

      await manager.killAll();
      expect(manager.list()).toHaveLength(0);
    });
  });

  describe('exportEnv', () => {
    it('should return environment variables', async () => {
      const fork = await manager.fork(testConfig);
      const env = manager.exportEnv(fork.id);

      expect(env).toEqual({
        RPC_URL: fork.rpcUrl,
        CHAIN_ID: '1',
        FORK_BLOCK: fork.blockNumber.toString(),
        FORK_ID: fork.id,
      });
    });

    it('should throw for unknown fork', () => {
      expect(() => manager.exportEnv('unknown')).toThrow('Fork unknown not found');
    });
  });
});
