/**
 * @sigil-tier gold
 * Sigil v6.0 — Physics Validator Tests
 *
 * Tests for physics validation logic.
 *
 * @module __tests__/process/physics-validator
 */

import {
  // Zone constraints
  getZoneConstraint,
  isPhysicsAllowedInZone,
  validateZoneConstraint,
  // Material constraints
  getMaterialConstraint,
  parseTimingMs,
  isTimingValidForMaterial,
  validateMaterialConstraint,
  // API correctness
  validateApiExport,
  // Fidelity constraints
  getFidelityConstraint,
  compareFidelity,
  isFidelityValid,
  isEffectAllowed,
  validateFidelityConstraint,
  // Code extraction
  extractZoneFromCode,
  extractPhysicsFromCode,
  extractTimingFromCode,
  extractMaterialFromCode,
  extractImportsFromCode,
  // Main validator
  validatePhysics,
  formatValidationResponse,
  validateForHook,
} from '../../process/physics-validator';
import { Workshop } from '../../types/workshop';

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
    },
    react: {
      version: '18.2.0',
      exports: ['useState', 'useEffect', 'useCallback'],
      types_available: true,
      readme_available: true,
    },
  },
  components: {},
  physics: {},
  zones: {},
});

// =============================================================================
// ZONE CONSTRAINT TESTS
// =============================================================================

describe('Zone Constraints', () => {
  describe('getZoneConstraint', () => {
    it('returns critical zone constraint', () => {
      const constraint = getZoneConstraint('critical');
      expect(constraint.zone).toBe('critical');
      expect(constraint.requiredPhysics).toContain('deliberate');
      expect(constraint.disallowedPhysics).toContain('playful');
    });

    it('returns standard zone for unknown zones', () => {
      const constraint = getZoneConstraint('unknown');
      expect(constraint.zone).toBe('standard');
    });
  });

  describe('isPhysicsAllowedInZone', () => {
    it('allows deliberate in critical zone', () => {
      expect(isPhysicsAllowedInZone('deliberate', 'critical')).toBe(true);
    });

    it('disallows playful in critical zone', () => {
      expect(isPhysicsAllowedInZone('playful', 'critical')).toBe(false);
    });

    it('disallows snappy in critical zone', () => {
      expect(isPhysicsAllowedInZone('snappy', 'critical')).toBe(false);
    });

    it('allows snappy in admin zone', () => {
      expect(isPhysicsAllowedInZone('snappy', 'admin')).toBe(true);
    });

    it('allows playful in marketing zone', () => {
      expect(isPhysicsAllowedInZone('playful', 'marketing')).toBe(true);
    });

    it('allows any physics in standard zone', () => {
      expect(isPhysicsAllowedInZone('deliberate', 'standard')).toBe(true);
      expect(isPhysicsAllowedInZone('playful', 'standard')).toBe(true);
      expect(isPhysicsAllowedInZone('snappy', 'standard')).toBe(true);
    });
  });

  describe('validateZoneConstraint', () => {
    it('returns null for valid zone-physics combination', () => {
      const result = validateZoneConstraint('critical', 'deliberate');
      expect(result).toBeNull();
    });

    it('returns violation for invalid combination', () => {
      const result = validateZoneConstraint('critical', 'playful');
      expect(result).not.toBeNull();
      expect(result?.type).toBe('zone');
      expect(result?.severity).toBe('error');
      expect(result?.message).toContain('critical');
      expect(result?.message).toContain('playful');
    });

    it('includes suggestion in violation', () => {
      const result = validateZoneConstraint('critical', 'snappy');
      expect(result?.suggestion).toContain('deliberate');
    });
  });
});

// =============================================================================
// MATERIAL CONSTRAINT TESTS
// =============================================================================

describe('Material Constraints', () => {
  describe('getMaterialConstraint', () => {
    it('returns clay constraint', () => {
      const constraint = getMaterialConstraint('clay');
      expect(constraint?.material).toBe('clay');
      expect(constraint?.minTiming).toBe(500);
      expect(constraint?.maxTiming).toBe(2000);
    });

    it('returns null for unknown material', () => {
      const constraint = getMaterialConstraint('unknown');
      expect(constraint).toBeNull();
    });
  });

  describe('parseTimingMs', () => {
    it('parses number directly', () => {
      expect(parseTimingMs(500)).toBe(500);
    });

    it('parses ms string', () => {
      expect(parseTimingMs('500ms')).toBe(500);
    });

    it('parses seconds string', () => {
      expect(parseTimingMs('0.5s')).toBe(500);
    });

    it('parses bare number string', () => {
      expect(parseTimingMs('500')).toBe(500);
    });

    it('returns 0 for invalid string', () => {
      expect(parseTimingMs('invalid')).toBe(0);
    });
  });

  describe('isTimingValidForMaterial', () => {
    it('validates clay timing', () => {
      expect(isTimingValidForMaterial(500, 'clay')).toBe(true);
      expect(isTimingValidForMaterial(800, 'clay')).toBe(true);
      expect(isTimingValidForMaterial(100, 'clay')).toBe(false);
    });

    it('validates glass timing', () => {
      expect(isTimingValidForMaterial(200, 'glass')).toBe(true);
      expect(isTimingValidForMaterial(50, 'glass')).toBe(false);
      expect(isTimingValidForMaterial(500, 'glass')).toBe(false);
    });

    it('allows any timing for unknown material', () => {
      expect(isTimingValidForMaterial(0, 'unknown')).toBe(true);
    });
  });

  describe('validateMaterialConstraint', () => {
    it('returns null for valid material-timing', () => {
      const result = validateMaterialConstraint('clay', '800ms');
      expect(result).toBeNull();
    });

    it('returns violation for invalid timing', () => {
      const result = validateMaterialConstraint('clay', '100ms');
      expect(result).not.toBeNull();
      expect(result?.type).toBe('material');
      expect(result?.message).toContain('clay');
    });

    it('returns null for unknown material', () => {
      const result = validateMaterialConstraint('unknown', '0ms');
      expect(result).toBeNull();
    });
  });
});

