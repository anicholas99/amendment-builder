// Import jest-dom for DOM testing assertions
import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';
import React from 'react';
import { TextDecoder, TextEncoder } from 'util';
import { loadEnvConfig } from '@next/env';
import dotenv from 'dotenv';
// import 'whatwg-fetch';
import crypto from 'crypto';
// Import OpenAI shim for Node environment
import 'openai/shims/node';

// Import and load testing environment variables
dotenv.config({ path: '.env.test' });

// Load Next.js environment variables
const projectDir = process.cwd();
loadEnvConfig(projectDir);

// Set up text encoder/decoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill for Web APIs used by Next.js
global.Request = jest.fn();
global.Response = jest.fn();
global.Headers = class Headers {
  constructor() {
    this.headers = new Map();
  }
  
  get(name) {
    return this.headers.get(name.toLowerCase());
  }
  
  set(name, value) {
    this.headers.set(name.toLowerCase(), value);
  }
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.location.reload - Leave as-is to avoid conflicts

// Polyfill for crypto.subtle needed by some libraries (e.g., auth libraries)
Object.defineProperty(global.self, 'crypto', {
  value: {
    subtle: crypto.webcrypto.subtle,
    getRandomValues: arr => crypto.randomBytes(arr.length),
  },
});

// Mock environment variables
process.env.DATABASE_URL = 'mock_database_url';
process.env.AZURE_STORAGE_CONNECTION_STRING = 'mock_connection_string';
process.env.AZURE_STORAGE_CONTAINER_NAME = 'mock-container';
process.env.OPENAI_API_KEY = 'mock_openai_key';
process.env.PATBASE_USERNAME = 'mock_patbase_user';
process.env.PATBASE_PASSWORD = 'mock_patbase_password';
process.env.AUTH0_SECRET = 'mock_auth0_secret';
process.env.AUTH0_BASE_URL = 'http://localhost:3000';
process.env.AUTH0_ISSUER_BASE_URL = 'https://mock.auth0.com';
process.env.AUTH0_CLIENT_ID = 'mock_client_id';
process.env.AUTH0_CLIENT_SECRET = 'mock_client_secret';

// Mock @/config/environment module with complete structure
jest.mock('@/config/environment', () => ({
  environment: {
    env: 'test',
    isDevelopment: false,
    isProduction: false,
    isTest: true,
    isQA: false,
    appName: 'Patent Drafter AI',
    version: '1.0.0-test',
    appUrl: 'http://localhost:3000',
    
    // API settings
    api: {
      baseUrl: 'http://localhost:3000/api',
      timeout: 30000,
      rateLimitWindow: 60000,
      maxRequestsPerWindow: 100,
      apiKey: 'test-api-key',
      internalApiKey: 'test-internal-api-key',
    },
    
    // Auth settings
    auth: {
      provider: 'auth0',
      domain: 'https://test.auth0.com',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      audience: 'https://api.test.com',
      scope: 'openid profile email',
      redirectUri: 'http://localhost:3000/api/auth/callback',
      logoutUri: 'http://localhost:3000',
      sessionSecret: 'test-session-secret',
    },
    
    // Database settings
    database: {
      host: 'localhost',
      name: 'testdb',
      user: 'testuser',
      password: 'testpass',
      port: 1433,
      useSSL: false,
      url: 'postgresql://test:test@localhost:5432/test',
      poolSize: 10,
    },
    
    // Feature flags
    features: {
      useLocalStorage: false,
      multiTenant: true,
      enableDrafting: true,
      enableCostTracking: false,
      enablePriorArtSearch: true,
      aiSuggestions: true,
      export: true,
      versionHistory: true,
      useCitationWorker: false,
      enableDeepAnalysis: false,
      enableExaminerAnalysis: false,
    },
    
    // UI settings
    ui: {
      defaultSidebarWidth: 300,
      toastDuration: 5000,
      maxClaimVersions: 20,
    },
    
    // Logging settings
    logging: {
      level: 'error',
      enableConsole: true,
      enableRemote: false,
      remoteEndpoint: '',
      logEnv: 'test',
    },
    
    // Deployment info
    deployment: {
      version: '1.0.0-test',
      buildDate: new Date().toISOString(),
      commitHash: 'test-hash',
    },
    
    // OpenAI settings
    openai: {
      apiKey: 'sk-test',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 8000,
      deepAnalysisModel: 'gpt-4',
      deepAnalysisTimeout: 180000,
      deepAnalysisMaxCitationsPerElement: 3,
    },
    
    // Azure settings
    azure: {
      storageConnectionString: 'DefaultEndpointsProtocol=https;AccountName=test;',
      storageContainerName: 'test-container',
      openai: {
        apiKey: 'test-azure-key',
        endpoint: 'https://test.openai.azure.com',
        deploymentName: 'test-deployment',
      },
    },
  },
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  },
  isProduction: false,
  isDevelopment: false,
  isQA: false,
  isTest: true,
}));

