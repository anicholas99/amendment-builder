/**
 * ESLint rule to prevent magic time values and enforce use of time constants
 * This improves maintainability and makes time values consistent across the codebase
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow hardcoded time values in milliseconds',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    messages: {
      noMagicTime:
        'Use time constants from @/constants/time instead of hardcoded time values. Found: {{value}}',
      useTimeConstant: 'Replace with {{suggestion}} from @/constants/time',
    },
    schema: [],
  },
  create(context) {
    // Common time patterns in milliseconds
    const timePatterns = [
      { pattern: /1000/, suggestion: 'SECOND' },
      { pattern: /60\s*\*\s*1000/, suggestion: 'MINUTE' },
      { pattern: /60\s*\*\s*60\s*\*\s*1000/, suggestion: 'HOUR' },
      { pattern: /24\s*\*\s*60\s*\*\s*60\s*\*\s*1000/, suggestion: 'DAY' },
      { pattern: /5\s*\*\s*60\s*\*\s*1000/, suggestion: 'STALE_TIME.DEFAULT' },
      { pattern: /15\s*\*\s*60\s*\*\s*1000/, suggestion: 'STALE_TIME.LONG or RATE_LIMIT_WINDOW.DEFAULT' },
      { pattern: /30\s*\*\s*1000/, suggestion: 'STALE_TIME.SHORT' },
      { pattern: /2\s*\*\s*60\s*\*\s*1000/, suggestion: 'STALE_TIME.MEDIUM' },
    ];

    return {
      // Check binary expressions like 60 * 1000
      BinaryExpression(node) {
        const sourceCode = context.getSourceCode();
        const nodeText = sourceCode.getText(node);
        
        // Skip if this is inside a constants file
        const filename = context.getFilename();
        if (filename.includes('/constants/') || filename.includes('\\constants\\')) {
          return;
        }

        // Check each time pattern
        for (const { pattern, suggestion } of timePatterns) {
          if (pattern.test(nodeText)) {
            context.report({
              node,
              messageId: 'noMagicTime',
              data: { value: nodeText },
              suggest: [
                {
                  messageId: 'useTimeConstant',
                  data: { suggestion },
                  fix(fixer) {
                    return fixer.replaceText(node, suggestion);
                  },
                },
              ],
            });
            break;
          }
        }
      },

      // Check literal values in specific contexts
      Literal(node) {
        // Skip if not a number
        if (typeof node.value !== 'number') return;
        
        // Skip if this is inside a constants file
        const filename = context.getFilename();
        if (filename.includes('/constants/') || filename.includes('\\constants\\')) {
          return;
        }

        // Check if this is likely a time value based on context
        const parent = node.parent;
        if (parent && parent.type === 'Property') {
          const propertyName = parent.key.name || parent.key.value;
          
          // Common time-related property names
          const timeProperties = [
            'staleTime',
            'gcTime',
            'cacheTime',
            'timeout',
            'windowMs',
            'maxAge',
            'ttl',
            'expiry',
            'expires',
            'duration',
          ];

          if (timeProperties.includes(propertyName)) {
            // Check for common time values
            const timeValues = {
              1000: 'SECOND',
              30000: 'STALE_TIME.SHORT',
              60000: 'MINUTE',
              120000: 'STALE_TIME.MEDIUM',
              300000: 'STALE_TIME.DEFAULT',
              900000: 'STALE_TIME.LONG',
              3600000: 'HOUR',
              86400000: 'DAY',
            };

            if (timeValues[node.value]) {
              context.report({
                node,
                messageId: 'noMagicTime',
                data: { value: node.value },
                suggest: [
                  {
                    messageId: 'useTimeConstant',
                    data: { suggestion: timeValues[node.value] },
                    fix(fixer) {
                      return fixer.replaceText(node, timeValues[node.value]);
                    },
                  },
                ],
              });
            }
          }
        }
      },
    };
  },
}; 