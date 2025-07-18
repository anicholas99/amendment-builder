/**
 * ClaimDiffViewer - USPTO-compliant claim amendment display
 * 
 * Shows original vs amended claim text with proper formatting:
 * - Deletions: strikethrough
 * - Additions: underlined
 * - Clean side-by-side or inline comparison
 */

import React, { useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Copy, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToastWrapper';

// Simple word-based diff algorithm
interface DiffPart {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
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

// Optimized word-based diff algorithm for real-time updates
const computeWordDiff = (original: string, amended: string): DiffPart[] => {
  if (!original && !amended) return [];
  if (!original) {
    return [{ type: 'added', text: amended }];
  }
  if (!amended) {
    return [{ type: 'removed', text: original }];
  }

  // For real-time performance, use a simpler approach
  const originalWords = original.split(/(\s+)/).filter(Boolean);
  const amendedWords = amended.split(/(\s+)/).filter(Boolean);
  
  const diff: DiffPart[] = [];
  const maxLen = Math.max(originalWords.length, amendedWords.length);
  
  // Simple line-by-line comparison for better performance
  for (let i = 0; i < maxLen; i++) {
    const originalWord = originalWords[i];
    const amendedWord = amendedWords[i];
    
    if (!originalWord && amendedWord) {
      // Addition at the end
      diff.push({ type: 'added', text: amendedWord });
    } else if (originalWord && !amendedWord) {
      // Deletion at the end
      diff.push({ type: 'removed', text: originalWord });
    } else if (originalWord === amendedWord) {
      // No change
      diff.push({ type: 'unchanged', text: originalWord });
    } else {
      // Word changed - show both deletion and addition
      if (originalWord) {
        diff.push({ type: 'removed', text: originalWord });
      }
      if (amendedWord) {
        diff.push({ type: 'added', text: amendedWord });
      }
    }
  }
  
  return diff;
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
  
  const statusConfig = STATUS_CONFIG[status];
  const diff = useMemo(() => computeWordDiff(originalText, amendedText), [originalText, amendedText]);
  
  // Render diff parts with proper formatting
  const renderDiffText = (parts: DiffPart[]) => {
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
          return (
            <span
              key={index}
              className="line-through text-red-600 bg-red-50 px-1 rounded opacity-75"
              title="Deleted text"
            >
              {part.text}
            </span>
          );
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
      await navigator.clipboard.writeText(`${claimNumber}. ${amendedText}`);
      toast.success({
        title: 'Amended claim copied!',
        description: `Amended claim ${claimNumber} copied to clipboard`,
      });
    } catch (error) {
      toast.error({
        title: 'Copy failed',
        description: 'Failed to copy amended claim to clipboard',
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
                  <h4 className="text-sm font-medium text-gray-700">Amended Claim</h4>
                  <Button variant="ghost" size="sm" onClick={handleCopyAmended}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="p-3 bg-blue-50 rounded border text-sm font-mono leading-relaxed">
                  <span className="font-semibold">{claimNumber}. {statusConfig.prefix} </span>
                  {amendedText}
                </div>
              </div>
            )}
          </div>
          
          {/* Comparison View */}
          {!showOriginalOnly && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Changes Highlighted</h4>
                <div className="p-3 bg-white rounded border text-sm font-mono leading-relaxed">
                  <div className="font-semibold mb-2">{claimNumber}. {statusConfig.prefix}</div>
                  <div>{renderDiffText(diff)}</div>
                </div>
                
                {/* Legend */}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></span>
                    <span className="underline">Added text</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-red-50 border border-red-200 rounded"></span>
                    <span className="line-through">Deleted text</span>
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
            <h4 className="text-sm font-medium text-gray-700 mb-2">Amended Claim with Changes</h4>
            <div className="p-3 bg-white rounded border text-sm font-mono leading-relaxed">
              <div className="font-semibold mb-2">{claimNumber}. {statusConfig.prefix}</div>
              <div>{renderDiffText(diff)}</div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></span>
                <span className="underline">Added text</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-red-50 border border-red-200 rounded"></span>
                <span className="line-through">Deleted text</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClaimDiffViewer; 