import { describe, it, expect } from 'vitest';
import { getZoneForPath, getMaterialForPath, DEFAULT_CONFIG } from './config.js';

describe('getZoneForPath', () => {
  it('should match checkout paths to critical zone', () => {
    const zone = getZoneForPath(DEFAULT_CONFIG, 'src/features/checkout/Button.tsx');
    expect(zone).not.toBeNull();
    expect(zone?.name).toBe('critical');
    expect(zone?.material).toBe('clay');
  });

  it('should match dashboard paths to transactional zone', () => {
    const zone = getZoneForPath(DEFAULT_CONFIG, 'src/features/dashboard/Panel.tsx');
    expect(zone).not.toBeNull();
    expect(zone?.name).toBe('transactional');
    expect(zone?.material).toBe('machinery');
  });

  it('should match discovery paths to exploratory zone', () => {
    const zone = getZoneForPath(DEFAULT_CONFIG, 'src/features/discovery/Card.tsx');
    expect(zone).not.toBeNull();
    expect(zone?.name).toBe('exploratory');
    expect(zone?.material).toBe('glass');
  });

  it('should return null for unmatched paths', () => {
    const zone = getZoneForPath(DEFAULT_CONFIG, 'src/utils/helpers.ts');
    expect(zone).toBeNull();
  });
});

describe('getMaterialForPath', () => {
  it('should return clay for checkout paths', () => {
    const material = getMaterialForPath(
      DEFAULT_CONFIG,
      'src/features/checkout/Form.tsx'
    );
    expect(material).toBe('clay');
  });

  it('should return machinery for dashboard paths', () => {
    const material = getMaterialForPath(
      DEFAULT_CONFIG,
      'src/features/dashboard/Table.tsx'
    );
    expect(material).toBe('machinery');
  });

  it('should return clay (default) for unmatched paths', () => {
    const material = getMaterialForPath(DEFAULT_CONFIG, 'src/random/file.ts');
    expect(material).toBe('clay');
  });
});
