/**
 * @sigil-tier gold
 * Sigil v6.1 — Workshop Builder
 *
 * Pre-computes the workshop index for 5ms lookups.
 * Extracts materials from node_modules and components from Sanctuary.
 *
 * v6.1: Uses js-yaml library instead of regex for parsing sigil.yaml.
 *
 * @module process/workshop-builder
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import {
  Workshop,
  WorkshopBuilderOptions,
  WorkshopBuildResult,
  WorkshopStalenessResult,
  MaterialEntry,
  ComponentEntry,
  ComponentTier,
  PhysicsDefinition,
  ZoneDefinition,
  DEFAULT_WORKSHOP_OPTIONS,
  EMPTY_WORKSHOP,
} from '../types/workshop';

// =============================================================================
// HASH UTILITIES
// =============================================================================

/**
 * Calculate MD5 hash of a file's contents.
 * Returns empty string if file doesn't exist.
 */
export function getFileHash(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return crypto.createHash('md5').update(content).digest('hex');
  } catch {
    return '';
  }
}

/**
 * Calculate MD5 hash of package.json.
 */
export function getPackageHash(projectRoot: string): string {
  return getFileHash(path.join(projectRoot, 'package.json'));
}

/**
 * Calculate MD5 hash of grimoires/sigil/state/imports.yaml.
 */
export function getImportsHash(projectRoot: string): string {
  return getFileHash(path.join(projectRoot, 'grimoires', 'sigil', 'state', 'imports.yaml'));
}

// =============================================================================
// STALENESS DETECTION
// =============================================================================

/**
 * Check if the workshop index is stale.
 * Compares stored hashes against current file hashes.
 */
export function checkWorkshopStaleness(
  projectRoot: string,
  workshopPath?: string
): WorkshopStalenessResult {
  const currentPackageHash = getPackageHash(projectRoot);
  const currentImportsHash = getImportsHash(projectRoot);

  const wsPath = workshopPath || path.join(projectRoot, '.sigil', 'workshop.json');

  // Check if workshop file exists
  if (!fs.existsSync(wsPath)) {
    return {
      stale: true,
      reason: 'missing',
      currentPackageHash,
      currentImportsHash,
    };
  }

  // Try to read workshop file
  let workshop: Workshop;
  try {
    const content = fs.readFileSync(wsPath, 'utf-8');
    workshop = JSON.parse(content) as Workshop;
  } catch {
    return {
      stale: true,
      reason: 'corrupted',
      currentPackageHash,
      currentImportsHash,
    };
  }

  // Compare hashes
  const storedPackageHash = workshop.package_hash || '';
  const storedImportsHash = workshop.imports_hash || '';

  if (currentPackageHash !== storedPackageHash) {
    return {
      stale: true,
      reason: 'package_changed',
      currentPackageHash,
      currentImportsHash,
      storedPackageHash,
      storedImportsHash,
    };
  }

  if (currentImportsHash !== storedImportsHash) {
    return {
      stale: true,
      reason: 'imports_changed',
      currentPackageHash,
      currentImportsHash,
      storedPackageHash,
      storedImportsHash,
    };
  }

  return {
    stale: false,
    currentPackageHash,
    currentImportsHash,
    storedPackageHash,
    storedImportsHash,
  };
}

/**
 * Check if workshop is stale (convenience function).
 */
export function isWorkshopStale(projectRoot: string, workshopPath?: string): boolean {
  return checkWorkshopStaleness(projectRoot, workshopPath).stale;
}

// =============================================================================
// MATERIAL EXTRACTION
// =============================================================================

/**
 * Read imports list from grimoires/sigil/state/imports.yaml.
 */
export function readImportsList(importsPath: string): string[] {
  try {
    const content = fs.readFileSync(importsPath, 'utf-8');
    // Simple YAML parsing for list of strings
    return content
      .split('\n')
      .map((line) => line.replace(/^-\s*/, '').trim())
      .filter((line) => line && !line.startsWith('#'));
  } catch {
    return [];
  }
}

