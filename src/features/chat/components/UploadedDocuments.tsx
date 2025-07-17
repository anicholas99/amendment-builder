import React from 'react';
import { FileText, X, Loader2 } from 'lucide-react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/stack';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UploadedDocument {
  id: string;
  title: string;
  patentNumber: string;
  fileType?: string;
  uploadedAt?: Date;
}

interface UploadedDocumentsProps {
  documents: UploadedDocument[];
  isUploading?: boolean;
  uploadingFileName?: string;
  onRemove?: (id: string) => void;
  onDocumentClick?: (doc: UploadedDocument) => void;
}

export const UploadedDocuments: React.FC<UploadedDocumentsProps> = ({
  documents,
  isUploading,
  uploadingFileName,
  onRemove,
  onDocumentClick,
}) => {
  if (!documents.length && !isUploading) {
    return null;
  }

  return (
    <Box className="px-4 py-2 border-t border-border bg-muted/30">
      <Text className="text-xs font-medium text-muted-foreground mb-2">
        Available Documents
      </Text>

      <div className="space-y-1">
        {/* Show uploading file */}
        {isUploading && uploadingFileName && (
          <HStack className="p-2 bg-background rounded-md border border-border animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <Text className="text-sm flex-1 truncate">{uploadingFileName}</Text>
            <Badge variant="secondary" className="text-xs">
              Uploading...
            </Badge>
          </HStack>
        )}

        {/* Show uploaded documents */}
        {documents.map(doc => (
          <HStack
            key={doc.id}
            className="p-2 bg-background rounded-md border border-border hover:border-primary/50 transition-colors cursor-pointer group"
            onClick={() => onDocumentClick?.(doc)}
          >
            <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
            <Box className="flex-1 min-w-0">
              <Text className="text-sm truncate font-medium">
                {doc.title || doc.patentNumber}
              </Text>
              {doc.fileType && (
                <Text className="text-xs text-muted-foreground">
                  {doc.fileType.replace(/-/g, ' ')}
                </Text>
              )}
            </Box>
            {onRemove && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={e => {
                  e.stopPropagation();
                  onRemove(doc.id);
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </HStack>
        ))}
      </div>

      <Text className="text-xs text-muted-foreground mt-2">
        Click a document to ask questions about it
      </Text>
    </Box>
  );
};
