/**
 * ESLint rule to enforce standardized API response format
 * Prevents direct res.status().json() calls in API routes
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce standardized API response format using apiResponse utilities',
      category: 'Best Practices',
      recommended: true
    },
    fixable: null,
    schema: [],
    messages: {
      directJsonResponse: 'Use apiResponse.{{method}}() instead of direct res.status().json() calls',
      missingApiResponseImport: 'Import apiResponse from @/utils/api/responses to use standardized responses',
      legacyEndpointException: 'Legacy endpoint - add "DO NOT WRAP" comment to suppress this warning'
    }
  },

  create(context) {
    const filename = context.getFilename();
    
    // Only apply to API route files
    if (!filename.includes('/pages/api/') || !filename.endsWith('.ts')) {
      return {};
    }

    let hasApiResponseImport = false;
    let hasLegacyComment = false;

    return {
      ImportDeclaration(node) {
        if (node.source.value === '@/utils/api/responses') {
          hasApiResponseImport = true;
        }
      },

      Program(node) {
        // Check for legacy endpoint comments
        const sourceCode = context.getSourceCode();
        const comments = sourceCode.getAllComments();
        
        hasLegacyComment = comments.some(comment => 
          comment.value.includes('DO NOT WRAP') || 
          comment.value.includes('legacy') ||
          comment.value.includes('Frontend expects specific format')
        );
      },

      CallExpression(node) {
        // Skip if legacy endpoint
        if (hasLegacyComment) {
          return;
        }

        // Check for res.status().json() pattern
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.property.name === 'json' &&
          node.callee.object.type === 'CallExpression' &&
          node.callee.object.callee.type === 'MemberExpression' &&
          node.callee.object.callee.property.name === 'status'
        ) {
          // Get the status code
          const statusArg = node.callee.object.arguments[0];
          let recommendedMethod = 'ok';
          
          if (statusArg && statusArg.type === 'Literal') {
            const status = statusArg.value;
            if (status === 200 || status === 201) {
              recommendedMethod = 'ok';
            } else if (status === 400) {
              recommendedMethod = 'badRequest';
            } else if (status === 401) {
              recommendedMethod = 'unauthorized';
            } else if (status === 403) {
              recommendedMethod = 'forbidden';
            } else if (status === 404) {
              recommendedMethod = 'notFound';
            } else if (status === 405) {
              recommendedMethod = 'methodNotAllowed';
            } else if (status === 500) {
              recommendedMethod = 'serverError';
            }
          }

          context.report({
            node,
            messageId: 'directJsonResponse',
            data: { method: recommendedMethod }
          });
        }
      }
    };
  }
};

/**
 * Usage in .eslintrc.js:
 * 
 * {
 *   "rules": {
 *     "custom/enforce-api-response-format": "error"
 *   }
 * }
 */ 