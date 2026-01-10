/**
 * Sigil v7.6 - Survival Engine
 *
 * Auto-promote/demote components based on survival criteria + cleanliness.
 * Replaces nomination PRs with automatic promotion + veto window.
 *
 * "Stop asking for permission to be great. If the code survives and is clean, it is Gold."
 *
 * @sigil-tier gold
 * @sigil-zone machinery
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  getTier,
  getComponentsInTier,
  moveComponent,
  Tier,
} from './filesystem-registry';
import { canPromote, runLinterGate, formatReport } from './linter-gate';

// ============================================================================
// Types
// ============================================================================

export interface SurvivalStats {
  version: number;
  lastUpdated: string;
  components: Record<string, ComponentStats>;
  pendingPromotions: PendingPromotion[];
  recentDemotions: Demotion[];
}

export interface ComponentStats {
  tier: Tier;
  goldImports: number;
  lastModified: string;
  stabilityWeeks: number;
  mutinies: number;
  promotionEligible: boolean;
  linterGatePassed: boolean;
}

export interface PendingPromotion {
  componentName: string;
  fromTier: Tier;
  toTier: Tier;
  requestedAt: string;
  vetoDeadline: string;
  vetoedBy: string | null;
}

export interface Demotion {
  componentName: string;
  fromTier: Tier;
  toTier: Tier;
  demotedAt: string;
  reason: string;
}

export interface SurvivalCriteria {
  minGoldImports: number;
  minStabilityWeeks: number;
  maxMutinies: number;
}

export type TriggerType = 'push' | 'scheduled' | 'manual';

export interface SurvivalEngineResult {
  trigger: TriggerType;
  timestamp: string;
  promotions: PendingPromotion[];
  demotions: Demotion[];
  scanned: number;
  eligible: number;
  promoted: number;
  demoted: number;
}

// ============================================================================
// Configuration
// ============================================================================

const STATS_FILE = '.sigil/survival-stats.json';
const VETO_WINDOW_HOURS = 24;

const DEFAULT_CRITERIA: SurvivalCriteria = {
  minGoldImports: 5,
  minStabilityWeeks: 2,
  maxMutinies: 0,
};

// ============================================================================
// Core Engine
// ============================================================================

/**
 * Main entry point for the survival engine.
 * Scans components, evaluates criteria, promotes/demotes as needed.
 *
 * @param projectRoot - Root directory of the project
 * @param trigger - What triggered this run
 * @returns Engine execution result
 *
 * @example
 * ```ts
 * const result = await runSurvivalEngine('/path/to/project', 'push');
 * console.log(`Promoted: ${result.promoted}, Demoted: ${result.demoted}`);
 * ```
 */
export async function runSurvivalEngine(
  projectRoot: string = process.cwd(),
  trigger: TriggerType = 'manual'
): Promise<SurvivalEngineResult> {
  const stats = loadStats(projectRoot);
  const result: SurvivalEngineResult = {
    trigger,
    timestamp: new Date().toISOString(),
    promotions: [],
    demotions: [],
    scanned: 0,
    eligible: 0,
    promoted: 0,
    demoted: 0,
  };

  // Process expired veto windows first
  await processVetoWindows(stats, projectRoot);

  // Scan all tiers (except gold - can't promote from gold)
  const tiersToScan: Tier[] = ['draft', 'silver'];

  for (const tier of tiersToScan) {
    const components = getComponentsInTier(tier, projectRoot);

    for (const component of components) {
      result.scanned++;

      // Update component stats
      const componentStats = updateComponentStats(
        stats,
        component.name,
        component.path,
        tier,
        projectRoot
      );

      // Check survival criteria
      if (meetsSurvivalCriteria(componentStats)) {
        // Check cleanliness gate
        if (meetsCleanlinessGate(component.path)) {
          result.eligible++;

          // Queue for promotion (with veto window)
          const targetTier = getNextTier(tier);
          if (targetTier) {
            const pending = queuePromotion(
              stats,
              component.name,
              tier,
              targetTier
            );
            result.promotions.push(pending);
          }
        }
      }
    }
  }

  // Check for demotions (modified gold/silver components)
  const demotions = await checkForDemotions(stats, projectRoot);
  result.demotions = demotions;
  result.demoted = demotions.length;

  // Save updated stats
  saveStats(stats, projectRoot);

  return result;
}

// ============================================================================
// Survival Criteria
// ============================================================================

/**
 * Check if component stats meet survival criteria.
 *
 * Criteria:
 * - 5+ Gold imports
 * - 2+ weeks stable
 * - 0 mutinies
 *
 * @param stats - Component stats to evaluate
 * @param criteria - Custom criteria (optional)
 * @returns true if all criteria met
 */
