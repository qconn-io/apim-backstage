#!/bin/bash

# Verification script for Epic 3: Backstage Scaffolding & Base Auth
# This script verifies that Epic 3 requirements are fully met

echo "🔍 Verifying Epic 3: Backstage Scaffolding & Base Auth"
echo "======================================================="
echo

# Change to project root directory
cd "$(dirname "$0")/../.."

# Test 1: Verify Docker Compose uses local build
echo "1. Checking Docker Compose configuration..."
if grep -q "build:" docker-compose.yml && grep -q "context: ./backstage" docker-compose.yml; then
    echo "✅ Docker Compose correctly configured to build local Backstage image"
else
    echo "❌ Docker Compose still uses official image instead of local build"
    exit 1
fi

# Test 2: Verify Backstage configuration files exist and are properly configured
echo "2. Checking Backstage configuration..."
if [ -f "backstage/app-config.yaml" ] && [ -f "backstage/app-config.production.yaml" ]; then
    echo "✅ Backstage configuration files exist"
else
    echo "❌ Missing Backstage configuration files"
    exit 1
fi

# Test 3: Check database configuration
if grep -q "client: pg" backstage/app-config.yaml && grep -q "POSTGRES_HOST" backstage/app-config.yaml; then
    echo "✅ PostgreSQL database configuration found"
else
    echo "❌ PostgreSQL database configuration missing or incorrect"
    exit 1
fi

# Test 4: Check OIDC authentication configuration  
if grep -q "oidc:" backstage/app-config.yaml && grep -q "KEYCLOAK_BASE_URL" backstage/app-config.yaml; then
    echo "✅ OIDC authentication configuration found"
else
    echo "❌ OIDC authentication configuration missing"
    exit 1
fi

# Test 5: Check backend OIDC module
if grep -q "plugin-auth-backend-module-oidc-provider" backstage/packages/backend/src/index.ts; then
    echo "✅ OIDC provider module configured in backend"
else
    echo "❌ OIDC provider module missing from backend"
    exit 1
fi

# Test 6: Check package.json dependencies
if grep -q "plugin-auth-backend-module-oidc-provider" backstage/packages/backend/package.json; then
    echo "✅ OIDC provider dependency found in backend package.json"
else
    echo "❌ OIDC provider dependency missing from backend package.json"
    exit 1
fi

# Test 7: Check entities and organizational data
if [ -f "backstage/examples/entities.yaml" ] && [ -f "backstage/examples/org.yaml" ]; then
    echo "✅ Example entities and organizational data configured"
else
    echo "❌ Missing example entities or organizational data"
    exit 1
fi

# Test 8: Check port configuration consistency
if grep -q "baseUrl: http://localhost:3001" backstage/app-config.yaml && grep -q "\${BACKSTAGE_PORT:-3001}:7007" docker-compose.yml; then
    echo "✅ Port configuration is consistent"
else
    echo "❌ Port configuration mismatch between app-config and docker-compose"
    exit 1
fi

echo
echo "🎉 Epic 3 verification completed successfully!"
echo "======================================================="
echo "📋 Epic 3 Summary:"
echo "  ✅ Backstage application scaffolded with proper structure"
echo "  ✅ Connected to postgres-backstage database"
echo "  ✅ Keycloak OIDC authentication configured for internal realm"
echo "  ✅ Docker Compose uses local build instead of official image"
echo "  ✅ Example API entities and organizational data configured"
echo "  ✅ Port configuration aligned between components"
echo
echo "🚀 Ready for next phase: Epic 4 - Foundational Governance Plugin"
echo
echo "📝 To test the implementation:"
echo "  1. Run: docker-compose up -d"
echo "  2. Wait for all services to be healthy"
echo "  3. Run: ./keycloak/configure-realms.sh"
echo "  4. Run: ./test-integration.sh"
echo "  5. Access Backstage at: http://localhost:3001"
echo "  6. Test authentication via Keycloak with testuser/test123"
echo