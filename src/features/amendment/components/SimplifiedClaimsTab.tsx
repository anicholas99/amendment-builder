/**
 * Simplified Claims Tab - Clean UI for amendment response claims
 * 
 * Shows all claims (amended and unchanged) with reasoning and editing capability
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Edit, 
  Save, 
  X, 
  Check,
  AlertCircle,
  Wand2,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SimpleMainPanel } from '@/components/common/SimpleMainPanel';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToastWrapper';
import { apiFetch } from '@/lib/api/apiClient';
import { logger } from '@/utils/clientLogger';

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
  
  // State
  const [amendmentData, setAmendmentData] = useState<AmendmentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingClaim, setEditingClaim] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  const [showOriginal, setShowOriginal] = useState<Record<string, boolean>>({});

  // Load existing amendment data on mount
  useEffect(() => {
    loadAmendmentData();
  }, [projectId, officeActionId]);

  const loadAmendmentData = async () => {
    try {
      setIsLoading(true);
      const response = await apiFetch(`/api/projects/${projectId}/draft-documents`);
      const draftData = await response.json();
      
      // Look for amendment response document
      const amendmentDoc = draftData.documents?.find((doc: any) => 
        doc.type === 'AMENDMENT_RESPONSE'
      );
      
      if (amendmentDoc) {
        const parsedData = JSON.parse(amendmentDoc.content);
        if (parsedData.claims && Array.isArray(parsedData.claims)) {
          setAmendmentData(parsedData);
          logger.info('[SimplifiedClaimsTab] Loaded existing amendment data', {
            claimsCount: parsedData.claims.length,
          });
        }
      }
    } catch (error) {
      logger.error('[SimplifiedClaimsTab] Failed to load amendment data', { error });
      // Don't show error toast - just means no data exists yet
    } finally {
      setIsLoading(false);
    }
  };

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
      setAmendmentData(result);

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
      // Update the local state
      const updatedClaims = amendmentData.claims.map(claim => 
        claim.claimNumber === claimNumber 
          ? { ...claim, amendedText: editedText }
          : claim
      );

      const updatedData = {
        ...amendmentData,
        claims: updatedClaims,
      };

      setAmendmentData(updatedData);

      // Save to backend
      await apiFetch(`/api/projects/${projectId}/draft-documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'AMENDMENT_RESPONSE',
          content: JSON.stringify(updatedData),
        }),
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

  const toggleShowOriginal = (claimNumber: string) => {
    setShowOriginal(prev => ({
      ...prev,
      [claimNumber]: !prev[claimNumber],
    }));
  };

  if (isLoading) {
    return (
      <div className={cn("p-6 space-y-4", className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <SimpleMainPanel
      header={
        <div className="p-6">
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
      }
      contentPadding={true}
    >
      <div className="space-y-6">
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
                          {/* Show/Hide Original Toggle */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleShowOriginal(claim.claimNumber)}
                            className="text-muted-foreground"
                          >
                            {showOriginal[claim.claimNumber] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>

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
                      {/* Original text (collapsible) */}
                      {showOriginal[claim.claimNumber] && (
                        <div className="p-3 bg-muted/50 rounded border">
                          <p className="text-sm font-medium mb-2 text-muted-foreground">
                            Original Claim Text:
                          </p>
                          <div className="font-mono text-sm leading-relaxed">
                            {claim.originalText}
                          </div>
                        </div>
                      )}

                      {/* Amended text */}
                      <div>
                        <p className="text-sm font-medium mb-2">
                          {claim.wasAmended ? 'Amended Claim Text:' : 'Claim Text:'}
                        </p>
                        
                        {editingClaim === claim.claimNumber ? (
                          <Textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="min-h-[120px] font-mono text-sm"
                            placeholder="Enter amended claim text..."
                          />
                        ) : (
                          <div className={cn(
                            "p-3 rounded border font-mono text-sm leading-relaxed whitespace-pre-wrap",
                            claim.wasAmended 
                              ? "bg-blue-50 border-blue-200" 
                              : "bg-gray-50 border-gray-200"
                          )}>
                            {claim.amendedText}
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
        
        {/* Bottom spacer to ensure content isn't cut off */}
        <div className="h-8" aria-hidden="true" />
      </div>
    </SimpleMainPanel>
  );
} 