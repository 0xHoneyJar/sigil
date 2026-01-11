/**
 * Sigil v7.6 - Filesystem Registry
 *
 * Replaces registry parsing with simple filesystem lookup.
 * Path-based tier detection using fs.existsSync() for O(1) lookups.
 *
 * "The filesystem IS the registry. No parsing, no overhead."
 *
 * @sigil-tier gold
 * @sigil-zone machinery
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

export type Tier = 'gold' | 'silver' | 'draft';

export interface ComponentInfo {
  name: string;
  tier: Tier;
  path: string;
}

export interface MoveResult {
  success: boolean;
  from: { tier: Tier; path: string };
  to: { tier: Tier; path: string };
  indexRegenerated: boolean;
}

export interface ImportCheck {
  allowed: boolean;
  reason?: string;
  importerTier: Tier;
  importeeTier: Tier;
}

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_BASE_PATH = 'src/components';

const TIER_PATHS: Record<Tier, string> = {
  gold: 'gold',
  silver: 'silver',
  draft: 'draft',
};

const TIER_PRIORITY: Record<Tier, number> = {
  gold: 3,
  silver: 2,
  draft: 1,
};

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get the tier of a component by checking filesystem paths.
 * O(1) lookup using fs.existsSync().
 *
 * @param componentName - Name of the component (e.g., "Button")
 * @param projectRoot - Root directory of the project
 * @returns Tier if found, null if component doesn't exist
 *
 * @example
 * ```ts
 * const tier = getTier('Button', '/path/to/project');
 * // Returns 'gold' if src/components/gold/Button.tsx exists
 * ```
 */
export function getTier(
  componentName: string,
  projectRoot: string = process.cwd()
): Tier | null {
  const basePath = path.join(projectRoot, DEFAULT_BASE_PATH);

  // Check each tier in priority order (gold first)
  const tiers: Tier[] = ['gold', 'silver', 'draft'];

  for (const tier of tiers) {
    const tierPath = path.join(basePath, TIER_PATHS[tier]);
    const componentPath = path.join(tierPath, `${componentName}.tsx`);
    const componentDir = path.join(tierPath, componentName);

    // Check for ComponentName.tsx or ComponentName/index.tsx
    if (fs.existsSync(componentPath)) {
      return tier;
    }
    if (fs.existsSync(path.join(componentDir, 'index.tsx'))) {
      return tier;
    }
  }

  return null;
}

/**
 * Get all components in a specific tier.
 *
 * @param tier - The tier to list components from
 * @param projectRoot - Root directory of the project
 * @returns Array of component info objects
 *
 * @example
 * ```ts
 * const goldComponents = getComponentsInTier('gold', '/path/to/project');
 * // Returns [{ name: 'Button', tier: 'gold', path: '...' }, ...]
 * ```
 */
export function getComponentsInTier(
  tier: Tier,
  projectRoot: string = process.cwd()
): ComponentInfo[] {
  const tierPath = path.join(projectRoot, DEFAULT_BASE_PATH, TIER_PATHS[tier]);

  if (!fs.existsSync(tierPath)) {
    return [];
  }

  const entries = fs.readdirSync(tierPath, { withFileTypes: true });
  const components: ComponentInfo[] = [];

  for (const entry of entries) {
    // Skip index files and non-component files
    if (entry.name === 'index.ts' || entry.name === 'index.tsx') {
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.tsx')) {
      const name = entry.name.replace('.tsx', '');
      components.push({
        name,
        tier,
        path: path.join(tierPath, entry.name),
      });
    } else if (entry.isDirectory()) {
      const indexPath = path.join(tierPath, entry.name, 'index.tsx');
      if (fs.existsSync(indexPath)) {
        components.push({
          name: entry.name,
          tier,
          path: indexPath,
        });
      }
    }
  }

  return components;
}

/**
 * Move a component from one tier to another.
 * Atomic operation: move file + regenerate indexes.
 *
 * @param componentName - Name of the component to move
 * @param fromTier - Current tier
 * @param toTier - Target tier
 * @param projectRoot - Root directory of the project
 * @returns Result of the move operation
 *
 * @example
 * ```ts
 * const result = moveComponent('Button', 'silver', 'gold', projectRoot);
 * // Moves Button from silver to gold and regenerates indexes
 * ```
 */
