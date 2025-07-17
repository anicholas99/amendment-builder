import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import EnhancedChatInterface from '@/features/chat/components/EnhancedChatInterface';
import { ProjectData } from '@/types/project';
import { InventionData } from '@/types/invention';
import { logger } from '@/utils/clientLogger';

interface ChatTabProps {
  projectData: ProjectData | null;
  projectId: string;
  analyzedInvention: InventionData | null;
  refreshInventionData?: () => Promise<void>;
}

/**
 * Chat tab component for the claim sidebar
 */
export function ChatTab({
  projectData,
  projectId,
  analyzedInvention,
  refreshInventionData,
}: ChatTabProps) {
  // Store refreshInventionData in a ref to prevent chat tab recreation
  const refreshInventionDataRef = useRef(refreshInventionData);
  useEffect(() => {
    refreshInventionDataRef.current = refreshInventionData;
  }, [refreshInventionData]);

  // Memoize the project data to prevent unnecessary re-renders
  const memoizedProjectData = useMemo(() => {
    if (!projectData) return null;

    return {
      id: projectData.id || projectId || '',
      name: projectData.name || 'Untitled Project',
      userId: projectData.userId || '',
      tenantId: projectData.tenantId || '',
      status: projectData.status || 'draft',
      textInput: projectData.textInput || '',
      hasPatentContent: projectData.hasPatentContent || false,
      hasProcessedInvention: projectData.hasProcessedInvention || false,
      createdAt: projectData.createdAt || new Date(),
      lastModified: projectData.lastModified || new Date().toISOString(),
      documents: projectData.documents || [],
      savedPriorArtItems: projectData.savedPriorArtItems || [],
      invention: analyzedInvention || undefined,
    };
  }, [projectData, projectId, analyzedInvention]);

  // Memoize the onContentUpdate handler
  const handleChatContentUpdate = useCallback((action: string) => {
    logger.info('[ChatTab] onContentUpdate called with action:', { action });

    if (action === 'refresh') {
      logger.info(
        '[ChatTab] Refreshing claims data using refreshInventionData'
      );

      if (refreshInventionDataRef.current) {
        refreshInventionDataRef
          .current()
          .then(() => {
            logger.info('[ChatTab] Successfully refreshed invention data');
          })
          .catch(error => {
            logger.error('[ChatTab] Failed to refresh invention data:', error);
          });
      } else {
        logger.warn('[ChatTab] refreshInventionData is not available');
      }
    } else if (typeof action === 'string') {
      logger.info(
        '[ChatTab] Direct content update not supported in claim refinement'
      );
    }
  }, []);

  return (
    <div className="h-full overflow-hidden">
      <EnhancedChatInterface
        projectData={memoizedProjectData}
        onContentUpdate={handleChatContentUpdate}
        setPreviousContent={() => {
          /* no-op */
        }}
        pageContext="claim-refinement"
        projectId={projectId}
      />
    </div>
  );
}
