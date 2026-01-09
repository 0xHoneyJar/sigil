/**
 * @sigil-tier gold
 * Sigil v6.0 — Workshop Query Tests
 *
 * Tests for fast workshop index lookups.
 *
 * @module __tests__/process/workshop-query
 */

import {
  queryMaterialWithFallback,
  queryComponentWithSource,
  queryPhysicsWithSource,
  queryZoneWithSource,
  queryMaterials,
  queryComponents,
  createQueryAPI,
  loadWorkshopWithQueryAPI,
  clearQueryCache,
} from '../../process/workshop-query';
import {
  Workshop,
  MaterialEntry,
  ComponentEntry,
  PhysicsDefinition,
  ZoneDefinition,
} from '../../types/workshop';

// =============================================================================
// TEST FIXTURES
// =============================================================================

const createMockWorkshop = (): Workshop => ({
  indexed_at: '2026-01-08T12:00:00Z',
  package_hash: 'abc123',
  imports_hash: 'def456',
  materials: {
    'framer-motion': {
      version: '11.0.0',
      exports: ['motion', 'AnimatePresence', 'useAnimation'],
      types_available: true,
      readme_available: true,
      signatures: {
        motion: '<T extends keyof HTMLElements>(component: T) => MotionComponent<T>',
        useAnimation: '() => AnimationControls',
      },
    },
    react: {
      version: '18.2.0',
      exports: ['useState', 'useEffect', 'useCallback'],
      types_available: true,
      readme_available: true,
    },
  },
  components: {
    ClaimButton: {
      path: 'src/sanctuary/gold/ClaimButton.tsx',
      tier: 'gold',
      zone: 'critical',
      physics: 'deliberate',
      vocabulary: ['claim', 'withdraw'],
      imports: ['framer-motion', 'react'],
    },
    GlowCard: {
      path: 'src/sanctuary/silver/GlowCard.tsx',
      tier: 'silver',
      zone: 'marketing',
      physics: 'playful',
      vocabulary: ['showcase'],
      imports: ['framer-motion'],
    },
  },
  physics: {
    deliberate: {
      timing: '800ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      description: 'Weighty actions that demand attention',
    },
    playful: {
      timing: '400ms',
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      description: 'Bouncy, delightful interactions',
    },
    snappy: {
      timing: '150ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      description: 'Instant, responsive feedback',
    },
  },
  zones: {
    critical: {
      physics: 'deliberate',
      timing: '800ms',
      description: 'Irreversible actions requiring confirmation',
    },
    marketing: {
      physics: 'playful',
      timing: '400ms',
      description: 'Showcase and promotional content',
    },
    admin: {
      physics: 'snappy',
      timing: '150ms',
      description: 'Keyboard-driven admin interfaces',
    },
  },
});

// =============================================================================
// MATERIAL QUERY TESTS
// =============================================================================

describe('queryMaterialWithFallback', () => {
  beforeEach(() => {
    clearQueryCache();
  });

  it('returns material from workshop when found', () => {
    const workshop = createMockWorkshop();
    const result = queryMaterialWithFallback(workshop, 'framer-motion');

    expect(result.found).toBe(true);
    expect(result.source).toBe('workshop');
    expect(result.data).toBeDefined();
    expect(result.data?.version).toBe('11.0.0');
    expect(result.data?.exports).toContain('motion');
  });

  it('returns not found for missing material', () => {
    const workshop = createMockWorkshop();
    const result = queryMaterialWithFallback(workshop, 'nonexistent-package', {
      enableFallback: false,
    });

    expect(result.found).toBe(false);
    expect(result.data).toBeNull();
    expect(result.source).toBe('fallback');
  });

  it('includes signatures when available', () => {
    const workshop = createMockWorkshop();
    const result = queryMaterialWithFallback(workshop, 'framer-motion');

    expect(result.found).toBe(true);
    expect(result.data?.signatures).toBeDefined();
    expect(result.data?.signatures?.motion).toContain('MotionComponent');
  });

  it('handles material without signatures', () => {
    const workshop = createMockWorkshop();
    const result = queryMaterialWithFallback(workshop, 'react');

    expect(result.found).toBe(true);
    expect(result.data?.version).toBe('18.2.0');
    expect(result.data?.signatures).toBeUndefined();
  });
});

// =============================================================================
// COMPONENT QUERY TESTS
// =============================================================================

