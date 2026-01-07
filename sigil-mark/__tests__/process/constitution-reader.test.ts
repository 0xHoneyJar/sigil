/**
 * Sigil v2.6 — Constitution Reader Tests
 *
 * Tests for reading and validating the Constitution.
 *
 * @module __tests__/process/constitution-reader
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as path from 'path';
import {
  readConstitution,
  isCapabilityProtected,
  getCapabilityEnforcement,
  getCapability,
  getCapabilitiesForZone,
  validateAction,
  DEFAULT_CONSTITUTION,
  type Constitution,
  type ProtectedCapability,
} from '../../process/constitution-reader';

// =============================================================================
// TEST DATA
// =============================================================================

const VALID_CONSTITUTION: Constitution = {
  version: '2.6.0',
  enforcement: 'block',
  protected: [
    {
      id: 'withdraw',
      name: 'Withdraw Funds',
      description: 'User can always exit their position',
      enforcement: 'block',
      rationale: 'Financial autonomy is non-negotiable',
      zones: ['critical'],
    },
    {
      id: 'deposit',
      name: 'Deposit Funds',
      description: 'User can always add to their position',
      enforcement: 'block',
      rationale: 'Users must always be able to increase their position',
      zones: ['critical'],
    },
    {
      id: 'error_messages',
      name: 'Error Messages',
      description: 'Errors are never suppressed',
      enforcement: 'block',
      rationale: 'Errors must be communicated clearly',
      zones: [], // All zones
    },
    {
      id: 'help_access',
      name: 'Help Access',
      description: 'Help is available on every screen',
      enforcement: 'warn',
      rationale: 'Users should always be able to access help',
      zones: [], // All zones
    },
  ],
  override_audit: {
    enabled: true,
    path: 'sigil-mark/constitution/audit.log',
    requires_justification: true,
    notify: ['engineering-lead'],
  },
};

// =============================================================================
// TESTS: readConstitution
// =============================================================================

describe('readConstitution', () => {
  const fixturesPath = path.join(__dirname, '../fixtures');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should read and parse valid constitution YAML', async () => {
    const constitution = await readConstitution(
      path.join(process.cwd(), 'constitution/protected-capabilities.yaml')
    );

    expect(constitution.version).toBe('2.6.0');
    expect(constitution.enforcement).toBe('block');
    expect(constitution.protected.length).toBeGreaterThan(0);
    expect(constitution.protected[0].id).toBe('withdraw');
  });

  it('should return default constitution when file does not exist', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const constitution = await readConstitution('/nonexistent/path.yaml');

    expect(constitution).toEqual(DEFAULT_CONSTITUTION);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('File not found')
    );

    consoleSpy.mockRestore();
  });

  it('should return default constitution for invalid YAML', async () => {
    // This test relies on the graceful degradation behavior
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Reading a non-YAML file should fail gracefully
    const constitution = await readConstitution(__filename);

    // Should return either parsed (if somehow valid) or defaults
    expect(constitution.version).toBeDefined();
    expect(constitution.protected).toBeDefined();
    expect(Array.isArray(constitution.protected)).toBe(true);

    consoleSpy.mockRestore();
  });

  it('should filter out invalid capabilities', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // The actual constitution should have all valid capabilities
    const constitution = await readConstitution(
      path.join(process.cwd(), 'constitution/protected-capabilities.yaml')
    );

    // All capabilities should have required fields
    for (const cap of constitution.protected) {
      expect(cap.id).toBeDefined();
      expect(cap.name).toBeDefined();
      expect(cap.description).toBeDefined();
      expect(cap.enforcement).toMatch(/^(block|warn|log)$/);
      expect(cap.rationale).toBeDefined();
    }

    consoleSpy.mockRestore();
  });
});

// =============================================================================
// TESTS: isCapabilityProtected
// =============================================================================

describe('isCapabilityProtected', () => {
  it('should return true for protected capabilities', () => {
    expect(isCapabilityProtected(VALID_CONSTITUTION, 'withdraw')).toBe(true);
    expect(isCapabilityProtected(VALID_CONSTITUTION, 'deposit')).toBe(true);
    expect(isCapabilityProtected(VALID_CONSTITUTION, 'error_messages')).toBe(true);
  });

  it('should return false for non-protected capabilities', () => {
    expect(isCapabilityProtected(VALID_CONSTITUTION, 'unknown')).toBe(false);
    expect(isCapabilityProtected(VALID_CONSTITUTION, '')).toBe(false);
    expect(isCapabilityProtected(VALID_CONSTITUTION, 'WITHDRAW')).toBe(false); // Case sensitive
  });

  it('should handle empty constitution', () => {
    expect(isCapabilityProtected(DEFAULT_CONSTITUTION, 'withdraw')).toBe(false);
  });
});

// =============================================================================
// TESTS: getCapabilityEnforcement
// =============================================================================

describe('getCapabilityEnforcement', () => {
  it('should return enforcement level for protected capabilities', () => {
    expect(getCapabilityEnforcement(VALID_CONSTITUTION, 'withdraw')).toBe('block');
    expect(getCapabilityEnforcement(VALID_CONSTITUTION, 'help_access')).toBe('warn');
  });

  it('should return null for non-protected capabilities', () => {
    expect(getCapabilityEnforcement(VALID_CONSTITUTION, 'unknown')).toBeNull();
  });

  it('should handle empty constitution', () => {
    expect(getCapabilityEnforcement(DEFAULT_CONSTITUTION, 'withdraw')).toBeNull();
  });
});

// =============================================================================
// TESTS: getCapability
// =============================================================================

describe('getCapability', () => {
  it('should return the full capability object', () => {
    const cap = getCapability(VALID_CONSTITUTION, 'withdraw');

    expect(cap).toBeDefined();
    expect(cap?.id).toBe('withdraw');
    expect(cap?.name).toBe('Withdraw Funds');
    expect(cap?.enforcement).toBe('block');
    expect(cap?.zones).toContain('critical');
  });

  it('should return undefined for non-existent capabilities', () => {
    expect(getCapability(VALID_CONSTITUTION, 'unknown')).toBeUndefined();
  });
});

// =============================================================================
// TESTS: getCapabilitiesForZone
// =============================================================================

describe('getCapabilitiesForZone', () => {
  it('should return capabilities for critical zone', () => {
    const caps = getCapabilitiesForZone(VALID_CONSTITUTION, 'critical');

    // Should include zone-specific AND zone-agnostic capabilities
    expect(caps.length).toBeGreaterThanOrEqual(4);

    const ids = caps.map((c) => c.id);
    expect(ids).toContain('withdraw');
    expect(ids).toContain('deposit');
    expect(ids).toContain('error_messages'); // All zones
    expect(ids).toContain('help_access'); // All zones
  });

  it('should return zone-agnostic capabilities for any zone', () => {
    const caps = getCapabilitiesForZone(VALID_CONSTITUTION, 'marketing');

    const ids = caps.map((c) => c.id);
    expect(ids).toContain('error_messages'); // All zones
    expect(ids).toContain('help_access'); // All zones
    expect(ids).not.toContain('withdraw'); // Critical only
    expect(ids).not.toContain('deposit'); // Critical only
  });

  it('should handle empty constitution', () => {
    const caps = getCapabilitiesForZone(DEFAULT_CONSTITUTION, 'critical');
    expect(caps).toEqual([]);
  });
});

// =============================================================================
// TESTS: validateAction
// =============================================================================

describe('validateAction', () => {
  it('should validate protected action in correct zone', () => {
    const result = validateAction(VALID_CONSTITUTION, 'withdraw', 'critical');

    expect(result.valid).toBe(true);
    expect(result.capability).toBeDefined();
    expect(result.capability?.id).toBe('withdraw');
    expect(result.enforcement).toBe('block');
  });

  it('should validate protected action in wrong zone', () => {
    const result = validateAction(VALID_CONSTITUTION, 'withdraw', 'marketing');

    expect(result.valid).toBe(true);
    expect(result.capability).toBeDefined();
    expect(result.message).toContain('does not apply to zone');
  });

  it('should validate zone-agnostic actions', () => {
    const criticalResult = validateAction(VALID_CONSTITUTION, 'error_messages', 'critical');
    const marketingResult = validateAction(VALID_CONSTITUTION, 'error_messages', 'marketing');

    expect(criticalResult.valid).toBe(true);
    expect(criticalResult.enforcement).toBe('block');
    expect(marketingResult.valid).toBe(true);
    expect(marketingResult.enforcement).toBe('block');
  });

  it('should handle unknown capabilities', () => {
    const result = validateAction(VALID_CONSTITUTION, 'unknown', 'critical');

    expect(result.valid).toBe(true);
    expect(result.capability).toBeNull();
    expect(result.message).toContain('not protected');
  });

  it('should work without zone parameter', () => {
    const result = validateAction(VALID_CONSTITUTION, 'withdraw');

    expect(result.valid).toBe(true);
    expect(result.capability).toBeDefined();
    expect(result.enforcement).toBe('block');
  });
});

// =============================================================================
// TESTS: Graceful Degradation
// =============================================================================

describe('Graceful Degradation', () => {
  it('should never throw on missing file', async () => {
    const constitution = await readConstitution('/definitely/does/not/exist.yaml');

    expect(constitution).toEqual(DEFAULT_CONSTITUTION);
    expect(constitution.protected).toEqual([]);
  });

  it('should return valid structure even with empty input', async () => {
    const constitution = await readConstitution('/dev/null');

    expect(constitution.version).toBeDefined();
    expect(constitution.enforcement).toBeDefined();
    expect(Array.isArray(constitution.protected)).toBe(true);
  });

  it('should have working helper functions with default constitution', () => {
    // All helpers should work without crashing on empty constitution
    expect(isCapabilityProtected(DEFAULT_CONSTITUTION, 'anything')).toBe(false);
    expect(getCapabilityEnforcement(DEFAULT_CONSTITUTION, 'anything')).toBeNull();
    expect(getCapability(DEFAULT_CONSTITUTION, 'anything')).toBeUndefined();
    expect(getCapabilitiesForZone(DEFAULT_CONSTITUTION, 'critical')).toEqual([]);

    const result = validateAction(DEFAULT_CONSTITUTION, 'anything', 'critical');
    expect(result.valid).toBe(true);
    expect(result.capability).toBeNull();
  });
});
