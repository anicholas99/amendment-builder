import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useToast } from '@chakra-ui/react';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { logger } from '@/lib/monitoring/logger';
import {
  extractSections,
  STANDARD_SECTION_ORDER,
} from '../utils/patent-sections';
import { ApplicationVersionWithDocuments } from '@/types/versioning';
import { ProjectApiService } from '@/client/services/project.client-service';
import { useQuery } from '@tanstack/react-query';
import { versionQueryKeys } from '@/lib/queryKeys/versionQueryKeys';
import { STALE_TIME } from '@/constants/time';

type SectionType =
  | 'TITLE'
  | 'FIELD'
  | 'BACKGROUND'
  | 'SUMMARY'
  | 'BRIEF_DESCRIPTION_OF_THE_DRAWINGS'
  | 'DETAILED_DESCRIPTION'
  | 'CLAIM_SET'
  | 'ABSTRACT';

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

interface SectionState {
  content: string;
  isDirty: boolean;
  saveStatus: SaveStatus;
}

export const useSectionBasedEditor = ({
  currentVersion,
  projectId,
}: {
  currentVersion: ApplicationVersionWithDocuments | null | undefined;
  projectId?: string;
}) => {
  const toast = useToast();

  // Track state for each section independently
  const [sections, setSections] = useState<Record<SectionType, SectionState>>(
    {} as any
  );
  const [activeSectionType, setActiveSectionType] =
    useState<SectionType | null>(null);

  // Track which sections are currently saving
  const savingQueue = useRef<Set<SectionType>>(new Set());

  // Initialize sections from current version
  useEffect(() => {
    if (!currentVersion) return;

    const newSections: Record<string, SectionState> = {};

    // First, check if we have individual section documents
    const hasIndividualSections = currentVersion.documents.some(
      doc => doc.type !== 'FULL_CONTENT' && doc.content
    );

    if (hasIndividualSections) {
      // Use individual section documents
      currentVersion.documents.forEach(doc => {
        if (doc.type && doc.type !== 'FULL_CONTENT') {
          // Normalize document type to our SectionType keys
          const normalizedType = normalizeDocType(doc.type);
          if (normalizedType) {
            newSections[normalizedType] = {
              content: doc.content || '',
              isDirty: false,
              saveStatus: 'idle',
            };
          }
        }
      });
    } else {
      // Fall back to extracting from FULL_CONTENT if that's all we have
      const fullContentDoc = currentVersion.documents.find(
        d => d.type === 'FULL_CONTENT'
      );

      if (fullContentDoc?.content) {
        const extractedSections = extractSections(fullContentDoc.content);

        // Map extracted sections to our section types
        Object.entries(extractedSections).forEach(([key, content]) => {
          const sectionType = mapExtractedKeyToSectionType(key);
          if (sectionType) {
            newSections[sectionType] = {
              content,
              isDirty: false,
              saveStatus: 'idle',
            };
          }
        });
      }
    }

    setSections(newSections as Record<SectionType, SectionState>);
  }, [currentVersion]);

  // Save a specific section
  const saveSection = useCallback(
    async (sectionType: SectionType, showToast: boolean = false) => {
      if (!projectId || !currentVersion) return;

      const section = sections[sectionType];
      if (!section || !section.isDirty) return;

      // Avoid duplicate saves
      if (savingQueue.current.has(sectionType)) return;

      savingQueue.current.add(sectionType);

      setSections(prev => ({
        ...prev,
        [sectionType]: { ...prev[sectionType], saveStatus: 'saving' },
      }));

      try {
        logger.info(`[useSectionBasedEditor] Saving ${sectionType} section`, {
          versionId: currentVersion.id,
          contentLength: section.content.length,
        });

        const result = await ProjectApiService.updatePatentSection(
          projectId,
          currentVersion.id,
          sectionType,
          section.content
        );

        if (result.updated) {
          logger.info(`[useSectionBasedEditor] ${sectionType} section saved`, {
            documentId: result.documentId,
          });
        }

        setSections(prev => ({
          ...prev,
          [sectionType]: {
            ...prev[sectionType],
            isDirty: false,
            saveStatus: 'success',
          },
        }));

        // Reset status after a delay
        setTimeout(() => {
          setSections(prev => ({
            ...prev,
            [sectionType]: { ...prev[sectionType], saveStatus: 'idle' },
          }));
        }, 2000);
      } catch (error) {
        logger.error(`Failed to save ${sectionType} section`, { error });

        setSections(prev => ({
          ...prev,
          [sectionType]: { ...prev[sectionType], saveStatus: 'error' },
        }));

        if (showToast) {
          toast({
            title: `Failed to save ${sectionType}`,
            description: 'Please try again',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      } finally {
        savingQueue.current.delete(sectionType);
      }
    },
    [currentVersion, projectId, sections, toast]
  );

  // Debounced save for auto-save functionality with increased delay
  const [debouncedSaveSection] = useDebouncedCallback(
    useCallback(
      (sectionType: SectionType) => {
        // Only save if the section is dirty and not already saving
        const section = sections[sectionType];
        if (section?.isDirty && !savingQueue.current.has(sectionType)) {
          saveSection(sectionType, false);
        }
      },
      [saveSection, sections]
    ),
    2500 // Increased to 2.5 seconds
  );

  // Update a specific section's content with batching
  const updateSectionContent = useCallback(
    (sectionType: SectionType, newContent: string) => {
      setSections(prev => {
        const currentSection = prev[sectionType];
        if (currentSection && currentSection.content === newContent) {
          return prev; // No change
        }

        // Only mark as dirty if content actually changed
        const isDirty = currentSection?.content !== newContent;

        return {
          ...prev,
          [sectionType]: {
            content: newContent,
            isDirty,
            saveStatus: currentSection?.saveStatus || 'idle',
          },
        };
      });

      // Only trigger auto-save if content actually changed
      if (sections[sectionType]?.content !== newContent) {
        debouncedSaveSection(sectionType);
      }
    },
    [debouncedSaveSection, sections]
  );

  // Get the full document content by combining all sections
  const getFullContent = useCallback(() => {
    // Map section types to proper display titles and standard names
    const sectionTypeToStandardName: Record<SectionType, string> = {
      TITLE: 'Title',
      FIELD: 'FIELD',
      BACKGROUND: 'BACKGROUND',
      SUMMARY: 'SUMMARY',
      BRIEF_DESCRIPTION_OF_THE_DRAWINGS: 'BRIEF DESCRIPTION OF THE DRAWINGS',
      DETAILED_DESCRIPTION: 'DETAILED DESCRIPTION',
      CLAIM_SET: 'CLAIMS',
      ABSTRACT: 'ABSTRACT',
    };

    // Use the standard section order, excluding Title which is handled separately
    const orderedSections = STANDARD_SECTION_ORDER.slice(1) // Skip 'Title' as it's handled separately
      .map(standardName => {
        // Find the corresponding SectionType key
        const entry = Object.entries(sectionTypeToStandardName).find(
          ([_, value]) => value === standardName
        );
        return entry ? (entry[0] as SectionType) : null;
      })
      .filter((type): type is SectionType => type !== null);

    let fullContent = '';

    // Handle title separately
    const titleSection = sections['TITLE'];
    if (titleSection?.content) {
      fullContent += `<h1>${titleSection.content}</h1>\n\n`;
    }

    // Add remaining sections in standard order
    orderedSections.forEach(sectionType => {
      const section = sections[sectionType];
      if (section?.content) {
        const headerText = sectionTypeToStandardName[sectionType];
        fullContent += `<h2>${headerText}</h2>\n\n${section.content}\n\n`;
      }
    });

    return fullContent.trim();
  }, [sections]);

  // Save all dirty sections with batching
  const saveAllDirtySections = useCallback(async () => {
    const dirtySections = Object.entries(sections)
      .filter(
        ([_, state]) =>
          state.isDirty && !savingQueue.current.has(_ as SectionType)
      )
      .map(([type]) => type as SectionType);

    if (dirtySections.length === 0) return;

    // Batch save sections - don't show individual toasts
    await Promise.all(
      dirtySections.map(sectionType => saveSection(sectionType, false))
    );
  }, [sections, saveSection]);

  // Track overall saving status
  const savingStatus = useMemo((): SaveStatus => {
    const statuses = Object.values(sections).map(s => s.saveStatus);
    if (statuses.some(s => s === 'error')) return 'error';
    if (statuses.some(s => s === 'saving')) return 'saving';
    if (statuses.every(s => s === 'success')) return 'success';
    return 'idle';
  }, [sections]);

  // Compatibility layer for old interface
  const hasGenerated = useMemo(() => {
    return Object.values(sections).some(
      section => section.content && section.content.trim().length > 0
    );
  }, [sections]);

  // Load versions data (compatibility with old hook)
  const { data: versions = [], isLoading: isLoadingVersions } = useQuery({
    queryKey: versionQueryKeys.list(projectId!),
    queryFn: () => ProjectApiService.getProjectVersions(projectId!),
    enabled: !!projectId,
    staleTime: STALE_TIME.DEFAULT,
  });

  return {
    sections,
    activeSectionType,
    setActiveSectionType,
    updateSectionContent,
    saveSection,
    saveAllDirtySections,
    getFullContent,
    // Compatibility with old interface
    patentContent: getFullContent(),
    hasGenerated,
    handleSaveContent: saveAllDirtySections,
    refreshContent: () => {}, // No-op for now
    versions,
    isLoadingVersions,
    editorContent: getFullContent(),
    setEditorContent: (content: string, forceUpdate?: boolean) => {
      // For compatibility, extract sections and update them
      if (forceUpdate || content !== getFullContent()) {
        const extractedSections = extractSections(content);
        Object.entries(extractedSections).forEach(([key, sectionContent]) => {
          const sectionType = mapExtractedKeyToSectionType(key);
          if (sectionType) {
            updateSectionContent(sectionType, sectionContent);
          }
        });
      }
    },
    savingStatus,
    // String-based version for compatibility with editor
    updateSectionContentString: (sectionType: string, newContent: string) => {
      updateSectionContent(sectionType as SectionType, newContent);
    },
  };
};

// Helper function to map extracted section keys to our section types
function mapExtractedKeyToSectionType(key: string): SectionType | null {
  const mapping: Record<string, SectionType> = {
    Title: 'TITLE',
    FIELD: 'FIELD',
    BACKGROUND: 'BACKGROUND',
    SUMMARY: 'SUMMARY',
    'BRIEF DESCRIPTION OF THE DRAWINGS': 'BRIEF_DESCRIPTION_OF_THE_DRAWINGS',
    'DETAILED DESCRIPTION': 'DETAILED_DESCRIPTION',
    CLAIMS: 'CLAIM_SET',
    ABSTRACT: 'ABSTRACT',
  };

  return mapping[key] || null;
}

// Helper function to normalize document type
function normalizeDocType(type: string): SectionType | null {
  const normalized = type.replace(/\s+/g, '_').toUpperCase();
  const allowed: Record<string, SectionType> = {
    TITLE: 'TITLE',
    FIELD: 'FIELD',
    BACKGROUND: 'BACKGROUND',
    SUMMARY: 'SUMMARY',
    BRIEF_DESCRIPTION_OF_THE_DRAWINGS: 'BRIEF_DESCRIPTION_OF_THE_DRAWINGS',
    DETAILED_DESCRIPTION: 'DETAILED_DESCRIPTION',
    CLAIMS: 'CLAIM_SET',
    CLAIM_SET: 'CLAIM_SET',
    ABSTRACT: 'ABSTRACT',
  };
  return allowed[normalized] || null;
}
