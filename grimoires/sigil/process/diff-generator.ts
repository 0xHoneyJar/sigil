/**
 * @sigil-tier gold
 * Sigil v5.0 - Diff Generator
 *
 * Generates unified diffs for violation fixes.
 * Part of the JIT Polish workflow.
 *
 * @module process/diff-generator
 */

import { readFileSync, writeFileSync } from 'fs';
import type { Violation } from './violation-scanner';

// =============================================================================
// TYPES
// =============================================================================

/**
 * A single hunk in a diff.
 */
export interface DiffHunk {
  /** Starting line in original file */
  oldStart: number;
  /** Number of lines in original */
  oldCount: number;
  /** Starting line in new file */
  newStart: number;
  /** Number of lines in new file */
  newCount: number;
  /** Lines in the hunk (prefixed with +, -, or space) */
  lines: string[];
}

/**
 * A diff for a single file.
 */
export interface FileDiff {
  /** File path */
  file: string;
  /** Hunks of changes */
  hunks: DiffHunk[];
  /** Violations this diff addresses */
  violations: Violation[];
}

/**
 * Complete diff result.
 */
export interface DiffResult {
  /** Diffs organized by file */
  diffs: FileDiff[];
  /** Total number of changes */
  totalChanges: number;
  /** Summary text */
  summary: string;
}

// =============================================================================
// FIX GENERATORS
// =============================================================================

interface FixGenerator {
  rule: string;
  canFix: (violation: Violation, lineContent: string) => boolean;
  generateFix: (violation: Violation, lineContent: string) => string;
}

