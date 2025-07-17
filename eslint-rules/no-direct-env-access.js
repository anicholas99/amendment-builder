/**
 * ESLint rule to prevent direct process.env access
 * @fileoverview Enforce using configuration modules instead of direct process.env access
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce using configuration modules instead of direct process.env access',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      useConfigModule: 'Use @/config/env or @/config/environment instead of direct process.env access',
      useConfigModuleServer: 'Use @/config/environment for server-side configuration instead of process.env',
      useConfigModuleClient: 'Use @/config/env for validated environment variables instead of process.env',
    },
    fixable: null,
    schema: [],
  },

  create(context) {
    return {
      MemberExpression(node) {
        // Check if accessing process.env
        if (
          node.object.type === 'Identifier' &&
          node.object.name === 'process' &&
          node.property.type === 'Identifier' &&
          node.property.name === 'env'
        ) {
          const filename = context.getFilename();
          
          // Allow in config files themselves
          if (filename.includes('/config/env') || filename.includes('/config/environment')) {
            return;
          }
          
          // Allow in Next.js config files
          if (filename.endsWith('next.config.js') || filename.endsWith('.config.js')) {
            return;
          }
          
          // Allow in test setup files
          if (filename.includes('test') || filename.includes('spec')) {
            return;
          }
          
          // Determine appropriate message based on file location
          let messageId = 'useConfigModule';
          if (filename.includes('/server/') || filename.includes('/pages/api/')) {
            messageId = 'useConfigModuleServer';
          } else if (filename.includes('/components/') || filename.includes('/hooks/')) {
            messageId = 'useConfigModuleClient';
          }
          
          context.report({
            node,
            messageId,
          });
        }
      },
    };
  },
}; 