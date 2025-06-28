import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Icon,
  useColorModeValue,
  Spinner,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Code,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiRefreshCw,
  FiServer,
  FiDatabase,
  FiCloud,
  FiCpu,
  FiHardDrive,
} from 'react-icons/fi';
import { useApiQuery } from '@/lib/api/queryClient';
import { SystemHealth, HealthStatus } from '@/lib/monitoring/health-check';
import { API_ROUTES } from '@/constants/apiRoutes';
import { systemHealthKeys } from '@/lib/queryKeys/systemKeys';

const getStatusColor = (status: HealthStatus) => {
  switch (status) {
    case 'healthy':
      return 'green';
    case 'degraded':
      return 'yellow';
    case 'unhealthy':
      return 'red';
    default:
      return 'gray';
  }
};

const getStatusIcon = (status: HealthStatus) => {
  switch (status) {
    case 'healthy':
      return FiCheckCircle;
    case 'degraded':
      return FiAlertCircle;
    case 'unhealthy':
      return FiXCircle;
    default:
      return FiAlertCircle;
  }
};

const getCheckIcon = (checkName: string) => {
  switch (checkName) {
    case 'database':
      return FiDatabase;
    case 'redis':
      return FiServer;
    case 'external-apis':
      return FiCloud;
    case 'memory':
      return FiCpu;
    case 'storage':
      return FiHardDrive;
    default:
      return FiServer;
  }
};

