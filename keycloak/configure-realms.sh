#!/bin/bash

# Keycloak Realm Configuration Script
# This script configures the Keycloak instance with two realms: internal and partners
# Following IAM best practices for enterprise API management platform

set -e

KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
ADMIN_USER="${KC_BOOTSTRAP_ADMIN_USERNAME:-admin}"
ADMIN_PASSWORD="${KC_BOOTSTRAP_ADMIN_PASSWORD:-admin}"
MAX_RETRIES=30
RETRY_INTERVAL=5

echo "🔐 Configuring Keycloak Realms for API Management Platform"
echo "=================================================="

# Function to wait for Keycloak to be ready
wait_for_keycloak() {
    echo "⏳ Waiting for Keycloak to be ready..."
    local retries=0
    
    while [ $retries -lt $MAX_RETRIES ]; do
        # Try health endpoint first, fall back to basic connectivity
        if curl -s -f "$KEYCLOAK_URL/health/ready" > /dev/null 2>&1 || \
           curl -s -f "$KEYCLOAK_URL/" > /dev/null 2>&1; then
            echo "✅ Keycloak is ready"
            # Additional wait to ensure admin API is fully available
            sleep 5
            return 0
        fi
        
        retries=$((retries + 1))
        echo "⏳ Keycloak not ready yet, waiting... (attempt $retries/$MAX_RETRIES)"
        sleep $RETRY_INTERVAL
    done
    
    echo "❌ Keycloak failed to become ready after $((MAX_RETRIES * RETRY_INTERVAL)) seconds"
    return 1
}

