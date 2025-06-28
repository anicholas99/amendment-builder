#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

interface PrismaUsage {
  file: string;
  line: number;
  context: string;
  method: string;
  model?: string;
}

const API_DIR = path.join(process.cwd(), 'src', 'pages', 'api');

// Patterns to detect direct Prisma usage
const PRISMA_PATTERNS = [
  /prisma\.\w+\.(findUnique|findMany|findFirst|create|update|delete|upsert|count|aggregate|groupBy)/g,
  /await\s+prisma\.\w+\./g,
  /from\s+['"]@prisma\/client['"]/g,
];

// Repository imports that are OK
const REPOSITORY_PATTERNS = [
  /from\s+['"].*repositories.*/,
  /Repository\./,
  /repository\./,
];

function checkFile(filePath: string): PrismaUsage[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const usages: PrismaUsage[] = [];

    // Skip test files
    if (
      filePath.includes('__tests__') ||
      filePath.includes('.test.') ||
      filePath.includes('.spec.') ||
      filePath.includes('repositories') || // Repository files can use Prisma
      filePath.includes('seed') // Seed files can use Prisma
    ) {
      return usages;
    }

    // Check if this file imports from repositories (good pattern)
    const hasRepositoryImport = REPOSITORY_PATTERNS.some(pattern =>
      pattern.test(content)
    );

    lines.forEach((line, lineIndex) => {
      // Skip comments
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*')) {
        return;
      }

      // Check for Prisma usage
      PRISMA_PATTERNS.forEach(pattern => {
        const regex = new RegExp(pattern);
        let match;

        while ((match = regex.exec(line)) !== null) {
          // Extract the Prisma method and model
          const fullMatch = match[0];
          const methodMatch = fullMatch.match(/prisma\.(\w+)\.(\w+)/);

          if (methodMatch) {
            const [, model, method] = methodMatch;

            usages.push({
              file: filePath,
              line: lineIndex + 1,
              context: line.trim(),
              method: method,
              model: model,
            });
          } else if (fullMatch.includes('@prisma/client')) {
            // Just importing Prisma
            usages.push({
              file: filePath,
              line: lineIndex + 1,
              context: line.trim(),
              method: 'import',
            });
          }
        }
      });
    });

    // If file has repository imports and Prisma usage, it might be OK (mixed pattern)
    // But we'll still report it for review
    if (hasRepositoryImport && usages.length > 0) {
      usages.forEach(usage => {
        usage.context = '[Has Repository imports] ' + usage.context;
      });
    }

    return usages;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
}

function formatResults(usages: PrismaUsage[]): void {
  if (usages.length === 0) {
    console.log(
      '✅ All API routes follow the repository pattern! Clean architecture! 🏛️'
    );
    return;
  }

  console.log(
    `\n⚠️  Found ${usages.length} instances of direct Prisma usage in API routes:\n`
  );

  // Group by file
  const byFile = usages.reduce(
    (acc, usage) => {
      if (!acc[usage.file]) {
        acc[usage.file] = [];
      }
      acc[usage.file].push(usage);
      return acc;
    },
    {} as Record<string, PrismaUsage[]>
  );

  // Count by Prisma method
  const methodCounts: Record<string, number> = {};
  usages.forEach(usage => {
    methodCounts[usage.method] = (methodCounts[usage.method] || 0) + 1;
  });

  console.log('📊 Summary by Prisma method:');
  Object.entries(methodCounts)
    .sort(([, a], [, b]) => b - a)
    .forEach(([method, count]) => {
      console.log(`   - ${method}: ${count}`);
    });

  console.log(
    `\n📁 Files with direct Prisma usage: ${Object.keys(byFile).length}\n`
  );

  // Show details
  Object.entries(byFile).forEach(([file, fileUsages]) => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`📄 ${relativePath}`);

    // Group by model for better readability
    const byModel: Record<string, PrismaUsage[]> = {};
    fileUsages.forEach(usage => {
      const key = usage.model || 'other';
      if (!byModel[key]) {
        byModel[key] = [];
      }
      byModel[key].push(usage);
    });

    Object.entries(byModel).forEach(([model, modelUsages]) => {
      if (model !== 'other') {
        console.log(`   📦 Model: ${model}`);
      }
      modelUsages.forEach(usage => {
        console.log(`      Line ${usage.line}: ${usage.context}`);
      });
    });
    console.log('');
  });

  console.log('💡 How to fix - Implement Repository Pattern:');
  console.log('\n1️⃣  Create a repository:');
  console.log(`
// src/repositories/userRepository.ts
import { prisma } from '@/lib/db';
import type { User, Prisma } from '@prisma/client';

export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(data: Prisma.UserCreateInput): Promise<User> {
  return prisma.user.create({ data });
}

export async function updateUser(
  id: string, 
  data: Prisma.UserUpdateInput
): Promise<User> {
  return prisma.user.update({ where: { id }, data });
}
`);

  console.log('\n2️⃣  Use in API route:');
  console.log(`
// ❌ Before: Direct Prisma usage
import { prisma } from '@/lib/db';

export default async function handler(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.query.id }
  });
}

// ✅ After: Repository pattern
import { findUserById } from '@/repositories/userRepository';

export default async function handler(req, res) {
  const user = await findUserById(req.query.id);
}
`);

  console.log('\n📚 Benefits of Repository Pattern:');
  console.log(
    '   - **Separation of Concerns**: Business logic separated from data access'
  );
  console.log('   - **Testability**: Easy to mock repositories for unit tests');
  console.log(
    '   - **Reusability**: Same queries can be used across multiple endpoints'
  );
  console.log(
    '   - **Type Safety**: Repository functions provide clear interfaces'
  );
  console.log(
    '   - **Future-proofing**: Easy to switch ORMs or add caching later'
  );
}

async function main() {
  console.log('🔍 Auditing API routes for direct Prisma usage...\n');

  // Find all API route files
  const pattern = path.join(API_DIR, '**/*.{ts,tsx}').replace(/\\/g, '/');
  const files = glob.sync(pattern);

  console.log(`Found ${files.length} API route files\n`);

  const allUsages: PrismaUsage[] = [];

  for (const file of files) {
    const usages = checkFile(file);
    allUsages.push(...usages);
  }

  formatResults(allUsages);

  // Exit with error code if issues found
  process.exit(allUsages.length > 0 ? 1 : 0);
}

// Run the audit
main().catch(console.error);
