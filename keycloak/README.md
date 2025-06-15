# Identity and Access Management (IAM) Configuration

This document outlines the IAM setup for the API Management Platform using Keycloak as the identity provider.

## Architecture Overview

The platform implements a **federated identity model** with complete separation between internal and external user identities:

- **Internal Realm**: For platform administrators, developers, and API owners
- **Partners Realm**: For external partner developers and API consumers

## Realm Configuration

### Internal Realm (`internal`)
- **Purpose**: Internal developer and administrative access
- **Registration**: Disabled (admin-managed users only)
- **Password Policy**: Minimum 8 characters with mixed case and digits
- **MFA**: TOTP available (recommended for admins)
- **Session Management**: Remember me enabled
- **Brute Force Protection**: Enabled

**Configured Clients:**
- `backstage`: Backstage.io developer portal
- `grafana`: Grafana monitoring dashboards

**Default Groups:**
- `platform-admins`: Full platform administration access
- `developers`: API catalog and development tools access  
- `api-owners`: API lifecycle management responsibilities

### Partners Realm (`partners`)
- **Purpose**: External partner and developer access
- **Registration**: Self-registration enabled
- **Email Verification**: Required
- **Password Policy**: Minimum 12 characters with mixed case, digits, and special characters
- **MFA**: TOTP available
- **Session Management**: Remember me enabled
- **Brute Force Protection**: Enabled (stricter than internal)

**Default Groups:**
- `verified-partners`: Verified partner developers with full API access
- `trial-users`: Trial users with limited API access and rate limits

## Security Configuration

### Authentication Flows
- **Standard Flow**: Enabled for web applications
- **Implicit Flow**: Disabled (security best practice)
- **Direct Access Grants**: Disabled (prevents credential exposure)
- **Service Accounts**: Available for backend services

### Token Configuration
- **Access Token Lifespan**: 1 hour
- **Refresh Token Lifespan**: 30 minutes (sliding window)
- **ID Token Lifespan**: 5 minutes
- **Signature Algorithm**: RS256

### Password Policies
- **Internal Realm**: `length(8) and digits(1) and lowerCase(1) and upperCase(1)`
- **Partners Realm**: `length(12) and digits(2) and lowerCase(1) and upperCase(1) and specialChars(1)`

### Brute Force Protection
- **Max Login Failures**: 30 attempts
- **Wait Increment**: 60 seconds
- **Max Wait**: 15 minutes
- **Quick Login Check**: 1000ms minimum between attempts

## Client Configuration

### Backstage Client
```yaml
Client ID: backstage
Client Secret: backstage-client-secret  # CHANGE IN PRODUCTION
Protocol: OpenID Connect
Access Type: Confidential
Valid Redirect URIs:
  - http://localhost:7007/api/auth/oidc/handler/frame
  - http://localhost:7007/*
Web Origins: http://localhost:7007
```

### Grafana Client
```yaml
Client ID: grafana
Client Secret: grafana-client-secret  # CHANGE IN PRODUCTION
Protocol: OpenID Connect
Access Type: Confidential
Valid Redirect URIs:
  - http://localhost:3000/login/oauth
  - http://localhost:3000/*
Web Origins: http://localhost:3000
```

## User Management

### Internal Users
Internal users should be created by administrators with appropriate group memberships:

1. **Platform Admins**: Full access to all platform components
2. **Developers**: Access to Backstage catalog and development tools
3. **API Owners**: Manage specific APIs and their lifecycle

### Partner Users
Partner users can self-register through the partners realm:

1. **Email verification required** before account activation
2. **Default group assignment**: `trial-users`
3. **Upgrade path**: Manual promotion to `verified-partners` by admins

## Security Best Practices

### Production Deployment
- [ ] Change all default client secrets
- [ ] Enable SSL/TLS (set `sslRequired: "all"`)
- [ ] Configure proper SMTP for email verification
- [ ] Set up proper backup and recovery procedures
- [ ] Enable audit logging and monitoring
- [ ] Configure rate limiting on authentication endpoints

### Monitoring and Auditing
- **Events**: Enabled for both realms
- **Admin Events**: Enabled with details
- **Event Retention**: 30 days
- **Log Integration**: JBoss logging (forwards to platform logging stack)

### Token Security
- **Rotate signing keys** regularly (recommended: quarterly)
- **Monitor for suspicious token usage** patterns
- **Implement token revocation** for compromised accounts
- **Use shortest practical token lifespans**

## Integration Points

### Backstage.io Integration
The internal realm provides OIDC authentication for Backstage with:
- User profile mapping (username, email, groups)
- Role-based access control through group claims
- Session management and SSO

### Grafana Integration  
The internal realm provides OAuth2 authentication for Grafana with:
- Role mapping from Keycloak groups to Grafana roles
- Automatic user provisioning
- Team assignment based on group membership

### API Gateway Integration
Both realms provide JWT tokens for API gateway authentication:
- **Internal tokens**: For administrative and development API access
- **Partner tokens**: For partner API consumption with rate limiting
- **Token validation**: Via JWKS endpoint or direct validation

## Operational Procedures

### Backup and Recovery
```bash
# Export realm configurations
./keycloak/configure-realms.sh --export

# Backup database
docker exec postgres-keycloak pg_dump -U keycloak keycloak > keycloak-backup.sql
```

### User Provisioning
```bash
# Create internal user (admin task)
kcadm.sh create users -r internal -s username=john.doe -s email=john.doe@company.com -s enabled=true

# Add user to group
kcadm.sh update users/{user-id}/groups/{group-id} -r internal
```

### Client Management
```bash
# Rotate client secret
kcadm.sh update clients/{client-id} -r internal -s secret=new-secret-value
```

## Troubleshooting

### Common Issues
1. **Login failures**: Check brute force protection settings
2. **Token validation errors**: Verify client configuration and secrets
3. **Group claims missing**: Check client protocol mappers
4. **Email verification not working**: Configure SMTP settings

### Useful Endpoints
- **Realm Discovery**: `http://localhost:8080/realms/{realm}/.well-known/openid_configuration`
- **JWKS**: `http://localhost:8080/realms/{realm}/protocol/openid-connect/certs`
- **User Info**: `http://localhost:8080/realms/{realm}/protocol/openid-connect/userinfo`

## Compliance and Governance

This IAM configuration supports compliance with:
- **GDPR**: User consent and data protection controls
- **SOC 2**: Access controls and audit logging  
- **OAuth 2.0 Security Best Practices**: RFC 6749 and related security considerations
- **OpenID Connect**: Core 1.0 specification compliance
