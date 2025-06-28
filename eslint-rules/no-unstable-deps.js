/**
 * ESLint rule to detect unstable dependencies in React hooks
 *
 * This rule helps prevent infinite render loops by detecting
 * patterns that create new references on every render.
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Detect unstable dependencies in React hooks that can cause infinite loops',
      category: 'Best Practices',
    },
    messages: {
      unstableEmptyArray:
        'Using || [] creates a new array on every render. Use useMemo(() => value || [], [value]) instead.',
      unstableEmptyObject:
        'Using || {} creates a new object on every render. Use useMemo(() => value || {}, [value]) instead.',
      unstableArraySpread:
        'Spreading arrays in render creates new references. Use useMemo for stable references.',
      unstableObjectLiteral:
        'Object literals in hook dependencies create new references. Extract to a variable or use useMemo.',
      unstableArrayMethod:
        'Array methods like .map(), .filter() create new arrays. Use useMemo for stable references.',
    },
    fixable: 'code',
  },

  create(context) {
    const isReactHook = node => {
      return (
        node.callee &&
        node.callee.type === 'Identifier' &&
        node.callee.name.match(/^use[A-Z]/)
      );
    };

    const isReactBuiltinHook = name => {
      return [
        'useEffect',
        'useMemo',
        'useCallback',
        'useLayoutEffect',
      ].includes(name);
    };

    return {
      // Check for || [] and || {} patterns
      LogicalExpression(node) {
        if (node.operator !== '||') return;

        // Check for || []
        if (
          node.right.type === 'ArrayExpression' &&
          node.right.elements.length === 0
        ) {
          context.report({
            node,
            messageId: 'unstableEmptyArray',
            fix(fixer) {
              return fixer.replaceText(
                node,
                `useMemo(() => ${context.getSourceCode().getText(node.left)} || [], [${context.getSourceCode().getText(node.left)}])`
              );
            },
          });
        }

        // Check for || {}
        if (
          node.right.type === 'ObjectExpression' &&
          node.right.properties.length === 0
        ) {
          context.report({
            node,
            messageId: 'unstableEmptyObject',
          });
        }
      },

      // Check hook calls for problematic patterns
      CallExpression(node) {
        if (!isReactHook(node)) return;

        const hookName = node.callee.name;

        // For React built-in hooks, check the dependency array
        if (isReactBuiltinHook(hookName) && node.arguments.length >= 2) {
          const deps = node.arguments[1];

          if (deps && deps.type === 'ArrayExpression') {
            deps.elements.forEach(dep => {
              // Check for object literals in dependencies
              if (dep && dep.type === 'ObjectExpression') {
                context.report({
                  node: dep,
                  messageId: 'unstableObjectLiteral',
                });
              }

              // Check for array methods that create new arrays
              if (
                dep &&
                dep.type === 'CallExpression' &&
                dep.callee.type === 'MemberExpression' &&
                ['map', 'filter', 'reduce', 'slice', 'concat'].includes(
                  dep.callee.property.name
                )
              ) {
                context.report({
                  node: dep,
                  messageId: 'unstableArrayMethod',
                });
              }
            });
          }
        }

        // For custom hooks, check if arrays/objects are passed directly
        if (!isReactBuiltinHook(hookName) && node.arguments.length > 0) {
          const firstArg = node.arguments[0];

          // If it's an object with properties, check each property
          if (firstArg && firstArg.type === 'ObjectExpression') {
            firstArg.properties.forEach(prop => {
              if (prop.value) {
                // Check for || [] pattern in object properties
                if (
                  prop.value.type === 'LogicalExpression' &&
                  prop.value.operator === '||' &&
                  prop.value.right.type === 'ArrayExpression' &&
                  prop.value.right.elements.length === 0
                ) {
                  context.report({
                    node: prop.value,
                    messageId: 'unstableEmptyArray',
                  });
                }

                // Check for array spread
                if (
                  prop.value.type === 'ArrayExpression' &&
                  prop.value.elements.some(
                    el => el && el.type === 'SpreadElement'
                  )
                ) {
                  context.report({
                    node: prop.value,
                    messageId: 'unstableArraySpread',
                  });
                }
              }
            });
          }
        }
      },
    };
  },
};
