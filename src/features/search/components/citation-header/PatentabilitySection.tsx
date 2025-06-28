import React from 'react';
import {
  Badge,
  Button,
  HStack,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiBarChart2, FiRefreshCw, FiX } from 'react-icons/fi';

interface PatentabilitySectionProps {
  showPatentabilityDashboard?: boolean;
  patentabilityScore?: number | null;
  onTogglePatentability?: (isEnabled: boolean) => void;
  onRunPatentabilityAnalysis?: () => void;
  onCombinedAnalysis?: () => void;
  hasReferences: boolean;
}

export function PatentabilitySection({
  showPatentabilityDashboard = false,
  patentabilityScore,
  onTogglePatentability,
  onRunPatentabilityAnalysis,
  onCombinedAnalysis,
  hasReferences,
}: PatentabilitySectionProps) {
  const blueTextColor = useColorModeValue('blue.700', 'blue.300');
  const iconColor = useColorModeValue('gray.600', 'blue.300');

  if (!hasReferences) {
    return null;
  }

  return (
    <HStack spacing={1} mr={3} alignItems="center">
      {/* Always show score badge when dashboard is hidden and we have a patentability score value */}
      {!showPatentabilityDashboard && patentabilityScore !== undefined && (
        <HStack spacing={2} mr={1}>
          <Badge
            colorScheme={
              (patentabilityScore ?? 0) >= 65
                ? 'green'
                : (patentabilityScore ?? 0) >= 50
                  ? 'yellow'
                  : 'red'
            }
            p={1}
          >
            <HStack spacing={1}>
              <Icon as={FiBarChart2} size="xs" />
              <Text>Patentability: {patentabilityScore ?? 0}/100</Text>
            </HStack>
          </Badge>
          <Button
            size="xs"
            leftIcon={<Icon as={FiRefreshCw} color={iconColor} />}
            onClick={onRunPatentabilityAnalysis}
            variant="ghost"
            title="Re-analyze patentability"
            color={iconColor}
            _hover={{ color: useColorModeValue('gray.800', 'blue.100') }}
          >
            Re-analyze
          </Button>
        </HStack>
      )}

      {/* Show Analysis Button - only when dashboard is hidden */}
      {!showPatentabilityDashboard && (
        <Button
          size="xs"
          colorScheme="blue"
          ml={1}
          onClick={onCombinedAnalysis}
        >
          Combined Analysis
        </Button>
      )}

      {/* Add Close button - visible when dashboard is shown */}
      {showPatentabilityDashboard && (
        <Button
          size="xs"
          variant="ghost"
          colorScheme="gray"
          leftIcon={<Icon as={FiX} color={iconColor} />}
          onClick={() => onTogglePatentability && onTogglePatentability(false)}
          mr={1}
          color={iconColor}
          _hover={{ color: useColorModeValue('gray.800', 'blue.100') }}
        >
          Close
        </Button>
      )}

      {patentabilityScore !== null && patentabilityScore !== undefined && (
        <Text fontSize="sm" color={blueTextColor} ml={2} fontWeight="medium">
          Patentability Score: {Math.round(patentabilityScore)}%
        </Text>
      )}
    </HStack>
  );
}
