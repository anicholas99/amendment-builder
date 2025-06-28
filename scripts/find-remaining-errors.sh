#!/bin/bash

# Find remaining throw new Error() instances and categorize them

echo "=== Remaining throw new Error() instances by category ==="
echo ""

echo "## API Routes (High Priority - Need correct HTTP status codes)"
grep -r "throw new Error" src/pages/api --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "__tests__" | head -10
echo ""

echo "## Services (High Priority - Core business logic)"
grep -r "throw new Error" src/services --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "__tests__" | head -10
echo ""

echo "## Repositories (High Priority - Database layer)"
grep -r "throw new Error" src/repositories --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "__tests__" | head -10
echo ""

echo "## Utils (Medium Priority)"
grep -r "throw new Error" src/utils --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "__tests__" | head -10
echo ""

echo "## Lib Services (Medium Priority)"
grep -r "throw new Error" src/lib/services --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "__tests__" | head -10
echo ""

echo "## Total count by directory:"
echo -n "API Routes: "
grep -r "throw new Error" src/pages/api --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "__tests__" | wc -l
echo -n "Services: "
grep -r "throw new Error" src/services --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "__tests__" | wc -l
echo -n "Repositories: "
grep -r "throw new Error" src/repositories --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "__tests__" | wc -l
echo -n "Utils: "
grep -r "throw new Error" src/utils --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "__tests__" | wc -l
echo -n "Lib: "
grep -r "throw new Error" src/lib --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "__tests__" | wc -l 