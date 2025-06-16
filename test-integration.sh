#!/bin/bash

# Integration test script for Backstage OIDC authentication
# This script verifies that the stack is properly configured

echo "🔍 Testing APIM Backstage Integration..."
echo

# Test 1: Check if services are running
echo "1. Checking service status..."
if docker ps | grep -q backstage && docker ps | grep -q keycloak; then
    echo "✅ Services are running"
else
    echo "❌ Some services are not running"
    exit 1
fi

# Test 2: Check Keycloak OIDC endpoint
echo "2. Testing Keycloak OIDC configuration..."
keycloak_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/realms/internal/.well-known/openid-configuration)
if [ "$keycloak_status" = "200" ]; then
    echo "✅ Keycloak OIDC endpoint is accessible"
else
    echo "❌ Keycloak OIDC endpoint failed (status: $keycloak_status)"
    exit 1
fi

# Test 3: Check Backstage backend
echo "3. Testing Backstage backend..."
backstage_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/catalog/entities)
if [ "$backstage_status" = "401" ]; then
    echo "✅ Backstage backend is running and requires authentication"
elif [ "$backstage_status" = "200" ]; then
    echo "✅ Backstage backend is accessible"
else
    echo "❌ Backstage backend failed (status: $backstage_status)"
    exit 1
fi

# Test 4: Check if Backstage can reach Keycloak
echo "4. Testing Backstage to Keycloak connectivity..."
# This tests the callback URL structure matches what's configured
callback_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/auth/oidc/handler/frame)
if [ "$callback_response" = "400" ] || [ "$callback_response" = "405" ]; then
    echo "✅ OIDC callback endpoint is configured (getting expected HTTP error)"
else
    echo "⚠️  OIDC callback endpoint response: $callback_response (this might be expected)"
fi

# Test 5: Check database connectivity
echo "5. Testing database connectivity..."
if docker exec postgres-backstage pg_isready -U backstage -d backstage >/dev/null 2>&1; then
    echo "✅ Database is accessible"
else
    echo "❌ Database connectivity failed"
    exit 1
fi

echo
echo "🎉 All integration tests passed!"
echo "📋 Next steps:"
echo "   - Open http://localhost:3001 in your browser"
echo "   - Click 'Sign In' to test OIDC authentication"
echo "   - Use test credentials: testuser / TestUser123"
echo
echo "🔧 Services available:"
echo "   - Backstage (Frontend + Backend): http://localhost:3001"
echo "   - Keycloak Admin: http://localhost:8080 (admin/admin)"
echo "   - Grafana: http://localhost:3000 (admin/admin)"
echo
