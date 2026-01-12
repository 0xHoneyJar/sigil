/**
 * Sigil v10.1 "Usage Reality" - Survival Engine
 *
 * Usage-based authority system. Components earn their tier through
 * actual usage patterns, not directory location or manual promotion.
 *
 * "Stop asking for permission. If the code survives and is clean, it is Gold."
 *
 * Key Insight: Authority is COMPUTED from usage, not STORED in directories.
 * No file moves required. No broken imports. No git noise.
 *
 * @module @sigil/survival
 * @version 10.1.0
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, statSync } from 'fs';
import { join, basename, dirname } from 'path';

// =============================================================================
// Types
// =============================================================================

/**
 * Component authority tier.
 * - gold: 10+ imports, 14+ days stable, lint/type clean
 * - silver: 5+ imports, 7+ days stable
 * - draft: Everything else
 */
export type Tier = 'gold' | 'silver' | 'draft';

/**
 * Statistics for a single component.
 */
export interface ComponentStats {
  /** Component name (without extension) */
  name: string;
  /** File path relative to project root */
  path: string;
  /** Computed authority tier */
  tier: Tier;
  /** Number of files that import this component */
  imports: number;
  /** Last modification date */
  lastModified: Date;
  /** Days since last modification */
  daysSinceModified: number;
  /** Passes ESLint checks */
  lintClean: boolean;
  /** Passes TypeScript checks */
  typeClean: boolean;
  /** Confidence score (0-1) */
  confidence: number;
}

/**
 * Result of a promotion/demotion operation.
 */
export interface PromotionResult {
  component: string;
  from: Tier;
  to: Tier;
  reason: string;
  confidence: number;
}

/**
 * Authority configuration from authority.yaml.
 */
export interface AuthorityConfig {
  gold: {
    min_imports: number;
    min_stability_days: number;
    lint_clean: boolean;
    type_clean: boolean;
  };
  silver: {
    min_imports: number;
    min_stability_days: number;
    lint_clean: boolean;
    type_clean: boolean;
  };
  evolution: {
    auto_promote: number;
    human_review: number;
  };
  confidence_weights: {
    imports: number;
    stability: number;
    lint_clean: number;
    type_clean: number;
  };
}

// =============================================================================
// Default Configuration
// =============================================================================

const DEFAULT_CONFIG: AuthorityConfig = {
  gold: {
    min_imports: 10,
    min_stability_days: 14,
    lint_clean: true,
    type_clean: true,
  },
  silver: {
    min_imports: 5,
    min_stability_days: 7,
    lint_clean: true,
    type_clean: true,
  },
  evolution: {
    auto_promote: 0.95,
    human_review: 0.80,
  },
  confidence_weights: {
    imports: 0.4,
    stability: 0.3,
    lint_clean: 0.15,
    type_clean: 0.15,
  },
};

// =============================================================================
// Survival Engine
// =============================================================================

/**
 * SurvivalEngine computes component authority from usage patterns.
 *
 * Unlike previous versions that moved files between directories,
 * v10.1 computes authority dynamically based on:
 * - Import count across the codebase
 * - Stability (days since last modification)
 * - Code quality (lint/type checks)
 *
 * @example
 * ```typescript
 * const engine = new SurvivalEngine('/path/to/project');
 *
 * // Get tier for a specific component
 * const tier = await engine.inferAuthority('Button.tsx');
 *
 * // Get full stats
 * const stats = await engine.getComponentStats('Button.tsx');
 *
 * // Run full analysis
 * const results = await engine.analyze();
 * ```
 */
export class SurvivalEngine {
  private projectRoot: string;
  private config: AuthorityConfig;

  /**
   * Create a new SurvivalEngine instance.
   *
   * @param projectRoot - Root directory of the project
   * @param config - Optional authority configuration
   */
  constructor(projectRoot: string, config?: Partial<AuthorityConfig>) {
    this.projectRoot = projectRoot;
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Try to load config from authority.yaml
    this.loadConfigFromYaml();
  }

  /**
   * Load configuration from authority.yaml if it exists.
   */
  private loadConfigFromYaml(): void {
    const configPath = join(
      this.projectRoot,
      'grimoires',
      'sigil',
      'authority.yaml'
    );
    if (existsSync(configPath)) {
      try {
        const content = readFileSync(configPath, 'utf-8');
        const parsed = this.parseYaml(content);
        if (parsed.gold && typeof parsed.gold === 'object') {
          this.config.gold = { ...this.config.gold, ...(parsed.gold as Partial<AuthorityConfig['gold']>) };
        }
        if (parsed.silver && typeof parsed.silver === 'object') {
          this.config.silver = { ...this.config.silver, ...(parsed.silver as Partial<AuthorityConfig['silver']>) };
        }
        if (parsed.evolution && typeof parsed.evolution === 'object') {
          this.config.evolution = { ...this.config.evolution, ...(parsed.evolution as Partial<AuthorityConfig['evolution']>) };
        }
        if (parsed.confidence_weights && typeof parsed.confidence_weights === 'object') {
          this.config.confidence_weights = {
            ...this.config.confidence_weights,
            ...(parsed.confidence_weights as Partial<AuthorityConfig['confidence_weights']>),
          };
        }
      } catch {
        // Use defaults if parsing fails
      }
    }
  }

