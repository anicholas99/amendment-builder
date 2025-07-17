import React, { useState, useMemo, useCallback } from 'react';
import { MessageCircle, FileText, Image } from 'lucide-react';
import { useToast } from '@/hooks/useToastWrapper';

import { SidebarContainer } from '../../../../components/layouts/containers';
import EnhancedChatInterface from '@/features/chat/components/EnhancedChatInterface';
import { FiguresTab as SharedFiguresTab } from '@/components';
import { LinkedPatentFiles } from '../LinkedPatentFiles';

import { TechDetailsSidebarProps } from '../../types/techDetailsSidebar';
import { InventionData } from '@/types';
import { logger } from '@/utils/clientLogger';
import { TECHNOLOGY_TAB_TITLES } from '../../constants/tabs';

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
      hasPatentContent: false,
      hasProcessedInvention: true, // Since we have inventionData
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
      logger.info('[TechDetailsSidebar] Chat content update:', { action });

      if (action === 'refresh') {
        // Trigger a refresh of the invention data
        // The parent component should handle this refresh
        toast.info({
          title: 'Refreshing invention data...',
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
    [projectId, inventionData, currentFigure, setCurrentFigure]
  );

  // These tabs are currently placeholders and can be wired up later.
  const chatTabContent = useMemo(
    () => (
      <div className="h-full overflow-hidden">
        {projectId && projectDataForChat ? (
          <EnhancedChatInterface
            projectData={projectDataForChat}
            onContentUpdate={handleChatContentUpdate}
            setPreviousContent={() => {
              /* no-op */
            }}
            pageContext="technology"
            projectId={projectId}
          />
        ) : (
          <div className="p-4 text-muted-foreground">Loading project...</div>
        )}
      </div>
    ),
    [projectId, projectDataForChat, handleChatContentUpdate]
  );

  const projectFilesTabContent = useMemo(
    () => (
      <div className="h-full overflow-y-auto bg-muted/30">
        {/* Unified Project Files View */}
        {projectId && <LinkedPatentFiles projectId={projectId} />}
      </div>
    ),
    [projectId]
  );

  const tabIcons = useMemo(
    () => [
      <div key="figuresIcon" className="flex items-center justify-center h-6">
        <Image className="h-4 w-4" />
      </div>,
      <div
        key="referenceDocsIcon"
        className="flex items-center justify-center h-6"
      >
        <FileText className="h-4 w-4" />
      </div>,
      <div key="chatIcon" className="flex items-center justify-center h-6">
        <MessageCircle className="h-4 w-4" />
      </div>,
    ],
    []
  );

  const tabTitles = useMemo(() => [...TECHNOLOGY_TAB_TITLES], []);

  // Create stable references for tab contents
  const tabContents = useMemo(
    () => [figuresTabContent, projectFilesTabContent, chatTabContent],
    [figuresTabContent, projectFilesTabContent, chatTabContent]
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
