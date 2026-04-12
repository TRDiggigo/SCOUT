import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '../src/auth/AuthProvider';
import { DashboardPage } from '../src/pages/dashboard';

function renderDashboardPage(): void {
  render(
    <AuthProvider>
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    </AuthProvider>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('DashboardPage', () => {
  it('renders dashboard metrics from query response', async () => {
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

    renderDashboardPage();

    expect(await screen.findByText('Active vendor count: 42')).toBeInTheDocument();
    expect(screen.getByText('Budget limit (USD): 500')).toBeInTheDocument();
  });


  it('renders empty state when dashboard response is empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          latestRun: null,
          activeVendorCount: 0,
          staleVendorCount: 0,
          failedVendorCount: 0,
          escalationCountOpen: 0,
          avgMarketMaturity: 0,
          avgIntegration: 0,
          avgGovernance: 0,
          budgetUsedUsd: 0,
          budgetLimitUsd: 0,
        }),
      }),
    );

    renderDashboardPage();

    expect(await screen.findByText('No dashboard data available yet.')).toBeInTheDocument();
  });

  it('renders error state when dashboard query fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
      }),
    );

    renderDashboardPage();

    expect(await screen.findByText('Dashboard could not be loaded.')).toBeInTheDocument();
  });
});
