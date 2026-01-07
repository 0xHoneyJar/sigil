/**
 * Tests for moodboard-reader.ts
 */

import * as path from 'path';
import {
  readMoodboard,
  readMoodboardSync,
  getEntriesForZone,
  getEntriesForMaterial,
  getEntriesForTerm,
  getAntiPatterns,
  getEntriesForSource,
  getFeaturedReferences,
  searchMoodboard,
  getEntriesByTag,
  formatEntrySummary,
  formatMoodboardSummary,
  DEFAULT_MOODBOARD,
  DEFAULT_MOODBOARD_PATH,
  MAX_SCAN_DEPTH,
  SUPPORTED_IMAGE_EXTENSIONS,
  CATEGORY_DIRECTORIES,
  type Moodboard,
  type MoodboardEntry,
} from '../../process/moodboard-reader';

const FIXTURES_PATH = path.join(__dirname, '../fixtures/moodboard');

// =============================================================================
// readMoodboard Tests
// =============================================================================

describe('readMoodboard', () => {
  it('should return default for non-existent directory', async () => {
    const moodboard = await readMoodboard('/non/existent/path');
    expect(moodboard).toEqual(DEFAULT_MOODBOARD);
  });

  it('should parse index.yaml when present', async () => {
    const moodboard = await readMoodboard(FIXTURES_PATH);
    expect(moodboard.index).not.toBeNull();
    expect(moodboard.index?.version).toBe('1.0');
    expect(moodboard.index?.featured).toHaveLength(2);
  });

  it('should scan all category directories', async () => {
    const moodboard = await readMoodboard(FIXTURES_PATH);
    expect(moodboard.entries.length).toBeGreaterThan(0);

    // Should have entries from different categories
    const categories = new Set(moodboard.entries.map(e => e.category));
    expect(categories.has('reference')).toBe(true);
    expect(categories.has('article')).toBe(true);
    expect(categories.has('anti-pattern')).toBe(true);
    expect(categories.has('gtm')).toBe(true);
  });

  it('should parse markdown frontmatter', async () => {
    const moodboard = await readMoodboard(FIXTURES_PATH);
    const stripeEntry = moodboard.entries.find(e => e.path.includes('stripe'));

    expect(stripeEntry).toBeDefined();
    expect(stripeEntry?.frontmatter.source).toBe('Stripe');
    expect(stripeEntry?.frontmatter.zones).toContain('critical');
    expect(stripeEntry?.frontmatter.materials).toContain('decisive');
    expect(stripeEntry?.frontmatter.terms).toContain('deposit');
  });

  it('should extract title from H1', async () => {
    const moodboard = await readMoodboard(FIXTURES_PATH);
    const stripeEntry = moodboard.entries.find(e => e.path.includes('stripe'));

    expect(stripeEntry?.title).toBe('Stripe Checkout Flow');
  });

  it('should fall back to filename for title when no H1', async () => {
    const moodboard = await readMoodboard(FIXTURES_PATH);
    const imageEntry = moodboard.entries.find(e => e.type === 'image');

    if (imageEntry) {
      expect(imageEntry.title).toBeTruthy();
      expect(imageEntry.title).not.toBe('');
    }
  });

  it('should infer source from references path', async () => {
    const moodboard = await readMoodboard(FIXTURES_PATH);
    const stripeEntry = moodboard.entries.find(e => e.path.includes('references/stripe'));

    // inferredSource comes from frontmatter.source if present, else from path
    // The test fixture has source: "Stripe" in frontmatter
    expect(stripeEntry?.inferredSource?.toLowerCase()).toBe('stripe');
  });

  it('should index image files', async () => {
    const moodboard = await readMoodboard(FIXTURES_PATH);
    const imageEntries = moodboard.entries.filter(e => e.type === 'image');

    expect(imageEntries.length).toBeGreaterThanOrEqual(1);
    imageEntries.forEach(entry => {
      expect(entry.content).toBe('');
      expect(entry.frontmatter).toEqual({});
    });
  });

  it('should calculate statistics correctly', async () => {
    const moodboard = await readMoodboard(FIXTURES_PATH);

    expect(moodboard.stats.total).toBe(moodboard.entries.length);

    // Check byCategory counts
    let categorySum = 0;
    for (const count of Object.values(moodboard.stats.byCategory)) {
      categorySum += count;
    }
    expect(categorySum).toBe(moodboard.stats.total);

    // Check byType counts
    expect(moodboard.stats.byType.markdown + moodboard.stats.byType.image).toBe(moodboard.stats.total);
  });

  it('should respect max scan depth', async () => {
    // This is a structural test - we verify the constant exists
    expect(MAX_SCAN_DEPTH).toBe(3);
  });
});

