/**
 * @sigil-rule sigil/no-optimistic-in-decisive
 *
 * Detects optimistic UI patterns in decisive zones (checkout, transactions).
 * Decisive zones require server-authoritative state - no immediate UI updates
 * before server confirmation.
 *
 * This is an IMPOSSIBLE constraint - cannot be overridden.
 *
 * @example Bad
 * ```tsx
 * // In src/checkout/
 * const handleClick = () => {
 *   setStatus('success'); // Immediate update
 *   await submitOrder();  // Server call after
 * };
 * ```
 *
 * @example Good
 * ```tsx
 * // In src/checkout/
 * const { execute, isPending } = useServerTick(submitOrder);
 * const handleClick = () => execute(); // Waits for server
 * ```
 */

const DECISIVE_PATH_PATTERNS = [
  /\/checkout\//,
  /\/transaction/,
  /\/payment/,
  /\/claim/,
  /\/order/,
];

const OPTIMISTIC_PATTERNS = [
  // setState before async
  /set\w+.*\n.*await/,
];

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow optimistic UI patterns in decisive zones',
      category: 'Sigil Physics',
      recommended: true,
    },
    messages: {
      noOptimistic:
        'IMPOSSIBLE: Optimistic UI pattern detected in decisive zone. Use useServerTick hook to ensure server-authoritative state.',
      useServerTick:
        'IMPOSSIBLE: State update before async operation in decisive zone. Wrap with useServerTick to prevent optimistic updates.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();

    // Check if file is in a decisive zone
    const isDecisiveZone = DECISIVE_PATH_PATTERNS.some((pattern) =>
      pattern.test(filename)
    );

    if (!isDecisiveZone) {
      return {};
    }

    return {
      // Detect setState calls followed by async operations
      CallExpression(node) {
        // Check for pattern: setX() ... await
        if (
          node.callee &&
          node.callee.type === 'Identifier' &&
          node.callee.name.startsWith('set')
        ) {
          // Check if this is inside an async function
          let parent = node.parent;
          let foundAwait = false;

          while (parent) {
            if (parent.type === 'AwaitExpression') {
              foundAwait = true;
              break;
            }
            if (
              parent.type === 'FunctionDeclaration' ||
              parent.type === 'FunctionExpression' ||
              parent.type === 'ArrowFunctionExpression'
            ) {
              break;
            }
            parent = parent.parent;
          }

          // Look for await expressions after this setState
          if (!foundAwait) {
            const functionParent = findFunctionParent(node);
            if (functionParent && functionParent.async) {
              // Check if there's an await after this setState in the same function
              const hasAwaitAfter = checkForAwaitAfter(node, functionParent);
              if (hasAwaitAfter) {
                context.report({
                  node,
                  messageId: 'useServerTick',
                });
              }
            }
          }
        }
      },

      // Check for missing useServerTick in decisive zone components
      'Program:exit'() {
        const sourceCode = context.getSourceCode();
        const text = sourceCode.getText();

        // Check if file has state updates and async operations
        const hasSetState = /set[A-Z]\w*\s*\(/.test(text);
        const hasAsync = /await\s+/.test(text) || /\.then\s*\(/.test(text);
        const hasServerTick = /useServerTick/.test(text);

        if (hasSetState && hasAsync && !hasServerTick) {
          // This is a potential issue - warn about using useServerTick
          // Note: This is a heuristic and may have false positives
        }
      },
    };
  },
};

function findFunctionParent(node) {
  let parent = node.parent;
  while (parent) {
    if (
      parent.type === 'FunctionDeclaration' ||
      parent.type === 'FunctionExpression' ||
      parent.type === 'ArrowFunctionExpression'
    ) {
      return parent;
    }
    parent = parent.parent;
  }
  return null;
}

function checkForAwaitAfter(node, functionNode) {
  // Simplified check - in a real implementation, use proper AST traversal
  // This checks if there's an await expression in the same function body
  const body = functionNode.body;
  if (!body) return false;

  let foundNode = false;
  let foundAwaitAfter = false;

  function traverse(n) {
    if (n === node) {
      foundNode = true;
      return;
    }
    if (foundNode && n.type === 'AwaitExpression') {
      foundAwaitAfter = true;
      return;
    }
    for (const key in n) {
      if (n[key] && typeof n[key] === 'object') {
        if (Array.isArray(n[key])) {
          n[key].forEach(traverse);
        } else if (n[key].type) {
          traverse(n[key]);
        }
      }
    }
  }

  traverse(body);
  return foundAwaitAfter;
}
