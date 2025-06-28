import React, { useState, useMemo, useCallback } from 'react';
import { Box, Flex, Icon, useToast } from '@chakra-ui/react';
import {
  FiMessageCircle,
  FiFileText,
  FiImage,
  FiBookmark,
} from 'react-icons/fi';

import { SidebarContainer } from '../../../../components/layouts/containers';
import { SavedPriorArtTabWrapper } from '../SavedPriorArtTabWrapper';
import { SavedPriorArtTabManager } from '../SavedPriorArtTabManager';
import ChatInterface from '@/features/chat/components/ChatInterface';
import { FiguresTab as SharedFiguresTab } from '@/components';

import { TechDetailsSidebarProps } from '../../types/techDetailsSidebar';
import { InventionData } from '@/types';
import { logger } from '@/lib/monitoring/logger';

// Using shared FiguresTab component for consistency across sidebars

/**
 * A sidebar component for managing technology details including figures and AI assistance.
 * This component has been refactored to be a simpler, more direct container. It receives
 * all necessary data as props and passes them down to the relevant child components.
 * The complex, nested "manager" components have been removed to simplify data flow.
 */
const TechDetailsSidebar: React.FC<
  TechDetailsSidebarProps & {
    projectId: string | null;
    inventionData: InventionData | null;
    currentFigure: string;
    setCurrentFigure: (figureKey: string) => void;
    onUpdateInvention: (updatedInvention: InventionData) => void;
  }
> = ({
  projectId,
  inventionData,
  currentFigure,
  setCurrentFigure,
  onUpdateInvention,
}) => {
  // The state for the active tab is managed here.
  const [activeTab, setActiveTab] = useState(0);
  const toast = useToast();

  // Memoized project data for chat
  const projectDataForChat = useMemo(() => {
    if (!projectId || !inventionData) return null;

    return {
      id: projectId,
      name: inventionData.title || 'Technology Details',
      userId: '', // Will be populated by ChatInterface if needed
      tenantId: '', // Will be populated by ChatInterface if needed
      status: 'draft' as const,
      textInput: inventionData.description || '',
      createdAt: new Date(),
      lastModified: new Date().toISOString(),
      documents: [],
      savedPriorArtItems: [],
      invention: inventionData,
    };
  }, [projectId, inventionData]);

  // Handle chat content update
  const handleChatContentUpdate = useCallback(
    (action: string) => {
      logger.log('[TechDetailsSidebar] Chat content update:', { action });

      if (action === 'refresh') {
        // Trigger a refresh of the invention data
        // The parent component should handle this refresh
        toast({
          title: 'Refreshing invention data...',
          status: 'info',
          duration: 2000,
        });
        // Call the update handler to trigger a refresh
        if (inventionData) {
          onUpdateInvention(inventionData);
        }
      }
    },
    [onUpdateInvention, inventionData, toast]
  );

  // Create stable tab content components
  const figuresTabContent = useMemo(
    () => (
      <SharedFiguresTab
        projectId={projectId}
        inventionData={inventionData}
        currentFigure={currentFigure}
        setCurrentFigure={setCurrentFigure}
        onFigureChange={setCurrentFigure}
      />
    ),
    [projectId, currentFigure, setCurrentFigure]
  ); // Note: inventionData removed from dependencies

  // These tabs are currently placeholders and can be wired up later.
  const chatTabContent = useMemo(
    () => (
      <Box height="100%" overflow="hidden">
        {projectId && projectDataForChat ? (
          <ChatInterface
            projectData={projectDataForChat}
            onContentUpdate={handleChatContentUpdate}
            setPreviousContent={() => {
              /* no-op */
            }}
            pageContext="technology"
            projectId={projectId}
          />
        ) : (
          <Box p={4} color="text.secondary">
            Loading project...
          </Box>
        )}
      </Box>
    ),
    [projectId, projectDataForChat, handleChatContentUpdate]
  );

  const priorArtTabContent = useMemo(
    () => (
      <SavedPriorArtTabManager>
        {({
          savedPriorArt,
          isLoading,
          handleRemovePriorArt,
          handleOpenPriorArtDetails,
        }) => (
          <SavedPriorArtTabWrapper
            savedPriorArt={savedPriorArt}
            onRemovePriorArt={handleRemovePriorArt}
            onOpenPriorArtDetails={handleOpenPriorArtDetails}
          />
        )}
      </SavedPriorArtTabManager>
    ),
    []
  );

  const tabIcons = useMemo(
    () => [
      <Flex key="figuresIcon" align="center" justify="center" height="24px">
        <Icon as={FiImage} boxSize="16px" />
      </Flex>,
      <Flex key="priorArtIcon" align="center" justify="center" height="24px">
        <Icon as={FiBookmark} boxSize="16px" />
      </Flex>,
      <Flex key="chatIcon" align="center" justify="center" height="24px">
        <Icon as={FiMessageCircle} boxSize="16px" />
      </Flex>,
    ],
    []
  );

  const tabTitles = useMemo(() => ['Figures', 'Saved Prior Art', 'Chat'], []);

  // Create stable references for tab contents
  const tabContents = useMemo(
    () => [figuresTabContent, priorArtTabContent, chatTabContent],
    [figuresTabContent, priorArtTabContent, chatTabContent]
  );

  return (
    <SidebarContainer
      tabTitles={tabTitles}
      tabIcons={tabIcons}
      tabContents={tabContents}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
};

export default TechDetailsSidebar;
