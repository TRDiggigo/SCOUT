import { describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';

describe('auth middleware placeholders', () => {
  it('returns 401 when bearer token is missing', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        'x-correlation-id': 'unauthorized-correlation-id',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: 'auth_error',
        message: 'Missing bearer token.',
        correlationId: 'unauthorized-correlation-id',
      },
    });

    await app.close();
  });

  it('returns 403 when user lacks required role', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/admin-probe',
      headers: {
        authorization: 'Bearer mock-token',
        'x-mock-user-id': 'analyst-user',
        'x-mock-roles': 'ROLE_ANALYST',
        'x-correlation-id': 'forbidden-correlation-id',
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      error: {
        code: 'forbidden_error',
        message: 'Insufficient role permissions.',
        correlationId: 'forbidden-correlation-id',
      },
    });

    await app.close();
  });
});
