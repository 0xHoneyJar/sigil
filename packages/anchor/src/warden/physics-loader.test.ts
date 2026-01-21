/**
 * PhysicsLoader Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { writeFile, mkdir, unlink, rmdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import {
  loadPhysics,
  getPhysicsRule,
  getDefaultPhysics,
  clearPhysicsCache,
  isPhysicsCached,
} from './physics-loader.js';

const TEST_DIR = 'test-physics-loader';

const MOCK_PHYSICS_MD = `# Sigil: Behavioral Physics

<physics_table>
## The Physics Table

| Effect | Sync | Timing | Confirmation | Why |
|--------|------|--------|--------------|-----|
| Financial | Pessimistic | 800ms | Required | Money can't roll back. |
| Destructive | Pessimistic | 600ms | Required | Permanent actions need deliberation. |
| Soft Delete | Optimistic | 200ms | Toast + Undo | Undo exists. |
| Standard | Optimistic | 200ms | None | Low stakes. |
| Local State | Immediate | 100ms | None | No server. |
</physics_table>
`;

describe('PhysicsLoader', () => {
  beforeEach(async () => {
    clearPhysicsCache();
    if (!existsSync(TEST_DIR)) {
      await mkdir(TEST_DIR, { recursive: true });
    }
  });

  afterEach(async () => {
    clearPhysicsCache();
    // Clean up test files
    try {
      if (existsSync(`${TEST_DIR}/physics.md`)) {
        await unlink(`${TEST_DIR}/physics.md`);
      }
      if (existsSync(TEST_DIR)) {
        await rmdir(TEST_DIR);
      }
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('getDefaultPhysics', () => {
    it('returns all expected effect types', () => {
      const physics = getDefaultPhysics();

      expect(physics.has('financial')).toBe(true);
      expect(physics.has('destructive')).toBe(true);
      expect(physics.has('soft_delete')).toBe(true);
      expect(physics.has('standard')).toBe(true);
      expect(physics.has('local')).toBe(true);
      expect(physics.has('navigation')).toBe(true);
      expect(physics.has('query')).toBe(true);
      expect(physics.has('high_freq')).toBe(true);
    });

    it('returns correct financial physics', () => {
      const physics = getDefaultPhysics();
      const financial = physics.get('financial');

      expect(financial).toBeDefined();
      expect(financial?.sync).toBe('pessimistic');
      expect(financial?.timing).toBe(800);
      expect(financial?.confirmation).toBe('required');
    });

    it('returns correct local physics', () => {
      const physics = getDefaultPhysics();
      const local = physics.get('local');

      expect(local).toBeDefined();
      expect(local?.sync).toBe('immediate');
      expect(local?.timing).toBe(100);
      expect(local?.confirmation).toBe('none');
    });
  });

  describe('loadPhysics', () => {
    it('returns defaults when file not found', async () => {
      const physics = await loadPhysics('nonexistent-file.md');

      expect(physics.size).toBeGreaterThan(0);
      expect(physics.has('financial')).toBe(true);
    });

    it('parses physics from markdown file', async () => {
      await writeFile(`${TEST_DIR}/physics.md`, MOCK_PHYSICS_MD);

      const physics = await loadPhysics(`${TEST_DIR}/physics.md`);

      expect(physics.has('financial')).toBe(true);
      expect(physics.has('destructive')).toBe(true);
      expect(physics.has('soft_delete')).toBe(true);
      expect(physics.has('standard')).toBe(true);
      expect(physics.has('local')).toBe(true);
    });

    it('parses correct values from markdown', async () => {
      await writeFile(`${TEST_DIR}/physics.md`, MOCK_PHYSICS_MD);

      const physics = await loadPhysics(`${TEST_DIR}/physics.md`);
      const financial = physics.get('financial');

      expect(financial?.sync).toBe('pessimistic');
      expect(financial?.timing).toBe(800);
      expect(financial?.confirmation).toBe('required');
    });

    it('caches loaded physics', async () => {
      await writeFile(`${TEST_DIR}/physics.md`, MOCK_PHYSICS_MD);

      expect(isPhysicsCached()).toBe(false);

      await loadPhysics(`${TEST_DIR}/physics.md`);
      expect(isPhysicsCached()).toBe(true);

      // Second call should return cached
      const physics = await loadPhysics(`${TEST_DIR}/physics.md`);
      expect(physics.has('financial')).toBe(true);
    });

    it('handles malformed markdown gracefully', async () => {
      await writeFile(`${TEST_DIR}/physics.md`, 'Not a physics table');

      const physics = await loadPhysics(`${TEST_DIR}/physics.md`);

      // Should return defaults
      expect(physics.has('financial')).toBe(true);
      expect(physics.size).toBeGreaterThan(0);
    });
  });

  describe('getPhysicsRule', () => {
    it('returns rule for valid effect', async () => {
      const rule = await getPhysicsRule('financial');

      expect(rule).toBeDefined();
      expect(rule?.effect).toBe('financial');
      expect(rule?.sync).toBe('pessimistic');
    });

    it('returns undefined for invalid effect', async () => {
      const rule = await getPhysicsRule('nonexistent' as any);

      expect(rule).toBeUndefined();
    });

    it('uses provided physics table', async () => {
      const customPhysics = getDefaultPhysics();
      customPhysics.set('financial', {
        effect: 'financial',
        sync: 'optimistic', // Changed for test
        timing: 500,
        confirmation: 'none',
        rationale: 'Custom',
      });

      const rule = await getPhysicsRule('financial', customPhysics);

      expect(rule?.sync).toBe('optimistic');
      expect(rule?.timing).toBe(500);
    });
  });

  describe('clearPhysicsCache', () => {
    it('clears the cache', async () => {
      await writeFile(`${TEST_DIR}/physics.md`, MOCK_PHYSICS_MD);
      await loadPhysics(`${TEST_DIR}/physics.md`);

      expect(isPhysicsCached()).toBe(true);

      clearPhysicsCache();

      expect(isPhysicsCached()).toBe(false);
    });
  });
});
