/**
 * @sigil-tier gold
 * Startup Sentinel Tests
 *
 * Integration tests for the startup sentinel flow.
 * Tests workshop freshness checking and rebuild triggering.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  acquireLock,
  releaseLock,
  isLocked,
  quickRebuild,
  runSentinel,
  ensureWorkshopReady,
  logSentinelDecision,
} from '../../process/startup-sentinel';
import {
  buildWorkshop,
  getPackageHash,
  getImportsHash,
} from '../../process/workshop-builder';

// =============================================================================
// TEST FIXTURES
// =============================================================================

const FIXTURES_DIR = path.join(__dirname, 'fixtures', 'sentinel');

function createTestFixtures() {
  const fixturesPath = FIXTURES_DIR;

  // Create directories
  fs.mkdirSync(path.join(fixturesPath, 'node_modules', 'test-pkg', 'dist'), { recursive: true });
  fs.mkdirSync(path.join(fixturesPath, 'src', 'sanctuary', 'gold'), { recursive: true });
  fs.mkdirSync(path.join(fixturesPath, '.sigil'), { recursive: true });

  // Create package.json
  fs.writeFileSync(
    path.join(fixturesPath, 'package.json'),
    JSON.stringify({ name: 'test-project', version: '1.0.0', dependencies: { 'test-pkg': '^1.0.0' } })
  );

  // Create imports.yaml
  fs.writeFileSync(
    path.join(fixturesPath, '.sigil', 'imports.yaml'),
    '- test-pkg\n'
  );

  // Create test package
  fs.writeFileSync(
    path.join(fixturesPath, 'node_modules', 'test-pkg', 'package.json'),
    JSON.stringify({ name: 'test-pkg', version: '2.0.0', types: './dist/index.d.ts' })
  );

  fs.writeFileSync(
    path.join(fixturesPath, 'node_modules', 'test-pkg', 'dist', 'index.d.ts'),
    `export function motion(props: object): JSX.Element;`
  );

  fs.writeFileSync(
    path.join(fixturesPath, 'node_modules', 'test-pkg', 'README.md'),
    '# Test Package'
  );

  // Create sanctuary component
  fs.writeFileSync(
    path.join(fixturesPath, 'src', 'sanctuary', 'gold', 'TestButton.tsx'),
    `/**
 * @sigil-tier gold
 * @sigil-zone critical
 */
