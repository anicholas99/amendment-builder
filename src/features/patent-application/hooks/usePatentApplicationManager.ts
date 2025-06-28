import { useState, useCallback, useMemo, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/monitoring/logger';
import { InventionData } from '@/types';
import { ApplicationVersionWithDocuments } from '@/types/versioning';
import { usePatentGeneration } from './usePatentGeneration';
import { useOptimisticPatentSave } from './useOptimisticPatentSave';
import { usePatentVersionManager } from './usePatentVersionManager';
import { usePatentContentManager } from './usePatentContentManager';
import { useBatchUpdateDocumentsMutation } from '@/hooks/api/useDocuments';
import { exportToDocx } from '../utils/patentViewUtils';

interface UsePatentApplicationManagerOptions {
  projectId: string;
  activeProjectData: any;
  inventionData?: InventionData | null;
  latestVersion?: ApplicationVersionWithDocuments | null;
  latestVersionError?: any;
  isLatestVersionError?: boolean;
}

interface UsePatentApplicationManagerReturn {
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

  // Version Operations
  handleSaveNewVersion: (versionName: string) => Promise<void>;
  handleLoadVersion: (versionId: string) => Promise<void>;
  handleResetApplication: () => Promise<void>;

  // Derived Data
  priorArtItems: any[];
}

/**
 * Composite hook that manages all patent application state and operations
 * This consolidates all the interdependent logic into a single orchestrator
 */
export const usePatentApplicationManager = ({
  projectId,
  activeProjectData,
  inventionData,
  latestVersion,
  latestVersionError,
  isLatestVersionError,
}: UsePatentApplicationManagerOptions): UsePatentApplicationManagerReturn => {
  const toast = useToast();
  const queryClient = useQueryClient();

  // --- UI State ---
  const [selectedRefIds, setSelectedRefIds] = useState<string[]>([]);
  const [currentFigure, setCurrentFigure] = useState<string>('FIG. 1');
  const [activeTab, setActiveTab] = useState(0);

  // --- Mutations ---
  const batchUpdateDocumentsMutation = useBatchUpdateDocumentsMutation();

  // --- Patent Generation ---
  const {
    isGenerating,
    generationProgress,
    handleGeneratePatent: generatePatentInternal,
  } = usePatentGeneration(projectId);

  // --- Version Manager (with temporary values) ---
  const versionManager = usePatentVersionManager({
    projectId,
    patentContent: '', // Will be updated below
    latestVersion,
    queueContentUpdate: () => {}, // Will be updated below
    clearPendingSaves: () => {}, // Will be updated below
  });

  // --- Content Manager (with temporary values) ---
  const contentManager = usePatentContentManager({
    projectId,
    latestVersion,
    inventionData,
    localEditorContent: versionManager.localEditorContent,
    queueContentUpdate: () => {}, // Will be updated below
    forceSave: async () => {}, // Will be updated below
  });

  // --- Optimistic Save (with actual updateCurrentVersionDocument) ---
  const { queueContentUpdate, forceSave, isSaving, hasUnsavedChanges, clearPendingSaves } =
    useOptimisticPatentSave({
      currentVersion: latestVersion,
      batchUpdateDocumentsMutation,
      updateCurrentVersionDocument: contentManager.updateCurrentVersionDocument,
      projectId,
    });

  // --- Now recreate managers with actual implementations ---
  const finalVersionManager = usePatentVersionManager({
    projectId,
    patentContent: contentManager.patentContent,
    latestVersion,
    queueContentUpdate,
    clearPendingSaves,
  });

  const finalContentManager = usePatentContentManager({
    projectId,
    latestVersion,
    inventionData,
    localEditorContent: versionManager.localEditorContent,
    queueContentUpdate,
    forceSave,
  });

  // --- Determine hasGenerated with error handling ---
  const hasGenerated = useMemo(() => {
    // If we have a 404 error (no versions found), treat as not generated
    if (isLatestVersionError && latestVersionError?.details?.status === 404) {
      return false;
    }

    return finalContentManager.hasGenerated;
  }, [
    finalContentManager.hasGenerated,
    isLatestVersionError,
    latestVersionError,
  ]);

  // --- Handlers ---
  const handleGeneratePatent = useCallback(
    async (selectedRefs?: string[]) => {
      await generatePatentInternal(undefined, selectedRefs);

      // Refresh content after generation
      if (latestVersion?.documents) {
        const fullContentDoc = latestVersion.documents.find(
          (d: any) => d.type === 'FULL_CONTENT'
        );
        if (fullContentDoc?.content) {
          // Queue the update but don't force save
          queueContentUpdate(fullContentDoc.content);
        }
      }
    },
    [generatePatentInternal, latestVersion, queueContentUpdate]
  );

  const handleSaveContent = useCallback(
    async (showToast: boolean = true, newContent?: string) => {
      const contentToSave = newContent ?? finalContentManager.patentContent;
      if (!contentToSave || !latestVersion) return;

      // Clear local content when saving
      if (versionManager.localEditorContent !== null) {
        versionManager.setLocalEditorContent(null);
      }

      queueContentUpdate(contentToSave);

      if (showToast) {
        await forceSave();
      }
    },
    [
      finalContentManager.patentContent,
      latestVersion,
      versionManager.localEditorContent,
      versionManager.setLocalEditorContent,
      queueContentUpdate,
      forceSave,
    ]
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
    await exportToDocx(inventionData, finalContentManager.patentContent, toast);
  }, [inventionData, finalContentManager.patentContent, toast]);

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

  // Clear local content when latest version updates
  useEffect(() => {
    if (versionManager.localEditorContent !== null && latestVersion) {
      versionManager.setLocalEditorContent(null);
    }
  }, [latestVersion?.id]);

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
    patentContent: finalContentManager.patentContent,
    hasGenerated,
    isSaving,
    hasUnsavedChanges,

    // Generation
    isGenerating,
    generationProgress,
    handleGeneratePatent,

    // Content Operations
    handleSaveContent,
    handleExport,
    handleSyncClaims: finalContentManager.handleSyncClaims,
    handleRebuildSections: finalContentManager.handleRebuildSections,
    refreshContent: finalContentManager.refreshContent,

    // Version Operations
    handleSaveNewVersion: finalVersionManager.handleSaveNewVersion,
    handleLoadVersion: finalVersionManager.handleLoadVersion,
    handleResetApplication: finalVersionManager.handleResetApplication,

    // Derived Data
    priorArtItems,
  };
};
