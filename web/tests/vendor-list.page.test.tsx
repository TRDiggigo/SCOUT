import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '../src/auth/AuthProvider';
import { VendorListPage } from '../src/pages/vendors';

function renderVendorListPage(): void {
  render(
    <AuthProvider>
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <VendorListPage />
        </MemoryRouter>
      </QueryClientProvider>
    </AuthProvider>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('VendorListPage', () => {
  it('renders vendor rows and updates filter query interaction', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
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
    });

    vi.stubGlobal('fetch', fetchMock);

    renderVendorListPage();

    expect(await screen.findByText('Alpha AI')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Category filter'), { target: { value: 'platform' } });

    await screen.findByText('Alpha AI');
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('category=platform'));
  });
});
