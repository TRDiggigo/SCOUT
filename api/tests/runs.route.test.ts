import { describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';

describe('runs route authorization', () => {
  it('returns 401 without bearer token', async () => {
    const app = buildApp();

    const response = await app.inject({ method: 'GET', url: '/api/v1/runs' });

    expect(response.statusCode).toBe(401);

    await app.close();
  });

  it('returns 403 for insufficient role', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/runs',
      headers: {
        authorization: 'Bearer mock-token',
        'x-mock-roles': 'ROLE_VIEWER',
      },
    });

    expect(response.statusCode).toBe(403);

    await app.close();
  });

  it('returns 200 for operator role', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/runs',
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
