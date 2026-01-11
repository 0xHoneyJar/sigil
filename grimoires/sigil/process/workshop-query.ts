/**
 * @sigil-tier gold
 * Sigil v6.0 — Workshop Query API
 *
 * Fast lookups from pre-computed workshop index with fallback support.
 * Performance target: <5ms for cached queries, <50ms for fallback.
 *
 * @module process/workshop-query
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import {
  Workshop,
  MaterialEntry,
  ComponentEntry,
  PhysicsDefinition,
  ZoneDefinition,
  WorkshopSource,
  WorkshopQueryResult,
} from '../types/workshop';
import { loadWorkshop, extractExportsFromDts, extractSignaturesFromDts, extractComponent } from './workshop-builder';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Query options.
 */
export interface QueryOptions {
  /** Enable fallback to node_modules */
  enableFallback?: boolean;
  /** Project root for fallback resolution */
  projectRoot?: string;
  /** Log fallback decisions */
  verbose?: boolean;
}

// =============================================================================
// IN-MEMORY CACHE
// =============================================================================

/**
 * Session cache for fallback results.
 */
const fallbackCache = new Map<string, MaterialEntry>();

/**
 * Clear the fallback cache.
 */
export function clearQueryCache(): void {
  fallbackCache.clear();
}

// =============================================================================
// MATERIAL QUERY WITH FALLBACK
// =============================================================================

/**
 * Query material with optional fallback to node_modules.
 * Performance: <5ms workshop, <50ms fallback.
 */
export function queryMaterialWithFallback(
  workshop: Workshop,
  name: string,
  options: QueryOptions = {}
): WorkshopQueryResult<MaterialEntry> {
  const { enableFallback = true, projectRoot = process.cwd(), verbose = false } = options;

  // Try workshop first
  const material = workshop.materials[name];
  if (material) {
    return {
      found: true,
      data: material,
      source: 'workshop',
    };
  }

  // Check fallback cache
  const cached = fallbackCache.get(name);
  if (cached) {
    return {
      found: true,
      data: cached,
      source: 'fallback',
    };
  }

  // Try fallback if enabled
  if (enableFallback) {
    const fallbackResult = readMaterialFromNodeModules(name, projectRoot);
    if (fallbackResult) {
      if (verbose) {
        console.log(`[Query] Fallback to node_modules for: ${name}`);
      }
      fallbackCache.set(name, fallbackResult);
      return {
        found: true,
        data: fallbackResult,
        source: 'fallback',
      };
    }
  }

  return {
    found: false,
    data: null,
    source: 'fallback',
  };
}

/**
 * Read material directly from node_modules.
 */
function readMaterialFromNodeModules(
  packageName: string,
  projectRoot: string
): MaterialEntry | null {
  const packagePath = path.join(projectRoot, 'node_modules', packageName);
  const packageJsonPath = path.join(packagePath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const version = packageJson.version || 'unknown';

    // Find types file
    let typesPath = '';
    if (packageJson.types) {
      typesPath = path.join(packagePath, packageJson.types);
    } else if (packageJson.typings) {
      typesPath = path.join(packagePath, packageJson.typings);
    } else {
      const tryPaths = [
        path.join(packagePath, 'dist', 'index.d.ts'),
        path.join(packagePath, 'index.d.ts'),
      ];
      for (const tryPath of tryPaths) {
        if (fs.existsSync(tryPath)) {
          typesPath = tryPath;
          break;
        }
      }
    }

    const types_available = typesPath && fs.existsSync(typesPath);
    const exports = types_available ? extractExportsFromDts(typesPath) : [];
    const signatures = types_available ? extractSignaturesFromDts(typesPath, 10) : undefined;
    const readme_available = fs.existsSync(path.join(packagePath, 'README.md'));

    return {
      version,
      exports,
      types_available,
      readme_available,
      signatures: Object.keys(signatures || {}).length > 0 ? signatures : undefined,
    };
  } catch {
    return null;
  }
}

