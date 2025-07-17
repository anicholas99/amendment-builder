import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextRouter } from 'next/router';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import { TestDataFactory } from './test-factory';

// Mock router
export const mockRouter: NextRouter = {
  basePath: '',
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
};

// Test query client with shorter retry/cache times
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Mock session for authenticated tests
export const mockSession = {
  user: {
    email: 'test@example.com',
    name: 'Test User',
    sub: 'auth0|123',
    tenantId: 'tenant-1',
    role: 'USER',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

interface AllTheProvidersProps {
  children: React.ReactNode;
  session?: any;
  router?: Partial<NextRouter>;
}

// Mock SessionProvider since we don't use next-auth
const MockSessionProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// All providers wrapper
export function AllTheProviders({
  children,
  session = mockSession,
  router = mockRouter,
}: AllTheProvidersProps) {
  const queryClient = createTestQueryClient();
  const mergedRouter = { ...mockRouter, ...router };

  return (
    <MockSessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RouterContext.Provider value={mergedRouter as NextRouter}>
            {children}
          </RouterContext.Provider>
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </MockSessionProvider>
  );
}

// Custom render function
export function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    session?: any;
    router?: Partial<NextRouter>;
  }
) {
  const { session, router, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders session={session} router={router}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
}

// Test utilities
export const waitForAsync = () =>
  new Promise(resolve => setTimeout(resolve, 0));

export function mockFetch(response: any, status = 200) {
  // Create a mock Headers object with entries() method
  const mockHeaders = new Map([['content-type', 'application/json']]);
  const headers = {
    get: (key: string) => mockHeaders.get(key.toLowerCase()),
    set: (key: string, value: string) =>
      mockHeaders.set(key.toLowerCase(), value),
    has: (key: string) => mockHeaders.has(key.toLowerCase()),
    delete: (key: string) => mockHeaders.delete(key.toLowerCase()),
    entries: () => mockHeaders.entries(),
    forEach: (callback: (value: string, key: string) => void) => {
      mockHeaders.forEach((value, key) => callback(value, key));
    },
  };

  const mockResponse = {
    ok: status >= 200 && status < 300,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response),
    clone: function () {
      // Return a new mock response with the same properties
      return {
        ok: this.ok,
        status: this.status,
        json: async () => response,
        text: async () => JSON.stringify(response),
        headers: this.headers,
        clone: this.clone,
      };
    },
    headers,
  };

  global.fetch = jest.fn(() =>
    Promise.resolve(mockResponse as unknown as Response)
  );
}

export function mockFetchError(message = 'Network error') {
  global.fetch = jest.fn(() => Promise.reject(new Error(message)));
}

// API route testing helpers
export function createMockNextApiRequest(overrides?: any) {
  return TestDataFactory.createMockRequest(overrides);
}

export function createMockNextApiResponse() {
  return TestDataFactory.createMockResponse();
}

// Mock Prisma client helper
export function createMockPrismaClient() {
  return TestDataFactory.createMockPrismaClient();
}

// Environment setup
export function setupTestEnvironment() {
  // Mock console methods to reduce test noise
  const originalConsole = { ...console };

  beforeAll(() => {
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  // Reset mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
    TestDataFactory.reset();
  });
}

// Re-export everything from test-factory for convenience
export * from './test-factory';

// Additional exports for backwards compatibility
export const createMockApiResponse = TestDataFactory.createMockApiResponse;
export const createApiResponse = TestDataFactory.createApiResponse;

// Export individual mock creation functions for backwards compatibility
export const createMockUser =
  TestDataFactory.createMockUser.bind(TestDataFactory);
export const createMockTenant =
  TestDataFactory.createMockTenant.bind(TestDataFactory);
export const createMockProject =
  TestDataFactory.createMockProject.bind(TestDataFactory);
export const createMockInvention =
  TestDataFactory.createMockInvention.bind(TestDataFactory);
export const createMockClaim =
  TestDataFactory.createMockClaim.bind(TestDataFactory);
export const createMockProjectFigure =
  TestDataFactory.createMockProjectFigure.bind(TestDataFactory);
export const createMockCitationJob =
  TestDataFactory.createMockCitationJob.bind(TestDataFactory);
export const createMockCitationMatch =
  TestDataFactory.createMockCitationMatch.bind(TestDataFactory);
export const createMockSavedPriorArt =
  TestDataFactory.createMockSavedPriorArt.bind(TestDataFactory);
export const createMockProjectDocument =
  TestDataFactory.createMockProjectDocument.bind(TestDataFactory);
export const createMockDraftDocument =
  TestDataFactory.createMockDraftDocument.bind(TestDataFactory);
export const createMockSearchHistory =
  TestDataFactory.createMockSearchHistory.bind(TestDataFactory);
export const createMockClaimElement =
  TestDataFactory.createMockClaimElement.bind(TestDataFactory);
export const createMockFigureElements =
  TestDataFactory.createMockFigureElements.bind(TestDataFactory);
export const createMockSavedCitation =
  TestDataFactory.createMockSavedCitation.bind(TestDataFactory);
export const createMockSession =
  TestDataFactory.createMockSession.bind(TestDataFactory);
export const createMockRequest =
  TestDataFactory.createMockRequest.bind(TestDataFactory);
export const createMockResponse =
  TestDataFactory.createMockResponse.bind(TestDataFactory);
export const createMockApiError =
  TestDataFactory.createMockApiError.bind(TestDataFactory);
export const createPrismaError =
  TestDataFactory.createPrismaError.bind(TestDataFactory);
