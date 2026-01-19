#!/bin/bash
# Security Verification Script for Stock Soko
# Run this before deploying to production

set -e

echo "=================================================="
echo "Stock Soko Security Verification"
echo "=================================================="
echo ""

ERRORS=0
WARNINGS=0

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ERRORS=$((ERRORS + 1))
}

warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Check 1: .env file exists and is gitignored
echo "Checking environment configuration..."
if [ ! -f ".env" ]; then
    error ".env file not found. Copy from .env.example"
else
    success ".env file exists"
fi

if git check-ignore -q .env; then
    success ".env is properly gitignored"
else
    error ".env is NOT gitignored!"
fi

# Check 2: .env.example exists
if [ ! -f ".env.example" ]; then
    error ".env.example not found"
else
    success ".env.example exists"
fi

# Check 3: Check for common secret patterns in .env.example
if [ -f ".env.example" ]; then
    if grep -q "password.*=.*[^=]" .env.example | grep -v "CHANGE_THIS" | grep -v "PLACEHOLDER"; then
        warning ".env.example may contain actual passwords"
    else
        success ".env.example contains no real secrets"
    fi
fi

# Check 4: Verify critical environment variables are set
echo ""
echo "Checking required environment variables..."

check_env_var() {
    if grep -q "^$1=" .env 2>/dev/null; then
        VALUE=$(grep "^$1=" .env | cut -d'=' -f2-)
        if [ -z "$VALUE" ]; then
            warning "$1 is set but empty"
        elif [ "$VALUE" == "CHANGE_THIS_TO_A_SECURE_64_CHARACTER_RANDOM_STRING_IN_PRODUCTION" ]; then
            error "$1 still has default value!"
        else
            success "$1 is configured"
        fi
    else
        error "$1 is not set in .env"
    fi
}

check_env_var "JWT_SECRET"
check_env_var "DATABASE_URL"
check_env_var "ENVIRONMENT"

# Check 5: Verify production settings
echo ""
echo "Checking production safety..."

if [ -f ".env" ]; then
    ENV_VALUE=$(grep "^ENVIRONMENT=" .env | cut -d'=' -f2)
    DEBUG_VALUE=$(grep "^DEBUG=" .env | cut -d'=' -f2 | tr '[:upper:]' '[:lower:]')
    
    if [ "$ENV_VALUE" == "production" ]; then
        if [ "$DEBUG_VALUE" == "true" ]; then
            error "DEBUG=true in production environment!"
        else
            success "DEBUG is disabled in production"
        fi
        
        JWT_SECRET=$(grep "^JWT_SECRET=" .env | cut -d'=' -f2-)
        if [ ${#JWT_SECRET} -lt 32 ]; then
            error "JWT_SECRET is too short for production (minimum 32 characters)"
        else
            success "JWT_SECRET length is adequate"
        fi
    fi
fi

# Check 6: Security headers middleware
echo ""
echo "Checking security middleware..."

if [ -f "backend/app/utils/security_headers.py" ]; then
    success "Security headers middleware exists"
else
    error "Security headers middleware missing"
fi

if [ -f "backend/app/utils/middleware.py" ]; then
    success "Rate limiting middleware exists"
else
    error "Rate limiting middleware missing"
fi

# Check 7: Check main.py includes security middleware
if [ -f "backend/app/main.py" ]; then
    if grep -q "SecurityHeadersMiddleware" backend/app/main.py; then
        success "Security headers registered in main.py"
    else
        warning "Security headers not found in main.py"
    fi
    
    if grep -q "RateLimitMiddleware" backend/app/main.py; then
        success "Rate limiting registered in main.py"
    else
        warning "Rate limiting not found in main.py"
    fi
fi

# Check 8: Scan for hardcoded secrets
echo ""
echo "Scanning for hardcoded secrets..."

if command -v gitleaks &> /dev/null; then
    if gitleaks detect --no-git --verbose; then
        success "No secrets detected by gitleaks"
    else
        error "Secrets detected! Review gitleaks output above"
    fi
else
    warning "gitleaks not installed. Run: brew install gitleaks"
fi

# Check 9: Dependency vulnerabilities
echo ""
echo "Checking for vulnerable dependencies..."

if command -v pip-audit &> /dev/null; then
    if pip-audit --requirement requirements.txt --format json > /dev/null 2>&1; then
        success "No vulnerable dependencies found"
    else
        warning "Vulnerable dependencies detected. Run: pip-audit"
    fi
else
    warning "pip-audit not installed. Run: pip install pip-audit"
fi

# Check 10: Pre-commit hooks
echo ""
echo "Checking pre-commit hooks..."

if [ -f ".pre-commit-config.yaml" ]; then
    success ".pre-commit-config.yaml exists"
    
    if [ -d ".git/hooks" ] && [ -f ".git/hooks/pre-commit" ]; then
        success "Pre-commit hooks installed"
    else
        warning "Pre-commit hooks not installed. Run: pre-commit install"
    fi
else
    warning ".pre-commit-config.yaml not found"
fi

# Check 11: Security documentation
echo ""
echo "Checking documentation..."

[ -f "SECURITY.md" ] && success "SECURITY.md exists" || warning "SECURITY.md missing"
[ -f "docs/SECURITY_INCIDENT_RESPONSE.md" ] && success "Incident response plan exists" || warning "Incident response plan missing"
[ -f "docs/GIT_HISTORY_CLEANUP.md" ] && success "Git cleanup guide exists" || warning "Git cleanup guide missing"

# Check 12: CI/CD security scanning
echo ""
echo "Checking CI/CD configuration..."

if [ -f ".github/workflows/security-scan.yml" ]; then
    success "Security scan workflow configured"
else
    warning "Security scan workflow missing"
fi

# Summary
echo ""
echo "=================================================="
echo "Security Verification Summary"
echo "=================================================="
echo -e "Errors: ${RED}${ERRORS}${NC}"
echo -e "Warnings: ${YELLOW}${WARNINGS}${NC}"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ FAILED: Please fix all errors before deploying${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  WARNINGS: Consider addressing warnings${NC}"
    exit 0
else
    echo -e "${GREEN}✓ PASSED: All security checks passed!${NC}"
    exit 0
fi