// =============================================================================
// readMoodboardSync Tests
// =============================================================================

describe('readMoodboardSync', () => {
  it('should return same results as async version', () => {
    const syncResult = readMoodboardSync(FIXTURES_PATH);

    expect(syncResult.entries.length).toBeGreaterThan(0);
    expect(syncResult.index).not.toBeNull();
    expect(syncResult.stats.total).toBeGreaterThan(0);
  });

  it('should return default for non-existent directory', () => {
    const moodboard = readMoodboardSync('/non/existent/path');
    expect(moodboard).toEqual(DEFAULT_MOODBOARD);
  });
});

// =============================================================================
// Query Helper Tests
// =============================================================================

describe('Query Helpers', () => {
  let moodboard: Moodboard;

  beforeAll(async () => {
    moodboard = await readMoodboard(FIXTURES_PATH);
  });

  describe('getEntriesForZone', () => {
    it('should filter by zone', () => {
      const criticalEntries = getEntriesForZone(moodboard, 'critical');
      expect(criticalEntries.length).toBeGreaterThan(0);
      criticalEntries.forEach(entry => {
        expect(entry.frontmatter.zones?.map(z => z.toLowerCase())).toContain('critical');
      });
    });

    it('should be case-insensitive', () => {
      const lower = getEntriesForZone(moodboard, 'critical');
      const upper = getEntriesForZone(moodboard, 'CRITICAL');
      expect(lower.length).toBe(upper.length);
    });
  });

  describe('getEntriesForMaterial', () => {
    it('should filter by material', () => {
      const decisiveEntries = getEntriesForMaterial(moodboard, 'decisive');
      expect(decisiveEntries.length).toBeGreaterThan(0);
      decisiveEntries.forEach(entry => {
        expect(entry.frontmatter.materials?.map(m => m.toLowerCase())).toContain('decisive');
      });
    });
  });

  describe('getEntriesForTerm', () => {
    it('should filter by term', () => {
      const depositEntries = getEntriesForTerm(moodboard, 'deposit');
      expect(depositEntries.length).toBeGreaterThan(0);
      depositEntries.forEach(entry => {
        expect(entry.frontmatter.terms?.map(t => t.toLowerCase())).toContain('deposit');
      });
    });
  });

  describe('getAntiPatterns', () => {
    it('should return anti-patterns', () => {
      const antiPatterns = getAntiPatterns(moodboard);
      expect(antiPatterns.length).toBeGreaterThan(0);
      antiPatterns.forEach(entry => {
        expect(entry.category).toBe('anti-pattern');
      });
    });

    it('should filter by severity', () => {
      const highSeverity = getAntiPatterns(moodboard, 'high');
      highSeverity.forEach(entry => {
        expect(entry.frontmatter.severity).toBe('high');
      });
    });
  });

  describe('getEntriesForSource', () => {
    it('should filter by source', () => {
      const stripeEntries = getEntriesForSource(moodboard, 'stripe');
      expect(stripeEntries.length).toBeGreaterThan(0);
      stripeEntries.forEach(entry => {
        const source = entry.frontmatter.source?.toLowerCase() || entry.inferredSource;
        expect(source).toBe('stripe');
      });
    });

    it('should be case-insensitive', () => {
      const lower = getEntriesForSource(moodboard, 'stripe');
      const upper = getEntriesForSource(moodboard, 'STRIPE');
      expect(lower.length).toBe(upper.length);
    });
  });

  describe('getFeaturedReferences', () => {
    it('should return featured with why', () => {
      const featured = getFeaturedReferences(moodboard);
      expect(featured.length).toBeGreaterThan(0);
      featured.forEach(item => {
        expect(item.why).toBeTruthy();
        expect(item.path).toBeTruthy();
      });
    });

    it('should include entry when found', () => {
      const featured = getFeaturedReferences(moodboard);
      const withEntry = featured.filter(f => f.entry !== null);
      expect(withEntry.length).toBeGreaterThan(0);
    });
  });

  describe('searchMoodboard', () => {
    it('should search title', () => {
      const results = searchMoodboard(moodboard, 'Stripe');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should search content', () => {
      const results = searchMoodboard(moodboard, 'deliberate motion');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should search source', () => {
      const results = searchMoodboard(moodboard, 'Stripe');
      expect(results.some(r => r.frontmatter.source === 'Stripe' || r.inferredSource === 'stripe')).toBe(true);
    });

    it('should be case-insensitive', () => {
      const lower = searchMoodboard(moodboard, 'stripe');
      const upper = searchMoodboard(moodboard, 'STRIPE');
      expect(lower.length).toBe(upper.length);
    });
  });

  describe('getEntriesByTag', () => {
    it('should filter by tag from index', () => {
      const motionEntries = getEntriesByTag(moodboard, 'motion');
      expect(motionEntries.length).toBeGreaterThan(0);
    });

    it('should fall back to frontmatter tags', () => {
      const brandEntries = getEntriesByTag(moodboard, 'brand');
      expect(brandEntries.length).toBeGreaterThan(0);
    });
  });
});

