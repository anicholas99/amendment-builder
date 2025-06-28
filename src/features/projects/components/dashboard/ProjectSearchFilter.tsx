import React, { useState } from 'react';
import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Select,
  Button,
  Text,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiCalendar, FiTrendingUp } from 'react-icons/fi';

interface ProjectSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  filterBy: string;
  onFilterChange: (filter: string) => void;
  projectCount: number;
  filteredCount: number;
}

export const ProjectSearchFilter: React.FC<ProjectSearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange,
  projectCount,
  filteredCount,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Theme-aware colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const placeholderColor = useColorModeValue('gray.400', 'gray.500');

  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      gap={3}
      align={{ base: 'stretch', md: 'center' }}
      justify="space-between"
      mb={4}
      px={1}
    >
      {/* Search Input - Clean and minimal */}
      <Box flex="1" maxW={{ base: '100%', md: '400px' }}>
        <InputGroup size="sm">
          <InputLeftElement pointerEvents="none" h="32px">
            <Icon as={FiSearch} color={placeholderColor} boxSize="14px" />
          </InputLeftElement>
          <Input
            placeholder="Search projects by name..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            border="none"
            bg="transparent"
            _placeholder={{ color: placeholderColor, fontSize: 'sm' }}
            _focus={{
              outline: 'none',
              boxShadow: 'none',
            }}
            fontSize="sm"
            h="32px"
          />
        </InputGroup>
      </Box>

      {/* Minimal controls */}
      <HStack spacing={2} fontSize="sm">
        {/* Sort By - Ghost style */}
        <Select
          value={sortBy}
          onChange={e => onSortChange(e.target.value)}
          size="sm"
          variant="ghost"
          border="none"
          _focus={{ outline: 'none', boxShadow: 'none' }}
          fontSize="sm"
          color={textColor}
          minW="140px"
        >
          <option value="recent">Recent</option>
          <option value="name">Name</option>
          <option value="created">Created</option>
          <option value="modified">Modified</option>
        </Select>

        {/* Filter By Status - Ghost style */}
        <Select
          value={filterBy}
          onChange={e => onFilterChange(e.target.value)}
          size="sm"
          variant="ghost"
          border="none"
          _focus={{ outline: 'none', boxShadow: 'none' }}
          fontSize="sm"
          color={textColor}
          minW="120px"
        >
          <option value="all">All</option>
          <option value="recent">Recent</option>
          <option value="complete">Complete</option>
          <option value="in-progress">In Progress</option>
        </Select>

        {/* Results count - subtle */}
        <Text fontSize="xs" color={placeholderColor} whiteSpace="nowrap">
          {filteredCount === projectCount
            ? `${projectCount} projects`
            : `${filteredCount}/${projectCount}`}
        </Text>

        {/* Clear search - only show when searching */}
        {searchQuery && (
          <Button
            variant="ghost"
            size="xs"
            color={placeholderColor}
            onClick={() => onSearchChange('')}
            fontSize="xs"
            p={1}
            h="auto"
            minW="auto"
          >
            Clear
          </Button>
        )}
      </HStack>
    </Flex>
  );
};