/**
 * Extract exports from a TypeScript .d.ts file.
 */
export function extractExportsFromDts(dtsPath: string): string[] {
  try {
    const content = fs.readFileSync(dtsPath, 'utf-8');
    const exports: string[] = [];

    // Match "export { Name }" and "export { Name as Alias }"
    const namedExportRegex = /export\s*\{\s*([^}]+)\s*\}/g;
    let match;
    while ((match = namedExportRegex.exec(content)) !== null) {
      const names = match[1].split(',').map((n) => {
        const parts = n.trim().split(/\s+as\s+/);
        return parts[parts.length - 1].trim();
      });
      exports.push(...names.filter((n) => n && !n.includes('*')));
    }

    // Match "export const/function/class Name"
    const directExportRegex = /export\s+(?:const|let|var|function|class|type|interface)\s+(\w+)/g;
    while ((match = directExportRegex.exec(content)) !== null) {
      if (match[1] && !exports.includes(match[1])) {
        exports.push(match[1]);
      }
    }

    // Match "export default"
    if (/export\s+default/.test(content)) {
      exports.push('default');
    }

    return [...new Set(exports)];
  } catch {
    return [];
  }
}

/**
 * Extract type signatures from a .d.ts file.
 */
export function extractSignaturesFromDts(
  dtsPath: string,
  maxSignatures: number = 10
): Record<string, string> {
  try {
    const content = fs.readFileSync(dtsPath, 'utf-8');
    const signatures: Record<string, string> = {};
    let count = 0;

    // Match function signatures: "export function name(...): Type"
    const funcRegex = /export\s+(?:declare\s+)?function\s+(\w+)\s*(<[^>]*>)?\s*\(([^)]*)\)\s*:\s*([^;{]+)/g;
    let match;
    while ((match = funcRegex.exec(content)) !== null && count < maxSignatures) {
      const name = match[1];
      const generics = match[2] || '';
      const params = match[3].trim();
      const returnType = match[4].trim();
      signatures[name] = `${generics}(${params}) => ${returnType}`;
      count++;
    }

    // Match type/interface: "export type/interface Name = ..."
    const typeRegex = /export\s+(?:declare\s+)?(?:type|interface)\s+(\w+)/g;
    while ((match = typeRegex.exec(content)) !== null && count < maxSignatures) {
      if (!signatures[match[1]]) {
        signatures[match[1]] = 'Type';
        count++;
      }
    }

    return signatures;
  } catch {
    return {};
  }
}

/**
 * Extract material entry for a package from node_modules.
 */
export function extractMaterial(
  packageName: string,
  nodeModulesPath: string,
  includeSignatures: boolean = true,
  maxSignatures: number = 10
): MaterialEntry | null {
  const packagePath = path.join(nodeModulesPath, packageName);
  const packageJsonPath = path.join(packagePath, 'package.json');

  // Check if package exists
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
      // Try common locations
      const tryPaths = [
        path.join(packagePath, 'dist', 'index.d.ts'),
        path.join(packagePath, 'index.d.ts'),
        path.join(packagePath, 'lib', 'index.d.ts'),
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
    const signatures =
      includeSignatures && types_available
        ? extractSignaturesFromDts(typesPath, maxSignatures)
        : undefined;

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
// COMPONENT EXTRACTION
// =============================================================================

/**
 * Parse JSDoc pragmas from a file.
 */
export function parseJSDocPragmas(
  filePath: string
): {
  tier?: ComponentTier;
  zone?: string;
  physics?: string;
  vocabulary?: string[];
} {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const result: {
      tier?: ComponentTier;
      zone?: string;
      physics?: string;
      vocabulary?: string[];
    } = {};

    // Match @sigil-tier
    const tierMatch = content.match(/@sigil-tier\s+(gold|silver|bronze|draft)/);
    if (tierMatch) {
      result.tier = tierMatch[1] as ComponentTier;
    }

    // Match @sigil-zone
    const zoneMatch = content.match(/@sigil-zone\s+(\w+)/);
    if (zoneMatch) {
      result.zone = zoneMatch[1];
    }

    // Match @sigil-physics
    const physicsMatch = content.match(/@sigil-physics\s+(\w+)/);
    if (physicsMatch) {
      result.physics = physicsMatch[1];
    }

    // Match @sigil-vocabulary (can be comma-separated)
    const vocabMatch = content.match(/@sigil-vocabulary\s+([^\n*]+)/);
    if (vocabMatch) {
      result.vocabulary = vocabMatch[1]
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v);
    }

    return result;
  } catch {
    return {};
  }
}

