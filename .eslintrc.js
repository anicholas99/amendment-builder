const fs = require('fs');
const path = require('path');

const prettierOptions = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '.prettierrc'), 'utf8')
);

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'local', 'prettier'],
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  rules: {
    // Critical architectural rules to prevent future violations
    'local/no-direct-prisma-import': 'error',
    'local/no-direct-react-query-hooks': 'error',
    'local/no-legacy-error-handling': 'error',
    'local/no-direct-api-calls': 'error',
    'local/no-direct-env-access': 'error',
    'local/no-hardcoded-colors': 'error',
    'local/no-singleton-services': 'error',
    'local/no-console-logs': 'error',
    'local/require-secure-presets': 'error',
    // TEMPORARILY DISABLED: This rule has false positives on server-side code
    // 'local/no-unstable-deps': 'warn',
    
    // Prevent mixed exports in React components to maintain Fast Refresh boundaries
    'local/no-mixed-exports-in-components': 'warn',

    // SECURITY: Prevent any usage which can hide type safety issues
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'no-console': 'warn',
    'prefer-const': 'warn',
    'no-var': 'error',
    'no-unused-vars': 'off',
    'no-restricted-globals': [
      'error',
      {
        name: 'localStorage',
        message:
          'localStorage is FORBIDDEN for security reasons. Use React state, server-side storage, or URL params instead. See LOCALSTORAGE_REMOVAL_PLAN.md',
      },
      {
        name: 'setTimeout',
        message:
          'Use `useTimeout`, `useDebouncedCallback`, `useNextTick`, or React Query patterns instead of setTimeout. See dev_workflow.mdc for proper async patterns.',
      },
      {
        name: 'setInterval',
        message:
          'Use proper React hooks or React Query for polling instead of setInterval. See dev_workflow.mdc for proper patterns.',
      },
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector:
          "CallExpression[callee.object.name='console'][callee.property.name=/^(log|info|warn|error)$/]",
        message:
          "Use the logger from '@/lib/config/environment' instead. Example: logger.info('message')",
      },
      {
        selector:
          "MemberExpression[object.name='Math'][property.name='random']",
        message:
          'Use crypto-secure random functions (crypto.randomUUID / randomBytes) instead of Math.random()',
      },
      {
        selector:
          "CallExpression[callee.type='Identifier'][callee.name='setTimeout']",
        message:
          'Use `useTimeout`, `useDebouncedCallback`, `useNextTick`, or React Query patterns instead of setTimeout. See dev_workflow.mdc for proper async patterns.',
      },
      {
        selector:
          "CallExpression[callee.type='Identifier'][callee.name='setInterval']",
        message:
          'Use proper React hooks or React Query for polling instead of setInterval. See dev_workflow.mdc for proper patterns.',
      },
      {
        selector:
          "NewExpression[callee.name='Promise'] > :function > BlockStatement > :not(TryStatement)",
        message:
          'Promise constructor should include proper error handling. Wrap Promise body in try/catch or use async/await patterns.',
      },
      {
        selector:
          "CallExpression[callee.type='MemberExpression'][callee.property.name='then']:not([arguments.1])",
        message:
          'Promise .then() calls should include error handling. Add .catch() or use async/await with try/catch.',
      },
      {
        selector:
          "ExpressionStatement > CallExpression[callee.type='MemberExpression'][callee.object.type='CallExpression'][callee.property.name=/^(then|catch)$/]",
        message:
          'Avoid fire-and-forget promises. Assign to variable, use await, or explicitly handle with proper error logging.',
      },
    ],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/no-unescaped-entities': 'warn',
    'import/no-anonymous-default-export': 'warn',
    'prettier/prettier': ['error', prettierOptions],
    'no-restricted-properties': [
      'warn',
      {
        object: 'Math',
        property: 'random',
        message:
          'Use crypto-secure random functions (crypto.randomUUID / randomBytes) instead of Math.random()',
      },
    ],
    'no-undef': 'error',
    'no-restricted-imports': [
      'error',
      {
        paths: [
          // Client-server boundary enforcement
          {
            name: '@/config/environment',
            message: 'Use @/config/environment.client in React/client code',
          },
          {
            name: '@/lib/monitoring/logger',
            message: 'Use @/utils/clientLogger in React/client code',
          },
          {
            name: '@/lib/logger/serverLogger',
            message: 'Use @/utils/clientLogger in React/client code',
          },
          // Deprecated error handlers
          {
            name: '@/utils/errorHandler',
            message:
              '🚨 DEPRECATED: Use ApplicationError from @/lib/error instead. Legacy error handlers have been removed.',
          },
          {
            name: '@/utils/apiErrorHandler',
            message:
              '🚨 DEPRECATED: Use ApplicationError from @/lib/error instead. Legacy error handlers have been removed.',
          },
          {
            name: '@/utils/error-utils',
            message:
              '🚨 DEPRECATED: Use ApplicationError from @/lib/error instead. Legacy error handlers have been removed.',
          },
        ],
        patterns: [
          {
            group: ['**/server/**', '**/repositories/**'],
            message: 'Server code and repositories must not be imported in React components or client code',
          },
          {
            group: ['@/repositories/*'],
            message: 'Repositories must only be imported server-side. Use API calls from client code instead',
          },
        ],
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'dist/',
    'build/',
    '*.config.js',
    'public/',
    '.env*',
    'coverage/',
  ],
  overrides: [
    {
      files: [
        'src/utils/logging.ts',
        'src/lib/config/environment.ts',
        'scripts/**/*',
        '**/*.test.ts',
        '**/*.test.tsx',
        'src/pages/debug-tools/**/*',
      ],
      rules: {
        'no-console': 'off',
        'no-restricted-syntax': 'off',
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        'no-undef': 'off',
      },
    },
    {
      files: ['**/__tests__/**/*', '**/*.test.*', '**/*.spec.*'],
      env: {
        jest: true,
      },
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
      rules: {
        'no-undef': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-restricted-globals': 'off',
        'no-restricted-syntax': 'off',
      },
    },
    {
      files: ['src/ui/**/*'],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
    {
      files: ['src/theme/**/*'],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
    {
      files: ['src/components/**/*', 'src/features/**/*', 'src/pages/**/*'],
      rules: {
        'no-restricted-imports': 'warn',
      },
    },
    {
      files: ['src/utils/**/*', 'src/types/**/*'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': 'warn',
      },
    },
    {
      files: ['src/pages/api/**/*'],
      rules: {
        // API routes are server-side Node.js code, NOT React components
        'react-hooks/rules-of-hooks': 'off',
        'react-hooks/exhaustive-deps': 'off',
        'local/no-unstable-deps': 'off',
        'no-restricted-globals': [
          'error',
          {
            name: 'localStorage',
            message:
              'localStorage is FORBIDDEN for security reasons. Use React state, server-side storage, or URL params instead. See LOCALSTORAGE_REMOVAL_PLAN.md',
          },
          // setTimeout and setInterval are OK in API routes (server-side)
        ],
        'no-restricted-syntax': [
          'error',
          {
            selector:
              "CallExpression[callee.object.name='console'][callee.property.name=/^(log|info|warn|error)$/]",
            message:
              "Use the logger from '@/lib/config/environment' instead. Example: logger.info('message')",
          },
          // Remove setTimeout/setInterval restrictions for API routes
          {
            selector: 'CallExpression[callee.name="getPrismaClient"]',
            message:
              '🚨 CRITICAL: getPrismaClient() calls are FORBIDDEN in API routes. Use repository functions instead. See db-access-consistency.mdc rule.',
          },
          {
            selector: 'MemberExpression[object.name="prisma"]',
            message:
              '🚨 CRITICAL: Direct prisma.* calls are FORBIDDEN in API routes. Use repository functions instead. See db-access-consistency.mdc rule.',
          },
          {
            selector: 'VariableDeclarator[id.name="prisma"]',
            message:
              '🚨 CRITICAL: Creating prisma variables is FORBIDDEN in API routes. Use repository functions instead. See db-access-consistency.mdc rule.',
          },
        ],
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: '@/lib/prisma',
                message:
                  '🚨 CRITICAL: Direct Prisma imports are FORBIDDEN in API routes. Use repository functions instead. See db-access-consistency.mdc rule.',
              },
              {
                name: '@prisma/client',
                message:
                  '🚨 CRITICAL: Direct Prisma client imports are FORBIDDEN in API routes. Use repository functions instead. See db-access-consistency.mdc rule.',
              },
            ],
            patterns: [
              {
                group: ['**/prisma*'],
                message:
                  '🚨 CRITICAL: Direct Prisma imports are FORBIDDEN in API routes. Use repository functions instead. See db-access-consistency.mdc rule.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/features/**/*', 'src/components/**/*', 'src/pages/**/*'],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector:
              'CallExpression[callee.name="useEffect"] CallExpression[callee.name="apiFetch"]',
            message:
              '🚨 ANTI-PATTERN: Using apiFetch inside useEffect is FORBIDDEN. Use React Query hooks instead. See CANONICAL_DATA_ACCESS_PATTERNS.md',
          },
          {
            selector:
              'CallExpression[callee.name="useEffect"] > :function CallExpression[callee.name="apiFetch"]',
            message:
              '🚨 ANTI-PATTERN: Using apiFetch inside useEffect is FORBIDDEN. Use React Query hooks instead. See CANONICAL_DATA_ACCESS_PATTERNS.md',
          },
          {
            selector:
              'CallExpression[callee.name="apiFetch"] Literal[value^="/api/"]',
            message:
              '🚨 MAGIC STRING: Hardcoded API routes are FORBIDDEN. Use API_ROUTES constants instead. Import from @/constants/apiRoutes',
          },
        ],
      },
    },
    {
      files: ['src/workers/**/*', 'scripts/**/*'],
      rules: {
        'no-restricted-globals': [
          'warn',
          {
            name: 'setTimeout',
            message:
              'Use proper async patterns or delays. In workers, consider async await with delay utilities.',
          },
          {
            name: 'setInterval',
            message:
              'Use proper polling loops with async/await and controlled intervals.',
          },
        ],
      },
    },
    {
      files: ['src/server/**/*', 'src/lib/api/**/*', 'src/lib/security/**/*'],
      rules: {
        // Server-side code can use setTimeout/setInterval appropriately
        'no-restricted-globals': [
          'error',
          {
            name: 'localStorage',
            message:
              'localStorage is not available in server-side code.',
          },
        ],
        'no-restricted-syntax': [
          'error',
          {
            selector:
              "CallExpression[callee.object.name='console'][callee.property.name=/^(log|info|warn|error)$/]",
            message:
              "Use the logger from '@/lib/config/environment' instead. Example: logger.info('message')",
          },
          {
            selector:
              "MemberExpression[object.name='Math'][property.name='random']",
            message:
              'Use crypto-secure random functions (crypto.randomUUID / randomBytes) instead of Math.random()',
          },
          // setTimeout/setInterval are OK in server-side code
        ],
      },
    },
    {
      files: ['src/middleware/**/*'],
      rules: {
        // Middleware files are server-side code used by API routes
        'react-hooks/rules-of-hooks': 'off',
        'react-hooks/exhaustive-deps': 'off',
        'local/no-unstable-deps': 'off',
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: '@/config/environment.client',
                message: 'Use @/config/environment in server-side middleware code',
              },
              {
                name: '@/utils/clientLogger',
                message: 'Use @/server/logger in server-side middleware code',
              },
            ],
          },
        ],
        'no-restricted-globals': [
          'error',
          {
            name: 'localStorage',
            message: 'localStorage is not available in server-side code.',
          },
        ],
        'no-restricted-syntax': [
          'error',
          {
            selector:
              "CallExpression[callee.object.name='console'][callee.property.name=/^(log|info|warn|error)$/]",
            message:
              "Use the logger from '@/server/logger' instead. Example: logger.info('message')",
          },
          {
            selector:
              "MemberExpression[object.name='Math'][property.name='random']",
            message:
              'Use crypto-secure random functions (crypto.randomUUID / randomBytes) instead of Math.random()',
          },
        ],
      },
    },
  ],
};
