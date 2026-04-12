import { describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';

describe('evidence detail route', () => {
  it('returns evidence detail via GET /api/v1/evidence/:evidenceId', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/evidence/evidence-001',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      evidenceId: 'evidence-001',
      runId: 'run-2026-04-11-001',
      sourceType: 'vendor_docs',
    });

    await app.close();
  });

  it('returns 404 for unknown evidence', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/evidence/evidence-unknown',
    });

    expect(response.statusCode).toBe(404);

    await app.close();
  });
});
