/**
 * Sigil v1.2.4 - Zone Resolution
 *
 * Resolves zone configuration from file path by walking up
 * directory tree and merging .sigilrc.yaml files.
 */

import * as fs from 'fs';
import * as path from 'path';

export type RecipeSet = 'decisive' | 'machinery' | 'glass';
export type SyncMode = 'server_authoritative' | 'client_authoritative';
export type ConstraintLevel = 'forbidden' | 'warn';

export interface ZoneConstraints {
  optimistic_ui?: ConstraintLevel;
  loading_spinners?: ConstraintLevel;
  raw_physics?: ConstraintLevel;
  [key: string]: ConstraintLevel | undefined;
}

export interface ZoneConfig {
  /** Zone identifier from path */
  zone: string;
  /** Recipe set to use */
  recipes: RecipeSet;
  /** Sync mode for the zone */
  sync: SyncMode;
  /** Server tick timing (if applicable) */
  tick?: string;
  /** Zone constraints */
  constraints: ZoneConstraints;
  /** Config files used in resolution (ordered) */
  configChain: string[];
  /** Original file path that was resolved */
  resolvedFrom: string;
}

interface RawConfig {
  sigil?: string;
  recipes?: string;
  sync?: string;
  tick?: string;
  constraints?: Record<string, string>;
}

/**
 * Parse a simple YAML-like config file
 * Note: For production, use a proper YAML parser
 */
function parseSimpleYaml(content: string): RawConfig {
  const config: RawConfig = {};
  const lines = content.split('\n');

  let inConstraints = false;
  const constraints: Record<string, string> = {};

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (trimmed.startsWith('#') || trimmed === '') {
      continue;
    }

    // Check for constraints section
    if (trimmed === 'constraints:') {
      inConstraints = true;
      continue;
    }

    // Parse key-value
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.slice(0, colonIndex).trim();
    let value = trimmed.slice(colonIndex + 1).trim();

    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Check indentation for constraints
    if (inConstraints && line.startsWith('  ')) {
      constraints[key] = value;
    } else {
      inConstraints = false;

      switch (key) {
        case 'sigil':
          config.sigil = value;
          break;
        case 'recipes':
          config.recipes = value;
          break;
        case 'sync':
          config.sync = value;
          break;
        case 'tick':
          config.tick = value;
          break;
      }
    }
  }

  if (Object.keys(constraints).length > 0) {
    config.constraints = constraints;
  }

  return config;
}

/**
 * Find project root (git root or cwd)
 */
function findProjectRoot(startPath: string): string {
  let current = startPath;

  while (current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, '.git'))) {
      return current;
    }
    current = path.dirname(current);
  }

  return process.cwd();
}

/**
 * Resolve zone configuration from a file path
 *
 * @param filePath - Path to the file or directory
 * @param projectRoot - Optional project root override
 * @returns Resolved zone configuration
 *
 * @example
 * ```ts
 * const config = resolveZone('src/checkout/ConfirmButton.tsx');
 * // Returns: { zone: 'src/checkout', recipes: 'decisive', ... }
 * ```
 */
export function resolveZone(
  filePath: string,
  projectRoot?: string
): ZoneConfig {
  // Normalize path
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  const root = projectRoot || findProjectRoot(absolutePath);

  // Get directory (if file, use parent)
  let currentDir: string;
  try {
    const stat = fs.statSync(absolutePath);
    currentDir = stat.isDirectory() ? absolutePath : path.dirname(absolutePath);
  } catch {
    currentDir = path.dirname(absolutePath);
  }

  // Default config
  let recipes: RecipeSet = 'machinery';
  let sync: SyncMode = 'client_authoritative';
  let tick: string | undefined;
  let constraints: ZoneConstraints = {};
  const configChain: string[] = [];

  // Collect configs from root to current (root first)
  const configPaths: string[] = [];
  let dir = currentDir;

  while (dir.startsWith(root) || dir === root) {
    const configPath = path.join(dir, '.sigilrc.yaml');
    if (fs.existsSync(configPath)) {
      configPaths.unshift(configPath); // Add to front
    }

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  // Merge configs (later overrides earlier)
  for (const configPath of configPaths) {
    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      const parsed = parseSimpleYaml(content);

      if (parsed.recipes) {
        recipes = parsed.recipes as RecipeSet;
      }
      if (parsed.sync) {
        sync = parsed.sync as SyncMode;
      }
      if (parsed.tick) {
        tick = parsed.tick;
      }
      if (parsed.constraints) {
        constraints = {
          ...constraints,
          ...Object.fromEntries(
            Object.entries(parsed.constraints).map(([k, v]) => [
              k,
              v as ConstraintLevel,
            ])
          ),
        };
      }

      configChain.push(configPath);
    } catch {
      // Skip unreadable configs
    }
  }

  // Determine zone name from relative path
  const relativePath = path.relative(root, absolutePath);
  const pathParts = relativePath.split(path.sep);
  const zone = pathParts.slice(0, 2).join('/');

  return {
    zone,
    recipes,
    sync,
    tick,
    constraints,
    configChain,
    resolvedFrom: absolutePath,
  };
}

/**
 * Check if a constraint is violated
 *
 * @param config - Zone config to check against
 * @param constraint - Constraint name to check
 * @returns True if constraint is forbidden
 */
export function isConstraintViolation(
  config: ZoneConfig,
  constraint: string
): boolean {
  return config.constraints[constraint] === 'forbidden';
}

/**
 * Get available recipes for a zone
 *
 * @param config - Zone config
 * @returns Path to recipes directory
 */
export function getRecipesPath(config: ZoneConfig): string {
  return `sigil-mark/recipes/${config.recipes}`;
}

export default resolveZone;
