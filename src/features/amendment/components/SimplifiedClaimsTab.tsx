/**
 * Simplified Claims Tab - Clean UI for amendment response claims
 * 
 * Shows all claims (amended and unchanged) with reasoning and editing capability
 */

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Edit, 
  Save, 
  X, 
  Check,
  AlertCircle,
  Wand2,
  RefreshCw,
  GitCompare
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToastWrapper';
import { apiFetch } from '@/lib/api/apiClient';
import { logger } from '@/utils/clientLogger';
import { useDraftDocumentByType, useUpdateDraftDocument } from '@/hooks/api/useDraftDocuments';
import ClaimDiffViewer from './ClaimDiffViewer';

// USPTO formatting functions (extracted from ClaimDiffViewer for consistency)
interface DiffPart {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
  usptoBrackets?: boolean;
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

interface ClaimData {
  claimNumber: string;
  originalText: string;
  amendedText: string;
  wasAmended: boolean;
  amendmentReason: string;
}

interface AmendmentResponse {
  claims: ClaimData[];
  summary: string;
  officeActionId: string;
  generatedAt: string;
}

interface SimplifiedClaimsTabProps {
  projectId: string;
  officeActionId: string;
  className?: string;
}

export function SimplifiedClaimsTab({
  projectId,
  officeActionId,
  className,
}: SimplifiedClaimsTabProps) {
  const toast = useToast();
  
  // Use React Query hook for data fetching
  const { data: draftDocument, isLoading, refetch } = useDraftDocumentByType(
    projectId, 
    'AMENDMENT_RESPONSE'
  );

  // Parse amendment data from draft document
  const amendmentData = useMemo<AmendmentResponse | null>(() => {
    if (!draftDocument?.content) return null;
    
    try {
      const parsedData = JSON.parse(draftDocument.content);
      if (parsedData.claims && Array.isArray(parsedData.claims)) {
        logger.info('[SimplifiedClaimsTab] Parsed amendment data', {
          claimsCount: parsedData.claims.length,
        });
        return parsedData;
      }
    } catch (error) {
      logger.error('[SimplifiedClaimsTab] Failed to parse amendment data', { error });
    }
    return null;
  }, [draftDocument]);

  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingClaim, setEditingClaim] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  const [showDiff, setShowDiff] = useState<Record<string, boolean>>({});

  // Mutation hook for updating draft document
  const updateDraftMutation = useUpdateDraftDocument();

  // Generate USPTO-formatted text for each claim
  const getUstoFormattedText = useMemo(() => {
    if (!amendmentData) return {};
    
    const formatted: Record<string, string> = {};
    
    amendmentData.claims.forEach(claim => {
      if (claim.wasAmended && claim.originalText) {
        const diff = computeWordDiff(claim.originalText, claim.amendedText);
        formatted[claim.claimNumber] = generateUstoText(diff);
      } else {
        formatted[claim.claimNumber] = claim.amendedText;
      }
    });
    
    return formatted;
  }, [amendmentData]);

