/**
 * @sigil-tier gold
 * Sigil v6.0 — Sanctuary Scanner
 *
 * Discovery functions for finding components in the Sanctuary.
 * Uses ripgrep for fast pragma-based search with workshop fallback.
 *
 * @module process/sanctuary-scanner
 */

import { execSync } from 'child_process';
import * as path from 'path';
import {
  Workshop,
  ComponentEntry,
  ComponentTier,
} from '../types/workshop';
import { loadWorkshop } from './workshop-builder';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Search result from sanctuary scan.
 */
export interface ScanResult {
  /** File path relative to project root */
  path: string;
  /** Component tier if found */
  tier?: ComponentTier;
  /** Zone assignment if found */
  zone?: string;
  /** Physics assignment if found */
  physics?: string;
  /** Vocabulary terms if found */
  vocabulary?: string[];
}

/**
 * Options for sanctuary scan.
 */
export interface ScanOptions {
  /** Project root directory */
  projectRoot?: string;
  /** Search directory (default: src/sanctuary) */
  searchPath?: string;
  /** Whether to use workshop cache */
  useWorkshop?: boolean;
  /** Workshop instance to use */
  workshop?: Workshop;
}

// =============================================================================
// RIPGREP SEARCH FUNCTIONS
// =============================================================================

/**
 * Execute ripgrep search and return matching files.
 */
function ripgrepSearch(pattern: string, searchPath: string): string[] {
  try {
    const result = execSync(`rg "${pattern}" "${searchPath}" -l --no-messages`, {
      encoding: 'utf-8',
      timeout: 5000,
    });
    return result
      .trim()
      .split('\n')
      .filter(line => line.length > 0);
  } catch {
    // ripgrep returns non-zero if no matches
    return [];
  }
}

/**
 * Find components by tier using ripgrep.
 * Performance target: <50ms
 */
export function findByTier(
  tier: ComponentTier,
  options: ScanOptions = {}
): string[] {
  const { projectRoot = process.cwd(), searchPath = 'src/sanctuary', useWorkshop = true, workshop } = options;

  // Try workshop first
  if (useWorkshop) {
    const ws = workshop || loadWorkshop(path.join(projectRoot, '.sigil', 'workshop.json'));
    if (Object.keys(ws.components).length > 0) {
      return Object.entries(ws.components)
        .filter(([_, entry]) => entry.tier === tier)
        .map(([_, entry]) => entry.path);
    }
  }

  // Fall back to ripgrep
  const fullPath = path.join(projectRoot, searchPath);
  return ripgrepSearch(`@sigil-tier ${tier}`, fullPath);
}

/**
 * Find components by zone using ripgrep.
 * Performance target: <50ms
 */
export function findByZone(
  zone: string,
  options: ScanOptions = {}
): string[] {
  const { projectRoot = process.cwd(), searchPath = 'src', useWorkshop = true, workshop } = options;

  // Try workshop first
  if (useWorkshop) {
    const ws = workshop || loadWorkshop(path.join(projectRoot, '.sigil', 'workshop.json'));
    if (Object.keys(ws.components).length > 0) {
      return Object.entries(ws.components)
        .filter(([_, entry]) => entry.zone === zone)
        .map(([_, entry]) => entry.path);
    }
  }

  // Fall back to ripgrep
  const fullPath = path.join(projectRoot, searchPath);
  return ripgrepSearch(`@sigil-zone ${zone}`, fullPath);
}

/**
 * Find components by physics using ripgrep.
 * Performance target: <50ms
 */
export function findByPhysics(
  physics: string,
  options: ScanOptions = {}
): string[] {
  const { projectRoot = process.cwd(), searchPath = 'src', useWorkshop = true, workshop } = options;

  // Try workshop first
  if (useWorkshop) {
    const ws = workshop || loadWorkshop(path.join(projectRoot, '.sigil', 'workshop.json'));
    if (Object.keys(ws.components).length > 0) {
      return Object.entries(ws.components)
        .filter(([_, entry]) => entry.physics === physics)
        .map(([_, entry]) => entry.path);
    }
  }

  // Fall back to ripgrep
  const fullPath = path.join(projectRoot, searchPath);
  return ripgrepSearch(`@sigil-physics ${physics}`, fullPath);
}

/**
 * Find components by vocabulary term.
 * Performance target: <50ms
 */
