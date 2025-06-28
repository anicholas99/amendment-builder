#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const debugDir = path.join(process.cwd(), 'debug-outputs');

if (!fs.existsSync(debugDir)) {
  console.log(
    '❌ No debug-outputs directory found. Process an invention first to generate debug files.'
  );
  process.exit(1);
}

const files = fs
  .readdirSync(debugDir)
  .filter(
    file => file.startsWith('gpt-invention-response-') && file.endsWith('.json')
  )
  .map(file => ({
    name: file,
    path: path.join(debugDir, file),
    mtime: fs.statSync(path.join(debugDir, file)).mtime,
  }))
  .sort((a, b) => b.mtime - a.mtime);

if (files.length === 0) {
  console.log(
    '❌ No GPT response files found. Process an invention first to generate debug files.'
  );
  process.exit(1);
}

const latestFile = files[0];
console.log(`📄 Latest GPT response: ${latestFile.name}`);
console.log(`📅 Created: ${latestFile.mtime.toLocaleString()}`);
console.log('═'.repeat(80));

try {
  const content = JSON.parse(fs.readFileSync(latestFile.path, 'utf8'));

  console.log('\n🔍 METADATA:');
  console.log(`  Timestamp: ${content.timestamp}`);
  console.log(`  Input Length: ${content.inventionDescriptionLength} chars`);
  console.log(`  Prompt Length: ${content.promptLength} chars`);
  console.log(`  Response Length: ${content.responseLength} chars`);
  if (content.usage) {
    console.log(`  Tokens Used: ${content.usage.total_tokens || 'N/A'}`);
  }

  console.log('\n📝 INVENTION DESCRIPTION:');
  console.log('─'.repeat(40));
  console.log(content.inventionDescription);

  console.log('\n🤖 GPT RESPONSE:');
  console.log('─'.repeat(40));

  // Try to parse and pretty-print the JSON response
  try {
    const parsedResponse = JSON.parse(content.rawResponse);
    console.log(JSON.stringify(parsedResponse, null, 2));
  } catch (parseError) {
    console.log('❌ Raw response (invalid JSON):');
    console.log(content.rawResponse);
  }

  console.log('\n═'.repeat(80));
  console.log(`📁 Full file path: ${latestFile.path}`);

  if (files.length > 1) {
    console.log(`\n📊 Found ${files.length} total debug files:`);
    files.slice(0, 5).forEach((file, index) => {
      console.log(
        `  ${index + 1}. ${file.name} (${file.mtime.toLocaleString()})`
      );
    });
    if (files.length > 5) {
      console.log(`  ... and ${files.length - 5} more`);
    }
  }
} catch (error) {
  console.error('❌ Error reading file:', error.message);
  console.log(`📁 File path: ${latestFile.path}`);
}
