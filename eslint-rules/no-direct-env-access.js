/**
 * ESLint rule to prevent direct process.env access outside the config module
 *
 * This rule enforces centralized configuration management by ensuring
 * all environment variables are accessed through the config module.
 * This improves type safety, provides defaults, and makes the app's
 * configuration dependencies explicit.
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct process.env access outside config files',
      category: 'Best Practices',
    },
    messages: {
      noDirectEnv:
        'Direct process.env access is not allowed. Import from @/config/env instead.',
      useConfigImport:
        'Use env.{{envVar}} from @/config/env instead of process.env.{{envVar}}',
    },
    fixable: 'code',
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();
    const normalizedPath = filename.replace(/\\/g, '/');

    // Allow process.env in config files and test files
    const allowedPaths = [
      'src/lib/config/',
      'src/config/',
      '__tests__',
      '.test.',
      '.spec.',
      'jest.config',
      'next.config',
      '.eslintrc',
      'scripts/', // Allow in scripts directory
    ];

    const isAllowedPath = allowedPaths.some(path =>
      normalizedPath.includes(path)
    );

    if (isAllowedPath) {
      return {};
    }

    return {
      MemberExpression(node) {
        // Check for process.env access
        if (
          node.object.type === 'Identifier' &&
          node.object.name === 'process' &&
          node.property.type === 'Identifier' &&
          node.property.name === 'env'
        ) {
          // Get the specific env var being accessed if possible
          const parent = node.parent;
          let envVar = null;
          
          if (
            parent.type === 'MemberExpression' &&
            parent.property.type === 'Identifier'
          ) {
            envVar = parent.property.name;
          }

          if (envVar) {
            context.report({
              node: parent || node,
              messageId: 'useConfigImport',
              data: {
                envVar: envVar,
              },
            });
          } else {
            context.report({
              node,
              messageId: 'noDirectEnv',
            });
          }
        }
      },
    };
  },
}; 