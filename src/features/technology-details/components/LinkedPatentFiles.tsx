import React, { useState, useCallback, ChangeEvent } from 'react';
import { FileText, Download, Plus, Upload, X, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/apiClient';
import { logger } from '@/utils/clientLogger';
import { useToast } from '@/hooks/useToastWrapper';
import { useUploadPatentFile } from '@/hooks/api/useUploadPatentFile';
import { cn } from '@/lib/utils';

interface ProjectDocument {
  id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  createdAt: string;
  uploadedBy: string;
}

interface LinkedPatentFilesProps {
  projectId: string;
}

export const LinkedPatentFiles: React.FC<LinkedPatentFilesProps> = ({
  projectId,
}) => {
  const toast = useToast();
  const uploadMutation = useUploadPatentFile();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<
    'parent-patent' | 'office-action' | 'cited-reference' | 'uploaded-doc'
  >('uploaded-doc');
  const [linkToProject, setLinkToProject] = useState(true);

  // Fetch project documents
  const {
    data: projectDocuments = [],
    isLoading,
    refetch: refetchDocs,
  } = useQuery<ProjectDocument[]>({
    queryKey: ['projectDocuments', projectId],
    queryFn: async () => {
      const response = await apiFetch(`/api/projects/${projectId}/documents`);
      if (!response.ok) {
        throw new Error('Failed to fetch project documents');
      }
      const result = await response.json();
      // The apiResponse.ok utility wraps the response in a 'data' property
      return result.data?.documents || [];
    },
    enabled: !!projectId,
  });

  const handleFileSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          toast.error({
            title: 'File too large',
            description: 'Please select a file smaller than 10MB',
          });
          return;
        }
        setSelectedFile(file);
        setIsUploading(true);
      }
    },
    [toast]
  );

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      await uploadMutation.mutateAsync({
        projectId,
        file: selectedFile,
        fileType,
        linkToProject,
      });

      toast.success({
        title: 'Document uploaded successfully',
        description: 'The document has been added to your project',
      });

      // Reset state
      setSelectedFile(null);
      setFileType('uploaded-doc');
      setIsUploading(false);

      // Refetch the documents list
      refetchDocs();

      // Reset file input
      const fileInput = document.getElementById(
        'document-file-input'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      toast.error({
        title: 'Upload failed',
        description:
          error instanceof Error ? error.message : 'Failed to upload document',
      });
    }
  }, [
    selectedFile,
    projectId,
    fileType,
    linkToProject,
    uploadMutation,
    toast,
    refetchDocs,
  ]);

  const handleDeleteDocument = async (documentId: string, fileName: string) => {
    try {
      const response = await apiFetch(
        `/api/projects/${projectId}/documents/${documentId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      toast.success({
        title: 'Document deleted',
        description: `${fileName} has been removed from your project`,
      });

      // Refetch documents
      refetchDocs();
    } catch (error) {
      toast.error({
        title: 'Delete failed',
        description:
          error instanceof Error ? error.message : 'Failed to delete document',
      });
    }
  };

  const handleDownload = (documentId: string, fileName: string) => {
    const downloadUrl = `/api/projects/${projectId}/patent-files/${documentId}/download`;
    window.open(downloadUrl, '_blank');
    logger.info('[LinkedPatentFiles] Downloading file', {
      documentId,
      fileName,
    });
  };

  const getFileTypeColor = (fileType: string | null) => {
    switch (fileType) {
      case 'parent-patent':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800';
      case 'office-action':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-800';
      case 'cited-reference':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getFileTypeLabel = (fileType: string | null) => {
    switch (fileType) {
      case 'parent-patent':
        return 'Parent Patent';
      case 'office-action':
        return 'Office Action';
      case 'cited-reference':
        return 'Cited Reference';
      default:
        return 'Document';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-5 w-5 bg-muted rounded animate-pulse" />
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Archive className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground">
            Project Documents
          </h3>
          {projectDocuments.length > 0 && (
            <span className="text-sm text-muted-foreground">
              ({projectDocuments.length})
            </span>
          )}
        </div>

        {!isUploading && (
          <div>
            <input
              id="document-file-input"
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                document.getElementById('document-file-input')?.click()
              }
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Document</span>
            </Button>
          </div>
        )}
      </div>

      {/* Upload Form (appears when file is selected) */}
      {isUploading && selectedFile && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/20 dark:border-blue-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedFile(null);
                setIsUploading(false);
              }}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <Label className="text-sm font-medium text-foreground">
                Document Type
              </Label>
              <select
                value={fileType}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setFileType(e.target.value as any)
                }
                className={cn(
                  'mt-1 w-full p-2 border rounded-md text-sm',
                  'bg-background text-foreground border-border',
                  'focus:ring-2 focus:ring-primary focus:border-primary'
                )}
              >
                <option value="parent-patent">Parent Patent</option>
                <option value="office-action">Office Action</option>
                <option value="cited-reference">Cited Reference</option>
                <option value="uploaded-doc">Other Document</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="link-to-project"
                checked={linkToProject}
                onCheckedChange={setLinkToProject}
              />
              <Label
                htmlFor="link-to-project"
                className="text-sm text-foreground"
              >
                Save to project
              </Label>
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
            size="sm"
            className="w-full"
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      )}

      {/* Documents List */}
      {projectDocuments.length === 0 && !isUploading ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            No documents uploaded yet
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Click "Add Document" to upload your first document
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {projectDocuments.map(doc => (
            <div
              key={doc.id}
              className="group p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {doc.fileName}
                      </p>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-xs px-2 py-1 border',
                          getFileTypeColor(doc.fileType)
                        )}
                      >
                        {getFileTypeLabel(doc.fileType)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(doc.id, doc.fileName)}
                    className="h-8 w-8 p-0"
                    title="Download document"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDocument(doc.id, doc.fileName)}
                    className="h-8 w-8 p-0 hover:text-destructive"
                    title="Delete document"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
