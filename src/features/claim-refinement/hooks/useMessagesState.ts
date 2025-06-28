import { useState, useCallback } from 'react';
import { Message } from '@/types/claimTypes';
import { MESSAGE_ROLES } from '../constants';

interface MessagesState {
  messages: Message[];
  inputMessage: string;
}

interface MessagesActions {
  addMessage: (message: Message) => void;
  addUserMessage: (content: string) => void;
  addAssistantMessage: (content: string) => void;
  setInputMessage: (message: string) => void;
  clearMessages: () => void;
  clearInputMessage: () => void;
}

export function useMessagesState(
  initialMessages: Message[] = []
): MessagesState & MessagesActions {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [
      ...prev,
      {
        ...message,
        timestamp: message.timestamp || Date.now(),
      },
    ]);
  }, []);

  const addUserMessage = useCallback(
    (content: string) => {
      addMessage({
        role: MESSAGE_ROLES.USER,
        content,
        timestamp: Date.now(),
      });
    },
    [addMessage]
  );

  const addAssistantMessage = useCallback(
    (content: string) => {
      addMessage({
        role: MESSAGE_ROLES.ASSISTANT,
        content,
        timestamp: Date.now(),
      });
    },
    [addMessage]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const clearInputMessage = useCallback(() => {
    setInputMessage('');
  }, []);

  return {
    // State
    messages,
    inputMessage,

    // Actions
    addMessage,
    addUserMessage,
    addAssistantMessage,
    setInputMessage,
    clearMessages,
    clearInputMessage,
  };
}