export function findByVocabulary(
  term: string,
  options: ScanOptions = {}
): string[] {
  const { projectRoot = process.cwd(), searchPath = 'src', useWorkshop = true, workshop } = options;

  // Try workshop first
  if (useWorkshop) {
    const ws = workshop || loadWorkshop(path.join(projectRoot, '.sigil', 'workshop.json'));
    if (Object.keys(ws.components).length > 0) {
      return Object.entries(ws.components)
        .filter(([_, entry]) => entry.vocabulary?.includes(term))
        .map(([_, entry]) => entry.path);
    }
  }

  // Fall back to ripgrep
  const fullPath = path.join(projectRoot, searchPath);
  return ripgrepSearch(`@sigil-vocabulary.*${term}`, fullPath);
}

// =============================================================================
// COMBINED SEARCH
// =============================================================================

/**
 * Find components matching multiple criteria.
 */
export function findComponents(
  criteria: {
    tier?: ComponentTier;
    zone?: string;
    physics?: string;
    vocabulary?: string;
  },
  options: ScanOptions = {}
): string[] {
  const { projectRoot = process.cwd(), useWorkshop = true, workshop } = options;

  // Use workshop for combined search
  if (useWorkshop) {
    const ws = workshop || loadWorkshop(path.join(projectRoot, '.sigil', 'workshop.json'));
    if (Object.keys(ws.components).length > 0) {
      return Object.entries(ws.components)
        .filter(([_, entry]) => {
          if (criteria.tier && entry.tier !== criteria.tier) return false;
          if (criteria.zone && entry.zone !== criteria.zone) return false;
          if (criteria.physics && entry.physics !== criteria.physics) return false;
          if (criteria.vocabulary && !entry.vocabulary?.includes(criteria.vocabulary)) return false;
          return true;
        })
        .map(([_, entry]) => entry.path);
    }
  }

  // Fall back to individual ripgrep searches and intersect results
  let results: Set<string> | null = null;

  if (criteria.tier) {
    const tierResults = new Set(findByTier(criteria.tier, { ...options, useWorkshop: false }));
    results = results ? new Set([...results].filter(x => tierResults.has(x))) : tierResults;
  }

  if (criteria.zone) {
    const zoneResults = new Set(findByZone(criteria.zone, { ...options, useWorkshop: false }));
    results = results ? new Set([...results].filter(x => zoneResults.has(x))) : zoneResults;
  }

  if (criteria.physics) {
    const physicsResults = new Set(findByPhysics(criteria.physics, { ...options, useWorkshop: false }));
    results = results ? new Set([...results].filter(x => physicsResults.has(x))) : physicsResults;
  }

  if (criteria.vocabulary) {
    const vocabResults = new Set(findByVocabulary(criteria.vocabulary, { ...options, useWorkshop: false }));
    results = results ? new Set([...results].filter(x => vocabResults.has(x))) : vocabResults;
  }

  return results ? [...results] : [];
}

// =============================================================================
// COMPONENT DETAILS
// =============================================================================

/**
 * Get full component entry from workshop or parse from file.
 */
export function getComponentDetails(
  componentPath: string,
  options: ScanOptions = {}
): ComponentEntry | null {
  const { projectRoot = process.cwd(), useWorkshop = true, workshop } = options;

  // Try workshop first
  if (useWorkshop) {
    const ws = workshop || loadWorkshop(path.join(projectRoot, '.sigil', 'workshop.json'));
    const entry = Object.values(ws.components).find(c => c.path === componentPath);
    if (entry) return entry;
  }

  // Component not in workshop
  return null;
}

/**
 * List all components in the sanctuary.
 */
export function listAllComponents(
  options: ScanOptions = {}
): ComponentEntry[] {
  const { projectRoot = process.cwd(), useWorkshop = true, workshop } = options;

  // Use workshop
  if (useWorkshop) {
    const ws = workshop || loadWorkshop(path.join(projectRoot, '.sigil', 'workshop.json'));
    return Object.values(ws.components);
  }

  return [];
}

/**
 * Get component count by tier.
 */
export function getComponentStats(
  options: ScanOptions = {}
): Record<ComponentTier, number> {
  const { projectRoot = process.cwd(), useWorkshop = true, workshop } = options;

  const stats: Record<ComponentTier, number> = {
    gold: 0,
    silver: 0,
    bronze: 0,
    draft: 0,
  };

  if (useWorkshop) {
    const ws = workshop || loadWorkshop(path.join(projectRoot, '.sigil', 'workshop.json'));
    for (const entry of Object.values(ws.components)) {
      stats[entry.tier]++;
    }
  }

  return stats;
}
