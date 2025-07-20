/**
 * Amendment Studio - Main Interface for Office Action Response
 * 
 * Handles routing between amendment projects list and studio workspace
 * Integrates all amendment components with clean state management
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import { logger } from '@/utils/clientLogger';
import { cn } from '@/lib/utils';
import { Resizable, ResizeCallback } from 're-resizable';
import { useQuery } from '@tanstack/react-query';
import { isFeatureEnabled } from '@/config/featureFlags';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import new components
import { AmendmentProjectsList } from './AmendmentProjectsList';
import { EnhancedAmendmentProjectsList } from './EnhancedAmendmentProjectsList';
import { OfficeActionNavigator } from './OfficeActionNavigator';
import { AIAssistantPanel } from './AIAssistantPanel';
import { DraftingWorkspace } from './DraftingWorkspace';
import { RejectionAnalysisPanel } from './RejectionAnalysisPanel';
import { FloatingInsights } from './FloatingInsights';

// Import existing components
import { SimpleMainPanel } from '@/components/common/SimpleMainPanel';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOfficeActions, useOfficeAction } from '@/hooks/api/useAmendment';
import { useOfficeActionAnalyses, useStrategyRecommendation } from '@/hooks/api/useRejectionAnalysis';
import { AmendmentApiService } from '@/services/api/amendmentApiService';
import { DraftApiService } from '@/services/api/draftApiService';
import { AmendmentWorkspaceTabs } from './AmendmentWorkspaceTabs';

interface AmendmentStudioProps {
  projectId: string;
  officeActionId?: string;
}

// Constants for panel sizing
const PANEL_CONFIG = {
  LEFT_PANEL_WIDTH: 320, // 80 * 4 = 320px (w-80)
  AI_PANEL: {
    DEFAULT_WIDTH: 700, // Full width when expanded
    COLLAPSED_WIDTH: 60, // Just enough for icon and minimal UI
    MIN_WIDTH: 280,
    MAX_WIDTH: 1200, // Increased max width for more flexible sizing
  },
  PANEL_GAP: 0, // No gap needed as borders are handled by panels
} as const;

// Adapter function to convert ProcessedOfficeAction to OfficeActionData format
const adaptOfficeActionData = (processedOA: any) => {
  if (!processedOA) return undefined;



  // Calculate summary data
  const rejectionTypes = [...new Set(processedOA.rejections.map((r: any) => r.type))];
  const allClaimNumbers = new Set<string>();
  const allPriorArtRefs = new Set<string>();

  processedOA.rejections.forEach((r: any) => {
    // Parse JSON strings if needed
    const claimNumbers = typeof r.claimNumbers === 'string' 
      ? JSON.parse(r.claimNumbers || '[]') 
      : (r.claimNumbers || []);
    const citedPriorArt = typeof r.citedPriorArt === 'string' 
      ? JSON.parse(r.citedPriorArt || '[]') 
      : (r.citedPriorArt || []);
      
    claimNumbers.forEach((claim: string) => allClaimNumbers.add(claim));
    citedPriorArt.forEach((ref: string) => allPriorArtRefs.add(ref));
  });

  return {
    id: processedOA.id,
    fileName: processedOA.originalFileName || processedOA.fileName,
    metadata: {
      applicationNumber: processedOA.metadata?.applicationNumber,
      mailingDate: processedOA.dateIssued?.toISOString() || processedOA.metadata?.mailingDate,
      examinerName: processedOA.metadata?.examinerName || processedOA.examiner?.name,
      artUnit: processedOA.metadata?.artUnit || processedOA.examiner?.artUnit || processedOA.artUnit,
    },
    examinerRemarks: processedOA.examinerRemarks, // User-friendly summary
    detailedAnalysis: processedOA.metadata?.detailedAnalysis || processedOA.detailedAnalysis, // Comprehensive structured analysis
    rejections: processedOA.rejections.map((r: any) => {
      // Parse JSON strings if needed
      const claimNumbers = typeof r.claimNumbers === 'string' 
        ? JSON.parse(r.claimNumbers || '[]') 
        : (r.claimNumbers || []);
      const citedPriorArt = typeof r.citedPriorArt === 'string' 
        ? JSON.parse(r.citedPriorArt || '[]') 
        : (r.citedPriorArt || []);
        
      return {
        id: r.id,
        type: r.type,
        claims: claimNumbers,
        priorArtReferences: citedPriorArt,
        examinerReasoning: r.examinerText,
        rawText: r.examinerText, // Use examiner text as raw text
      };
    }),
    allPriorArtReferences: Array.from(allPriorArtRefs) as string[],
    summary: {
      totalRejections: processedOA.rejections.length,
      rejectionTypes: rejectionTypes as string[],
      totalClaimsRejected: allClaimNumbers.size,
      uniquePriorArtCount: allPriorArtRefs.size,
    },
  };
};

export const AmendmentStudio: React.FC<AmendmentStudioProps> = ({
  projectId,
  officeActionId,
}) => {
  const router = useRouter();
  
  // Feature flag for minimalist UI
  const isMinimalistUI = isFeatureEnabled('ENABLE_MINIMALIST_AMENDMENT_UI');
  
  // State management
  const [selectedOfficeActionId, setSelectedOfficeActionId] = useState<string | null>(
    officeActionId || null
  );
  const [selectedRejectionId, setSelectedRejectionId] = useState<string | null>(null);
  const [showProjects, setShowProjects] = useState(!officeActionId);
  const [isAIPanelCollapsed, setIsAIPanelCollapsed] = useState(false); // Always open by default
  const [aiPanelWidth, setAiPanelWidth] = useState<number>(
    PANEL_CONFIG.AI_PANEL.DEFAULT_WIDTH // Always start with full width
  );

  // Data fetching
  const { data: officeActions = [], isLoading: isLoadingOfficeActions } = useOfficeActions(projectId);
  const { data: selectedOA } = useOfficeAction(selectedOfficeActionId || '');

  // Get the real amendment project for this office action
  const { data: realAmendmentProject } = useQuery({
    queryKey: ['amendmentProject', selectedOfficeActionId],
    queryFn: async () => {
      if (!selectedOfficeActionId) return null;
      
      // Find the real amendment project in the database
      const response = await fetch(`/api/projects/${projectId}/draft-documents`);
      if (!response.ok) return null;
      
      const draftData = await response.json();
      
      // Look for a draft document that has an amendmentProjectId
      const draftWithAmendmentProject = draftData.documents?.find((doc: any) => doc.amendmentProjectId);
      
      if (draftWithAmendmentProject) {
        console.log('🔍 Found real amendment project ID:', draftWithAmendmentProject.amendmentProjectId);
        return { id: draftWithAmendmentProject.amendmentProjectId };
      }
      
      return null;
    },
    enabled: !!selectedOfficeActionId,
  });

  // Rejection analysis hooks and state
  const { data: analyses, isLoading: analysesLoading, refetch: refetchAnalyses } = useOfficeActionAnalyses(selectedOfficeActionId || '');
  const { data: overallStrategy, refetch: refetchStrategy } = useStrategyRecommendation(selectedOfficeActionId || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Create adapted analysis data structure
  const analysisData = useMemo(() => {
    if (!analyses) return null;
    return {
      analyses,
      overallStrategy
    };
  }, [analyses, overallStrategy]);

  // Convert to the adapted format
  const adaptedOfficeAction = useMemo(() => {
    if (!selectedOA) return undefined;
    return adaptOfficeActionData(selectedOA);
  }, [selectedOA]);

  // Check if analysis is available
  const hasAnalysis = !!analysisData?.analyses?.length;
  const canAnalyze = adaptedOfficeAction?.rejections?.length > 0 && 
                     adaptedOfficeAction?.summary?.totalRejections > 0;

  // Handlers
  const handleOfficeActionSelect = useCallback((oaId: string) => {
    logger.info('[AmendmentStudio] Office Action selected', { oaId });
    setSelectedOfficeActionId(oaId);
    setShowProjects(false);
    setSelectedRejectionId(null);
  }, []);

  const handleAnalyzeRejections = useCallback(async () => {
    if (!selectedOfficeActionId || !canAnalyze) return;
    
    logger.info('[AmendmentStudio] Starting rejection analysis', { 
      officeActionId: selectedOfficeActionId 
    });
    
    setIsAnalyzing(true);
    try {
      // Trigger analysis via API service (placeholder - needs implementation)
      // await AmendmentApiService.analyzeOfficeActionRejections(selectedOfficeActionId, { includeClaimCharts: true });
      
      // For now, just simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refetch the analysis data
      await Promise.all([refetchAnalyses(), refetchStrategy()]);
    } catch (error) {
      logger.error('[AmendmentStudio] Failed to analyze rejections', { error });
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedOfficeActionId, canAnalyze, refetchAnalyses, refetchStrategy]);

  const handleGenerateAmendment = useCallback(() => {
    if (!selectedOfficeActionId || !analysisData) return;
    
    logger.info('[AmendmentStudio] Generating amendment based on analysis', {
      officeActionId: selectedOfficeActionId,
      strategy: analysisData.overallStrategy?.primaryStrategy,
    });
    
    // Navigate to drafting workspace or trigger generation
    // This will be implemented when connecting to amendment generation
  }, [selectedOfficeActionId, analysisData]);

  const handleRejectionSelect = useCallback((rejectionId: string) => {
    logger.info('[AmendmentStudio] Rejection selected', { rejectionId });
    setSelectedRejectionId(rejectionId);
  }, []);

  const handleAIPanelResize: ResizeCallback = useCallback((e, direction, ref, d) => {
    setAiPanelWidth((prev: number) => prev + d.width);
    // If panel is resized beyond collapsed width, mark it as expanded
    if (isAIPanelCollapsed && (aiPanelWidth + d.width) > PANEL_CONFIG.AI_PANEL.COLLAPSED_WIDTH * 2) {
      setIsAIPanelCollapsed(false);
    }
  }, [isAIPanelCollapsed, aiPanelWidth]);

  const toggleAIPanel = useCallback(() => {
    setIsAIPanelCollapsed(prev => !prev);
    setAiPanelWidth(
      isAIPanelCollapsed 
        ? PANEL_CONFIG.AI_PANEL.DEFAULT_WIDTH 
        : PANEL_CONFIG.AI_PANEL.COLLAPSED_WIDTH
    );
  }, [isAIPanelCollapsed]);

  // Handle saving amendment drafts
  const handleSaveAmendmentDraft = useCallback(async (content: any) => {
    if (!selectedOfficeActionId || !content) return;

    try {
      logger.info('[AmendmentStudio] Saving amendment draft', {
        projectId,
        officeActionId: selectedOfficeActionId,
        claimCount: content.claimAmendments?.length || 0,
        argumentCount: content.argumentSections?.length || 0,
      });

      // Save claim amendments as separate draft document
      if (content.claimAmendments && content.claimAmendments.length > 0) {
        await DraftApiService.updateDraftDocument(
          projectId,
          'CLAIMS_AMENDMENTS',
          JSON.stringify(content.claimAmendments)
        );
      }

      // Save argument sections as separate draft document  
      if (content.argumentSections && content.argumentSections.length > 0) {
        await DraftApiService.updateDraftDocument(
          projectId,
          'ARGUMENTS_SECTION', 
          JSON.stringify(content.argumentSections)
        );
      }

      // Save overall amendment shell document
      if (content.title && content.responseType) {
        const amendmentShell = {
          title: content.title,
          responseType: content.responseType,
          lastSaved: content.lastSaved,
          officeActionId: selectedOfficeActionId,
        };

        await DraftApiService.updateDraftDocument(
          projectId,
          'AMENDMENT_SHELL',
          JSON.stringify(amendmentShell)
        );
      }

      logger.info('[AmendmentStudio] Amendment draft saved successfully', {
        projectId,
        officeActionId: selectedOfficeActionId,
      });

    } catch (error) {
      logger.error('[AmendmentStudio] Failed to save amendment draft', {
        error: error instanceof Error ? error.message : String(error),
        projectId,
        officeActionId: selectedOfficeActionId,
      });
      throw error; // Re-throw so DraftingWorkspace can handle the error
    }
  }, [projectId, selectedOfficeActionId]);

  if (showProjects) {
    // Use enhanced UI by default, with fallback to legacy
    const useEnhancedUI = process.env.NEXT_PUBLIC_ENHANCED_AMENDMENT_UI !== 'false';
    
    if (useEnhancedUI) {
      return <EnhancedAmendmentProjectsList projectId={projectId} />;
    }
    
    return <AmendmentProjectsList projectId={projectId} />;
  }

  return (
    <div className="flex h-full gap-0">
      {/* Left Panel - Office Action Navigator */}
      <div className="w-80 flex-shrink-0 h-full border-r">
        <OfficeActionNavigator
          officeAction={adaptedOfficeAction}
          selectedRejectionId={selectedRejectionId}
          onRejectionSelect={handleRejectionSelect}
          projectId={projectId}
          className="h-full"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-hidden">
        <div className="h-full flex flex-col bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          {/* Fixed header - simplified for minimalist UI */}
          {isMinimalistUI ? (
            <div className="flex-shrink-0 bg-card border-b border-border px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-semibold">
                    {adaptedOfficeAction?.fileName || 'Amendment Studio'}
                  </h1>
                  {adaptedOfficeAction?.metadata?.applicationNumber && (
                    <span className="text-sm text-muted-foreground ml-2">
                      • {adaptedOfficeAction.metadata.applicationNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-shrink-0 bg-card border-b border-border">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-semibold">
                      {adaptedOfficeAction?.fileName || 'Amendment Studio'}
                    </h1>
                    {adaptedOfficeAction?.metadata?.applicationNumber && (
                      <p className="text-sm text-muted-foreground">
                        Application: {adaptedOfficeAction.metadata.applicationNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Main workspace with tabs */}
          <div className="flex-1 overflow-hidden min-h-0">
            {!adaptedOfficeAction ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Select an Office Action to begin</p>
              </div>
            ) : (
              <AmendmentWorkspaceTabs
                projectId={projectId}
                selectedOfficeAction={adaptedOfficeAction}
                selectedOfficeActionId={selectedOfficeActionId}
                amendmentProjectId={realAmendmentProject?.id || null}
                analyses={analysisData?.analyses}
                overallStrategy={analysisData?.overallStrategy}
                isAnalyzing={isAnalyzing}
                selectedRejectionId={selectedRejectionId}
                onSelectRejection={handleRejectionSelect}
                onGenerateAmendment={handleGenerateAmendment}
                onSave={handleSaveAmendmentDraft}
                onAnalyzeRejections={handleAnalyzeRejections}
              />
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - AI Assistant */}
      <Resizable
        size={{ width: aiPanelWidth, height: '100%' }}
        onResizeStop={handleAIPanelResize}
        minWidth={isAIPanelCollapsed ? PANEL_CONFIG.AI_PANEL.COLLAPSED_WIDTH : PANEL_CONFIG.AI_PANEL.MIN_WIDTH}
        maxWidth={PANEL_CONFIG.AI_PANEL.MAX_WIDTH}
        enable={{ left: !isAIPanelCollapsed }} // Disable resize when collapsed
        className="border-l relative"
      >
        {/* Collapse/Expand toggle button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleAIPanel}
          className={cn(
            "absolute -left-3 top-1/2 -translate-y-1/2 z-10",
            "h-6 w-6 rounded-full border bg-background shadow-sm",
            "hover:bg-accent hover:shadow-md transition-all"
          )}
          aria-label={isAIPanelCollapsed ? "Expand AI Assistant" : "Collapse AI Assistant"}
        >
          {isAIPanelCollapsed ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </Button>
        
        <AIAssistantPanel
          projectId={projectId}
          selectedOfficeActionId={selectedOfficeActionId}
          isCollapsed={isAIPanelCollapsed}
          officeAction={adaptedOfficeAction ? {
            id: adaptedOfficeAction.id,
            rejections: adaptedOfficeAction.rejections.map((r: any) => ({
              id: r.id,
              type: r.type,
              claims: r.claims,
              reasoning: r.examinerReasoning,
            })),
            priorArt: adaptedOfficeAction.allPriorArtReferences.map((ref: string, index: number) => ({
              id: `ref-${index}`,
              title: ref,
              patentNumber: ref,
              relevance: 'High',
            })),
          } : undefined}
          onAnalysisComplete={(analysis: any) => {
            logger.info('[AmendmentStudio] Analysis complete', { analysis });
          }}
          onQuickAction={(action: string) => {
            // When a quick action is clicked, expand the panel
            if (isAIPanelCollapsed) {
              toggleAIPanel();
            }
          }}
        />
      </Resizable>

      {/* Floating Insights - only shown in minimalist UI */}
      {isMinimalistUI && adaptedOfficeAction && (
        <FloatingInsights
          projectId={projectId}
          officeActionId={selectedOfficeActionId || undefined}
          examinerData={
            adaptedOfficeAction.metadata?.examinerName
              ? {
                  name: adaptedOfficeAction.metadata.examinerName,
                  allowanceRate: 0.35, // TODO: Get from actual data
                  artUnitAvgAllowance: 0.28, // TODO: Get from actual data
                }
              : undefined
          }
        />
      )}
    </div>
  );
}; 