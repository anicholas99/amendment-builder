import React from 'react';
import {
  Box,
  HStack,
  Text,
  Badge,
  Button,
  Icon,
  Spinner,
  Container,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiArrowRight } from 'react-icons/fi';

interface TechnologyFooterActionsProps {
  value: string;
  uploadedFilesCount: number;
  uploadedFiguresCount: number;
  isProcessing: boolean;
  isUploading: boolean;
  onProceed: () => void;
}

export const TechnologyFooterActions: React.FC<
  TechnologyFooterActionsProps
> = ({
  value,
  uploadedFilesCount,
  uploadedFiguresCount,
  isProcessing,
  isUploading,
  onProceed,
}) => {
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const iconColor = useColorModeValue('blue.500', 'blue.300');

  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const totalFiles = uploadedFilesCount + uploadedFiguresCount;

  return (
    <Box py={3} pb={4} px={{ base: 4, md: 6 }} minH="80px">
      <Container maxW="7xl">
        <HStack justify="space-between" align="center">
          {/* Content Status */}
          <HStack spacing={4}>
            {value.length > 0 && (
              <Box>
                <Text fontSize="sm" color={mutedTextColor}>
                  {wordCount} {wordCount === 1 ? 'word' : 'words'} • {charCount}{' '}
                  characters
                </Text>
              </Box>
            )}
            {totalFiles > 0 && (
              <Badge colorScheme="green" variant="subtle" fontSize="sm">
                {totalFiles} files ready
              </Badge>
            )}
            {!value.length && totalFiles === 0 && (
              <Text fontSize="sm" color={mutedTextColor}>
                No content yet
              </Text>
            )}
          </HStack>

          {/* Process Button */}
          {isProcessing ? (
            <HStack spacing={3}>
              <Spinner size="sm" color={iconColor} />
              <Text fontSize="sm" color="text.primary">
                Processing your invention...
              </Text>
            </HStack>
          ) : (
            <Button
              colorScheme="blue"
              size="lg"
              rightIcon={<Icon as={FiArrowRight} />}
              onClick={onProceed}
              isLoading={isUploading}
              isDisabled={
                isProcessing ||
                isUploading ||
                (!value.length && totalFiles === 0)
              }
              px={8}
              _hover={{
                transform: 'translateY(-1px)',
                boxShadow: 'lg',
              }}
              transition="all 0.2s"
            >
              Process Invention
            </Button>
          )}
        </HStack>
      </Container>
    </Box>
  );
};
