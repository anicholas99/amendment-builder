import React from 'react';
import { Flex, Icon } from '@chakra-ui/react';
import {
  FiMessageCircle,
  FiSearch,
  FiFileText,
  FiBookmark,
  // NOTE: FiZap temporarily removed with Prior Art Analysis - may be reactivated in the future
  // FiZap,
} from 'react-icons/fi';

/**
 * Component to render tab icons for the claim sidebar
 */
export function SidebarTabIcons() {
  return [
    <Flex key="searchIcon" align="center" justify="center" height="24px">
      <Icon as={FiSearch} boxSize="16px" />
    </Flex>, // Search tab
    <Flex key="citationsIcon" align="center" justify="center" height="24px">
      <Icon as={FiFileText} boxSize="16px" />
    </Flex>, // Citations tab
    <Flex key="savedPriorArtIcon" align="center" justify="center" height="24px">
      <Icon as={FiBookmark} boxSize="16px" />
    </Flex>, // Saved Prior Art tab
    // NOTE: Prior Art Analysis icon temporarily removed - may be reactivated in the future
    // <Flex
    //   key="priorArtAnalysisIcon"
    //   align="center"
    //   justify="center"
    //   height="24px"
    // >
    //   <Icon as={FiZap} boxSize="16px" />
    // </Flex>, // Prior Art Analysis tab
    <Flex key="chatIcon" align="center" justify="center" height="24px">
      <Icon as={FiMessageCircle} boxSize="16px" />
    </Flex>, // Chat tab
  ];
}
