// AGENT-ONLY: Do not import in browser code
// This module uses Node.js fs and will crash in browser environments.

/**
 * Garden Command Handler
 *
 * @sigil-tier gold
 * @sigil-zone machinery
 * @server-only
 *
 * System health check that runs all audits:
 * - Auditing Cohesion (visual drift)
 * - Simulating Interaction (timing verification)
 * - Status Propagation (tier consistency)
 * - Violation Scanning (fidelity ceiling)
 * - v6.1: Survival Pattern Scanning (@sigil-pattern tags)
 *
 * Usage:
 * - /garden - Run all audits
 * - /garden --drift - Focus on visual drift only
 * - /garden --survival - Focus on survival patterns only (v6.1)
 *
 * v6.1: Added survival pattern scanning for merge-driven gardening.
 *
 * @module process/garden-command
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { scanFiles, formatViolations, formatSummary, type ScanResult } from './violation-scanner';
import { scanStatusPropagation, formatPropagationSummary, type StatusAnalysis } from './status-propagation';
import { findAllSigilComponents, parsePragmas, type ComponentMatch } from './component-scanner';

// =============================================================================
// TYPES
// =============================================================================

/** Severity level for issues */
export type IssueSeverity = 'error' | 'warning' | 'info';

/** A single issue in the garden report */
export interface GardenIssue {
  category: 'cohesion' | 'timing' | 'propagation' | 'fidelity';
  severity: IssueSeverity;
  file: string;
  line?: number;
  message: string;
  suggestion?: string;
}

/** Options for the garden command */
export interface GardenOptions {
  /** Focus on visual drift only */
  drift?: boolean;
  /** Include timing checks */
  timing?: boolean;
  /** Check status propagation */
  propagation?: boolean;
  /** v6.1: Focus on survival patterns only */
  survival?: boolean;
  /** Base path for scanning */
  basePath?: string;
}

/** Result of the garden command */
export interface GardenResult {
  /** Total components scanned */
  componentCount: number;
  /** Issues by severity */
  issues: GardenIssue[];
  /** Count by severity */
  errorCount: number;
  warningCount: number;
  infoCount: number;
  /** Health score (0-100) */
  healthScore: number;
  /** Scan timestamp */
  timestamp: Date;
  /** v6.1: Survival pattern results */
  survivalResult?: SurvivalScanResult;
}

// =============================================================================
// v6.1: SURVIVAL PATTERN TYPES
// =============================================================================

/** Pattern occurrence from scanning */
interface PatternOccurrence {
  pattern: string;
  file: string;
  line: number;
}

/** Survival entry in index */
interface SurvivalEntry {
  status: 'experimental' | 'surviving' | 'canonical' | 'canonical-candidate' | 'rejected';
  first_seen: string;
  occurrences: number;
  files: string[];
  last_updated: string;
}

/** Survival index structure */
interface SurvivalIndex {
  era: string;
  era_started: string;
  last_scan: string;
  patterns: {
    survived: Record<string, SurvivalEntry>;
    rejected: string[];
    canonical: string[];
  };
}

/** Result of survival pattern scanning */
export interface SurvivalScanResult {
  scanned: number;
  patternsFound: number;
  patternsUpdated: number;
  promotions: Array<{ pattern: string; from: string; to: string }>;
  newPatterns: string[];
}

// =============================================================================
// GARDEN COMMAND
// =============================================================================

/**
 * Run full garden health check
 *
 * @example
 * ```typescript
 * import { garden } from 'sigil-mark/process';
 *
 * const result = await garden();
 * console.log(`Health: ${result.healthScore}%`);
 * console.log(`Issues: ${result.issues.length}`);
 * ```
 */
export async function garden(options: GardenOptions = {}): Promise<GardenResult> {
  const basePath = options.basePath || process.cwd();
  const issues: GardenIssue[] = [];

  // 1. Find all Sigil components
  const components = findAllSigilComponents(basePath);
  const componentCount = components.length;

  // 2. Run fidelity violation scan
  const filePaths = components.map(c => c.path);
  const scanResults = scanFiles(filePaths, basePath);

  for (const result of scanResults) {
    for (const violation of result.violations) {
      issues.push({
        category: 'fidelity',
        severity: violation.severity,
        file: result.file,
        line: violation.line,
        message: violation.message,
        suggestion: violation.suggestion,
      });
    }
  }

  // 3. Run status propagation check (unless drift-only)
  if (!options.drift && options.propagation !== false) {
    const propagationIssues = scanStatusPropagation(basePath);
    for (const analysis of propagationIssues) {
      if (analysis.downgrade) {
        for (const warning of analysis.warnings) {
          issues.push({
            category: 'propagation',
            severity: 'warning',
            file: analysis.file,
            message: warning,
            suggestion: `Consider upgrading dependencies or downgrading declared tier`,
          });
        }
      }
    }
  }

  // 4. Run timing analysis (static patterns only)
  if (!options.drift && options.timing !== false) {
    for (const component of components) {
      const timingIssues = analyzeTimingPatterns(component);
      issues.push(...timingIssues);
    }
  }

  // Calculate counts
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const infoCount = issues.filter(i => i.severity === 'info').length;

  // Calculate health score
  // 100 - (errors * 10 + warnings * 2 + info * 0.5), min 0
  const healthScore = Math.max(0, Math.round(
    100 - (errorCount * 10 + warningCount * 2 + infoCount * 0.5)
  ));

  return {
    componentCount,
    issues,
    errorCount,
    warningCount,
    infoCount,
    healthScore,
    timestamp: new Date(),
  };
}

