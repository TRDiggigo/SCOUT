import { describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';

describe('vendors compare validation route', () => {
  it('rejects fewer than 2 vendor IDs', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/vendors/compare',
      payload: {
        vendorIds: ['vendor-001'],
      },
    });

    expect(response.statusCode).toBe(400);

    await app.close();
  });

  it('rejects duplicated vendor IDs', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/vendors/compare',
      payload: {
        vendorIds: ['vendor-001', 'vendor-001'],
      },
    });

    expect(response.statusCode).toBe(400);

    await app.close();
  });
});
