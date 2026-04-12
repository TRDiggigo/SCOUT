import { describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';

describe('evidence list route', () => {
  it('returns evidence list via GET /api/v1/evidence', async () => {
    const app = buildApp();

    const response = await app.inject({ method: 'GET', url: '/api/v1/evidence' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      total: expect.any(Number),
      items: expect.arrayContaining([
        expect.objectContaining({
          evidenceId: expect.any(String),
          sourceUrl: expect.stringContaining('https://'),
        }),
      ]),
    });

    await app.close();
  });

  it('supports vendor and claimType filters', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/evidence?vendor=Alpha%20AI&claimType=security',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      total: 1,
      items: [
        expect.objectContaining({
          evidenceId: 'evidence-001',
          claimType: 'security',
          vendorName: 'Alpha AI',
        }),
      ],
    });

    await app.close();
  });
});
