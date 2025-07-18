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

// Import existing components
import { SimpleMainPanel } from '@/components/common/SimpleMainPanel';
import { useOfficeActions, useOfficeAction } from '@/hooks/api/useAmendment';
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
    r.claimNumbers.forEach((claim: string) => allClaimNumbers.add(claim));
    r.citedPriorArt.forEach((ref: string) => allPriorArtRefs.add(ref));
  });

  return {
    id: processedOA.id,
    fileName: processedOA.fileName,
    metadata: {
      applicationNumber: processedOA.metadata?.applicationNumber,
      mailingDate: processedOA.dateIssued?.toISOString(),
      examinerName: processedOA.examiner?.name,
      artUnit: processedOA.examiner?.artUnit,
    },
    rejections: processedOA.rejections.map((r: any) => ({
      id: r.id,
      type: r.type,
      claims: r.claimNumbers,
      priorArtReferences: r.citedPriorArt,
      examinerReasoning: r.examinerText,
      rawText: r.examinerText, // Use examiner text as raw text
    })),
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
  officeActionId: initialOfficeActionId,
}) => {
  const router = useRouter();
  
  // Get amendment ID from query params (for studio view)
  const amendmentId = router.query.amendmentId as string;
  const isStudioView = !!amendmentId;

  // Studio state
  const [selectedRejectionId, setSelectedRejectionId] = useState<string | null>(null);
  const [selectedOfficeActionId, setSelectedOfficeActionId] = useState<string | null>(
    initialOfficeActionId || null
  );

  // AI Assistant panel width state with localStorage persistence
  const [aiPanelWidth, setAiPanelWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('amendmentStudio-aiPanelWidth');
      if (saved) {
        const width = parseInt(saved, 10);
        if (width >= PANEL_CONFIG.AI_PANEL.MIN_WIDTH && width <= PANEL_CONFIG.AI_PANEL.MAX_WIDTH) {
          return width;
        }
      }
    }
    return PANEL_CONFIG.AI_PANEL.DEFAULT_WIDTH;
  });

  // Persist AI panel width preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('amendmentStudio-aiPanelWidth', aiPanelWidth.toString());
    }
  }, [aiPanelWidth]);

  // Fetch office actions
  const {
    data: officeActions = [],
    isLoading: isLoadingOfficeActions,
    error: officeActionsError,
    refetch: refetchOfficeActions,
  } = useOfficeActions(projectId);

  // Extract office action ID from amendment ID
  const extractedOfficeActionId = useMemo(() => {
    if (!isStudioView || !amendmentId) return null;
    return amendmentId.replace('amendment-', '');
  }, [isStudioView, amendmentId]);

  // Fetch office action details
  const {
    data: rawOfficeActionData,
    isLoading: isLoadingOfficeAction,
    error: officeActionError,
  } = useOfficeAction(extractedOfficeActionId || '');

  // Adapt office action data for UI components
  const officeActionData = useMemo(() => {
    return adaptOfficeActionData(rawOfficeActionData);
  }, [rawOfficeActionData]);

  // Get selected rejection
  const selectedRejection = useMemo(() => {
    if (!officeActionData || !selectedRejectionId) return undefined;
    return officeActionData.rejections.find((r: any) => r.id === selectedRejectionId);
  }, [officeActionData, selectedRejectionId]);

  // Handle AI panel resize
  const handleAiPanelResize: ResizeCallback = useCallback(
    (e, direction, ref) => {
      const newWidth = ref.offsetWidth;
      const clampedWidth = Math.min(
        PANEL_CONFIG.AI_PANEL.MAX_WIDTH,
        Math.max(PANEL_CONFIG.AI_PANEL.MIN_WIDTH, newWidth)
      );
      setAiPanelWidth(clampedWidth);
    },
    []
  );

  // Handlers
  const handleRejectionSelect = useCallback((rejectionId: string) => {
    setSelectedRejectionId(rejectionId);
    logger.debug('[AmendmentStudio] Rejection selected', { rejectionId });
  }, []);

  const handlePriorArtSelect = useCallback((reference: string) => {
    logger.debug('[AmendmentStudio] Prior art selected', { reference });
    // TODO: Implement prior art detail view
  }, []);

  const handleAnalysisGenerated = useCallback((analysis: any) => {
    logger.info('[AmendmentStudio] AI analysis generated', { 
      analysisId: analysis.id, 
      type: analysis.type 
    });
  }, []);

  const handleInsertText = useCallback((text: string) => {
    logger.info('[AmendmentStudio] Text insertion requested', { 
      textLength: text.length 
    });
    // TODO: Implement text insertion into drafting workspace
  }, []);

  const handleSaveDraft = useCallback(async (content: any) => {
    if (!extractedOfficeActionId) {
      logger.warn('[AmendmentStudio] Cannot save draft without office action ID');
      return;
    }

    try {
      await AmendmentApiService.saveAmendmentDraft(
        projectId,
        extractedOfficeActionId,
        content
      );
      
      logger.info('[AmendmentStudio] Draft saved successfully', { 
        amendmentId, 
        claimCount: content.claimAmendments?.length || 0,
        argumentCount: content.argumentSections?.length || 0 
      });
    } catch (error) {
      logger.error('[AmendmentStudio] Failed to save draft', {
        amendmentId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, [amendmentId, extractedOfficeActionId, projectId]);

  const handleExportResponse = useCallback(() => {
    logger.info('[AmendmentStudio] Export requested', { amendmentId });
    // TODO: Implement export functionality
  }, [amendmentId]);

  // Navigation handlers
  const handleBackToList = useCallback(() => {
    router.push(`${router.asPath.split('/studio')[0]}`);
  }, [router]);

  // Render list view
  if (!isStudioView) {
    return (
      <AmendmentProjectsList 
        projectId={projectId}
      />
    );
  }

  // Render studio header
  const renderStudioHeader = () => (
    <div className="p-4 bg-white border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToList}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Back to Amendments
          </button>
          
          <div className="h-6 w-px bg-gray-300" />
          
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Amendment Studio</h1>
            {officeActionData && (
              <p className="text-sm text-gray-600">
                {officeActionData.fileName} • {officeActionData.summary.totalRejections} rejections
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {selectedRejection && (
            <div className="text-sm text-gray-600">
              Analyzing {selectedRejection.type} rejection
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render studio workspace with resizable AI panel
  return (
    <SimpleMainPanel
      header={renderStudioHeader()}
      contentPadding={false}
      viewHeightOffset={0}
    >
      <div className="h-full flex overflow-hidden">
        {/* Left Panel - Office Action Navigator (Fixed Width) */}
        <div 
          className="border-r bg-gray-50 flex flex-col flex-shrink-0"
          style={{ width: PANEL_CONFIG.LEFT_PANEL_WIDTH }}
        >
          <OfficeActionNavigator
            officeAction={officeActionData}
            selectedRejectionId={selectedRejectionId}
            onRejectionSelect={handleRejectionSelect}
            onPriorArtSelect={handlePriorArtSelect}
            projectId={projectId}
          />
        </div>

        {/* Center Panel - Drafting Workspace (Flexible) */}
        <div className="flex-1 bg-white flex flex-col min-w-0">
          <DraftingWorkspace
            selectedOfficeAction={officeActionData}
            selectedOfficeActionId={selectedOfficeActionId}
            amendmentProjectId={amendmentId}
            onSave={handleSaveDraft}
            onExport={handleExportResponse}
          />
        </div>

        {/* Right Panel - AI Assistant (Resizable) */}
        <Resizable
          size={{
            width: aiPanelWidth,
            height: '100%',
          }}
          minWidth={PANEL_CONFIG.AI_PANEL.MIN_WIDTH}
          maxWidth={PANEL_CONFIG.AI_PANEL.MAX_WIDTH}
          minHeight="100%"
          maxHeight="100%"
          enable={{
            top: false,
            right: false,
            bottom: false,
            left: true, // Enable resize from left edge
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
          onResizeStop={handleAiPanelResize}
          handleStyles={{
            left: {
              width: '12px',
              left: '-6px',
              cursor: 'col-resize',
              zIndex: 10,
              background: 'transparent',
              borderLeft: '1px solid transparent',
              transition: 'all 0.2s ease',
            },
          }}
          handleClasses={{
            left: 'ai-panel-resize-handle hover:border-l-blue-400 hover:bg-blue-50/50',
          }}
          className="border-l bg-gray-50 flex flex-col flex-shrink-0"
        >
          <AIAssistantPanel
            projectId={projectId}
            officeAction={officeActionData ? {
              id: officeActionData.id,
              rejections: officeActionData.rejections.map((r: any) => ({
                id: r.id,
                type: r.type,
                claims: r.claims,
                reasoning: r.examinerReasoning,
              })),
              priorArt: [], // TODO: Map prior art from officeActionData
            } : undefined}
            onAnalysisComplete={handleAnalysisGenerated}
          />
        </Resizable>
      </div>
    </SimpleMainPanel>
  );
}; 