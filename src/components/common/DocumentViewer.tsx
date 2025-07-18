/**
 * DocumentViewer - Reusable floating panel for viewing PDFs and documents
 * 
 * Handles Office Actions, Prior Art, and other documents with consistent UI
 * Follows security patterns with tenant isolation and proper error handling
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  Maximize2, 
  Minimize2,
  RotateCw,
  ZoomIn,
  ZoomOut,
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { logger } from '@/utils/clientLogger';

// Types
interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  projectId: string;
  documentType: 'office-action' | 'prior-art' | 'document';
  title?: string;
  description?: string;
  className?: string;
}

interface DocumentViewerState {
  isLoading: boolean;
  error: string | null;
  documentUrl: string | null;
  isFullscreen: boolean;
  zoom: number;
  rotation: number;
}

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5];
const DEFAULT_ZOOM_INDEX = 2; // 1x zoom

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  isOpen,
  onClose,
  documentId,
  projectId,
  documentType,
  title,
  description,
  className,
}) => {
  const [state, setState] = useState<DocumentViewerState>({
    isLoading: false,
    error: null,
    documentUrl: null,
    isFullscreen: false,
    zoom: ZOOM_LEVELS[DEFAULT_ZOOM_INDEX],
    rotation: 0,
  });

  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);

  // Get document URL based on type
  const getDocumentUrl = useCallback(() => {
    switch (documentType) {
      case 'office-action':
        return `/api/projects/${projectId}/office-actions/${documentId}/view`;
      case 'prior-art':
        return `/api/projects/${projectId}/prior-art/${documentId}/view`;
      case 'document':
        return `/api/projects/${projectId}/documents/${documentId}/view`;
      default:
        return null;
    }
  }, [projectId, documentId, documentType]);

  // Get download URL based on type
  const getDownloadUrl = useCallback(() => {
    switch (documentType) {
      case 'office-action':
        return `/api/projects/${projectId}/office-actions/${documentId}/download`;
      case 'prior-art':
        return `/api/projects/${projectId}/prior-art/${documentId}/download`;
      case 'document':
        return `/api/projects/${projectId}/documents/${documentId}/download`;
      default:
        return null;
    }
  }, [projectId, documentId, documentType]);

  // Load document when opened
  useEffect(() => {
    if (!isOpen || !documentId) {
      setState(prev => ({ ...prev, documentUrl: null, error: null }));
      return;
    }

    const loadDocument = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const url = getDocumentUrl();
        if (!url) {
          throw new Error('Invalid document type');
        }

        // Test if document is accessible
        const response = await fetch(url, { method: 'HEAD' });
        
        if (!response.ok) {
          throw new Error(`Document not accessible: ${response.statusText}`);
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          documentUrl: url,
          error: null,
        }));

        logger.info('[DocumentViewer] Document loaded successfully', {
          documentId,
          documentType,
          projectId,
        });
      } catch (error) {
        logger.error('[DocumentViewer] Failed to load document', {
          documentId,
          documentType,
          error: error instanceof Error ? error.message : String(error),
        });

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load document',
        }));
      }
    };

    loadDocument();
  }, [isOpen, documentId, documentType, getDocumentUrl, projectId]);

  // Handle download
  const handleDownload = useCallback(() => {
    const downloadUrl = getDownloadUrl();
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
      logger.info('[DocumentViewer] Download initiated', {
        documentId,
        documentType,
      });
    }
  }, [getDownloadUrl, documentId, documentType]);

  // Handle external link (USPTO database, etc.)
  const handleExternalLink = useCallback(() => {
    if (documentType === 'prior-art' && title) {
      // Extract patent number from title for USPTO link
      const patentMatch = title.match(/US\d+|EP\d+|WO\d+/i);
      if (patentMatch) {
        window.open(`https://patents.uspto.gov/patent/${patentMatch[0]}`, '_blank');
      }
    }
  }, [documentType, title]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (zoomIndex < ZOOM_LEVELS.length - 1) {
      const newIndex = zoomIndex + 1;
      setZoomIndex(newIndex);
      setState(prev => ({ ...prev, zoom: ZOOM_LEVELS[newIndex] }));
    }
  }, [zoomIndex]);

  const handleZoomOut = useCallback(() => {
    if (zoomIndex > 0) {
      const newIndex = zoomIndex - 1;
      setZoomIndex(newIndex);
      setState(prev => ({ ...prev, zoom: ZOOM_LEVELS[newIndex] }));
    }
  }, [zoomIndex]);

  const handleResetZoom = useCallback(() => {
    setZoomIndex(DEFAULT_ZOOM_INDEX);
    setState(prev => ({ ...prev, zoom: ZOOM_LEVELS[DEFAULT_ZOOM_INDEX] }));
  }, []);

  // Rotation
  const handleRotate = useCallback(() => {
    setState(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    setState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (state.isFullscreen) {
          toggleFullscreen();
        } else {
          onClose();
        }
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRotate();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, state.isFullscreen, handleZoomIn, handleZoomOut, handleResetZoom, handleRotate, toggleFullscreen, onClose]);

  // Don't render if not open
  if (!isOpen) return null;

  // Document type configuration
  const typeConfig = {
    'office-action': {
      label: 'Office Action',
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      icon: FileText,
    },
    'prior-art': {
      label: 'Prior Art',
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      icon: FileText,
    },
    'document': {
      label: 'Document',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: FileText,
    },
  };

  const config = typeConfig[documentType];
  const IconComponent = config.icon;

  return (
    <TooltipProvider>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4',
          state.isFullscreen && 'p-0'
        )}
        onClick={onClose}
      >
        {/* Document viewer */}
        <Card
          className={cn(
            'w-full max-w-4xl h-full max-h-[90vh] flex flex-col',
            state.isFullscreen && 'max-w-none max-h-none rounded-none',
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <CardHeader className="flex-shrink-0 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <IconComponent className="h-5 w-5 text-gray-600 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {title || `${config.label} Document`}
                    </h3>
                    <Badge variant="outline" className={cn('text-xs', config.color)}>
                      {config.label}
                    </Badge>
                  </div>
                  {description && (
                    <p className="text-sm text-gray-600 truncate">{description}</p>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Zoom controls */}
                <div className="flex items-center gap-1 mr-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleZoomOut}
                        disabled={zoomIndex === 0}
                        className="h-8 w-8 p-0"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Zoom Out</TooltipContent>
                  </Tooltip>

                  <span className="text-xs text-gray-600 min-w-[3rem] text-center">
                    {Math.round(state.zoom * 100)}%
                  </span>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleZoomIn}
                        disabled={zoomIndex === ZOOM_LEVELS.length - 1}
                        className="h-8 w-8 p-0"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Zoom In</TooltipContent>
                  </Tooltip>
                </div>

                {/* Action buttons */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRotate}
                      className="h-8 w-8 p-0"
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Rotate</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownload}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download</TooltipContent>
                </Tooltip>

                {documentType === 'prior-art' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleExternalLink}
                        className="h-8 w-8 p-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View in USPTO Database</TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="h-8 w-8 p-0"
                    >
                      {state.isFullscreen ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {state.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  </TooltipContent>
                </Tooltip>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="flex-1 p-0 overflow-hidden">
            {state.isLoading && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-600">Loading document...</p>
                </div>
              </div>
            )}

            {state.error && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
                  <h3 className="font-medium text-gray-900 mb-2">Failed to Load Document</h3>
                  <p className="text-sm text-gray-600 mb-4">{state.error}</p>
                  <Button onClick={onClose} variant="outline">
                    Close
                  </Button>
                </div>
              </div>
            )}

            {!state.isLoading && !state.error && state.documentUrl && (
              <div className="h-full w-full relative">
                <iframe
                  src={state.documentUrl}
                  className="w-full h-full border-0"
                  style={{
                    transform: `scale(${state.zoom}) rotate(${state.rotation}deg)`,
                    transformOrigin: 'top left',
                  }}
                  title={title || 'Document'}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}; 