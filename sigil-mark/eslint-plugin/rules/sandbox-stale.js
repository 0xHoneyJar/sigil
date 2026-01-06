/**
 * @sigil-rule sigil/sandbox-stale
 *
 * Warns if a sandbox file is older than 7 days.
 * Sandboxes are for experimentation - stale ones should be codified to recipes.
 *
 * @example Warns
 * ```tsx
 * // sigil-sandbox
 * // File modified 10 days ago
 * export const Button = () => <motion.button>Click</motion.button>;
 * ```
 *
 * Resolution:
 * - Run `/codify` to extract physics to a recipe
 * - Or run `/sandbox --clear` to remove sandbox status
 */

const fs = require('fs');
const path = require('path');

const SANDBOX_HEADER = '// sigil-sandbox';
const STALE_THRESHOLD_DAYS = 7;
const CRITICAL_THRESHOLD_DAYS = 14;

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Warn on stale sandbox files (>7 days old)',
      category: 'Sigil Physics',
      recommended: true,
    },
    messages: {
      sandboxStale:
        'Sandbox file is {{days}} days old. Consider running `/codify` to extract physics to a recipe.',
      sandboxCritical:
        'CRITICAL: Sandbox file is {{days}} days old (>14 days). Must codify or clear sandbox status.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          staleDays: {
            type: 'number',
            default: 7,
          },
          criticalDays: {
            type: 'number',
            default: 14,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {};
    const staleDays = options.staleDays || STALE_THRESHOLD_DAYS;
    const criticalDays = options.criticalDays || CRITICAL_THRESHOLD_DAYS;

    // Check if file has sandbox header
    const sourceCode = context.getSourceCode();
    const comments = sourceCode.getAllComments();
    const hasSandboxHeader = comments.some(
      (comment) =>
        comment.type === 'Line' &&
        comment.value.trim() === 'sigil-sandbox'
    );

    // Only check sandbox files
    if (!hasSandboxHeader) {
      return {};
    }

    return {
      Program(node) {
        const filename = context.getFilename();

        try {
          const stats = fs.statSync(filename);
          const modifiedTime = stats.mtime;
          const now = new Date();
          const diffMs = now - modifiedTime;
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

          if (diffDays >= criticalDays) {
            context.report({
              node,
              messageId: 'sandboxCritical',
              data: {
                days: diffDays,
              },
            });
          } else if (diffDays >= staleDays) {
            context.report({
              node,
              messageId: 'sandboxStale',
              data: {
                days: diffDays,
              },
            });
          }
        } catch (error) {
          // File stat failed - skip this check
        }
      },
    };
  },
};
