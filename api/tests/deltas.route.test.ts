import { describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';

describe('delta list route', () => {
  it('returns delta list via GET /api/v1/deltas', async () => {
    const app = buildApp();

    const response = await app.inject({ method: 'GET', url: '/api/v1/deltas' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('items');

    await app.close();
  });
});
