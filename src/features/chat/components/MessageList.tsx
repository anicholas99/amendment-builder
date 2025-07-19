import React, { memo, forwardRef } from 'react';
import { Bot, User, Loader2 } from 'lucide-react';

// Import shadcn/ui components
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Import animations
import { MessagesContainerProps, ChatMessage } from '../types';

// Message skeleton component for loading states
const MessageSkeleton = memo(() => {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading messages...</p>
      </div>
    </div>
  );
});

MessageSkeleton.displayName = 'MessageSkeleton';

// Memoized single message component for better performance
const MessageItem = forwardRef<
  HTMLDivElement,
  {
    message: ChatMessage;
    index: number;
    groupInfo: any;
    isMessageStreaming: boolean;
    isAssistant: boolean;
    renderDualContent: (
      content: string,
      isStreaming: boolean,
      justCompleted?: boolean
    ) => React.ReactNode;
  }
>(
  (
    {
      message,
      index,
      groupInfo,
      isMessageStreaming,
      isAssistant,
      renderDualContent,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        key={`msg-${index}`}
        data-message-index={index}
        data-role={message.role}
        className={cn('group', !isMessageStreaming && 'animate-fade-in')}
      >
        <div
          className={cn(
            'flex items-start gap-3 md:gap-3.5',
            isAssistant ? 'flex-row' : 'flex-row-reverse',
            groupInfo.isLastInGroup ? 'mb-0' : 'mb-2'
          )}
        >
          {/* Avatar - only show on last message in group */}
          {groupInfo.isLastInGroup ? (
            <Avatar
              className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0"
              style={{
                backgroundColor: isAssistant ? '#3b82f6' : '#10b981',
              }}
            >
              <AvatarFallback className="bg-transparent text-white text-xs md:text-sm">
                {isAssistant ? (
                  <Bot className="w-3 h-3 md:w-4 md:h-4" />
                ) : (
                  <User className="w-3 h-3 md:w-4 md:h-4" />
                )}
              </AvatarFallback>
            </Avatar>
          ) : (
            // Placeholder for grouped messages to maintain alignment
            <div className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0" />
          )}

          <div
            className={cn(
              'flex-1 min-w-0 px-3 md:px-4 py-2.5 md:py-3 text-sm max-w-[calc(100%-3rem)]',
              // Background and colors
              isAssistant
                ? 'bg-muted text-foreground border border-border/50'
                : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
              // Border radius based on message grouping
              groupInfo.isSingleMessage
                ? 'rounded-2xl'
                : groupInfo.isFirstInGroup
                  ? 'rounded-2xl'
                  : groupInfo.isLastInGroup
                    ? 'rounded-2xl'
                    : 'rounded-lg',
              // Shadows
              isAssistant ? 'shadow-sm' : 'shadow-md',
              // Transitions
              !isMessageStreaming && 'transition-all duration-200',
              // Hardware acceleration for smooth rendering
              isMessageStreaming && 'will-change-contents'
            )}
          >
            {isAssistant ? (
              // Show thinking animation for empty streaming messages
              isMessageStreaming && !message.content ? (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-pulse [animation-delay:0.4s]" />
                  </div>
                </div>
              ) : (
                renderDualContent(message.content, isMessageStreaming)
              )
            ) : (
              <p className="leading-relaxed font-medium tracking-wide">
                {message.content}
              </p>
            )}

            {/* Timestamp - only show on last message in group and if not streaming */}
            {groupInfo.isLastInGroup && !isMessageStreaming && (
              <p
                className={cn(
                  'text-xs mt-2 opacity-70 font-normal tracking-wide',
                  isAssistant
                    ? 'text-left text-muted-foreground'
                    : 'text-right text-white/80'
                )}
              >
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

const MemoizedMessageItem = memo(MessageItem, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.role === nextProps.message.role &&
    prevProps.isMessageStreaming === nextProps.isMessageStreaming &&
    prevProps.groupInfo.isLastInGroup === nextProps.groupInfo.isLastInGroup &&
    prevProps.groupInfo.isFirstInGroup === nextProps.groupInfo.isFirstInGroup
  );
});

MemoizedMessageItem.displayName = 'MessageItem';

export const MessagesContainer = memo(
  ({
    messages,
    isStreaming,
    markdownComponents,
    renderDualContent,
    assistantInfoColor,
    markdownTextColor,
    lastAssistantRef,
  }: MessagesContainerProps) => {
    // Message grouping logic
    const getMessageGroupInfo = (
      currentMessage: ChatMessage,
      index: number
    ) => {
      const previousMessage = messages[index - 1];
      const nextMessage = messages[index + 1];

      // Time window for grouping (5 minutes)
      const GROUP_TIME_WINDOW = 5 * 60 * 1000;

      const currentTime = new Date(currentMessage.timestamp).getTime();
      const prevTime = previousMessage
        ? new Date(previousMessage.timestamp).getTime()
        : 0;
      const nextTime = nextMessage
        ? new Date(nextMessage.timestamp).getTime()
        : 0;

      const isGroupedWithPrevious =
        previousMessage &&
        previousMessage.role === currentMessage.role &&
        currentTime - prevTime < GROUP_TIME_WINDOW;

      // Check if current message should be grouped with next
      const isGroupedWithNext =
        nextMessage &&
        nextMessage.role === currentMessage.role &&
        nextTime - currentTime < GROUP_TIME_WINDOW;

      return {
        isGroupedWithPrevious,
        isGroupedWithNext,
        isFirstInGroup: !isGroupedWithPrevious,
        isLastInGroup: !isGroupedWithNext,
        isMiddleInGroup: isGroupedWithPrevious && isGroupedWithNext,
        isSingleMessage: !isGroupedWithPrevious && !isGroupedWithNext,
      };
    };

    return (
      <div className="space-y-2.5 md:space-y-3">
        {messages.map((message, index) => {
          const groupInfo = getMessageGroupInfo(message, index);
          // Check if this specific message is streaming
          const isMessageStreaming = (message as any).isStreaming === true;
          const isAssistant = message.role === 'assistant';
          // Generate a stable key based on role and position
          const timeValue =
            typeof message.timestamp === 'string'
              ? new Date(message.timestamp).getTime()
              : (message.timestamp as Date).getTime();
          const messageKey = `${message.role}-${index}-${timeValue}`;

          // Check if this is the last assistant message
          const isLastAssistantMessage =
            isAssistant && index === messages.length - 1;

          return (
            <MemoizedMessageItem
              ref={isLastAssistantMessage ? lastAssistantRef : undefined}
              key={messageKey}
              message={message}
              index={index}
              groupInfo={groupInfo}
              isMessageStreaming={isMessageStreaming}
              isAssistant={isAssistant}
              renderDualContent={renderDualContent}
            />
          );
        })}
      </div>
    );
  }
);

MessagesContainer.displayName = 'MessagesContainer';

export { MessageSkeleton };
