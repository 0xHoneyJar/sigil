/**
 * @sigil-tier gold
 * Sigil v5.0 - Polish Command Handler
 *
 * Implements /polish command for JIT standardization.
 * Never auto-fixes on save. Let humans debug.
 *
 * @module process/polish-command
 */

import {
  scanFiles,
  scanStagedFiles,
  formatViolations,
  formatSummary,
  type ScanResult,
} from './violation-scanner';

import {
  generateDiffs,
  formatDiffs,
  formatDiffsWithColor,
  applyDiffs,
  type DiffResult,
} from './diff-generator';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Options for the polish command.
 */
export interface PolishOptions {
  /** Show diff without applying (default: true) */
  diff?: boolean;
  /** Check only, exit non-zero if violations (for CI/pre-commit) */
  check?: boolean;
  /** Apply fixes after confirmation */
  apply?: boolean;
  /** Target specific files (glob pattern) */
  files?: string[];
  /** Check only staged files */
  staged?: boolean;
  /** Minimum severity to report */
  severity?: 'error' | 'warning' | 'info';
  /** Use colors in output */
  color?: boolean;
  /** Base path for sigil-mark */
  basePath?: string;
}

/**
 * Result of running the polish command.
 */
export interface PolishResult {
  /** Scan result with violations */
  scan: ScanResult;
  /** Diff result with fixes */
  diffs: DiffResult;
  /** Output text */
  output: string;
  /** Exit code (0 = success, 1 = violations found, 2 = error) */
  exitCode: number;
  /** Files that were modified (if --apply) */
  modifiedFiles: string[];
}

// =============================================================================
// COMMAND IMPLEMENTATION
// =============================================================================

/**
 * Run the polish command.
 *
 * @param options - Command options
 * @returns Polish result
 *
 * @example Default (show diff)
 * ```ts
 * const result = await polish({ files: ['src/**\/*.tsx'] });
 * console.log(result.output);
 * ```
 *
 * @example Check mode (CI/pre-commit)
 * ```ts
 * const result = await polish({ check: true, staged: true });
 * process.exit(result.exitCode);
 * ```
 *
 * @example Apply fixes
 * ```ts
 * const result = await polish({ apply: true, files: ['src/**\/*.tsx'] });
 * console.log(`Modified ${result.modifiedFiles.length} files`);
 * ```
 */
export async function polish(options: PolishOptions = {}): Promise<PolishResult> {
  const {
    diff = true,
    check = false,
    apply = false,
    files = ['src/**/*.tsx', 'src/**/*.ts'],
    staged = false,
    severity = 'warning',
    color = true,
    basePath,
  } = options;

  const outputLines: string[] = [];
  let modifiedFiles: string[] = [];

  // Step 1: Scan for violations
  outputLines.push('Scanning for violations...\n');

  const scan = staged ? scanStagedFiles(basePath) : scanFiles(files, basePath);

  // Filter by severity
  const severityLevels = { error: 0, warning: 1, info: 2 };
  const minSeverity = severityLevels[severity];
  const filteredViolations = scan.violations.filter(
    (v) => severityLevels[v.severity] <= minSeverity
  );
  scan.violations = filteredViolations;
  scan.counts = {
    error: filteredViolations.filter((v) => v.severity === 'error').length,
    warning: filteredViolations.filter((v) => v.severity === 'warning').length,
    info: filteredViolations.filter((v) => v.severity === 'info').length,
  };
  scan.passed = scan.counts.error === 0;

  // Step 2: Report violations
  if (scan.violations.length === 0) {
    outputLines.push('No violations found. Code is clean!\n');
    return {
      scan,
      diffs: { diffs: [], totalChanges: 0, summary: 'No changes needed' },
      output: outputLines.join('\n'),
      exitCode: 0,
      modifiedFiles: [],
    };
  }

  outputLines.push(formatViolations(scan.violations));
  outputLines.push(formatSummary(scan));

  // Step 3: Generate diffs
  const diffs = generateDiffs(scan.violations);

  if (diffs.totalChanges > 0 && (diff || apply)) {
    outputLines.push('\n--- SUGGESTED FIXES ---\n');
    if (color) {
      outputLines.push(formatDiffsWithColor(diffs));
    } else {
      outputLines.push(formatDiffs(diffs));
    }
  }

  // Step 4: Apply if requested
  if (apply && diffs.totalChanges > 0) {
    outputLines.push('\nApplying fixes...');
    modifiedFiles = applyDiffs(diffs);
    outputLines.push(`Modified ${modifiedFiles.length} file(s):`);
    for (const file of modifiedFiles) {
      outputLines.push(`  - ${file}`);
    }
  } else if (!check && diffs.totalChanges > 0) {
    outputLines.push('\nRun with --apply to apply these fixes.');
  }

  // Determine exit code
  let exitCode = 0;
  if (check && !scan.passed) {
    exitCode = 1; // Violations found in check mode
    outputLines.push('\nCheck FAILED. Fix errors before committing.');
  } else if (!scan.passed) {
    outputLines.push('\nViolations found. Review and fix as needed.');
  }

  return {
    scan,
    diffs,
    output: outputLines.join('\n'),
    exitCode,
    modifiedFiles,
  };
}

