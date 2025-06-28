import { useState, useCallback, useMemo, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { logger } from '@/lib/monitoring/logger';
import { InventionData } from '@/types';
import { ApplicationVersionWithDocuments } from '@/types/versioning';
import { usePatentGeneration } from './usePatentGeneration';
import { usePatentAutosave } from './usePatentAutosave';
import { useLatestVersionQuery } from '@/hooks/api/useProjects';
import { exportToDocx } from '../utils/patentViewUtils';
import { useCreateVersionMutation } from '@/hooks/api/useProjectVersions';
import { versionQueryKeys } from '@/lib/queryKeys/versionQueryKeys';
import { useQueryClient } from '@tanstack/react-query';
import { rebuildHtmlContent } from '../utils/patent-sections';
import { ProjectApiService } from '@/client/services/project.client-service';
import { DraftApiService } from '@/services/api/draftApiService';

interface UsePatentApplicationManagerV3Options {
  projectId: string;
  activeProjectData: any;
  inventionData?: InventionData | null;
}

interface UsePatentApplicationManagerV3Return {
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
  isContentReady: boolean;

  // Generation
  isGenerating: boolean;
  generationProgress: number;
  handleGeneratePatent: (selectedRefs?: string[]) => Promise<void>;

  // Content Operations
  handleSaveContent: (showToast?: boolean, newContent?: string) => Promise<void>;
  handleExport: () => Promise<void>;
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
 * Simplified patent application manager V3 - using unified autosave
 * Clean, maintainable, and follows established patterns
 */
export const usePatentApplicationManagerV3 = ({
  projectId,
  activeProjectData,
  inventionData,
}: UsePatentApplicationManagerV3Options): UsePatentApplicationManagerV3Return => {
  const toast = useToast();
  const queryClient = useQueryClient();

  // --- UI State ---
  const [selectedRefIds, setSelectedRefIds] = useState<string[]>([]);
  const [currentFigure, setCurrentFigure] = useState<string>('FIG. 1');
  const [activeTab, setActiveTab] = useState(0);
  
  // Memoize the setter to ensure stable reference
  const memoizedSetSelectedRefIds = useCallback(
    (ids: string[]) => setSelectedRefIds(ids),
    []
  );

  // --- Data Queries ---
  const { data: latestVersion, isLoading: isVersionLoading } = useLatestVersionQuery(projectId);
  
  // Check if we have cached draft data to prevent flicker
  const cachedDraftDocs = queryClient.getQueryData(
    ['draft', 'documents', projectId]
  ) as any[] | undefined;
  
  // Derive initial content from cached docs if available
  const initialContentFromCache = useMemo(() => {
    if (!cachedDraftDocs || cachedDraftDocs.length === 0) return '';
    
    // Rebuild from sections
    const sectionDocs: Record<string, string> = {};
    cachedDraftDocs.forEach((doc: any) => {
      if (doc.type && doc.content != null && doc.type !== 'FULL_CONTENT') {
        sectionDocs[doc.type] = doc.content;
      }
    });
    
    try {
      if (Object.keys(sectionDocs).length > 0) {
        const rebuilt = rebuildHtmlContent(sectionDocs);
        return rebuilt || '';
      }
    } catch (error) {
      logger.error('[PatentApplicationManagerV3] Error rebuilding cached content', { error });
    }
    
    return '';
  }, [cachedDraftDocs]);

  // --- Patent Generation ---
  const {
    isGenerating,
    generationProgress,
    handleGeneratePatent: generatePatentInternal,
  } = usePatentGeneration(projectId);

  // --- Unified Autosave ---
  const {
    content: patentContent,
    hasUnsavedChanges,
    isSaving,
    isLoading: isDraftLoading,
    updateContent,
    saveOnBlur,
    forceSave,
  } = usePatentAutosave({
    projectId,
    enabled: !!projectId,
    initialContent: initialContentFromCache, // Pass initial content from cache
  });

  // --- Mutations ---
  const createVersionMutation = useCreateVersionMutation();

  // --- Determine hasGenerated ---
  const hasGenerated = useMemo(() => {
    return patentContent.trim().length > 0;
  }, [patentContent]);

  // Content is ready when draft documents are loaded
  const isContentReady = !isDraftLoading;

  // --- Handlers ---
  const handleGeneratePatent = useCallback(
    async (selectedRefs?: string[]) => {
      try {
        await generatePatentInternal(undefined, selectedRefs);
        
        // Refetch version to get updated content
        await queryClient.invalidateQueries({
          queryKey: versionQueryKeys.latest(projectId),
        });
        
        logger.info('[PatentApplicationManagerV3] Patent generation completed');
      } catch (error) {
        logger.error('[PatentApplicationManagerV3] Error during patent generation', { error });
        throw error;
      }
    },
    [generatePatentInternal, projectId, queryClient]
  );

  const handleSaveContent = useCallback(
    async (showToast: boolean = true, newContent?: string) => {
      if (newContent !== undefined) {
        updateContent(newContent);
      }

      if (showToast) {
        await forceSave();
        toast({
          title: 'Changes saved',
          status: 'success',
          duration: 2000,
        });
      }
    },
    [updateContent, forceSave, toast]
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
    await exportToDocx(inventionData, patentContent, toast);
  }, [inventionData, patentContent, toast]);

  const refreshContent = useCallback(() => {
    // Refresh version query
    queryClient.invalidateQueries({
      queryKey: versionQueryKeys.latest(projectId),
    });
    logger.info('[PatentApplicationManagerV3] Content refresh requested');
  }, [projectId, queryClient]);

  const handleResetApplication = useCallback(async () => {
    try {
      updateContent('');
      await forceSave();
      
      toast({
        title: 'Application Reset',
        description: 'Content has been cleared',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      logger.error('[PatentApplicationManagerV3] Error resetting application', { error });
      toast({
        title: 'Reset Failed',
        description: 'Unable to reset the application',
        status: 'error',
        duration: 3000,
      });
    }
  }, [updateContent, forceSave, toast]);

  const handleSaveNewVersion = useCallback(
    async (versionName: string) => {
      if (!projectId || !latestVersion) return;

      try {
        // Save any pending changes first
        if (hasUnsavedChanges) {
          await forceSave();
        }

        logger.info('[PatentApplicationManagerV3] Creating new version', {
          projectId,
          versionName,
        });

        await createVersionMutation.mutateAsync({
          projectId,
          payload: {
            name: versionName,
          },
        });

        toast({
          title: 'Version Saved',
          description: `Version "${versionName}" has been created`,
          status: 'success',
          duration: 3000,
        });

        // Refresh versions
        await queryClient.invalidateQueries({
          queryKey: versionQueryKeys.all(projectId),
        });
      } catch (error) {
        logger.error('[PatentApplicationManagerV3] Failed to save version', { error });
        toast({
          title: 'Failed to Save Version',
          description: 'Please try again',
          status: 'error',
          duration: 3000,
        });
      }
    },
    [projectId, latestVersion, hasUnsavedChanges, forceSave, createVersionMutation, toast, queryClient]
  );

  const handleLoadVersion = useCallback(
    async (versionId: string) => {
      if (!projectId || !versionId) {
        logger.warn('[PatentApplicationManagerV3] Missing projectId or versionId', {
          projectId,
          versionId,
        });
        return;
      }

      try {
        logger.info('[PatentApplicationManagerV3] Loading version', {
          projectId,
          versionId,
        });

        // Show loading toast
        const loadingToast = toast({
          title: 'Loading Version',
          description: 'Restoring content from selected version...',
          status: 'info',
          duration: null,
          isClosable: false,
        });

        // Fetch the specific version
        const version = await ProjectApiService.getVersion(projectId, versionId);

        if (!version) {
          throw new Error('Version not found');
        }

        // Extract sections from version documents
        const updates: Array<{ type: string; content: string }> = [];
        
        version.documents?.forEach((doc: any) => {
          if (doc.type && doc.content != null) {
            updates.push({
              type: doc.type,
              content: doc.content,
            });
          }
        });
        
        if (updates.length === 0) {
          throw new Error('No content found in the selected version');
        }

        // Update draft with version content
        await DraftApiService.batchUpdateDraftDocuments(projectId, updates);

        // Extract and set the FULL_CONTENT for immediate UI update
        let fullContent = '';
        const fullContentDoc = updates.find(u => u.type === 'FULL_CONTENT');
        
        if (fullContentDoc) {
          fullContent = fullContentDoc.content;
        } else {
          // Rebuild from sections if no full content
          const sectionDocuments: Record<string, string> = {};
          updates.forEach(update => {
            if (update.type !== 'FULL_CONTENT') {
              sectionDocuments[update.type] = update.content;
            }
          });
          
          if (Object.keys(sectionDocuments).length > 0) {
            fullContent = rebuildHtmlContent(sectionDocuments);
          }
        }

        // Update the content immediately
        if (fullContent) {
          updateContent(fullContent);
        }

        // Force a save to ensure consistency
        await forceSave();

        // Invalidate draft queries to ensure fresh data
        await queryClient.invalidateQueries({
          queryKey: ['draft-documents', projectId],
        });

        // Close loading toast
        toast.close(loadingToast);

        // Show success toast
        toast({
          title: 'Version Restored',
          description: `Working draft has been updated with content from "${version.name}"`,
          status: 'success',
          duration: 3000,
        });

        logger.info('[PatentApplicationManagerV3] Version loaded successfully', {
          versionId,
          versionName: version.name,
          documentCount: updates.length,
        });
      } catch (error) {
        logger.error('[PatentApplicationManagerV3] Error loading version', { error });
        toast({
          title: 'Load Failed',
          description: 'Unable to load the selected version. Please try again.',
          status: 'error',
          duration: 5000,
        });
      }
    },
    [projectId, updateContent, forceSave, queryClient, toast]
  );

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
  
  // Force save on unmount or project change
  useEffect(() => {
    return () => {
      // Force save any pending changes when unmounting
      if (hasUnsavedChanges) {
        logger.info('[PatentApplicationManagerV3] Forcing save on unmount', {
          projectId,
          hasUnsavedChanges,
        });
        forceSave().catch(error => {
          logger.error('[PatentApplicationManagerV3] Failed to save on unmount', { error });
        });
      }
    };
  }, [projectId, hasUnsavedChanges, forceSave]);

  // --- Derived Values ---
  const priorArtItems = useMemo(
    () => activeProjectData?.savedPriorArtItems || [],
    [activeProjectData]
  );

  return {
    // UI State
    selectedRefIds,
    setSelectedRefIds: memoizedSetSelectedRefIds,
    currentFigure,
    setCurrentFigure,
    activeTab,
    setActiveTab,

    // Content State
    patentContent,
    hasGenerated,
    isSaving,
    hasUnsavedChanges,
    isContentReady,

    // Generation
    isGenerating,
    generationProgress,
    handleGeneratePatent,

    // Content Operations
    handleSaveContent,
    handleExport,
    refreshContent,
    saveOnBlur,

    // Version Operations
    handleSaveNewVersion,
    handleLoadVersion,
    handleResetApplication,

    // Derived Data
    priorArtItems,
  };
}; 