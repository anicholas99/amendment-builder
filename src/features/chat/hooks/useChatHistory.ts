import { useToast } from '@/hooks/useToastWrapper';
import {
  useChatHistoryQuery,
  useClearChatHistoryMutation,
  useSendChatMessageMutation,
} from '@/hooks/api/useChat';
import { ChatMessage, PageContext, ProjectData } from '../types';
import { getInitialMessage } from '../utils/chatHelpers';

export const useChatHistory = (
  projectId: string,
  pageContext: PageContext,
  projectData: ProjectData | null
) => {
  const toast = useToast();

  // Use the new centralized query hook
  const { data, isLoading: loadingHistory } = useChatHistoryQuery(
    projectId,
    pageContext,
    projectData
  );

  // Use the new centralized mutation hooks
  const clearChatMutation = useClearChatHistoryMutation(
    projectId,
    pageContext,
    projectData
  );

  const sendMessageMutation = useSendChatMessageMutation(
    projectId,
    pageContext
  );

  // Handle clear chat
  const handleClearChat = () => {
    clearChatMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: '🗑️ Chat cleared',
          status: 'success',
          duration: 2000,
          isClosable: true,
          position: 'bottom-right',
        });
      },
    });
  };

  // Extract messages from the wrapped format
  let messages: ChatMessage[] = [];
  if (data?.messages && data.messages.length > 0) {
    messages = data.messages.map(m => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
      timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
    }));
  } else if (!loadingHistory) {
    // If no messages and not loading, show initial message
    const initialMessage = getInitialMessage(pageContext, projectData);
    messages = [
      {
        role: 'assistant',
        content: initialMessage,
        timestamp: new Date(),
      },
    ];
  }

  return {
    messages,
    loadingHistory,
    clearChat: handleClearChat,
    sendMessage: sendMessageMutation,
    isAssistantTyping: sendMessageMutation.isPending,
  };
};
