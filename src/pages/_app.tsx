import React, { useEffect, useState, lazy, Suspense } from 'react';
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
import { Toaster } from '@/components/ui/toaster';
import '../styles/globals.css';
import '../styles/transitions.css';
import '../styles/appLayout.css';
import '../styles/resizeHandle.css';
import '../styles/scrollbar.css';
import '../styles/chat-animations.css';
import { AuthProvider } from '../contexts/AuthProvider';
import { TenantProvider } from '../contexts/TenantContext';
import { isDevelopment } from '@/config/environment.client';
import { initializeApiSecurity } from '@/lib/api/apiClient';
import { RequestManager } from '@/lib/api/requestManager';
import { useSessionRefresh } from '@/hooks/useSessionRefresh';
import { RequestManagerProvider } from '@/contexts/RequestManagerContext';
import { logger } from '@/utils/clientLogger';
import { ClientServicesProvider } from '@/contexts/ClientServicesContext';
import { OptimizedLoadingProvider } from '@/components/common/OptimizedLoadingStrategy';

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
// Use the structured logger from '@/server/logger' for logging needs

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
    const initApp = async () => {
      try {
        // Initialize API security (CSRF, etc.)
        await initializeApiSecurity();

        // Pre-warm critical API caches on app load
        // Create a temporary instance for initial cache warming
        const requestManager = new RequestManager();
        await requestManager.prewarmCache();
      } catch (error) {
        logger.error('Failed to initialize app:', error);
      }
    };
    initApp();
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Amendment Builder</title>
      </Head>
      <ErrorBoundary>
        {/* Wrap everything needing React Query with the Provider */}
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TenantProvider>
              <RequestManagerProvider>
                <ClientServicesProvider>
                  {/* Pass router down to AppInner */}
                  <AppInner
                    Component={Component}
                    pageProps={pageProps}
                    isPublicPage={isPublicPage}
                  />
                  <Toaster />
                </ClientServicesProvider>
              </RequestManagerProvider>
            </TenantProvider>
          </AuthProvider>
          {/* React Query DevTools for debugging in development */}
          {isDevelopment && (
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
            <OptimizedLoadingProvider>
              {isPublicPage ? (
                <Component {...pageProps} />
              ) : (
                <AuthGuard>
                  <Component {...pageProps} />
                </AuthGuard>
              )}
            </OptimizedLoadingProvider>
          </ProjectProviders>
        </LayoutProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default MyApp;