  /**
   * Simple YAML parser for authority config.
   */
  private parseYaml(content: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    let currentSection = '';
    let currentObject: Record<string, unknown> = {};

    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Top-level section
      if (!line.startsWith(' ') && !line.startsWith('\t') && trimmed.endsWith(':')) {
        if (currentSection && Object.keys(currentObject).length > 0) {
          result[currentSection] = currentObject;
        }
        currentSection = trimmed.slice(0, -1);
        currentObject = {};
        continue;
      }

      // Key-value pair
      const match = trimmed.match(/^(\w+):\s*(.+)?$/);
      if (match && currentSection) {
        const [, key, value] = match;
        if (value !== undefined) {
          // Parse value
          if (value === 'true') currentObject[key] = true;
          else if (value === 'false') currentObject[key] = false;
          else if (!isNaN(Number(value))) currentObject[key] = Number(value);
          else currentObject[key] = value.replace(/["']/g, '');
        }
      }
    }

    // Don't forget the last section
    if (currentSection && Object.keys(currentObject).length > 0) {
      result[currentSection] = currentObject;
    }

    return result;
  }

  // ---------------------------------------------------------------------------
  // Core Authority Methods
  // ---------------------------------------------------------------------------

  /**
   * Infer the authority tier for a component.
   *
   * @param componentPath - Path to the component file
   * @returns Computed tier
   */
  async inferAuthority(componentPath: string): Promise<Tier> {
    const stats = await this.getComponentStats(componentPath);
    return stats.tier;
  }

  /**
   * Get full statistics for a component.
   *
   * @param componentPath - Path to the component file
   */
  async getComponentStats(componentPath: string): Promise<ComponentStats> {
    const fullPath = componentPath.startsWith('/')
      ? componentPath
      : join(this.projectRoot, componentPath);

    if (!existsSync(fullPath)) {
      throw new Error(`Component not found: ${componentPath}`);
    }

    const name = basename(componentPath).replace(/\.[^.]+$/, '');
    const imports = await this.countImports(componentPath);
    const lastModified = statSync(fullPath).mtime;
    const daysSinceModified = this.daysSince(lastModified);
    const lintClean = await this.checkLint(fullPath);
    const typeClean = await this.checkTypes(fullPath);

    // Compute tier
    const tier = this.computeTier(imports, daysSinceModified, lintClean, typeClean);

    // Compute confidence
    const confidence = this.computeConfidence(
      imports,
      daysSinceModified,
      lintClean,
      typeClean,
      tier
    );

    return {
      name,
      path: componentPath,
      tier,
      imports,
      lastModified,
      daysSinceModified,
      lintClean,
      typeClean,
      confidence,
    };
  }

  /**
   * Compute tier based on metrics.
   */
  private computeTier(
    imports: number,
    stability: number,
    lintClean: boolean,
    typeClean: boolean
  ): Tier {
    // Gold: High imports, stable, clean
    if (
      imports >= this.config.gold.min_imports &&
      stability >= this.config.gold.min_stability_days &&
      (!this.config.gold.lint_clean || lintClean) &&
      (!this.config.gold.type_clean || typeClean)
    ) {
      return 'gold';
    }

    // Silver: Medium imports
    if (
      imports >= this.config.silver.min_imports &&
      stability >= this.config.silver.min_stability_days
    ) {
      return 'silver';
    }

    // Draft: Everything else
    return 'draft';
  }

  /**
   * Compute confidence score (0-1) for the tier assignment.
   */
  private computeConfidence(
    imports: number,
    stability: number,
    lintClean: boolean,
    typeClean: boolean,
    tier: Tier
  ): number {
    const weights = this.config.confidence_weights;
    const thresholds = tier === 'gold' ? this.config.gold : this.config.silver;

    // Normalize imports (0-1, capped at 2x threshold)
    const importScore = Math.min(
      1,
      imports / (thresholds.min_imports * 2)
    );

    // Normalize stability (0-1, capped at 2x threshold)
    const stabilityScore = Math.min(
      1,
      stability / (thresholds.min_stability_days * 2)
    );

    // Boolean scores
    const lintScore = lintClean ? 1 : 0;
    const typeScore = typeClean ? 1 : 0;

    // Weighted average
    return (
      importScore * weights.imports +
      stabilityScore * weights.stability +
      lintScore * weights.lint_clean +
      typeScore * weights.type_clean
    );
  }

  // ---------------------------------------------------------------------------
  // Import Counting
  // ---------------------------------------------------------------------------

  /**
   * Count how many files import a component.
   *
   * @param componentPath - Path to the component
   */
  async countImports(componentPath: string): Promise<number> {
    const componentName = basename(componentPath).replace(/\.[^.]+$/, '');

    try {
      // Use grep to find imports (fast)
      const result = execSync(
        `grep -rl "${componentName}" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | wc -l`,
        { cwd: this.projectRoot, encoding: 'utf-8' }
      );
      return parseInt(result.trim(), 10) || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get the stability (days since modification) for a file.
   *
   * @param filePath - Path to the file
   */
  getStabilityDays(filePath: string): number {
    const fullPath = filePath.startsWith('/')
      ? filePath
      : join(this.projectRoot, filePath);

    if (!existsSync(fullPath)) return 0;

    const lastModified = statSync(fullPath).mtime;
    return this.daysSince(lastModified);
  }

  /**
   * Calculate days since a date.
   */
  private daysSince(date: Date): number {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  // ---------------------------------------------------------------------------
  // Quality Checks
  // ---------------------------------------------------------------------------

  /**
   * Check if a file passes ESLint.
   */
  private async checkLint(filePath: string): Promise<boolean> {
    try {
      execSync(`npx eslint "${filePath}" --max-warnings 0 2>/dev/null`, {
        cwd: this.projectRoot,
        stdio: 'pipe',
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a file passes TypeScript checks.
   */
  private async checkTypes(filePath: string): Promise<boolean> {
    try {
      execSync(`npx tsc --noEmit "${filePath}" 2>/dev/null`, {
        cwd: this.projectRoot,
        stdio: 'pipe',
      });
      return true;
    } catch {
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Batch Analysis
  // ---------------------------------------------------------------------------

  /**
   * Analyze all components in a directory.
   *
   * @param directory - Directory to scan (relative to project root)
   */
  async analyzeDirectory(directory: string = 'src/components'): Promise<ComponentStats[]> {
    const stats: ComponentStats[] = [];
    const fullPath = join(this.projectRoot, directory);

    if (!existsSync(fullPath)) return stats;

    try {
      const result = execSync(
        `find "${fullPath}" -name "*.tsx" -o -name "*.ts" | grep -v ".test." | grep -v ".spec."`,
        { cwd: this.projectRoot, encoding: 'utf-8' }
      );

      const files = result.trim().split('\n').filter(Boolean);

      for (const file of files) {
        try {
          const relativePath = file.replace(this.projectRoot + '/', '');
          const componentStats = await this.getComponentStats(relativePath);
          stats.push(componentStats);
        } catch {
          // Skip files that can't be analyzed
        }
      }
    } catch {
      // Return empty if find fails
    }

    return stats;
  }

  /**
   * Get a summary of component tiers.
   */
  async getTierSummary(): Promise<Record<Tier, number>> {
    const stats = await this.analyzeDirectory();
    const summary: Record<Tier, number> = { gold: 0, silver: 0, draft: 0 };

    for (const s of stats) {
      summary[s.tier]++;
    }

    return summary;
  }
}

// =============================================================================
// Standalone Functions
// =============================================================================

/**
 * Infer authority for a component (standalone function).
 *
 * @param componentPath - Path to the component
 * @param projectRoot - Optional project root (defaults to cwd)
 */
export async function inferAuthority(
  componentPath: string,
  projectRoot?: string
): Promise<Tier> {
  const engine = new SurvivalEngine(projectRoot || process.cwd());
  return engine.inferAuthority(componentPath);
}

/**
 * Count imports for a component (standalone function).
 *
 * @param componentPath - Path to the component
 * @param projectRoot - Optional project root (defaults to cwd)
 */
export async function countImports(
  componentPath: string,
  projectRoot?: string
): Promise<number> {
  const engine = new SurvivalEngine(projectRoot || process.cwd());
  return engine.countImports(componentPath);
}

/**
 * Get stability days for a file (standalone function).
 *
 * @param filePath - Path to the file
 * @param projectRoot - Optional project root (defaults to cwd)
 */
export function getStabilityDays(
  filePath: string,
  projectRoot?: string
): number {
  const engine = new SurvivalEngine(projectRoot || process.cwd());
  return engine.getStabilityDays(filePath);
}

/**
 * Run the survival engine (CLI entry point).
 *
 * @param projectRoot - Project root directory
 */
export async function runSurvivalEngine(
  projectRoot: string
): Promise<ComponentStats[]> {
  const engine = new SurvivalEngine(projectRoot);
  const stats = await engine.analyzeDirectory();

  // Log summary
  const summary = { gold: 0, silver: 0, draft: 0 };
  for (const s of stats) {
    summary[s.tier]++;
  }

  console.log('\nSigil Survival Engine Analysis:');
  console.log(`  Gold:   ${summary.gold} components`);
  console.log(`  Silver: ${summary.silver} components`);
  console.log(`  Draft:  ${summary.draft} components`);
  console.log(`  Total:  ${stats.length} components\n`);

  // Log gold candidates
  const goldCandidates = stats.filter(
    (s) => s.tier === 'silver' && s.confidence >= 0.8
  );
  if (goldCandidates.length > 0) {
    console.log('Gold Candidates (Silver with high confidence):');
    for (const c of goldCandidates) {
      console.log(`  ${c.name}: ${(c.confidence * 100).toFixed(0)}% confidence`);
    }
    console.log('');
  }

  return stats;
}
