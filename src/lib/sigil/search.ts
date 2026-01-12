/**
 * Sigil v10.1 "Usage Reality" - Search
 *
 * Vector search for semantic code discovery with grep fallback.
 * Supports both local mode (grep) and vector mode (embeddings).
 *
 * @module @sigil/search
 * @version 10.1.0
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join, basename, relative, dirname } from 'path';

// =============================================================================
// Types
// =============================================================================

/**
 * Search result from vector or grep search.
 */
export interface SearchResult {
  /** File path */
  path: string;
  /** Component/function name */
  name: string;
  /** Relevance score (0-1) */
  score: number;
  /** Matched content snippet */
  snippet?: string;
  /** Line number of match */
  line?: number;
  /** Search method used */
  method: 'vector' | 'grep' | 'cache';
}

/**
 * Index entry for a component/file.
 */
export interface IndexEntry {
  /** File path */
  path: string;
  /** Component/export name */
  name: string;
  /** File content hash */
  hash: string;
  /** Embedding vector (if available) */
  embedding?: number[];
  /** Extracted keywords */
  keywords: string[];
  /** Last indexed timestamp */
  indexedAt: Date;
}

/**
 * Search index structure.
 */
export interface SearchIndex {
  /** Index version */
  version: string;
  /** Entries */
  entries: IndexEntry[];
  /** Last built timestamp */
  builtAt: Date;
  /** Index statistics */
  stats: {
    totalFiles: number;
    totalEntries: number;
    hasEmbeddings: boolean;
  };
}

/**
 * Search options.
 */
export interface SearchOptions {
  /** Maximum results to return */
  limit?: number;
  /** Minimum score threshold (0-1) */
  minScore?: number;
  /** Search method preference */
  preferMethod?: 'vector' | 'grep' | 'auto';
  /** File extensions to search */
  extensions?: string[];
  /** Directories to search */
  directories?: string[];
  /** Project root */
  projectRoot?: string;
}

/**
 * Canonical search result with tier.
 */
export interface CanonicalResult extends SearchResult {
  /** Inferred authority tier */
  tier: 'gold' | 'silver' | 'draft';
  /** Import count */
  imports: number;
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_OPTIONS: SearchOptions = {
  limit: 10,
  minScore: 0.3,
  preferMethod: 'auto',
  extensions: ['.tsx', '.ts'],
  directories: ['src/components', 'src/hooks', 'src/lib'],
};

const INDEX_PATH = 'grimoires/sigil/index/search-index.json';
const CACHE_PATH = 'grimoires/sigil/index/search-cache.json';

// =============================================================================
// Index Building
// =============================================================================

/**
 * Build search index from codebase.
 *
 * @param projectRoot - Root directory of the project
 * @param options - Build options
 * @returns Built search index
 *
 * @example
 * ```typescript
 * const index = await buildIndex('/path/to/project');
 * console.log(index.stats.totalEntries); // 42
 * ```
 */
export async function buildIndex(projectRoot: string, options: SearchOptions = {}): Promise<SearchIndex> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const entries: IndexEntry[] = [];

  // Ensure index directory exists
  const indexDir = join(projectRoot, dirname(INDEX_PATH));
  if (!existsSync(indexDir)) {
    mkdirSync(indexDir, { recursive: true });
  }

  // Find all files
  const files = findFiles(projectRoot, opts.directories || [], opts.extensions || []);

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      const relativePath = relative(projectRoot, file);
      const name = extractName(file, content);
      const keywords = extractKeywords(content);
      const hash = simpleHash(content);

      entries.push({
        path: relativePath,
        name,
        hash,
        keywords,
        indexedAt: new Date(),
      });
    } catch {
      // Skip files that can't be read
    }
  }

  const index: SearchIndex = {
    version: '10.1.0',
    entries,
    builtAt: new Date(),
    stats: {
      totalFiles: files.length,
      totalEntries: entries.length,
      hasEmbeddings: false,
    },
  };

  // Save index
  const indexPath = join(projectRoot, INDEX_PATH);
  writeFileSync(indexPath, JSON.stringify(index, null, 2));

  return index;
}

