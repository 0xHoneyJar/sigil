/**
 * Sigil v7.6 - Linter Gate
 *
 * Quality gate that must pass before promotion.
 * Combines ESLint, TypeScript, and Sigil-specific checks.
 *
 * "Usage ≠ Quality. Survival is necessary, cleanliness is sufficient."
 *
 * @sigil-tier gold
 * @sigil-zone machinery
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync, spawnSync } from 'child_process';

// ============================================================================
// Types
// ============================================================================

export interface LinterGateConfig {
  eslint: {
    maxWarnings: number;
    configPath?: string;
  };
  typescript: {
    strict: boolean;
    noAny: boolean;
    configPath?: string;
  };
  sigil: {
    noConsoleLogs: boolean;
    hasDocstring: boolean;
    noHardcodedColors: boolean;
    noHardcodedSpacing: boolean;
  };
}

export interface CheckResult {
  passed: boolean;
  checkName: string;
  details: string[];
  errors: string[];
  warnings: string[];
}

export interface LinterGateResult {
  canPromote: boolean;
  componentPath: string;
  timestamp: string;
  checks: CheckResult[];
  summary: {
    passed: number;
    failed: number;
    totalErrors: number;
    totalWarnings: number;
  };
}

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_CONFIG: LinterGateConfig = {
  eslint: {
    maxWarnings: 0,
  },
  typescript: {
    strict: true,
    noAny: true,
  },
  sigil: {
    noConsoleLogs: true,
    hasDocstring: true,
    noHardcodedColors: true,
    noHardcodedSpacing: true,
  },
};

// ============================================================================
// Quick Check
// ============================================================================

/**
 * Quick boolean check if a component can be promoted.
 * Use this for fast filtering before running full gate.
 *
 * @param componentPath - Path to the component file
 * @param config - Optional configuration override
 * @returns true if component passes all gates
 *
 * @example
 * ```ts
 * if (canPromote('/path/to/Button.tsx')) {
 *   // Eligible for promotion
 * }
 * ```
 */
export function canPromote(
  componentPath: string,
  config: Partial<LinterGateConfig> = {}
): boolean {
  const result = runLinterGate(componentPath, config);
  return result.canPromote;
}

// ============================================================================
// Full Gate Check
// ============================================================================

/**
 * Run the full linter gate with detailed results.
 *
 * @param componentPath - Path to the component file
 * @param config - Optional configuration override
 * @returns Detailed gate results
 *
 * @example
 * ```ts
 * const result = runLinterGate('/path/to/Button.tsx');
 * if (!result.canPromote) {
 *   console.log(result.checks.filter(c => !c.passed));
 * }
 * ```
 */
export function runLinterGate(
  componentPath: string,
  config: Partial<LinterGateConfig> = {}
): LinterGateResult {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const checks: CheckResult[] = [];

  // Run all checks
  checks.push(runEslintCheck(componentPath, mergedConfig.eslint));
  checks.push(runTypescriptCheck(componentPath, mergedConfig.typescript));
  checks.push(runSigilChecks(componentPath, mergedConfig.sigil));

  // Calculate summary
  const passed = checks.filter((c) => c.passed).length;
  const failed = checks.filter((c) => !c.passed).length;
  const totalErrors = checks.reduce((sum, c) => sum + c.errors.length, 0);
  const totalWarnings = checks.reduce((sum, c) => sum + c.warnings.length, 0);

  return {
    canPromote: failed === 0,
    componentPath,
    timestamp: new Date().toISOString(),
    checks,
    summary: {
      passed,
      failed,
      totalErrors,
      totalWarnings,
    },
  };
}

// ============================================================================
// Individual Checks
// ============================================================================

/**
 * Run ESLint check on a component.
 *
 * @param componentPath - Path to the component file
 * @param config - ESLint configuration
 * @returns Check result
 */
