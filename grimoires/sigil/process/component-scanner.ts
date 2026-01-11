/**
 * @sigil-tier gold
 * Sigil v5.0 - Component Scanner
 *
 * Live grep-based component discovery. No cache, no index.
 * Uses ripgrep for fast filesystem search.
 *
 * Law: "Filesystem is truth"
 *
 * @module process/component-scanner
 */

import { execSync } from 'child_process';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Component tier levels.
 */
export type SigilTier = 'gold' | 'silver' | 'bronze' | 'draft';

/**
 * Component zone assignments.
 */
export type SigilZone = 'critical' | 'glass' | 'machinery' | 'standard';

/**
 * Pragma parse result.
 */
export interface ParsedPragmas {
  tier?: SigilTier;
  zone?: SigilZone;
  dataType?: string;
}

/**
 * Component discovery result.
 */
export interface ComponentMatch {
  filePath: string;
  pragmas?: ParsedPragmas;
}

/**
 * Search options.
 */
export interface SearchOptions {
  /** Base directory to search (defaults to cwd) */
  cwd?: string;
  /** Glob pattern to limit search (e.g., 'src/**') */
  glob?: string;
  /** Include file content context lines */
  contextLines?: number;
}

// =============================================================================
// CORE SEARCH FUNCTIONS
// =============================================================================

/**
 * Execute ripgrep and return file paths.
 *
 * @param pattern - Regex pattern to search
 * @param options - Search options
 * @returns Array of file paths
 *
 * @internal
 */
