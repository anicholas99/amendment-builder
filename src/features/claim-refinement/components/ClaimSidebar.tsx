import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { logger } from '@/utils/clientLogger';
import SidebarTabContainer from '@/components/layouts/SidebarTabContainer';
import { PriorArtReference } from '../../../types/claimTypes';
import { ProcessedSavedPriorArt as SavedPriorArtType } from '../../search/types';
import { useProjectData } from '@/contexts';
import { useCurrentProjectId } from '@/hooks/useCurrentProjectId';
import { useCitationHandler } from '../../citation-extraction/hooks/useCitationHandler';
import { FullAnalysisResponse } from '../../../types/priorArtAnalysisTypes';
import { InventionData } from '@/types/invention';
import { useRouter } from 'next/router';
import CitationsTabContainer from '@/features/citation-extraction/components/CitationsTabContainer';
import SavedPriorArtTabContainer from '@/features/search/components/SavedPriorArtTabContainer';
// NOTE: Prior Art Analysis temporarily disabled - may be reactivated in the future
// import PriorArtAnalysisTabContainer from './PriorArtAnalysisTabContainer';
import { SearchTabContainer } from '@/features/search/components/SearchTabContainer';
// NOTE: Image Analysis temporarily disabled - may be reactivated in the future
// import ImageAnalysisTabContainer from './ImageAnalysisTabContainer';
import type { UseClaimSyncStateReturn } from '../hooks/useClaimSyncState';

// Import new hooks and components
import { useClaimText } from '../hooks/useClaimText';
import { useClaimSidebarData } from '../hooks/useClaimSidebarData';
import { useClaimAmendment } from '../hooks/useClaimAmendment';
import { useSidebarCitationLogic } from '../hooks/useSidebarCitationLogic';
import { SidebarTabIcons } from './sidebar/SidebarTabIcons';
import { ChatTab } from './sidebar/ChatTab';
import { ClaimAmendmentModalShadcn } from './ClaimAmendmentModalShadcn';

// Define the Message interface to match what useProjectSidebarData expects
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

interface ClaimSidebarProps {
  activeTab: string;
  handleTabChange: (index: number) => void;
  messages: Message[];
  onSendMessage: (message: string) => void;
  handleRemovePriorArt: (index: number, art: SavedPriorArtType) => void;
  isParsingClaim: boolean;
  searchMode: 'basic' | 'advanced';
  onSearch: (mode: 'basic' | 'advanced') => void;
  onSavePriorArt: (reference: PriorArtReference) => void;
  onOpenPriorArtDetails: (reference: PriorArtReference) => void;
  parsedElements?: string[];
  onDirectSearch?: () => void;
  onSetSelectedSearchId?: (id: string) => void;
  setCitationContext?: (context: {
    searchId: string;
    referenceNumber: string;
  }) => void;

  // --- Props for Analysis Feature ---
  analysisData: FullAnalysisResponse | null;
  isAnalyzing: boolean;
  handleAnalyzePriorArt: (
    searchHistoryId: string,
    selectedReferenceNumbers: string[],
    forceRefresh: boolean
  ) => void;
  handleOpenApplyModal: (data: {
    elementText: string;
    newLanguage: string;
  }) => void;
  analyzedInvention: InventionData | null;

  // New prop for inserting claims
  handleInsertNewClaim: (
    afterClaimNumber: string,
    text: string,
    dependsOn: string
  ) => void;

  // Add props for selectedReference state
  selectedReference: string | null;

  // New prop for handleClaimChange
  handleClaimChange: (claimNumber: string, text: string) => void;

  // Add claims prop
  claims?: Array<{ id: string; number: number; text: string }>;

  // Function to refresh invention data from database
  refreshInventionData?: () => Promise<void>;

  projectId: string;

  // Claim sync state from parent
  claimSyncState?: UseClaimSyncStateReturn & {
    onQueriesUpdate?: (queries: string[]) => Promise<void>;
    onElementsUpdate?: (elements: string[]) => void;
    onElementsUpdateWithoutRegeneration?: (elements: string[]) => Promise<void>;
    onOpenModal?: () => void;
  };
}

/**
 * Sidebar component for the ClaimRefinementView
 */
