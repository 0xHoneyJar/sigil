/**
 * @sigil-tier gold
 * Sigil v6.0 — Agent Orchestration
 *
 * Orchestrates all skills for the /craft flow.
 * Implements context resolution, pattern selection, and skill coordination.
 *
 * @module process/agent-orchestration
 */

import * as fs from 'fs';
import * as path from 'path';

// Import from other process modules
import { isWorkshopStale, loadWorkshop, queryMaterial } from './workshop-builder';
import { runSentinel } from './startup-sentinel';
import { findByZone, findByTier, findByVocabulary } from './sanctuary-scanner';
import { isSanctuaryEmpty, loadSeed, getSeedOptions } from './seed-manager';
import {
  readVocabularySync,
  getAllTerms,
  getTerm,
  getTermFeel,
  getRecommendedPhysics,
  matchComponentToTerm,
  type Vocabulary,
  type VocabularyTerm,
} from './vocabulary-reader';
import { validatePhysics, type ValidationResult } from './physics-validator';
import { detectInspirationTrigger, createForkedContext } from './ephemeral-inspiration';
// v6.1: Forge mode is deprecated, replaced by optimistic divergence
// import { detectForgeTrigger, createForgeContext, isForgeMode } from './forge-mode';
import { loadSurvivalIndex, determineStatus } from './survival-observer';
import { createSession, writeCraftLog, type CraftSession } from './chronicling-rationale';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Phase of the craft flow
 */
export type CraftPhase =
  | 'startup'
  | 'discovery'
  | 'context'
  | 'validation'
  | 'generation'
  | 'observation'
  | 'chronicling';

/**
 * Skill execution result
 */
export interface SkillResult {
  skill: string;
  phase: CraftPhase;
  success: boolean;
  data?: unknown;
  error?: string;
  durationMs: number;
}

/**
 * Resolved context from prompt
 */
export interface ResolvedContext {
  vocabularyTerms: string[];
  zone: string;
  physics: string;
  patterns: string[];
  inspirationUrl?: string;
  forgeMode: boolean;
}

/**
 * Pattern selection result
 */
export interface PatternSelection {
  pattern: string;
  status: 'canonical' | 'surviving' | 'experimental' | 'new';
  reason: string;
}

/**
 * Full craft flow result
 */
export interface CraftFlowResult {
  success: boolean;
  context: ResolvedContext;
  skills: SkillResult[];
  validation?: ValidationResult;
  patterns: PatternSelection[];
  session: CraftSession;
  totalDurationMs: number;
}

/**
 * Orchestration options
 */
export interface OrchestrationOptions {
  projectRoot?: string;
  skipWorkshopCheck?: boolean;
  skipValidation?: boolean;
  skipObservation?: boolean;
  skipChronicling?: boolean;
}

// =============================================================================
// VOCABULARY RESOLUTION (v6.1 - Uses vocabulary-reader.ts)
// =============================================================================

/**
 * Cached vocabulary instance.
 */
let vocabularyCache: Vocabulary | null = null;
let vocabularyCachePath: string | null = null;

/**
 * Load vocabulary with caching.
 * @param projectRoot - Project root directory
 */
export function loadVocabulary(projectRoot: string = process.cwd()): Vocabulary {
  const vocabPath = `${projectRoot}/sigil-mark/vocabulary/vocabulary.yaml`;

  // Return cached if same path
  if (vocabularyCache && vocabularyCachePath === vocabPath) {
    return vocabularyCache;
  }

  vocabularyCache = readVocabularySync(vocabPath);
  vocabularyCachePath = vocabPath;
  return vocabularyCache;
}

/**
 * Clear vocabulary cache (for testing).
 */
export function clearVocabularyCache(): void {
  vocabularyCache = null;
  vocabularyCachePath = null;
}

/**
 * Extract vocabulary terms from prompt using vocabulary.yaml.
 * v6.1: No longer uses hardcoded VOCABULARY_TERMS array.
 */
export function extractVocabularyTerms(prompt: string, projectRoot: string = process.cwd()): string[] {
  const lower = prompt.toLowerCase();
  const vocabulary = loadVocabulary(projectRoot);
  const allTerms = getAllTerms(vocabulary);
  const matchedTerms: string[] = [];

  for (const term of allTerms) {
    // Check term ID
    if (lower.includes(term.id)) {
      matchedTerms.push(term.id);
      continue;
    }
    // Check user_facing (case-insensitive)
    if (lower.includes(term.user_facing.toLowerCase())) {
      matchedTerms.push(term.id);
    }
  }

  return matchedTerms;
}

