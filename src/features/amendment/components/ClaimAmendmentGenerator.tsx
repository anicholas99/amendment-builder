/**
 * Claim Amendment Generator Component
 * 
 * Generates and displays AI-powered claim amendments based on Office Action analysis
 * Shows diff view and allows user editing of amendments
 */

import React, { useState } from 'react';
import { 
  Wand2, 
  RefreshCw, 
  Save, 
  AlertCircle, 
  CheckCircle,
  FileText,
  Edit3,
  Eye,
  EyeOff
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { cn } from '@/lib/utils';
import { useAmendments, useGenerateAmendments, useUpdateAmendment } from '@/hooks/api/useAmendments';
import { ClaimAmendment } from '@/client/services/amendments.client-service';
import ClaimDiffViewer from './ClaimDiffViewer';

interface ClaimAmendmentGeneratorProps {
  projectId: string;
  officeActionId?: string;
  className?: string;
  onAmendmentUpdate?: () => void;
}

export function ClaimAmendmentGenerator({
  projectId,
  officeActionId,
  className,
  onAmendmentUpdate,
}: ClaimAmendmentGeneratorProps) {
  const [editingClaimNumber, setEditingClaimNumber] = useState<number | null>(null);
  const [editedText, setEditedText] = useState('');
  const [showDiff, setShowDiff] = useState<Record<number, boolean>>({});

  // React Query hooks
  const { data: amendments, isLoading, error } = useAmendments(projectId, officeActionId);
  const generateMutation = useGenerateAmendments();
  const updateMutation = useUpdateAmendment();

  const handleGenerate = () => {
    generateMutation.mutate({ 
      projectId, 
      regenerate: false 
    });
  };

  const handleRegenerate = () => {
    generateMutation.mutate({ 
      projectId, 
      regenerate: true 
    });
  };

  const handleEditStart = (claim: ClaimAmendment) => {
    setEditingClaimNumber(claim.claimNumber);
    setEditedText(claim.amendedText);
  };

  const handleEditCancel = () => {
    setEditingClaimNumber(null);
    setEditedText('');
  };

  const handleEditSave = (claimNumber: number) => {
    updateMutation.mutate(
      {
        projectId,
        claimNumber,
        amendedText: editedText,
      },
      {
        onSuccess: () => {
          setEditingClaimNumber(null);
          setEditedText('');
          onAmendmentUpdate?.();
        },
      }
    );
  };

  const toggleDiff = (claimNumber: number) => {
    setShowDiff(prev => ({ ...prev, [claimNumber]: !prev[claimNumber] }));
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Claim Amendments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error && !amendments) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Claim Amendments</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No amendments generated yet. Click "Generate Amendments" to start.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={handleGenerate} 
            className="mt-4"
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Amendments
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Claim Amendments
        </CardTitle>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRegenerate}
                  disabled={generateMutation.isPending}
                >
                  <RefreshCw className={cn(
                    "h-4 w-4",
                    generateMutation.isPending && "animate-spin"
                  )} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Regenerate all amendments</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="amendments" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="amendments">Amendments</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="amendments" className="mt-0">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 p-6">
                {amendments && amendments.claims && amendments.claims.length > 0 ? (
                  amendments.claims.map((claim) => (
                    <Card key={claim.claimNumber} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              Claim {claim.claimNumber}
                            </Badge>
                            {claim.changeReason && (
                              <Badge variant="secondary" className="text-xs">
                                {claim.changeReason.slice(0, 50)}...
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleDiff(claim.claimNumber)}
                            >
                              {showDiff[claim.claimNumber] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditStart(claim)}
                              disabled={editingClaimNumber === claim.claimNumber}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {editingClaimNumber === claim.claimNumber ? (
                          <div className="space-y-3">
                            <Textarea
                              value={editedText}
                              onChange={(e) => setEditedText(e.target.value)}
                              className="min-h-[150px] font-mono text-sm"
                              placeholder="Enter amended claim text..."
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleEditCancel}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleEditSave(claim.claimNumber)}
                                disabled={updateMutation.isPending}
                              >
                                {updateMutation.isPending ? (
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="mr-2 h-4 w-4" />
                                )}
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : showDiff[claim.claimNumber] ? (
                          <ClaimDiffViewer
                            claimNumber={claim.claimNumber.toString()}
                            originalText={claim.originalText}
                            amendedText={claim.amendedText}
                            className="text-sm"
                          />
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Amended Text
                              </p>
                              <div className="rounded-md bg-muted p-3 font-mono text-sm">
                                {claim.amendedText}
                              </div>
                            </div>
                            {claim.changes.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  Changes Made
                                </p>
                                <div className="space-y-1">
                                  {claim.changes.map((change, idx) => (
                                    <div 
                                      key={idx} 
                                      className="flex items-start gap-2 text-xs"
                                    >
                                      <Badge 
                                        variant={change.type === 'addition' ? 'default' : 'destructive'}
                                        className="text-[10px] px-1 py-0"
                                      >
                                        {change.type}
                                      </Badge>
                                      <span className="text-muted-foreground">
                                        {change.text}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Alert variant="default">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No amendments generated yet. Click "Generate Amendments" to start.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="summary" className="mt-0 p-6">
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Amendment Strategy:</strong> {amendments?.summary}
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Total Claims:</dt>
                        <dd className="font-medium">{amendments?.claims?.length || 0}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Amended:</dt>
                        <dd className="font-medium">
                          {amendments?.claims?.filter(c => c.changes?.length > 0).length || 0}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Generated:</dt>
                        <dd className="font-medium">
                          {amendments?.generatedAt && 
                            new Date(amendments.generatedAt).toLocaleString()
                          }
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      className="w-full" 
                      size="sm"
                      variant="outline"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Export to Document
                    </Button>
                    <Button 
                      className="w-full" 
                      size="sm"
                      variant="outline"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Version
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}