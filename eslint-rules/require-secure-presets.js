/**
 * ESLint rule to enforce SecurePresets usage over legacy middleware patterns
 * @fileoverview Ensures all API endpoints use SecurePresets for consistent security
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce SecurePresets usage instead of manual middleware composition',
      category: 'Security',
      recommended: true,
    },
    fixable: null,
    messages: {
      useLegacyPattern: 'Use SecurePresets instead of manual middleware composition (withAuth + withTenantGuard). See docs/security/SECUREPRESETS_PATTERN.md',
      useSecurePresets: 'API endpoints must use SecurePresets for consistent security. Available presets: tenantProtected, userPrivate, adminTenant, adminGlobal, public, browserAccessible',
    },
    schema: [],
  },

  create(context) {
    return {
      // Check export default statements
      ExportDefaultDeclaration(node) {
        const sourceCode = context.getSourceCode();
        const exportText = sourceCode.getText(node);

        // Check for legacy patterns
        if (exportText.includes('withAuth(') && exportText.includes('withTenantGuard(')) {
          context.report({
            node,
            messageId: 'useLegacyPattern',
          });
          return;
        }

        // Check for other manual middleware composition patterns
        if (exportText.includes('withAuth(') && !exportText.includes('SecurePresets')) {
          context.report({
            node,
            messageId: 'useSecurePresets',
          });
        }
      },

      // Check CallExpression for withAuth usage
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'withAuth' &&
          node.parent.type === 'ExportDefaultDeclaration'
        ) {
          // Check if it's part of SecurePresets
          const sourceCode = context.getSourceCode();
          const fileText = sourceCode.getText();
          
          if (!fileText.includes('SecurePresets')) {
            context.report({
              node,
              messageId: 'useSecurePresets',
            });
          }
        }
      },
    };
  },
}; 