import '@testing-library/jest-dom/vitest';
import { beforeEach, vi } from 'vitest';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.includes('/api/v1/vendors')) {
        return {
          ok: true,
          json: async () => ({
            items: [
              {
                vendorId: 'vendor-001',
                vendorName: 'Alpha AI',
                country: 'DE',
                regionScope: 'EU',
                category: 'platform',
                trackingStatus: 'active',
                marketMaturityScore: 82,
                integrationScore: 77,
                governanceScore: 80,
                overallScore: 80,
                confidence: 88,
                freshnessStatus: 'fresh',
                asOfDate: '2026-04-11',
                sourceRunId: 'run-2026-04-11-001',
                deltaStatus: 'changed',
                openEscalation: false,
              },
            ],
            page: 1,
            pageSize: 10,
            total: 1,
          }),
        };
      }

      return {
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
      };
    }),
  );
});
