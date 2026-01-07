/**
 * Sigil v2.6 — Zone-Persona Integration Tests
 *
 * Tests for mapping zones to personas.
 */

import { describe, it, expect } from 'vitest';
import {
  getPersonaForZone,
  resolveZoneWithPersona,
  DEFAULT_ZONE_PERSONA_MAP,
} from '../core/zone-resolver';

// =============================================================================
// CONSTANTS
// =============================================================================

describe('DEFAULT_ZONE_PERSONA_MAP', () => {
  it('should map critical zones to power_user', () => {
    expect(DEFAULT_ZONE_PERSONA_MAP['critical']).toBe('power_user');
    expect(DEFAULT_ZONE_PERSONA_MAP['checkout']).toBe('power_user');
    expect(DEFAULT_ZONE_PERSONA_MAP['claim']).toBe('power_user');
    expect(DEFAULT_ZONE_PERSONA_MAP['withdraw']).toBe('power_user');
    expect(DEFAULT_ZONE_PERSONA_MAP['deposit']).toBe('power_user');
  });

  it('should map marketing zones to newcomer', () => {
    expect(DEFAULT_ZONE_PERSONA_MAP['marketing']).toBe('newcomer');
    expect(DEFAULT_ZONE_PERSONA_MAP['landing']).toBe('newcomer');
    expect(DEFAULT_ZONE_PERSONA_MAP['onboarding']).toBe('newcomer');
    expect(DEFAULT_ZONE_PERSONA_MAP['welcome']).toBe('newcomer');
  });

  it('should map admin zones to power_user', () => {
    expect(DEFAULT_ZONE_PERSONA_MAP['admin']).toBe('power_user');
    expect(DEFAULT_ZONE_PERSONA_MAP['dashboard']).toBe('power_user');
    expect(DEFAULT_ZONE_PERSONA_MAP['settings']).toBe('power_user');
  });

  it('should map mobile zones to mobile', () => {
    expect(DEFAULT_ZONE_PERSONA_MAP['mobile']).toBe('mobile');
    expect(DEFAULT_ZONE_PERSONA_MAP['app']).toBe('mobile');
  });

  it('should map accessibility zones to accessibility', () => {
    expect(DEFAULT_ZONE_PERSONA_MAP['a11y']).toBe('accessibility');
    expect(DEFAULT_ZONE_PERSONA_MAP['accessible']).toBe('accessibility');
  });
});

// =============================================================================
// getPersonaForZone
// =============================================================================

describe('getPersonaForZone', () => {
  it('should return exact match from default mapping', () => {
    expect(getPersonaForZone('critical')).toBe('power_user');
    expect(getPersonaForZone('marketing')).toBe('newcomer');
    expect(getPersonaForZone('mobile')).toBe('mobile');
    expect(getPersonaForZone('a11y')).toBe('accessibility');
  });

  it('should return newcomer for unknown zones', () => {
    expect(getPersonaForZone('unknown')).toBe('newcomer');
    expect(getPersonaForZone('random')).toBe('newcomer');
    expect(getPersonaForZone('custom')).toBe('newcomer');
  });

  it('should match zone path parts', () => {
    expect(getPersonaForZone('src/checkout')).toBe('power_user');
    expect(getPersonaForZone('features/marketing')).toBe('newcomer');
    expect(getPersonaForZone('app/mobile')).toBe('mobile');
  });

  it('should handle case-insensitive matching', () => {
    expect(getPersonaForZone('CRITICAL')).toBe('power_user');
    expect(getPersonaForZone('Marketing')).toBe('newcomer');
  });

  it('should use custom mapping when provided', () => {
    const customMapping = {
      custom_zone: 'accessibility',
    };
    expect(getPersonaForZone('custom_zone', customMapping)).toBe('accessibility');
  });

  it('should override default with custom mapping', () => {
    const customMapping = {
      critical: 'newcomer', // Override default
    };
    expect(getPersonaForZone('critical', customMapping)).toBe('newcomer');
  });

  it('should fall back to defaults for unmapped zones in custom', () => {
    const customMapping = {
      custom: 'power_user',
    };
    // 'marketing' is not in custom, should use default
    expect(getPersonaForZone('marketing', customMapping)).toBe('newcomer');
  });
});

// =============================================================================
// resolveZoneWithPersona
// =============================================================================

describe('resolveZoneWithPersona', () => {
  it('should add defaultPersona to zone config', () => {
    // This test uses a simple path that won't have .sigilrc.yaml files
    const config = resolveZoneWithPersona('src/checkout/Button.tsx');

    // The zone will be extracted from the path
    expect(config.defaultPersona).toBeDefined();
  });

  it('should use custom mapping when provided', () => {
    const customMapping = {
      src: 'accessibility',
    };
    const config = resolveZoneWithPersona('src/components/Button.tsx', customMapping);

    // Should match 'src' from the path parts
    expect(config.defaultPersona).toBe('accessibility');
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe('Edge Cases', () => {
  it('should handle empty zone string', () => {
    expect(getPersonaForZone('')).toBe('newcomer');
  });

  it('should handle zone with multiple slashes', () => {
    expect(getPersonaForZone('src/features/checkout/components')).toBe('power_user');
  });

  it('should prefer earlier path parts over later ones', () => {
    // If path is 'checkout/marketing', checkout should win (first match)
    expect(getPersonaForZone('checkout/marketing')).toBe('power_user');
  });

  it('should handle zone with special characters', () => {
    expect(getPersonaForZone('src-checkout')).toBe('newcomer');
    expect(getPersonaForZone('src_checkout')).toBe('newcomer');
  });
});