export function meetsSurvivalCriteria(
  stats: ComponentStats,
  criteria: SurvivalCriteria = DEFAULT_CRITERIA
): boolean {
  return (
    stats.goldImports >= criteria.minGoldImports &&
    stats.stabilityWeeks >= criteria.minStabilityWeeks &&
    stats.mutinies <= criteria.maxMutinies
  );
}

/**
 * Check if component passes cleanliness gate.
 *
 * @param componentPath - Path to component file
 * @returns true if linter gate passes
 */
export function meetsCleanlinessGate(componentPath: string): boolean {
  return canPromote(componentPath);
}

// ============================================================================
// Promotion Logic
// ============================================================================

/**
 * Queue a component for promotion with veto window.
 *
 * @param stats - Survival stats object
 * @param componentName - Name of component
 * @param fromTier - Current tier
 * @param toTier - Target tier
 * @returns Pending promotion object
 */
function queuePromotion(
  stats: SurvivalStats,
  componentName: string,
  fromTier: Tier,
  toTier: Tier
): PendingPromotion {
  const now = new Date();
  const vetoDeadline = new Date(now.getTime() + VETO_WINDOW_HOURS * 60 * 60 * 1000);

  const pending: PendingPromotion = {
    componentName,
    fromTier,
    toTier,
    requestedAt: now.toISOString(),
    vetoDeadline: vetoDeadline.toISOString(),
    vetoedBy: null,
  };

  // Check if already pending
  const existingIndex = stats.pendingPromotions.findIndex(
    (p) => p.componentName === componentName
  );

  if (existingIndex === -1) {
    stats.pendingPromotions.push(pending);
  }

  return pending;
}

/**
 * Process expired veto windows and execute promotions.
 *
 * @param stats - Survival stats object
 * @param projectRoot - Project root directory
 */
async function processVetoWindows(
  stats: SurvivalStats,
  projectRoot: string
): Promise<void> {
  const now = new Date();
  const expired: PendingPromotion[] = [];
  const stillPending: PendingPromotion[] = [];

  for (const pending of stats.pendingPromotions) {
    const deadline = new Date(pending.vetoDeadline);

    if (pending.vetoedBy) {
      // Vetoed - remove from pending
      continue;
    }

    if (now > deadline) {
      // Veto window expired - execute promotion
      expired.push(pending);
    } else {
      stillPending.push(pending);
    }
  }

  // Execute expired promotions
  for (const pending of expired) {
    promoteComponent(
      pending.componentName,
      pending.fromTier,
      pending.toTier,
      projectRoot
    );
  }

  stats.pendingPromotions = stillPending;
}

/**
 * Execute component promotion.
 *
 * @param componentName - Name of component
 * @param fromTier - Current tier
 * @param toTier - Target tier
 * @param projectRoot - Project root directory
 */
export function promoteComponent(
  componentName: string,
  fromTier: Tier,
  toTier: Tier,
  projectRoot: string = process.cwd()
): boolean {
  const result = moveComponent(componentName, fromTier, toTier, projectRoot);

  if (result.success) {
    notifyPromotion(componentName, fromTier, toTier);
  }

  return result.success;
}

/**
 * Notify about promotion (for veto window).
 *
 * @param componentName - Name of component
 * @param fromTier - Current tier
 * @param toTier - Target tier
 */
function notifyPromotion(
  componentName: string,
  fromTier: Tier,
  toTier: Tier
): void {
  // In CI/CD, this would post to Slack/Discord/GitHub
  // For now, log to console (will be captured by CI)
  const message = [
    `🚀 SIGIL PROMOTION`,
    `Component: ${componentName}`,
    `${fromTier} → ${toTier}`,
    `Veto window: ${VETO_WINDOW_HOURS}h`,
    `To veto: /sigil veto ${componentName}`,
  ].join('\n');

  // Write to a notification file that CI can pick up
  const notifyPath = path.join(process.cwd(), '.sigil', 'notifications.log');
  fs.appendFileSync(notifyPath, `${new Date().toISOString()}\n${message}\n\n`);
}

// ============================================================================
// Demotion Logic
// ============================================================================

/**
 * Check for components that need demotion.
 * Demotion is IMMEDIATE when a Gold/Silver component is modified.
 *
 * @param stats - Survival stats object
 * @param projectRoot - Project root directory
 * @returns Array of demotions executed
 */