/**
 * Run drift-focused garden check (visual only)
 *
 * @example
 * ```typescript
 * import { gardenDrift } from 'sigil-mark/process';
 *
 * const result = await gardenDrift();
 * console.log(formatGardenResult(result));
 * ```
 */
export function gardenDrift(basePath?: string): Promise<GardenResult> {
  return garden({
    drift: true,
    timing: false,
    propagation: false,
    basePath,
  });
}

// =============================================================================
// TIMING PATTERN ANALYSIS
// =============================================================================

/**
 * Analyze component for timing anti-patterns
 * Uses static analysis to detect potential timing issues
 */
function analyzeTimingPatterns(component: ComponentMatch): GardenIssue[] {
  const issues: GardenIssue[] = [];
  const content = component.context || '';

  // Pattern 1: async without pending state
  if (content.includes('async') && content.includes('await')) {
    if (!content.includes('isPending') && !content.includes('isLoading') && !content.includes('setLoading')) {
      issues.push({
        category: 'timing',
        severity: 'warning',
        file: component.path,
        message: 'Async handler without visible pending state',
        suggestion: 'Add isPending or isLoading state for immediate feedback',
      });
    }
  }

  // Pattern 2: onClick with await but no immediate state
  const onClickPattern = /onClick\s*=\s*\{?\s*async[^}]+await/;
  if (onClickPattern.test(content)) {
    if (!content.includes('disabled') && !content.includes('isPending')) {
      issues.push({
        category: 'timing',
        severity: 'warning',
        file: component.path,
        message: 'Click handler has await without disable/pending pattern',
        suggestion: 'Add disabled={isPending} to prevent double-clicks and show feedback',
      });
    }
  }

  // Pattern 3: Server action without optimistic update
  if (content.includes('useTransition') || content.includes('startTransition')) {
    // useTransition is good, but check if there's optimistic state
    if (!content.includes('optimistic') && !content.includes('Optimistic')) {
      issues.push({
        category: 'timing',
        severity: 'info',
        file: component.path,
        message: 'Using transitions without optimistic updates',
        suggestion: 'Consider useOptimistic for immediate feedback on server actions',
      });
    }
  }

  return issues;
}

// =============================================================================
// FORMATTERS
// =============================================================================

/**
 * Format garden result as human-readable report
 */
