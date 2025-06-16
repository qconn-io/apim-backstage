import { Entity } from '@backstage/catalog-model';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import { ApiSpecValidationProcessor } from './ApiSpecValidationProcessor';
import { LoggerService } from '@backstage/backend-plugin-api';

// Mock logger
const mockLogger: LoggerService = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: jest.fn(() => mockLogger),
};

describe('ApiSpecValidationProcessor', () => {
  let processor: ApiSpecValidationProcessor;

  beforeEach(() => {
    processor = new ApiSpecValidationProcessor(mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('preProcessEntity', () => {
    const mockLocationSpec: LocationSpec = {
      type: 'file',
      target: 'test-file.yaml',
    };

    const mockEmit = jest.fn();
    const mockCache = {} as any;

    it('should pass through non-API entities unchanged', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'test-component',
        },
        spec: {
          type: 'service',
        },
      };

      const result = await processor.preProcessEntity(
        entity,
        mockLocationSpec,
        mockEmit,
        mockLocationSpec,
        mockCache,
      );

      expect(result).toBe(entity);
    });

    it('should pass through API entities without spec.type or spec.definition', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          name: 'test-api',
        },
        spec: {},
      };

      const result = await processor.preProcessEntity(
        entity,
        mockLocationSpec,
        mockEmit,
        mockLocationSpec,
        mockCache,
      );

      expect(result).toBe(entity);
    });

    it('should validate valid OpenAPI spec', async () => {
      const validOpenApiSpec = JSON.stringify({
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {},
      });

      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          name: 'test-api',
        },
        spec: {
          type: 'openapi',
          definition: validOpenApiSpec,
        },
      };

      const result = await processor.preProcessEntity(
        entity,
        mockLocationSpec,
        mockEmit,
        mockLocationSpec,
        mockCache,
      );

      expect(result).toBe(entity);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Successfully validated OPENAPI spec for API: test-api',
      );
    });

    it('should validate valid AsyncAPI spec', async () => {
      const validAsyncApiSpec = JSON.stringify({
        asyncapi: '2.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        channels: {},
      });

      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          name: 'test-async-api',
        },
        spec: {
          type: 'asyncapi',
          definition: validAsyncApiSpec,
        },
      };

      const result = await processor.preProcessEntity(
        entity,
        mockLocationSpec,
        mockEmit,
        mockLocationSpec,
        mockCache,
      );

      expect(result).toBe(entity);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Successfully validated ASYNCAPI spec for API: test-async-api',
      );
    });

    it('should throw error for invalid OpenAPI spec', async () => {
      const invalidOpenApiSpec = JSON.stringify({
        openapi: '3.0.0',
        // Missing required 'info' field
        paths: {},
      });

      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          name: 'invalid-api',
        },
        spec: {
          type: 'openapi',
          definition: invalidOpenApiSpec,
        },
      };

      await expect(
        processor.preProcessEntity(
          entity,
          mockLocationSpec,
          mockEmit,
          mockLocationSpec,
          mockCache,
        ),
      ).rejects.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Validation failed for OPENAPI spec in API \'invalid-api\''),
      );
    });

    it('should throw error for invalid AsyncAPI spec', async () => {
      const invalidAsyncApiSpec = JSON.stringify({
        asyncapi: '2.0.0',
        // Missing required 'info' field
        channels: {},
      });

      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          name: 'invalid-async-api',
        },
        spec: {
          type: 'asyncapi',
          definition: invalidAsyncApiSpec,
        },
      };

      await expect(
        processor.preProcessEntity(
          entity,
          mockLocationSpec,
          mockEmit,
          mockLocationSpec,
          mockCache,
        ),
      ).rejects.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Validation failed for ASYNCAPI spec in API \'invalid-async-api\''),
      );
    });

    it('should handle YAML format specs', async () => {
      const validOpenApiYaml = `
openapi: "3.0.0"
info:
  title: "Test API"
  version: "1.0.0"
paths: {}
      `;

      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          name: 'yaml-api',
        },
        spec: {
          type: 'openapi',
          definition: validOpenApiYaml,
        },
      };

      const result = await processor.preProcessEntity(
        entity,
        mockLocationSpec,
        mockEmit,
        mockLocationSpec,
        mockCache,
      );

      expect(result).toBe(entity);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Successfully validated OPENAPI spec for API: yaml-api',
      );
    });

    it('should throw error for unparseable spec', async () => {
      const invalidSpec = 'invalid-json-and-yaml: [';

      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: {
          name: 'unparseable-api',
        },
        spec: {
          type: 'openapi',
          definition: invalidSpec,
        },
      };

      await expect(
        processor.preProcessEntity(
          entity,
          mockLocationSpec,
          mockEmit,
          mockLocationSpec,
          mockCache,
        ),
      ).rejects.toThrow('Failed to parse API definition as JSON or YAML');
    });
  });
});
