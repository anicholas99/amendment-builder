import React, { useState } from 'react';
import {
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Tooltip,
  useDisclosure,
  Flex,
  Text,
} from '@chakra-ui/react';
import { FiMessageCircle, FiX } from 'react-icons/fi';
import ChatInterface from './ChatInterface';
import { useProjectData } from '@/contexts/ProjectDataContext';
import { useRouter } from 'next/router';
import { useProject } from '@/hooks/api/useProjects';

interface ChatAssistantLauncherProps {
  /**
   * Optional analyzed invention object. If provided, it will be forwarded to the chat interface
   * so the assistant can give section-aware answers. When omitted the assistant behaves in
   * read-only Q&A mode.
   */
  analyzedInvention?: unknown;
  /**
   * Logical page context (e.g. "tech-details", "claim-refinement", "application-draft").
   * Used only for future routing / memory, currently not required.
   */
  pageContext?: 'technology' | 'claim-refinement' | 'patent';
  page: 'claim-refinement' | 'technology-details' | 'patent-application';
  disabled?: boolean;
}

/**
 * Floating launcher + slide-over drawer that hosts the project chat assistant.
 *
 * Embed this component once in any page or layout where the assistant should be available.
 * It renders a circular button in the bottom-right corner that expands into a side panel.
 */
const ChatAssistantLauncher: React.FC<ChatAssistantLauncherProps> = ({
  pageContext: _pageContext,
}) => {
  const {
    isOpen: drawerOpen,
    onOpen: openDrawer,
    onClose: closeDrawer,
  } = useDisclosure();
  const router = useRouter();
  const { activeProjectId } = useProjectData();
  const { data: activeProjectData } = useProject(activeProjectId);

  // Determine page context from router if not provided
  const pageContext =
    _pageContext ||
    (() => {
      const path = router.pathname;
      if (path.includes('technology')) return 'technology';
      if (path.includes('claim-refinement')) return 'claim-refinement';
      if (path.includes('patent')) return 'patent';
      return 'technology'; // default
    })();

  return (
    <>
      {/* Floating launcher button */}
      <Tooltip label="Open project assistant" placement="top">
        <IconButton
          icon={<FiMessageCircle />}
          aria-label="Open project assistant"
          position="fixed"
          bottom="24px"
          right="24px"
          zIndex={1500}
          borderRadius="full"
          colorScheme="blue"
          size="lg"
          onClick={openDrawer}
          boxShadow="lg"
        />
      </Tooltip>

      {/* Side drawer with chat */}
      <Drawer
        placement="right"
        size="md"
        isOpen={drawerOpen}
        onClose={closeDrawer}
      >
        <DrawerOverlay />
        <DrawerContent
          display="flex"
          flexDirection="column"
          maxWidth={{ base: '100%', md: '420px' }}
          h="100vh"
        >
          <DrawerHeader
            borderBottomWidth="1px"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            p={0}
          >
            <Flex align="center" justify="space-between" w="100%" p={4}>
              <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                {activeProjectData?.name || 'Project Assistant'}
              </Text>
              <IconButton
                icon={<FiX />}
                aria-label="Close assistant"
                variant="ghost"
                onClick={closeDrawer}
                size="sm"
                _hover={{ bg: 'gray.100' }}
              />
            </Flex>
          </DrawerHeader>
          <DrawerBody
            p={0}
            overflow="hidden"
            flex="1"
            display="flex"
            flexDirection="column"
          >
            <ChatInterface
              projectData={activeProjectData || null}
              onContentUpdate={() => {
                /* no-op */
              }}
              setPreviousContent={() => {
                /* no-op */
              }}
              pageContext={pageContext}
              projectId={
                activeProjectData?.id ||
                (router.query.projectId as string) ||
                ''
              }
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ChatAssistantLauncher;
