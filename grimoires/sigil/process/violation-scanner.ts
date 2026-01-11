/**
 * @sigil-tier gold
 * Sigil v5.0 - Violation Scanner
 *
 * Scans files for taste violations against fidelity and constitution.
 * Part of the JIT Polish workflow.
 *
 * @module process/violation-scanner
 */

import { readFileSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { execSync } from 'child_process';
import { parse } from 'yaml';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Severity level for violations.
 */
export type ViolationSeverity = 'error' | 'warning' | 'info';

/**
 * Type of violation.
 */
export type ViolationType = 'fidelity' | 'ergonomic' | 'constitution' | 'cohesion';

/**
 * A single violation found in a file.
 */
export interface Violation {
  /** File path relative to cwd */
  file: string;
  /** Line number (1-indexed) */
  line: number;
  /** Column number (1-indexed) */
  column: number;
  /** Violation type category */
  type: ViolationType;
  /** Specific rule violated */
  rule: string;
  /** Human-readable message */
  message: string;
  /** Severity level */
  severity: ViolationSeverity;
  /** Suggested fix (if available) */
  suggestedFix?: string;
  /** Original code snippet */
  originalCode?: string;
}

/**
 * Summary of scan results.
 */
export interface ScanResult {
  /** Files that were scanned */
  filesScanned: string[];
  /** All violations found */
  violations: Violation[];
  /** Count by severity */
  counts: {
    error: number;
    warning: number;
    info: number;
  };
  /** Whether scan passed (no errors) */
  passed: boolean;
}

/**
 * Fidelity configuration structure.
 */
interface FidelityConfig {
  fidelity_ceiling: {
    visual: {
      animation: { max_duration_ms: number; min_duration_ms: number; forbidden: string[] };
      gradients: { max_stops: number; forbidden: string[] };
      shadows: { max_layers: number; max_blur_px: number; forbidden: string[] };
      borders: { max_width_px: number; allowed_radii: number[] };
      typography: { max_weights: number; forbidden: string[] };
      colors: { require_tokens: boolean; forbidden: string[] };
    };
    ergonomic: {
      hitbox: { min_size_px: number; enforcement: string };
      focus_ring: { required: boolean; min_width_px: number; enforcement: string };
      keyboard_support: { required_handlers: string[]; enforcement: string };
    };
  };
}

// =============================================================================
// FIDELITY LOADING
// =============================================================================

let fidelityCache: FidelityConfig | null = null;

/**
 * Load fidelity configuration.
 */
function loadFidelity(basePath?: string): FidelityConfig {
  if (fidelityCache) {
    return fidelityCache;
  }

  const paths = [
    basePath ? join(basePath, 'kernel/fidelity.yaml') : null,
    join(process.cwd(), 'grimoires/sigil/constitution/fidelity.yaml'),
    join(__dirname, '../kernel/fidelity.yaml'),
  ].filter(Boolean) as string[];

  for (const path of paths) {
    try {
      if (existsSync(path)) {
        const content = readFileSync(path, 'utf-8');
        fidelityCache = parse(content) as FidelityConfig;
        return fidelityCache;
      }
    } catch {
      // Try next path
    }
  }

  // Return defaults
  return getDefaultFidelity();
}

/**
 * Get default fidelity config.
 */
function getDefaultFidelity(): FidelityConfig {
  return {
    fidelity_ceiling: {
      visual: {
        animation: {
          max_duration_ms: 200,
          min_duration_ms: 100,
          forbidden: ['spring-bounce', 'elastic-easing', 'overshoot'],
        },
        gradients: {
          max_stops: 2,
          forbidden: ['mesh-gradient', 'radial-gradient', 'conic-gradient'],
        },
        shadows: {
          max_layers: 1,
          max_blur_px: 8,
          forbidden: ['multi-layer-shadows', 'colored-shadows'],
        },
        borders: {
          max_width_px: 2,
          allowed_radii: [0, 4, 8, 9999],
        },
        typography: {
          max_weights: 3,
          forbidden: ['font-size-below-12px'],
        },
        colors: {
          require_tokens: true,
          forbidden: ['inline-hex-colors', 'rgb-without-variable'],
        },
      },
      ergonomic: {
        hitbox: { min_size_px: 44, enforcement: 'error' },
        focus_ring: { required: true, min_width_px: 2, enforcement: 'error' },
        keyboard_support: { required_handlers: ['onKeyDown'], enforcement: 'warning' },
      },
    },
  };
}

/**
 * Clear fidelity cache.
 */
export function clearFidelityCache(): void {
  fidelityCache = null;
}

// =============================================================================
// VIOLATION PATTERNS
// =============================================================================

interface ViolationPattern {
  type: ViolationType;
  rule: string;
  pattern: RegExp;
  severity: ViolationSeverity;
  message: string;
  getSuggestedFix?: (match: RegExpMatchArray) => string;
}

/**
 * Build violation patterns from fidelity config.
 */
function buildPatterns(fidelity: FidelityConfig): ViolationPattern[] {
  const patterns: ViolationPattern[] = [];
  const ceiling = fidelity.fidelity_ceiling;

  // Animation duration patterns
  // Look for duration: XXXms or transition: XXXms
  patterns.push({
    type: 'fidelity',
    rule: 'animation.duration',
    pattern: /(?:duration|transition):\s*['"]?(\d+)(?:ms)?['"]?/g,
    severity: 'warning',
    message: `Animation duration exceeds ${ceiling.visual.animation.max_duration_ms}ms ceiling`,
    getSuggestedFix: () => `duration: ${ceiling.visual.animation.max_duration_ms}`,
  });

  // Forbidden animation patterns
  for (const forbidden of ceiling.visual.animation.forbidden) {
    patterns.push({
      type: 'fidelity',
      rule: 'animation.forbidden',
      pattern: new RegExp(forbidden.replace(/-/g, '[-_]?'), 'gi'),
      severity: 'warning',
      message: `Forbidden animation pattern: ${forbidden}`,
    });
  }

  // Shadow patterns - multiple box-shadows
  patterns.push({
    type: 'fidelity',
    rule: 'shadows.layers',
    pattern: /box-shadow:\s*[^;]*,\s*[^;]*,/g,
    severity: 'warning',
    message: `Shadow exceeds ${ceiling.visual.shadows.max_layers} layer limit`,
  });

  // Inline hex colors (not in design tokens)
  patterns.push({
    type: 'fidelity',
    rule: 'colors.inline_hex',
    pattern: /#(?:[0-9a-fA-F]{3}){1,2}(?![0-9a-fA-F])/g,
    severity: 'warning',
    message: 'Use design tokens instead of inline hex colors',
  });

  // Hitbox too small
  patterns.push({
    type: 'ergonomic',
    rule: 'hitbox.min_size',
    pattern: /(?:width|height|size):\s*['"]?(\d+)(?:px)?['"]?/g,
    severity: 'error',
    message: `Interactive element smaller than ${ceiling.ergonomic.hitbox.min_size_px}px minimum`,
  });

  // Missing focus ring (outline: none without replacement)
  patterns.push({
    type: 'ergonomic',
    rule: 'focus_ring.required',
    pattern: /outline:\s*(?:none|0)/g,
    severity: 'error',
    message: 'Focus ring removed without accessible replacement',
  });

  // Font size too small
  patterns.push({
    type: 'fidelity',
    rule: 'typography.min_size',
    pattern: /font-size:\s*['"]?(\d+)(?:px)?['"]?/g,
    severity: 'warning',
    message: 'Font size below 12px minimum',
  });

  return patterns;
}

// =============================================================================
// SCANNING
// =============================================================================

/**
 * Scan a single file for violations.
 *
 * @param filePath - Path to file
 * @param basePath - Base path for sigil-mark
 * @returns Violations found in file
 */
export function scanFile(filePath: string, basePath?: string): Violation[] {
  const violations: Violation[] = [];
  const fidelity = loadFidelity(basePath);
  const patterns = buildPatterns(fidelity);

  let content: string;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch {
    return violations;
  }

  const lines = content.split('\n');
  const relPath = relative(process.cwd(), filePath);

  for (const pattern of patterns) {
    // Reset regex state
    pattern.pattern.lastIndex = 0;

    let match;
    while ((match = pattern.pattern.exec(content)) !== null) {
      // Calculate line and column
      const beforeMatch = content.slice(0, match.index);
      const linesBefore = beforeMatch.split('\n');
      const line = linesBefore.length;
      const column = linesBefore[linesBefore.length - 1].length + 1;

      // Check specific conditions
      let shouldReport = true;

      // For duration check, only report if exceeds max
      if (pattern.rule === 'animation.duration' && match[1]) {
        const duration = parseInt(match[1], 10);
        if (duration <= fidelity.fidelity_ceiling.visual.animation.max_duration_ms) {
          shouldReport = false;
        }
      }

      // For hitbox check, only report if below min for interactive elements
      if (pattern.rule === 'hitbox.min_size' && match[1]) {
        const size = parseInt(match[1], 10);
        const lineContent = lines[line - 1] || '';
        // Only check if this looks like an interactive element
        const isInteractive = /button|Button|click|Click|interactive/i.test(lineContent);
        if (size >= fidelity.fidelity_ceiling.ergonomic.hitbox.min_size_px || !isInteractive) {
          shouldReport = false;
        }
      }

      // For font size, only report if below 12
      if (pattern.rule === 'typography.min_size' && match[1]) {
        const size = parseInt(match[1], 10);
        if (size >= 12) {
          shouldReport = false;
        }
      }

      if (shouldReport) {
        violations.push({
          file: relPath,
          line,
          column,
          type: pattern.type,
          rule: pattern.rule,
          message: pattern.message,
          severity: pattern.severity,
          suggestedFix: pattern.getSuggestedFix?.(match),
          originalCode: match[0],
        });
      }
    }
  }

  return violations;
}

/**
 * Scan multiple files for violations.
 *
 * @param filePatterns - Glob patterns or file paths
 * @param basePath - Base path for sigil-mark
 * @returns Scan result with all violations
 */
export function scanFiles(filePatterns: string[], basePath?: string): ScanResult {
  const filesScanned: string[] = [];
  const violations: Violation[] = [];

  for (const pattern of filePatterns) {
    // Expand glob patterns using find
    let files: string[];
    try {
      if (pattern.includes('*')) {
        // Use find with -name for glob patterns
        const result = execSync(`find . -type f -name "${pattern.replace(/\*\*/g, '*')}" 2>/dev/null`, {
          encoding: 'utf-8',
          cwd: process.cwd(),
        });
        files = result.trim().split('\n').filter(Boolean);
      } else if (existsSync(pattern)) {
        files = [pattern];
      } else {
        files = [];
      }
    } catch {
      files = [];
    }

    for (const file of files) {
      if (!filesScanned.includes(file)) {
        filesScanned.push(file);
        const fileViolations = scanFile(file, basePath);
        violations.push(...fileViolations);
      }
    }
  }

  const counts = {
    error: violations.filter((v) => v.severity === 'error').length,
    warning: violations.filter((v) => v.severity === 'warning').length,
    info: violations.filter((v) => v.severity === 'info').length,
  };

  return {
    filesScanned,
    violations,
    counts,
    passed: counts.error === 0,
  };
}

/**
 * Scan staged files for violations (for pre-commit hook).
 *
 * @param basePath - Base path for sigil-mark
 * @returns Scan result for staged files
 */
export function scanStagedFiles(basePath?: string): ScanResult {
  let stagedFiles: string[];
  try {
    const result = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf-8',
      cwd: process.cwd(),
    });
    stagedFiles = result
      .trim()
      .split('\n')
      .filter((f) => f && (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.jsx')));
  } catch {
    stagedFiles = [];
  }

  return scanFiles(stagedFiles, basePath);
}

// =============================================================================
// FORMATTERS
// =============================================================================

/**
 * Format violations for terminal output.
 */
export function formatViolations(violations: Violation[]): string {
  if (violations.length === 0) {
    return 'No violations found.';
  }

  const lines: string[] = [];

  // Group by file
  const byFile = new Map<string, Violation[]>();
  for (const v of violations) {
    if (!byFile.has(v.file)) {
      byFile.set(v.file, []);
    }
    byFile.get(v.file)!.push(v);
  }

  for (const [file, fileViolations] of byFile) {
    lines.push(`\n${file}`);
    for (const v of fileViolations) {
      const severity = v.severity.toUpperCase().padEnd(7);
      lines.push(`  ${v.line}:${v.column}  ${severity} ${v.message}`);
      if (v.suggestedFix) {
        lines.push(`           Fix: ${v.suggestedFix}`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Format scan summary.
 */
export function formatSummary(result: ScanResult): string {
  const lines: string[] = [
    '',
    'SIGIL POLISH SUMMARY',
    '====================',
    `Files scanned: ${result.filesScanned.length}`,
    `Violations found: ${result.violations.length}`,
    `  Errors:   ${result.counts.error}`,
    `  Warnings: ${result.counts.warning}`,
    `  Info:     ${result.counts.info}`,
    '',
    result.passed ? 'PASSED' : 'FAILED - Fix errors before committing',
  ];

  return lines.join('\n');
}