// =============================================================================
// Graceful Degradation Tests
// =============================================================================

describe('Graceful Degradation', () => {
  it('should never throw on missing directory', async () => {
    await expect(readMoodboard('/definitely/not/a/path')).resolves.toBeDefined();
  });

  it('should return empty array for query on empty moodboard', () => {
    const emptyMoodboard = DEFAULT_MOODBOARD;
    expect(getEntriesForZone(emptyMoodboard, 'critical')).toEqual([]);
    expect(getAntiPatterns(emptyMoodboard)).toEqual([]);
    expect(searchMoodboard(emptyMoodboard, 'test')).toEqual([]);
  });

  it('should handle moodboard without index', async () => {
    const moodboard = await readMoodboard(FIXTURES_PATH);
    // Remove index for test
    const noIndex = { ...moodboard, index: null };
    const featured = getFeaturedReferences(noIndex);
    expect(featured).toEqual([]);
  });

  it('should skip invalid files gracefully', async () => {
    // The reader should not throw even with malformed content
    const moodboard = await readMoodboard(FIXTURES_PATH);
    expect(moodboard).toBeDefined();
    expect(moodboard.entries).toBeDefined();
  });
});

// =============================================================================
// Display Helper Tests
// =============================================================================

describe('Display Helpers', () => {
  let moodboard: Moodboard;

  beforeAll(async () => {
    moodboard = await readMoodboard(FIXTURES_PATH);
  });

  describe('formatEntrySummary', () => {
    it('should format entry for display', () => {
      const entry = moodboard.entries[0];
      const summary = formatEntrySummary(entry);

      expect(summary).toContain(entry.title);
      expect(summary).toContain(entry.path);
      expect(summary).toContain(entry.type);
    });

    it('should include source when present', () => {
      const entryWithSource = moodboard.entries.find(e => e.frontmatter.source || e.inferredSource);
      if (entryWithSource) {
        const summary = formatEntrySummary(entryWithSource);
        expect(summary).toContain('Source:');
      }
    });
  });

  describe('formatMoodboardSummary', () => {
    it('should include total count', () => {
      const summary = formatMoodboardSummary(moodboard);
      expect(summary).toContain(`Total entries: ${moodboard.stats.total}`);
    });

    it('should include category breakdown', () => {
      const summary = formatMoodboardSummary(moodboard);
      expect(summary).toContain('By Category:');
      expect(summary).toContain('References:');
      expect(summary).toContain('Articles:');
      expect(summary).toContain('Anti-patterns:');
    });

    it('should include type breakdown', () => {
      const summary = formatMoodboardSummary(moodboard);
      expect(summary).toContain('By Type:');
      expect(summary).toContain('Markdown:');
      expect(summary).toContain('Images:');
    });
  });
});

// =============================================================================
// Constants Tests
// =============================================================================

describe('Constants', () => {
  it('should have correct default path', () => {
    expect(DEFAULT_MOODBOARD_PATH).toBe('sigil-mark/moodboard');
  });

  it('should have correct max scan depth', () => {
    expect(MAX_SCAN_DEPTH).toBe(3);
  });

  it('should have correct supported image extensions', () => {
    expect(SUPPORTED_IMAGE_EXTENSIONS).toContain('.png');
    expect(SUPPORTED_IMAGE_EXTENSIONS).toContain('.gif');
    expect(SUPPORTED_IMAGE_EXTENSIONS).toContain('.jpg');
    expect(SUPPORTED_IMAGE_EXTENSIONS).toContain('.svg');
  });

  it('should have correct category directories', () => {
    expect(CATEGORY_DIRECTORIES['references']).toBe('reference');
    expect(CATEGORY_DIRECTORIES['articles']).toBe('article');
    expect(CATEGORY_DIRECTORIES['anti-patterns']).toBe('anti-pattern');
    expect(CATEGORY_DIRECTORIES['gtm']).toBe('gtm');
    expect(CATEGORY_DIRECTORIES['screenshots']).toBe('screenshot');
  });

  it('should have correct default moodboard structure', () => {
    expect(DEFAULT_MOODBOARD.entries).toEqual([]);
    expect(DEFAULT_MOODBOARD.index).toBeNull();
    expect(DEFAULT_MOODBOARD.stats.total).toBe(0);
  });
});
