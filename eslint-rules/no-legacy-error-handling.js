/**
 * ESLint rule: no-legacy-error-handling
 *
 * Prevents usage of legacy error handling utilities in API routes.
 * Enforces use of ApplicationError + withErrorHandling middleware pattern.
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent usage of legacy error handling patterns',
      category: 'Best Practices',
    },
    schema: [],
    messages: {
      legacyErrorHandling:
        'Use ApplicationError + withErrorHandling middleware instead of legacy {{name}}. See ERROR_HANDLING_BEST_PRACTICES.md',
    },
  },

  create(context) {
    // Legacy error handling patterns to detect
    const legacyPatterns = [
      'sendSafeErrorResponse',
      'createSanitizedErrorResponse',
      'sendError', // from response-utils.ts or response-helpers.ts
    ];

    // Legacy imports to detect
    const legacyImports = [
      '@/utils/secure-error-response',
      '@/utils/errorSanitization',
      '@/utils/response-utils',
      '@/lib/api/response-helpers',
      '@/utils/error-handling/error-handler',
      '@/utils/error-handling/errorUtils',
    ];

    return {
      // Check for legacy imports
      ImportDeclaration(node) {
        if (node.source && node.source.value) {
          const importPath = node.source.value;

          for (const legacyPath of legacyImports) {
            if (importPath === legacyPath) {
              context.report({
                node,
                messageId: 'legacyErrorHandling',
                data: { name: importPath },
              });
            }
          }
        }
      },

      // Check for legacy function calls
      CallExpression(node) {
        if (node.callee.type === 'Identifier') {
          const functionName = node.callee.name;

          if (legacyPatterns.includes(functionName)) {
            context.report({
              node,
              messageId: 'legacyErrorHandling',
              data: { name: functionName },
            });
          }
        }
      },
    };
  },
};
