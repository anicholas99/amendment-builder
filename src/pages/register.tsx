import React from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Text, VStack, Heading } from '@chakra-ui/react';

// This is a simplified stub to enable building
const RegisterPage = () => {
  const router = useRouter();

  return (
    <Box maxW="768px" mx="auto" px="16px" py="40px">
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Register Account
        </Heading>
        <Text textAlign="center">
          Registration is handled through our Auth system.
        </Text>
        <Box textAlign="center" pt="16px">
          <Button colorScheme="blue" onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

export default RegisterPage;
