import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from 'react';
import { useCurrentProjectId } from '@/hooks/useCurrentProjectId';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';

// Layout components
import ViewLayout from '../../../components/layouts/ViewLayout';
import { LoadingState } from '../../../components/common/LoadingState';
import ProfessionalLoadingModal from '../../../components/ui/professional-loading-modal';
import TechnologyHeader from './TechnologyHeader';
import TechMainPanel from './TechMainPanel';
import { TechnologyDetailsSkeleton } from './TechnologyDetailsSkeleton';

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

  const currentProjectId = useCurrentProjectId();
  const [currentFigure, setCurrentFigure] = useState('FIG. 1');

  // const { textInput, setTextInput } = useProjectAutosave();
  const [textInput, setTextInput] = useState('');
  const [isWaitingForData, setIsWaitingForData] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveProjectId = currentProjectId || '';

  const {
    data: inventionData,
    isLoading: isLoadingData,
    isFetching,
    refetch: _refetchInventionData,
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

  // Reset hasCheckedForInvention when project changes
  useEffect(() => {
    setHasCheckedForInvention(false);
  }, [effectiveProjectId]);

  // Clear waiting state when invention data is loaded
  useEffect(() => {
    if (
      inventionData &&
      hasInventionBeenProcessed(inventionData) &&
      isWaitingForData
    ) {
      setIsWaitingForData(false);
    }
  }, [inventionData, isWaitingForData]);

  const updateInventionMutation = useUpdateInventionMutation();
  const deleteFigureMutation = useDeleteFigureMutation();

  // Use the file management hook for text files
  const {
    uploadedFiles,
    handleTextFileUpload,
    handleRemoveTextFile,
    toggleFileInProcessing,
    getFilesForProcessing,
  } = useFileManagement(currentProjectId ?? undefined, textInput, setTextInput);

  // Use the existing file handler hook for figure uploads
  const {
    handleFileUpload: handleFigureUpload,
    isUploading: _isUploading,
    uploadedFigures,
    resetFigureNumbering,
    clearUploadedFile: clearUploadedFigure,
    reorderUploadedFigures,
    updateFigureNumber,
  } = useTechnologyInputFileHandler({
    projectId: currentProjectId || '',
    onFigureUpload: figure => {
      // No need to update state here as it's managed in the hook
    },
  });

  // State for uploaded figures is now managed in the hook, remove the local state
  // const [uploadedFigures, setUploadedFigures] = useState<UploadedFigure[]>([]);

  const { isProcessing, analyzeInventionText } = useInventionAnalysis(
    textInput,
    currentProjectId || undefined,
    uploadedFigures
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
        toast.error({
          title: 'File Upload Error',
          description:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
        });
        throw error;
      }
    },
    [currentProjectId, handleFigureUpload, handleTextFileUpload, toast]
  );

  const updateHandlers = useMemo(() => {
    const handleUpdateInventionData = (field: string, value: unknown) => {
      if (!currentProjectId) return;
      updateInventionMutation.mutate({
        projectId: currentProjectId,
        updates: { [field]: value },
      });
    };

    const handleUpdateBackgroundField = (field: string, value: unknown) => {
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
      value: unknown
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
    const filesToProcess = getFilesForProcessing();

    if (
      !textInput.trim() &&
      filesToProcess.length === 0 &&
      uploadedFigures.length === 0
    ) {
      toast.warning({
        title: 'No Content',
        description: 'Please upload files or enter text before analyzing',
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
    getFilesForProcessing,
    uploadedFigures.length,
    analyzeInventionText,
    toast,
  ]);

  const handleRemoveFigure = useCallback(
    (figureId: string) => {
      const figure = uploadedFigures.find(f => f.id === figureId);

      if (!figure || !currentProjectId) return;

      // Remove from UI first
      clearUploadedFigure(figure.fileName);

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
            toast.info({
              title: 'Figure Deleted',
              description: 'Figure deleted successfully',
            });
          },
          onError: error => {
            logger.error('Failed to delete figure:', error);
            toast.error({
              title: 'Delete Failed',
              description: 'Failed to delete figure',
            });
          },
        }
      );
    },
    [
      deleteFigureMutation,
      toast,
      currentProjectId,
      uploadedFigures,
      clearUploadedFigure,
    ]
  );

  // Use the utility function to check if invention has been processed
  const hasBeenProcessed = hasInventionBeenProcessed(inventionData || null);

  // Check if this is an initial load (no data at all)
  const isInitialLoad = isLoadingData && inventionData === undefined;
  
  // Show input view when we have data but invention hasn't been processed
  const shouldShowInputView = !isInitialLoad && !hasBeenProcessed && !!currentProjectId;
  
  // Show main content when invention has been processed
  const shouldShowMainContent = !isInitialLoad && hasBeenProcessed && !!currentProjectId;

  // Loading state with no project context - show custom skeleton
  if (!currentProjectId) {
    return <TechnologyDetailsSkeleton />;
  }

  // Only show skeleton on initial load when there's no cached data
  if (isInitialLoad) {
    return <TechnologyDetailsSkeleton />;
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
          onToggleFileInProcessing={toggleFileInProcessing}
          onRemoveFigure={handleRemoveFigure}
          onResetFigureNumbers={resetFigureNumbering}
          onReorderFigures={reorderUploadedFigures}
          onUpdateFigureNumber={updateFigureNumber}
          fileInputRef={fileInputRef}
        />

        {/* Show processing modal when analyzing */}
        <ProfessionalLoadingModal
          isOpen={isProcessing || isWaitingForData}
          title={
            isProcessing ? 'AI Analysis in Progress' : 'Loading Your Invention'
          }
          message={
            isProcessing
              ? 'Analyzing your invention details. This may take a moment...'
              : 'Preparing your invention data...'
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
