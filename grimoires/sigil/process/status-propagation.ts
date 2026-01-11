/**
 * @sigil-tier gold
 * Sigil v5.0 - Status Propagation
 *
 * Implements tier downgrade on import: Tier(Component) = min(DeclaredTier, Tier(Dependencies))
 * Gold imports Draft → becomes Draft.
 *
 * Law: "Your status is only as good as your weakest dependency."
 *
 * @module process/status-propagation
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, relative, dirname } from 'path';
import { parsePragmas, type SigilTier } from './component-scanner';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Tier priority (lower = weaker, gold is strongest at 4).
 */
const TIER_PRIORITY: Record<SigilTier, number> = {
  draft: 1,
  bronze: 2,
  silver: 3,
  gold: 4,
};

/**
 * Import analysis result.
 */
export interface ImportInfo {
  /** Import path as written */
  importPath: string;
  /** Resolved file path */
  resolvedPath: string | null;
  /** Detected tier of imported component */
  tier: SigilTier | null;
  /** Line number in source file */
  line: number;
}

/**
 * Tier downgrade information.
 */
export interface TierDowngrade {
  /** Current declared tier */
  declaredTier: SigilTier;
  /** Effective tier after propagation */
  effectiveTier: SigilTier;
  /** Imports causing downgrade */
  downgrades: {
    importPath: string;
    importTier: SigilTier;
    line: number;
  }[];
}

/**
 * Component status analysis result.
 */
export interface StatusAnalysis {
  /** File being analyzed */
  file: string;
  /** Declared tier (from pragma) */
  declaredTier: SigilTier | null;
  /** Effective tier after propagation */
  effectiveTier: SigilTier | null;
  /** All imports found */
  imports: ImportInfo[];
  /** Downgrade information (if any) */
  downgrade: TierDowngrade | null;
  /** Warnings to display */
  warnings: string[];
}

// =============================================================================
// IMPORT PARSING
// =============================================================================

/**
 * Parse import statements from file content.
 *
 * @param content - File content
 * @returns Array of import info
 *
 * @example
 * ```ts
 * const imports = parseImports(`
 *   import { Button } from '@/components/Button';
 *   import { useWallet } from '../hooks/useWallet';
 * `);
 * ```
 */
export function parseImports(content: string): Omit<ImportInfo, 'resolvedPath' | 'tier'>[] {
  const imports: Omit<ImportInfo, 'resolvedPath' | 'tier'>[] = [];
  const lines = content.split('\n');

  // Match various import patterns
  const importPatterns = [
    // import { x } from 'path'
    /import\s+{[^}]*}\s+from\s+['"]([^'"]+)['"]/g,
    // import x from 'path'
    /import\s+\w+\s+from\s+['"]([^'"]+)['"]/g,
    // import * as x from 'path'
    /import\s+\*\s+as\s+\w+\s+from\s+['"]([^'"]+)['"]/g,
    // import 'path'
    /import\s+['"]([^'"]+)['"]/g,
    // dynamic import()
    /import\(['"]([^'"]+)['"]\)/g,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    for (const pattern of importPatterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(line)) !== null) {
        imports.push({
          importPath: match[1],
          line: lineNum,
        });
      }
    }
  }

  return imports;
}

/**
 * Resolve import path to actual file path.
 *
 * @param importPath - Import path from source
 * @param sourceFile - File containing the import
 * @param basePath - Project base path
 * @returns Resolved file path or null
 */
export function resolveImportPath(
  importPath: string,
  sourceFile: string,
  basePath: string = process.cwd()
): string | null {
  // Skip external packages
  if (!importPath.startsWith('.') && !importPath.startsWith('@/') && !importPath.startsWith('~/')) {
    return null;
  }

  let resolvedPath: string;

  // Handle alias paths (@/, ~/)
  if (importPath.startsWith('@/')) {
    resolvedPath = join(basePath, 'src', importPath.slice(2));
  } else if (importPath.startsWith('~/')) {
    resolvedPath = join(basePath, importPath.slice(2));
  } else {
    // Relative path
    resolvedPath = join(dirname(sourceFile), importPath);
  }

  // Try common extensions
  const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
  for (const ext of extensions) {
    const fullPath = resolvedPath + ext;
    if (existsSync(fullPath)) {
      return fullPath;
    }
  }

  return null;
}

