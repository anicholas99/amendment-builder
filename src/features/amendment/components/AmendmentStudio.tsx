/**
 * Amendment Studio - Main Interface for Office Action Response
 * 
 * Handles routing between amendment projects list and studio workspace
 * Integrates all amendment components with clean state management
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { logger } from '@/utils/clientLogger';
import { cn } from '@/lib/utils';

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
    return officeActionData.rejections.find(r => r.id === selectedRejectionId);
  }, [officeActionData, selectedRejectionId]);

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

  // Render studio workspace
  return (
    <SimpleMainPanel
      header={renderStudioHeader()}
      contentPadding={false}
      viewHeightOffset={0}
    >
      <div className="h-full flex overflow-hidden">
        {/* Left Panel - Office Action Navigator */}
        <div className="w-80 border-r bg-gray-50 flex flex-col">
          <OfficeActionNavigator
            officeAction={officeActionData}
            selectedRejectionId={selectedRejectionId}
            onRejectionSelect={handleRejectionSelect}
            onPriorArtSelect={handlePriorArtSelect}
          />
        </div>

        {/* Center Panel - Drafting Workspace */}
        <div className="flex-1 bg-white flex flex-col min-w-0">
          <DraftingWorkspace
            selectedOfficeAction={officeActionData}
            selectedOfficeActionId={selectedOfficeActionId}
            onSave={handleSaveDraft}
            onExport={handleExportResponse}
          />
        </div>

        {/* Right Panel - AI Assistant */}
        <div className="w-80 border-l bg-gray-50 flex flex-col">
          <AIAssistantPanel
            projectId={projectId}
            officeAction={officeActionData ? {
              id: officeActionData.id,
              rejections: officeActionData.rejections.map(r => ({
                id: r.id,
                type: r.type,
                claims: r.claims,
                reasoning: r.examinerReasoning,
              })),
              priorArt: [], // TODO: Map prior art from officeActionData
            } : undefined}
            onAnalysisComplete={handleAnalysisGenerated}
          />
        </div>
      </div>
    </SimpleMainPanel>
  );
}; 