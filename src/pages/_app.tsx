import React, { useEffect, useState, lazy, Suspense } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/config/reactQueryConfig';
import { useGlobalErrorHandler } from '@/lib/api/queryClient';
import { AuthGuard } from '../components/AuthGuard';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { ProjectProviders } from '../contexts';
import { SidebarProvider } from '../contexts/SidebarContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LayoutProvider } from '../contexts/LayoutContext';
import '../styles/globals.css';
import '../styles/transitions.css';
import '../styles/darkMode.css';
import '../styles/ultraDarkMode.css';
import '../styles/appLayout.css';
import '../styles/resizeHandle.css';
import { AuthProvider } from '../contexts/AuthProvider';
import { TenantProvider } from '../contexts/TenantContext';
import theme from 'src/theme';
import { environment } from '@/config/environment';
import { initializeApiSecurity } from '@/lib/api/apiClient';
import { requestManager } from '@/lib/api/requestManager';
import { useSessionRefresh } from '@/hooks/useSessionRefresh';

// Lazy load React Query DevTools - only loaded in development
const ReactQueryDevtools = lazy(() =>
  import('@tanstack/react-query-devtools').then(mod => ({
    default: mod.ReactQueryDevtools,
  }))
);

// Pages that don't require authentication
const isPublicRoute = (pathname: string): boolean => {
  // Auth routes are always public
  if (pathname.startsWith('/api/auth/')) return true;

  // Login and register pages
  if (pathname === '/login' || pathname === '/register') return true;

  // Home page
  if (pathname === '/') return true;

  // Any route under /public is considered public
  if (pathname.startsWith('/public/')) return true;

  return false;
};

// Note: migrateLogging has been removed as modifying global console is an anti-pattern
// Use the structured logger from '@/lib/monitoring/logger' for logging needs

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // --- React Query Client Setup ---
  // Use state to ensure the client is only created once per app instance
  const [queryClient] = useState(() => createQueryClient());
  // --- End React Query Client Setup ---

  // Check if the current page requires authentication
  const isPublicPage =
    isPublicRoute(router.pathname) || router.pathname === '/_error';

  // Initialize security features on client side
  useEffect(() => {
    const initSecurity = async () => {
      await initializeApiSecurity();
      // Pre-warm cache with critical requests to prevent rate limiting on page refresh
      await requestManager.prewarmCache();
    };
    initSecurity();
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Patent Drafter AI</title>
      </Head>
      <ErrorBoundary>
        {/* Wrap everything needing React Query with the Provider */}
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TenantProvider>
              <ChakraProvider theme={theme}>
                {/* Pass router down to AppInner */}
                <AppInner
                  Component={Component}
                  pageProps={pageProps}
                  isPublicPage={isPublicPage}
                />
              </ChakraProvider>
            </TenantProvider>
          </AuthProvider>
          {/* React Query DevTools for debugging in development */}
          {environment.isDevelopment && (
            <Suspense fallback={<div>Loading...</div>}>
              <ReactQueryDevtools initialIsOpen={false} />
            </Suspense>
          )}
        </QueryClientProvider>
      </ErrorBoundary>
    </>
  );
}

// Inner component to ensure hooks like useToast and useCitationPolling have context
interface AppInnerProps {
  Component: AppProps['Component'];
  pageProps: AppProps['pageProps'];
  isPublicPage: boolean;
}

function AppInner({ Component, pageProps, isPublicPage }: AppInnerProps) {
  // Enable global error handling for mutations
  useGlobalErrorHandler();

  // Automatically refresh session before it expires
  // Must be inside QueryClientProvider
  useSessionRefresh();

  return (
    <ThemeProvider>
      <SidebarProvider>
        <LayoutProvider>
          <ProjectProviders>
            {isPublicPage ? (
              <Component {...pageProps} />
            ) : (
              <AuthGuard>
                <Component {...pageProps} />
              </AuthGuard>
            )}
          </ProjectProviders>
        </LayoutProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default MyApp;
