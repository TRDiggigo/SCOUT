import { describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';

describe('API bootstrap', () => {
  it('boots the server instance', async () => {
    const app = buildApp();

    await app.ready();

    expect(app.server.listening).toBe(false);

    await app.close();
  });

  it('returns 200 for GET /api/v1/health', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
      headers: {
        'x-correlation-id': 'health-test-correlation-id',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
    expect(response.headers['x-correlation-id']).toBe('health-test-correlation-id');

    await app.close();
  });

  it('normalizes thrown errors into the standard envelope', async () => {
    const app = buildApp();

    app.get('/api/v1/test-error', async () => {
      throw new Error('boom');
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/test-error',
      headers: {
        'x-correlation-id': 'error-test-correlation-id',
      },
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      error: {
        code: 'internal_error',
        message: 'An unexpected error occurred.',
        correlationId: 'error-test-correlation-id',
      },
    });

    await app.close();
  });
});