export function runEslintCheck(
  componentPath: string,
  config: LinterGateConfig['eslint']
): CheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const details: string[] = [];

  if (!fs.existsSync(componentPath)) {
    return {
      passed: false,
      checkName: 'eslint',
      details: [],
      errors: [`File not found: ${componentPath}`],
      warnings: [],
    };
  }

  try {
    // Build eslint command
    const eslintArgs = [
      'npx',
      'eslint',
      componentPath,
      '--format',
      'json',
      '--max-warnings',
      config.maxWarnings.toString(),
    ];

    if (config.configPath) {
      eslintArgs.push('--config', config.configPath);
    }

    const result = spawnSync(eslintArgs[0], eslintArgs.slice(1), {
      encoding: 'utf-8',
      cwd: path.dirname(componentPath),
    });

    if (result.stdout) {
      try {
        const output = JSON.parse(result.stdout);
        if (Array.isArray(output) && output.length > 0) {
          const fileResult = output[0];

          for (const msg of fileResult.messages || []) {
            const location = `line ${msg.line}:${msg.column}`;
            const message = `[${location}] ${msg.message} (${msg.ruleId})`;

            if (msg.severity === 2) {
              errors.push(message);
            } else {
              warnings.push(message);
            }
          }

          details.push(`Errors: ${fileResult.errorCount}, Warnings: ${fileResult.warningCount}`);
        }
      } catch {
        // JSON parse failed, treat as passed if exit code is 0
      }
    }

    // ESLint returns 0 for success, 1 for lint errors
    const passed = result.status === 0 && errors.length === 0;

    return {
      passed,
      checkName: 'eslint',
      details,
      errors,
      warnings,
    };
  } catch (error) {
    return {
      passed: false,
      checkName: 'eslint',
      details: [],
      errors: [`ESLint execution failed: ${error}`],
      warnings: [],
    };
  }
}

/**
 * Run TypeScript strict check on a component.
 *
 * @param componentPath - Path to the component file
 * @param config - TypeScript configuration
 * @returns Check result
 */
export function runTypescriptCheck(
  componentPath: string,
  config: LinterGateConfig['typescript']
): CheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const details: string[] = [];

  if (!fs.existsSync(componentPath)) {
    return {
      passed: false,
      checkName: 'typescript',
      details: [],
      errors: [`File not found: ${componentPath}`],
      warnings: [],
    };
  }

  try {
    // Build tsc command for single file check
    const tscArgs = ['npx', 'tsc', '--noEmit', componentPath];

    if (config.strict) {
      tscArgs.push('--strict');
    }

    if (config.noAny) {
      tscArgs.push('--noImplicitAny');
    }

    const result = spawnSync(tscArgs[0], tscArgs.slice(1), {
      encoding: 'utf-8',
      cwd: path.dirname(componentPath),
    });

    if (result.stdout) {
      const lines = result.stdout.split('\n').filter(Boolean);
      for (const line of lines) {
        if (line.includes('error TS')) {
          errors.push(line.trim());
        }
      }
    }

    if (result.stderr) {
      const lines = result.stderr.split('\n').filter(Boolean);
      for (const line of lines) {
        if (line.includes('error TS')) {
          errors.push(line.trim());
        }
      }
    }

    details.push(`Strict mode: ${config.strict}, No implicit any: ${config.noAny}`);

    return {
      passed: errors.length === 0,
      checkName: 'typescript',
      details,
      errors,
      warnings,
    };
  } catch (error) {
    return {
      passed: false,
      checkName: 'typescript',
      details: [],
      errors: [`TypeScript check failed: ${error}`],
      warnings: [],
    };
  }
}

/**
 * Run Sigil-specific checks on a component.
 *
 * @param componentPath - Path to the component file
 * @param config - Sigil check configuration
 * @returns Check result
 */