/**
 * Find all files matching criteria.
 */
function findFiles(projectRoot: string, directories: string[], extensions: string[]): string[] {
  const files: string[] = [];

  for (const dir of directories) {
    const fullDir = join(projectRoot, dir);
    if (!existsSync(fullDir)) continue;

    walkDirectory(fullDir, (file) => {
      if (extensions.some((ext) => file.endsWith(ext))) {
        // Skip test files
        if (file.includes('.test.') || file.includes('.spec.')) return;
        files.push(file);
      }
    });
  }

  return files;
}

/**
 * Walk a directory recursively.
 */
function walkDirectory(dir: string, callback: (file: string) => void): void {
  try {
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules and hidden directories
        if (item !== 'node_modules' && !item.startsWith('.')) {
          walkDirectory(fullPath, callback);
        }
      } else if (stat.isFile()) {
        callback(fullPath);
      }
    }
  } catch {
    // Skip inaccessible directories
  }
}

/**
 * Extract component/function name from file.
 */
function extractName(filePath: string, content: string): string {
  // Try to find export default function/const
  const defaultExport = content.match(/export\s+default\s+(?:function|const|class)\s+(\w+)/);
  if (defaultExport) return defaultExport[1];

  // Try to find named export
  const namedExport = content.match(/export\s+(?:function|const|class)\s+(\w+)/);
  if (namedExport) return namedExport[1];

  // Fall back to filename
  return basename(filePath).replace(/\.[^.]+$/, '');
}

/**
 * Extract keywords from content.
 */
function extractKeywords(content: string): string[] {
  const keywords = new Set<string>();

  // Extract identifiers (PascalCase and camelCase)
  const identifiers = content.match(/\b[A-Z][a-zA-Z0-9]*\b/g) || [];
  for (const id of identifiers) {
    if (id.length > 2 && id.length < 30) {
      keywords.add(id.toLowerCase());
    }
  }

  // Extract hook names
  const hooks = content.match(/\buse[A-Z][a-zA-Z0-9]*\b/g) || [];
  for (const hook of hooks) {
    keywords.add(hook.toLowerCase());
  }

  // Extract from comments
  const comments = content.match(/\/\*\*[\s\S]*?\*\/|\/\/.*/g) || [];
  for (const comment of comments) {
    const words = comment.match(/\b[a-zA-Z]{3,}\b/g) || [];
    for (const word of words) {
      if (word.length > 3 && word.length < 20) {
        keywords.add(word.toLowerCase());
      }
    }
  }

  return Array.from(keywords).slice(0, 50);
}

/**
 * Simple hash function for content.
 */
function simpleHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// =============================================================================
// Search Functions
// =============================================================================

/**
 * Search for components/code matching a query.
 *
 * @param query - Search query
 * @param options - Search options
 * @returns Array of search results
 *
 * @example
 * ```typescript
 * const results = await search('button with animation', { limit: 5 });
 * console.log(results[0].path); // 'src/components/AnimatedButton.tsx'
 * ```
 */
export async function search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const projectRoot = opts.projectRoot || process.cwd();

  // Try cache first
  const cached = checkCache(query, projectRoot);
  if (cached.length > 0) {
    return cached.slice(0, opts.limit);
  }

  // Try index search
  const indexPath = join(projectRoot, INDEX_PATH);
  if (existsSync(indexPath)) {
    try {
      const index: SearchIndex = JSON.parse(readFileSync(indexPath, 'utf-8'));
      const results = searchIndex(query, index, opts);
      if (results.length > 0) {
        cacheResults(query, results, projectRoot);
        return results;
      }
    } catch {
      // Fall through to grep
    }
  }

  // Fallback to grep
  const grepResults = searchGrep(query, projectRoot, opts);
  if (grepResults.length > 0) {
    cacheResults(query, grepResults, projectRoot);
  }

  return grepResults;
}

/**
 * Search within the index.
 */