// =============================================================================
// COMPONENT QUERY
// =============================================================================

/**
 * Query component from workshop.
 * Performance: <5ms.
 */
export function queryComponentWithSource(
  workshop: Workshop,
  name: string
): WorkshopQueryResult<ComponentEntry> {
  const component = workshop.components[name];
  if (component) {
    return {
      found: true,
      data: component,
      source: 'workshop',
    };
  }

  return {
    found: false,
    data: null,
    source: 'workshop',
  };
}

// =============================================================================
// VERIFY-ON-READ COMPONENT QUERY (v6.1)
// =============================================================================

/**
 * Result from a verified component query.
 */
export interface VerifiedComponentResult {
  /** Query result */
  result: WorkshopQueryResult<ComponentEntry>;
  /** Whether verification passed */
  verified: boolean;
  /** Whether component was reindexed */
  reindexed: boolean;
  /** Whether component was removed (file deleted) */
  removed: boolean;
  /** Verification latency in ms */
  verifyMs: number;
}

/**
 * Query component with filesystem verification.
 * Checks that cached component matches actual file state.
 * Performance: <6ms (5ms lookup + 1ms stat/hash)
 *
 * @param workshop - Workshop instance (mutable for updates)
 * @param name - Component name to query
 * @param projectRoot - Project root for file resolution
 * @returns VerifiedComponentResult with verification status
 */
export function queryComponentVerified(
  workshop: Workshop,
  name: string,
  projectRoot: string = process.cwd()
): VerifiedComponentResult {
  const startTime = performance.now();
  const component = workshop.components[name];

  // Component not in workshop
  if (!component) {
    return {
      result: { found: false, data: null, source: 'workshop' },
      verified: true,
      reindexed: false,
      removed: false,
      verifyMs: performance.now() - startTime,
    };
  }

  // Resolve full path
  const fullPath = path.join(projectRoot, component.path);

  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    // File was deleted - remove from workshop
    delete workshop.components[name];
    return {
      result: { found: false, data: null, source: 'workshop' },
      verified: true,
      reindexed: false,
      removed: true,
      verifyMs: performance.now() - startTime,
    };
  }

  // Fast path: check mtime if hash is available
  if (component.hash && component.indexed_at) {
    try {
      const stats = fs.statSync(fullPath);
      const indexedAt = new Date(component.indexed_at).getTime();
      const modifiedAt = stats.mtime.getTime();

      // File hasn't been modified since indexing
      if (modifiedAt <= indexedAt) {
        return {
          result: { found: true, data: component, source: 'workshop' },
          verified: true,
          reindexed: false,
          removed: false,
          verifyMs: performance.now() - startTime,
        };
      }

      // File was modified - verify hash
      const content = fs.readFileSync(fullPath, 'utf-8');
      const currentHash = crypto.createHash('md5').update(content).digest('hex');

      if (currentHash === component.hash) {
        // Hash still matches despite mtime - update indexed_at
        component.indexed_at = new Date().toISOString();
        return {
          result: { found: true, data: component, source: 'workshop' },
          verified: true,
          reindexed: false,
          removed: false,
          verifyMs: performance.now() - startTime,
        };
      }

      // Hash mismatch - reindex component
      const reindexed = extractComponent(fullPath, projectRoot);
      if (reindexed) {
        workshop.components[name] = reindexed;
        return {
          result: { found: true, data: reindexed, source: 'workshop' },
          verified: true,
          reindexed: true,
          removed: false,
          verifyMs: performance.now() - startTime,
        };
      } else {
        // Component no longer has @sigil-tier pragma - remove
        delete workshop.components[name];
        return {
          result: { found: false, data: null, source: 'workshop' },
          verified: true,
          reindexed: false,
          removed: true,
          verifyMs: performance.now() - startTime,
        };
      }
    } catch {
      // Verification failed - return cached (best effort)
      return {
        result: { found: true, data: component, source: 'workshop' },
        verified: false,
        reindexed: false,
        removed: false,
        verifyMs: performance.now() - startTime,
      };
    }
  }

  // No hash available (legacy entry) - return cached
  return {
    result: { found: true, data: component, source: 'workshop' },
    verified: false,
    reindexed: false,
    removed: false,
    verifyMs: performance.now() - startTime,
  };
}