export function runSigilChecks(
  componentPath: string,
  config: LinterGateConfig['sigil']
): CheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const details: string[] = [];

  if (!fs.existsSync(componentPath)) {
    return {
      passed: false,
      checkName: 'sigil',
      details: [],
      errors: [`File not found: ${componentPath}`],
      warnings: [],
    };
  }

  try {
    const content = fs.readFileSync(componentPath, 'utf-8');
    const lines = content.split('\n');

    // Check: No console.log statements
    if (config.noConsoleLogs) {
      lines.forEach((line, index) => {
        if (line.includes('console.log') || line.includes('console.error') || line.includes('console.warn')) {
          // Skip if in a comment
          const trimmed = line.trim();
          if (!trimmed.startsWith('//') && !trimmed.startsWith('*')) {
            errors.push(`[line ${index + 1}] console statement found - remove before promotion`);
          }
        }
      });
      details.push('Console log check: enabled');
    }

    // Check: Has docstring
    if (config.hasDocstring) {
      const hasJsDoc = content.includes('/**') && content.includes('*/');
      const hasSigilTier = content.includes('@sigil-tier');

      if (!hasJsDoc) {
        errors.push('Missing JSDoc documentation - add /** ... */ block');
      }
      if (!hasSigilTier) {
        warnings.push('Missing @sigil-tier annotation in JSDoc');
      }
      details.push('Docstring check: enabled');
    }

    // Check: No hardcoded colors (should use colors utility)
    if (config.noHardcodedColors) {
      const colorPatterns = [
        /#[0-9a-fA-F]{3,8}\b/g,  // Hex colors
        /rgb\s*\(/gi,            // RGB
        /rgba\s*\(/gi,           // RGBA
        /hsl\s*\(/gi,            // HSL
        /hsla\s*\(/gi,           // HSLA
      ];

      lines.forEach((line, index) => {
        // Skip comments and imports
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('import')) {
          return;
        }

        for (const pattern of colorPatterns) {
          if (pattern.test(line)) {
            warnings.push(`[line ${index + 1}] Hardcoded color found - consider using colors utility`);
            break;
          }
        }
      });
      details.push('Hardcoded color check: enabled');
    }

    // Check: No hardcoded spacing (should use spacing utility)
    if (config.noHardcodedSpacing) {
      const spacingPattern = /(?:margin|padding|gap|top|right|bottom|left):\s*\d+px/gi;

      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) {
          return;
        }

        if (spacingPattern.test(line)) {
          warnings.push(`[line ${index + 1}] Hardcoded spacing found - consider using spacing utility`);
        }
      });
      details.push('Hardcoded spacing check: enabled');
    }

    return {
      passed: errors.length === 0,
      checkName: 'sigil',
      details,
      errors,
      warnings,
    };
  } catch (error) {
    return {
      passed: false,
      checkName: 'sigil',
      details: [],
      errors: [`Sigil check failed: ${error}`],
      warnings: [],
    };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format linter gate results as a readable report.
 *
 * @param result - Linter gate result
 * @returns Formatted string report
 */
export function formatReport(result: LinterGateResult): string {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('                    SIGIL LINTER GATE REPORT');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('');
  lines.push(`Component: ${result.componentPath}`);
  lines.push(`Timestamp: ${result.timestamp}`);
  lines.push(`Status: ${result.canPromote ? '✅ PASSED' : '❌ FAILED'}`);
  lines.push('');
  lines.push('───────────────────────────────────────────────────────────────');
  lines.push('                          SUMMARY');
  lines.push('───────────────────────────────────────────────────────────────');
  lines.push(`Checks Passed: ${result.summary.passed}/${result.summary.passed + result.summary.failed}`);
  lines.push(`Total Errors: ${result.summary.totalErrors}`);
  lines.push(`Total Warnings: ${result.summary.totalWarnings}`);
  lines.push('');

  for (const check of result.checks) {
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push(`CHECK: ${check.checkName.toUpperCase()} - ${check.passed ? '✅ PASSED' : '❌ FAILED'}`);
    lines.push('───────────────────────────────────────────────────────────────');

    if (check.details.length > 0) {
      lines.push('Details:');
      for (const detail of check.details) {
        lines.push(`  • ${detail}`);
      }
    }

    if (check.errors.length > 0) {
      lines.push('Errors:');
      for (const error of check.errors) {
        lines.push(`  ❌ ${error}`);
      }
    }

    if (check.warnings.length > 0) {
      lines.push('Warnings:');
      for (const warning of check.warnings) {
        lines.push(`  ⚠️  ${warning}`);
      }
    }

    lines.push('');
  }

  lines.push('═══════════════════════════════════════════════════════════════');

  return lines.join('\n');
}

/**
 * Load custom linter gate configuration from .sigilrc or similar.
 *
 * @param projectRoot - Project root directory
 * @returns Merged configuration
 */
export function loadConfig(projectRoot: string = process.cwd()): LinterGateConfig {
  const configPath = path.join(projectRoot, '.sigilrc.yaml');

  // For now, return default config
  // TODO: Parse YAML config if it exists
  if (fs.existsSync(configPath)) {
    // Would parse and merge with defaults
  }

  return DEFAULT_CONFIG;
}
