import { catalogValidatorBackendPlugin } from './plugin';

describe('catalog-validator-backend plugin', () => {
  it('should be defined and have the correct plugin ID', () => {
    expect(catalogValidatorBackendPlugin).toBeDefined();
    expect(catalogValidatorBackendPlugin.$$type).toBe('@backstage/BackendFeature');
  });
});
