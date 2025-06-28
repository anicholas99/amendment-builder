import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  Box,
  Textarea,
  InputGroup,
  InputRightElement,
  IconButton,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiSend } from 'react-icons/fi';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isAssistantTyping: boolean;
  assistantColor: string;
}

export const ChatInput: React.FC<ChatInputProps> = React.memo(
  ({ onSendMessage, isAssistantTyping, assistantColor }) => {
    const [inputMessage, setInputMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const inputTextBg = useColorModeValue('gray.50', 'gray.700');

    // Auto-resize textarea
    const adjustTextareaHeight = useCallback(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
      }
    }, []);

    // Auto-resize on content change
    useEffect(() => {
      adjustTextareaHeight();
    }, [inputMessage, adjustTextareaHeight]);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputMessage(e.target.value);
      },
      [setInputMessage]
    );

    const handleKeyPress = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (
          e.key === 'Enter' &&
          !e.shiftKey &&
          inputMessage.trim() &&
          !isAssistantTyping
        ) {
          e.preventDefault();
          onSendMessage(inputMessage);
          setInputMessage('');
        }
      },
      [inputMessage, isAssistantTyping, onSendMessage]
    );

    const handleSendClick = useCallback(() => {
      if (inputMessage.trim()) {
        onSendMessage(inputMessage);
        setInputMessage('');
      }
    }, [inputMessage, onSendMessage]);

    return (
      <Box
        p={3}
        borderTop="1px solid"
        borderColor="border.primary"
        bg="bg.secondary"
        boxShadow="0 -2px 8px rgba(0,0,0,0.03)"
      >
        <InputGroup size="sm">
          <Textarea
            placeholder="Ask me about your patent application..."
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            pr="3rem"
            bg={inputTextBg}
            color="text.primary"
            border="1px solid"
            borderColor="border.primary"
            borderRadius="lg"
            _hover={{
              borderColor: 'border.light',
            }}
            _focus={{
              borderColor: assistantColor,
              boxShadow: `0 0 0 1px ${assistantColor}`,
              bg: 'bg.primary',
            }}
            _placeholder={{
              color: 'text.tertiary',
            }}
            fontSize="sm"
            disabled={isAssistantTyping}
            transition="border-color 0.15s ease-out, box-shadow 0.15s ease-out, background-color 0.15s ease-out"
            minH="36px"
            maxH="120px"
            resize="none"
            ref={textareaRef}
            overflow="hidden"
          />
          <InputRightElement width="3rem" height="36px">
            <IconButton
              h="24px"
              w="24px"
              size="xs"
              colorScheme={assistantColor.split('.')[0]}
              isLoading={isAssistantTyping}
              isDisabled={!inputMessage.trim() || isAssistantTyping}
              onClick={handleSendClick}
              borderRadius="md"
              icon={<Icon as={FiSend} boxSize="12px" />}
              _hover={{
                transform: 'translateY(-1px)',
                boxShadow: 'sm',
              }}
              transition="transform 0.15s ease-out, box-shadow 0.15s ease-out"
              aria-label="Send message"
            />
          </InputRightElement>
        </InputGroup>
      </Box>
    );
  }
);

ChatInput.displayName = 'ChatInput';
