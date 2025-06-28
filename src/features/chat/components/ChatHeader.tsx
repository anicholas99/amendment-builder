import React from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Avatar,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { FiCpu, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { AssistantInfo } from '../types';

interface ChatHeaderProps {
  assistantInfo: AssistantInfo;
  onRefresh: () => void;
  onClearChat: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  assistantInfo,
  onRefresh,
  onClearChat,
}) => {
  return (
    <Box
      bg="bg.secondary"
      borderBottom="1px solid"
      borderColor="border.primary"
      boxShadow="sm"
    >
      <Flex justify="space-between" align="center" p={4}>
        <HStack spacing={3}>
          <Avatar
            size="sm"
            bg={assistantInfo.color}
            icon={<FiCpu />}
            boxShadow="sm"
          />
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" fontWeight="600" color="text.primary">
              {assistantInfo.title}
            </Text>
            <Text fontSize="xs" color="text.secondary">
              {assistantInfo.description}
            </Text>
          </VStack>
        </HStack>
        <HStack spacing={1}>
          <Tooltip label="Refresh conversation" placement="top">
            <IconButton
              icon={<FiRefreshCw />}
              aria-label="Refresh conversation"
              size="xs"
              variant="ghost"
              color="text.secondary"
              _hover={{ bg: 'bg.hover' }}
              onClick={onRefresh}
            />
          </Tooltip>
          <Tooltip label="Clear conversation" placement="top">
            <IconButton
              icon={<FiTrash2 />}
              aria-label="Clear conversation"
              size="xs"
              variant="ghost"
              color="red.500"
              _hover={{ bg: 'red.50', _dark: { bg: 'red.900' } }}
              onClick={onClearChat}
            />
          </Tooltip>
        </HStack>
      </Flex>
    </Box>
  );
};
