/**
 * ESLint rule to prevent direct React Query hooks with inline API calls
 *
 * This rule enforces that React Query hooks should either:
 * 1. Use the standardized useApiQuery/useApiMutation hooks, or
 * 2. Use service layer functions (not inline fetch/apiFetch calls)
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensure React Query hooks use either useApiQuery/useApiMutation or service layer functions',
      category: 'Best Practices',
    },
    messages: {
      useApiHooks:
        'Use useApiQuery/useApiMutation from @/lib/api/queryClient instead of direct React Query hooks. This ensures consistent error handling and tenant context.',
      noInlineApiCalls:
        'Direct React Query hooks should not contain inline API calls. Use service layer functions or useApiQuery/useApiMutation instead.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();

    // Skip test files
    if (
      filename.includes('__tests__') ||
      filename.includes('.test.') ||
      filename.includes('.spec.')
    ) {
      return {};
    }

    // Allow direct React Query usage in specific directories that define the patterns
    const allowedPaths = [
      'src/lib/api/',
      'src/lib/queryKeys/',
      'eslint-rules/',
    ];

    const normalizedPath = filename.replace(/\\/g, '/');
    const isAllowedPath = allowedPaths.some(path =>
      normalizedPath.includes(path)
    );

    if (isAllowedPath) {
      return {};
    }

    // Check if file has eslint-disable comment for this rule
    const sourceCode = context.getSourceCode();
    const comments = sourceCode.getAllComments();
    const hasDisableComment = comments.some(
      comment =>
        comment.value.includes('eslint-disable local/no-direct-react-query-hooks')
    );

    if (hasDisableComment) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        if (node.source.value === '@tanstack/react-query') {
          const hasDirectHookImport = node.specifiers.some(
            spec =>
              spec.type === 'ImportSpecifier' &&
              ['useQuery', 'useMutation', 'useInfiniteQuery'].includes(
                spec.imported.name
              )
          );

          if (hasDirectHookImport) {
            // Check if the file also imports from service layer
            const allImports = sourceCode.ast.body.filter(
              n => n.type === 'ImportDeclaration'
            );
            
            const hasServiceImport = allImports.some(
              imp =>
                imp.source.value.includes('/services/') ||
                imp.source.value.includes('Service')
            );

            // Only report if there's no service import (likely using inline API calls)
            if (!hasServiceImport) {
              context.report({
                node,
                messageId: 'useApiHooks',
              });
            }
          }
        }
      },
      
      CallExpression(node) {
        // Check for inline API calls in React Query hooks
        if (
          ['useQuery', 'useMutation', 'useInfiniteQuery'].includes(
            node.callee.name
          )
        ) {
          const configArg = node.arguments[0];
          if (configArg && configArg.type === 'ObjectExpression') {
            for (const prop of configArg.properties) {
              if (
                prop.key &&
                (prop.key.name === 'queryFn' || prop.key.name === 'mutationFn')
              ) {
                const fnBody = prop.value;
                if (fnBody) {
                  const bodyText = context.getSourceCode().getText(fnBody);
                  // Check for inline fetch/apiFetch calls
                  if (
                    bodyText.includes('fetch(') ||
                    bodyText.includes('apiFetch(')
                  ) {
                    context.report({
                      node: prop,
                      messageId: 'noInlineApiCalls',
                    });
                  }
                }
              }
            }
          }
        }
      },
    };
  },
};
