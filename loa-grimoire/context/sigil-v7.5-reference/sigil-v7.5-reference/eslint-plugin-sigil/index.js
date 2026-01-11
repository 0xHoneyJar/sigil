/**
 * eslint-plugin-sigil
 * 
 * ESLint rules for Sigil contagion model.
 * Ensures Gold components maintain their purity.
 */

const goldImportsOnly = require('./rules/gold-imports-only');
const noGoldImportsDraft = require('./rules/no-gold-imports-draft');

module.exports = {
  rules: {
    'gold-imports-only': goldImportsOnly,
    'no-gold-imports-draft': noGoldImportsDraft,
  },
  configs: {
    recommended: {
      plugins: ['sigil'],
      rules: {
        'sigil/gold-imports-only': 'error',
        'sigil/no-gold-imports-draft': 'error',
      },
    },
  },
};
