# ${{ values.name | title }}

${{ values.description }}

A production-ready Spring Boot REST API service built with modern Java practices and comprehensive tooling.

## Features

- ✅ **Spring Boot 3.2** - Latest Spring Boot framework
- ✅ **Java ${{ values.java_version }}** - Modern Java features
- ✅ **Maven** - Dependency management and builds
- ✅ **RESTful API** - Well-structured REST endpoints
- ✅ **Bean Validation** - Request/response validation
- ✅ **Lombok** - Reduced boilerplate code
- ✅ **MapStruct** - Type-safe object mapping
{% if values.include_database %}- ✅ **PostgreSQL** - Production database{% endif %}
{% if values.include_database %}- ✅ **Spring Data JPA** - Database access layer{% endif %}
{% if values.include_database %}- ✅ **Flyway** - Database migrations{% endif %}
{% if values.include_security %}- ✅ **Spring Security** - Authentication and authorization{% endif %}
{% if values.include_security %}- ✅ **JWT** - Token-based authentication{% endif %}
{% if values.include_swagger %}- ✅ **OpenAPI 3** - API documentation{% endif %}
{% if values.include_monitoring %}- ✅ **Spring Actuator** - Production monitoring{% endif %}
{% if values.include_monitoring %}- ✅ **Prometheus** - Metrics collection{% endif %}
{% if values.include_testing %}- ✅ **JUnit 5** - Comprehensive testing{% endif %}
{% if values.include_testing and values.include_database %}- ✅ **TestContainers** - Integration testing{% endif %}
- ✅ **JaCoCo** - Code coverage
{% if values.include_docker %}- ✅ **Docker** - Containerization{% endif %}

## Quick Start

### Prerequisites

- Java ${{ values.java_version }} or higher
- Maven 3.8+
{% if values.include_database %}- PostgreSQL 12+ (or Docker){% endif %}
{% if values.include_docker %}- Docker and Docker Compose (optional){% endif %}

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ${{ values.name }}
   ```

2. **Configure the application**
   ```bash
   # Copy and edit application properties
   cp src/main/resources/application.properties.example src/main/resources/application.properties
   ```

{% if values.include_database %}
3. **Set up the database**
   ```bash
   # Using Docker (recommended for development)
   docker run --name ${{ values.name }}-db \
     -e POSTGRES_DB=${{ values.name.replace('-', '_') }} \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -p 5432:5432 \
     -d postgres:15
   
   # Run database migrations
   mvn flyway:migrate
   ```
{% endif %}

4. **Build and run**
   ```bash
   # Build the application
   mvn clean compile
   
   # Run the application
   mvn spring-boot:run
   ```

The service will be available at: `http://localhost:${{ values.port }}`

{% if values.include_docker %}
### Docker Setup

1. **Using Docker Compose (recommended)**
   ```bash
   docker-compose up -d
   ```

2. **Build and run manually**
   ```bash
   # Build the image
   docker build -t ${{ values.name }} .
   
   # Run the container
   docker run -p ${{ values.port }}:${{ values.port }} ${{ values.name }}
   ```
{% endif %}

## API Endpoints

{% if values.include_swagger %}
### Documentation
- **Swagger UI**: `http://localhost:${{ values.port }}/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:${{ values.port }}/api-docs`
{% endif %}

### Health & Monitoring
{% if values.include_monitoring %}
- `GET /actuator/health` - Health check
- `GET /actuator/info` - Application info
- `GET /actuator/metrics` - Application metrics
- `GET /actuator/prometheus` - Prometheus metrics
{% else %}
- `GET /health` - Health check
{% endif %}

{% if values.include_security %}
### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token
{% endif %}

### Users
- `GET /api/users` - Get all users (paginated)
- `POST /api/users` - Create new user
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

## Development

### Maven Commands

```bash
# Build
mvn clean compile                # Compile sources
mvn clean package               # Build JAR file
mvn clean install              # Install to local repository

# Run
mvn spring-boot:run            # Run application
mvn spring-boot:run -Dspring-boot.run.profiles=dev  # Run with dev profile

# Test
mvn test                       # Run unit tests
mvn verify                     # Run integration tests
mvn jacoco:report             # Generate coverage report

{% if values.include_database %}
# Database
mvn flyway:migrate            # Run database migrations
mvn flyway:info               # Show migration status
mvn flyway:clean              # Clean database (dev only)
{% endif %}
```

### Profiles

The application supports multiple profiles:

- **dev** (default) - Development profile
- **prod** - Production profile

```bash
# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

### Configuration

Key configuration files:

- `src/main/resources/application.properties` - Base configuration
- `src/main/resources/application-dev.properties` - Development settings
- `src/main/resources/application-prod.properties` - Production settings

### Environment Variables

Key environment variables for production:

```bash
# Server
SERVER_PORT=${{ values.port }}
SPRING_PROFILES_ACTIVE=prod

