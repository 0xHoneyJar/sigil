/**
 * VocabularyLoader - Load Sigil vocabulary from markdown
 *
 * Parses .claude/rules/08-sigil-lexicon.md to extract keyword → effect mappings.
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import type { Vocabulary, VocabularyEntry, EffectType } from './types.js';

/** Default vocabulary path */
const DEFAULT_VOCABULARY_PATH = '.claude/rules/08-sigil-lexicon.md';

/** Cached vocabulary */
let cachedVocabulary: Vocabulary | null = null;
let cachedPath: string | null = null;

/**
 * Parse keywords from a code block section
 */
function parseKeywordsFromBlock(block: string): string[] {
  const keywords: string[] = [];

  // Split by lines and extract keywords
  const lines = block.split('\n');
  for (const line of lines) {
    // Skip category labels like "Primary:", "Extended:", etc.
    const colonIndex = line.indexOf(':');
    const content = colonIndex >= 0 ? line.slice(colonIndex + 1) : line;

    // Split by comma and extract individual keywords
    const words = content
      .split(/[,\s]+/)
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length > 0 && !w.includes('```'));

    keywords.push(...words);
  }

  return [...new Set(keywords)]; // Deduplicate
}

/**
 * Parse effect keywords section
 */
function parseEffectKeywords(content: string): Map<EffectType, VocabularyEntry> {
  const effects = new Map<EffectType, VocabularyEntry>();

  // Find the effect_keywords section
  const sectionMatch = content.match(
    /<effect_keywords>[\s\S]*?<\/effect_keywords>/
  );

  if (!sectionMatch) {
    return effects;
  }

  const section = sectionMatch[0];

  // Define effect patterns with their headers
  const effectPatterns: Array<{ effect: EffectType; pattern: RegExp }> = [
    {
      effect: 'financial',
      pattern: /###\s*Financial[\s\S]*?```([\s\S]*?)```/i,
    },
    {
      effect: 'destructive',
      pattern: /###\s*Destructive[\s\S]*?```([\s\S]*?)```/i,
    },
    {
      effect: 'soft_delete',
      pattern: /###\s*Soft\s*Delete[\s\S]*?```([\s\S]*?)```/i,
    },
    {
      effect: 'standard',
      pattern: /###\s*Standard[\s\S]*?```([\s\S]*?)```/i,
    },
    {
      effect: 'local',
      pattern: /###\s*Local\s*State[\s\S]*?```([\s\S]*?)```/i,
    },
    {
      effect: 'navigation',
      pattern: /###\s*Navigation[\s\S]*?```([\s\S]*?)```/i,
    },
    {
      effect: 'query',
      pattern: /###\s*Query[\s\S]*?```([\s\S]*?)```/i,
    },
  ];

  for (const { effect, pattern } of effectPatterns) {
    const match = section.match(pattern);
    if (match && match[1]) {
      const keywords = parseKeywordsFromBlock(match[1]);
      if (keywords.length > 0) {
        effects.set(effect, {
          keywords,
          effect,
          category: 'lexicon',
        });
      }
    }
  }

  return effects;
}

/**
 * Parse type overrides section
 */
