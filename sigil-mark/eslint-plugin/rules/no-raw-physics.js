/**
 * @sigil-rule sigil/no-raw-physics
 *
 * Detects raw physics values (stiffness, damping, transition) outside sandbox files.
 * Files with `// sigil-sandbox` header are exempted.
 *
 * @example Bad
 * ```tsx
 * <motion.div transition={{ stiffness: 180, damping: 12 }} />
 * ```
 *
 * @example Good
 * ```tsx
 * import { Button } from '@sigil/recipes/decisive';
 * <Button>Click</Button>
 * ```
 */

const PHYSICS_PROPERTIES = ['stiffness', 'damping', 'mass', 'velocity'];
const SANDBOX_HEADER = '// sigil-sandbox';

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow raw physics values outside sandbox files',
      category: 'Sigil Physics',
      recommended: true,
    },
    messages: {
      noRawPhysics:
        'Raw physics value "{{property}}" detected. Use a recipe from @sigil/recipes/ instead, or add "// sigil-sandbox" header to experiment.',
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

    return {
      Property(node) {
        if (
          node.key &&
          node.key.type === 'Identifier' &&
          PHYSICS_PROPERTIES.includes(node.key.name)
        ) {
          // Check if this is inside a transition or spring config
          let parent = node.parent;
          while (parent) {
            if (
              parent.type === 'ObjectExpression' &&
              parent.parent &&
              parent.parent.type === 'Property'
            ) {
              const parentKey = parent.parent.key;
              if (
                parentKey &&
                parentKey.type === 'Identifier' &&
                (parentKey.name === 'transition' || parentKey.name === 'spring')
              ) {
                context.report({
                  node,
                  messageId: 'noRawPhysics',
                  data: {
                    property: node.key.name,
                  },
                });
                return;
              }
            }
            parent = parent.parent;
          }
        }
      },

      // Also check for spring() function calls
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.type === 'Identifier' &&
          node.callee.name === 'spring' &&
          node.arguments.length >= 2
        ) {
          context.report({
            node,
            messageId: 'noRawPhysics',
            data: {
              property: 'spring()',
            },
          });
        }
      },
    };
  },
};
