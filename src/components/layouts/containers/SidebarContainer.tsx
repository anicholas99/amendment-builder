import React, { ReactNode } from 'react';
import { Box, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import { environment } from '@/config/environment';

interface SidebarContainerProps {
  children?: ReactNode;
  activeTab?: number;
  onTabChange?: (index: number) => void;
  tabTitles?: string[];
  tabIcons?: (React.ReactElement | null | undefined)[];
  tabContents?: ReactNode[];
  hasTabs?: boolean;
  // Basic style props
  style?: React.CSSProperties;
  className?: string;
}

/**
 * A standardized container for all sidebar components in the application
 * Ensures consistent styling and behavior across different views
 */
const SidebarContainer: React.FC<SidebarContainerProps> = ({
  children,
  activeTab = 0,
  onTabChange,
  tabTitles = [],
  tabIcons = [],
  tabContents = [],
  hasTabs = true,
  style,
  className,
}) => {
  const isDev = environment.isDevelopment;

  // Render with tabs if tabTitles are provided
  if (hasTabs && tabTitles.length > 0 && tabContents.length > 0) {
    return (
      <Box
        height="100%"
        position="relative"
        style={style}
        className={className}
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          height="100%"
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          boxShadow="sm"
          bg="bg.primary"
          borderColor="border.primary"
          width="100%"
        >
          <Tabs
            index={activeTab}
            onChange={onTabChange}
            colorScheme="blue"
            variant="line"
            size="sm"
            w="100%"
            h="100%"
            display="flex"
            flexDirection="column"
          >
            <TabList
              w="100%"
              minH="48px"
              flexShrink={0}
              bg="bg.card"
              borderBottomWidth="1px"
              borderBottomColor="border.primary"
              _dark={{ bg: 'bg.card', borderBottomColor: 'border.primary' }}
            >
              {tabTitles.map((title, index) => (
                <Tab
                  key={index}
                  p="12px 20px"
                  fontWeight="medium"
                  fontSize="sm"
                >
                  {tabIcons[index] ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      {tabIcons[index]}
                      <span>{title}</span>
                    </Box>
                  ) : (
                    title
                  )}
                </Tab>
              ))}
            </TabList>

            <TabPanels flex="1" overflow="hidden">
              {tabContents.map((content, index) => (
                <TabPanel
                  key={index}
                  p={0}
                  h="100%"
                  overflow="auto"
                  display={activeTab === index ? 'block' : 'none'}
                >
                  {content}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    );
  }

  // Render without tabs, just the container with children
  return (
    <Box height="100%" position="relative" style={style} className={className}>
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        height="100%"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="sm"
        bg="bg.primary"
        borderColor="border.primary"
        width="100%"
      >
        {children}
      </Box>
    </Box>
  );
};

export default SidebarContainer;