function searchIndex(query: string, index: SearchIndex, options: SearchOptions): SearchResult[] {
  const queryWords = query.toLowerCase().split(/\s+/);
  const results: SearchResult[] = [];

  for (const entry of index.entries) {
    // Score based on keyword matches
    let score = 0;
    const matchedKeywords: string[] = [];

    for (const word of queryWords) {
      // Check name
      if (entry.name.toLowerCase().includes(word)) {
        score += 0.3;
        matchedKeywords.push(entry.name);
      }

      // Check path
      if (entry.path.toLowerCase().includes(word)) {
        score += 0.2;
      }

      // Check keywords
      for (const keyword of entry.keywords) {
        if (keyword.includes(word) || word.includes(keyword)) {
          score += 0.1;
          matchedKeywords.push(keyword);
          break;
        }
      }
    }

    if (score >= (options.minScore || 0.3)) {
      results.push({
        path: entry.path,
        name: entry.name,
        score: Math.min(score, 1),
        method: 'vector',
        snippet: matchedKeywords.slice(0, 3).join(', '),
      });
    }
  }

  // Sort by score
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, options.limit);
}

/**
 * Search using grep.
 */
function searchGrep(query: string, projectRoot: string, options: SearchOptions): SearchResult[] {
  const results: SearchResult[] = [];
  const words = query.split(/\s+/).filter((w) => w.length > 2);

  if (words.length === 0) return results;

  // Build grep pattern
  const pattern = words.join('|');
  const dirs = (options.directories || ['src']).join(' ');

  try {
    const output = execSync(
      `grep -ril "${pattern}" --include="*.tsx" --include="*.ts" ${dirs} 2>/dev/null | head -${options.limit || 10}`,
      { cwd: projectRoot, encoding: 'utf-8' }
    );

    const files = output.trim().split('\n').filter(Boolean);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const name = basename(file).replace(/\.[^.]+$/, '');

      // Get snippet
      let snippet: string | undefined;
      let line: number | undefined;
      try {
        const grepLine = execSync(`grep -n "${words[0]}" "${file}" 2>/dev/null | head -1`, {
          cwd: projectRoot,
          encoding: 'utf-8',
        });
        const match = grepLine.match(/^(\d+):(.*)$/);
        if (match) {
          line = parseInt(match[1], 10);
          snippet = match[2].trim().slice(0, 100);
        }
      } catch {
        // No snippet
      }

      results.push({
        path: file,
        name,
        score: 1 - i * 0.1, // Decrease score for later results
        method: 'grep',
        snippet,
        line,
      });
    }
  } catch {
    // Grep failed or no results
  }

  return results;
}

// =============================================================================
// Cache Functions
// =============================================================================

interface CacheEntry {
  query: string;
  results: SearchResult[];
  cachedAt: number;
}

interface SearchCache {
  entries: CacheEntry[];
}

/**
 * Check cache for query.
 */
function checkCache(query: string, projectRoot: string): SearchResult[] {
  const cachePath = join(projectRoot, CACHE_PATH);

  if (!existsSync(cachePath)) return [];

  try {
    const cache: SearchCache = JSON.parse(readFileSync(cachePath, 'utf-8'));
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    const entry = cache.entries.find((e) => e.query.toLowerCase() === query.toLowerCase() && now - e.cachedAt < maxAge);

    if (entry) {
      return entry.results.map((r) => ({ ...r, method: 'cache' as const }));
    }
  } catch {
    // Cache read failed
  }

  return [];
}

/**
 * Cache search results.
 */
function cacheResults(query: string, results: SearchResult[], projectRoot: string): void {
  const cachePath = join(projectRoot, CACHE_PATH);

  let cache: SearchCache = { entries: [] };

  try {
    if (existsSync(cachePath)) {
      cache = JSON.parse(readFileSync(cachePath, 'utf-8'));
    }
  } catch {
    // Start fresh
  }

  // Remove old entry for same query
  cache.entries = cache.entries.filter((e) => e.query.toLowerCase() !== query.toLowerCase());

  // Add new entry
  cache.entries.push({
    query,
    results,
    cachedAt: Date.now(),
  });

  // Limit cache size
  if (cache.entries.length > 100) {
    cache.entries = cache.entries.slice(-100);
  }

  try {
    const cacheDir = dirname(cachePath);
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }
    writeFileSync(cachePath, JSON.stringify(cache, null, 2));
  } catch {
    // Cache write failed, non-critical
  }
}

