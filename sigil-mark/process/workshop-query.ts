/**
 * @sigil-tier gold
 * Sigil v6.0 — Workshop Query API
 *
 * Fast lookups from pre-computed workshop index with fallback support.
 * Performance target: <5ms for cached queries, <50ms for fallback.
 *
 * @module process/workshop-query
 */

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
import { loadWorkshop, extractExportsFromDts, extractSignaturesFromDts } from './workshop-builder';

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
