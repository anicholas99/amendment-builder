import { useState, useCallback, useMemo, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { logger } from '@/lib/monitoring/logger';
import { InventionData } from '@/types';
import { ApplicationVersionWithDocuments } from '@/types/versioning';
import { usePatentGeneration } from './usePatentGeneration';
import { usePatentDraftManager } from './usePatentDraftManager';
import { exportToDocx } from '../utils/patentViewUtils';
import { DraftApiService } from '@/services/api/draftApiService';

interface UsePatentApplicationManagerV2Options {
  projectId: string;
  activeProjectData: any;
  inventionData?: InventionData | null;
  latestVersion?: ApplicationVersionWithDocuments | null;
  latestVersionError?: any;
  isLatestVersionError?: boolean;
}

interface UsePatentApplicationManagerV2Return {
  // UI State
  selectedRefIds: string[];
  setSelectedRefIds: (ids: string[]) => void;
  currentFigure: string;
  setCurrentFigure: (figure: string) => void;
  activeTab: number;
  setActiveTab: (tab: number) => void;

  // Content State
  patentContent: string;
  hasGenerated: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  isDraftLoading: boolean;
  isContentReady: boolean;

  // Generation
  isGenerating: boolean;
  generationProgress: number;
  handleGeneratePatent: (selectedRefs?: string[]) => Promise<void>;

  // Content Operations
  handleSaveContent: (
    showToast?: boolean,
    newContent?: string
  ) => Promise<void>;
  handleExport: () => Promise<void>;
  handleSyncClaims: () => void;
  handleRebuildSections: () => void;
  refreshContent: () => void;
  saveOnBlur: () => void;

  // Version Operations
  handleSaveNewVersion: (versionName: string) => Promise<void>;
  handleLoadVersion: (versionId: string) => Promise<void>;
  handleResetApplication: () => Promise<void>;

  // Derived Data
  priorArtItems: any[];
}

/**
 * Simplified patent application manager using draft documents
 * Draft documents are always editable, versions are immutable snapshots
 */
export const usePatentApplicationManagerV2 = ({
  projectId,
  activeProjectData,
  inventionData,
  latestVersion,
  latestVersionError,
  isLatestVersionError,
}: UsePatentApplicationManagerV2Options): UsePatentApplicationManagerV2Return => {
  const toast = useToast();

  // --- UI State ---
  const [selectedRefIds, setSelectedRefIds] = useState<string[]>([]);
  const [currentFigure, setCurrentFigure] = useState<string>('FIG. 1');
  const [activeTab, setActiveTab] = useState(0);

  // --- Patent Generation ---
  const {
    isGenerating,
    generationProgress,
    handleGeneratePatent: generatePatentInternal,
  } = usePatentGeneration(projectId);

  // --- Draft Manager ---
  // Draft documents can be loaded as soon as we have a projectId
  const draftManager = usePatentDraftManager({ 
    projectId,
    enabled: !!projectId
  });

  // The draft documents are now initialized automatically by the API

  // --- Determine hasGenerated ---
  const hasGenerated = useMemo(() => {
    // Wait for content to be definitively ready before making determination
    // This prevents flicker by ensuring we don't make premature decisions
    if (!draftManager.isContentReady) {
      // Content not truly loaded yet - return false to show loading state
      return false;
    }
    
    // Once content is definitively ready, check if we have any content
    return draftManager.hasContentFromBackend || draftManager.patentContent.length > 0;
  }, [
    draftManager.isContentReady,
    draftManager.hasContentFromBackend,
    draftManager.patentContent
  ]);

  // --- Create Reliable Content Ready Signal ---
  // This signal ensures BOTH draft data is loaded AND hasGenerated is processed
  // Prevents race conditions where hasGenerated is stale during render
  const isContentReady = useMemo(() => {
    return draftManager.isContentReady && hasGenerated !== undefined;
  }, [draftManager.isContentReady, hasGenerated]);

  // --- Handlers ---
  const handleGeneratePatent = useCallback(
    async (selectedRefs?: string[]) => {
      try {
        await generatePatentInternal(undefined, selectedRefs);
        
        // The generation endpoint saves directly to draft documents
        // Wait a moment for backend to complete
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Force refetch draft documents to ensure UI updates
        logger.info('[PatentApplicationManagerV2] Forcing draft document refetch after generation');
        await draftManager.refetchDraftDocuments();
        
      } catch (error) {
        logger.error('[PatentApplicationManagerV2] Error during patent generation', { error });
        throw error;
      }
    },
    [generatePatentInternal, draftManager]
  );

  const handleSaveContent = useCallback(
    async (showToast: boolean = true, newContent?: string) => {
      const contentToSave = newContent ?? draftManager.patentContent;
      if (!contentToSave) return;

      // Queue the update
      draftManager.queueContentUpdate(contentToSave);

      // Force save if requested
      if (showToast) {
        await draftManager.forceSave(true);
      }
    },
    [draftManager]
  );

  const handleExport = useCallback(async () => {
    if (!inventionData) {
      toast({
        title: 'Error',
        description: 'No patent data available to export',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    await exportToDocx(inventionData, draftManager.patentContent, toast);
  }, [inventionData, draftManager.patentContent, toast]);

  // Stub handlers for features not yet implemented in draft system
  const handleSyncClaims = useCallback(() => {
    toast({
      title: 'Coming Soon',
      description: 'Claim synchronization will be available soon',
      status: 'info',
      duration: 3000,
    });
  }, [toast]);

  const handleRebuildSections = useCallback(() => {
    toast({
      title: 'Coming Soon', 
      description: 'Section rebuilding will be available soon',
      status: 'info',
      duration: 3000,
    });
  }, [toast]);

  const refreshContent = useCallback(() => {
    // Draft content is automatically refreshed via React Query
    logger.info('[PatentApplicationManagerV2] Content refresh requested');
  }, []);

  const handleResetApplication = useCallback(async () => {
    // Reset clears the draft content
    try {
      // Queue empty content to update UI and clear all sections
      draftManager.queueContentUpdate('');
      
      // Force save to persist the reset
      await draftManager.forceSave(true);
      
      toast({
        title: 'Application Reset',
        description: 'Draft has been cleared',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      logger.error('[PatentApplicationManagerV2] Error resetting application', { error });
      toast({
        title: 'Reset Failed',
        description: 'Unable to reset the application',
        status: 'error',
        duration: 3000,
      });
    }
  }, [draftManager, toast]);

  // --- Effects ---
  useEffect(() => {
    if (
      inventionData?.figures &&
      Object.keys(inventionData.figures).length > 0 &&
      !Object.keys(inventionData.figures).includes(currentFigure)
    ) {
      const firstFigureKey = Object.keys(inventionData.figures)[0];
      if (firstFigureKey) {
        setCurrentFigure(firstFigureKey);
      }
    }
  }, [inventionData, currentFigure]);
  
  // Save on unmount or when projectId changes (view switching)
  useEffect(() => {
    // Store a ref to the current save function to avoid dependency issues
    const currentForceSave = draftManager.forceSave;
    const currentHasUnsavedChanges = draftManager.hasUnsavedChanges;
    
    return () => {
      // Force save any pending changes when unmounting or switching projects
      if (currentHasUnsavedChanges) {
        logger.info('[PatentApplicationManagerV2] Saving changes before unmount/switch');
        currentForceSave().catch(error => {
          logger.error('[PatentApplicationManagerV2] Failed to save on unmount', { error });
        });
      }
    };
  }, [projectId]); // Only depend on projectId changes

  // --- Derived Values ---
  const priorArtItems = useMemo(
    () => activeProjectData?.savedPriorArtItems || [],
    [activeProjectData]
  );

  return {
    // UI State
    selectedRefIds,
    setSelectedRefIds,
    currentFigure,
    setCurrentFigure,
    activeTab,
    setActiveTab,

    // Content State
    patentContent: draftManager.patentContent,
    hasGenerated,
    isSaving: draftManager.isSaving,
    hasUnsavedChanges: draftManager.hasUnsavedChanges,
    isDraftLoading: draftManager.isLoading,
    isContentReady,

    // Generation
    isGenerating,
    generationProgress,
    handleGeneratePatent,

    // Content Operations
    handleSaveContent,
    handleExport,
    handleSyncClaims,
    handleRebuildSections,
    refreshContent,
    saveOnBlur: draftManager.saveOnBlur,

    // Version Operations
    handleSaveNewVersion: draftManager.handleSaveNewVersion,
    handleLoadVersion: draftManager.handleLoadVersion,
    handleResetApplication,

    // Derived Data
    priorArtItems,
  };
}; 