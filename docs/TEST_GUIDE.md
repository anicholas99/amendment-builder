# Testing Guide

## Overview
This guide provides comprehensive testing strategies, patterns, and requirements for the Patent Drafter AI codebase.

## Testing Philosophy

### Core Principles
1. **Test User-Facing Behavior**: Focus on what users experience, not implementation details
2. **Maintain Fast Feedback**: Tests should run quickly to enable rapid development
3. **Ensure Reliability**: Tests should be deterministic and not flaky
4. **Provide Clear Failure Messages**: When tests fail, the reason should be immediately obvious

### What to Test
- **Business Logic**: Core functionality and edge cases
- **API Endpoints**: Authentication, authorization, validation, and response handling
- **Data Access**: Repository methods and database interactions
- **User Interactions**: Component behavior and user flows
- **Error Handling**: Graceful error recovery and user feedback

### What NOT to Test
- Third-party libraries (they have their own tests)
- Simple getters/setters without logic
- Framework functionality
- Database/ORM internals

## Test Structure

### Repository Tests
```typescript
describe('RepositoryName', () => {
  describe('methodName', () => {
    it('should handle success case', async () => {
      // Arrange: Set up test data and mocks
      // Act: Execute the method
      // Assert: Verify the result
    });

    it('should handle error case', async () => {
      // Test error scenarios
    });

    it('should validate input', async () => {
      // Test input validation
    });
  });
});
```

### API Route Tests
```typescript
describe('/api/resource/[id]', () => {
  it('should require authentication', async () => {
    // Test 401 responses
  });

  it('should validate tenant access', async () => {
    // Test 403 responses
  });

  it('should handle valid requests', async () => {
    // Test 200/201 responses
  });

  it('should validate request body', async () => {
    // Test 400 responses
  });
});
```

## Coverage Requirements

### Minimum Coverage Targets
- **Overall**: 80%
- **Critical Paths**: 95%
- **API Routes**: 90%
- **Business Logic**: 90%
- **UI Components**: 70%

### Priority Areas
1. **Authentication & Authorization**: All security-related code must be thoroughly tested
2. **Data Mutations**: Any code that modifies data requires comprehensive tests
3. **API Endpoints**: All routes need request/response validation tests
4. **Error Handling**: All error paths must be covered

## Running Tests

### Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/test.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="should handle"
```

### CI/CD Integration
- Tests run automatically on every PR
- Coverage reports are generated and tracked
- Failing tests block merges

## Test Data Management

### Mock Data
- Use factories for consistent test data creation
- Keep test data realistic but minimal
- Avoid sharing mutable test data between tests

### Database Mocking
```typescript
import { prismaMock } from '@/lib/testing/mocks';

// Mock successful query
prismaMock.user.findUnique.mockResolvedValue(mockUser);

// Mock error
prismaMock.user.findUnique.mockRejectedValue(new Error('DB Error'));
```

## Best Practices

### General Guidelines
1. **One Assertion Per Test**: Each test should verify one specific behavior
2. **Descriptive Names**: Test names should clearly describe what is being tested
3. **Independent Tests**: Tests should not depend on execution order
4. **Clean Up**: Always clean up after tests (reset mocks, clear data)

### Async Testing
```typescript
// Good: Proper async handling
it('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBe(expected);
});

// Bad: Missing await
it('should handle async operation', () => {
  const result = asyncFunction(); // Missing await!
  expect(result).toBe(expected);
});
```

### Mocking Best Practices
```typescript
// Mock at the module level
jest.mock('@/lib/api/apiClient');

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Verify mock calls
expect(mockFunction).toHaveBeenCalledWith(expectedArgs);
expect(mockFunction).toHaveBeenCalledTimes(1);
```

## Common Testing Patterns

### Testing Error Handling
```typescript
it('should handle errors gracefully', async () => {
  // Arrange
  const error = new Error('Test error');
  mockFunction.mockRejectedValue(error);

  // Act & Assert
  await expect(functionUnderTest()).rejects.toThrow('Test error');
});
```

### Testing API Responses
```typescript
it('should return proper status codes', async () => {
  const { req, res } = createMocks({
    method: 'GET',
    query: { id: 'test-id' },
  });

  await handler(req, res);

  expect(res._getStatusCode()).toBe(200);
  expect(res._getJSONData()).toMatchObject({
    id: 'test-id',
    // ... other expected fields
  });
});
```

### Testing React Hooks
```typescript
import { renderHook, act } from '@testing-library/react-hooks';

it('should update state correctly', () => {
  const { result } = renderHook(() => useCustomHook());

  act(() => {
    result.current.updateValue('new value');
  });

  expect(result.current.value).toBe('new value');
});
```

## Debugging Tests

### Common Issues
1. **Unhandled Promise Rejections**: Always use async/await or return promises
2. **Timer Issues**: Use `jest.useFakeTimers()` for time-dependent tests
3. **Module Mocking**: Ensure mocks are properly reset between tests
4. **Race Conditions**: Use `waitFor` or similar utilities for async UI updates

### Debugging Tools
```bash
# Run specific test with debugging
node --inspect-brk node_modules/.bin/jest --runInBand path/to/test

# Increase test timeout for debugging
jest.setTimeout(30000);

# Focus on single test
it.only('should focus on this test', () => {
  // This test runs in isolation
});
```

## Test Maintenance

### Keeping Tests Updated
1. Update tests when changing functionality
2. Remove tests for deleted features
3. Refactor tests when they become hard to understand
4. Keep test utilities and helpers DRY

### Test Review Checklist
- [ ] Tests cover happy path and edge cases
- [ ] Error scenarios are tested
- [ ] Tests are readable and well-named
- [ ] No test interdependencies
- [ ] Mocks are properly managed
- [ ] Async operations are properly handled

## Resources

### Testing Libraries
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **MSW**: API mocking for integration tests
- **node-mocks-http**: HTTP mocking for API routes

### Further Reading
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://testingjavascript.com/) 