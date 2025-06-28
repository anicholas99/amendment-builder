#!/bin/bash

# SOC 2 Readiness Verification Suite
# Run all security verification scripts

echo "🔒 SOC 2 READINESS VERIFICATION SUITE"
echo "===================================="
echo ""
echo "Running comprehensive security checks..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Track overall status
OVERALL_STATUS=0

# Function to run a verification script
run_verification() {
    local script_name=$1
    local display_name=$2
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔍 Running: $display_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    if npx tsx $script_name; then
        echo -e "${GREEN}✅ PASSED${NC}: $display_name"
    else
        echo -e "${RED}❌ FAILED${NC}: $display_name"
        OVERALL_STATUS=1
    fi
    echo ""
}

# Run all verifications
run_verification "scripts/verify-error-handling-100.ts" "Error Handling Verification"
run_verification "scripts/verify-repository-pattern.ts" "Repository Pattern Verification"
run_verification "scripts/verify-tenant-guards.ts" "Tenant Guard Verification"
run_verification "scripts/verify-rbac.ts" "RBAC Coverage Verification"

# Optional: Environment usage check (informational only)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Optional: Environment Variable Usage Analysis"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
npx tsx scripts/verify-env-usage.ts
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 VERIFICATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL CORE SECURITY CHECKS PASSED!${NC}"
    echo ""
    echo "Your application meets core SOC 2 security requirements."
    echo "Consider the optional improvements for enhanced security."
else
    echo -e "${YELLOW}⚠️  SOME SECURITY CHECKS NEED ATTENTION${NC}"
    echo ""
    echo "Please review the failed checks above and implement the suggested fixes."
    echo "Run 'cat SOC2_READINESS_PROGRESS.md' for detailed action items."
fi

echo ""
echo "For detailed progress tracking: cat SOC2_READINESS_PROGRESS.md"
echo ""

exit $OVERALL_STATUS 