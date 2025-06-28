import React, {
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from 'react';
import {
  Box,
  Flex,
  VStack,
  Spinner,
  Text,
  Avatar,
  useToast,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
// @ts-ignore
import remarkBreaks from 'remark-breaks';
import { FiCpu, FiChevronDown } from 'react-icons/fi';

// Import types
import { ChatInterfaceProps } from '../types';

// Import components
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { MessagesContainer } from './MessageList';
import { ThinkingAnimation } from './ThinkingAnimation';
import { ClaimRevisionDiff } from './ClaimRevisionDiff';
import { ClaimReferenceLink } from './ClaimReferenceLink';
import { MemoizedMarkdownRenderer } from './MemoizedMarkdownRenderer';

// Import hooks
import { useChatHistory } from '../hooks/useChatHistory';
import { useChatStream } from '../hooks/useChatStream';
import { useMarkdownConfig } from '../hooks/useMarkdownConfig';

// Import utilities
import { getAssistantInfo, formatPatentClaim } from '../utils/chatHelpers';

// Import animations (only keeping ones still in use)
import { fadeInUp, subtlePulse } from '../styles/animations';

import { logger } from '@/lib/monitoring/logger';

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
  const _toast = useToast();

  // Scroll state management
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Get assistant info based on page context
  const assistantInfo = useMemo(
    () => getAssistantInfo(pageContext),
    [pageContext]
  );

  // Use custom hooks
  const {
    messages,
    loadingHistory,
    clearChat,
    sendMessage,
    isAssistantTyping,
  } = useChatHistory(projectId, pageContext, projectData);

  const { handleSendMessage, cleanup } = useChatStream({
    projectId,
    projectData,
    pageContext,
    onContentUpdate,
    sendMessage,
    messages,
  });

  // isStreaming is always false now
  const isStreaming = false;

  // Get markdown components
  const MarkdownComponents = useMarkdownConfig(pageContext);

  // Ref for the messages container to control scrolling
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Track if this is the initial load to avoid smooth scrolling animation
  const isInitialLoad = useRef(true);
  const previousMessageCount = useRef(0);

  // Check if user is at bottom of chat
  const checkIfAtBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const threshold = 100; // pixels from bottom
      const isAtBottomNow =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        threshold;
      setIsAtBottom(isAtBottomNow);
    }
  }, []);

  // Scroll to bottom function
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

  // Scroll to bottom with retry mechanism for visibility
  const scrollToBottomWhenVisible = useCallback(
    (forceInstant: boolean = false) => {
      const attemptScroll = () => {
        if (messagesContainerRef.current) {
          const container = messagesContainerRef.current;
          const isVisible = container.offsetParent !== null;
          const hasHeight = container.scrollHeight > 0;

          if (isVisible && hasHeight) {
            // Use the new scroll function
            scrollToBottom(!forceInstant);

            // Update the previous message count
            previousMessageCount.current = messages.length;

            // Mark that initial load is complete
            if (isInitialLoad.current && !loadingHistory) {
              isInitialLoad.current = false;
            }

            return true;
          }
        }
        return false;
      };

      // Try immediately first
      if (attemptScroll()) return;

      // If not ready, retry with increasing delays
      let attempts = 0;
      const maxAttempts = 10;
      const retryScroll = () => {
        attempts++;

        if (attemptScroll()) {
          return;
        }

        if (attempts < maxAttempts) {
          setTimeout(retryScroll, attempts * 50); // 50ms, 100ms, 150ms, etc.
        } else {
          logger.debug('[ChatInterface] Gave up scrolling after max attempts');
        }
      };

      setTimeout(retryScroll, 50);
    },
    [messages.length, loadingHistory, scrollToBottom]
  );

  useEffect(() => {
    scrollToBottomWhenVisible();
  }, [messages.length, isAssistantTyping, scrollToBottomWhenVisible]);

  // Scroll to bottom when messages finish loading - force instant scroll
  useEffect(() => {
    if (!loadingHistory) {
      scrollToBottomWhenVisible(true); // Force instant scroll when loading completes
    }
  }, [loadingHistory, scrollToBottomWhenVisible]);

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
      scrollToBottomWhenVisible(true); // Force instant scroll when visibility changes
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

    // Initial scroll - force instant
    scrollToBottomWhenVisible(true);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [scrollToBottomWhenVisible, checkIfAtBottom]);

  // --- Auto-scroll while streaming ------------------------------------------------
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    let prevHeight = container.scrollHeight;
    const ResizeObs = (window as any).ResizeObserver;
    if (!ResizeObs) {
      return; // Older browsers – skip auto-scroll enhancement
    }

    const observer = new ResizeObs((entries: any[]) => {
      const entry = entries[0];
      const newHeight = entry.contentRect ? entry.contentRect.height : container.scrollHeight;
      if (newHeight !== prevHeight) {
        prevHeight = newHeight;
        // If user was already at bottom, keep them pinned to bottom
        if (isAtBottom) {
          scrollToBottom(false);
        }
      }
    });

    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, [isAtBottom, scrollToBottom]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Memoized format patent claim text function
  const formatPatentClaimMemo = useCallback((text: string) => {
    return text.replace(/([;,])\s*/g, '$1\n');
  }, []);

  // Process claim references before markdown
  const processClaimReferences = useCallback((text: string): React.ReactNode[] => {
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
          onClick={(num) => {
            // Could navigate to claim editor or show in modal
            logger.info('[ChatInterface] Claim reference clicked', { claimNumber: num });
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
  }, [projectId]);

  // Custom text component that processes claim references
  const MarkdownComponentsWithClaims = useMemo(() => ({
    ...MarkdownComponents,
    p: ({ children }: any) => {
      const processedChildren = React.Children.map(children, (child) => {
        if (typeof child === 'string') {
          return processClaimReferences(child);
        }
        return child;
      });

      return (
        <Text mb={4} lineHeight="1.7" fontSize="sm" whiteSpace="pre-wrap">
          {processedChildren}
        </Text>
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
  }), [MarkdownComponents, processClaimReferences]);

  // Memoized render dual content function
  const renderDualContent = useCallback(
    (content: string, isStreamingThisMessage: boolean, justCompleted?: boolean) => {
      return (
        <MemoizedMarkdownRenderer
          content={content}
          isStreaming={isStreamingThisMessage}
          pageContext={pageContext}
          projectId={projectId}
          formatPatentClaim={formatPatentClaimMemo}
          MarkdownComponentsWithClaims={MarkdownComponentsWithClaims as Components}
          justCompleted={justCompleted}
        />
      );
    },
    [pageContext, projectId, formatPatentClaimMemo, MarkdownComponentsWithClaims]
  );

  // Handle refresh
  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  // Handle send message wrapper
  const handleSendMessageWrapper = useCallback(
    (content: string) => {
      // The new handleSendMessage doesn't need messages or setMessages
      handleSendMessage(content, [], null);
    },
    [handleSendMessage]
  );

  return (
    <Box height="100%" display="flex" flexDirection="column" bg="bg.primary">
      {/* Header */}
      <ChatHeader
        assistantInfo={assistantInfo}
        onRefresh={handleRefresh}
        onClearChat={clearChat}
      />

      {/* Messages Container */}
      <Box
        ref={messagesContainerRef}
        flex="1"
        overflowY="auto"
        p={4}
        className="thin-scrollbar"
      >
        {loadingHistory ? (
          <Flex justify="center" align="center" height="100%">
            <Spinner size="lg" thickness="4px" color="blue.500" />
          </Flex>
        ) : (
          <VStack spacing={4} align="stretch">
            <MessagesContainer
              messages={messages}
              isStreaming={isStreaming}
              markdownComponents={MarkdownComponents}
              renderDualContent={renderDualContent}
              assistantInfoColor={assistantInfo.color}
              markdownTextColor="text.primary"
            />

            {/* Enhanced thinking indicator with smooth transitions */}
            {isAssistantTyping && !messages.some((m: any) => m.isStreaming) && (
              <Box
                animation={`${fadeInUp} 0.3s ease-out`}
                style={{
                  willChange: 'transform, opacity',
                  backfaceVisibility: 'hidden',
                }}
              >
                <Flex align="flex-start" gap={3}>
                  <Avatar
                    size="sm"
                    bg="blue.500"
                    icon={<FiCpu />}
                    flexShrink={0}
                  />
                  <Box
                    bg="bg.card"
                    p={4}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="border.primary"
                    animation={`${subtlePulse} 2s ease-in-out infinite`}
                    maxW="85%"
                    style={{
                      willChange: 'opacity',
                      backfaceVisibility: 'hidden',
                      transform: 'translateZ(0)',
                    }}
                  >
                    <ThinkingAnimation color={assistantInfo.color} />
                  </Box>
                </Flex>
              </Box>
            )}
          </VStack>
        )}

        {/* Scroll-to-bottom button */}
        {!isAtBottom && !loadingHistory && (
          <IconButton
            aria-label="Scroll to bottom"
            icon={<FiChevronDown />}
            position="absolute"
            bottom={4}
            right={4}
            size="sm"
            borderRadius="full"
            bg={useColorModeValue('white', 'gray.700')}
            color={useColorModeValue('gray.600', 'gray.300')}
            _hover={{
              bg: useColorModeValue('gray.100', 'gray.600'),
              transform: 'translateY(-2px)',
            }}
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.15)"
            transition="all 0.2s ease"
            onClick={() => scrollToBottom(true)}
            zIndex={2}
          />
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Container */}
      <ChatInput
        onSendMessage={handleSendMessageWrapper}
        isAssistantTyping={isAssistantTyping}
        assistantColor={assistantInfo.color}
      />
    </Box>
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