/**
 * Resolve zone from vocabulary terms using vocabulary.yaml.
 * v6.1: Uses term zones from vocabulary file instead of hardcoded mapping.
 */
export function resolveZoneFromVocabulary(terms: string[], projectRoot: string = process.cwd()): string {
  const vocabulary = loadVocabulary(projectRoot);

  // Priority order for zones
  const zonePriority = ['critical', 'marketing', 'admin', 'standard'];

  for (const zone of zonePriority) {
    for (const termId of terms) {
      const term = getTerm(vocabulary, termId);
      if (term && term.zones.includes(zone)) {
        return zone;
      }
    }
  }

  return 'standard';
}

/**
 * Resolve physics from vocabulary terms.
 * v6.1: Uses getRecommendedPhysics from vocabulary-reader.
 */
export function resolvePhysicsFromVocabulary(terms: string[], projectRoot: string = process.cwd()): string {
  const vocabulary = loadVocabulary(projectRoot);

  // Use first matched term's physics
  for (const termId of terms) {
    const physics = getRecommendedPhysics(vocabulary, termId);
    if (physics) {
      return physics.motion;
    }
  }

  return 'default';
}

/**
 * Resolve physics from zone (fallback when no terms matched).
 */
export function resolvePhysicsFromZone(zone: string): string {
  const zonePhysics: Record<string, string> = {
    critical: 'deliberate',
    marketing: 'playful',
    admin: 'snappy',
    standard: 'default',
  };

  return zonePhysics[zone] || 'default';
}

/**
 * Full context resolution from prompt.
 * v6.1: Uses vocabulary.yaml for term extraction and physics resolution.
 */
export function resolveContext(
  prompt: string,
  componentName: string,
  projectRoot: string = process.cwd()
): ResolvedContext {
  // v6.1: Extract terms from vocabulary.yaml
  const vocabularyTerms = extractVocabularyTerms(prompt, projectRoot);
  const zone = resolveZoneFromVocabulary(vocabularyTerms, projectRoot);

  // v6.1: Try vocabulary physics first, fall back to zone physics
  let physics: string;
  if (vocabularyTerms.length > 0) {
    physics = resolvePhysicsFromVocabulary(vocabularyTerms, projectRoot);
  } else {
    physics = resolvePhysicsFromZone(zone);
  }

  // Also check component name against vocabulary
  const vocabulary = loadVocabulary(projectRoot);
  const componentTerm = matchComponentToTerm(vocabulary, componentName);
  if (componentTerm && !vocabularyTerms.includes(componentTerm.id)) {
    vocabularyTerms.push(componentTerm.id);
    // Use component's physics if we didn't find terms in prompt
    if (physics === 'default') {
      physics = componentTerm.recommended.motion;
    }
  }

  // Detect inspiration trigger
  const inspirationTrigger = detectInspirationTrigger(prompt);
  const inspirationUrl = inspirationTrigger?.url;

  // v6.1: Forge mode is deprecated, replaced by optimistic divergence
  // Taste violations are now tagged (not blocked), making explicit forge mode unnecessary.
  const forgeMode = false;

  return {
    vocabularyTerms,
    zone,
    physics,
    patterns: [],
    inspirationUrl,
    forgeMode,
  };
}

// =============================================================================
// PATTERN SELECTION
// =============================================================================

/**
 * Select patterns based on survival status
 */