// Mock @/config/env module
jest.mock('@/config/env', () => ({
  env: {
    NODE_ENV: 'test',
    NEXT_PUBLIC_APP_VERSION: '1.0.0-test',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_API_BASE_URL: 'http://localhost:3000/api',
    RATE_LIMIT_WINDOW: 60000,
    RATE_LIMIT_MAX_REQUESTS: 100,
    LOG_LEVEL: 'error',
    DEFAULT_TENANT_SLUG: 'test-tenant',
    CSRF_SECRET: 'test-csrf-secret',
    CSRF_COOKIE_NAME: 'csrf-token',
    CSRF_HEADER_NAME: 'x-csrf-token',
    INTERNAL_API_KEY: 'test-internal-api-key',
    SERVICE_ACCOUNT_CLIENT_ID: 'test-service-client-id',
    SERVICE_ACCOUNT_CLIENT_SECRET: 'test-service-client-secret',
  }
}));

// Add missing environment variables
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3000/api';
process.env.NEXT_PUBLIC_APP_VERSION = '1.0.0';
process.env.RATE_LIMIT_WINDOW = '60';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';
process.env.LOG_LEVEL = 'error';
process.env.DEFAULT_TENANT_SLUG = 'default-tenant';
process.env.CSRF_SECRET = 'mock_csrf_secret';
process.env.CSRF_COOKIE_NAME = 'csrf-token';
process.env.CSRF_HEADER_NAME = 'x-csrf-token';
process.env.INTERNAL_API_KEY = 'mock_internal_api_key';
process.env.SERVICE_ACCOUNT_CLIENT_ID = 'mock_service_client_id';
process.env.SERVICE_ACCOUNT_CLIENT_SECRET = 'mock_service_client_secret';

// Mock toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
  toast: jest.fn(),
}));

// Mock Auth0 dependencies
jest.mock('@panva/hkdf', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@auth0/nextjs-auth0', () => ({
  getSession: jest.fn(),
  withApiAuthRequired: jest.fn((handler) => handler),
  withPageAuthRequired: jest.fn((component) => component),
}));

// Mock jose for Auth0
jest.mock('jose', () => ({
  compactDecrypt: jest.fn(),
  jwtVerify: jest.fn(),
  SignJWT: jest.fn(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn(),
  })),
}));

// Mock react-markdown
jest.mock('react-markdown', () => {
  return {
    __esModule: true,
    default: ({ children }) => <div>{children}</div>,
  };
});

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const actualPrisma = jest.requireActual('@prisma/client');
  return {
    ...actualPrisma,
    PrismaClient: jest.fn().mockImplementation(() => ({
      // Add mock implementations for Prisma methods used in tests
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      project: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      // Add other models as needed...
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    })),
  };
});

// Mock Azure Storage Blob Client
jest.mock('@azure/storage-blob', () => ({
  BlobServiceClient: {
    fromConnectionString: jest.fn().mockReturnValue({
      getContainerClient: jest.fn().mockReturnValue({
        createIfNotExists: jest.fn(),
        getBlockBlobClient: jest.fn().mockReturnValue({
          uploadData: jest.fn(),
          delete: jest.fn(),
        }),
        listBlobsFlat: jest.fn().mockReturnValue([]),
      }),
    }),
  },
}));

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    route: '/',
    pathname: '',
    query: '',
    asPath: '',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
    isReady: true,
  })),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: props => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Suppress console errors/warnings in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      /Warning: ReactDOM.render is no longer supported in React 18/.test(
        args[0]
      )
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (/Warning: useLayoutEffect does nothing on the server/.test(args[0])) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
