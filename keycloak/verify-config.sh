#!/bin/bash

# Keycloak Configuration Verification Script
# Tests the realm configuration and client setup

set -e

KEYCLOAK_URL="http://localhost:8080"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Verifying Keycloak Configuration"
echo "=================================="

# Function to test endpoint
test_endpoint() {
    local url=$1
    local description=$2
    
    echo -n "Testing ${description}... "
    
    if curl -s -f "$url" > /dev/null; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to test OIDC configuration
test_oidc_config() {
    local realm=$1
    local description=$2
    
    echo -n "Testing ${description} OIDC configuration... "
    
    local config=$(curl -s "${KEYCLOAK_URL}/realms/${realm}")
    
    if echo "$config" | grep -q "token-service"; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to test user account console
test_account_console() {
    local realm=$1
    local description=$2
    
    echo -n "Testing ${description} account console... "
    
    if curl -s -f "${KEYCLOAK_URL}/realms/${realm}/account/" > /dev/null; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Test basic Keycloak availability
test_endpoint "${KEYCLOAK_URL}" "Keycloak base URL"
test_endpoint "${KEYCLOAK_URL}/admin/" "Admin console"

echo ""
echo "🏛️ Testing Realm Configuration"
echo "------------------------------"

# Test realm availability
test_endpoint "${KEYCLOAK_URL}/realms/internal" "Internal realm"
test_endpoint "${KEYCLOAK_URL}/realms/partners" "Partners realm"

# Test OIDC configurations
test_oidc_config "internal" "Internal realm"
test_oidc_config "partners" "Partners realm"

# Test account consoles (as specified in verification criteria)
test_account_console "internal" "Internal realm"
test_account_console "partners" "Partners realm"

echo ""
echo "🔐 Testing Client Configuration"
echo "------------------------------"

# Get admin token for client testing
TOKEN=$(curl -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
    --data "username=admin" \
    --data "password=admin" \
    --data "grant_type=password" \
    --data "client_id=admin-cli" | \
    python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ -n "$TOKEN" ]; then
    echo -n "Testing Backstage client... "
    if curl -s -H "Authorization: Bearer $TOKEN" \
        "${KEYCLOAK_URL}/admin/realms/internal/clients?clientId=backstage" | grep -q "backstage"; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ FAILED${NC}"
    fi
    
    echo -n "Testing Grafana client... "
    if curl -s -H "Authorization: Bearer $TOKEN" \
        "${KEYCLOAK_URL}/admin/realms/internal/clients?clientId=grafana" | grep -q "grafana"; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ FAILED${NC}"
    fi
else
    echo -e "${RED}❌ Could not obtain admin token for client testing${NC}"
fi

echo ""
echo "📊 Configuration Summary"
echo "----------------------"

# Get realm info
echo "Internal Realm:"
curl -s "${KEYCLOAK_URL}/realms/internal" | \
    python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'  • Token Service: {data.get(\"token-service\", \"N/A\")}')
    print(f'  • Account Service: {data.get(\"account-service\", \"N/A\")}')
    print(f'  • Public Key Available: {\"Yes\" if data.get(\"public_key\") else \"No\"}')
except:
    print('  • Error parsing realm info')
"

echo ""
echo "Partners Realm:"
curl -s "${KEYCLOAK_URL}/realms/partners" | \
    python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'  • Token Service: {data.get(\"token-service\", \"N/A\")}')
    print(f'  • Account Service: {data.get(\"account-service\", \"N/A\")}')
    print(f'  • Public Key Available: {\"Yes\" if data.get(\"public_key\") else \"No\"}')
except:
    print('  • Error parsing realm info')
"

echo ""
echo "🎉 Verification completed!"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Access internal realm account console: ${KEYCLOAK_URL}/realms/internal/account/"
echo "2. Access partners realm account console: ${KEYCLOAK_URL}/realms/partners/account/"  
echo "3. Test user login in both consoles"
echo "4. Proceed to Epic 3: Backstage Integration"
echo ""
echo -e "${YELLOW}⚠️  Security Reminders:${NC}"
echo "• Change default client secrets before production deployment"
echo "• Configure SMTP for email verification in partners realm"
echo "• Set up SSL/TLS termination"
echo "• Review and adjust password policies for your organization"