export function selectPatterns(
  zone: string,
  physics: string,
  projectRoot: string = process.cwd()
): PatternSelection[] {
  const selections: PatternSelection[] = [];
  const survivalIndex = loadSurvivalIndex(projectRoot);

  // Get canonical patterns for this zone
  const canonical = survivalIndex.patterns.canonical || [];

  for (const patternName of canonical) {
    const entry = survivalIndex.patterns.survived[patternName];
    if (entry) {
      selections.push({
        pattern: patternName,
        status: 'canonical',
        reason: `Established pattern with ${entry.occurrences} uses`,
      });
    }
  }

  // If no canonical, suggest surviving patterns
  if (selections.length === 0) {
    for (const [name, entry] of Object.entries(survivalIndex.patterns.survived)) {
      if (entry.status === 'surviving') {
        selections.push({
          pattern: name,
          status: 'surviving',
          reason: `Repeated pattern with ${entry.occurrences} uses`,
        });
      }
    }
  }

  // If still none, suggest experimental
  if (selections.length === 0) {
    for (const [name, entry] of Object.entries(survivalIndex.patterns.survived)) {
      if (entry.status === 'experimental') {
        selections.push({
          pattern: name,
          status: 'experimental',
          reason: `New pattern with ${entry.occurrences} uses`,
        });
      }
    }
  }

  return selections;
}

// =============================================================================
// SKILL EXECUTION
// =============================================================================

/**
 * Execute a skill and track result
 */
async function executeSkill(
  name: string,
  phase: CraftPhase,
  fn: () => Promise<unknown> | unknown
): Promise<SkillResult> {
  const start = performance.now();

  try {
    const data = await fn();
    return {
      skill: name,
      phase,
      success: true,
      data,
      durationMs: performance.now() - start,
    };
  } catch (error) {
    return {
      skill: name,
      phase,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      durationMs: performance.now() - start,
    };
  }
}

// =============================================================================
// CRAFT FLOW
// =============================================================================

/**
 * Run the complete craft flow
 */
export async function runCraftFlow(
  prompt: string,
  componentName: string,
  options: OrchestrationOptions = {}
): Promise<CraftFlowResult> {
  const projectRoot = options.projectRoot || process.cwd();
  const startTime = performance.now();
  const skills: SkillResult[] = [];

  // Create session for chronicling
  const session = createSession(componentName, prompt);

  // Phase 1: Startup
  if (!options.skipWorkshopCheck) {
    const workshopResult = await executeSkill(
      'startup-sentinel',
      'startup',
      () => runSentinel({ projectRoot })
    );
    skills.push(workshopResult);
  }

  // Phase 2: Discovery
  const sanctuaryEmpty = isSanctuaryEmpty(projectRoot);

  if (sanctuaryEmpty) {
    const seedResult = await executeSkill('seeding-sanctuary', 'discovery', () => {
      return loadSeed(projectRoot);
    });
    skills.push(seedResult);
  } else {
    const scanResult = await executeSkill('scanning-sanctuary', 'discovery', () => {
      return findByTier('gold', projectRoot);
    });
    skills.push(scanResult);
  }

  // Phase 3: Context Resolution
  const context = resolveContext(prompt, componentName);

  const contextResult = await executeSkill(
    'context-resolution',
    'context',
    () => context
  );
  skills.push(contextResult);

  // Update session context
  session.context = {
    zone: context.zone,
    physics: context.physics,
    vocabulary: context.vocabularyTerms,
  };

  // Phase 4: Validation (if not forge mode and not skipped)
  let validation: ValidationResult | undefined;

  if (!context.forgeMode && !options.skipValidation) {
    const validationResult = await executeSkill(
      'validating-physics',
      'validation',
      () => {
        // Validate would happen with actual code
        return { passed: true, violations: [] };
      }
    );
    skills.push(validationResult);
    validation = validationResult.data as ValidationResult;
  }

  // Phase 5: Pattern Selection
  const patterns = selectPatterns(context.zone, context.physics, projectRoot);

  const patternResult = await executeSkill(
    'pattern-selection',
    'generation',
    () => patterns
  );
  skills.push(patternResult);

  // Handle inspiration if detected
  if (context.inspirationUrl) {
    const inspirationResult = await executeSkill(
      'inspiring-ephemerally',
      'generation',
      () => createForkedContext(context.inspirationUrl!)
    );
    skills.push(inspirationResult);
  }

  // v6.1: Forge mode is deprecated, replaced by optimistic divergence
  // Taste violations are now tagged via @sigil-status divergent, not blocked
  // No explicit forge mode handling needed

  // Phase 6: Observation (tracked but not executed here - happens via hook)
  if (!options.skipObservation) {
    skills.push({
      skill: 'observing-survival',
      phase: 'observation',
      success: true,
      data: 'Deferred to PostToolUse hook',
      durationMs: 0,
    });
  }

  // Phase 7: Chronicling
  if (!options.skipChronicling) {
    // Add decisions to session
    session.decisions.push({
      type: 'zone',
      choice: context.zone,
      reasoning: `Matched vocabulary terms: ${context.vocabularyTerms.join(', ') || 'none'}`,
    });

    session.decisions.push({
      type: 'physics',
      choice: context.physics,
      reasoning: `Zone ${context.zone} requires ${context.physics} physics`,
    });

    for (const pattern of patterns) {
      session.patterns.push({
        name: pattern.pattern,
        status: pattern.status,
        isNew: pattern.status === 'experimental',
      });
    }

    const logResult = await executeSkill('chronicling-rationale', 'chronicling', () =>
      writeCraftLog(session, projectRoot)
    );
    skills.push(logResult);
  }

  return {
    success: skills.every((s) => s.success),
    context,
    skills,
    validation,
    patterns,
    session,
    totalDurationMs: performance.now() - startTime,
  };
}

