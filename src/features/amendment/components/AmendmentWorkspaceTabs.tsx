/**
 * Amendment Workspace Tabs - Three-tab interface for attorney workflow
 * 
 * Provides clear separation of amendment phases:
 * 1. Analysis - Review rejections and strategy recommendations
 * 2. Draft - Edit claims and arguments
 * 3. Preview - Review formatted document before export
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  FileSearch,
  Edit3,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Download
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { isFeatureEnabled } from '@/config/featureFlags';

// Import existing components
import { RejectionAnalysisPanel } from './RejectionAnalysisPanel';
import { DraftingWorkspace } from './DraftingWorkspace';
import { ExportWithValidationButton } from './ExportWithValidationButton';
import { AmendmentExportService } from '@/services/api/amendmentExportService';
import { logger } from '@/utils/clientLogger';
import type { OfficeAction } from '@/types/domain/amendment';
import type { 
  RejectionAnalysisResult,
  StrategyRecommendation 
} from '@/types/domain/rejection-analysis';

interface AmendmentWorkspaceTabsProps {
  projectId: string;
  selectedOfficeAction: OfficeAction | null;
  selectedOfficeActionId: string | null;
  amendmentProjectId: string | null;
  analyses: RejectionAnalysisResult[] | null;
  overallStrategy: StrategyRecommendation | null;
  isAnalyzing: boolean;
  selectedRejectionId?: string | null;
  onSelectRejection?: (rejectionId: string) => void;
  onGenerateAmendment?: () => Promise<void>;
  onSave?: () => void;
  onAnalyzeRejections?: () => void;
  onTabChange?: (tab: string) => void; // Add callback for tab changes
  className?: string;
}

// Tab configuration with status indicators
const getTabConfig = (hasAnalysis: boolean, hasDraft: boolean) => ({
  analysis: {
    id: 'analysis',
    label: 'Analysis',
    icon: FileSearch,
    description: 'Review rejections and recommendations',
    status: hasAnalysis ? 'complete' : 'pending',
    disabled: false,
  },
  draft: {
    id: 'draft',
    label: 'Draft',
    icon: Edit3,
    description: 'Edit claims and arguments',
    status: hasDraft ? 'in-progress' : 'pending',
    disabled: false, // Always enabled for manual drafting
  },
  preview: {
    id: 'preview',
    label: 'Preview',
    icon: Eye,
    description: 'Review formatted document',
    status: hasDraft ? 'ready' : 'pending',
    disabled: !hasDraft,
  },
});

export const AmendmentWorkspaceTabs: React.FC<AmendmentWorkspaceTabsProps> = ({
  projectId,
  selectedOfficeAction,
  selectedOfficeActionId,
  amendmentProjectId,
  analyses,
  overallStrategy,
  isAnalyzing,
  selectedRejectionId,
  onSelectRejection,
  onGenerateAmendment,
  onSave,
  onAnalyzeRejections,
  onTabChange,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<string>('analysis');
  const [previewContent, setPreviewContent] = useState<string>('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isGeneratingAmendment, setIsGeneratingAmendment] = useState(false);
  const isMinimalistUI = isFeatureEnabled('ENABLE_MINIMALIST_AMENDMENT_UI');

  // Determine status
  const hasAnalysis = !!analyses?.length;
  const hasDraft = false; // TODO: Check if draft exists
  const canAnalyze = selectedOfficeAction?.rejections?.length > 0;

  const tabConfig = useMemo(
    () => getTabConfig(hasAnalysis, hasDraft),
    [hasAnalysis, hasDraft]
  );

  // Enhanced amendment generation handler
  const handleGenerateAmendmentClick = async () => {
    if (onGenerateAmendment) {
      setIsGeneratingAmendment(true);
      try {
        await onGenerateAmendment();
        // Switch to draft tab after successful generation
        setActiveTab('draft');
        onTabChange?.('draft');
      } catch (error) {
        logger.error('[AmendmentWorkspaceTabs] Amendment generation failed', { error });
      } finally {
        setIsGeneratingAmendment(false);
      }
    }
  };

  // Generate preview content
  const handleGeneratePreview = useCallback(async () => {
    if (!amendmentProjectId || !selectedOfficeActionId) return;

    setIsGeneratingPreview(true);
    try {
      const exportData = await AmendmentExportService.exportAmendment(
        amendmentProjectId,
        'PREVIEW'
      );
      
      if (exportData?.content) {
        setPreviewContent(exportData.content);
      }
    } catch (error) {
      logger.error('[AmendmentWorkspaceTabs] Failed to generate preview', { error });
      setPreviewContent('Failed to generate preview. Please try again.');
    } finally {
      setIsGeneratingPreview(false);
    }
  }, [amendmentProjectId, selectedOfficeActionId]);

  // Auto-generate preview when switching to preview tab
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    if (value === 'preview' && !previewContent && hasDraft) {
      handleGeneratePreview();
    }
  }, [previewContent, hasDraft, handleGeneratePreview]);

  // Tab status badge
  const TabStatusBadge = ({ status }: { status: string }) => {
    const config = {
      complete: { variant: 'default' as const, icon: CheckCircle2, label: 'Complete' },
      'in-progress': { variant: 'secondary' as const, icon: Clock, label: 'In Progress' },
      ready: { variant: 'outline' as const, icon: Eye, label: 'Ready' },
      pending: { variant: 'outline' as const, icon: AlertCircle, label: 'Pending' },
    };

    const { variant, icon: Icon, label } = config[status as keyof typeof config] || config.pending;

    return isMinimalistUI ? (
      <Icon className="h-3 w-3 ml-1" />
    ) : (
      <Badge variant={variant} className="ml-2 text-xs">
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={handleTabChange}
      className={cn("flex flex-col h-full", className)}
    >
      {/* Compact tab list */}
      <TabsList className="grid w-full grid-cols-3 h-auto p-1">
        {Object.values(tabConfig).map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              disabled={tab.disabled}
              className="flex items-center justify-center gap-2 py-2 data-[state=active]:bg-background"
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {isMinimalistUI && <TabStatusBadge status={tab.status} />}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {/* Analysis Tab */}
      <TabsContent value="analysis" className="flex-1 mt-0 overflow-hidden">
        {!selectedOfficeAction ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Select an Office Action to begin analysis</p>
          </div>
        ) : !hasAnalysis ? (
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Rejection Analysis</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <FileSearch className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-medium mb-2">No Analysis Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Analyze the Office Action rejections to get AI-powered recommendations
                  </p>
                  {canAnalyze && (
                    <Button 
                      onClick={onAnalyzeRejections}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <FileSearch className="h-4 w-4 mr-2" />
                          Analyze Rejections
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <RejectionAnalysisPanel
            analyses={analyses}
            overallStrategy={overallStrategy}
            isLoading={isAnalyzing || false}
            selectedRejectionId={selectedRejectionId}
            onSelectRejection={onSelectRejection}
            onGenerateAmendment={handleGenerateAmendmentClick}
            isGeneratingAmendment={isGeneratingAmendment}
          />
        )}
      </TabsContent>

      {/* Draft Tab */}
      <TabsContent value="draft" className="flex-1 mt-0 overflow-hidden">
        <DraftingWorkspace
          projectId={projectId}
          selectedOfficeAction={selectedOfficeAction}
          selectedOfficeActionId={selectedOfficeActionId}
          amendmentProjectId={amendmentProjectId || undefined}
          onSave={onSave}
        />
      </TabsContent>

      {/* Preview Tab */}
      <TabsContent value="preview" className="flex-1 mt-0 overflow-hidden">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle>Document Preview</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePreview}
                  disabled={isGeneratingPreview}
                >
                  {isGeneratingPreview ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Refresh Preview
                    </>
                  )}
                </Button>
                <ExportWithValidationButton
                  amendmentProjectId={amendmentProjectId || ''}
                  projectId={projectId}
                  disabled={!hasDraft}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            {!hasDraft ? (
              <div className="flex items-center justify-center h-full text-muted-foreground p-8">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p>No draft content to preview</p>
                  <p className="text-sm mt-2">Complete your amendments in the Draft tab first</p>
                </div>
              </div>
            ) : isGeneratingPreview ? (
              <div className="flex items-center justify-center h-full">
                <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="p-8">
                  {/* Styled preview content */}
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: previewContent }}
                  />
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};