# Test Strategy

This codebase uses **strategic testing** - we test critical paths, not everything.

## Philosophy

> "Test what breaks, skip what doesn't."

We focus on:
- **Security boundaries** (authentication, tenant isolation)
- **Critical business logic** (project creation, claim parsing)
- **Data integrity** (repository operations)
- **Error handling** (graceful failures)

## Running Tests

```bash
# Run all browser/React tests
npm test

# Run backend/API tests (node environment)
npm run test:node

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/test.ts

# Run in watch mode
npm test -- --watch
```

## Test Coverage Overview

### ✅ Well Tested (100% coverage)
- **All Security Middleware**: Authentication, authorization, tenant validation, CSRF, rate limiting
- **Core Repositories**: User repository (gold standard), Project core repository
- **Strategic API Tests**: Auth endpoints, Projects security

### 🎯 Strategic Coverage (Key Operations Only)
- **Project Repository**: Create, query, secure update operations
- **Auth API**: Login, session, tenant switching
- **Utilities**: JSON/object utilities, logger

### ❌ Not Tested (By Design)
- **UI Components**: Low complexity, visual testing not prioritized
- **Simple CRUD**: Basic operations without complex logic
- **Generated Code**: Prisma client, type definitions

## Test Patterns

### Repository Tests
Follow the pattern in `src/repositories/__tests__/userRepository.test.ts`:

```typescript
// Mock Prisma inline to avoid import issues
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      // ... other methods
    }
  }
}));

// Test critical operations
describe('Repository', () => {
  it('should enforce tenant isolation', async () => {
    // Test that data access respects tenant boundaries
  });
  
  it('should handle errors gracefully', async () => {
    // Test error scenarios
  });
});
```

### API Route Tests
Follow the pattern in `src/pages/api/__tests__/projects.index.security.test.ts`:

```typescript
// Mock all middleware as pass-through
jest.mock('@/middleware/compose', () => ({
  withAuth: jest.fn((handler) => handler),
  // ... other middleware
}));

// Test security and business logic
describe('API Route', () => {
  it('should require authentication', async () => {
    // Test auth requirements
  });
  
  it('should validate tenant access', async () => {
    // Test tenant isolation
  });
});
```

### Middleware Tests
Follow the pattern in `src/middleware/__tests__/auth.test.ts`:

```typescript
describe('Middleware', () => {
  it('should allow valid requests', async () => {
    // Test happy path
  });
  
  it('should reject invalid requests', async () => {
    // Test security enforcement
  });
});
```

## Adding New Tests

### When to Add Tests
- **Always test**: New security features, data access patterns, critical business logic
- **Consider testing**: Complex algorithms, error-prone code, frequently changing features
- **Skip testing**: Simple getters/setters, UI without logic, third-party integrations

### Test Checklist
- [ ] Does it test behavior, not implementation?
- [ ] Is it deterministic (no flaky tests)?
- [ ] Does it clean up after itself?
- [ ] Is the test name descriptive?
- [ ] Are assertions meaningful?

## Mock Strategy

### Database Mocking
We mock Prisma at the module level to avoid import issues:

```typescript
jest.mock('@/lib/prisma', () => ({
  prisma: {
    // Mock models as needed
  }
}));
```

### External Services
Mock at the boundary:
- Auth0: Mock `@auth0/nextjs-auth0`
- APIs: Mock `fetch` or our `apiFetch` wrapper
- File uploads: Mock `formidable`

## Performance Considerations

- Run node tests separately with `npm run test:node`
- Use `--no-coverage` for faster local runs
- Parallelize independent test suites
- Mock heavy operations (database, network)

## Maintenance

### Keeping Tests Relevant
- Remove tests for deleted features
- Update tests when requirements change
- Refactor tests when patterns improve
- Document why certain areas lack tests

### Test Health Metrics
- **Good**: Fast (<5s), focused, stable
- **Bad**: Slow, testing internals, flaky
- **Ugly**: Testing the mock, over-specified

## FAQ

**Q: Why so few tests?**  
A: We test strategically. 20 good tests > 200 bad tests.

**Q: What about UI tests?**  
A: UI is simple enough for manual testing. We may add E2E tests later.

**Q: How do I know what to test?**  
A: If it handles user data, money, or security - test it. If it's a simple CRUD - skip it.

**Q: Should I aim for 100% coverage?**  
A: No. Aim for 100% confidence in critical paths.

---

Remember: **Tests are a tool, not a goal.** They should give confidence without slowing development. 