export function moveComponent(
  componentName: string,
  fromTier: Tier,
  toTier: Tier,
  projectRoot: string = process.cwd()
): MoveResult {
  const basePath = path.join(projectRoot, DEFAULT_BASE_PATH);
  const fromPath = path.join(basePath, TIER_PATHS[fromTier]);
  const toPath = path.join(basePath, TIER_PATHS[toTier]);

  // Determine source location (file or directory)
  const sourceFile = path.join(fromPath, `${componentName}.tsx`);
  const sourceDir = path.join(fromPath, componentName);

  let actualSource: string;
  let isDirectory = false;

  if (fs.existsSync(sourceFile)) {
    actualSource = sourceFile;
  } else if (fs.existsSync(sourceDir)) {
    actualSource = sourceDir;
    isDirectory = true;
  } else {
    return {
      success: false,
      from: { tier: fromTier, path: sourceFile },
      to: { tier: toTier, path: '' },
      indexRegenerated: false,
    };
  }

  // Ensure target directory exists
  if (!fs.existsSync(toPath)) {
    fs.mkdirSync(toPath, { recursive: true });
  }

  // Determine target location
  const targetPath = isDirectory
    ? path.join(toPath, componentName)
    : path.join(toPath, `${componentName}.tsx`);

  // Perform the move
  try {
    fs.renameSync(actualSource, targetPath);

    // Regenerate indexes for both tiers
    regenerateIndex(fromTier, projectRoot);
    regenerateIndex(toTier, projectRoot);

    return {
      success: true,
      from: { tier: fromTier, path: actualSource },
      to: { tier: toTier, path: targetPath },
      indexRegenerated: true,
    };
  } catch (error) {
    return {
      success: false,
      from: { tier: fromTier, path: actualSource },
      to: { tier: toTier, path: targetPath },
      indexRegenerated: false,
    };
  }
}

/**
 * Regenerate the index.ts file for a tier.
 * Creates deterministic exports from directory contents.
 *
 * @param tier - The tier to regenerate index for
 * @param projectRoot - Root directory of the project
 * @returns Path to the generated index file
 *
 * @example
 * ```ts
 * regenerateIndex('gold', projectRoot);
 * // Creates src/components/gold/index.ts with all exports
 * ```
 */
export function regenerateIndex(
  tier: Tier,
  projectRoot: string = process.cwd()
): string {
  const tierPath = path.join(projectRoot, DEFAULT_BASE_PATH, TIER_PATHS[tier]);
  const indexPath = path.join(tierPath, 'index.ts');

  if (!fs.existsSync(tierPath)) {
    fs.mkdirSync(tierPath, { recursive: true });
  }

  const components = getComponentsInTier(tier, projectRoot);

  // Sort for deterministic output
  components.sort((a, b) => a.name.localeCompare(b.name));

  // Generate export statements
  const exports = components.map((c) => {
    const relativePath = `./${c.name}`;
    return `export * from '${relativePath}';`;
  });

  const content = [
    `/**`,
    ` * Sigil v7.6 - ${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier Index`,
    ` * Auto-generated by filesystem-registry.ts`,
    ` * DO NOT EDIT MANUALLY`,
    ` */`,
    ``,
    ...exports,
    ``,
  ].join('\n');

  fs.writeFileSync(indexPath, content);

  return indexPath;
}

/**
 * Check if an import between tiers is allowed.
 * Enforces: Gold cannot import Draft (contagion prevention).
 *
 * @param importerTier - Tier of the importing component
 * @param importeeTier - Tier of the imported component
 * @returns Check result with allowed status and reason
 *
 * @example
 * ```ts
 * const check = isImportAllowed('gold', 'draft');
 * // { allowed: false, reason: 'Gold cannot import Draft...', ... }
 * ```
 */
export function isImportAllowed(
  importerTier: Tier,
  importeeTier: Tier
): ImportCheck {
  const importerPriority = TIER_PRIORITY[importerTier];
  const importeePriority = TIER_PRIORITY[importeeTier];

  // Higher tier cannot import from lower tier (except via slots)
  if (importerPriority > importeePriority) {
    return {
      allowed: false,
      reason: `${importerTier} cannot directly import from ${importeeTier}. Use slot-based composition instead.`,
      importerTier,
      importeeTier,
    };
  }

  return {
    allowed: true,
    importerTier,
    importeeTier,
  };
}

/**
 * Get the full path to a component by name.
 *
 * @param componentName - Name of the component
 * @param projectRoot - Root directory of the project
 * @returns Full path if found, null otherwise
 */
export function getComponentPath(
  componentName: string,
  projectRoot: string = process.cwd()
): string | null {
  const tier = getTier(componentName, projectRoot);
  if (!tier) return null;

  const basePath = path.join(projectRoot, DEFAULT_BASE_PATH, TIER_PATHS[tier]);

  const filePath = path.join(basePath, `${componentName}.tsx`);
  if (fs.existsSync(filePath)) return filePath;

  const indexPath = path.join(basePath, componentName, 'index.tsx');
  if (fs.existsSync(indexPath)) return indexPath;

  return null;
}

/**
 * Initialize tier directories if they don't exist.
 *
 * @param projectRoot - Root directory of the project
 */
export function initializeTierStructure(
  projectRoot: string = process.cwd()
): void {
  const basePath = path.join(projectRoot, DEFAULT_BASE_PATH);

  for (const tier of Object.keys(TIER_PATHS) as Tier[]) {
    const tierPath = path.join(basePath, TIER_PATHS[tier]);
    if (!fs.existsSync(tierPath)) {
      fs.mkdirSync(tierPath, { recursive: true });
    }
    regenerateIndex(tier, projectRoot);
  }
}