/**
 * Run polish in check mode (for pre-commit/CI).
 *
 * @param staged - Check only staged files
 * @param basePath - Base path for sigil-mark
 * @returns Polish result
 */
export async function polishCheck(staged = false, basePath?: string): Promise<PolishResult> {
  return polish({
    check: true,
    staged,
    diff: false,
    basePath,
  });
}

/**
 * Run polish and apply fixes.
 *
 * @param files - Files to polish
 * @param basePath - Base path for sigil-mark
 * @returns Polish result
 */
export async function polishApply(
  files: string[] = ['src/**/*.tsx', 'src/**/*.ts'],
  basePath?: string
): Promise<PolishResult> {
  return polish({
    apply: true,
    files,
    basePath,
  });
}

// =============================================================================
// CLI ENTRY POINT
// =============================================================================

/**
 * Parse CLI arguments and run polish.
 *
 * @param args - CLI arguments
 * @returns Exit code
 *
 * @example
 * ```bash
 * # Show diff (default)
 * npx sigil polish
 *
 * # Check mode (CI/pre-commit)
 * npx sigil polish --check
 *
 * # Check staged files
 * npx sigil polish --check --staged
 *
 * # Apply fixes
 * npx sigil polish --apply
 *
 * # Specific files
 * npx sigil polish --files 'src/components/**\/*.tsx'
 * ```
 */
export async function runPolishCLI(args: string[]): Promise<number> {
  const options: PolishOptions = {
    color: true,
  };

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--diff':
        options.diff = true;
        break;
      case '--check':
        options.check = true;
        options.diff = false;
        break;
      case '--apply':
        options.apply = true;
        break;
      case '--staged':
        options.staged = true;
        break;
      case '--no-color':
        options.color = false;
        break;
      case '--files':
        if (args[i + 1]) {
          options.files = [args[++i]];
        }
        break;
      case '--severity':
        if (args[i + 1]) {
          const sev = args[++i];
          if (sev === 'error' || sev === 'warning' || sev === 'info') {
            options.severity = sev;
          }
        }
        break;
      case '--help':
      case '-h':
        console.log(`
Sigil Polish - JIT Standardization

Usage: sigil polish [options]

Options:
  --diff          Show diff without applying (default)
  --check         Check only, exit non-zero if violations
  --apply         Apply fixes after showing diff
  --staged        Check only staged files (for pre-commit)
  --files <glob>  Target specific files
  --severity <level>  Minimum severity (error|warning|info)
  --no-color      Disable colored output
  --help, -h      Show this help message

Examples:
  sigil polish                    # Show violations with diff
  sigil polish --check            # CI mode
  sigil polish --check --staged   # Pre-commit mode
  sigil polish --apply            # Apply fixes
`);
        return 0;
    }
  }

  const result = await polish(options);
  console.log(result.output);
  return result.exitCode;
}
