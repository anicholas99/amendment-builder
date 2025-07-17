import React from 'react';
import { useRouter } from 'next/router';
import { FiChevronLeft } from 'react-icons/fi';
import ViewHeader from '../../../components/common/ViewHeader';
import { NavigationButton } from '@/components/common/NavigationButton';
import { useThemeContext } from '@/contexts/ThemeContext';
import { TooltipProvider } from '@/components/ui/tooltip';

interface PatentHeaderProps {
  hideTitle?: boolean;
}

/**
 * Header component for the Patent Application view
 */
const PatentHeader: React.FC<PatentHeaderProps> = ({ hideTitle = false }) => {
  const { isDarkMode } = useThemeContext();
  const router = useRouter();
  const { projectId, tenant } = router.query;

  const backButton =
    projectId && tenant ? (
      <NavigationButton
        href={`/${tenant}/projects/${projectId}/claim-refinement`}
        viewType="claims"
        projectId={projectId as string}
        variant="ghost"
        size="xs"
        style={{
          color: isDarkMode ? '#9CA3AF' : '#6B7280',
          fontSize: '12px',
        }}
      >
        <FiChevronLeft className="h-3.5 w-3.5 mr-1" />
        Claim Refinement
      </NavigationButton>
    ) : null;

  // Create actions array with just the back button
  const actions = (
    <TooltipProvider>
      <div className="flex items-center gap-2">{backButton}</div>
    </TooltipProvider>
  );

  // Always use ViewHeader with the actions
  return (
    <ViewHeader
      title={hideTitle ? '' : 'Patent Application'}
      actions={actions}
    />
  );
};

export default PatentHeader;
