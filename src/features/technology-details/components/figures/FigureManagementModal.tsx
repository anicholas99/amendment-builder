import React, { useState, useCallback, useMemo, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  FiImage,
  FiX,
  FiCheck,
  FiMaximize2,
  FiUpload,
  FiRotateCcw,
  FiPlus,
} from 'react-icons/fi';
import { logger } from '@/utils/clientLogger';
import { useToast } from '@/hooks/useToastWrapper';
import { useUnassignedFigures } from '@/hooks/api/useUnassignedFigures';
import type { UnassignedFigure } from '@/hooks/api/useUnassignedFigures';
import { usePatentFigures } from '@/features/patent-application/hooks/usePatentSidebar';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/config/reactQueryConfig';
import { FigureApiService } from '@/services/api/figureApiService';

// shadcn/ui imports
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LoadingState } from '@/components/common/LoadingState';

// Types
interface FigureAssignment {
  figureKey: string;
  figure: {
    _id?: string;
    image?: string;
    description?: string;
    type?: string;
  };
  hasImage: boolean;
}

interface BatchOperation {
  type: 'assign' | 'unassign';
  figureId: string;
  figureKey?: string;
  sourceKey?: string; // For unassign operations
  previewImageUrl?: string; // For showing preview in assign operations
  previewFileName?: string; // For showing filename in assign operations
  uploadedRecordId?: string; // ID of the UPLOADED record created during unassign (for reassignment)
}

interface FigureManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  inventionData: any;
  currentFigure?: string;
  onFigureAssigned?: (figureId: string, figureKey: string) => void;
}

// Drag and drop types
const ItemTypes = {
  UNASSIGNED_FIGURE: 'unassigned_figure',
};

