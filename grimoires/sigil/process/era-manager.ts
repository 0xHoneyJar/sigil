/**
 * @sigil-tier gold
 * Sigil v6.0 — Era Manager
 *
 * Era versioning for design direction shifts.
 * Track when the design language fundamentally changes.
 *
 * @module process/era-manager
 */

import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Era definition.
 */
export interface Era {
  /** Human-readable era name */
  name: string;
  /** Era start timestamp (ISO) */
  started: string;
  /** Era end timestamp (ISO, when archived) */
  ended?: string;
  /** Optional description */
  description?: string;
}

/**
 * Archived era with patterns.
 */
export interface EraArchive extends Era {
  /** Archived patterns */
  patterns: {
    survived: Record<string, unknown>;
    canonical: string[];
    rejected: string[];
  };
}

/**
 * Era transition result.
 */
export interface EraTransitionResult {
  /** Whether transition succeeded */
  success: boolean;
  /** Previous era name */
  previousEra?: string;
  /** New era name */
  newEra: string;
  /** Archive path (if created) */
  archivePath?: string;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Era info from survival.json.
 */
export interface SurvivalEraInfo {
  /** Current era name */
  era: string;
  /** Era start timestamp */
  era_started: string;
}

/**
 * Craft log entry with era.
 */
export interface EraLogEntry {
  /** Era name */
  era: string;
  /** Log timestamp */
  timestamp: string;
  /** Log entry content */
  content: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Default era name for new projects */
export const DEFAULT_ERA = 'v1';

/** Default eras directory */
export const ERAS_DIRECTORY = 'grimoires/sigil/state/eras';

/** Survival.json path */
export const SURVIVAL_PATH = 'grimoires/sigil/state/survival.json';

// =============================================================================
// ERA READING
// =============================================================================

/**
 * Get current era from survival.json.
 */
export function getCurrentEra(projectRoot: string = process.cwd()): Era | null {
  const survivalPath = path.join(projectRoot, SURVIVAL_PATH);

  try {
    if (!fs.existsSync(survivalPath)) {
      return null;
    }

    const content = fs.readFileSync(survivalPath, 'utf-8');
    const survival = JSON.parse(content);

    if (!survival.era) {
      return null;
    }

    return {
      name: survival.era,
      started: survival.era_started || new Date().toISOString(),
      description: survival.era_description,
    };
  } catch {
    return null;
  }
}

/**
 * Get current era name (convenience function).
 */
export function getCurrentEraName(projectRoot: string = process.cwd()): string {
  const era = getCurrentEra(projectRoot);
  return era?.name || DEFAULT_ERA;
}

/**
 * Check if era exists.
 */
export function eraExists(eraName: string, projectRoot: string = process.cwd()): boolean {
  const current = getCurrentEra(projectRoot);
  if (current?.name === eraName) {
    return true;
  }

  const archivePath = path.join(projectRoot, ERAS_DIRECTORY, `${eraName}.json`);
  return fs.existsSync(archivePath);
}

// =============================================================================
// ERA ARCHIVING
// =============================================================================

/**
 * Archive the current era.
 */
export function archiveEra(projectRoot: string = process.cwd()): string | null {
  const survivalPath = path.join(projectRoot, SURVIVAL_PATH);

  try {
    if (!fs.existsSync(survivalPath)) {
      return null;
    }

    const content = fs.readFileSync(survivalPath, 'utf-8');
    const survival = JSON.parse(content);

    if (!survival.era) {
      return null;
    }

    // Create eras directory
    const erasDir = path.join(projectRoot, ERAS_DIRECTORY);
    if (!fs.existsSync(erasDir)) {
      fs.mkdirSync(erasDir, { recursive: true });
    }

    // Create archive
    const archive: EraArchive = {
      name: survival.era,
      started: survival.era_started || new Date().toISOString(),
      ended: new Date().toISOString(),
      description: survival.era_description,
      patterns: {
        survived: survival.patterns?.survived || {},
        canonical: survival.patterns?.canonical || [],
        rejected: survival.patterns?.rejected || [],
      },
    };

    // Write archive
    const archivePath = path.join(erasDir, `${survival.era}.json`);
    fs.writeFileSync(archivePath, JSON.stringify(archive, null, 2));

    return archivePath;
  } catch {
    return null;
  }
}

/**
 * Load an archived era.
 */
export function loadEraArchive(eraName: string, projectRoot: string = process.cwd()): EraArchive | null {
  const archivePath = path.join(projectRoot, ERAS_DIRECTORY, `${eraName}.json`);

  try {
    if (!fs.existsSync(archivePath)) {
      return null;
    }

    const content = fs.readFileSync(archivePath, 'utf-8');
    return JSON.parse(content) as EraArchive;
  } catch {
    return null;
  }
}

/**
 * List all archived eras.
 */
export function listArchivedEras(projectRoot: string = process.cwd()): Era[] {
  const erasDir = path.join(projectRoot, ERAS_DIRECTORY);

  try {
    if (!fs.existsSync(erasDir)) {
      return [];
    }

    const files = fs.readdirSync(erasDir).filter(f => f.endsWith('.json'));
    const eras: Era[] = [];

    for (const file of files) {
      const filePath = path.join(erasDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const archive = JSON.parse(content) as EraArchive;
      eras.push({
        name: archive.name,
        started: archive.started,
        ended: archive.ended,
        description: archive.description,
      });
    }

    // Sort by start date
    eras.sort((a, b) => new Date(a.started).getTime() - new Date(b.started).getTime());
    return eras;
  } catch {
    return [];
  }
}

// =============================================================================
// ERA TRANSITION
// =============================================================================

/**
 * Transition to a new era.
 */
export function transitionToNewEra(
  newEraName: string,
  description?: string,
  projectRoot: string = process.cwd()
): EraTransitionResult {
  const survivalPath = path.join(projectRoot, SURVIVAL_PATH);

  try {
    // Get current era
    const currentEra = getCurrentEra(projectRoot);
    const previousEra = currentEra?.name;

    // Archive current era if exists
    let archivePath: string | undefined;
    if (currentEra) {
      archivePath = archiveEra(projectRoot) || undefined;
    }

    // Read or create survival.json
    let survival: Record<string, unknown> = {};
    if (fs.existsSync(survivalPath)) {
      const content = fs.readFileSync(survivalPath, 'utf-8');
      survival = JSON.parse(content);
    } else {
      // Create .sigil directory if needed
      const sigilDir = path.join(projectRoot, '.sigil');
      if (!fs.existsSync(sigilDir)) {
        fs.mkdirSync(sigilDir, { recursive: true });
      }
    }

    // Update era fields
    survival.era = newEraName;
    survival.era_started = new Date().toISOString();
    if (description) {
      survival.era_description = description;
    }

    // Reset patterns for fresh start (but keep rejected for safety)
    const rejected = (survival.patterns as Record<string, unknown>)?.rejected || [];
    survival.patterns = {
      survived: {},
      canonical: [],
      rejected,
    };

    // Write updated survival.json
    fs.writeFileSync(survivalPath, JSON.stringify(survival, null, 2));

    return {
      success: true,
      previousEra,
      newEra: newEraName,
      archivePath,
    };
  } catch (error) {
    return {
      success: false,
      newEra: newEraName,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Initialize default era for new project.
 */
export function initializeDefaultEra(projectRoot: string = process.cwd()): EraTransitionResult {
  const currentEra = getCurrentEra(projectRoot);
  if (currentEra) {
    return {
      success: true,
      newEra: currentEra.name,
    };
  }

  return transitionToNewEra(DEFAULT_ERA, 'Initial era', projectRoot);
}

// =============================================================================
// ERA IN CRAFT LOGS
// =============================================================================

/**
 * Add era to log entry.
 */
export function addEraToLogEntry(
  logEntry: Record<string, unknown>,
  projectRoot: string = process.cwd()
): Record<string, unknown> {
  const era = getCurrentEraName(projectRoot);
  return {
    ...logEntry,
    era,
  };
}

/**
 * Filter log entries by era.
 */
export function filterLogsByEra(
  logs: EraLogEntry[],
  eraName: string
): EraLogEntry[] {
  return logs.filter(log => log.era === eraName);
}

/**
 * Get all eras from logs.
 */
export function getErasFromLogs(logs: EraLogEntry[]): string[] {
  const eras = new Set<string>();
  for (const log of logs) {
    if (log.era) {
      eras.add(log.era);
    }
  }
  return Array.from(eras);
}

// =============================================================================
// RULES.MD ERA MARKERS
// =============================================================================

/**
 * Format era section for rules.md.
 */
export function formatEraSection(projectRoot: string = process.cwd()): string {
  const currentEra = getCurrentEra(projectRoot);
  const archivedEras = listArchivedEras(projectRoot);

  const lines: string[] = ['## Eras', ''];

  // Current era
  if (currentEra) {
    lines.push(`### Current: ${currentEra.name}`);
    lines.push(`Started: ${currentEra.started.split('T')[0]}`);
    if (currentEra.description) {
      lines.push(`Description: ${currentEra.description}`);
    }
    lines.push('');
  } else {
    lines.push(`### Current: ${DEFAULT_ERA} (default)`);
    lines.push('');
  }

  // Historical eras
  if (archivedEras.length > 0) {
    lines.push('### Historical');
    lines.push('');
    for (const era of archivedEras) {
      const started = era.started.split('T')[0];
      const ended = era.ended?.split('T')[0] || 'unknown';
      lines.push(`- **${era.name}**: ${started} → ${ended}`);
      if (era.description) {
        lines.push(`  - ${era.description}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Update rules.md with era section.
 */
export function updateRulesWithEra(
  rulesPath: string,
  projectRoot: string = process.cwd()
): boolean {
  try {
    let content = '';
    if (fs.existsSync(rulesPath)) {
      content = fs.readFileSync(rulesPath, 'utf-8');
    }

    // Remove existing era section
    const eraStart = content.indexOf('## Eras');
    const nextSection = content.indexOf('\n## ', eraStart + 1);
    if (eraStart !== -1) {
      if (nextSection !== -1) {
        content = content.slice(0, eraStart) + content.slice(nextSection);
      } else {
        content = content.slice(0, eraStart);
      }
    }

    // Add new era section
    const eraSection = formatEraSection(projectRoot);
    content = content.trim() + '\n\n' + eraSection;

    fs.writeFileSync(rulesPath, content);
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate era name.
 */
export function isValidEraName(name: string): boolean {
  // Must be non-empty, alphanumeric with dashes allowed
  if (!name || name.length === 0) return false;
  if (name.length > 50) return false;
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(name);
}

/**
 * Check if era transition is valid.
 */
export function canTransitionToEra(
  newEraName: string,
  projectRoot: string = process.cwd()
): { valid: boolean; reason?: string } {
  if (!isValidEraName(newEraName)) {
    return {
      valid: false,
      reason: 'Era name must be alphanumeric with optional dashes',
    };
  }

  const currentEra = getCurrentEra(projectRoot);
  if (currentEra?.name === newEraName) {
    return {
      valid: false,
      reason: `Already in era "${newEraName}"`,
    };
  }

  if (eraExists(newEraName, projectRoot)) {
    return {
      valid: false,
      reason: `Era "${newEraName}" already exists in archives`,
    };
  }

  return { valid: true };
}

// =============================================================================
// FORMATTING
// =============================================================================

/**
 * Format era transition message.
 */
export function formatEraTransitionMessage(result: EraTransitionResult): string {
  if (!result.success) {
    return `❌ Era transition failed: ${result.error}`;
  }

  const lines = ['🌅 **Era Transition Complete**', ''];

  if (result.previousEra) {
    lines.push(`Previous era: ${result.previousEra}`);
    if (result.archivePath) {
      lines.push(`Archived to: ${result.archivePath}`);
    }
  }

  lines.push(`New era: **${result.newEra}**`);
  lines.push('');
  lines.push('Pattern precedent reset. Physics unchanged.');

  return lines.join('\n');
}

/**
 * Format era summary.
 */
export function formatEraSummary(projectRoot: string = process.cwd()): string {
  const currentEra = getCurrentEra(projectRoot);
  const archivedEras = listArchivedEras(projectRoot);

  const lines = ['📅 **Era Summary**', ''];

  if (currentEra) {
    lines.push(`Current: ${currentEra.name}`);
    lines.push(`Since: ${currentEra.started.split('T')[0]}`);
  } else {
    lines.push(`Current: ${DEFAULT_ERA} (default)`);
  }

  lines.push(`Archived eras: ${archivedEras.length}`);

  return lines.join('\n');
}