export function formatGardenResult(result: GardenResult): string {
  const lines: string[] = [];

  lines.push('# Garden Health Report');
  lines.push('');
  lines.push(`**Scanned:** ${result.componentCount} components`);
  lines.push(`**Timestamp:** ${result.timestamp.toISOString()}`);
  lines.push('');
  lines.push(`## Health Score: ${result.healthScore}%`);
  lines.push('');

  if (result.issues.length === 0) {
    lines.push('All systems healthy. No issues detected.');
    return lines.join('\n');
  }

  lines.push(`## Summary`);
  lines.push('');
  lines.push(`- Errors: ${result.errorCount}`);
  lines.push(`- Warnings: ${result.warningCount}`);
  lines.push(`- Info: ${result.infoCount}`);
  lines.push('');

  // Group by category
  const byCategory = new Map<string, GardenIssue[]>();
  for (const issue of result.issues) {
    const existing = byCategory.get(issue.category) || [];
    existing.push(issue);
    byCategory.set(issue.category, existing);
  }

  for (const [category, issues] of byCategory) {
    lines.push(`## ${capitalize(category)} Issues`);
    lines.push('');

    // Sort by severity
    const sorted = [...issues].sort((a, b) => {
      const order = { error: 0, warning: 1, info: 2 };
      return order[a.severity] - order[b.severity];
    });

    for (const issue of sorted) {
      const location = issue.line ? `${issue.file}:${issue.line}` : issue.file;
      lines.push(`- [${issue.severity.toUpperCase()}] ${location}`);
      lines.push(`  ${issue.message}`);
      if (issue.suggestion) {
        lines.push(`  *Fix: ${issue.suggestion}*`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Format garden result as short summary
 */
export function formatGardenSummary(result: GardenResult): string {
  const status = result.healthScore >= 80 ? 'HEALTHY' :
                 result.healthScore >= 50 ? 'NEEDS ATTENTION' : 'CRITICAL';

  return `Garden: ${status} (${result.healthScore}%) - ${result.errorCount} errors, ${result.warningCount} warnings`;
}

// =============================================================================
// CLI
// =============================================================================

/**
 * Run garden command from CLI
 *
 * @example
 * ```bash
 * npx sigil garden
 * npx sigil garden --drift
 * ```
 */
export async function runGardenCLI(args: string[] = []): Promise<void> {
  const drift = args.includes('--drift');

  console.log(drift ? 'Running drift analysis...' : 'Running full garden check...');
  console.log('');

  const result = drift
    ? await gardenDrift()
    : await garden();

  console.log(formatGardenResult(result));

  // Exit with error code if errors found
  if (result.errorCount > 0) {
    process.exit(1);
  }
}

// =============================================================================
// HELPERS
// =============================================================================

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// =============================================================================
// v6.1: SURVIVAL PATTERN SCANNING
// =============================================================================

const SURVIVAL_PATH = 'grimoires/sigil/state/survival.json';
const SCAN_PATHS = ['src/', 'sigil-mark/'];
const SURVIVING_THRESHOLD = 3;
const CANONICAL_CANDIDATE_THRESHOLD = 5;

/**
 * Scan codebase for @sigil-pattern tags.
 * v6.1: Merge-driven gardening for <5 min latency.
 */
function scanSurvivalPatterns(projectRoot: string): PatternOccurrence[] {
  const occurrences: PatternOccurrence[] = [];

  for (const scanPath of SCAN_PATHS) {
    const fullPath = path.join(projectRoot, scanPath);
    if (!fs.existsSync(fullPath)) {
      continue;
    }

    try {
      // Use ripgrep for fast scanning
      const result = execSync(
        `rg -n "@sigil-pattern" "${fullPath}" --type ts --type tsx 2>/dev/null || true`,
        { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
      );

      for (const line of result.split('\n').filter(Boolean)) {
        const match = line.match(/^(.+?):(\d+):(.+)$/);
        if (!match) continue;

        const [, file, lineNum, content] = match;
        const patternMatch = content.match(/@sigil-pattern\s+([^\s*]+)/);
        if (patternMatch) {
          occurrences.push({
            pattern: patternMatch[1],
            file: path.relative(projectRoot, file),
            line: parseInt(lineNum, 10),
          });
        }
      }
    } catch {
      // Fallback to fs-based scanning
      scanPatternsFallback(fullPath, projectRoot, occurrences);
    }
  }

  return occurrences;
}

/**
 * Fallback pattern scanning using fs.
 */
function scanPatternsFallback(
  dir: string,
  projectRoot: string,
  occurrences: PatternOccurrence[]
): void {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        scanPatternsFallback(fullPath, projectRoot, occurrences);
      } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const lines = content.split('\n');

          for (let i = 0; i < lines.length; i++) {
            const patternMatch = lines[i].match(/@sigil-pattern\s+([^\s*]+)/);
            if (patternMatch) {
              occurrences.push({
                pattern: patternMatch[1],
                file: path.relative(projectRoot, fullPath),
                line: i + 1,
              });
            }
          }
        } catch {
          // Skip unreadable files
        }
      }
    }
  } catch {
    // Skip inaccessible directories
  }
}

/**
 * Load or create survival index.
 */
function loadSurvivalIndexFromDisk(projectRoot: string): SurvivalIndex {
  const survivalPath = path.join(projectRoot, SURVIVAL_PATH);

  if (fs.existsSync(survivalPath)) {
    try {
      const content = fs.readFileSync(survivalPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      // Return fresh index on parse error
    }
  }

  return {
    era: 'v1',
    era_started: new Date().toISOString().split('T')[0],
    last_scan: new Date().toISOString(),
    patterns: {
      survived: {},
      rejected: [],
      canonical: [],
    },
  };
}

/**
 * Save survival index.
 */
function saveSurvivalIndexToDisk(projectRoot: string, index: SurvivalIndex): void {
  const survivalPath = path.join(projectRoot, SURVIVAL_PATH);
  const dir = path.dirname(survivalPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(survivalPath, JSON.stringify(index, null, 2));
}

/**
 * Determine pattern status based on occurrences.
 * v6.1: 5+ → canonical-candidate (requires taste-key approval)
 */
function determinePatternStatus(occurrences: number): SurvivalEntry['status'] {
  if (occurrences >= CANONICAL_CANDIDATE_THRESHOLD) {
    return 'canonical-candidate';
  }
  if (occurrences >= SURVIVING_THRESHOLD) {
    return 'surviving';
  }
  return 'experimental';
}

/**
 * Run survival pattern scan and update index.
 * v6.1: Called by merge-driven gardening CI.
 */
export function runSurvivalScan(projectRoot: string, dryRun: boolean = false): SurvivalScanResult {
  const result: SurvivalScanResult = {
    scanned: 0,
    patternsFound: 0,
    patternsUpdated: 0,
    promotions: [],
    newPatterns: [],
  };

  // Scan for patterns
  const occurrences = scanSurvivalPatterns(projectRoot);
  result.scanned = occurrences.length;

  // Group by pattern
  const patternMap = new Map<string, PatternOccurrence[]>();
  for (const occ of occurrences) {
    const list = patternMap.get(occ.pattern) || [];
    list.push(occ);
    patternMap.set(occ.pattern, list);
  }
  result.patternsFound = patternMap.size;

  // Load current index
  const index = loadSurvivalIndexFromDisk(projectRoot);
  const now = new Date().toISOString();

  // Update each pattern
  for (const [pattern, occs] of patternMap) {
    const files = [...new Set(occs.map(o => o.file))];
    const existing = index.patterns.survived[pattern];

    if (existing) {
      const oldStatus = existing.status;
      const newStatus = determinePatternStatus(occs.length);

      if (newStatus !== oldStatus) {
        result.promotions.push({
          pattern,
          from: oldStatus,
          to: newStatus,
        });
      }

      existing.occurrences = occs.length;
      existing.files = files;
      existing.status = newStatus;
      existing.last_updated = now;
      result.patternsUpdated++;
    } else {
      index.patterns.survived[pattern] = {
        status: determinePatternStatus(occs.length),
        first_seen: now.split('T')[0],
        occurrences: occs.length,
        files,
        last_updated: now,
      };
      result.newPatterns.push(pattern);
      result.patternsUpdated++;
    }
  }

  // Update last scan timestamp
  index.last_scan = now;

  // Save unless dry run
  if (!dryRun) {
    saveSurvivalIndexToDisk(projectRoot, index);
  }

  return result;
}

/**
 * Format survival scan result.
 */
export function formatSurvivalResult(result: SurvivalScanResult): string {
  const lines: string[] = [];

  lines.push('## Survival Pattern Scan');
  lines.push('');
  lines.push(`- Patterns found: ${result.patternsFound}`);
  lines.push(`- Patterns updated: ${result.patternsUpdated}`);
  lines.push(`- New patterns: ${result.newPatterns.length}`);
  lines.push(`- Promotions: ${result.promotions.length}`);

  if (result.promotions.length > 0) {
    lines.push('');
    lines.push('### Promotions');
    for (const p of result.promotions) {
      lines.push(`- ${p.pattern}: ${p.from} → ${p.to}`);
    }
  }

  if (result.newPatterns.length > 0) {
    lines.push('');
    lines.push('### New Patterns');
    for (const p of result.newPatterns) {
      lines.push(`- ${p}`);
    }
  }

  return lines.join('\n');
}

// =============================================================================
// v6.1: CLI ENTRY POINT FOR MERGE-DRIVEN GARDENING
// =============================================================================

/**
 * Main CLI entry point for npx tsx invocation.
 * Used by GitHub Actions workflow.
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const survivalOnly = args.includes('--survival');
  const verbose = args.includes('--verbose') || args.includes('-v');
  const projectRoot = process.cwd();

  console.log('🌱 Sigil Gardener v6.1');
  console.log(`   Project: ${projectRoot}`);
  if (dryRun) console.log('   Mode: DRY RUN');
  console.log('');

  if (survivalOnly) {
    // Survival-only mode for merge-driven CI
    const result = runSurvivalScan(projectRoot, dryRun);
    console.log(formatSurvivalResult(result));
    console.log('');
    console.log('✅ Survival scan complete');
  } else {
    // Full garden check
    const result = await garden({ basePath: projectRoot });

    // Also run survival scan
    const survivalResult = runSurvivalScan(projectRoot, dryRun);
    result.survivalResult = survivalResult;

    console.log(formatGardenResult(result));

    if (survivalResult.patternsFound > 0) {
      console.log('');
      console.log(formatSurvivalResult(survivalResult));
    }

    if (result.errorCount > 0) {
      process.exit(1);
    }
  }
}

// Run if invoked directly
if (require.main === module) {
  main().catch(console.error);
}
