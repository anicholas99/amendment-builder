import React, { useEffect } from 'react';
import { logger } from '@/utils/clientLogger';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Lock } from 'lucide-react';
import { redirectToLogin } from '@/lib/auth/redirects';
import { LoadingState } from '@/components/common/LoadingState';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useThemeContext } from '@/contexts/ThemeContext';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { returnTo } = router.query;
  const { isDarkMode } = useThemeContext();

  // Redirect to homepage if already authenticated (homepage handles tenant routing)
  useEffect(() => {
    if (user) {
      router.push((returnTo as string) || '/');
    }
  }, [user, router, returnTo]);

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState
          variant="spinner"
          size="xl"
          message="Checking authentication..."
          fullScreen={true}
        />
      </div>
    );
  }

  // Handle login button click
  const handleLogin = async () => {
    try {
      redirectToLogin(returnTo as string);
    } catch (error) {
      logger.error('Login error:', error);
    }
  };

  return (
    <div
      className={cn(
        'min-h-screen py-12',
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      )}
    >
      <div className="container max-w-lg mx-auto px-4">
        <div
          className={cn(
            'p-8 border rounded-lg shadow-xl',
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          )}
        >
          <div className="flex flex-col items-center space-y-6">
            <div className="bg-blue-500 p-4 rounded-full text-white">
              <Lock size={24} />
            </div>

            <h1 className="text-3xl font-semibold">
              Welcome to Amendment Builder
            </h1>
            <p
              className={cn(
                'text-center',
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              )}
            >
              Sign in to start drafting innovative patents with AI assistance
            </p>

            <Button
              className="w-full h-[50px] text-base"
              size="lg"
              onClick={handleLogin}
            >
              <Lock className="mr-2 h-4 w-4" />
              Sign in with IP Dashboard
            </Button>

            <p
              className={cn(
                'text-sm text-center',
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              )}
            >
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
