/**
 * ESLint rule to prevent console usage outside of allowed files
 *
 * This rule ensures all logging goes through our structured logger
 * to prevent sensitive data leakage and ensure consistent logging.
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow console usage outside of allowed files',
      category: 'Security',
    },
    messages: {
      noConsole:
        'Direct console usage is not allowed. Use logger from @/utils/clientLogger or @/server/logger instead.',
    },
    fixable: null,
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();
    const normalizedPath = filename.replace(/\\/g, '/');

    // Allow console in these files
    const allowedPaths = [
      'src/utils/clientLogger',
      'src/server/logger',
      'src/server/monitoring/logger-config',
      'src/lib/queryKeys/debugTenantKeys',
      'src/config/validateEnv',
      '__tests__',
      '.test.',
      '.spec.',
      'jest.config',
      'scripts/',
    ];

    const isAllowedPath = allowedPaths.some(path =>
      normalizedPath.includes(path)
    );

    if (isAllowedPath) {
      return {};
    }

    return {
      MemberExpression(node) {
        if (
          node.object.type === 'Identifier' &&
          node.object.name === 'console' &&
          node.property.type === 'Identifier' &&
          ['log', 'error', 'warn', 'debug', 'info'].includes(node.property.name)
        ) {
          context.report({
            node,
            messageId: 'noConsole',
          });
        }
      },
    };
  },
}; 