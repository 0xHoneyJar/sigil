/**
 * @sigil-rule sigil/require-recipe
 *
 * Requires @sigil/recipes imports for components with animation.
 * Files with `// sigil-sandbox` header are exempted.
 *
 * @example Bad
 * ```tsx
 * import { motion } from 'framer-motion';
 * const Button = () => <motion.button>Click</motion.button>;
 * ```
 *
 * @example Good
 * ```tsx
 * import { Button } from '@sigil/recipes/decisive';
 * const MyButton = () => <Button>Click</Button>;
 * ```
 */

const SANDBOX_HEADER = '// sigil-sandbox';
const ANIMATION_LIBRARIES = ['framer-motion', 'react-spring', '@react-spring/web'];
const RECIPE_IMPORT_PATTERN = /@sigil\/recipes/;

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require @sigil/recipes imports for animated components',
      category: 'Sigil Physics',
      recommended: true,
    },
    messages: {
      requireRecipe:
        'Animation library "{{library}}" imported without @sigil/recipes. Import recipes instead: `import { Component } from \'@sigil/recipes/zone\'`',
    },
    schema: [],
  },

  create(context) {
    // Check if file has sandbox header
    const sourceCode = context.getSourceCode();
    const comments = sourceCode.getAllComments();
    const hasSandboxHeader = comments.some(
      (comment) =>
        comment.type === 'Line' &&
        comment.value.trim() === 'sigil-sandbox'
    );

    // Skip sandbox files
    if (hasSandboxHeader) {
      return {};
    }

    let hasAnimationImport = false;
    let hasRecipeImport = false;
    let animationImportNode = null;
    let animationLibraryName = '';

    return {
      ImportDeclaration(node) {
        const source = node.source.value;

        // Check for animation library imports
        if (ANIMATION_LIBRARIES.includes(source)) {
          hasAnimationImport = true;
          animationImportNode = node;
          animationLibraryName = source;
        }

        // Check for recipe imports
        if (RECIPE_IMPORT_PATTERN.test(source)) {
          hasRecipeImport = true;
        }
      },

      'Program:exit'() {
        // Report if animation library is used without recipes
        if (hasAnimationImport && !hasRecipeImport && animationImportNode) {
          context.report({
            node: animationImportNode,
            messageId: 'requireRecipe',
            data: {
              library: animationLibraryName,
            },
          });
        }
      },
    };
  },
};
