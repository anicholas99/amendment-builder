import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from 'react';
import { useCurrentProjectId } from '@/hooks/useCurrentProjectId';
import { Box, useToast } from '@chakra-ui/react';
import { logger } from '@/lib/monitoring/logger';
import { useQueryClient } from '@tanstack/react-query';

// Layout components
import ViewLayout from '../../../components/layouts/ViewLayout';
import SkeletonLoader from '../../../components/common/SkeletonLoader';
import ProfessionalLoadingModal from '../../../components/ui/ProfessionalLoadingModal';
import TechnologyHeader from './TechnologyHeader';
import TechMainPanel from './TechMainPanel';

// Import the original sidebar
import TechDetailsSidebar from './figures/TechDetailsSidebar';

// Context hooks
// import { useProjectAutosave } from '@/contexts/ProjectAutosaveContext';

// API and data hooks
import {
  useInventionQuery,
  useUpdateInventionMutation,
  useDeleteFigureMutation,
} from '@/hooks/api/useInvention';
import { VIEW_LAYOUT_CONFIG } from '@/constants/layout';

// Utils
import { createUpdateHandlers } from '../utils/createUpdateHandlers';
import { hasInventionBeenProcessed } from '../utils/inventionStatus';

// Hooks
import { useTechnologyInputFileHandler } from '../hooks/useTechnologyInputFileHandler';
import { useFileManagement } from '../hooks/useFileManagement';
import { useInventionAnalysis } from '../hooks/useInventionAnalysis';

// Types
import { InventionData } from '@/types/invention';
import { UploadedFigure } from '../hooks/useTechnologyInputFileHandler';
import { TechnologyDetailsInput } from './TechnologyDetailsInput';

/**
 * Simplified Technology Details View that shows input view when no data exists,
 * and data view when invention has been processed. Simple and user-friendly.
 */
