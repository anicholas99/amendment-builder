const fs = require('fs');
const path = require('path');

const hooksDir = path.join(__dirname, '..', 'src');
let found = 0;

function searchForOnError(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.includes('node_modules')) {
      searchForOnError(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf8');

      // Look for onError handlers in mutations, queries, or React Query hooks
      const patterns = [/onError\s*:/, /onError\s*\(/, /\.onError\s*\(/];

      for (const pattern of patterns) {
        if (pattern.test(content)) {
          const lines = content.split('\n');
          const matches = [];

          lines.forEach((line, i) => {
            if (pattern.test(line)) {
              matches.push({ lineNum: i + 1, line: line.trim() });
            }
          });

          if (matches.length > 0) {
            console.log(`\n${filePath.replace(/\\/g, '/')}`);
            matches.forEach(m => {
              console.log(`  Line ${m.lineNum}: ${m.line}`);
            });
            found++;
          }
          break;
        }
      }
    }
  }
}

console.log('Searching for onError handlers...\n');
searchForOnError(hooksDir);
console.log(`\nTotal files with onError: ${found}`);
