import '@testing-library/jest-dom/vitest';
import { beforeEach, vi } from 'vitest';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (/\/api\/v1\/vendors\/[^?]+$/.test(url)) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            vendorId: 'vendor-001',
            vendorName: 'Alpha AI',
            legalEntityName: 'Alpha AI GmbH',
            websiteUrl: 'https://alpha.example.com',
            headquartersCountry: 'DE',
            euPresence: true,
            category: 'platform',
            shortDescription: 'Enterprise AI platform.',
            trackingStatus: 'active',
            reviewQueueReason: null,
            marketMaturityScore: 82,
            integrationScore: 77,
            governanceScore: 80,
            overallScore: 80,
            confidence: 88,
            confidenceReason: 'Strong public signal coverage.',
            scoringRubricVersion: 'v1.0.0',
            secondOpinionModel: 'gpt-4.1-mini',
            scoreDivergencePct: 6.5,
            asOfDate: '2026-04-11',
            sourceRunId: 'run-2026-04-11-001',
            freshnessStatus: 'fresh',
            latestRunId: 'run-2026-04-11-001',
            latestManifestRef: 'latest.manifest.json',
            snapshotPath: '/snapshots/2026-04-11/vendor-001.json',
            euHostingClaim: true,
            dataResidencyEu: 'yes',
            identityIntegration: 'sso_scim',
            ssoSupport: true,
            auditLoggingClaim: true,
            complianceClaims: ['ISO27001', 'SOC2'],
            securityDisclosures: 'Public trust center available.',
            humanReviewRequired: false,
            sourceCount: 14,
            latestEvidenceCount: 8,
            primarySources: ['vendor docs', 'trust center', 'pricing page'],
            sourceQualityFlag: 'high',
          }),
        };
      }



      if (url.includes('/api/v1/errors')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            items: [
              {
                errorId: 'err-001',
                runId: 'run-2026-04-11-001',
                vendorId: 'vendor-003',
                stage: 'A2',
                errorType: 'extraction_error',
                severity: 'high',
                message: 'Extraction schema mismatch for governance block.',
                firstSeenAt: '2026-04-11T06:05:00Z',
                retryStatus: 'queued',
                resolutionStatus: 'open',
                assignedTo: 'operator-1',
              },
            ],
            page: 1,
            pageSize: 10,
            total: 1,
          }),
        };
      }

      if (url.includes('/api/v1/runs')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            items: [
              {
                runId: 'run-2026-04-11-001',
                runDate: '2026-04-11',
                startedAt: '2026-04-11T06:00:00Z',
                finishedAt: '2026-04-11T06:22:00Z',
                status: 'success',
                mode: 'scheduled',
                vendorScope: 'all-active',
                totalVendors: 50,
                successVendors: 48,
                failedVendors: 1,
                staleVendors: 1,
                budgetUsedUsd: 123.45,
                budgetLimitUsd: 500,
                concurrencyLimit: 5,
                initiatedBy: 'scheduler',
                manifestRef: 'runs/2026-04-11-001/manifest.json',
              },
            ],
            page: 1,
            pageSize: 10,
            total: 1,
          }),
        };
      }

      if (url.includes('/api/v1/vendors')) {
        return {
          ok: true,
          status: 200,
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
        status: 200,
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
