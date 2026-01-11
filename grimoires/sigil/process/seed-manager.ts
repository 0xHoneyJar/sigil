/**
 * @sigil-tier gold
 * Sigil v6.0 — Seed Manager
 *
 * Manages virtual Sanctuary seeds for cold start projects.
 * Provides design context when no real components exist yet.
 *
 * @module process/seed-manager
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import {
  Seed,
  SeedId,
  VirtualComponent,
  VirtualComponentQueryResult,
  SEED_OPTIONS,
} from '../types/seed';
import { ComponentTier } from '../types/workshop';

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Default path for seed configuration.
 */
export const DEFAULT_SEED_PATH = 'grimoires/sigil/state/seed.yaml';

/**
 * Path to seed library.
 */
export const SEED_LIBRARY_PATH = '.claude/skills/seeding-sanctuary/seeds';

// =============================================================================
// SEED LOADING
// =============================================================================

/**
 * Load seed from grimoires/sigil/state/seed.yaml.
 */
export function loadSeed(projectRoot: string = process.cwd()): Seed | null {
  const seedPath = path.join(projectRoot, DEFAULT_SEED_PATH);

  if (!fs.existsSync(seedPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(seedPath, 'utf-8');
    return yaml.load(content) as Seed;
  } catch {
    return null;
  }
}

/**
 * Load seed from library by ID.
 */
export function loadSeedFromLibrary(
  seedId: SeedId,
  projectRoot: string = process.cwd()
): Seed | null {
  const libraryPath = path.join(projectRoot, SEED_LIBRARY_PATH, `${seedId}.yaml`);

  if (!fs.existsSync(libraryPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(libraryPath, 'utf-8');
    return yaml.load(content) as Seed;
  } catch {
    return null;
  }
}

/**
 * Save seed to grimoires/sigil/state/seed.yaml.
 */
export function saveSeed(seed: Seed, projectRoot: string = process.cwd()): boolean {
  const seedPath = path.join(projectRoot, DEFAULT_SEED_PATH);
  const sigilDir = path.dirname(seedPath);

  try {
    if (!fs.existsSync(sigilDir)) {
      fs.mkdirSync(sigilDir, { recursive: true });
    }
    fs.writeFileSync(seedPath, yaml.dump(seed), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

/**
 * Select and save a seed from the library.
 */
export function selectSeed(
  seedId: SeedId,
  projectRoot: string = process.cwd()
): boolean {
  const seed = loadSeedFromLibrary(seedId, projectRoot);
  if (!seed) {
    return false;
  }
  return saveSeed(seed, projectRoot);
}

// =============================================================================
// SANCTUARY DETECTION
// =============================================================================

/**
 * Check if Sanctuary is empty (no real components).
 */
export function isSanctuaryEmpty(projectRoot: string = process.cwd()): boolean {
  const sanctuaryPaths = [
    path.join(projectRoot, 'src/sanctuary'),
    path.join(projectRoot, 'src/components'),
  ];

  for (const sanctuaryPath of sanctuaryPaths) {
    if (fs.existsSync(sanctuaryPath)) {
      // Check for any .tsx files with @sigil-tier pragma
      const hasComponents = checkForSigilComponents(sanctuaryPath);
      if (hasComponents) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Recursively check for Sigil components.
 */
function checkForSigilComponents(dir: string): boolean {
  if (!fs.existsSync(dir)) {
    return false;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (checkForSigilComponents(fullPath)) {
        return true;
      }
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.includes('@sigil-tier')) {
          return true;
        }
      } catch {
        // Skip unreadable files
      }
    }
  }

  return false;
}

// =============================================================================
// VIRTUAL COMPONENT QUERIES
// =============================================================================

/**
 * In-memory cache for faded components.
 */
const fadedComponents = new Set<string>();

/**
 * Mark a virtual component as faded (real exists).
 */
export function markAsFaded(componentName: string): void {
  fadedComponents.add(componentName);
}

/**
 * Check if a virtual component is faded.
 */
export function isFaded(componentName: string): boolean {
  return fadedComponents.has(componentName);
}

/**
 * Clear faded components cache.
 */
export function clearFadedCache(): void {
  fadedComponents.clear();
}

/**
 * Query virtual component from seed.
 */
export function queryVirtualComponent(
  seed: Seed,
  componentName: string
): VirtualComponentQueryResult {
  const component = seed.virtual_components[componentName];

  if (!component) {
    return {
      found: false,
      data: null,
      source: 'seed',
      faded: false,
    };
  }

  const faded = isFaded(componentName);

  return {
    found: true,
    data: component,
    source: 'seed',
    faded,
  };
}

/**
 * Get all virtual components from seed.
 */
export function getAllVirtualComponents(
  seed: Seed,
  includeFaded: boolean = false
): Array<{ name: string; component: VirtualComponent }> {
  const components: Array<{ name: string; component: VirtualComponent }> = [];

  for (const [name, component] of Object.entries(seed.virtual_components)) {
    if (includeFaded || !isFaded(name)) {
      components.push({ name, component });
    }
  }

  return components;
}

/**
 * Find virtual components by tier.
 */
export function findVirtualByTier(
  seed: Seed,
  tier: ComponentTier
): string[] {
  return Object.entries(seed.virtual_components)
    .filter(([name, comp]) => comp.tier === tier && !isFaded(name))
    .map(([name]) => name);
}

/**
 * Find virtual components by zone.
 */
export function findVirtualByZone(
  seed: Seed,
  zone: string
): string[] {
  return Object.entries(seed.virtual_components)
    .filter(([name, comp]) => comp.zone === zone && !isFaded(name))
    .map(([name]) => name);
}

/**
 * Find virtual components by vocabulary.
 */
export function findVirtualByVocabulary(
  seed: Seed,
  term: string
): string[] {
  return Object.entries(seed.virtual_components)
    .filter(
      ([name, comp]) =>
        comp.vocabulary.some(v => v.toLowerCase().includes(term.toLowerCase())) &&
        !isFaded(name)
    )
    .map(([name]) => name);
}

// =============================================================================
// SEED METADATA
// =============================================================================

/**
 * Get physics profile for zone from seed.
 */
export function getSeedPhysics(seed: Seed, zone: string): string {
  switch (zone) {
    case 'critical':
      return seed.physics.critical;
    case 'marketing':
      return seed.physics.marketing;
    case 'admin':
      return seed.physics.admin || seed.physics.default;
    default:
      return seed.physics.default;
  }
}

/**
 * Get material color from seed.
 */
export function getSeedMaterial(
  seed: Seed,
  key: keyof typeof seed.materials
): string | undefined {
  return seed.materials[key];
}

/**
 * Get typography setting from seed.
 */
export function getSeedTypography(
  seed: Seed,
  key: keyof typeof seed.typography
): string | number | undefined {
  return seed.typography[key];
}

/**
 * Get spacing value from seed.
 */
export function getSeedSpacing(seed: Seed, index: number): number {
  if (index < 0 || index >= seed.spacing.scale.length) {
    return seed.spacing.scale[0];
  }
  return seed.spacing.scale[index];
}

// =============================================================================
// INTEGRATION
// =============================================================================

/**
 * Check if seed is needed and load it.
 */
export function ensureSeedContext(
  projectRoot: string = process.cwd()
): { useSeed: boolean; seed: Seed | null; reason?: string } {
  // Check if Sanctuary has real components
  if (!isSanctuaryEmpty(projectRoot)) {
    return { useSeed: false, seed: null, reason: 'Sanctuary has real components' };
  }

  // Try to load existing seed
  const seed = loadSeed(projectRoot);
  if (seed) {
    return { useSeed: true, seed };
  }

  // No seed selected yet
  return { useSeed: false, seed: null, reason: 'No seed selected' };
}

// =============================================================================
// HARD EVICTION (v6.1)
// =============================================================================

/**
 * Evicted seed state.
 */
export interface EvictedSeed extends Seed {
  /** Eviction status */
  status: 'evicted';
  /** When eviction occurred */
  evicted_at: string;
  /** Original component count before eviction */
  original_component_count: number;
}

/**
 * Load seed with hard eviction.
 * v6.1: If ANY real component exists, ALL virtual components are deleted.
 *
 * @param projectRoot - Project root directory
 * @returns Seed (possibly evicted) or null
 */
export function loadSeedWithEviction(
  projectRoot: string = process.cwd()
): Seed | EvictedSeed | null {
  const seed = loadSeed(projectRoot);
  if (!seed) {
    return null;
  }

  // Check if Sanctuary has real components
  const hasRealComponents = !isSanctuaryEmpty(projectRoot);

  if (hasRealComponents) {
    // v6.1: Hard eviction - delete ALL virtual components
    const originalCount = Object.keys(seed.virtual_components).length;

    const evictedSeed: EvictedSeed = {
      ...seed,
      virtual_components: {}, // Hard delete all virtual
      status: 'evicted',
      evicted_at: new Date().toISOString(),
      original_component_count: originalCount,
    };

    console.log(
      `[Sigil] Virtual Sanctuary evicted: ${originalCount} virtual components removed (real components exist)`
    );

    // Persist evicted state
    saveSeed(evictedSeed, projectRoot);

    return evictedSeed;
  }

  return seed;
}

/**
 * Check if seed has been evicted.
 */
export function isSeedEvicted(seed: Seed | EvictedSeed): seed is EvictedSeed {
  return 'status' in seed && seed.status === 'evicted';
}

/**
 * Query virtual component with eviction check.
 * v6.1: Returns null if seed is evicted (no ghost components).
 */
export function queryVirtualComponentWithEviction(
  projectRoot: string = process.cwd(),
  componentName: string
): VirtualComponentQueryResult {
  const seed = loadSeedWithEviction(projectRoot);

  if (!seed) {
    return {
      found: false,
      data: null,
      source: 'seed',
      faded: false,
    };
  }

  // If evicted, no virtual components available
  if (isSeedEvicted(seed)) {
    return {
      found: false,
      data: null,
      source: 'seed',
      faded: true, // Mark as faded to indicate eviction
    };
  }

  return queryVirtualComponent(seed, componentName);
}

/**
 * Reset seed from template.
 * Restores virtual components from seed library.
 *
 * @param seedId - Seed ID to reset to
 * @param projectRoot - Project root directory
 * @param force - Force reset even if real components exist
 * @returns Whether reset succeeded
 */
export function resetSeed(
  seedId: SeedId,
  projectRoot: string = process.cwd(),
  force: boolean = false
): { success: boolean; warning?: string } {
  // Check for real components
  if (!force && !isSanctuaryEmpty(projectRoot)) {
    return {
      success: false,
      warning: 'Real components exist. Use --force to reset anyway.',
    };
  }

  // Load seed from library
  const seed = loadSeedFromLibrary(seedId, projectRoot);
  if (!seed) {
    return {
      success: false,
      warning: `Seed '${seedId}' not found in library.`,
    };
  }

  // Clear eviction state if present
  if ('status' in seed) {
    delete (seed as Record<string, unknown>).status;
    delete (seed as Record<string, unknown>).evicted_at;
    delete (seed as Record<string, unknown>).original_component_count;
  }

  // Save seed
  const saved = saveSeed(seed, projectRoot);
  if (!saved) {
    return {
      success: false,
      warning: 'Failed to save seed.',
    };
  }

  // Clear faded cache
  clearFadedCache();

  console.log(`[Sigil] Seed reset to '${seedId}' with ${Object.keys(seed.virtual_components).length} virtual components`);

  return { success: true };
}

/**
 * Get eviction status for reporting.
 */
export function getEvictionStatus(
  projectRoot: string = process.cwd()
): { evicted: boolean; originalCount?: number; evictedAt?: string } {
  const seed = loadSeed(projectRoot);
  if (!seed) {
    return { evicted: false };
  }

  if (isSeedEvicted(seed as Seed | EvictedSeed)) {
    const evictedSeed = seed as EvictedSeed;
    return {
      evicted: true,
      originalCount: evictedSeed.original_component_count,
      evictedAt: evictedSeed.evicted_at,
    };
  }

  return { evicted: false };
}

/**
 * Get available seed options for selection UI.
 */
export function getSeedOptions(): typeof SEED_OPTIONS {
  return SEED_OPTIONS;
}
