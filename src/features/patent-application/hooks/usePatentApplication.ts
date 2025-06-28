import React, { useState, useEffect, useRef, useCallback } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { useToast } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { InventionData } from '@/types';
import { PatentVersion } from '../../version/components/PatentVersionHistoryModal';
import { VerificationResults } from '../../../types/better-types';
import { EditorState } from 'draft-js';
import { extractSections, rebuildContent } from '../utils/patent-sections';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { useUpdateProjectMutation } from '@/hooks/api/useProjects';

/**
 * Custom hook to manage patent application state
 * @param projectId The project ID
 * @param analyzedInvention The structured data containing invention details
 * @param setAnalyzedInvention Function to update the analyzedInvention state
 */
export const usePatentApplication = (
  projectId: string,
  analyzedInvention: InventionData | null,
  setAnalyzedInvention: React.Dispatch<
    React.SetStateAction<InventionData | null>
  >
) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  // Add a mount tracking ref
  const isMounted = useRef(true);

  // Set up unmount cleanup
  useEffect(() => {
    return () => {
      // When component unmounts, set ref to false
      isMounted.current = false;
    };
  }, []);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Content state
  const [content, setContent] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [previousContent, setPreviousContent] = useState<string | null>(null);

  // Editor state
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  // Version history state
  const [versions, setVersions] = useState<PatentVersion[]>([]);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [versionDescription, setVersionDescription] = useState('');

  // Verification state
  const [verificationResults, setVerificationResults] =
    useState<VerificationResults>({
      elementDiscrepancies: [],
      claimDiscrepancies: [],
      figureDiscrepancies: [],
    });
  const [isVerifying, setIsVerifying] = useState(false);

  // Figure state
  const [currentFigure, setCurrentFigure] = useState<string>('FIG. 1');

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Auto-save state
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Debounced auto-save function
  const [debouncedAutoSave] = useDebouncedCallback(
    (inventionData: InventionData) => {
      if (isMounted.current) {
        updateAndSave(inventionData);
      }
    },
    2000
  );

  // Toast
  const toast = useToast();

  const updateProjectMutation = useUpdateProjectMutation();

  const saveToProject = useCallback(
    async (updatedData: InventionData) => {
      if (!projectId) {
        logger.warn('Cannot save to project: no project ID provided');
        return;
      }

      try {
        setIsUpdating(true);
        await updateProjectMutation.mutateAsync({
          projectId,
          data: { inventionData: updatedData },
        });
        logger.log('Successfully saved patent data to project');
      } catch (error) {
        logger.error('Error saving to project:', error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [projectId, updateProjectMutation]
  );

  const updateLocalData = useCallback(
    (updatedData: InventionData) => {
      setAnalyzedInvention(updatedData);
      logger.log('Updated local patent data');
    },
    [setAnalyzedInvention]
  );

  const updateAndSave = useCallback(
    async (updatedData: InventionData) => {
      // Update local state immediately for responsive UI
      updateLocalData(updatedData);

      // Save to backend
      await saveToProject(updatedData);
    },
    [updateLocalData, saveToProject]
  );

  const updateField = useCallback(
    (field: keyof InventionData, value: any) => {
      if (!analyzedInvention) {
        logger.warn('Cannot update field: no analyzed invention data');
        return;
      }

      const updated: InventionData & {
        [key: string]: any;
      } = {
        ...analyzedInvention,
        [field]: value,
      };

      updateAndSave(updated).catch(error => {
        logger.error(`Error updating field ${field}:`, error);
      });
    },
    [analyzedInvention, updateAndSave]
  );

  const updateSection = useCallback(
    (section: string, content: string) => {
      if (!analyzedInvention) {
        logger.warn('Cannot update section: no analyzed invention data');
        return;
      }

      // Map section names to InventionData fields
      const sectionMapping: Record<string, keyof InventionData> = {
        title: 'title',
        abstract: 'abstract',
        background: 'background',
        summary: 'summary',
        description: 'detailed_description',
        claims: 'claims',
      };

      const field = sectionMapping[section];
      if (!field) {
        logger.warn(`Unknown section: ${section}`);
        return;
      }

      let updatedValue: any = content;

      // Special handling for structured fields
      if (field === 'claims') {
        try {
          updatedValue = JSON.parse(content);
        } catch {
          // If parsing fails, treat as plain text
          updatedValue = { '1': content };
        }
      }

      const updatedData: InventionData & {
        [key: string]: any;
      } = {
        ...analyzedInvention,
        [field]: updatedValue,
      };

      updateAndSave(updatedData).catch(error => {
        logger.error(`Error updating section ${section}:`, error);
      });
    },
    [analyzedInvention, updateAndSave]
  );

  const addClaim = useCallback(
    (claimNumber: string, claimText: string) => {
      if (!analyzedInvention) {
        logger.warn('Cannot add claim: no analyzed invention data');
        return;
      }

      const currentClaims = analyzedInvention.claims || {};
      const updatedClaims = {
        ...currentClaims,
        [claimNumber]: claimText,
      };

      const updatedData: InventionData = {
        ...analyzedInvention,
        claims: updatedClaims,
      };

      updateAndSave(updatedData).catch(error => {
        logger.error('Error adding claim:', error);
      });
    },
    [analyzedInvention, updateAndSave]
  );

  const updateClaim = useCallback(
    (claimNumber: string, claimText: string) => {
      if (!analyzedInvention) {
        logger.warn('Cannot update claim: no analyzed invention data');
        return;
      }

      const currentClaims = analyzedInvention.claims || {};
      const updatedClaims = {
        ...currentClaims,
        [claimNumber]: claimText,
      };

      const updatedData: InventionData = {
        ...analyzedInvention,
        claims: updatedClaims,
      };

      updateAndSave(updatedData).catch(error => {
        logger.error('Error updating claim:', error);
      });
    },
    [analyzedInvention, updateAndSave]
  );

  const deleteClaim = useCallback(
    (claimNumber: string) => {
      if (!analyzedInvention) {
        logger.warn('Cannot delete claim: no analyzed invention data');
        return;
      }

      const currentClaims = analyzedInvention.claims || {};

      // Ensure we're working with a Record<string, string> format
      if (Array.isArray(currentClaims)) {
        logger.warn('Claims are in array format, cannot delete by string key');
        return;
      }

      const updatedClaims = { ...currentClaims };
      delete updatedClaims[claimNumber];

      const updatedData: InventionData = {
        ...analyzedInvention,
        claims: updatedClaims,
      };

      updateAndSave(updatedData).catch(error => {
        logger.error('Error deleting claim:', error);
      });
    },
    [analyzedInvention, updateAndSave]
  );

  // Data validation helpers
  const hasValidData = useCallback(() => {
    if (!analyzedInvention) return false;

    return !!(
      analyzedInvention.title ||
      analyzedInvention.abstract ||
      analyzedInvention.summary ||
      (analyzedInvention.claims &&
        Object.keys(analyzedInvention.claims).length > 0)
    );
  }, [analyzedInvention]);

  const getCompletionStatus = useCallback(() => {
    if (!analyzedInvention) {
      return {
        hasTitle: false,
        hasAbstract: false,
        hasClaims: false,
        hasBackground: false,
        hasInventionData: false,
        completeness: 0,
      };
    }

    const hasTitle = !!analyzedInvention.title;
    const hasAbstract = !!analyzedInvention.abstract;
    const hasClaims = !!(
      analyzedInvention.claims &&
      Object.keys(analyzedInvention.claims).length > 0
    );
    const hasBackground = !!analyzedInvention.background;

    const completedSections = [
      hasTitle,
      hasAbstract,
      hasClaims,
      hasBackground,
    ].filter(Boolean).length;
    const totalSections = 4;
    const completeness = Math.round((completedSections / totalSections) * 100);

    return {
      hasTitle,
      hasAbstract,
      hasClaims,
      hasBackground,
      hasInventionData: true,
      completeness,
    };
  }, [analyzedInvention]);

  // Check for existing generated content
  useEffect(() => {
    logger.log('Loading patent application content...');

    if (!analyzedInvention) {
      setIsLoading(false);
      return;
    }

    logger.log('Analyzed invention loaded:', {
      id: analyzedInvention.id,
      hasGeneratedContent: !!analyzedInvention.generated_content,
      sectionsCount: Object.keys(
        (
          analyzedInvention.generated_content as {
            sections?: Record<string, string>;
          }
        )?.sections || {}
      ).length,
    });

    // Check if we have sections to build content from
    const generatedContent = analyzedInvention.generated_content as
      | {
          sections?: Record<string, string>;
          patent_application?: string;
          abstract?: string;
        }
      | undefined;

    if (generatedContent?.sections) {
      const sections = generatedContent.sections;

      try {
        const rebuiltContent = rebuildContent(sections);
        if (rebuiltContent) {
          setHasGenerated(true);
          setContent(rebuiltContent);
          logger.log('Built patent content from sections');
        } else {
          setHasGenerated(false);
          setContent('');
          logger.log('Failed to build content from sections');
        }
      } catch (error) {
        logger.error('Error building content from sections', { error });
        setHasGenerated(false);
        setContent('');
      }
    } else {
      // No sections available
      logger.log('No sections found to build content');
      setHasGenerated(false);
      setContent('');
    }

    // Add a patent_application getter for backward compatibility
    if (generatedContent && !generatedContent.patent_application) {
      Object.defineProperty(generatedContent, 'patent_application', {
        get: function () {
          // Rebuild content from sections on demand
          if (this.sections && Object.keys(this.sections).length > 0) {
            return rebuildContent(this.sections);
          }
          return '';
        },
        configurable: true,
      });

      // Ensure abstract is also accessible from sections if needed
      if (!Object.prototype.hasOwnProperty.call(generatedContent, 'abstract')) {
        Object.defineProperty(generatedContent, 'abstract', {
          get: function () {
            // Get abstract from sections
            if (this.sections && this.sections.ABSTRACT) {
              return this.sections.ABSTRACT;
            }
            return '';
          },
          configurable: true,
        });
      }

      logger.log(
        'Added backward compatibility getters for patent_application and abstract'
      );
    }

    setIsLoading(false);
  }, [analyzedInvention]);

  // Set up auto-save functionality
  useEffect(() => {
    // Skip if component is unmounting or unmounted
    if (!isMounted.current) return;

    // Skip if we're in the middle of switching projects
    if (!analyzedInvention || !content) {
      return;
    }

    // If content changes, trigger debounced auto-save
    if (content && analyzedInvention && content.trim() !== '') {
      const patentApplication = (
        analyzedInvention.generated_content as {
          patent_application?: string;
        }
      )?.patent_application;
      const currentContent =
        typeof patentApplication === 'string' ? patentApplication : '';

      if (content !== currentContent) {
        // Use debounced callback instead of setTimeout
        debouncedAutoSave(analyzedInvention);
      }
    }
  }, [content, analyzedInvention, debouncedAutoSave]);

  // Sync content back to analyzedInvention when it changes
  useEffect(() => {
    // Skip if component is unmounting or unmounted
    if (!isMounted.current) return;

    // Skip if we're in the middle of switching projects
    if (!analyzedInvention || !content) {
      return;
    }

    if (content && analyzedInvention && content.trim() !== '') {
      const patentApplication = (
        analyzedInvention.generated_content as {
          patent_application?: string;
        }
      )?.patent_application;
      const currentContent =
        typeof patentApplication === 'string' ? patentApplication : '';

      if (content !== currentContent) {
        setAnalyzedInvention(prev => {
          if (!prev) return null;
          return {
            ...prev,
            generated_content: {
              ...(prev.generated_content || {}),
              patent_application: content,
            },
          };
        });
        setUnsavedChanges(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, analyzedInvention, setAnalyzedInvention]);

  // Sync figure selection
  useEffect(() => {
    if (
      analyzedInvention &&
      analyzedInvention.figures &&
      typeof analyzedInvention.figures === 'object'
    ) {
      const figuresObj = analyzedInvention.figures as Record<string, unknown>;
      if (!currentFigure || !figuresObj[currentFigure]) {
        const figureKeys = Object.keys(figuresObj);
        if (figureKeys.length > 0) {
          setCurrentFigure(figureKeys[0]);
        }
      }
    }
  }, [analyzedInvention, currentFigure]);

  // Function to handle element updates
  const handleElementUpdate = (newElements: Record<string, string>) => {
    setAnalyzedInvention(prev => {
      if (!prev) return null;
      return {
        ...prev,
        elements: newElements,
      };
    });
  };

  // Function to handle undo
  const handleUndo = () => {
    if (previousContent !== null) {
      setContent(previousContent);
      setPreviousContent(null);
      toast({
        title: 'Changes Undone',
        description: 'Successfully reverted the last AI assistant changes',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Autosave on data changes
  useEffect(() => {
    if (projectId && unsavedChanges && analyzedInvention) {
      debouncedAutoSave(analyzedInvention);
    }
  }, [projectId, unsavedChanges, analyzedInvention, debouncedAutoSave]);

  return {
    // State
    isUpdating,
    isGenerating,
    setIsGenerating,
    hasGenerated,
    setHasGenerated,
    generationProgress,
    setGenerationProgress,
    content,
    setContent,
    isEditMode,
    setIsEditMode,
    previousContent,
    setPreviousContent,
    editorState,
    setEditorState,
    versions,
    setVersions,
    isVersionHistoryOpen,
    setIsVersionHistoryOpen,
    versionDescription,
    setVersionDescription,
    verificationResults,
    setVerificationResults,
    isVerifying,
    setIsVerifying,
    currentFigure,
    setCurrentFigure,
    activeTab,
    setActiveTab,
    toast,
    isSaving: updateProjectMutation.isPending,
    unsavedChanges,
    setUnsavedChanges,
    hasValidData: hasValidData(),
    completionStatus: getCompletionStatus(),

    // Handlers
    handleElementUpdate,
    handleUndo,

    // Actions
    updateField,
    updateSection,
    addClaim,
    updateClaim,
    deleteClaim,
    saveToProject,
    updateLocalData,
    updateAndSave,

    // Mutation state
    error: updateProjectMutation.error,
  };
};
