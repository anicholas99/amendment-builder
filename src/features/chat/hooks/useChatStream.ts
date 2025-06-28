import { useState, useCallback } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { ChatMessage, PageContext, ProjectData } from '../types';
import { useToast } from '@/ui/hooks/useToast';

interface UseChatStreamOptions {
  projectId: string;
  projectData: ProjectData | null;
  pageContext: PageContext;
  onContentUpdate: (content: string) => void;
  sendMessage: any; // The mutation from useChatHistory
  messages: ChatMessage[];
}

export const useChatStream = ({
  projectId,
  projectData,
  pageContext,
  onContentUpdate,
  sendMessage,
  messages,
}: UseChatStreamOptions) => {
  const toast = useToast();
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = useCallback(
    async (
      content: string,
      _messages: ChatMessage[], // Keep for backward compatibility
      _setMessages: any // Keep for backward compatibility
    ) => {
      if (!content.trim()) return;

      try {
        // Use the mutation to send the message
        await sendMessage.mutateAsync({
          content,
        });
      } catch (error: unknown) {
        logger.error('Error in chat assistant:', error);

        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to get response from assistant';

        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'bottom-right',
        });
      }
    },
    [messages, sendMessage, toast]
  );

  // Cleanup function (no longer needed but kept for compatibility)
  const cleanup = useCallback(() => {
    // Nothing to clean up
  }, []);

  return {
    isAssistantTyping: sendMessage.isPending,
    isStreaming: false, // No longer streaming
    inputMessage,
    setInputMessage,
    handleSendMessage,
    cleanup,
  };
};
