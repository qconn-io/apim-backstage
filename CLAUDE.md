# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **enterprise-grade API Management Platform** currently in the architectural planning phase. The project implements a **decoupled, three-plane architecture**:

- **Control Plane**: Backstage.io as the universal integration hub and API catalog
- **Data Plane**: API Gateways (Kong, APISIX) for runtime policy enforcement  
- **Presentation Plane**: Next.js partner portal with Strapi CMS

The platform is **gateway-agnostic** and follows a **Zero Trust security model** with Open Policy Agent (OPA) for authorization.

## Current State

**This project contains only documentation - no implementation exists yet.** Key files:
- `ARCHITECTURE.md` - Complete solution architecture v3.0
- `ROADMAP.md` - Detailed implementation roadmap v2.0 with AI-optimized tasks
- `USER-JOURNEYS.md` - Product user journeys and acceptance criteria

## Architecture Principles

- **Decoupling of planes** - Control, data, and presentation layers are independent
- **Gateway agnosticism** - Platform supports multiple API gateway technologies
- **Single source of truth** - Backstage catalog as authoritative source for API metadata
- **API-as-Code & GitOps** - Declarative configuration managed through Git workflows
- **Security by Design** - Zero Trust model with dedicated policy engine (OPA)
- **Federated identity** - Separate Keycloak realms for internal and external users

## Technology Stack

### Backend/Infrastructure
- **Backstage.io** - Developer platform and API catalog
- **Kong/APISIX** - API Gateways (pluggable)
- **Open Policy Agent (OPA)** - Authorization engine
- **Keycloak** - Identity and access management
- **PostgreSQL** - Data persistence (separate instances)
- **Kafka** - Event bus for async communication

### Frontend
- **Next.js** - Partner portal frontend
- **Strapi** - Headless CMS for content management

### Observability
- **OpenTelemetry Collector** - Telemetry collection
- **Prometheus** - Metrics storage
- **Loki** - Log aggregation
- **Grafana** - Monitoring and visualization

## Implementation Guidelines

When implementing this architecture:

1. **Follow the roadmap sequentially** - The 5-phase approach in ROADMAP.md has dependency ordering
2. **Use placeholders for secrets** - Never hardcode sensitive values like `{{ POSTGRES_PASSWORD }}`
3. **Write testable code** - Jest for backend, React Testing Library for frontend
4. **Verify each step** - Follow verification steps outlined in roadmap tasks
5. **Maintain security boundaries** - Separate identity realms, OPA for authorization
6. **Follow GitOps patterns** - Declarative configuration with approval workflows

## Planned Directory Structure

Once implementation begins:
```
/backstage/                 # Backstage application
/portal/                    # Next.js partner portal  
/keycloak/                  # Keycloak configuration
/grafana/                   # Grafana dashboards
/operator/                  # Platform operator scripts
/docker-compose.yml         # Local development setup
```

## Security Model

- Multi-tenant design with separate Keycloak realms
- Open Policy Agent (OPA) as centralized Policy Decision Point
- Web Application Firewall (WAF) for public endpoints
- Zero Trust principles throughout
- Network policies for component isolation

## Development Commands

### Infrastructure & Services
- `docker-compose up -d` - Start all platform services
- `docker-compose down` - Stop all services
- `docker-compose ps` - Check service status
- `./test-integration.sh` - Run integration tests to verify platform setup
- `./keycloak/configure-realms.sh` - Configure Keycloak realms (run after Keycloak is ready)
- `./keycloak/verify-config.sh` - Verify Keycloak configuration
- `./verify-epic3.sh` - Verify Epic 3 (Backstage setup) is complete

### Backstage Development
- `cd backstage && yarn install` - Install Backstage dependencies
- `cd backstage && yarn start` - Start Backstage in development mode
- `cd backstage && yarn build:all` - Build all Backstage packages
- `cd backstage && yarn test` - Run all tests
- `cd backstage && yarn test:all` - Run tests with coverage
- `cd backstage && yarn lint:all` - Run linting for all packages
- `cd backstage && yarn tsc` - Run TypeScript compilation check
- `cd backstage && yarn test:e2e` - Run end-to-end tests with Playwright

### Strapi Development
- `cd strapi-app && npm run dev` - Start Strapi in development mode
- `cd strapi-app && npm run build` - Build Strapi for production
- `cd strapi-app && npm start` - Start Strapi in production mode

## Service Access Points

When services are running via Docker Compose:
- **Backstage Frontend**: http://localhost:3001
- **Backstage Backend**: http://localhost:7007
- **Keycloak Admin**: http://localhost:8080 (admin/admin)
- **Strapi Admin**: http://localhost:1337/admin
- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Loki**: http://localhost:3100
- **OPA**: http://localhost:8181
- **PostgreSQL (Backstage)**: localhost:5432
- **PostgreSQL (Strapi)**: localhost:5433
- **PostgreSQL (Keycloak)**: localhost:5434

## Development Workflow

1. **Initial Setup**: Start with infrastructure services using `docker-compose up -d`
2. **Configuration**: Run Keycloak realm configuration with `./keycloak/configure-realms.sh`
3. **Verification**: Use `./test-integration.sh` to verify the platform is properly configured
4. **Development**: Use individual service commands for active development
5. **Testing**: Run integration tests before committing changes

## Key Configuration Files

- `docker-compose.yml` - Main service orchestration
- `backstage/app-config.yaml` - Backstage configuration
- `backstage/app-config.local.yaml` - Local development overrides
- `keycloak/configure-realms.sh` - Keycloak setup script
- Environment variables use `.env` file (copy from `.env.example`)