import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '../src/auth/AuthProvider';
import { RunListPage } from '../src/pages/runs';

function renderRunListPage(): void {
  render(
    <AuthProvider>
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <RunListPage />
        </MemoryRouter>
      </QueryClientProvider>
    </AuthProvider>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('RunListPage', () => {
  it('renders run rows and filter interaction', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            runId: 'run-2026-04-11-001', runDate: '2026-04-11', startedAt: '2026-04-11T06:00:00Z', finishedAt: '2026-04-11T06:22:00Z',
            status: 'success', mode: 'scheduled', vendorScope: 'all-active', totalVendors: 50, successVendors: 48, failedVendors: 1,
            staleVendors: 1, budgetUsedUsd: 123.45, budgetLimitUsd: 500, concurrencyLimit: 5, initiatedBy: 'scheduler', manifestRef: 'manifest.json',
          },
        ],
        page: 1,
        pageSize: 10,
        total: 1,
      }),
    });

    vi.stubGlobal('fetch', fetchMock);

    renderRunListPage();

    expect(await screen.findByText('run-2026-04-11-001')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Run status filter'), { target: { value: 'success' } });

    await screen.findByText('run-2026-04-11-001');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('status=success'),
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });
});
