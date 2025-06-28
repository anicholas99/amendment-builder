import React, { ReactNode } from 'react';
import {
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  HStack,
  Badge,
} from '@chakra-ui/react';

interface SidebarTabContainerProps {
  activeTab: string;
  handleTabChange: (index: number) => void;
  tabTitles: string[];
  tabContents: ReactNode[];
  tabIcons?: (React.ReactElement | null | undefined)[];
  notifications?: Record<number, boolean>;
}

/**
 * A reusable tab container component for sidebar navigation
 */
const SidebarTabContainer: React.FC<SidebarTabContainerProps> = ({
  activeTab,
  handleTabChange,
  tabTitles,
  tabContents,
  tabIcons = [],
  notifications,
}) => {
  // Convert activeTab string to number for defaultIndex
  const activeTabIndex = parseInt(activeTab, 10) || 0;

  return (
    <Box
      position="absolute"
      top="0"
      left="0"
      right="0"
      height="100%"
      borderWidth="1px"
      borderColor="border.primary"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="sm"
      width="100%"
      bg="bg.primary"
    >
      <Tabs
        variant="line"
        colorScheme="blue"
        onChange={handleTabChange}
        defaultIndex={activeTabIndex}
        index={activeTabIndex}
        size="sm"
        h="100%"
        display="flex"
        flexDirection="column"
        w="100%"
      >
        <TabList
          bg="bg.card"
          minH="48px"
          flexShrink={0}
          w="100%"
          borderBottomWidth="1px"
          borderBottomColor="border.primary"
          _dark={{ bg: 'bg.card', borderBottomColor: 'border.primary' }}
        >
          {tabTitles.map((title, index) => (
            <Tab key={index} p="12px 20px" fontWeight="medium" fontSize="sm">
              {tabIcons[index] ? (
                <HStack spacing={1}>
                  {tabIcons[index]}
                  <span>{title}</span>
                  {notifications?.[index] && (
                    <Badge
                      colorScheme="blue"
                      variant="solid"
                      borderRadius="full"
                      px={2}
                      fontWeight="bold"
                      fontSize="0.8em"
                      boxShadow="0 0 8px rgba(66, 153, 225, 0.6)"
                    >
                      New
                    </Badge>
                  )}
                </HStack>
              ) : (
                <>
                  {title}
                  {notifications?.[index] && (
                    <Badge
                      colorScheme="blue"
                      variant="solid"
                      borderRadius="full"
                      px={2}
                      fontWeight="bold"
                      fontSize="0.8em"
                      boxShadow="0 0 8px rgba(66, 153, 225, 0.6)"
                    >
                      New
                    </Badge>
                  )}
                </>
              )}
            </Tab>
          ))}
        </TabList>

        <TabPanels flex="1" overflow="hidden" position="relative">
          {tabContents.map((content, index) => (
            <TabPanel
              key={index}
              p={0}
              h="100%"
              overflow="auto"
              display={activeTabIndex === index ? 'block' : 'none'}
            >
              {/* Only render the content if this tab is active to prevent unnecessary renders */}
              {activeTabIndex === index ? content : null}
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default SidebarTabContainer;
