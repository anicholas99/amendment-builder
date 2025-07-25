/**
 * ClaimDiffViewer - USPTO-compliant claim amendment display
 * 
 * Shows original vs amended claim text with proper formatting:
 * - Deletions: strikethrough for >5 chars, [[...]] for ≤5 chars per 37 CFR 1.121(c)
 * - Additions: underlined
 * - Clean side-by-side or inline comparison
 * - USPTO-compliant format toggle
 */

import React, { useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Copy, FileText, Scale, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToastWrapper';

// Enhanced diff algorithm that supports USPTO formatting
interface DiffPart {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
  usptoBrackets?: boolean; // Whether to use [[...]] instead of strikethrough
}

interface ClaimDiffViewerProps {
  claimNumber: string;
  originalText: string;
  amendedText: string;
  status?: 'CURRENTLY_AMENDED' | 'PREVIOUSLY_PRESENTED' | 'NEW' | 'CANCELLED';
  showSideBySide?: boolean;
  className?: string;
}

const STATUS_CONFIG = {
  CURRENTLY_AMENDED: {
    label: 'Currently Amended',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    prefix: '(Currently Amended)',
  },
  PREVIOUSLY_PRESENTED: {
    label: 'Previously Presented',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    prefix: '(Previously Presented)',
  },
  NEW: {
    label: 'New',
    color: 'bg-green-100 text-green-700 border-green-200',
    prefix: '(New)',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700 border-red-200',
    prefix: '(Cancelled)',
  },
} as const;

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

  // Use dynamic programming to find the longest common subsequence
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

// Helper function to compute Longest Common Subsequence
const computeLCS = (arr1: string[], arr2: string[]): string[] => {
  const m = arr1.length;
  const n = arr2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  // Build LCS table
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

// Generate USPTO-compliant formatted text
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

const ClaimDiffViewer: React.FC<ClaimDiffViewerProps> = ({
  claimNumber,
  originalText,
  amendedText,
  status = 'CURRENTLY_AMENDED',
  showSideBySide = false,
  className,
}) => {
  const toast = useToast();
  const [showOriginalOnly, setShowOriginalOnly] = React.useState(false);
  const [ustoCompliantFormat, setUstoCompliantFormat] = React.useState(true);
  
  const statusConfig = STATUS_CONFIG[status];
  const diff = useMemo(() => computeWordDiff(originalText, amendedText), [originalText, amendedText]);
  
  // Generate USPTO-compliant text for display and copying
  const ustoFormattedText = useMemo(() => generateUstoText(diff), [diff]);
  
  // Render diff parts with proper formatting
  const renderDiffText = (parts: DiffPart[], useUstoFormat: boolean = false) => {
    return parts.map((part, index) => {
      switch (part.type) {
        case 'added':
          return (
            <span
              key={index}
              className="underline decoration-2 decoration-blue-500 bg-blue-50 px-1 rounded"
              title="Added text"
            >
              {part.text}
            </span>
          );
        case 'removed':
          if (useUstoFormat && part.usptoBrackets) {
            // Show bracketed deletions per USPTO rules
            return (
              <span
                key={index}
                className="text-red-600 bg-red-50 px-1 rounded font-semibold"
                title="Deleted text (≤5 characters per USPTO rules)"
              >
                [[{part.text}]]
              </span>
            );
          } else {
            // Show strikethrough for longer deletions
            return (
              <span
                key={index}
                className="line-through text-red-600 bg-red-50 px-1 rounded opacity-75"
                title={useUstoFormat ? "Deleted text (>5 characters)" : "Deleted text"}
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

  const handleCopyOriginal = async () => {
    try {
      await navigator.clipboard.writeText(`${claimNumber}. ${originalText}`);
      toast.success({
        title: 'Original claim copied!',
        description: `Original claim ${claimNumber} copied to clipboard`,
      });
    } catch (error) {
      toast.error({
        title: 'Copy failed',
        description: 'Failed to copy original claim to clipboard',
      });
    }
  };

  const handleCopyAmended = async () => {
    try {
      const textToCopy = ustoCompliantFormat 
        ? `${claimNumber}. ${ustoFormattedText}`
        : `${claimNumber}. ${amendedText}`;
      
      await navigator.clipboard.writeText(textToCopy);
      toast.success({
        title: 'Amended claim copied!',
        description: `${ustoCompliantFormat ? 'USPTO-formatted' : 'Clean'} claim ${claimNumber} copied to clipboard`,
      });
    } catch (error) {
      toast.error({
        title: 'Copy failed',
        description: 'Failed to copy amended claim to clipboard',
      });
    }
  };

  const handleCopyUstoFormat = async () => {
    try {
      await navigator.clipboard.writeText(`${claimNumber}. ${statusConfig.prefix} ${ustoFormattedText}`);
      toast.success({
        title: 'USPTO format copied!',
        description: `USPTO-compliant format copied to clipboard`,
      });
    } catch (error) {
      toast.error({
        title: 'Copy failed',
        description: 'Failed to copy USPTO format to clipboard',
      });
    }
  };

  if (showSideBySide) {
    return (
      <Card className={cn('mb-4', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">Claim {claimNumber}</CardTitle>
              <Badge className={statusConfig.color} variant="secondary">
                {statusConfig.label}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUstoCompliantFormat(!ustoCompliantFormat)}
                title={ustoCompliantFormat ? 'Show visual diff' : 'Show USPTO format'}
                className={cn(ustoCompliantFormat && "bg-blue-50 text-blue-700")}
              >
                {ustoCompliantFormat ? <Scale className="h-4 w-4" /> : <Palette className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOriginalOnly(!showOriginalOnly)}
                title={showOriginalOnly ? 'Show comparison' : 'Show original only'}
              >
                {showOriginalOnly ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Original Claim */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Original Claim</h4>
                <Button variant="ghost" size="sm" onClick={handleCopyOriginal}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="p-3 bg-gray-50 rounded border text-sm font-mono leading-relaxed">
                <span className="font-semibold">{claimNumber}. </span>
                {originalText}
              </div>
            </div>
            
            {/* Amended Claim */}
            {!showOriginalOnly && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    {ustoCompliantFormat ? 'USPTO Format' : 'Amended Claim'}
                  </h4>
                  <div className="flex gap-1">
                    {ustoCompliantFormat && (
                      <Button variant="ghost" size="sm" onClick={handleCopyUstoFormat} title="Copy USPTO format">
                        <Scale className="h-3 w-3" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={handleCopyAmended}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded border text-sm font-mono leading-relaxed">
                  <span className="font-semibold">{claimNumber}. {statusConfig.prefix} </span>
                  {ustoCompliantFormat ? ustoFormattedText : amendedText}
                </div>
              </div>
            )}
          </div>
          
          {/* Comparison View */}
          {!showOriginalOnly && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Changes Highlighted {ustoCompliantFormat ? '(USPTO Compliant)' : '(Visual Diff)'}
                </h4>
                <div className="p-3 bg-white rounded border text-sm font-mono leading-relaxed">
                  <div className="font-semibold mb-2">{claimNumber}. {statusConfig.prefix}</div>
                  <div>{renderDiffText(diff, ustoCompliantFormat)}</div>
                </div>
                
                {/* Legend */}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></span>
                    <span className="underline">Added text</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-red-50 border border-red-200 rounded"></span>
                    {ustoCompliantFormat ? (
                      <span>Deleted: <span className="line-through">&gt;5 chars</span> or [[≤5 chars]]</span>
                    ) : (
                      <span className="line-through">Deleted text</span>
                    )}
                  </div>
                                 </div>
               </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // Inline view (default)
  return (
    <Card className={cn('mb-4', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Claim {claimNumber}</CardTitle>
            <Badge className={statusConfig.color} variant="secondary">
              {statusConfig.label}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUstoCompliantFormat(!ustoCompliantFormat)}
              title={ustoCompliantFormat ? 'Show visual diff' : 'Show USPTO format'}
              className={cn(ustoCompliantFormat && "bg-blue-50 text-blue-700")}
            >
              {ustoCompliantFormat ? <Scale className="h-4 w-4" /> : <Palette className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOriginalOnly(!showOriginalOnly)}
              title={showOriginalOnly ? 'Show changes' : 'Show original only'}
            >
              {showOriginalOnly ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCopyAmended}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {showOriginalOnly ? (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Original Claim</h4>
            <div className="p-3 bg-gray-50 rounded border text-sm font-mono leading-relaxed">
              <span className="font-semibold">{claimNumber}. </span>
              {originalText}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">
                {ustoCompliantFormat ? 'USPTO Compliant Format' : 'Amended Claim with Changes'}
              </h4>
              {ustoCompliantFormat && (
                <Button variant="ghost" size="sm" onClick={handleCopyUstoFormat} title="Copy USPTO format">
                  <Scale className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="p-3 bg-white rounded border text-sm font-mono leading-relaxed">
              <div className="font-semibold mb-2">{claimNumber}. {statusConfig.prefix}</div>
              <div>{renderDiffText(diff, ustoCompliantFormat)}</div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></span>
                <span className="underline">Added text</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-red-50 border border-red-200 rounded"></span>
                {ustoCompliantFormat ? (
                  <span>Deleted: <span className="line-through">&gt;5 chars</span> or [[≤5 chars]]</span>
                ) : (
                  <span className="line-through">Deleted text</span>
                )}
              </div>
            </div>
            
            {/* USPTO Rules Info */}
            {ustoCompliantFormat && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                <strong>USPTO Rules (37 CFR 1.121(c)):</strong> Deletions of 5 or fewer characters use double brackets [[...]], 
                longer deletions use strikethrough for clear visibility.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClaimDiffViewer; 