/**
 * Sigil v3.0 — Vocabulary Reader
 *
 * Reads and manages the vocabulary layer (term → feel mapping).
 * Implements graceful degradation: never throws, always returns valid data.
 *
 * Philosophy: "Same backend, different feel. Term determines experience."
 *
 * @module process/vocabulary-reader
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import YAML from 'yaml';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Material type for visual styling.
 */
export type Material = 'glass' | 'machinery' | 'decisive';

/**
 * Motion type for animations and transitions.
 */
export type Motion = 'warm' | 'deliberate' | 'snappy' | 'celebratory_then_deliberate' | 'reassuring';

/**
 * Tone type for copy and messaging.
 */
export type Tone = 'friendly' | 'serious' | 'exciting' | 'reassuring';

/**
 * Recommended feel for a term.
 */
export interface TermFeel {
  /** Visual material */
  material: Material;
  /** Motion style */
  motion: Motion;
  /** Tone of messaging */
  tone: Tone;
}

/**
 * A vocabulary term with its design recommendations.
 */
export interface VocabularyTerm {
  /** Term ID (lowercase key) */
  id: string;
  /** Internal engineering name */
  engineering_name: string;
  /** User-facing display name */
  user_facing: string;
  /** Mental model description */
  mental_model: string;
  /** Recommended feel for this term */
  recommended: TermFeel;
  /** Zones where this term typically appears */
  zones: string[];
}

/**
 * The Vocabulary: maps product terms to design recommendations.
 */
export interface Vocabulary {
  /** Schema version */
  version: string;
  /** Map of term ID to term definition */
  terms: Record<string, VocabularyTerm>;
}

// =============================================================================
// DEFAULTS
// =============================================================================

/**
 * Default term feel (used as fallback).
 */
export const DEFAULT_TERM_FEEL: TermFeel = {
  material: 'machinery',
  motion: 'deliberate',
  tone: 'serious',
};

/**
 * Default empty vocabulary.
 */
export const DEFAULT_VOCABULARY: Vocabulary = {
  version: '3.0.0',
  terms: {},
};

/**
 * Default path to the vocabulary file.
 */
export const DEFAULT_VOCABULARY_PATH = 'sigil-mark/vocabulary/vocabulary.yaml';

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Valid material values.
 */
const VALID_MATERIALS: Material[] = ['glass', 'machinery', 'decisive'];

/**
 * Valid motion values.
 */
const VALID_MOTIONS: Motion[] = ['warm', 'deliberate', 'snappy', 'celebratory_then_deliberate', 'reassuring'];

/**
 * Valid tone values.
 */
const VALID_TONES: Tone[] = ['friendly', 'serious', 'exciting', 'reassuring'];

/**
 * Validates a material value.
 */
function isValidMaterial(value: unknown): value is Material {
  return typeof value === 'string' && VALID_MATERIALS.includes(value as Material);
}

/**
 * Validates a motion value.
 */
function isValidMotion(value: unknown): value is Motion {
  return typeof value === 'string' && VALID_MOTIONS.includes(value as Motion);
}

/**
 * Validates a tone value.
 */
function isValidTone(value: unknown): value is Tone {
  return typeof value === 'string' && VALID_TONES.includes(value as Tone);
}

/**
 * Validates a term feel object.
 */
function isValidTermFeel(value: unknown): value is TermFeel {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;
  return (
    isValidMaterial(obj.material) &&
    isValidMotion(obj.motion) &&
    isValidTone(obj.tone)
  );
}

/**
 * Validates a vocabulary term object.
 */
function isValidVocabularyTerm(value: unknown, id: string): value is Omit<VocabularyTerm, 'id'> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.engineering_name === 'string' &&
    obj.engineering_name.length > 0 &&
    typeof obj.user_facing === 'string' &&
    obj.user_facing.length > 0 &&
    typeof obj.mental_model === 'string' &&
    isValidTermFeel(obj.recommended) &&
    Array.isArray(obj.zones)
  );
}

/**
 * Normalizes a vocabulary term.
 */
function normalizeTerm(obj: Record<string, unknown>, id: string): VocabularyTerm | null {
  if (!isValidVocabularyTerm(obj, id)) {
    return null;
  }

  const recommended = obj.recommended as Record<string, unknown>;
  const zones = obj.zones as unknown[];

  return {
    id: id.toLowerCase(),
    engineering_name: obj.engineering_name as string,
    user_facing: obj.user_facing as string,
    mental_model: obj.mental_model as string,
    recommended: {
      material: recommended.material as Material,
      motion: recommended.motion as Motion,
      tone: recommended.tone as Tone,
    },
    zones: zones.filter((z): z is string => typeof z === 'string'),
  };
}

