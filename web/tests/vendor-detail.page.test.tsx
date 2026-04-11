import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '../src/auth/AuthProvider';
import { VendorDetailPage } from '../src/pages/vendors';

describe('VendorDetailPage', () => {
  it('renders structured vendor detail sections', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
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
      }),
    );

    render(
      <AuthProvider>
        <QueryClientProvider client={new QueryClient()}>
          <MemoryRouter initialEntries={['/app/vendors/vendor-001']}>
            <Routes>
              <Route path='/app/vendors/:vendorId' element={<VendorDetailPage />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </AuthProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Master Data' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Scoring' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Freshness / Provenance' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Governance' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Relations / Summary' })).toBeInTheDocument();
    expect(screen.getByText(/vendorId: vendor-001/)).toBeInTheDocument();
  });
});