/**
 * Extract imports from a TypeScript file.
 */
export function extractImportsFromFile(filePath: string): string[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const imports: string[] = [];

    // Match ES imports: from 'package' or from "package"
    const importRegex = /from\s+['"]([^'"./][^'"]*)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      // Extract package name (handle scoped packages)
      const pkg = match[1];
      const packageName = pkg.startsWith('@')
        ? pkg.split('/').slice(0, 2).join('/')
        : pkg.split('/')[0];
      if (!imports.includes(packageName)) {
        imports.push(packageName);
      }
    }

    return imports;
  } catch {
    return [];
  }
}

/**
 * Extract component entry from a file.
 */
export function extractComponent(
  filePath: string,
  projectRoot: string
): ComponentEntry | null {
  const pragmas = parseJSDocPragmas(filePath);

  // Only include files with @sigil-tier pragma
  if (!pragmas.tier) {
    return null;
  }

  const relativePath = path.relative(projectRoot, filePath);
  const imports = extractImportsFromFile(filePath);

  // Calculate file hash for verify-on-read (v6.1)
  let hash: string | undefined;
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    hash = crypto.createHash('md5').update(content).digest('hex');
  } catch {
    // Ignore hash errors
  }

  return {
    path: relativePath,
    tier: pragmas.tier,
    zone: pragmas.zone,
    physics: pragmas.physics,
    vocabulary: pragmas.vocabulary,
    imports,
    hash,
    indexed_at: new Date().toISOString(),
  };
}

/**
 * Scan sanctuary directory for components.
 */
export function scanSanctuary(
  sanctuaryPath: string,
  projectRoot: string
): Record<string, ComponentEntry> {
  const components: Record<string, ComponentEntry> = {};

  if (!fs.existsSync(sanctuaryPath)) {
    return components;
  }

  function scanDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
        const component = extractComponent(fullPath, projectRoot);
        if (component) {
          // Use filename without extension as component name
          const name = path.basename(entry.name).replace(/\.(tsx?|jsx?)$/, '');
          components[name] = component;
        }
      }
    }
  }

  scanDir(sanctuaryPath);
  return components;
}

// =============================================================================
// SIGIL CONFIG PARSING
// =============================================================================

/**
 * Raw sigil.yaml structure for parsing.
 */
interface SigilConfigRaw {
  physics?: Record<string, {
    timing?: string;
    easing?: string;
    description?: string;
  }>;
  zones?: Record<string, {
    physics?: string;
    timing?: string;
    description?: string;
  }>;
}

/**
 * Parse sigil.yaml for physics and zone definitions.
 * v6.1: Uses yaml library instead of regex for safer parsing.
 */
export function parseSigilConfig(configPath: string): {
  physics: Record<string, PhysicsDefinition>;
  zones: Record<string, ZoneDefinition>;
} {
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    const parsed = yaml.parse(content) as SigilConfigRaw;

    const physics: Record<string, PhysicsDefinition> = {};
    const zones: Record<string, ZoneDefinition> = {};

    // Parse physics section
    if (parsed.physics) {
      for (const [name, def] of Object.entries(parsed.physics)) {
        physics[name] = {
          timing: def.timing || '',
          easing: def.easing || '',
          description: def.description || '',
        };
      }
    }

    // Parse zones section
    if (parsed.zones) {
      for (const [name, def] of Object.entries(parsed.zones)) {
        zones[name] = {
          physics: def.physics || '',
          timing: def.timing || '',
          description: def.description || '',
        };
      }
    }

    return { physics, zones };
  } catch {
    return { physics: {}, zones: {} };
  }
}