/**
 * Get tier of a file from its pragmas.
 *
 * @param filePath - Path to file
 * @returns Tier or null if not found
 */
export function getFileTier(filePath: string): SigilTier | null {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const pragmas = parsePragmas(content);
    return pragmas.tier ?? null;
  } catch {
    return null;
  }
}

// =============================================================================
// STATUS PROPAGATION
// =============================================================================

/**
 * Get minimum tier between two tiers.
 *
 * @param a - First tier
 * @param b - Second tier
 * @returns Minimum (weakest) tier
 */
export function minTier(a: SigilTier, b: SigilTier): SigilTier {
  return TIER_PRIORITY[a] <= TIER_PRIORITY[b] ? a : b;
}

/**
 * Compare tiers.
 *
 * @param a - First tier
 * @param b - Second tier
 * @returns Negative if a < b, positive if a > b, zero if equal
 */
export function compareTiers(a: SigilTier, b: SigilTier): number {
  return TIER_PRIORITY[a] - TIER_PRIORITY[b];
}

/**
 * Analyze imports for tier conflicts.
 *
 * @param filePath - File to analyze
 * @param basePath - Project base path
 * @returns Import analysis with tier information
 *
 * @example
 * ```ts
 * const analysis = analyzeImports('src/components/Button.tsx');
 * for (const imp of analysis) {
 *   console.log(`${imp.importPath}: ${imp.tier ?? 'external'}`);
 * }
 * ```
 */
export function analyzeImports(
  filePath: string,
  basePath: string = process.cwd()
): ImportInfo[] {
  let content: string;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch {
    return [];
  }

  const rawImports = parseImports(content);
  const imports: ImportInfo[] = [];

  for (const imp of rawImports) {
    const resolvedPath = resolveImportPath(imp.importPath, filePath, basePath);
    const tier = resolvedPath ? getFileTier(resolvedPath) : null;

    imports.push({
      ...imp,
      resolvedPath,
      tier,
    });
  }

  return imports;
}

/**
 * Calculate effective tier after status propagation.
 *
 * Rule: Tier(Component) = min(DeclaredTier, Tier(Dependencies))
 *
 * @param declaredTier - Component's declared tier
 * @param imports - Analyzed imports
 * @returns Effective tier and downgrade info
 *
 * @example
 * ```ts
 * const { effectiveTier, downgrades } = calculateEffectiveTier('gold', imports);
 * if (downgrades.length > 0) {
 *   console.log(`Downgraded from gold to ${effectiveTier}`);
 * }
 * ```
 */
export function calculateEffectiveTier(
  declaredTier: SigilTier,
  imports: ImportInfo[]
): TierDowngrade {
  let effectiveTier = declaredTier;
  const downgrades: TierDowngrade['downgrades'] = [];

  for (const imp of imports) {
    // Skip external or untagged imports
    if (!imp.tier) continue;

    // Check if import tier is lower than current effective tier
    if (compareTiers(imp.tier, effectiveTier) < 0) {
      effectiveTier = minTier(effectiveTier, imp.tier);
      downgrades.push({
        importPath: imp.importPath,
        importTier: imp.tier,
        line: imp.line,
      });
    }
  }

  return {
    declaredTier,
    effectiveTier,
    downgrades,
  };
}

/**
 * Analyze component status with full propagation.
 *
 * @param filePath - File to analyze
 * @param basePath - Project base path
 * @returns Complete status analysis
 *
 * @example
 * ```ts
 * const status = analyzeComponentStatus('src/components/ClaimButton.tsx');
 * if (status.downgrade) {
 *   console.log('Warning:', status.warnings.join('\n'));
 * }
 * ```
 */
