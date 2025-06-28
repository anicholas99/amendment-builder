import { promises as fs } from 'fs';
import path from 'path';

interface EnvUsage {
  file: string;
  line: number;
  code: string;
  variable: string;
  hasDefault: boolean;
  defaultValue?: string;
}

async function analyzeEnvUsage(): Promise<void> {
  console.log('🔐 ENVIRONMENT VARIABLE USAGE VERIFICATION\n');
  console.log(
    'Scanning for process.env patterns that should use env-utils.ts...\n'
  );

  const srcDir = path.join(process.cwd(), 'src');
  const usages: EnvUsage[] = [];
  let totalFiles = 0;
  let filesWithEnvUsage = 0;

  // Check if env-utils.ts exists
  const envUtilsPath = path.join(srcDir, 'utils', 'env-utils.ts');
  const hasEnvUtils = await fs
    .access(envUtilsPath)
    .then(() => true)
    .catch(() => false);

  async function scanDirectory(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (
        entry.isDirectory() &&
        !entry.name.startsWith('.') &&
        entry.name !== 'node_modules'
      ) {
        await scanDirectory(fullPath);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
        !entry.name.includes('.test.') &&
        !entry.name.includes('.spec.')
      ) {
        await analyzeFile(fullPath);
      }
    }
  }

  async function analyzeFile(filePath: string): Promise<void> {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = path.relative(process.cwd(), filePath);

    // Skip env-utils.ts itself
    if (filePath.endsWith('env-utils.ts')) {
      return;
    }

    totalFiles++;
    let hasEnvUsage = false;

    // Patterns to find process.env usage
    const envPatterns = [
      // process.env.VAR || 'default'
      /process\.env\.(\w+)\s*\|\|\s*['"`]([^'"`]+)['"`]/g,
      // process.env.VAR || defaultValue
      /process\.env\.(\w+)\s*\|\|\s*(\w+)/g,
      // process.env.VAR
      /process\.env\.(\w+)(?!\s*\|\|)/g,
      // process.env['VAR']
      /process\.env\[['"`](\w+)['"`]\]/g,
    ];

    lines.forEach((line, index) => {
      // Skip comments
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
        return;
      }

      envPatterns.forEach((pattern, patternIndex) => {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          hasEnvUsage = true;

          const variable = match[1];
          const hasDefault = patternIndex < 2; // First two patterns have defaults
          const defaultValue = hasDefault ? match[2] : undefined;

          // Skip if it's a type definition or interface
          if (
            line.includes('process.env') &&
            (line.includes('interface') ||
              line.includes('type ') ||
              line.includes(': {'))
          ) {
            continue;
          }

          usages.push({
            file: relativePath,
            line: index + 1,
            code: line.trim(),
            variable,
            hasDefault,
            defaultValue,
          });
        }
      });
    });

    if (hasEnvUsage) {
      filesWithEnvUsage++;
    }
  }

  await scanDirectory(srcDir);

  // Group by variable name
  const variableGroups = usages.reduce(
    (acc, usage) => {
      if (!acc[usage.variable]) {
        acc[usage.variable] = [];
      }
      acc[usage.variable].push(usage);
      return acc;
    },
    {} as Record<string, EnvUsage[]>
  );

  // Display results
  console.log('📊 VERIFICATION RESULTS:');
  console.log('═'.repeat(60));
  console.log(`Total files scanned: ${totalFiles}`);
  console.log(`Files with process.env usage: ${filesWithEnvUsage}`);
  console.log(`Total process.env references: ${usages.length}`);
  console.log(
    `Unique environment variables: ${Object.keys(variableGroups).length}`
  );
  console.log(`env-utils.ts exists: ${hasEnvUtils ? '✅ Yes' : '❌ No'}`);
  console.log('═'.repeat(60));

  if (usages.length > 0) {
    console.log('\n📋 ENVIRONMENT VARIABLES FOUND:\n');

    // Sort by frequency of use
    const sortedVars = Object.entries(variableGroups).sort(
      ([, a], [, b]) => b.length - a.length
    );

    sortedVars.forEach(([variable, usageList]) => {
      console.log(
        `\n${variable} (${usageList.length} usage${usageList.length > 1 ? 's' : ''})`
      );

      // Show unique default values
      const defaults = Array.from(
        new Set(usageList.filter(u => u.hasDefault).map(u => u.defaultValue))
      );

      if (defaults.length > 0) {
        console.log(`  Default values: ${defaults.join(', ')}`);
      } else {
        console.log(`  ⚠️  No default value provided`);
      }

      // Show first few usages
      usageList.slice(0, 3).forEach(usage => {
        console.log(`  ${usage.file}:${usage.line}`);
        console.log(`    ${usage.code}`);
      });

      if (usageList.length > 3) {
        console.log(`  ... and ${usageList.length - 3} more`);
      }
    });

    if (!hasEnvUtils) {
      console.log('\n🔧 RECOMMENDED: CREATE env-utils.ts\n');
      console.log('Create src/utils/env-utils.ts with:');
      console.log(`
// src/utils/env-utils.ts
import { z } from 'zod';

// Define environment schema
const envSchema = z.object({
  // Required variables
  DATABASE_URL: z.string(),
  NEXTAUTH_SECRET: z.string(),
  
  // Optional with defaults
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  
  // Add your variables here...
${sortedVars
  .slice(0, 5)
  .map(([variable, usageList]) => {
    const defaults = usageList
      .filter(u => u.hasDefault)
      .map(u => u.defaultValue);
    const defaultValue = defaults[0];
    if (defaultValue) {
      return `  ${variable}: z.string().default('${defaultValue}'),`;
    } else {
      return `  ${variable}: z.string(),`;
    }
  })
  .join('\n')}
});

// Parse and validate
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;

// Type-safe access
export type Env = z.infer<typeof envSchema>;
`);

      console.log('\n📝 USAGE EXAMPLE:');
      console.log(`
// ❌ Before: Direct process.env access
const apiKey = process.env.API_KEY || 'default-key';

// ✅ After: Type-safe env access
import { env } from '@/utils/env-utils';
const apiKey = env.API_KEY; // Type-safe, validated
`);
    }

    console.log('\n🎯 BENEFITS OF CENTRALIZED ENV HANDLING:');
    console.log('1. **Type Safety**: Compile-time checking of env var names');
    console.log(
      '2. **Validation**: Runtime validation with clear error messages'
    );
    console.log('3. **Defaults**: Centralized default values');
    console.log(
      '4. **Documentation**: Self-documenting environment requirements'
    );
    console.log('5. **Security**: Fail fast on missing required variables');
  } else {
    console.log('\n✅ NO DIRECT PROCESS.ENV USAGE FOUND');
    console.log('All environment variables are properly managed');
  }
}

// Run the analysis
analyzeEnvUsage().catch(console.error);
