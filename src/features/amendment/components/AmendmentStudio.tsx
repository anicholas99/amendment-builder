/**
 * Amendment Studio - Main Interface for Office Action Response
 * 
 * 3-panel layout for comprehensive amendment workflow:
 * - Left: Office Action Navigator (rejections, claims, prior art)
 * - Center: Drafting Workspace (claim amendments, arguments)
 * - Right: AI Assistant Tools (analysis, suggestions, search)
 * 
 * Follows existing UI patterns with SimpleMainPanel and consistent styling.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimpleMainPanel } from '@/components/common/SimpleMainPanel';
import { useOfficeActions, useUploadOfficeAction } from '@/hooks/api/useAmendment';
import { useRouter } from 'next/router';
import { logger } from '@/utils/clientLogger';
import { AmendmentStudioProps } from '@/types/domain/amendment';

// TODO: Create these child components
const OfficeActionNavigator = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
const DraftingWorkspace = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
const AIAssistantPanel = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;

// ============ INTERFACES ============

interface AmendmentStudioState {
  selectedOfficeActionId: string | null;
  selectedRejectionId: string | null;
  activeTab: 'overview' | 'rejections' | 'amendments' | 'arguments';
  isAnalyzing: boolean;
  analysisData: any | null;
}

// ============ MAIN COMPONENT ============

export const AmendmentStudio: React.FC<AmendmentStudioProps> = ({
  projectId,
  officeActionId: initialOfficeActionId,
}) => {
  const router = useRouter();
  
  // ============ STATE ============
  
  const [studioState, setStudioState] = useState<AmendmentStudioState>({
    selectedOfficeActionId: initialOfficeActionId || null,
    selectedRejectionId: null,
    activeTab: 'overview',
    isAnalyzing: false,
    analysisData: null,
  });

  // ============ QUERIES ============
  
  const {
    data: officeActions = [],
    isLoading: isLoadingOfficeActions,
    error: officeActionsError,
  } = useOfficeActions(projectId);

  const uploadOfficeActionMutation = useUploadOfficeAction();

  // ============ COMPUTED VALUES ============
  
  const selectedOfficeAction = useMemo(() => {
    if (!studioState.selectedOfficeActionId) return null;
    return officeActions.find(oa => oa.id === studioState.selectedOfficeActionId);
  }, [officeActions, studioState.selectedOfficeActionId]);

  const hasOfficeActions = officeActions.length > 0;
  const isUploading = uploadOfficeActionMutation.isPending;

  // ============ HANDLERS ============
  
  const handleOfficeActionSelect = useCallback((officeActionId: string) => {
    setStudioState(prev => ({
      ...prev,
      selectedOfficeActionId: officeActionId,
      selectedRejectionId: null,
      activeTab: 'overview',
    }));

    // Update URL without page reload
    router.push(
      `/projects/${projectId}/amendments/${officeActionId}`,
      undefined,
      { shallow: true }
    );
  }, [projectId, router]);

  const handleRejectionSelect = useCallback((rejectionId: string) => {
    setStudioState(prev => ({
      ...prev,
      selectedRejectionId: rejectionId,
      activeTab: 'rejections',
    }));
  }, []);

  const handleTabChange = useCallback((tab: AmendmentStudioState['activeTab']) => {
    setStudioState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const handleFileUpload = useCallback(async (file: File, metadata?: any) => {
    try {
      logger.info('[AmendmentStudio] Starting file upload', {
        projectId,
        fileName: file.name,
      });

      const result = await uploadOfficeActionMutation.mutateAsync({
        projectId,
        file,
        metadata,
      });

      if (result.success && result.officeAction) {
        // Auto-select the newly uploaded office action
        handleOfficeActionSelect(result.officeAction.id);
      }
    } catch (error) {
      logger.error('[AmendmentStudio] File upload failed', {
        error,
        projectId,
        fileName: file.name,
      });
    }
  }, [projectId, uploadOfficeActionMutation, handleOfficeActionSelect]);

  const handleAnalysisUpdate = useCallback((analysisData: any) => {
    setStudioState(prev => ({
      ...prev,
      analysisData,
      isAnalyzing: false,
    }));
  }, []);

  const handleStartAnalysis = useCallback(() => {
    setStudioState(prev => ({ ...prev, isAnalyzing: true }));
  }, []);

  // ============ RENDER HELPERS ============
  
  const renderEmptyState = () => (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#6B7280' }}>
        No Office Actions Yet
      </h2>
      <p style={{ fontSize: '1rem', color: '#9CA3AF', marginBottom: '1.5rem', maxWidth: '400px' }}>
        Upload an Office Action document to start generating your amendment response.
      </p>
      <Button
        onClick={() => {
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = '.pdf,.docx';
          fileInput.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              handleFileUpload(file);
            }
          };
          fileInput.click();
        }}
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : 'Upload Office Action'}
      </Button>
    </div>
  );

  const renderLoadingState = () => (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%'
    }}>
      <div>Loading...</div>
      <p style={{ fontSize: '1.125rem', color: '#6B7280', marginTop: '1rem' }}>
        Loading Office Actions...
      </p>
    </div>
  );

  const renderErrorState = () => (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '2rem'
    }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#EF4444' }}>
        Error Loading Office Actions
      </h2>
      <p style={{ fontSize: '1rem', color: '#9CA3AF', marginBottom: '1rem' }}>
        {officeActionsError instanceof Error 
          ? officeActionsError.message 
          : 'An unexpected error occurred'}
      </p>
      <Button onClick={() => window.location.reload()}>
        Retry
      </Button>
    </div>
  );

  const renderHeader = () => (
    <div style={{ 
      padding: '1rem',
      borderBottom: '1px solid #E5E7EB',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1F2937' }}>
          Amendment Studio
        </h1>
        {selectedOfficeAction && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
              {(selectedOfficeAction as any).fileName || 'Office Action'}
            </span>
            <Badge>
              Processing
            </Badge>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {studioState.isAnalyzing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚙️</span>
            <span style={{ fontSize: '0.875rem', color: '#3B82F6' }}>
              Analyzing...
            </span>
          </div>
        )}
        
        <Badge>
          {officeActions.length} Office Action{officeActions.length !== 1 ? 's' : ''}
        </Badge>
      </div>
    </div>
  );

  const renderMainContent = () => {
    if (isLoadingOfficeActions) {
      return renderLoadingState();
    }

    if (officeActionsError) {
      return renderErrorState();
    }

    if (!hasOfficeActions) {
      return renderEmptyState();
    }

    return (
      <div style={{ 
        height: '100%',
        overflow: 'hidden',
        display: 'flex'
      }}>
        {/* Left Panel - Office Action Navigator */}
        <div style={{
          width: '320px',
          borderRight: '1px solid #E5E7EB',
          backgroundColor: '#F9FAFB',
          overflow: 'hidden'
        }}>
          <OfficeActionNavigator>
            <div style={{ padding: '1rem' }}>
              <h3>Office Actions</h3>
              <p>Total: {officeActions.length}</p>
              {/* TODO: Implement navigator */}
            </div>
          </OfficeActionNavigator>
        </div>

        {/* Center Panel - Drafting Workspace */}
        <div style={{
          flex: '1',
          overflow: 'hidden',
          backgroundColor: 'white'
        }}>
          <DraftingWorkspace>
            <div style={{ padding: '1rem' }}>
              <h3>Drafting Workspace</h3>
              {selectedOfficeAction ? (
                <p>Selected: {(selectedOfficeAction as any).fileName || 'Office Action'}</p>
              ) : (
                <p>No office action selected</p>
              )}
              {/* TODO: Implement workspace */}
            </div>
          </DraftingWorkspace>
        </div>

        {/* Right Panel - AI Assistant */}
        <div style={{
          width: '300px',
          borderLeft: '1px solid #E5E7EB',
          backgroundColor: '#F9FAFB',
          overflow: 'hidden'
        }}>
          <AIAssistantPanel>
            <div style={{ padding: '1rem' }}>
              <h3>AI Assistant</h3>
              <p>Analysis tools and suggestions</p>
              {/* TODO: Implement assistant */}
            </div>
          </AIAssistantPanel>
        </div>
      </div>
    );
  };

  // ============ MAIN RENDER ============
  
  return (
    <SimpleMainPanel
      header={renderHeader()}
      contentPadding={false}
    >
      {renderMainContent()}
    </SimpleMainPanel>
  );
}; 