# Function to get admin access token with retry
get_access_token() {
    local retries=0
    
    while [ $retries -lt 5 ]; do
        local token=$(curl -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
            --data "username=${ADMIN_USER}" \
            --data "password=${ADMIN_PASSWORD}" \
            --data "grant_type=password" \
            --data "client_id=admin-cli" 2>/dev/null | \
        python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
        
        if [ -n "$token" ] && [ "$token" != "null" ]; then
            echo "$token"
            return 0
        fi
        
        retries=$((retries + 1))
        echo "⏳ Failed to get access token, retrying... (attempt $retries/5)"
        sleep 2
    done
    
    return 1
}

# Function to check if realm exists
realm_exists() {
    local realm_name=$1
    local token=$2
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" \
        "${KEYCLOAK_URL}/admin/realms/${realm_name}" \
        -H "Authorization: Bearer ${token}")
    
    [ "$response" = "200" ]
}

# Function to check if client exists in realm
client_exists() {
    local realm_name=$1
    local client_id=$2
    local token=$3
    
    local response=$(curl -s "${KEYCLOAK_URL}/admin/realms/${realm_name}/clients?clientId=${client_id}" \
        -H "Authorization: Bearer ${token}")
    
    echo "$response" | grep -q "\"clientId\":\"${client_id}\""
}

# Function to check if group exists in realm
group_exists() {
    local realm_name=$1
    local group_name=$2
    local token=$3
    
    local response=$(curl -s "${KEYCLOAK_URL}/admin/realms/${realm_name}/groups" \
        -H "Authorization: Bearer ${token}")
    
    echo "$response" | grep -q "\"name\":\"${group_name}\""
}

# Function to create realm
create_realm() {
    local realm_name=$1
    local realm_config=$2
    local token=$3
    
    if realm_exists "$realm_name" "$token"; then
        echo "⏭️  Realm ${realm_name} already exists, skipping creation"
        return 0
    fi
    
    echo "📝 Creating realm: ${realm_name}"
    
    curl -s -X POST "${KEYCLOAK_URL}/admin/realms" \
        -H "Authorization: Bearer ${token}" \
        -H "Content-Type: application/json" \
        -d "${realm_config}"
    
    if [ $? -eq 0 ]; then
        echo "✅ Realm ${realm_name} created successfully"
    else
        echo "❌ Failed to create realm ${realm_name}"
        return 1
    fi
}

# Function to create client
create_client() {
    local realm_name=$1
    local client_config=$2
    local token=$3
    local client_id=$4
    
    if client_exists "$realm_name" "$client_id" "$token"; then
        echo "⏭️  Client ${client_id} already exists in realm ${realm_name}, skipping creation"
        return 0
    fi
    
    echo "📝 Creating client ${client_id} in realm: ${realm_name}"
    
    curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${realm_name}/clients" \
        -H "Authorization: Bearer ${token}" \
        -H "Content-Type: application/json" \
        -d "${client_config}"
    
    if [ $? -eq 0 ]; then
        echo "✅ Client ${client_id} created successfully in realm ${realm_name}"
    else
        echo "❌ Failed to create client ${client_id} in realm ${realm_name}"
        return 1
    fi
}

# Function to create group
create_group() {
    local realm_name=$1
    local group_name=$2
    local group_config=$3
    local token=$4
    
    if group_exists "$realm_name" "$group_name" "$token"; then
        echo "⏭️  Group ${group_name} already exists in realm ${realm_name}, skipping creation"
        return 0
    fi
    
    echo "📝 Creating group ${group_name} in realm: ${realm_name}"
    
    curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${realm_name}/groups" \
        -H "Authorization: Bearer ${token}" \
        -H "Content-Type: application/json" \
        -d "${group_config}"
    
    if [ $? -eq 0 ]; then
        echo "✅ Group ${group_name} created successfully in realm ${realm_name}"
    else
        echo "❌ Failed to create group ${group_name} in realm ${realm_name}"
        return 1
    fi
}

# Function to check if user exists in realm
user_exists() {
    local realm_name=$1
    local username=$2
    local token=$3
    
    local response=$(curl -s "${KEYCLOAK_URL}/admin/realms/${realm_name}/users?username=${username}" \
        -H "Authorization: Bearer ${token}")
    
    echo "$response" | grep -q "\"username\":\"${username}\""
}

# Function to create user
create_user() {
    local realm_name=$1
    local username=$2
    local email=$3
    local first_name=$4
    local last_name=$5
    local password=$6
    local token=$7
    
    if user_exists "$realm_name" "$username" "$token"; then
        echo "⏭️  User ${username} already exists in realm ${realm_name}, skipping creation"
        return 0
    fi
    
    echo "👤 Creating user ${username} in realm: ${realm_name}"
    
    # Create user
    local user_config='{
        "username": "'${username}'",
        "email": "'${email}'",
        "firstName": "'${first_name}'",
        "lastName": "'${last_name}'",
        "enabled": true,
        "emailVerified": true,
        "credentials": [{
            "type": "password",
            "value": "'${password}'",
            "temporary": false
        }]
    }'
    
    local create_response=$(curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${realm_name}/users" \
        -H "Authorization: Bearer ${token}" \
        -H "Content-Type: application/json" \
        -d "${user_config}")
    
    if [ $? -eq 0 ]; then
        echo "✅ User ${username} created successfully in realm ${realm_name}"
        return 0
    else
        echo "❌ Failed to create user ${username} in realm ${realm_name}"
        return 1
    fi
}

# Function to add user to group
add_user_to_group() {
    local realm_name=$1
    local username=$2
    local group_name=$3
    local token=$4
    
    echo "👥 Adding user ${username} to group ${group_name} in realm ${realm_name}"
    
    # Get user ID
    local user_response=$(curl -s "${KEYCLOAK_URL}/admin/realms/${realm_name}/users?username=${username}" \
        -H "Authorization: Bearer ${token}")
    local user_id=$(echo "$user_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -z "$user_id" ]; then
        echo "❌ Could not find user ${username} in realm ${realm_name}"
        return 1
    fi
    
    # Get group ID
    local group_response=$(curl -s "${KEYCLOAK_URL}/admin/realms/${realm_name}/groups" \
        -H "Authorization: Bearer ${token}")
    local group_id=$(echo "$group_response" | grep -B5 -A5 "\"name\":\"${group_name}\"" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$group_id" ]; then
        echo "❌ Could not find group ${group_name} in realm ${realm_name}"
        return 1
    fi
    
    # Add user to group
    curl -s -X PUT "${KEYCLOAK_URL}/admin/realms/${realm_name}/users/${user_id}/groups/${group_id}" \
        -H "Authorization: Bearer ${token}"
    
    if [ $? -eq 0 ]; then
        echo "✅ User ${username} added to group ${group_name} successfully"
        return 0
    else
        echo "❌ Failed to add user ${username} to group ${group_name}"
        return 1
    fi
}

# Wait for Keycloak to be ready
if ! wait_for_keycloak; then
    echo "❌ Keycloak is not ready, exiting"
    exit 1
fi

# Get admin access token
echo "🔑 Obtaining admin access token..."
TOKEN=$(get_access_token)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "❌ Failed to obtain access token. Is Keycloak running?"
    exit 1
fi

echo "✅ Access token obtained"

# Internal Realm Configuration
INTERNAL_REALM_CONFIG='{
    "realm": "internal",
    "displayName": "Internal Developer Portal",
    "enabled": true,
    "registrationAllowed": false,
    "resetPasswordAllowed": true,
    "verifyEmail": false,
    "loginWithEmailAllowed": true,
    "duplicateEmailsAllowed": false,
    "rememberMe": true,
    "bruteForceProtected": true,
    "maxFailureWaitSeconds": 900,
    "maxDeltaTimeSeconds": 43200,
    "failureFactor": 30,
    "defaultSignatureAlgorithm": "RS256",
    "accessTokenLifespan": 3600,
    "sslRequired": "external",
    "passwordPolicy": "length(8) and digits(1) and lowerCase(1) and upperCase(1)",
    "otpPolicyType": "totp",
    "otpPolicyAlgorithm": "HmacSHA1",
    "otpPolicyDigits": 6,
    "otpPolicyLookAheadWindow": 1,
    "otpPolicyPeriod": 30,
    "supportedLocales": ["en"],
    "defaultLocale": "en",
    "internationalizationEnabled": false,
    "smtpServer": {},
    "eventsEnabled": true,
    "eventsExpiration": 2592000,
    "eventsListeners": ["jboss-logging"],
    "adminEventsEnabled": true,
    "adminEventsDetailsEnabled": true
}'

# Partners Realm Configuration  
PARTNERS_REALM_CONFIG='{
    "realm": "partners",
    "displayName": "Partner Developer Portal",
    "enabled": true,
    "registrationAllowed": true,
    "registrationEmailAsUsername": true,
    "resetPasswordAllowed": true,
    "verifyEmail": true,
    "loginWithEmailAllowed": true,
    "duplicateEmailsAllowed": false,
    "rememberMe": true,
    "bruteForceProtected": true,
    "maxFailureWaitSeconds": 900,
    "maxDeltaTimeSeconds": 43200,
    "failureFactor": 30,
    "defaultSignatureAlgorithm": "RS256",
    "accessTokenLifespan": 3600,
    "sslRequired": "external",
    "passwordPolicy": "length(12) and digits(2) and lowerCase(1) and upperCase(1) and specialChars(1)",
    "otpPolicyType": "totp",
    "otpPolicyAlgorithm": "HmacSHA1",
    "otpPolicyDigits": 6,
    "otpPolicyLookAheadWindow": 1,
    "otpPolicyPeriod": 30,
    "supportedLocales": ["en"],
    "defaultLocale": "en",
    "internationalizationEnabled": false,
    "smtpServer": {},
    "eventsEnabled": true,
    "eventsExpiration": 2592000,
    "eventsListeners": ["jboss-logging"],
    "adminEventsEnabled": true,
    "adminEventsDetailsEnabled": true,
    "userManagedAccessAllowed": false
}'

# Create Internal Realm
create_realm "internal" "$INTERNAL_REALM_CONFIG" "$TOKEN"

# Create Partners Realm
create_realm "partners" "$PARTNERS_REALM_CONFIG" "$TOKEN"

# Backstage Client Configuration for Internal Realm
BACKSTAGE_CLIENT_CONFIG='{
    "clientId": "backstage",
    "name": "Backstage Developer Portal",
    "description": "Backstage.io developer portal authentication client",
    "enabled": true,
    "clientAuthenticatorType": "client-secret",
    "secret": "backstage-client-secret",
    "standardFlowEnabled": true,
    "implicitFlowEnabled": false,
    "directAccessGrantsEnabled": false,
    "serviceAccountsEnabled": false,
    "publicClient": false,
    "frontchannelLogout": true,
    "redirectUris": [
        "http://localhost:3001/api/auth/oidc/handler/frame",
        "http://localhost:3001/*",
        "http://backstage:7007/api/auth/oidc/handler/frame",
        "http://backstage:7007/*"
    ],
    "webOrigins": [
        "http://localhost:3001",
        "http://backstage:7007"
    ],
    "protocol": "openid-connect",
    "attributes": {
        "saml.assertion.signature": "false",
        "saml.force.post.binding": "false",
        "saml.multivalued.roles": "false",
        "saml.encrypt": "false",
        "saml.server.signature": "false",
        "saml.server.signature.keyinfo.ext": "false",
        "exclude.session.state.from.auth.response": "false",
        "saml_force_name_id_format": "false",
        "saml.client.signature": "false",
        "tls.client.certificate.bound.access.tokens": "false",
        "saml.authnstatement": "false",
        "display.on.consent.screen": "false",
        "saml.onetimeuse.condition": "false",
        "pkce.code.challenge.method": "S256"
    },
    "authenticationFlowBindingOverrides": {},
    "fullScopeAllowed": false,
    "nodeReRegistrationTimeout": -1,
    "protocolMappers": [
        {
            "name": "username",
            "protocol": "openid-connect",
            "protocolMapper": "oidc-usermodel-property-mapper",
            "consentRequired": false,
            "config": {
                "userinfo.token.claim": "true",
                "user.attribute": "username",
                "id.token.claim": "true",
                "access.token.claim": "true",
                "claim.name": "preferred_username",
                "jsonType.label": "String"
            }
        },
        {
            "name": "email",
            "protocol": "openid-connect",
            "protocolMapper": "oidc-usermodel-property-mapper",
            "consentRequired": false,
            "config": {
                "userinfo.token.claim": "true",
                "user.attribute": "email",
                "id.token.claim": "true",
                "access.token.claim": "true",
                "claim.name": "email",
                "jsonType.label": "String"
            }
        },
        {
            "name": "groups",
            "protocol": "openid-connect",
            "protocolMapper": "oidc-group-membership-mapper",
            "consentRequired": false,
            "config": {
                "full.path": "false",
                "id.token.claim": "true",
                "access.token.claim": "true",
                "claim.name": "groups",
                "userinfo.token.claim": "true"
            }
        }
    ],
    "defaultClientScopes": [
        "web-origins",
        "role_list",
        "profile",
        "roles",
        "email"
    ],
    "optionalClientScopes": [
        "address",
        "phone",
        "offline_access",
        "microprofile-jwt"
    ]
}'