import { motion } from 'test-pkg';
export function TestButton() { return null; }`
  );

  return fixturesPath;
}

function cleanupTestFixtures() {
  if (fs.existsSync(FIXTURES_DIR)) {
    fs.rmSync(FIXTURES_DIR, { recursive: true, force: true });
  }
}

// =============================================================================
// LOCK FILE TESTS
// =============================================================================

describe('Lock File Handling', () => {
  let fixturesPath: string;
  let lockPath: string;

  beforeAll(() => {
    fixturesPath = createTestFixtures();
    lockPath = path.join(fixturesPath, '.sigil', 'workshop.lock');
  });

  afterAll(() => {
    cleanupTestFixtures();
  });

  beforeEach(() => {
    // Clean up lock between tests
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
    }
  });

  describe('acquireLock', () => {
    it('acquires lock when none exists', () => {
      const result = acquireLock(lockPath);
      expect(result).toBe(true);
      expect(fs.existsSync(lockPath)).toBe(true);
      releaseLock(lockPath);
    });

    it('fails to acquire when lock already held', () => {
      acquireLock(lockPath);
      const result = acquireLock(lockPath);
      expect(result).toBe(false);
      releaseLock(lockPath);
    });

    it('acquires stale lock', () => {
      // Create a stale lock (old timestamp)
      const staleData = {
        timestamp: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
        pid: 12345,
      };
      fs.writeFileSync(lockPath, JSON.stringify(staleData));

      const result = acquireLock(lockPath);
      expect(result).toBe(true);
      releaseLock(lockPath);
    });

    it('handles corrupted lock file', () => {
      fs.writeFileSync(lockPath, 'not valid json');
      const result = acquireLock(lockPath);
      expect(result).toBe(true);
      releaseLock(lockPath);
    });
  });

  describe('releaseLock', () => {
    it('removes lock file', () => {
      acquireLock(lockPath);
      expect(fs.existsSync(lockPath)).toBe(true);
      releaseLock(lockPath);
      expect(fs.existsSync(lockPath)).toBe(false);
    });

    it('handles missing lock file gracefully', () => {
      expect(() => releaseLock(lockPath)).not.toThrow();
    });
  });

  describe('isLocked', () => {
    it('returns false when no lock exists', () => {
      expect(isLocked(lockPath)).toBe(false);
    });

    it('returns true when active lock exists', () => {
      acquireLock(lockPath);
      expect(isLocked(lockPath)).toBe(true);
      releaseLock(lockPath);
    });

    it('returns false for stale lock', () => {
      const staleData = {
        timestamp: new Date(Date.now() - 120000).toISOString(),
        pid: 12345,
      };
      fs.writeFileSync(lockPath, JSON.stringify(staleData));
      expect(isLocked(lockPath)).toBe(false);
    });
  });
});

// =============================================================================
// QUICK REBUILD TESTS
// =============================================================================

describe('Quick Rebuild', () => {
  let fixturesPath: string;

  beforeAll(async () => {
    fixturesPath = createTestFixtures();
    // Build initial workshop
    await buildWorkshop({ projectRoot: fixturesPath });
  });

  afterAll(() => {
    cleanupTestFixtures();
  });

  describe('quickRebuild', () => {
    it('rebuilds materials section', async () => {
      const result = await quickRebuild({
        projectRoot: fixturesPath,
        sections: ['materials'],
      });

      expect(result.success).toBe(true);
      expect(result.rebuiltSections).toContain('materials');
    });

    it('rebuilds components section', async () => {
      const result = await quickRebuild({
        projectRoot: fixturesPath,
        sections: ['components'],
      });

      expect(result.success).toBe(true);
      expect(result.rebuiltSections).toContain('components');
    });

    it('updates hashes when requested', async () => {
      const result = await quickRebuild({
        projectRoot: fixturesPath,
        sections: ['materials'],
        updateHashes: true,
      });

      expect(result.success).toBe(true);

      // Verify hashes are current
      const workshopPath = path.join(fixturesPath, '.sigil', 'workshop.json');
      const workshop = JSON.parse(fs.readFileSync(workshopPath, 'utf-8'));
      expect(workshop.package_hash).toBe(getPackageHash(fixturesPath));
    });

    it('completes in under 2 seconds', async () => {
      const result = await quickRebuild({
        projectRoot: fixturesPath,
        sections: ['materials', 'components'],
      });

      expect(result.durationMs).toBeLessThan(2000);
    });
  });
});

// =============================================================================
// STARTUP SENTINEL TESTS
// =============================================================================

describe('Startup Sentinel', () => {
  let fixturesPath: string;

  beforeAll(() => {
    fixturesPath = createTestFixtures();
  });

  afterAll(() => {
    cleanupTestFixtures();
  });

  beforeEach(() => {
    // Clean up workshop and lock between tests
    const workshopPath = path.join(fixturesPath, '.sigil', 'workshop.json');
    const lockPath = path.join(fixturesPath, '.sigil', 'workshop.lock');
    if (fs.existsSync(workshopPath)) {
      fs.unlinkSync(workshopPath);
    }
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
    }
  });

  describe('runSentinel', () => {
    it('skips rebuild when workshop is fresh', async () => {
      // Build workshop first
      await buildWorkshop({ projectRoot: fixturesPath });

      const result = await runSentinel({
        projectRoot: fixturesPath,
      });

      expect(result.fresh).toBe(true);
      expect(result.rebuilt).toBe(false);
      expect(result.fallback).toBe(false);
    });

    it('triggers rebuild when workshop is missing', async () => {
      const result = await runSentinel({
        projectRoot: fixturesPath,
      });

      expect(result.rebuilt).toBe(true);
      expect(result.fallback).toBe(false);
    });

    it('triggers rebuild when package hash changes', async () => {
      // Build workshop first
      await buildWorkshop({ projectRoot: fixturesPath });

      // Modify package.json
      const packagePath = path.join(fixturesPath, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      pkg.version = '2.0.0';
      fs.writeFileSync(packagePath, JSON.stringify(pkg));

      const result = await runSentinel({
        projectRoot: fixturesPath,
      });

      expect(result.rebuilt).toBe(true);
      expect(result.reason).toContain('package_changed');
    });

    it('triggers rebuild when imports hash changes', async () => {
      // Build workshop first
      await buildWorkshop({ projectRoot: fixturesPath });

      // Modify imports.yaml
      const importsPath = path.join(fixturesPath, '.sigil', 'imports.yaml');
      fs.writeFileSync(importsPath, '- test-pkg\n- another-pkg\n');

      const result = await runSentinel({
        projectRoot: fixturesPath,
      });

      expect(result.rebuilt).toBe(true);
      expect(result.reason).toContain('imports_changed');
    });

    it('handles concurrent rebuild attempts', async () => {
      // Acquire lock manually
      const lockPath = path.join(fixturesPath, '.sigil', 'workshop.lock');
      acquireLock(lockPath);

      // Start sentinel (should wait or fallback)
      const resultPromise = runSentinel({
        projectRoot: fixturesPath,
        lockTimeout: 500, // Short timeout for test
      });

      // Release lock after a short delay
      setTimeout(() => releaseLock(lockPath), 200);

      const result = await resultPromise;

      // Should either succeed after lock release or fallback
      expect(result.fallback || result.rebuilt || result.fresh).toBe(true);
    });
  });
});

// =============================================================================
// INTEGRATION WITH /CRAFT TESTS
// =============================================================================

describe('Integration with /craft', () => {
  let fixturesPath: string;

  beforeAll(() => {
    fixturesPath = createTestFixtures();
  });

  afterAll(() => {
    cleanupTestFixtures();
  });

  describe('ensureWorkshopReady', () => {
    it('returns workshop when fresh', async () => {
      // Build workshop first
      await buildWorkshop({ projectRoot: fixturesPath });

      const result = await ensureWorkshopReady(fixturesPath);

      expect(result.useWorkshop).toBe(true);
      expect(result.workshop).not.toBeNull();
      expect(result.workshop!.materials).toBeDefined();
    });

    it('rebuilds and returns workshop when stale', async () => {
      // Remove workshop to make it stale
      const workshopPath = path.join(fixturesPath, '.sigil', 'workshop.json');
      if (fs.existsSync(workshopPath)) {
        fs.unlinkSync(workshopPath);
      }

      const result = await ensureWorkshopReady(fixturesPath);

      expect(result.useWorkshop).toBe(true);
      expect(result.workshop).not.toBeNull();
    });

    it('falls back to JIT grep on rebuild failure', async () => {
      // Create an invalid setup that will cause rebuild to fail
      const brokenPath = path.join(FIXTURES_DIR, 'broken');
      fs.mkdirSync(brokenPath, { recursive: true });

      const result = await ensureWorkshopReady(brokenPath);

      expect(result.useWorkshop).toBe(false);
      expect(result.workshop).toBeNull();
      expect(result.fallbackReason).toBeDefined();

      fs.rmSync(brokenPath, { recursive: true, force: true });
    });
  });

  describe('logSentinelDecision', () => {
    it('logs without throwing', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = {
        fresh: true,
        rebuilt: false,
        fallback: false,
        reason: 'Workshop is current',
        durationMs: 5,
        warnings: [],
      };

      expect(() => logSentinelDecision(result)).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('logs warnings', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = {
        fresh: false,
        rebuilt: true,
        fallback: false,
        reason: 'Rebuilt due to package_changed',
        durationMs: 100,
        warnings: ['Some warning'],
      };

      logSentinelDecision(result);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('⚠'));

      consoleSpy.mockRestore();
    });
  });
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

describe('Performance', () => {
  let fixturesPath: string;

  beforeAll(async () => {
    fixturesPath = createTestFixtures();
    await buildWorkshop({ projectRoot: fixturesPath });
  });

  afterAll(() => {
    cleanupTestFixtures();
  });

  it('fresh check completes in <10ms', async () => {
    const result = await runSentinel({
      projectRoot: fixturesPath,
    });

    expect(result.durationMs).toBeLessThan(10);
  });

  it('full rebuild completes in <2s', async () => {
    // Remove workshop to force rebuild
    const workshopPath = path.join(fixturesPath, '.sigil', 'workshop.json');
    if (fs.existsSync(workshopPath)) {
      fs.unlinkSync(workshopPath);
    }

    const result = await runSentinel({
      projectRoot: fixturesPath,
    });

    expect(result.durationMs).toBeLessThan(2000);
  });
});