async function checkForDemotions(
  stats: SurvivalStats,
  projectRoot: string
): Promise<Demotion[]> {
  const demotions: Demotion[] = [];

  // Check Gold components for modifications
  const goldComponents = getComponentsInTier('gold', projectRoot);

  for (const component of goldComponents) {
    const componentStats = stats.components[component.name];
    if (!componentStats) continue;

    // Check if modified since last scan
    const fileStat = fs.statSync(component.path);
    const lastModified = new Date(fileStat.mtime).toISOString();

    if (componentStats.lastModified && lastModified !== componentStats.lastModified) {
      // Component was modified - demote immediately
      demoteComponent(component.name, 'gold', 'silver', projectRoot, 'Modified after promotion');
      demotions.push({
        componentName: component.name,
        fromTier: 'gold',
        toTier: 'silver',
        demotedAt: new Date().toISOString(),
        reason: 'Modified after promotion',
      });
    }
  }

  // Check Silver components similarly
  const silverComponents = getComponentsInTier('silver', projectRoot);

  for (const component of silverComponents) {
    const componentStats = stats.components[component.name];
    if (!componentStats) continue;

    const fileStat = fs.statSync(component.path);
    const lastModified = new Date(fileStat.mtime).toISOString();

    if (componentStats.lastModified && lastModified !== componentStats.lastModified) {
      demoteComponent(component.name, 'silver', 'draft', projectRoot, 'Modified after promotion');
      demotions.push({
        componentName: component.name,
        fromTier: 'silver',
        toTier: 'draft',
        demotedAt: new Date().toISOString(),
        reason: 'Modified after promotion',
      });
    }
  }

  // Store recent demotions
  stats.recentDemotions = [...demotions, ...stats.recentDemotions].slice(0, 20);

  return demotions;
}

/**
 * Execute component demotion (immediate, no veto).
 *
 * @param componentName - Name of component
 * @param fromTier - Current tier
 * @param toTier - Target tier
 * @param projectRoot - Project root directory
 * @param reason - Reason for demotion
 */
export function demoteComponent(
  componentName: string,
  fromTier: Tier,
  toTier: Tier,
  projectRoot: string = process.cwd(),
  reason: string = 'Manual demotion'
): boolean {
  const result = moveComponent(componentName, fromTier, toTier, projectRoot);
  return result.success;
}

// ============================================================================
// Stats Management
// ============================================================================

/**
 * Load survival stats from file.
 *
 * @param projectRoot - Project root directory
 * @returns Survival stats object
 */
export function loadStats(projectRoot: string = process.cwd()): SurvivalStats {
  const statsPath = path.join(projectRoot, STATS_FILE);

  if (fs.existsSync(statsPath)) {
    const content = fs.readFileSync(statsPath, 'utf-8');
    return JSON.parse(content);
  }

  // Initialize new stats
  return {
    version: 1,
    lastUpdated: new Date().toISOString(),
    components: {},
    pendingPromotions: [],
    recentDemotions: [],
  };
}

/**
 * Save survival stats to file.
 *
 * @param stats - Stats to save
 * @param projectRoot - Project root directory
 */
export function saveStats(
  stats: SurvivalStats,
  projectRoot: string = process.cwd()
): void {
  const statsPath = path.join(projectRoot, STATS_FILE);
  const sigilDir = path.dirname(statsPath);

  if (!fs.existsSync(sigilDir)) {
    fs.mkdirSync(sigilDir, { recursive: true });
  }

  stats.lastUpdated = new Date().toISOString();
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
}

/**
 * Update stats for a single component.
 *
 * @param stats - Survival stats object
 * @param componentName - Name of component
 * @param componentPath - Path to component file
 * @param tier - Current tier
 * @param projectRoot - Project root directory
 * @returns Updated component stats
 */
