import { describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';

describe('vendors compare route', () => {
  it('returns compare results for 2 to 5 vendor IDs', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/vendors/compare',
      payload: {
        vendorIds: ['vendor-001', 'vendor-002', 'vendor-003'],
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      items: [
        expect.objectContaining({ vendorId: 'vendor-001' }),
        expect.objectContaining({ vendorId: 'vendor-002' }),
        expect.objectContaining({ vendorId: 'vendor-003' }),
      ],
    });

    await app.close();
  });
});
