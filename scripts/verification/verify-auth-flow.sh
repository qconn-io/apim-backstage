#!/bin/bash

# Comprehensive authentication flow test script
# This tests the complete OIDC authentication process

echo "🔐 Testing Complete OIDC Authentication Flow"
echo "============================================="
echo

# Test both development and production auth environments
for ENV in "development" "production"; do
    echo "Testing $ENV environment..."
    
    # Step 1: Test auth start endpoint
    echo "  1. Testing auth start endpoint..."
    START_RESPONSE=$(curl -s -w "%{http_code}" "http://localhost:3001/api/auth/oidc/start?env=$ENV&scope=openid%20profile%20email" -o /tmp/auth_start_$ENV.html)
    
    if [ "$START_RESPONSE" = "302" ]; then
        echo "  ✅ Auth start endpoint working (HTTP 302)"
        
        # Extract the redirect URL to verify it points to the correct Keycloak endpoint
        REDIRECT_URL=$(curl -s -D /tmp/headers_$ENV.txt "http://localhost:3001/api/auth/oidc/start?env=$ENV&scope=openid%20profile%20email" | grep -o 'http://localhost:8080/realms/internal/protocol/openid-connect/auth[^"]*' | head -1)
        
        if [[ $REDIRECT_URL == *"localhost:8080"* ]]; then
            echo "  ✅ Redirect URL points to correct Keycloak instance"
        else
            echo "  ❌ Redirect URL issue: $REDIRECT_URL"
        fi
    else
        echo "  ❌ Auth start endpoint failed (HTTP $START_RESPONSE)"
    fi
    
    # Step 2: Test callback endpoint accessibility 
    echo "  2. Testing callback endpoint..."
    CALLBACK_RESPONSE=$(curl -s -w "%{http_code}" "http://localhost:3001/api/auth/oidc/handler/frame" -o /dev/null)
    
    if [ "$CALLBACK_RESPONSE" = "400" ] || [ "$CALLBACK_RESPONSE" = "405" ]; then
        echo "  ✅ Callback endpoint accessible (expected error without auth code)"
    else
        echo "  ⚠️  Callback endpoint response: $CALLBACK_RESPONSE"
    fi
    
    echo
done

# Test Keycloak direct connectivity 
echo "Testing Keycloak connectivity..."
KEYCLOAK_STATUS=$(curl -s -w "%{http_code}" "http://localhost:8080/realms/internal/.well-known/openid-configuration" -o /dev/null)

if [ "$KEYCLOAK_STATUS" = "200" ]; then
    echo "✅ Keycloak OIDC endpoint accessible"
else
    echo "❌ Keycloak OIDC endpoint failed (HTTP $KEYCLOAK_STATUS)"
fi

echo
echo "🎯 Manual Test Instructions:"
echo "1. Open http://localhost:3001 in your browser"
echo "2. Click 'Sign in using Keycloak'"
echo "3. Enter credentials: testuser / TestUser123"
echo "4. Complete authentication and verify you're redirected back to Backstage"
echo
echo "If authentication fails with '127.0.0.1:8080' error, the issue is not resolved."
echo "If authentication succeeds, Epic 3 is complete!"