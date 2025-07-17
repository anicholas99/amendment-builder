/**
 * ESLint rule to prevent singleton service exports
 * This prevents memory leaks and cross-tenant data pollution
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow singleton service exports that can leak data between requests',
      category: 'Security',
      recommended: true,
    },
    messages: {
      noSingletonExport: 'Singleton service exports are forbidden. Export the class instead and instantiate per-request. See SINGLETON_MIGRATION_GUIDE.md',
      noGlobalCache: 'Global cache instances are forbidden. Use request-scoped caches instead. See SINGLETON_MIGRATION_GUIDE.md',
    },
    schema: [],
  },
  create(context) {
    // Track class declarations to identify service classes
    const serviceClasses = new Set();
    
    return {
      // Track class declarations that look like services
      ClassDeclaration(node) {
        if (node.id && node.id.name) {
          const className = node.id.name;
          // Identify service classes by name pattern
          if (className.endsWith('Service') || 
              className.endsWith('Cache') || 
              className.endsWith('Manager') ||
              className.endsWith('Monitor') ||
              className.endsWith('Logger')) {
            serviceClasses.add(className);
          }
        }
      },
      
      // Check for singleton exports
      ExportNamedDeclaration(node) {
        if (node.declaration && node.declaration.type === 'VariableDeclaration') {
          const declarations = node.declaration.declarations;
          
          declarations.forEach(declaration => {
            if (declaration.init && declaration.init.type === 'NewExpression') {
              const className = declaration.init.callee.name;
              
              // Check if it's instantiating a service class
              if (serviceClasses.has(className)) {
                context.report({
                  node: declaration,
                  messageId: 'noSingletonExport',
                });
              }
              
              // Also check for known problematic patterns
              if (className && (
                className.includes('Cache') ||
                className.includes('Service') ||
                className.includes('Manager') ||
                className.includes('Monitor')
              )) {
                context.report({
                  node: declaration,
                  messageId: 'noSingletonExport',
                });
              }
            }
          });
        }
      },
      
      // Check for const exports with new
      'ExportNamedDeclaration VariableDeclarator'(node) {
        if (node.init && node.init.type === 'NewExpression') {
          const className = node.init.callee.name;
          if (className && (
            className.endsWith('Service') ||
            className.endsWith('Cache') ||
            className.endsWith('Manager') ||
            className.endsWith('Monitor') ||
            className.endsWith('Logger')
          )) {
            context.report({
              node,
              messageId: 'noSingletonExport',
            });
          }
        }
      },
      
      // Check for module.exports assignments
      'AssignmentExpression[left.object.name="module"][left.property.name="exports"]'(node) {
        if (node.right && node.right.type === 'NewExpression') {
          context.report({
            node,
            messageId: 'noSingletonExport',
          });
        }
      },
      
      // Check for exports.something = new Something()
      'AssignmentExpression[left.object.name="exports"]'(node) {
        if (node.right && node.right.type === 'NewExpression') {
          context.report({
            node,
            messageId: 'noSingletonExport',
          });
        }
      },
    };
  },
}; 