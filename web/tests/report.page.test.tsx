import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '../src/auth/AuthProvider';
import { ReportDetailPage, ReportListPage } from '../src/pages/reports';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Report pages', () => {
  it('renders report list', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          total: 1,
          items: [
            {
              reportId: 'report-001',
              vendorId: 'vendor-001',
              vendorName: 'Alpha AI',
              summary: 'Quarterly governance posture improved.',
              status: 'published',
              version: 'v1.2',
              reportingPeriod: '2026-Q1',
              sourceRun: 'run-2026-04-11-001',
            },
          ],
        }),
      }),
    );

    render(
      <AuthProvider>
        <QueryClientProvider client={new QueryClient()}>
          <MemoryRouter>
            <ReportListPage />
          </MemoryRouter>
        </QueryClientProvider>
      </AuthProvider>,
    );

    expect(await screen.findByText('report-001')).toBeInTheDocument();
    expect(screen.getByText('Quarterly governance posture improved.')).toBeInTheDocument();
  });

  it('renders report detail sections', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          reportId: 'report-001',
          vendorId: 'vendor-001',
          vendorName: 'Alpha AI',
          summary: 'Quarterly governance posture improved.',
          keyMovements: ['Governance score increased from 76 to 80.'],
          governanceAlerts: ['No critical alerts.'],
          linkedReferences: ['evidence-001'],
          status: 'published',
          version: 'v1.2',
          reportingPeriod: '2026-Q1',
          sourceRun: 'run-2026-04-11-001',
        }),
      }),
    );

    render(
      <AuthProvider>
        <QueryClientProvider client={new QueryClient()}>
          <MemoryRouter initialEntries={['/app/reports/report-001']}>
            <Routes>
              <Route path='/app/reports/:reportId' element={<ReportDetailPage />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </AuthProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Key movements' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Governance alerts' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Linked references' })).toBeInTheDocument();
  });
});
