import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { useClaimRefinementView } from '../hooks/useClaimRefinementView';
import { useSearchHistory } from '@/hooks/api/useSearchHistory';
import ClaimSidebar from './ClaimSidebar';
import ClaimMainPanel from './ClaimMainPanel';
import ClaimHeader from './ClaimHeader';
import { EditParsedClaimDataModal } from './modals/EditParsedClaimDataModal';
import ViewLayout from '../../../components/layouts/ViewLayout';
import { VIEW_LAYOUT_CONFIG } from '@/constants/layout';
import {
  PriorArtReference,
  PriorArtDataToSave,
  ProcessedSavedPriorArt,
} from '@/types/domain/priorArt';
import {
  usePriorArtWithStatus,
  useSavePriorArt,
  useDeletePriorArt,
} from '@/hooks/api/usePriorArt';
import { logger } from '@/lib/monitoring/logger';
import { emitPriorArtEvent } from '@/features/search/utils/priorArtEvents';
import { useTemporaryState } from '@/hooks/useTemporaryState';

interface ClaimRefinementViewCleanProps {
  analyzedInvention?: Record<string, unknown>;
  setAnalyzedInvention?: (invention: Record<string, unknown>) => void;
}

/**
 * Main view component for the Claim Refinement feature.
 * This component orchestrates the main panel and the sidebar, delegating
 * all logic and state management to the `useClaimRefinementView` hook.
 */