function updateComponentStats(
  stats: SurvivalStats,
  componentName: string,
  componentPath: string,
  tier: Tier,
  projectRoot: string
): ComponentStats {
  const existing = stats.components[componentName] || {
    tier,
    goldImports: 0,
    lastModified: '',
    stabilityWeeks: 0,
    mutinies: 0,
    promotionEligible: false,
    linterGatePassed: false,
  };

  // Update last modified
  const fileStat = fs.statSync(componentPath);
  const newLastModified = new Date(fileStat.mtime).toISOString();

  // Calculate stability weeks
  const firstSeen = existing.lastModified || newLastModified;
  const firstDate = new Date(firstSeen);
  const now = new Date();
  const weeksDiff = Math.floor(
    (now.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );

  // Count gold imports (scan gold tier for imports of this component)
  const goldImports = countGoldImports(componentName, projectRoot);

  // Run linter gate
  const linterGatePassed = canPromote(componentPath);

  const updated: ComponentStats = {
    tier,
    goldImports,
    lastModified: newLastModified,
    stabilityWeeks: weeksDiff,
    mutinies: existing.mutinies, // Mutinies tracked separately
    promotionEligible:
      goldImports >= DEFAULT_CRITERIA.minGoldImports &&
      weeksDiff >= DEFAULT_CRITERIA.minStabilityWeeks &&
      existing.mutinies <= DEFAULT_CRITERIA.maxMutinies,
    linterGatePassed,
  };

  stats.components[componentName] = updated;
  return updated;
}

/**
 * Count how many Gold components import a given component.
 *
 * @param componentName - Name of component to search for
 * @param projectRoot - Project root directory
 * @returns Number of gold imports
 */
function countGoldImports(
  componentName: string,
  projectRoot: string
): number {
  const goldComponents = getComponentsInTier('gold', projectRoot);
  let count = 0;

  for (const goldComponent of goldComponents) {
    try {
      const content = fs.readFileSync(goldComponent.path, 'utf-8');
      // Check for various import patterns
      const importPatterns = [
        new RegExp(`import.*${componentName}.*from`, 'g'),
        new RegExp(`from.*['"].*${componentName}['"]`, 'g'),
      ];

      for (const pattern of importPatterns) {
        if (pattern.test(content)) {
          count++;
          break; // Only count once per file
        }
      }
    } catch {
      // Skip files that can't be read
    }
  }

  return count;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the next tier in the promotion chain.
 *
 * @param currentTier - Current tier
 * @returns Next tier, or null if at top
 */
function getNextTier(currentTier: Tier): Tier | null {
  const chain: Record<Tier, Tier | null> = {
    draft: 'silver',
    silver: 'gold',
    gold: null,
  };
  return chain[currentTier];
}

/**
 * Veto a pending promotion.
 *
 * @param stats - Survival stats object
 * @param componentName - Name of component to veto
 * @param vetoer - Who vetoed (e.g., "@username")
 * @returns true if veto was recorded
 */
export function vetoPromotion(
  stats: SurvivalStats,
  componentName: string,
  vetoer: string
): boolean {
  const pending = stats.pendingPromotions.find(
    (p) => p.componentName === componentName
  );

  if (pending && !pending.vetoedBy) {
    pending.vetoedBy = vetoer;
    return true;
  }

  return false;
}

/**
 * Record a mutiny (intentional bypass of a pattern).
 *
 * @param stats - Survival stats object
 * @param componentName - Component that was bypassed
 */
export function recordMutiny(
  stats: SurvivalStats,
  componentName: string
): void {
  const existing = stats.components[componentName];
  if (existing) {
    existing.mutinies++;
    existing.promotionEligible = false; // Immediately ineligible
  }
}

/**
 * Generate a summary report of the survival engine state.
 *
 * @param stats - Survival stats object
 * @returns Formatted report string
 */
export function generateReport(stats: SurvivalStats): string {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('                  SIGIL SURVIVAL ENGINE REPORT');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('');
  lines.push(`Last Updated: ${stats.lastUpdated}`);
  lines.push(`Components Tracked: ${Object.keys(stats.components).length}`);
  lines.push(`Pending Promotions: ${stats.pendingPromotions.length}`);
  lines.push(`Recent Demotions: ${stats.recentDemotions.length}`);
  lines.push('');

  if (stats.pendingPromotions.length > 0) {
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push('                    PENDING PROMOTIONS');
    lines.push('───────────────────────────────────────────────────────────────');
    for (const p of stats.pendingPromotions) {
      lines.push(`  ${p.componentName}: ${p.fromTier} → ${p.toTier}`);
      lines.push(`    Veto deadline: ${p.vetoDeadline}`);
      if (p.vetoedBy) {
        lines.push(`    ⛔ Vetoed by: ${p.vetoedBy}`);
      }
    }
    lines.push('');
  }

  // Show eligible components
  const eligible = Object.entries(stats.components)
    .filter(([_, s]) => s.promotionEligible && s.linterGatePassed)
    .map(([name]) => name);

  if (eligible.length > 0) {
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push('                   PROMOTION ELIGIBLE');
    lines.push('───────────────────────────────────────────────────────────────');
    for (const name of eligible) {
      const s = stats.components[name];
      lines.push(`  ✅ ${name} (${s.tier})`);
      lines.push(`     Gold imports: ${s.goldImports}, Stability: ${s.stabilityWeeks}w`);
    }
    lines.push('');
  }

  lines.push('═══════════════════════════════════════════════════════════════');

  return lines.join('\n');
}
