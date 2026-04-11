import '@testing-library/jest-dom/vitest';
import { beforeEach, vi } from 'vitest';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        latestRun: {
          runId: 'run-2026-04-11-001',
          runDate: '2026-04-11',
          status: 'success',
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
      }),
    }),
  );
});
