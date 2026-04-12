import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '../src/auth/AuthProvider';
import { EvidenceDetailPage, EvidenceListPage } from '../src/pages/evidence';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Evidence pages', () => {
  it('renders evidence list with filters', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          total: 1,
          items: [
            {
              evidenceId: 'evidence-001',
              vendorId: 'vendor-001',
              vendorName: 'Alpha AI',
              claimType: 'security',
              sourceType: 'vendor_docs',
              sourceUrl: 'https://alpha.example.com/trust/security',
              rawExcerpt: 'Audit logs are retained for 365 days.',
              extractionConfidence: 92,
              runId: 'run-2026-04-11-001',
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total: 0, items: [] }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <AuthProvider>
        <QueryClientProvider client={new QueryClient()}>
          <MemoryRouter>
            <EvidenceListPage />
          </MemoryRouter>
        </QueryClientProvider>
      </AuthProvider>,
    );

    expect(await screen.findByText('evidence-001')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Evidence claim type filter'), { target: { value: 'security' } });

    expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('claimType=security'));
  });

  it('renders evidence detail fields', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          evidenceId: 'evidence-001',
          vendorId: 'vendor-001',
          vendorName: 'Alpha AI',
          claimType: 'security',
          sourceType: 'vendor_docs',
          sourceUrl: 'https://alpha.example.com/trust/security',
          rawExcerpt: 'Audit logs are retained for 365 days.',
          extractionConfidence: 92,
          runId: 'run-2026-04-11-001',
          capturedAt: '2026-04-11T08:15:00.000Z',
          language: 'en',
        }),
      }),
    );

    render(
      <AuthProvider>
        <QueryClientProvider client={new QueryClient()}>
          <MemoryRouter initialEntries={['/app/evidence/evidence-001']}>
            <Routes>
              <Route path='/app/evidence/:evidenceId' element={<EvidenceDetailPage />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </AuthProvider>,
    );

    expect(await screen.findByText(/Raw excerpt:/)).toBeInTheDocument();
    expect(screen.getByText('run-2026-04-11-001')).toBeInTheDocument();
  });
});
