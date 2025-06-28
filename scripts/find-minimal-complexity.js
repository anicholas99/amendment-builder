const fs = require('fs');

// Read the smart audit report
const report = JSON.parse(
  fs.readFileSync('smart-chakra-audit-report.json', 'utf8')
);

// Components that are relatively simple to replace
const SEMI_COMPLEX = [
  'VStack',
  'HStack',
  'Divider',
  'Spinner',
  'Container',
  'Badge',
];

// Find files with minimal complexity
const minimalComplexity = report.complex
  .map(file => {
    // Count issues
    const complexityScore = {
      file: file.file,
      imports: file.imports,
      reasons: file.reasons,
      score: 0,
      issues: [],
    };

    // Check each reason
    file.reasons.forEach(reason => {
      if (reason.includes('uses complex hooks')) {
        complexityScore.score += 10;
        complexityScore.issues.push('complex hooks');
      }
      if (reason.includes('uses unsafe props')) {
        complexityScore.score += 5;
        complexityScore.issues.push('unsafe props');
      }
      if (reason.includes('uses complex components')) {
        // Extract the components
        const match = reason.match(/uses complex components: (.+)/);
        if (match) {
          const components = match[1].split(', ');
          const reallyComplex = components.filter(
            c => !SEMI_COMPLEX.includes(c)
          );
          if (reallyComplex.length === 0) {
            // Only has semi-complex components
            complexityScore.score += 2;
            complexityScore.issues.push(
              `semi-complex: ${components.join(', ')}`
            );
          } else {
            complexityScore.score += 10;
            complexityScore.issues.push(`complex: ${reallyComplex.join(', ')}`);
          }
        }
      }
      if (reason.includes('uses non-basic components')) {
        const match = reason.match(/uses non-basic components: (.+)/);
        if (match) {
          const components = match[1].split(', ');
          const nonBasic = components.filter(c => !SEMI_COMPLEX.includes(c));
          if (nonBasic.length === 0) {
            complexityScore.score += 2;
            complexityScore.issues.push(
              `semi-complex: ${components.join(', ')}`
            );
          } else {
            complexityScore.score += 8;
            complexityScore.issues.push(`non-basic: ${nonBasic.join(', ')}`);
          }
        }
      }
    });

    return complexityScore;
  })
  .sort((a, b) => a.score - b.score);

console.log('\n🔍 FILES WITH MINIMAL COMPLEXITY');
console.log('================================\n');

// Show files with score <= 5
const easiest = minimalComplexity.filter(f => f.score <= 5);

if (easiest.length === 0) {
  console.log('No files with minimal complexity found.\n');
} else {
  console.log('Files that might be easier to migrate:\n');
  easiest.forEach((file, index) => {
    console.log(`${index + 1}. ${file.file} (score: ${file.score})`);
    console.log(`   Imports: ${file.imports.join(', ')}`);
    console.log(`   Issues: ${file.issues.join('; ')}`);
    console.log('');
  });
}

// Show next tier (score 6-10)
const moderate = minimalComplexity.filter(f => f.score > 5 && f.score <= 10);
console.log('\nMODERATE COMPLEXITY (score 6-10):');
if (moderate.length > 0) {
  moderate.slice(0, 10).forEach(file => {
    console.log(`- ${file.file} (score: ${file.score})`);
    console.log(`  Issues: ${file.issues.join('; ')}`);
  });
}

// Summary
console.log('\n📊 COMPLEXITY SUMMARY:');
console.log(`Minimal (score ≤5): ${easiest.length} files`);
console.log(`Moderate (score 6-10): ${moderate.length} files`);
console.log(
  `Complex (score >10): ${minimalComplexity.filter(f => f.score > 10).length} files`
);
