import { describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';

describe('delta detail route', () => {
  it('returns delta detail via GET /api/v1/deltas/:deltaId', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/deltas/delta-001',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      deltaId: 'delta-001',
      escalationTriggered: false,
    });

    await app.close();
  });
});
