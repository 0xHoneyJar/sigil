/**
 * sigil/no-gold-imports-draft
 * 
 * Ensures Gold components never import Draft code.
 * This is the core contagion rule — Draft is quarantined.
 * 
 * Draft code CAN exist and CAN be merged to main.
 * But Gold code CANNOT depend on Draft code.
 */

const path = require('path');
const fs = require('fs');

/**
 * Check if a file is in the Gold registry or is a Gold export
 */
function isGoldFile(filename) {
  const normalized = filename.replace(/\\/g, '/');
  
  // Files in src/gold/ directory
  if (normalized.includes('/src/gold/')) {
    return true;
  }
  
  // Files exported from Gold registry
  // In production, you'd parse src/gold/index.ts to get the list
  // For now, we check if the file is in components/ and matches a Gold pattern
  return false;
}

/**
 * Check if an import is from Draft registry
 */
function isDraftImport(importPath) {
  return (
    importPath.includes('/draft/') ||
    importPath.includes('@/draft') ||
    importPath.startsWith('draft/')
  );
}

/**
 * Get the list of Gold-exported components by parsing the registry
 * In production, this would cache the result
 */
function getGoldExports(projectRoot) {
  try {
    const goldIndexPath = path.join(projectRoot, 'src/gold/index.ts');
    if (!fs.existsSync(goldIndexPath)) {
      return new Set();
    }
    
    const content = fs.readFileSync(goldIndexPath, 'utf-8');
    const exports = new Set();
    
    // Parse export statements
    // export { Button } from '../components/Button';
    const exportRegex = /export\s*{\s*(\w+)\s*}\s*from\s*['"]([^'"]+)['"]/g;
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      const componentPath = match[2];
      exports.add(componentPath);
    }
    
    return exports;
  } catch (e) {
    return new Set();
  }
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Gold components cannot import from Draft registry',
      category: 'Sigil Contagion',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      goldCannotImportDraft:
        'Gold components cannot import Draft code. Draft is quarantined. ' +
        'Either promote the Draft component to Silver, or remove this import.',
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

        if (isDraftImport(importPath)) {
          context.report({
            node,
            messageId: 'goldCannotImportDraft',
          });
        }
      },

      // Also check dynamic imports
      CallExpression(node) {
        if (
          node.callee.type === 'Import' ||
          (node.callee.type === 'Identifier' && node.callee.name === 'require')
        ) {
          const arg = node.arguments[0];
          if (arg && arg.type === 'Literal' && typeof arg.value === 'string') {
            if (isDraftImport(arg.value)) {
              context.report({
                node,
                messageId: 'goldCannotImportDraft',
              });
            }
          }
        }
      },
    };
  },
};