const ClaimRefinementViewClean: React.FC<ClaimRefinementViewCleanProps> = ({
  analyzedInvention,
  setAnalyzedInvention,
}) => {
  const { activeProjectId } = useProjectData();
  const [claimViewMode, setClaimViewMode] = useState<'list' | 'box'>('box');

  // All complex claim-related logic is now in the hook.
  const hookResult = useClaimRefinementView({
    projectId: activeProjectId || '',
  });

  // Fetch search history for the current project
  const { data: searchHistory = [], isLoading: isLoadingSearchHistory } =
    useSearchHistory(activeProjectId);

  /* ============================
   *  Saved Prior Art Management
   * ============================ */
  // Fetch existing saved prior art for the active project
  const { priorArt: savedPriorArt } = usePriorArtWithStatus(activeProjectId);

  // Map raw DB records to UI-friendly ProcessedSavedPriorArt
  const processedSavedPriorArt: ProcessedSavedPriorArt[] = React.useMemo(() => {
    return savedPriorArt.map(item => {
      const priorArtData: PriorArtReference = {
        number: item.patentNumber,
        patentNumber: item.patentNumber,
        title: item.title || '',
        abstract: item.abstract || undefined,
        source: 'Manual', // Saved items are user-selected
        relevance: 100,
        url: item.url || undefined,
        authors: item.authors ? [item.authors] : undefined,
        publicationDate: item.publicationDate || undefined,
      };

      return {
        ...item,
        priorArtData,
      } as ProcessedSavedPriorArt;
    });
  }, [savedPriorArt]);

  // Mutation hook to save a prior-art reference
  const savePriorArtMutation = useSavePriorArt();

  /* ============================
   *  Delete Prior Art Handling
   * ============================ */
  const deletePriorArtMutation = useDeletePriorArt();

  const handleRemovePriorArt = useCallback(
    async (index: number, art: ProcessedSavedPriorArt) => {
      if (!activeProjectId || !art?.id) {
        logger.error(
          '[ClaimRefinement] Missing projectId or art id when deleting',
          {
            activeProjectId,
            artId: art?.id,
          }
        );
        return;
      }

      try {
        await deletePriorArtMutation.mutateAsync({
          projectId: activeProjectId,
          priorArtId: art.id,
        });
        // Emit event so other listeners refresh if needed
        emitPriorArtEvent({
          projectId: activeProjectId,
          patentNumber: art.patentNumber,
          action: 'removed',
        });
      } catch (error) {
        logger.error('[ClaimRefinement] Failed to delete prior art', error);
      }
    },
    [activeProjectId, deletePriorArtMutation]
  );

  /**
   * Handler invoked when the user clicks the bookmark icon on a reference card.
   * Converts the UI reference structure to the API payload shape and persists it.
   */
  const handleSavePriorArt = async (reference: PriorArtReference) => {
    if (!activeProjectId) return;

    const payload: PriorArtDataToSave = {
      patentNumber: reference.number || reference.patentNumber,
      title: reference.title,
      abstract: reference.abstract,
      url: reference.url ?? reference.sourceUrl,
      authors: reference.authors?.join(', '),
      publicationDate: reference.year ?? reference.publicationDate,
    };

    await savePriorArtMutation.mutateAsync({
      projectId: activeProjectId,
      priorArt: payload,
    });

    // Emit event to notify other components about the saved prior art
    emitPriorArtEvent({
      projectId: activeProjectId,
      patentNumber: reference.number || reference.patentNumber,
      action: 'saved',
    });
  };

  const onToggleViewMode = () => {
    setClaimViewMode(prev => (prev === 'box' ? 'list' : 'box'));
  };

  // Local state for the "Add New Claim" form.
  // This could be moved into the main hook later if needed.
  const [isAddingClaim, setIsAddingClaim] = useState(false);
  const [newClaimText, setNewClaimText] = useState('');
  const [newClaimDependsOn, setNewClaimDependsOn] = useState('');

  // Track the last added claim number for UI feedback
  const [lastAddedClaimNumber, setLastAddedClaimNumber] = useTemporaryState<
    string | undefined
  >(undefined, 3000);

  const handleAddClaim = useCallback(async () => {
    // Ensure the method exists before calling
    if (!hookResult.handleAddNewClaim) {
      logger.error(
        '[ClaimRefinementViewClean] handleAddNewClaim method not available'
      );
      return;
    }

    try {
      // Call the hook's method to add the claim (now async)
      const newClaimNumber = await hookResult.handleAddNewClaim({
        text: newClaimText,
        dependsOn: newClaimDependsOn,
      });

      // Track the new claim number for UI feedback
      if (newClaimNumber) {
        setLastAddedClaimNumber(newClaimNumber.toString());
      }

      // Reset form state on success
      setIsAddingClaim(false);
      setNewClaimText('');
      setNewClaimDependsOn('');
    } catch (error) {
      // Error handling is done in the hook, just log here
      logger.error('[ClaimRefinementViewClean] Failed to add claim', { error });
    }
  }, [newClaimText, newClaimDependsOn, hookResult, setLastAddedClaimNumber]);

  const handleCancelAddClaim = useCallback(() => {
    setIsAddingClaim(false);
    setNewClaimText('');
    setNewClaimDependsOn('');
  }, []);

  // Wrap handleInsertClaim to track the inserted claim
  const handleInsertClaim = useCallback(
    async (afterClaimId: string) => {
      try {
        await hookResult.handleInsertClaim(afterClaimId);
        // After successful insertion, track the new claim number
        // We'll let the handleInsertClaim function itself handle the toast and tracking
      } catch (error) {
        logger.error('[ClaimRefinementViewClean] Failed to insert claim', {
          error,
        });
      }
    },
    [hookResult]
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <ViewLayout
        header={<ClaimHeader />}
        mainContent={
          <ClaimMainPanel
            projectId={activeProjectId || ''}
            claims={hookResult.claims}
            isLoadingClaims={hookResult.isLoadingClaims}
            claimViewMode={claimViewMode}
            onToggleViewMode={onToggleViewMode}
            onGenerateClaim1={hookResult.onGenerateClaim1}
            isRegeneratingClaim1={hookResult.isGeneratingClaim1}
            onClaimChange={hookResult.handleClaimChange}
            onDeleteClaim={hookResult.handleDeleteClaim}
            onInsertClaim={handleInsertClaim}
            onReorderClaim={hookResult.handleReorderClaim}
            isAddingClaim={isAddingClaim}
            onStartAddClaim={() => setIsAddingClaim(true)}
            onCancelAddClaim={handleCancelAddClaim}
            onAddClaim={handleAddClaim}
            newClaimText={newClaimText}
            setNewClaimText={setNewClaimText}
            newClaimDependsOn={newClaimDependsOn}
            setNewClaimDependsOn={setNewClaimDependsOn}
          />
        }
        sidebarContent={
          <ClaimSidebar
            activeTab={hookResult.activeTab}
            handleTabChange={(index: number) =>
              hookResult.setActiveTab(index.toString())
            }
            claimSyncState={{
              ...hookResult.claimSyncState,
              onOpenModal: hookResult.openEditParsedDataModal,
            }}
            onSearch={hookResult.handleExecuteSearch}
            isParsingClaim={hookResult.isParsingClaim}
            searchMode="basic"
            messages={[]}
            onSendMessage={() => {}}
            handleRemovePriorArt={handleRemovePriorArt}
            onSavePriorArt={handleSavePriorArt}
            onOpenPriorArtDetails={() => {}}
            analysisData={null}
            isAnalyzing={false}
            handleAnalyzePriorArt={() => {}}
            handleOpenApplyModal={() => {}}
            analyzedInvention={analyzedInvention}
            handleInsertNewClaim={() => {}}
            selectedReference={null}
            handleClaimChange={hookResult.handleClaimChange}
            claims={hookResult.claims}
            projectId={activeProjectId || ''}
            parsedElements={hookResult.claimSyncState.parsedElements}
          />
        }
        {...VIEW_LAYOUT_CONFIG.DEFAULT_PROPS}
      />

      <EditParsedClaimDataModal
        isOpen={hookResult.isEditParsedDataModalOpen}
        onClose={hookResult.closeEditParsedDataModal}
        parsedElements={hookResult.claimSyncState.parsedElements}
        searchQueries={hookResult.claimSyncState.searchQueries}
        onSave={hookResult.handleSaveParsedData}
        onSaveAndResync={hookResult.handleSaveAndResyncParsedData}
        onResyncElementsOnly={hookResult.handleResyncElementsOnly}
        onResyncQueriesOnly={hookResult.handleResyncQueriesOnly}
      />
    </DndProvider>
  );
};

export default ClaimRefinementViewClean;
