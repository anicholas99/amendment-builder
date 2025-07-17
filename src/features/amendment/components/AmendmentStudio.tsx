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
import { useOfficeActions } from '@/hooks/api/useAmendment';

interface AmendmentStudioProps {
  projectId: string;
  officeActionId?: string;
}

// Mock office action data for development
const createMockOfficeActionData = (officeActionId?: string) => {
  if (!officeActionId) return null;

  return {
    id: officeActionId,
    fileName: 'Non-Final Office Action - Dec 2024.pdf',
    metadata: {
      applicationNumber: '17/123,456',
      mailingDate: '2024-12-15',
      examinerName: 'Sarah Johnson',
      artUnit: '3685',
    },
    rejections: [
      {
        id: 'rej-1',
        type: '§103' as const,
        claims: ['1', '2', '3'],
        priorArtReferences: ['US8,123,456', 'US2020/0234567'],
        examinerReasoning: 'Claims 1-3 are rejected under 35 U.S.C. § 103 as being obvious over Smith (US 8,123,456) in view of Johnson (US 2020/0234567). Smith discloses a system for processing data but lacks real-time processing capability, which Johnson teaches.',
        rawText: 'Complete rejection text from office action...',
      },
      {
        id: 'rej-2',
        type: '§102' as const,
        claims: ['4'],
        priorArtReferences: ['US9,987,654'],
        examinerReasoning: 'Claim 4 is rejected under 35 U.S.C. § 102(a)(1) as being anticipated by Wilson (US 9,987,654). Wilson discloses every element of claim 4.',
        rawText: 'Complete rejection text for claim 4...',
      },
    ],
    allPriorArtReferences: ['US8,123,456', 'US2020/0234567', 'US9,987,654'],
    summary: {
      totalRejections: 2,
      rejectionTypes: ['§103', '§102'],
      totalClaimsRejected: 4,
      uniquePriorArtCount: 3,
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

  // Get office action data (mock for now)
  const officeActionData = useMemo(() => {
    if (!isStudioView || !amendmentId) return undefined;
    
    // Extract office action ID from amendment ID (mock logic)
    const officeActionId = amendmentId.replace('amendment-', '');
    return createMockOfficeActionData(officeActionId) || undefined;
  }, [isStudioView, amendmentId]);

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

  const handleSaveDraft = useCallback((content: any) => {
    logger.info('[AmendmentStudio] Draft saved', { 
      amendmentId, 
      claimCount: content.claimAmendments?.length || 0,
      argumentCount: content.argumentSections?.length || 0 
    });
    // TODO: Implement draft saving
  }, [amendmentId]);

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
            selectedRejection={selectedRejection}
            onAnalysisGenerated={handleAnalysisGenerated}
            onInsertText={handleInsertText}
          />
        </div>
      </div>
    </SimpleMainPanel>
  );
}; 