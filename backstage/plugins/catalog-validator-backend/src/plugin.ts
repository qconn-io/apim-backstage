import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { ApiSpecValidationProcessor } from './services/ApiSpecValidationProcessor';

/**
 * catalogValidatorBackendPlugin backend module
 *
 * @public
 */
export const catalogValidatorBackendPlugin = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'catalog-validator-backend',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        catalogProcessing: catalogProcessingExtensionPoint,
      },
      async init({ logger, catalogProcessing }) {
        logger.info('Initializing catalog validator backend module');
        
        // Register the API spec validation processor
        catalogProcessing.addProcessor(new ApiSpecValidationProcessor(logger));
        
        logger.info('API spec validation processor registered successfully');
      },
    });
  },
});
