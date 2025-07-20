import React, { useCallback, useRef, useState } from 'react';
import { Upload, FileText, AlertTriangle, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToastWrapper';
import { logger } from '@/utils/clientLogger';
import { useDragDropFileHandler } from '@/features/technology-details/hooks/useDragDropFileHandler';
import { useQueryClient } from '@tanstack/react-query';
import { amendmentQueryKeys } from '@/hooks/api/useAmendment';

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
  const queryClient = useQueryClient();
  const [metadata, setMetadata] = useState({
    oaNumber: '',
    dateIssued: '',
    examinerId: '',
    artUnit: '',
    applicationNumber: '',
  });
  const [testOfficeActionText, setTestOfficeActionText] = useState(`OFFICE ACTION

Application No.: 17/123,456
Filing Date: March 15, 2023
Applicant: Tech Innovations LLC
Examiner: Sarah Johnson
Art Unit: 3685
Date Mailed: December 15, 2024

CLAIM REJECTIONS - 35 USC § 103

Claims 1-5 are rejected under 35 U.S.C. § 103 as being unpatentable over Smith (US 8,123,456) in view of Johnson (US 2020/0234567).

Regarding claim 1, Smith discloses a system for processing data (col. 3, lines 15-25) including a processor configured to receive input data (col. 4, lines 10-15) and generate output results (col. 5, lines 5-10). Smith further teaches storing the processed data in a database (col. 6, lines 1-5).

However, Smith does not explicitly disclose the limitation of "real-time processing with latency under 100ms." Johnson teaches a real-time data processing system that achieves sub-100ms latency (para. [0045]-[0050]), which would be obvious to combine with Smith's system to improve processing speed.

Regarding claims 2-3, these claims depend from claim 1 and add the limitations of "encrypted data transmission" and "user authentication." Smith discloses encryption protocols (col. 8, lines 10-20) and Johnson teaches user authentication methods (para. [0067]-[0072]). The combination would render these claims obvious.

Claims 4-5 are rejected for similar reasons as they merely add routine data validation steps that would be obvious to one skilled in the art.

CLAIM REJECTIONS - 35 USC § 102

Claim 6 is rejected under 35 U.S.C. § 102(a)(1) as being anticipated by Wilson (US 9,987,654).

Wilson discloses every element of claim 6, including the specific algorithm for data compression (col. 12, lines 5-15), the file format conversion process (col. 13, lines 1-10), and the user interface elements recited in the claim (Fig. 3, col. 15, lines 20-30).

OBJECTIONS

Claims 7-9 are objected to as being dependent upon a rejected base claim, but would be allowable if rewritten in independent form including all the limitations of the base claim and any intervening claims.

ALLOWABLE SUBJECT MATTER

Claims 10-12 would be allowable if amended to include the limitations discussed in the Interview Summary dated November 20, 2024, specifically the addition of "machine learning-based optimization" as discussed.

CONCLUSION

Applicant is given a period of THREE MONTHS from the date of this Office Action to file a reply. Extensions of time may be available under 37 CFR 1.136(a).

Any inquiry concerning this communication should be directed to the undersigned at telephone number (571) 272-1234.

/Sarah Johnson/
Primary Examiner, Art Unit 3685`);

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
          applicationNumber: '',
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

  // Test text processing handler
  const handleTestTextProcess = useCallback(async () => {
    if (!testOfficeActionText.trim()) {
      toast.error({
        title: 'No text provided',
        description: 'Please paste Office Action text to test',
      });
      return;
    }

    try {
      logger.info('[OfficeActionUpload] Processing test text', {
        projectId,
        textLength: testOfficeActionText.length,
      });

      // Send text directly to the upload endpoint
      const response = await fetch(`/api/projects/${projectId}/office-actions/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-slug': window.location.pathname.split('/')[1] || '',
        },
        body: JSON.stringify({
          testText: testOfficeActionText,
          metadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Processing failed');
      }

      const result = await response.json();

      console.log('[OfficeActionUpload] API Response:', result);

      logger.info('[OfficeActionUpload] Test processing successful', {
        projectId,
        officeActionId: result.officeAction?.id,
      });

      toast.success({
        title: 'Office Action processed',
        description: 'Test text has been parsed successfully',
      });

      if (onUploadComplete) {
        // The API response is wrapped in a data object: {data: {success: true, officeAction: {...}}}
        const officeActionData = result.data?.officeAction || result.officeAction || result;
        console.log('[OfficeActionUpload] Calling onUploadComplete with:', officeActionData);
        onUploadComplete(officeActionData);
      }

    } catch (error) {
      logger.error('[OfficeActionUpload] Test processing failed', {
        projectId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      toast.error({
        title: 'Processing failed',
        description: error instanceof Error ? error.message : 'Failed to process Office Action text',
      });
    }
  }, [projectId, testOfficeActionText, metadata, toast, onUploadComplete]);

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
                <Label htmlFor="applicationNumber" className="text-xs">Application Number</Label>
                <Input
                  id="applicationNumber"
                  placeholder="e.g., 16/123,456"
                  value={metadata.applicationNumber}
                  onChange={(e) => handleMetadataChange('applicationNumber', e.target.value)}
                  disabled={isDisabled}
                  className="h-8 text-xs"
                />
              </div>
              
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

      {/* Test Text Input Section */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <TestTube className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-foreground">Test with Office Action Text</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              For testing: paste Office Action text directly instead of uploading a file. This will process the text through the same parsing system.
            </p>
            
            <div className="space-y-3">
              <Label htmlFor="testText" className="text-xs">Office Action Text</Label>
              <Textarea
                id="testText"
                placeholder="Paste Office Action text here... Include sections like:

OFFICE ACTION

Application No.: 17/123,456
Examiner: John Smith

CLAIM REJECTIONS - 35 USC § 103
Claims 1-5 are rejected under 35 U.S.C. § 103 as being unpatentable over..."
                value={testOfficeActionText}
                onChange={(e) => setTestOfficeActionText(e.target.value)}
                disabled={isDisabled}
                className="min-h-[200px] text-xs font-mono"
              />
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {testOfficeActionText.length} characters
                </span>
                <Button
                  onClick={handleTestTextProcess}
                  disabled={isDisabled || !testOfficeActionText.trim()}
                  size="sm"
                  variant="outline"
                  className="h-8"
                >
                  <TestTube className="h-3 w-3 mr-1" />
                  Process Test Text
                </Button>
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