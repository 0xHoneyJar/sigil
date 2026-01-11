/**
 * @sigil-tier gold
 * Sigil v6.0 — Survival Observer
 *
 * Silent pattern tracking via PostToolUse hook.
 * Observe patterns, track their survival.
 *
 * @module process/survival-observer
 */

import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Pattern status in survival lifecycle.
 * v6.1: Added 'canonical-candidate' for taste-key curation.
 */
export type PatternStatus = 'experimental' | 'surviving' | 'canonical-candidate' | 'canonical' | 'rejected';

/**
 * Tracked pattern entry.
 */
export interface PatternEntry {
  /** Number of occurrences */
  occurrences: number;
  /** First seen date (ISO) */
  first_seen: string;
  /** Last seen date (ISO) */
  last_seen: string;
  /** Files containing this pattern */
  files: string[];
  /** Current status */
  status: PatternStatus;
}

/**
 * Survival index structure.
 */
export interface SurvivalIndex {
  /** Era information */
  era?: string;
  era_started?: string;
  /** Scan metadata */
  last_scan?: string;
  /** Pattern tracking */
  patterns: {
    survived: Record<string, PatternEntry>;
    canonical: string[];
    rejected: string[];
  };
}

/**
 * Detected pattern in code.
 */
export interface DetectedPattern {
  /** Pattern name */
  name: string;
  /** Pattern category */
  category: 'animation' | 'structure' | 'hooks' | 'state' | 'style';
  /** Line number where detected */
  line: number;
  /** Code snippet */
  snippet: string;
}

/**
 * Pattern tag format.
 */
export interface PatternTag {
  /** Pattern name */
  name: string;
  /** Date tagged */
  date: string;
  /** Line number */
  line: number;
}

/**
 * Observation result.
 */
