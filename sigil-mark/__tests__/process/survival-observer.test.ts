/**
 * @sigil-tier gold
 * Sigil v6.0 — Survival Observer Tests
 *
 * Tests for silent pattern tracking.
 *
 * @module __tests__/process/survival-observer
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  // Constants
  SURVIVAL_PATH,
  PATTERN_TAG_PREFIX,
  PROMOTION_THRESHOLDS,
  // Pattern detection
  detectPatterns,
  hasPatternTag,
  getPatternTags,
  // Pattern tagging
  addPatternTag,
  addPatternTags,
  // Survival index
  loadSurvivalIndex,
  saveSurvivalIndex,
  determineStatus,
  updatePattern,
  rejectPattern,
  // Observation
  observePatterns,
  observeAndTag,
  // Gardener
  applyPromotionRules,
  // Formatting
  formatObservationResult,
  formatGardenerResult,
} from '../../process/survival-observer';

// =============================================================================
// TEST SETUP
// =============================================================================

const TEST_DIR = path.join(process.cwd(), '.test-survival-observer');

beforeEach(() => {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true });
  }
  fs.mkdirSync(TEST_DIR, { recursive: true });
  fs.mkdirSync(path.join(TEST_DIR, '.sigil'), { recursive: true });
});

afterEach(() => {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true });
  }
});

// =============================================================================
// CONSTANTS TESTS
// =============================================================================

describe('Constants', () => {
  it('has correct survival path', () => {
    expect(SURVIVAL_PATH).toBe('.sigil/survival.json');
  });

  it('has correct tag prefix', () => {
    expect(PATTERN_TAG_PREFIX).toBe('// @sigil-pattern:');
  });

  it('has correct promotion thresholds', () => {
    expect(PROMOTION_THRESHOLDS.surviving).toBe(3);
    expect(PROMOTION_THRESHOLDS.canonical).toBe(5);
  });
});

// =============================================================================
// PATTERN DETECTION TESTS
// =============================================================================

describe('Pattern Detection', () => {
  describe('detectPatterns', () => {
    it('detects spring animation', () => {
      const code = 'const spring = useSpring({ opacity: 1 });';
      const patterns = detectPatterns(code);
      expect(patterns.some(p => p.name === 'spring-animation')).toBe(true);
    });

    it('detects motion component', () => {
      const code = '<motion.div animate={{ scale: 1 }} />';
      const patterns = detectPatterns(code);
      expect(patterns.some(p => p.name === 'motion-component')).toBe(true);
    });

    it('detects hook usage', () => {
      const code = 'const { simulate } = useSigilMutation();';
      const patterns = detectPatterns(code);
      expect(patterns.some(p => p.name === 'sigil-mutation')).toBe(true);
    });

    it('detects gradient style', () => {
      const code = 'background: linear-gradient(to right, red, blue)';
      const patterns = detectPatterns(code);
      expect(patterns.some(p => p.name === 'gradient-style')).toBe(true);
    });

    it('deduplicates patterns', () => {
      const code = `
        useSpring({ a: 1 });
        useSpring({ b: 2 });
      `;
      const patterns = detectPatterns(code);
      const springPatterns = patterns.filter(p => p.name === 'spring-animation');
      expect(springPatterns).toHaveLength(1);
    });

    it('returns empty for no patterns', () => {
      const code = 'const x = 1;';
      const patterns = detectPatterns(code);
      expect(patterns).toHaveLength(0);
    });
  });

  describe('hasPatternTag', () => {
    it('detects existing tag', () => {
      const code = '// @sigil-pattern: spring-animation (2026-01-09)';
      expect(hasPatternTag(code, 'spring-animation')).toBe(true);
    });

    it('returns false for no tag', () => {
      const code = 'const x = 1;';
      expect(hasPatternTag(code, 'spring-animation')).toBe(false);
    });
  });

  describe('getPatternTags', () => {
    it('extracts pattern tags', () => {
      const code = `
        // @sigil-pattern: spring-animation (2026-01-09)
        const spring = useSpring();
        // @sigil-pattern: fade-animation (2026-01-08)
        const fade = useFade();
      `;
      const tags = getPatternTags(code);

      expect(tags).toHaveLength(2);
      expect(tags[0].name).toBe('spring-animation');
      expect(tags[0].date).toBe('2026-01-09');
      expect(tags[1].name).toBe('fade-animation');
    });
  });
});

// =============================================================================
// PATTERN TAGGING TESTS
// =============================================================================

describe('Pattern Tagging', () => {
  describe('addPatternTag', () => {
    it('adds tag before pattern line', () => {
      const code = 'const spring = useSpring();';
      const pattern = {
        name: 'spring-animation',
        category: 'animation' as const,
        line: 1,
        snippet: 'const spring = useSpring();',
      };

      const result = addPatternTag(code, pattern);
      expect(result).toContain('// @sigil-pattern: spring-animation');
    });
  });

  describe('addPatternTags', () => {
    it('adds multiple tags', () => {
      const code = `const spring = useSpring();
const motion = motion.div;`;
      const patterns = [
        { name: 'spring-animation', category: 'animation' as const, line: 1, snippet: '' },
        { name: 'motion-component', category: 'animation' as const, line: 2, snippet: '' },
      ];

      const { code: result, tagged } = addPatternTags(code, patterns);
      expect(tagged).toHaveLength(2);
      expect(result).toContain('spring-animation');
      expect(result).toContain('motion-component');
    });

    it('skips already tagged patterns', () => {
      const code = `// @sigil-pattern: spring-animation (2026-01-09)
const spring = useSpring();`;
      const patterns = [
        { name: 'spring-animation', category: 'animation' as const, line: 2, snippet: '' },
      ];

      const { tagged } = addPatternTags(code, patterns);
      expect(tagged).toHaveLength(0);
    });
  });
});

// =============================================================================
// SURVIVAL INDEX TESTS
// =============================================================================

describe('Survival Index', () => {
  describe('loadSurvivalIndex', () => {
    it('returns default when no file', () => {
      const index = loadSurvivalIndex(TEST_DIR);
      expect(index.patterns.survived).toEqual({});
      expect(index.patterns.canonical).toEqual([]);
      expect(index.patterns.rejected).toEqual([]);
    });

    it('loads existing index', () => {
      const survivalPath = path.join(TEST_DIR, SURVIVAL_PATH);
      fs.writeFileSync(
        survivalPath,
        JSON.stringify({
          patterns: {
            survived: { test: { occurrences: 3 } },
            canonical: ['test'],
            rejected: [],
          },
        })
      );

      const index = loadSurvivalIndex(TEST_DIR);
      expect(index.patterns.survived.test.occurrences).toBe(3);
    });
  });

  describe('saveSurvivalIndex', () => {
    it('saves index to file', () => {
      const index = {
        patterns: {
          survived: {},
          canonical: [],
          rejected: [],
        },
      };

      const result = saveSurvivalIndex(index, TEST_DIR);
      expect(result).toBe(true);

      const survivalPath = path.join(TEST_DIR, SURVIVAL_PATH);
      expect(fs.existsSync(survivalPath)).toBe(true);
    });
  });

  describe('determineStatus', () => {
    it('returns experimental for low counts', () => {
      expect(determineStatus(1)).toBe('experimental');
      expect(determineStatus(2)).toBe('experimental');
    });

    it('returns surviving for medium counts', () => {
      expect(determineStatus(3)).toBe('surviving');
      expect(determineStatus(4)).toBe('surviving');
    });

    it('returns canonical for high counts', () => {
      expect(determineStatus(5)).toBe('canonical');
      expect(determineStatus(10)).toBe('canonical');
    });
  });

  describe('updatePattern', () => {
    it('creates new pattern entry', () => {
      const index = {
        patterns: { survived: {}, canonical: [], rejected: [] },
      };

      updatePattern(index, 'new-pattern', 'test.tsx');

      expect(index.patterns.survived['new-pattern']).toBeDefined();
      expect(index.patterns.survived['new-pattern'].occurrences).toBe(1);
      expect(index.patterns.survived['new-pattern'].status).toBe('experimental');
    });

    it('increments existing pattern', () => {
      const index = {
        patterns: {
          survived: {
            existing: {
              occurrences: 2,
              first_seen: '2026-01-01',
              last_seen: '2026-01-01',
              files: ['old.tsx'],
              status: 'experimental' as const,
            },
          },
          canonical: [],
          rejected: [],
        },
      };

      updatePattern(index, 'existing', 'new.tsx');

      expect(index.patterns.survived.existing.occurrences).toBe(3);
      expect(index.patterns.survived.existing.files).toContain('new.tsx');
      expect(index.patterns.survived.existing.status).toBe('surviving');
    });

    it('promotes to canonical at threshold', () => {
      const index = {
        patterns: {
          survived: {
            promote: {
              occurrences: 4,
              first_seen: '2026-01-01',
              last_seen: '2026-01-01',
              files: [],
              status: 'surviving' as const,
            },
          },
          canonical: [],
          rejected: [],
        },
      };

      updatePattern(index, 'promote', 'test.tsx');

      expect(index.patterns.survived.promote.status).toBe('canonical');
      expect(index.patterns.canonical).toContain('promote');
    });
  });

  describe('rejectPattern', () => {
    it('removes pattern from survived', () => {
      const index = {
        patterns: {
          survived: { toReject: { occurrences: 1 } as any },
          canonical: ['toReject'],
          rejected: [],
        },
      };

      rejectPattern(index, 'toReject');

      expect(index.patterns.survived.toReject).toBeUndefined();
      expect(index.patterns.canonical).not.toContain('toReject');
      expect(index.patterns.rejected).toContain('toReject');
    });
  });
});

// =============================================================================
// OBSERVATION TESTS
// =============================================================================

describe('Observation', () => {
  describe('observePatterns', () => {
    it('observes and updates survival', () => {
      const code = 'const spring = useSpring();';
      const result = observePatterns(code, 'test.tsx', TEST_DIR);

      expect(result.success).toBe(true);
      expect(result.patterns.length).toBeGreaterThan(0);
      expect(result.updated).toContain('spring-animation');
    });

    it('returns empty for no patterns', () => {
      const code = 'const x = 1;';
      const result = observePatterns(code, 'test.tsx', TEST_DIR);

      expect(result.success).toBe(true);
      expect(result.patterns).toHaveLength(0);
    });
  });

  describe('observeAndTag', () => {
    it('observes and adds tags', () => {
      const code = 'const spring = useSpring();';
      const { result, code: tagged } = observeAndTag(code, 'test.tsx', TEST_DIR);

      expect(result.success).toBe(true);
      expect(result.tagged.length).toBeGreaterThan(0);
      expect(tagged).toContain('// @sigil-pattern:');
    });
  });
});

// =============================================================================
// GARDENER TESTS
// =============================================================================

describe('Gardener', () => {
  describe('applyPromotionRules', () => {
    it('promotes patterns with high counts', () => {
      const index = {
        patterns: {
          survived: {
            highCount: {
              occurrences: 2,
              first_seen: '2026-01-01',
              last_seen: '2026-01-01',
              files: [],
              status: 'experimental' as const,
            },
          },
          canonical: [],
          rejected: [],
        },
      };

      const { promoted } = applyPromotionRules(index, { highCount: 5 });

      expect(promoted).toContain('highCount');
      expect(index.patterns.canonical).toContain('highCount');
    });

    it('demotes patterns with zero counts', () => {
      const index = {
        patterns: {
          survived: {
            zeroCount: {
              occurrences: 3,
              first_seen: '2026-01-01',
              last_seen: '2026-01-01',
              files: [],
              status: 'surviving' as const,
            },
          },
          canonical: [],
          rejected: [],
        },
      };

      const { demoted } = applyPromotionRules(index, { zeroCount: 0 });

      expect(demoted).toContain('zeroCount');
      expect(index.patterns.rejected).toContain('zeroCount');
    });
  });
});

// =============================================================================
// FORMATTING TESTS
// =============================================================================

describe('Formatting', () => {
  describe('formatObservationResult', () => {
    it('formats success result', () => {
      const result = {
        success: true,
        patterns: [
          { name: 'test', category: 'animation' as const, line: 1, snippet: '' },
        ],
        tagged: ['test'],
        updated: ['test'],
      };

      const message = formatObservationResult(result);
      expect(message).toContain('Patterns Observed');
      expect(message).toContain('test');
    });

    it('formats empty result', () => {
      const result = {
        success: true,
        patterns: [],
        tagged: [],
        updated: [],
      };

      const message = formatObservationResult(result);
      expect(message).toContain('No patterns detected');
    });

    it('formats error result', () => {
      const result = {
        success: false,
        patterns: [],
        tagged: [],
        updated: [],
        error: 'Test error',
      };

      const message = formatObservationResult(result);
      expect(message).toContain('failed');
      expect(message).toContain('Test error');
    });
  });

  describe('formatGardenerResult', () => {
    it('formats gardener result', () => {
      const result = {
        promoted: ['test'],
        demoted: ['old'],
        total: 5,
      };

      const message = formatGardenerResult(result);
      expect(message).toContain('Gardener Scan');
      expect(message).toContain('5');
      expect(message).toContain('test');
      expect(message).toContain('old');
    });
  });
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

describe('Performance', () => {
  it('pattern detection in <10ms', () => {
    const code = `
      const spring = useSpring();
      const motion = motion.div;
      const state = useState();
      const effect = useEffect();
      background: linear-gradient(red, blue);
    `;

    const start = performance.now();
    detectPatterns(code);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(10);
  });

  it('observation in <20ms', () => {
    const code = 'const spring = useSpring();';

    const start = performance.now();
    observePatterns(code, 'test.tsx', TEST_DIR);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(20);
  });
});
