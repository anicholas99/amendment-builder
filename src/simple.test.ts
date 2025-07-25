/**
 * Simple test for USPTO strikethrough functionality
 */

// Mock the functions from ClaimDiffViewer for testing
const shouldUseBrackets = (text: string): boolean => {
  const trimmedText = text.trim();
  
  // Character count rule - use brackets for 5 or fewer characters
  if (trimmedText.length <= 5) {
    return true;
  }
  
  // Special cases where brackets are preferred
  const isMainlyPunctuation = /^[^\w\s]*$/i.test(trimmedText);
  const isMainlyNumbers = /^\d+[^\w]*$/.test(trimmedText);
  const hasMostlySpaces = (trimmedText.match(/\s/g) || []).length > trimmedText.length / 2;
  
  return isMainlyPunctuation || isMainlyNumbers || hasMostlySpaces;
};

const parseUstoFormat = (text: string): { cleanText: string; deletions: Array<{ text: string; position: number }> } => {
  const deletions: Array<{ text: string; position: number }> = [];
  let cleanText = text;
  let offset = 0;
  
  // Find all [[...]] patterns
  const bracketPattern = /\[\[([^\]]*)\]\]/g;
  let match;
  
  while ((match = bracketPattern.exec(text)) !== null) {
    const deletedText = match[1];
    const position = match.index - offset;
    
    deletions.push({
      text: deletedText,
      position: position,
    });
    
    // Remove the bracketed text from clean text
    cleanText = cleanText.replace(match[0], '');
    offset += match[0].length;
  }
  
  return { cleanText, deletions };
};

// Test cases
console.log('🧪 Testing USPTO strikethrough formatting...\n');

// Test 1: Short deletions should use brackets
console.log('Test 1: Short deletions (≤5 characters)');
console.log('shouldUseBrackets("the"):', shouldUseBrackets("the")); // should be true
console.log('shouldUseBrackets("a"):', shouldUseBrackets("a")); // should be true
console.log('shouldUseBrackets("12345"):', shouldUseBrackets("12345")); // should be true
console.log('');

// Test 2: Long deletions should use strikethrough
console.log('Test 2: Long deletions (>5 characters)');
console.log('shouldUseBrackets("configured"):', shouldUseBrackets("configured")); // should be false
console.log('shouldUseBrackets("substantially"):', shouldUseBrackets("substantially")); // should be false
console.log('');

// Test 3: Special cases should use brackets
console.log('Test 3: Special cases (punctuation, numbers)');
console.log('shouldUseBrackets("..."):', shouldUseBrackets("...")); // should be true (punctuation)
console.log('shouldUseBrackets("123"):', shouldUseBrackets("123")); // should be true (numbers)
console.log('shouldUseBrackets(","):', shouldUseBrackets(",")); // should be true (punctuation)
console.log('');

// Test 4: Parse existing USPTO format
console.log('Test 4: Parsing existing [[...]] format');
const testText = "A system configured to [[substantially]] communicate with [[the]] database";
const parsed = parseUstoFormat(testText);
console.log('Original:', testText);
console.log('Clean text:', parsed.cleanText);
console.log('Deletions found:', parsed.deletions);
console.log('');

// Test 5: Complex case with multiple brackets
console.log('Test 5: Complex parsing');
const complexText = "The [[old]] method comprising [[a]] step of [[substantially]] processing data";
const complexParsed = parseUstoFormat(complexText);
console.log('Original:', complexText);
console.log('Clean text:', complexParsed.cleanText);
console.log('Deletions found:', complexParsed.deletions);

console.log('\n✅ USPTO formatting tests complete!');
