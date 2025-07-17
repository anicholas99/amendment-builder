import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  FiFileText,
  FiLayers,
  FiGitPullRequest,
  FiCheck,
  FiEdit,
  FiChevronsUp,
} from 'react-icons/fi';
import { HiChevronRight } from 'react-icons/hi';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { useQueryClient } from '@tanstack/react-query';
import { ProjectApiService } from '@/client/services/project.client-service';
import { projectKeys } from '@/lib/queryKeys';
import { STALE_TIME } from '@/constants/time';

interface DocumentLinkProps {
  projectId: string;
  documentType: string;
  label: string;
  isActive?: boolean;
  isDisabled?: boolean;
  onClick: (projectId: string, documentType: string) => void;
}

const documentIcons: Record<string, React.ElementType> = {
  technology: FiLayers,
  'claim-refinement': FiEdit,
  'claim-sync': FiChevronsUp,
  patent: FiFileText,
  'prior-art': FiGitPullRequest,
  verification: FiCheck,
  amendments: FiEdit,
};

const DocumentLink: React.FC<DocumentLinkProps> = React.memo(
  ({
    projectId,
    documentType,
    label,
    isActive = false,
    isDisabled = false,
    onClick,
  }) => {
    const { isDarkMode } = useThemeContext();
    const { activeProjectId: activeProject } = useProjectData();

    const queryClient = useQueryClient();

    const handleClick = useCallback(() => {
      if (isDisabled) return;
      onClick(projectId, documentType);
    }, [onClick, projectId, documentType, isDisabled]);

    const IconComponent = documentIcons[documentType] || FiFileText;

    return (
      <div
        className={cn(
          'flex items-center py-1.5 px-4 text-[13px] rounded-md transition-all duration-150 ease-out w-full',
          isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          isActive
            ? isDarkMode
              ? 'bg-blue-800 text-blue-200'
              : 'bg-blue-50 text-blue-600'
            : isDisabled
              ? isDarkMode
                ? 'text-gray-600'
                : 'text-gray-400'
              : isDarkMode
                ? 'text-gray-400'
                : 'text-gray-600',
          !isDisabled &&
            'hover:bg-accent hover:text-gray-800 dark:hover:text-gray-100'
        )}
        onClick={handleClick}
      >
        <IconComponent
          className={cn(
            'w-3 h-3 mr-2 flex-shrink-0 transition-colors duration-150',
            !isDisabled &&
              'group-hover:text-gray-800 dark:group-hover:text-gray-100'
          )}
        />
        <span className="text-[13px] flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
          {label}
        </span>
        {isActive && (
          <HiChevronRight
            className={cn(
              'w-3 h-3 ml-1 flex-shrink-0',
              isDarkMode ? 'text-blue-200' : 'text-blue-600'
            )}
          />
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for React.memo
    return (
      prevProps.projectId === nextProps.projectId &&
      prevProps.documentType === nextProps.documentType &&
      prevProps.label === nextProps.label &&
      prevProps.isActive === nextProps.isActive &&
      prevProps.isDisabled === nextProps.isDisabled
    );
  }
);

DocumentLink.displayName = 'DocumentLink';

export { DocumentLink };
