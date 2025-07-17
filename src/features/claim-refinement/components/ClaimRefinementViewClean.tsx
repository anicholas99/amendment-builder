import React, { useState, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useRouter } from 'next/router';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { useCurrentProjectId } from '@/hooks/useCurrentProjectId';
import { useClaimRefinementView } from '../hooks/useClaimRefinementView';
import { useSearchHistory } from '@/hooks/api/useSearchHistory';
import ClaimSidebar from './ClaimSidebar';
import ClaimMainPanelShadcn from './ClaimMainPanelShadcn';
import ClaimHeaderShadcn from './ClaimHeaderShadcn';
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
import { logger } from '@/utils/clientLogger';
import { emitPriorArtEvent } from '@/features/search/utils/priorArtEvents';
import { useTemporaryState } from '@/hooks/useTemporaryState';
import { useQueryClient } from '@tanstack/react-query';

interface ClaimRefinementViewCleanProps {
  analyzedInvention?: Record<string, unknown>;
  _setAnalyzedInvention?: (invention: Record<string, unknown>) => void;
}

/**
 * Main view component for the Claim Refinement feature.
 * This component orchestrates the main panel and the sidebar, delegating
 * all logic and state management to the `useClaimRefinementView` hook.
 */
const ClaimRefinementViewClean: React.FC<ClaimRefinementViewCleanProps> = ({
  analyzedInvention,
  _setAnalyzedInvention, // Prefixed with underscore - prop reserved for future use
}) => {
  // Prefer the route-derived projectId first, then fall back to context.
  // This guarantees that project-scoped data (e.g., saved prior art) loads immediately
  // on initial render even before the ProjectDataContext is fully hydrated.
  const { activeProjectId: contextProjectId } = useProjectData();
  const routeProjectId = useCurrentProjectId();
  const activeProjectId = routeProjectId || contextProjectId;
  const queryClient = useQueryClient();
  const router = useRouter();

  // Get view mode from URL params, defaulting to 'box'
  const urlViewMode = router.query.viewMode as string;
  const [claimViewMode, setClaimViewMode] = useState<'box' | 'compact'>(() => {
    if (urlViewMode === 'box' || urlViewMode === 'compact') {
      return urlViewMode;
    }
    // Map 'list' to 'box' for backwards compatibility
    if (urlViewMode === 'list') {
      return 'box';
    }
    return 'box';
  });

  // Update URL when view mode changes
  useEffect(() => {
    if (claimViewMode && router.isReady) {
      const currentQuery = { ...router.query };
      if (claimViewMode !== 'box') {
        // Only add to URL if not default
        currentQuery.viewMode = claimViewMode;
      } else {
        // Remove from URL if default
        delete currentQuery.viewMode;
      }

      // Use shallow routing to avoid page reload
      router.push(
        {
          pathname: router.pathname,
          query: currentQuery,
        },
        undefined,
        { shallow: true }
      );
    }
  }, [claimViewMode, router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // Only refetch if the project changes or we suspect external updates
  useEffect(() => {
    // Don't refetch on every mount - trust the cache and optimistic updates
    logger.debug('[ClaimRefinementView] Component mounted', {
      projectId: activeProjectId,
    });
  }, [activeProjectId]);

  // All complex claim-related logic is now in the hook.
  const hookResult = useClaimRefinementView({
    projectId: activeProjectId || '',
  });

  // Cleanup effect to ensure navigation is never blocked
  useEffect(() => {
    return () => {
      // Clear any potential blocking states when unmounting
      logger.debug('[ClaimRefinementView] Cleaning up on unmount');

      // Clear any pending React Query operations
      queryClient.cancelQueries();

      // Restore body scroll if it was locked
      document.body.style.overflow = '';
      document.body.style.position = '';
    };
  }, [queryClient]);

  // Fetch search history for the current project
  // Currently unused but may be needed for future features
  const { data: _searchHistory = [], isLoading: _isLoadingSearchHistory } =
    useSearchHistory(activeProjectId);

  /* ============================
   *  Saved Prior Art Management
   * ============================ */
  // Fetch existing saved prior art for the active project
  const { priorArt: savedPriorArt } = usePriorArtWithStatus(activeProjectId);

  // Map raw DB records to UI-friendly ProcessedSavedPriorArt
  // Note: This processed data is passed to child components
  const _processedSavedPriorArt: ProcessedSavedPriorArt[] =
    React.useMemo(() => {
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
    setClaimViewMode(prev => {
      if (prev === 'box') return 'compact';
      if (prev === 'compact') return 'box';
      return 'box';
    });
  };

  const onSelectViewMode = (mode: 'box' | 'compact') => {
    setClaimViewMode(mode);
  };

  // Local state for the "Add New Claim" form.
  // This could be moved into the main hook later if needed.
  const [isAddingClaim, setIsAddingClaim] = useState(false);
  const [newClaimText, setNewClaimText] = useState('');
  const [newClaimDependsOn, setNewClaimDependsOn] = useState('');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [addClaimCooldown, setAddClaimCooldown] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Track the last added claim number for UI feedback
  // Currently unused but kept for potential future UI enhancements
  const [_lastAddedClaimNumber, setLastAddedClaimNumber] = useTemporaryState<
    string | undefined
  >(undefined, 3000);

  // Update countdown timer
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => {
        setCooldownRemaining(prev => Math.max(0, prev - 100));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [cooldownRemaining]);

  const handleAddClaim = useCallback(async () => {
    // Ensure the method exists before calling
    if (!hookResult.handleAddNewClaim) {
      logger.error(
        '[ClaimRefinementViewClean] handleAddNewClaim method not available'
      );
      return;
    }

    // Prevent rapid clicks with cooldown
    if (addClaimCooldown) {
      return;
    }

    try {
      setIsSubmittingClaim(true);
      setAddClaimCooldown(true);

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

      // Set cooldown timer
      setCooldownRemaining(1500);

      // Keep cooldown active for 1.5 seconds after successful add
      setTimeout(() => {
        setAddClaimCooldown(false);
      }, 1500);
    } catch (error) {
      // Error handling is done in the hook, just log here
      logger.error('[ClaimRefinementViewClean] Failed to add claim', { error });
      // Reset cooldown on error so user can retry
      setAddClaimCooldown(false);
      setCooldownRemaining(0);
    } finally {
      setIsSubmittingClaim(false);
    }
  }, [
    newClaimText,
    newClaimDependsOn,
    hookResult,
    setLastAddedClaimNumber,
    addClaimCooldown,
  ]);

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
        header={<ClaimHeaderShadcn />}
        mainContent={
          <ClaimMainPanelShadcn
            projectId={activeProjectId || ''}
            claims={hookResult.claims?.map(claim => ({
              id: claim.id,
              claimNumber: claim.number,
              text: claim.text,
            }))}
            isLoadingClaims={hookResult.isLoadingClaims}
            claimViewMode={claimViewMode}
            onToggleViewMode={onToggleViewMode}
            onSelectViewMode={onSelectViewMode}
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
            isSubmittingClaim={isSubmittingClaim}
            newlyAddedClaimNumbers={hookResult.newlyAddedClaimNumbers}
            isAddClaimDisabled={addClaimCooldown}
            cooldownRemaining={cooldownRemaining}
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
            onSendMessage={() => {
              // Intentionally empty - placeholder for future chat functionality
            }}
            handleRemovePriorArt={handleRemovePriorArt}
            onSavePriorArt={handleSavePriorArt}
            onOpenPriorArtDetails={() => {
              // Intentionally empty - placeholder for future prior art details modal
            }}
            analysisData={null}
            isAnalyzing={false}
            handleAnalyzePriorArt={() => {
              // Intentionally empty - placeholder for future prior art analysis
            }}
            handleOpenApplyModal={() => {
              // Intentionally empty - placeholder for future apply modal
            }}
            analyzedInvention={analyzedInvention ?? null}
            handleInsertNewClaim={() => {
              // Intentionally empty - placeholder for future claim insertion
            }}
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
