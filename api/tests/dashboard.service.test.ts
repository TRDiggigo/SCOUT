import { describe, expect, it } from 'vitest';

import { DashboardService } from '../src/services/dashboard.service.js';

describe('DashboardService', () => {
  it('returns typed dashboard summary stub', async () => {
    const service = new DashboardService();

    const response = await service.getDashboardSummary();

    expect(response.latestRun?.runId).toBeDefined();
    expect(response.activeVendorCount).toBeGreaterThanOrEqual(0);
    expect(response.budgetLimitUsd).toBeGreaterThan(0);
  });
});
