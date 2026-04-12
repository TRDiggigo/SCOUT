import { describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';

describe('vendor detail route', () => {
  it('returns vendor detail via GET /api/v1/vendors/:vendorId', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/vendors/vendor-001',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      vendorId: 'vendor-001',
      vendorName: 'Alpha AI',
      sourceRunId: 'run-2026-04-11-001',
    });

    await app.close();
  });
});
