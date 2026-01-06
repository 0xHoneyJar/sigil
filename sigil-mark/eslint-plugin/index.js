/**
 * eslint-plugin-sigil v1.2.4
 *
 * ESLint rules for Sigil design physics framework.
 * Enforces recipe usage and prevents physics violations.
 *
 * @example Configuration
 * ```js
 * // eslint.config.js
 * import sigil from 'eslint-plugin-sigil';
 *
 * export default [
 *   {
 *     plugins: { sigil },
 *     rules: {
 *       'sigil/no-raw-physics': 'error',
 *       'sigil/require-recipe': 'warn',
 *       'sigil/no-optimistic-in-decisive': 'error',
 *       'sigil/sandbox-stale': 'warn',
 *     },
 *   },
 * ];
 * ```
 */

module.exports = {
  rules: {
    'no-raw-physics': require('./rules/no-raw-physics'),
    'require-recipe': require('./rules/require-recipe'),
    'no-optimistic-in-decisive': require('./rules/no-optimistic-in-decisive'),
    'sandbox-stale': require('./rules/sandbox-stale'),
  },

  configs: {
    recommended: {
      plugins: ['sigil'],
      rules: {
        'sigil/no-raw-physics': 'error',
        'sigil/require-recipe': 'warn',
        'sigil/no-optimistic-in-decisive': 'error',
        'sigil/sandbox-stale': 'warn',
      },
    },

    strict: {
      plugins: ['sigil'],
      rules: {
        'sigil/no-raw-physics': 'error',
        'sigil/require-recipe': 'error',
        'sigil/no-optimistic-in-decisive': 'error',
        'sigil/sandbox-stale': 'error',
      },
    },
  },
};
