import { describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';

describe('config save validation', () => {
  it('returns validation_error for invalid limits save payload', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'PUT',
      url: '/api/v1/config/limits',
      headers: {
        authorization: 'Bearer mock-token',
        'x-mock-roles': 'ROLE_ADMIN',
      },
      payload: {
        item: {
          maxVendorConcurrency: 0,
          maxBudgetUsdPerRun: -1,
          autoAddVendors: true,
          allowVendorContact: true,
          publicSourcesOnly: false,
          lowConfidenceThreshold: 120,
          divergenceEscalationThresholdPct: -5,
          sharepointPersistenceOnly: false,
        },
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: {
        code: 'validation_error',
      },
    });

    await app.close();
  });
});
