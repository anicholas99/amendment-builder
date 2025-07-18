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

// Import new components
import { AmendmentProjectsList } from './AmendmentProjectsList';
import { OfficeActionNavigator } from './OfficeActionNavigator';
import { AIAssistantPanel } from './AIAssistantPanel';
import { DraftingWorkspace } from './DraftingWorkspace';
import { RejectionAnalysisPanel } from './RejectionAnalysisPanel';

// Import existing components
import { SimpleMainPanel } from '@/components/common/SimpleMainPanel';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOfficeActions, useOfficeAction } from '@/hooks/api/useAmendment';
import { useAnalyzeOfficeActionRejections, useRejectionAnalysis } from '@/hooks/api/useRejectionAnalysis';
import { AmendmentApiService } from '@/services/api/amendmentApiService';

interface AmendmentStudioProps {
  projectId: string;
  officeActionId?: string;
}

// Constants for panel sizing
const PANEL_CONFIG = {
  LEFT_PANEL_WIDTH: 320, // 80 * 4 = 320px (w-80)
  AI_PANEL: {
    DEFAULT_WIDTH: 700, // Increased default width for better AI assistant experience
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
  
  // State management
  const [selectedOfficeActionId, setSelectedOfficeActionId] = useState<string | null>(
    officeActionId || null
  );
  const [selectedRejectionId, setSelectedRejectionId] = useState<string | null>(null);
  const [showProjects, setShowProjects] = useState(!officeActionId);
  const [aiPanelWidth, setAiPanelWidth] = useState<number>(PANEL_CONFIG.AI_PANEL.DEFAULT_WIDTH);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Data fetching
  const { data: officeActions = [], isLoading: isLoadingOfficeActions } = useOfficeActions(projectId);
  const { data: selectedOA } = useOfficeAction(selectedOfficeActionId || '');

  // Rejection analysis hooks
  const analyzeRejections = useAnalyzeOfficeActionRejections(projectId, selectedOfficeActionId || '');
  const { data: analysisData } = useRejectionAnalysis(selectedOfficeActionId) as {
    data?: {
      analyses: any[];
      overallStrategy: any;
    };
  };

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
    setShowAnalysis(false);
  }, []);

  const handleAnalyzeRejections = useCallback(async () => {
    if (!selectedOfficeActionId || !canAnalyze) return;
    
    logger.info('[AmendmentStudio] Starting rejection analysis', { 
      officeActionId: selectedOfficeActionId 
    });
    
    try {
      await analyzeRejections.mutateAsync({ includeClaimCharts: true });
      setShowAnalysis(true);
    } catch (error) {
      logger.error('[AmendmentStudio] Failed to analyze rejections', { error });
    }
  }, [selectedOfficeActionId, canAnalyze, analyzeRejections]);

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
  }, []);

  if (showProjects) {
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
        <SimpleMainPanel
          header={
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
                {canAnalyze && !hasAnalysis && (
                  <Button 
                    onClick={handleAnalyzeRejections}
                    disabled={analyzeRejections.isPending}
                  >
                    {analyzeRejections.isPending ? 'Analyzing...' : 'Analyze Rejections'}
                  </Button>
                )}
                {hasAnalysis && !showAnalysis && (
                  <Button onClick={() => setShowAnalysis(true)}>
                    View Analysis
                  </Button>
                )}
              </div>
            </div>
          }
          contentPadding={true}
        >
          {!adaptedOfficeAction ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Select an Office Action to begin</p>
            </div>
          ) : showAnalysis && analysisData ? (
            <RejectionAnalysisPanel
              analyses={analysisData.analyses}
              overallStrategy={analysisData.overallStrategy}
              isLoading={analyzeRejections.isPending}
              selectedRejectionId={selectedRejectionId}
              onSelectRejection={handleRejectionSelect}
              onGenerateAmendment={handleGenerateAmendment}
            />
          ) : (
            <DraftingWorkspace
              projectId={projectId}
              selectedOfficeAction={adaptedOfficeAction}
              selectedOfficeActionId={selectedOfficeActionId}
              amendmentProjectId={`amendment-${selectedOfficeActionId}`}
            />
          )}
        </SimpleMainPanel>
      </div>

      {/* Right Panel - AI Assistant */}
      <Resizable
        size={{ width: aiPanelWidth, height: '100%' }}
        onResizeStop={handleAIPanelResize}
        minWidth={PANEL_CONFIG.AI_PANEL.MIN_WIDTH}
        maxWidth={PANEL_CONFIG.AI_PANEL.MAX_WIDTH}
        enable={{ left: true }}
        className="border-l"
      >
        <AIAssistantPanel
          projectId={projectId}
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
        />
      </Resizable>
    </div>
  );
}; 