{% if values.include_database %}
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/${{ values.name.replace('-', '_') }}
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your-secure-password
{% endif %}

{% if values.include_security %}
# Security
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000
{% endif %}

# Logging
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_{{ values.package_name.upper().replace('.', '_') }}=INFO
```

## Project Structure

```
src/
├── main/
│   ├── java/
│   │   └── ${{ values.package_name.replace('.', '/') }}/
│   │       ├── Application.java           # Main application class
│   │       ├── config/                    # Configuration classes
│   │       ├── controller/                # REST controllers
│   │       ├── service/                   # Business logic
│   │       ├── repository/                # Data access layer
│   │       ├── model/                     # Entity classes
│   │       ├── dto/                       # Data transfer objects
│   │       ├── mapper/                    # Object mappers
│   │       ├── exception/                 # Exception handling
│   │       └── security/                  # Security configuration
│   └── resources/
│       ├── application.properties         # Configuration
│       {% if values.include_database %}├── db/migration/                # Database migrations{% endif %}
│       └── static/                        # Static resources
└── test/
    ├── java/                              # Test classes
    └── resources/                         # Test resources
```

{% if values.include_testing %}
## Testing

The application includes comprehensive testing:

### Unit Tests
```bash
mvn test
```

### Integration Tests
```bash
mvn verify
```

{% if values.include_database %}
### Database Testing
Integration tests use TestContainers for real database testing:
- PostgreSQL container is started automatically
- Tests run against real database instance
- Containers are cleaned up after tests
{% endif %}

### Coverage Report
```bash
mvn jacoco:report
# Open target/site/jacoco/index.html in browser
```
{% endif %}

{% if values.include_database %}
## Database

### Migrations

Database schema is managed with Flyway migrations:

1. Create migration files in `src/main/resources/db/migration/`
2. Follow naming convention: `V{version}__{description}.sql`
3. Run migrations: `mvn flyway:migrate`

Example migration file: `V001__Create_users_table.sql`

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
{% endif %}

{% if values.include_monitoring %}
## Monitoring

### Health Checks
- `/actuator/health` - Overall application health
- `/actuator/health/db` - Database health
- `/actuator/health/diskSpace` - Disk space health

### Metrics
- `/actuator/metrics` - Available metrics
- `/actuator/prometheus` - Prometheus format metrics

### Custom Metrics
Add custom metrics using Micrometer:

```java
@Component
public class CustomMetrics {
    private final Counter userCreatedCounter;
    
    public CustomMetrics(MeterRegistry meterRegistry) {
        this.userCreatedCounter = Counter.builder("users.created")
            .description("Number of users created")
            .register(meterRegistry);
    }
    
    public void incrementUserCreated() {
        userCreatedCounter.increment();
    }
}
```
{% endif %}

## Security

{% if values.include_security %}
### Authentication
- JWT-based authentication
- Stateless session management
- Secure password hashing with BCrypt
- Token refresh mechanism

### Authorization
- Role-based access control
- Method-level security annotations
- Custom security expressions

### Configuration
Security settings in `SecurityConfig.java`:
- CORS configuration
- CSRF protection (disabled for APIs)
- JWT token validation
- Public endpoints configuration
{% else %}
### Best Practices
- Input validation with Bean Validation
- Proper error handling
- Secure headers configuration
- CORS policy setup
{% endif %}

## Deployment

### Production Build
```bash
mvn clean package -Pprod
```

### JAR Deployment
```bash
java -jar target/${{ values.name }}-1.0.0.jar
```

{% if values.include_docker %}
### Docker Deployment

1. **Build Docker image**
   ```bash
   docker build -t ${{ values.name }}:latest .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Environment-specific deployment**
   ```bash
   # Development
   docker-compose -f docker-compose.yml up -d
   
   # Production
   docker-compose -f docker-compose.prod.yml up -d
   ```
{% endif %}

### Production Checklist

- [ ] Update default passwords and secrets
- [ ] Configure proper database connection
- [ ] Set up SSL/TLS certificates
- [ ] Configure logging and monitoring
- [ ] Set up backup strategies
- [ ] Configure health checks
- [ ] Review security settings
- [ ] Set up CI/CD pipeline

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Ensure tests pass: `mvn verify`
5. Commit your changes: `git commit -m 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

{% if values.contact_name %}**Maintainer**: ${{ values.contact_name }}{% endif %}
{% if values.contact_email %}**Email**: ${{ values.contact_email }}{% endif %}

For issues and questions:
1. Check the [documentation]{% if values.include_swagger %}(http://localhost:${{ values.port }}/swagger-ui.html){% endif %}
2. Search existing issues
3. Create a new issue with detailed information

---

*Generated with Backstage Software Template*
