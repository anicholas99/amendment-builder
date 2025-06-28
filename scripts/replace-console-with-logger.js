#!/usr/bin/env node
/*
 * Quick-and-dirty repository-wide console→logger migration.
 *
 *  1. Replaces occurrences of console.log/console.warn/console.error with logger.* in TS/TSX files.
 *  2. Injects `import { logger } from '@/lib/monitoring/logger';` at file top if missing after replacement.
 *
 *  Usage:  node scripts/replace-console-with-logger.js [rootDir]
 *          (defaults to ./src)
 */

const { promises: fs } = require('fs');
const path = require('path');

const root = path.resolve(process.argv[2] || 'src');
const loggerImportLine = "import { logger } from '@/lib/monitoring/logger';";

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git'].includes(entry.name)) continue;
      yield* walk(res);
    } else if (res.endsWith('.ts') || res.endsWith('.tsx')) {
      yield res;
    }
  }
}

(async () => {
  let processed = 0;
  for await (const file of walk(root)) {
    const src = await fs.readFile(file, 'utf8');
    if (!/console\.(log|warn|error)\s*\(/.test(src)) continue;

    const replaced = src
      .replace(/console\.log\s*\(/g, 'logger.log(')
      .replace(/console\.warn\s*\(/g, 'logger.warn(')
      .replace(/console\.error\s*\(/g, 'logger.error(');

    let final = replaced;
    if (!replaced.includes('logger')) continue; // nothing replaced

    if (!replaced.includes('@/lib/monitoring/logger')) {
      // naïvely insert after first import or at top
      const importMatch = replaced.match(/import[^;]+;/);
      if (importMatch) {
        final = replaced.replace(
          importMatch[0],
          `${importMatch[0]}\n${loggerImportLine}`
        );
      } else {
        final = `${loggerImportLine}\n${replaced}`;
      }
    }

    await fs.writeFile(file, final, 'utf8');
    processed += 1;
  }
  console.log(`console→logger migration complete. Updated ${processed} files.`);
})();
