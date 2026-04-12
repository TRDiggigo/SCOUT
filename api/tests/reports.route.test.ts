import { describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';

describe('reports list route', () => {
  it('returns reports via GET /api/v1/reports', async () => {
    const app = buildApp();

    const response = await app.inject({ method: 'GET', url: '/api/v1/reports' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      total: 2,
      items: expect.arrayContaining([
        expect.objectContaining({
          reportId: 'report-001',
          status: expect.any(String),
        }),
      ]),
    });

    await app.close();
  });
});
