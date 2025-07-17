import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  FiSettings,
  FiChevronRight,
  FiChevronLeft,
  FiClock,
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import ViewHeader from '../../../components/common/ViewHeader';
import { logger } from '@/utils/clientLogger';
import { NavigationButton } from '@/components/common/NavigationButton';
import { SaveClaimVersionButtonShadcn } from './SaveClaimVersionButtonShadcn';
import { ClaimVersionHistoryModal } from './ClaimVersionHistoryModal';
import { useProject } from '@/hooks/api/useProjects';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

interface ClaimHeaderShadcnProps {
  onOpenSettings?: () => void;
}

/**
 * Header component for the Claim Refinement view - ShadCN/Tailwind version
 * Contains the title and main action buttons
 */
const ClaimHeaderShadcn: React.FC<ClaimHeaderShadcnProps> = ({
  onOpenSettings,
}) => {
  const { isDarkMode } = useThemeContext();
  const router = useRouter();
  const { projectId, tenant } = router.query;
  const [isNavigating, setIsNavigating] = useState(false);

  // Get project data to find the invention ID
  const { data: projectData } = useProject(projectId as string);
  const inventionId = projectData?.invention?.id;

  // Version history modal state
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  return (
    <>
      <ViewHeader
        title="Claim Refinement"
        actions={
          <>
            {/* Version management buttons - only show when we have valid projectId AND inventionId */}
            {projectId && inventionId && (
              <div className="flex gap-2">
                <SaveClaimVersionButtonShadcn
                  inventionId={inventionId}
                  size="sm"
                  variant="outline"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsVersionHistoryOpen(true)}
                  className="flex items-center gap-2"
                >
                  <FiClock className="h-4 w-4" />
                  Version History
                </Button>
              </div>
            )}

            {/* Settings button */}
            {onOpenSettings && (
              <Button
                variant="secondary"
                size="default"
                onClick={onOpenSettings}
                className="flex items-center gap-2"
              >
                <FiSettings className="h-4 w-4" />
                Settings
              </Button>
            )}
            {projectId && tenant && (
              <div className="flex gap-2 items-center">
                {/* Back to Technology Details */}
                <NavigationButton
                  href={`/${tenant}/projects/${projectId}/technology`}
                  viewType="technology"
                  projectId={projectId as string}
                  variant="ghost"
                  size="xs"
                  style={{
                    color: isDarkMode ? '#9CA3AF' : '#6B7280',
                    fontSize: '12px',
                  }}
                >
                  <FiChevronLeft className="h-3.5 w-3.5" />
                  Technology Details
                </NavigationButton>

                {/* Forward to Patent Application */}
                <NavigationButton
                  href={`/${tenant}/projects/${projectId}/patent`}
                  viewType="patent"
                  projectId={projectId as string}
                  variant="ghost"
                  size="xs"
                  style={{
                    color: isDarkMode ? '#9CA3AF' : '#6B7280',
                    fontSize: '12px',
                  }}
                >
                  Patent Application
                  <FiChevronRight className="h-3.5 w-3.5" />
                </NavigationButton>
              </div>
            )}
          </>
        }
      />

      {/* Version History Modal */}
      {projectId && inventionId && (
        <ClaimVersionHistoryModal
          isOpen={isVersionHistoryOpen}
          onClose={() => setIsVersionHistoryOpen(false)}
          inventionId={inventionId}
          projectId={projectId as string}
        />
      )}
    </>
  );
};

export default ClaimHeaderShadcn;
