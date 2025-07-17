import React from 'react';
import { DocumentPopover } from './DocumentPopover';
import { HStack } from '@/components/ui/stack';
import { Box } from '@/components/ui/box';

interface Document {
  id: string;
  fileName?: string;
  originalName?: string;
  title?: string;
  patentNumber?: string;
  fileType?: string;
  source?: string;
}

interface ChatInputWithDocumentsProps {
  documents: Document[];
  children: React.ReactNode;
  onSendMessage: (message: string) => void;
}

export const ChatInputWithDocuments: React.FC<ChatInputWithDocumentsProps> = ({
  documents,
  children,
  onSendMessage,
}) => {
  return (
    <Box className="relative overflow-visible">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-50 flex items-center">
        <DocumentPopover
          documents={documents}
          selectedDocuments={[]}
          onDocumentToggle={() => {}}
          onSendMessage={onSendMessage}
        />
      </div>
      <div className="pl-14">{children}</div>
    </Box>
  );
};
