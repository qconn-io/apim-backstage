import {
  CatalogProcessor,
  CatalogProcessorEmit,
  CatalogProcessorCache,
} from '@backstage/plugin-catalog-node';
import { Entity } from '@backstage/catalog-model';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Spectral } from '@stoplight/spectral-core';
import { oas, asyncapi } from '@stoplight/spectral-rulesets';
import * as yaml from 'js-yaml';
import { InputError } from '@backstage/errors';

/**
 * A catalog processor that validates OpenAPI and AsyncAPI specifications
 * before they are ingested into the catalog.
 */
export class ApiSpecValidationProcessor implements CatalogProcessor {
  private readonly logger: LoggerService;

  constructor(logger: LoggerService) {
    this.logger = logger;
  }

  getProcessorName(): string {
    return 'ApiSpecValidationProcessor';
  }

  async preProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    _emit: CatalogProcessorEmit,
    _originLocation: LocationSpec,
    _cache: CatalogProcessorCache,
  ): Promise<Entity> {
    // Only process API entities
    if (entity.kind !== 'API') {
      return entity;
    }

    const spec = entity.spec;
    if (!spec || !spec.type || !spec.definition) {
      return entity;
    }

    const apiType = spec.type as string;
    const definition = spec.definition as string;

    try {
      if (apiType === 'openapi') {
        await this.validateOpenApiSpec(definition, entity.metadata.name || 'unknown');
      } else if (apiType === 'asyncapi') {
        await this.validateAsyncApiSpec(definition, entity.metadata.name || 'unknown');
      }

      this.logger.info(
        `Successfully validated ${apiType.toUpperCase()} spec for API: ${entity.metadata.name}`,
      );

      return entity;
    } catch (error) {
      const errorMessage = `Validation failed for ${apiType.toUpperCase()} spec in API '${entity.metadata.name}': ${error}`;
      this.logger.error(errorMessage);
      
      throw new InputError(errorMessage);
    }
  }

  private async validateOpenApiSpec(definition: string, apiName: string): Promise<void> {
    const spectral = new Spectral();
    spectral.setRuleset(oas as any);

    const parsed = this.parseDefinition(definition);
    const results = await spectral.run(parsed);

    // Filter only error-level issues
    const errors = results.filter(result => result.severity === 0); // 0 = error
    
    if (errors.length > 0) {
      const errorMessages = errors.map(
        error => `${error.path.join('.')}: ${error.message}`,
      );
      throw new Error(`OpenAPI validation errors in ${apiName}: ${errorMessages.join('; ')}`);
    }
  }

  private async validateAsyncApiSpec(definition: string, apiName: string): Promise<void> {
    const spectral = new Spectral();
    spectral.setRuleset(asyncapi as any);

    const parsed = this.parseDefinition(definition);
    const results = await spectral.run(parsed);

    // Filter only error-level issues
    const errors = results.filter(result => result.severity === 0); // 0 = error
    
    if (errors.length > 0) {
      const errorMessages = errors.map(
        error => `${error.path.join('.')}: ${error.message}`,
      );
      throw new Error(`AsyncAPI validation errors in ${apiName}: ${errorMessages.join('; ')}`);
    }
  }

  private parseDefinition(definition: string): any {
    try {
      // Try to parse as JSON first
      return JSON.parse(definition);
    } catch {
      try {
        // If JSON parsing fails, try YAML
        return yaml.load(definition);
      } catch (yamlError) {
        throw new Error(`Failed to parse API definition as JSON or YAML: ${yamlError}`);
      }
    }
  }
}
