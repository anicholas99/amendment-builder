import React, { useCallback, useRef, useState } from 'react';
import { Upload, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';
import { useDragDropFileHandler } from '@/features/technology-details/hooks/useDragDropFileHandler';

interface OfficeActionUploadProps {
  projectId: string;
  onUploadComplete?: (officeAction: any) => void;
  disabled?: boolean;
}

// Supported Office Action file types
const SUPPORTED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Office Action Upload Component
 * Provides drag & drop and click-to-upload functionality for Office Action documents
 * Follows existing file upload patterns from technology details components
 */
export const OfficeActionUpload: React.FC<OfficeActionUploadProps> = ({
  projectId,
  onUploadComplete,
  disabled = false,
}) => {
  const toast = useToast();
  const [metadata, setMetadata] = useState({
    oaNumber: '',
    dateIssued: '',
    examinerId: '',
    artUnit: '',
  });

  // File upload handler
  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file) return;

      // Validate file type
      if (!SUPPORTED_TYPES.includes(file.type)) {
        toast.error({
          title: 'Invalid file type',
          description: 'Please upload a PDF or DOCX file',
        });
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error({
          title: 'File too large',
          description: 'Please upload a file smaller than 50MB',
        });
        return;
      }

      try {
        logger.info('[OfficeActionUpload] Starting upload', {
          fileName: file.name,
          fileSize: file.size,
          projectId,
        });

        // Create form data for multipart upload
        const formData = new FormData();
        formData.append('file', file);
        
        // Add metadata if provided
        if (metadata.oaNumber || metadata.dateIssued || metadata.examinerId || metadata.artUnit) {
          formData.append('metadata', JSON.stringify(metadata));
        }

        // Upload to our API endpoint
        const response = await fetch(`/api/projects/${projectId}/office-actions/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            'x-tenant-slug': window.location.pathname.split('/')[1], // Extract tenant from URL
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Upload failed');
        }

        const result = await response.json();

        logger.info('[OfficeActionUpload] Upload successful', {
          officeActionId: result.officeAction?.id,
          fileName: file.name,
          hasWarning: !!result.warning,
        });

        // Show success toast with warning if applicable
        if (result.warning) {
          toast.warning({
            title: 'Office Action uploaded with warnings',
            description: `"${file.name}" was uploaded, but ${result.warning.toLowerCase()}`,
          });
        } else {
          toast.success({
            title: 'Office Action uploaded',
            description: `"${file.name}" has been uploaded successfully`,
          });
        }

        // Reset metadata form
        setMetadata({
          oaNumber: '',
          dateIssued: '',
          examinerId: '',
          artUnit: '',
        });

        // Notify parent component
        if (onUploadComplete) {
          onUploadComplete(result.officeAction);
        }

      } catch (error) {
        logger.error('[OfficeActionUpload] Upload failed', {
          error,
          fileName: file.name,
          projectId,
        });

        toast.error({
          title: 'Upload failed',
          description: error instanceof Error ? error.message : 'Failed to upload Office Action',
        });
        throw error;
      }
    },
    [projectId, metadata, toast, onUploadComplete]
  );

  // Use the existing drag/drop handler hook
  const {
    isDragging,
    isUploading,
    uploadingFiles,
    fileInputRef,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileInputChange,
    triggerFileInput,
  } = useDragDropFileHandler({ onFileUpload: handleFileUpload });

  // Handle metadata changes
  const handleMetadataChange = useCallback(
    (field: keyof typeof metadata, value: string) => {
      setMetadata(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  const isDisabled = disabled || isUploading;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
              ${isDragging 
                ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20' 
                : 'border-muted-foreground/30 hover:border-muted-foreground/50'
              }
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={!isDisabled ? triggerFileInput : undefined}
          >
            <div className="flex flex-col items-center gap-4">
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Uploading...</p>
                    {uploadingFiles.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {uploadingFiles[0]}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {isDragging ? 'Drop Office Action here' : 'Upload Office Action'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Drag & drop or click to select PDF or DOCX files
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Maximum file size: 50MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isDisabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerFileInput();
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Browse Files
                  </Button>
                </>
              )}
            </div>

            {/* Drag overlay */}
            {isDragging && (
              <div className="absolute inset-0 bg-blue-50/80 dark:bg-blue-950/40 rounded-lg border-2 border-dashed border-blue-400 flex items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Upload className="h-8 w-8" />
                  <p className="text-sm font-medium">Drop Office Action to upload</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Optional Metadata */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-medium">Optional Metadata</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              This information can be extracted automatically from the document, but you can provide it manually for faster processing.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="oaNumber" className="text-xs">Office Action Number</Label>
                <Input
                  id="oaNumber"
                  placeholder="e.g., Non-Final Office Action"
                  value={metadata.oaNumber}
                  onChange={(e) => handleMetadataChange('oaNumber', e.target.value)}
                  disabled={isDisabled}
                  className="h-8 text-xs"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateIssued" className="text-xs">Date Issued</Label>
                <Input
                  id="dateIssued"
                  type="date"
                  value={metadata.dateIssued}
                  onChange={(e) => handleMetadataChange('dateIssued', e.target.value)}
                  disabled={isDisabled}
                  className="h-8 text-xs"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="examinerId" className="text-xs">Examiner Name/ID</Label>
                <Input
                  id="examinerId"
                  placeholder="e.g., John Smith or 12345"
                  value={metadata.examinerId}
                  onChange={(e) => handleMetadataChange('examinerId', e.target.value)}
                  disabled={isDisabled}
                  className="h-8 text-xs"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="artUnit" className="text-xs">Art Unit</Label>
                <Input
                  id="artUnit"
                  placeholder="e.g., 3625"
                  value={metadata.artUnit}
                  onChange={(e) => handleMetadataChange('artUnit', e.target.value)}
                  disabled={isDisabled}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}; 