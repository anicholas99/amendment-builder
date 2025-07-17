// Centralized environment mock for tests
export const mockEnvironment = {
  auth: {
    domain: 'test.auth0.com',
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    audience: 'test-audience',
    issuer: 'https://test.auth0.com/',
  },
  database: {
    url: 'mock://database',
  },
  app: {
    url: 'http://localhost:3000',
    env: 'test',
  },
  api: {
    openaiKey: 'test-key',
    anthropicKey: 'test-key',
  },
  storage: {
    accountName: 'test-account',
    accountKey: 'test-key',
    containerName: 'test-container',
  },
  redis: {
    url: 'redis://localhost:6379',
  },
  security: {
    jwtSecret: 'test-secret',
    encryptionKey: 'test-encryption-key',
  },
};

export const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

// Mock the environment module
jest.mock('@/config/environment', () => ({
  environment: mockEnvironment,
  logger: mockLogger,
}));