# Grafana Client Configuration for Internal Realm
GRAFANA_CLIENT_CONFIG='{
    "clientId": "grafana",
    "name": "Grafana Monitoring Dashboard",
    "description": "Grafana observability dashboard authentication client",
    "enabled": true,
    "clientAuthenticatorType": "client-secret",
    "secret": "grafana-client-secret",
    "standardFlowEnabled": true,
    "implicitFlowEnabled": false,
    "directAccessGrantsEnabled": false,
    "serviceAccountsEnabled": false,
    "publicClient": false,
    "frontchannelLogout": true,
    "redirectUris": [
        "http://localhost:3000/login/oauth",
        "http://localhost:3000/*"
    ],
    "webOrigins": [
        "http://localhost:3000"
    ],
    "protocol": "openid-connect",
    "attributes": {
        "saml.assertion.signature": "false",
        "saml.force.post.binding": "false",
        "saml.multivalued.roles": "false",
        "saml.encrypt": "false",
        "saml.server.signature": "false",
        "saml.server.signature.keyinfo.ext": "false",
        "exclude.session.state.from.auth.response": "false",
        "saml_force_name_id_format": "false",
        "saml.client.signature": "false",
        "tls.client.certificate.bound.access.tokens": "false",
        "saml.authnstatement": "false",
        "display.on.consent.screen": "false",
        "saml.onetimeuse.condition": "false",
        "pkce.code.challenge.method": "S256"
    },
    "authenticationFlowBindingOverrides": {},
    "fullScopeAllowed": false,
    "nodeReRegistrationTimeout": -1,
    "protocolMappers": [
        {
            "name": "username",
            "protocol": "openid-connect",
            "protocolMapper": "oidc-usermodel-property-mapper",
            "consentRequired": false,
            "config": {
                "userinfo.token.claim": "true",
                "user.attribute": "username",
                "id.token.claim": "true",
                "access.token.claim": "true",
                "claim.name": "preferred_username",
                "jsonType.label": "String"
            }
        },
        {
            "name": "email",
            "protocol": "openid-connect",
            "protocolMapper": "oidc-usermodel-property-mapper",
            "consentRequired": false,
            "config": {
                "userinfo.token.claim": "true",
                "user.attribute": "email",
                "id.token.claim": "true",
                "access.token.claim": "true",
                "claim.name": "email",
                "jsonType.label": "String"
            }
        },
        {
            "name": "roles",
            "protocol": "openid-connect",
            "protocolMapper": "oidc-usermodel-realm-role-mapper",
            "consentRequired": false,
            "config": {
                "user.attribute": "foo",
                "access.token.claim": "true",
                "claim.name": "roles",
                "jsonType.label": "String",
                "multivalued": "true"
            }
        }
    ],
    "defaultClientScopes": [
        "web-origins",
        "role_list",
        "profile",
        "roles",
        "email"
    ],
    "optionalClientScopes": [
        "address",
        "phone",
        "offline_access",
        "microprofile-jwt"
    ]
}'

