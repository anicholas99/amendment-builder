import React, { ReactElement, ReactNode } from 'react';
import {
  render,
  RenderOptions,
  RenderResult,
  waitFor,
  fireEvent,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Note: Auth0 UserProvider will be replaced with IPD Identity integration
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { NextRouter } from 'next/router';
// ProjectProvider is no longer needed - contexts are split
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
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
        <ThemeProvider>
          <UserProvider user={user}>{children}</UserProvider>
          <Toaster />
        </ThemeProvider>
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
export async function waitForElement(
  testId: string,
  container: ParentNode = document
) {
  return waitFor(() => {
    const element = container.querySelector(`[data-testid="${testId}"]`);
    if (!element) {
      throw new Error(`Element with testId "${testId}" not found`);
    }
    return element as HTMLElement;
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
  options: Partial<{ status: number; error: boolean; message: string }> = {}
): Response {
  const { status = 200, error = false, message = 'Success' } = options;

  const responseBody = error ? { error: true, message } : data;

  return {
    ok: !error,
    status,
    json: async () => responseBody as unknown as T,
    text: async () => JSON.stringify(responseBody),
    headers: new Headers({ 'content-type': 'application/json' }),
  } as Response;
}

// Cleanup utilities
export function cleanupMocks() {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  if (global.fetch) {
    (global.fetch as jest.Mock).mockRestore();
  }
}
