import React, { memo } from 'react';
import {
  Box,
  VStack,
  Flex,
  Avatar,
  Text,
  useColorModeValue,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import { FiCpu, FiUser } from 'react-icons/fi';
import { fadeInUp } from '../styles/animations';
import { MessagesContainerProps, ChatMessage } from '../types';

// Message skeleton component for loading states
const MessageSkeleton = memo(() => {
  const assistantBg = useColorModeValue('bg.card', 'bg.card');
  const assistantBorderColor = useColorModeValue(
    'border.primary',
    'border.primary'
  );

  return (
    <Box animation={`${fadeInUp} 0.3s ease-out`}>
      <Flex align="flex-start" gap={3}>
        <Skeleton borderRadius="full" boxSize="32px" />
        <Box
          maxW="85%"
          bg={assistantBg}
          p={4}
          borderRadius="xl"
          border="1px solid"
          borderColor={assistantBorderColor}
          boxShadow="0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)"
        >
          <SkeletonText mt={0} noOfLines={3} spacing={2} skeletonHeight={2} />
        </Box>
      </Flex>
    </Box>
  );
});

MessageSkeleton.displayName = 'MessageSkeleton';

// Memoized single message component for better performance
const MessageItem = memo<{
  message: ChatMessage;
  index: number;
  groupInfo: any;
  isMessageStreaming: boolean;
  isAssistant: boolean;
  assistantBg: string;
  userBgGradient: string;
  assistantTextColor: string;
  userTextColor: string;
  assistantBorderColor: string;
  assistantAvatarBg: string;
  userAvatarBg: string;
  timestampColor: string;
  renderDualContent: (content: string, isStreaming: boolean, justCompleted?: boolean) => React.ReactNode;
}>(({
  message,
  index,
  groupInfo,
  isMessageStreaming,
  isAssistant,
  assistantBg,
  userBgGradient,
  assistantTextColor,
  userTextColor,
  assistantBorderColor,
  assistantAvatarBg,
  userAvatarBg,
  timestampColor,
  renderDualContent,
}) => {
  return (
    <Box
      key={`msg-${index}`}
      // Only animate non-streaming messages to reduce flickering
      animation={
        !isMessageStreaming
          ? `${fadeInUp} 0.3s ease-out`
          : undefined
      }
    >
      <Flex
        direction={isAssistant ? 'row' : 'row-reverse'}
        align="flex-start"
        gap={3}
        // Reduced spacing for grouped messages
        mb={groupInfo.isLastInGroup ? 0 : 1}
      >
        {/* Avatar - only show on last message in group */}
        {groupInfo.isLastInGroup ? (
          <Avatar
            size="sm"
            bg={isAssistant ? assistantAvatarBg : userAvatarBg}
            icon={isAssistant ? <FiCpu /> : <FiUser />}
            flexShrink={0}
            // Enhanced avatar shadow
            boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
          />
        ) : (
          // Placeholder for grouped messages to maintain alignment
          <Box w="32px" flexShrink={0} />
        )}

        <Box
          maxW="85%"
          bg={isAssistant ? assistantBg : undefined}
          bgGradient={!isAssistant ? userBgGradient : undefined}
          color={isAssistant ? assistantTextColor : userTextColor}
          px={4}
          py={3}
          borderRadius={
            // Dynamic border radius based on position in group
            isAssistant
              ? groupInfo.isSingleMessage
                ? 'xl'
                : groupInfo.isFirstInGroup
                  ? 'xl xl xl md'
                  : groupInfo.isLastInGroup
                    ? 'xl xl md xl'
                    : 'xl md md xl'
              : groupInfo.isSingleMessage
                ? '2xl'
                : groupInfo.isFirstInGroup
                  ? '2xl 2xl md 2xl'
                  : groupInfo.isLastInGroup
                    ? '2xl 2xl 2xl md'
                    : 'md 2xl 2xl md'
          }
          border="1px solid"
          borderColor={isAssistant ? assistantBorderColor : 'transparent'}
          // Remove transition from streaming messages to prevent flickering
          transition={
            !isMessageStreaming
              ? 'all 0.2s ease, box-shadow 0.15s ease'
              : 'none'
          }
          // Hardware acceleration for smooth rendering
          style={{
            willChange: isMessageStreaming ? 'contents' : 'auto',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
          }}
          position="relative"
          fontSize="sm"
        >
          {isAssistant ? (
            renderDualContent(message.content, isMessageStreaming)
          ) : (
            <Text
              lineHeight="1.6"
              fontSize="sm"
              fontWeight="500"
              letterSpacing="0.01em"
            >
              {message.content}
            </Text>
          )}

          {/* Timestamp - only show on last message in group and if not streaming */}
          {groupInfo.isLastInGroup && !isMessageStreaming && (
            <Text
              fontSize="xs"
              color={isAssistant ? timestampColor : 'whiteAlpha.800'}
              mt={3}
              textAlign={isAssistant ? 'left' : 'right'}
              opacity={0.8}
              fontWeight="500"
              letterSpacing="0.02em"
            >
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
        </Box>
      </Flex>
    </Box>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.role === nextProps.message.role &&
    prevProps.isMessageStreaming === nextProps.isMessageStreaming &&
    prevProps.groupInfo.isLastInGroup === nextProps.groupInfo.isLastInGroup &&
    prevProps.groupInfo.isFirstInGroup === nextProps.groupInfo.isFirstInGroup
  );
});

MessageItem.displayName = 'MessageItem';

export const MessagesContainer = memo(
  ({
    messages,
    isStreaming,
    markdownComponents,
    renderDualContent,
    assistantInfoColor,
    markdownTextColor,
  }: MessagesContainerProps) => {
    // Refined colors for nicer chat bubbles
    const assistantBg = useColorModeValue('gray.100', 'gray.700');
    const assistantBorderColor = useColorModeValue('gray.300', 'gray.600');

    // Gradient background for user messages
    const userBgGradient = useColorModeValue(
      'linear(to-br, blue.500, blue.600)',
      'linear(to-br, blue.400, blue.500)'
    );

    const userBg = useColorModeValue('blue.500', 'blue.600');
    const timestampColor = useColorModeValue('text.tertiary', 'text.tertiary');
    const assistantAvatarBg = useColorModeValue('ipd.blue', 'ipd.blue');
    const userAvatarBg = useColorModeValue('orange.500', 'orange.600');

    // Enhanced text colors for better contrast
    const assistantTextColor = useColorModeValue('gray.800', 'gray.100');
    const userTextColor = 'white';

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
      const prevTime = previousMessage ? new Date(previousMessage.timestamp).getTime() : 0;
      const nextTime = nextMessage ? new Date(nextMessage.timestamp).getTime() : 0;

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
      <VStack spacing={4} align="stretch">
        {messages.map((message, index) => {
          const groupInfo = getMessageGroupInfo(message, index);
          // Check if this specific message is streaming
          const isMessageStreaming = (message as any).isStreaming === true;
          const isAssistant = message.role === 'assistant';
          // Generate a stable key based on role and position
          const timeValue = typeof message.timestamp === 'string'
            ? new Date(message.timestamp).getTime()
            : (message.timestamp as Date).getTime();
          const messageKey = `${message.role}-${index}-${timeValue}`;

          return (
            <MessageItem
              key={messageKey}
              message={message}
              index={index}
              groupInfo={groupInfo}
              isMessageStreaming={isMessageStreaming}
              isAssistant={isAssistant}
              assistantBg={assistantBg}
              userBgGradient={userBgGradient}
              assistantTextColor={assistantTextColor}
              userTextColor={userTextColor}
              assistantBorderColor={assistantBorderColor}
              assistantAvatarBg={assistantAvatarBg}
              userAvatarBg={userAvatarBg}
              timestampColor={timestampColor}
              renderDualContent={renderDualContent}
            />
          );
        })}
      </VStack>
    );
  }
);

MessagesContainer.displayName = 'MessagesContainer';

export { MessageSkeleton };
