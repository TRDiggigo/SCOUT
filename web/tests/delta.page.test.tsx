import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '../src/auth/AuthProvider';
import { DeltaDetailPage, DeltaListPage } from '../src/pages/deltas';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Delta pages', () => {
  it('renders delta list and filter interaction', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            deltaId: 'delta-001', vendorId: 'vendor-001', vendorName: 'Alpha AI', deltaDate: '2026-04-11', deltaType: 'score_change', impactedDimension: 'governance',
            oldValue: '76', newValue: '80', severity: 'medium', confidence: 84, sourceRunId: 'run-2026-04-11-001', detectedBy: 'delta-detector-v1', reviewStatus: 'open',
          },
        ],
        page: 1,
        pageSize: 10,
        total: 1,
      }),
    });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <AuthProvider>
        <QueryClientProvider client={new QueryClient()}>
          <MemoryRouter>
            <DeltaListPage />
          </MemoryRouter>
        </QueryClientProvider>
      </AuthProvider>,
    );

    expect(await screen.findByText('delta-001')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Delta severity filter'), { target: { value: 'medium' } });

    await screen.findByText('delta-001');
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('severity=medium'));
  });

  it('renders delta detail sections', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          deltaId: 'delta-001',
          deltaSummary: 'Governance score increased for Alpha AI.',
          rationale: 'New public audit documentation was detected.',
          evidenceRefs: ['evidence-1001', 'evidence-1002'],
          oldStructuredState: { governanceScore: 76 },
          newStructuredState: { governanceScore: 80 },
          changeReasoning: 'Evidence indicates additional compliance attestations.',
          escalationTriggered: false,
          escalationRef: null,
        }),
      }),
    );

    render(
      <AuthProvider>
        <QueryClientProvider client={new QueryClient()}>
          <MemoryRouter initialEntries={['/app/deltas/delta-001']}>
            <Routes>
              <Route path='/app/deltas/:deltaId' element={<DeltaDetailPage />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </AuthProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Summary' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Evidence / Reasoning' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'State Diff' })).toBeInTheDocument();
  });
});
