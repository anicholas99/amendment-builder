import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  FiCalendar,
  FiClock,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/router';
import { extractTenantFromQuery } from '@/utils/routerTenant';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useProjectActions } from '../../hooks/useProjectActions';
import { useToast } from '@/hooks/useToastWrapper';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    createdAt?: string | number;
    lastUpdated?: string | number;
    inventionData?: {
      technologyDetails?: unknown;
      claims?: unknown[];
      patentDraft?: unknown;
    };
  };
  handleSelectProject: (projectId: string) => void;
  handleDeleteProject: (projectId: string, e: React.MouseEvent) => void;
  handleDocumentSelect: (projectId: string, documentType: string) => void;
  isDarkMode: boolean;
  index?: number; // For staggered animations
}

// Helper to format dates nicely
const formatRelativeDate = (date: string | number): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    return 'Unknown';
  }
};

// Memoized ProjectCard to prevent unnecessary re-renders
export const ProjectCard = React.memo<ProjectCardProps>(
  ({
    project,
    handleSelectProject,
    handleDeleteProject,
    handleDocumentSelect,
    isDarkMode,
    index = 0,
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(project.name);
    const [isHovered, setIsHovered] = useState(false);
    const [isCardPressed, setIsCardPressed] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { renameProject } = useProjectActions();
    const toast = useToast();
    const router = useRouter();
    const { tenant } = extractTenantFromQuery(router.query);

    const hasTechDetails = !!project.inventionData?.technologyDetails;
    const hasClaims = (project.inventionData?.claims?.length ?? 0) > 0;
    const hasPatentDraft = !!project.inventionData?.patentDraft;

    const isRecent =
      project.lastUpdated &&
      Date.now() - Number(project.lastUpdated) < 48 * 60 * 60 * 1000;

    // Focus input when editing starts
    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isEditing]);

    // Memoize handlers
    const handleCardClick = useCallback(() => {
      if (!isEditing && project.id) {
        handleSelectProject(project.id);
      }
    }, [project.id, handleSelectProject, isEditing]);

    const handleNameClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
        setEditValue(project.name);
      },
      [project.name]
    );

    const handleSaveRename = useCallback(async () => {
      if (editValue.trim() && editValue.trim() !== project.name) {
        const success = await renameProject(project.id, editValue.trim());
        if (success) {
          toast.success({
            title: 'Project Renamed',
            description: `Project renamed to "${editValue.trim()}"`,
          });
        } else {
          toast.error({
            title: 'Rename Failed',
            description: 'Failed to rename project. Please try again.',
          });
          setEditValue(project.name); // Reset on failure
        }
      }
      setIsEditing(false);
    }, [editValue, project.name, project.id, renameProject, toast]);

    const handleCancelRename = useCallback(() => {
      setIsEditing(false);
      setEditValue(project.name);
    }, [project.name]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          handleSaveRename();
        } else if (e.key === 'Escape') {
          handleCancelRename();
        }
      },
      [handleSaveRename, handleCancelRename]
    );

    const handleDeleteClick = useCallback(
      (e: React.MouseEvent) => {
        if (project.id) {
          handleDeleteProject(project.id, e);
        }
      },
      [project.id, handleDeleteProject]
    );

    // Handle tag clicks for direct navigation
    const handleTagClick = useCallback(
      (documentType: string) => (e: React.MouseEvent) => {
        e.stopPropagation();
        if (project.id) {
          handleDocumentSelect(project.id, documentType);
        }
      },
      [project.id, handleDocumentSelect]
    );

    // Handle card press states to control animation
    const handleCardMouseDown = useCallback(
      (e: React.MouseEvent) => {
        // Only trigger press state if clicking on the card itself, not on interactive elements
        if (
          !isEditing &&
          (e.target as HTMLElement).closest(
            'button, input, [role="button"]'
          ) === null
        ) {
          setIsCardPressed(true);
        }
      },
      [isEditing]
    );

    const handleCardMouseUp = useCallback(() => {
      setIsCardPressed(false);
    }, []);

    const handleCardMouseLeave = useCallback(() => {
      setIsCardPressed(false);
      setIsHovered(false);
    }, []);

    return (
      <Card
        className={cn(
          // Clean card styling
          'relative z-0 transition-all duration-200 ease-out',
          'bg-white dark:bg-gray-800',
          'border border-gray-200 dark:border-gray-700',
          'shadow-sm hover:shadow-md',
          // Only apply hover effects when not editing
          !isEditing &&
            'cursor-pointer hover:border-gray-300 dark:hover:border-gray-600',
          !isEditing && 'hover:-translate-y-1',
          // Apply press animation based on state
          isCardPressed && 'scale-[0.98] transition-transform duration-100',
          isEditing && 'ring-2 ring-blue-500 border-blue-500 shadow-md',
          'opacity-0 animate-fade-in rounded-lg'
        )}
        style={{
          animationDelay: `${index * 50}ms`,
          animationDuration: '300ms',
          animationFillMode: 'forwards',
          zIndex: isHovered ? 20 : 1,
        }}
        onClick={handleCardClick}
        onMouseDown={handleCardMouseDown}
        onMouseUp={handleCardMouseUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleCardMouseLeave}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 mr-3">
              {isEditing ? (
                <div
                  className="flex items-center gap-2"
                  onClick={e => e.stopPropagation()}
                  onMouseDown={e => e.stopPropagation()}
                >
                  <Input
                    ref={inputRef}
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSaveRename}
                    onMouseDown={e => e.stopPropagation()}
                    className="text-base font-semibold h-8 px-3 border-2 border-blue-500 focus:border-blue-600"
                    placeholder="Project name..."
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveRename}
                    onMouseDown={e => e.stopPropagation()}
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <FiCheck className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelRename}
                    onMouseDown={e => e.stopPropagation()}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <FiX className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <h3
                  className={cn(
                    'text-base font-semibold text-foreground break-words group',
                    'hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 cursor-pointer',
                    'relative inline-block'
                  )}
                  onClick={handleNameClick}
                  onMouseDown={e => e.stopPropagation()}
                  title="Click to rename"
                >
                  {project.name}
                  <FiEdit
                    className={cn(
                      'inline ml-2 h-3 w-3 transition-opacity duration-200',
                      isHovered ? 'opacity-50' : 'opacity-0'
                    )}
                  />
                </h3>
              )}
            </div>
            {isRecent && !isEditing && (
              <Badge
                variant="secondary"
                className={cn(
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex-shrink-0 text-xs',
                  'transition-all duration-200',
                  !isEditing && isHovered ? 'scale-105' : 'scale-100'
                )}
              >
                Recent
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <div className="flex flex-col h-full">
            {/* Date info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 text-xs text-muted-foreground">
              <div className="flex items-center">
                <FiCalendar
                  className="mr-2 text-gray-500 flex-shrink-0"
                  size={12}
                />
                <span>
                  Created:{' '}
                  <span className="text-foreground font-medium">
                    {project.createdAt
                      ? new Date(project.createdAt).toLocaleDateString()
                      : project.lastUpdated
                        ? new Date(project.lastUpdated).toLocaleDateString()
                        : 'Unknown'}
                  </span>
                </span>
              </div>
              <div className="flex items-center">
                <FiClock
                  className="mr-2 text-gray-500 flex-shrink-0"
                  size={12}
                />
                <span>
                  Modified:{' '}
                  <span className="text-foreground font-medium">
                    {project.lastUpdated
                      ? formatRelativeDate(project.lastUpdated)
                      : 'Unknown'}
                  </span>
                </span>
              </div>
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {/* Technology Details Badge */}
              <Badge
                variant={hasTechDetails ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-all duration-200 text-xs px-2 py-0.5',
                  !isEditing && 'hover:scale-105',
                  hasTechDetails
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'border-green-300 text-green-600 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                )}
                onClick={handleTagClick('technology')}
                onMouseDown={e => e.stopPropagation()}
              >
                Tech Details
              </Badge>

              {/* Claims Badge */}
              <Badge
                variant={hasClaims ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-all duration-200 text-xs px-2 py-0.5',
                  !isEditing && 'hover:scale-105',
                  hasClaims
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border-blue-300 text-blue-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                )}
                onClick={handleTagClick('claim-refinement')}
                onMouseDown={e => e.stopPropagation()}
              >
                Claims
              </Badge>

              {/* Patent Badge */}
              <Badge
                variant={hasPatentDraft ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-all duration-200 text-xs px-2 py-0.5',
                  !isEditing && 'hover:scale-105',
                  hasPatentDraft
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'border-purple-300 text-purple-600 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                )}
                onClick={handleTagClick('patent')}
                onMouseDown={e => e.stopPropagation()}
              >
                Patent
              </Badge>
            </div>

            {/* Delete button */}
            <div className="flex justify-end mt-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                onMouseDown={e => e.stopPropagation()}
                className={cn(
                  'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
                  'transition-all duration-200 h-8 w-8 rounded-md',
                  isHovered ? 'opacity-100' : 'opacity-0'
                )}
              >
                <FiTrash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

ProjectCard.displayName = 'ProjectCard';
