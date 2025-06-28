/**
 * ESLint rule to prevent direct Prisma imports outside of the repository layer
 * This enforces the repository pattern and prevents data access logic from spreading
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow importing Prisma client outside of repository files',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noPrismaImport:
        'Direct Prisma imports are not allowed outside of src/repositories/. Use repository functions instead.',
    },
    schema: [],
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        const filename = context.getFilename();

        // Check if this is a Prisma import
        const isPrismaImport =
          importPath.includes('@/lib/prisma') ||
          importPath.includes('../lib/prisma') ||
          importPath.includes('../../lib/prisma') ||
          importPath.includes('../../../lib/prisma') ||
          importPath === '@prisma/client';

        if (!isPrismaImport) return;

        // Allow Prisma imports in repository files
        if (
          filename.includes('/repositories/') ||
          filename.includes('\\repositories\\')
        ) {
          return;
        }

        // Allow in the prisma.ts file itself
        if (
          filename.endsWith('lib/prisma.ts') ||
          filename.endsWith('lib\\prisma.ts')
        ) {
          return;
        }

        // Allow in test files for mocking
        if (filename.includes('.test.') || filename.includes('.spec.')) {
          return;
        }

        // Check for specific imports that indicate direct DB access
        const hasDirectDbAccess = node.specifiers.some(spec => {
          if (spec.type === 'ImportSpecifier') {
            return (
              spec.imported.name === 'prisma' ||
              spec.imported.name === 'getPrismaClient'
            );
          }
          return false;
        });

        if (hasDirectDbAccess || importPath.includes('@/lib/prisma')) {
          context.report({
            node,
            messageId: 'noPrismaImport',
          });
        }
      },
    };
  },
};