// =============================================================================
// WORKSHOP BUILDER
// =============================================================================

/**
 * Build the workshop index.
 */
export async function buildWorkshop(
  options: Partial<WorkshopBuilderOptions> = {}
): Promise<WorkshopBuildResult> {
  const startTime = Date.now();
  const warnings: string[] = [];

  // Merge with defaults
  const opts: WorkshopBuilderOptions = {
    projectRoot: options.projectRoot || process.cwd(),
    ...DEFAULT_WORKSHOP_OPTIONS,
    ...options,
  };

  const {
    projectRoot,
    packageJsonPath,
    importsPath,
    sigilConfigPath,
    sanctuaryPath,
    outputPath,
    includeSignatures,
    maxSignaturesPerPackage,
  } = opts;

  try {
    // Calculate hashes
    const package_hash = getPackageHash(projectRoot);
    const imports_hash = getImportsHash(projectRoot);

    if (!package_hash) {
      warnings.push('package.json not found or unreadable');
    }

    // Read imports list
    const importsFullPath = path.join(projectRoot, importsPath!);
    const importsList = readImportsList(importsFullPath);

    if (importsList.length === 0) {
      warnings.push('No imports found in imports.yaml');
    }

    // Extract materials from node_modules
    const nodeModulesPath = path.join(projectRoot, 'node_modules');
    const materials: Record<string, MaterialEntry> = {};

    for (const packageName of importsList) {
      const material = extractMaterial(
        packageName,
        nodeModulesPath,
        includeSignatures,
        maxSignaturesPerPackage
      );
      if (material) {
        materials[packageName] = material;
      } else {
        warnings.push(`Could not extract material for: ${packageName}`);
      }
    }

    // Scan sanctuary for components
    const sanctuaryFullPath = path.join(projectRoot, sanctuaryPath!);
    const components = scanSanctuary(sanctuaryFullPath, projectRoot);

    // Parse sigil.yaml for physics and zones
    const configFullPath = path.join(projectRoot, sigilConfigPath!);
    const { physics, zones } = parseSigilConfig(configFullPath);

    // Build workshop
    const workshop: Workshop = {
      indexed_at: new Date().toISOString(),
      package_hash,
      imports_hash,
      materials,
      components,
      physics,
      zones,
    };

    // Ensure output directory exists
    const outputFullPath = path.join(projectRoot, outputPath!);
    const outputDir = path.dirname(outputFullPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write workshop file
    fs.writeFileSync(outputFullPath, JSON.stringify(workshop, null, 2));

    const durationMs = Date.now() - startTime;

    return {
      success: true,
      outputPath: outputFullPath,
      materialCount: Object.keys(materials).length,
      componentCount: Object.keys(components).length,
      durationMs,
      warnings,
    };
  } catch (error) {
    return {
      success: false,
      outputPath: path.join(projectRoot, outputPath!),
      materialCount: 0,
      componentCount: 0,
      durationMs: Date.now() - startTime,
      warnings,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Load workshop from disk.
 */
export function loadWorkshop(workshopPath: string): Workshop {
  try {
    const content = fs.readFileSync(workshopPath, 'utf-8');
    return JSON.parse(content) as Workshop;
  } catch {
    return EMPTY_WORKSHOP;
  }
}

/**
 * Query the workshop for a material.
 */
export function queryMaterial(workshop: Workshop, name: string): MaterialEntry | null {
  return workshop.materials[name] || null;
}

/**
 * Query the workshop for a component.
 */
export function queryComponent(workshop: Workshop, name: string): ComponentEntry | null {
  return workshop.components[name] || null;
}

/**
 * Query the workshop for a physics definition.
 */
export function queryPhysics(workshop: Workshop, name: string): PhysicsDefinition | null {
  return workshop.physics[name] || null;
}

/**
 * Query the workshop for a zone definition.
 */
export function queryZone(workshop: Workshop, name: string): ZoneDefinition | null {
  return workshop.zones[name] || null;
}