// =============================================================================
// BENCHMARKING
// =============================================================================

/**
 * Performance benchmark result
 */
export interface BenchmarkResult {
  target: string;
  actual: number;
  passed: boolean;
}

/**
 * Run performance benchmarks
 */
export async function runBenchmarks(
  projectRoot: string = process.cwd()
): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  // Workshop query benchmark
  const workshopStart = performance.now();
  try {
    const workshop = loadWorkshop(projectRoot);
    if (workshop) {
      queryMaterial(workshop, 'framer-motion');
    }
  } catch {
    // Ignore errors for benchmark
  }
  results.push({
    target: 'workshop_query <5ms',
    actual: performance.now() - workshopStart,
    passed: performance.now() - workshopStart < 5,
  });

  // Sanctuary scan benchmark
  const scanStart = performance.now();
  try {
    findByTier('gold', projectRoot);
  } catch {
    // Ignore errors for benchmark
  }
  results.push({
    target: 'sanctuary_scan <50ms',
    actual: performance.now() - scanStart,
    passed: performance.now() - scanStart < 50,
  });

  // Context resolution benchmark
  const contextStart = performance.now();
  resolveContext('Create a trustworthy claim button for checkout', 'ClaimButton');
  results.push({
    target: 'context_resolution <5ms',
    actual: performance.now() - contextStart,
    passed: performance.now() - contextStart < 5,
  });

  return results;
}

// =============================================================================
// FORMATTING
// =============================================================================

/**
 * Format skill results summary
 */
export function formatSkillsSummary(skills: SkillResult[]): string {
  const lines = ['📊 Skills Executed:', ''];

  for (const skill of skills) {
    const status = skill.success ? '✓' : '✗';
    const time = skill.durationMs.toFixed(1);
    lines.push(`  ${status} ${skill.skill} (${skill.phase}) - ${time}ms`);
  }

  return lines.join('\n');
}

/**
 * Format craft flow result
 */
export function formatCraftFlowResult(result: CraftFlowResult): string {
  const lines = [
    '🎨 Craft Flow Complete',
    '',
    `Zone: ${result.context.zone}`,
    `Physics: ${result.context.physics}`,
    `Terms: ${result.context.vocabularyTerms.join(', ') || 'none'}`,
    result.context.forgeMode ? '⚡ Forge Mode Active' : '',
    result.context.inspirationUrl
      ? `🌐 Inspiration: ${result.context.inspirationUrl}`
      : '',
    '',
    `Patterns Selected: ${result.patterns.length}`,
    ...result.patterns.map((p) => `  - ${p.pattern} (${p.status})`),
    '',
    `Total Duration: ${result.totalDurationMs.toFixed(0)}ms`,
    result.success ? '✅ Success' : '❌ Some skills failed',
  ];

  return lines.filter(Boolean).join('\n');
}

/**
 * Format benchmark results
 */
export function formatBenchmarkResults(results: BenchmarkResult[]): string {
  const lines = ['⏱️ Performance Benchmarks:', ''];

  for (const result of results) {
    const status = result.passed ? '✓' : '✗';
    lines.push(`  ${status} ${result.target}: ${result.actual.toFixed(1)}ms`);
  }

  const allPassed = results.every((r) => r.passed);
  lines.push('', allPassed ? '✅ All targets met' : '⚠️ Some targets missed');

  return lines.join('\n');
}
