# ${{ values.name | title }}

${{ values.description }}

## Features

- ✅ **Express.js** - Fast, unopinionated web framework
- ✅ **TypeScript** - Type-safe development
- ✅ **Zod** - Runtime type validation
- ✅ **Winston** - Structured logging
- ✅ **Helmet** - Security middleware
- ✅ **CORS** - Cross-origin resource sharing
{% if values.include_auth %}- ✅ **JWT Authentication** - Secure API authentication{% endif %}
{% if values.include_database %}- ✅ **Prisma ORM** - Database access and migrations{% endif %}
{% if values.include_swagger %}- ✅ **Swagger/OpenAPI** - API documentation{% endif %}
{% if values.include_testing %}- ✅ **Jest** - Testing framework{% endif %}
{% if values.include_docker %}- ✅ **Docker** - Containerization{% endif %}
{% if values.include_monitoring %}- ✅ **Prometheus** - Metrics and monitoring{% endif %}
- ✅ **ESLint & Prettier** - Code quality and formatting
- ✅ **Husky** - Git hooks for quality assurance

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
{% if values.include_database %}- PostgreSQL database{% endif %}
{% if values.include_docker %}- Docker and Docker Compose (optional){% endif %}

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ${{ values.name }}
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

{% if values.include_database %}
4. **Database setup**
   ```bash
   # Run database migrations
   npm run db:migrate
   
   # Generate Prisma client
   npm run db:generate
   ```
{% endif %}

5. **Start development server**
   ```bash
   npm run dev
   ```

The service will be available at: `http://localhost:${{ values.port }}`

{% if values.include_docker %}
### Docker Setup

1. **Using Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Build and run manually**
   ```bash
   docker build -t ${{ values.name }} .
   docker run -p ${{ values.port }}:${{ values.port }} ${{ values.name }}
   ```
{% endif %}

## API Endpoints

{% if values.include_swagger %}
### Documentation
- **Swagger UI**: `http://localhost:${{ values.port }}/api-docs`
{% endif %}

### Health & Monitoring
- `GET /health` - Health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe
{% if values.include_monitoring %}- `GET /metrics` - Prometheus metrics{% endif %}

{% if values.include_auth %}
### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh token
{% endif %}

### Users
- `GET /api/users` - Get all users (paginated)
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Development

### Scripts

```bash
# Development
npm run dev          # Start with hot reload
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format with Prettier

# Testing
{% if values.include_testing %}
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
{% endif %}

{% if values.include_database %}
# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
{% endif %}
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=${{ values.port }}
NODE_ENV=development

{% if values.include_database %}
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
{% endif %}

{% if values.include_auth %}
# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
{% endif %}

# Logging
LOG_LEVEL=info

{% if values.include_monitoring %}
# Monitoring
METRICS_PORT=9090
{% endif %}
```

### Project Structure

```
src/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
{% if values.include_database %}├── prisma/          # Database schema and migrations{% endif %}
{% if values.include_testing %}├── __tests__/       # Test files{% endif %}
└── index.ts         # Application entry point
```

{% if values.include_testing %}
## Testing

This service includes comprehensive testing setup:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure
- **Unit tests**: Test individual functions and classes
- **Integration tests**: Test API endpoints
- **Test utilities**: Shared testing helpers and mocks
{% endif %}

{% if values.include_database %}
## Database

This service uses Prisma ORM for database operations:

### Schema Management
```bash
# Edit schema in prisma/schema.prisma
# Then run migrations
npm run db:migrate

# Or push schema changes directly (dev only)
npm run db:push
```

### Prisma Studio
```bash
npm run db:studio
```
{% endif %}

{% if values.include_monitoring %}
## Monitoring

### Metrics
Prometheus metrics are available at `/metrics`:
- HTTP request duration and count
- System metrics (memory, CPU)
- Custom business metrics

### Health Checks
- `/health` - Overall health status
- `/health/ready` - Readiness probe (K8s)
- `/health/live` - Liveness probe (K8s)
{% endif %}

## Deployment

### Production Build
```bash
npm run build
npm start
```

{% if values.include_docker %}
### Docker Deployment
```bash
# Build image
docker build -t ${{ values.name }}:latest .

# Run container
docker run -d \
  --name ${{ values.name }} \
  -p ${{ values.port }}:${{ values.port }} \
  --env-file .env \
  ${{ values.name }}:latest
```

### Docker Compose
```bash
docker-compose up -d
```
{% endif %}

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure database connection
3. Set secure JWT secrets
4. Configure logging level
5. Set up monitoring and alerting

## Security

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Input validation** - Zod schema validation
{% if values.include_auth %}- **JWT Authentication** - Secure token-based auth{% endif %}
- **Rate limiting** - Prevent abuse
- **Error handling** - No sensitive data leakage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

{% if values.contact_name %}**Maintainer**: ${{ values.contact_name }}{% endif %}
{% if values.contact_email %}**Email**: ${{ values.contact_email }}{% endif %}

---

*Generated with Backstage Software Template*
