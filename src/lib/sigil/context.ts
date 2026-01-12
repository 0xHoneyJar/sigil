/**
 * Sigil v10.1 "Usage Reality" - Context System
 *
 * Manages invisible accumulation of:
 * - Taste: Pattern preferences and physics choices
 * - Persona: Audience sophistication and voice inference
 * - Project: Codebase paths and conventions
 *
 * All context is persisted to grimoires/sigil/.context/ (gitignored)
 * and accumulates silently without user prompts.
 *
 * @module @sigil/context
 * @version 10.1.0
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// =============================================================================
// Types
// =============================================================================

/**
 * Taste context - accumulated pattern preferences.
 */
export interface TasteContext {
  /** Physics preferences per zone */
  physics: {
    critical_zone: 'server-tick' | 'deliberate';
    casual_zone: 'snappy' | 'smooth';
  };
  /** Pattern preferences by category */
  patterns: {
    buttons: string[];
    layout: string[];
    forms: string[];
  };
  /** Pattern reinforcement scores (positive = preferred, negative = avoid) */
  reinforcement: Record<string, number>;
}

/**
 * Persona context - inferred audience characteristics.
 */
export interface PersonaContext {
  /** Audience characteristics */
  audience: {
    sophistication: 'newcomer' | 'intermediate' | 'expert';
    confidence: number;
  };
  /** Voice/communication preferences */
  voice: {
    formality: 'friendly' | 'neutral' | 'technical';
    jargon_tolerance: 'low' | 'medium' | 'high';
  };
}

/**
 * Project context - inferred codebase knowledge.
 */
export interface ProjectContext {
  /** Standard paths for file types */
  paths: {
    components: string;
    hooks: string;
    assets: string;
  };
  /** Naming and import conventions */
  conventions: {
    naming: 'kebab-case' | 'camelCase' | 'PascalCase';
    imports: 'relative' | 'alias';
  };
  /** Known folders from past interactions */
  known_folders: string[];
  /** File patterns discovered */
  file_patterns: Record<string, string[]>;
}

/**
 * Learning signals for context updates.
 */
export type LearningSignal =
  | { type: 'accept'; pattern: string }
  | { type: 'modify'; original: string; modified: string }
  | { type: 'reject'; pattern: string }
  | { type: 'correct'; text: string };

// =============================================================================
// Defaults
// =============================================================================

const DEFAULT_TASTE: TasteContext = {
  physics: {
    critical_zone: 'server-tick',
    casual_zone: 'snappy',
  },
  patterns: {
    buttons: [],
    layout: [],
    forms: [],
  },
  reinforcement: {},
};

const DEFAULT_PERSONA: PersonaContext = {
  audience: {
    sophistication: 'intermediate',
    confidence: 0.5,
  },
  voice: {
    formality: 'neutral',
    jargon_tolerance: 'medium',
  },
};

const DEFAULT_PROJECT: ProjectContext = {
  paths: {
    components: 'src/components',
    hooks: 'src/hooks',
    assets: 'public',
  },
  conventions: {
    naming: 'kebab-case',
    imports: 'alias',
  },
  known_folders: [],
  file_patterns: {},
};

// =============================================================================
// Context Manager
// =============================================================================

/**
 * SigilContext manages invisible context accumulation.
 *
 * Context is stored in grimoires/sigil/.context/ and is gitignored,
 * meaning each developer accumulates their own context independently.
 *
 * @example
 * ```typescript
 * const context = new SigilContext('/path/to/project');
 *
 * // Get current taste
 * const taste = context.getTaste();
 *
 * // Reinforce a pattern when user accepts code
 * context.reinforcePattern('spring-animation', 1);
 *
 * // Record a physics preference
 * context.recordPhysicsPreference('critical', 'deliberate');
 * ```
 */
export class SigilContext {
  private contextDir: string;
  private taste: TasteContext;
  private persona: PersonaContext;
  private project: ProjectContext;

  /**
   * Create a new SigilContext instance.
   *
   * @param projectRoot - Root directory of the project
   */
  constructor(projectRoot: string) {
    // v10.1: Context lives in grimoires/sigil/.context/
    this.contextDir = join(projectRoot, 'grimoires', 'sigil', '.context');
    this.ensureContextDir();
    this.taste = this.load('taste.json', DEFAULT_TASTE);
    this.persona = this.load('persona.json', DEFAULT_PERSONA);
    this.project = this.load('project.json', DEFAULT_PROJECT);
  }

  /**
   * Ensure the context directory exists.
   */
  private ensureContextDir(): void {
    if (!existsSync(this.contextDir)) {
      mkdirSync(this.contextDir, { recursive: true });
    }
  }

