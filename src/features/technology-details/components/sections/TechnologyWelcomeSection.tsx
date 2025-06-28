import React from 'react';
import {
  Box,
  VStack,
  Text,
  Icon,
  useColorModeValue,
  HStack,
} from '@chakra-ui/react';
import { FiEdit3 } from 'react-icons/fi';

export const TechnologyWelcomeSection: React.FC = () => {
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'gray.100');

  return (
    <>
      {/* Desktop Welcome - Clean and professional */}
      <Box
        textAlign="center"
        maxW="3xl"
        mx="auto"
        pt={2}
        pb={2}
        display={{ base: 'none', md: 'block' }}
      >
        <VStack spacing={2}>
          <HStack spacing={2} justify="center">
            <Icon as={FiEdit3} color={iconColor} boxSize={6} />
            <Text fontSize="xl" fontWeight="semibold" color={headingColor}>
              Describe Your Invention
            </Text>
          </HStack>
          <Text fontSize="sm" color={mutedTextColor} lineHeight="short" px={4}>
            Type or paste your invention description below, or drag and drop
            documents (PDF, DOCX, TXT, Images)
          </Text>
        </VStack>
      </Box>

      {/* Mobile Header - Clean */}
      <Box display={{ base: 'block', md: 'none' }} w="100%" pb={2}>
        <VStack spacing={1}>
          <HStack spacing={2} justify="center">
            <Icon as={FiEdit3} color={iconColor} boxSize={5} />
            <Text fontSize="lg" fontWeight="semibold" color={headingColor}>
              Describe Your Invention
            </Text>
          </HStack>
          <Text fontSize="xs" color={mutedTextColor} px={4} textAlign="center">
            Type, paste, or upload documents
          </Text>
        </VStack>
      </Box>
    </>
  );
};
