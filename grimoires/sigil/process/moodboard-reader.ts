/**
 * Sigil v3.1 — Moodboard Reader
 *
 * Reads and indexes the moodboard directory for design inspiration.
 * Implements graceful degradation: never throws, always returns valid data.
 *
 * Philosophy: "Your taste, versioned and queryable."
 *
 * @module process/moodboard-reader
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import matter from 'gray-matter';
import YAML from 'yaml';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Category of moodboard entry.
 */
export type MoodboardCategory =
  | 'reference'
  | 'article'
  | 'anti-pattern'
  | 'gtm'
  | 'screenshot';

/**
 * Severity level for anti-patterns.
 */
export type AntiPatternSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Frontmatter from a markdown file.
 */
export interface MoodboardFrontmatter {
  /** Source name (e.g., "Stripe", "Linear") */
  source?: string;
  /** Original URL */
  url?: string;
  /** Applicable zones */
  zones?: string[];
  /** Applicable materials */
  materials?: string[];
  /** Related vocabulary terms */
  terms?: string[];
  /** When this was captured */
  captured?: string;
  /** Severity (for anti-patterns) */
  severity?: AntiPatternSeverity;
  /** Custom tags */
  tags?: string[];
}

/**
 * A parsed moodboard entry.
 */
export interface MoodboardEntry {
  /** Unique ID (relative path without extension) */
  id: string;
  /** Entry category */
  category: MoodboardCategory;
  /** File path relative to moodboard/ */
  path: string;
  /** File type */
  type: 'markdown' | 'image';
  /** Parsed frontmatter (markdown only) */
  frontmatter: MoodboardFrontmatter;
  /** Markdown content without frontmatter (markdown only) */
  content: string;
  /** Title extracted from first H1 or filename */
  title: string;
  /** Inferred source from path (e.g., references/stripe/ → 'stripe') */
  inferredSource?: string;
}

/**
 * Featured reference from index.yaml.
 */
export interface FeaturedReference {
  /** Path to the entry */
  path: string;
  /** Why this is featured */
  why: string;
}

/**
 * The moodboard index from index.yaml.
 */
export interface MoodboardIndex {
  /** Version */
  version: string;
  /** Featured references */
  featured: FeaturedReference[];
  /** Tag → paths mapping */
  tags: Record<string, string[]>;
}

/**
 * Statistics about the moodboard.
 */
export interface MoodboardStats {
  total: number;
  byCategory: Record<MoodboardCategory, number>;
  byType: { markdown: number; image: number };
}

/**
 * The complete moodboard.
 */
