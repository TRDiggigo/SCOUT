import { describe, expect, it } from 'vitest';

import { RunService } from '../src/services/run.service.js';

describe('RunService filtering and sorting', () => {
  it('filters by status and mode', async () => {
    const service = new RunService();

    const response = await service.listRuns({ status: 'partial_success', mode: 'manual' });

    expect(response.total).toBe(1);
    expect(response.items[0]?.runId).toBe('run-2026-04-10-002');
  });

  it('sorts by failedVendors desc', async () => {
    const service = new RunService();

    const response = await service.listRuns({ sortBy: 'failedVendors', sortOrder: 'desc' });

    expect(response.items[0]?.failedVendors).toBeGreaterThanOrEqual(response.items[1]?.failedVendors ?? 0);
  });
});
