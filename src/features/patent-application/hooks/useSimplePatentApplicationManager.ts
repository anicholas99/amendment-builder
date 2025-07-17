import React, { useCallback, useMemo, useState } from 'react';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';
import { InventionData } from '@/types';
import { usePatentGeneration } from './usePatentGeneration';
import { useSimplePatentAutosave } from './useSimplePatentAutosave';
import { useSimplifiedPatentVersioning } from './useSimplifiedPatentVersioning';
import { useSavedPriorArt } from '@/hooks/api/useSavedPriorArt';
import { exportToDocx } from '../utils/patentViewUtils';
import { useDraftDocumentsWithContent } from '@/hooks/api/useDraftDocuments';

interface UseSimplePatentApplicationManagerOptions {
  projectId: string;
  activeProjectData: {
    hasPatentContent?: boolean;
    name?: string;
  } | null;
  inventionData?: InventionData | null;
}

interface UseSimplePatentApplicationManagerReturn {
  // Content State
  patentContent: string;
  hasGenerated: boolean;
  isSaving: boolean;
  isContentReady: boolean;

  // Generation
  isGenerating: boolean;
  generationProgress: number;
  handleGeneratePatent: (selectedRefs?: string[]) => Promise<void>;
  completeProgress: () => void;

  // Content Operations
  updateContent: (content: string) => void;
  saveOnBlur: () => void;
  handleExport: () => Promise<void>;

  // Version Operations
  handleSaveNewVersion: (versionName: string) => Promise<void>;
  handleLoadVersion: (versionId: string) => Promise<void>;
  handleResetApplication: () => void;
  isResetModalOpen: boolean;
  onResetModalClose: () => void;
  isResetting: boolean;
  handleResetApplicationConfirm: () => Promise<void>;

  // Derived Data
  priorArtItems: any[];
}

/**
 * Simplified patent application manager
 * 
 * Core principles:
 * - Minimal state management
 * - Clear data flow
 * - No complex orchestration
 * - React Query as source of truth
 */