export interface Moodboard {
  /** Parsed entries */
  entries: MoodboardEntry[];
  /** Optional curated index */
  index: MoodboardIndex | null;
  /** Statistics */
  stats: MoodboardStats;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Default path to the moodboard directory.
 */
export const DEFAULT_MOODBOARD_PATH = 'sigil-mark/moodboard';

/**
 * Maximum directory scan depth.
 */
export const MAX_SCAN_DEPTH = 3;

/**
 * Supported image extensions.
 */
export const SUPPORTED_IMAGE_EXTENSIONS = ['.png', '.gif', '.jpg', '.jpeg', '.webp', '.svg'];

/**
 * Directory name to category mapping.
 */
export const CATEGORY_DIRECTORIES: Record<string, MoodboardCategory> = {
  'references': 'reference',
  'articles': 'article',
  'anti-patterns': 'anti-pattern',
  'gtm': 'gtm',
  'screenshots': 'screenshot',
};

/**
 * Default empty moodboard.
 */
export const DEFAULT_MOODBOARD: Moodboard = {
  entries: [],
  index: null,
  stats: {
    total: 0,
    byCategory: {
      reference: 0,
      article: 0,
      'anti-pattern': 0,
      gtm: 0,
      screenshot: 0,
    },
    byType: { markdown: 0, image: 0 },
  },
};

/**
 * Maximum file size to read (1MB).
 */
const MAX_FILE_SIZE = 1024 * 1024;

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validates a severity value.
 */
function isValidSeverity(value: unknown): value is AntiPatternSeverity {
  return value === 'low' || value === 'medium' || value === 'high' || value === 'critical';
}

/**
 * Validates and normalizes frontmatter.
 */
function normalizeFrontmatter(data: Record<string, unknown>): MoodboardFrontmatter {
  const frontmatter: MoodboardFrontmatter = {};

  if (typeof data.source === 'string') {
    frontmatter.source = data.source;
  }

  if (typeof data.url === 'string') {
    frontmatter.url = data.url;
  }

  if (Array.isArray(data.zones)) {
    frontmatter.zones = data.zones.filter((z): z is string => typeof z === 'string');
  }

  if (Array.isArray(data.materials)) {
    frontmatter.materials = data.materials.filter((m): m is string => typeof m === 'string');
  }

  if (Array.isArray(data.terms)) {
    frontmatter.terms = data.terms.filter((t): t is string => typeof t === 'string');
  }

  if (typeof data.captured === 'string') {
    frontmatter.captured = data.captured;
  }

  if (isValidSeverity(data.severity)) {
    frontmatter.severity = data.severity;
  }

  if (Array.isArray(data.tags)) {
    frontmatter.tags = data.tags.filter((t): t is string => typeof t === 'string');
  }

  return frontmatter;
}

/**
 * Validates a featured reference.
 */
function isValidFeaturedReference(value: unknown): value is FeaturedReference {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return typeof obj.path === 'string' && typeof obj.why === 'string';
}

/**
 * Validates and normalizes an index.
 */
function normalizeIndex(parsed: unknown): MoodboardIndex | null {
  if (typeof parsed !== 'object' || parsed === null) {
    return null;
  }

  const obj = parsed as Record<string, unknown>;
  const version = typeof obj.version === 'string' ? obj.version : '1.0';

  const featured: FeaturedReference[] = [];
  if (Array.isArray(obj.featured)) {
    for (const item of obj.featured) {
      if (isValidFeaturedReference(item)) {
        featured.push({ path: item.path, why: item.why });
      }
    }
  }

  const tags: Record<string, string[]> = {};
  if (typeof obj.tags === 'object' && obj.tags !== null) {
    for (const [tag, paths] of Object.entries(obj.tags as Record<string, unknown>)) {
      if (Array.isArray(paths)) {
        tags[tag] = paths.filter((p): p is string => typeof p === 'string');
      }
    }
  }

  return { version, featured, tags };
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Extracts title from markdown content or filename.
 */
function extractTitle(content: string, filename: string): string {
  // Try to find first H1
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }

  // Fall back to filename
  return filename
    .replace(/\.(md|png|gif|jpg|jpeg|webp|svg)$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Infers source from relative path.
 */
function inferSource(relativePath: string): string | undefined {
  // references/stripe/checkout.md → 'stripe'
  const parts = relativePath.split('/');
  if (parts[0] === 'references' && parts.length >= 2) {
    return parts[1].toLowerCase();
  }
  return undefined;
}

/**
 * Determines category from directory name.
 */
function getCategoryFromPath(relativePath: string): MoodboardCategory {
  const parts = relativePath.split('/');
  const dir = parts[0];
  return CATEGORY_DIRECTORIES[dir] || 'reference';
}

/**
 * Checks if a file is an image based on extension.
 */
function isImageFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return SUPPORTED_IMAGE_EXTENSIONS.includes(ext);
}

/**
 * Creates an entry ID from relative path.
 */
function createEntryId(relativePath: string): string {
  return relativePath
    .replace(/\.(md|png|gif|jpg|jpeg|webp|svg)$/i, '')
    .replace(/\\/g, '/');
}

// =============================================================================
// SCANNER
// =============================================================================

/**
 * Recursively scans a directory for files.
 */
async function scanDirectory(
  basePath: string,
  relativePath: string = '',
  depth: number = 0
): Promise<string[]> {
  if (depth > MAX_SCAN_DEPTH) {
    return [];
  }

  const fullPath = path.join(basePath, relativePath);
  const files: string[] = [];

  try {
    const entries = await fs.readdir(fullPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryRelativePath = relativePath
        ? `${relativePath}/${entry.name}`
        : entry.name;

      // Skip hidden files and README
      if (entry.name.startsWith('.') || entry.name === 'README.md') {
        continue;
      }

      if (entry.isDirectory()) {
        const subFiles = await scanDirectory(basePath, entryRelativePath, depth + 1);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ext === '.md' || isImageFile(entry.name)) {
          files.push(entryRelativePath);
        }
      }
    }
  } catch (error) {
    // Skip directories we can't read
    console.warn(`[Sigil Moodboard] Could not scan directory: ${fullPath}`);
  }

  return files;
}

/**
 * Scans directory synchronously.
 */
function scanDirectorySync(
  basePath: string,
  relativePath: string = '',
  depth: number = 0
): string[] {
  if (depth > MAX_SCAN_DEPTH) {
    return [];
  }

  const fullPath = path.join(basePath, relativePath);
  const files: string[] = [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fsSync = require('fs');
    const entries = fsSync.readdirSync(fullPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryRelativePath = relativePath
        ? `${relativePath}/${entry.name}`
        : entry.name;

      // Skip hidden files and README
      if (entry.name.startsWith('.') || entry.name === 'README.md') {
        continue;
      }

      if (entry.isDirectory()) {
        const subFiles = scanDirectorySync(basePath, entryRelativePath, depth + 1);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ext === '.md' || isImageFile(entry.name)) {
          files.push(entryRelativePath);
        }
      }
    }
  } catch {
    // Skip directories we can't read
  }

