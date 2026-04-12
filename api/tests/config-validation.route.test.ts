import { describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';

describe('config validate route', () => {
  it('returns valid=true for acceptable config payload', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/config/validate',
      headers: {
        authorization: 'Bearer mock-token',
        'x-mock-roles': 'ROLE_OPERATOR',
      },
      payload: {
        vendors: [{ vendorId: 'vendor-001', vendorName: 'Alpha AI', trackingStatus: 'active' }],
        weights: { marketMaturityWeight: 40, integrationWeight: 30, governanceWeight: 30 },
        sources: [{ sourceId: 'source-1', sourceType: 'docs', url: 'https://example.com/docs' }],
        providers: { primaryModel: 'gpt-4.1-mini', timeoutMs: 15000 },
        limits: { maxVendorConcurrency: 5, maxBudgetUsdPerRun: 500, autoAddVendors: false, allowVendorContact: false, publicSourcesOnly: true, lowConfidenceThreshold: 70, divergenceEscalationThresholdPct: 15, sharepointPersistenceOnly: true },
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ valid: true, errors: [] });

    await app.close();
  });

  it('returns valid=false with explicit error list for invalid payload values', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/config/validate',
      headers: {
        authorization: 'Bearer mock-token',
        'x-mock-roles': 'ROLE_ADMIN',
      },
      payload: {
        vendors: [{ vendorId: '', vendorName: '', trackingStatus: 'active' }],
        weights: { marketMaturityWeight: 10, integrationWeight: 10, governanceWeight: 10 },
        sources: [{ sourceId: '', sourceType: 'docs', url: 'ftp://example.com' }],
        providers: { primaryModel: '', timeoutMs: 0 },
        limits: { maxVendorConcurrency: 0, maxBudgetUsdPerRun: -5, autoAddVendors: true, allowVendorContact: true, publicSourcesOnly: false, lowConfidenceThreshold: 120, divergenceEscalationThresholdPct: -5, sharepointPersistenceOnly: false },
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      valid: false,
      errors: expect.arrayContaining([
        { path: 'vendors[0].vendorId', message: 'vendorId must be a non-empty string.' },
        { path: 'weights', message: 'weights must sum to 100 or 1.0.' },
        { path: 'providers.timeoutMs', message: 'timeoutMs must be greater than 0.' },
      ]),
    });

    await app.close();
  });
});