export const useSimplePatentApplicationManager = ({
  projectId,
  activeProjectData,
  inventionData,
}: UseSimplePatentApplicationManagerOptions): UseSimplePatentApplicationManagerReturn => {
  const toast = useToast();
  const [isContentReady, setIsContentReady] = useState(false);
  const justGeneratedRef = React.useRef(false);
  const [hasJustGenerated, setHasJustGenerated] = useState(false);
  const contentReadyCalledRef = React.useRef(false); // Track if content ready has been called for this generation

  // Prior art data
  const { data: savedPriorArtData = [] } = useSavedPriorArt(projectId);

  // Patent Generation
  const {
    isGenerating,
    generationProgress,
    handleGeneratePatent: generatePatentInternal,
    setContentReady,
  } = usePatentGeneration(projectId);

  // Simple Autosave with content ready callback
  const {
    content: patentContent,
    isLoading: isContentLoading,
    isSaving,
    updateContent,
    saveOnBlur,
  } = useSimplePatentAutosave({
    projectId,
    enabled: !!projectId,
    onContentReady: () => {
      // Get current content state when callback is triggered
      const currentContent = patentContent;
      const hasContent = !!(currentContent && currentContent.trim().length > 0);
      
      logger.info('[SimplePatentManager] onContentReady called', {
        projectId,
        hasContent,
        justGenerated: justGeneratedRef.current,
        contentReadyCalled: contentReadyCalledRef.current,
      });

      // Only trigger content ready once per generation cycle and only if we have actual content
      if (hasContent && justGeneratedRef.current && !contentReadyCalledRef.current) {
        logger.info('[SimplePatentManager] Completing progress - content is ready');
        contentReadyCalledRef.current = true;
        setIsContentReady(true);
        setContentReady(); // Complete the progress and hide loading state
        
        // Show success toast
        setTimeout(() => {
          toast({
            title: 'Patent Generated Successfully',
            description: 'Your patent application has been generated and is ready for editing.',
            status: 'success',
            duration: 4000,
          });
        }, 500); // Small delay to ensure UI has updated

        // Clear generation flags after a delay
        setTimeout(() => {
          justGeneratedRef.current = false;
          setHasJustGenerated(false);
          contentReadyCalledRef.current = false; // Reset for next generation
        }, 1000);
      }
    },
  });

  // Version Management
  const {
    handleSaveNewVersion,
    handleLoadVersion,
    handleResetApplication,
    isResetModalOpen,
    onResetModalClose,
    isResetting,
    handleResetApplicationConfirm,
  } = useSimplifiedPatentVersioning({
    projectId,
    forceSave: async () => {
      // Force save current content before version operations
      saveOnBlur();
      // Wait a moment for save to complete
      await new Promise(resolve => setTimeout(resolve, 500));
    },
  });

  // Check if draft documents exist to determine hasGenerated
  const { data: draftData } = useDraftDocumentsWithContent(projectId, {
    enabled: !!projectId,
  });

  const hasGenerated = useMemo(() => {
    return Boolean(
      activeProjectData?.hasPatentContent ||
      (draftData?.documents && draftData.documents.length > 0) ||
      (patentContent && patentContent.trim().length > 0) ||
      isGenerating || // Keep showing content state during generation
      hasJustGenerated // Keep showing content state if we just generated
    );
  }, [activeProjectData?.hasPatentContent, draftData?.documents, patentContent, isGenerating, hasJustGenerated]);

  // Debug: log when patentContent changes
  React.useEffect(() => {
    logger.info('[SimplePatentManager] patentContent updated', {
      projectId,
      length: patentContent?.length ?? 0,
      first20: patentContent?.slice(0, 20) ?? '',
      justGenerated: justGeneratedRef.current,
      hasGenerated,
      isGenerating,
      draftDocCount: draftData?.documents?.length ?? 0,
      hasPatentContent: activeProjectData?.hasPatentContent,
    });
  }, [patentContent, projectId, hasGenerated, isGenerating, draftData?.documents?.length, activeProjectData?.hasPatentContent]);

  // Removed separate effect - toast is now handled in completeProgress when editor is ready

  // Removed fallback mechanism to prevent infinite loops

  // Handle generation
  const handleGeneratePatent = useCallback(
    async (selectedRefs?: string[]) => {
      try {
        logger.info('[SimplePatentManager] Starting patent generation', {
          projectId,
          selectedRefs,
        });

        justGeneratedRef.current = true;
        setHasJustGenerated(true);
        contentReadyCalledRef.current = false; // Reset for new generation cycle
        
        // Safety timeout to clear generation flag if something goes wrong
        const timeoutId = setTimeout(() => {
          if (justGeneratedRef.current) {
            logger.warn('[SimplePatentManager] Generation flag timeout - clearing flag');
            justGeneratedRef.current = false;
            setHasJustGenerated(false);
            contentReadyCalledRef.current = false;
          }
        }, 60000); // 60 seconds to match generation timeout
        
        await generatePatentInternal(undefined, selectedRefs);
        clearTimeout(timeoutId);

        // Don't show success toast here - wait for content to actually load
        logger.info('[SimplePatentManager] API generation completed, waiting for content to load');
      } catch (error) {
        logger.error('[SimplePatentManager] Patent generation failed', {
          error,
        });

        justGeneratedRef.current = false;
        setHasJustGenerated(false);
        contentReadyCalledRef.current = false; // Reset on error too
        toast({
          title: 'Generation Failed',
          description: 'Unable to generate patent application. Please try again.',
          status: 'error',
          duration: 5000,
        });

        throw error;
      }
    },
    [generatePatentInternal, projectId, toast]
  );

  // Handle export
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
    await exportToDocx(inventionData, patentContent, toast);
  }, [inventionData, patentContent, toast]);

  // Complete progress (called by editor when content is rendered)
  const completeProgress = useCallback(() => {
    logger.info('[SimplePatentManager] Editor ready, completing generation progress', {
      projectId,
      isGenerating,
      generationProgress,
      hasContent: !!(patentContent && patentContent.trim().length > 0),
    });
    
    // Always call setContentReady to ensure loading state is cleared
    // This handles cases where generation completes but content loading is delayed
    setContentReady();
    
    // If we have content and we just generated, show success toast and clear flag
    if (justGeneratedRef.current && patentContent && patentContent.trim().length > 0) {
      logger.info('[SimplePatentManager] Editor ready with content after generation - showing success toast');
      justGeneratedRef.current = false;
      setHasJustGenerated(false);
      
      toast({
        title: '✨ Patent Generated Successfully',
        description: 'Your patent application is ready for review.',
        status: 'success',
        duration: 5000,
      });
    }
  }, [isGenerating, setContentReady, projectId, generationProgress, patentContent, toast]);

  // Prior art items
  const priorArtItems = useMemo(
    () => savedPriorArtData || [],
    [savedPriorArtData]
  );

  return {
    // Content State
    patentContent,
    hasGenerated,
    isSaving,
    isContentReady: isContentReady && !isContentLoading,

    // Generation
    isGenerating,
    generationProgress,
    handleGeneratePatent,
    completeProgress,

    // Content Operations
    updateContent,
    saveOnBlur,
    handleExport,

    // Version Operations
    handleSaveNewVersion,
    handleLoadVersion,
    handleResetApplication,
    isResetModalOpen,
    onResetModalClose,
    isResetting,
    handleResetApplicationConfirm,

    // Derived Data
    priorArtItems,
  };
}; 