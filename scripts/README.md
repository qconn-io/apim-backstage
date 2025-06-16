# Scripts Directory

This directory contains utility scripts for testing, verification, and maintenance of the API Management Platform - Backstage project.

## Directory Structure

```
scripts/
├── README.md                     # This file
├── tests/                        # Test scripts
│   ├── test-db.js               # Database connectivity test
│   ├── test-env.js              # Environment variables test
│   ├── test-integration.sh      # Integration test runner
│   └── test-epic4-validation-failure.sh  # Epic 4 validation failure test
└── verification/                 # Verification scripts
    ├── verify-auth-flow.sh      # Authentication flow verification
    ├── verify-epic3.sh          # Epic 3 implementation verification
    └── verify-epic4.sh          # Epic 4 implementation verification
```

## Usage

### Test Scripts

Run from the project root directory:

```bash
# Database connectivity test
node scripts/tests/test-db.js

# Environment variables test
node scripts/tests/test-env.js

# Integration test
bash scripts/tests/test-integration.sh

# Epic 4 validation failure test
bash scripts/tests/test-epic4-validation-failure.sh
```

### Verification Scripts

Run from the project root directory:

```bash
# Verify authentication flow
bash scripts/verification/verify-auth-flow.sh

# Verify Epic 3 implementation
bash scripts/verification/verify-epic3.sh

# Verify Epic 4 implementation
bash scripts/verification/verify-epic4.sh
```

## Script Categories

### Tests (`tests/`)
- **Integration Tests**: Scripts that test the interaction between system components
- **Unit Tests**: Scripts that test individual components or functions
- **Validation Tests**: Scripts that test specific validation scenarios

### Verification (`verification/`)
- **Epic Verification**: Scripts that verify the completion and functionality of specific epics
- **Flow Verification**: Scripts that verify end-to-end workflows
- **System Verification**: Scripts that verify overall system health and functionality

## Development Guidelines

1. **Naming Convention**: 
   - Test scripts: `test-<component>.<ext>`
   - Verification scripts: `verify-<component>.<ext>`

2. **Documentation**: Each script should include:
   - Header comment explaining purpose
   - Usage instructions
   - Expected output description

3. **Error Handling**: All scripts should:
   - Return appropriate exit codes
   - Provide clear error messages
   - Clean up resources on failure

4. **Portability**: Scripts should be compatible with the development environment and CI/CD pipelines.