const TechnologyDetailsViewClean: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const currentProjectId = useCurrentProjectId();
  const [currentFigure, setCurrentFigure] = useState('FIG. 1');

  // const { textInput, setTextInput } = useProjectAutosave();
  const [textInput, setTextInput] = useState('');
  const [isWaitingForData, setIsWaitingForData] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveProjectId = currentProjectId || '';
  
  // Check if this is likely a new project based on URL or navigation
  const isLikelyNewProject = useRef(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && effectiveProjectId) {
      // Check if we came from project creation
      const referrer = document.referrer;
      const fromProjectDashboard = referrer.includes('/projects') && !referrer.includes('/projects/');
      
      // Check query cache to see if project was just created
      const cachedInvention = queryClient.getQueryData(['invention', effectiveProjectId]);
      
      if (fromProjectDashboard && cachedInvention === null) {
        isLikelyNewProject.current = true;
      }
    }
  }, [effectiveProjectId, queryClient]);

  const {
    data: inventionData,
    isLoading: isLoadingData,
    isFetching,
    refetch: refetchInventionData,
  } = useInventionQuery(effectiveProjectId);

  // Track if this is potentially a new project without invention data
  const [hasCheckedForInvention, setHasCheckedForInvention] = useState(false);

  useEffect(() => {
    if (inventionData?.description) {
      setTextInput(inventionData.description);
    }
  }, [inventionData]);

  // Mark that we've checked for invention data once the query resolves
  useEffect(() => {
    if (!isLoadingData && !isFetching) {
      setHasCheckedForInvention(true);
    }
  }, [isLoadingData, isFetching]);

  // Clear waiting state when invention data is loaded
  useEffect(() => {
    if (inventionData && hasInventionBeenProcessed(inventionData) && isWaitingForData) {
      setIsWaitingForData(false);
    }
  }, [inventionData, isWaitingForData]);

  const updateInventionMutation = useUpdateInventionMutation();
  const deleteFigureMutation = useDeleteFigureMutation();

  // Use the file management hook for text files
  const { uploadedFiles, handleTextFileUpload, handleRemoveTextFile } =
    useFileManagement(textInput, setTextInput);

  // State for uploaded figures
  const [uploadedFigures, setUploadedFigures] = useState<UploadedFigure[]>([]);

  // Use the existing file handler hook for figure uploads
  const { handleFileUpload: handleFigureUpload, isUploading } =
    useTechnologyInputFileHandler({
      projectId: currentProjectId || '',
      onFigureUpload: figure => {
        setUploadedFigures(prev => [...prev, figure]);
      },
    });

  const { isProcessing, analyzeInventionText } = useInventionAnalysis(
    textInput,
    undefined
  );

  // Combined file upload handler
  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        if (file.type.startsWith('image/')) {
          // Handle figure upload
          if (!currentProjectId) return;
          await handleFigureUpload(file);
        } else {
          // Handle text file upload
          await handleTextFileUpload(file);
        }
      } catch (error) {
        logger.error('Error in file upload:', error);
        toast({
          title: 'File Upload Error',
          description:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
          status: 'error',
          duration: 5000,
          position: 'bottom-right',
        });
        throw error;
      }
    },
    [currentProjectId, handleFigureUpload, handleTextFileUpload, toast]
  );

  const updateHandlers = useMemo(() => {
    const handleUpdateInventionData = (field: string, value: string | number | boolean | Record<string, unknown>) => {
      if (!currentProjectId) return;
      updateInventionMutation.mutate({
        projectId: currentProjectId,
        updates: { [field]: value },
      });
    };

    const handleUpdateBackgroundField = (field: string, value: string | number | boolean | Record<string, unknown>) => {
      if (!currentProjectId) return;
      const currentInvention = updateInventionMutation.data || inventionData;
      const currentBackground = currentInvention?.background;
      const backgroundObj =
        typeof currentBackground === 'object' && currentBackground !== null
          ? currentBackground
          : {};
      updateInventionMutation.mutate({
        projectId: currentProjectId,
        updates: {
          background: {
            ...backgroundObj,
            [field]: value,
          },
        },
      });
    };

    const handleUpdateTechnicalImplementationField = (
      field: string,
      value: string | number | boolean | Record<string, unknown>
    ) => {
      if (!currentProjectId) return;
      const currentInvention = updateInventionMutation.data || inventionData;
      const currentImpl = currentInvention?.technicalImplementation || {};
      updateInventionMutation.mutate({
        projectId: currentProjectId,
        updates: {
          technicalImplementation: {
            ...currentImpl,
            [field]: value,
          },
        },
      });
    };

    return createUpdateHandlers(
      handleUpdateInventionData,
      handleUpdateBackgroundField,
      handleUpdateTechnicalImplementationField,
      toast
    );
  }, [updateInventionMutation, toast, currentProjectId, inventionData]);

  const handleUpdateInvention = useCallback(
    (updatedInvention: InventionData) => {
      if (!currentProjectId) return;
      updateInventionMutation.mutate({
        projectId: currentProjectId,
        updates: updatedInvention,
      });
    },
    [updateInventionMutation, currentProjectId]
  );

  const handleProceedFromUpload = useCallback(async () => {
    if (
      !textInput.trim() &&
      uploadedFiles.length === 0 &&
      uploadedFigures.length === 0
    ) {
      toast({
        title: 'No Content',
        description: 'Please upload files or enter text before analyzing',
        status: 'warning',
        duration: 3000,
        position: 'bottom-right',
      });
      return;
    }
    setIsWaitingForData(true);
    const success = await analyzeInventionText();
    if (!success) {
      // If analysis fails, clear the waiting state
      setIsWaitingForData(false);
    }
  }, [
    textInput,
    uploadedFiles.length,
    uploadedFigures.length,
    analyzeInventionText,
    toast,
  ]);

  const handleRemoveFigure = useCallback(
    (figureId: string) => {
      const figure = uploadedFigures.find(f => f.id === figureId);

      // Optimistically remove from UI regardless of server result.
      setUploadedFigures(prev => prev.filter(f => f.id !== figureId));

      if (!figure || !currentProjectId) return;

      // Extract server-side figureId from the signed URL pattern.
      const match = figure.url.match(/figures\/([a-zA-Z0-9-]+)\/download/);
      const serverFigureId = match?.[1];

      if (!serverFigureId) {
        logger.error('Failed to parse figureId from URL:', figure.url);
        return;
      }

      deleteFigureMutation.mutate(
        { projectId: currentProjectId, figureId: serverFigureId },
        {
          onSuccess: () => {
            toast({
              title: 'Figure Deleted',
              description: 'Figure deleted successfully',
              status: 'info',
              duration: 2000,
              position: 'bottom-right',
            });
          },
          onError: error => {
            logger.error('Failed to delete figure:', error);
            toast({
              title: 'Delete Failed',
              description: 'Failed to delete figure',
              status: 'error',
              duration: 5000,
              position: 'bottom-right',
            });
          },
        }
      );
    },
    [deleteFigureMutation, toast, currentProjectId, uploadedFigures]
  );

  // Use the utility function to check if invention has been processed
  const hasBeenProcessed = hasInventionBeenProcessed(inventionData || null);

  // Optimize loading logic - don't show loading if we've already checked and found no invention
  // or if this is likely a new project
  const isActuallyLoading =
    (isLoadingData ||
    (isFetching && !hasCheckedForInvention) ||
    (!hasCheckedForInvention && inventionData === undefined && !!currentProjectId)) &&
    !isLikelyNewProject.current;

  const shouldShowInputView =
    !hasBeenProcessed && !isActuallyLoading && !!currentProjectId;

  if (!currentProjectId) {
    return (
      <ViewLayout
        header={<TechnologyHeader />}
        mainContent={
          <Box p={{ base: 4, md: 6 }} h="100%" overflowY="auto">
            <SkeletonLoader type="document" />
          </Box>
        }
        sidebarContent={
          <Box p={{ base: 3, md: 4 }} h="100%" overflowY="auto">
            <SkeletonLoader type="sidebar" />
          </Box>
        }
        {...VIEW_LAYOUT_CONFIG.DEFAULT_PROPS}
      />
    );
  }

  if (isActuallyLoading) {
    return (
      <ViewLayout
        header={<TechnologyHeader />}
        mainContent={
          <Box p={{ base: 4, md: 6 }} h="100%" overflowY="auto">
            <SkeletonLoader type="document" />
          </Box>
        }
        sidebarContent={
          <Box p={{ base: 3, md: 4 }} h="100%" overflowY="auto">
            <SkeletonLoader type="sidebar" />
          </Box>
        }
        {...VIEW_LAYOUT_CONFIG.DEFAULT_PROPS}
      />
    );
  }

  if (shouldShowInputView) {
    return (
      <>
        <TechnologyDetailsInput
          value={textInput}
          onChange={e => setTextInput(e.target.value)}
          isProcessing={isProcessing}
          handleProceed={handleProceedFromUpload}
          onFileUpload={handleFileUpload}
          uploadedFiles={uploadedFiles}
          uploadedFigures={uploadedFigures}
          onRemoveTextFile={handleRemoveTextFile}
          onRemoveFigure={handleRemoveFigure}
          fileInputRef={fileInputRef}
        />

        {/* Show processing modal when analyzing */}
        <ProfessionalLoadingModal
          isOpen={isProcessing || isWaitingForData}
          title={isProcessing ? "AI Analysis in Progress" : "Loading Your Invention"}
          message={
            isProcessing 
              ? "Analyzing your invention details. This may take a moment..." 
              : "Preparing your invention data..."
          }
          showProgress={true}
        />
      </>
    );
  }

  return (
    <ViewLayout
      header={<TechnologyHeader />}
      mainContent={
        <TechMainPanel
          projectId={currentProjectId}
          analyzedInvention={inventionData ?? null}
          onUpdateInvention={handleUpdateInvention}
        />
      }
      sidebarContent={
        <TechDetailsSidebar
          projectId={currentProjectId}
          inventionData={inventionData || null}
          analyzedInvention={inventionData || null}
          currentFigure={currentFigure}
          setCurrentFigure={setCurrentFigure}
          onUpdateInvention={handleUpdateInvention}
          {...updateHandlers}
          onUpdatePriorArt={() => {
            /* no-op */
          }}
        />
      }
      {...VIEW_LAYOUT_CONFIG.DEFAULT_PROPS}
    />
  );
};

export default TechnologyDetailsViewClean;
