/**
 * ESLint rule to prevent mixed exports in React component files
 * 
 * This rule ensures React components (.tsx files) only export React-related code
 * to maintain Fast Refresh boundaries and prevent full page reloads during development.
 * 
 * Allowed in .tsx files:
 * - React components (functions starting with uppercase)
 * - Custom hooks (functions starting with 'use')
 * - Type/interface exports
 * 
 * Not allowed in .tsx files:
 * - Constants, enums, utility functions, Zod schemas, etc.
 * - These should be moved to adjacent .ts files
 */

// Problematic imports that should be flagged
const PROBLEMATIC_IMPORTS = [
  '@/config/environment',
  '@/lib/constants',
  '@/lib/monitoring/logger',
  '@/lib/logger',
  '@/monitoring/logger',
  '../lib/monitoring/logger',
  '../../lib/monitoring/logger',
  '../../../lib/monitoring/logger',
];

// Allowed imports in React components
const ALLOWED_IMPORTS = [
  '@/config/environment.client',
  '@/utils/clientLogger',
];

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent non-React exports in component files to maintain Fast Refresh boundaries',
      category: 'Best Practices',
    },
    messages: {
      noMixedExports: 'File "{{filename}}" exports non-React code: {{exportName}}. Move {{type}} to a separate .ts file (e.g., {{suggestedFile}}) to prevent full page reloads during development.',
      problematicImport: 'Importing from "{{source}}" in a React component can cause Fast Refresh to fail. Use "{{suggestion}}" instead.',
    },
    fixable: null,
    schema: [],
  },

  create(context) {
    const filename = context.getFilename();
    
    // Only apply to .tsx files
    if (!filename.endsWith('.tsx')) {
      return {};
    }

    // Skip test files and storybook files
    if (filename.includes('.test.') || filename.includes('.spec.') || filename.includes('.stories.')) {
      return {};
    }

    // Extract base name for suggestions
    const baseFilename = filename.replace(/\.tsx$/, '');
    const parts = baseFilename.split('/');
    const componentName = parts[parts.length - 1];

    return {
      // Check imports that can break Fast Refresh
      ImportDeclaration(node) {
        const source = node.source.value;
        
        // Skip if this is an allowed import
        if (ALLOWED_IMPORTS.some(pattern => source === pattern || source.includes(pattern))) {
          return;
        }
        
        // Check if this is a problematic import
        if (PROBLEMATIC_IMPORTS.some(pattern => source.includes(pattern))) {
          // Special message for logger imports
          if (source.includes('logger')) {
            context.report({
              node,
              message: `React components should not import logger from '${source}'. Use 'import { logger } from "@/utils/clientLogger"' instead for client-safe logging.`,
            });
          } else {
            context.report({
              node,
              message: `React components should not import from '${source}' as it may break Fast Refresh. Use a client-specific module instead.`,
            });
          }
        }
      },
      
      ExportNamedDeclaration(node) {
        // Check each export
        if (node.declaration) {
          checkDeclaration(node.declaration, context, componentName);
        }
        
        // Handle export { foo, bar }
        if (node.specifiers) {
          node.specifiers.forEach(spec => {
            const exportName = spec.exported.name;
            if (!isAllowedExport(exportName)) {
              context.report({
                node: spec,
                messageId: 'noMixedExports',
                data: {
                  filename: filename.split('/').pop(),
                  exportName,
                  type: 'export',
                  suggestedFile: `${componentName}.constants.ts or ${componentName}.utils.ts`,
                },
              });
            }
          });
        }
      },

      ExportDefaultDeclaration(node) {
        // Default exports are typically the component itself, so they're allowed
      },
    };
  },
};

function checkDeclaration(declaration, context, componentName) {
  switch (declaration.type) {
    case 'VariableDeclaration':
      declaration.declarations.forEach(decl => {
        if (decl.id && decl.id.name) {
          const name = decl.id.name;
          if (!isAllowedExport(name)) {
            // Determine the type of export
            const type = detectExportType(decl.init);
            const suggestedFile = getSuggestedFilename(componentName, type);
            
            context.report({
              node: decl,
              messageId: 'noMixedExports',
              data: {
                filename: context.getFilename().split('/').pop(),
                exportName: name,
                type,
                suggestedFile,
              },
            });
          }
        }
      });
      break;
      
    case 'FunctionDeclaration':
      if (declaration.id && declaration.id.name) {
        const name = declaration.id.name;
        if (!isAllowedExport(name)) {
          context.report({
            node: declaration,
            messageId: 'noMixedExports',
            data: {
              filename: context.getFilename().split('/').pop(),
              exportName: name,
              type: 'function',
              suggestedFile: `${componentName}.utils.ts`,
            },
          });
        }
      }
      break;
      
    case 'TSEnumDeclaration':
      context.report({
        node: declaration,
        messageId: 'noMixedExports',
        data: {
          filename: context.getFilename().split('/').pop(),
          exportName: declaration.id.name,
          type: 'enum',
          suggestedFile: `${componentName}.types.ts`,
        },
      });
      break;
  }
}

function isAllowedExport(name) {
  // React components start with uppercase
  if (/^[A-Z]/.test(name)) {
    return true;
  }
  
  // Hooks start with 'use'
  if (name.startsWith('use')) {
    return true;
  }
  
  // Allow type exports (TypeScript will handle these)
  // Note: This is a simplified check - in practice, we'd need to check the actual declaration
  if (name.endsWith('Props') || name.endsWith('Type') || name.endsWith('Interface')) {
    return true;
  }
  
  return false;
}

function detectExportType(node) {
  if (!node) return 'value';
  
  switch (node.type) {
    case 'ObjectExpression':
      // Check if it might be a Zod schema
      const sourceCode = node.parent && node.parent.parent && 
                        node.parent.parent.parent && 
                        node.parent.parent.parent.tokens;
      if (sourceCode && sourceCode.some(token => token.value === 'z')) {
        return 'schema';
      }
      return 'constant object';
      
    case 'ArrayExpression':
      return 'constant array';
      
    case 'Literal':
      return 'constant';
      
    case 'CallExpression':
      // Could be a Zod schema or other factory function
      if (node.callee && node.callee.object && node.callee.object.name === 'z') {
        return 'Zod schema';
      }
      return 'value';
      
    default:
      return 'value';
  }
}

function getSuggestedFilename(componentName, type) {
  switch (type) {
    case 'Zod schema':
    case 'schema':
      return `${componentName}.schemas.ts`;
    case 'constant':
    case 'constant object':
    case 'constant array':
      return `${componentName}.constants.ts`;
    case 'enum':
      return `${componentName}.types.ts`;
    case 'function':
      return `${componentName}.utils.ts`;
    default:
      return `${componentName}.helpers.ts`;
  }
} 