export interface ObservationResult {
  /** Whether observation succeeded */
  success: boolean;
  /** Patterns detected */
  patterns: DetectedPattern[];
  /** Patterns tagged */
  tagged: string[];
  /** Patterns updated in survival */
  updated: string[];
  /** Error message (if failed) */
  error?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Survival.json path */
export const SURVIVAL_PATH = 'grimoires/sigil/state/survival.json';

/** Pattern tag format */
export const PATTERN_TAG_PREFIX = '// @sigil-pattern:';

/** Promotion thresholds */
export const PROMOTION_THRESHOLDS = {
  surviving: 3,
  canonical: 5,
};

// =============================================================================
// PATTERN DETECTION
// =============================================================================

/**
 * Pattern detection rules.
 */
const PATTERN_RULES: Array<{
  pattern: RegExp;
  name: (match: RegExpMatchArray) => string;
  category: DetectedPattern['category'];
}> = [
  // Animation patterns
  {
    pattern: /useSpring\s*\(/,
    name: () => 'spring-animation',
    category: 'animation',
  },
  {
    pattern: /useTransition\s*\(/,
    name: () => 'transition-animation',
    category: 'animation',
  },
  {
    pattern: /animate\s*:\s*\{[^}]*scale/,
    name: () => 'scale-animation',
    category: 'animation',
  },
  {
    pattern: /animate\s*:\s*\{[^}]*opacity/,
    name: () => 'fade-animation',
    category: 'animation',
  },
  {
    pattern: /motion\.div|motion\.span|motion\.button/,
    name: () => 'motion-component',
    category: 'animation',
  },

  // Structure patterns
  {
    pattern: /\.(\w+)\s*=\s*function|const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/,
    name: (m) => `${m[1] || m[2] || 'anonymous'}-component`,
    category: 'structure',
  },
  {
    pattern: /children\s*:\s*React\.ReactNode/,
    name: () => 'slot-pattern',
    category: 'structure',
  },
  {
    pattern: /forwardRef\s*\(/,
    name: () => 'forwarded-ref',
    category: 'structure',
  },

  // Hook patterns
  {
    pattern: /useSigilMutation\s*\(/,
    name: () => 'sigil-mutation',
    category: 'hooks',
  },
  {
    pattern: /useCriticalAction\s*\(/,
    name: () => 'critical-action',
    category: 'hooks',
  },
  {
    pattern: /useState\s*\([^)]*\)/,
    name: () => 'state-hook',
    category: 'hooks',
  },
  {
    pattern: /useEffect\s*\(/,
    name: () => 'effect-hook',
    category: 'hooks',
  },

  // State patterns
  {
    pattern: /optimistic\w*\s*[=:]/i,
    name: () => 'optimistic-update',
    category: 'state',
  },
  {
    pattern: /serverTick|server_tick/i,
    name: () => 'server-tick',
    category: 'state',
  },

  // Style patterns
  {
    pattern: /linear-gradient|radial-gradient/,
    name: () => 'gradient-style',
    category: 'style',
  },
  {
    pattern: /backdrop-blur|bg-opacity/,
    name: () => 'glass-effect',
    category: 'style',
  },
];

/**
 * Detect patterns in code.
 */
export function detectPatterns(code: string): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const rule of PATTERN_RULES) {
      const match = line.match(rule.pattern);
      if (match) {
        patterns.push({
          name: rule.name(match),
          category: rule.category,
          line: i + 1,
          snippet: line.trim().slice(0, 80),
        });
      }
    }
  }

  // Deduplicate by name
  const seen = new Set<string>();
  return patterns.filter(p => {
    if (seen.has(p.name)) return false;
    seen.add(p.name);
    return true;
  });
}

/**
 * Check if code already has a pattern tag.
 */
export function hasPatternTag(code: string, patternName: string): boolean {
  const tagPattern = new RegExp(
    `${PATTERN_TAG_PREFIX}\\s*${patternName}\\s*\\(`
  );
  return tagPattern.test(code);
}

/**
 * Get all pattern tags from code.
 */
export function getPatternTags(code: string): PatternTag[] {
  const tags: PatternTag[] = [];
  const lines = code.split('\n');

  const tagPattern = new RegExp(
    `${PATTERN_TAG_PREFIX}\\s*(\\S+)\\s*\\((\\d{4}-\\d{2}-\\d{2})\\)`
  );

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(tagPattern);
    if (match) {
      tags.push({
        name: match[1],
        date: match[2],
        line: i + 1,
      });
    }
  }

  return tags;
}

// =============================================================================
// PATTERN TAGGING
// =============================================================================

/**
 * Add pattern tag to code.
 */
export function addPatternTag(
  code: string,
  pattern: DetectedPattern
): string {
  const lines = code.split('\n');
  const date = new Date().toISOString().split('T')[0];
  const tag = `${PATTERN_TAG_PREFIX} ${pattern.name} (${date})`;

  // Insert tag before the pattern line
  const insertLine = Math.max(0, pattern.line - 1);
  lines.splice(insertLine, 0, tag);

  return lines.join('\n');
}

/**
 * Add multiple pattern tags to code.
 */
export function addPatternTags(
  code: string,
  patterns: DetectedPattern[]
): { code: string; tagged: string[] } {
  let updatedCode = code;
  const tagged: string[] = [];

  // Sort by line number descending to avoid offset issues
  const sorted = [...patterns].sort((a, b) => b.line - a.line);

  for (const pattern of sorted) {
    if (!hasPatternTag(updatedCode, pattern.name)) {
      updatedCode = addPatternTag(updatedCode, pattern);
      tagged.push(pattern.name);
    }
  }

  return { code: updatedCode, tagged };
}

// =============================================================================
// SURVIVAL INDEX MANAGEMENT
// =============================================================================

/**
 * Load survival index.
 */
export function loadSurvivalIndex(
  projectRoot: string = process.cwd()
): SurvivalIndex {
  const survivalPath = path.join(projectRoot, SURVIVAL_PATH);

  try {
    if (fs.existsSync(survivalPath)) {
      const content = fs.readFileSync(survivalPath, 'utf-8');
      return JSON.parse(content) as SurvivalIndex;
    }
  } catch {
    // Fall through to default
  }

  return {
    patterns: {
      survived: {},
      canonical: [],
      rejected: [],
    },
  };
}

/**
 * Save survival index.
 */
export function saveSurvivalIndex(
  index: SurvivalIndex,
  projectRoot: string = process.cwd()
): boolean {
  const survivalPath = path.join(projectRoot, SURVIVAL_PATH);

  try {
    // Ensure directory exists
    const dir = path.dirname(survivalPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(survivalPath, JSON.stringify(index, null, 2));
    return true;
  } catch {
    return false;
  }
}

/**
 * Determine pattern status based on occurrences.
 * v6.0: Auto-promotes to canonical at 5+ occurrences.
 * @deprecated Use determineStatusWithCuration for v6.1 taste-key flow
 */
export function determineStatus(occurrences: number): PatternStatus {
  if (occurrences >= PROMOTION_THRESHOLDS.canonical) {
    return 'canonical';
  }
  if (occurrences >= PROMOTION_THRESHOLDS.surviving) {
    return 'surviving';
  }
  return 'experimental';
}

/**
 * Determine pattern status with taste-key curation.
 * v6.1: 5+ occurrences → canonical-candidate (requires approval)
 *
 * @param occurrences - Number of pattern occurrences
 * @param isApproved - Whether pattern has been approved by taste-key holder
 */
export function determineStatusWithCuration(
  occurrences: number,
  isApproved: boolean = false
): PatternStatus {
  if (occurrences >= PROMOTION_THRESHOLDS.canonical) {
    // v6.1: Requires taste-key approval for canonical
    return isApproved ? 'canonical' : 'canonical-candidate';
  }
  if (occurrences >= PROMOTION_THRESHOLDS.surviving) {
    return 'surviving';
  }
  return 'experimental';
}

/**
 * Update pattern in survival index.
 */
export function updatePattern(
  index: SurvivalIndex,
  patternName: string,
  filePath: string
): void {
  const now = new Date().toISOString();
  const dateOnly = now.split('T')[0];

  const existing = index.patterns.survived[patternName];

  if (existing) {
    // Update existing pattern
    existing.occurrences++;
    existing.last_seen = dateOnly;
    if (!existing.files.includes(filePath)) {
      existing.files.push(filePath);
    }
    existing.status = determineStatus(existing.occurrences);

    // Update canonical list if promoted
    if (existing.status === 'canonical' &&
        !index.patterns.canonical.includes(patternName)) {
      index.patterns.canonical.push(patternName);
    }
  } else {
    // Create new pattern entry
    index.patterns.survived[patternName] = {
      occurrences: 1,
      first_seen: dateOnly,
      last_seen: dateOnly,
      files: [filePath],
      status: 'experimental',
    };
  }

  index.last_scan = now;
}

/**
 * Mark pattern as rejected.
 */
export function rejectPattern(
  index: SurvivalIndex,
  patternName: string
): void {
  // Remove from survived
  delete index.patterns.survived[patternName];

  // Remove from canonical
  const canonicalIdx = index.patterns.canonical.indexOf(patternName);
  if (canonicalIdx !== -1) {
    index.patterns.canonical.splice(canonicalIdx, 1);
  }

  // Add to rejected if not already there
  if (!index.patterns.rejected.includes(patternName)) {
    index.patterns.rejected.push(patternName);
  }
}

// =============================================================================
// OBSERVATION FLOW
// =============================================================================

/**
 * Observe patterns in generated code.
 * This is the main entry point for PostToolUse hook.
 */
export function observePatterns(
  code: string,
  filePath: string,
  projectRoot: string = process.cwd()
): ObservationResult {
  try {
    // Detect patterns
    const detected = detectPatterns(code);
    if (detected.length === 0) {
      return {
        success: true,
        patterns: [],
        tagged: [],
        updated: [],
      };
    }

    // Load survival index
    const index = loadSurvivalIndex(projectRoot);

    // Update patterns in survival
    const updated: string[] = [];
    for (const pattern of detected) {
      updatePattern(index, pattern.name, filePath);
      updated.push(pattern.name);
    }

    // Save updated index
    saveSurvivalIndex(index, projectRoot);

    return {
      success: true,
      patterns: detected,
      tagged: [], // Tagging is optional, done separately
      updated,
    };
  } catch (error) {
    return {
      success: false,
      patterns: [],
      tagged: [],
      updated: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Full observation with tagging.
 * Returns updated code with pattern tags.
 */
export function observeAndTag(
  code: string,
  filePath: string,
  projectRoot: string = process.cwd()
): { result: ObservationResult; code: string } {
  // First observe
  const result = observePatterns(code, filePath, projectRoot);

  if (!result.success || result.patterns.length === 0) {
    return { result, code };
  }

  // Then tag
  const { code: taggedCode, tagged } = addPatternTags(code, result.patterns);
  result.tagged = tagged;

  return { result, code: taggedCode };
}

// =============================================================================
// GARDENER FUNCTIONS
// =============================================================================

/**
 * Scan all patterns via ripgrep pattern.
 * Returns pattern name -> count mapping.
 */
export function countPatternOccurrences(
  projectRoot: string = process.cwd()
): Record<string, number> {
  // This would normally use ripgrep, but for TypeScript we'll scan files
  const counts: Record<string, number> = {};
  const srcDir = path.join(projectRoot, 'src');

  try {
    if (!fs.existsSync(srcDir)) {
      return counts;
    }

    // Simple recursive scan (in production, use ripgrep)
    const scanDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const tags = getPatternTags(content);

          for (const tag of tags) {
            counts[tag.name] = (counts[tag.name] || 0) + 1;
          }
        }
      }
    };

    scanDir(srcDir);
  } catch {
    // Ignore errors
  }

  return counts;
}

/**
 * Apply promotion rules based on occurrence counts.
 */
export function applyPromotionRules(
  index: SurvivalIndex,
  counts: Record<string, number>
): { promoted: string[]; demoted: string[] } {
  const promoted: string[] = [];
  const demoted: string[] = [];

  // Check each survived pattern
  for (const [name, entry] of Object.entries(index.patterns.survived)) {
    const count = counts[name] || 0;

    // Update occurrences
    entry.occurrences = count;
    entry.last_seen = new Date().toISOString().split('T')[0];

    // Apply promotion
    const newStatus = determineStatus(count);
    if (newStatus === 'canonical' && entry.status !== 'canonical') {
      promoted.push(name);
    }
    entry.status = newStatus;

    // Check for demotion (zero occurrences)
    if (count === 0) {
      demoted.push(name);
    }
  }

  // Add to canonical list
  for (const name of promoted) {
    if (!index.patterns.canonical.includes(name)) {
      index.patterns.canonical.push(name);
    }
  }

  // Handle demoted patterns
  for (const name of demoted) {
    rejectPattern(index, name);
  }

  return { promoted, demoted };
}

/**
 * Run gardener scan and update survival.
 */
export function runGardener(
  projectRoot: string = process.cwd()
): { promoted: string[]; demoted: string[]; total: number } {
  const index = loadSurvivalIndex(projectRoot);
  const counts = countPatternOccurrences(projectRoot);

  const result = applyPromotionRules(index, counts);
  index.last_scan = new Date().toISOString();

  saveSurvivalIndex(index, projectRoot);

  return {
    ...result,
    total: Object.keys(counts).length,
  };
}

// =============================================================================
// FORMATTING
// =============================================================================

/**
 * Format observation result message.
 */
export function formatObservationResult(result: ObservationResult): string {
  if (!result.success) {
    return `❌ Observation failed: ${result.error}`;
  }

  if (result.patterns.length === 0) {
    return '👀 No patterns detected';
  }

  const lines = ['👀 **Patterns Observed**', ''];

  for (const pattern of result.patterns) {
    lines.push(`- ${pattern.name} (${pattern.category})`);
  }

  if (result.updated.length > 0) {
    lines.push('', `Updated: ${result.updated.join(', ')}`);
  }

  return lines.join('\n');
}

/**
 * Format gardener result.
 */
export function formatGardenerResult(result: {
  promoted: string[];
  demoted: string[];
  total: number;
}): string {
  const lines = ['🌱 **Gardener Scan Complete**', ''];

  lines.push(`Total patterns: ${result.total}`);

  if (result.promoted.length > 0) {
    lines.push(`Promoted to canonical: ${result.promoted.join(', ')}`);
  }

  if (result.demoted.length > 0) {
    lines.push(`Rejected (removed): ${result.demoted.join(', ')}`);
  }

  return lines.join('\n');
}

// =============================================================================
// HOOK BRIDGE EXPORTS
// =============================================================================

/**
 * Hook result type for bash script bridge.
 */
export interface HookObservationResult {
  /** Number of patterns detected */
  patternsDetected: number;
  /** Patterns updated in survival.json */
  patternsUpdated: string[];
  /** Patterns that became canonical candidates */
  candidatesCreated: string[];
}

/**
 * Observation function for bash hook bridge.
 * Called by observe.sh via npx tsx.
 *
 * @param filePath - Path of the file being written
 * @param code - Code content to observe
 * @param projectRoot - Project root for survival.json
 * @returns HookObservationResult
 */
export function observeForHook(
  filePath: string,
  code: string,
  projectRoot: string = process.cwd()
): HookObservationResult {
  try {
    // Observe patterns
    const result = observePatterns(code, filePath, projectRoot);

    if (!result.success) {
      return {
        patternsDetected: 0,
        patternsUpdated: [],
        candidatesCreated: [],
      };
    }

    // Load survival to check for new candidates
    const index = loadSurvivalIndex(projectRoot);
    const candidatesCreated: string[] = [];

    // Check for patterns that reached canonical threshold
    for (const patternName of result.updated) {
      const entry = index.patterns.survived[patternName];
      if (entry && entry.occurrences >= PROMOTION_THRESHOLDS.canonical) {
        // In v6.1, this would become a canonical-candidate
        // For now, we note it was promoted to canonical
        if (!index.patterns.canonical.includes(patternName)) {
          candidatesCreated.push(patternName);
        }
      }
    }

    return {
      patternsDetected: result.patterns.length,
      patternsUpdated: result.updated,
      candidatesCreated,
    };
  } catch {
    return {
      patternsDetected: 0,
      patternsUpdated: [],
      candidatesCreated: [],
    };
  }
}

// =============================================================================
// TASTE-KEY CURATION (v6.1)
// =============================================================================

import * as yaml from 'js-yaml';

/** Taste-key config path */
export const TASTE_KEY_PATH = 'grimoires/sigil/state/taste-key.yaml';

/**
 * Pending promotion entry.
 */
export interface PendingPromotion {
  /** Pattern name */
  pattern: string;
  /** Occurrence count when detected */
  occurrences: number;
  /** First seen date */
  first_seen: string;
  /** Files containing pattern */
  files: string[];
  /** When pattern became a candidate */
  detected_at: string;
}

/**
 * Approval record.
 */
export interface ApprovalRecord {
  /** Pattern name */
  pattern: string;
  /** Approver identifier */
  approver: string;
  /** Approval timestamp */
  approved_at: string;
  /** Optional comment */
  comment?: string;
}

/**
 * Rejection record.
 */
export interface RejectionRecord {
  /** Pattern name */
  pattern: string;
  /** Rejector identifier */
  rejector: string;
  /** Rejection timestamp */
  rejected_at: string;
  /** Reason for rejection */
  reason: string;
}

/**
 * Taste-key configuration.
 */
export interface TasteKeyConfig {
  /** Version */
  version: string;
  /** Taste-key holder email/identifier */
  holder: string;
  /** Whether auto-approve is enabled (default false) */
  auto_approve?: boolean;
  /** Auto-approve after N days (if auto_approve enabled) */
  auto_approve_days?: number;
  /** Pending promotions awaiting approval */
  pending_promotions: PendingPromotion[];
  /** Approved patterns */
  approved: ApprovalRecord[];
  /** Rejected patterns */
  rejected: RejectionRecord[];
}

/**
 * Default taste-key config.
 */
const DEFAULT_TASTE_KEY_CONFIG: TasteKeyConfig = {
  version: '6.1.0',
  holder: '',
  auto_approve: false,
  pending_promotions: [],
  approved: [],
  rejected: [],
};

/**
 * Load taste-key config.
 */
export function loadTasteKeyConfig(
  projectRoot: string = process.cwd()
): TasteKeyConfig {
  const configPath = path.join(projectRoot, TASTE_KEY_PATH);

  try {
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf-8');
      const parsed = yaml.load(content) as TasteKeyConfig;
      return {
        ...DEFAULT_TASTE_KEY_CONFIG,
        ...parsed,
        pending_promotions: parsed.pending_promotions || [],
        approved: parsed.approved || [],
        rejected: parsed.rejected || [],
      };
    }
  } catch {
    // Fall through to default
  }

  return { ...DEFAULT_TASTE_KEY_CONFIG };
}

/**
 * Save taste-key config.
 */
export function saveTasteKeyConfig(
  config: TasteKeyConfig,
  projectRoot: string = process.cwd()
): boolean {
  const configPath = path.join(projectRoot, TASTE_KEY_PATH);

  try {
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(configPath, yaml.dump(config), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if pattern has been approved by taste-key holder.
 */
export function isPatternApproved(
  pattern: string,
  projectRoot: string = process.cwd()
): boolean {
  const config = loadTasteKeyConfig(projectRoot);
  return config.approved.some(a => a.pattern === pattern);
}

/**
 * Check if pattern has been rejected.
 */
export function isPatternRejected(
  pattern: string,
  projectRoot: string = process.cwd()
): boolean {
  const config = loadTasteKeyConfig(projectRoot);
  return config.rejected.some(r => r.pattern === pattern);
}

/**
 * Check if pattern is pending approval.
 */
export function isPatternPending(
  pattern: string,
  projectRoot: string = process.cwd()
): boolean {
  const config = loadTasteKeyConfig(projectRoot);
  return config.pending_promotions.some(p => p.pattern === pattern);
}

/**
 * Add pattern to pending promotions.
 * Called when pattern reaches 5+ occurrences.
 */
export function addPendingPromotion(
  pattern: string,
  entry: PatternEntry,
  projectRoot: string = process.cwd()
): boolean {
  const config = loadTasteKeyConfig(projectRoot);

  // Skip if already pending, approved, or rejected
  if (isPatternPending(pattern, projectRoot)) {
    return false;
  }
  if (isPatternApproved(pattern, projectRoot)) {
    return false;
  }
  if (isPatternRejected(pattern, projectRoot)) {
    return false;
  }

  const promotion: PendingPromotion = {
    pattern,
    occurrences: entry.occurrences,
    first_seen: entry.first_seen,
    files: entry.files,
    detected_at: new Date().toISOString(),
  };

  config.pending_promotions.push(promotion);
  console.log(`[Sigil] Pattern '${pattern}' added to pending promotions (${entry.occurrences} occurrences)`);

  return saveTasteKeyConfig(config, projectRoot);
}

/**
 * Approve a pending promotion.
 * Moves pattern from pending to approved, updates survival.json to canonical.
 */
export function approvePromotion(
  pattern: string,
  approver: string,
  comment?: string,
  projectRoot: string = process.cwd()
): boolean {
  const config = loadTasteKeyConfig(projectRoot);

  // Find pending promotion
  const pendingIdx = config.pending_promotions.findIndex(p => p.pattern === pattern);
  if (pendingIdx === -1) {
    return false;
  }

  // Remove from pending
  config.pending_promotions.splice(pendingIdx, 1);

  // Add to approved
  const approval: ApprovalRecord = {
    pattern,
    approver,
    approved_at: new Date().toISOString(),
    comment,
  };
  config.approved.push(approval);

  // Save config
  if (!saveTasteKeyConfig(config, projectRoot)) {
    return false;
  }

  // Update survival.json
  const index = loadSurvivalIndex(projectRoot);
  const entry = index.patterns.survived[pattern];
  if (entry) {
    entry.status = 'canonical';
    if (!index.patterns.canonical.includes(pattern)) {
      index.patterns.canonical.push(pattern);
    }
    saveSurvivalIndex(index, projectRoot);
  }

  console.log(`[Sigil] Pattern '${pattern}' approved and promoted to canonical`);
  return true;
}

/**
 * Reject a pending promotion.
 * Moves pattern from pending to rejected.
 */
export function rejectPromotion(
  pattern: string,
  rejector: string,
  reason: string,
  projectRoot: string = process.cwd()
): boolean {
  const config = loadTasteKeyConfig(projectRoot);

  // Find pending promotion
  const pendingIdx = config.pending_promotions.findIndex(p => p.pattern === pattern);
  if (pendingIdx === -1) {
    return false;
  }

  // Remove from pending
  config.pending_promotions.splice(pendingIdx, 1);

  // Add to rejected
  const rejection: RejectionRecord = {
    pattern,
    rejector,
    rejected_at: new Date().toISOString(),
    reason,
  };
  config.rejected.push(rejection);

  // Save config
  if (!saveTasteKeyConfig(config, projectRoot)) {
    return false;
  }

  // Update survival.json
  const index = loadSurvivalIndex(projectRoot);
  rejectPattern(index, pattern);
  saveSurvivalIndex(index, projectRoot);

  console.log(`[Sigil] Pattern '${pattern}' rejected: ${reason}`);
  return true;
}

/**
 * Get all pending promotions.
 */
export function getPendingPromotions(
  projectRoot: string = process.cwd()
): PendingPromotion[] {
  const config = loadTasteKeyConfig(projectRoot);
  return config.pending_promotions;
}

/**
 * Update pattern with curated promotion.
 * v6.1: Uses taste-key approval instead of auto-canonical.
 */
export function updatePatternWithCuration(
  index: SurvivalIndex,
  patternName: string,
  filePath: string,
  projectRoot: string = process.cwd()
): { becameCandidate: boolean } {
  const now = new Date().toISOString();
  const dateOnly = now.split('T')[0];
  let becameCandidate = false;

  const existing = index.patterns.survived[patternName];

  if (existing) {
    const wasCandidate = existing.status === 'canonical-candidate';
    const wasAboveThreshold = existing.occurrences >= PROMOTION_THRESHOLDS.canonical;

    // Update existing pattern
    existing.occurrences++;
    existing.last_seen = dateOnly;
    if (!existing.files.includes(filePath)) {
      existing.files.push(filePath);
    }

    // Use curated status determination
    const isApproved = isPatternApproved(patternName, projectRoot);
    existing.status = determineStatusWithCuration(existing.occurrences, isApproved);

    // Check if just became a candidate
    if (!wasCandidate && !wasAboveThreshold &&
        existing.occurrences >= PROMOTION_THRESHOLDS.canonical) {
      becameCandidate = true;
      // Add to pending promotions
      addPendingPromotion(patternName, existing, projectRoot);
    }

    // Update canonical list only if approved
    if (existing.status === 'canonical' &&
        !index.patterns.canonical.includes(patternName)) {
      index.patterns.canonical.push(patternName);
    }
  } else {
    // Create new pattern entry
    index.patterns.survived[patternName] = {
      occurrences: 1,
      first_seen: dateOnly,
      last_seen: dateOnly,
      files: [filePath],
      status: 'experimental',
    };
  }

  index.last_scan = now;
  return { becameCandidate };
}
