import React from 'react';
import {
  Box,
  Button,
  HStack,
  Icon,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Text,
  Badge,
} from '@chakra-ui/react';
import {
  FiFileText,
  FiRefreshCw,
  FiClock,
  FiChevronDown,
} from 'react-icons/fi';

interface ActionButtonsProps {
  selectedReference: string | null;
  isReferenceSaved?: boolean;
  isReferenceExcluded?: boolean;
  isLoading?: boolean;
  onSaveReference?: (referenceNumber: string) => void;
  onExcludeReference?: (referenceNumber: string) => void;

  // Examiner analysis props
  isExaminerAnalysisAvailable?: boolean;
  showExaminerAnalysis?: boolean;
  hasExaminerAnalysisData?: boolean;
  hasHighImportanceFindings?: boolean;
  isRunningExaminerAnalysis?: boolean;
  onToggleExaminerAnalysis?: (isEnabled: boolean) => void;

  // Rerun extraction props
  onRerunExtraction?: () => void;
  isRerunningExtraction?: boolean;

  // Citation history props
  citationHistory?: Array<{
    id: string;
    createdAt: Date;
    status: string;
    isCurrent: boolean;
  }>;
  onViewHistoricalRun?: (jobId: string) => void;
}

export function ActionButtons({
  selectedReference,
  isReferenceSaved = false,
  isReferenceExcluded = false,
  isLoading = false,
  onSaveReference,
  onExcludeReference,
  isExaminerAnalysisAvailable,
  showExaminerAnalysis = false,
  hasExaminerAnalysisData = false,
  hasHighImportanceFindings = false,
  isRunningExaminerAnalysis = false,
  onToggleExaminerAnalysis,
  onRerunExtraction,
  isRerunningExtraction = false,
  citationHistory = [],
  onViewHistoricalRun,
}: ActionButtonsProps) {
  const notificationBorderColor = useColorModeValue('white', 'bg.primary');

  if (!selectedReference) {
    return null;
  }

  const handleExaminerAnalysisClick = () => {
    if (isRunningExaminerAnalysis) return;
    onToggleExaminerAnalysis && onToggleExaminerAnalysis(!showExaminerAnalysis);
  };

  return (
    <HStack spacing={1}>
      {/* Rerun Extraction Button */}
      {onRerunExtraction && (
        <Button
          leftIcon={<Icon as={FiRefreshCw} />}
          size="sm"
          colorScheme="blue"
          variant="outline"
          onClick={onRerunExtraction}
          isLoading={isRerunningExtraction}
          mr={1}
          title="Rerun citation extraction for this reference"
        >
          Rerun
        </Button>
      )}

      {/* Citation History Dropdown */}
      {citationHistory.length > 0 && onViewHistoricalRun && (
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<Icon as={FiClock} />}
            size="sm"
            variant="outline"
            colorScheme="gray"
            title="View citation extraction history"
            mr={1}
          />
          <MenuList zIndex={1500}>
            <MenuItem isDisabled>
              <Text fontSize="xs" fontWeight="bold" color="gray.600">
                EXTRACTION HISTORY
              </Text>
            </MenuItem>
            {citationHistory.map((run, index) => {
              const runDate = new Date(run.createdAt);
              const isLatest = index === 0;

              return (
                <MenuItem
                  key={run.id}
                  onClick={() => onViewHistoricalRun(run.id)}
                  fontSize="sm"
                >
                  <Box flex="1">
                    <HStack spacing={2}>
                      <Text>Run #{citationHistory.length - index}</Text>
                      {run.isCurrent && (
                        <Badge colorScheme="green" size="sm">
                          Current
                        </Badge>
                      )}
                      {isLatest && !run.isCurrent && (
                        <Badge colorScheme="blue" size="sm">
                          Latest
                        </Badge>
                      )}
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                      {runDate.toLocaleDateString()}{' '}
                      {runDate.toLocaleTimeString()}
                    </Text>
                  </Box>
                </MenuItem>
              );
            })}
          </MenuList>
        </Menu>
      )}

      {/* Examiner Analysis Toggle Button */}
      {isExaminerAnalysisAvailable && (
        <Box position="relative">
          <Button
            leftIcon={<Icon as={FiFileText} />}
            size="sm"
            colorScheme="green"
            variant={showExaminerAnalysis ? 'solid' : 'outline'}
            onClick={handleExaminerAnalysisClick}
            isLoading={isRunningExaminerAnalysis}
            mr={1}
            position="relative"
          >
            {showExaminerAnalysis ? 'Hide Examiner View' : 'Examiner View'}
          </Button>

          {/* Notification dot for important findings */}
          {!showExaminerAnalysis &&
            !isRunningExaminerAnalysis &&
            hasExaminerAnalysisData && (
              <Box
                position="absolute"
                top="-2px"
                right="-2px"
                width="10px"
                height="10px"
                borderRadius="full"
                bg={hasHighImportanceFindings ? 'red.500' : 'green.400'}
                borderWidth="2px"
                borderColor={notificationBorderColor}
              />
            )}
        </Box>
      )}
    </HStack>
  );
}
