/**
 * ESLint rule to prevent direct API calls bypassing the service layer
 *
 * This rule enforces the architectural pattern where all API calls
 * must go through the service layer for consistency, type safety,
 * and proper error handling.
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct API calls bypassing the service layer',
      category: 'Best Practices',
    },
    messages: {
      noDirectFetch:
        'Direct fetch() calls are not allowed. Use the service layer in src/client/services/ instead.',
      noDirectApiFetch:
        'Direct apiFetch() calls should be in service layer only. Create or use a service in src/client/services/.',
      noDirectUseQuery:
        'Direct useQuery with inline API calls detected. Use hooks from src/hooks/api/ instead.',
      noDirectUseMutation:
        'Direct useMutation with inline API calls detected. Use hooks from src/hooks/api/ instead.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();

    // Normalize path to use forward slashes for consistency
    const normalizedPath = filename.replace(/\\/g, '/');

    // Allow direct calls in specific directories
    const allowedPaths = [
      'src/client/services/',
      'src/services/api/',
      'src/lib/api/',
      'src/hooks/api/',
      'src/pages/api/', // API routes can use fetch
      'src/middleware/',
      '__tests__',
      '.test.',
      '.spec.',
    ];

    const isAllowedPath = allowedPaths.some(path =>
      normalizedPath.includes(path)
    );

    return {
      // Check for direct fetch() calls
      CallExpression(node) {
        if (isAllowedPath) return;

        // Check for fetch()
        if (node.callee.name === 'fetch') {
          // Check if it's calling an API endpoint
          const firstArg = node.arguments[0];
          if (
            firstArg &&
            firstArg.type === 'Literal' &&
            typeof firstArg.value === 'string' &&
            firstArg.value.includes('/api/')
          ) {
            context.report({
              node,
              messageId: 'noDirectFetch',
            });
          }
        }

        // Check for apiFetch()
        if (node.callee.name === 'apiFetch') {
          context.report({
            node,
            messageId: 'noDirectApiFetch',
          });
        }

        // Check for useQuery with inline fetch
        if (node.callee.name === 'useQuery') {
          const hasInlineApiCall = checkForInlineApiCall(node);
          if (hasInlineApiCall) {
            context.report({
              node,
              messageId: 'noDirectUseQuery',
            });
          }
        }

        // Check for useMutation with inline fetch
        if (node.callee.name === 'useMutation') {
          const hasInlineApiCall = checkForInlineApiCall(node);
          if (hasInlineApiCall) {
            context.report({
              node,
              messageId: 'noDirectUseMutation',
            });
          }
        }
      },
    };

    function checkForInlineApiCall(node) {
      // Look for queryFn or mutationFn properties that contain API calls
      const configArg = node.arguments[0];
      if (!configArg || configArg.type !== 'ObjectExpression') return false;

      for (const prop of configArg.properties) {
        if (
          prop.key &&
          (prop.key.name === 'queryFn' || prop.key.name === 'mutationFn')
        ) {
          // Check if the function contains fetch or apiFetch
          const fnBody = prop.value;
          if (
            (fnBody && fnBody.type === 'ArrowFunctionExpression') ||
            fnBody.type === 'FunctionExpression'
          ) {
            // Check the function body for API calls
            const bodyStr = context.getSourceCode().getText(fnBody);
            if (
              bodyStr.includes('fetch(') ||
              bodyStr.includes('apiFetch(') ||
              bodyStr.includes('/api/')
            ) {
              return true;
            }
          }
        }
      }

      return false;
    }
  },
};