  return files;
}

// =============================================================================
// PARSER
// =============================================================================

/**
 * Parses a markdown file into a moodboard entry.
 */
async function parseMarkdownFile(
  basePath: string,
  relativePath: string
): Promise<MoodboardEntry | null> {
  const fullPath = path.join(basePath, relativePath);

  try {
    const stat = await fs.stat(fullPath);
    if (stat.size > MAX_FILE_SIZE) {
      console.warn(`[Sigil Moodboard] File too large, skipping: ${relativePath}`);
      return null;
    }

    const rawContent = await fs.readFile(fullPath, 'utf-8');
    const { data, content } = matter(rawContent);

    const filename = path.basename(relativePath);
    const frontmatter = normalizeFrontmatter(data as Record<string, unknown>);

    return {
      id: createEntryId(relativePath),
      category: getCategoryFromPath(relativePath),
      path: relativePath,
      type: 'markdown',
      frontmatter,
      content: content.trim(),
      title: extractTitle(content, filename),
      inferredSource: frontmatter.source || inferSource(relativePath),
    };
  } catch (error) {
    console.warn(`[Sigil Moodboard] Could not parse file: ${relativePath}`);
    return null;
  }
}

/**
 * Parses a markdown file synchronously.
 */
function parseMarkdownFileSync(
  basePath: string,
  relativePath: string
): MoodboardEntry | null {
  const fullPath = path.join(basePath, relativePath);

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fsSync = require('fs');
    const stat = fsSync.statSync(fullPath);
    if (stat.size > MAX_FILE_SIZE) {
      return null;
    }

    const rawContent = fsSync.readFileSync(fullPath, 'utf-8');
    const { data, content } = matter(rawContent);

    const filename = path.basename(relativePath);
    const frontmatter = normalizeFrontmatter(data as Record<string, unknown>);

    return {
      id: createEntryId(relativePath),
      category: getCategoryFromPath(relativePath),
      path: relativePath,
      type: 'markdown',
      frontmatter,
      content: content.trim(),
      title: extractTitle(content, filename),
      inferredSource: frontmatter.source || inferSource(relativePath),
    };
  } catch {
    return null;
  }
}

/**
 * Creates an entry for an image file.
 */
function createImageEntry(relativePath: string): MoodboardEntry {
  const filename = path.basename(relativePath);

  return {
    id: createEntryId(relativePath),
    category: getCategoryFromPath(relativePath),
    path: relativePath,
    type: 'image',
    frontmatter: {},
    content: '',
    title: extractTitle('', filename),
    inferredSource: inferSource(relativePath),
  };
}

