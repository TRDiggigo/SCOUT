import { describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';

describe('report detail route', () => {
  it('returns report detail via GET /api/v1/reports/:reportId', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/reports/report-001',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      reportId: 'report-001',
      governanceAlerts: expect.any(Array),
      linkedReferences: expect.any(Array),
    });

    await app.close();
  });
});
