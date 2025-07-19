import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Upload, Download, CheckCircle } from 'lucide-react';
import { FiChevronRight } from 'react-icons/fi';
import { useRouter } from 'next/router';
import ViewHeader from '../../../components/common/ViewHeader';
import { NavigationButton } from '@/components/common/NavigationButton';
import { useThemeContext } from '@/contexts/ThemeContext';

interface TechnologyHeaderProps {
  onImport?: () => void;
  onExport?: () => void;
  onCheckConsistency?: () => void;
}

/**
 * Header component for technology details view
 */
const TechnologyHeader: React.FC<TechnologyHeaderProps> = ({
  onImport,
  onExport,
  onCheckConsistency,
}) => {
  const { isDarkMode } = useThemeContext();
  const router = useRouter();
  const { projectId, tenant } = router.query;

  // Removed handleGoToClaimRefinement - using NavigationButton instead

  return (
    <ViewHeader
      title="Technology Details"
      actions={
        <TooltipProvider>
          {onImport && (
            <Button
              variant="default"
              size="default"
              onClick={onImport}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
          )}
          {onExport && (
            <Button
              variant="outline"
              size="default"
              onClick={onExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
          {onCheckConsistency && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="default"
                  onClick={onCheckConsistency}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Check Consistency
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Check consistency across all sections</p>
              </TooltipContent>
            </Tooltip>
          )}
          {projectId && tenant && (
            <NavigationButton
              href={`/${tenant}/projects/${projectId}/amendments/studio`}
              viewType="amendments"
              projectId={projectId as string}
              variant="ghost"
              size="xs"
              style={{
                color: isDarkMode ? '#9CA3AF' : '#6B7280',
                fontSize: '12px',
              }}
            >
              Amendment Studio
              <FiChevronRight className="h-3.5 w-3.5" />
            </NavigationButton>
          )}
        </TooltipProvider>
      }
    />
  );
};

export default TechnologyHeader;
