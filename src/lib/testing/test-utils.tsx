import React, { ReactElement, ReactNode } from 'react';
import {
  render,
  RenderOptions,
  RenderResult,
  waitFor,
  fireEvent,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react';
// Note: Auth0 UserProvider will be replaced with IPD Identity integration
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { NextRouter } from 'next/router';
import { theme } from '@/theme';
// ProjectProvider is no longer needed - contexts are split
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ProjectData as Project } from '@/types/project';

// Mock Next.js router
const RouterContext = React.createContext<NextRouter | null>(null);

// Mock router
export function mockRouter(props: Partial<NextRouter> = {}): NextRouter {
  return {
    basePath: '',
    pathname: '/',
    route: '/',
    asPath: '/',
    query: {},
    push: jest.fn(() => Promise.resolve(true)),
    replace: jest.fn(() => Promise.resolve(true)),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(() => Promise.resolve()),
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
    ...props,
  } as NextRouter;
}

// Type for Auth0 user
interface Auth0User {
  sub: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  picture?: string;
  [key: string]: unknown;
}

// Mock user
export const mockUser: Auth0User = {
  sub: 'auth0|123456',
  name: 'Test User',
  email: 'test@example.com',
  email_verified: true,
  picture: 'https://example.com/avatar.jpg',
};

// Mock project
export const mockProject: Partial<Project> = {
  id: 'test-project-id',
  name: 'Test Project',
  userId: 'test-user-id',
  status: 'draft',
  textInput: 'Test invention description',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// Test providers
interface TestProviderProps {
  children: ReactNode;
  router?: NextRouter;
  user?: Auth0User;
  project?: Partial<Project>;
  queryClient?: QueryClient;
}

export function TestProviders({
  children,
  router = mockRouter(),
  user = mockUser,
  project = mockProject,
  queryClient,
}: TestProviderProps) {
  const testQueryClient =
    queryClient ||
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
        },
      },
    });

  return (
    <RouterContext.Provider value={router}>
      <QueryClientProvider client={testQueryClient}>
        <ChakraProvider theme={theme}>
          <ThemeProvider>
            <UserProvider user={user}>{children}</UserProvider>
          </ThemeProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </RouterContext.Provider>
  );
}

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    router?: NextRouter;
    user?: Auth0User;
    project?: Partial<Project>;
    queryClient?: QueryClient;
  }
): RenderResult => {
  const { router, user, project, queryClient, ...renderOptions } =
    options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders
        router={router}
        user={user}
        project={project}
        queryClient={queryClient}
      >
        {children}
      </TestProviders>
    ),
    ...renderOptions,
  });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// API mocking utilities
export function mockFetch<T = unknown>(
  response: T,
  options: {
    status?: number;
    headers?: Record<string, string>;
    [key: string]: unknown;
  } = {}
) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
      headers: new Headers({
        'content-type': 'application/json',
      }),
      ...options,
    } as Response)
  );
}

// Database mocking utilities
interface MockPrismaClient {
  project: {
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    count: jest.Mock;
    groupBy: jest.Mock;
  };
  user: {
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  tenant: {
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  $connect: jest.Mock;
  $disconnect: jest.Mock;
  $queryRaw: jest.Mock;
  $executeRaw: jest.Mock;
  $transaction: jest.Mock;
}

export function mockPrisma(): MockPrismaClient {
  const mockPrismaClient: MockPrismaClient = {
    project: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
    $transaction: jest.fn((fn: (client: MockPrismaClient) => unknown) =>
      fn(mockPrismaClient)
    ),
  };

  return mockPrismaClient;
}

// Wait utilities
export async function waitForElement(testId: string, container = document) {
  return waitFor(() => {
    const element = container.querySelector(`[data-testid="${testId}"]`);
    if (!element) throw new Error(`Element with testId "${testId}" not found`);
    return element;
  });
}

// Form testing utilities
export async function fillForm(
  container: HTMLElement,
  formData: Record<string, string>
) {
  for (const [name, value] of Object.entries(formData)) {
    const input = container.querySelector(
      `[name="${name}"]`
    ) as HTMLInputElement;
    if (input) {
      fireEvent.change(input, { target: { value } });
    }
  }
}

// API testing utilities
export function createMockApiResponse<T>(
  data: T,
  options: Partial<{
    status: number;
    error: boolean;
    message: string;
  }> = {}
): Response {
  const { status = 200, error = false, message = 'Success' } = options;

  const responseBody = error ? { error: true, message } : data;

  return {
    ok: !error,
    status,
    json: async () => responseBody,
    text: async () => JSON.stringify(responseBody),
    headers: new Headers({
      'content-type': 'application/json',
    }),
  } as Response;
}

// Testing hooks
export function renderHook<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options?: {
    initialProps?: TProps;
    wrapper?: React.ComponentType;
  }
) {
  let result: TResult;
  const TestComponent = ({ props }: { props?: TProps }) => {
    result = hook(props || ({} as TProps));
    return null;
  };

  const { rerender, ...rest } = render(
    <TestComponent props={options?.initialProps} />,
    { wrapper: options?.wrapper }
  );

  return {
    result: () => result!,
    rerender: (newProps?: TProps) =>
      rerender(<TestComponent props={newProps} />),
    ...rest,
  };
}

// Accessibility testing
export async function checkA11y(container: HTMLElement) {
  try {
    const axeModule = await import('jest-axe');
    const { axe, toHaveNoViolations } = axeModule;
    expect.extend(toHaveNoViolations);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  } catch (error) {
    // Using logger instead of console for consistent logging
    import('@/lib/monitoring/logger').then(({ logger }) => {
      logger.warn('jest-axe not installed, skipping accessibility check');
    });
  }
}

// Snapshot testing utilities
export function createSnapshotTest<
  P extends Record<string, unknown> = Record<string, never>,
>(
  ComponentName: string,
  Component: React.ComponentType<P>,
  props: P = {} as P
) {
  it(`${ComponentName} matches snapshot`, () => {
    const { container } = render(<Component {...props} />);
    expect(container.firstChild).toMatchSnapshot();
  });
}

// Performance testing utilities
export function measureRenderTime<
  P extends Record<string, unknown> = Record<string, never>,
>(Component: React.ComponentType<P>, props: P = {} as P): number {
  const start = performance.now();
  render(<Component {...props} />);
  const end = performance.now();
  return end - start;
}

// Mock data generators
export const generateMockProject = (overrides = {}) => ({
  id: `project-${Math.random().toString(36).substring(2, 11)}`,
  name: 'Mock Project',
  userId: 'mock-user-id',
  tenantId: 'mock-tenant-id',
  status: 'DRAFT',
  textInput: 'Mock invention description',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const generateMockUser = (overrides = {}) => ({
  id: `user-${Math.random().toString(36).substring(2, 11)}`,
  email: 'mock@example.com',
  name: 'Mock User',
  role: 'USER',
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Cleanup utilities
export function cleanupMocks() {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  if (global.fetch) {
    (global.fetch as jest.Mock).mockRestore();
  }
}