function parseTypeOverrides(content: string): Map<string, EffectType> {
  const overrides = new Map<string, EffectType>();

  // Find the type_overrides section
  const sectionMatch = content.match(
    /<type_overrides>[\s\S]*?<\/type_overrides>/
  );

  if (!sectionMatch) {
    return overrides;
  }

  const section = sectionMatch[0];

  // Parse table rows: | Type Pattern | Forced Effect | Why |
  const lines = section.split('\n');
  for (const line of lines) {
    if (!line.includes('|') || line.includes('---') || line.includes('Type Pattern')) {
      continue;
    }

    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (cells.length < 2) continue;

    const typePattern = cells[0];
    const forcedEffect = cells[1];

    if (!typePattern || !forcedEffect) continue;

    // Parse type patterns (may contain backticks and commas)
    const types = typePattern
      .replace(/`/g, '')
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    // Map effect string to EffectType
    const effect = mapEffectString(forcedEffect);
    if (effect) {
      for (const type of types) {
        overrides.set(type, effect);
      }
    }
  }

  return overrides;
}

/**
 * Parse domain context defaults
 */
function parseDomainDefaults(content: string): Map<string, EffectType> {
  const defaults = new Map<string, EffectType>();

  // Find the domain_context section
  const sectionMatch = content.match(
    /<domain_context>[\s\S]*?<\/domain_context>/
  );

  if (!sectionMatch) {
    return defaults;
  }

  const section = sectionMatch[0];

  // Look for domain headers and their defaults
  const domainHeaderPattern = /###\s*([\w\/]+)\s*\n```([\s\S]*?)```/gi;
  let match;

  while ((match = domainHeaderPattern.exec(section)) !== null) {
    const domainName = match[1];
    const domainContent = match[2];

    if (!domainName || !domainContent) continue;

    // Look for "Default:" line
    const defaultMatch = domainContent.match(/Default:\s*([\w\s()]+)/i);
    if (defaultMatch && defaultMatch[1]) {
      const effect = mapEffectString(defaultMatch[1]);
      if (effect) {
        // Add domain keywords
        const keywordMatch = domainContent.match(/Keywords:\s*([\w,\s]+)/i);
        if (keywordMatch && keywordMatch[1]) {
          const keywords = keywordMatch[1]
            .split(',')
            .map((k) => k.trim().toLowerCase())
            .filter((k) => k.length > 0);

          for (const keyword of keywords) {
            defaults.set(keyword, effect);
          }
        }
        // Also add domain name itself
        defaults.set(domainName.toLowerCase().replace('/', '_'), effect);
      }
    }
  }

  return defaults;
}

/**
 * Map effect string to EffectType
 */
function mapEffectString(value: string): EffectType | null {
  const normalized = value.toLowerCase().trim();

  if (normalized.includes('financial')) return 'financial';
  if (normalized.includes('destructive')) return 'destructive';
  if (normalized.includes('soft') && normalized.includes('delete')) return 'soft_delete';
  if (normalized.includes('standard')) return 'standard';
  if (normalized.includes('local')) return 'local';
  if (normalized.includes('navigation')) return 'navigation';
  if (normalized.includes('query')) return 'query';
  if (normalized.includes('immediate')) return 'local';

  return null;
}

/**
 * Get default vocabulary (fallback)
 */
export function getDefaultVocabulary(): Vocabulary {
  const effects = new Map<EffectType, VocabularyEntry>();

  effects.set('financial', {
    keywords: [
      'claim', 'deposit', 'withdraw', 'transfer', 'swap', 'send', 'pay', 'purchase',
      'mint', 'burn', 'stake', 'unstake', 'bridge', 'approve', 'redeem', 'harvest',
    ],
    effect: 'financial',
    category: 'default',
  });

  effects.set('destructive', {
    keywords: [
      'delete', 'remove', 'destroy', 'revoke', 'terminate', 'purge', 'erase', 'wipe',
    ],
    effect: 'destructive',
    category: 'default',
  });

  effects.set('soft_delete', {
    keywords: ['archive', 'hide', 'trash', 'dismiss', 'snooze', 'mute'],
    effect: 'soft_delete',
    category: 'default',
  });

  effects.set('standard', {
    keywords: [
      'save', 'update', 'edit', 'create', 'add', 'like', 'follow', 'bookmark',
    ],
    effect: 'standard',
    category: 'default',
  });

  effects.set('local', {
    keywords: ['toggle', 'switch', 'expand', 'collapse', 'select', 'focus'],
    effect: 'local',
    category: 'default',
  });

  effects.set('navigation', {
    keywords: ['navigate', 'go', 'back', 'forward', 'link', 'route'],
    effect: 'navigation',
    category: 'default',
  });

  effects.set('query', {
    keywords: ['fetch', 'load', 'get', 'list', 'search', 'find'],
    effect: 'query',
    category: 'default',
  });

  const typeOverrides = new Map<string, EffectType>([
    ['currency', 'financial'],
    ['money', 'financial'],
    ['amount', 'financial'],
    ['wei', 'financial'],
    ['bigint', 'financial'],
    ['token', 'financial'],
    ['balance', 'financial'],
    ['price', 'financial'],
    ['fee', 'financial'],
    ['password', 'destructive'],
    ['secret', 'destructive'],
    ['key', 'destructive'],
    ['permission', 'destructive'],
    ['role', 'destructive'],
    ['access', 'destructive'],
    ['theme', 'local'],
    ['preference', 'local'],
    ['setting', 'local'],
    ['filter', 'local'],
    ['sort', 'local'],
    ['view', 'local'],
  ]);

  const domainDefaults = new Map<string, EffectType>([
    ['wallet', 'financial'],
    ['token', 'financial'],
    ['nft', 'financial'],
    ['contract', 'financial'],
    ['chain', 'financial'],
    ['gas', 'financial'],
    ['cart', 'standard'],
    ['checkout', 'financial'],
    ['payment', 'financial'],
  ]);

  return { effects, typeOverrides, domainDefaults };
}

/**
 * Load vocabulary from file
 *
 * @param path - Path to vocabulary markdown file
 * @returns Parsed vocabulary
 */
export async function loadVocabulary(path?: string): Promise<Vocabulary> {
  const vocabPath = path ?? DEFAULT_VOCABULARY_PATH;

  // Return cached if same path
  if (cachedVocabulary && cachedPath === vocabPath) {
    return cachedVocabulary;
  }

  // Check if file exists
  if (!existsSync(vocabPath)) {
    console.warn(`Vocabulary file not found at ${vocabPath}, using defaults`);
    cachedVocabulary = getDefaultVocabulary();
    cachedPath = vocabPath;
    return cachedVocabulary;
  }

  try {
    const content = await readFile(vocabPath, 'utf-8');

    const effects = parseEffectKeywords(content);
    const typeOverrides = parseTypeOverrides(content);
    const domainDefaults = parseDomainDefaults(content);

    // Use defaults if parsing failed
    if (effects.size === 0) {
      console.warn('No vocabulary parsed, using defaults');
      cachedVocabulary = getDefaultVocabulary();
    } else {
      cachedVocabulary = { effects, typeOverrides, domainDefaults };
    }

    cachedPath = vocabPath;
    return cachedVocabulary;
  } catch (error) {
    console.warn(`Error loading vocabulary from ${vocabPath}:`, error);
    cachedVocabulary = getDefaultVocabulary();
    cachedPath = vocabPath;
    return cachedVocabulary;
  }
}

/**
 * Resolve effect from keywords
 *
 * @param keywords - Keywords to look up
 * @param vocabulary - Vocabulary (will load if not provided)
 * @returns Most specific effect type found, or null
 */
export async function resolveEffectFromKeywords(
  keywords: string[],
  vocabulary?: Vocabulary
): Promise<EffectType | null> {
  const vocab = vocabulary ?? (await loadVocabulary());

  // Normalize keywords
  const normalizedKeywords = keywords.map((k) => k.toLowerCase().trim());

  // Priority order: financial > destructive > soft_delete > standard > local > navigation > query
  const priorityOrder: EffectType[] = [
    'financial',
    'destructive',
    'soft_delete',
    'standard',
    'local',
    'navigation',
    'query',
    'high_freq',
  ];

  for (const effect of priorityOrder) {
    const entry = vocab.effects.get(effect);
    if (entry) {
      for (const keyword of normalizedKeywords) {
        if (entry.keywords.includes(keyword)) {
          return effect;
        }
      }
    }
  }

  // Check type overrides
  for (const keyword of normalizedKeywords) {
    const override = vocab.typeOverrides.get(keyword);
    if (override) {
      return override;
    }
  }

  // Check domain defaults
  for (const keyword of normalizedKeywords) {
    const domainDefault = vocab.domainDefaults.get(keyword);
    if (domainDefault) {
      return domainDefault;
    }
  }

  return null;
}

/**
 * Clear vocabulary cache (for testing)
 */
export function clearVocabularyCache(): void {
  cachedVocabulary = null;
  cachedPath = null;
}

/**
 * Check if vocabulary is cached
 */
export function isVocabularyCached(): boolean {
  return cachedVocabulary !== null;
}