/**
 * Validates and normalizes a vocabulary object.
 */
function validateVocabulary(parsed: unknown): Vocabulary {
  if (typeof parsed !== 'object' || parsed === null) {
    console.warn('[Sigil Vocabulary] Invalid vocabulary format, using defaults');
    return DEFAULT_VOCABULARY;
  }

  const obj = parsed as Record<string, unknown>;

  // Validate version
  const version = typeof obj.version === 'string' ? obj.version : '3.0.0';

  // Validate terms
  const terms: Record<string, VocabularyTerm> = {};
  if (typeof obj.terms === 'object' && obj.terms !== null) {
    for (const [id, term] of Object.entries(obj.terms as Record<string, unknown>)) {
      const normalizedTerm = normalizeTerm(term as Record<string, unknown>, id);
      if (normalizedTerm) {
        terms[id.toLowerCase()] = normalizedTerm;
      } else {
        console.warn(`[Sigil Vocabulary] Skipping invalid term: ${id}`);
      }
    }
  }

  return {
    version,
    terms,
  };
}

// =============================================================================
// READER FUNCTIONS
// =============================================================================

/**
 * Reads and parses the Vocabulary from a YAML file.
 *
 * Implements graceful degradation:
 * - If file doesn't exist: returns empty vocabulary
 * - If YAML is invalid: returns empty vocabulary
 * - If individual terms are invalid: skips them
 *
 * @param filePath - Path to the vocabulary YAML file
 * @returns Parsed and validated Vocabulary
 *
 * @example
 * ```ts
 * const vocabulary = await readVocabulary();
 * const pot = getTerm(vocabulary, 'pot');
 * console.log(pot?.recommended.material); // 'glass'
 * ```
 */
export async function readVocabulary(
  filePath: string = DEFAULT_VOCABULARY_PATH
): Promise<Vocabulary> {
  try {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    const content = await fs.readFile(resolvedPath, 'utf-8');
    const parsed = YAML.parse(content);
    return validateVocabulary(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`[Sigil Vocabulary] File not found: ${filePath}, using defaults`);
    } else if (error instanceof YAML.YAMLParseError) {
      console.error(`[Sigil Vocabulary] YAML parse error: ${error.message}`);
    } else {
      console.error(`[Sigil Vocabulary] Error reading vocabulary: ${error}`);
    }
    return DEFAULT_VOCABULARY;
  }
}

/**
 * Synchronously reads and parses the Vocabulary from a YAML file.
 *
 * @param filePath - Path to the vocabulary YAML file
 * @returns Parsed and validated Vocabulary
 */
