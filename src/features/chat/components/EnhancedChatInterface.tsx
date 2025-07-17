import React, { useRef, useMemo, useCallback, memo, useState } from 'react';

// Import shadcn/ui chat components
import {
  ChatBubble,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
  ChatMessageList,
  ChatMessageListItem,
  ChatInput as EnhancedChatInput,
  ExpandableChat,
  ExpandableChatBody,
  ExpandableChatFooter,
} from '@/components/ui/chat';

// Import existing components
import { LoadingState } from '@/components/common/LoadingState';
import { MemoizedMarkdownRenderer } from './MemoizedMarkdownRenderer';
import { ClaimReferenceLink } from './ClaimReferenceLink';

// Import tool invocation components
import {
  ToolInvocationGroup,
  ToolInvocationNotification,
} from './ToolInvocationGroup';
import { ToolDisplayMode } from './ToolDisplayPreferences';
import { SubtleToolDisplay, ToolStatusDot } from './SubtleToolDisplay';
import { hasToolInvocations } from '../types/tool-invocation';

// Import hooks
import {
  useChatHistoryQuery,
  useSendChatMessageMutation,
} from '@/hooks/api/useChat';
import { useMarkdownConfig } from '../hooks/useMarkdownConfig';
import { useUploadPatentFile } from '@/hooks/api/useUploadPatentFile';
import { useSessionDocuments } from '@/hooks/api/useSessionDocuments';
import { useLinkedDocuments } from '@/hooks/api/useLinkedDocuments';
import { useToast } from '@/hooks/useToastWrapper';

// Import utilities
import { getAssistantInfo, getInitialMessage } from '../utils/chatHelpers';
import { logger } from '@/utils/clientLogger';
import { cn } from '@/lib/utils';

// Import types
import { ChatInterfaceProps } from '../types';

// Import streaming components
import { StreamingMessage, TypingIndicator } from './StreamingMessage';

// Additional imports for document handling
import { Button } from '@/components/ui/button';
import { Paperclip, X } from 'lucide-react';
import { HStack } from '@/components/ui/stack';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { ChatInputWithDocuments } from './ChatInputWithDocuments';

// Props interface for MessageRenderer
interface MessageRendererProps {
  message: any;
  index: number;
  pageContext: string;
  projectId: string;
  formatPatentClaimMemo: (text: string) => string;
  MarkdownComponentsWithClaims: any;
  processClaimReferences: (text: string) => React.ReactNode[];
  toolDisplayMode: ToolDisplayMode;
}