/**
 * Query multiple components with verification.
 */
export function queryComponentsVerified(
  workshop: Workshop,
  names: string[],
  projectRoot: string = process.cwd()
): Map<string, VerifiedComponentResult> {
  const results = new Map<string, VerifiedComponentResult>();
  for (const name of names) {
    results.set(name, queryComponentVerified(workshop, name, projectRoot));
  }
  return results;
}

// =============================================================================
// PHYSICS QUERY
// =============================================================================

/**
 * Query physics from workshop.
 * Performance: <5ms.
 */
export function queryPhysicsWithSource(
  workshop: Workshop,
  name: string
): WorkshopQueryResult<PhysicsDefinition> {
  const physics = workshop.physics[name];
  if (physics) {
    return {
      found: true,
      data: physics,
      source: 'workshop',
    };
  }

  return {
    found: false,
    data: null,
    source: 'workshop',
  };
}

// =============================================================================
// ZONE QUERY
// =============================================================================

/**
 * Query zone from workshop.
 * Performance: <5ms.
 */
export function queryZoneWithSource(
  workshop: Workshop,
  name: string
): WorkshopQueryResult<ZoneDefinition> {
  const zone = workshop.zones[name];
  if (zone) {
    return {
      found: true,
      data: zone,
      source: 'workshop',
    };
  }

  return {
    found: false,
    data: null,
    source: 'workshop',
  };
}

// =============================================================================
// BATCH QUERIES
// =============================================================================

/**
 * Query multiple materials at once.
 */
export function queryMaterials(
  workshop: Workshop,
  names: string[],
  options: QueryOptions = {}
): Map<string, WorkshopQueryResult<MaterialEntry>> {
  const results = new Map<string, WorkshopQueryResult<MaterialEntry>>();
  for (const name of names) {
    results.set(name, queryMaterialWithFallback(workshop, name, options));
  }
  return results;
}

/**
 * Query multiple components at once.
 */
export function queryComponents(
  workshop: Workshop,
  names: string[]
): Map<string, WorkshopQueryResult<ComponentEntry>> {
  const results = new Map<string, WorkshopQueryResult<ComponentEntry>>();
  for (const name of names) {
    results.set(name, queryComponentWithSource(workshop, name));
  }
  return results;
}

// =============================================================================
// WORKSHOP LOADER WITH QUERY API
// =============================================================================

/**
 * Load workshop and prepare query API.
 */
export interface WorkshopQueryAPI {
  workshop: Workshop;
  material: (name: string) => WorkshopQueryResult<MaterialEntry>;
  component: (name: string) => WorkshopQueryResult<ComponentEntry>;
  physics: (name: string) => WorkshopQueryResult<PhysicsDefinition>;
  zone: (name: string) => WorkshopQueryResult<ZoneDefinition>;
}

/**
 * Create a query API for a workshop.
 */
export function createQueryAPI(
  workshop: Workshop,
  options: QueryOptions = {}
): WorkshopQueryAPI {
  return {
    workshop,
    material: (name: string) => queryMaterialWithFallback(workshop, name, options),
    component: (name: string) => queryComponentWithSource(workshop, name),
    physics: (name: string) => queryPhysicsWithSource(workshop, name),
    zone: (name: string) => queryZoneWithSource(workshop, name),
  };
}

/**
 * Load workshop and create query API.
 */
export function loadWorkshopWithQueryAPI(
  workshopPath: string,
  options: QueryOptions = {}
): WorkshopQueryAPI | null {
  try {
    const workshop = loadWorkshop(workshopPath);
    if (!workshop.indexed_at) {
      return null;
    }
    return createQueryAPI(workshop, options);
  } catch {
    return null;
  }
}