// =============================================================================
// API CORRECTNESS TESTS
// =============================================================================

describe('API Correctness', () => {
  describe('validateApiExport', () => {
    const workshop = createMockWorkshop();

    it('returns null for valid export', () => {
      const result = validateApiExport('framer-motion', 'motion', workshop);
      expect(result).toBeNull();
    });

    it('returns violation for invalid export', () => {
      const result = validateApiExport('framer-motion', 'animate', workshop);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('api');
      expect(result?.message).toContain('animate');
      expect(result?.message).toContain('framer-motion');
    });

    it('suggests similar exports', () => {
      const result = validateApiExport('framer-motion', 'anim', workshop);
      expect(result?.suggestion).toContain('motion');
    });

    it('returns null for unknown package', () => {
      const result = validateApiExport('unknown-package', 'anything', workshop);
      expect(result).toBeNull();
    });
  });
});

// =============================================================================
// FIDELITY CONSTRAINT TESTS
// =============================================================================

describe('Fidelity Constraints', () => {
  describe('getFidelityConstraint', () => {
    it('returns critical zone fidelity', () => {
      const constraint = getFidelityConstraint('critical');
      expect(constraint.maxFidelity).toBe('subtle');
      expect(constraint.disallowedEffects).toContain('3d');
    });

    it('returns admin zone fidelity', () => {
      const constraint = getFidelityConstraint('admin');
      expect(constraint.maxFidelity).toBe('minimal');
      expect(constraint.disallowedEffects).toContain('blur');
    });
  });

  describe('compareFidelity', () => {
    it('compares fidelity levels', () => {
      expect(compareFidelity('minimal', 'flashy')).toBeLessThan(0);
      expect(compareFidelity('flashy', 'minimal')).toBeGreaterThan(0);
      expect(compareFidelity('standard', 'standard')).toBe(0);
    });
  });

  describe('isFidelityValid', () => {
    it('validates fidelity for critical zone', () => {
      expect(isFidelityValid('subtle', 'critical')).toBe(true);
      expect(isFidelityValid('minimal', 'critical')).toBe(true);
      expect(isFidelityValid('flashy', 'critical')).toBe(false);
    });

    it('allows flashy in marketing zone', () => {
      expect(isFidelityValid('flashy', 'marketing')).toBe(true);
    });
  });

  describe('isEffectAllowed', () => {
    it('disallows 3D in critical zone', () => {
      expect(isEffectAllowed('3d', 'critical')).toBe(false);
    });

    it('disallows blur in admin zone', () => {
      expect(isEffectAllowed('blur', 'admin')).toBe(false);
    });

    it('allows any effect in marketing zone', () => {
      expect(isEffectAllowed('3d', 'marketing')).toBe(true);
      expect(isEffectAllowed('particles', 'marketing')).toBe(true);
    });
  });

  describe('validateFidelityConstraint', () => {
    it('returns no violations for valid fidelity', () => {
      const violations = validateFidelityConstraint('critical', 'subtle', []);
      expect(violations).toHaveLength(0);
    });

    it('returns violation for exceeded fidelity', () => {
      const violations = validateFidelityConstraint('critical', 'flashy');
      expect(violations).toHaveLength(1);
      expect(violations[0].type).toBe('fidelity');
    });

    it('returns violation for disallowed effect', () => {
      const violations = validateFidelityConstraint('critical', undefined, ['3d']);
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain('3d');
    });
  });
});

// =============================================================================
// CODE EXTRACTION TESTS
// =============================================================================

