# Epic 4: Foundational Governance Plugin (catalog-validator-backend)

## Overview

This epic implements a foundational governance plugin that validates OpenAPI and AsyncAPI specifications before they are ingested into the Backstage catalog. This ensures API governance from day one by preventing invalid API specifications from entering the system.

## Implementation Details

### Plugin Structure
```
backstage/plugins/catalog-validator-backend-backend/
├── src/
│   ├── services/
│   │   ├── ApiSpecValidationProcessor.ts      # Core validation processor
│   │   └── ApiSpecValidationProcessor.test.ts # Unit tests
│   ├── plugin.ts                              # Plugin registration
│   ├── plugin.test.ts                         # Plugin tests
│   └── index.ts                               # Export interface
├── package.json                               # Dependencies & scripts
└── README.md                                  # Plugin documentation
```

### Key Features

#### 1. API Specification Validation
- **OpenAPI Validation**: Uses `@stoplight/spectral-core` with OAS ruleset
- **AsyncAPI Validation**: Uses `@stoplight/spectral-core` with AsyncAPI ruleset
- **Format Support**: Supports both JSON and YAML formats
- **Error Reporting**: Provides detailed validation error messages

#### 2. Catalog Integration
- Implements `CatalogProcessor` interface
- Hooks into `preProcessEntity` lifecycle
- Validates only `API` entities with `type: 'openapi'` or `type: 'asyncapi'`
- Throws `InputError` for invalid specifications, preventing catalog ingestion

#### 3. Comprehensive Testing
- Unit tests cover all validation scenarios
- Tests for valid and invalid OpenAPI specs
- Tests for valid and invalid AsyncAPI specs
- Tests for JSON and YAML format support
- Tests for error handling and logging

## Dependencies

### Runtime Dependencies
```json
{
  "@backstage/backend-plugin-api": "^1.3.1",
  "@backstage/catalog-model": "^1.7.1",
  "@backstage/plugin-catalog-node": "^1.17.0",
  "@backstage/errors": "^1.2.7",
  "@stoplight/spectral-core": "^1.18.3",
  "@stoplight/spectral-rulesets": "^1.22.0",
  "js-yaml": "^4.1.0"
}
```

## Verification Results ✅

- [x] Created catalog-validator-backend plugin
- [x] Implemented CatalogProcessor with preProcessEntity validation
- [x] Added Spectral validation for OpenAPI and AsyncAPI specs
- [x] Plugin throws ProcessingError for invalid specs
- [x] Unit tests passing (9 tests)
- [x] Integration with Backstage catalog system verified
- [x] Valid OpenAPI and AsyncAPI specs pass validation
- [x] Invalid specs are rejected with appropriate errors
- [x] JSON and YAML format support confirmed