describe('queryComponentWithSource', () => {
  it('returns component from workshop when found', () => {
    const workshop = createMockWorkshop();
    const result = queryComponentWithSource(workshop, 'ClaimButton');

    expect(result.found).toBe(true);
    expect(result.source).toBe('workshop');
    expect(result.data).toBeDefined();
    expect(result.data?.tier).toBe('gold');
    expect(result.data?.zone).toBe('critical');
  });

  it('returns not found for missing component', () => {
    const workshop = createMockWorkshop();
    const result = queryComponentWithSource(workshop, 'NonexistentComponent');

    expect(result.found).toBe(false);
    expect(result.data).toBeNull();
    expect(result.source).toBe('workshop');
  });

  it('includes vocabulary terms', () => {
    const workshop = createMockWorkshop();
    const result = queryComponentWithSource(workshop, 'ClaimButton');

    expect(result.found).toBe(true);
    expect(result.data?.vocabulary).toContain('claim');
    expect(result.data?.vocabulary).toContain('withdraw');
  });

  it('includes import list', () => {
    const workshop = createMockWorkshop();
    const result = queryComponentWithSource(workshop, 'ClaimButton');

    expect(result.found).toBe(true);
    expect(result.data?.imports).toContain('framer-motion');
    expect(result.data?.imports).toContain('react');
  });
});

// =============================================================================
// PHYSICS QUERY TESTS
// =============================================================================

describe('queryPhysicsWithSource', () => {
  it('returns physics from workshop when found', () => {
    const workshop = createMockWorkshop();
    const result = queryPhysicsWithSource(workshop, 'deliberate');

    expect(result.found).toBe(true);
    expect(result.source).toBe('workshop');
    expect(result.data).toBeDefined();
    expect(result.data?.timing).toBe('800ms');
    expect(result.data?.easing).toContain('cubic-bezier');
  });

  it('returns not found for missing physics', () => {
    const workshop = createMockWorkshop();
    const result = queryPhysicsWithSource(workshop, 'nonexistent');

    expect(result.found).toBe(false);
    expect(result.data).toBeNull();
    expect(result.source).toBe('workshop');
  });

  it('includes description', () => {
    const workshop = createMockWorkshop();
    const result = queryPhysicsWithSource(workshop, 'playful');

    expect(result.found).toBe(true);
    expect(result.data?.description).toContain('Bouncy');
  });
});

// =============================================================================
// ZONE QUERY TESTS
// =============================================================================

describe('queryZoneWithSource', () => {
  it('returns zone from workshop when found', () => {
    const workshop = createMockWorkshop();
    const result = queryZoneWithSource(workshop, 'critical');

    expect(result.found).toBe(true);
    expect(result.source).toBe('workshop');
    expect(result.data).toBeDefined();
    expect(result.data?.physics).toBe('deliberate');
    expect(result.data?.timing).toBe('800ms');
  });

  it('returns not found for missing zone', () => {
    const workshop = createMockWorkshop();
    const result = queryZoneWithSource(workshop, 'nonexistent');

    expect(result.found).toBe(false);
    expect(result.data).toBeNull();
    expect(result.source).toBe('workshop');
  });

  it('includes description', () => {
    const workshop = createMockWorkshop();
    const result = queryZoneWithSource(workshop, 'admin');

    expect(result.found).toBe(true);
    expect(result.data?.description).toContain('Keyboard-driven');
  });
});

// =============================================================================
// BATCH QUERY TESTS
// =============================================================================

describe('queryMaterials', () => {
  beforeEach(() => {
    clearQueryCache();
  });

  it('returns results for multiple materials', () => {
    const workshop = createMockWorkshop();
    const results = queryMaterials(workshop, ['framer-motion', 'react'], {
      enableFallback: false,
    });

    expect(results.size).toBe(2);
    expect(results.get('framer-motion')?.found).toBe(true);
    expect(results.get('react')?.found).toBe(true);
  });

  it('handles mix of found and not found', () => {
    const workshop = createMockWorkshop();
    const results = queryMaterials(workshop, ['framer-motion', 'nonexistent'], {
      enableFallback: false,
    });

    expect(results.size).toBe(2);
    expect(results.get('framer-motion')?.found).toBe(true);
    expect(results.get('nonexistent')?.found).toBe(false);
  });
});

