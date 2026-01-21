/**
 * CheckpointManager tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CheckpointManager, resetCheckpointManager } from './checkpoint-manager.js';

// Mock fs operations
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  readdir: vi.fn(),
  rm: vi.fn(),
}));

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}));

// Mock RPC calls
vi.mock('../utils/rpc.js', () => ({
  rpcCall: vi.fn(),
}));

import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { rpcCall } from '../utils/rpc.js';

describe('CheckpointManager', () => {
  let manager: CheckpointManager;

  beforeEach(() => {
    vi.clearAllMocks();
    resetCheckpointManager();
    manager = new CheckpointManager({
      basePath: '/test/checkpoints',
      snapshotInterval: 3,
      maxCheckpoints: 2,
    });

    // Default mocks
    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(readdir).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('init', () => {
    it('should initialize with session and fork IDs', async () => {
      await manager.init('session-1', 'fork-1');

      // Should attempt to load existing checkpoints
      expect(existsSync).toHaveBeenCalled();
    });

    it('should load existing checkpoints from disk', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdir).mockResolvedValue([
        { name: 'cp-abc123', isDirectory: () => true },
      ] as any);
      vi.mocked(readFile).mockResolvedValue(
        JSON.stringify({
          id: 'cp-abc123',
          sessionId: 'session-1',
          forkId: 'fork-1',
          snapshotRange: { first: 'snap-1', last: 'snap-3' },
          blockNumber: 1000,
          createdAt: new Date().toISOString(),
          snapshotCount: 3,
        })
      );

      await manager.init('session-1', 'fork-1');

      const checkpoints = manager.list();
      expect(checkpoints).toHaveLength(1);
      expect(checkpoints[0].id).toBe('cp-abc123');
    });
  });

  describe('onSnapshot', () => {
    beforeEach(async () => {
      await manager.init('session-1', 'fork-1');
    });

    it('should track snapshots and return false before interval', async () => {
      const result1 = await manager.onSnapshot('snap-1', 'http://localhost:8545');
      expect(result1).toBe(false);

      const result2 = await manager.onSnapshot('snap-2', 'http://localhost:8545');
      expect(result2).toBe(false);
    });

    it('should create checkpoint when interval reached', async () => {
      // Mock RPC calls for checkpoint creation
      vi.mocked(rpcCall)
        .mockResolvedValueOnce('0x1234') // anvil_dumpState
        .mockResolvedValueOnce('0x3e8'); // eth_blockNumber (1000)

      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(mkdir).mockResolvedValue(undefined);
      vi.mocked(writeFile).mockResolvedValue(undefined);

      await manager.onSnapshot('snap-1', 'http://localhost:8545');
      await manager.onSnapshot('snap-2', 'http://localhost:8545');
      const result = await manager.onSnapshot('snap-3', 'http://localhost:8545');

      expect(result).toBe(true);
      expect(rpcCall).toHaveBeenCalledWith('http://localhost:8545', 'anvil_dumpState');
    });
  });

  describe('create', () => {
    beforeEach(async () => {
      await manager.init('session-1', 'fork-1');
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(mkdir).mockResolvedValue(undefined);
      vi.mocked(writeFile).mockResolvedValue(undefined);
    });

    it('should create checkpoint with correct metadata', async () => {
      vi.mocked(rpcCall)
        .mockResolvedValueOnce('0xstatedata') // anvil_dumpState
        .mockResolvedValueOnce('0x7d0'); // eth_blockNumber (2000)

      // Set up snapshot tracking
      await manager.onSnapshot('snap-1', 'http://localhost:8545');
      await manager.onSnapshot('snap-2', 'http://localhost:8545');

      const checkpoint = await manager.create('http://localhost:8545');

      expect(checkpoint.sessionId).toBe('session-1');
      expect(checkpoint.forkId).toBe('fork-1');
      expect(checkpoint.blockNumber).toBe(2000);
      expect(checkpoint.snapshotRange.first).toBe('snap-1');
      expect(checkpoint.snapshotRange.last).toBe('snap-2');
      expect(checkpoint.snapshotCount).toBe(2);
    });

    it('should throw if not initialized', async () => {
      const uninitManager = new CheckpointManager();

      await expect(uninitManager.create('http://localhost:8545')).rejects.toThrow(
        'CheckpointManager not initialized'
      );
    });
  });

  describe('restore', () => {
    beforeEach(async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdir).mockResolvedValue([
        { name: 'cp-abc123', isDirectory: () => true },
      ] as any);
      vi.mocked(readFile).mockResolvedValue(
        JSON.stringify({
          id: 'cp-abc123',
          sessionId: 'session-1',
          forkId: 'fork-1',
          snapshotRange: { first: 'snap-1', last: 'snap-3' },
          blockNumber: 1000,
          createdAt: new Date().toISOString(),
          snapshotCount: 3,
        })
      );

      await manager.init('session-1', 'fork-1');
    });

    it('should restore from checkpoint', async () => {
      const mockForkManager = {
        killAll: vi.fn().mockResolvedValue(undefined),
        fork: vi.fn().mockResolvedValue({
          id: 'fork-2',
          rpcUrl: 'http://localhost:8546',
          blockNumber: 1000,
        }),
      };

      vi.mocked(readFile).mockResolvedValueOnce('0xstatedata');
      vi.mocked(rpcCall).mockResolvedValueOnce(true); // anvil_loadState

      const fork = await manager.restore(
        'cp-abc123',
        mockForkManager as any,
        { name: 'mainnet', chainId: 1, rpcUrl: 'https://eth.rpc' }
      );

      expect(mockForkManager.killAll).toHaveBeenCalled();
      expect(mockForkManager.fork).toHaveBeenCalledWith(
        expect.objectContaining({
          blockNumber: 1000,
          sessionId: 'session-1',
        })
      );
      expect(rpcCall).toHaveBeenCalledWith(
        'http://localhost:8546',
        'anvil_loadState',
        ['0xstatedata']
      );
      expect(fork.id).toBe('fork-2');
    });

    it('should throw for unknown checkpoint', async () => {
      const mockForkManager = {
        killAll: vi.fn(),
        fork: vi.fn(),
      };

      await expect(
        manager.restore(
          'unknown-cp',
          mockForkManager as any,
          { name: 'mainnet', chainId: 1, rpcUrl: 'https://eth.rpc' }
        )
      ).rejects.toThrow('Checkpoint unknown-cp not found');
    });
  });

  describe('cleanup', () => {
    it('should remove old checkpoints beyond max', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdir).mockResolvedValue([
        { name: 'cp-1', isDirectory: () => true },
        { name: 'cp-2', isDirectory: () => true },
        { name: 'cp-3', isDirectory: () => true },
      ] as any);

      const now = Date.now();
      vi.mocked(readFile).mockImplementation(async (path) => {
        const pathStr = String(path);
        if (pathStr.includes('cp-1')) {
          return JSON.stringify({
            id: 'cp-1',
            sessionId: 'session-1',
            forkId: 'fork-1',
            snapshotRange: { first: 'a', last: 'b' },
            blockNumber: 100,
            createdAt: new Date(now - 3000).toISOString(),
            snapshotCount: 2,
          });
        }
        if (pathStr.includes('cp-2')) {
          return JSON.stringify({
            id: 'cp-2',
            sessionId: 'session-1',
            forkId: 'fork-1',
            snapshotRange: { first: 'c', last: 'd' },
            blockNumber: 200,
            createdAt: new Date(now - 2000).toISOString(),
            snapshotCount: 2,
          });
        }
        if (pathStr.includes('cp-3')) {
          return JSON.stringify({
            id: 'cp-3',
            sessionId: 'session-1',
            forkId: 'fork-1',
            snapshotRange: { first: 'e', last: 'f' },
            blockNumber: 300,
            createdAt: new Date(now - 1000).toISOString(),
            snapshotCount: 2,
          });
        }
        return '{}';
      });

      vi.mocked(rm).mockResolvedValue(undefined);

      await manager.init('session-1', 'fork-1');

      // Should have 3 checkpoints initially
      expect(manager.list()).toHaveLength(3);

      // Cleanup should remove the oldest (cp-1)
      await manager.cleanup();

      // The manager's in-memory map should reflect deletion
      expect(manager.get('cp-1')).toBeUndefined();
      expect(rm).toHaveBeenCalledWith(
        expect.stringContaining('cp-1'),
        { recursive: true }
      );
    });
  });

  describe('findCheckpointForSnapshot', () => {
    beforeEach(async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdir).mockResolvedValue([
        { name: 'cp-1', isDirectory: () => true },
        { name: 'cp-2', isDirectory: () => true },
      ] as any);

      const now = Date.now();
      vi.mocked(readFile).mockImplementation(async (path) => {
        const pathStr = String(path);
        if (pathStr.includes('cp-1')) {
          return JSON.stringify({
            id: 'cp-1',
            sessionId: 'session-1',
            forkId: 'fork-1',
            snapshotRange: { first: 'snap-001', last: 'snap-010' },
            blockNumber: 100,
            createdAt: new Date(now - 2000).toISOString(),
            snapshotCount: 10,
          });
        }
        if (pathStr.includes('cp-2')) {
          return JSON.stringify({
            id: 'cp-2',
            sessionId: 'session-1',
            forkId: 'fork-1',
            snapshotRange: { first: 'snap-011', last: 'snap-020' },
            blockNumber: 200,
            createdAt: new Date(now - 1000).toISOString(),
            snapshotCount: 10,
          });
        }
        return '{}';
      });

      await manager.init('session-1', 'fork-1');
    });

    it('should find checkpoint containing snapshot', () => {
      const checkpoint = manager.findCheckpointForSnapshot('snap-005');
      expect(checkpoint?.id).toBe('cp-1');
    });

    it('should find latest checkpoint for snapshot in range', () => {
      const checkpoint = manager.findCheckpointForSnapshot('snap-015');
      expect(checkpoint?.id).toBe('cp-2');
    });

    it('should return latest checkpoint if not found in any range', () => {
      const checkpoint = manager.findCheckpointForSnapshot('snap-999');
      expect(checkpoint?.id).toBe('cp-2');
    });
  });

  describe('latest', () => {
    it('should return the most recent checkpoint', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdir).mockResolvedValue([
        { name: 'cp-old', isDirectory: () => true },
        { name: 'cp-new', isDirectory: () => true },
      ] as any);

      const now = Date.now();
      vi.mocked(readFile).mockImplementation(async (path) => {
        const pathStr = String(path);
        if (pathStr.includes('cp-old')) {
          return JSON.stringify({
            id: 'cp-old',
            sessionId: 'session-1',
            forkId: 'fork-1',
            snapshotRange: { first: 'a', last: 'b' },
            blockNumber: 100,
            createdAt: new Date(now - 10000).toISOString(),
            snapshotCount: 2,
          });
        }
        if (pathStr.includes('cp-new')) {
          return JSON.stringify({
            id: 'cp-new',
            sessionId: 'session-1',
            forkId: 'fork-1',
            snapshotRange: { first: 'c', last: 'd' },
            blockNumber: 200,
            createdAt: new Date(now).toISOString(),
            snapshotCount: 2,
          });
        }
        return '{}';
      });

      await manager.init('session-1', 'fork-1');

      const latest = manager.latest();
      expect(latest?.id).toBe('cp-new');
    });

    it('should return undefined if no checkpoints', async () => {
      await manager.init('session-1', 'fork-1');

      const latest = manager.latest();
      expect(latest).toBeUndefined();
    });
  });
});