describe('Code Extraction', () => {
  describe('extractZoneFromCode', () => {
    it('extracts zone from prop', () => {
      const code = '<Component zone="critical" />';
      expect(extractZoneFromCode(code)).toBe('critical');
    });

    it('extracts zone from CriticalZone component', () => {
      const code = '<CriticalZone><Content /></CriticalZone>';
      expect(extractZoneFromCode(code)).toBe('critical');
    });

    it('extracts zone from pragma', () => {
      const code = '/** @sigil-zone marketing */';
      expect(extractZoneFromCode(code)).toBe('marketing');
    });

    it('returns null when no zone found', () => {
      const code = '<Button />';
      expect(extractZoneFromCode(code)).toBeNull();
    });
  });

  describe('extractPhysicsFromCode', () => {
    it('extracts physics from prop', () => {
      const code = '<Motion physics="deliberate" />';
      expect(extractPhysicsFromCode(code)).toBe('deliberate');
    });

    it('extracts physics from pragma', () => {
      const code = '/** @sigil-physics playful */';
      expect(extractPhysicsFromCode(code)).toBe('playful');
    });
  });

  describe('extractTimingFromCode', () => {
    it('extracts duration prop', () => {
      const code = '<Animation duration={500} />';
      expect(extractTimingFromCode(code)).toBe('500');
    });

    it('extracts duration string', () => {
      const code = '<Animation duration="800ms" />';
      expect(extractTimingFromCode(code)).toBe('800ms');
    });

    it('extracts transition.duration', () => {
      const code = 'transition={{ duration: 0.5 }}';
      expect(extractTimingFromCode(code)).toBe('500ms');
    });
  });

  describe('extractMaterialFromCode', () => {
    it('extracts material from prop', () => {
      const code = '<Button material="clay" />';
      expect(extractMaterialFromCode(code)).toBe('clay');
    });

    it('extracts material from pragma', () => {
      const code = '/** @sigil-material glass */';
      expect(extractMaterialFromCode(code)).toBe('glass');
    });
  });

  describe('extractImportsFromCode', () => {
    it('extracts named imports', () => {
      const code = "import { motion, AnimatePresence } from 'framer-motion';";
      const imports = extractImportsFromCode(code);
      expect(imports).toHaveLength(1);
      expect(imports[0].package).toBe('framer-motion');
      expect(imports[0].exports).toContain('motion');
      expect(imports[0].exports).toContain('AnimatePresence');
    });

    it('extracts default imports', () => {
      const code = "import React from 'react';";
      const imports = extractImportsFromCode(code);
      expect(imports).toHaveLength(1);
      expect(imports[0].package).toBe('react');
      expect(imports[0].exports).toContain('React');
    });

    it('handles aliased imports', () => {
      const code = "import { motion as m } from 'framer-motion';";
      const imports = extractImportsFromCode(code);
      expect(imports[0].exports).toContain('motion');
    });
  });
});

// =============================================================================
// MAIN VALIDATOR TESTS
// =============================================================================

describe('validatePhysics', () => {
  it('passes valid code', () => {
    const code = `
      /** @sigil-zone critical */
      /** @sigil-physics deliberate */
      export const ClaimButton = () => <button>Claim</button>;
    `;
    const result = validatePhysics(code);
    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('detects zone-physics violation', () => {
    const code = `
      /** @sigil-zone critical */
      /** @sigil-physics playful */
      export const BadButton = () => <button>Bad</button>;
    `;
    const result = validatePhysics(code);
    expect(result.valid).toBe(false);
    expect(result.violations[0].type).toBe('zone');
  });

  it('detects material-timing violation', () => {
    const code = `
      /** @sigil-material clay */
      <Animation duration={100} />;
    `;
    const result = validatePhysics(code);
    expect(result.valid).toBe(false);
    expect(result.violations[0].type).toBe('material');
  });

  it('detects fidelity violation', () => {
    const code = `
      /** @sigil-zone admin */
      <div style={{ boxShadow: '0 0 10px black' }} />
    `;
    const result = validatePhysics(code);
    expect(result.valid).toBe(false);
    expect(result.violations[0].type).toBe('fidelity');
  });

  it('validates API correctness with workshop', () => {
    const workshop = createMockWorkshop();
    const code = `
      import { motion, animate } from 'framer-motion';
    `;
    const result = validatePhysics(code, { workshop });
    expect(result.valid).toBe(false);
    expect(result.violations[0].type).toBe('api');
  });
});

describe('formatValidationResponse', () => {
  it('formats valid result', () => {
    const result = { valid: true, violations: [] };
    const response = formatValidationResponse(result);
    expect(response.allow).toBe(true);
    expect(response.reason).toBeUndefined();
  });

  it('formats invalid result', () => {
    const result = {
      valid: false,
      violations: [
        {
          type: 'zone' as const,
          severity: 'error' as const,
          message: 'Zone violation',
          suggestion: 'Fix it',
        },
      ],
    };
    const response = formatValidationResponse(result);
    expect(response.allow).toBe(false);
    expect(response.reason).toBe('Zone violation');
    expect(response.suggestion).toBe('Fix it');
  });
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

describe('Performance', () => {
  it('validates in <10ms', () => {
    const code = `
      /** @sigil-zone critical */
      /** @sigil-physics deliberate */
      /** @sigil-material clay */
      import { motion } from 'framer-motion';
      export const Component = () => <motion.div />;
    `;

    const start = performance.now();
    validatePhysics(code);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(10);
  });

  it('100 validations in <1s', () => {
    const code = `
      /** @sigil-zone critical */
      /** @sigil-physics deliberate */
      export const Component = () => <div />;
    `;

    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      validatePhysics(code);
    }
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(1000);
  });
});
