/**
 * @sigil-tier gold
 * Sigil v6.0 — Startup Sentinel
 *
 * Checks workshop freshness on startup and triggers rebuild when needed.
 * Runs before /craft to ensure workshop index is current.
 *
 * @module process/startup-sentinel
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  checkWorkshopStaleness,
  buildWorkshop,
  getPackageHash,
  getImportsHash,
  loadWorkshop,
  scanSanctuary,
} from './workshop-builder';
import {
  Workshop,
  WorkshopBuildResult,
  WorkshopStalenessResult,
} from '../types/workshop';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Result of startup sentinel check.
 */
export interface SentinelResult {
  /** Whether workshop was fresh (no rebuild needed) */
  fresh: boolean;
  /** Whether a rebuild was triggered */
  rebuilt: boolean;
  /** Whether fallback to JIT grep is needed */
  fallback: boolean;
  /** Reason for the decision */
  reason: string;
  /** Duration of the check/rebuild in ms */
  durationMs: number;
  /** Any warnings during the process */
  warnings: string[];
  /** Rebuild metrics (v6.1) */
  rebuildMetrics?: {
    materialCount: number;
    componentCount: number;
    rebuildDurationMs: number;
  };
}

/**
 * Options for the startup sentinel.
 */
export interface SentinelOptions {
  /** Project root directory */
  projectRoot: string;
  /** Path to workshop.json */
  workshopPath?: string;
  /** Path to lock file */
  lockPath?: string;
  /** Lock timeout in milliseconds */
  lockTimeout?: number;
  /** Whether to log decisions */
  verbose?: boolean;
}

/**
 * Quick rebuild options.
 */
export interface QuickRebuildOptions {
  /** Project root directory */
  projectRoot: string;
  /** What sections to rebuild */
  sections: ('materials' | 'components' | 'physics' | 'zones')[];
  /** Whether to update hashes */
  updateHashes?: boolean;
}

/**
 * Quick rebuild result.
 */
export interface QuickRebuildResult {
  /** Whether rebuild succeeded */
  success: boolean;
  /** Sections that were rebuilt */
  rebuiltSections: string[];
  /** Duration in milliseconds */
  durationMs: number;
  /** Any warnings */
  warnings: string[];
  /** Error if failed */
  error?: Error;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_LOCK_TIMEOUT = 30000; // 30 seconds
const STALE_LOCK_THRESHOLD = 60000; // 60 seconds - locks older than this are stale

// =============================================================================
// LOCK FILE HANDLING
// =============================================================================

/**
 * Acquire lock for workshop rebuild.
 * Returns true if lock acquired, false if already locked.
 */
export function acquireLock(lockPath: string, timeout: number = DEFAULT_LOCK_TIMEOUT): boolean {
  const lockDir = path.dirname(lockPath);

  // Ensure lock directory exists
  if (!fs.existsSync(lockDir)) {
    fs.mkdirSync(lockDir, { recursive: true });
  }

  // Check for existing lock
  if (fs.existsSync(lockPath)) {
    try {
      const lockContent = fs.readFileSync(lockPath, 'utf-8');
      const lockData = JSON.parse(lockContent);
      const lockTime = new Date(lockData.timestamp).getTime();
      const now = Date.now();

      // Check if lock is stale
      if (now - lockTime > STALE_LOCK_THRESHOLD) {
        // Stale lock - remove it
        fs.unlinkSync(lockPath);
      } else {
        // Active lock - cannot acquire
        return false;
      }
    } catch {
      // Corrupted lock - remove it
      try {
        fs.unlinkSync(lockPath);
      } catch {
        // Ignore removal errors
      }
    }
  }

  // Create lock file
  try {
    const lockData = {
      timestamp: new Date().toISOString(),
      pid: process.pid,
      timeout,
    };
    fs.writeFileSync(lockPath, JSON.stringify(lockData), { flag: 'wx' });
    return true;
  } catch {
    // Another process acquired the lock
    return false;
  }
}

/**
 * Release lock for workshop rebuild.
 */
export function releaseLock(lockPath: string): void {
  try {
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
    }
  } catch {
    // Ignore release errors
  }
}

/**
 * Check if lock file exists and is active.
 */
