import { describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';

describe('vendors route', () => {
  it('returns vendor list via GET /api/v1/vendors', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/vendors',
    });

    expect(response.statusCode).toBe(200);

    const payload = response.json();
    expect(payload.total).toBeGreaterThan(0);
    expect(payload.items[0]).toHaveProperty('vendorId');
    expect(payload.items[0]).toHaveProperty('vendorName');

    await app.close();
  });
});
