# Testing Guide

## Jest Configuration

This project uses two Jest configurations for different testing scenarios:

### 1. Default Configuration (`jest.config.js`)
- **Use for:** React components, hooks, and client-side code
- **Environment:** `jsdom` (browser-like environment)
- **Run with:** `npm test` or `jest`

Example usage:
```bash
# Run all tests (default)
npm test

# Run specific test file
npm test src/components/Button.test.tsx

# Run tests in watch mode
npm test -- --watch
```

### 2. Node Configuration (`jest.config.node.js`)
- **Use for:** Server-side code, API routes, utilities
- **Environment:** `node` (no DOM)
- **Run with:** `jest --config jest.config.node.js`

Example usage:
```bash
# Run server-side tests
jest --config jest.config.node.js

# Run specific server test
jest --config jest.config.node.js src/server/services/auth.test.ts
```

## Writing Tests

### Client-Side Tests
```typescript
// src/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Server-Side Tests
```typescript
// src/server/services/auth.test.ts
import { validateToken } from './auth';

describe('Auth Service', () => {
  it('validates tokens correctly', async () => {
    const result = await validateToken('valid-token');
    expect(result).toBe(true);
  });
});
```

## Test File Naming
- Use `.test.ts` or `.test.tsx` suffix for all test files
- Place tests next to the code they test or in `__tests__` directories
- Use descriptive test names that explain what is being tested

## Running Tests in CI/CD
The CI pipeline automatically runs both test suites:
```yaml
- name: Run client tests
  run: npm test -- --ci --coverage
  
- name: Run server tests  
  run: jest --config jest.config.node.js --ci --coverage
``` 