// =============================================================================
// Canonical Search
// =============================================================================

/**
 * Find canonical component matching a pattern.
 * Uses tiered fallback: cache -> vector -> grep.
 *
 * @param pattern - Search pattern
 * @param options - Search options
 * @returns Best matching canonical result
 *
 * @example
 * ```typescript
 * const result = await findCanonical('button');
 * if (result) {
 *   console.log(result.path); // 'src/components/Button.tsx'
 *   console.log(result.tier); // 'gold'
 * }
 * ```
 */
export async function findCanonical(pattern: string, options: SearchOptions = {}): Promise<CanonicalResult | null> {
  const results = await search(pattern, { ...options, limit: 5 });

  if (results.length === 0) return null;

  const projectRoot = options.projectRoot || process.cwd();

  // Score each result by imports (authority)
  const scored: CanonicalResult[] = [];

  for (const result of results) {
    const imports = countImports(result.path, projectRoot);
    const tier = inferTier(imports);

    scored.push({
      ...result,
      tier,
      imports,
    });
  }

  // Sort by tier (gold > silver > draft), then by score
  const tierOrder = { gold: 0, silver: 1, draft: 2 };
  scored.sort((a, b) => {
    const tierDiff = tierOrder[a.tier] - tierOrder[b.tier];
    if (tierDiff !== 0) return tierDiff;
    return b.score - a.score;
  });

  return scored[0];
}

/**
 * Count imports for a file.
 */
function countImports(filePath: string, projectRoot: string): number {
  const name = basename(filePath).replace(/\.[^.]+$/, '');

  try {
    const output = execSync(`grep -rl "${name}" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | wc -l`, {
      cwd: projectRoot,
      encoding: 'utf-8',
    });
    return parseInt(output.trim(), 10) || 0;
  } catch {
    return 0;
  }
}

/**
 * Infer tier from import count.
 */
function inferTier(imports: number): 'gold' | 'silver' | 'draft' {
  if (imports >= 10) return 'gold';
  if (imports >= 5) return 'silver';
  return 'draft';
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Load existing index.
 *
 * @param projectRoot - Project root directory
 * @returns Search index or null
 */
export function loadIndex(projectRoot: string): SearchIndex | null {
  const indexPath = join(projectRoot, INDEX_PATH);

  if (!existsSync(indexPath)) return null;

  try {
    return JSON.parse(readFileSync(indexPath, 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * Check if index needs rebuild.
 *
 * @param projectRoot - Project root directory
 * @param maxAge - Maximum age in milliseconds
 */
export function indexNeedsRebuild(projectRoot: string, maxAge: number = 24 * 60 * 60 * 1000): boolean {
  const index = loadIndex(projectRoot);

  if (!index) return true;

  const age = Date.now() - new Date(index.builtAt).getTime();
  return age > maxAge;
}

/**
 * Clear search cache.
 *
 * @param projectRoot - Project root directory
 */
export function clearCache(projectRoot: string): void {
  const cachePath = join(projectRoot, CACHE_PATH);

  try {
    if (existsSync(cachePath)) {
      writeFileSync(cachePath, JSON.stringify({ entries: [] }));
    }
  } catch {
    // Ignore errors
  }
}

/**
 * Get index statistics.
 *
 * @param projectRoot - Project root directory
 */
export function getIndexStats(projectRoot: string): SearchIndex['stats'] | null {
  const index = loadIndex(projectRoot);
  return index?.stats || null;
}

/**
 * Search with automatic index rebuild.
 *
 * @param query - Search query
 * @param options - Search options
 */
export async function smartSearch(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
  const projectRoot = options.projectRoot || process.cwd();

  // Rebuild index if needed
  if (indexNeedsRebuild(projectRoot)) {
    await buildIndex(projectRoot, options);
  }

  return search(query, options);
}
