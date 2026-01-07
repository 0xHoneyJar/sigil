/**
 * Sigil v2.6 — Lens Array Reader Tests
 *
 * Tests for reading user personas, stacking validation, and conflict resolution.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as path from 'path';
import * as fs from 'fs/promises';
import {
  readLensArray,
  getPersona,
  getAllPersonas,
  getPhysicsForPersona,
  getConstraintsForPersona,
  validateLensStack,
  resolveStackConflict,
  mergeStack,
  formatPersonaSummary,
  formatLensArraySummary,
  DEFAULT_LENS_ARRAY,
  DEFAULT_LENS_ARRAY_PATH,
  type LensArray,
  type Persona,
} from '../../process/lens-array-reader';

// =============================================================================
// CONSTANTS
// =============================================================================

describe('Constants', () => {
  it('should export DEFAULT_LENS_ARRAY_PATH', () => {
    expect(DEFAULT_LENS_ARRAY_PATH).toBe('sigil-mark/lens-array/lenses.yaml');
  });

  it('should export DEFAULT_LENS_ARRAY with correct structure', () => {
    expect(DEFAULT_LENS_ARRAY).toEqual({
      version: '3.0.0',
      lenses: {},
      immutable_properties: [],
      stacking: {
        allowed_combinations: [],
        forbidden_combinations: [],
        conflict_resolution: 'priority',
        priority_order: [],
        max_stack_depth: 3,
      },
    });
  });
});

// =============================================================================
// READ OPERATIONS
// =============================================================================

describe('readLensArray', () => {
  it('should return default lens array for non-existent file', async () => {
    const result = await readLensArray('/non/existent/path.yaml');
    expect(result).toEqual(DEFAULT_LENS_ARRAY);
  });

  it('should read and parse actual lenses.yaml', async () => {
    const lensPath = path.join(process.cwd(), 'lens-array/lenses.yaml');
    const result = await readLensArray(lensPath);

    expect(result.version).toBe('3.0.0');
    expect(Object.keys(result.lenses).length).toBe(4);
    expect(result.lenses['power_user']).toBeDefined();
    expect(result.lenses['newcomer']).toBeDefined();
    expect(result.lenses['mobile']).toBeDefined();
    expect(result.lenses['accessibility']).toBeDefined();
  });

  it('should parse persona aliases correctly', async () => {
    const lensPath = path.join(process.cwd(), 'lens-array/lenses.yaml');
    const result = await readLensArray(lensPath);

    expect(result.lenses['power_user'].alias).toBe('Chef');
    expect(result.lenses['newcomer'].alias).toBe('Henlocker');
    expect(result.lenses['mobile'].alias).toBe('Thumbzone');
    expect(result.lenses['accessibility'].alias).toBe('A11y');
  });

  it('should parse persona physics correctly', async () => {
    const lensPath = path.join(process.cwd(), 'lens-array/lenses.yaml');
    const result = await readLensArray(lensPath);

    const powerUser = result.lenses['power_user'];
    expect(powerUser.physics.input_method).toBe('keyboard');
    expect(powerUser.physics.shortcuts?.expected).toBe(true);
    expect(powerUser.physics.tap_targets?.min_size).toBe('32px');

    const mobile = result.lenses['mobile'];
    expect(mobile.physics.input_method).toBe('touch');
    expect(mobile.physics.tap_targets?.min_size).toBe('48px');
    expect(mobile.physics.feedback?.haptic).toBe(true);
  });

  it('should parse persona constraints correctly', async () => {
    const lensPath = path.join(process.cwd(), 'lens-array/lenses.yaml');
    const result = await readLensArray(lensPath);

    const newcomer = result.lenses['newcomer'];
    expect(newcomer.constraints.max_actions_per_screen).toBe(3);
    expect(newcomer.constraints.reading_level).toBe('basic');
    expect(newcomer.constraints.error_tolerance).toBe('low');

    const accessibility = result.lenses['accessibility'];
    expect(accessibility.constraints.accessibility?.screen_reader).toBe(true);
    expect(accessibility.constraints.accessibility?.high_contrast).toBe(true);
  });

  it('should parse stacking configuration correctly', async () => {
    const lensPath = path.join(process.cwd(), 'lens-array/lenses.yaml');
    const result = await readLensArray(lensPath);

    expect(result.stacking.conflict_resolution).toBe('priority');
    expect(result.stacking.max_stack_depth).toBe(3);
    expect(result.stacking.priority_order).toContain('accessibility');
    expect(result.stacking.allowed_combinations).toContainEqual(['power_user', 'accessibility']);
    expect(result.stacking.forbidden_combinations).toContainEqual(['power_user', 'newcomer']);
  });

  it('should parse immutable properties correctly', async () => {
    const lensPath = path.join(process.cwd(), 'lens-array/lenses.yaml');
    const result = await readLensArray(lensPath);

    expect(result.immutable_properties).toContain('accessibility.screen_reader');
    expect(result.immutable_properties).toContain('accessibility.high_contrast');
  });
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

describe('getPersona', () => {
  let lensArray: LensArray;

  beforeEach(async () => {
    const lensPath = path.join(process.cwd(), 'lens-array/lenses.yaml');
    lensArray = await readLensArray(lensPath);
  });

  it('should return persona by ID', () => {
    const persona = getPersona(lensArray, 'power_user');
    expect(persona).toBeDefined();
    expect(persona?.alias).toBe('Chef');
  });

  it('should return undefined for unknown persona', () => {
    const persona = getPersona(lensArray, 'unknown');
    expect(persona).toBeUndefined();
  });
});

describe('getAllPersonas', () => {
  it('should return all personas as array', async () => {
    const lensPath = path.join(process.cwd(), 'lens-array/lenses.yaml');
    const lensArray = await readLensArray(lensPath);
    const personas = getAllPersonas(lensArray);

    expect(personas.length).toBe(4);
    expect(personas.map((p) => p.id)).toContain('power_user');
    expect(personas.map((p) => p.id)).toContain('newcomer');
    expect(personas.map((p) => p.id)).toContain('mobile');
    expect(personas.map((p) => p.id)).toContain('accessibility');
  });
});

describe('getPhysicsForPersona', () => {
  it('should return physics for persona', async () => {
    const lensPath = path.join(process.cwd(), 'lens-array/lenses.yaml');
    const lensArray = await readLensArray(lensPath);

    const physics = getPhysicsForPersona(lensArray, 'mobile');
    expect(physics).toBeDefined();
    expect(physics?.input_method).toBe('touch');
    expect(physics?.tap_targets?.min_size).toBe('48px');
  });

  it('should return undefined for unknown persona', async () => {
    const lensPath = path.join(process.cwd(), 'lens-array/lenses.yaml');
    const lensArray = await readLensArray(lensPath);

    const physics = getPhysicsForPersona(lensArray, 'unknown');
    expect(physics).toBeUndefined();
  });
});

describe('getConstraintsForPersona', () => {
  it('should return constraints for persona', async () => {
    const lensPath = path.join(process.cwd(), 'lens-array/lenses.yaml');
    const lensArray = await readLensArray(lensPath);

    const constraints = getConstraintsForPersona(lensArray, 'newcomer');
    expect(constraints).toBeDefined();
    expect(constraints?.max_actions_per_screen).toBe(3);
    expect(constraints?.reading_level).toBe('basic');
  });
});

// =============================================================================
// STACKING VALIDATION
// =============================================================================

describe('validateLensStack', () => {
  let lensArray: LensArray;

  beforeEach(async () => {
    const lensPath = path.join(process.cwd(), 'lens-array/lenses.yaml');
    lensArray = await readLensArray(lensPath);
  });

  it('should validate empty stack as invalid', () => {
    const result = validateLensStack(lensArray, []);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Stack cannot be empty');
  });

  it('should validate single lens as valid', () => {
    const result = validateLensStack(lensArray, ['power_user']);
    expect(result.valid).toBe(true);
    expect(result.stack?.length).toBe(1);
    expect(result.stack?.[0].alias).toBe('Chef');
  });

  it('should validate unknown persona as invalid', () => {
    const result = validateLensStack(lensArray, ['unknown']);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Unknown persona: unknown');
  });

  it('should validate allowed combination as valid', () => {
    const result = validateLensStack(lensArray, ['power_user', 'accessibility']);
    expect(result.valid).toBe(true);
    expect(result.stack?.length).toBe(2);
  });

  it('should validate forbidden combination as invalid', () => {
    const result = validateLensStack(lensArray, ['power_user', 'newcomer']);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Forbidden combination: power_user + newcomer');
  });

  it('should validate stack exceeding max depth as invalid', () => {
    const result = validateLensStack(lensArray, [
      'power_user',
      'newcomer',
      'mobile',
      'accessibility',
    ]);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Stack exceeds max depth of 3');
  });

  it('should validate combination not in allowed list as invalid', () => {
    // power_user + mobile is not in allowed_combinations
    const result = validateLensStack(lensArray, ['power_user', 'mobile']);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('not in allowed list');
  });
});

// =============================================================================
// CONFLICT RESOLUTION
// =============================================================================

describe('resolveStackConflict', () => {
  let lensArray: LensArray;

  beforeEach(async () => {
    const lensPath = path.join(process.cwd(), 'lens-array/lenses.yaml');
    lensArray = await readLensArray(lensPath);
  });

  it('should resolve conflict using priority order', () => {
    const powerUser = lensArray.lenses['power_user'];
    const accessibility = lensArray.lenses['accessibility'];

    const result = resolveStackConflict(
      lensArray,
      [powerUser, accessibility],
      'physics.tap_targets.min_size'
    );

    // accessibility has higher priority in priority_order
    expect(result.winner.id).toBe('accessibility');
    expect(result.value).toBe('48px');
  });

  it('should resolve single persona conflict to itself', () => {
    const powerUser = lensArray.lenses['power_user'];

    const result = resolveStackConflict(
      lensArray,
      [powerUser],
      'physics.input_method'
    );

    expect(result.winner.id).toBe('power_user');
    expect(result.value).toBe('keyboard');
    expect(result.losers.length).toBe(0);
  });

  it('should identify losers in conflict resolution', () => {
    const newcomer = lensArray.lenses['newcomer'];
    const accessibility = lensArray.lenses['accessibility'];

    const result = resolveStackConflict(
      lensArray,
      [newcomer, accessibility],
      'physics.input_method'
    );

    expect(result.losers.length).toBe(1);
    expect(result.losers[0].id).not.toBe(result.winner.id);
  });
});

// =============================================================================
// MERGE STACK
// =============================================================================

describe('mergeStack', () => {
  let lensArray: LensArray;

  beforeEach(async () => {
    const lensPath = path.join(process.cwd(), 'lens-array/lenses.yaml');
    lensArray = await readLensArray(lensPath);
  });

  it('should return null for invalid stack', () => {
    const result = mergeStack(lensArray, ['power_user', 'newcomer']);
    expect(result).toBeNull();
  });

  it('should merge valid stack', () => {
    const result = mergeStack(lensArray, ['power_user', 'accessibility']);

    expect(result).toBeDefined();
    expect(result?.id).toBe('power_user+accessibility');
    expect(result?.alias).toBe('Chef+A11y');
  });

  it('should take higher priority constraints in merged stack', () => {
    const result = mergeStack(lensArray, ['power_user', 'accessibility']);

    // accessibility has screen_reader requirement
    expect(result?.constraints.accessibility?.screen_reader).toBe(true);
  });
});

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

describe('formatPersonaSummary', () => {
  it('should format persona summary', async () => {
    const lensPath = path.join(process.cwd(), 'lens-array/lenses.yaml');
    const lensArray = await readLensArray(lensPath);
    const persona = lensArray.lenses['power_user'];

    const summary = formatPersonaSummary(persona);

    expect(summary).toContain('Chef');
    expect(summary).toContain('Power User');
    expect(summary).toContain('keyboard');
    expect(summary).toContain('32px');
  });
});

describe('formatLensArraySummary', () => {
  it('should format lens array summary', async () => {
    const lensPath = path.join(process.cwd(), 'lens-array/lenses.yaml');
    const lensArray = await readLensArray(lensPath);

    const summary = formatLensArraySummary(lensArray);

    expect(summary).toContain('Sigil Lens Array v3.0.0');
    expect(summary).toContain('Personas (4)');
    expect(summary).toContain('Chef');
    expect(summary).toContain('Henlocker');
    expect(summary).toContain('priority');
  });
});

// =============================================================================
// GRACEFUL DEGRADATION
// =============================================================================

describe('Graceful Degradation', () => {
  it('should never throw on file not found', async () => {
    const result = await readLensArray('/definitely/not/a/real/path.yaml');
    expect(result).toEqual(DEFAULT_LENS_ARRAY);
  });

  it('should handle invalid YAML gracefully', async () => {
    // Create a temp file with invalid YAML
    const tempPath = path.join(process.cwd(), '__tests__/temp-invalid.yaml');
    await fs.writeFile(tempPath, 'invalid: yaml: content: [[[', 'utf-8');

    try {
      const result = await readLensArray(tempPath);
      expect(result).toEqual(DEFAULT_LENS_ARRAY);
    } finally {
      await fs.unlink(tempPath);
    }
  });

  it('should skip invalid personas and continue', async () => {
    const tempPath = path.join(process.cwd(), '__tests__/temp-partial.yaml');
    const content = `
version: "3.0.0"
lenses:
  valid_persona:
    name: Valid
    alias: VP
    physics:
      input_method: keyboard
    constraints: {}
  invalid_persona:
    name: Missing alias
    physics:
      input_method: invalid_method
stacking:
  conflict_resolution: priority
  max_stack_depth: 3
`;
    await fs.writeFile(tempPath, content, 'utf-8');

    try {
      const result = await readLensArray(tempPath);
      expect(Object.keys(result.lenses).length).toBe(1);
      expect(result.lenses['valid_persona']).toBeDefined();
      expect(result.lenses['invalid_persona']).toBeUndefined();
    } finally {
      await fs.unlink(tempPath);
    }
  });
});

// =============================================================================
// PRIORITY CALCULATIONS
// =============================================================================

describe('Priority Calculations', () => {
  it('should use priority_order for resolution', async () => {
    const lensPath = path.join(process.cwd(), 'lens-array/lenses.yaml');
    const lensArray = await readLensArray(lensPath);

    // priority_order: [accessibility, mobile, power_user, newcomer]
    const mobile = lensArray.lenses['mobile'];
    const newcomer = lensArray.lenses['newcomer'];

    const result = resolveStackConflict(
      lensArray,
      [newcomer, mobile],
      'physics.tap_targets.min_size'
    );

    // mobile is higher in priority_order than newcomer
    expect(result.winner.id).toBe('mobile');
  });

  it('should resolve accessibility as highest priority', async () => {
    const lensPath = path.join(process.cwd(), 'lens-array/lenses.yaml');
    const lensArray = await readLensArray(lensPath);

    const accessibility = lensArray.lenses['accessibility'];
    const powerUser = lensArray.lenses['power_user'];
    const mobile = lensArray.lenses['mobile'];

    const result = resolveStackConflict(
      lensArray,
      [powerUser, mobile, accessibility],
      'constraints.cognitive_load'
    );

    // accessibility should always win
    expect(result.winner.id).toBe('accessibility');
  });
});
