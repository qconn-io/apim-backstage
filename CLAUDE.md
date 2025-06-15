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