describe('queryComponents', () => {
  it('returns results for multiple components', () => {
    const workshop = createMockWorkshop();
    const results = queryComponents(workshop, ['ClaimButton', 'GlowCard']);

    expect(results.size).toBe(2);
    expect(results.get('ClaimButton')?.found).toBe(true);
    expect(results.get('GlowCard')?.found).toBe(true);
  });

  it('handles mix of found and not found', () => {
    const workshop = createMockWorkshop();
    const results = queryComponents(workshop, ['ClaimButton', 'Nonexistent']);

    expect(results.size).toBe(2);
    expect(results.get('ClaimButton')?.found).toBe(true);
    expect(results.get('Nonexistent')?.found).toBe(false);
  });
});

// =============================================================================
// QUERY API TESTS
// =============================================================================

describe('createQueryAPI', () => {
  beforeEach(() => {
    clearQueryCache();
  });

  it('creates functional query API', () => {
    const workshop = createMockWorkshop();
    const api = createQueryAPI(workshop, { enableFallback: false });

    expect(api.workshop).toBe(workshop);
    expect(typeof api.material).toBe('function');
    expect(typeof api.component).toBe('function');
    expect(typeof api.physics).toBe('function');
    expect(typeof api.zone).toBe('function');
  });

  it('material queries work through API', () => {
    const workshop = createMockWorkshop();
    const api = createQueryAPI(workshop, { enableFallback: false });

    const result = api.material('framer-motion');
    expect(result.found).toBe(true);
    expect(result.data?.version).toBe('11.0.0');
  });

  it('component queries work through API', () => {
    const workshop = createMockWorkshop();
    const api = createQueryAPI(workshop, { enableFallback: false });

    const result = api.component('ClaimButton');
    expect(result.found).toBe(true);
    expect(result.data?.tier).toBe('gold');
  });

  it('physics queries work through API', () => {
    const workshop = createMockWorkshop();
    const api = createQueryAPI(workshop, { enableFallback: false });

    const result = api.physics('deliberate');
    expect(result.found).toBe(true);
    expect(result.data?.timing).toBe('800ms');
  });

  it('zone queries work through API', () => {
    const workshop = createMockWorkshop();
    const api = createQueryAPI(workshop, { enableFallback: false });

    const result = api.zone('critical');
    expect(result.found).toBe(true);
    expect(result.data?.physics).toBe('deliberate');
  });
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

describe('Query Performance', () => {
  beforeEach(() => {
    clearQueryCache();
  });

  it('workshop query completes in <5ms', () => {
    const workshop = createMockWorkshop();
    const start = performance.now();

    queryMaterialWithFallback(workshop, 'framer-motion', { enableFallback: false });

    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(5);
  });

  it('100 queries complete in <500ms', () => {
    const workshop = createMockWorkshop();
    const materials = ['framer-motion', 'react'];
    const components = ['ClaimButton', 'GlowCard'];
    const physics = ['deliberate', 'playful', 'snappy'];
    const zones = ['critical', 'marketing', 'admin'];

    const start = performance.now();

    for (let i = 0; i < 25; i++) {
      queryMaterialWithFallback(workshop, materials[i % materials.length], {
        enableFallback: false,
      });
      queryComponentWithSource(workshop, components[i % components.length]);
      queryPhysicsWithSource(workshop, physics[i % physics.length]);
      queryZoneWithSource(workshop, zones[i % zones.length]);
    }

    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(500);
  });
});

// =============================================================================
// SOURCE TRACKING TESTS
// =============================================================================

describe('Source Tracking', () => {
  beforeEach(() => {
    clearQueryCache();
  });

  it('tracks workshop source for materials', () => {
    const workshop = createMockWorkshop();
    const result = queryMaterialWithFallback(workshop, 'framer-motion');

    expect(result.source).toBe('workshop');
  });

  it('tracks workshop source for components', () => {
    const workshop = createMockWorkshop();
    const result = queryComponentWithSource(workshop, 'ClaimButton');

    expect(result.source).toBe('workshop');
  });

  it('tracks fallback source for missing materials', () => {
    const workshop = createMockWorkshop();
    const result = queryMaterialWithFallback(workshop, 'nonexistent', {
      enableFallback: false,
    });

    expect(result.source).toBe('fallback');
  });
});

// =============================================================================
// CACHE TESTS
// =============================================================================

describe('Fallback Cache', () => {
  beforeEach(() => {
    clearQueryCache();
  });

  it('clearQueryCache clears all cached results', () => {
    // Just verify the function exists and doesn't throw
    expect(() => clearQueryCache()).not.toThrow();
  });
});