const ClaimSidebar: React.FC<ClaimSidebarProps> = ({
  activeTab,
  handleTabChange: baseHandleTabChange,
  messages: _messages,
  onSendMessage: _onSendMessage,
  handleRemovePriorArt,
  isParsingClaim,
  searchMode: _searchMode,
  onSearch,
  onSavePriorArt,
  onOpenPriorArtDetails,
  parsedElements = [],
  onDirectSearch,
  onSetSelectedSearchId,
  setCitationContext: _setCitationContext,
  analysisData: _analysisData,
  isAnalyzing: _isAnalyzing,
  handleAnalyzePriorArt: _handleAnalyzePriorArt,
  handleOpenApplyModal: _handleOpenApplyModal,
  analyzedInvention,
  handleInsertNewClaim: _handleInsertNewClaim,
  selectedReference: _selectedReference,
  handleClaimChange,
  claims,
  refreshInventionData,
  projectId: _projectId,
  claimSyncState,
}) => {
  // --- Context ---
  // Prefer the route-derived projectId first, then fall back to context.
  // This ensures data loads immediately on first render before context hydration.
  const { activeProjectId: contextProjectId } = useProjectData();
  const routeProjectId = useCurrentProjectId();
  const activeProjectId = routeProjectId || contextProjectId;
  const router = useRouter();

  // --- Custom Hooks ---
  // Data fetching hook
  const {
    activeProjectData,
    searchHistory,
    savedPriorArt,
    savedArtNumbersSet,
    excludedPatentNumbersSet,
    isDataLoading,
    refreshProjectData,
  } = useClaimSidebarData(activeProjectId);

  // Get project ID for chat
  const projectIdForChat =
    activeProjectData?.id || (router.query.projectId as string) || '';

  // Reference for tracking selected search across tabs
  const persistentSelectedSearchId = useRef<string | null>(null);

  // Claim amendment hook
  const {
    isConfirmOpen,
    onConfirmClose,
    updateClaimText,
    handleConfirmAmendment,
    handleCancelAmendment,
  } = useClaimAmendment({
    claims,
    handleClaimChange,
  });

  // Use extracted hooks
  const { claim1Text: _claim1Text } = useClaimText(analyzedInvention);

  // Use the citation handler hook
  const {
    activeSearchEntry: _activeSearchEntry,
    selectedEntryForCitations: _selectedEntryForCitations,
    activeSelectedSearchIndex: _activeSelectedSearchIndex,
    isExtracting: _isExtracting,
  } = useCitationHandler({
    searchHistory: searchHistory,
    parsedElements,
    handleTabChange: baseHandleTabChange,
    persistentSelectedSearchId,
  });

  // Citation logic hook
  const {
    hasNewCitations: _hasNewCitations,
    setHasNewCitations: _setHasNewCitations,
    handleExtractCitationForReference,
    setSelectedReference,
    setActiveSearchId,
  } = useSidebarCitationLogic({
    activeProjectId,
    searchHistory,
    parsedElements,
    handleTabChange: baseHandleTabChange,
    persistentSelectedSearchIdRef: persistentSelectedSearchId,
    onSetSelectedSearchId,
  });

  // Re-introduce state and effect for analysisSelectedSearchId
  const [analysisSelectedSearchId, setAnalysisSelectedSearchId] = useState<
    string | null
  >(null);
  useEffect(() => {
    if (
      searchHistory &&
      searchHistory.length > 0 &&
      !analysisSelectedSearchId
    ) {
      const latestSearchId = searchHistory[0]?.id;
      if (latestSearchId) {
        setAnalysisSelectedSearchId(latestSearchId);
      }
    }
  }, [searchHistory, analysisSelectedSearchId]);

  // Check if the Citations tab is active (index 1 after removing Image Analysis tab)
  const isCitationsTabActive = activeTab === '1';

  // Store reset function from Citations tab
  const resetToCitationResultsRef = useRef<(() => void) | null>(null);

  // Wrapper for handleTabChange to clear notification
  const handleTabChange = useCallback(
    (index: number) => {
      baseHandleTabChange(index);
    },
    [baseHandleTabChange]
  );

  // Get tab icons
  const tabIcons = SidebarTabIcons();

  // Memoize the citations tab to prevent unnecessary re-renders
  const citationsTab = React.useMemo(
    () => (
      <CitationsTabContainer
        key="citations-tab"
        isActive={isCitationsTabActive}
        projectId={projectIdForChat}
        onApplyAmendmentToClaim1={updateClaimText}
        onResetToCitationResults={resetFn => {
          resetToCitationResultsRef.current = resetFn;
        }}
      />
    ),
    // Only re-render when essential props change
    [isCitationsTabActive, projectIdForChat, updateClaimText]
  );

  // Memoize the chat tab content with minimal dependencies
  // Only re-render if projectId changes since other props are stable or rarely change
  const chatTabContent = useMemo(
    () => (
      <ChatTab
        key="chat-tab"
        projectData={activeProjectData || null}
        projectId={projectIdForChat}
        analyzedInvention={analyzedInvention}
        refreshInventionData={refreshInventionData}
      />
    ),
    // Reduce dependencies to prevent unnecessary re-renders
    // activeProjectData changes frequently but ChatTab can handle null
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectIdForChat] // Main dependency - other props are passed through but don't trigger re-render
  );

  // Memoize the entire tab contents array to prevent re-creating it on every render
  const tabContents = useMemo(
    () => [
      // Search Tab - Restored with full functionality
      <SearchTabContainer
        key="search-tab"
        searchHistory={searchHistory}
        savedPriorArt={savedPriorArt}
        parsedElements={parsedElements}
        isLoading={isDataLoading}
        isParsingClaim={isParsingClaim}
        onSearch={onSearch}
        onDirectSearch={onDirectSearch}
        onSavePriorArt={onSavePriorArt}
        onRemovePriorArt={handleRemovePriorArt}
        onOpenPriorArtDetails={onOpenPriorArtDetails}
        projectId={projectIdForChat}
        refreshProjectData={refreshProjectData}
        onExtractCitations={(searchId: string) => {
          persistentSelectedSearchId.current = searchId;
          setActiveSearchId(searchId);
          onSetSelectedSearchId?.(searchId);
        }}
        onExtractCitationForReference={async (
          searchId: string,
          referenceNumber: string
        ) => {
          await handleExtractCitationForReference(searchId, referenceNumber);
          return { isSuccess: true };
        }}
        onViewCitationsForReference={(
          searchId: string,
          referenceNumber: string
        ) => {
          persistentSelectedSearchId.current = searchId;
          setActiveSearchId(searchId);
          setSelectedReference(referenceNumber);
          onSetSelectedSearchId?.(searchId);

          // Reset combined analysis view to show individual results
          if (resetToCitationResultsRef.current) {
            resetToCitationResultsRef.current();
          }

          handleTabChange(1); // Switch to Citations tab (index 1 after removing Image Analysis tab)
        }}
        isActive={activeTab === '0'}
        savedArtNumbers={savedArtNumbersSet}
        excludedPatentNumbers={excludedPatentNumbersSet}
        onSetSelectedSearchId={onSetSelectedSearchId}
        setCitationContext={_setCitationContext}
        setSelectedReference={setSelectedReference}
        claimSyncState={claimSyncState}
      />,

      // NOTE: Image Analysis Tab temporarily removed - may be reactivated in the future
      // <ImageAnalysisTabContainer
      //   key="image-analysis-tab"
      //   projectId={projectIdForChat}
      // />,

      // Citations Tab
      citationsTab,

      // Saved Prior Art Tab
      <SavedPriorArtTabContainer
        key="saved-prior-art-tab"
        savedPriorArt={savedPriorArt}
        handleRemovePriorArt={(index: number) => {
          // Pass the actual saved prior art item at the index
          const artToRemove = savedPriorArt[index];
          logger.info('[ClaimSidebar] Handling remove prior art', {
            index,
            artToRemove,
            savedPriorArtLength: savedPriorArt.length,
          });
          handleRemovePriorArt(index, artToRemove);
        }}
        onOpenPriorArtDetails={onOpenPriorArtDetails}
        onRefreshList={refreshProjectData}
      />,

      // NOTE: Prior Art Analysis Tab temporarily removed - may be reactivated in the future
      // <PriorArtAnalysisTabContainer
      //   key="prior-art-analysis-tab"
      //   claim1Text={claim1Text}
      //   isAnalyzing={isAnalyzing}
      //   analysisData={analysisData}
      //   searchHistory={searchHistory}
      //   projectId={projectIdForChat}
      //   handleOpenApplyModal={handleOpenApplyModal}
      //   onInsertClaim={handleInsertNewClaim}
      // />,

      // Chat Tab
      chatTabContent,
    ],
    // Include all dependencies that affect tab content
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // Data dependencies
      searchHistory,
      savedPriorArt,
      parsedElements,
      isDataLoading,
      isParsingClaim,
      savedArtNumbersSet,
      excludedPatentNumbersSet,

      // Stable callbacks and refs - these rarely change
      projectIdForChat,
      activeTab,
      claimSyncState,
      citationsTab,
      chatTabContent,
    ]
  );

  return (
    <div className="h-full relative">
      <SidebarTabContainer
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        tabTitles={[
          'Patent Search',
          'Citations',
          'Saved Prior Art',
          // NOTE: 'Prior Art Analysis' temporarily removed - may be reactivated in the future
          // NOTE: 'Image Analysis' temporarily removed - may be reactivated in the future
          'Chat',
        ]}
        tabIcons={tabIcons}
        tabContents={tabContents}
      />

      {/* Claim Amendment Confirmation Modal */}
      <ClaimAmendmentModalShadcn
        isOpen={isConfirmOpen}
        onClose={onConfirmClose}
        onConfirm={handleConfirmAmendment}
        onCancel={handleCancelAmendment}
      />
    </div>
  );
};

export default ClaimSidebar;