  const handleGenerateResponse = async () => {
    try {
      setIsGenerating(true);
      
      logger.info('[SimplifiedClaimsTab] Generating amendment response', {
        projectId,
        officeActionId,
      });

      const response = await apiFetch(
        `/api/projects/${projectId}/amendments/generate-response`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            officeActionId,
          }),
        },
        {
          // Increase timeout for AI processing (60 seconds)
          timeout: 60000,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to generate response: ${response.status}`);
      }

      const result = await response.json();
      
      // Save the generated response using mutation
      await updateDraftMutation.mutateAsync({
        projectId,
        type: 'AMENDMENT_RESPONSE',
        content: JSON.stringify(result),
      });

      toast.success({
        title: 'Amendment Response Generated!',
        description: `Generated amendments for ${result.claims.length} claims`,
      });

      logger.info('[SimplifiedClaimsTab] Amendment response generated successfully', {
        claimsCount: result.claims.length,
        amendedCount: result.claims.filter((c: ClaimData) => c.wasAmended).length,
      });

    } catch (error) {
      logger.error('[SimplifiedClaimsTab] Failed to generate amendment response', { error });
      toast.error({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartEdit = (claim: ClaimData) => {
    setEditingClaim(claim.claimNumber);
    setEditedText(claim.amendedText);
  };

  const handleSaveEdit = async (claimNumber: string) => {
    if (!amendmentData) return;

    try {
      // Update the claims data
      const updatedClaims = amendmentData.claims.map(claim => 
        claim.claimNumber === claimNumber 
          ? { ...claim, amendedText: editedText }
          : claim
      );

      const updatedData = {
        ...amendmentData,
        claims: updatedClaims,
      };

      // Save to backend using mutation
      await updateDraftMutation.mutateAsync({
        projectId,
        type: 'AMENDMENT_RESPONSE',
        content: JSON.stringify(updatedData),
      });

      setEditingClaim(null);
      setEditedText('');

      toast.success({
        title: 'Claim Updated',
        description: `Claim ${claimNumber} has been updated`,
      });

    } catch (error) {
      logger.error('[SimplifiedClaimsTab] Failed to save claim edit', { error });
      toast.error({
        title: 'Save Failed',
        description: 'Failed to save claim changes',
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingClaim(null);
    setEditedText('');
  };

  const toggleDiff = (claimNumber: string) => {
    setShowDiff(prev => ({
      ...prev,
      [claimNumber]: !prev[claimNumber],
    }));
  };

  if (isLoading) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        <div className="flex-shrink-0 p-6 border-b">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full min-h-0", className)} style={{ height: 'calc(100vh - 180px)' }}>
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-6 border-b bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Amendment Response
            </h2>
            <p className="text-sm text-muted-foreground">
              {amendmentData 
                ? `${amendmentData.claims.length} claims • ${amendmentData.claims.filter(c => c.wasAmended).length} amended`
                : 'Generate amendments based on Office Action rejections'
              }
            </p>
          </div>
          
          <Button
            onClick={handleGenerateResponse}
            disabled={isGenerating}
            size="lg"
            className="min-w-[140px]"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Amendment Response
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div 
        className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar min-h-0"
        style={{ scrollbarGutter: 'stable' }}
      >
        <div className="p-6 space-y-6">
          {/* No data state */}
          {!amendmentData && !isLoading && (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Amendment Response Generated</h3>
              <p className="text-muted-foreground mb-4">
                Click "Generate Amendment Response" to analyze the Office Action and create amendments for all claims.
              </p>
              <p className="text-sm text-muted-foreground">
                This will automatically get the OCR text of your previous claims and amend them based on the rejection analysis.
              </p>
            </Card>
          )}

          {/* Claims list */}
          {amendmentData && (
            <div className="space-y-6">
              {/* Summary */}
              {amendmentData.summary && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Amendment Strategy:</strong> {amendmentData.summary}
                  </AlertDescription>
                </Alert>
              )}

              {/* Claims */}
              <div className="space-y-4">
                  {amendmentData.claims.map((claim) => (
                    <Card key={claim.claimNumber} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-mono">
                              Claim {claim.claimNumber}
                            </Badge>
                            
                            {claim.wasAmended ? (
                              <Badge variant="default" className="bg-blue-500">
                                Amended
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                No Amendment Needed
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Show/Hide Diff Toggle */}
                            {claim.wasAmended && claim.originalText && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleDiff(claim.claimNumber)}
                                className="text-muted-foreground"
                                title={showDiff[claim.claimNumber] ? "Hide diff view" : "Show diff view"}
                              >
                                <GitCompare className="h-4 w-4" />
                              </Button>
                            )}

                            {/* Edit button */}
                            {editingClaim === claim.claimNumber ? (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSaveEdit(claim.claimNumber)}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleCancelEdit}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartEdit(claim)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Claim text - either diff view or USPTO formatted text */}
                        <div>
                          {editingClaim === claim.claimNumber ? (
                            <div>
                              <p className="text-sm font-medium mb-2">
                                {claim.wasAmended ? 'Amended Claim Text:' : 'Claim Text:'}
                              </p>
                              <Textarea
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                                className="min-h-[120px] font-mono text-sm"
                                placeholder="Enter amended claim text..."
                              />
                            </div>
                          ) : showDiff[claim.claimNumber] && claim.wasAmended && claim.originalText ? (
                            <ClaimDiffViewer
                              claimNumber={claim.claimNumber}
                              originalText={claim.originalText}
                              amendedText={claim.amendedText}
                              className="text-sm"
                            />
                          ) : (
                            <div>
                              <p className="text-sm font-medium mb-2">
                                {claim.wasAmended ? 'USPTO Compliant Format:' : 'Claim Text:'}
                              </p>
                              <div className={cn(
                                "p-3 rounded border font-mono text-sm leading-relaxed whitespace-pre-wrap",
                                claim.wasAmended 
                                  ? "bg-blue-50 border-blue-200" 
                                  : "bg-gray-50 border-gray-200"
                              )}>
                                {getUstoFormattedText[claim.claimNumber] || claim.amendedText}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Amendment reasoning */}
                        <div className="pt-2 border-t">
                          <p className="text-sm font-medium mb-2">
                            {claim.wasAmended ? 'Amendment Reasoning:' : 'Status:'}
                          </p>
                          <div className={cn(
                            "p-3 rounded text-sm",
                            claim.wasAmended 
                              ? "bg-amber-50 border border-amber-200" 
                              : "bg-green-50 border border-green-200"
                          )}>
                            {claim.amendmentReason}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 