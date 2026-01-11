// Sigil v2.0 — Integrity
// Lens classification and zone enforcement

import type { Lens, Zone, IntegrityFlags, LensClassification } from '../types';

// =============================================================================
// CLASSIFICATION
// =============================================================================

/**
 * Analyze lens permissions to determine classification
 */
export function classifyLens(lens: Lens): LensClassification {
  // Built-in lenses have explicit classification
  return lens.classification;
}

/**
 * Get full integrity flags for a lens
 */
export function getIntegrityFlags(lens: Lens): IntegrityFlags {
  const classification = classifyLens(lens);

  const permissions = getPermissionsForClassification(classification);
  const restrictions = getRestrictionsForClassification(classification);

  return {
    classification,
    permissions,
    restrictions,
  };
}

function getPermissionsForClassification(classification: LensClassification) {
  const base = {
    colors: true,
    typography: true,
    spacing: true,
    animations: true,
    icons: true,
  };

  switch (classification) {
    case 'cosmetic':
      return base;

    case 'utility':
      return {
        ...base,
        overlays: true,
        highlights: true,
        badges: true,
        tooltips: true,
      };

    case 'gameplay':
      return {
        ...base,
        overlays: true,
        highlights: true,
        badges: true,
        tooltips: true,
        inputHints: true,
        dataAugmentation: true,
        automation: true,
      };
  }
}

function getRestrictionsForClassification(classification: LensClassification) {
  return {
    criticalZones: classification !== 'cosmetic',
    financialFlow: classification === 'gameplay',
    competitiveMode: classification === 'gameplay',
  };
}

// =============================================================================
// ZONE ENFORCEMENT
// =============================================================================

/**
 * Check if a lens is allowed in a zone
 */
export function isLensAllowedInZone(lens: Lens, zone: Zone): boolean {
  const flags = getIntegrityFlags(lens);

  // Critical zone restrictions
  if (zone.type === 'critical' && flags.restrictions.criticalZones) {
    return false;
  }

  // Financial flow restrictions
  if (zone.financial && flags.restrictions.financialFlow) {
    return false;
  }

  // Competitive mode restrictions
  if (zone.competitive && flags.restrictions.competitiveMode) {
    return false;
  }

  return true;
}

/**
 * Get the reason a lens is restricted in a zone
 */
export function getLensRestrictionReason(lens: Lens, zone: Zone): string | null {
  const flags = getIntegrityFlags(lens);

  if (zone.type === 'critical' && flags.restrictions.criticalZones) {
    return `${lens.name} (${flags.classification}) is restricted in critical zones`;
  }

  if (zone.financial && flags.restrictions.financialFlow) {
    return `${lens.name} (${flags.classification}) is blocked in financial flows`;
  }

  if (zone.competitive && flags.restrictions.competitiveMode) {
    return `${lens.name} (${flags.classification}) is blocked in competitive mode`;
  }

  return null;
}

// =============================================================================
// ZONE HELPERS
// =============================================================================

/**
 * Create a zone configuration
 */
export function createZone(
  type: Zone['type'],
  options: Partial<Omit<Zone, 'type'>> = {}
): Zone {
  return {
    type,
    financial: options.financial ?? (type === 'critical'),
    competitive: options.competitive ?? false,
  };
}

/**
 * Check if a path matches a zone pattern
 */
export function matchesZonePath(path: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    // Convert glob pattern to regex
    const regex = new RegExp(
      '^' +
      pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\//g, '\\/') +
      '$'
    );
    return regex.test(path);
  });
}

// =============================================================================
// EXPORTS
// =============================================================================

export type { Zone, IntegrityFlags, LensClassification };