export function readVocabularySync(
  filePath: string = DEFAULT_VOCABULARY_PATH
): Vocabulary {
  try {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fsSync = require('fs');
    const content = fsSync.readFileSync(resolvedPath, 'utf-8');
    const parsed = YAML.parse(content);
    return validateVocabulary(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`[Sigil Vocabulary] File not found: ${filePath}, using defaults`);
    } else {
      console.error(`[Sigil Vocabulary] Error reading vocabulary: ${error}`);
    }
    return DEFAULT_VOCABULARY;
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Gets a term from the vocabulary by ID.
 *
 * @param vocabulary - The vocabulary to search
 * @param termId - The term ID to find (case-insensitive)
 * @returns The term, or undefined if not found
 *
 * @example
 * ```ts
 * const vocabulary = await readVocabulary();
 * const pot = getTerm(vocabulary, 'Pot'); // Works with any case
 * console.log(pot?.user_facing); // 'Pot'
 * ```
 */
export function getTerm(
  vocabulary: Vocabulary,
  termId: string
): VocabularyTerm | undefined {
  return vocabulary.terms[termId.toLowerCase()];
}

/**
 * Gets all terms from the vocabulary as an array.
 *
 * @param vocabulary - The vocabulary
 * @returns Array of all terms
 */
export function getAllTerms(vocabulary: Vocabulary): VocabularyTerm[] {
  return Object.values(vocabulary.terms);
}

/**
 * Gets terms that appear in a specific zone.
 *
 * @param vocabulary - The vocabulary to search
 * @param zone - The zone to filter by
 * @returns Array of terms for the zone
 *
 * @example
 * ```ts
 * const vocabulary = await readVocabulary();
 * const criticalTerms = getTermsForZone(vocabulary, 'critical');
 * // Returns: vault, claim, deposit, withdraw, etc.
 * ```
 */
export function getTermsForZone(
  vocabulary: Vocabulary,
  zone: string
): VocabularyTerm[] {
  return getAllTerms(vocabulary).filter((term) =>
    term.zones.includes(zone.toLowerCase())
  );
}

/**
 * Gets the recommended feel for a term.
 * Falls back to zone defaults if term not found.
 *
 * @param vocabulary - The vocabulary to search
 * @param termId - The term ID to find
 * @param zoneFallback - Fallback feel values if term not found
 * @returns The recommended feel for the term
 *
 * @example
 * ```ts
 * const vocabulary = await readVocabulary();
 *
 * // Term exists - returns term's feel
 * const potFeel = getTermFeel(vocabulary, 'pot');
 * // { material: 'glass', motion: 'warm', tone: 'friendly' }
 *
 * // Term doesn't exist - returns zone fallback
 * const unknownFeel = getTermFeel(vocabulary, 'unknown', {
 *   material: 'machinery',
 *   motion: 'snappy',
 *   tone: 'serious'
 * });
 * ```
 */
export function getTermFeel(
  vocabulary: Vocabulary,
  termId: string,
  zoneFallback: Partial<TermFeel> = {}
): TermFeel {
  const term = getTerm(vocabulary, termId);

  if (term) {
    return term.recommended;
  }

  // Fallback to zone defaults
  return {
    material: zoneFallback.material ?? DEFAULT_TERM_FEEL.material,
    motion: zoneFallback.motion ?? DEFAULT_TERM_FEEL.motion,
    tone: zoneFallback.tone ?? DEFAULT_TERM_FEEL.tone,
  };
}

/**
 * Checks if a term exists in the vocabulary.
 *
 * @param vocabulary - The vocabulary to search
 * @param termId - The term ID to check
 * @returns True if the term exists
 */
export function hasTerm(vocabulary: Vocabulary, termId: string): boolean {
  return termId.toLowerCase() in vocabulary.terms;
}

/**
 * Gets the engineering name for a term.
 *
 * @param vocabulary - The vocabulary to search
 * @param termId - The term ID
 * @returns The engineering name, or undefined if term not found
 */
export function getEngineeringName(
  vocabulary: Vocabulary,
  termId: string
): string | undefined {
  return getTerm(vocabulary, termId)?.engineering_name;
}

/**
 * Gets terms by engineering name.
 * Multiple terms can share the same engineering name.
 *
 * @param vocabulary - The vocabulary to search
 * @param engineeringName - The engineering name to find
 * @returns Array of terms with this engineering name
 *
 * @example
 * ```ts
 * const vocabulary = await readVocabulary();
 * const savingsContainers = getTermsByEngineeringName(vocabulary, 'savings_container');
 * // Returns: [pot, vault] - same backend, different feels
 * ```
 */
export function getTermsByEngineeringName(
  vocabulary: Vocabulary,
  engineeringName: string
): VocabularyTerm[] {
  return getAllTerms(vocabulary).filter(
    (term) => term.engineering_name === engineeringName
  );
}

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

/**
 * Formats a term for display.
 *
 * @param term - The term to format
 * @returns Formatted string
 */
export function formatTermSummary(term: VocabularyTerm): string {
  return `${term.user_facing} (${term.id})
  Engineering: ${term.engineering_name}
  Mental model: "${term.mental_model}"
  Feel: ${term.recommended.material} / ${term.recommended.motion} / ${term.recommended.tone}
  Zones: ${term.zones.join(', ')}`;
}

/**
 * Formats a vocabulary summary.
 *
 * @param vocabulary - The vocabulary to summarize
 * @returns Formatted string
 */
export function formatVocabularySummary(vocabulary: Vocabulary): string {
  const terms = getAllTerms(vocabulary);
  const termList = terms
    .map((t) => `  - ${t.user_facing}: ${t.recommended.material} / ${t.recommended.motion}`)
    .join('\n');

  const zoneCount: Record<string, number> = {};
  for (const term of terms) {
    for (const zone of term.zones) {
      zoneCount[zone] = (zoneCount[zone] || 0) + 1;
    }
  }

  const zoneList = Object.entries(zoneCount)
    .map(([zone, count]) => `  - ${zone}: ${count} terms`)
    .join('\n');

  return `Sigil Vocabulary v${vocabulary.version}
Terms (${terms.length}):
${termList}

Zone Coverage:
${zoneList}`;
}
