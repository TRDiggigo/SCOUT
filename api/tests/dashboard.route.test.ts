import { describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';

describe('dashboard route', () => {
  it('returns dashboard summary via GET /api/v1/dashboard', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/dashboard',
      headers: {
        'x-correlation-id': 'dashboard-route-correlation-id',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      latestRun: {
        runId: 'run-2026-04-11-001',
      },
      activeVendorCount: 42,
      staleVendorCount: 3,
      failedVendorCount: 1,
      escalationCountOpen: 2,
      avgMarketMaturity: 74,
      avgIntegration: 69,
      avgGovernance: 77,
      budgetUsedUsd: 123.45,
      budgetLimitUsd: 500,
    });

    await app.close();
  });
});
