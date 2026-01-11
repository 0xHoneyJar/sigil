/**
 * sigil/gold-imports-only
 * 
 * Ensures Gold components only import from Gold registry.
 * 
 * Gold → Gold: ✅ Allowed
 * Gold → Silver: ❌ Error
 * Gold → Draft: ❌ Error
 * Gold → External: ✅ Allowed (node_modules, etc.)
 */

const path = require('path');

/**
 * Check if a file is in the Gold registry
 */
function isGoldFile(filename) {
  // Gold components are in src/gold/ OR are exported from src/gold/index.ts
  // For simplicity, we check if the file is imported by src/gold/index.ts
  // In practice, you'd parse the gold registry
  const normalized = filename.replace(/\\/g, '/');
  return (
    normalized.includes('/src/gold/') ||
    normalized.includes('/gold/index')
  );
}

/**
 * Check if an import is from Gold registry
 */
function isGoldImport(importPath) {
  if (importPath.startsWith('@/gold') || importPath.startsWith('../gold')) {
    return true;
  }
  // External imports are allowed
  if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
    return true;
  }
  // Utility imports are allowed
  if (importPath.includes('/lib/') || importPath.includes('/utils/')) {
    return true;
  }
  return false;
}

/**
 * Check if an import is from Silver or Draft
 */
function isSilverOrDraftImport(importPath) {
  return (
    importPath.includes('/silver/') ||
    importPath.includes('/draft/') ||
    importPath.includes('@/silver') ||
    importPath.includes('@/draft')
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Gold components can only import from Gold registry',
      category: 'Sigil Contagion',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      goldCannotImportSilver:
        'Gold components cannot import from Silver. Import from @/gold instead, or demote this component.',
      goldCannotImportDraft:
        'Gold components cannot import from Draft. Draft code is quarantined.',
      goldCannotImportComponents:
        'Gold components should import from @/gold registry, not directly from components.',
    },
  },

  create(context) {
    const filename = context.getFilename();

    // Only apply to Gold files
    if (!isGoldFile(filename)) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // Check for Silver/Draft imports
        if (isSilverOrDraftImport(importPath)) {
          const messageId = importPath.includes('draft')
            ? 'goldCannotImportDraft'
            : 'goldCannotImportSilver';

          context.report({
            node,
            messageId,
          });
          return;
        }

        // Check for direct component imports (should use registry)
        if (
          importPath.includes('/components/') &&
          !importPath.includes('/gold/') &&
          !isGoldImport(importPath)
        ) {
          context.report({
            node,
            messageId: 'goldCannotImportComponents',
          });
        }
      },
    };
  },
};
