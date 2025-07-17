/**
 * ESLint rule to prevent hardcoded hex colors
 * Forces use of theme tokens for consistency
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded hex colors - use theme tokens instead',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      hardcodedColor: 'Hardcoded hex color "{{color}}" found. Use theme tokens instead (e.g., "text.primary", "bg.subtle", "green.500")',
    },
  },

  create(context) {
    // Hex color pattern - matches #RGB, #RGBA, #RRGGBB, #RRGGBBAA
    const hexColorRegex = /#([0-9a-fA-F]{3,8})\b/;

    // Files/paths to ignore
    const ignorePaths = [
      'theme/',
      'colors.ts',
      'colors.js',
      '.test.',
      '.spec.',
      'seed/',
      'mock',
    ];

    return {
      Literal(node) {
        // Skip if in an ignored file
        const filename = context.getFilename();
        if (ignorePaths.some(path => filename.includes(path))) {
          return;
        }

        // Check if the literal is a string containing a hex color
        if (typeof node.value === 'string' && hexColorRegex.test(node.value)) {
          const match = node.value.match(hexColorRegex);
          if (match) {
            context.report({
              node,
              messageId: 'hardcodedColor',
              data: {
                color: match[0],
              },
            });
          }
        }
      },
      
      TemplateLiteral(node) {
        // Skip if in an ignored file
        const filename = context.getFilename();
        if (ignorePaths.some(path => filename.includes(path))) {
          return;
        }

        // Check template literals
        node.quasis.forEach(quasi => {
          if (hexColorRegex.test(quasi.value.raw)) {
            const match = quasi.value.raw.match(hexColorRegex);
            if (match) {
              context.report({
                node,
                messageId: 'hardcodedColor',
                data: {
                  color: match[0],
                },
              });
            }
          }
        });
      },
    };
  },
}; 