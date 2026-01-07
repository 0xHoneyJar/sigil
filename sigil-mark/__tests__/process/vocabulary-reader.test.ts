/**
 * Sigil v3.0 — Vocabulary Reader Tests
 *
 * Tests for reading and validating the Vocabulary layer.
 * Vocabulary maps product terms to design recommendations (feel).
 *
 * @module __tests__/process/vocabulary-reader
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as path from 'path';
import {
  readVocabulary,
  readVocabularySync,
  getTerm,
  getAllTerms,
  getTermsForZone,
  getTermFeel,
  hasTerm,
  getEngineeringName,
  getTermsByEngineeringName,
  formatTermSummary,
  formatVocabularySummary,
  DEFAULT_VOCABULARY,
  DEFAULT_TERM_FEEL,
  type Vocabulary,
  type VocabularyTerm,
  type TermFeel,
} from '../../process/vocabulary-reader';

// =============================================================================
// TEST DATA
// =============================================================================

const VALID_VOCABULARY: Vocabulary = {
  version: '3.0.0',
  terms: {
    pot: {
      id: 'pot',
      engineering_name: 'savings_container',
      user_facing: 'Pot',
      mental_model: 'Piggy bank, casual saving',
      recommended: {
        material: 'glass',
        motion: 'warm',
        tone: 'friendly',
      },
      zones: ['marketing', 'dashboard'],
    },
    vault: {
      id: 'vault',
      engineering_name: 'savings_container',
      user_facing: 'Vault',
      mental_model: 'Bank vault, serious security',
      recommended: {
        material: 'machinery',
        motion: 'deliberate',
        tone: 'serious',
      },
      zones: ['critical'],
    },
    claim: {
      id: 'claim',
      engineering_name: 'rewards_claim',
      user_facing: 'Claim',
      mental_model: 'Treasure chest unlocking',
      recommended: {
        material: 'decisive',
        motion: 'celebratory_then_deliberate',
        tone: 'exciting',
      },
      zones: ['critical'],
    },
  },
};

// =============================================================================
// TESTS: readVocabulary
// =============================================================================

describe('readVocabulary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should read and parse valid vocabulary YAML', async () => {
    const vocabulary = await readVocabulary(
      path.join(process.cwd(), 'vocabulary/vocabulary.yaml')
    );

    expect(vocabulary.version).toBe('3.0.0');
    expect(Object.keys(vocabulary.terms).length).toBeGreaterThan(0);
    expect(vocabulary.terms.pot).toBeDefined();
  });

  it('should return default vocabulary when file does not exist', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const vocabulary = await readVocabulary('/nonexistent/path.yaml');

    expect(vocabulary).toEqual(DEFAULT_VOCABULARY);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('File not found')
    );

    consoleSpy.mockRestore();
  });

  it('should return default vocabulary for invalid YAML', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Reading a non-YAML file should fail gracefully
    const vocabulary = await readVocabulary(__filename);

    // Should return either parsed (if somehow valid) or defaults
    expect(vocabulary.version).toBeDefined();
    expect(vocabulary.terms).toBeDefined();
    expect(typeof vocabulary.terms).toBe('object');

    consoleSpy.mockRestore();
  });

  it('should have valid term structure for all terms', async () => {
    const vocabulary = await readVocabulary(
      path.join(process.cwd(), 'vocabulary/vocabulary.yaml')
    );

    for (const [id, term] of Object.entries(vocabulary.terms)) {
      expect(term.id).toBe(id);
      expect(term.engineering_name).toBeDefined();
      expect(term.user_facing).toBeDefined();
      expect(term.mental_model).toBeDefined();
      expect(term.recommended).toBeDefined();
      expect(term.recommended.material).toMatch(/^(glass|machinery|decisive)$/);
      expect(term.recommended.motion).toMatch(
        /^(warm|deliberate|snappy|celebratory_then_deliberate|reassuring)$/
      );
      expect(term.recommended.tone).toMatch(
        /^(friendly|serious|exciting|reassuring)$/
      );
      expect(Array.isArray(term.zones)).toBe(true);
    }
  });
});

// =============================================================================
// TESTS: readVocabularySync
// =============================================================================

describe('readVocabularySync', () => {
  it('should read and parse valid vocabulary YAML synchronously', () => {
    const vocabulary = readVocabularySync(
      path.join(process.cwd(), 'vocabulary/vocabulary.yaml')
    );

    expect(vocabulary.version).toBe('3.0.0');
    expect(vocabulary.terms.pot).toBeDefined();
  });

  it('should return default vocabulary when file does not exist', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const vocabulary = readVocabularySync('/nonexistent/path.yaml');

    expect(vocabulary).toEqual(DEFAULT_VOCABULARY);

    consoleSpy.mockRestore();
  });
});

// =============================================================================
// TESTS: getTerm
// =============================================================================

describe('getTerm', () => {
  it('should return term by ID', () => {
    const term = getTerm(VALID_VOCABULARY, 'pot');

    expect(term).toBeDefined();
    expect(term?.id).toBe('pot');
    expect(term?.user_facing).toBe('Pot');
  });

  it('should be case-insensitive', () => {
    const upper = getTerm(VALID_VOCABULARY, 'POT');
    const lower = getTerm(VALID_VOCABULARY, 'pot');
    const mixed = getTerm(VALID_VOCABULARY, 'Pot');

    // All should return the same term
    expect(upper).toEqual(lower);
    expect(lower).toEqual(mixed);
  });

  it('should return undefined for non-existent terms', () => {
    expect(getTerm(VALID_VOCABULARY, 'unknown')).toBeUndefined();
    expect(getTerm(VALID_VOCABULARY, '')).toBeUndefined();
  });

  it('should handle empty vocabulary', () => {
    expect(getTerm(DEFAULT_VOCABULARY, 'pot')).toBeUndefined();
  });
});

// =============================================================================
// TESTS: getAllTerms
// =============================================================================

describe('getAllTerms', () => {
  it('should return all terms as array', () => {
    const terms = getAllTerms(VALID_VOCABULARY);

    expect(Array.isArray(terms)).toBe(true);
    expect(terms.length).toBe(3);

    const ids = terms.map((t) => t.id);
    expect(ids).toContain('pot');
    expect(ids).toContain('vault');
    expect(ids).toContain('claim');
  });

  it('should return empty array for empty vocabulary', () => {
    const terms = getAllTerms(DEFAULT_VOCABULARY);
    expect(terms).toEqual([]);
  });
});

// =============================================================================
// TESTS: getTermsForZone
// =============================================================================

describe('getTermsForZone', () => {
  it('should return terms for critical zone', () => {
    const terms = getTermsForZone(VALID_VOCABULARY, 'critical');

    const ids = terms.map((t) => t.id);
    expect(ids).toContain('vault');
    expect(ids).toContain('claim');
    expect(ids).not.toContain('pot'); // Marketing/dashboard only
  });

  it('should return terms for marketing zone', () => {
    const terms = getTermsForZone(VALID_VOCABULARY, 'marketing');

    const ids = terms.map((t) => t.id);
    expect(ids).toContain('pot');
    expect(ids).not.toContain('vault');
    expect(ids).not.toContain('claim');
  });

  it('should be case-insensitive for zone', () => {
    const upper = getTermsForZone(VALID_VOCABULARY, 'CRITICAL');
    const lower = getTermsForZone(VALID_VOCABULARY, 'critical');

    expect(upper.length).toBe(lower.length);
  });

  it('should return empty array for unknown zone', () => {
    const terms = getTermsForZone(VALID_VOCABULARY, 'nonexistent');
    expect(terms).toEqual([]);
  });

  it('should handle empty vocabulary', () => {
    const terms = getTermsForZone(DEFAULT_VOCABULARY, 'critical');
    expect(terms).toEqual([]);
  });
});

// =============================================================================
// TESTS: getTermFeel
// =============================================================================

describe('getTermFeel', () => {
  it('should return term feel for existing term', () => {
    const feel = getTermFeel(VALID_VOCABULARY, 'pot');

    expect(feel.material).toBe('glass');
    expect(feel.motion).toBe('warm');
    expect(feel.tone).toBe('friendly');
  });

  it('should return default feel for non-existent term', () => {
    const feel = getTermFeel(VALID_VOCABULARY, 'unknown');

    expect(feel).toEqual(DEFAULT_TERM_FEEL);
  });

  it('should use zone fallback when term not found', () => {
    const zoneFallback: Partial<TermFeel> = {
      material: 'decisive',
      motion: 'snappy',
    };

    const feel = getTermFeel(VALID_VOCABULARY, 'unknown', zoneFallback);

    expect(feel.material).toBe('decisive');
    expect(feel.motion).toBe('snappy');
    expect(feel.tone).toBe(DEFAULT_TERM_FEEL.tone); // Fallback to default
  });

  it('should prioritize term feel over zone fallback', () => {
    const zoneFallback: Partial<TermFeel> = {
      material: 'decisive',
      motion: 'snappy',
      tone: 'serious',
    };

    const feel = getTermFeel(VALID_VOCABULARY, 'pot', zoneFallback);

    // Term's feel should win
    expect(feel.material).toBe('glass');
    expect(feel.motion).toBe('warm');
    expect(feel.tone).toBe('friendly');
  });

  it('should handle empty vocabulary', () => {
    const feel = getTermFeel(DEFAULT_VOCABULARY, 'anything');
    expect(feel).toEqual(DEFAULT_TERM_FEEL);
  });
});

// =============================================================================
// TESTS: hasTerm
// =============================================================================

describe('hasTerm', () => {
  it('should return true for existing terms', () => {
    expect(hasTerm(VALID_VOCABULARY, 'pot')).toBe(true);
    expect(hasTerm(VALID_VOCABULARY, 'vault')).toBe(true);
    expect(hasTerm(VALID_VOCABULARY, 'claim')).toBe(true);
  });

  it('should return false for non-existent terms', () => {
    expect(hasTerm(VALID_VOCABULARY, 'unknown')).toBe(false);
    expect(hasTerm(VALID_VOCABULARY, '')).toBe(false);
  });

  it('should be case-insensitive', () => {
    expect(hasTerm(VALID_VOCABULARY, 'POT')).toBe(true);
    expect(hasTerm(VALID_VOCABULARY, 'Pot')).toBe(true);
  });

  it('should handle empty vocabulary', () => {
    expect(hasTerm(DEFAULT_VOCABULARY, 'pot')).toBe(false);
  });
});

// =============================================================================
// TESTS: getEngineeringName
// =============================================================================

describe('getEngineeringName', () => {
  it('should return engineering name for existing term', () => {
    expect(getEngineeringName(VALID_VOCABULARY, 'pot')).toBe('savings_container');
    expect(getEngineeringName(VALID_VOCABULARY, 'vault')).toBe('savings_container');
    expect(getEngineeringName(VALID_VOCABULARY, 'claim')).toBe('rewards_claim');
  });

  it('should return undefined for non-existent term', () => {
    expect(getEngineeringName(VALID_VOCABULARY, 'unknown')).toBeUndefined();
  });

  it('should handle empty vocabulary', () => {
    expect(getEngineeringName(DEFAULT_VOCABULARY, 'pot')).toBeUndefined();
  });
});

// =============================================================================
// TESTS: getTermsByEngineeringName
// =============================================================================

describe('getTermsByEngineeringName', () => {
  it('should return multiple terms with same engineering name', () => {
    const terms = getTermsByEngineeringName(VALID_VOCABULARY, 'savings_container');

    expect(terms.length).toBe(2);
    const ids = terms.map((t) => t.id);
    expect(ids).toContain('pot');
    expect(ids).toContain('vault');
  });

  it('should demonstrate same backend, different feel', () => {
    const terms = getTermsByEngineeringName(VALID_VOCABULARY, 'savings_container');

    // Both use savings_container but have different feels
    const pot = terms.find((t) => t.id === 'pot');
    const vault = terms.find((t) => t.id === 'vault');

    expect(pot?.recommended.material).toBe('glass');
    expect(vault?.recommended.material).toBe('machinery');

    expect(pot?.recommended.tone).toBe('friendly');
    expect(vault?.recommended.tone).toBe('serious');
  });

  it('should return single term for unique engineering name', () => {
    const terms = getTermsByEngineeringName(VALID_VOCABULARY, 'rewards_claim');

    expect(terms.length).toBe(1);
    expect(terms[0].id).toBe('claim');
  });

  it('should return empty array for unknown engineering name', () => {
    const terms = getTermsByEngineeringName(VALID_VOCABULARY, 'unknown');
    expect(terms).toEqual([]);
  });

  it('should handle empty vocabulary', () => {
    const terms = getTermsByEngineeringName(DEFAULT_VOCABULARY, 'savings_container');
    expect(terms).toEqual([]);
  });
});

// =============================================================================
// TESTS: formatTermSummary
// =============================================================================

describe('formatTermSummary', () => {
  it('should format term summary', () => {
    const term = VALID_VOCABULARY.terms.pot;
    const summary = formatTermSummary(term);

    expect(summary).toContain('Pot (pot)');
    expect(summary).toContain('Engineering: savings_container');
    expect(summary).toContain('Mental model: "Piggy bank, casual saving"');
    expect(summary).toContain('glass / warm / friendly');
    expect(summary).toContain('marketing, dashboard');
  });
});

// =============================================================================
// TESTS: formatVocabularySummary
// =============================================================================

describe('formatVocabularySummary', () => {
  it('should format vocabulary summary', () => {
    const summary = formatVocabularySummary(VALID_VOCABULARY);

    expect(summary).toContain('Sigil Vocabulary v3.0.0');
    expect(summary).toContain('Terms (3):');
    expect(summary).toContain('Pot: glass / warm');
    expect(summary).toContain('Vault: machinery / deliberate');
    expect(summary).toContain('Zone Coverage:');
    expect(summary).toContain('critical:');
    expect(summary).toContain('marketing:');
  });

  it('should handle empty vocabulary', () => {
    const summary = formatVocabularySummary(DEFAULT_VOCABULARY);

    expect(summary).toContain('Terms (0):');
  });
});

// =============================================================================
// TESTS: Graceful Degradation
// =============================================================================

describe('Graceful Degradation', () => {
  it('should never throw on missing file', async () => {
    const vocabulary = await readVocabulary('/definitely/does/not/exist.yaml');

    expect(vocabulary).toEqual(DEFAULT_VOCABULARY);
    expect(vocabulary.terms).toEqual({});
  });

  it('should return valid structure even with empty input', async () => {
    const vocabulary = await readVocabulary('/dev/null');

    expect(vocabulary.version).toBeDefined();
    expect(vocabulary.terms).toBeDefined();
    expect(typeof vocabulary.terms).toBe('object');
  });

  it('should have working helper functions with default vocabulary', () => {
    // All helpers should work without crashing on empty vocabulary
    expect(getTerm(DEFAULT_VOCABULARY, 'anything')).toBeUndefined();
    expect(getAllTerms(DEFAULT_VOCABULARY)).toEqual([]);
    expect(getTermsForZone(DEFAULT_VOCABULARY, 'critical')).toEqual([]);
    expect(getTermFeel(DEFAULT_VOCABULARY, 'anything')).toEqual(DEFAULT_TERM_FEEL);
    expect(hasTerm(DEFAULT_VOCABULARY, 'anything')).toBe(false);
    expect(getEngineeringName(DEFAULT_VOCABULARY, 'anything')).toBeUndefined();
    expect(getTermsByEngineeringName(DEFAULT_VOCABULARY, 'anything')).toEqual([]);
  });
});

// =============================================================================
// TESTS: DEFAULT_TERM_FEEL
// =============================================================================

describe('DEFAULT_TERM_FEEL', () => {
  it('should have valid default feel values', () => {
    expect(DEFAULT_TERM_FEEL.material).toBe('machinery');
    expect(DEFAULT_TERM_FEEL.motion).toBe('deliberate');
    expect(DEFAULT_TERM_FEEL.tone).toBe('serious');
  });
});
