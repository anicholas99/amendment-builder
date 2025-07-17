import React, { useCallback } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Paperclip, FileText, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Document {
  id: string;
  fileName?: string;
  originalName?: string;
  title?: string;
  patentNumber?: string;
  fileType?: string;
  source?: string;
}

interface DocumentPopoverProps {
  documents: Document[];
  selectedDocuments: string[];
  onDocumentToggle: (docId: string) => void;
  onSendMessage: (message: string) => void;
}

export const DocumentPopover: React.FC<DocumentPopoverProps> = ({
  documents,
  selectedDocuments,
  onDocumentToggle,
  onSendMessage,
}) => {
  const handleDocumentClick = useCallback(
    (doc: Document) => {
      // Quick action: send a message asking about the document
      const docName =
        doc.title || doc.fileName || doc.patentNumber || 'this document';
      onSendMessage(`Tell me about ${docName}`);
    },
    [onSendMessage]
  );

  const getDocumentDisplayName = (doc: Document) => {
    return (
      doc.title ||
      doc.originalName ||
      doc.fileName ||
      doc.patentNumber ||
      'Untitled'
    );
  };

  const getFileTypeColor = (fileType?: string) => {
    switch (fileType) {
      case 'parent-patent':
        return 'text-blue-600 bg-blue-50';
      case 'office-action':
        return 'text-orange-600 bg-orange-50';
      case 'cited-reference':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getFileTypeLabel = (fileType?: string) => {
    switch (fileType) {
      case 'parent-patent':
        return 'Parent';
      case 'office-action':
        return 'Office Action';
      case 'cited-reference':
        return 'Reference';
      case 'uploaded-doc':
        return 'Document';
      default:
        return 'Prior Art';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8"
          title="Available documents"
        >
          <FileText className="h-3 w-3" />
          {documents.length > 0 && (
            <Badge
              variant="secondary"
              className="absolute top-0 right-0 h-4 min-w-[16px] px-0.5 flex items-center justify-center text-[8px]"
            >
              {documents.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={5}>
        <div className="p-3 border-b">
          <h4 className="font-medium text-sm">Project Documents</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Click to ask about a document
          </p>
        </div>

        {documents.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No documents in this project</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="p-2">
              {documents.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => handleDocumentClick(doc)}
                  className={cn(
                    'w-full text-left p-2 rounded-md hover:bg-accent transition-colors',
                    'flex items-start gap-2 group'
                  )}
                >
                  <FileText className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {getDocumentDisplayName(doc)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-[10px] px-1.5 py-0',
                          getFileTypeColor(doc.fileType)
                        )}
                      >
                        {getFileTypeLabel(doc.fileType)}
                      </Badge>
                      {doc.source === 'session' && (
                        <span className="text-[10px] text-muted-foreground">
                          Session only
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedDocuments.includes(doc.id) && (
                    <Check className="h-3 w-3 text-primary mt-1" />
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
};
