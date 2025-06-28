#!/bin/bash

echo "🧪 Running Service Layer Tests..."
echo "================================"

# Run all service tests with coverage
echo "Running tests with coverage..."
npm test -- src/services/backend/__tests__ --coverage --coverageDirectory=coverage/services

# If tests pass, show coverage summary
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All tests passed!"
    echo ""
    echo "📊 Coverage Summary:"
    echo "==================="
    
    # Show coverage for each service
    echo ""
    echo "Service Coverage:"
    npm test -- src/services/backend/__tests__/projectService.test.ts --coverage --coverageReporters=text | grep -A 10 "File.*Stmts"
    npm test -- src/services/backend/__tests__/userService.test.ts --coverage --coverageReporters=text | grep -A 10 "File.*Stmts"
    npm test -- src/services/backend/__tests__/tenantService.test.ts --coverage --coverageReporters=text | grep -A 10 "File.*Stmts"
    npm test -- src/services/backend/__tests__/citationJobService.test.ts --coverage --coverageReporters=text | grep -A 10 "File.*Stmts"
else
    echo ""
    echo "❌ Some tests failed. Please fix the failing tests."
    echo ""
    echo "💡 Tips:"
    echo "  - Check the test output above for specific failures"
    echo "  - The test files may have some linter errors that need fixing"
    echo "  - Compare mock expectations with actual service implementations"
fi

echo ""
echo "📝 Note: Some tests may fail due to:"
echo "  - Type mismatches between mocks and actual service methods"
echo "  - Missing mock implementations"
echo "  - Changed method signatures"
echo ""
echo "Run 'npm test -- src/services/backend/__tests__/<service>.test.ts' to test individual services" 