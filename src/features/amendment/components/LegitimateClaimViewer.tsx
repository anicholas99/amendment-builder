/**
 * LegitimateClaimViewer - Professional claim display for final documents
 * 
 * Shows claims in clean, USPTO-compliant format with proper amendment formatting:
 * - Deletions: strikethrough for >5 chars, [[...]] for ≤5 chars per 37 CFR 1.121(c)
 * - Additions: underlined  
 * - Status indicators: (Currently Amended), (Previously Presented), (New), (Cancelled)
 * Suitable for official document previews and exports
 */

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface LegitimateClaimViewerProps {
  claimNumber: string;
  amendedText: string;
  originalText?: string;
  status?: 'CURRENTLY_AMENDED' | 'PREVIOUSLY_PRESENTED' | 'NEW' | 'CANCELLED';
  className?: string;
}

const STATUS_PREFIX = {
  CURRENTLY_AMENDED: '(Currently Amended)',
  PREVIOUSLY_PRESENTED: '(Previously Presented)',
  NEW: '(New)',
  CANCELLED: '(Cancelled)',
} as const;

// Enhanced diff algorithm that supports USPTO formatting
interface DiffPart {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
  usptoBrackets?: boolean; // Whether to use [[...]] instead of strikethrough
}

// Parse existing USPTO-formatted text to identify bracketed deletions
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

// Apply USPTO formatting rules based on character count
const shouldUseBrackets = (text: string): boolean => {
  // USPTO Rule: Use [[...]] for deletions of 5 or fewer characters
  // or when strikethrough might not be clearly visible
  const trimmedText = text.trim();
  
  // Character count rule
  if (trimmedText.length <= 5) {
    return true;
  }
  
  // Special cases where brackets are preferred even for longer text
  const isMainlyPunctuation = /^[^\w\s]*$/i.test(trimmedText);
  const isMainlyNumbers = /^\d+[^\w]*$/.test(trimmedText);
  const hasMostlySpaces = (trimmedText.match(/\s/g) || []).length > trimmedText.length / 2;
  
  return isMainlyPunctuation || isMainlyNumbers || hasMostlySpaces;
};

// Compute longest common subsequence to identify unchanged blocks
const computeLCS = (arr1: string[], arr2: string[]): string[] => {
  const m = arr1.length;
  const n = arr2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  // Reconstruct LCS
  const lcs: string[] = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (arr1[i - 1] === arr2[j - 1]) {
      lcs.unshift(arr1[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  
  return lcs;
};

// Enhanced word-based diff algorithm with USPTO formatting rules
const computeWordDiff = (original: string, amended: string): DiffPart[] => {
  if (!original && !amended) return [];
  if (!original) {
    return [{ type: 'added', text: amended }];
  }
  if (!amended) {
    return [{ type: 'removed', text: original, usptoBrackets: shouldUseBrackets(original) }];
  }

  // Parse any existing USPTO formatting in the texts
  const { cleanText: cleanOriginal } = parseUstoFormat(original);
  const { cleanText: cleanAmended } = parseUstoFormat(amended);

  // Split by words while preserving spaces
  const originalWords = cleanOriginal.split(/(\s+)/).filter(Boolean);
  const amendedWords = cleanAmended.split(/(\s+)/).filter(Boolean);
  
  // Find longest common subsequence to identify unchanged blocks
  const lcs = computeLCS(originalWords, amendedWords);
  
  // Build diff by grouping consecutive changes
  const diff: DiffPart[] = [];
  let origIndex = 0;
  let amendIndex = 0;
  let lcsIndex = 0;
  
  while (origIndex < originalWords.length || amendIndex < amendedWords.length) {
    // Check if we're at a point where text matches LCS
    if (lcsIndex < lcs.length && 
        origIndex < originalWords.length && 
        amendIndex < amendedWords.length &&
        originalWords[origIndex] === amendedWords[amendIndex] && 
        originalWords[origIndex] === lcs[lcsIndex]) {
      
      // Add unchanged text
      diff.push({ type: 'unchanged', text: originalWords[origIndex] });
      origIndex++;
      amendIndex++;
      lcsIndex++;
    } else {
      // Collect consecutive removed text
      let removedText = '';
      while (origIndex < originalWords.length && 
             (lcsIndex >= lcs.length || originalWords[origIndex] !== lcs[lcsIndex])) {
        removedText += originalWords[origIndex];
        origIndex++;
      }
      
      // Collect consecutive added text
      let addedText = '';
      while (amendIndex < amendedWords.length && 
             (lcsIndex >= lcs.length || amendedWords[amendIndex] !== lcs[lcsIndex])) {
        addedText += amendedWords[amendIndex];
        amendIndex++;
      }
      
      // Add grouped changes with USPTO formatting rules
      if (removedText) {
        const cleanRemovedText = removedText.trim();
        diff.push({ 
          type: 'removed', 
          text: cleanRemovedText,
          usptoBrackets: shouldUseBrackets(cleanRemovedText)
        });
      }
      if (addedText) {
        diff.push({ type: 'added', text: addedText.trim() });
      }
    }
  }
  
  return diff;
};

// Generate USPTO-compliant formatted text for display
const generateUstoText = (parts: DiffPart[]): string => {
  return parts.map(part => {
    switch (part.type) {
      case 'added':
        return part.text;
      case 'removed':
        return part.usptoBrackets ? `[[${part.text}]]` : part.text;
      case 'unchanged':
        return part.text;
      default:
        return part.text;
    }
  }).join('');
};

export const LegitimateClaimViewer: React.FC<LegitimateClaimViewerProps> = ({
  claimNumber,
  amendedText,
  originalText,
  status = 'CURRENTLY_AMENDED',
  className,
}) => {
  const prefix = STATUS_PREFIX[status];

  // Compute diff if original text is provided and claim was amended
  const diff = useMemo(() => {
    if (originalText && originalText !== amendedText && (status === 'CURRENTLY_AMENDED')) {
      return computeWordDiff(originalText, amendedText);
    }
    return null;
  }, [originalText, amendedText, status]);

  // Generate USPTO-compliant text for display
  const ustoFormattedText = useMemo(() => {
    if (diff) {
      return generateUstoText(diff);
    }
    return amendedText;
  }, [diff, amendedText]);

  // Render diff parts with proper USPTO formatting (for visual display with styling)
  const renderDiffText = (parts: DiffPart[]) => {
    return parts.map((part, index) => {
      switch (part.type) {
        case 'added':
          return (
            <span
              key={index}
              style={{ textDecoration: 'underline' }}
            >
              {part.text}
            </span>
          );
        case 'removed':
          if (part.usptoBrackets) {
            // Show bracketed deletions per USPTO rules
            return (
              <span key={index} style={{ fontWeight: 'bold' }}>
                [[{part.text}]]
              </span>
            );
          } else {
            // Show strikethrough for longer deletions
            return (
              <span
                key={index}
                style={{ textDecoration: 'line-through' }}
              >
                {part.text}
              </span>
            );
          }
        case 'unchanged':
          return <span key={index}>{part.text}</span>;
        default:
          return <span key={index}>{part.text}</span>;
      }
    });
  };

  return (
    <div className={cn('mb-6', className)}>
      <div className="text-black leading-relaxed">
        <p className="text-justify" style={{ lineHeight: '1.6' }}>
          <span className="font-bold">{claimNumber}. {prefix} </span>
          {diff ? (
            <span className="whitespace-pre-wrap">{renderDiffText(diff)}</span>
          ) : (
            <span className="whitespace-pre-wrap">{ustoFormattedText}</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default LegitimateClaimViewer; 