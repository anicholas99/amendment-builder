import { useEffect } from 'react';
import { logger } from '@/lib/monitoring/logger';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Center,
  Icon,
  Container,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { FaLock } from 'react-icons/fa';
import { redirectToLogin } from '@/lib/auth/redirects';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { returnTo } = router.query;

  // Redirect to projects page if already authenticated
  useEffect(() => {
    if (user) {
      router.push((returnTo as string) || '/projects');
    }
  }, [user, router, returnTo]);

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Handle login button click
  const handleLogin = async () => {
    try {
      redirectToLogin(returnTo as string);
    } catch (error) {
      logger.error('Login error:', error);
    }
  };

  return (
    <Box minH="100vh" py="48px" bg={bgColor}>
      <Container maxW="lg">
        <Box
          bg={cardBgColor}
          p="8"
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          boxShadow="xl"
        >
          <VStack spacing={6} align="center">
            <Box
              bg="blue.500"
              p="4"
              borderRadius="full"
              color={useColorModeValue('white', 'white')}
            >
              <Icon as={FaLock} w="24px" h="24px" />
            </Box>

            <Heading size="xl">Welcome to Patent Drafter</Heading>
            <Text color="gray.500" textAlign="center">
              Sign in to start drafting innovative patents with AI assistance
            </Text>

            <Button
              colorScheme="blue"
              size="lg"
              w="100%"
              h="50px"
              fontSize="16px"
              onClick={handleLogin}
              leftIcon={<Icon as={FaLock} />}
            >
              Sign in with IP Dashboard
            </Button>

            <Text fontSize="sm" color="gray.500">
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
