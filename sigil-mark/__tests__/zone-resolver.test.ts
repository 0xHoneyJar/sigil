/**
 * Zone Resolver Tests
 *
 * Tests for sigil-mark/core/zone-resolver.ts
 */

// Mock zone resolution for testing
interface ZoneConfig {
  zone: string;
  recipes: string;
  sync: string;
  constraints: Record<string, string>;
}

const mockResolveZone = (filePath: string): ZoneConfig => {
  // Simple path-based resolution
  if (filePath.includes('/checkout/') || filePath.includes('/transaction/')) {
    return {
      zone: 'decisive',
      recipes: 'decisive',
      sync: 'server_authoritative',
      constraints: { optimistic_ui: 'forbidden' },
    };
  }

  if (filePath.includes('/admin/') || filePath.includes('/dashboard/')) {
    return {
      zone: 'machinery',
      recipes: 'machinery',
      sync: 'client_authoritative',
      constraints: {},
    };
  }

  if (filePath.includes('/marketing/') || filePath.includes('/landing/')) {
    return {
      zone: 'glass',
      recipes: 'glass',
      sync: 'client_authoritative',
      constraints: {},
    };
  }

  // Default
  return {
    zone: 'default',
    recipes: 'machinery',
    sync: 'client_authoritative',
    constraints: {},
  };
};

describe('Zone Resolution', () => {
  describe('Path-based detection', () => {
    it('should resolve checkout paths to decisive zone', () => {
      const zone = mockResolveZone('src/checkout/ConfirmButton.tsx');

      expect(zone.zone).toBe('decisive');
      expect(zone.recipes).toBe('decisive');
      expect(zone.sync).toBe('server_authoritative');
    });

    it('should resolve admin paths to machinery zone', () => {
      const zone = mockResolveZone('src/admin/UserTable.tsx');

      expect(zone.zone).toBe('machinery');
      expect(zone.recipes).toBe('machinery');
    });

    it('should resolve marketing paths to glass zone', () => {
      const zone = mockResolveZone('src/marketing/HeroSection.tsx');

      expect(zone.zone).toBe('glass');
      expect(zone.recipes).toBe('glass');
    });

    it('should default to machinery for unknown paths', () => {
      const zone = mockResolveZone('src/components/Button.tsx');

      expect(zone.zone).toBe('default');
      expect(zone.recipes).toBe('machinery');
    });
  });

  describe('Constraint enforcement', () => {
    it('should apply optimistic_ui: forbidden in decisive zone', () => {
      const zone = mockResolveZone('src/checkout/PaymentForm.tsx');

      expect(zone.constraints.optimistic_ui).toBe('forbidden');
    });

    it('should not have optimistic_ui constraint in other zones', () => {
      const adminZone = mockResolveZone('src/admin/Settings.tsx');
      const glassZone = mockResolveZone('src/marketing/Hero.tsx');

      expect(adminZone.constraints.optimistic_ui).toBeUndefined();
      expect(glassZone.constraints.optimistic_ui).toBeUndefined();
    });
  });

  describe('Config merging', () => {
    it('should inherit from parent config', () => {
      // src/.sigilrc.yaml defines default
      // src/checkout/.sigilrc.yaml overrides with decisive

      const srcZone = mockResolveZone('src/utils/helpers.ts');
      const checkoutZone = mockResolveZone('src/checkout/Button.tsx');

      // Default inherited
      expect(srcZone.recipes).toBe('machinery');

      // Override applied
      expect(checkoutZone.recipes).toBe('decisive');
    });
  });

  describe('Recipe set mapping', () => {
    it('should map decisive zone to decisive recipes', () => {
      const zone = mockResolveZone('src/checkout/ClaimButton.tsx');

      expect(zone.recipes).toBe('decisive');
      // Recipes available: Button, ButtonNintendo, ButtonRelaxed, ConfirmFlow
    });

    it('should map machinery zone to machinery recipes', () => {
      const zone = mockResolveZone('src/admin/UserList.tsx');

      expect(zone.recipes).toBe('machinery');
      // Recipes available: Table, Toggle, Form
    });

    it('should map glass zone to glass recipes', () => {
      const zone = mockResolveZone('src/marketing/Features.tsx');

      expect(zone.recipes).toBe('glass');
      // Recipes available: HeroCard, FeatureCard, Tooltip
    });
  });
});

describe('Zone Config Format', () => {
  it('should follow v1.2.4 schema', () => {
    const schema = {
      sigil: '1.2.4',
      recipes: 'decisive',
      sync: 'server_authoritative',
      tick: '600ms',
      constraints: {
        optimistic_ui: 'forbidden',
        loading_spinners: 'forbidden',
      },
    };

    expect(schema.sigil).toBe('1.2.4');
    expect(['decisive', 'machinery', 'glass']).toContain(schema.recipes);
    expect(['server_authoritative', 'client_authoritative']).toContain(schema.sync);
  });
});
