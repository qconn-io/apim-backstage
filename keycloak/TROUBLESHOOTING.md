# Keycloak Troubleshooting Guide

## Common Issues and Solutions

### Issue: "Something went wrong" when accessing admin console

**Symptoms:**
- Admin console URL `http://localhost:8080/admin/master/console/` shows generic error
- Browser displays "something went wrong" message

**Root Cause:**
Keycloak 24.0+ has stricter hostname validation by default, which can cause issues in development environments.

**Solution:**
Add the following environment variables to the Keycloak service in `docker-compose.yml`:

```yaml
environment:
  KC_HOSTNAME_STRICT: false
  KC_HOSTNAME_STRICT_HTTPS: false  
  KC_HTTP_ENABLED: true
```

**Verification:**
1. Restart Keycloak: `docker-compose restart keycloak`
2. Wait 30 seconds for startup
3. Access: `http://localhost:8080/admin/master/console/`
4. Should show Keycloak login page

### Issue: Realms lost after container restart

**Symptoms:**
- Previously configured realms return "Realm does not exist" error
- Clients and users missing

**Root Cause:**
Realms are stored in the database, but if the database was also recreated, all configuration is lost.

**Solution:**
1. Check database persistence: `docker volume ls | grep postgres`
2. If volumes exist, restart Keycloak only: `docker-compose restart keycloak`
3. If no volumes, reconfigure: `./keycloak/configure-realms.sh`

### Issue: Cannot obtain admin access token

**Symptoms:**
- Configuration scripts fail with authentication errors
- "Failed to obtain access token" messages

**Troubleshooting:**
1. Verify Keycloak is running: `docker-compose ps keycloak`
2. Check admin credentials: Default is admin/admin
3. Wait for full startup: Keycloak takes 30-60 seconds to fully initialize
4. Test manually:
   ```bash
   curl -X POST "http://localhost:8080/realms/master/protocol/openid-connect/token" \
     --data "username=admin" \
     --data "password=admin" \
     --data "grant_type=password" \
     --data "client_id=admin-cli"
   ```

### Issue: OIDC endpoints not found

**Symptoms:**
- `.well-known/openid_configuration` returns 404
- Client applications cannot discover endpoints

**Solution:**
The correct OIDC discovery endpoint in Keycloak is:
- **Incorrect:** `http://localhost:8080/realms/{realm}/.well-known/openid_configuration`  
- **Correct:** Use the token service URL from the realm info: `http://localhost:8080/realms/{realm}`

### Issue: Client authentication failures

**Symptoms:**
- Applications cannot authenticate with Keycloak
- Invalid client errors

**Troubleshooting:**
1. Verify client exists: Use admin console or API
2. Check client secret: Default secrets are for development only
3. Validate redirect URIs: Must match exactly
4. Test client configuration:
   ```bash
   # Get realm configuration
   curl "http://localhost:8080/realms/internal"
   
   # Test client authentication  
   curl -X POST "http://localhost:8080/realms/internal/protocol/openid-connect/token" \
     --data "client_id=backstage" \
     --data "client_secret=backstage-client-secret" \
     --data "grant_type=client_credentials"
   ```

## Diagnostic Commands

### Check Keycloak Status
```bash
# Container status
docker-compose ps keycloak

# Health check
curl -I http://localhost:8080/

# View logs
docker logs keycloak --tail 50
```

### Verify Realm Configuration
```bash
# List all realms
curl "http://localhost:8080/admin/realms" \
  -H "Authorization: Bearer $TOKEN"

# Get realm details
curl "http://localhost:8080/realms/internal"
curl "http://localhost:8080/realms/partners"
```

### Test Authentication Flow
```bash
# Get admin token
TOKEN=$(curl -s -X POST "http://localhost:8080/realms/master/protocol/openid-connect/token" \
  --data "username=admin" \
  --data "password=admin" \
  --data "grant_type=password" \
  --data "client_id=admin-cli" | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

# List clients in realm
curl "http://localhost:8080/admin/realms/internal/clients" \
  -H "Authorization: Bearer $TOKEN"
```

## Recovery Procedures

### Complete Reset
If configuration is completely broken:

```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: This deletes all data)
docker volume rm $(docker volume ls -q | grep apim-backstage)

# Restart and reconfigure
docker-compose up -d postgres-keycloak keycloak
sleep 30
./keycloak/configure-realms.sh
```

### Backup and Restore
```bash
# Backup realm configuration
./keycloak/configure-realms.sh --export > backup.json

# Backup database
docker exec postgres-keycloak pg_dump -U keycloak keycloak > keycloak-backup.sql

# Restore database
docker exec -i postgres-keycloak psql -U keycloak keycloak < keycloak-backup.sql
```

## Performance Optimization

### Production Settings
For production deployment, update these settings:

```yaml
environment:
  # Security
  KC_HOSTNAME_STRICT: true
  KC_HOSTNAME_STRICT_HTTPS: true
  KC_HTTP_ENABLED: false
  
  # Performance
  KC_CACHE: ispn
  KC_CACHE_STACK: kubernetes
  
  # Database
  KC_DB_POOL_INITIAL_SIZE: 5
  KC_DB_POOL_MAX_SIZE: 20
```

### Monitoring
Enable detailed logging for troubleshooting:

```yaml
environment:
  KC_LOG_LEVEL: DEBUG
  KC_LOG_CONSOLE_OUTPUT: json
  QUARKUS_LOG_CATEGORY_ORG_KEYCLOAK_LEVEL: DEBUG
```
