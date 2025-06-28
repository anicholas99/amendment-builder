const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases (if you're using them in your app)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  // Exclude tests that specify node environment
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    // Files that have @jest-environment node should be run with jest.config.node.js
    '<rootDir>/src/repositories/__tests__/userRepository.test.ts',
    '<rootDir>/src/repositories/project/__tests__/projectRepository.test.ts',
    '<rootDir>/src/pages/api/auth/__tests__/auth.strategic.test.ts',
  ],
  // Handle ESM modules
  transformIgnorePatterns: [
    'node_modules/(?!(@panva/hkdf|@auth0/nextjs-auth0)/)',
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
