import React, { useState, useMemo } from 'react';
import {
  FiDownload,
  FiCheck,
  FiSearch,
  FiImage,
  FiEye,
  FiMaximize2,
} from 'react-icons/fi';
import { LoadingState } from '@/components/common/LoadingState';
import {
  useUnassignedFigures,
  UnassignedFigure,
} from '@/hooks/api/useUnassignedFigures';
import { useUpdateFigure } from '@/hooks/api/useUpdateFigure';
import { useQueryClient } from '@tanstack/react-query';
import { inventionQueryKeys } from '@/lib/queryKeys/inventionKeys';
import { logger } from '@/utils/clientLogger';
import { queryKeys } from '@/config/reactQueryConfig';
import { Figures } from './carousel-components/types';
import { useToast } from '@/hooks/useToastWrapper';

// shadcn/ui imports
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack, HStack } from '@/components/ui/stack';
import { IconButton } from '@/components/ui/icon-button';
import { SimpleGrid } from '@/components/ui/grid';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Enhanced file size formatter with more precision
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${value} ${sizes[i]}`;
};

// Format date to be more user-friendly
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else if (diffInHours < 168) {
    // 7 days
    const days = Math.floor(diffInHours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
};

interface UnassignedFiguresModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  targetFigureKey: string;
  onFigureAssigned?: (figureId: string, figureKey: string) => void;
}

// Image preview modal component
const ImagePreviewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  fileName: string;
}> = ({ isOpen, onClose, imageUrl, fileName }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] bg-transparent border-none shadow-none">
        <div className="relative">
          <img
            src={imageUrl}
            alt={fileName}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const UnassignedFiguresModal: React.FC<UnassignedFiguresModalProps> =
  React.memo(
    ({ isOpen, onClose, projectId, targetFigureKey, onFigureAssigned }) => {
      const toast = useToast();
      const queryClient = useQueryClient();
      const updateFigureMutation = useUpdateFigure();

      // State for search and sort
      const [searchQuery, setSearchQuery] = useState('');
      const [sortBy, setSortBy] = useState<
        'newest' | 'oldest' | 'name' | 'size'
      >('newest');
      const [selectedFigureId, setSelectedFigureId] = useState<string | null>(
        null
      );

      // Preview modal state
      const [isPreviewOpen, setIsPreviewOpen] = useState(false);
      const [previewImage, setPreviewImage] = useState<{
        url: string;
        fileName: string;
      } | null>(null);

      const {
        data: unassignedFigures,
        isLoading,
        error,
        refetch,
      } = useUnassignedFigures(projectId);

      // Filter and sort figures
      const processedFigures = useMemo(() => {
        if (!unassignedFigures) return [];

        // Filter by search query
        let filtered = unassignedFigures;
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filtered = unassignedFigures.filter(
            figure =>
              figure.fileName.toLowerCase().includes(query) ||
              figure.description?.toLowerCase().includes(query)
          );
        }

        // Sort
        const sorted = [...filtered];
        switch (sortBy) {
          case 'newest':
            sorted.sort(
              (a, b) =>
                new Date(b.uploadedAt).getTime() -
                new Date(a.uploadedAt).getTime()
            );
            break;
          case 'oldest':
            sorted.sort(
              (a, b) =>
                new Date(a.uploadedAt).getTime() -
                new Date(b.uploadedAt).getTime()
            );
            break;
          case 'name':
            sorted.sort((a, b) => a.fileName.localeCompare(b.fileName));
            break;
          case 'size':
            sorted.sort((a, b) => b.sizeBytes - a.sizeBytes);
            break;
        }

        return sorted;
      }, [unassignedFigures, searchQuery, sortBy]);

      const handleAssignFigure = (figureId: string) => {
        logger.info('[UnassignedFiguresModal] Assigning figure', {
          figureId,
          targetFigureKey,
          projectId,
        });

        updateFigureMutation.mutate(
          {
            projectId,
            figureId,
            updates: { figureKey: targetFigureKey },
          },
          {
            onSuccess: async (assignedFigureResponse: any) => {
              // Invalidate the unassigned figures query to ensure consistency
              const unassignedQueryKey = [
                ...queryKeys.projects.figures(projectId),
                'unassigned',
              ];

              queryClient.invalidateQueries({
                queryKey: unassignedQueryKey,
                exact: true,
              });

              toast({
                title: 'Figure assigned',
                description: `Figure has been assigned to ${targetFigureKey}`,
                status: 'success',
              });
              onFigureAssigned?.(assignedFigureResponse.id, targetFigureKey);
              onClose();
            },
            onError: (error: Error) => {
              toast({
                title: 'Failed to assign figure',
                description: error.message || 'Unknown error occurred',
                status: 'error',
              });
            },
          }
        );
      };

      const handlePreview = (figure: UnassignedFigure) => {
        setPreviewImage({ url: figure.url, fileName: figure.fileName });
        setIsPreviewOpen(true);
      };

      return (
        <TooltipProvider>
          <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[1200px] max-h-[90vh] my-8 overflow-hidden">
              <DialogHeader className="border-b border-border">
                <VStack className="items-start space-y-1">
                  <DialogTitle>Browse Unassigned Figures</DialogTitle>
                  <Text className="text-sm text-muted-foreground font-normal">
                    Select a figure to assign to {targetFigureKey}
                  </Text>
                </VStack>
              </DialogHeader>

              <div className="p-0 flex flex-col overflow-hidden">
                {/* Search and Sort Controls - Fixed at top */}
                {!isLoading &&
                  !error &&
                  unassignedFigures &&
                  unassignedFigures.length > 0 && (
                    <Box className="px-6 pt-6 pb-4 flex-shrink-0">
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search by filename or description..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Select
                          value={sortBy}
                          onValueChange={value =>
                            setSortBy(value as typeof sortBy)
                          }
                        >
                          <SelectTrigger className="w-auto">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">Newest first</SelectItem>
                            <SelectItem value="oldest">Oldest first</SelectItem>
                            <SelectItem value="name">Name (A-Z)</SelectItem>
                            <SelectItem value="size">Size (largest)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </Box>
                  )}

                {/* Scrollable Content Area */}
                <Box
                  className={`flex-1 overflow-y-auto px-6 pb-6 ${
                    !isLoading &&
                    !error &&
                    unassignedFigures &&
                    unassignedFigures.length > 0
                      ? 'pt-0'
                      : 'pt-6'
                  }`}
                >
                  {isLoading ? (
                    <LoadingState
                      variant="spinner"
                      message="Loading unassigned figures..."
                      minHeight="200px"
                    />
                  ) : error ? (
                    <Alert variant="destructive" className="rounded-md">
                      <AlertDescription>
                        Failed to load unassigned figures. Please try again.
                      </AlertDescription>
                    </Alert>
                  ) : !unassignedFigures || unassignedFigures.length === 0 ? (
                    <Box className="bg-muted rounded-lg p-8 text-center border border-dashed border-border">
                      <FiImage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <Text className="text-lg font-medium mb-2">
                        No unassigned figures available
                      </Text>
                      <Text className="text-sm text-muted-foreground max-w-md mx-auto">
                        Upload figures without assigning them to a specific
                        figure key, then browse and assign them here when
                        needed.
                      </Text>
                    </Box>
                  ) : processedFigures.length === 0 ? (
                    <Box className="bg-muted rounded-lg p-8 text-center">
                      <Text className="text-lg font-medium mb-2">
                        No matching figures found
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        Try adjusting your search criteria
                      </Text>
                    </Box>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                      {processedFigures.map(figure => (
                        <Box
                          key={figure.id}
                          className={`border-2 rounded-lg overflow-hidden transition-all duration-200 cursor-pointer hover:border-blue-400 hover:-translate-y-0.5 hover:shadow-md ${
                            selectedFigureId === figure.id
                              ? 'border-blue-500 bg-accent'
                              : 'border-border bg-card'
                          }`}
                          onClick={() => setSelectedFigureId(figure.id)}
                        >
                          {/* Image Preview */}
                          <Box className="relative h-[200px] bg-muted overflow-hidden border-b border-border">
                            <img
                              src={figure.url}
                              alt={figure.fileName}
                              className="w-full h-full object-contain p-3"
                            />

                            {/* Preview button overlay */}
                            <Box className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <IconButton
                                    aria-label="Preview"
                                    size="sm"
                                    onClick={e => {
                                      e.stopPropagation();
                                      handlePreview(figure);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    <FiMaximize2 className="h-4 w-4" />
                                  </IconButton>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Preview full size</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <a
                                    href={figure.url}
                                    download={figure.fileName}
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <IconButton
                                      aria-label="Download"
                                      size="sm"
                                      className="bg-gray-600 hover:bg-gray-700 text-white"
                                    >
                                      <FiDownload className="h-4 w-4" />
                                    </IconButton>
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Download</p>
                                </TooltipContent>
                              </Tooltip>
                            </Box>
                          </Box>

                          {/* Figure Details */}
                          <VStack className="items-stretch p-4 space-y-3">
                            <Box>
                              <Text
                                className="font-medium truncate"
                                title={figure.fileName}
                              >
                                {figure.fileName}
                              </Text>
                              {figure.description && (
                                <Text className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {figure.description}
                                </Text>
                              )}
                            </Box>

                            <HStack className="justify-between text-xs text-muted-foreground">
                              <Text>{formatFileSize(figure.sizeBytes)}</Text>
                              <Text>{formatDate(figure.uploadedAt)}</Text>
                            </HStack>

                            <Button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleAssignFigure(figure.id);
                              }}
                              disabled={updateFigureMutation.isPending}
                              size="sm"
                              className="w-full"
                            >
                              <HStack className="space-x-1">
                                <FiCheck className="h-4 w-4" />
                                <span>Assign to {targetFigureKey}</span>
                              </HStack>
                            </Button>
                          </VStack>
                        </Box>
                      ))}
                    </SimpleGrid>
                  )}
                </Box>
              </div>

              {processedFigures.length > 0 && (
                <DialogFooter className="border-t border-border py-3 flex-shrink-0">
                  <Text className="text-sm text-muted-foreground">
                    {processedFigures.length} figure
                    {processedFigures.length === 1 ? '' : 's'} available
                  </Text>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>

          {/* Image Preview Modal */}
          {previewImage && (
            <ImagePreviewModal
              isOpen={isPreviewOpen}
              onClose={() => setIsPreviewOpen(false)}
              imageUrl={previewImage.url}
              fileName={previewImage.fileName}
            />
          )}
        </TooltipProvider>
      );
    }
  );

UnassignedFiguresModal.displayName = 'UnassignedFiguresModal';
