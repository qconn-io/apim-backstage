#!/bin/bash

# Keycloak Realm Configuration Script
# This script configures the Keycloak instance with two realms: internal and partners
# Following IAM best practices for enterprise API management platform

set -e

KEYCLOAK_URL="http://localhost:8080"
ADMIN_USER="admin"
ADMIN_PASSWORD="admin"

echo "🔐 Configuring Keycloak Realms for API Management Platform"
echo "=================================================="

# Function to get admin access token
get_access_token() {
    curl -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
        --data "username=${ADMIN_USER}" \
        --data "password=${ADMIN_PASSWORD}" \
        --data "grant_type=password" \
        --data "client_id=admin-cli" | \
    python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])"
}

# Function to create realm
create_realm() {
    local realm_name=$1
    local realm_config=$2
    local token=$3
    
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
    
    echo "📝 Creating client in realm: ${realm_name}"
    
    curl -s -X POST "${KEYCLOAK_URL}/admin/realms/${realm_name}/clients" \
        -H "Authorization: Bearer ${token}" \
        -H "Content-Type: application/json" \
        -d "${client_config}"
    
    if [ $? -eq 0 ]; then
        echo "✅ Client created successfully in realm ${realm_name}"
    else
        echo "❌ Failed to create client in realm ${realm_name}"
        return 1
    fi
}

# Get admin access token
echo "🔑 Obtaining admin access token..."
TOKEN=$(get_access_token)

if [ -z "$TOKEN" ]; then
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
    "redirectUris": [
        "http://localhost:7007/api/auth/oidc/handler/frame",
        "http://localhost:7007/*"
    ],
    "webOrigins": [
        "http://localhost:7007"
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
        "saml.onetimeuse.condition": "false"
    },
    "authenticationFlowBindingOverrides": {},
    "fullScopeAllowed": true,
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
        "saml.onetimeuse.condition": "false"
    },
    "authenticationFlowBindingOverrides": {},
    "fullScopeAllowed": true,
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
create_client "internal" "$BACKSTAGE_CLIENT_CONFIG" "$TOKEN"

# Create Grafana client in internal realm
create_client "internal" "$GRAFANA_CLIENT_CONFIG" "$TOKEN"

# Create default groups in internal realm
echo "📝 Creating default groups in internal realm..."
curl -s -X POST "${KEYCLOAK_URL}/admin/realms/internal/groups" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name": "platform-admins", "attributes": {"description": ["Platform administrators with full access"]}}'

curl -s -X POST "${KEYCLOAK_URL}/admin/realms/internal/groups" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name": "developers", "attributes": {"description": ["Internal developers with API catalog access"]}}'

curl -s -X POST "${KEYCLOAK_URL}/admin/realms/internal/groups" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name": "api-owners", "attributes": {"description": ["API owners responsible for API lifecycle"]}}'

# Create default groups in partners realm
echo "📝 Creating default groups in partners realm..."
curl -s -X POST "${KEYCLOAK_URL}/admin/realms/partners/groups" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name": "verified-partners", "attributes": {"description": ["Verified partner developers"]}}'

curl -s -X POST "${KEYCLOAK_URL}/admin/realms/partners/groups" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name": "trial-users", "attributes": {"description": ["Trial users with limited access"]}}'

echo ""
echo "🎉 Keycloak realm configuration completed successfully!"
echo "=================================================="
echo "📋 Summary:"
echo "  • Internal Realm: http://localhost:8080/realms/internal"
echo "  • Partners Realm: http://localhost:8080/realms/partners"
echo "  • Admin Console: http://localhost:8080/admin/"
echo ""
echo "🔐 Configured Clients:"
echo "  • backstage (internal realm)"
echo "  • grafana (internal realm)"
echo ""
echo "👥 Default Groups Created:"
echo "  Internal: platform-admins, developers, api-owners"
echo "  Partners: verified-partners, trial-users"
echo ""
echo "⚠️  Important: Change default client secrets in production!"