function formatDuration(ms?: number): string {
  if (!ms) return 'N/A';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export default function SystemHealthPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const [autoRefresh, setAutoRefresh] = useState(true);

  const {
    data: health,
    isLoading,
    error,
    refetch,
  } = useApiQuery<SystemHealth>([...systemHealthKeys.all], {
    url: API_ROUTES.MISC.HEALTH,
    params: { detailed: 'true' },
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds when enabled
  });

  if (isLoading) {
    return (
      <Box minH="100vh" bg={bgColor} p={8}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading system health...</Text>
        </VStack>
      </Box>
    );
  }

  if (error || !health) {
    return (
      <Box minH="100vh" bg={bgColor} p={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Failed to load health status</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Unknown error'}
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  const overallStatusColor = getStatusColor(health.status);
  const StatusIcon = getStatusIcon(health.status);

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Header */}
      <Box bg={cardBg} borderBottom="1px solid" borderColor={borderColor} p={6}>
        <VStack align="start" spacing={4} maxW="1200px" mx="auto">
          <HStack justify="space-between" w="full">
            <HStack spacing={4}>
              <Heading size="lg">System Health Monitor</Heading>
              <Badge
                colorScheme={overallStatusColor}
                fontSize="md"
                px={3}
                py={1}
                borderRadius="full"
              >
                <HStack spacing={2}>
                  <Icon as={StatusIcon} />
                  <Text>{health.status.toUpperCase()}</Text>
                </HStack>
              </Badge>
            </HStack>
            <HStack spacing={4}>
              <Button
                leftIcon={<FiRefreshCw />}
                onClick={() => refetch()}
                size="sm"
                variant="outline"
              >
                Refresh
              </Button>
              <Button
                size="sm"
                variant={autoRefresh ? 'solid' : 'outline'}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
              </Button>
            </HStack>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full">
            <Stat>
              <StatLabel>Last Check</StatLabel>
              <StatNumber fontSize="lg">
                {new Date(health.timestamp).toLocaleTimeString()}
              </StatNumber>
              <StatHelpText>
                {new Date(health.timestamp).toLocaleDateString()}
              </StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>System Uptime</StatLabel>
              <StatNumber fontSize="lg">
                {formatUptime(health.uptime)}
              </StatNumber>
              <StatHelpText>Since last restart</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Version</StatLabel>
              <StatNumber fontSize="lg">v{health.version}</StatNumber>
              <StatHelpText>Application version</StatHelpText>
            </Stat>
          </SimpleGrid>
        </VStack>
      </Box>

      {/* Health Checks */}
      <Box p={8} maxW="1200px" mx="auto">
        <VStack spacing={6} align="stretch">
          {/* Summary Alert */}
          {health.status !== 'healthy' && (
            <Alert
              status={health.status === 'degraded' ? 'warning' : 'error'}
              borderRadius="md"
            >
              <AlertIcon />
              <Box>
                <AlertTitle>System Issues Detected</AlertTitle>
                <AlertDescription>
                  {
                    Object.entries(health.checks).filter(
                      ([_, check]) => check.status !== 'healthy'
                    ).length
                  }{' '}
                  component(s) are experiencing issues
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Health Check Cards */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {Object.entries(health.checks).map(([name, check]) => {
              const CheckIcon = getCheckIcon(name);
              const statusColor = getStatusColor(check.status);
              const StatusCheckIcon = getStatusIcon(check.status);

              return (
                <Card
                  key={name}
                  bg={cardBg}
                  borderWidth={1}
                  borderColor={borderColor}
                >
                  <CardHeader pb={3}>
                    <HStack justify="space-between">
                      <HStack spacing={3}>
                        <Icon as={CheckIcon} boxSize={5} />
                        <Heading size="md" textTransform="capitalize">
                          {name.replace('-', ' ')}
                        </Heading>
                      </HStack>
                      <Badge colorScheme={statusColor} fontSize="sm">
                        <HStack spacing={1}>
                          <Icon as={StatusCheckIcon} />
                          <Text>{check.status}</Text>
                        </HStack>
                      </Badge>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack align="stretch" spacing={3}>
                      {check.message && (
                        <Text fontSize="sm" color="gray.600">
                          {check.message}
                        </Text>
                      )}

                      {check.duration && (
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.500">
                            Response Time:
                          </Text>
                          <Code fontSize="sm">
                            {formatDuration(check.duration)}
                          </Code>
                        </HStack>
                      )}

                      {check.details &&
                        Object.keys(check.details).length > 0 && (
                          <>
                            <Divider />
                            <Accordion allowToggle>
                              <AccordionItem border="none">
                                <AccordionButton px={0}>
                                  <Box flex="1" textAlign="left">
                                    <Text fontSize="sm" fontWeight="medium">
                                      Details
                                    </Text>
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel px={0}>
                                  <VStack align="stretch" spacing={2}>
                                    {Object.entries(check.details).map(
                                      ([key, value]) => (
                                        <HStack
                                          key={key}
                                          justify="space-between"
                                        >
                                          <Text fontSize="sm" color="gray.500">
                                            {key}:
                                          </Text>
                                          <Code fontSize="xs">
                                            {typeof value === 'object'
                                              ? JSON.stringify(value, null, 2)
                                              : String(value)}
                                          </Code>
                                        </HStack>
                                      )
                                    )}
                                  </VStack>
                                </AccordionPanel>
                              </AccordionItem>
                            </Accordion>
                          </>
                        )}

                      {/* Special handling for memory check */}
                      {(() => {
                        if (
                          name === 'memory' &&
                          check.details &&
                          'heapPercentage' in check.details &&
                          typeof check.details.heapPercentage === 'number'
                        ) {
                          const heapPercentage = check.details
                            .heapPercentage as number;
                          return (
                            <Box>
                              <HStack justify="space-between" mb={2}>
                                <Text fontSize="sm">Heap Usage</Text>
                                <Text fontSize="sm">{heapPercentage}%</Text>
                              </HStack>
                              <Progress
                                value={heapPercentage}
                                colorScheme={
                                  heapPercentage > 90
                                    ? 'red'
                                    : heapPercentage > 75
                                      ? 'yellow'
                                      : 'green'
                                }
                                size="sm"
                                borderRadius="full"
                              />
                            </Box>
                          );
                        }
                        return null;
                      })()}
                    </VStack>
                  </CardBody>
                </Card>
              );
            })}
          </SimpleGrid>

          {/* API Documentation Link */}
          <Box pt={4}>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              This page automatically refreshes every 30 seconds. For API
              access, use <Code>/api/health</Code> endpoint.
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}