// Draggable assigned figure slot
const AssignedFigureSlot: React.FC<{
  assignment: FigureAssignment;
  onUnassign: (figureKey: string) => void;
  onPreview: (imageUrl: string, figureKey: string) => void;
  onAssign: (figureId: string, figureKey: string) => void;
  isModified: boolean;
  pendingAssignment?: BatchOperation;
  onShowWarning?: (message: string) => void;
}> = ({
  assignment,
  onUnassign,
  onPreview,
  onAssign,
  isModified,
  pendingAssignment,
  onShowWarning,
}) => {
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: [ItemTypes.UNASSIGNED_FIGURE],
      drop: (item: any) => {
        if (item.sourceType === 'unassigned') {
          // Check if the drop is actually allowed
          const canDropHere = !assignment.hasImage || !!pendingAssignment;
          if (!canDropHere) {
            // Show warning for invalid drop
            onShowWarning?.(
              `Cannot assign to ${assignment.figureKey} - please unassign the current figure first`
            );
            return;
          }
          // Assign unassigned figure to this slot
          onAssign(item.figureId, assignment.figureKey);
        }
      },
      collect: monitor => ({
        isOver: monitor.isOver(),
      }),
    }),
    [assignment, onAssign, pendingAssignment, onShowWarning]
  );

  return (
    <div
      ref={drop as any}
      className={`
        relative border-2 rounded-lg p-3 transition-all duration-200
        ${isOver ? (assignment.hasImage && !pendingAssignment ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-blue-500 bg-blue-50 dark:bg-blue-950/20') : 'border-border'}
        ${isModified ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        ${assignment.hasImage && !pendingAssignment ? 'cursor-not-allowed' : ''}
      `}
    >
      {/* Figure key badge */}
      <div className="absolute -top-2 -left-2 z-10">
        <Badge variant="secondary" className="text-xs font-medium">
          {assignment.figureKey}
        </Badge>
      </div>

      {/* Modified indicator */}
      {isModified && (
        <div className="absolute top-1 right-1 z-20">
          <Badge
            variant={pendingAssignment ? 'default' : 'destructive'}
            className={`text-xs px-2 py-1 shadow-md ${
              pendingAssignment
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {pendingAssignment ? 'Will Assign' : 'Will Unassign'}
          </Badge>
        </div>
      )}

      {/* Figure content */}
      <div className="aspect-square w-full bg-muted rounded-md overflow-hidden">
        {/* Show pending assignment preview or current image */}
        {pendingAssignment?.previewImageUrl ||
        (assignment.hasImage && assignment.figure.image) ? (
          <div className="relative h-full">
            <img
              src={
                pendingAssignment?.previewImageUrl || assignment.figure.image
              }
              alt={assignment.figureKey}
              className="w-full h-full object-contain"
            />

            {/* Hover overlay for preview and unassign */}
            <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        onPreview(
                          pendingAssignment?.previewImageUrl ||
                            assignment.figure.image!,
                          assignment.figureKey
                        )
                      }
                    >
                      <FiMaximize2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Preview</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onUnassign(assignment.figureKey)}
                    >
                      <FiX className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Unassign</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FiImage className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No image</p>
            </div>
          </div>
        )}
      </div>

      {/* Title - show figure title/description */}
      {(assignment.hasImage || pendingAssignment) &&
        (pendingAssignment?.previewFileName ||
          assignment.figure.description) && (
          <p className="text-xs text-muted-foreground mt-2 truncate">
            {pendingAssignment ? (
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {pendingAssignment.previewFileName}
              </span>
            ) : (
              assignment.figure.description
            )}
          </p>
        )}
    </div>
  );
};

// Draggable unassigned figure
const UnassignedFigureItem: React.FC<{
  figure: UnassignedFigure;
  onPreview: (imageUrl: string, fileName: string) => void;
}> = ({ figure, onPreview }) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.UNASSIGNED_FIGURE,
      item: {
        figureId: figure.id,
        sourceType: 'unassigned',
      },
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [figure]
  );

  return (
    <div
      ref={node => {
        drag(node);
      }}
      className={`
        relative border rounded-lg p-2 transition-all duration-200 cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50' : ''}
        hover:border-blue-400
      `}
    >
      <div className="aspect-square w-full bg-muted rounded overflow-hidden mb-2">
        <img
          src={figure.url}
          alt={figure.fileName}
          className="w-full h-full object-contain"
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs font-medium truncate flex-1">{figure.fileName}</p>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onPreview(figure.url, figure.fileName)}
            >
              <FiMaximize2 className="w-3 h-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Preview</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

// Image preview modal
const ImagePreviewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}> = ({ isOpen, onClose, imageUrl, title }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-[90vw] max-h-[90vh] w-fit h-fit bg-card">
      <DialogHeader className="border-b border-border">
        <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
      </DialogHeader>

      <div className="flex items-center justify-center p-4 max-h-[calc(90vh-80px)] overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>
    </DialogContent>
  </Dialog>
);

// Main component
export const FigureManagementModal: React.FC<FigureManagementModalProps> = ({
  isOpen,
  onClose,
  projectId,
  inventionData,
  currentFigure,
  onFigureAssigned,
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  // State for batch operations
  const [batchOperations, setBatchOperations] = useState<BatchOperation[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  // State to track optimistically unassigned figures (shown immediately in available list)
  const [optimisticallyUnassigned, setOptimisticallyUnassigned] = useState<Array<{
    figureKey: string;
    figureId: string;
    imageUrl: string;
    description: string;
    uploadedRecordId?: string; // Track the expected real figure ID
  }>>([]);

  // State for multiple uploads
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for preview modal
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
  }>({
    isOpen: false,
    imageUrl: '',
    title: '',
  });

  // State for warning message
  const [warningMessage, setWarningMessage] = useState<string>('');
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle multiple file uploads
  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const validFiles: File[] = [];
      const invalidFiles: string[] = [];

      // Validate files
      Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
          invalidFiles.push(`${file.name} (not an image)`);
        } else if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          invalidFiles.push(`${file.name} (too large)`);
        } else {
          validFiles.push(file);
        }
      });

      if (invalidFiles.length > 0) {
        toast({
          title: 'Invalid files',
          description: `Skipped: ${invalidFiles.join(', ')}`,
          status: 'warning',
        });
      }

      if (validFiles.length === 0) return;

      setIsUploading(true);

      try {
        let successCount = 0;

        for (const file of validFiles) {
          try {
            await FigureApiService.uploadFigure(projectId, file);
            successCount++;
          } catch (error) {
            logger.error('[FigureManagementModal] Upload failed', {
              fileName: file.name,
              error,
            });
          }
        }

        if (successCount > 0) {
          // Invalidate the unassigned figures query to refresh the list
          queryClient.invalidateQueries({
            queryKey: [...queryKeys.projects.figures(projectId), 'unassigned'],
          });

          toast({
            title: 'Upload completed',
            description: `Successfully uploaded ${successCount} figure${successCount > 1 ? 's' : ''}`,
            status: 'success',
          });
        }

        if (successCount < validFiles.length) {
          toast({
            title: 'Some uploads failed',
            description: `${validFiles.length - successCount} files failed to upload`,
            status: 'error',
          });
        }
      } finally {
        setIsUploading(false);
      }
    },
    [projectId, toast, queryClient]
  );

  // Fetch data
  const { data: unassignedFigures, isLoading: isLoadingUnassigned } =
    useUnassignedFigures(projectId);
  // Memoize props to prevent infinite re-renders
  const figuresProps = React.useMemo(() => ({
    projectId,
    inventionData,
    currentFigure: currentFigure || 'FIG. 1',
    setCurrentFigure: () => {},
  }), [projectId, inventionData, currentFigure]);

  const { figures, isLoading: isLoadingFigures } = usePatentFigures(figuresProps);

  // Process figure assignments
  const figureAssignments = useMemo(() => {
    if (!figures) return [];

    const assignments: FigureAssignment[] = [];
    const sortedKeys = Object.keys(figures).sort((a, b) => {
      const aNum = parseInt(a.match(/\d+/)?.[0] || '0');
      const bNum = parseInt(b.match(/\d+/)?.[0] || '0');
      return aNum - bNum;
    });

    sortedKeys.forEach(figureKey => {
      const figure = figures[figureKey];
      assignments.push({
        figureKey,
        figure,
        hasImage: !!figure.image,
      });
    });

    return assignments;
  }, [figures]);

  // Check if items are modified
  const isAssignmentModified = useCallback(
    (figureKey: string) => {
      return batchOperations.some(
        op =>
          (op.type === 'unassign' && op.sourceKey === figureKey) ||
          (op.type === 'assign' && op.figureKey === figureKey)
      );
    },
    [batchOperations]
  );

  // Get pending assignment for a figure key
  const getPendingAssignment = useCallback(
    (figureKey: string) => {
      return batchOperations.find(
        op => op.type === 'assign' && op.figureKey === figureKey
      );
    },
    [batchOperations]
  );

  const isUnassignedModified = useCallback(
    (figureId: string) => {
      return batchOperations.some(
        op => op.type === 'assign' && op.figureId === figureId
      );
    },
    [batchOperations]
  );

  // Get figures that should be shown in assigned section (always show all slots)
  const displayedAssignedFigures = useMemo(() => {
    return figureAssignments.map(assignment => {
      // Check if there's a pending assignment for this slot
      const pendingAssignment = batchOperations.find(
        op => op.type === 'assign' && op.figureKey === assignment.figureKey
      );

      // Check if this figure has been optimistically unassigned
      const isOptimisticallyUnassigned = optimisticallyUnassigned.some(
        opt => opt.figureKey === assignment.figureKey
      );

      if (pendingAssignment) {
        // Show pending assignment
        return {
          ...assignment,
          figure: {
            _id: pendingAssignment.figureId,
            image: pendingAssignment.previewImageUrl,
            description: pendingAssignment.previewFileName,
            type: assignment.figure.type,
          },
          hasImage: true,
        };
      } else if (isOptimisticallyUnassigned) {
        // Show empty slot for optimistically unassigned figures
        return {
          ...assignment,
          figure: {
            _id: undefined,
            image: undefined,
            description: undefined,
            type: undefined,
          },
          hasImage: false,
        };
      }

      // Return original assignment
      return assignment;
    });
  }, [figureAssignments, batchOperations, optimisticallyUnassigned]);

  // Get figures that should be shown in available section
  const displayedAvailableFigures = useMemo(() => {
    const originalUnassigned = unassignedFigures || [];

    // Only show optimistic figures that don't have their real counterpart yet
    const optimisticFigures = optimisticallyUnassigned
      .filter(opt => {
        // If we have the uploadedRecordId, check if that real figure exists
        if (opt.uploadedRecordId) {
          return !originalUnassigned.some(real => real.id === opt.uploadedRecordId);
        }
        // Otherwise, use a simple check
        return true;
      })
      .map(opt => ({
        id: `optimistic-${opt.figureKey}`,
        fileName: `${opt.figureKey} - ${opt.description || 'Unassigned'}`,
        originalName: `${opt.figureKey} - ${opt.description || 'Unassigned'}`,
        url: opt.imageUrl,
        description: opt.description || '',
        sizeBytes: 0,
        uploadedAt: new Date().toISOString(),
        mimeType: 'image/png',
        figureKey: null,
      }));

    // Combine original and filtered optimistic figures
    const allAvailable = [...originalUnassigned, ...optimisticFigures];

    // Filter out figures that have been assigned in the current batch
    return allAvailable.filter(figure => !isUnassignedModified(figure.id));
  }, [
    unassignedFigures,
    optimisticallyUnassigned,
    isUnassignedModified,
  ]);

  // Handle operations
  const handleUnassign = useCallback(
    async (figureKey: string) => {
      // Check if this is a pending assignment (not yet applied)
      const pendingAssignment = batchOperations.find(
        op => op.type === 'assign' && op.figureKey === figureKey
      );

      if (pendingAssignment) {
        // Remove the pending assignment from batch operations
        setBatchOperations(prev =>
          prev.filter(
            op => !(op.type === 'assign' && op.figureKey === figureKey)
          )
        );

        logger.info('[FigureManagementModal] Removed pending assignment', {
          figureKey,
          figureId: pendingAssignment.figureId,
        });
        return;
      }

      // Handle actual assigned figures (already in database)
      const assignment = figureAssignments.find(a => a.figureKey === figureKey);
      if (!assignment?.hasImage || !assignment.figure._id) return;

      // Immediately add to optimistic state for instant UI feedback
      const optimisticFigure = {
        figureKey,
        figureId: assignment.figure._id!,
        imageUrl: assignment.figure.image!,
        description: assignment.figure.description || '',
      };

      setOptimisticallyUnassigned(prev => [...prev, optimisticFigure]);

      logger.info('[FigureManagementModal] Added optimistic unassigned figure', {
        figureKey,
        figureId: assignment.figure._id,
      });

      // Process unassign in background
      try {
        logger.info('[FigureManagementModal] Processing unassign in background', {
          figureKey,
          figureId: assignment.figure._id,
        });

        const result = await FigureApiService.updateFigure(
          projectId,
          assignment.figure._id!,
          {
            unassign: true,
          }
        );

        logger.info('[FigureManagementModal] Background unassign completed', {
          figureKey,
          figureId: assignment.figure._id,
          uploadedRecordId: result.uploadedRecordId,
        });

        // Update optimistic figure with the real uploadedRecordId for precise tracking
        if (result.uploadedRecordId) {
          setOptimisticallyUnassigned(prev => 
            prev.map(opt => 
              opt.figureKey === figureKey 
                ? { ...opt, uploadedRecordId: result.uploadedRecordId }
                : opt
            )
          );
        }

        // Refresh cache to get the real unassigned figure
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: queryKeys.projects.figures(projectId),
            exact: false,
          }),
          queryClient.invalidateQueries({
            queryKey: [...queryKeys.projects.figures(projectId), 'unassigned'],
            exact: true,
          }),
        ]);

        // Clean up optimistic figure after a very short delay (real one should appear immediately)
        setTimeout(() => {
          setOptimisticallyUnassigned(prev => 
            prev.filter(opt => opt.figureKey !== figureKey)
          );
          logger.info('[FigureManagementModal] Cleaned up optimistic figure');
        }, 50); // Much shorter delay

        logger.info('[FigureManagementModal] Cache refreshed after background unassign');

      } catch (error) {
        // If unassign fails, remove from optimistic state and show error
        setOptimisticallyUnassigned(prev => 
          prev.filter(opt => opt.figureKey !== figureKey)
        );

        logger.error('[FigureManagementModal] Background unassign failed', {
          figureKey,
          figureId: assignment.figure._id,
          error,
        });

        toast({
          title: 'Failed to unassign figure',
          description: 'The figure assignment could not be removed. Please try again.',
          status: 'error',
        });
      }
    },
    [batchOperations, figureAssignments, projectId, queryClient, toast]
  );

  const handleAssign = useCallback(
    (figureId: string, figureKey: string) => {
      // Prevent assigning optimistic figures (they need to become real first)
      if (figureId.startsWith('optimistic-')) {
        logger.warn('[FigureManagementModal] Cannot assign optimistic figure', {
          figureId,
          figureKey,
        });
        
        toast({
          title: 'Please wait',
          description: 'This figure is still being processed. Please try again in a moment.',
          status: 'warning',
        });
        return;
      }

      // Find the unassigned figure to get preview data
      const unassignedFigure = displayedAvailableFigures.find(
        f => f.id === figureId
      );

      setBatchOperations(prev => {
        // Only remove existing assign operations for this specific slot or figure
        // DO NOT remove unassign operations - they're needed to empty the source slot
        const filtered = prev.filter(
          op =>
            !(op.type === 'assign' && op.figureKey === figureKey) && // Remove assign ops for this slot
            !(op.type === 'assign' && op.figureId === figureId) // Remove assign ops for this figure
        );

        const newOperations = [
          ...filtered,
          {
            type: 'assign' as const,
            figureId,
            figureKey,
            previewImageUrl: unassignedFigure?.url,
            previewFileName: unassignedFigure?.fileName,
          },
        ];

        logger.info('[FigureManagementModal] Queued assign operation', {
          figureId,
          figureKey,
          previewFileName: unassignedFigure?.fileName,
          totalOperations: newOperations.length,
          allOperations: newOperations.map(op => ({ 
            type: op.type, 
            figureId: op.figureId,
            ...(op.type === 'assign' && { figureKey: op.figureKey }),
            ...(op.type === 'unassign' && { sourceKey: op.sourceKey })
          })),
        });

        return newOperations;
      });
    },
    [displayedAvailableFigures, toast]
  );

  // Handle drop operations
  const handleDrop = useCallback(
    (item: any, targetKey: string) => {
      if (item.sourceType === 'unassigned') {
        handleAssign(item.figureId, targetKey);
      } else if (
        item.sourceType === 'assigned' &&
        item.figureKey !== targetKey
      ) {
        // Handle figure swapping - this would need more complex logic
        logger.info(
          '[FigureManagementModal] Figure swapping not implemented yet'
        );
      }
    },
    [handleAssign]
  );

  // Reset operations
  const handleReset = useCallback(() => {
    setBatchOperations([]);
    logger.info('[FigureManagementModal] Reset all operations');
  }, []);

  // Apply batch operations
  const handleApplyChanges = useCallback(async () => {
    if (batchOperations.length === 0) return;

    setIsApplying(true);
    logger.info('[FigureManagementModal] Applying batch operations', {
      operationCount: batchOperations.length,
    });

    try {
      // Only assign operations should be in the batch now (unassign operations are immediate)
      const assignOperations = batchOperations.filter(op => op.type === 'assign');
      
      if (assignOperations.length === 0) {
        logger.info('[FigureManagementModal] No assign operations to execute');
        setBatchOperations([]);
        return;
      }

      logger.info('[FigureManagementModal] Executing assign operations', {
        operationCount: assignOperations.length,
        operations: assignOperations.map(op => ({ 
          type: op.type, 
          figureId: op.figureId, 
          figureKey: op.figureKey 
        })),
      });

      // Apply the assign operations
      for (const operation of assignOperations) {
        logger.info('[FigureManagementModal] Executing assign operation', {
          operation,
          projectId,
        });

        const result = await FigureApiService.updateFigure(
          projectId,
          operation.figureId,
          {
            figureKey: operation.figureKey,
          }
        );
        logger.info('[FigureManagementModal] Assign operation completed', {
          operation,
          result,
        });
      }

      // Smart cache invalidation
      const figuresQueryKey = queryKeys.projects.figures(projectId);
      const unassignedQueryKey = [...figuresQueryKey, 'unassigned'];

      logger.info('[FigureManagementModal] Starting cache invalidation', {
        assignOperations: assignOperations.length,
        projectId,
      });

      const invalidationPromises = [];

      // Always invalidate unassigned figures when assign operations occur
      invalidationPromises.push(
        queryClient.invalidateQueries({
          queryKey: unassignedQueryKey,
          exact: true,
          refetchType: 'all',
        })
      );

      // Invalidate main figures cache for assign operations
      invalidationPromises.push(
        queryClient.invalidateQueries({
          queryKey: figuresQueryKey,
          exact: false,
          refetchType: 'active',
        })
      );

      await Promise.all(invalidationPromises);

      logger.info('[FigureManagementModal] Cache invalidation completed');

      toast({
        title: 'Success',
        description: `Applied ${assignOperations.length} figure assignment${assignOperations.length !== 1 ? 's' : ''}`,
        status: 'success',
      });

      setBatchOperations([]);

      // Single callback to parent for assign operations
      if (onFigureAssigned && assignOperations.length > 0) {
        const lastOp = assignOperations[assignOperations.length - 1];
        logger.info(
          '[FigureManagementModal] Calling onFigureAssigned callback',
          {
            lastOperation: lastOp,
            totalOperations: assignOperations.length,
          }
        );
        await onFigureAssigned(lastOp.figureId, lastOp.figureKey!);
      }

      // Minimal delay - parent component will handle its own refresh
      await new Promise(resolve => setTimeout(resolve, 100));

      // Close modal after successful operations
      onClose();
    } catch (error) {
      logger.error('[FigureManagementModal] Failed to apply batch operations', {
        error,
        operationCount: batchOperations.length,
      });

      toast({
        title: 'Error',
        description: 'Failed to apply some changes. Please try again.',
        status: 'error',
      });
    } finally {
      setIsApplying(false);
    }
  }, [
    batchOperations,
    projectId,
    queryClient,
    toast,
    onFigureAssigned,
    onClose,
  ]);

  // Preview handlers
  const handlePreview = useCallback((imageUrl: string, title: string) => {
    setPreviewModal({
      isOpen: true,
      imageUrl,
      title,
    });
  }, []);

  // Warning message handler
  const handleShowWarning = useCallback((message: string) => {
    setWarningMessage(message);

    // Clear any existing timeout
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Set a new timeout to clear the message after 3 seconds
    warningTimeoutRef.current = setTimeout(() => {
      setWarningMessage('');
    }, 3000);
  }, []);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);

  // Cleanup optimistic figures when modal state changes
  React.useEffect(() => {
    if (!isOpen) {
      // Clear optimistic figures when modal closes
      setOptimisticallyUnassigned([]);
    }
  }, [isOpen]);

  const isLoading = isLoadingFigures || isLoadingUnassigned;

  return (
    <TooltipProvider>
      <DndProvider backend={HTML5Backend}>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-[1200px] max-h-[85vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Figure Management</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Drag and drop to assign figures to empty slots. To replace an
                assigned figure, unassign it first using the X button.
              </p>
            </DialogHeader>

            {isLoading ? (
              <LoadingState message="Loading figures..." />
            ) : (
              <div className="flex flex-col gap-4 py-4">
                {/* Batch operations summary - compact */}
                <div className="h-6">
                  {batchOperations.length > 0 && (
                    <div className="flex items-center justify-between text-sm bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded">
                      <span>
                        {batchOperations.length} pending change
                        {batchOperations.length !== 1 ? 's' : ''}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        disabled={isApplying}
                        className="h-6 px-2 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      >
                        <FiRotateCcw className="w-3 h-3 mr-1" />
                        Reset
                      </Button>
                    </div>
                  )}
                </div>

                {/* Hidden file input for uploads */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => handleFileUpload(e.target.files)}
                />

                {/* Two-column layout */}
                <div className="flex gap-6 h-[500px]">
                  {/* Left column - Assigned figures */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold mb-3">
                      Assigned Figures
                    </h3>
                    <div className="flex-1 border rounded-lg p-4 bg-blue-50/50 dark:bg-blue-950/20 overflow-y-auto">
                      <div className="grid grid-cols-3 gap-3">
                        {displayedAssignedFigures.map(assignment => (
                          <div
                            key={assignment.figureKey}
                            className="aspect-square"
                          >
                            <AssignedFigureSlot
                              assignment={assignment}
                              onUnassign={handleUnassign}
                              onPreview={handlePreview}
                              onAssign={handleAssign}
                              isModified={isAssignmentModified(
                                assignment.figureKey
                              )}
                              pendingAssignment={getPendingAssignment(
                                assignment.figureKey
                              )}
                              onShowWarning={handleShowWarning}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right column - Available figures */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">
                        Available Figures ({displayedAvailableFigures.length})
                      </h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="text-xs"
                      >
                        <FiUpload className="w-3 h-3 mr-1" />
                        Upload
                      </Button>
                    </div>
                    <div
                      className="flex-1 border rounded-lg p-4 bg-green-50/50 dark:bg-green-950/20 overflow-y-auto transition-colors"
                      onDrop={e => {
                        e.preventDefault();
                        handleFileUpload(e.dataTransfer.files);
                      }}
                      onDragOver={e => {
                        e.preventDefault();
                        e.currentTarget.classList.add(
                          'border-blue-400',
                          'bg-blue-50/50',
                          'dark:bg-blue-950/20'
                        );
                      }}
                      onDragLeave={e => {
                        e.preventDefault();
                        e.currentTarget.classList.remove(
                          'border-blue-400',
                          'bg-blue-50/50',
                          'dark:bg-blue-950/20'
                        );
                      }}
                    >
                      {displayedAvailableFigures.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <div className="text-center">
                            <FiUpload className="w-12 h-12 mx-auto mb-4" />
                            <p>No unassigned figures available</p>
                            <p className="text-sm">
                              Drag & drop or click Upload to add figures
                            </p>
                            {isUploading && (
                              <div className="mt-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="text-sm mt-2">Uploading...</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {displayedAvailableFigures.map(figure => (
                            <div key={figure.id} className="aspect-square">
                              <UnassignedFigureItem
                                figure={figure}
                                onPreview={handlePreview}
                              />
                            </div>
                          ))}
                          {isUploading && (
                            <div className="aspect-square border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="text-xs mt-2 text-blue-600">
                                  Uploading...
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subtle warning message at bottom - always reserve space */}
            <div className="px-6 pb-2 h-10 flex items-center">
              {warningMessage && (
                <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded border border-amber-200 dark:border-amber-800 animate-in fade-in duration-200">
                  {warningMessage}
                </div>
              )}
            </div>

            <DialogFooter>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isApplying || isUploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApplyChanges}
                  disabled={
                    batchOperations.length === 0 || isApplying || isUploading
                  }
                >
                  {isApplying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4 mr-2" />
                      Apply Changes ({batchOperations.length})
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview modal */}
        <ImagePreviewModal
          isOpen={previewModal.isOpen}
          onClose={() => setPreviewModal(prev => ({ ...prev, isOpen: false }))}
          imageUrl={previewModal.imageUrl}
          title={previewModal.title}
        />
      </DndProvider>
    </TooltipProvider>
  );
};
