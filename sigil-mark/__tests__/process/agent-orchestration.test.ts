/**
 * @sigil-tier gold
 * Sigil v6.0 — Agent Orchestration Tests
 *
 * Tests for craft flow orchestration.
 *
 * @module __tests__/process/agent-orchestration
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  // Types
  CraftPhase,
  ResolvedContext,
  PatternSelection,
  // Vocabulary resolution
  extractVocabularyTerms,
  resolveZoneFromVocabulary,
  resolvePhysicsFromZone,
  resolveContext,
  // Pattern selection
  selectPatterns,
  // Craft flow
  runCraftFlow,
  // Benchmarking
  runBenchmarks,
  // Formatting
  formatSkillsSummary,
  formatCraftFlowResult,
  formatBenchmarkResults,
} from '../../process/agent-orchestration';

// =============================================================================
// TEST SETUP
// =============================================================================

const TEST_DIR = path.join(process.cwd(), '.test-orchestration');

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
// VOCABULARY EXTRACTION TESTS
// =============================================================================

describe('extractVocabularyTerms', () => {
  it('extracts claim term', () => {
    const terms = extractVocabularyTerms('Create a claim button');
    expect(terms).toContain('claim');
  });

  it('extracts multiple terms', () => {
    const terms = extractVocabularyTerms('A trustworthy confirm button');
    expect(terms).toContain('trustworthy');
    expect(terms).toContain('confirm');
  });

  it('is case insensitive', () => {
    const terms = extractVocabularyTerms('CLAIM button for CRITICAL zone');
    expect(terms).toContain('claim');
    expect(terms).toContain('critical');
  });

  it('returns empty for no matches', () => {
    const terms = extractVocabularyTerms('A simple button');
    expect(terms).toHaveLength(0);
  });

  it('extracts marketing terms', () => {
    const terms = extractVocabularyTerms('Marketing landing page');
    expect(terms).toContain('marketing');
  });

  it('extracts admin terms', () => {
    const terms = extractVocabularyTerms('Admin dashboard settings');
    expect(terms).toContain('admin');
    expect(terms).toContain('dashboard');
  });
});

// =============================================================================
// ZONE RESOLUTION TESTS
// =============================================================================

describe('resolveZoneFromVocabulary', () => {
  it('resolves to critical for claim', () => {
    const zone = resolveZoneFromVocabulary(['claim']);
    expect(zone).toBe('critical');
  });

  it('resolves to critical for trustworthy', () => {
    const zone = resolveZoneFromVocabulary(['trustworthy']);
    expect(zone).toBe('critical');
  });

  it('resolves to marketing for marketing', () => {
    const zone = resolveZoneFromVocabulary(['marketing']);
    expect(zone).toBe('marketing');
  });

  it('resolves to admin for dashboard', () => {
    const zone = resolveZoneFromVocabulary(['dashboard']);
    expect(zone).toBe('admin');
  });

  it('resolves to standard for no terms', () => {
    const zone = resolveZoneFromVocabulary([]);
    expect(zone).toBe('standard');
  });

  it('prioritizes critical over marketing', () => {
    const zone = resolveZoneFromVocabulary(['marketing', 'claim']);
    expect(zone).toBe('critical');
  });

  it('prioritizes marketing over admin', () => {
    const zone = resolveZoneFromVocabulary(['admin', 'marketing']);
    expect(zone).toBe('marketing');
  });
});

// =============================================================================
// PHYSICS RESOLUTION TESTS
// =============================================================================

describe('resolvePhysicsFromZone', () => {
  it('returns deliberate for critical', () => {
    expect(resolvePhysicsFromZone('critical')).toBe('deliberate');
  });

  it('returns playful for marketing', () => {
    expect(resolvePhysicsFromZone('marketing')).toBe('playful');
  });

  it('returns snappy for admin', () => {
    expect(resolvePhysicsFromZone('admin')).toBe('snappy');
  });

  it('returns default for standard', () => {
    expect(resolvePhysicsFromZone('standard')).toBe('default');
  });

  it('returns default for unknown', () => {
    expect(resolvePhysicsFromZone('unknown')).toBe('default');
  });
});

// =============================================================================
// FULL CONTEXT RESOLUTION TESTS
// =============================================================================

describe('resolveContext', () => {
  it('resolves full context for claim button', () => {
    const context = resolveContext(
      'Create a trustworthy claim button',
      'ClaimButton'
    );

    expect(context.vocabularyTerms).toContain('claim');
    expect(context.vocabularyTerms).toContain('trustworthy');
    expect(context.zone).toBe('critical');
    expect(context.physics).toBe('deliberate');
  });

  it('resolves marketing context', () => {
    const context = resolveContext(
      'Marketing landing hero section',
      'HeroSection'
    );

    expect(context.zone).toBe('marketing');
    expect(context.physics).toBe('playful');
  });

  it('detects forge mode', () => {
    const context = resolveContext('--forge a new button', 'Button');
    expect(context.forgeMode).toBe(true);
  });

  it('detects inspiration trigger', () => {
    const context = resolveContext(
      'like stripe.com button styling',
      'Button'
    );

    expect(context.inspirationUrl).toBeDefined();
    expect(context.inspirationUrl).toContain('stripe.com');
  });

  it('handles standard zone', () => {
    const context = resolveContext('A simple button', 'Button');

    expect(context.zone).toBe('standard');
    expect(context.physics).toBe('default');
  });
});

// =============================================================================
// PATTERN SELECTION TESTS
// =============================================================================

describe('selectPatterns', () => {
  it('returns empty for no survival index', () => {
    const patterns = selectPatterns('critical', 'deliberate', TEST_DIR);
    expect(patterns).toHaveLength(0);
  });

  it('selects canonical patterns first', () => {
    // Create survival index with canonical patterns
    const survivalPath = path.join(TEST_DIR, '.sigil/survival.json');
    fs.writeFileSync(
      survivalPath,
      JSON.stringify({
        patterns: {
          survived: {
            'spring-entrance': {
              occurrences: 5,
              status: 'canonical',
            },
          },
          canonical: ['spring-entrance'],
          rejected: [],
        },
      })
    );

    const patterns = selectPatterns('critical', 'deliberate', TEST_DIR);

    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0].status).toBe('canonical');
  });

  it('falls back to surviving patterns', () => {
    const survivalPath = path.join(TEST_DIR, '.sigil/survival.json');
    fs.writeFileSync(
      survivalPath,
      JSON.stringify({
        patterns: {
          survived: {
            'fade-entrance': {
              occurrences: 3,
              status: 'surviving',
            },
          },
          canonical: [],
          rejected: [],
        },
      })
    );

    const patterns = selectPatterns('critical', 'deliberate', TEST_DIR);

    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0].status).toBe('surviving');
  });
});

// =============================================================================
// CRAFT FLOW TESTS
// =============================================================================

describe('runCraftFlow', () => {
  it('runs complete flow', async () => {
    const result = await runCraftFlow(
      'Create a claim button',
      'ClaimButton',
      {
        projectRoot: TEST_DIR,
        skipWorkshopCheck: true,
        skipValidation: true,
        skipObservation: true,
        skipChronicling: true,
      }
    );

    expect(result.success).toBe(true);
    expect(result.context.zone).toBe('critical');
    expect(result.skills.length).toBeGreaterThan(0);
  });

  it('resolves context correctly', async () => {
    const result = await runCraftFlow(
      'A trustworthy confirm button',
      'ConfirmButton',
      {
        projectRoot: TEST_DIR,
        skipWorkshopCheck: true,
        skipValidation: true,
        skipObservation: true,
        skipChronicling: true,
      }
    );

    expect(result.context.vocabularyTerms).toContain('trustworthy');
    expect(result.context.vocabularyTerms).toContain('confirm');
  });

  it('tracks skill execution', async () => {
    const result = await runCraftFlow('Button', 'Button', {
      projectRoot: TEST_DIR,
      skipWorkshopCheck: true,
      skipValidation: true,
      skipObservation: true,
      skipChronicling: true,
    });

    expect(result.skills.some((s) => s.phase === 'discovery')).toBe(true);
    expect(result.skills.some((s) => s.phase === 'context')).toBe(true);
  });

  it('includes total duration', async () => {
    const result = await runCraftFlow('Button', 'Button', {
      projectRoot: TEST_DIR,
      skipWorkshopCheck: true,
      skipValidation: true,
      skipObservation: true,
      skipChronicling: true,
    });

    expect(result.totalDurationMs).toBeGreaterThan(0);
  });

  it('creates session for chronicling', async () => {
    const result = await runCraftFlow('Claim button', 'ClaimButton', {
      projectRoot: TEST_DIR,
      skipWorkshopCheck: true,
      skipValidation: true,
      skipObservation: true,
      skipChronicling: true,
    });

    expect(result.session.componentName).toBe('ClaimButton');
    expect(result.session.request).toBe('Claim button');
  });
});

// =============================================================================
// BENCHMARK TESTS
// =============================================================================

describe('runBenchmarks', () => {
  it('returns benchmark results', async () => {
    const results = await runBenchmarks(TEST_DIR);
    expect(results.length).toBeGreaterThan(0);
  });

  it('includes workshop query benchmark', async () => {
    const results = await runBenchmarks(TEST_DIR);
    const workshopBench = results.find((r) => r.target.includes('workshop'));
    expect(workshopBench).toBeDefined();
  });

  it('includes sanctuary scan benchmark', async () => {
    const results = await runBenchmarks(TEST_DIR);
    const scanBench = results.find((r) => r.target.includes('sanctuary'));
    expect(scanBench).toBeDefined();
  });

  it('includes context resolution benchmark', async () => {
    const results = await runBenchmarks(TEST_DIR);
    const contextBench = results.find((r) => r.target.includes('context'));
    expect(contextBench).toBeDefined();
  });
});

// =============================================================================
// FORMATTING TESTS
// =============================================================================

describe('formatSkillsSummary', () => {
  it('formats skill results', () => {
    const skills = [
      { skill: 'test', phase: 'startup' as CraftPhase, success: true, durationMs: 5 },
      { skill: 'test2', phase: 'discovery' as CraftPhase, success: false, durationMs: 10 },
    ];

    const summary = formatSkillsSummary(skills);

    expect(summary).toContain('Skills Executed');
    expect(summary).toContain('test');
    expect(summary).toContain('5.0ms');
  });
});

describe('formatCraftFlowResult', () => {
  it('formats flow result', () => {
    const result = {
      success: true,
      context: {
        vocabularyTerms: ['claim'],
        zone: 'critical',
        physics: 'deliberate',
        patterns: [],
        forgeMode: false,
      },
      skills: [],
      patterns: [
        { pattern: 'spring-entrance', status: 'canonical' as const, reason: 'test' },
      ],
      session: {
        componentName: 'Test',
        date: '2026-01-08',
        era: 'v1',
        request: 'test',
        context: { zone: 'critical', physics: 'deliberate', vocabulary: [] },
        decisions: [],
        patterns: [],
        physicsChecks: [],
      },
      totalDurationMs: 100,
    };

    const formatted = formatCraftFlowResult(result);

    expect(formatted).toContain('Craft Flow Complete');
    expect(formatted).toContain('critical');
    expect(formatted).toContain('deliberate');
    expect(formatted).toContain('spring-entrance');
  });
});

describe('formatBenchmarkResults', () => {
  it('formats benchmark results', () => {
    const results = [
      { target: 'test <5ms', actual: 3, passed: true },
      { target: 'test2 <10ms', actual: 15, passed: false },
    ];

    const formatted = formatBenchmarkResults(results);

    expect(formatted).toContain('Performance Benchmarks');
    expect(formatted).toContain('✓');
    expect(formatted).toContain('✗');
  });

  it('shows all passed when successful', () => {
    const results = [{ target: 'test <5ms', actual: 3, passed: true }];
    const formatted = formatBenchmarkResults(results);
    expect(formatted).toContain('All targets met');
  });

  it('shows warning when some failed', () => {
    const results = [{ target: 'test <5ms', actual: 10, passed: false }];
    const formatted = formatBenchmarkResults(results);
    expect(formatted).toContain('Some targets missed');
  });
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

describe('Performance', () => {
  it('context resolution in <5ms', () => {
    const start = performance.now();
    resolveContext('Create a trustworthy claim button for checkout', 'ClaimButton');
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(5);
  });

  it('vocabulary extraction in <1ms', () => {
    const start = performance.now();
    extractVocabularyTerms('Create a trustworthy claim confirm submit button');
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(1);
  });

  it('zone resolution in <1ms', () => {
    const terms = ['claim', 'trustworthy', 'confirm', 'marketing', 'admin'];
    const start = performance.now();
    resolveZoneFromVocabulary(terms);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(1);
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe('Integration', () => {
  it('full flow under 2s target', async () => {
    const start = performance.now();

    await runCraftFlow('Create a trustworthy claim button', 'ClaimButton', {
      projectRoot: TEST_DIR,
      skipWorkshopCheck: true, // Skip for test
    });

    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(2000);
  });

  it('handles empty sanctuary gracefully', async () => {
    const result = await runCraftFlow('Button', 'Button', {
      projectRoot: TEST_DIR,
      skipWorkshopCheck: true,
    });

    expect(result.success).toBe(true);
    expect(result.skills.some((s) => s.skill === 'seeding-sanctuary')).toBe(true);
  });
});