# Create Backstage client in internal realm
create_client "internal" "$BACKSTAGE_CLIENT_CONFIG" "$TOKEN" "backstage"

# Create Grafana client in internal realm
create_client "internal" "$GRAFANA_CLIENT_CONFIG" "$TOKEN" "grafana"

# Create default groups in internal realm
echo "📝 Creating default groups in internal realm..."
create_group "internal" "platform-admins" '{"name": "platform-admins", "attributes": {"description": ["Platform administrators with full access"]}}' "$TOKEN"
create_group "internal" "developers" '{"name": "developers", "attributes": {"description": ["Internal developers with API catalog access"]}}' "$TOKEN"
create_group "internal" "api-owners" '{"name": "api-owners", "attributes": {"description": ["API owners responsible for API lifecycle"]}}' "$TOKEN"

# Create default groups in partners realm
echo "📝 Creating default groups in partners realm..."
create_group "partners" "verified-partners" '{"name": "verified-partners", "attributes": {"description": ["Verified partner developers"]}}' "$TOKEN"
create_group "partners" "trial-users" '{"name": "trial-users", "attributes": {"description": ["Trial users with limited access"]}}' "$TOKEN"

# Create test users in internal realm
echo "👤 Creating test users in internal realm..."
create_user "internal" "testuser" "testuser@example.com" "Test" "User" "TestUser123" "$TOKEN"
create_user "internal" "admin" "admin@example.com" "Admin" "User" "Admin123" "$TOKEN"
create_user "internal" "developer" "dev@example.com" "Dev" "User" "DevUser123" "$TOKEN"