const fixGenerators: FixGenerator[] = [
  // Animation duration fix
  {
    rule: 'animation.duration',
    canFix: (v, line) => /duration:\s*['"]?\d+(?:ms)?['"]?/.test(line),
    generateFix: (v, line) => line.replace(/duration:\s*['"]?\d+(?:ms)?['"]?/, 'duration: 200'),
  },

  // Inline hex to CSS variable suggestion
  {
    rule: 'colors.inline_hex',
    canFix: () => true,
    generateFix: (v, line) => {
      const match = line.match(/#(?:[0-9a-fA-F]{3}){1,2}/);
      if (match) {
        return line.replace(match[0], 'var(--color-primary) /* TODO: use design token */');
      }
      return line;
    },
  },

  // Focus ring fix - add ring instead of removing outline
  {
    rule: 'focus_ring.required',
    canFix: (v, line) => /outline:\s*(?:none|0)/.test(line),
    generateFix: (v, line) =>
      line.replace(
        /outline:\s*(?:none|0)/,
        'outline: 2px solid var(--ring-color, currentColor)'
      ),
  },

  // Font size minimum
  {
    rule: 'typography.min_size',
    canFix: (v, line) => /font-size:\s*['"]?\d+(?:px)?['"]?/.test(line),
    generateFix: (v, line) => line.replace(/font-size:\s*['"]?\d+(?:px)?['"]?/, 'font-size: 12px'),
  },
];

/**
 * Get a fix for a violation if available.
 */
function getFixForViolation(violation: Violation, lineContent: string): string | null {
  const generator = fixGenerators.find(
    (g) => g.rule === violation.rule && g.canFix(violation, lineContent)
  );

  if (generator) {
    return generator.generateFix(violation, lineContent);
  }

  // Use suggested fix if available
  if (violation.suggestedFix) {
    // Try to apply the suggested fix
    if (violation.originalCode) {
      return lineContent.replace(violation.originalCode, violation.suggestedFix);
    }
  }

  return null;
}

// =============================================================================
// DIFF GENERATION
// =============================================================================

/**
 * Generate diff for a single file's violations.
 *
 * @param filePath - Path to file
 * @param violations - Violations in this file
 * @returns FileDiff or null if no fixes available
 */
export function generateFileDiff(filePath: string, violations: Violation[]): FileDiff | null {
  let content: string;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }

  const lines = content.split('\n');
  const hunks: DiffHunk[] = [];
  const fixableViolations: Violation[] = [];

  // Group violations by line
  const byLine = new Map<number, Violation[]>();
  for (const v of violations) {
    if (!byLine.has(v.line)) {
      byLine.set(v.line, []);
    }
    byLine.get(v.line)!.push(v);
  }

  // Process each line with violations
  for (const [lineNum, lineViolations] of byLine) {
    const originalLine = lines[lineNum - 1];
    if (!originalLine) continue;

    // Try to fix each violation
    let fixedLine = originalLine;
    let hasChanges = false;

    for (const v of lineViolations) {
      const fix = getFixForViolation(v, fixedLine);
      if (fix && fix !== fixedLine) {
        fixedLine = fix;
        hasChanges = true;
        fixableViolations.push(v);
      }
    }

    if (hasChanges) {
      // Create hunk with context
      const contextLines = 3;
      const startLine = Math.max(1, lineNum - contextLines);
      const endLine = Math.min(lines.length, lineNum + contextLines);

      const hunkLines: string[] = [];

      // Before context
      for (let i = startLine; i < lineNum; i++) {
        hunkLines.push(` ${lines[i - 1]}`);
      }

      // Changed line
      hunkLines.push(`-${originalLine}`);
      hunkLines.push(`+${fixedLine}`);

      // After context
      for (let i = lineNum + 1; i <= endLine; i++) {
        hunkLines.push(` ${lines[i - 1]}`);
      }

      hunks.push({
        oldStart: startLine,
        oldCount: endLine - startLine + 1,
        newStart: startLine,
        newCount: endLine - startLine + 1,
        lines: hunkLines,
      });
    }
  }

  if (hunks.length === 0) {
    return null;
  }

  return {
    file: filePath,
    hunks,
    violations: fixableViolations,
  };
}

/**
 * Generate diffs for all violations.
 *
 * @param violations - All violations
 * @returns Diff result with all file diffs
 */
export function generateDiffs(violations: Violation[]): DiffResult {
  const diffs: FileDiff[] = [];

  // Group by file
  const byFile = new Map<string, Violation[]>();
  for (const v of violations) {
    if (!byFile.has(v.file)) {
      byFile.set(v.file, []);
    }
    byFile.get(v.file)!.push(v);
  }

  // Generate diff for each file
  for (const [file, fileViolations] of byFile) {
    const diff = generateFileDiff(file, fileViolations);
    if (diff) {
      diffs.push(diff);
    }
  }

  const totalChanges = diffs.reduce((sum, d) => sum + d.hunks.length, 0);

  return {
    diffs,
    totalChanges,
    summary: `${diffs.length} file(s) with ${totalChanges} change(s)`,
  };
}

// =============================================================================
// FORMATTERS
// =============================================================================

/**
 * Format a single hunk in unified diff format.
 */
function formatHunk(hunk: DiffHunk): string {
  const header = `@@ -${hunk.oldStart},${hunk.oldCount} +${hunk.newStart},${hunk.newCount} @@`;
  return [header, ...hunk.lines].join('\n');
}

/**
 * Format a file diff in unified diff format.
 */
export function formatFileDiff(diff: FileDiff): string {
  const lines: string[] = [
    `--- a/${diff.file}`,
    `+++ b/${diff.file}`,
    ...diff.hunks.map(formatHunk),
  ];
  return lines.join('\n');
}

/**
 * Format all diffs in unified diff format.
 */
export function formatDiffs(result: DiffResult): string {
  if (result.diffs.length === 0) {
    return 'No automatic fixes available.';
  }

  const sections = result.diffs.map(formatFileDiff);
  return sections.join('\n\n');
}

/**
 * Format diff with color for terminal.
 */
export function formatDiffsWithColor(result: DiffResult): string {
  if (result.diffs.length === 0) {
    return 'No automatic fixes available.';
  }

  const lines: string[] = [];

  for (const diff of result.diffs) {
    lines.push(`\x1b[1m${diff.file}\x1b[0m`);

    for (const hunk of diff.hunks) {
      lines.push(`\x1b[36m@@ -${hunk.oldStart},${hunk.oldCount} +${hunk.newStart},${hunk.newCount} @@\x1b[0m`);

      for (const line of hunk.lines) {
        if (line.startsWith('+')) {
          lines.push(`\x1b[32m${line}\x1b[0m`);
        } else if (line.startsWith('-')) {
          lines.push(`\x1b[31m${line}\x1b[0m`);
        } else {
          lines.push(line);
        }
      }
    }

    lines.push('');
  }

  return lines.join('\n');
}

// =============================================================================
// APPLY DIFFS
// =============================================================================

/**
 * Apply diffs to files.
 *
 * @param result - Diff result to apply
 * @returns List of modified file paths
 */
export function applyDiffs(result: DiffResult): string[] {
  const modifiedFiles: string[] = [];

  for (const diff of result.diffs) {
    try {
      let content = readFileSync(diff.file, 'utf-8');
      const lines = content.split('\n');

      // Apply hunks in reverse order to preserve line numbers
      const sortedHunks = [...diff.hunks].sort((a, b) => b.oldStart - a.oldStart);

      for (const hunk of sortedHunks) {
        // Find the changed lines in the hunk
        const oldLines: string[] = [];
        const newLines: string[] = [];

        for (const line of hunk.lines) {
          if (line.startsWith('-')) {
            oldLines.push(line.slice(1));
          } else if (line.startsWith('+')) {
            newLines.push(line.slice(1));
          }
        }

        // Replace old lines with new lines
        if (oldLines.length > 0 && newLines.length > 0) {
          // Find and replace each old line
          for (let i = 0; i < oldLines.length; i++) {
            const oldLine = oldLines[i];
            const newLine = newLines[i] || newLines[0];
            const lineIndex = lines.findIndex((l) => l === oldLine);
            if (lineIndex !== -1) {
              lines[lineIndex] = newLine;
            }
          }
        }
      }

      content = lines.join('\n');
      writeFileSync(diff.file, content, 'utf-8');
      modifiedFiles.push(diff.file);
    } catch (err) {
      console.error(`Failed to apply diff to ${diff.file}:`, err);
    }
  }

  return modifiedFiles;
}
