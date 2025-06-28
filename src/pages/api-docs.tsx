import React from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Link,
  useTheme,
  useColorModeValue,
} from '@chakra-ui/react';
import 'swagger-ui-react/swagger-ui.css';

// Dynamic import to avoid SSR issues with swagger-ui-react
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <Box p={8} textAlign="center">
      <Text>Loading API documentation...</Text>
    </Box>
  ),
});

export default function ApiDocsPage() {
  const theme = useTheme();
  const bgSecondary = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const primaryColor = useColorModeValue('blue.600', 'blue.400');
  const primaryHover = useColorModeValue('blue.700', 'blue.300');

  return (
    <Box>
      {/* Header */}
      <Box
        bg={bgSecondary}
        borderBottom="1px solid"
        borderColor={borderColor}
        px={8}
        py={6}
      >
        <VStack align="start" spacing={4} maxW="1200px" mx="auto">
          <HStack spacing={4} align="center">
            <Heading size="lg">API Documentation</Heading>
            <Badge colorScheme="green">v1.0.0</Badge>
          </HStack>
          <Text color={textSecondary}>
            Enterprise REST API for Patent Drafter AI. All endpoints require
            authentication and tenant context.
          </Text>
          <HStack spacing={4} fontSize="sm">
            <Link href="/api/swagger" isExternal color="blue.500">
              OpenAPI Spec (JSON)
            </Link>
            <Text color={textSecondary}>•</Text>
            <Link
              href="https://github.com/your-org/patent-drafter-ai"
              isExternal
              color="blue.500"
            >
              GitHub Repository
            </Link>
            <Text color={textSecondary}>•</Text>
            <Link href="/docs/api" color="blue.500">
              Developer Guide
            </Link>
          </HStack>
        </VStack>
      </Box>

      {/* Swagger UI */}
      <Box
        sx={{
          '& .swagger-ui': {
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          '& .swagger-ui .topbar': {
            display: 'none',
          },
          '& .swagger-ui .info': {
            marginBottom: '2rem',
          },
          '& .swagger-ui .scheme-container': {
            backgroundColor: bgSecondary,
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem',
          },
          '& .swagger-ui .btn': {
            borderRadius: '6px',
          },
          '& .swagger-ui .btn.authorize': {
            backgroundColor: primaryColor,
            color: 'white',
            border: 'none',
          },
          '& .swagger-ui .btn.authorize:hover': {
            backgroundColor: primaryHover,
          },
          '& .swagger-ui .opblock.opblock-post': {
            borderColor: '#49cc90',
            backgroundColor: '#49cc9010',
          },
          '& .swagger-ui .opblock.opblock-get': {
            borderColor: '#61affe',
            backgroundColor: '#61affe10',
          },
          '& .swagger-ui .opblock.opblock-put': {
            borderColor: '#fca130',
            backgroundColor: '#fca13010',
          },
          '& .swagger-ui .opblock.opblock-delete': {
            borderColor: '#f93e3e',
            backgroundColor: '#f93e3e10',
          },
          '& .swagger-ui .opblock-summary': {
            borderRadius: '6px',
          },
          '& .swagger-ui .parameter__name': {
            fontWeight: '600',
          },
          '& .swagger-ui .parameter__type': {
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '0.875rem',
          },
          '& .swagger-ui table tbody tr td': {
            padding: '0.75rem',
          },
          '& .swagger-ui .response-col_status': {
            fontWeight: '600',
          },
          '& .swagger-ui .model-box': {
            borderRadius: '6px',
            border: `1px solid ${borderColor}`,
          },
          '& .swagger-ui .model': {
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '0.875rem',
          },
        }}
      >
        <SwaggerUI url="/api/swagger" />
      </Box>
    </Box>
  );
}