export function analyzeComponentStatus(
  filePath: string,
  basePath: string = process.cwd()
): StatusAnalysis {
  const warnings: string[] = [];

  // Get declared tier
  const declaredTier = getFileTier(filePath);

  // Analyze imports
  const imports = analyzeImports(filePath, basePath);

  // Calculate effective tier
  let downgrade: TierDowngrade | null = null;
  let effectiveTier = declaredTier;

  if (declaredTier) {
    const result = calculateEffectiveTier(declaredTier, imports);
    effectiveTier = result.effectiveTier;

    if (result.downgrades.length > 0) {
      downgrade = result;

      // Generate warnings
      for (const dg of result.downgrades) {
        warnings.push(
          `⚠️ Tier downgrade: ${declaredTier} → ${effectiveTier} due to import of ${dg.importPath} (tier: ${dg.importTier}) at line ${dg.line}`
        );
      }
    }
  }

  return {
    file: relative(basePath, filePath),
    declaredTier,
    effectiveTier,
    imports,
    downgrade,
    warnings,
  };
}

/**
 * Scan all components and report status propagation.
 *
 * @param basePath - Project base path
 * @returns Array of status analyses with downgrades
 *
 * @example
 * ```ts
 * const issues = scanStatusPropagation();
 * for (const issue of issues) {
 *   console.log(`${issue.file}: ${issue.declaredTier} → ${issue.effectiveTier}`);
 * }
 * ```
 */
export function scanStatusPropagation(basePath: string = process.cwd()): StatusAnalysis[] {
  // Find all components with tier pragmas
  let files: string[];
  try {
    const result = execSync('rg "@sigil-tier" -l --type ts', {
      cwd: basePath,
      encoding: 'utf-8',
      timeout: 5000,
    });
    files = result.trim().split('\n').filter(Boolean);
  } catch (error) {
    if ((error as { status?: number }).status === 1) {
      return [];
    }
    throw error;
  }

  const analyses: StatusAnalysis[] = [];

  for (const file of files) {
    const fullPath = join(basePath, file);
    const analysis = analyzeComponentStatus(fullPath, basePath);

    // Only include if there's a downgrade
    if (analysis.downgrade) {
      analyses.push(analysis);
    }
  }

  return analyses;
}

// =============================================================================
// FORMATTERS
// =============================================================================

/**
 * Format status analysis for terminal output.
 */
export function formatStatusAnalysis(analysis: StatusAnalysis): string {
  const lines: string[] = [];

  lines.push(`\nFile: ${analysis.file}`);
  lines.push(`Declared: ${analysis.declaredTier ?? 'none'}`);
  lines.push(`Effective: ${analysis.effectiveTier ?? 'none'}`);

  if (analysis.downgrade) {
    lines.push('\nDowngrades:');
    for (const dg of analysis.downgrade.downgrades) {
      lines.push(`  Line ${dg.line}: ${dg.importPath} (${dg.importTier})`);
    }
  }

  if (analysis.warnings.length > 0) {
    lines.push('\nWarnings:');
    for (const w of analysis.warnings) {
      lines.push(`  ${w}`);
    }
  }

  return lines.join('\n');
}

/**
 * Format propagation scan summary.
 */
export function formatPropagationSummary(analyses: StatusAnalysis[]): string {
  if (analyses.length === 0) {
    return 'No tier downgrades detected. All components maintain declared tier.';
  }

  const lines: string[] = [
    '',
    'STATUS PROPAGATION REPORT',
    '=========================',
    `Components with downgrades: ${analyses.length}`,
    '',
  ];

  for (const analysis of analyses) {
    lines.push(
      `${analysis.file}: ${analysis.declaredTier} → ${analysis.effectiveTier}`
    );
    for (const w of analysis.warnings) {
      lines.push(`  ${w}`);
    }
  }

  lines.push('');
  lines.push('Note: Downgrades are warnings, not errors.');
  lines.push('Status restores when dependency upgrades.');

  return lines.join('\n');
}