  /**
   * Load a context file or return default.
   */
  private load<T>(filename: string, defaultValue: T): T {
    const path = join(this.contextDir, filename);
    if (existsSync(path)) {
      try {
        return JSON.parse(readFileSync(path, 'utf-8'));
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  }

  /**
   * Save a context file.
   */
  private save<T>(filename: string, data: T): void {
    const path = join(this.contextDir, filename);
    writeFileSync(path, JSON.stringify(data, null, 2));
  }

  // ---------------------------------------------------------------------------
  // Taste Methods
  // ---------------------------------------------------------------------------

  /**
   * Get the current taste context.
   */
  getTaste(): TasteContext {
    return { ...this.taste };
  }

  /**
   * Reinforce a pattern (positive = prefer, negative = avoid).
   *
   * @param pattern - Pattern identifier
   * @param weight - Reinforcement weight (default: 1)
   */
  reinforcePattern(pattern: string, weight: number = 1): void {
    this.taste.reinforcement[pattern] =
      (this.taste.reinforcement[pattern] || 0) + weight;
    this.save('taste.json', this.taste);
  }

  /**
   * Record a physics preference for a zone.
   *
   * @param zone - 'critical' or 'casual'
   * @param physics - Physics preset name
   */
  recordPhysicsPreference(
    zone: 'critical' | 'casual',
    physics: 'server-tick' | 'deliberate' | 'snappy' | 'smooth'
  ): void {
    if (zone === 'critical') {
      this.taste.physics.critical_zone = physics as 'server-tick' | 'deliberate';
    } else {
      this.taste.physics.casual_zone = physics as 'snappy' | 'smooth';
    }
    this.save('taste.json', this.taste);
  }

  /**
   * Add a pattern to a category.
   *
   * @param category - Pattern category
   * @param pattern - Pattern to add
   */
  addPatternToCategory(
    category: 'buttons' | 'layout' | 'forms',
    pattern: string
  ): void {
    if (!this.taste.patterns[category].includes(pattern)) {
      this.taste.patterns[category].push(pattern);
      this.save('taste.json', this.taste);
    }
  }

  /**
   * Get the top reinforced patterns.
   *
   * @param limit - Maximum patterns to return
   */
  getTopPatterns(limit: number = 5): Array<{ pattern: string; score: number }> {
    return Object.entries(this.taste.reinforcement)
      .map(([pattern, score]) => ({ pattern, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // ---------------------------------------------------------------------------
  // Persona Methods
  // ---------------------------------------------------------------------------

  /**
   * Get the current persona context.
   */
  getPersona(): PersonaContext {
    return { ...this.persona };
  }

  /**
   * Update persona based on observed signals.
   *
   * @param updates - Partial persona updates
   * @param weight - Confidence weight (higher = more confident)
   */
  updatePersona(updates: Partial<PersonaContext>, weight: number = 1): void {
    const confidenceBoost = weight * 0.1;

    if (updates.audience) {
      this.persona.audience = {
        ...this.persona.audience,
        ...updates.audience,
        confidence: Math.min(
          1,
          this.persona.audience.confidence + confidenceBoost
        ),
      };
    }

    if (updates.voice) {
      this.persona.voice = { ...this.persona.voice, ...updates.voice };
    }

    this.save('persona.json', this.persona);
  }

  /**
   * Apply an explicit persona correction (5x weight).
   *
   * @param correction - User's correction text
   */
  correctPersona(correction: string): void {
    const signals = this.parsePersonaSignals(correction);
    this.updatePersona(signals, 5);
  }

  /**
   * Parse persona signals from text.
   */
  private parsePersonaSignals(text: string): Partial<PersonaContext> {
    const signals: Partial<PersonaContext> = {};
    const lowerText = text.toLowerCase();

    // Sophistication signals
    if (lowerText.match(/defi native|expert|technical|advanced/)) {
      signals.audience = { sophistication: 'expert', confidence: 0.8 };
      signals.voice = { formality: 'technical', jargon_tolerance: 'high' };
    } else if (lowerText.match(/newcomer|beginner|new to|learning/)) {
      signals.audience = { sophistication: 'newcomer', confidence: 0.8 };
      signals.voice = { formality: 'friendly', jargon_tolerance: 'low' };
    }

    // Formality signals
    if (lowerText.match(/casual|friendly|conversational/)) {
      signals.voice = { ...signals.voice, formality: 'friendly' };
    } else if (lowerText.match(/formal|professional|technical/)) {
      signals.voice = { ...signals.voice, formality: 'technical' };
    }

    return signals;
  }

  // ---------------------------------------------------------------------------
  // Project Methods
  // ---------------------------------------------------------------------------

  /**
   * Get the current project context.
   */
  getProject(): ProjectContext {
    return { ...this.project };
  }

  /**
   * Record a path that was used.
   *
   * @param path - File path that was accessed
   */
  recordPath(path: string): void {
    const folder = path.split('/').slice(0, -1).join('/');
    if (folder && !this.project.known_folders.includes(folder)) {
      this.project.known_folders.push(folder);
      this.save('project.json', this.project);
    }
  }

  /**
   * Update project paths.
   *
   * @param paths - Partial path updates
   */
  updatePaths(paths: Partial<ProjectContext['paths']>): void {
    this.project.paths = { ...this.project.paths, ...paths };
    this.save('project.json', this.project);
  }

  /**
   * Update project conventions.
   *
   * @param conventions - Partial convention updates
   */
  updateConventions(
    conventions: Partial<ProjectContext['conventions']>
  ): void {
    this.project.conventions = { ...this.project.conventions, ...conventions };
    this.save('project.json', this.project);
  }

  /**
   * Find a file across known folders.
   *
   * @param filename - File to find
   */
  findFile(filename: string): string | null {
    // Try exact match first
    for (const folder of this.project.known_folders) {
      const path = join(folder, filename);
      if (existsSync(path)) return path;
    }

    // Try variations
    const variations = this.generateVariations(filename);
    for (const variation of variations) {
      for (const folder of this.project.known_folders) {
        const path = join(folder, variation);
        if (existsSync(path)) return path;
      }
    }

    return null;
  }

  /**
   * Generate filename variations for fuzzy matching.
   */
  private generateVariations(filename: string): string[] {
    const variations: string[] = [];
    const name = filename.replace(/\.[^.]+$/, '');
    const ext = filename.match(/\.[^.]+$/)?.[0] || '';

    // kebab-case to PascalCase
    variations.push(
      name
        .split('-')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join('') + ext
    );

    // PascalCase to kebab-case
    variations.push(
      name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '') + ext
    );

    return Array.from(new Set(variations));
  }

  // ---------------------------------------------------------------------------
  // Reset Methods
  // ---------------------------------------------------------------------------

  /**
   * Reset taste context to defaults.
   */
  resetTaste(): void {
    this.taste = { ...DEFAULT_TASTE };
    this.save('taste.json', this.taste);
  }

  /**
   * Reset persona context to defaults.
   */
  resetPersona(): void {
    this.persona = { ...DEFAULT_PERSONA };
    this.save('persona.json', this.persona);
  }

  /**
   * Reset project context to defaults.
   */
  resetProject(): void {
    this.project = { ...DEFAULT_PROJECT };
    this.save('project.json', this.project);
  }

  /**
   * Reset all context to defaults.
   */
  resetAll(): void {
    this.resetTaste();
    this.resetPersona();
    this.resetProject();
  }
}

// =============================================================================
// Learning Signal Processing
// =============================================================================

/**
 * Process a learning signal to update context.
 *
 * Learning signals are emitted when:
 * - User accepts generated code → 'accept'
 * - User modifies generated code → 'modify'
 * - User rejects generated code → 'reject'
 * - User provides explicit correction → 'correct'
 *
 * @param context - SigilContext instance
 * @param signal - Learning signal to process
 *
 * @example
 * ```typescript
 * // User accepted a button pattern
 * processLearningSignal(context, {
 *   type: 'accept',
 *   pattern: 'spring-button-animation'
 * });
 *
 * // User modified the physics timing
 * processLearningSignal(context, {
 *   type: 'modify',
 *   original: 'duration-800',
 *   modified: 'duration-500'
 * });
 *
 * // User explicitly corrected persona
 * processLearningSignal(context, {
 *   type: 'correct',
 *   text: 'I am a DeFi native, use technical language'
 * });
 * ```
 */
export function processLearningSignal(
  context: SigilContext,
  signal: LearningSignal
): void {
  switch (signal.type) {
    case 'accept':
      // Positive reinforcement for accepted patterns
      context.reinforcePattern(signal.pattern, 1);
      break;

    case 'modify':
      // Learn from the diff - penalize original, boost modified
      context.reinforcePattern(signal.original, -0.5);
      context.reinforcePattern(signal.modified, 2);
      break;

    case 'reject':
      // Strong negative reinforcement for rejected patterns
      context.reinforcePattern(signal.pattern, -2);
      break;

    case 'correct':
      // Explicit correction has 5x weight
      context.correctPersona(signal.text);
      break;
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Create a SigilContext for the current working directory.
 */
export function createContext(): SigilContext {
  return new SigilContext(process.cwd());
}

/**
 * Get default taste context.
 */
export function getDefaultTaste(): TasteContext {
  return { ...DEFAULT_TASTE };
}

/**
 * Get default persona context.
 */
export function getDefaultPersona(): PersonaContext {
  return { ...DEFAULT_PERSONA };
}

/**
 * Get default project context.
 */
export function getDefaultProject(): ProjectContext {
  return { ...DEFAULT_PROJECT };
}