// =============================================================================
// READER FUNCTIONS
// =============================================================================

/**
 * Reads and indexes the moodboard directory.
 *
 * Implements graceful degradation:
 * - If directory doesn't exist: returns empty moodboard
 * - If files are invalid: skips them
 * - Never throws
 *
 * @param basePath - Path to the moodboard directory
 * @returns Parsed moodboard
 *
 * @example
 * ```ts
 * const moodboard = await readMoodboard();
 * const stripeRefs = getEntriesForSource(moodboard, 'stripe');
 * ```
 */
export async function readMoodboard(
  basePath: string = DEFAULT_MOODBOARD_PATH
): Promise<Moodboard> {
  try {
    const resolvedPath = path.isAbsolute(basePath)
      ? basePath
      : path.resolve(process.cwd(), basePath);

    // Check if directory exists
    try {
      await fs.access(resolvedPath);
    } catch {
      console.warn(`[Sigil Moodboard] Directory not found: ${basePath}, using defaults`);
      return DEFAULT_MOODBOARD;
    }

    // Read index.yaml if exists
    let index: MoodboardIndex | null = null;
    const indexPath = path.join(resolvedPath, 'index.yaml');
    try {
      const indexContent = await fs.readFile(indexPath, 'utf-8');
      const parsed = YAML.parse(indexContent);
      index = normalizeIndex(parsed);
    } catch {
      // No index file, that's fine
    }

    // Scan all category directories
    const allFiles: string[] = [];
    for (const dir of Object.keys(CATEGORY_DIRECTORIES)) {
      const dirPath = path.join(resolvedPath, dir);
      try {
        await fs.access(dirPath);
        const files = await scanDirectory(resolvedPath, dir);
        allFiles.push(...files);
      } catch {
        // Directory doesn't exist, skip
      }
    }

    // Parse files
    const entries: MoodboardEntry[] = [];
    for (const relativePath of allFiles) {
      if (relativePath.endsWith('.md')) {
        const entry = await parseMarkdownFile(resolvedPath, relativePath);
        if (entry) {
          entries.push(entry);
        }
      } else if (isImageFile(relativePath)) {
        entries.push(createImageEntry(relativePath));
      }
    }

    // Calculate statistics
    const stats = calculateStats(entries);

    return { entries, index, stats };
  } catch (error) {
    console.error(`[Sigil Moodboard] Error reading moodboard: ${error}`);
    return DEFAULT_MOODBOARD;
  }
}

/**
 * Synchronously reads and indexes the moodboard directory.
 *
 * @param basePath - Path to the moodboard directory
 * @returns Parsed moodboard
 */
export function readMoodboardSync(
  basePath: string = DEFAULT_MOODBOARD_PATH
): Moodboard {
  try {
    const resolvedPath = path.isAbsolute(basePath)
      ? basePath
      : path.resolve(process.cwd(), basePath);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fsSync = require('fs');

    // Check if directory exists
    try {
      fsSync.accessSync(resolvedPath);
    } catch {
      console.warn(`[Sigil Moodboard] Directory not found: ${basePath}, using defaults`);
      return DEFAULT_MOODBOARD;
    }

    // Read index.yaml if exists
    let index: MoodboardIndex | null = null;
    const indexPath = path.join(resolvedPath, 'index.yaml');
    try {
      const indexContent = fsSync.readFileSync(indexPath, 'utf-8');
      const parsed = YAML.parse(indexContent);
      index = normalizeIndex(parsed);
    } catch {
      // No index file
    }

    // Scan all category directories
    const allFiles: string[] = [];
    for (const dir of Object.keys(CATEGORY_DIRECTORIES)) {
      const dirPath = path.join(resolvedPath, dir);
      try {
        fsSync.accessSync(dirPath);
        const files = scanDirectorySync(resolvedPath, dir);
        allFiles.push(...files);
      } catch {
        // Directory doesn't exist
      }
    }

    // Parse files
    const entries: MoodboardEntry[] = [];
    for (const relativePath of allFiles) {
      if (relativePath.endsWith('.md')) {
        const entry = parseMarkdownFileSync(resolvedPath, relativePath);
        if (entry) {
          entries.push(entry);
        }
      } else if (isImageFile(relativePath)) {
        entries.push(createImageEntry(relativePath));
      }
    }

    // Calculate statistics
    const stats = calculateStats(entries);

    return { entries, index, stats };
  } catch (error) {
    console.error(`[Sigil Moodboard] Error reading moodboard: ${error}`);
    return DEFAULT_MOODBOARD;
  }
}

