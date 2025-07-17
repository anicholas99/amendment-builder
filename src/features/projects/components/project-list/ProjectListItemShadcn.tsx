import React from 'react';
import { cn } from '@/lib/utils';
import { FiFolder, FiFolderPlus } from 'react-icons/fi';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
// Removed Accordion components to fix multiple click issue
import { ChevronDown } from 'lucide-react';

import { ProjectSidebarProject } from '../../types/projectSidebar';
import { DocumentLink } from './DocumentLink';
import { logger } from '@/utils/clientLogger';

interface DocumentType {
  projectId: string;
  documentType: string;
  content: string;
}

interface ProjectListItemShadcnProps {
  project: ProjectSidebarProject;
  index: number;
  isActive: boolean;
  activeProject: string | null;
  activeDocument: DocumentType | null;
  expandedIndices: number[];
  setExpandedIndices?: React.Dispatch<React.SetStateAction<number[]>>;
  projectClickHandler: (
    projectId: string,
    index: number,
    e?: React.MouseEvent
  ) => void;
  handleDocumentSelect: (projectId: string, documentType: string) => void;
  handleDeleteProject: (projectId: string, e: React.MouseEvent) => void;
  isDarkMode: boolean;
}

const ProjectListItemShadcn: React.FC<ProjectListItemShadcnProps> = React.memo(
  ({
    project,
    index,
    isActive,
    activeProject,
    activeDocument,
    expandedIndices,
    setExpandedIndices: _setExpandedIndices,
    projectClickHandler,
    handleDocumentSelect,
    handleDeleteProject: _handleDeleteProject,
    isDarkMode,
  }) => {
    const isExpanded =
      Array.isArray(expandedIndices) && expandedIndices.includes(index);

    // Check if invention has been processed
    // ALWAYS enable if hasProcessedInvention is true, regardless of invention data
    const inventionProcessed = !!(
      project.hasProcessedInvention === true ||
      (project.invention &&
        (project.invention.title ||
          project.invention.summary ||
          project.invention.abstract ||
          project.invention.description))
    );

    // Debug logging for tracking the issue
    React.useEffect(() => {
      logger.debug('[ProjectListItemShadcn] Project state', {
        projectId: project.id,
        projectName: project.name,
        hasProcessedInvention: project.hasProcessedInvention,
        hasInventionData: !!project.invention,
        inventionProcessed,
        isActive,
      });
    }, [
      project.hasProcessedInvention,
      project.id,
      project.name,
      inventionProcessed,
      isActive,
      project.invention,
    ]);

    return (
      <div className="w-full mb-2">
        <div
          className={cn(
            'flex items-center w-full py-2 px-4 hover:no-underline rounded-md transition-colors duration-150 cursor-pointer select-none',
            'hover:bg-accent',
            isActive
              ? isDarkMode
                ? 'bg-blue-900 text-blue-200'
                : 'bg-blue-50 text-blue-700'
              : isDarkMode
                ? 'bg-transparent text-gray-300'
                : 'bg-transparent text-gray-700',
            isActive &&
              (isDarkMode
                ? 'shadow-[inset_0_0_0_1px_rgba(66,153,225,0.3)]'
                : 'shadow-[inset_0_0_0_1px_rgba(66,153,225,0.3)]')
          )}
          onClick={e => projectClickHandler(project.id, index, e)}
        >
          <div className="flex items-center flex-1 h-6 max-w-full overflow-hidden">
            <div
              className={cn(
                'flex justify-center items-center w-6 h-6 rounded-md mr-2.5 transition-colors duration-150 flex-shrink-0',
                isActive
                  ? isDarkMode
                    ? 'bg-blue-800 text-blue-300'
                    : 'bg-blue-100 text-blue-500'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-400'
                    : 'bg-gray-50 text-gray-500'
              )}
            >
              {isExpanded ? (
                <FiFolder className="w-3.5 h-3.5" />
              ) : (
                <FiFolderPlus className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="flex items-center flex-1 relative h-6 overflow-hidden">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className={cn(
                        'text-sm transition-all duration-150 flex-1 leading-6 flex items-center whitespace-nowrap overflow-hidden text-ellipsis max-w-[calc(100%-10px)] select-none',
                        isActive ? 'font-medium' : 'font-normal'
                      )}
                    >
                      <span className="overflow-hidden text-ellipsis">
                        {project.name}
                      </span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{project.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          {/* Chevron icon for expansion indicator */}
          <div 
            className="transition-transform duration-200 flex-shrink-0 ml-2 text-muted-foreground hover:text-foreground"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
            title={`Expanded: ${isExpanded}, Index: ${index}`}
          >
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        {/* Expandable content */}
        <div className={cn(
          'overflow-hidden transition-all duration-200 ease-in-out',
          isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        )}>
          <div className="pb-2 px-2 max-w-full overflow-hidden">
            <div className="max-w-full overflow-hidden">
              <DocumentLink
                projectId={project.id}
                documentType="amendments"
                label="Amendment Studio"
                isActive={
                  activeProject === project.id &&
                  activeDocument?.documentType === 'amendments'
                }
                onClick={handleDocumentSelect}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    return (
      prevProps.project.id === nextProps.project.id &&
      prevProps.project.name === nextProps.project.name &&
      prevProps.isActive === nextProps.isActive &&
      prevProps.isDarkMode === nextProps.isDarkMode &&
      prevProps.expandedIndices === nextProps.expandedIndices &&
      prevProps.activeDocument?.documentType ===
        nextProps.activeDocument?.documentType
    );
  }
);

ProjectListItemShadcn.displayName = 'ProjectListItemShadcn';

export default ProjectListItemShadcn;
