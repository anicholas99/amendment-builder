import React from 'react';
import {
  Box,
  IconButton,
  HStack,
  Text,
  Tooltip,
  Icon,
  Spinner,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiCheck,
  FiAlertCircle,
  FiRefreshCw,
  FiEye,
  FiPlus,
} from 'react-icons/fi';
import { SyncStatus } from '../hooks/useClaimSyncState';

interface ClaimSyncIndicatorProps {
  syncStatus: SyncStatus;
  error: string | null;
  lastSyncTime: Date | null;
  onResync?: () => void;
  onOpenModal?: () => void;
}

export const ClaimSyncIndicator: React.FC<ClaimSyncIndicatorProps> = ({
  syncStatus,
  error,
  lastSyncTime,
  onResync,
  onOpenModal,
}) => {
  const iconColor = useColorModeValue('gray.600', 'blue.300');
  const iconHoverColor = useColorModeValue('gray.800', 'blue.100');
  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'synced':
        return <Icon as={FiCheck} color="green.500" />;
      case 'parsing':
      case 'generating':
        return <Spinner size="sm" color="blue.500" />;
      case 'error':
        return <Icon as={FiAlertCircle} color="red.500" />;
      case 'out-of-sync':
        return <Icon as={FiRefreshCw} color="orange.500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'synced':
        return 'Synced';
      case 'parsing':
        return 'Parsing claim...';
      case 'generating':
        return 'Generating queries...';
      case 'error':
        return 'Sync error';
      case 'idle':
        return 'Click sync to parse';
      case 'out-of-sync':
        return 'Sync needed';
      default:
        return '';
    }
  };

  // Dynamic colors for dot indicator
  const colorDot = useColorModeValue('gray.400', 'gray.500');

  const statusColorMap: Record<SyncStatus, string> = {
    synced: 'green.400',
    parsing: 'blue.400',
    generating: 'blue.400',
    error: 'red.400',
    'out-of-sync': 'orange.400',
    idle: colorDot,
  };

  return (
    <HStack spacing={1} align="center">
      <Tooltip
        label={
          error ? (
            <VStack align="start" spacing={1} maxW="250px">
              <Text fontWeight="bold">Error:</Text>
              <Text>{error}</Text>
            </VStack>
          ) : lastSyncTime ? (
            `Last synced: ${lastSyncTime.toLocaleTimeString()}`
          ) : (
            getStatusText()
          )
        }
        hasArrow
        placement="bottom-start"
      >
        <HStack spacing={1} cursor="default">
          {/* Colored status dot or spinner */}
          {syncStatus === 'parsing' || syncStatus === 'generating' ? (
            <Spinner size="xs" color={statusColorMap[syncStatus]} />
          ) : (
            <Box
              boxSize="8px"
              borderRadius="full"
              bg={statusColorMap[syncStatus]}
            />
          )}

          <Text fontSize="xs" color="text.secondary">
            {getStatusText()}
          </Text>
        </HStack>
      </Tooltip>

      {/* Action buttons as subtle IconButtons */}
      {syncStatus === 'idle' && onResync && (
        <Tooltip label="Sync claim 1" hasArrow>
          <IconButton
            aria-label="sync claim 1"
            size="sm"
            icon={<Icon as={FiRefreshCw} color={iconColor} />}
            variant="ghost"
            onClick={onResync}
            _hover={{
              color: iconHoverColor,
              bg: 'bg.hover',
            }}
          />
        </Tooltip>
      )}

      {(syncStatus === 'synced' || syncStatus === 'out-of-sync') && (
        <Tooltip label="View or Edit parsed data" hasArrow>
          <IconButton
            aria-label="view parsed data"
            size="sm"
            icon={<Icon as={FiEye} color={iconColor} />}
            variant="ghost"
            onClick={onOpenModal}
            _hover={{
              color: iconHoverColor,
              bg: 'bg.hover',
            }}
          />
        </Tooltip>
      )}

      {syncStatus === 'out-of-sync' && onResync && (
        <Tooltip label="Re-sync" hasArrow>
          <IconButton
            aria-label="re-sync"
            size="sm"
            icon={<Icon as={FiRefreshCw} color="orange.500" />}
            variant="ghost"
            onClick={onResync}
            colorScheme="orange"
            _hover={{
              color: 'orange.600',
              bg: 'orange.50',
            }}
          />
        </Tooltip>
      )}

      {syncStatus === 'error' && onResync && (
        <Tooltip label="Retry sync" hasArrow>
          <IconButton
            aria-label="retry sync"
            size="sm"
            icon={<Icon as={FiRefreshCw} color="red.500" />}
            variant="ghost"
            onClick={onResync}
            colorScheme="red"
            _hover={{
              color: 'red.600',
              bg: 'red.50',
            }}
          />
        </Tooltip>
      )}

      {syncStatus === 'error' && error?.includes('limit reached') && (
        <Tooltip label="Add parsed data manually" hasArrow>
          <IconButton
            aria-label="add manually"
            size="sm"
            icon={<Icon as={FiPlus} color={iconColor} />}
            variant="ghost"
            onClick={onOpenModal}
            _hover={{
              color: iconHoverColor,
              bg: 'bg.hover',
            }}
          />
        </Tooltip>
      )}
    </HStack>
  );
};
