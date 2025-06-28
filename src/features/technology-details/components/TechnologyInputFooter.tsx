import React, { useState } from 'react';
import {
  Flex,
  Button,
  Text,
  Badge,
  HStack,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { Icon } from '@chakra-ui/react';
import { Progress, Tooltip } from '@chakra-ui/react';
import { FiInfo, FiAlertTriangle, FiAlertCircle } from 'react-icons/fi';
import ProcessingAnimation from '../../../components/ui/ProcessingAnimation';
import { environment } from '@/config/environment';

interface TechnologyInputFooterProps {
  textLength: number;
  isProcessing: boolean;
  isUploading: boolean;
  hasContent: boolean;
  onProcessClick: () => void;
  progress: number;
}

// Token limit configuration (matches API endpoint)
const maxTokens =
  typeof window !== 'undefined' ? environment.ai.maxTokens : 6000;
const MAX_CHARS = maxTokens * 4; // Approximate chars per token
const WARNING_THRESHOLD = 0.8; // Warn at 80%
const DANGER_THRESHOLD = 0.95; // Danger at 95%

/**
 * Get the status and styling for the character counter based on current usage
 */
const getCounterStatus = (textLength: number) => {
  const approxTokens = Math.ceil(textLength / 4);
  const percentage = approxTokens / maxTokens;

  if (percentage >= 1) {
    return {
      status: 'over-limit',
      color: 'red.500',
      bgColor: 'red.50',
      borderColor: 'red.200',
      icon: FiAlertCircle,
      message: 'Exceeds maximum limit',
      isOverLimit: true,
    };
  } else if (percentage >= DANGER_THRESHOLD) {
    return {
      status: 'danger',
      color: 'red.500',
      bgColor: 'red.50',
      borderColor: 'red.200',
      icon: FiAlertTriangle,
      message: 'Approaching limit',
      isOverLimit: false,
    };
  } else if (percentage >= WARNING_THRESHOLD) {
    return {
      status: 'warning',
      color: 'orange.500',
      bgColor: 'orange.50',
      borderColor: 'orange.200',
      icon: FiAlertTriangle,
      message: 'Consider condensing',
      isOverLimit: false,
    };
  } else {
    return {
      status: 'normal',
      color: 'green.500',
      bgColor: 'green.50',
      borderColor: 'green.200',
      icon: FiInfo,
      message: 'Within limits',
      isOverLimit: false,
    };
  }
};

/**
 * Footer component with enhanced character count, token limits, and process button
 */
export const TechnologyInputFooter: React.FC<TechnologyInputFooterProps> =
  React.memo(
    ({
      textLength,
      isProcessing,
      isUploading,
      hasContent,
      onProcessClick,
      progress,
    }) => {
      const approxTokens = Math.ceil(textLength / 4);
      const counterStatus = getCounterStatus(textLength);
      const percentage = (approxTokens / maxTokens) * 100;

      return (
        <Box
          p={5}
          bg={useColorModeValue('gray.50', 'gray.800')}
          borderTop="1px solid"
          borderColor={useColorModeValue('gray.100', 'gray.700')}
        >
          <Flex justify="space-between" align="center">
            <Box maxW="7xl" mx="auto" w="full">
              <Flex justify="space-between" align="center">
                {/* Enhanced Character/Token Counter */}
                <HStack spacing={3}>
                  <Icon
                    as={counterStatus.icon}
                    color={counterStatus.color}
                    boxSize={5}
                  />
                  <Box>
                    <HStack spacing={2} align="center">
                      <Text color="gray.700" fontSize="sm" fontWeight="medium">
                        {textLength > 0
                          ? `${textLength.toLocaleString()} characters`
                          : 'No content yet'}
                      </Text>
                      {textLength > 0 && (
                        <Tooltip
                          label={`Approximately ${approxTokens.toLocaleString()} tokens. Maximum allowed: ${maxTokens.toLocaleString()} tokens.`}
                          placement="top"
                        >
                          <Badge
                            colorScheme={
                              counterStatus.status === 'over-limit' ||
                              counterStatus.status === 'danger'
                                ? 'red'
                                : counterStatus.status === 'warning'
                                  ? 'orange'
                                  : 'green'
                            }
                            variant="subtle"
                            fontSize="xs"
                            px={2}
                            py={1}
                            borderRadius="md"
                          >
                            ~{approxTokens.toLocaleString()} /{' '}
                            {maxTokens.toLocaleString()} tokens
                          </Badge>
                        </Tooltip>
                      )}
                    </HStack>
                    {textLength > 0 && counterStatus.status !== 'normal' && (
                      <Text color={counterStatus.color} fontSize="xs" mt={1}>
                        {counterStatus.message}
                        {counterStatus.isOverLimit &&
                          ' - Please reduce content length'}
                      </Text>
                    )}
                  </Box>
                </HStack>

                {/* Process Button */}
                {isProcessing ? (
                  <ProcessingAnimation isOpen={isProcessing} />
                ) : (
                  <Button
                    colorScheme="blue"
                    size="lg"
                    rightIcon={<FiArrowRight />}
                    onClick={onProcessClick}
                    isLoading={isUploading}
                    isDisabled={
                      isProcessing ||
                      isUploading ||
                      !hasContent ||
                      counterStatus.isOverLimit
                    }
                    px={8}
                    py={6}
                    _hover={{
                      transform: 'translateY(-1px)',
                      boxShadow: 'lg',
                      bg: 'blue.600',
                    }}
                    _active={{
                      transform: 'translateY(0)',
                      boxShadow: 'md',
                      bg: 'blue.700',
                    }}
                    transition="transform 0.15s ease-out, box-shadow 0.15s ease-out, background-color 0.15s ease-out"
                    fontWeight="semibold"
                    borderRadius="lg"
                    data-testid="process-invention-button"
                  >
                    Process Invention
                  </Button>
                )}

                {/* Progress Indicator */}
                <HStack spacing={4} align="center">
                  <Progress
                    value={progress}
                    size="xs"
                    flex={1}
                    borderRadius="md"
                  />
                  <Text color="gray.600" fontSize="sm" fontWeight="normal">
                    {progress}% Complete
                  </Text>
                </HStack>
              </Flex>
            </Box>
          </Flex>
        </Box>
      );
    }
  );

TechnologyInputFooter.displayName = 'TechnologyInputFooter';
