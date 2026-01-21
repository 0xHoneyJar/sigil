/**
 * PhysicsLoader - Load Sigil physics rules from markdown
 *
 * Parses .claude/rules/01-sigil-physics.md to extract the physics table.
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import type {
  PhysicsTable,
  PhysicsRule,
  EffectType,
  SyncStrategy,
  ConfirmationType,
} from './types.js';

/** Default physics rules path */
const DEFAULT_PHYSICS_PATH = '.claude/rules/01-sigil-physics.md';

/** Cached physics table */
let cachedPhysics: PhysicsTable | null = null;
let cachedPath: string | null = null;

/**
 * Parse sync strategy from string
 */
function parseSyncStrategy(value: string): SyncStrategy {
  const normalized = value.toLowerCase().trim();
  if (normalized === 'pessimistic') return 'pessimistic';
  if (normalized === 'optimistic') return 'optimistic';
  if (normalized === 'immediate') return 'immediate';
  return 'optimistic'; // Default
}

/**
 * Parse timing from string (e.g., "800ms" -> 800)
 */
function parseTiming(value: string): number {
  const match = value.match(/(\d+)\s*ms/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  // Try plain number
  const num = parseInt(value, 10);
  return isNaN(num) ? 200 : num;
}

/**
 * Parse confirmation type from string
 */
function parseConfirmation(value: string): ConfirmationType {
  const normalized = value.toLowerCase().trim();
  if (normalized === 'required' || normalized === 'yes') return 'required';
  if (normalized.includes('toast') || normalized.includes('undo')) return 'toast_undo';
  if (normalized === 'none' || normalized === 'no') return 'none';
  return 'none';
}

/**
 * Parse effect type from string
 */
function parseEffectType(value: string): EffectType | null {
  const normalized = value.toLowerCase().replace(/[\s-]/g, '_').trim();

  const mapping: Record<string, EffectType> = {
    financial: 'financial',
    destructive: 'destructive',
    soft_delete: 'soft_delete',
    'soft delete': 'soft_delete',
    standard: 'standard',
    navigation: 'navigation',
    query: 'query',
    local_state: 'local',
    'local state': 'local',
    local: 'local',
    high_freq: 'high_freq',
    'high-freq': 'high_freq',
    highfreq: 'high_freq',
  };

  return mapping[normalized] ?? null;
}

/**
 * Parse physics table from markdown content
 */
function parsePhysicsTable(content: string): PhysicsTable {
  const physics: PhysicsTable = new Map();

  // Find the physics table section
  const tableMatch = content.match(
    /<physics_table>[\s\S]*?\|[\s\S]*?<\/physics_table>/
  );

  if (!tableMatch) {
    console.warn('Physics table not found in content');
    return getDefaultPhysics();
  }

  const tableContent = tableMatch[0];

  // Parse markdown table rows
  // Format: | Effect | Sync | Timing | Confirmation | Why |
  const lines = tableContent.split('\n');

  for (const line of lines) {
    // Skip header and separator lines
    if (!line.includes('|') || line.includes('---') || line.includes('Effect')) {
      continue;
    }

    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (cells.length < 4) continue;

    const effectStr = cells[0];
    const syncStr = cells[1];
    const timingStr = cells[2];
    const confirmStr = cells[3];
    const whyParts = cells.slice(4);

    if (!effectStr || !syncStr || !timingStr || !confirmStr) continue;

    const effect = parseEffectType(effectStr);
    if (!effect) continue;

    const rule: PhysicsRule = {
      effect,
      sync: parseSyncStrategy(syncStr),
      timing: parseTiming(timingStr),
      confirmation: parseConfirmation(confirmStr),
      rationale: whyParts.join(' ').trim(),
    };

    physics.set(effect, rule);
  }

  return physics;
}

/**
 * Get default physics table (fallback when file not found)
 */
export function getDefaultPhysics(): PhysicsTable {
  const physics: PhysicsTable = new Map();

  physics.set('financial', {
    effect: 'financial',
    sync: 'pessimistic',
    timing: 800,
    confirmation: 'required',
    rationale: "Money can't roll back. Users need time to verify.",
  });

  physics.set('destructive', {
    effect: 'destructive',
    sync: 'pessimistic',
    timing: 600,
    confirmation: 'required',
    rationale: 'Permanent actions need deliberation.',
  });

  physics.set('soft_delete', {
    effect: 'soft_delete',
    sync: 'optimistic',
    timing: 200,
    confirmation: 'toast_undo',
    rationale: 'Undo exists, so we can be fast.',
  });

  physics.set('standard', {
    effect: 'standard',
    sync: 'optimistic',
    timing: 200,
    confirmation: 'none',
    rationale: 'Low stakes = snappy feedback.',
  });

  physics.set('navigation', {
    effect: 'navigation',
    sync: 'immediate',
    timing: 150,
    confirmation: 'none',
    rationale: 'URL changes feel instant.',
  });

  physics.set('query', {
    effect: 'query',
    sync: 'optimistic',
    timing: 150,
    confirmation: 'none',
    rationale: 'Data retrieval, no state change.',
  });

  physics.set('local', {
    effect: 'local',
    sync: 'immediate',
    timing: 100,
    confirmation: 'none',
    rationale: 'No server = instant expected.',
  });

  physics.set('high_freq', {
    effect: 'high_freq',
    sync: 'immediate',
    timing: 0,
    confirmation: 'none',
    rationale: 'Animation becomes friction.',
  });

  return physics;
}

/**
 * Load physics from file
 *
 * @param path - Path to physics markdown file (default: .claude/rules/01-sigil-physics.md)
 * @returns Parsed physics table
 */
export async function loadPhysics(path?: string): Promise<PhysicsTable> {
  const physicsPath = path ?? DEFAULT_PHYSICS_PATH;

  // Return cached if same path
  if (cachedPhysics && cachedPath === physicsPath) {
    return cachedPhysics;
  }

  // Check if file exists
  if (!existsSync(physicsPath)) {
    console.warn(`Physics file not found at ${physicsPath}, using defaults`);
    cachedPhysics = getDefaultPhysics();
    cachedPath = physicsPath;
    return cachedPhysics;
  }

  try {
    const content = await readFile(physicsPath, 'utf-8');
    cachedPhysics = parsePhysicsTable(content);
    cachedPath = physicsPath;

    // If parsing found nothing, use defaults
    if (cachedPhysics.size === 0) {
      console.warn('No physics rules parsed, using defaults');
      cachedPhysics = getDefaultPhysics();
    }

    return cachedPhysics;
  } catch (error) {
    console.warn(`Error loading physics from ${physicsPath}:`, error);
    cachedPhysics = getDefaultPhysics();
    cachedPath = physicsPath;
    return cachedPhysics;
  }
}

/**
 * Get physics rule for an effect type
 *
 * @param effect - Effect type to look up
 * @param physics - Physics table (will load if not provided)
 * @returns Physics rule or undefined
 */
export async function getPhysicsRule(
  effect: EffectType,
  physics?: PhysicsTable
): Promise<PhysicsRule | undefined> {
  const table = physics ?? (await loadPhysics());
  return table.get(effect);
}

/**
 * Clear physics cache (for testing)
 */
export function clearPhysicsCache(): void {
  cachedPhysics = null;
  cachedPath = null;
}

/**
 * Check if physics are cached
 */
export function isPhysicsCached(): boolean {
  return cachedPhysics !== null;
}
