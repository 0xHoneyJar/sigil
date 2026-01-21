import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SnapshotManager } from './snapshot-manager.js';
import type { SnapshotConfig } from '../types.js';

// Mock fs operations
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  readdir: vi.fn().mockResolvedValue([]),
  unlink: vi.fn(),
}));

vi.mock('node:fs', () => ({
  existsSync: vi.fn(() => false),
}));

// Mock RPC functions
vi.mock('../utils/rpc.js', () => ({
  rpcCall: vi.fn()
    .mockResolvedValueOnce('0x1') // evm_snapshot
    .mockResolvedValueOnce('0x100'), // eth_blockNumber
}));

describe('SnapshotManager', () => {
  let manager: SnapshotManager;

  const testConfig: SnapshotConfig = {
    forkId: 'fork-123',
    sessionId: 'session-456',
    taskId: 'task-789',
    description: 'Test snapshot',
  };

  beforeEach(async () => {
    manager = new SnapshotManager({ basePath: '/tmp/test-sessions' });
    await manager.init('session-456');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a snapshot with correct metadata', async () => {
      const { rpcCall } = await import('../utils/rpc.js');
      vi.mocked(rpcCall)
        .mockResolvedValueOnce('0x1')
        .mockResolvedValueOnce('0x100');

      const snapshot = await manager.create(testConfig, 'http://localhost:8545');

      expect(snapshot).toBeDefined();
      expect(snapshot.id).toBe('0x1');
      expect(snapshot.forkId).toBe('fork-123');
      expect(snapshot.sessionId).toBe('session-456');
      expect(snapshot.taskId).toBe('task-789');
      expect(snapshot.blockNumber).toBe(256); // 0x100
      expect(snapshot.description).toBe('Test snapshot');
    });
  });

  describe('get', () => {
    it('should return snapshot by ID', async () => {
      const { rpcCall } = await import('../utils/rpc.js');
      vi.mocked(rpcCall)
        .mockResolvedValueOnce('0x1')
        .mockResolvedValueOnce('0x100');

      const created = await manager.create(testConfig, 'http://localhost:8545');
      const retrieved = manager.get(created.id);

      expect(retrieved).toEqual(created);
    });

    it('should return undefined for unknown ID', () => {
      const result = manager.get('unknown');
      expect(result).toBeUndefined();
    });
  });

  describe('getForTask', () => {
    it('should return snapshot for task', async () => {
      const { rpcCall } = await import('../utils/rpc.js');
      vi.mocked(rpcCall)
        .mockResolvedValueOnce('0x1')
        .mockResolvedValueOnce('0x100');

      const created = await manager.create(testConfig, 'http://localhost:8545');
      const snapshot = manager.getForTask('task-789');

      expect(snapshot).toEqual(created);
    });
  });

  describe('list', () => {
    it('should return snapshots sorted by time', async () => {
      const { rpcCall } = await import('../utils/rpc.js');
      vi.mocked(rpcCall)
        .mockReset()
        .mockResolvedValueOnce('0x1')
        .mockResolvedValueOnce('0x100')
        .mockResolvedValueOnce('0x2')
        .mockResolvedValueOnce('0x200');

      await manager.create({ ...testConfig, taskId: 'task-1' }, 'http://localhost:8545');
      await manager.create({ ...testConfig, taskId: 'task-2' }, 'http://localhost:8545');

      const snapshots = manager.list();
      expect(snapshots).toHaveLength(2);
      expect(snapshots[0]!.id).toBe('0x1');
      expect(snapshots[1]!.id).toBe('0x2');
    });
  });

  describe('count', () => {
    it('should return snapshot count', async () => {
      const { rpcCall } = await import('../utils/rpc.js');
      vi.mocked(rpcCall)
        .mockResolvedValueOnce('0x1')
        .mockResolvedValueOnce('0x100');

      expect(manager.count()).toBe(0);

      await manager.create(testConfig, 'http://localhost:8545');

      expect(manager.count()).toBe(1);
    });
  });
});
