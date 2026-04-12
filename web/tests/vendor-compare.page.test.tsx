import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '../src/auth/AuthProvider';
import { VendorComparePage } from '../src/pages/vendors';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Vendor compare page', () => {
  it('renders compare results for valid selection', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          items: [
            {
              vendorId: 'vendor-001',
              vendorName: 'Alpha AI',
              category: 'platform',
              overallScore: 80,
              confidence: 88,
              freshnessStatus: 'fresh',
              asOfDate: '2026-04-11',
              sourceRunId: 'run-2026-04-11-001',
            },
            {
              vendorId: 'vendor-002',
              vendorName: 'Beta Stack',
              category: 'framework',
              overallScore: 70,
              confidence: 76,
              freshnessStatus: 'stale',
              asOfDate: '2026-04-09',
              sourceRunId: 'run-2026-04-11-001',
            },
          ],
        }),
      }),
    );

    render(
      <AuthProvider>
        <QueryClientProvider client={new QueryClient()}>
          <MemoryRouter>
            <VendorComparePage />
          </MemoryRouter>
        </QueryClientProvider>
      </AuthProvider>,
    );

    fireEvent.change(screen.getByLabelText('Vendor compare input'), { target: { value: 'vendor-001,vendor-002' } });
    fireEvent.click(screen.getByRole('button', { name: 'Compare' }));

    expect(await screen.findByText('Alpha AI')).toBeInTheDocument();
    expect(screen.getByText('Beta Stack')).toBeInTheDocument();
  });

  it('shows graceful validation error for invalid selection', async () => {
    render(
      <AuthProvider>
        <QueryClientProvider client={new QueryClient()}>
          <MemoryRouter>
            <VendorComparePage />
          </MemoryRouter>
        </QueryClientProvider>
      </AuthProvider>,
    );

    fireEvent.change(screen.getByLabelText('Vendor compare input'), { target: { value: 'vendor-001' } });
    fireEvent.click(screen.getByRole('button', { name: 'Compare' }));

    expect(await screen.findByText('Please select between 2 and 5 vendors.')).toBeInTheDocument();
  });
});