/**
 * Calculates statistics for entries.
 */
function calculateStats(entries: MoodboardEntry[]): MoodboardStats {
  const byCategory: Record<MoodboardCategory, number> = {
    reference: 0,
    article: 0,
    'anti-pattern': 0,
    gtm: 0,
    screenshot: 0,
  };

  const byType = { markdown: 0, image: 0 };

  for (const entry of entries) {
    byCategory[entry.category]++;
    byType[entry.type]++;
  }

  return {
    total: entries.length,
    byCategory,
    byType,
  };
}

// =============================================================================
// QUERY HELPERS
// =============================================================================

/**
 * Gets all entries for a specific zone.
 *
 * @param moodboard - The moodboard to search
 * @param zone - The zone to filter by (case-insensitive)
 * @returns Array of entries for the zone
 */
export function getEntriesForZone(
  moodboard: Moodboard,
  zone: string
): MoodboardEntry[] {
  const normalizedZone = zone.toLowerCase();
  return moodboard.entries.filter(
    (entry) =>
      entry.frontmatter.zones?.some((z) => z.toLowerCase() === normalizedZone)
  );
}

/**
 * Gets all entries for a specific material.
 *
 * @param moodboard - The moodboard to search
 * @param material - The material to filter by (case-insensitive)
 * @returns Array of entries for the material
 */
export function getEntriesForMaterial(
  moodboard: Moodboard,
  material: string
): MoodboardEntry[] {
  const normalizedMaterial = material.toLowerCase();
  return moodboard.entries.filter(
    (entry) =>
      entry.frontmatter.materials?.some((m) => m.toLowerCase() === normalizedMaterial)
  );
}

/**
 * Gets all entries for a vocabulary term.
 *
 * @param moodboard - The moodboard to search
 * @param term - The term to filter by (case-insensitive)
 * @returns Array of entries for the term
 */
export function getEntriesForTerm(
  moodboard: Moodboard,
  term: string
): MoodboardEntry[] {
  const normalizedTerm = term.toLowerCase();
  return moodboard.entries.filter(
    (entry) =>
      entry.frontmatter.terms?.some((t) => t.toLowerCase() === normalizedTerm)
  );
}

/**
 * Gets all anti-patterns, optionally filtered by severity.
 *
 * @param moodboard - The moodboard to search
 * @param severity - Optional severity to filter by
 * @returns Array of anti-pattern entries
 */
export function getAntiPatterns(
  moodboard: Moodboard,
  severity?: AntiPatternSeverity
): MoodboardEntry[] {
  return moodboard.entries.filter((entry) => {
    if (entry.category !== 'anti-pattern') {
      return false;
    }
    if (severity && entry.frontmatter.severity !== severity) {
      return false;
    }
    return true;
  });
}

/**
 * Gets all entries from a specific source.
 *
 * @param moodboard - The moodboard to search
 * @param source - The source to filter by (case-insensitive)
 * @returns Array of entries from the source
 */
export function getEntriesForSource(
  moodboard: Moodboard,
  source: string
): MoodboardEntry[] {
  const normalizedSource = source.toLowerCase();
  return moodboard.entries.filter((entry) => {
    const entrySource = entry.frontmatter.source?.toLowerCase() || entry.inferredSource;
    return entrySource === normalizedSource;
  });
}

/**
 * Gets featured references from index.yaml.
 *
 * @param moodboard - The moodboard to search
 * @returns Array of featured entries with reasons
 */
