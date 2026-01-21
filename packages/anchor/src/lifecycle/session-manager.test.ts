/**
 * SessionManager tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SessionManager, resetSessionManager } from './session-manager.js';

// Mock fs operations
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  readdir: vi.fn(),
}));

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}));

// Mock managers
vi.mock('./fork-manager.js', () => ({
  ForkManager: vi.fn().mockImplementation(() => ({
    init: vi.fn().mockResolvedValue(undefined),
    fork: vi.fn().mockResolvedValue({
      id: 'fork-1',
      rpcUrl: 'http://localhost:8545',
      blockNumber: 1000,
      network: { name: 'mainnet', chainId: 1, rpcUrl: 'https://eth.rpc' },
      pid: 12345,
      createdAt: new Date(),
    }),
    get: vi.fn(),
    killAll: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('./snapshot-manager.js', () => ({
  SnapshotManager: vi.fn().mockImplementation(() => ({
    init: vi.fn().mockResolvedValue(undefined),
    create: vi.fn().mockResolvedValue({
      id: 'snap-1',
      evmSnapshotId: '0x1',
      sessionId: 'session-1',
      forkId: 'fork-1',
      blockNumber: 1000,
      createdAt: new Date(),
    }),
    revert: vi.fn().mockResolvedValue(true),
  })),
}));

vi.mock('./checkpoint-manager.js', () => ({
  CheckpointManager: vi.fn().mockImplementation(() => ({
    init: vi.fn().mockResolvedValue(undefined),
    latest: vi.fn().mockReturnValue(undefined),
    restore: vi.fn(),
  })),
}));

vi.mock('../graph/task-graph.js', () => ({
  TaskGraph: vi.fn().mockImplementation(() => ({
    init: vi.fn().mockResolvedValue(undefined),
    addTask: vi.fn().mockResolvedValue(undefined),
    hasBlocked: vi.fn().mockReturnValue(false),
    getTasksByStatus: vi.fn().mockReturnValue([]),
    findRecoveryPoint: vi.fn().mockReturnValue(undefined),
    updateStatus: vi.fn().mockResolvedValue(undefined),
  })),
}));

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

describe('SessionManager', () => {
  let manager: SessionManager;

  beforeEach(() => {
    vi.clearAllMocks();
    resetSessionManager();
    manager = new SessionManager({
      basePath: '/test/sessions',
    });

    // Default mocks
    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(readdir).mockResolvedValue([]);
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeFile).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('init', () => {
    it('should initialize and load session index', async () => {
      await manager.init();

      expect(existsSync).toHaveBeenCalled();
    });

    it('should load existing sessions from disk', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdir).mockResolvedValue([
        { name: 'session-abc', isDirectory: () => true },
      ] as any);
      vi.mocked(readFile).mockResolvedValue(
        JSON.stringify({
          id: 'session-abc',
          network: { name: 'mainnet', chainId: 1, rpcUrl: 'https://eth.rpc' },
          forkId: 'fork-1',
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          status: 'active',
          initialBlock: 1000,
        })
      );

      await manager.init();

      const sessions = manager.list();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('session-abc');
    });
  });

  describe('create', () => {
    beforeEach(async () => {
      await manager.init();
    });

    it('should create a new session with all managers', async () => {
      const network = { name: 'mainnet', chainId: 1, rpcUrl: 'https://eth.rpc' };

      const session = await manager.create(network);

      expect(session.metadata.network.name).toBe('mainnet');
      expect(session.metadata.status).toBe('active');
      expect(session.fork.id).toBe('fork-1');
      expect(session.fork.rpcUrl).toBe('http://localhost:8545');
    });

    it('should create initial snapshot', async () => {
      const network = { name: 'mainnet', chainId: 1, rpcUrl: 'https://eth.rpc' };
      const session = await manager.create(network);

      expect(session.snapshotManager.create).toHaveBeenCalledWith(
        expect.objectContaining({
          forkId: 'fork-1',
          description: 'Initial session snapshot',
        }),
        'http://localhost:8545'
      );
    });

    it('should add fork task to graph', async () => {
      const network = { name: 'mainnet', chainId: 1, rpcUrl: 'https://eth.rpc' };
      const session = await manager.create(network);

      expect(session.taskGraph.addTask).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'fork',
          status: 'complete',
        })
      );
    });

    it('should set as current session', async () => {
      const network = { name: 'mainnet', chainId: 1, rpcUrl: 'https://eth.rpc' };
      await manager.create(network);

      const current = manager.current();
      expect(current).not.toBeNull();
      expect(current?.metadata.network.name).toBe('mainnet');
    });
  });

  describe('resume', () => {
    beforeEach(async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdir).mockResolvedValue([
        { name: 'session-abc', isDirectory: () => true },
      ] as any);
      vi.mocked(readFile).mockResolvedValue(
        JSON.stringify({
          id: 'session-abc',
          network: { name: 'mainnet', chainId: 1, rpcUrl: 'https://eth.rpc' },
          forkId: 'fork-1',
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          status: 'suspended',
          initialBlock: 1000,
        })
      );

      await manager.init();
    });

    it('should resume existing session', async () => {
      // Mock fork manager to return existing fork
      const { ForkManager } = await import('./fork-manager.js');
      vi.mocked(ForkManager).mockImplementation(
        () =>
          ({
            init: vi.fn().mockResolvedValue(undefined),
            fork: vi.fn().mockResolvedValue({
              id: 'fork-1',
              rpcUrl: 'http://localhost:8545',
              blockNumber: 1000,
              network: { name: 'mainnet', chainId: 1, rpcUrl: 'https://eth.rpc' },
              pid: 12345,
              createdAt: new Date(),
            }),
            get: vi.fn().mockReturnValue({
              id: 'fork-1',
              rpcUrl: 'http://localhost:8545',
              blockNumber: 1000,
            }),
            killAll: vi.fn().mockResolvedValue(undefined),
          }) as any
      );

      const session = await manager.resume('session-abc');

      expect(session.metadata.id).toBe('session-abc');
      expect(session.metadata.status).toBe('active');
    });

    it('should throw for unknown session', async () => {
      await expect(manager.resume('unknown-session')).rejects.toThrow(
        'Session unknown-session not found'
      );
    });

    it('should trigger recovery if fork not found', async () => {
      const { ForkManager } = await import('./fork-manager.js');
      vi.mocked(ForkManager).mockImplementation(
        () =>
          ({
            init: vi.fn().mockResolvedValue(undefined),
            fork: vi.fn().mockResolvedValue({
              id: 'fork-2',
              rpcUrl: 'http://localhost:8546',
              blockNumber: 1000,
              network: { name: 'mainnet', chainId: 1, rpcUrl: 'https://eth.rpc' },
              pid: 12346,
              createdAt: new Date(),
            }),
            get: vi.fn().mockReturnValue(undefined), // Fork not found
            killAll: vi.fn().mockResolvedValue(undefined),
          }) as any
      );

      const session = await manager.resume('session-abc');

      // Should have created a new fork
      expect(session.fork.id).toBe('fork-2');
    });
  });

  describe('list', () => {
    beforeEach(async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdir).mockResolvedValue([
        { name: 'session-1', isDirectory: () => true },
        { name: 'session-2', isDirectory: () => true },
      ] as any);

      const now = Date.now();
      vi.mocked(readFile).mockImplementation(async (path) => {
        const pathStr = String(path);
        if (pathStr.includes('session-1')) {
          return JSON.stringify({
            id: 'session-1',
            network: { name: 'mainnet', chainId: 1, rpcUrl: 'https://eth.rpc' },
            forkId: 'fork-1',
            createdAt: new Date(now - 2000).toISOString(),
            lastActivity: new Date(now - 1000).toISOString(),
            status: 'active',
            initialBlock: 1000,
          });
        }
        if (pathStr.includes('session-2')) {
          return JSON.stringify({
            id: 'session-2',
            network: { name: 'sepolia', chainId: 11155111, rpcUrl: 'https://sepolia.rpc' },
            forkId: 'fork-2',
            createdAt: new Date(now - 5000).toISOString(),
            lastActivity: new Date(now - 500).toISOString(),
            status: 'complete',
            initialBlock: 2000,
          });
        }
        return '{}';
      });

      await manager.init();
    });

    it('should list all sessions sorted by last activity', async () => {
      const sessions = manager.list();

      expect(sessions).toHaveLength(2);
      // Most recent first
      expect(sessions[0].id).toBe('session-2');
      expect(sessions[1].id).toBe('session-1');
    });

    it('should filter by status', async () => {
      const activeSessions = manager.list({ status: 'active' });

      expect(activeSessions).toHaveLength(1);
      expect(activeSessions[0].id).toBe('session-1');
    });
  });

  describe('get', () => {
    beforeEach(async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdir).mockResolvedValue([
        { name: 'session-abc', isDirectory: () => true },
      ] as any);
      vi.mocked(readFile).mockResolvedValue(
        JSON.stringify({
          id: 'session-abc',
          network: { name: 'mainnet', chainId: 1, rpcUrl: 'https://eth.rpc' },
          forkId: 'fork-1',
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          status: 'active',
          initialBlock: 1000,
        })
      );

      await manager.init();
    });

    it('should get session by ID', () => {
      const session = manager.get('session-abc');

      expect(session).toBeDefined();
      expect(session?.id).toBe('session-abc');
    });

    it('should return undefined for unknown session', () => {
      const session = manager.get('unknown');

      expect(session).toBeUndefined();
    });
  });

  describe('updateStatus', () => {
    beforeEach(async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdir).mockResolvedValue([
        { name: 'session-abc', isDirectory: () => true },
      ] as any);
      vi.mocked(readFile).mockResolvedValue(
        JSON.stringify({
          id: 'session-abc',
          network: { name: 'mainnet', chainId: 1, rpcUrl: 'https://eth.rpc' },
          forkId: 'fork-1',
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          status: 'active',
          initialBlock: 1000,
        })
      );

      await manager.init();
    });

    it('should update session status', async () => {
      await manager.updateStatus('session-abc', 'complete');

      const session = manager.get('session-abc');
      expect(session?.status).toBe('complete');
    });

    it('should throw for unknown session', async () => {
      await expect(manager.updateStatus('unknown', 'complete')).rejects.toThrow(
        'Session unknown not found'
      );
    });

    it('should persist status change', async () => {
      await manager.updateStatus('session-abc', 'suspended');

      expect(writeFile).toHaveBeenCalled();
    });
  });

  describe('current', () => {
    it('should return null when no session active', async () => {
      await manager.init();

      const current = manager.current();
      expect(current).toBeNull();
    });

    it('should return current session after create', async () => {
      await manager.init();

      const network = { name: 'mainnet', chainId: 1, rpcUrl: 'https://eth.rpc' };
      await manager.create(network);

      const current = manager.current();
      expect(current).not.toBeNull();
    });
  });
});