// MessageRenderer component to ensure stable hook order
const MessageRenderer = memo<MessageRendererProps>(
  ({
    message,
    index,
    pageContext,
    projectId,
    formatPatentClaimMemo,
    MarkdownComponentsWithClaims,
    processClaimReferences,
    toolDisplayMode,
  }) => {
    const isUser = message.role === 'user';
    const isTool = message.role === 'tool';
    const isStreaming = message.isStreaming === true;

    // Render tool invocations based on display mode
    const renderToolInvocations = () => {
      if (!isTool || !message.toolInvocations || toolDisplayMode === 'hidden') {
        return null;
      }

      switch (toolDisplayMode) {
        case 'full':
          return (
            <div className="w-full px-4 py-2">
              <ToolInvocationGroup
                invocations={message.toolInvocations}
                isCompact={false}
              />
            </div>
          );
        case 'compact':
          return (
            <div className="w-full px-3 py-2">
              <ToolInvocationGroup
                invocations={message.toolInvocations}
                isCompact={true}
              />
            </div>
          );
        case 'inline':
          return (
            <div className="w-full px-2 py-1">
              <ToolInvocationGroup
                invocations={message.toolInvocations}
                isInline={true}
              />
            </div>
          );
        case 'notification':
          return (
            <div className="w-full px-4 py-2">
              <SubtleToolDisplay invocations={message.toolInvocations} />
            </div>
          );
        case 'minimal':
          return (
            <div className="w-full px-4 py-1">
              <ToolInvocationNotification
                invocations={message.toolInvocations}
              />
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <ChatMessageListItem animate={false}>
        {/* Render tool invocations based on mode */}
        {renderToolInvocations() || (
          <ChatBubble
            variant={isUser ? 'user' : 'assistant'}
            side={isUser ? 'right' : 'left'}
            isTyping={isStreaming && !message.content}
            className={cn(
              // Use a single smooth transition instead of conflicting animations
              'transition-all duration-300 ease-out',
              isStreaming && 'opacity-90',
              !isStreaming && 'opacity-100',
              // Remove conflicting animations - let the bubble handle its own animation
              !isStreaming && 'animate-in fade-in-0 duration-300'
            )}
          >
            {(message.content || (isStreaming && !isUser)) && (
              <ChatBubbleMessage isLoading={false}>
                {isUser ? (
                  <p className="leading-relaxed text-sm text-current">
                    {message.content}
                  </p>
                ) : isStreaming && !message.content ? (
                  <TypingIndicator />
                ) : (
                  <div
                    className={cn(
                      'transition-opacity duration-300 ease-out',
                      isStreaming ? 'opacity-90' : 'opacity-100'
                    )}
                  >
                    <MemoizedMarkdownRenderer
                      content={message.content || ''}
                      isStreaming={isStreaming}
                      pageContext={pageContext}
                      projectId={projectId}
                      formatPatentClaim={formatPatentClaimMemo}
                      MarkdownComponentsWithClaims={
                        MarkdownComponentsWithClaims as any
                      }
                      justCompleted={false}
                    />
                  </div>
                )}
              </ChatBubbleMessage>
            )}

            {!isStreaming && (
              <ChatBubbleTimestamp>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </ChatBubbleTimestamp>
            )}
          </ChatBubble>
        )}
      </ChatMessageListItem>
    );
  }
);

MessageRenderer.displayName = 'MessageRenderer';

const EnhancedChatInterface: React.FC<ChatInterfaceProps> = ({
  projectData,
  onContentUpdate,
  setPreviousContent: _setPreviousContent,
  pageContext = 'technology',
  projectId,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create stable session ID for this chat instance
  const chatSessionId = useRef(
    `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );

  // File upload integration
  const uploadPatentFile = useUploadPatentFile();
  const toast = useToast();
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(
    null
  );

  // Track pending attachments for the current message
  const [pendingAttachments, setPendingAttachments] = useState<string[]>([]);

  // Tool display preferences
  const [toolDisplayMode, setToolDisplayMode] =
    useState<ToolDisplayMode>('compact');

  // Get assistant info based on page context
  const assistantInfo = useMemo(
    () => getAssistantInfo(pageContext),
    [pageContext]
  );

  // Fetch documents for this session
  const { data: sessionDocuments = [], refetch: refetchDocuments } =
    useSessionDocuments(projectId, chatSessionId.current);

  // Fetch linked documents
  const { data: linkedDocuments = [] } = useLinkedDocuments(projectId);

  // Combine all available documents
  const allDocuments = useMemo(() => {
    const docsMap = new Map();

    // Add linked documents first (they persist across sessions)
    linkedDocuments.forEach(doc =>
      docsMap.set(doc.id, { ...doc, source: 'linked' })
    );

    // Add session documents (may override linked ones if same ID)
    sessionDocuments.forEach(doc =>
      docsMap.set(doc.id, { ...doc, source: 'session' })
    );

    return Array.from(docsMap.values());
  }, [sessionDocuments, linkedDocuments]);

  // Use chat query and mutation hooks
  const { data: chatData, isLoading: loadingHistory } = useChatHistoryQuery(
    projectId,
    pageContext,
    projectData
  );

  const sendMessageMutation = useSendChatMessageMutation(
    projectId,
    pageContext
  );

  // Get messages with initial message if empty
  const messages = useMemo(() => {
    if (!chatData?.messages || chatData.messages.length === 0) {
      const initialMessage = getInitialMessage(pageContext, projectData);
      return [
        {
          id: 'initial-message',
          role: 'assistant' as const,
          content: initialMessage,
          timestamp: new Date().toISOString(),
        },
      ];
    }
    return chatData.messages;
  }, [chatData?.messages, pageContext, projectData]);

  const isAssistantTyping = sendMessageMutation.isPending;

  // Get markdown components
  const MarkdownComponents = useMarkdownConfig(pageContext);

  // Process claim references before markdown
  const processClaimReferences = useCallback(
    (text: string): React.ReactNode[] => {
      const claimRefPattern = /\b(claim\s+(\d+))\b/gi;
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;
      let keyIndex = 0;

      while ((match = claimRefPattern.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(
            <React.Fragment key={`text-${keyIndex++}`}>
              {text.slice(lastIndex, match.index)}
            </React.Fragment>
          );
        }

        const claimNumber = parseInt(match[2]);
        parts.push(
          <ClaimReferenceLink
            key={`claim-${keyIndex++}`}
            claimNumber={claimNumber}
            projectId={projectId}
            onClick={num => {
              logger.info('[EnhancedChatInterface] Claim reference clicked', {
                claimNumber: num,
              });
            }}
          />
        );

        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < text.length) {
        parts.push(
          <React.Fragment key={`text-${keyIndex++}`}>
            {text.slice(lastIndex)}
          </React.Fragment>
        );
      }

      return parts.length > 0 ? parts : [text];
    },
    [projectId]
  );

  // Custom text component that processes claim references
  const MarkdownComponentsWithClaims = useMemo(
    () => ({
      ...MarkdownComponents,
      p: ({ children }: any) => {
        const processedChildren = React.Children.map(children, child => {
          if (typeof child === 'string') {
            return processClaimReferences(child);
          }
          return child;
        });

        return (
          <p className="mb-2 leading-relaxed text-sm text-current">
            {processedChildren}
          </p>
        );
      },
      text: ({ children }: any) => {
        if (typeof children === 'string') {
          return <>{processClaimReferences(children)}</>;
        }
        return children;
      },
      code: MarkdownComponents.code,
    }),
    [MarkdownComponents, processClaimReferences]
  );

  // Memoized format patent claim text function
  const formatPatentClaimMemo = useCallback(
    (text: string) => {
      if (pageContext === 'claim-refinement' && /^Claim\s+\d+:\s*/.test(text)) {
        return text.replace(/([;,])\s*/g, '$1\n');
      }
      return text;
    },
    [pageContext]
  );

  // Handle send message
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      try {
        // Include pending attachments in the message metadata
        const messageData = {
          content,
          sessionId: chatSessionId.current,
          attachedDocumentIds:
            pendingAttachments.length > 0 ? pendingAttachments : undefined,
        };

        await sendMessageMutation.mutateAsync(messageData);

        // Clear pending attachments after sending
        setPendingAttachments([]);

        // Patent section updates are now handled directly in the chat mutation
        // via cache invalidation, so no additional refresh needed here
      } catch (error) {
        logger.error('[EnhancedChatInterface] Error sending message:', error);
      }
    },
    [sendMessageMutation, messages, onContentUpdate, pendingAttachments]
  );

  // Handle file upload for chat context
  const handleFileSelect = useCallback(
    async (file: File) => {
      logger.info('[EnhancedChatInterface] File selected', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        projectId,
      });

      if (!projectId) {
        toast.error({
          title: 'No project selected',
          description: 'Please select a project before uploading files',
        });
        return;
      }

      // Set uploading state
      setUploadingFileName(file.name);

      try {
        logger.info('[EnhancedChatInterface] Starting upload', {
          projectId,
          sessionId: chatSessionId.current,
        });

        const result = await uploadPatentFile.mutateAsync({
          projectId,
          file,
          linkToProject: false, // Session-only by default for chat
          fileType: 'uploaded-doc',
          sessionId: chatSessionId.current, // Use stable session ID
        });

        logger.info('[EnhancedChatInterface] Upload successful', {
          result,
        });

        // Refetch documents to show the new one
        await refetchDocuments();

        // Add the uploaded document to pending attachments
        if (result.file?.id) {
          setPendingAttachments(prev => [...prev, result.file.id]);
        }

        // Notify user that file is ready to be sent with their message
        toast.success({
          title: 'Document ready',
          description: `"${file.name}" is attached. Type your message and click send.`,
        });

        // Clear uploading state
        setUploadingFileName(null);
      } catch (error: any) {
        logger.error('[EnhancedChatInterface] Upload failed', {
          error,
          message: error.message,
          stack: error.stack,
        });

        toast.error({
          title: 'Upload failed',
          description: error.message || 'Failed to upload document',
        });
        setUploadingFileName(null);
      }
    },
    [projectId, uploadPatentFile, refetchDocuments, toast]
  );

  // Handle removing a pending attachment
  const handleRemovePendingAttachment = useCallback((docId: string) => {
    setPendingAttachments(prev => prev.filter(id => id !== docId));
  }, []);

  // Get documents that are pending attachments
  const pendingAttachmentDocs = useMemo(() => {
    return allDocuments.filter(doc => pendingAttachments.includes(doc.id));
  }, [allDocuments, pendingAttachments]);

  return (
    <ExpandableChat size="full" position="center" className="h-full">
      <ExpandableChatBody className="overflow-hidden">
        <ChatMessageList
          isLoading={loadingHistory}
          loadingText="Loading chat history..."
          messagesEndRef={messagesEndRef}
          className="h-full"
        >
          {messages.map((message, index) => (
            <MessageRenderer
              key={
                message.id || `${message.role}-${index}-${message.timestamp}`
              }
              message={message}
              index={index}
              pageContext={pageContext}
              projectId={projectId}
              formatPatentClaimMemo={formatPatentClaimMemo}
              MarkdownComponentsWithClaims={MarkdownComponentsWithClaims}
              processClaimReferences={processClaimReferences}
              toolDisplayMode={toolDisplayMode}
            />
          ))}
          <div ref={messagesEndRef} />
        </ChatMessageList>
      </ExpandableChatBody>

      <ExpandableChatFooter className="flex-shrink-0">
        {/* Pending Attachments */}
        {pendingAttachmentDocs.length > 0 && (
          <Box className="px-4 py-2 bg-primary/5 border-t border-border">
            <HStack className="gap-2 items-center mb-1">
              <Paperclip className="h-3 w-3 text-primary" />
              <Text className="text-xs font-medium text-primary">
                Attached to message:
              </Text>
            </HStack>
            <div className="flex flex-wrap gap-1">
              {pendingAttachmentDocs.map(doc => (
                <Badge
                  key={doc.id}
                  variant="secondary"
                  className="text-xs pr-1"
                >
                  {doc.title || doc.patentNumber}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-4 w-4 ml-1 hover:bg-transparent"
                    onClick={() => handleRemovePendingAttachment(doc.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </Box>
        )}

        <ChatInputWithDocuments
          documents={allDocuments}
          onSendMessage={handleSendMessage}
        >
          <EnhancedChatInput
            placeholder={`Ask me about your ${pageContext === 'technology' ? 'technology details' : 'patent application'}...`}
            onSendMessage={handleSendMessage}
            disabled={isAssistantTyping}
            isLoading={isAssistantTyping}
            showFileUpload={true}
            showVoiceInput={false}
            maxLength={4000}
            onFileSelect={handleFileSelect}
          />
        </ChatInputWithDocuments>
      </ExpandableChatFooter>
    </ExpandableChat>
  );
};

export default EnhancedChatInterface;