# Add test users to appropriate groups
echo "👥 Adding test users to groups..."
add_user_to_group "internal" "testuser" "developers" "$TOKEN"
add_user_to_group "internal" "admin" "platform-admins" "$TOKEN"
add_user_to_group "internal" "developer" "developers" "$TOKEN"

# Create test users in partners realm
echo "👤 Creating test users in partners realm..."
create_user "partners" "partner1" "partner1@example.com" "Partner" "One" "partner123" "$TOKEN"
create_user "partners" "partner2" "partner2@example.com" "Partner" "Two" "partner123" "$TOKEN"

# Add test users to groups
echo "👥 Adding test users to groups..."
add_user_to_group "internal" "admin" "platform-admins" "$TOKEN"
add_user_to_group "internal" "developer" "developers" "$TOKEN"
add_user_to_group "partners" "partner1" "verified-partners" "$TOKEN"
add_user_to_group "partners" "partner2" "trial-users" "$TOKEN"

echo ""
echo "🎉 Keycloak realm configuration completed successfully!"
echo "=================================================="
echo "📋 Summary:"
echo "  • Internal Realm: ${KEYCLOAK_URL}/realms/internal"
echo "  • Partners Realm: ${KEYCLOAK_URL}/realms/partners"
echo "  • Admin Console: ${KEYCLOAK_URL}/admin/"
echo ""
echo "🔐 Configured Clients:"
echo "  • backstage (internal realm)"
echo "  • grafana (internal realm)"
echo ""
echo "👥 Default Groups Created:"
echo "  Internal: platform-admins, developers, api-owners"
echo "  Partners: verified-partners, trial-users"
echo ""
echo "👤 Test Users Created:"
echo "  Internal Realm:"
echo "    • testuser / TestUser123 (developers group) - For Backstage testing"
echo "    • admin / Admin123 (platform-admins group)"
echo "    • developer / DevUser123 (developers group)"
echo "  Partners Realm:"
echo "    • partner1 / partner123 (verified-partners group)"
echo "    • partner2 / partner123 (trial-users group)"
echo ""
echo "⚠️  Important: Change default client secrets in production!"
echo ""
echo "✅ Configuration is idempotent - safe to run multiple times"
