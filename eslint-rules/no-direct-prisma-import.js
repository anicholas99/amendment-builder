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
        'Direct Prisma imports are not allowed outside of src/repositories/. Use repository functions instead. See db-access-consistency.mdc',
    },
    schema: [],
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        const filename = context.getFilename();

        // Check if this is a Prisma import (more comprehensive patterns)
        const isPrismaImport =
          importPath.includes('@/lib/prisma') ||
          importPath.includes('../lib/prisma') ||
          importPath.includes('../../lib/prisma') ||
          importPath.includes('../../../lib/prisma') ||
          importPath.includes('lib/prisma') ||
          importPath === '@prisma/client' ||
          importPath.startsWith('@prisma/') ||
          importPath.includes('prisma');

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

        // Allow in database seed files
        if (
          filename.includes('/seed/') ||
          filename.includes('\\seed\\') ||
          filename.includes('seeder')
        ) {
          return;
        }

        // Allow in test files for mocking
        if (filename.includes('.test.') || filename.includes('.spec.')) {
          return;
        }

        // Allow in migration files
        if (
          filename.includes('/migrations/') ||
          filename.includes('\\migrations\\')
        ) {
          return;
        }

        // Allow in scripts directory (for maintenance/migration scripts)
        if (
          filename.includes('/scripts/') ||
          filename.includes('\\scripts\\')
        ) {
          return;
        }

        // Allow in lib/db directory (database utilities)
        if (
          filename.includes('/lib/db/') ||
          filename.includes('\\lib\\db\\')
        ) {
          return;
        }

        // Report violation
        context.report({
          node,
          messageId: 'noPrismaImport',
        });
      },
    };
  },
};