function executeRipgrep(pattern: string, options: SearchOptions = {}): string[] {
  const { cwd = process.cwd(), glob } = options;

  // Build command
  let cmd = `rg "${pattern}" -l --type ts`;

  // Add glob filter if specified
  if (glob) {
    cmd += ` -g '${glob}'`;
  }

  try {
    const result = execSync(cmd, {
      cwd,
      encoding: 'utf-8',
      timeout: 5000, // 5 second timeout
      maxBuffer: 1024 * 1024, // 1MB buffer
    });

    // Split by newlines and filter empty
    return result
      .trim()
      .split('\n')
      .filter((line) => line.length > 0);
  } catch (error) {
    // ripgrep returns exit code 1 when no matches found
    if ((error as { status?: number }).status === 1) {
      return [];
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Execute ripgrep with content context.
 *
 * @param pattern - Regex pattern to search
 * @param options - Search options
 * @returns Raw ripgrep output
 *
 * @internal
 */
function executeRipgrepWithContext(
  pattern: string,
  options: SearchOptions = {}
): string {
  const { cwd = process.cwd(), glob, contextLines = 5 } = options;

  // Build command
  let cmd = `rg "${pattern}" -A ${contextLines} --type ts`;

  // Add glob filter if specified
  if (glob) {
    cmd += ` -g '${glob}'`;
  }

  try {
    return execSync(cmd, {
      cwd,
      encoding: 'utf-8',
      timeout: 5000,
      maxBuffer: 1024 * 1024,
    });
  } catch (error) {
    if ((error as { status?: number }).status === 1) {
      return '';
    }
    throw error;
  }
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Find components by tier level.
 *
 * @param tier - Tier to search for (gold, silver, bronze, draft)
 * @param options - Search options
 * @returns Array of file paths
 *
 * @example
 * ```ts
 * const goldComponents = findComponentsByTier('gold');
 * // ['src/components/ClaimButton.tsx', 'src/components/PaymentForm.tsx']
 * ```
 */
export function findComponentsByTier(
  tier: SigilTier,
  options: SearchOptions = {}
): string[] {
  return executeRipgrep(`@sigil-tier ${tier}`, options);
}

/**
 * Find components by zone.
 *
 * @param zone - Zone to search for (critical, glass, machinery, standard)
 * @param options - Search options
 * @returns Array of file paths
 *
 * @example
 * ```ts
 * const criticalComponents = findComponentsByZone('critical');
 * // ['src/features/checkout/ClaimButton.tsx', 'src/features/wallet/WithdrawForm.tsx']
 * ```
 */
export function findComponentsByZone(
  zone: SigilZone,
  options: SearchOptions = {}
): string[] {
  return executeRipgrep(`@sigil-zone ${zone}`, options);
}

/**
 * Find components by data type.
 *
 * @param dataType - Data type to search for (e.g., Money, Health, Task)
 * @param options - Search options
 * @returns Array of file paths
 *
 * @example
 * ```ts
 * const moneyComponents = findComponentsByDataType('Money');
 * // ['src/features/wallet/DepositForm.tsx', 'src/features/swap/SwapPanel.tsx']
 * ```
 */
export function findComponentsByDataType(
  dataType: string,
  options: SearchOptions = {}
): string[] {
  return executeRipgrep(`@sigil-data-type ${dataType}`, options);
}

/**
 * Find components matching multiple criteria.
 *
 * @param criteria - Object with tier, zone, and/or dataType
 * @param options - Search options
 * @returns Array of file paths matching ALL criteria
 *
 * @example
 * ```ts
 * const results = findComponentsByCriteria({
 *   tier: 'gold',
 *   zone: 'critical',
 * });
 * ```
 */
export function findComponentsByCriteria(
  criteria: Partial<ParsedPragmas>,
  options: SearchOptions = {}
): string[] {
  let results: string[] | null = null;

  // Find by tier
  if (criteria.tier) {
    results = findComponentsByTier(criteria.tier, options);
  }

  // Find by zone (intersect with tier results if present)
  if (criteria.zone) {
    const zoneResults = findComponentsByZone(criteria.zone, options);
    if (results === null) {
      results = zoneResults;
    } else {
      results = results.filter((f) => zoneResults.includes(f));
    }
  }

  // Find by data type (intersect with previous results)
  if (criteria.dataType) {
    const typeResults = findComponentsByDataType(criteria.dataType, options);
    if (results === null) {
      results = typeResults;
    } else {
      results = results.filter((f) => typeResults.includes(f));
    }
  }

  return results ?? [];
}

/**
 * Find all components with any Sigil pragma.
 *
 * @param options - Search options
 * @returns Array of file paths
 *
 * @example
 * ```ts
 * const allSigilComponents = findAllSigilComponents();
 * ```
 */
export function findAllSigilComponents(options: SearchOptions = {}): string[] {
  return executeRipgrep('@sigil-(tier|zone|data-type)', options);
}

// =============================================================================
// PRAGMA PARSING
// =============================================================================

/**
 * Parse pragmas from file content.
 *
 * @param content - File content string
 * @returns Parsed pragmas object
 *
 * @example
 * ```ts
 * const pragmas = parsePragmas(fileContent);
 * // { tier: 'gold', zone: 'critical', dataType: 'Money' }
 * ```
 */
export function parsePragmas(content: string): ParsedPragmas {
  const result: ParsedPragmas = {};

  // Match @sigil-tier
  const tierMatch = content.match(/@sigil-tier\s+(gold|silver|bronze|draft)/);
  if (tierMatch) {
    result.tier = tierMatch[1] as SigilTier;
  }

  // Match @sigil-zone
  const zoneMatch = content.match(
    /@sigil-zone\s+(critical|glass|machinery|standard)/
  );
  if (zoneMatch) {
    result.zone = zoneMatch[1] as SigilZone;
  }

  // Match @sigil-data-type
  const typeMatch = content.match(/@sigil-data-type\s+(\w+)/);
  if (typeMatch) {
    result.dataType = typeMatch[1];
  }

  return result;
}

/**
 * Get components with parsed pragmas.
 *
 * @param tier - Optional tier filter
 * @param options - Search options
 * @returns Array of component matches with pragmas
 *
 * @example
 * ```ts
 * const components = getComponentsWithPragmas('gold');
 * // [{ filePath: 'src/ClaimButton.tsx', pragmas: { tier: 'gold', zone: 'critical' } }]
 * ```
 */
export function getComponentsWithPragmas(
  tier?: SigilTier,
  options: SearchOptions = {}
): ComponentMatch[] {
  const pattern = tier ? `@sigil-tier ${tier}` : '@sigil-(tier|zone|data-type)';
  const output = executeRipgrepWithContext(pattern, {
    ...options,
    contextLines: 10,
  });

  if (!output) {
    return [];
  }

  // Parse ripgrep output
  const matches: ComponentMatch[] = [];
  const sections = output.split(/^--$/m);

  for (const section of sections) {
    const lines = section.trim().split('\n');
    if (lines.length === 0) continue;

    // First line contains file path
    const firstLine = lines[0];
    const fileMatch = firstLine.match(/^([^:]+):/);
    if (!fileMatch) continue;

    const filePath = fileMatch[1];
    const content = lines.join('\n');
    const pragmas = parsePragmas(content);

    matches.push({ filePath, pragmas });
  }

  return matches;
}
