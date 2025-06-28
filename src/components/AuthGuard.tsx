import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { Center, Spinner } from '@chakra-ui/react';
import { redirectToLogin } from '@/lib/auth/redirects';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Component to protect routes that require authentication
 * Redirects to login page if user is not authenticated
 */
export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <Center height="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!user) {
    redirectToLogin();
    return null;
  }

  return <>{children}</>;
};
