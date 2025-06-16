# ${{ values.name | title }}

${{ values.description }}

## API Documentation

This REST API follows OpenAPI 3.0 specification and provides comprehensive documentation for all endpoints.

### Getting Started

1. **API Specification**: The complete API specification is available in `openapi.yaml`
2. **Base URL**: `${{ values.server_url }}${{ values.base_path }}`
3. **Version**: ${{ values.version }}

### Features

- ✅ OpenAPI 3.0 compliant specification
- ✅ Comprehensive request/response schemas
{% if values.add_authentication %}- ✅ Authentication support (Bearer Token & API Key){% endif %}
{% if values.include_examples %}- ✅ Request/response examples{% endif %}
- ✅ Health check endpoint
- ✅ User management endpoints
- ✅ Proper error handling
- ✅ Pagination support

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/users` | Get all users |
| POST | `/users` | Create user |
| GET | `/users/{id}` | Get user by ID |
| PUT | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Delete user |

{% if values.add_authentication %}
### Authentication

This API supports two authentication methods:

1. **Bearer Token**: Include `Authorization: Bearer <token>` header
2. **API Key**: Include `X-API-Key: <key>` header
{% endif %}

### Usage

#### View the API documentation
You can view the interactive API documentation by:
1. Opening the `openapi.yaml` file in any OpenAPI viewer
2. Using Swagger UI or similar tools
3. Importing into Postman or Insomnia

#### Example Request
```bash
curl -X GET "${{ values.server_url }}${{ values.base_path }}/health" \
  -H "Content-Type: application/json"
```

### Development

1. **Validate the specification**:
   ```bash
   swagger-codegen validate -i openapi.yaml
   ```

2. **Generate client code**:
   ```bash
   swagger-codegen generate -i openapi.yaml -l javascript -o ./client
   ```

3. **Generate server stubs**:
   ```bash
   swagger-codegen generate -i openapi.yaml -l nodejs-server -o ./server
   ```

### Contact

{% if values.contact_name %}**Maintainer**: ${{ values.contact_name }}{% endif %}
{% if values.contact_email %}**Email**: ${{ values.contact_email }}{% endif %}

---

*Generated with Backstage Software Template*