export function isLocked(lockPath: string): boolean {
  if (!fs.existsSync(lockPath)) {
    return false;
  }

  try {
    const lockContent = fs.readFileSync(lockPath, 'utf-8');
    const lockData = JSON.parse(lockContent);
    const lockTime = new Date(lockData.timestamp).getTime();
    const now = Date.now();

    // Lock is active if not stale
    return now - lockTime <= STALE_LOCK_THRESHOLD;
  } catch {
    return false;
  }
}

// =============================================================================
// QUICK REBUILD
// =============================================================================

/**
 * Perform a quick incremental rebuild of specific sections.
 */
export async function quickRebuild(options: QuickRebuildOptions): Promise<QuickRebuildResult> {
  const startTime = Date.now();
  const warnings: string[] = [];
  const rebuiltSections: string[] = [];
  const { projectRoot, sections, updateHashes = true } = options;

  try {
    // Load existing workshop
    const workshopPath = path.join(projectRoot, '.sigil', 'workshop.json');
    let workshop = loadWorkshop(workshopPath);

    // Rebuild requested sections
    if (sections.includes('materials')) {
      // Full materials rebuild - trigger full workshop build for materials
      const result = await buildWorkshop({ projectRoot });
      if (result.success) {
        workshop = loadWorkshop(workshopPath);
        rebuiltSections.push('materials');
      } else {
        warnings.push('Materials rebuild failed');
      }
    }

    if (sections.includes('components')) {
      // Rebuild components only
      const sanctuaryPath = path.join(projectRoot, 'src', 'sanctuary');
      const components = scanSanctuary(sanctuaryPath, projectRoot);
      workshop.components = components;
      rebuiltSections.push('components');
    }

    // Update hashes if requested
    if (updateHashes) {
      workshop.package_hash = getPackageHash(projectRoot);
      workshop.imports_hash = getImportsHash(projectRoot);
      workshop.indexed_at = new Date().toISOString();
    }

    // Write updated workshop
    const outputDir = path.dirname(workshopPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(workshopPath, JSON.stringify(workshop, null, 2));

    return {
      success: true,
      rebuiltSections,
      durationMs: Date.now() - startTime,
      warnings,
    };
  } catch (error) {
    return {
      success: false,
      rebuiltSections,
      durationMs: Date.now() - startTime,
      warnings,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

// =============================================================================
// STARTUP SENTINEL
// =============================================================================

/**
 * Run the startup sentinel check.
 * Checks workshop freshness and triggers rebuild if needed.
 */
export async function runSentinel(options: SentinelOptions): Promise<SentinelResult> {
  const startTime = Date.now();
  const warnings: string[] = [];
  const {
    projectRoot,
    workshopPath = path.join(projectRoot, '.sigil', 'workshop.json'),
    lockPath = path.join(projectRoot, '.sigil', 'workshop.lock'),
    lockTimeout = DEFAULT_LOCK_TIMEOUT,
    verbose = false,
  } = options;

  // Check staleness
  const staleness = checkWorkshopStaleness(projectRoot, workshopPath);

  if (!staleness.stale) {
    // Workshop is fresh - no rebuild needed
    if (verbose) {
      console.log('[Sentinel] Workshop is fresh, skipping rebuild');
    }
    return {
      fresh: true,
      rebuilt: false,
      fallback: false,
      reason: 'Workshop is current',
      durationMs: Date.now() - startTime,
      warnings,
    };
  }

  // Workshop is stale - need to rebuild
  if (verbose) {
    console.log(`[Sentinel] Workshop is stale: ${staleness.reason}`);
  }

  // Try to acquire lock
  if (!acquireLock(lockPath, lockTimeout)) {
    // Another process is rebuilding
    if (verbose) {
      console.log('[Sentinel] Another process is rebuilding, waiting...');
    }

    // Wait for lock to be released (with timeout)
    const waitStart = Date.now();
    while (isLocked(lockPath) && Date.now() - waitStart < lockTimeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Check if workshop is now fresh
    const recheck = checkWorkshopStaleness(projectRoot, workshopPath);
    if (!recheck.stale) {
      return {
        fresh: true,
        rebuilt: false,
        fallback: false,
        reason: 'Workshop rebuilt by another process',
        durationMs: Date.now() - startTime,
        warnings,
      };
    }

    // Still stale - fallback to JIT
    warnings.push('Lock timeout, falling back to JIT grep');
    return {
      fresh: false,
      rebuilt: false,
      fallback: true,
      reason: 'Lock timeout during rebuild wait',
      durationMs: Date.now() - startTime,
      warnings,
    };
  }

  try {
    // Perform rebuild based on staleness reason
    let rebuildResult: WorkshopBuildResult;

    if (staleness.reason === 'missing' || staleness.reason === 'corrupted') {
      // Full rebuild needed
      if (verbose) {
        console.log('[Sentinel] Performing full rebuild...');
      }
      rebuildResult = await buildWorkshop({ projectRoot });
    } else {
      // Incremental rebuild
      if (verbose) {
        console.log('[Sentinel] Performing incremental rebuild...');
      }

      const sections: ('materials' | 'components')[] = [];
      if (staleness.reason === 'package_changed' || staleness.reason === 'imports_changed') {
        sections.push('materials');
      }

      const quickResult = await quickRebuild({
        projectRoot,
        sections: sections.length > 0 ? sections : ['materials'],
      });

      rebuildResult = {
        success: quickResult.success,
        outputPath: path.join(projectRoot, '.sigil', 'workshop.json'),
        materialCount: 0,
        componentCount: 0,
        durationMs: quickResult.durationMs,
        warnings: quickResult.warnings,
        error: quickResult.error,
      };
    }

    if (rebuildResult.success) {
      if (verbose) {
        console.log(`[Sentinel] Rebuild complete in ${rebuildResult.durationMs}ms`);
      }
      return {
        fresh: true,
        rebuilt: true,
        fallback: false,
        reason: `Rebuilt due to ${staleness.reason}`,
        durationMs: Date.now() - startTime,
        warnings: rebuildResult.warnings,
        rebuildMetrics: {
          materialCount: rebuildResult.materialCount,
          componentCount: rebuildResult.componentCount,
          rebuildDurationMs: rebuildResult.durationMs,
        },
      };
    } else {
      // Rebuild failed - fallback to JIT
      warnings.push(`Rebuild failed: ${rebuildResult.error?.message || 'unknown error'}`);
      if (verbose) {
        console.log('[Sentinel] Rebuild failed, falling back to JIT grep');
      }
      return {
        fresh: false,
        rebuilt: false,
        fallback: true,
        reason: 'Rebuild failed',
        durationMs: Date.now() - startTime,
        warnings,
      };
    }
  } finally {
    // Always release lock
    releaseLock(lockPath);
  }
}

// =============================================================================
// INTEGRATION WITH /craft
// =============================================================================

/**
 * Ensure workshop is ready for /craft command.
 * Runs sentinel check and returns whether to use workshop or JIT grep.
 */
export async function ensureWorkshopReady(projectRoot: string): Promise<{
  useWorkshop: boolean;
  workshop: Workshop | null;
  fallbackReason?: string;
}> {
  const workshopPath = path.join(projectRoot, '.sigil', 'workshop.json');

  // Run sentinel check
  const result = await runSentinel({
    projectRoot,
    workshopPath,
    verbose: false,
  });

  if (result.fallback) {
    return {
      useWorkshop: false,
      workshop: null,
      fallbackReason: result.reason,
    };
  }

  // Load and return workshop
  try {
    const workshop = loadWorkshop(workshopPath);
    return {
      useWorkshop: true,
      workshop,
    };
  } catch {
    return {
      useWorkshop: false,
      workshop: null,
      fallbackReason: 'Failed to load workshop after rebuild',
    };
  }
}

/**
 * Log sentinel decision for debugging.
 */
export function logSentinelDecision(result: SentinelResult): void {
  const status = result.fresh ? '✓' : '✗';
  const action = result.rebuilt ? 'rebuilt' : result.fallback ? 'fallback' : 'skipped';
  console.log(`[Sentinel] ${status} Workshop ${action}: ${result.reason} (${result.durationMs}ms)`);

  if (result.warnings.length > 0) {
    result.warnings.forEach(w => console.log(`[Sentinel] ⚠ ${w}`));
  }
}
