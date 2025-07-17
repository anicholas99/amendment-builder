import React, {
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from 'react';
import { ChevronDown } from 'lucide-react';

// Import shadcn/ui components
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Import types
import { ChatInterfaceProps } from '../types';

// Import components
import { ChatInput } from './ChatInput';
import { MessagesContainer } from './MessageList';
import { ClaimReferenceLink } from './ClaimReferenceLink';
import { MemoizedMarkdownRenderer } from './MemoizedMarkdownRenderer';
import { LoadingState } from '@/components/common/LoadingState';
import { UploadedDocuments } from './UploadedDocuments';

// Import hooks
import { useChatHistory } from '../hooks/useChatHistory';
import { useChatStream } from '../hooks/useChatStream';
import { useMarkdownConfig } from '../hooks/useMarkdownConfig';
import { useTimeout } from '@/hooks/useTimeout';
import { useUploadPatentFile } from '@/hooks/api/useUploadPatentFile';
import { useToast } from '@/hooks/useToastWrapper';
import { useSessionDocuments } from '@/hooks/api/useSessionDocuments';
import { useLinkedDocuments } from '@/hooks/api/useLinkedDocuments';

// Import utilities
import { getAssistantInfo } from '../utils/chatHelpers';

import { logger } from '@/utils/clientLogger';

// Add instance counter outside component
let chatInstanceCounter = 0;

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  projectData,
  onContentUpdate,
  setPreviousContent: _setPreviousContent,
  pageContext = 'technology',
  projectId,
}) => {
  // Create unique instance ID
  const _instanceId = useRef(++chatInstanceCounter);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastAssistantRef = useRef<HTMLDivElement>(null);

  // Scroll state management
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [shouldScrollUserMessage, setShouldScrollUserMessage] = useState(false);
  const lastMessageCountRef = useRef(0);

  // File upload integration
  const uploadPatentFile = useUploadPatentFile();
  const toast = useToast();
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(
    null
  );

  // Get assistant info based on page context
  const assistantInfo = useMemo(
    () => getAssistantInfo(pageContext),
    [pageContext]
  );

  // Create stable session ID for this chat instance
  const chatSessionId = useRef(
    `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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

  // Use custom hooks
  const { messages, loadingHistory, sendMessage, isAssistantTyping } =
    useChatHistory(projectId, pageContext, projectData);

  const { handleSendMessage, cleanup } = useChatStream({
    projectId,
    projectData,
    pageContext,
    onContentUpdate,
    sendMessage,
    messages,
    sessionId: chatSessionId.current,
  });

  // isStreaming is always false now
  const isStreaming = false;

  // Get markdown components
  const MarkdownComponents = useMarkdownConfig(pageContext);

  // Ref for the messages container to control scrolling
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Track if this is the initial load to avoid smooth scrolling animation
  const isInitialLoad = useRef(true);

  // Handle file upload for chat context
  const handleFileSelect = useCallback(
    async (file: File) => {
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
        const result = await uploadPatentFile.mutateAsync({
          projectId,
          file,
          linkToProject: false, // Session-only by default for chat
          fileType: 'uploaded-doc',
          sessionId: chatSessionId.current, // Use stable session ID
        });

        // Refetch documents to show the new one
        await refetchDocuments();

        // Notify user that file is available for chat
        toast.success({
          title: 'Document ready',
          description: `"${file.name}" is now available in this chat session`,
        });

        // Send a message to acknowledge the upload
        handleSendMessage(
          `I've uploaded "${file.name}" for reference. You can now ask me questions about it.`,
          [],
          null
        );
      } catch (error) {
        toast.error({
          title: 'Upload failed',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to upload document',
        });
      } finally {
        setUploadingFileName(null);
      }
    },
    [projectId, uploadPatentFile, toast, handleSendMessage, refetchDocuments]
  );

  // Handle document click - send a message asking about it
  const handleDocumentClick = useCallback(
    (doc: { title: string; patentNumber: string }) => {
      const documentName = doc.title || doc.patentNumber;
      handleSendMessage(`Tell me about "${documentName}"`, [], null);
    },
    [handleSendMessage]
  );

  // Initialize the ref with actual message count after messages is available
  useEffect(() => {
    if (lastMessageCountRef.current === 0 && messages.length > 0) {
      lastMessageCountRef.current = messages.length;
    }
  }, [messages.length]);

  // Check if user is at bottom of chat
  const checkIfAtBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const threshold = 10; // consider within 10px of the bottom as "at bottom"
      const isAtBottomNow =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        threshold;
      setIsAtBottom(isAtBottomNow);
    }
  }, []);

  // Modified scroll to bottom function
  const scrollToBottom = useCallback((smooth = true) => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant',
      });
      setIsAtBottom(true);
    }
  }, []);

  // Ensure the chat view scrolls to the bottom immediately after a user message
  const handleSendMessageWrapper = useCallback(
    (content: string) => {
      // Mark that we need to position the just-sent user message
      setShouldScrollUserMessage(true);

      // Send the message (synchronous state update in our hook)
      handleSendMessage(content, [], null);
    },
    [handleSendMessage]
  );

  // Watch for new user message and scroll it up
  useEffect(() => {
    // Check if we have a new message and we're expecting to scroll
    if (
      messages.length > lastMessageCountRef.current &&
      shouldScrollUserMessage
    ) {
      const container = messagesContainerRef.current;
      if (!container) return;

      // Use requestAnimationFrame to ensure DOM has painted
      requestAnimationFrame(() => {
        const messageElements = Array.from(
          container.querySelectorAll('[data-message-index]')
        ) as HTMLElement[];
        // Find the most recent user message element by traversing from the end
        const userMessageElement = [...messageElements]
          .reverse()
          .find(el => el.getAttribute('data-role') === 'user');

        if (userMessageElement) {
          // Reset flag first
          setShouldScrollUserMessage(false);

          // Calculate position to scroll message near the top
          const containerRect = container.getBoundingClientRect();
          const elementRect = userMessageElement.getBoundingClientRect();
          const currentScrollTop = container.scrollTop;
          const elementOffsetFromContainerTop =
            elementRect.top - containerRect.top;
          const targetScrollTop =
            currentScrollTop + elementOffsetFromContainerTop - 20; // 20px from top for padding

          logger.debug('[ChatInterface] Scrolling user message up', {
            targetScrollTop,
            currentScrollTop,
          });

          container.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'smooth',
          });

          // Update isAtBottom state after scroll
          // We'll use useTimeout after setting up the state
          requestAnimationFrame(() => {
            // Set a flag to run the timeout
            setShouldCheckBottom(true);
          });
        }
      });
    }

    lastMessageCountRef.current = messages.length;
  }, [messages, shouldScrollUserMessage, checkIfAtBottom]);

  // Add state for timeout-based bottom check
  const [shouldCheckBottom, setShouldCheckBottom] = useState(false);

  // Use useTimeout for delayed bottom check
  useTimeout(
    () => {
      if (shouldCheckBottom) {
        checkIfAtBottom();
        setShouldCheckBottom(false);
      }
    },
    shouldCheckBottom ? 300 : null
  );

  // ChatGPT-style scrolling for assistant messages
  useEffect(() => {
    if (messages.length === 0 || shouldScrollUserMessage) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'assistant' && isAtBottom) {
      // Use setTimeout directly instead of storing function in state
      // eslint-disable-next-line no-restricted-globals
      const scrollTimer = setTimeout(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        // Find all assistant message elements
        const messageElements = container.querySelectorAll(
          '[data-role="assistant"]'
        );
        const lastAssistantElement = messageElements[
          messageElements.length - 1
        ] as HTMLElement;

        if (lastAssistantElement) {
          // Calculate the position of the assistant message relative to the container
          const containerRect = container.getBoundingClientRect();
          const elementRect = lastAssistantElement.getBoundingClientRect();

          // Calculate how much to scroll to put the message at the top of the container
          const currentScrollTop = container.scrollTop;
          const elementOffsetFromContainerTop =
            elementRect.top - containerRect.top;
          const targetScrollTop =
            currentScrollTop + elementOffsetFromContainerTop - 20; // 20px padding

          logger.debug('[ChatInterface] Scrolling assistant message', {
            currentScrollTop,
            elementOffsetFromContainerTop,
            targetScrollTop,
          });

          // Scroll only within the container
          container.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth',
          });
        }
      }, 200); // 200ms delay for DOM to update

      // Cleanup timer on unmount or when dependencies change
      return () => clearTimeout(scrollTimer);
    }
  }, [messages, shouldScrollUserMessage, isAtBottom]);

  // Simplified scroll to bottom when visible
  const scrollToBottomWhenVisible = useCallback(
    (forceInstant: boolean = false) => {
      // Don't auto-scroll if we're about to scroll a user message
      if (shouldScrollUserMessage) {
        return;
      }

      const container = messagesContainerRef.current;
      if (!container) return;

      const isVisible = container.offsetParent !== null;
      const hasHeight = container.scrollHeight > 0;

      if (isVisible && hasHeight) {
        scrollToBottom(!forceInstant);

        // Mark that initial load is complete
        if (isInitialLoad.current && !loadingHistory) {
          isInitialLoad.current = false;
        }
      }
    },
    [loadingHistory, scrollToBottom, shouldScrollUserMessage]
  );

  // Use MutationObserver to detect when the component becomes visible
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    // Add scroll event listener for scroll detection
    const handleScroll = () => {
      checkIfAtBottom();
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    // Create observer to watch for visibility changes
    const observer = new MutationObserver(() => {
      // DISABLED: Conflicting with ChatGPT-style scrolling
      // if (!shouldScrollUserMessage) {
      //   scrollToBottomWhenVisible(true);
      // }
    });

    // Start observing the parent element for style changes
    const parent = container.parentElement;
    if (parent) {
      observer.observe(parent, {
        attributes: true,
        attributeFilter: ['style', 'class'],
        subtree: true,
      });
    }

    return () => {
      container.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [scrollToBottomWhenVisible, checkIfAtBottom, shouldScrollUserMessage]);

  // --- Auto-scroll while streaming ------------------------------------------------
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    let prevHeight = container.scrollHeight;
    const ResizeObs = (window as any).ResizeObserver;
    if (!ResizeObs) {
      return;
    }

    const observer = new ResizeObs((entries: any[]) => {
      const entry = entries[0];
      const newHeight = entry.contentRect
        ? entry.contentRect.height
        : container.scrollHeight;
      if (newHeight !== prevHeight) {
        prevHeight = newHeight;
        // Only auto-scroll during streaming if user is at bottom and not handling user message
        // Removed unused isScrollable variable
        // DISABLED: Conflicting with ChatGPT-style scrolling
        // if (isAtBottom && container.scrollHeight > container.clientHeight && !shouldScrollUserMessage) {
        //   scrollToBottom(false);
        // }
      }
    });

    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, [isAtBottom, scrollToBottom, shouldScrollUserMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Memoized format patent claim text function - only format actual patent claims
  const formatPatentClaimMemo = useCallback(
    (text: string) => {
      // Only format text that is clearly a patent claim
      if (pageContext === 'claim-refinement' && /^Claim\s+\d+:\s*/.test(text)) {
        // Apply patent claim formatting only to actual claims
        return text.replace(/([;,])\s*/g, '$1\n');
      }
      // Return text unchanged for all other cases
      return text;
    },
    [pageContext]
  );

  // Process claim references before markdown
  const processClaimReferences = useCallback(
    (text: string): React.ReactNode[] => {
      const claimRefPattern = /\b(claim\s+(\d+))\b/gi;
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;
      let keyIndex = 0;

      while ((match = claimRefPattern.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          parts.push(
            <React.Fragment key={`text-${keyIndex++}`}>
              {text.slice(lastIndex, match.index)}
            </React.Fragment>
          );
        }

        // Add the claim reference link
        const claimNumber = parseInt(match[2]);
        parts.push(
          <ClaimReferenceLink
            key={`claim-${keyIndex++}`}
            claimNumber={claimNumber}
            projectId={projectId}
            onClick={num => {
              // Could navigate to claim editor or show in modal
              logger.info('[ChatInterface] Claim reference clicked', {
                claimNumber: num,
              });
            }}
          />
        );

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
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
          <p className="mb-2 leading-relaxed text-sm">{processedChildren}</p>
        );
      },
      text: ({ children }: any) => {
        if (typeof children === 'string') {
          return <>{processClaimReferences(children)}</>;
        }
        return children;
      },
      // Preserve the code handler from MarkdownComponents for Mermaid support
      code: MarkdownComponents.code,
    }),
    [MarkdownComponents, processClaimReferences]
  );

  // Memoized render dual content function
  const renderDualContent = useCallback(
    (
      content: string,
      isStreamingThisMessage: boolean,
      justCompleted?: boolean
    ) => {
      return (
        <MemoizedMarkdownRenderer
          content={content}
          isStreaming={isStreamingThisMessage}
          pageContext={pageContext}
          projectId={projectId}
          formatPatentClaim={formatPatentClaimMemo}
          MarkdownComponentsWithClaims={MarkdownComponentsWithClaims as any}
          justCompleted={justCompleted}
        />
      );
    },
    [
      pageContext,
      projectId,
      formatPatentClaimMemo,
      MarkdownComponentsWithClaims,
    ]
  );

  // Show loading state while chat is initializing
  if (loadingHistory) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingState
          variant="spinner"
          size="lg"
          message="Loading chat history..."
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Messages Container */}
      <ScrollArea className="flex-1 px-3 md:px-4 py-4">
        <div
          ref={messagesContainerRef}
          className="h-full overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
            msOverflowStyle: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div className="space-y-4">
            <MessagesContainer
              messages={messages}
              isStreaming={isStreaming}
              markdownComponents={MarkdownComponents}
              renderDualContent={renderDualContent}
              assistantInfoColor={assistantInfo.color}
              markdownTextColor="text-primary"
              lastAssistantRef={lastAssistantRef}
            />

            {/* Spacer to ensure there's always room to scroll messages up */}
            <div className="h-[60vh]" aria-hidden="true" />
          </div>

          {/* Scroll-to-bottom button */}
          {!isAtBottom && !loadingHistory && (
            <Button
              variant="secondary"
              size="icon"
              className={cn(
                'fixed bottom-4 right-4 w-8 h-8 rounded-full shadow-lg z-10',
                'hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200'
              )}
              onClick={() => scrollToBottom(true)}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Uploaded Documents */}
      <UploadedDocuments
        documents={allDocuments}
        isUploading={uploadPatentFile.isPending || !!uploadingFileName}
        uploadingFileName={uploadingFileName || undefined}
        onDocumentClick={handleDocumentClick}
      />

      {/* Input Container */}
      <ChatInput
        onSendMessage={handleSendMessageWrapper}
        isAssistantTyping={isAssistantTyping}
        assistantColor={assistantInfo.color}
        onFileSelect={handleFileSelect}
        isUploadingFile={uploadPatentFile.isPending}
      />
    </div>
  );
};

export default React.memo(ChatInterface, (prevProps, nextProps) => {
  // Custom comparison function for React.memo to prevent unnecessary re-renders

  // Check if projectId changed (most important)
  if (prevProps.projectId !== nextProps.projectId) {
    logger.debug('[ChatInterface] MEMO: projectId changed', {
      prev: prevProps.projectId,
      next: nextProps.projectId,
    });
    return false;
  }

  // Check if pageContext changed
  if (prevProps.pageContext !== nextProps.pageContext) {
    logger.debug('[ChatInterface] MEMO: pageContext changed');
    return false;
  }

  // Check if projectData changed (by ID, not by reference)
  if (prevProps.projectData?.id !== nextProps.projectData?.id) {
    logger.debug('[ChatInterface] MEMO: projectData.id changed');
    return false;
  }

  // For callbacks, we can't easily compare them, so we'll trust they're memoized properly
  // If this component is still re-rendering, the issue is with the callback dependencies

  logger.debug('[ChatInterface] MEMO: Props are equal, preventing re-render');
  return true; // Props are equal, prevent re-render
});
