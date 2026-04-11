import { describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';

describe('errors route', () => {
  it('returns 200 for operator role', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/errors',
      headers: {
        authorization: 'Bearer mock-token',
        'x-mock-roles': 'ROLE_OPERATOR',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('items');

    await app.close();
  });
});