export function getFeaturedReferences(
  moodboard: Moodboard
): Array<{ entry: MoodboardEntry | null; why: string; path: string }> {
  if (!moodboard.index) {
    return [];
  }

  return moodboard.index.featured.map((featured) => {
    const entry = moodboard.entries.find(
      (e) => e.path === featured.path || e.id === featured.path.replace(/\.(md|png|gif|jpg|jpeg|webp|svg)$/i, '')
    );
    return {
      entry: entry || null,
      why: featured.why,
      path: featured.path,
    };
  });
}

/**
 * Searches moodboard by text query.
 *
 * @param moodboard - The moodboard to search
 * @param query - Search query (case-insensitive)
 * @returns Array of matching entries
 */
export function searchMoodboard(
  moodboard: Moodboard,
  query: string
): MoodboardEntry[] {
  const normalizedQuery = query.toLowerCase();
  return moodboard.entries.filter((entry) => {
    // Search in title
    if (entry.title.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    // Search in content
    if (entry.content.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    // Search in source
    if (entry.frontmatter.source?.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    if (entry.inferredSource?.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    // Search in path
    if (entry.path.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    return false;
  });
}

/**
 * Gets entries by custom tag.
 *
 * @param moodboard - The moodboard to search
 * @param tag - The tag to filter by (case-insensitive)
 * @returns Array of entries with the tag
 */
export function getEntriesByTag(
  moodboard: Moodboard,
  tag: string
): MoodboardEntry[] {
  const normalizedTag = tag.toLowerCase();

  // First check index tags
  if (moodboard.index?.tags[normalizedTag]) {
    const paths = moodboard.index.tags[normalizedTag];
    return moodboard.entries.filter(
      (entry) =>
        paths.includes(entry.path) ||
        paths.includes(entry.id)
    );
  }

  // Fall back to frontmatter tags
  return moodboard.entries.filter(
    (entry) =>
      entry.frontmatter.tags?.some((t) => t.toLowerCase() === normalizedTag)
  );
}

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

/**
 * Formats an entry for display.
 *
 * @param entry - The entry to format
 * @returns Formatted string
 */
export function formatEntrySummary(entry: MoodboardEntry): string {
  const lines: string[] = [
    `${entry.title} (${entry.category})`,
    `  Path: ${entry.path}`,
    `  Type: ${entry.type}`,
  ];

  if (entry.inferredSource || entry.frontmatter.source) {
    lines.push(`  Source: ${entry.frontmatter.source || entry.inferredSource}`);
  }

  if (entry.frontmatter.zones?.length) {
    lines.push(`  Zones: ${entry.frontmatter.zones.join(', ')}`);
  }

  if (entry.frontmatter.materials?.length) {
    lines.push(`  Materials: ${entry.frontmatter.materials.join(', ')}`);
  }

  if (entry.frontmatter.severity) {
    lines.push(`  Severity: ${entry.frontmatter.severity}`);
  }

  return lines.join('\n');
}

/**
 * Formats moodboard statistics.
 *
 * @param moodboard - The moodboard to summarize
 * @returns Formatted string
 */
export function formatMoodboardSummary(moodboard: Moodboard): string {
  const { stats, index } = moodboard;

  const lines: string[] = [
    `Sigil Moodboard`,
    `  Total entries: ${stats.total}`,
    ``,
    `By Category:`,
    `  - References: ${stats.byCategory.reference}`,
    `  - Articles: ${stats.byCategory.article}`,
    `  - Anti-patterns: ${stats.byCategory['anti-pattern']}`,
    `  - GTM: ${stats.byCategory.gtm}`,
    `  - Screenshots: ${stats.byCategory.screenshot}`,
    ``,
    `By Type:`,
    `  - Markdown: ${stats.byType.markdown}`,
    `  - Images: ${stats.byType.image}`,
  ];

  if (index?.featured.length) {
    lines.push(``, `Featured: ${index.featured.length} entries`);
  }

  return lines.join('\n');
}
